"""API privada consumida apenas pelo servidor Flask."""
import secrets
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException
from itsdangerous import BadSignature
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.trustedhost import TrustedHostMiddleware

from backend.game import Game, Mode
from shared.config import hosts, production, secret


def create_app() -> FastAPI:
    key = secret('API_KEY')
    game = Game(secret('GAME_SECRET'))
    app = FastAPI(title='Sonic · Aprender brincando', docs_url=None, redoc_url=None, openapi_url=None)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=hosts('BACKEND_HOSTS'))
    production()  # Valida o ambiente também no processo da API.

    def authenticate(x_api_key: Annotated[str | None, Header()] = None):
        if not secrets.compare_digest(x_api_key or '', key):
            raise HTTPException(401, 'Acesso não autorizado')

    @app.get('/health')
    def health():
        return {'status': 'ok'}

    @app.post('/v1/games', dependencies=[Depends(authenticate)])
    def start(payload: Start):
        return game.start(payload.mode)

    @app.post('/v1/games/answer', dependencies=[Depends(authenticate)])
    def answer(payload: Answer):
        try:
            return game.answer(payload.token, payload.choice)
        except BadSignature:
            raise HTTPException(400, 'A aventura expirou. Comece novamente.') from None

    return app


class Start(BaseModel):
    model_config = ConfigDict(extra='forbid')
    mode: Mode


class Answer(BaseModel):
    model_config = ConfigDict(extra='forbid')
    token: str = Field(min_length=1, max_length=2048)
    choice: str = Field(min_length=1, max_length=16)
