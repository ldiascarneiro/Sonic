import os

import httpx
import pytest
from fastapi.testclient import TestClient

from backend.game import Game
from backend.main import create_app as create_api
from frontend.app import create_app
from test_game import correct_choice


@pytest.mark.parametrize('mode', ['numbers', 'colors', 'shapes', 'mixed'])
def test_browser_to_frontend_to_backend_flow(monkeypatch, mode):
    api_client = TestClient(create_api())

    class Bridge:
        def __init__(self, **kwargs):
            pass
        def __enter__(self):
            return self
        def __exit__(self, *args):
            pass
        def post(self, url, **kwargs):
            return api_client.post(httpx.URL(url).raw_path.decode(), **kwargs)

    monkeypatch.setattr('frontend.app.httpx.Client', Bridge)
    client = create_app().test_client()
    assert client.get('/').status_code == 200
    with client.session_transaction() as session:
        csrf = session['csrf']
    response = client.post('/play', data={'mode': mode, 'csrf_token': csrf}, follow_redirects=True)
    assert response.status_code == 200
    if mode == 'numbers':
        assert b'number-choice' in response.data
    # Uma sessão anterior é reiniciada ao abrir a pista com o conteúdo infantil.
    with client.session_transaction() as session:
        previous = dict(session['game'])
        previous.pop('curriculum')
        session['game'] = previous
    assert client.get('/play').status_code == 200
    with client.session_transaction() as session:
        assert session['game']['curriculum'] == 'preschool-v3'
        assert session['game']['step'] == 0
    game = Game(os.environ['GAME_SECRET'])
    for step in range(5):
        with client.session_transaction() as session:
            current = session['game']
        payload = {'csrf_token': csrf, 'round_token': current['token'], 'choice': correct_choice(game, current)}
        response = client.post('/answer', data=payload, headers={'Accept': 'application/json'})
        assert response.status_code == 200
        assert response.json['game']['step'] == step + 1
        assert 'quiz_html' in response.json
        with client.session_transaction() as session:
            assert session['game']['step'] == step + 1
        # Repetir o formulário anterior não avança a próxima questão.
        repeated = client.post('/answer', data=payload, headers={'Accept': 'application/json'})
        assert repeated.json['game']['step'] == step + 1
        with client.session_transaction() as session:
            assert session['game']['step'] == step + 1
    assert response.json['game']['complete']


def test_backend_failure_is_friendly(monkeypatch):
    def unavailable(*args, **kwargs):
        raise httpx.ConnectError('offline')
    monkeypatch.setattr('frontend.app.httpx.Client.post', unavailable)
    client = create_app().test_client()
    client.get('/')
    with client.session_transaction() as session:
        csrf = session['csrf']
    response = client.post('/play', data={'mode': 'numbers', 'csrf_token': csrf})
    assert response.status_code == 503
    assert b'Traceback' not in response.data
