"""
IBVAP — Pydantic Schemas (API request/response models)
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


# ---- Shared ----
class LatLng(BaseModel):
    lat: float
    lng: float


# ---- Camera ----
class CameraBase(BaseModel):
    name: str
    lat: float
    lng: float
    direction: float = 0.0
    fov: float = 70.0
    range: float = Field(150.0, alias='range_m')
    status: str = 'online'
    type: str = Field('fixed', alias='camera_type')
    videoSource: Optional[str] = Field(None, alias='video_source')
    rtspUrl: Optional[str] = Field(None, alias='rtsp_url')
    fps: Optional[int] = 25
    calibrationValid: bool = Field(False, alias='calibration_valid')
    description: Optional[str] = None

    model_config = {'populate_by_name': True}


class CameraCreate(CameraBase):
    id: str


class CameraResponse(CameraBase):
    id: str
    lastSeen: Optional[datetime] = Field(None, alias='last_seen')
    createdAt: Optional[datetime] = Field(None, alias='created_at')

    model_config = {'from_attributes': True, 'populate_by_name': True}


# ---- Zone ----
class ZoneBase(BaseModel):
    name: str
    type: str
    coordinates: List[LatLng]
    priority: str = 'medium'
    description: Optional[str] = None
    status: str = 'active'
    linkedCameraIds: List[str] = []


class ZoneCreate(ZoneBase):
    id: str


class ZoneResponse(ZoneBase):
    id: str

    model_config = {'from_attributes': True}


# ---- Person ----
class TrackPointSchema(BaseModel):
    personId: str
    lat: float
    lng: float
    timestamp: str
    cameraId: Optional[str] = None
    zoneId: Optional[str] = None
    confidence: Optional[float] = None
    locationStatus: str = 'estimated'


class PersonResponse(BaseModel):
    id: str
    trackId: int
    currentLat: Optional[float] = None
    currentLng: Optional[float] = None
    currentZoneId: Optional[str] = None
    currentCameraId: Optional[str] = None
    firstSeen: str
    lastSeen: str
    locationStatus: str
    confidence: Optional[float] = None
    isActive: bool

    model_config = {'from_attributes': True}


# ---- Event ----
class EventResponse(BaseModel):
    id: str
    type: str
    personId: Optional[str] = None
    cameraId: Optional[str] = None
    zoneId: Optional[str] = None
    zoneName: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    timestamp: str
    confidence: Optional[float] = None
    locationStatus: Optional[str] = None
    description: str
    evidencePath: Optional[str] = None
    trajectory: Optional[List[TrackPointSchema]] = None
    acknowledged: bool
    alertId: Optional[str] = None


# ---- Alert ----
class AlertResponse(BaseModel):
    id: str
    eventId: str
    priority: str
    status: str
    type: str
    personId: Optional[str] = None
    cameraId: Optional[str] = None
    zoneId: Optional[str] = None
    zoneName: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    timestamp: str
    message: str
    confidence: Optional[float] = None
    acknowledgedAt: Optional[str] = None


# ---- System ----
class SystemStats(BaseModel):
    camerasOnline: int
    camerasTotal: int
    activePersons: int
    activeAlerts: int
    zoneIntrusions: int
    systemStatus: str
    demoMode: bool
    uptime: str


# ---- WebSocket ----
class WSMessage(BaseModel):
    type: str
    payload: Any
    timestamp: str
