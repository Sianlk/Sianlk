from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from pydantic import BaseModel
from typing import Optional, AsyncGenerator
from datetime import datetime, timezone, timedelta
import openai, json, time
from backend.config import get_settings
from backend.database import get_db
from backend.models import User, AILog
from backend.auth import get_current_user

settings = get_settings()
router = APIRouter(prefix="/api/ai", tags=["ai"])

# Per-plan daily limits
PLAN_LIMITS = {"free": 10, "starter": 100, "pro": -1, "enterprise": -1}

# Per-app system prompts
APP_PROMPTS = {
    "aiblty":        "You are an expert AI health assistant. Provide evidence-based health guidance.",
    "aibltycode":    "You are an expert AI coding assistant. Help with code, debugging, and architecture.",
    "buildquote":    "You are an expert AI construction estimator. Help with quotes, materials, and timelines.",
    "comppropdata":  "You are an expert AI real estate analyst. Provide market insights and valuations.",
    "geniai":        "You are GeniAI, a powerful multi-modal AI assistant.",
    "geniqx":        "You are an expert AI quantum computing assistant. Explain quantum concepts and circuits.",
    "gitgit":        "You are an expert AI DevOps and git workflow assistant.",
    "sianlk":        "You are an expert AI platform assistant for Sianlk.",
    "terminalai":    "You are an expert AI terminal and DevOps assistant.",
    "aiaesthetics":  "You are an expert AI beauty and wellness advisor.",
    "aib":           "You are an expert AI business automation consultant.",
}

class CompletionRequest(BaseModel):
    message: str
    app_slug: str = "sianlk"
    model: str = "gpt-4o-mini"
    stream: bool = False
    context: Optional[list[dict]] = None

class AgentRequest(BaseModel):
    task: str
    app_slug: str = "sianlk"
    agent_type: str = "analyst"

async def check_rate_limit(user: User, db: AsyncSession) -> bool:
    limit = PLAN_LIMITS.get(user.plan, 10)
    if limit == -1:
        return True
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(func.count(AILog.id)).where(
            AILog.user_id == user.id,
            AILog.created_at >= today_start,
        )
    )
    count = result.scalar() or 0
    return count < limit

@router.post("/complete")
async def complete(
    req: CompletionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not await check_rate_limit(current_user, db):
        raise HTTPException(status_code=429, detail="Daily AI request limit reached. Upgrade your plan.")
    if not settings.openai_api_key:
        return {"content": f"[Demo mode] AI response for: {req.message[:100]}", "model": req.model}

    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    system_prompt = APP_PROMPTS.get(req.app_slug, APP_PROMPTS["sianlk"])
    messages = [{"role": "system", "content": system_prompt}]
    if req.context:
        messages.extend(req.context[-10:])  # last 10 messages for context
    messages.append({"role": "user", "content": req.message})

    t0 = time.monotonic()
    if req.stream:
        async def generate() -> AsyncGenerator[str, None]:
            async with client.chat.completions.stream(model=req.model, messages=messages, max_tokens=2048) as stream:
                async for chunk in stream:
                    delta = chunk.choices[0].delta.content if chunk.choices else None
                    if delta:
                        yield f"data: {json.dumps({'content': delta})}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(generate(), media_type="text/event-stream")

    try:
        resp = await client.chat.completions.create(model=req.model, messages=messages, max_tokens=2048)
    except openai.RateLimitError as e:
        raise HTTPException(status_code=429, detail=f"OpenAI quota/rate limit: {str(e)}")
    except openai.AuthenticationError as e:
        raise HTTPException(status_code=401, detail=f"OpenAI authentication failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenAI request failed: {str(e)}")

    content = resp.choices[0].message.content
    duration_ms = int((time.monotonic() - t0) * 1000)
    log = AILog(
        user_id=current_user.id, app_slug=req.app_slug, model=req.model,
        prompt_tokens=resp.usage.prompt_tokens,
        completion_tokens=resp.usage.completion_tokens,
        duration_ms=duration_ms,
    )
    db.add(log)
    return {"content": content, "model": req.model, "duration_ms": duration_ms}

@router.post("/agent")
async def run_agent(
    req: AgentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not await check_rate_limit(current_user, db):
        raise HTTPException(status_code=429, detail="Daily AI limit reached.")
    if not settings.openai_api_key:
        return {"result": f"[Demo] Agent ({req.agent_type}) task: {req.task[:80]}", "steps": 1}

    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    agent_personas = {
        "analyst":   f"You are an expert {req.app_slug} Analyst. Analyse thoroughly with structured output.",
        "advisor":   f"You are an expert {req.app_slug} Advisor. Provide strategic, actionable recommendations.",
        "automator": f"You are an expert {req.app_slug} Automator. Create executable step-by-step plans.",
    }
    system = agent_personas.get(req.agent_type, agent_personas["analyst"])
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini", max_tokens=1024,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": req.task}]
        )
    except openai.RateLimitError as e:
        raise HTTPException(status_code=429, detail=f"OpenAI quota/rate limit: {str(e)}")
    except openai.AuthenticationError as e:
        raise HTTPException(status_code=401, detail=f"OpenAI authentication failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenAI request failed: {str(e)}")

    result = resp.choices[0].message.content
    log = AILog(user_id=current_user.id, app_slug=req.app_slug, model="gpt-4o-mini",
                prompt_tokens=resp.usage.prompt_tokens, completion_tokens=resp.usage.completion_tokens)
    db.add(log)
    return {"result": result, "agent_type": req.agent_type, "steps": 1}
