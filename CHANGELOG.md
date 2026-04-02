# Changelog — Sianlk

All notable changes are documented here following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2025-07-15

### Added
- **Sianlk** initial production release — One Platform. Infinite Possibilities.
- FastAPI backend with JWT authentication, refresh tokens, and TOTP MFA
- OAuth2 social login (Google + Apple Sign-In)
- Role-based access control (user / provider / admin)
- Stripe payment integration with subscription management
- Real-time WebSocket push notifications
- GDPR compliance: consent tracking, data export, right to erasure
- PWA Service Worker with offline support and push notifications
- React Native mobile app with deep linking and biometric auth
- Prometheus metrics, OpenTelemetry tracing, structured JSON logs
- Redis caching layer with automatic invalidation
- Transactional email service (welcome, verification, password reset)
- Docker multi-arch images published to GHCR on every tag
- Kubernetes deployment manifests with HPA and PodDisruptionBudget
- Fastlane lanes for automated App Store + Google Play submission
- Branch protection, CODEOWNERS, Dependabot on all paths
- Security scan CI (Bandit, Safety, Trivy, Gitleaks) on every PR
- Grafana dashboard + Prometheus alert rules for production monitoring

### Security
- All passwords hashed with bcrypt (cost=12)
- JWTs signed with RS256 — private key stored in GitHub Secrets
- Rate limiting on auth endpoints (5 attempts / 15 min per IP)
- CORS restricted to known origins
- Secrets never committed — see `.github/SECRETS_SETUP.md`

---

## [Unreleased]

### Planned
- AI-powered analytics dashboard
- Multi-language i18n support (EN, ES, FR, AR, ZH)
- Native iOS Widgets and Android App Shortcuts
- End-to-end Detox mobile test suite
- Terraform IaC for GCP / AWS / Azure deployment
