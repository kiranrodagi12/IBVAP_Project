"""
IBVAP — Object Tracker Interface

Provides a unified tracking interface.
In PRODUCTION: integrates with ByteTrack or BoT-SORT.
In DEMO MODE: returns simulated track IDs.

To activate real tracking:
- Install: pip install boxmot
- Configure: TRACKER_ENABLED=True in .env
- ByteTrack and BoT-SORT are included in the boxmot package.
"""
from typing import List, Optional
from dataclasses import dataclass
from app.vision.detector import Detection


@dataclass
class TrackedObject:
    """
    A detection with a persistent tracking ID.
    The track_id persists across frames while the object is visible.
    """
    track_id: int
    detection: Detection
    age: int = 0           # Frames since first seen
    time_since_update: int = 0  # Frames since last matched


class ByteTrackStub:
    """
    Stub implementation of ByteTrack-style tracking.
    Assigns sequential IDs for demo purposes.

    Replace this class with real ByteTrack/BoT-SORT integration
    by installing boxmot: pip install boxmot

    Usage with boxmot:
        from boxmot import ByteTrack
        tracker = ByteTrack()
        tracks = tracker.update(detections_array, frame)
    """

    def __init__(self):
        self._next_id = 1
        self._active_tracks: dict = {}

    def update(
        self,
        detections: List[Detection],
        frame=None
    ) -> List[TrackedObject]:
        """
        Update tracker with new detections.
        Returns list of tracked objects with assigned IDs.

        In this stub, each new detection gets a sequential ID.
        Real ByteTrack would match detections to existing tracks using
        IoU matching and Kalman filtering.
        """
        tracked = []
        for det in detections:
            if det.class_name in ('person',):  # Filter to relevant classes
                if det.track_id is None:
                    det.track_id = self._next_id
                    self._next_id += 1
                tracked.append(TrackedObject(track_id=det.track_id, detection=det))
        return tracked

    def reset(self):
        """Reset tracker state."""
        self._next_id = 1
        self._active_tracks = {}


# Singleton
_tracker: Optional[ByteTrackStub] = None


def get_tracker() -> ByteTrackStub:
    global _tracker
    if _tracker is None:
        _tracker = ByteTrackStub()
    return _tracker
