from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.event import EventModel
from app.schemas import EventResponse
from typing import List
from datetime import datetime

router = APIRouter(prefix="/events", tags=["Events"])


def _to_response(e: EventModel) -> EventResponse:
    return EventResponse(
        id=e.id, type=e.event_type,
        personId=e.person_id, cameraId=e.camera_id,
        zoneId=e.zone_id, zoneName=e.zone_name,
        lat=e.lat, lng=e.lng,
        timestamp=e.timestamp.isoformat() if isinstance(e.timestamp, datetime) else str(e.timestamp),
        confidence=e.confidence, locationStatus=e.location_status,
        description=e.description, evidencePath=e.evidence_path,
        trajectory=e.trajectory, acknowledged=e.acknowledged,
        alertId=e.alert_id,
    )


@router.get("", response_model=List[EventResponse])
async def list_events(
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(EventModel).order_by(EventModel.timestamp.desc()).limit(limit).offset(offset)
    )
    return [_to_response(e) for e in result.scalars().all()]


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str, db: AsyncSession = Depends(get_db)):
    e = await db.get(EventModel, event_id)
    if not e:
        raise HTTPException(status_code=404, detail="Event not found")
    return _to_response(e)
