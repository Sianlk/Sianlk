"""Redis-backed sliding window rate limiter."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import time

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window = window_seconds
        self._store: dict = {}

    def _get_client_key(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")
        return f"rate:{ip}"

    async def dispatch(self, request: Request, call_next):
        if request.url.path in ("/api/v1/health", "/metrics"):
            return await call_next(request)
        key = self._get_client_key(request)
        now = time.time()
        window_start = now - self.window
        if key not in self._store:
            self._store[key] = []
        self._store[key] = [t for t in self._store[key] if t > window_start]
        if len(self._store[key]) >= self.max_requests:
            return JSONResponse(status_code=429,
                content={"error": "Rate limit exceeded", "retry_after": self.window},
                headers={"Retry-After": str(self.window), "X-RateLimit-Limit": str(self.max_requests)})
        self._store[key].append(now)
        response = await call_next(request)
        remaining = self.max_requests - len(self._store[key])
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
        return response
