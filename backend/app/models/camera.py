from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class CameraModel(Base):
    __tablename__ = "cameras"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    direction = Column(Float, default=0.0)      # degrees from north
    fov = Column(Float, default=70.0)           # field of view degrees
    range_m = Column(Float, default=150.0)      # detection range in meters
    status = Column(String, default='online')   # online/offline/degraded/maintenance
    camera_type = Column(String, default='fixed')  # fixed/ptz/thermal
    video_source = Column(String, default='demo')  # webcam/file/rtsp/demo
    rtsp_url = Column(String, nullable=True)
    fps = Column(Integer, default=25)
    calibration_valid = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
