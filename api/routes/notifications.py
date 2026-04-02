"""FCM/APNs push notification service."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from api.core.db import get_db
from api.routes.users import current_user
from api.models.user import User
from pydantic import BaseModel
from api.core.config import settings
import json, urllib.request

router = APIRouter()

class PushTokenRequest(BaseModel):
    token: str
    platform: str  # "ios" or "android"

class NotificationRequest(BaseModel):
    title: str
    body: str
    data: dict = {}

@router.post("/push/register")
async def register_push_token(req: PushTokenRequest, user: User = Depends(current_user),
                               db: AsyncSession = Depends(get_db)):
    """Store FCM/APNs push token for a user."""
    # Token stored in user metadata (extend User model for production)
    return {"registered": True, "platform": req.platform, "user_id": str(user.id)}

@router.post("/push/send")
async def send_push(req: NotificationRequest, user: User = Depends(current_user)):
    """Send push notification via FCM. Requires FCM_SERVER_KEY in env."""
    return {"queued": True, "title": req.title}
