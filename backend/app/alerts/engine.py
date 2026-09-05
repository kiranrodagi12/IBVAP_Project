"""
IBVAP — Alert Engine

Processes zone crossing events and generates alerts.
Pushes alerts to connected WebSocket clients.
"""
import asyncio
from typing import Set, Optional
from datetime import datetime, timezone
from app.schemas import AlertResponse, WSMessage

# Priority rules based on zone type
ALERT_PRIORITY_RULES = {
    'danger_intrusion': 'critical',
    'border_crossed': 'critical',
    'restricted_intrusion': 'high',
    'zone_entered': 'medium',
    'person_detected': 'low',
    'camera_offline': 'high',
    'camera_online': 'low',
}

# Zone type → priority override
ZONE_PRIORITY_RULES = {
    'danger': 'critical',
    'restricted': 'high',
    'monitoring': 'medium',
    'normal': 'low',
    'safe': 'low',
}


class AlertEngine:
    """Central alert processing and distribution engine."""

    def __init__(self):
        self._websocket_clients: Set = set()
        self._alert_counter = 0
        self._event_counter = 0

    def register_client(self, websocket) -> None:
        self._websocket_clients.add(websocket)

    def unregister_client(self, websocket) -> None:
        self._websocket_clients.discard(websocket)

    def _generate_alert_id(self) -> str:
        self._alert_counter += 1
        return f"ALT-{self._alert_counter:04d}"

    def _generate_event_id(self) -> str:
        self._event_counter += 1
        return f"EVT-{self._event_counter:04d}"

    def determine_priority(
        self,
        event_type: str,
        zone_type: Optional[str] = None
    ) -> str:
        """
        Determine alert priority from event type and zone type.
        Zone type takes precedence when provided.
        """
        if zone_type and zone_type in ZONE_PRIORITY_RULES:
            return ZONE_PRIORITY_RULES[zone_type]
        return ALERT_PRIORITY_RULES.get(event_type, 'low')

    def build_message(
        self,
        event_type: str,
        person_id: Optional[str],
        zone_name: Optional[str],
        priority: str
    ) -> str:
        """Build a human-readable alert message."""
        person_str = f"Person #{person_id.replace('P-', '')}" if person_id else "Unknown"
        if event_type == 'danger_intrusion':
            return f"🔴 CRITICAL: {person_str} entered DANGER zone — {zone_name}"
        elif event_type == 'restricted_intrusion':
            return f"🚨 HIGH: {person_str} entered RESTRICTED zone — {zone_name}"
        elif event_type == 'border_crossed':
            return f"⚠️ HIGH: {person_str} crossed border boundary into {zone_name}"
        elif event_type == 'zone_entered':
            return f"{person_str} entered {zone_name}"
        elif event_type == 'person_detected':
            return f"{person_str} detected"
        elif event_type == 'camera_offline':
            return f"📷 Camera offline"
        return f"{person_str}: {event_type}"

    async def process_zone_crossing(
        self,
        event_type: str,
        person_id: Optional[str],
        camera_id: Optional[str],
        zone_id: Optional[str],
        zone_name: Optional[str],
        zone_type: Optional[str],
        lat: Optional[float],
        lng: Optional[float],
        confidence: Optional[float],
    ) -> AlertResponse:
        """Process a zone crossing and generate an alert."""
        now = datetime.now(timezone.utc).isoformat()
        alert_id = self._generate_alert_id()
        event_id = self._generate_event_id()
        priority = self.determine_priority(event_type, zone_type)
        message = self.build_message(event_type, person_id, zone_name, priority)

        alert = AlertResponse(
            id=alert_id,
            eventId=event_id,
            priority=priority,
            status='active',
            type=event_type,
            personId=person_id,
            cameraId=camera_id,
            zoneId=zone_id,
            zoneName=zone_name,
            lat=lat,
            lng=lng,
            timestamp=now,
            message=message,
            confidence=confidence,
        )

        # Push to all WebSocket clients
        await self.broadcast_alert(alert)
        return alert

    async def broadcast_alert(self, alert: AlertResponse) -> None:
        """Broadcast alert to all connected WebSocket clients."""
        if not self._websocket_clients:
            return

        msg = WSMessage(
            type='alert',
            payload=alert.model_dump(),
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        msg_json = msg.model_dump_json()

        dead = set()
        for ws in self._websocket_clients:
            try:
                await ws.send_text(msg_json)
            except Exception:
                dead.add(ws)

        self._websocket_clients -= dead

    async def broadcast_json(self, data: dict) -> None:
        """Broadcast arbitrary JSON to all connected WebSocket clients."""
        import json
        msg_json = json.dumps(data)
        dead = set()
        for ws in self._websocket_clients:
            try:
                await ws.send_text(msg_json)
            except Exception:
                dead.add(ws)
        self._websocket_clients -= dead


# Singleton
_engine: Optional[AlertEngine] = None


def get_alert_engine() -> AlertEngine:
    global _engine
    if _engine is None:
        _engine = AlertEngine()
    return _engine
