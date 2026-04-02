"""Async SQLAlchemy database engine and session factory."""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from api.core.config import settings
import logging

logger = logging.getLogger(__name__)

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG,
)

AsyncSessionLocal = async_sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
