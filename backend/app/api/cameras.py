from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.database import get_db
from app.models.camera import CameraModel
from app.schemas import CameraCreate, CameraResponse
from typing import List

router = APIRouter(prefix="/cameras", tags=["Cameras"])


@router.get("", response_model=List[CameraResponse])
async def list_cameras(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CameraModel))
    cameras = result.scalars().all()
    return [
        CameraResponse(
            id=c.id, name=c.name, lat=c.lat, lng=c.lng,
            direction=c.direction, fov=c.fov, range_m=c.range_m,
            status=c.status, camera_type=c.camera_type,
            video_source=c.video_source, rtsp_url=c.rtsp_url,
            fps=c.fps, calibration_valid=c.calibration_valid,
            description=c.description, last_seen=c.last_seen,
            created_at=c.created_at,
        )
        for c in cameras
    ]


@router.post("", response_model=CameraResponse)
async def create_camera(data: CameraCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.get(CameraModel, data.id)
    if existing:
        raise HTTPException(status_code=409, detail=f"Camera {data.id} already exists")
    cam = CameraModel(
        id=data.id, name=data.name, lat=data.lat, lng=data.lng,
        direction=data.direction, fov=data.fov, range_m=data.range,
        status=data.status, camera_type=data.type,
        video_source=data.videoSource, rtsp_url=data.rtspUrl,
        fps=data.fps, calibration_valid=data.calibrationValid,
        description=data.description,
    )
    db.add(cam)
    await db.commit()
    await db.refresh(cam)
    return CameraResponse(
        id=cam.id, name=cam.name, lat=cam.lat, lng=cam.lng,
        direction=cam.direction, fov=cam.fov, range_m=cam.range_m,
        status=cam.status, camera_type=cam.camera_type,
        video_source=cam.video_source, rtsp_url=cam.rtsp_url,
        fps=cam.fps, calibration_valid=cam.calibration_valid,
        description=cam.description, last_seen=cam.last_seen,
        created_at=cam.created_at,
    )


@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(camera_id: str, db: AsyncSession = Depends(get_db)):
    cam = await db.get(CameraModel, camera_id)
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    return CameraResponse(
        id=cam.id, name=cam.name, lat=cam.lat, lng=cam.lng,
        direction=cam.direction, fov=cam.fov, range_m=cam.range_m,
        status=cam.status, camera_type=cam.camera_type,
        video_source=cam.video_source, rtsp_url=cam.rtsp_url,
        fps=cam.fps, calibration_valid=cam.calibration_valid,
        description=cam.description, last_seen=cam.last_seen,
        created_at=cam.created_at,
    )


@router.put("/{camera_id}", response_model=CameraResponse)
async def update_camera(camera_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    cam = await db.get(CameraModel, camera_id)
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    for key, value in data.items():
        if hasattr(cam, key):
            setattr(cam, key, value)
    await db.commit()
    await db.refresh(cam)
    return CameraResponse(
        id=cam.id, name=cam.name, lat=cam.lat, lng=cam.lng,
        direction=cam.direction, fov=cam.fov, range_m=cam.range_m,
        status=cam.status, camera_type=cam.camera_type,
        video_source=cam.video_source, rtsp_url=cam.rtsp_url,
        fps=cam.fps, calibration_valid=cam.calibration_valid,
        description=cam.description, last_seen=cam.last_seen,
        created_at=cam.created_at,
    )


@router.delete("/{camera_id}")
async def delete_camera(camera_id: str, db: AsyncSession = Depends(get_db)):
    cam = await db.get(CameraModel, camera_id)
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    await db.delete(cam)
    await db.commit()
    return {"ok": True, "deleted": camera_id}
