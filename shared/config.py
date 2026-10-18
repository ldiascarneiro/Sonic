"""Configuração comum; nenhum segredo possui valor padrão."""
import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / '.env', override=False)


def secret(name: str) -> str:
    value = os.environ.get(name, '')
    if len(value) < 32:
        raise RuntimeError(f'{name} deve conter ao menos 32 caracteres. Execute scripts/setup.py.')
    return value


def production() -> bool:
    env = os.environ.get('APP_ENV', 'development')
    if env not in {'development', 'production', 'testing'}:
        raise RuntimeError('APP_ENV inválido.')
    return env == 'production'


def hosts(name: str) -> list[str]:
    values = [v.strip() for v in os.getenv(name, 'localhost,127.0.0.1').split(',') if v.strip()]
    if not values or any('*' in v for v in values):
        raise RuntimeError(f'{name} precisa listar hosts explícitos, sem curingas.')
    return values
