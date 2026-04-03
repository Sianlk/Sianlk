# Required GitHub Secrets — Sianlk

Configure these at: `https://github.com/Sianlk/Sianlk/settings/secrets/actions`

## App / Mobile

| Secret | Description | Where to Get |
|--------|-------------|--------------|
| `EXPO_TOKEN` | Expo access token for EAS builds | https://expo.dev/accounts/sianlk/settings/access-tokens |

## iOS App Store

| Secret | Description | Where to Get |
|--------|-------------|--------------|
| `APPLE_DEV_PORTAL_ID` | Apple Developer account email | Apple Developer Console |
| `APPLE_ID` | iTunes Connect email | App Store Connect |
| `APPLE_TEAM_ID` | 10-char team ID | https://developer.apple.com/account |
| `APP_STORE_CONNECT_TEAM_ID` | ASC team ID | App Store Connect |
| `APP_STORE_CONNECT_API_KEY_ID` | API key ID | App Store Connect → Users → Keys |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Issuer ID | App Store Connect → Users → Keys |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | Private key (.p8 file contents) | App Store Connect → Users → Keys |

## Google Play

| Secret | Description | Where to Get |
|--------|-------------|--------------|
| `GOOGLE_PLAY_KEY_JSON` | Service account JSON | Google Play Console → Setup → API access |

## Backend

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `SECRET_KEY` | 64-char random string (`openssl rand -hex 32`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `SENTRY_DSN` | Sentry error tracking DSN |
| `SMTP_HOST` | Email SMTP host |
| `SMTP_USER` | Email SMTP username |
| `SMTP_PASS` | Email SMTP password |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |

## Container Registry

| Secret | Description |
|--------|-------------|
| `GHCR_PAT` | GitHub PAT with `write:packages` scope |

## Monitoring

| Secret | Description |
|--------|-------------|
| `GRAFANA_PASSWORD` | Grafana admin password |
| `SLACK_WEBHOOK_URL` | Slack webhook for CI notifications (optional) |

---

## Quick Start

```bash
# Generate a secure SECRET_KEY
openssl rand -hex 32

# Test your Stripe webhook locally
stripe listen --forward-to localhost:8000/api/payments/webhook

# Run all tests
make test

# Deploy to production
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker-compose.prod.yml exec api alembic upgrade head
```
