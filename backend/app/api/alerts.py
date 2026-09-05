from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.alert import AlertModel
from app.schemas import AlertResponse
from typing import List
from datetime import datetime, timezone

router = APIRouter(prefix="/alerts", tags=["Alerts"])


def _to_response(a: AlertModel) -> AlertResponse:
    return AlertResponse(
        id=a.id, eventId=a.event_id,
        priority=a.priority, status=a.status, type=a.alert_type,
        personId=a.person_id, cameraId=a.camera_id,
        zoneId=a.zone_id, zoneName=a.zone_name,
        lat=a.lat, lng=a.lng,
        timestamp=a.timestamp.isoformat() if isinstance(a.timestamp, datetime) else str(a.timestamp),
        message=a.message, confidence=a.confidence,
        acknowledgedAt=a.acknowledged_at.isoformat() if a.acknowledged_at else None,
    )


@router.get("", response_model=List[AlertResponse])
async def list_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AlertModel).order_by(AlertModel.timestamp.desc())
    )
    return [_to_response(a) for a in result.scalars().all()]


@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    a = await db.get(AlertModel, alert_id)
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    a.status = 'acknowledged'
    a.acknowledged_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(a)
    return _to_response(a)
