"""
IBVAP — Demo Data Seeder
Seeds the database with demo cameras and zones for development.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.camera import CameraModel
from app.models.zone import ZoneModel

DEMO_CAMERAS = [
    dict(id='CAM-01', name='North Gate Camera', lat=31.6065, lng=74.5095,
         direction=135, fov=70, range_m=180, status='online', camera_type='fixed',
         video_source='demo', fps=25, calibration_valid=True,
         description='Primary north perimeter camera'),
    dict(id='CAM-02', name='East Gate Camera', lat=31.6065, lng=74.5145,
         direction=225, fov=70, range_m=180, status='online', camera_type='fixed',
         video_source='demo', fps=25, calibration_valid=True,
         description='Primary east perimeter camera'),
    dict(id='CAM-03', name='South Gate Camera', lat=31.6015, lng=74.5145,
         direction=315, fov=70, range_m=180, status='online', camera_type='fixed',
         video_source='demo', fps=24, calibration_valid=True,
         description='Primary south perimeter camera'),
    dict(id='CAM-04', name='West Gate Camera', lat=31.6015, lng=74.5095,
         direction=45, fov=70, range_m=180, status='online', camera_type='fixed',
         video_source='demo', fps=25, calibration_valid=True,
         description='Primary west perimeter camera'),
]

DEMO_ZONES = [
    dict(
        id='ZONE-SAFE-OUTER', name='Outer Safe Area', zone_type='safe',
        priority='low', status='active',
        description='General civilian access zone',
        coordinates=[
            {'lat': 31.6090, 'lng': 74.5070},
            {'lat': 31.6090, 'lng': 74.5175},
            {'lat': 31.5990, 'lng': 74.5175},
            {'lat': 31.5990, 'lng': 74.5070},
        ],
        linked_camera_ids=[],
    ),
    dict(
        id='ZONE-MON-01', name='Buffer Monitoring Zone', zone_type='monitoring',
        priority='medium', status='active',
        description='Perimeter buffer zone — monitoring active',
        coordinates=[
            {'lat': 31.6075, 'lng': 74.5082},
            {'lat': 31.6075, 'lng': 74.5158},
            {'lat': 31.6005, 'lng': 74.5158},
            {'lat': 31.6005, 'lng': 74.5082},
        ],
        linked_camera_ids=['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'],
    ),
    dict(
        id='ZONE-RES-01', name='Restricted Perimeter', zone_type='restricted',
        priority='high', status='active',
        description='Restricted military perimeter — access prohibited',
        coordinates=[
            {'lat': 31.6065, 'lng': 74.5095},
            {'lat': 31.6065, 'lng': 74.5145},
            {'lat': 31.6015, 'lng': 74.5145},
            {'lat': 31.6015, 'lng': 74.5095},
        ],
        linked_camera_ids=['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'],
    ),
    dict(
        id='ZONE-DNG-01', name='Inner Danger Zone', zone_type='danger',
        priority='critical', status='active',
        description='Critical danger zone — immediate threat area',
        coordinates=[
            {'lat': 31.6055, 'lng': 74.5108},
            {'lat': 31.6055, 'lng': 74.5132},
            {'lat': 31.6025, 'lng': 74.5132},
            {'lat': 31.6025, 'lng': 74.5108},
        ],
        linked_camera_ids=['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'],
    ),
]


async def seed_demo_data(db: AsyncSession) -> None:
    """Seed demo cameras and zones if they don't exist."""
    # Seed cameras
    for cam_data in DEMO_CAMERAS:
        existing = await db.get(CameraModel, cam_data['id'])
        if not existing:
            db.add(CameraModel(**cam_data))

    # Seed zones
    for zone_data in DEMO_ZONES:
        existing = await db.get(ZoneModel, zone_data['id'])
        if not existing:
            db.add(ZoneModel(**zone_data))

    await db.commit()
    print("[Seed] Demo data seeded successfully")
