"""
IBVAP — Database Setup (SQLAlchemy async + SQLite/PostGIS)
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    """FastAPI dependency for DB sessions."""
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    """Create all tables."""
    async with engine.begin() as conn:
        from app.models import camera, zone, person, event, alert  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
