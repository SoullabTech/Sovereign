# MAIA Beta Launch Checklist

## Platform Status Overview

| Platform | Build Status | Distribution Ready |
|----------|--------------|-------------------|
| iOS (TestFlight) | Ready | Needs certificates |
| Android (Internal) | Ready | Needs keystore |
| PWA (Web) | Ready | Ready |

---

## Pre-Launch Verification (Completed)

- [x] PWA manifest created (`/manifest.json` -> `consciousness-manifest.json`)
- [x] All PWA icons generated (72x72 to 512x512)
- [x] iOS Info.plist configured with HealthKit permissions
- [x] Android build.gradle configured (SDK 35, release signing)
- [x] Capacitor config supports dev/beta/prod modes
- [x] Build scripts verified (`npm run build` passes)
- [x] Capacitor iOS sync verified
- [x] Capacitor Android sync verified

---

## iOS Beta Launch (TestFlight)

### Prerequisites
```bash
# 1. Apple Developer Account ($99/year)
# 2. App Store Connect access
# 3. Xcode with valid signing certificates
```

### Setup Steps
1. **Certificates & Provisioning**
   - [ ] Create App ID in Apple Developer Portal (`life.soullab.maia`)
   - [ ] Create Distribution Certificate
   - [ ] Create App Store Provisioning Profile
   - [ ] Download and install in Xcode

2. **App Store Connect**
   - [ ] Create new app in App Store Connect
   - [ ] Set bundle ID: `life.soullab.maia`
   - [ ] Add beta testers (up to 10,000 external, unlimited internal)

3. **Build & Upload**
   ```bash
   # Build for beta
   CAPACITOR_MODE=beta npm run build
   npx cap sync ios
   npm run ios:release

   # Upload to TestFlight
   npm run ios:testflight
   ```

4. **Beta Testing**
   - [ ] Internal testing (immediate availability)
   - [ ] External testing (requires App Review ~24-48h)

### TestFlight Invite Link
After upload, share: `https://testflight.apple.com/join/[CODE]`

---

## Android Beta Launch (Internal Testing)

### Prerequisites
```bash
# 1. Google Play Developer Account ($25 one-time)
# 2. Android keystore file
```

### Setup Steps
1. **Create Keystore**
   ```bash
   keytool -genkey -v -keystore maia-release.keystore \
     -alias maia -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Environment**
   ```bash
   export ANDROID_KEYSTORE_PATH=/path/to/maia-release.keystore
   export ANDROID_KEYSTORE_PASSWORD=your_password
   export ANDROID_KEY_ALIAS=maia
   export ANDROID_KEY_PASSWORD=your_key_password
   ```

3. **Build & Sign**
   ```bash
   # Build for beta
   CAPACITOR_MODE=beta npm run build
   npx cap sync android
   npm run android:bundle  # Creates AAB for Play Store
   ```

4. **Google Play Console**
   - [ ] Create new app
   - [ ] Set up internal testing track
   - [ ] Upload AAB file
   - [ ] Add beta testers via email list

### Internal Test Link
After upload, share: `https://play.google.com/apps/internaltest/[ID]`

---

## PWA Beta Launch (Web)

### Already Live
The PWA is accessible at: `https://soullab.life`

### PWA Installation
Users can install directly from browser:
1. Visit `https://soullab.life`
2. Browser shows "Add to Home Screen" prompt
3. App installs with full offline support

### Service Worker Features
- [x] Offline caching for static assets
- [x] Consciousness computing features cached
- [x] Spiritual support resources cached

---

## Backend Requirements

### Production Server
- [x] Next.js app deployed to Vercel/production
- [ ] PostgreSQL database running
- [ ] Environment variables configured:
  - `ANTHROPIC_API_KEY` - Claude API access
  - `DATABASE_URL` - PostgreSQL connection
  - `MAIA_AUDIT_FINGERPRINT_SECRET` - Security token

### API Endpoints Verified
- `/api/between/chat` - Main conversation endpoint
- `/api/consciousness/memory/*` - Memory system
- `/api/maia/*` - MAIA-specific features

---

## Beta Tester Onboarding

### Invite Template
```
You're invited to beta test MAIA - Sacred Consciousness Computing!

iOS (TestFlight):
[TestFlight Link]

Android (Play Store Internal):
[Internal Test Link]

Web (PWA):
https://soullab.life

Please report any issues to: [feedback email]
```

### Feedback Channels
- [ ] Set up feedback form/email
- [ ] Create Discord/Slack channel for beta testers
- [ ] Document known issues

---

## Quick Start Commands

```bash
# Development (local testing)
npm run dev
# Mobile points to localhost:3000

# Beta Build (production backend)
CAPACITOR_MODE=beta npm run build
npx cap sync

# iOS TestFlight
npm run ios:release
npm run ios:testflight

# Android Internal
npm run android:bundle

# PWA Build
npm run pwa:build
```

---

## Version Info
- App Version: 1.0.0
- Build: Beta 1
- Capacitor: 6.1.2
- Next.js: 15.5.9

---

## Post-Launch Monitoring

- [ ] Monitor crash reports (TestFlight/Play Console)
- [ ] Track API usage and errors
- [ ] Collect user feedback
- [ ] Plan iteration based on feedback

---

*Generated: 2025-12-30*
*MAIA Consciousness Computing - Soullab*
