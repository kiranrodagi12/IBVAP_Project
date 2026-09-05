"""
IBVAP — Application Configuration
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    # Application
    app_name: str = "IBVAP"
    app_version: str = "1.0.0"
    debug: bool = True
    demo_mode: bool = True

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    frontend_url: str = "http://localhost:5173"

    # Database
    database_url: str = "sqlite+aiosqlite:///./ibvap.db"

    # AI
    yolo_model_path: str = "../ai/models/best.pt"
    yolo_confidence_threshold: float = 0.5
    yolo_enabled: bool = False  # Set True when best.pt is available

    # Demo
    demo_step_interval_ms: int = 3000

    # Evidence storage
    evidence_dir: str = "../data/evidence"


settings = Settings()
