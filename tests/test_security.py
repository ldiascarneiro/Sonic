import os

import pytest
from fastapi.testclient import TestClient

from backend.main import create_app as create_api
from frontend.app import create_app


def test_api_auth_validation_and_hosts():
    client = TestClient(create_api())
    assert client.post('/v1/games', json={'mode': 'numbers'}).status_code == 401
    headers = {'X-API-Key': os.environ['API_KEY']}
    assert client.post('/v1/games', headers=headers, json={'mode': 'unknown'}).status_code == 422
    assert client.post('/v1/games', headers=headers, json={'mode': 'numbers', 'extra': 1}).status_code == 422
    assert client.post('/v1/games/answer', headers=headers, json={'token': 'forged', 'choice': '1'}).status_code == 400
    assert client.get('/health', headers={'Host': 'evil.example'}).status_code == 400
    assert client.get('/docs').status_code == 404
    for removed_mode in ('colors', 'shapes', 'mixed'):
        assert client.post('/v1/games', headers=headers, json={'mode': removed_mode}).status_code == 422


def test_frontend_csrf_headers_and_limits():
    client = create_app().test_client()
    assert client.get('/static/runner-core.mjs').mimetype == 'text/javascript'
    response = client.get('/')
    assert response.status_code == 200
    assert 'HttpOnly' in response.headers['Set-Cookie']
    assert 'SameSite=Lax' in response.headers['Set-Cookie']
    assert "frame-ancestors 'none'" in response.headers['Content-Security-Policy']
    assert response.headers['Cache-Control'] == 'no-store'
    assert client.post('/play', data={'mode': 'numbers'}).status_code == 400
    assert client.post('/play', data={'mode': 'numbers', 'csrf_token': 'forged'}).status_code == 400
    assert client.post('/play', data={'oversized': 'a' * 9000}).status_code == 413
    assert client.get('/', headers={'Host': 'evil.example'}).status_code == 400


def test_production_cookie_and_secrets(monkeypatch):
    monkeypatch.setenv('APP_ENV', 'production')
    response = create_app().test_client().get('/')
    assert 'Secure' in response.headers['Set-Cookie']
    assert response.headers['Strict-Transport-Security'] == 'max-age=31536000'
    monkeypatch.setenv('SECRET_KEY', '')
    with pytest.raises(RuntimeError):
        create_app()


def test_wildcard_host_rejected(monkeypatch):
    monkeypatch.setenv('FRONTEND_HOSTS', '*')
    with pytest.raises(RuntimeError):
        create_app()


def test_railway_health_hosts_and_no_player_session(monkeypatch):
    monkeypatch.setenv('APP_ENV', 'production')
    monkeypatch.setenv('FRONTEND_HOSTS', 'sonic.example,healthcheck.railway.app')
    monkeypatch.setenv('BACKEND_HOSTS', 'backend.railway.internal,healthcheck.railway.app')
    client = create_app().test_client()
    response = client.get('/health', base_url='https://healthcheck.railway.app')
    assert response.status_code == 200
    assert response.json == {'status': 'ok'}
    assert 'Set-Cookie' not in response.headers
    assert response.headers['Cache-Control'] == 'no-store'
    assert 'Content-Security-Policy' in response.headers
    assert client.get('/health', base_url='https://evil.example').status_code == 400
    assert client.post('/play', base_url='https://sonic.example', data={'mode': 'numbers'}).status_code == 400
    api = TestClient(create_api())
    assert api.get('/health', headers={'Host': 'healthcheck.railway.app'}).status_code == 200
    assert api.get('/health', headers={'Host': 'evil.example'}).status_code == 400
    assert api.post('/v1/games', headers={'Host': 'backend.railway.internal'}, json={'mode': 'numbers'}).status_code == 401
