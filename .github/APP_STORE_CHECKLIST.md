# App Store & Play Store Submission Checklist

## Before Submitting

### iOS App Store
- [ ] Bundle ID matches `ios/Podfile` and Apple Developer Portal
- [ ] `ios/PrivacyInfo.xcprivacy` committed and linked in Xcode
- [ ] All `NSUsage*` permission strings set in Info.plist
- [ ] Universal Links: `/.well-known/apple-app-site-association` live
- [ ] `APPLE_TEAM_ID`, `APP_STORE_CONNECT_API_KEY_*` secrets added to GitHub
- [ ] Onboarding flow covers all app features (reviewers check this)
- [ ] Support URL live: `/support.html`
- [ ] Privacy Policy URL live: `/privacy.html`
- [ ] Age rating completed in App Store Connect
- [ ] Screenshots: 6.7", 6.1", 12.9" iPad sizes

### Google Play Store
- [ ] `android/app/build.gradle` signing config set (not debug keystore)
- [ ] `assetlinks.json` live at `/.well-known/assetlinks.json`
- [ ] Data safety section completed in Play Console
- [ ] `GOOGLE_PLAY_JSON_KEY` secret added to GitHub
- [ ] `ANDROID_KEYSTORE_*` secrets added to GitHub
- [ ] Feature graphic (1024×500) uploaded to Play Console
- [ ] Store listing localized to target markets

### Backend
- [ ] `SECRET_KEY` is 64+ random characters (not default)
- [ ] `DATABASE_URL` points to production PostgreSQL
- [ ] `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` set
- [ ] `SENTRY_DSN` set for error monitoring
- [ ] HTTPS enforced with valid TLS certificate
- [ ] Health check endpoint responds: `GET /api/v1/health`
- [ ] GDPR deletion endpoint works: `DELETE /api/v1/gdpr/data-delete`

## Publishing Commands
```bash
# iOS
fastlane ios beta       # TestFlight
fastlane ios release    # App Store

# Android
fastlane android beta   # Internal testing
fastlane android release # Production

# Or via git tag (triggers store-publish.yml)
git tag v1.0.0 && git push --tags
```
