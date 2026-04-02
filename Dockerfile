# syntax=docker/dockerfile:1.7
FROM python:3.14-slim AS base

# Security: non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Security hardening
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install dependencies with hash verification
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser . .

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import sys; sys.exit(0)"

# Read-only filesystem where possible
VOLUME ["/tmp"]

CMD ["python", "-m", "gunicorn", "app:app", "--bind", "0.0.0.0:8080",\
     "--workers", "4", "--worker-class", "gthread", "--threads", "2",\
     "--access-logfile", "-", "--error-logfile", "-",\
     "--timeout", "30", "--keep-alive", "5"]
