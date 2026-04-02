"""
Auth endpoint tests.
"""
import pytest


class TestAuthEndpoints:
    async def test_register_new_user(self, client, test_user_data):
        res = await client.post('/api/v1/auth/register', json=test_user_data)
        assert res.status_code in (200, 201)
        data = res.json()
        assert 'access_token' in data
        assert data['token_type'] == 'bearer'

    async def test_register_duplicate_email(self, client, test_user_data):
        await client.post('/api/v1/auth/register', json=test_user_data)
        res = await client.post('/api/v1/auth/register', json=test_user_data)
        assert res.status_code == 400

    async def test_login_valid_credentials(self, client, test_user_data):
        await client.post('/api/v1/auth/register', json=test_user_data)
        res = await client.post('/api/v1/auth/login', data={
            'username': test_user_data['email'],
            'password': test_user_data['password'],
        })
        assert res.status_code == 200
        assert 'access_token' in res.json()

    async def test_login_wrong_password(self, client, test_user_data):
        await client.post('/api/v1/auth/register', json=test_user_data)
        res = await client.post('/api/v1/auth/login', data={
            'username': test_user_data['email'],
            'password': 'wrong_password',
        })
        assert res.status_code == 401

    async def test_get_current_user_authenticated(self, client, test_user_data):
        reg = await client.post('/api/v1/auth/register', json=test_user_data)
        token = reg.json()['access_token']
        res = await client.get('/api/v1/users/me', headers={'Authorization': f'Bearer {token}'})
        assert res.status_code == 200
        assert res.json()['email'] == test_user_data['email']

    async def test_get_current_user_unauthenticated(self, client):
        res = await client.get('/api/v1/users/me')
        assert res.status_code == 401
