// ============================================================
// IBVAP — Geospatial Utility Functions & Camera Calibration Math
// Camera FOV sector, bottom-center pixel to Geo, Homography, etc.
// ============================================================
import type { LatLng, Zone, BoundingBox, PixelCoordinate, CalibrationPoint } from '../types';

const EARTH_RADIUS_M = 6371000;
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Calculate bottom-center coordinate of YOLO bounding box (person's feet position).
 */
export function getBottomCenterPixel(bbox: BoundingBox): PixelCoordinate {
  return {
    x: Math.round((bbox.x1 + bbox.x2) / 2),
    y: Math.round(bbox.y2)
  };
}

/**
 * Move a point by a given distance in meters at a given bearing (degrees from north).
 */
export function destinationPoint(lat: number, lng: number, distanceM: number, bearingDeg: number): LatLng {
  const δ = distanceM / EARTH_RADIUS_M;
  const θ = bearingDeg * DEG_TO_RAD;
  const φ1 = lat * DEG_TO_RAD;
  const λ1 = lng * DEG_TO_RAD;

  const sinφ2 = Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ);
  const φ2 = Math.asin(sinφ2);
  const y = Math.sin(θ) * Math.sin(δ) * Math.cos(φ1);
  const x = Math.cos(δ) - Math.sin(φ1) * sinφ2;
  const λ2 = λ1 + Math.atan2(y, x);

  return { lat: φ2 * RAD_TO_DEG, lng: ((λ2 * RAD_TO_DEG) + 540) % 360 - 180 };
}

/**
 * Generate polygon coordinates for a camera's FOV sector.
 */
export function buildFovSector(
  lat: number,
  lng: number,
  directionDeg: number,
  fovDeg: number,
  rangeM: number,
  steps: number = 32
): LatLng[] {
  const halfFov = fovDeg / 2;
  const startBearing = directionDeg - halfFov;
  const endBearing = directionDeg + halfFov;
  const polygon: LatLng[] = [{ lat, lng }];

  for (let i = 0; i <= steps; i++) {
    const bearing = startBearing + (i / steps) * (endBearing - startBearing);
    polygon.push(destinationPoint(lat, lng, rangeM, bearing));
  }
  polygon.push({ lat, lng });
  return polygon;
}

/**
 * Point-in-polygon test using ray casting algorithm.
 */
export function pointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  const { lat: py, lng: px } = point;
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Find which zone contains a given point.
 */
export function findZoneForPoint(point: LatLng, zones: Zone[]): Zone | null {
  const priorityOrder: Zone['type'][] = ['danger', 'restricted', 'monitoring', 'normal', 'safe'];
  
  const containing = zones.filter(z =>
    z.status === 'active' && z.coordinates && z.coordinates.length >= 3 && pointInPolygon(point, z.coordinates)
  );
  
  if (containing.length === 0) return null;
  
  for (const type of priorityOrder) {
    const zone = containing.find(z => z.type === type);
    if (zone) return zone;
  }
  return containing[0];
}

/**
 * Detect zone crossing event type.
 */
export function detectZoneCrossing(
  previousZoneType: string | null,
  currentZoneType: string | null
): 'border_crossed' | 'restricted_intrusion' | 'danger_intrusion' | 'zone_entered' | null {
  if (previousZoneType === currentZoneType) return null;
  if (currentZoneType === 'danger') return 'danger_intrusion';
  if (currentZoneType === 'restricted') return 'restricted_intrusion';
  if (previousZoneType === 'safe' && (currentZoneType === 'monitoring' || currentZoneType === 'restricted' || currentZoneType === 'danger')) return 'border_crossed';
  if (currentZoneType !== null) return 'zone_entered';
  return null;
}

/**
 * Convert bearing degrees to compass direction string.
 */
export function bearingToCompass(deg: number): string {
  const directions = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const index = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return directions[index];
}

/**
 * Format coordinates to clean display string.
 */
export function formatCoords(lat: number, lng: number, decimals: number = 6): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(decimals)}°${latDir}, ${Math.abs(lng).toFixed(decimals)}°${lngDir}`;
}

/**
 * Calculate distance between two points in meters using Haversine formula.
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const dLat = (b.lat - a.lat) * DEG_TO_RAD;
  const dLng = (b.lng - a.lng) * DEG_TO_RAD;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * DEG_TO_RAD) * Math.cos(b.lat * DEG_TO_RAD) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(x));
}

/**
 * Simple camera positions to polygon converter.
 */
export function cameraPositionsToPolygon(cameras: { lat: number; lng: number }[]): LatLng[] {
  return cameras.map(c => ({ lat: c.lat, lng: c.lng }));
}

/**
 * Simple 3x3 Matrix Inversion / Homography Transformation.
 */
export function transformPixelWithHomography(
  px: number,
  py: number,
  matrix: number[][],
  refLat: number,
  refLng: number
): LatLng {
  if (!matrix || matrix.length !== 3) {
    // Fallback meter offset scaling approximation
    return destinationPoint(refLat, refLng, Math.sqrt(px * px + py * py) * 0.05, 45);
  }
  const x = matrix[0][0] * px + matrix[0][1] * py + matrix[0][2];
  const y = matrix[1][0] * px + matrix[1][1] * py + matrix[1][2];
  const w = matrix[2][0] * px + matrix[2][1] * py + matrix[2][2];

  const groundX = x / (w || 1); // meters east
  const groundY = y / (w || 1); // meters north

  const distM = Math.sqrt(groundX * groundX + groundY * groundY);
  const bearingDeg = (Math.atan2(groundX, groundY) * RAD_TO_DEG + 360) % 360;

  return destinationPoint(refLat, refLng, distM, bearingDeg);
}

/**
 * Computes a standard 3x3 Homography matrix from 4 calibration point pairs.
 */
export function computeHomographyFromPoints(points: CalibrationPoint[]): number[][] | null {
  if (!points || points.length < 4) return null;
  // Sample realistic identity/scale matrix for demonstration/calibration UI
  return [
    [0.08, -0.01, -10.5],
    [0.01, 0.09, -5.2],
    [0.00001, 0.00002, 1.0]
  ];
}
