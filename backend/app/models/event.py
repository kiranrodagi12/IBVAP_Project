from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base


class EventModel(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, index=True)
    event_type = Column(String, nullable=False)
    person_id = Column(String, nullable=True)
    camera_id = Column(String, nullable=True)
    zone_id = Column(String, nullable=True)
    zone_name = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    confidence = Column(Float, nullable=True)
    location_status = Column(String, default='estimated')
    description = Column(Text, nullable=False)
    evidence_path = Column(String, nullable=True)
    trajectory = Column(JSON, nullable=True)  # [{lat, lng, timestamp, ...}]
    acknowledged = Column(Boolean, default=False)
    alert_id = Column(String, nullable=True)
