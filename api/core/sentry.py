"""Sentry APM + error tracking initialization."""
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from api.core.config import settings

def init_sentry():
    if settings.SENTRY_DSN and settings.ENVIRONMENT != "test":
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            environment=settings.ENVIRONMENT,
            release=settings.VERSION,
            traces_sample_rate=0.2,
            profiles_sample_rate=0.1,
            integrations=[
                FastApiIntegration(transaction_style="endpoint"),
                SqlalchemyIntegration(),
            ],
            before_send=_strip_pii,
        )

def _strip_pii(event, hint):
    """Remove PII from Sentry events before transmission."""
    if "request" in event:
        headers = event["request"].get("headers", {})
        for h in ["authorization", "cookie", "x-api-key"]:
            if h in headers:
                headers[h] = "[Filtered]"
    return event
