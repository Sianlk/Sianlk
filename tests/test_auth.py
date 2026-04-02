"""Tests for auth endpoints."""
import pytest
import uuid


UNIQUE = uuid.uuid4().hex[:8]
TEST_EMAIL = f"test_{UNIQUE}@example.com"
TEST_PASSWORD = "TestPass123!"


@pytest.mark.asyncio
async def test_register_creates_user(client):
    resp = await client.post("/api/v1/auth/register", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "full_name": "Test User",
    })
    assert resp.status_code in (200, 201), resp.text


@pytest.mark.asyncio
async def test_register_duplicate_fails(client):
    """Second registration with same email should fail."""
    for _ in range(2):
        await client.post("/api/v1/auth/register", json={
            "email": f"dup_{UNIQUE}@example.com",
            "password": TEST_PASSWORD,
            "full_name": "Dup User",
        })
    resp = await client.post("/api/v1/auth/register", json={
        "email": f"dup_{UNIQUE}@example.com",
        "password": TEST_PASSWORD,
        "full_name": "Dup User",
    })
    assert resp.status_code in (400, 409, 422), resp.text


@pytest.mark.asyncio
async def test_login_returns_tokens(client):
    email = f"login_{UNIQUE}@example.com"
    await client.post("/api/v1/auth/register", json={
        "email": email, "password": TEST_PASSWORD, "full_name": "Login User"
    })
    resp = await client.post("/api/v1/auth/login",
        content=f"username={email}&password={TEST_PASSWORD}",
        headers={"Content-Type": "application/x-www-form-urlencoded"})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_get_me_requires_auth(client):
    resp = await client.get("/api/v1/users/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_me_with_token(client):
    email = f"me_{UNIQUE}@example.com"
    await client.post("/api/v1/auth/register", json={
        "email": email, "password": TEST_PASSWORD, "full_name": "Me User"
    })
    login = await client.post("/api/v1/auth/login",
        content=f"username={email}&password={TEST_PASSWORD}",
        headers={"Content-Type": "application/x-www-form-urlencoded"})
    token = login.json()["access_token"]
    resp = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == email


@pytest.mark.asyncio
async def test_password_too_short_rejected(client):
    resp = await client.post("/api/v1/auth/register", json={
        "email": f"short_{UNIQUE}@example.com",
        "password": "short",
        "full_name": "Short Pw"
    })
    assert resp.status_code == 422, resp.text
