// ============================================================
// IBVAP — Core TypeScript Type Definitions
// ============================================================

export type ZoneType = 'safe' | 'normal' | 'monitoring' | 'restricted' | 'danger';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type CameraStatus = 'online' | 'offline' | 'degraded' | 'maintenance';
export type EventType = 
  | 'person_detected'
  | 'zone_entered'
  | 'zone_exited'
  | 'border_crossed'
  | 'restricted_intrusion'
  | 'danger_intrusion'
  | 'camera_offline'
  | 'camera_online';

export type LocationStatus = 'estimated' | 'confirmed' | 'simulated' | 'unavailable';

export type MapInteractionMode = 'NORMAL' | 'ADD_CAMERA' | 'EDIT_CAMERA' | 'ADD_ZONE' | 'EDIT_ZONE' | 'CALIBRATION';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PixelCoordinate {
  x: number;
  y: number;
}

export interface Camera {
  id: string;
  name: string;
  lat: number;
  lng: number;
  direction: number;   // degrees 0-360, 0=North
  fov: number;         // field of view in degrees
  range: number;       // detection range in meters
  status: CameraStatus;
  type: 'fixed' | 'ptz' | 'thermal';
  videoSource?: 'webcam' | 'file' | 'rtsp' | 'demo';
  rtspUrl?: string;
  fps?: number;
  calibrationValid: boolean;
  lastSeen?: string;
  description?: string;
  coverage?: LatLng[];
  createdAt?: string;
}

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  coordinates: LatLng[];  // polygon vertices
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  status: 'active' | 'inactive';
  linkedCameraIds?: string[];
  color?: string;
}

export interface PersonDetection {
  personId: number | string;
  cameraId: string;
  boundingBox?: BoundingBox;
  pixelCoordinate?: PixelCoordinate;
  geoCoordinate?: LatLng;
  confidence?: number;
  timestamp?: string;
  zoneId?: string;
  zoneName?: string;
}

export interface Person {
  id: string;
  trackId: number;
  currentLat?: number;
  currentLng?: number;
  pixelX?: number;
  pixelY?: number;
  boundingBox?: BoundingBox;
  currentZoneId?: string;
  currentZoneName?: string;
  currentCameraId?: string;
  firstSeen: string;
  lastSeen: string;
  locationStatus: LocationStatus;
  confidence?: number;
  isActive: boolean;
}

export interface TrackPoint {
  personId: string;
  lat: number;
  lng: number;
  pixelX?: number;
  pixelY?: number;
  timestamp: string;
  cameraId?: string;
  zoneId?: string;
  zoneName?: string;
  confidence?: number;
  locationStatus: LocationStatus;
}

export interface IBVAPEvent {
  id: string;
  type: EventType;
  personId?: string;
  cameraId?: string;
  cameraLat?: number;
  cameraLng?: number;
  zoneId?: string;
  zoneName?: string;
  lat?: number;
  lng?: number;
  pixelX?: number;
  pixelY?: number;
  timestamp: string;
  confidence?: number;
  locationStatus?: LocationStatus;
  description: string;
  evidencePath?: string;
  trajectory?: TrackPoint[];
  acknowledged: boolean;
  alertId?: string;
}

export interface Alert {
  id: string;
  eventId: string;
  priority: AlertPriority;
  status: AlertStatus;
  type: EventType;
  personId?: string;
  cameraId?: string;
  cameraLat?: number;
  cameraLng?: number;
  zoneId?: string;
  zoneName?: string;
  lat?: number;
  lng?: number;
  pixelX?: number;
  pixelY?: number;
  timestamp: string;
  message: string;
  confidence?: number;
  trajectory?: TrackPoint[];
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface CalibrationPoint {
  imageX: number;
  imageY: number;
  worldX?: number;
  worldY?: number;
  lat?: number;
  lng?: number;
  label?: string;
}

export interface CameraCalibration {
  cameraId: string;
  imageWidth?: number;
  imageHeight?: number;
  points: CalibrationPoint[];
  homographyMatrix?: number[][];
  referenceLatitude?: number;
  referenceLongitude?: number;
  valid: boolean;
  calibratedAt?: string;
  notes?: string;
}

export interface SystemStats {
  camerasOnline: number;
  camerasTotal: number;
  activePersons: number;
  activeAlerts: number;
  zoneIntrusions: number;
  systemStatus: 'online' | 'degraded' | 'offline';
  demoMode: boolean;
  uptime: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  path: TrackPoint[];
  cameras: Camera[];
  zones: Zone[];
  durationMs: number;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  icon?: string;
}

export interface WebSocketMessage {
  type: 'alert' | 'detection' | 'track_update' | 'camera_status' | 'system_status';
  payload: Alert | Person | TrackPoint | Camera | SystemStats;
  timestamp: string;
}
