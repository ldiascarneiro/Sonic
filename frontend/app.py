"""HTML renderizado no servidor; navegador nunca acessa diretamente a API."""
import os
import mimetypes
import secrets
from datetime import timedelta
from urllib.parse import urlparse

import httpx
from flask import Flask, abort, jsonify, redirect, render_template, request, session, url_for
from werkzeug.exceptions import SecurityError

from shared.catalog import MODES
from shared.config import hosts, production, secret


def create_app() -> Flask:
    # O registro do Windows pode classificar .mjs como texto, bloqueando módulos.
    mimetypes.add_type('text/javascript', '.mjs')
    app = Flask(__name__)
    is_production = production()
    app.config.update(
        SECRET_KEY=secret('SECRET_KEY'), SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax', SESSION_COOKIE_SECURE=is_production,
        PERMANENT_SESSION_LIFETIME=timedelta(minutes=30),
        MAX_CONTENT_LENGTH=8192, MAX_FORM_MEMORY_SIZE=8192, MAX_FORM_PARTS=10,
        TRUSTED_HOSTS=hosts('FRONTEND_HOSTS'),
    )
    api_key = secret('API_KEY')
    backend_url = os.getenv('BACKEND_URL', 'http://127.0.0.1:8000').rstrip('/')
    parsed = urlparse(backend_url)
    if parsed.scheme not in {'http', 'https'} or not parsed.hostname or parsed.username or parsed.password:
        raise RuntimeError('BACKEND_URL inválida.')

    def api(path: str, data: dict):
        try:
            with httpx.Client(timeout=5.0, trust_env=False) as client:
                response = client.post(backend_url + path, json=data, headers={'X-API-Key': api_key})
            if response.status_code == 400:
                session.pop('game', None)
                abort(409)
            response.raise_for_status()
            return response.json()
        except (httpx.HTTPError, ValueError):
            app.logger.warning('API indisponível; nenhuma informação de sessão registrada.')
            abort(503)

    @app.before_request
    def csrf_guard():
        # A sonda não cria nem renova uma sessão de jogador.
        if request.endpoint == 'health':
            return
        session.permanent = True
        if 'csrf' not in session:
            session['csrf'] = secrets.token_urlsafe(32)
        if request.method == 'POST':
            token = request.form.get('csrf_token', '')
            if not secrets.compare_digest(token, session['csrf']):
                abort(400)

    @app.after_request
    def secure_headers(response):
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; "
            "connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; "
            "frame-ancestors 'none'; form-action 'self'"
        )
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Referrer-Policy'] = 'no-referrer'
        response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=(), payment=()'
        if request.endpoint != 'static':
            response.headers['Cache-Control'] = 'no-store'
        if is_production:
            response.headers['Strict-Transport-Security'] = 'max-age=31536000'
        return response

    @app.get('/health')
    def health():
        # Saúde deste processo; a disponibilidade da API é verificada separadamente.
        return jsonify(status='ok')

    @app.get('/')
    def home():
        return render_template('home.html', modes={key: value for key, value in MODES.items() if key != 'mixed'})

    @app.post('/play')
    def start():
        mode = request.form.get('mode', '')
        if mode not in MODES:
            abort(400)
        session['game'] = api('/v1/games', {'mode': mode})
        return redirect(url_for('play'), code=303)

    @app.get('/play')
    def play():
        game = session.get('game')
        if not game:
            return redirect(url_for('home'))
        if game.get('curriculum') != 'preschool-v3':
            game = api('/v1/games', {'mode': game['mode']})
            session['game'] = game
        return render_template('complete.html' if game['complete'] else 'play.html', game=game)

    @app.post('/answer')
    def answer():
        game = session.get('game')
        if not game:
            return redirect(url_for('home'), code=303)
        # O token do formulário evita aplicar um envio antigo à próxima questão.
        if request.form.get('round_token') != game['token']:
            if request.accept_mimetypes.best == 'application/json':
                return jsonify(game=game, quiz_html=render_template('quiz.html', game=game))
            return redirect(url_for('play'), code=303)
        choice = request.form.get('choice', '')
        if choice not in {option['value'] for option in game['options']}:
            abort(400)
        session['game'] = api('/v1/games/answer', {'token': game['token'], 'choice': choice})
        if request.accept_mimetypes.best == 'application/json':
            return jsonify(game=session['game'], quiz_html=render_template('quiz.html', game=session['game']))
        return redirect(url_for('play'), code=303)

    @app.get('/adults')
    def adults():
        return render_template('adults.html')

    @app.get('/privacy')
    def privacy():
        return render_template('privacy.html')

    @app.errorhandler(400)
    @app.errorhandler(409)
    @app.errorhandler(413)
    @app.errorhandler(404)
    @app.errorhandler(503)
    def error(err):
        if isinstance(err, SecurityError):
            # Host inválido não tem adaptador de URLs; não renderizar templates.
            return 'Host não autorizado.', 400, {'Content-Type': 'text/plain; charset=utf-8'}
        messages = {503: 'A pista está descansando. Peça a um adulto para conferir se os dois servidores estão ligados.',
                    409: 'Esta aventura terminou de esperar. Vamos começar uma nova?',
                    404: 'Este caminho não existe. Vamos voltar?',
                    400: 'Vamos começar de novo pela página inicial?',
                    413: 'Esse pedido ficou grande demais. Vamos voltar?'}
        return render_template('error.html', message=messages[err.code]), err.code

    return app
