<div align="center">

<img src="assets/graphics/icon-1024.svg" width="120" alt="Sianlk Icon" />

# Sianlk

### One Platform. Infinite Possibilities.

[![CI](https://github.com/Sianlk/Sianlk/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Sianlk/Sianlk/actions/workflows/backend-ci.yml)
[![Security Scan](https://github.com/Sianlk/Sianlk/actions/workflows/security-scan.yml/badge.svg)](https://github.com/Sianlk/Sianlk/actions/workflows/security-scan.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-iOS%20|%20Android-lightgrey.svg)](https://sianlk.com)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React Native](https://img.shields.io/badge/mobile-React%20Native-61DAFB.svg)](https://reactnative.dev)

**AI, SaaS, business platform**

[Website](https://sianlk.com) · [Privacy Policy](https://sianlk.com/privacy) · [Support](https://sianlk.com/support)

</div>

---

## Overview

**Sianlk** — One Platform. Infinite Possibilities.

Built on a production-grade stack: FastAPI (Python 3.12) backend + React Native (Expo) mobile app, with full authentication, payments, observability, and App Store deployment pipelines.

## Features

- **AI-Powered Core** — Intelligent automation and recommendations tailored to AI
- **Secure Auth** — Email/password + TOTP MFA + Google Sign-In + Apple Sign In
- **Stripe Payments** — Subscription tiers with customer portal and webhook handling
- **Real-time** — WebSocket notifications and live data streaming
- **GDPR Compliant** — Data export, deletion, cookie consent (Articles 17 & 20)
- **PWA Ready** — Service Worker, offline support, installable web app
- **Observability** — Prometheus metrics, OpenTelemetry tracing, structured JSON logging
- **App Store Ready** — Fastlane automation for iOS TestFlight and Google Play deployment

## Tech Stack

| Layer       | Technology                                  |
|-------------|---------------------------------------------|
| Mobile      | React Native · Expo · TypeScript · Zustand  |
| Backend     | FastAPI · Python 3.12 · async SQLAlchemy    |
| Database    | PostgreSQL 16 · Alembic migrations          |
| Cache       | Redis 7                                     |
| Auth        | JWT · TOTP MFA · OAuth2 (Google + Apple)    |
| Payments    | Stripe Subscriptions + Webhooks             |
| Infra       | Docker · nginx · GitHub Actions CI/CD       |
| Monitoring  | Prometheus · OpenTelemetry · Sentry         |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Sianlk/Sianlk.git
cd Sianlk

# Backend
cp .env.example .env        # Fill in your secrets
docker compose up -d        # Starts API + PostgreSQL + Redis + nginx

# Run DB migrations
docker compose exec api alembic upgrade head

# Mobile
npm install
npx expo start
```

## Project Structure

```
Sianlk/
├── api/                    # FastAPI backend
│   ├── core/               # Config, DB, security, metrics, telemetry
│   ├── models/             # SQLAlchemy models
│   ├── routes/             # Auth, users, payments, GDPR, WebSocket
│   └── middleware/         # Security headers, rate limiting
├── src/                    # React Native app
│   ├── api/                # Typed fetch client with JWT refresh
│   ├── hooks/              # useAuth hook
│   ├── navigation/         # App, Auth, and Tab navigators
│   ├── screens/            # Login, Register, Home, Profile, Settings
│   └── store/              # Zustand auth store
├── fastlane/               # App Store & Google Play automation
│   ├── metadata/           # Store listing copy
│   └── screenshots/        # Store screenshots (SVG)
├── assets/                 # Branding: icons, splash, feature graphic
├── public/                 # PWA: favicon, manifest, service worker
├── tests/                  # pytest async test suite
├── alembic/                # Database migrations
├── k8s/                    # Kubernetes manifests
├── .github/                # CI/CD workflows, SECRETS_SETUP.md
└── docker-compose.yml
```

## App Store Deployment

```bash
# iOS — Upload to TestFlight
fastlane ios beta

# Android — Upload to Google Play Internal Testing
fastlane android beta
```

See `.github/APP_STORE_CHECKLIST.md` for pre-submission requirements and `.github/SECRETS_SETUP.md` for required secrets.

## Security

- Stripe webhook signatures verified (HMAC-SHA256)
- JWT tokens with short expiry + refresh rotation
- bcrypt password hashing
- Rate limiting (100 req/60s sliding window)
- Security headers: CSP, HSTS, X-Frame-Options, COOP, COEP
- Weekly Bandit SAST, Safety CVE, Trivy container scan, Gitleaks

## License

MIT — see [LICENSE](LICENSE)

---

<div align="center">
Built with ❤️ by <a href="https://sianlk.com">Sianlk</a>
</div>
