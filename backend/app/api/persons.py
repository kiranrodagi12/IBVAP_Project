from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.person import PersonModel, TrackPointModel
from app.schemas import PersonResponse, TrackPointSchema
from typing import List
from datetime import datetime

router = APIRouter(tags=["Persons"])


@router.get("/persons", response_model=List[PersonResponse])
async def list_persons(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PersonModel))
    persons = result.scalars().all()
    out = []
    for p in persons:
        out.append(PersonResponse(
            id=p.id, trackId=p.track_id,
            currentLat=p.current_lat, currentLng=p.current_lng,
            currentZoneId=p.current_zone_id, currentCameraId=p.current_camera_id,
            firstSeen=p.first_seen.isoformat() if isinstance(p.first_seen, datetime) else str(p.first_seen),
            lastSeen=p.last_seen.isoformat() if isinstance(p.last_seen, datetime) else str(p.last_seen or p.first_seen),
            locationStatus=p.location_status,
            confidence=p.confidence, isActive=p.is_active,
        ))
    return out


@router.get("/tracks/{person_id}")
async def get_tracks(person_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TrackPointModel).where(
            TrackPointModel.person_id == person_id
        ).order_by(TrackPointModel.timestamp)
    )
    points = result.scalars().all()
    return {
        "personId": person_id,
        "points": [
            TrackPointSchema(
                personId=p.person_id,
                lat=p.lat, lng=p.lng,
                timestamp=p.timestamp.isoformat() if isinstance(p.timestamp, datetime) else str(p.timestamp),
                cameraId=p.camera_id, zoneId=p.zone_id,
                confidence=p.confidence, locationStatus=p.location_status,
            )
            for p in points
        ]
    }
