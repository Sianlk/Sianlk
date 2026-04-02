"""
Redis caching utilities — async, with automatic JSON serialisation.
"""
from __future__ import annotations
import json, hashlib, functools, logging
from typing import Any, Callable, TypeVar, Awaitable
import redis.asyncio as redis
from api.core.config import settings

logger = logging.getLogger(__name__)
F = TypeVar("F", bound=Callable[..., Awaitable[Any]])
_pool: redis.ConnectionPool | None = None

def get_redis_pool() -> redis.ConnectionPool:
    global _pool
    if _pool is None:
        _pool = redis.ConnectionPool.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            max_connections=20,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
        )
    return _pool

async def get_cache() -> redis.Redis:
    return redis.Redis(connection_pool=get_redis_pool())

async def cache_get(key: str) -> Any | None:
    try:
        r = await get_cache()
        value = await r.get(key)
        return json.loads(value) if value else None
    except Exception as e:
        logger.warning("cache_get failed: %s", e)
        return None

async def cache_set(key: str, value: Any, ttl: int = 300) -> bool:
    try:
        r = await get_cache()
        await r.setex(key, ttl, json.dumps(value, default=str))
        return True
    except Exception as e:
        logger.warning("cache_set failed: %s", e)
        return False

async def cache_delete(key: str) -> bool:
    try:
        r = await get_cache()
        await r.delete(key)
        return True
    except Exception as e:
        logger.warning("cache_delete failed: %s", e)
        return False

async def cache_delete_pattern(pattern: str) -> int:
    try:
        r = await get_cache()
        keys = await r.keys(pattern)
        return await r.delete(*keys) if keys else 0
    except Exception as e:
        logger.warning("cache_delete_pattern failed: %s", e)
        return 0

def make_cache_key(*parts: Any) -> str:
    raw = ":".join(str(p) for p in parts)
    return hashlib.sha256(raw.encode()).hexdigest()[:32]

def cached(ttl: int = 300, key_prefix: str = ""):
    """Decorator: cache async function result in Redis."""
    def decorator(func: F) -> F:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            key = f"{key_prefix}:{func.__name__}:{make_cache_key(*args, *kwargs.values())}"
            hit = await cache_get(key)
            if hit is not None:
                return hit
            result = await func(*args, **kwargs)
            await cache_set(key, result, ttl)
            return result
        return wrapper  # type: ignore[return-value]
    return decorator

async def invalidate_user_cache(user_id: str) -> None:
    await cache_delete_pattern(f"*:{user_id}:*")
