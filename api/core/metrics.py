"""Prometheus metrics exposition for monitoring stack."""
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
import time, os

router = APIRouter()

# Simple in-process counters (use prometheus_client in production)
_metrics: dict = {
    "http_requests_total": 0,
    "http_errors_total": 0,
    "db_query_duration_seconds_sum": 0.0,
    "db_query_duration_seconds_count": 0,
    "active_websocket_connections": 0,
    "auth_login_attempts_total": 0,
    "auth_login_failures_total": 0,
}

def increment(key: str, value: float = 1.0):
    """Thread-safe-ish increment for process-local metrics."""
    _metrics[key] = _metrics.get(key, 0) + value

def set_gauge(key: str, value: float):
    _metrics[key] = value

@router.get("/metrics", response_class=PlainTextResponse, include_in_schema=False)
async def metrics():
    """Prometheus text format metrics endpoint. Restrict to internal network in production."""
    lines = [
        "# HELP http_requests_total Total HTTP requests",
        "# TYPE http_requests_total counter",
        f"http_requests_total {_metrics['http_requests_total']}",
        "# HELP http_errors_total Total HTTP errors (4xx+5xx)",
        "# TYPE http_errors_total counter",
        f"http_errors_total {_metrics['http_errors_total']}",
        "# HELP active_websocket_connections Current active WebSocket connections",
        "# TYPE active_websocket_connections gauge",
        f"active_websocket_connections {_metrics['active_websocket_connections']}",
        "# HELP auth_login_attempts_total Total login attempts",
        "# TYPE auth_login_attempts_total counter",
        f"auth_login_attempts_total {_metrics['auth_login_attempts_total']}",
        "# HELP auth_login_failures_total Total failed login attempts",
        "# TYPE auth_login_failures_total counter",
        f"auth_login_failures_total {_metrics['auth_login_failures_total']}",
        f"process_uptime_seconds {time.time()}",
    ]
    return "\n".join(lines) + "\n"
