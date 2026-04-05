"""
Sianlk Unified SaaS Backend
============================
Single FastAPI instance serving all 11 apps.
$5/month on DigitalOcean App Platform (512 MB RAM, 1 vCPU).

Apps served:
  aiblty | aibltycode | buildquote | comppropdata | geniai | geniqx
  gitgit | sianlk     | terminalai | aiaesthetics  | aib
"""
import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from backend.config import get_settings
from backend.database import init_db
from backend.routers import auth, ai, payments, analytics

settings = get_settings()

if settings.sentry_dsn:
    sentry_sdk.init(dsn=settings.sentry_dsn, traces_sample_rate=0.1)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="Sianlk Unified SaaS API",
    description="Single backend serving all Sianlk apps: AIBLTY, AIBLTYCode, BuildQuote, CompPropData, GeniAI, GeniQX, GitGit, Sianlk, TerminalAI, AI Aesthetics, AIB.",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(payments.router)
app.include_router(analytics.router)

# ── Core endpoints ─────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "version": "1.1.0", "service": "sianlk-unified"}

@app.get("/", tags=["system"])
async def root():
    return {
        "service": "Sianlk Unified SaaS API",
        "version": "1.1.0",
        "apps": [
            "aiblty", "aibltycode", "buildquote", "comppropdata",
            "geniai", "geniqx", "gitgit", "sianlk",
            "terminalai", "aiaesthetics", "aib",
        ],
        "docs": "/docs",
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "path": str(request.url.path)},
    )
