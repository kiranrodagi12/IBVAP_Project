"""
IBVAP — YOLO Object Detector

This module provides the detection interface.
In DEMO MODE: returns simulated detections.
In PRODUCTION MODE: uses Ultralytics YOLO with a real model file.

To activate real detection:
1. Install: pip install ultralytics
2. Place your model file at: ai/models/best.pt
3. Set YOLO_ENABLED=True in .env
"""
import time
from typing import List, Dict, Optional
from dataclasses import dataclass
from app.config import settings


@dataclass
class Detection:
    """
    A single object detection result.
    Coordinates are in image pixels.
    """
    class_id: int
    class_name: str
    confidence: float
    x1: float  # Bounding box top-left x
    y1: float  # Bounding box top-left y
    x2: float  # Bounding box bottom-right x
    y2: float  # Bounding box bottom-right y
    track_id: Optional[int] = None  # Assigned by tracker

    @property
    def foot_x(self) -> float:
        """Ground contact point X (bottom-center of bounding box)."""
        return (self.x1 + self.x2) / 2.0

    @property
    def foot_y(self) -> float:
        """Ground contact point Y (bottom of bounding box)."""
        return self.y2

    @property
    def center_x(self) -> float:
        return (self.x1 + self.x2) / 2.0

    @property
    def center_y(self) -> float:
        return (self.y1 + self.y2) / 2.0


class YOLODetector:
    """
    YOLO detection engine.
    Supports both real YOLO (when model file exists) and demo stub.
    """

    def __init__(self):
        self.model = None
        self.enabled = False
        self._try_load_model()

    def _try_load_model(self) -> None:
        """Attempt to load the YOLO model."""
        if not settings.yolo_enabled:
            print("[YOLO] YOLO_ENABLED=False — running in demo/stub mode")
            return

        try:
            from ultralytics import YOLO  # type: ignore
            model_path = settings.yolo_model_path
            self.model = YOLO(model_path)
            self.enabled = True
            print(f"[YOLO] Model loaded: {model_path}")
        except ImportError:
            print("[YOLO] ultralytics not installed — demo mode")
        except FileNotFoundError:
            print(f"[YOLO] Model file not found: {settings.yolo_model_path} — demo mode")
        except Exception as e:
            print(f"[YOLO] Load error: {e} — demo mode")

    def detect(self, frame) -> List[Detection]:
        """
        Run detection on a video frame.
        frame: numpy array (H, W, 3) BGR
        Returns list of Detection objects.
        """
        if self.enabled and self.model is not None:
            return self._real_detect(frame)
        else:
            return self._demo_detect()

    def _real_detect(self, frame) -> List[Detection]:
        """Run actual YOLO inference."""
        results = self.model(frame, conf=settings.yolo_confidence_threshold, verbose=False)
        detections = []
        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                cls_name = self.model.names.get(cls_id, str(cls_id))
                detections.append(Detection(
                    class_id=cls_id,
                    class_name=cls_name,
                    confidence=conf,
                    x1=x1, y1=y1, x2=x2, y2=y2,
                ))
        return detections

    def _demo_detect(self) -> List[Detection]:
        """
        Return simulated detections for demo mode.
        In demo mode the frontend simulation drives person position;
        this stub is here for the processing pipeline architecture.
        """
        return []  # Demo detections are driven by frontend simulation


# Singleton
_detector: Optional[YOLODetector] = None


def get_detector() -> YOLODetector:
    global _detector
    if _detector is None:
        _detector = YOLODetector()
    return _detector
