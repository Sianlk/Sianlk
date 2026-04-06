from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./sianlk.db"

    # Auth
    secret_key: str = "dev-secret-change-in-production-64-chars-min"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 43200  # 30 days

    # AI
    openai_api_key: str = ""

    # Payments
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    # Cache
    redis_url: str = "redis://localhost:6379"

    # Monitoring
    sentry_dsn: str = ""

    # App
    environment: str = "development"
    cors_origins: str = "http://localhost:3000,http://localhost:8081"

    @property
    def allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    admin_email: str = ""
    model_config = {"env_file": ".env", "extra": "ignore"}

@lru_cache
def get_settings() -> Settings:
    return Settings()
