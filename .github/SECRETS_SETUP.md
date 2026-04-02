# GitHub Secrets Setup Guide

Go to each repo: **Settings → Secrets and variables → Actions → New repository secret**

## Required Secrets

### Core
| Secret | Value |
|--------|-------|
| `SECRET_KEY` | 64+ random chars: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@host:5432/db` |
| `REDIS_URL` | `redis://host:6379` |
| `SENTRY_DSN` | From sentry.io → Project → Settings → SDK Setup |
| `CODECOV_TOKEN` | From codecov.io → repo settings |

### Stripe
| Secret | Value |
|--------|-------|
| `STRIPE_SECRET_KEY` | From stripe.com → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | From stripe.com → Developers → Webhooks → endpoint secret |
| `STRIPE_PUBLISHABLE_KEY` | From stripe.com → Developers → API keys |

### iOS App Store
| Secret | Value |
|--------|-------|
| `APPLE_ID` | Your Apple ID email |
| `APPLE_TEAM_ID` | 10-char Team ID from developer.apple.com |
| `APP_STORE_CONNECT_API_KEY_ID` | From App Store Connect → Users → Keys |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Same page as above |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | Content of .p8 key file |
| `MATCH_PASSWORD` | Passphrase for Fastlane Match cert encryption |

### Google Play
| Secret | Value |
|--------|-------|
| `GOOGLE_PLAY_JSON_KEY` | Contents of service account JSON from Play Console |
| `ANDROID_KEYSTORE_BASE64` | `base64 < release.keystore` |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |

### OAuth (optional)
| Secret | Value |
|--------|-------|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console → OAuth 2.0 Client IDs |
| `GOOGLE_CLIENT_SECRET` | Same page |
| `APPLE_CLIENT_ID` | Service ID from developer.apple.com |

## Generate Secrets Quickly
```bash
# SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"

# Android keystore (one-time)
keytool -genkey -v -keystore release.keystore -alias app -keyalg RSA -keysize 2048 -validity 10000

# base64 encode keystore
base64 < release.keystore | tr -d "\n"
```
