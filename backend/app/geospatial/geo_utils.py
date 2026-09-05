"""
IBVAP — Geospatial Utilities (Backend)
Point-in-polygon, zone detection, coordinate transforms
"""
import math
from typing import Optional, List, Tuple
from shapely.geometry import Point, Polygon
from shapely.validation import make_valid


def point_in_polygon(
    lat: float,
    lng: float,
    polygon_coords: List[dict]
) -> bool:
    """
    Check if a geographic point is inside a polygon.
    Uses Shapely for reliable computation.
    polygon_coords: [{"lat": ..., "lng": ...}, ...]
    """
    try:
        point = Point(lng, lat)  # Shapely uses (x=lng, y=lat)
        coords = [(c["lng"], c["lat"]) for c in polygon_coords]
        if len(coords) < 3:
            return False
        poly = Polygon(coords)
        poly = make_valid(poly)
        return bool(poly.contains(point))
    except Exception:
        return False


def find_zone_for_point(
    lat: float,
    lng: float,
    zones: list
) -> Optional[dict]:
    """
    Return the highest-priority zone containing the point.
    Priority: danger > restricted > monitoring > normal > safe
    """
    priority_order = ['danger', 'restricted', 'monitoring', 'normal', 'safe']
    containing = []

    for zone in zones:
        if zone.get('status') != 'active':
            continue
        coords = zone.get('coordinates', [])
        if point_in_polygon(lat, lng, coords):
            containing.append(zone)

    if not containing:
        return None

    for zone_type in priority_order:
        for zone in containing:
            if zone.get('type') == zone_type:
                return zone

    return containing[0]


def detect_zone_crossing(
    previous_zone_type: Optional[str],
    current_zone_type: Optional[str]
) -> Optional[str]:
    """
    Detect meaningful zone crossing events.
    Returns event type string or None.
    """
    if previous_zone_type == current_zone_type:
        return None
    if current_zone_type == 'danger':
        return 'danger_intrusion'
    if current_zone_type == 'restricted':
        return 'restricted_intrusion'
    if (previous_zone_type in ('safe', None)) and current_zone_type in ('monitoring', 'restricted', 'danger'):
        return 'border_crossed'
    if current_zone_type is not None:
        return 'zone_entered'
    return None


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the great-circle distance between two geographic points.
    Returns distance in meters.
    """
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def foot_point(x1: float, y1: float, x2: float, y2: float) -> Tuple[float, float]:
    """
    Calculate the foot point (ground contact) from a bounding box.
    Used for geolocation: the bottom-center of the bounding box is used
    as the approximate ground contact point, not the center of the box.
    Returns (foot_x, foot_y) in image pixel coordinates.
    """
    foot_x = (x1 + x2) / 2.0
    foot_y = y2  # Bottom of bounding box = approximate ground contact
    return foot_x, foot_y
