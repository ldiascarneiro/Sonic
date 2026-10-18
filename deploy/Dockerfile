FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    APP_ENV=production
WORKDIR /app
COPY requirements-lock.txt ./
RUN pip install --no-cache-dir -r requirements-lock.txt && pip check \
    && groupadd --gid 10001 app && useradd --uid 10001 --gid app --no-create-home app
COPY frontend ./frontend
COPY backend ./backend
COPY shared ./shared
USER 10001:10001
# O Railway substitui o comando por serviço; nunca inicia os dois juntos.
CMD ["sh", "-c", "exec python -m waitress --host=0.0.0.0 --port=${PORT:?PORT obrigatoria} --call frontend.app:create_app"]
