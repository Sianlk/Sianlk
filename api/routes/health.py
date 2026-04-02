"""Health check endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from api.core.db import get_db
import time

router = APIRouter()

@router.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    start = time.time()
    await db.execute(text("SELECT 1"))
    db_ms = (time.time() - start) * 1000
    return {"status": "ok", "db_latency_ms": round(db_ms, 2), "timestamp": time.time()}
