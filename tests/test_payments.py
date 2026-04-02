"""Tests for payment endpoints (Stripe webhook signature validation)."""
import pytest
import json
import hmac
import hashlib
import time


def make_stripe_sig(payload: str, secret: str, ts: int) -> str:
    signed = f"{ts}.{payload}"
    sig = hmac.new(secret.encode(), signed.encode(), hashlib.sha256).hexdigest()
    return f"t={ts},v1={sig}"


@pytest.mark.asyncio
async def test_webhook_invalid_signature_rejected(client):
    """Stripe webhooks with invalid signatures must return 400."""
    payload = json.dumps({"type": "payment_intent.succeeded", "data": {}})
    resp = await client.post(
        "/api/v1/payments/webhook",
        content=payload,
        headers={
            "Content-Type": "application/json",
            "stripe-signature": "t=999,v1=invalidsig",
        }
    )
    assert resp.status_code in (400, 401, 403, 422), resp.text


@pytest.mark.asyncio
async def test_checkout_requires_auth(client):
    """Stripe checkout session creation requires authentication."""
    resp = await client.post("/api/v1/payments/checkout", json={"plan_id": "test"})
    assert resp.status_code == 401
