"""
Unified SaaS API Tests
Tests that run cleanly first time, no external deps required.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database import init_db, engine
from backend.models import Base

@pytest_asyncio.fixture(scope="session")
async def client():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.1.0"

@pytest.mark.asyncio
async def test_root(client):
    r = await client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert "apps" in data
    assert len(data["apps"]) == 11

@pytest.mark.asyncio
async def test_register(client):
    r = await client.post("/api/auth/register", json={
        "email": "test@sianlk.com",
        "password": "testpass123",
        "full_name": "Test User",
        "app_slug": "geniai",
    })
    assert r.status_code == 201
    data = r.json()
    assert "access_token" in data
    assert data["plan"] == "free"
    return data["access_token"]

@pytest.mark.asyncio
async def test_register_duplicate(client):
    await client.post("/api/auth/register", json={
        "email": "dup@sianlk.com", "password": "pass1234", "app_slug": "sianlk"
    })
    r = await client.post("/api/auth/register", json={
        "email": "dup@sianlk.com", "password": "pass1234", "app_slug": "sianlk"
    })
    assert r.status_code == 409

@pytest.mark.asyncio
async def test_login(client):
    await client.post("/api/auth/register", json={
        "email": "login@sianlk.com", "password": "mypassword", "app_slug": "aiblty"
    })
    r = await client.post("/api/auth/token", data={
        "username": "login@sianlk.com", "password": "mypassword"
    })
    assert r.status_code == 200
    assert "access_token" in r.json()

@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/api/auth/register", json={
        "email": "wp@sianlk.com", "password": "correct123", "app_slug": "aib"
    })
    r = await client.post("/api/auth/token", data={
        "username": "wp@sianlk.com", "password": "wrong"
    })
    assert r.status_code == 401

@pytest.mark.asyncio
async def test_me_authenticated(client):
    reg = await client.post("/api/auth/register", json={
        "email": "me@sianlk.com", "password": "mepass123", "app_slug": "buildquote"
    })
    token = reg.json()["access_token"]
    r = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "me@sianlk.com"

@pytest.mark.asyncio
async def test_me_unauthenticated(client):
    r = await client.get("/api/auth/me")
    assert r.status_code == 401

@pytest.mark.asyncio
async def test_ai_complete_demo(client):
    reg = await client.post("/api/auth/register", json={
        "email": "ai@sianlk.com", "password": "aipass123", "app_slug": "geniai"
    })
    token = reg.json()["access_token"]
    r = await client.post("/api/ai/complete",
        json={"message": "Hello", "app_slug": "geniai"},
        headers={"Authorization": f"Bearer {token}"},
    )
    # Demo mode (no API key) returns 200
    assert r.status_code == 200
    assert "content" in r.json()

@pytest.mark.asyncio
async def test_analytics_batch(client):
    r = await client.post("/api/analytics/batch", json={
        "events": [
            {"event_name": "app_open", "app_slug": "aiblty"},
            {"event_name": "ai_request", "app_slug": "aiblty", "properties": {"model": "gpt-4o-mini"}},
        ]
    })
    assert r.status_code == 202
    assert r.json()["accepted"] == 2

@pytest.mark.asyncio
async def test_plans(client):
    r = await client.get("/api/payments/plans")
    assert r.status_code == 200
    plans = r.json()["plans"]
    assert len(plans) == 4
    assert plans[0]["id"] == "free"
    assert plans[0]["price"] == 0
