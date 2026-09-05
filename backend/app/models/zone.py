from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base


class ZoneModel(Base):
    __tablename__ = "zones"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    zone_type = Column(String, nullable=False)  # safe/normal/monitoring/restricted/danger
    coordinates = Column(JSON, nullable=False)  # [{lat, lng}, ...]
    priority = Column(String, default='medium') # low/medium/high/critical
    description = Column(Text, nullable=True)
    status = Column(String, default='active')   # active/inactive
    linked_camera_ids = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
