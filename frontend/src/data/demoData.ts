// ============================================================
// IBVAP — Demo Data
// Pune, Maharashtra, India (~18.5°N, 73.8°E)
// All positions are SIMULATED for demonstration purposes.
// ============================================================
import type { Camera, Zone, TrackPoint, DemoScenario } from '../types';

export const DEMO_CENTER: [number, number] = [18.5204, 73.8567];

export const DEMO_CAMERAS: Camera[] = [
  {
    id: 'CAM-01',
    name: 'North Gate Camera',
    lat: 18.5229,
    lng: 73.8542,
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
    lat: 18.5229,
    lng: 73.8592,
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
    lat: 18.5179,
    lng: 73.8592,
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
    lat: 18.5179,
    lng: 73.8542,
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
      { lat: 18.5254, lng: 73.8517 },
      { lat: 18.5254, lng: 73.8622 },
      { lat: 18.5154, lng: 73.8622 },
      { lat: 18.5154, lng: 73.8517 },
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
      { lat: 18.5239, lng: 73.8529 },
      { lat: 18.5239, lng: 73.8605 },
      { lat: 18.5169, lng: 73.8605 },
      { lat: 18.5169, lng: 73.8529 },
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
      { lat: 18.5229, lng: 73.8542 },
      { lat: 18.5229, lng: 73.8592 },
      { lat: 18.5179, lng: 73.8592 },
      { lat: 18.5179, lng: 73.8542 },
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
      { lat: 18.5219, lng: 73.8555 },
      { lat: 18.5219, lng: 73.8579 },
      { lat: 18.5189, lng: 73.8579 },
      { lat: 18.5189, lng: 73.8555 },
    ],
    linkedCameraIds: ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'],
  },
];

// Person #17 path: starts in safe zone, moves through monitoring → restricted → danger
const now = new Date();
const T = (offsetSec: number) => new Date(now.getTime() + offsetSec * 1000).toISOString();

export const DEMO_PERSON_PATH: TrackPoint[] = [
  // Safe zone
  { personId: 'P-17', lat: 18.5249, lng: 73.8567, pixelX: 350, pixelY: 400, timestamp: T(0), cameraId: 'CAM-01', zoneId: 'ZONE-SAFE-OUTER', confidence: 91, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 18.5244, lng: 73.8567, pixelX: 420, pixelY: 480, timestamp: T(3), cameraId: 'CAM-01', zoneId: 'ZONE-SAFE-OUTER', confidence: 92, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 18.5242, lng: 73.8568, pixelX: 490, pixelY: 520, timestamp: T(6), cameraId: 'CAM-01', zoneId: 'ZONE-SAFE-OUTER', confidence: 93, locationStatus: 'simulated' },
  // Approaching monitoring zone
  { personId: 'P-17', lat: 18.5238, lng: 73.8568, pixelX: 560, pixelY: 590, timestamp: T(9), cameraId: 'CAM-01', zoneId: 'ZONE-MON-01', confidence: 94, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 18.5234, lng: 73.8569, pixelX: 630, pixelY: 640, timestamp: T(12), cameraId: 'CAM-01', zoneId: 'ZONE-MON-01', confidence: 94, locationStatus: 'simulated' },
  // Monitoring zone
  { personId: 'P-17', lat: 18.5232, lng: 73.8567, pixelX: 700, pixelY: 690, timestamp: T(15), cameraId: 'CAM-01', zoneId: 'ZONE-MON-01', confidence: 95, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 18.5231, lng: 73.8566, pixelX: 740, pixelY: 720, timestamp: T(18), cameraId: 'CAM-01', zoneId: 'ZONE-MON-01', confidence: 95, locationStatus: 'simulated' },
  // Crossing into restricted zone
  { personId: 'P-17', lat: 18.5227, lng: 73.8565, pixelX: 780, pixelY: 760, timestamp: T(21), cameraId: 'CAM-01', zoneId: 'ZONE-RES-01', confidence: 94, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 18.5224, lng: 73.8565, pixelX: 810, pixelY: 790, timestamp: T(24), cameraId: 'CAM-03', zoneId: 'ZONE-RES-01', confidence: 93, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 18.5221, lng: 73.8564, pixelX: 825, pixelY: 800, timestamp: T(27), cameraId: 'CAM-03', zoneId: 'ZONE-RES-01', confidence: 92, locationStatus: 'simulated' },
  // Moving through restricted into danger
  { personId: 'P-17', lat: 18.5218, lng: 73.8564, pixelX: 850, pixelY: 820, timestamp: T(30), cameraId: 'CAM-03', zoneId: 'ZONE-DNG-01', confidence: 91, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 18.5214, lng: 73.8565, pixelX: 880, pixelY: 850, timestamp: T(33), cameraId: 'CAM-03', zoneId: 'ZONE-DNG-01', confidence: 90, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 18.5209, lng: 73.8567, pixelX: 910, pixelY: 890, timestamp: T(36), cameraId: 'CAM-04', zoneId: 'ZONE-DNG-01', confidence: 89, locationStatus: 'simulated' },
  { personId: 'P-17', lat: 18.5204, lng: 73.8569, pixelX: 950, pixelY: 920, timestamp: T(39), cameraId: 'CAM-04', zoneId: 'ZONE-DNG-01', confidence: 88, locationStatus: 'simulated' },
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
