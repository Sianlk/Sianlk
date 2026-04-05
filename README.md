# Sianlk Unified SaaS Platform

![Version](https://img.shields.io/badge/version-1.1.0-blue?style=flat-square)
![Deploy](https://img.shields.io/badge/DigitalOcean-$5%2Fmo-0080FF?style=flat-square&logo=digitalocean)
![CI](https://github.com/Sianlk/Sianlk/workflows/CI%2FCD%20%E2%80%94%20Build%2C%20Test%20%26%20Deploy/badge.svg)
![Tests](https://img.shields.io/badge/tests-11%2F11%20passing-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

> One backend. One container. One $5/month DigitalOcean instance. All 11 Sianlk apps.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  DigitalOcean App Platform — $5/mo (512 MB, 1 vCPU)        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FastAPI (backend/main.py)                          │   │
│  │  /api/auth    — JWT auth (all 11 apps)              │   │
│  │  /api/ai      — AI completions + agents             │   │
│  │  /api/payments — Stripe subscriptions               │   │
│  │  /api/analytics — Event ingestion                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌───────────────────────▼─────────────────────────────┐   │
│  │  PostgreSQL 16 (managed, free tier)                 │   │
│  │  users | subscriptions | ai_logs | analytics_events │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ▲                ▲               ▲
         │                │               │
   AIBLTY Health    GeniAI App    BuildQuote App
   (Expo/RN)        (Expo/RN)     (Expo/RN)
   ...and 8 more Sianlk apps
```

## Apps Served (one backend)

| App | Slug | Domain |
|-----|------|--------|
| AIBLTY Health | `aiblty` | Health & wellness AI |
| AIBLTY Code | `aibltycode` | AI developer tools |
| BuildQuote | `buildquote` | Construction quoting |
| CompProp Data | `comppropdata` | Real estate intelligence |
| GeniAI | `geniai` | AI platform |
| GeniQX | `geniqx` | Quantum AI |
| GitGit | `gitgit` | DevOps AI |
| Sianlk | `sianlk` | Platform hub |
| Terminal AI | `terminalai` | AI terminal |
| AI Aesthetics | `aiaesthetics` | Beauty & wellness |
| AIB Platform | `aib` | Business automation |

## Quick Start

### Local Development
```bash
# Clone
git clone https://github.com/Sianlk/Sianlk.git
cd Sianlk

# Start everything (API + PostgreSQL)
docker compose up

# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Run Tests
```bash
pip install -r requirements.txt pytest pytest-asyncio httpx aiosqlite
pytest tests/ -v
```

### Deploy to DigitalOcean ($5/mo)
```bash
# 1) Install doctl: https://docs.digitalocean.com/reference/doctl/
doctl auth init

# 2) Create app (first time)
doctl apps create --spec .do/app.yaml --wait

# 3) Set secrets in DO dashboard:
#    DATABASE_URL | SECRET_KEY | OPENAI_API_KEY | STRIPE_SECRET_KEY
#    STRIPE_WEBHOOK_SECRET | SENTRY_DSN

# After deploy: https://sianlk.com/health
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI |
| POST | `/api/auth/register` | Register (any app) |
| POST | `/api/auth/token` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/ai/complete` | AI completion |
| POST | `/api/ai/agent` | AI workforce agent |
| GET | `/api/payments/plans` | Subscription plans |
| POST | `/api/payments/checkout` | Stripe checkout |
| POST | `/api/payments/webhook` | Stripe webhook |
| POST | `/api/analytics/batch` | Analytics ingestion |

## Mobile Apps (Expo)

Each app in its own repo points to this backend:

```typescript
// In each app's src/config/ai.config.ts
export const API_BASE = "https://sianlk.com";  // or http://localhost:8000 for dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL async URL |
| `SECRET_KEY` | Yes | JWT signing key (64+ chars) |
| `OPENAI_API_KEY` | No | AI features (demo mode without) |
| `STRIPE_SECRET_KEY` | No | Payments (demo mode without) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook validation |
| `SENTRY_DSN` | No | Error monitoring |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |

## Subscription Plans

| Plan | Price | AI requests/day | Agents |
|------|-------|-----------------|--------|
| Free | $0 | 10 | No |
| Starter | $9.99/mo | 100 | Yes |
| Pro | $29.99/mo | Unlimited | Yes |
| Enterprise | $99.99/mo | Unlimited | Yes |

---
*Built by Sianlk — one backend to power them all.*
