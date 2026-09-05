"""
IBVAP — Camera Homography / Calibration Module

Implements the image-to-ground-coordinate transformation pipeline:

  Image Pixel
      ↓
  Homography Matrix (computed from reference points)
      ↓
  Ground Coordinates
      ↓
  Geographic Coordinates (lat/lng)

IMPORTANT:
- All locations estimated via homography are ESTIMATED, not GPS-accurate.
- Accuracy depends on the quality of ground-control reference points.
- Camera movement or vibration will invalidate the calibration.
"""
import numpy as np
from typing import List, Optional, Tuple, Dict


class CameraCalibration:
    """
    Manages homography calibration for a camera.
    Requires at least 4 corresponding (image point, ground point) pairs.
    """

    def __init__(self, camera_id: str):
        self.camera_id = camera_id
        self.reference_points: List[Dict] = []  # {imageX, imageY, lat, lng, label}
        self.homography_matrix: Optional[np.ndarray] = None
        self.valid = False

    def add_reference_point(
        self,
        image_x: float,
        image_y: float,
        lat: float,
        lng: float,
        label: str = ""
    ) -> None:
        """Add a ground-control point pair."""
        self.reference_points.append({
            'imageX': image_x,
            'imageY': image_y,
            'lat': lat,
            'lng': lng,
            'label': label,
        })
        # Recompute homography when we have enough points
        if len(self.reference_points) >= 4:
            self._compute_homography()

    def _compute_homography(self) -> bool:
        """
        Compute the homography matrix from reference points.
        Maps image coordinates → geographic coordinates.
        Returns True if successful.
        """
        try:
            import cv2
            src_pts = np.array(
                [[p['imageX'], p['imageY']] for p in self.reference_points],
                dtype=np.float64
            )
            # Use a local coordinate system centered at the first reference point
            # to avoid floating-point precision issues with lat/lng values
            ref_lat = self.reference_points[0]['lat']
            ref_lng = self.reference_points[0]['lng']

            # Scale factors (approximate meters per degree)
            lat_scale = 111320.0  # meters per degree latitude
            lng_scale = 111320.0 * abs(np.cos(np.radians(ref_lat)))  # meters per degree longitude

            dst_pts = np.array(
                [
                    [
                        (p['lng'] - ref_lng) * lng_scale,
                        (p['lat'] - ref_lat) * lat_scale
                    ]
                    for p in self.reference_points
                ],
                dtype=np.float64
            )

            H, status = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC)
            if H is not None:
                self.homography_matrix = H
                self._ref_lat = ref_lat
                self._ref_lng = ref_lng
                self._lat_scale = lat_scale
                self._lng_scale = lng_scale
                self.valid = True
                return True
        except ImportError:
            # OpenCV not available — use numpy-based DLT
            self._compute_homography_numpy()
        except Exception as e:
            print(f"[Homography] Computation failed: {e}")

        self.valid = False
        return False

    def _compute_homography_numpy(self) -> None:
        """Fallback: DLT homography estimation without OpenCV."""
        # Simplified version — for production use OpenCV
        self.valid = False

    def image_to_geographic(
        self,
        image_x: float,
        image_y: float
    ) -> Optional[Tuple[float, float]]:
        """
        Transform an image pixel coordinate to geographic (lat, lng).
        Returns (lat, lng) tuple or None if calibration is invalid.

        IMPORTANT: Returns ESTIMATED coordinates only.
        """
        if not self.valid or self.homography_matrix is None:
            return None

        try:
            pt = np.array([[[image_x, image_y]]], dtype=np.float64)

            try:
                import cv2
                result = cv2.perspectiveTransform(pt, self.homography_matrix)
                local_x = result[0][0][0]  # meters from reference
                local_y = result[0][0][1]  # meters from reference
            except ImportError:
                # Manual perspective transform
                H = self.homography_matrix
                w = H[2, 0] * image_x + H[2, 1] * image_y + H[2, 2]
                if abs(w) < 1e-10:
                    return None
                local_x = (H[0, 0] * image_x + H[0, 1] * image_y + H[0, 2]) / w
                local_y = (H[1, 0] * image_x + H[1, 1] * image_y + H[1, 2]) / w

            # Convert local meters back to lat/lng
            lat = self._ref_lat + local_y / self._lat_scale
            lng = self._ref_lng + local_x / self._lng_scale
            return lat, lng

        except Exception as e:
            print(f"[Homography] Transform failed: {e}")
            return None

    def to_dict(self) -> dict:
        return {
            'cameraId': self.camera_id,
            'points': self.reference_points,
            'homographyMatrix': self.homography_matrix.tolist() if self.homography_matrix is not None else None,
            'valid': self.valid,
        }


# Global calibration registry
_calibrations: Dict[str, CameraCalibration] = {}


def get_calibration(camera_id: str) -> CameraCalibration:
    if camera_id not in _calibrations:
        _calibrations[camera_id] = CameraCalibration(camera_id)
    return _calibrations[camera_id]
