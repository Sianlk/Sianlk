# Changelog

All notable changes to Sianlk are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-03

### Added
- **Authentication**: Email/password + TOTP MFA + Google Sign-In + Apple Sign In
- **Mobile App**: React Native (Expo) with full navigation and offline support
- **Backend API**: FastAPI with async PostgreSQL, Redis caching, JWT auth
- **Payments**: Stripe subscriptions with customer portal and webhook verification
- **Real-time**: WebSocket notifications and live data streaming
- **GDPR**: Data export (Art. 20), deletion (Art. 17), cookie consent
- **PWA**: Service Worker with offline cache and push notifications
- **Security**: Rate limiting, HSTS, CSP, COOP/COEP, CORS, Gitleaks scanning
- **Observability**: Prometheus metrics, OpenTelemetry tracing, structured logging
- **CI/CD**: GitHub Actions for backend CI, security scan, k6 load test, store publish
- **App Store**: Fastlane automation for iOS TestFlight and Google Play deployment
- **Infrastructure**: Docker Compose, nginx reverse proxy, Kubernetes manifests
- **Database**: Alembic migrations — users, tokens, plans, subscriptions, GDPR consents

[1.0.0]: https://github.com/Sianlk/Sianlk/releases/tag/v1.0.0
