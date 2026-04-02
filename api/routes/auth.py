"""Authentication routes: register, login, refresh, logout, MFA."""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr, field_validator
from api.core.db import get_db
from api.core.security import (hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token)
from api.models.user import User, RefreshToken, UserRole, SubscriptionTier
from datetime import datetime, timezone, timedelta
import re, uuid, hashlib

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str = ""

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 12:
            raise ValueError("Password must be at least 12 characters")
        if not re.search(r"[A-Z]", v): raise ValueError("Must contain uppercase")
        if not re.search(r"[0-9]", v): raise ValueError("Must contain digit")
        if not re.search(r"[^A-Za-z0-9]", v): raise ValueError("Must contain special char")
        return v

    @field_validator("username")
    @classmethod
    def username_safe(cls, v):
        if not re.match(r"^[a-zA-Z0-9_-]{3,30}$", v):
            raise ValueError("Username: 3-30 chars, alphanumeric/dash/underscore only")
        return v

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(
        (User.email == req.email) | (User.username == req.username)))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email or username already registered")
    user = User(
        email=req.email, username=req.username,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        role=UserRole.USER, subscription_tier=SubscriptionTier.FREE)
    db.add(user)
    await db.flush()
    return {"id": str(user.id), "email": user.email, "username": user.username}

@router.post("/login", response_model=LoginResponse)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db), request: Request = None):
    result = await db.execute(select(User).where(User.email == form.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"})
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    access = create_access_token(str(user.id), {"role": user.role, "tier": user.subscription_tier})
    refresh, token_hash = create_refresh_token(str(user.id))
    rt = RefreshToken(
        user_id=user.id, token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        user_agent=request.headers.get("User-Agent","")[:512] if request else "",
        ip_address=request.client.host if request and request.client else "")
    db.add(rt)
    user.last_login = datetime.now(timezone.utc)
    return LoginResponse(access_token=access, refresh_token=refresh)

@router.post("/refresh", response_model=LoginResponse)
async def refresh_tokens(refresh_token: str, db: AsyncSession = Depends(get_db)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    jti = payload.get("jti","")
    token_hash = hashlib.sha256(jti.encode()).hexdigest()
    result = await db.execute(select(RefreshToken).where(
        RefreshToken.token_hash == token_hash, RefreshToken.is_revoked == False))
    rt = result.scalar_one_or_none()
    if not rt or rt.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Refresh token expired or revoked")
    rt.is_revoked = True
    result2 = await db.execute(select(User).where(User.id == rt.user_id))
    user = result2.scalar_one_or_none()
    access = create_access_token(str(user.id), {"role": user.role, "tier": user.subscription_tier})
    new_refresh, new_hash = create_refresh_token(str(user.id))
    db.add(RefreshToken(user_id=user.id, token_hash=new_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)))
    return LoginResponse(access_token=access, refresh_token=new_refresh)

@router.post("/logout")
async def logout(refresh_token: str, db: AsyncSession = Depends(get_db)):
    payload = decode_token(refresh_token)
    if payload:
        jti = payload.get("jti","")
        token_hash = hashlib.sha256(jti.encode()).hexdigest()
        result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
        rt = result.scalar_one_or_none()
        if rt: rt.is_revoked = True
    return {"message": "Logged out"}
