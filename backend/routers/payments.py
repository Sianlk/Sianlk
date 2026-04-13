from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import stripe
from backend.config import get_settings
from backend.database import get_db
from backend.models import User, Subscription
from backend.auth import get_current_user

settings = get_settings()
router = APIRouter(prefix="/api/payments", tags=["payments"])

PRICE_IDS = {
    "starter_monthly":    "price_starter_monthly",
    "pro_monthly":        "price_pro_monthly",
    "enterprise_monthly": "price_enterprise_monthly",
}

class CheckoutRequest(BaseModel):
    plan: str
    success_url: str = "https://sianlk.com/success"
    cancel_url: str  = "https://sianlk.com/pricing"

@router.post("/checkout")
async def create_checkout(
    req: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not settings.stripe_secret_key:
        return {"url": f"https://sianlk.com/demo-checkout?plan={req.plan}", "demo": True}
    stripe.api_key = settings.stripe_secret_key
    price_id = PRICE_IDS.get(f"{req.plan}_monthly")
    if not price_id:
        raise HTTPException(status_code=422, detail=f"Unknown plan: {req.plan}")
    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            customer_email=current_user.email,
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=req.success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=req.cancel_url,
            metadata={"user_id": str(current_user.id), "app_slug": str(current_user.app_slug)},
        )
        return {"url": session.url}
    except Exception:
        # Fail gracefully for upstream billing/provider issues instead of surfacing 500.
        return {"url": f"https://sianlk.com/demo-checkout?plan={req.plan}", "demo": True}

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    if not settings.stripe_webhook_secret:
        return {"status": "demo"}
    body = await request.body()
    try:
        stripe.api_key = settings.stripe_secret_key
        event = stripe.Webhook.construct_event(body, stripe_signature, settings.stripe_webhook_secret)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if event["type"] == "checkout.session.completed":
        sess = event["data"]["object"]
        user_id = sess["metadata"].get("user_id", "")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            plan = "starter"
            for key, price_id in PRICE_IDS.items():
                if price_id == sess.get("line_items", [{}])[0].get("price", {}).get("id", ""):
                    plan = key.split("_")[0]
                    break
            user.plan = plan
            sub = Subscription(
                user_id=user.id,
                app_slug=sess["metadata"].get("app_slug", "sianlk"),
                stripe_sub_id=sess.get("subscription", ""),
                plan=plan,
                status="active",
            )
            db.add(sub)
    elif event["type"] == "customer.subscription.deleted":
        sub_id = event["data"]["object"]["id"]
        result = await db.execute(select(Subscription).where(Subscription.stripe_sub_id == sub_id))
        sub = result.scalar_one_or_none()
        if sub:
            sub.status = "cancelled"
            result2 = await db.execute(select(User).where(User.id == sub.user_id))
            user = result2.scalar_one_or_none()
            if user:
                user.plan = "free"
    return {"status": "ok"}

@router.get("/plans")
async def get_plans():
    return {
        "plans": [
            {"id": "free",       "name": "Free",       "price": 0,     "ai_per_day": 10,  "agents": False},
            {"id": "starter",    "name": "Starter",    "price": 9.99,  "ai_per_day": 100, "agents": True},
            {"id": "pro",        "name": "Pro",        "price": 29.99, "ai_per_day": -1,  "agents": True},
            {"id": "enterprise", "name": "Enterprise", "price": 99.99, "ai_per_day": -1,  "agents": True},
        ]
    }
