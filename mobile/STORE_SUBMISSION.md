# Sianlk — App Store & Play Store Submission Guide

## Prerequisites
1. Apple Developer Account ($99/yr) — https://developer.apple.com
2. Google Play Developer Account ($25 one-time) — https://play.google.com/console
3. Expo account (free) — https://expo.dev/signup
4. EAS CLI: `npm install -g eas-cli && eas login`

## Build & Submit (per app)

```bash
cd mobile/apps/<app-slug>
npm install

# Build for both stores
eas build --platform all --profile production

# Submit to App Store (requires Apple credentials)
eas submit --platform ios --profile production

# Submit to Google Play (requires google-service-account.json)
eas submit --platform android --profile production
```

## Before submitting each app:
1. Update `eas.json` → set your real `ascAppId` for iOS
2. Create `google-service-account.json` from Google Play Console
3. Replace placeholder app icons in `assets/` (1024x1024 PNG for iOS, 512x512 for Android)
4. Update `app.json` → `extra.eas.projectId` with your real EAS project ID

## App pricing (set up in respective store consoles):
| App | Bundle ID | Recommended Price |
|-----|-----------|------------------|
| GeniAI | com.sianlk.geniai | Free + $9.99/mo Pro |
| AI Aesthetics | com.sianlk.aiaesthetics | Free + $9.99/mo Pro |
| AIBLTY | com.sianlk.aiblty | Free + $4.99/mo Pro |
| AIBLTYCode | com.sianlk.aibltycode | Free + $14.99/mo Pro |
| BuildQuote | com.sianlk.buildquote | Free + $14.99/mo Pro |
| CompPropData | com.sianlk.comppropdata | Free + $24.99/mo Pro |
| GeniQX | com.sianlk.geniqx | Free + $34.99/mo Pro |
| GitGit | com.sianlk.gitgit | Free + $9.99/mo Pro |
| Sianlk Hub | com.sianlk.hub | Free + $4.99/mo Pro |
| TerminalAI | com.sianlk.terminalai | Free + $7.99/mo Pro |
| AIB | com.sianlk.aib | Free + $14.99/mo Pro |

All apps share the backend at: https://sianlk-unified-9w6jz.ondigitalocean.app
No extra infrastructure costs.
