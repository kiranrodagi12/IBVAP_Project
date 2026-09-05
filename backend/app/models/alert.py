from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    event_id = Column(String, nullable=False)
    priority = Column(String, nullable=False)   # low/medium/high/critical
    status = Column(String, default='active')   # active/acknowledged/resolved
    alert_type = Column(String, nullable=False)
    person_id = Column(String, nullable=True)
    camera_id = Column(String, nullable=True)
    zone_id = Column(String, nullable=True)
    zone_name = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    message = Column(Text, nullable=False)
    confidence = Column(Float, nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    acknowledged_by = Column(String, nullable=True)
