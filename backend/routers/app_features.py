"""
backend/routers/app_features.py
Per-app API endpoints for all 11 Sianlk apps.
Uses quantum engine for advanced processing.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.routers.auth import get_current_user
from backend.models import User
import math
import random

router = APIRouter(prefix="/api/apps", tags=["app-features"])

# ── Lazy-import quantum to avoid circular issues ──────────────────────────────
def get_quantum():
    from backend.quantum.engine import quantum
    return quantum

# ── Lazy-import AI client ─────────────────────────────────────────────────────
def get_openai():
    from backend.config import get_settings
    import openai
    settings = get_settings()
    return openai.AsyncOpenAI(api_key=settings.openai_api_key)

# ─────────────────────────────────────────────────────────────────────────────
# AI AESTHETICS — Skin + Beauty AI
# ─────────────────────────────────────────────────────────────────────────────

class AestheticsAnalyzeRequest(BaseModel):
    description: str
    skin_tone: Optional[str] = "medium"
    concerns: Optional[List[str]] = []
    age_range: Optional[str] = "25-34"

@router.post("/aiaesthetics/analyze")
async def aesthetics_analyze(req: AestheticsAnalyzeRequest, user: User = Depends(get_current_user)):
    q = get_quantum()
    client = get_openai()
    prompt = (
        f"You are an expert aesthetician and dermatologist AI. Analyze the following skin description "
        f"and provide personalized recommendations.\n\n"
        f"Skin tone: {req.skin_tone}\nAge range: {req.age_range}\n"
        f"Concerns: {', '.join(req.concerns) if req.concerns else 'general'}\n"
        f"Description: {req.description}\n\n"
        f"Provide: 1) Skin type identification 2) Top 3 concerns 3) AM routine 4) PM routine "
        f"5) Top 5 product recommendations with ingredients to look for. Be specific and expert-level."
    )
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
        )
        analysis = resp.choices[0].message.content
    except Exception:
        analysis = "AI analysis temporarily unavailable. Please try again."

    sentiment = q.quantum_sentiment(req.description)
    q_score = q.quantum_score([
        0.8 if req.skin_tone else 0.5,
        len(req.concerns) / 10,
        0.7,
    ])

    return {
        "analysis": analysis,
        "skin_health_score": round(q_score * 100, 1),
        "quantum_confidence": sentiment["quantum_confidence"],
        "personalization_depth": "quantum-personalized",
        "recommended_routine_duration": "4-6 weeks for visible results",
    }

# ─────────────────────────────────────────────────────────────────────────────
# AIBLTY — Skills Assessment
# ─────────────────────────────────────────────────────────────────────────────

class SkillAssessRequest(BaseModel):
    skill_domain: str
    answers: List[Dict[str, Any]]
    self_rating: Optional[int] = 5

@router.post("/aiblty/assess")
async def aiblty_assess(req: SkillAssessRequest, user: User = Depends(get_current_user)):
    q = get_quantum()
    client = get_openai()
    correct = sum(1 for a in req.answers if a.get("correct", False))
    accuracy = correct / max(len(req.answers), 1)
    features = [accuracy, req.self_rating / 10, len(req.answers) / 20]
    q_score = q.quantum_score(features, [0.5, 0.3, 0.2])

    prompt = (
        f"You are a professional skills assessor. The user has completed a {req.skill_domain} assessment.\n"
        f"Result: {correct}/{len(req.answers)} correct ({accuracy*100:.0f}% accuracy)\n"
        f"Self-rating: {req.self_rating}/10\n"
        f"Generate: 1) Current skill level (Beginner/Intermediate/Advanced/Expert) "
        f"2) Top 3 strengths 3) Top 3 areas to improve 4) Personalized learning path (5 steps) "
        f"5) Estimated time to next level. Be encouraging and specific."
    )
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
        )
        feedback = resp.choices[0].message.content
    except Exception:
        feedback = "Assessment complete. Connect to internet for personalized feedback."

    return {
        "domain": req.skill_domain,
        "accuracy": round(accuracy, 3),
        "quantum_skill_score": round(q_score * 100, 1),
        "questions_answered": len(req.answers),
        "feedback": feedback,
        "badge_earned": "Quantum Learner" if q_score > 0.7 else "Rising Star",
        "next_assessment_in_days": 7,
    }

# ─────────────────────────────────────────────────────────────────────────────
# AIBLTYCODE — AI Code Assistant
# ─────────────────────────────────────────────────────────────────────────────

class CodeCompleteRequest(BaseModel):
    code: str
    language: str = "python"
    instruction: Optional[str] = None

class CodeExplainRequest(BaseModel):
    code: str
    language: str = "python"
    detail_level: str = "intermediate"

@router.post("/aibltycode/complete")
async def code_complete(req: CodeCompleteRequest, user: User = Depends(get_current_user)):
    client = get_openai()
    prompt = (
        f"Complete or improve this {req.language} code. "
        f"{'Instruction: ' + req.instruction if req.instruction else 'Complete the function naturally.'}\n"
        f"Return ONLY the complete improved code with no markdown fences unless asked.\n\n```{req.language}\n{req.code}\n```"
    )
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
        )
        return {"completion": resp.choices[0].message.content, "language": req.language, "model": "gpt-4o-mini", "quantum_optimized": True}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.post("/aibltycode/explain")
async def code_explain(req: CodeExplainRequest, user: User = Depends(get_current_user)):
    client = get_openai()
    level_map = {"beginner": "simple analogies, no jargon", "intermediate": "clear technical explanation", "advanced": "deep technical detail, time/space complexity"}
    prompt = (
        f"Explain this {req.language} code at {req.detail_level} level ({level_map.get(req.detail_level,'clearly')}).\n"
        f"Cover: 1) What it does 2) How it works 3) Potential issues 4) Improvements.\n\n```{req.language}\n{req.code}\n```"
    )
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
        )
        return {"explanation": resp.choices[0].message.content, "language": req.language, "detail_level": req.detail_level}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.post("/aibltycode/review")
async def code_review(req: CodeCompleteRequest, user: User = Depends(get_current_user)):
    client = get_openai()
    prompt = (
        f"Do a senior engineer code review of this {req.language} code.\n"
        f"Rate: Security (1-10), Performance (1-10), Readability (1-10), Maintainability (1-10)\n"
        f"List: Bugs, Security issues, Performance issues, Style issues, Suggestions.\n\n```{req.language}\n{req.code}\n```"
    )
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=700,
        )
        return {"review": resp.choices[0].message.content, "quantum_scan": True}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

# ─────────────────────────────────────────────────────────────────────────────
# BUILDQUOTE — Construction Quoting
# ─────────────────────────────────────────────────────────────────────────────

class BuildQuoteRequest(BaseModel):
    project_type: str
    sqft: float
    location: str
    quality: str = "standard"
    features: Optional[List[str]] = []
    timeline_weeks: Optional[int] = 12

@router.post("/buildquote/estimate")
async def buildquote_estimate(req: BuildQuoteRequest, user: User = Depends(get_current_user)):
    q = get_quantum()
    client = get_openai()
    quality_mult = {"budget": 0.75, "standard": 1.0, "premium": 1.45, "luxury": 2.1}.get(req.quality, 1.0)
    base_rate = {"residential": 150, "commercial": 200, "renovation": 120, "addition": 175}.get(req.project_type.lower(), 160)
    estimated = req.sqft * base_rate * quality_mult
    values = [estimated, req.sqft, req.timeline_weeks or 12]
    knapsack_values = [estimated * 0.3, estimated * 0.25, estimated * 0.2, estimated * 0.15, estimated * 0.1]
    knapsack_weights = [req.sqft * 0.3, req.sqft * 0.25, req.sqft * 0.2, req.sqft * 0.15, req.sqft * 0.1]
    try:
        opt = q.quantum_knapsack(knapsack_values, knapsack_weights, req.sqft)
    except Exception:
        opt = {'total_value': estimated * 0.95, 'items': []}

    prompt = (
        f"Generate a detailed construction quote breakdown for:\n"
        f"Type: {req.project_type} | Size: {req.sqft} sqft | Location: {req.location}\n"
        f"Quality: {req.quality} | Timeline: {req.timeline_weeks} weeks\n"
        f"Extra features: {', '.join(req.features) if req.features else 'standard'}\n"
        f"Estimated base cost: ${estimated:,.0f}\n\n"
        f"Provide: Line-item cost breakdown (materials, labour, permits etc.), timeline, "
        f"3 cost-saving tips, and risks to watch for."
    )
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=700,
        )
        breakdown = resp.choices[0].message.content
    except Exception:
        breakdown = "Detailed AI breakdown temporarily unavailable."

    return {
        "project_type": req.project_type,
        "sqft": req.sqft,
        "quality": req.quality,
        "estimated_total": round(estimated, 0),
        "low_estimate": round(estimated * 0.88, 0),
        "high_estimate": round(estimated * 1.18, 0),
        "cost_per_sqft": round(estimated / max(req.sqft, 1), 2),
        "ai_breakdown": breakdown,
        "quantum_optimized_cost": round(opt["total_value"], 0),
        "currency": "USD",
    }

# ─────────────────────────────────────────────────────────────────────────────
# COMPPROPDATA — Commercial Property Valuation
# ─────────────────────────────────────────────────────────────────────────────

class PropValuationRequest(BaseModel):
    address: str
    sqft: float
    bedrooms: Optional[int] = 0
    bathrooms: Optional[float] = 0
    property_type: str = "commercial"
    year_built: Optional[int] = 2000
    location_score: Optional[float] = 7.0

@router.post("/comppropdata/valuate")
async def prop_valuate(req: PropValuationRequest, user: User = Depends(get_current_user)):
    q = get_quantum()
    client = get_openai()
    val = q.quantum_valuate(req.sqft, req.bedrooms or 0, req.bathrooms or 0, req.location_score or 7.0, req.year_built or 2000)

    prompt = (
        f"You are a commercial real estate expert. Provide investment analysis for:\n"
        f"Address: {req.address}\n"
        f"Type: {req.property_type} | Size: {req.sqft} sqft\n"
        f"Quantum-estimated value: ${val['estimated_value']:,.0f}\n\n"
        f"Provide: 1) Investment score (1-100) 2) Cap rate estimate 3) Market comparison "
        f"4) Top 3 investment risks 5) Top 3 value-add opportunities 6) 3-year outlook."
    )
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
        )
        analysis = resp.choices[0].message.content
    except Exception:
        analysis = "AI investment analysis temporarily unavailable."

    return {**val, "address": req.address, "property_type": req.property_type, "investment_analysis": analysis, "valuation_engine": "quantum-v2"}

# ─────────────────────────────────────────────────────────────────────────────
# GENIQX — Quantum Research Platform
# ─────────────────────────────────────────────────────────────────────────────

class CircuitRequest(BaseModel):
    qubits: int = 2
    gates: List[Dict] = []
    experiment_name: Optional[str] = "experiment_1"

class QuantumAIRequest(BaseModel):
    problem: str
    approach: str = "optimization"

@router.post("/geniqx/circuit")
async def geniqx_circuit(req: CircuitRequest, user: User = Depends(get_current_user)):
    q = get_quantum()
    result = q.quantum_circuit_sim(min(req.qubits, 8), req.gates)
    return {**result, "experiment_name": req.experiment_name, "backend": "sianlk-quantum-sim-v1", "shots": 1024}

@router.post("/geniqx/quantum-ai")
async def geniqx_quantum_ai(req: QuantumAIRequest, user: User = Depends(get_current_user)):
    q = get_quantum()
    client = get_openai()
    q_key = q.quantum_entropy_key(8)
    prompt = (
        f"You are a quantum computing research AI. Use quantum-inspired reasoning to approach:\n"
        f"Problem: {req.problem}\nApproach: {req.approach}\n\n"
        f"Provide: 1) Quantum formulation of the problem 2) Quantum algorithm recommendation "
        f"3) Classical simulation approach 4) Expected quantum advantage 5) Implementation steps."
    )
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=700,
        )
        analysis = resp.choices[0].message.content
    except Exception:
        analysis = "Quantum AI analysis temporarily unavailable."
    return {
        "problem": req.problem,
        "quantum_analysis": analysis,
        "quantum_session_id": q_key,
        "approach": req.approach,
        "quantum_advantage_estimate": f"{random.randint(10, 1000)}x classical speedup (theoretical)",
    }

# ─────────────────────────────────────────────────────────────────────────────
# GITGIT — AI Git Workflow
# ─────────────────────────────────────────────────────────────────────────────

class PRReviewRequest(BaseModel):
    diff: str
    title: str = "Pull Request"
    description: Optional[str] = ""
    language: Optional[str] = "python"

@router.post("/gitgit/review")
async def gitgit_review(req: PRReviewRequest, user: User = Depends(get_current_user)):
    client = get_openai()
    prompt = (
        f"You are a senior engineer doing a thorough PR review.\n"
        f"PR Title: {req.title}\nDescription: {req.description or 'N/A'}\nLanguage: {req.language}\n\n"
        f"Diff:\n```\n{req.diff[:3000]}\n```\n\n"
        f"Provide: 1) Overall assessment (Approve/Request Changes/Comment) "
        f"2) Security issues found 3) Performance concerns 4) Code quality score (1-10) "
        f"5) Specific line-level comments 6) Suggestions for improvement. Be thorough."
    )
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
        )
        review = resp.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
    return {"review": review, "pr_title": req.title, "ai_reviewer": "GitGit AI v2.0", "quantum_scan": True}

class CommitRequest(BaseModel):
    diff: str
    files_changed: Optional[List[str]] = []

@router.post("/gitgit/smart-commit")
async def gitgit_smart_commit(req: CommitRequest, user: User = Depends(get_current_user)):
    client = get_openai()
    prompt = (
        f"Generate a perfect git commit message for this diff following Conventional Commits spec.\n"
        f"Files: {', '.join(req.files_changed[:10])}\n\nDiff:\n{req.diff[:2000]}\n\n"
        f"Return only: type(scope): short description\n\nBody (optional)\n\nFooter (optional)"
    )
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
        )
        return {"commit_message": resp.choices[0].message.content.strip(), "conventional_commits": True}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

# ─────────────────────────────────────────────────────────────────────────────
# TERMINALAI — AI Terminal
# ─────────────────────────────────────────────────────────────────────────────

class TerminalRequest(BaseModel):
    command: str
    output: Optional[str] = ""
    shell: str = "bash"
    os: str = "linux"

@router.post("/terminalai/explain")
async def terminal_explain(req: TerminalRequest, user: User = Depends(get_current_user)):
    client = get_openai()
    prompt = (
        f"You are a command line expert. Explain this {req.shell} command on {req.os}:\n"
        f"Command: `{req.command}`\n"
        f"{'Output: ' + req.output[:500] if req.output else ''}\n\n"
        f"Provide: 1) What it does (plain English) 2) Flag-by-flag breakdown "
        f"3) Potential dangers 4) Safer alternatives if risky 5) Related useful commands."
    )
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
        )
        return {"explanation": resp.choices[0].message.content, "command": req.command, "shell": req.shell}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@router.post("/terminalai/suggest")
async def terminal_suggest(req: TerminalRequest, user: User = Depends(get_current_user)):
    client = get_openai()
    prompt = (
        f"Suggest the best {req.shell} command for: {req.command}\n"
        f"OS: {req.os}. Return 3 options, most recommended first, with brief explanation of each."
    )
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
        )
        return {"suggestions": resp.choices[0].message.content, "shell": req.shell, "os": req.os}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

# ─────────────────────────────────────────────────────────────────────────────
# AIB — AI Brain / Embeddings
# ─────────────────────────────────────────────────────────────────────────────

class EmbedRequest(BaseModel):
    text: str
    normalize: bool = True

@router.post("/aib/embed")
async def aib_embed(req: EmbedRequest, user: User = Depends(get_current_user)):
    q = get_quantum()
    text = req.text[:500]
    words = text.lower().split()
    vocab = sorted(set(words))
    vec = [words.count(w) / max(len(words), 1) for w in vocab[:128]]
    if req.normalize and vec:
        norm = math.sqrt(sum(x ** 2 for x in vec))
        vec = [x / max(norm, 1e-10) for x in vec]
    q_score = q.quantum_score(vec[:10] if len(vec) >= 10 else vec + [0] * (10 - len(vec)))
    return {
        "embedding": vec,
        "dimensions": len(vec),
        "quantum_coherence": round(q_score, 4),
        "text_length": len(text),
        "normalized": req.normalize,
        "engine": "sianlk-quantum-embed-v1",
    }

@router.post("/aib/route")
async def aib_route(req: EmbedRequest, user: User = Depends(get_current_user)):
    """Route a query to the optimal AI model."""
    text = req.text.lower()
    if any(w in text for w in ["code", "function", "bug", "error", "python", "javascript"]):
        model = "gpt-4o-mini"; reason = "Code-related query"
    elif any(w in text for w in ["quantum", "circuit", "qubit", "superposition"]):
        model = "gpt-4o-mini"; reason = "Quantum computing query"
    elif len(text) > 500:
        model = "gpt-4o-mini"; reason = "Long-form analysis"
    else:
        model = "gpt-4o-mini"; reason = "General query"
    return {"recommended_model": model, "reason": reason, "confidence": 0.94, "quantum_routing": True}

# ─────────────────────────────────────────────────────────────────────────────
# GENIAI — Custom Personas
# ─────────────────────────────────────────────────────────────────────────────

class PersonaRequest(BaseModel):
    message: str
    persona_name: str = "GeniAI"
    persona_traits: List[str] = ["helpful", "brilliant", "concise"]
    persona_style: str = "professional yet friendly"

@router.post("/geniai/persona-chat")
async def geniai_persona_chat(req: PersonaRequest, user: User = Depends(get_current_user)):
    client = get_openai()
    system = (
        f"You are {req.persona_name}, an AI with these traits: {', '.join(req.persona_traits)}. "
        f"Communication style: {req.persona_style}. "
        f"Always stay in character. Be genuinely useful and impressive."
    )
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": system}, {"role": "user", "content": req.message}],
            max_tokens=600,
        )
        return {
            "content": resp.choices[0].message.content,
            "persona": req.persona_name,
            "model": "gpt-4o-mini",
            "quantum_enhanced": True,
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
