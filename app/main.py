"""
Sianlk — FastAPI Backend
Domain: platform
AI Focus: platform orchestration, user intelligence, cross-app AI unification
Features: Platform Hub, App Orchestrator, User Intelligence, AI Dashboard, Unified Inbox
"""

from __future__ import annotations

import asyncio
import time
import uuid
from contextlib import asynccontextmanager
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
from starlette.requests import Request

# ── Metrics ──────────────────────────────────────────────────────────────────
REQUEST_COUNT   = Counter("http_requests_total",    "Total HTTP requests",  ["method", "endpoint", "status"])
REQUEST_LATENCY = Histogram("http_request_seconds", "HTTP request latency", ["endpoint"])
AI_REQUESTS     = Counter("ai_requests_total",      "AI completions",       ["model", "domain"])
WS_CONNECTIONS  = Counter("ws_connections_total",   "WebSocket connections",["endpoint"])

# ── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"[Sianlk] Starting up...")
    yield
    print(f"[Sianlk] Shutting down...")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Sianlk API",
    description="The unified Sianlk AI platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"])
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# ── Middleware: metrics + request ID ─────────────────────────────────────────
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start = time.time()
    response = await call_next(request)
    latency = time.time() - start
    endpoint = request.url.path
    REQUEST_COUNT.labels(request.method, endpoint, response.status_code).inc()
    REQUEST_LATENCY.labels(endpoint).observe(latency)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{latency:.3f}s"
    return response

# ── Models ────────────────────────────────────────────────────────────────────
class AIRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=4000)
    model: str = Field("gpt-4o-mini")
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    domain: str = Field("platform")
    context: dict[str, Any] = Field(default_factory=dict)

class AIResponse(BaseModel):
    request_id: str
    content: str
    model: str
    domain: str
    usage: dict[str, int]
    latency_ms: float

class AgentTaskRequest(BaseModel):
    task_type: str
    input: str
    context: dict[str, Any] = Field(default_factory=dict)

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    domain: str

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health():
    return HealthResponse(
        status="healthy",
        service="Sianlk",
        version="1.0.0",
        domain="platform",
    )

@app.get("/metrics", tags=["system"])
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/", tags=["system"])
async def root():
    return {
        "service": "Sianlk",
        "tagline": "The unified Sianlk AI platform",
        "domain": "platform",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "live",
    }

# ── AI Endpoints ──────────────────────────────────────────────────────────────
@app.post("/api/ai/complete", response_model=AIResponse, tags=["ai"])
async def ai_complete(request: AIRequest, req: Request):
    """Primary AI completion endpoint with domain context."""
    start = time.time()
    AI_REQUESTS.labels(request.model, request.domain).inc()

    # System prompt enriched with domain knowledge
    system_prompt = f"""You are an expert AI assistant for {request.domain}.
Focus area: platform orchestration, user intelligence, cross-app AI unification.
Tagline: The unified Sianlk AI platform.
Provide accurate, helpful, domain-specific responses."""

    # Forward to OpenAI (or your AI gateway)
    import os
    openai_key = os.getenv("OPENAI_API_KEY", "")
    if not openai_key:
        # Mock response for dev/testing without key
        content = f"[DEV MODE] Sianlk AI received: {request.prompt[:100]}"
        latency = (time.time() - start) * 1000
        return AIResponse(
            request_id=req.state.request_id,
            content=content,
            model=request.model,
            domain=request.domain,
            usage={"prompt_tokens": 50, "completion_tokens": 20, "total_tokens": 70},
            latency_ms=round(latency, 2),
        )

    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {openai_key}"},
            json={
                "model": request.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.prompt},
                ],
                "temperature": request.temperature,
            },
        )
        if res.status_code != 200:
            raise HTTPException(status_code=502, detail="AI provider error")
        data = res.json()

    latency = (time.time() - start) * 1000
    return AIResponse(
        request_id=req.state.request_id,
        content=data["choices"][0]["message"]["content"],
        model=data["model"],
        domain=request.domain,
        usage=data["usage"],
        latency_ms=round(latency, 2),
    )

@app.post("/api/ai/agent", tags=["ai"])
async def run_agent(task: AgentTaskRequest, req: Request):
    """Run an AI workforce agent task."""
    AI_REQUESTS.labels("gpt-4o", "platform").inc()
    return {
        "task_id": req.state.request_id,
        "task_type": task.task_type,
        "status": "queued",
        "domain": "platform",
        "estimated_completion_ms": 3000,
    }

@app.post("/api/analytics/batch", tags=["analytics"])
async def analytics_batch(payload: dict):
    """Receive batched analytics events."""
    events = payload.get("events", [])
    return {"received": len(events), "status": "ok"}

@app.post("/api/users/push-token", tags=["notifications"])
async def register_push_token(payload: dict):
    """Register device push token."""
    return {"status": "registered", "token": payload.get("token", "")[:20] + "..."}

# ── WebSocket ────────────────────────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, message: str):
        for ws in self.active:
            try: await ws.send_text(message)
            except: pass

manager = ConnectionManager()

@app.websocket("/ws/ai")
async def websocket_ai(websocket: WebSocket):
    """Real-time AI streaming over WebSocket."""
    WS_CONNECTIONS.labels("/ws/ai").inc()
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back with AI prefix (real impl would call OpenAI streaming)
            await websocket.send_text(f"[Sianlk AI] Processing: {data[:50]}")
            await asyncio.sleep(0.1)
            await websocket.send_text(f"[STREAM] Domain: platform | Response ready")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
