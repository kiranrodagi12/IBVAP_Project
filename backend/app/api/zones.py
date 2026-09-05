from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.zone import ZoneModel
from app.schemas import ZoneCreate, ZoneResponse, LatLng
from typing import List

router = APIRouter(prefix="/zones", tags=["Zones"])


def _model_to_response(z: ZoneModel) -> ZoneResponse:
    coords = z.coordinates or []
    return ZoneResponse(
        id=z.id, name=z.name, type=z.zone_type,
        coordinates=[LatLng(lat=c['lat'], lng=c['lng']) for c in coords],
        priority=z.priority, description=z.description,
        status=z.status, linkedCameraIds=z.linked_camera_ids or [],
    )


@router.get("", response_model=List[ZoneResponse])
async def list_zones(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ZoneModel))
    return [_model_to_response(z) for z in result.scalars().all()]


@router.post("", response_model=ZoneResponse)
async def create_zone(data: ZoneCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.get(ZoneModel, data.id)
    if existing:
        raise HTTPException(status_code=409, detail=f"Zone {data.id} already exists")
    z = ZoneModel(
        id=data.id, name=data.name, zone_type=data.type,
        coordinates=[c.model_dump() for c in data.coordinates],
        priority=data.priority, description=data.description,
        status=data.status, linked_camera_ids=data.linkedCameraIds,
    )
    db.add(z)
    await db.commit()
    await db.refresh(z)
    return _model_to_response(z)


@router.get("/{zone_id}", response_model=ZoneResponse)
async def get_zone(zone_id: str, db: AsyncSession = Depends(get_db)):
    z = await db.get(ZoneModel, zone_id)
    if not z:
        raise HTTPException(status_code=404, detail="Zone not found")
    return _model_to_response(z)


@router.delete("/{zone_id}")
async def delete_zone(zone_id: str, db: AsyncSession = Depends(get_db)):
    z = await db.get(ZoneModel, zone_id)
    if not z:
        raise HTTPException(status_code=404, detail="Zone not found")
    await db.delete(z)
    await db.commit()
    return {"ok": True, "deleted": zone_id}
