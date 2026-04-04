# Production Dockerfile — Sianlk
# Multi-stage build for minimal attack surface

# ── Stage 1: Dependencies ─────────────────────────────────────────
FROM python:3.12-slim AS deps
WORKDIR /build
COPY requirements.txt .
RUN pip install --upgrade pip wheel && \
    pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# ── Stage 2: Production ───────────────────────────────────────────
FROM python:3.12-slim AS production

ARG APP_VERSION=1.1.0
ARG BUILD_TIME=unknown
LABEL maintainer="Sianlk <dev@sianlk.com>"
LABEL org.opencontainers.image.title="Sianlk"
LABEL org.opencontainers.image.description="Unified Sianlk AI platform"
LABEL org.opencontainers.image.version="${APP_VERSION}"
LABEL org.opencontainers.image.created="${BUILD_TIME}"
LABEL org.opencontainers.image.vendor="Sianlk"
LABEL org.opencontainers.image.url="https://sianlk.sianlk.com"
LABEL org.opencontainers.image.source="https://github.com/Sianlk/sianlk"

# Security: non-root user
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /bin/bash appuser

# Install wheels
COPY --from=deps /wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/* && rm -rf /wheels

WORKDIR /app

# Copy application
COPY --chown=appuser:appuser . .

# Remove dev files
RUN rm -rf tests/ .git/ .github/ node_modules/ *.md docs/

# Security: read-only filesystem prep
RUN mkdir -p /app/tmp /app/uploads && chown -R appuser:appuser /app
RUN chmod 755 /app && chmod 1777 /app/tmp

USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=4)"

# Security: prevent privilege escalation in entrypoint
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    APP_VERSION=${APP_VERSION} \
    ENVIRONMENT=production

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "2", "--loop", "uvloop", "--http", "h11", \
     "--access-log", "--proxy-headers", "--forwarded-allow-ips", "*"]
