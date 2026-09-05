// ============================================================
// IBVAP — Demo Data
// Wagah Border area, Punjab, India (~31.6°N, 74.5°E)
// All positions are SIMULATED for demonstration purposes.
// ============================================================
import type { Camera, Zone, TrackPoint, DemoScenario } from '../types';

export const DEMO_CENTER: [number, number] = [31.604, 74.512];

export const DEMO_CAMERAS: Camera[] = [
  {
    id: 'CAM-01',
    name: 'North Gate Camera',
    lat: 31.6065,
    lng: 74.5095,
    direction: 135,   // South-East
    fov: 70,
    range: 180,
    status: 'online',
    type: 'fixed',
    videoSource: 'demo',
    fps: 25,
    calibrationValid: true,
    description: 'Primary north perimeter camera',
  },
  {
    id: 'CAM-02',
    name: 'East Gate Camera',
    lat: 31.6065,
    lng: 74.5145,
    direction: 225,   // South-West
    fov: 70,
    range: 180,
    status: 'online',
    type: 'fixed',
    videoSource: 'demo',
    fps: 25,
    calibrationValid: true,
    description: 'Primary east perimeter camera',
  },
  {
    id: 'CAM-03',
    name: 'South Gate Camera',
    lat: 31.6015,
    lng: 74.5145,
    direction: 315,   // North-West
    fov: 70,
    range: 180,
    status: 'online',
    type: 'fixed',
    videoSource: 'demo',
    fps: 24,
    calibrationValid: true,
    description: 'Primary south perimeter camera',
  },
  {
    id: 'CAM-04',
    name: 'West Gate Camera',
    lat: 31.6015,
    lng: 74.5095,
    direction: 45,    // North-East
    fov: 70,
    range: 180,
    status: 'online',
    type: 'fixed',
    videoSource: 'demo',
    fps: 25,
    calibrationValid: true,
    description: 'Primary west perimeter camera',
  },
];

export const DEMO_ZONES: Zone[] = [
  {
    id: 'ZONE-SAFE-OUTER',
    name: 'Outer Safe Area',
    type: 'safe',
    priority: 'low',
    status: 'active',
    description: 'General civilian access zone',
    coordinates: [
      { lat: 31.6090, lng: 74.5070 },
      { lat: 31.6090, lng: 74.5175 },
      { lat: 31.5990, lng: 74.5175 },
      { lat: 31.5990, lng: 74.5070 },
    ],
    linkedCameraIds: [],
  },
  {
    id: 'ZONE-MON-01',
    name: 'Buffer Monitoring Zone',
    type: 'monitoring',
    priority: 'medium',
    status: 'active',
    description: 'Perimeter buffer zone — monitoring active',
    coordinates: [
      { lat: 31.6075, lng: 74.5082 },
      { lat: 31.6075, lng: 74.5158 },
      { lat: 31.6005, lng: 74.5158 },
      { lat: 31.6005, lng: 74.5082 },
    ],
    linkedCameraIds: ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'],
  },
  {
    id: 'ZONE-RES-01',
    name: 'Restricted Perimeter',
    type: 'restricted',
    priority: 'high',
    status: 'active',
    description: 'Restricted military perimeter — access prohibited',
    coordinates: [
      { lat: 31.6065, lng: 74.5095 },  // CAM-01
      { lat: 31.6065, lng: 74.5145 },  // CAM-02
      { lat: 31.6015, lng: 74.5145 },  // CAM-03
      { lat: 31.6015, lng: 74.5095 },  // CAM-04
    ],
    linkedCameraIds: ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'],
  },
  {
    id: 'ZONE-DNG-01',
    name: 'Inner Danger Zone',
    type: 'danger',
    priority: 'critical',
    status: 'active',
    description: 'Critical danger zone — immediate threat area',
    coordinates: [
      { lat: 31.6055, lng: 74.5108 },
      { lat: 31.6055, lng: 74.5132 },
      { lat: 31.6025, lng: 74.5132 },
      { lat: 31.6025, lng: 74.5108 },
    ],
    linkedCameraIds: ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'],
  },
];

