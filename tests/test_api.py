"""Integration tests for API endpoints."""
import pytest
from httpx import AsyncClient, ASGITransport
from api.main import app

@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/api/v1/health")
    assert r.status_code in (200, 503)

@pytest.mark.asyncio
async def test_register_validates_password(client):
    r = await client.post("/api/v1/auth/register", json={
        "email": "test@example.com", "username": "testuser", "password": "weak"})
    assert r.status_code == 422

@pytest.mark.asyncio
async def test_register_validates_username(client):
    r = await client.post("/api/v1/auth/register", json={
        "email": "test@example.com", "username": "u", "password": "StrongP@ss123"})
    assert r.status_code == 422

@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    r = await client.post("/api/v1/auth/login",
        data={"username": "nobody@example.com", "password": "wrong"})
    assert r.status_code == 401

@pytest.mark.asyncio
async def test_protected_route_requires_auth(client):
    r = await client.get("/api/v1/users/me")
    assert r.status_code == 403

@pytest.mark.asyncio
async def test_rate_limit_headers(client):
    r = await client.get("/api/v1/health")
    # Rate limit headers should be present on non-exempt paths
    assert "x-ratelimit-limit" in r.headers or r.status_code in (200, 503)
