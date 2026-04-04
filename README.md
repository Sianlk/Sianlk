# Sianlk — Unified Sianlk AI platform

![Version](https://img.shields.io/badge/version-1.1.0-blue?style=flat-square)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-1D4ED8.svg?style=flat-square)
![AI](https://img.shields.io/badge/AI-GPT--4o%20%7C%20Claude-%238B5CF6?style=flat-square)
![Deploy](https://img.shields.io/badge/deploy-DigitalOcean-0080FF?style=flat-square&logo=digitalocean)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
[![CI](https://github.com/Sianlk/sianlk/workflows/backend-ci/badge.svg)](https://github.com/Sianlk/sianlk/actions)

> **Unified Sianlk AI platform** — Built by [Sianlk](https://sianlk.com) using proprietary AI workforce technology.

## Features
`Platform Hub` `App Orchestrator` `User Intelligence` `AI Dashboard` `Unified Inbox`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo SDK 52, Expo Router v4 |
| AI Engine | GPT-4o, Claude 3.5 Sonnet, Custom embeddings |
| AI Workforce | Proprietary multi-agent orchestration |
| Backend | FastAPI 0.115, Python 3.12, PostgreSQL 16, Redis 7 |
| Infrastructure | DigitalOcean App Platform + Container Registry |
| Monitoring | Sentry, Prometheus, Grafana |
| CI/CD | GitHub Actions → DigitalOcean (auto-deploy on push) |

## Quick Start

```bash
# Mobile
npm install
npx expo start

# Backend  
pip install -r requirements.txt
uvicorn app.main:app --reload

# Deploy to DigitalOcean
doctl auth init
bash .do/deploy.sh
```

## DigitalOcean Deployment

This app is pre-configured for instant DigitalOcean App Platform deployment:

1. **Create DO account**: https://cloud.digitalocean.com
2. **Install doctl**: `brew install doctl` (macOS) or see [docs](https://docs.digitalocean.com/reference/doctl/)
3. **Authenticate**: `doctl auth init`
4. **Deploy**: `bash .do/deploy.sh`

Or import `.do/app.yaml` directly in the DigitalOcean console.

**Required Secrets** (set in DO App Platform dashboard):
- `DATABASE_URL` — PostgreSQL connection string
- `SECRET_KEY` — 64-char random string
- `OPENAI_API_KEY` — OpenAI API key
- `SENTRY_DSN` — Sentry project DSN

## API Documentation

Live API docs: `https://sianlk.sianlk.com/docs`

### Key Endpoints
```
GET  /health              — Health check
GET  /                    — Service info  
POST /api/ai/complete     — AI completion (domain: platform)
POST /api/ai/agent        — AI workforce agent task
WS   /ws/ai               — Real-time AI streaming
POST /api/analytics/batch — Analytics ingestion
POST /api/users/push-token — Push notification registration
```

## Architecture

```
Mobile (Expo Router)
  ├── app/(tabs)/index.tsx  — AI-powered home
  ├── app/(tabs)/ai.tsx     — AI Workforce agents
  ├── src/agents/           — AIWorkforceAgent
  ├── src/services/         — AI, Analytics, Notifications
  └── src/theme/            — Design system

Backend (FastAPI)
  ├── app/main.py           — Routes + WebSocket
  ├── alembic/              — DB migrations
  └── tests/                — pytest suite

Infrastructure
  ├── .do/app.yaml          — DO App Platform spec
  ├── .do/deploy.sh         — One-click deploy
  ├── k8s/                  — Kubernetes manifests
  ├── Dockerfile            — Production container
  └── docker-compose.yml    — Local development
```

## AI Workforce System

Sianlk uses proprietary AI workforce agents (created by Sianlk):

- **Analyst Agent** — Expert platform analysis with reasoning chains
- **Advisor Agent** — Strategic recommendations and forecasting
- **Automator Agent** — Autonomous task execution for platform workflows

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All contributions welcome!

## License

MIT © [Sianlk Ltd](https://sianlk.com)

---
*Sianlk is built by Sianlk — pioneer in AI-powered platform technology.*
