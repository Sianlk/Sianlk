"""Structured JSON logging configuration for production."""
import logging, json, sys, time, os
from datetime import datetime, timezone

class JSONFormatter(logging.Formatter):
    """Emit logs as structured JSON — compatible with Datadog, CloudWatch, GCP Logging."""
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        # Add extra fields
        for key, value in record.__dict__.items():
            if key not in ("args", "exc_info", "exc_text", "stack_info",
                           "created", "relativeCreated", "thread", "threadName",
                           "process", "processName", "msg", "levelname", "levelno",
                           "pathname", "filename", "module", "funcName", "lineno", "name"):
                log_data[key] = value
        return json.dumps(log_data, default=str)

def setup_logging(level: str = "INFO"):
    """Configure structured logging for the entire application."""
    log_level = getattr(logging, level.upper(), logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(log_level)
    # Quiet noisy libraries
    for noisy in ("uvicorn.access", "sqlalchemy.engine"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
