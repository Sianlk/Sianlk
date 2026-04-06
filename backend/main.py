"""Sianlk Unified SaaS Backend v1.2.0 — Quantum Edition"""
import sentry_sdk
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from contextlib import asynccontextmanager
from backend.config import get_settings
from backend.database import init_db
from backend.routers import auth, ai, payments, analytics, admin
from backend.routers.app_features import router as app_features_router

settings = get_settings()
if settings.sentry_dsn:
    sentry_sdk.init(dsn=settings.sentry_dsn, traces_sample_rate=0.1)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="Sianlk Unified SaaS API",
    version="1.2.0",
    description="Powering 11 AI apps with quantum-inspired intelligence",
    docs_url="/docs", redoc_url="/redoc", lifespan=lifespan,
)
app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(payments.router)
app.include_router(analytics.router)
app.include_router(admin.router)
app.include_router(app_features_router)

@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "version": "1.2.0", "service": "sianlk-unified", "quantum": "active", "apps": 11}

@app.get("/", response_class=HTMLResponse, tags=["system"])
async def root():
    html_path = Path(__file__).parent / "dashboard.html"
    return HTMLResponse(content=html_path.read_text(encoding="utf-8"), status_code=200)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error", "path": str(request.url.path)})
