"""
IBVAP — Demo Data Seeder
Seeds the database with demo cameras and zones for development.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.camera import CameraModel
from app.models.zone import ZoneModel

DEMO_CAMERAS = [
    dict(id='CAM-01', name='North Gate Camera', lat=18.5229, lng=73.8542,
         direction=135, fov=70, range_m=180, status='online', camera_type='fixed',
         video_source='demo', fps=25, calibration_valid=True,
         description='Primary north perimeter camera'),
    dict(id='CAM-02', name='East Gate Camera', lat=18.5229, lng=73.8592,
         direction=225, fov=70, range_m=180, status='online', camera_type='fixed',
         video_source='demo', fps=25, calibration_valid=True,
         description='Primary east perimeter camera'),
    dict(id='CAM-03', name='South Gate Camera', lat=18.5179, lng=73.8592,
         direction=315, fov=70, range_m=180, status='online', camera_type='fixed',
         video_source='demo', fps=24, calibration_valid=True,
         description='Primary south perimeter camera'),
    dict(id='CAM-04', name='West Gate Camera', lat=18.5179, lng=73.8542,
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
            {'lat': 18.5254, 'lng': 73.8517},
            {'lat': 18.5254, 'lng': 73.8622},
            {'lat': 18.5154, 'lng': 73.8622},
            {'lat': 18.5154, 'lng': 73.8517},
        ],
        linked_camera_ids=[],
    ),
    dict(
        id='ZONE-MON-01', name='Buffer Monitoring Zone', zone_type='monitoring',
        priority='medium', status='active',
        description='Perimeter buffer zone — monitoring active',
        coordinates=[
            {'lat': 18.5239, 'lng': 73.8529},
            {'lat': 18.5239, 'lng': 73.8605},
            {'lat': 18.5169, 'lng': 73.8605},
            {'lat': 18.5169, 'lng': 73.8529},
        ],
        linked_camera_ids=['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'],
    ),
    dict(
        id='ZONE-RES-01', name='Restricted Perimeter', zone_type='restricted',
        priority='high', status='active',
        description='Restricted military perimeter — access prohibited',
        coordinates=[
            {'lat': 18.5229, 'lng': 73.8542},
            {'lat': 18.5229, 'lng': 73.8592},
            {'lat': 18.5179, 'lng': 73.8592},
            {'lat': 18.5179, 'lng': 73.8542},
        ],
        linked_camera_ids=['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'],
    ),
    dict(
        id='ZONE-DNG-01', name='Inner Danger Zone', zone_type='danger',
        priority='critical', status='active',
        description='Critical danger zone — immediate threat area',
        coordinates=[
            {'lat': 18.5219, 'lng': 73.8555},
            {'lat': 18.5219, 'lng': 73.8579},
            {'lat': 18.5189, 'lng': 73.8579},
            {'lat': 18.5189, 'lng': 73.8555},
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
