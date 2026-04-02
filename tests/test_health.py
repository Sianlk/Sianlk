"""
Health check and basic startup tests.
"""
import pytest


class TestHealthEndpoints:
    async def test_health_check(self, client):
        res = await client.get('/api/v1/health')
        assert res.status_code == 200
        data = res.json()
        assert data['status'] == 'ok'

    async def test_readiness(self, client):
        res = await client.get('/api/v1/health/ready')
        assert res.status_code in (200, 503)

    async def test_metrics_endpoint(self, client):
        res = await client.get('/metrics')
        assert res.status_code == 200
        assert b'http_requests_total' in res.content
