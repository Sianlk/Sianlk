"""OAuth2 social login — Google and Apple Sign In."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from api.core.db import get_db
from api.core.security import create_access_token, create_refresh_token, hash_password
from api.models.user import User, UserRole, SubscriptionTier
from api.core.config import settings
import urllib.request, json, secrets, hashlib, datetime, os

router = APIRouter()

class GoogleTokenRequest(BaseModel):
    id_token: str  # JWT from Google Sign-In

class AppleTokenRequest(BaseModel):
    identity_token: str  # JWT from Apple Sign In
    user_data: dict = {}  # Only sent on first sign-in

def _verify_google_id_token(id_token: str) -> dict:
    """Verify Google ID token via Google's tokeninfo endpoint."""
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
    req = urllib.request.Request(url, headers={"User-Agent": "app"})
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read())
    if data.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise ValueError("Token audience mismatch")
    if not data.get("email_verified"):
        raise ValueError("Email not verified")
    return data

@router.post("/google")
async def google_login(req: GoogleTokenRequest, db: AsyncSession = Depends(get_db)):
    """Sign in with Google — creates account if first time."""
    try:
        google_data = _verify_google_id_token(req.id_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")

    email = google_data["email"]
    name = google_data.get("name", "")
    picture = google_data.get("picture", "")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        import re
        base_username = re.sub(r"[^a-z0-9]", "", email.split("@")[0].lower())[:25]
        username = f"{base_username}_{secrets.token_hex(3)}"
        user = User(
            email=email, username=username,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            full_name=name, avatar_url=picture,
            role=UserRole.USER, subscription_tier=SubscriptionTier.FREE,
            is_verified=True)
        db.add(user)
        await db.flush()

    access = create_access_token(str(user.id), {"role": user.role, "tier": user.subscription_tier})
    refresh, rhash = create_refresh_token(str(user.id))
    from api.models.user import RefreshToken
    from datetime import timezone, timedelta
    db.add(RefreshToken(user_id=user.id, token_hash=rhash,
        expires_at=datetime.datetime.now(timezone.utc) + timedelta(days=30)))
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}

@router.post("/apple")
async def apple_login(req: AppleTokenRequest, db: AsyncSession = Depends(get_db)):
    """Sign in with Apple — creates account on first sign-in."""
    # In production: verify identity_token JWT with Apple's public keys
    # For now: extract email from user_data (only available first sign-in)
    user_info = req.user_data
    email = user_info.get("email", "")
    if not email:
        raise HTTPException(status_code=400, detail="Email required from Apple Sign In")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        import re
        base_username = re.sub(r"[^a-z0-9]", "", email.split("@")[0].lower())[:25]
        username = f"{base_username}_{secrets.token_hex(3)}"
        name = f"{user_info.get('name',{}).get('firstName','')} {user_info.get('name',{}).get('lastName','')}".strip()
        user = User(
            email=email, username=username,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            full_name=name or email.split("@")[0],
            role=UserRole.USER, subscription_tier=SubscriptionTier.FREE,
            is_verified=True)
        db.add(user)
        await db.flush()

    access = create_access_token(str(user.id), {"role": user.role, "tier": user.subscription_tier})
    refresh, rhash = create_refresh_token(str(user.id))
    from api.models.user import RefreshToken
    from datetime import timezone, timedelta
    db.add(RefreshToken(user_id=user.id, token_hash=rhash,
        expires_at=datetime.datetime.now(timezone.utc) + timedelta(days=30)))
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}
