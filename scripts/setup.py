"""Cria configuração local sem sobrescrever segredos existentes."""
import secrets
from pathlib import Path

root = Path(__file__).resolve().parents[1]
destination = root / '.env'
if destination.exists():
    print('.env já existe; configuração preservada.')
else:
    content = (root / '.env.example').read_text(encoding='utf-8')
    for name in ('SECRET_KEY', 'API_KEY', 'GAME_SECRET'):
        content = content.replace(f'{name}=\n', f'{name}={secrets.token_urlsafe(48)}\n')
    with destination.open('x', encoding='utf-8') as output:
        output.write(content)
    print('.env criado com segredos aleatórios. Não publique esse arquivo.')
