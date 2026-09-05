// ============================================================
// IBVAP — Geospatial Utility Functions
// Camera FOV sector calculation, point-in-polygon, etc.
// ============================================================
import type { LatLng, Zone } from '../types';

const EARTH_RADIUS_M = 6371000;
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

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
 * Returns an array of LatLng points forming the sector shape.
 * @param lat - Camera latitude
 * @param lng - Camera longitude
 * @param directionDeg - Viewing direction (degrees from north)
 * @param fovDeg - Field of view in degrees
 * @param rangeM - Detection range in meters
 * @param steps - Number of arc segments (higher = smoother)
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
  const polygon: LatLng[] = [{ lat, lng }]; // Camera position = apex of sector

  for (let i = 0; i <= steps; i++) {
    const bearing = startBearing + (i / steps) * (endBearing - startBearing);
    polygon.push(destinationPoint(lat, lng, rangeM, bearing));
  }
  polygon.push({ lat, lng }); // Close the polygon back to camera
  return polygon;
}

/**
 * Point-in-polygon test using ray casting algorithm.
 * @param point - The point to test
 * @param polygon - Array of LatLng forming the polygon
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
 * Returns the highest-priority zone (danger > restricted > monitoring > normal > safe)
 */
export function findZoneForPoint(point: LatLng, zones: Zone[]): Zone | null {
  const priorityOrder: Zone['type'][] = ['danger', 'restricted', 'monitoring', 'normal', 'safe'];
  
  const containing = zones.filter(z =>
    z.status === 'active' && pointInPolygon(point, z.coordinates)
  );
  
  if (containing.length === 0) return null;
  
  // Return highest priority zone
  for (const type of priorityOrder) {
    const zone = containing.find(z => z.type === type);
    if (zone) return zone;
  }
  return containing[0];
}

/**
 * Detect if a person has crossed from one zone type to another.
 * Returns the crossing event type if applicable.
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
 * Convert degrees to compass direction string.
 */
export function bearingToCompass(deg: number): string {
  const directions = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const index = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return directions[index];
}

/**
 * Format coordinates to display string.
 */
export function formatCoords(lat: number, lng: number, decimals: number = 6): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(decimals)}°${latDir}, ${Math.abs(lng).toFixed(decimals)}°${lngDir}`;
}

/**
 * Calculate distance between two points in meters.
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const dLat = (b.lat - a.lat) * DEG_TO_RAD;
  const dLng = (b.lng - a.lng) * DEG_TO_RAD;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * DEG_TO_RAD) * Math.cos(b.lat * DEG_TO_RAD) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(x));
}

/**
 * Generate a camera polygon from an array of camera positions.
 * Useful for the "Create Zone from Cameras" feature.
 */
export function cameraPositionsToPolygon(cameras: { lat: number; lng: number }[]): LatLng[] {
  // Simple convex hull-like ordering for 4 cameras
  // For demonstration purposes, return positions in order
  return cameras.map(c => ({ lat: c.lat, lng: c.lng }));
}
