from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class PersonModel(Base):
    __tablename__ = "persons"

    id = Column(String, primary_key=True, index=True)
    track_id = Column(Integer, nullable=False)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    current_zone_id = Column(String, nullable=True)
    current_camera_id = Column(String, nullable=True)
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), onupdate=func.now())
    location_status = Column(String, default='estimated')  # estimated/confirmed/simulated/unavailable
    confidence = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)


class TrackPointModel(Base):
    __tablename__ = "track_points"

    id = Column(Integer, primary_key=True, autoincrement=True)
    person_id = Column(String, nullable=False, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    camera_id = Column(String, nullable=True)
    zone_id = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    location_status = Column(String, default='estimated')
