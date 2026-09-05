-- ============================================================
-- IBVAP — PostgreSQL + PostGIS Production Schema
-- For development: use SQLite via SQLAlchemy (automatic)
-- For production: run this script against PostgreSQL + PostGIS
-- ============================================================

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- ============================================================
-- CAMERAS
-- ============================================================
CREATE TABLE IF NOT EXISTS cameras (
    id              VARCHAR(64) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    lat             DOUBLE PRECISION NOT NULL,
    lng             DOUBLE PRECISION NOT NULL,
    location        GEOMETRY(POINT, 4326),           -- PostGIS point
    direction       DOUBLE PRECISION DEFAULT 0.0,   -- degrees from north
    fov             DOUBLE PRECISION DEFAULT 70.0,  -- field of view degrees
    range_m         DOUBLE PRECISION DEFAULT 150.0, -- detection range meters
    status          VARCHAR(32) DEFAULT 'online',   -- online/offline/degraded/maintenance
    camera_type     VARCHAR(32) DEFAULT 'fixed',    -- fixed/ptz/thermal
    video_source    VARCHAR(32) DEFAULT 'demo',     -- webcam/file/rtsp/demo
    rtsp_url        TEXT,
    fps             INTEGER DEFAULT 25,
    calibration_valid BOOLEAN DEFAULT FALSE,
    description     TEXT,
    last_seen       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index on camera location
CREATE INDEX IF NOT EXISTS cameras_location_idx ON cameras USING GIST(location);

-- Auto-update location geometry from lat/lng
CREATE OR REPLACE FUNCTION update_camera_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER camera_location_trigger
    BEFORE INSERT OR UPDATE ON cameras
    FOR EACH ROW EXECUTE FUNCTION update_camera_location();

-- ============================================================
-- ZONES
-- ============================================================
CREATE TABLE IF NOT EXISTS zones (
    id              VARCHAR(64) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    zone_type       VARCHAR(32) NOT NULL,            -- safe/normal/monitoring/restricted/danger
    coordinates     JSONB NOT NULL,                  -- [{lat, lng}, ...]
    boundary        GEOMETRY(POLYGON, 4326),          -- PostGIS polygon
    priority        VARCHAR(32) DEFAULT 'medium',    -- low/medium/high/critical
    description     TEXT,
    status          VARCHAR(32) DEFAULT 'active',   -- active/inactive
    linked_camera_ids JSONB DEFAULT '[]',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index on zone boundary
CREATE INDEX IF NOT EXISTS zones_boundary_idx ON zones USING GIST(boundary);

-- Auto-build PostGIS polygon from coordinates JSON
CREATE OR REPLACE FUNCTION update_zone_boundary()
RETURNS TRIGGER AS $$
DECLARE
    coord JSONB;
    points TEXT := '';
    first_point TEXT := '';
BEGIN
    IF jsonb_array_length(NEW.coordinates) >= 3 THEN
        FOR coord IN SELECT * FROM jsonb_array_elements(NEW.coordinates)
        LOOP
            IF points = '' THEN
                first_point := (coord->>'lng') || ' ' || (coord->>'lat');
            END IF;
            points := points || (coord->>'lng') || ' ' || (coord->>'lat') || ',';
        END LOOP;
        -- Close polygon
        points := points || first_point;
        NEW.boundary = ST_SetSRID(ST_GeomFromText('POLYGON((' || points || '))'), 4326);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER zone_boundary_trigger
    BEFORE INSERT OR UPDATE ON zones
    FOR EACH ROW EXECUTE FUNCTION update_zone_boundary();

-- ============================================================
-- PERSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS persons (
    id              VARCHAR(64) PRIMARY KEY,
    track_id        INTEGER NOT NULL,
    current_lat     DOUBLE PRECISION,
    current_lng     DOUBLE PRECISION,
    current_location GEOMETRY(POINT, 4326),
    current_zone_id VARCHAR(64),
    current_camera_id VARCHAR(64),
    first_seen      TIMESTAMPTZ DEFAULT NOW(),
    last_seen       TIMESTAMPTZ,
    location_status VARCHAR(32) DEFAULT 'estimated',  -- estimated/confirmed/simulated/unavailable
    confidence      DOUBLE PRECISION,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS persons_current_location_idx ON persons USING GIST(current_location);
CREATE INDEX IF NOT EXISTS persons_track_id_idx ON persons(track_id);

-- ============================================================
-- TRACK POINTS (person movement trajectory)
-- ============================================================
CREATE TABLE IF NOT EXISTS track_points (
    id              BIGSERIAL PRIMARY KEY,
    person_id       VARCHAR(64) NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    lat             DOUBLE PRECISION NOT NULL,
    lng             DOUBLE PRECISION NOT NULL,
    location        GEOMETRY(POINT, 4326),
    timestamp       TIMESTAMPTZ DEFAULT NOW(),
    camera_id       VARCHAR(64),
    zone_id         VARCHAR(64),
    confidence      DOUBLE PRECISION,
    location_status VARCHAR(32) DEFAULT 'estimated'
);

CREATE INDEX IF NOT EXISTS track_points_person_idx ON track_points(person_id);
CREATE INDEX IF NOT EXISTS track_points_timestamp_idx ON track_points(timestamp);
CREATE INDEX IF NOT EXISTS track_points_location_idx ON track_points USING GIST(location);

-- Auto-build PostGIS point from lat/lng
CREATE OR REPLACE FUNCTION update_track_point_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_point_location_trigger
    BEFORE INSERT OR UPDATE ON track_points
    FOR EACH ROW EXECUTE FUNCTION update_track_point_location();

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
    id              VARCHAR(64) PRIMARY KEY,
    event_type      VARCHAR(64) NOT NULL,
    person_id       VARCHAR(64),
    camera_id       VARCHAR(64),
    zone_id         VARCHAR(64),
    zone_name       VARCHAR(255),
    lat             DOUBLE PRECISION,
    lng             DOUBLE PRECISION,
    event_location  GEOMETRY(POINT, 4326),
    timestamp       TIMESTAMPTZ DEFAULT NOW(),
    confidence      DOUBLE PRECISION,
    location_status VARCHAR(32) DEFAULT 'estimated',
    description     TEXT NOT NULL,
    evidence_path   TEXT,
    trajectory      JSONB,
    acknowledged    BOOLEAN DEFAULT FALSE,
    alert_id        VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS events_timestamp_idx ON events(timestamp DESC);
CREATE INDEX IF NOT EXISTS events_person_idx ON events(person_id);
CREATE INDEX IF NOT EXISTS events_type_idx ON events(event_type);
CREATE INDEX IF NOT EXISTS events_location_idx ON events USING GIST(event_location);

-- ============================================================
-- ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
    id              VARCHAR(64) PRIMARY KEY,
    event_id        VARCHAR(64) NOT NULL,
    priority        VARCHAR(32) NOT NULL,           -- low/medium/high/critical
    status          VARCHAR(32) DEFAULT 'active',  -- active/acknowledged/resolved
    alert_type      VARCHAR(64) NOT NULL,
    person_id       VARCHAR(64),
    camera_id       VARCHAR(64),
    zone_id         VARCHAR(64),
    zone_name       VARCHAR(255),
    lat             DOUBLE PRECISION,
    lng             DOUBLE PRECISION,
    timestamp       TIMESTAMPTZ DEFAULT NOW(),
    message         TEXT NOT NULL,
    confidence      DOUBLE PRECISION,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS alerts_timestamp_idx ON alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS alerts_status_idx ON alerts(status);
CREATE INDEX IF NOT EXISTS alerts_priority_idx ON alerts(priority);

-- ============================================================
-- CALIBRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS calibrations (
    id              BIGSERIAL PRIMARY KEY,
    camera_id       VARCHAR(64) NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    reference_points JSONB NOT NULL,               -- [{imageX, imageY, lat, lng, label}]
    homography_matrix JSONB,                        -- 3x3 matrix as nested arrays
    valid           BOOLEAN DEFAULT FALSE,
    calibrated_at   TIMESTAMPTZ DEFAULT NOW(),
    notes           TEXT
);

CREATE INDEX IF NOT EXISTS calibrations_camera_idx ON calibrations(camera_id);

-- ============================================================
-- EVIDENCE
-- ============================================================
CREATE TABLE IF NOT EXISTS evidence (
    id              BIGSERIAL PRIMARY KEY,
    event_id        VARCHAR(64) NOT NULL,
    camera_id       VARCHAR(64),
    person_id       VARCHAR(64),
    file_path       TEXT NOT NULL,
    file_type       VARCHAR(32) DEFAULT 'snapshot', -- snapshot/video/metadata
    captured_at     TIMESTAMPTZ DEFAULT NOW(),
    lat             DOUBLE PRECISION,
    lng             DOUBLE PRECISION,
    metadata        JSONB
);

CREATE INDEX IF NOT EXISTS evidence_event_idx ON evidence(event_id);

-- ============================================================
-- USEFUL POSTGIS QUERIES (examples)
-- ============================================================

-- Find all persons currently inside a specific zone:
-- SELECT p.* FROM persons p, zones z
-- WHERE z.id = 'ZONE-RES-01'
-- AND ST_Contains(z.boundary, p.current_location);

-- Get trajectory as a LineString for a person:
-- SELECT ST_MakeLine(location ORDER BY timestamp)
-- FROM track_points WHERE person_id = 'P-17';

-- Find cameras covering a specific point:
-- SELECT c.id, c.name FROM cameras c
-- WHERE ST_DWithin(c.location::geography,
--   ST_SetSRID(ST_MakePoint(74.512, 31.604), 4326)::geography,
--   c.range_m);
