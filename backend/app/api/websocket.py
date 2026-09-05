from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.alerts.engine import get_alert_engine
import asyncio
import json
from datetime import datetime, timezone

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    """WebSocket endpoint for real-time event streaming."""
    engine = get_alert_engine()
    await websocket.accept()
    engine.register_client(websocket)

    # Send initial connection confirmation
    await websocket.send_text(json.dumps({
        "type": "system_status",
        "payload": {"status": "connected", "demoMode": True},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }))

    try:
        # Keep connection alive with periodic pings
        while True:
            try:
                # Send heartbeat every 30 seconds
                await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
            except asyncio.TimeoutError:
                await websocket.send_text(json.dumps({
                    "type": "heartbeat",
                    "payload": {"timestamp": datetime.now(timezone.utc).isoformat()},
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }))
    except WebSocketDisconnect:
        engine.unregister_client(websocket)
    except Exception:
        engine.unregister_client(websocket)
