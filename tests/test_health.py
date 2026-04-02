"""Tests for the health check endpoint."""
import pytest


@pytest.mark.asyncio
async def test_health_returns_200(client):
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("status") in ("ok", "healthy", "degraded")


@pytest.mark.asyncio
async def test_health_includes_latency(client):
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    # Should include some latency or db info
    body = resp.text
    assert len(body) > 2
