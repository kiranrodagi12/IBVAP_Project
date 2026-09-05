"""
IBVAP — FastAPI Application Entry Point

Run:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

API Documentation:
    http://localhost:8000/docs

WebSocket:
    ws://localhost:8000/ws/events
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db, AsyncSessionLocal
from app.services.seed import seed_demo_data
from app.config import settings
from app.api import cameras, zones, events, alerts, persons, websocket


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    print(f"[IBVAP] Starting {settings.app_name} v{settings.app_version}")

    # Initialize database
    await init_db()
    print("[IBVAP] Database initialized")

    # Seed demo data
    if settings.demo_mode:
        async with AsyncSessionLocal() as db:
            await seed_demo_data(db)

    print(f"[IBVAP] Server ready — http://{settings.host}:{settings.port}")
    print(f"[IBVAP] API docs — http://localhost:{settings.port}/docs")
    print(f"[IBVAP] Demo mode: {settings.demo_mode}")
    print(f"[IBVAP] YOLO enabled: {settings.yolo_enabled}")

    yield

    print("[IBVAP] Shutting down")


app = FastAPI(
    title="IBVAP — Intelligent Border Video Analytics Platform",
    description="Real-time border surveillance with AI-powered detection and geospatial analytics.",
    version=settings.app_version,
    lifespan=lifespan,
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(cameras.router, prefix="/api")
app.include_router(zones.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(persons.router, prefix="/api")

# WebSocket routes (no /api prefix)
app.include_router(websocket.router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "online",
        "version": settings.app_version,
        "demo_mode": settings.demo_mode,
        "yolo_enabled": settings.yolo_enabled,
    }


@app.get("/")
async def root():
    return {
        "message": "IBVAP Backend",
        "docs": "/docs",
        "health": "/api/health",
    }
