# ── Build stage ────────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --upgrade pip --quiet \
 && pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt --quiet

# ── Production stage ────────────────────────────────────────────────────────
FROM python:3.12-slim AS production

LABEL maintainer="Sianlk <dev@sianlk.com>"
LABEL org.opencontainers.image.title="Sianlk Unified SaaS"
LABEL org.opencontainers.image.version="1.1.0"

# Non-root user
RUN groupadd -r app && useradd -r -g app -d /app app
WORKDIR /app

# Install from wheels (fast, no internet needed)
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/* \
 && rm -rf /wheels

# Copy application code
COPY --chown=app:app backend/ ./backend/
COPY --chown=app:app requirements.txt .

# Create data dir for SQLite
RUN mkdir -p /app/data && chown -R app:app /app

USER app

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=25s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=4)"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1

# Single worker — required for SQLite (no race conditions)
CMD ["uvicorn", "backend.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "1", \
     "--loop", "uvloop", \
     "--access-log"]
