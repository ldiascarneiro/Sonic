"""Sobe os dois processos, apenas em loopback, e encerra ambos com Ctrl+C."""
import os
import socket
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from shared.config import production, secret  # noqa: E402


def main():
    if production():
        raise SystemExit('Este iniciador é somente local. Consulte docs/DEPLOYMENT.md.')
    for name in ('SECRET_KEY', 'API_KEY', 'GAME_SECRET'):
        secret(name)
    for port in (5000, 8000):
        with socket.socket() as sock:
            try:
                sock.bind(('127.0.0.1', port))
            except OSError:
                raise SystemExit(f'Porta {port} ocupada. Encerre o processo que a utiliza.') from None
    children = []
    try:
        for command in (
            ['-m', 'uvicorn', 'backend.main:create_app', '--factory', '--host', '127.0.0.1', '--port', '8000', '--no-access-log'],
            ['-m', 'waitress', '--host=127.0.0.1', '--port=5000', '--call', 'frontend.app:create_app'],
        ):
            children.append(subprocess.Popen([sys.executable, *command], cwd=ROOT, env=os.environ.copy()))
        print('Abra http://127.0.0.1:5000 — Ctrl+C encerra os dois servidores.', flush=True)
        while all(child.poll() is None for child in children):
            time.sleep(0.5)
        raise SystemExit('Um dos servidores parou; encerrando o outro.')
    except KeyboardInterrupt:
        print('\nEncerrando a aventura.')
    finally:
        for child in children:
            if child.poll() is None:
                child.terminate()
        for child in children:
            try:
                child.wait(timeout=5)
            except subprocess.TimeoutExpired:
                child.kill()
                child.wait()


if __name__ == '__main__':
    main()
