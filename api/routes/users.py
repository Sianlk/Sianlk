"""User profile routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from api.core.db import get_db
from api.core.security import decode_token
from api.models.user import User
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uuid

router = APIRouter()
bearer = HTTPBearer()

async def current_user(creds: HTTPAuthorizationCredentials = Depends(bearer), db: AsyncSession = Depends(get_db)) -> User:
    payload = decode_token(creds.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token")
    result = await db.execute(select(User).where(User.id == uuid.UUID(payload["sub"])))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user

@router.get("/me")
async def get_me(user: User = Depends(current_user)):
    return {
        "id": str(user.id), "email": user.email, "username": user.username,
        "full_name": user.full_name, "role": user.role,
        "subscription_tier": user.subscription_tier, "is_verified": user.is_verified,
        "avatar_url": user.avatar_url, "created_at": user.created_at.isoformat()}

@router.delete("/me")
async def delete_account(user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    """GDPR data deletion endpoint - required for App Store approval."""
    await db.delete(user)
    return {"message": "Account and all associated data deleted"}
