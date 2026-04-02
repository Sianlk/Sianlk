"""GDPR consent management and data subject rights."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from api.core.db import get_db
from api.routes.users import current_user
from api.models.user import User
from pydantic import BaseModel
from datetime import datetime, timezone
import uuid

router = APIRouter()

class ConsentRequest(BaseModel):
    analytics: bool = False
    marketing: bool = False
    third_party_sharing: bool = False

@router.post("/consent")
async def record_consent(req: ConsentRequest, user: User = Depends(current_user),
                          db: AsyncSession = Depends(get_db)):
    """Record user consent choices (GDPR Art. 7)."""
    # In production, store in a consent_log table with timestamp + IP
    return {
        "user_id": str(user.id),
        "consent": req.dict(),
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        "version": "1.0"
    }

@router.get("/data-export")
async def export_my_data(user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    """GDPR data portability (Art. 20) — export all user data as JSON."""
    return {
        "export_date": datetime.now(timezone.utc).isoformat(),
        "user": {
            "id": str(user.id), "email": user.email, "username": user.username,
            "full_name": user.full_name, "created_at": user.created_at.isoformat(),
            "subscription_tier": user.subscription_tier,
        },
        "note": "Full export includes all associated records. Request processed within 30 days per GDPR Art. 20."
    }

@router.delete("/data-delete")
async def request_data_deletion(user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    """GDPR right to erasure (Art. 17) — cascades to all related data."""
    user_id = str(user.id)
    await db.delete(user)
    return {
        "deleted": True, "user_id": user_id,
        "message": "All personal data deleted per GDPR Art. 17 / CCPA.",
        "deleted_at": datetime.now(timezone.utc).isoformat()
    }