// Person #17 path: starts in safe zone, moves through monitoring → restricted → danger
const now = new Date();
const T = (offsetSec: number) => new Date(now.getTime() + offsetSec * 1000).toISOString();

export const DEMO_PERSON_PATH: TrackPoint[] = [
  // Safe zone
  { personId: 'P-17', lat: 31.6085, lng: 74.5120, timestamp: T(0), cameraId: 'CAM-01', zoneId: 'ZONE-SAFE-OUTER', confidence: 91, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 31.6080, lng: 74.5120, timestamp: T(3), cameraId: 'CAM-01', zoneId: 'ZONE-SAFE-OUTER', confidence: 92, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 31.6078, lng: 74.5121, timestamp: T(6), cameraId: 'CAM-01', zoneId: 'ZONE-SAFE-OUTER', confidence: 93, locationStatus: 'simulated' },
  // Approaching monitoring zone
  { personId: 'P-17', lat: 31.6074, lng: 74.5121, timestamp: T(9), cameraId: 'CAM-01', zoneId: 'ZONE-MON-01', confidence: 94, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 31.6070, lng: 74.5122, timestamp: T(12), cameraId: 'CAM-01', zoneId: 'ZONE-MON-01', confidence: 94, locationStatus: 'simulated' },
  // Monitoring zone
  { personId: 'P-17', lat: 31.6068, lng: 74.5120, timestamp: T(15), cameraId: 'CAM-01', zoneId: 'ZONE-MON-01', confidence: 95, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 31.6067, lng: 74.5119, timestamp: T(18), cameraId: 'CAM-01', zoneId: 'ZONE-MON-01', confidence: 95, locationStatus: 'simulated' },
  // Crossing into restricted zone
  { personId: 'P-17', lat: 31.6063, lng: 74.5118, timestamp: T(21), cameraId: 'CAM-01', zoneId: 'ZONE-RES-01', confidence: 94, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 31.6060, lng: 74.5118, timestamp: T(24), cameraId: 'CAM-03', zoneId: 'ZONE-RES-01', confidence: 93, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 31.6057, lng: 74.5117, timestamp: T(27), cameraId: 'CAM-03', zoneId: 'ZONE-RES-01', confidence: 92, locationStatus: 'simulated' },
  // Moving through restricted into danger
  { personId: 'P-17', lat: 31.6054, lng: 74.5117, timestamp: T(30), cameraId: 'CAM-03', zoneId: 'ZONE-DNG-01', confidence: 91, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 31.6050, lng: 74.5118, timestamp: T(33), cameraId: 'CAM-03', zoneId: 'ZONE-DNG-01', confidence: 90, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 31.6045, lng: 74.5120, timestamp: T(36), cameraId: 'CAM-04', zoneId: 'ZONE-DNG-01', confidence: 89, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 31.6040, lng: 74.5122, timestamp: T(39), cameraId: 'CAM-04', zoneId: 'ZONE-DNG-01', confidence: 88, locationStatus: 'simulated' },
];

export const ZONE_COLORS: Record<string, { fill: string; stroke: string; fillOpacity: number }> = {
  safe:       { fill: '#22c55e', stroke: '#16a34a', fillOpacity: 0.12 },
  normal:     { fill: '#64748b', stroke: '#475569', fillOpacity: 0.12 },
  monitoring: { fill: '#eab308', stroke: '#ca8a04', fillOpacity: 0.18 },
  restricted: { fill: '#f97316', stroke: '#ea580c', fillOpacity: 0.22 },
  danger:     { fill: '#ef4444', stroke: '#dc2626', fillOpacity: 0.28 },
};

export const PRIORITY_COLORS: Record<string, string> = {
  low:      '#3b82f6',
  medium:   '#eab308',
  high:     '#f97316',
  critical: '#ef4444',
};
