# IBVAP - Intelligent Border Video Analytics Platform

A localhost-based AI surveillance and geospatial visualization platform for a Border Out Post (BOP).

## Architecture

* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand, React-Leaflet
* **Backend:** FastAPI, SQLAlchemy, Shapely
* **Database:** SQLite (default dev mode) or PostgreSQL+PostGIS
* **AI Engine:** YOLO (Object Detection), ByteTrack (Tracking) - Stubbed for demo mode

## Prerequisites

* [Node.js](https://nodejs.org/en/) (v18+)
* [Python](https://www.python.org/downloads/) (3.10+)
* (Optional) Docker for running PostGIS

## Quick Start (Local Development)

The application runs in **DEMO MODE** by default, using SQLite and a simulated person trajectory. No cameras or actual video streams are required to see the dashboard in action.

### 1. Start Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate  # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend API will be available at: http://localhost:8000
API Docs at: http://localhost:8000/docs

### 2. Start Frontend

Open a new terminal.

```powershell
cd frontend
npm install
npm run dev
```

Frontend Dashboard will be available at: http://localhost:5173

## Features Implemented

1. **Geospatial Dashboard**: Interactive Leaflet map showing cameras, FOVs, zones, persons, trajectories.
2. **Camera Management**: Add, move, and edit camera properties (direction, FOV, range).
3. **Zone Management**: Define Safe, Monitoring, Restricted, and Danger zones using polygons.
4. **Demo Mode**: A pre-configured scenario demonstrating a person crossing from Safe -> Monitoring -> Restricted -> Danger zones.
5. **Event Engine**: Real-time WebSocket alerts triggered when a person crosses zone boundaries based on Shapely point-in-polygon calculations.
6. **Alerts**: Real-time alert notifications appearing on the dashboard.

## Switching to Production Mode (PostGIS + YOLO)

1. Create a `.env` file in the root directory (copy `.env.example`).
2. Set `YOLO_ENABLED=True` and `DEMO_MODE=False`.
3. Set `DATABASE_URL` to your PostGIS instance.
4. Start via Docker Compose:

```bash
docker-compose up --build
```

*(Note: Dockerfiles for frontend/backend need to be created if using Docker, they are currently omitted as this is optimized for localhost script execution)*
