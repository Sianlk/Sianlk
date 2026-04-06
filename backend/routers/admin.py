from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from backend.database import get_db
from backend.models import User, AILog
from backend.auth import get_current_user
from backend.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)):
    if not settings.admin_email or current_user.email.lower() != settings.admin_email.lower():
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    total_users = await db.scalar(select(func.count(User.id))) or 0
    active_users = await db.scalar(
        select(func.count(User.id)).where(User.is_active == True)
    ) or 0
    total_ai = await db.scalar(select(func.count(AILog.id))) or 0

    r1 = await db.execute(
        select(User.app_slug, func.count(User.id).label("cnt")).group_by(User.app_slug)
    )
    per_app = {row.app_slug: row.cnt for row in r1}

    r2 = await db.execute(
        select(User.plan, func.count(User.id).label("cnt")).group_by(User.plan)
    )
    per_plan = {row.plan: row.cnt for row in r2}

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_ai_calls": total_ai,
        "users_per_app": per_app,
        "users_per_plan": per_plan,
    }


@router.get("/users")
async def list_users(
    limit: int = 100,
    offset: int = 0,
    app_slug: str = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = select(User).order_by(User.created_at.desc()).limit(limit).offset(offset)
    if app_slug:
        q = q.where(User.app_slug == app_slug)
    result = await db.execute(q)
    users = result.scalars().all()
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "plan": u.plan,
                "app_slug": u.app_slug,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]
    }
