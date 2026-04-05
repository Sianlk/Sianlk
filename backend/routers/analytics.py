from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
import json
from backend.database import get_db
from backend.models import AnalyticsEvent

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

class AnalyticsEventIn(BaseModel):
    event_name: str
    app_slug: str
    user_id: Optional[str] = None
    properties: Optional[dict] = None

class BatchRequest(BaseModel):
    events: list[AnalyticsEventIn]

@router.post("/batch", status_code=202)
async def ingest_batch(req: BatchRequest, db: AsyncSession = Depends(get_db)):
    for e in req.events[:50]:  # cap at 50 per batch
        event = AnalyticsEvent(
            user_id=e.user_id,
            app_slug=e.app_slug,
            event_name=e.event_name,
            properties=json.dumps(e.properties or {}),
        )
        db.add(event)
    return {"accepted": min(len(req.events), 50)}
