import pytest


@pytest.fixture(autouse=True)
def configuration(monkeypatch):
    monkeypatch.setenv('APP_ENV', 'testing')
    for name in ('API_KEY', 'SECRET_KEY', 'GAME_SECRET'):
        monkeypatch.setenv(name, 'test-only-' + name + '-' * 40)
    monkeypatch.setenv('FRONTEND_HOSTS', 'localhost,127.0.0.1')
    monkeypatch.setenv('BACKEND_HOSTS', 'localhost,127.0.0.1,testserver')
