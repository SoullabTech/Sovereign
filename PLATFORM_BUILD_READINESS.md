# Platform Build Readiness — iOS, Android, PWA

**Date:** December 14, 2025
**Target Platforms:** iOS App Store, Google Play Store, Progressive Web App

---

## ✅ Current Status Overview

### iOS App
- ✅ Capacitor configured (`capacitor.config.ts`)
- ✅ App ID: `life.soullab.maia`
- ✅ Info.plist exists
- ✅ Multiple archive builds present
- ⚠️ Version number needs verification
- ✅ Build script: `npm run consciousness:ios`

### Android App
- ✅ Capacitor configured
- ✅ App ID: `life.soullab.maia`
- ✅ build.gradle exists
- ✅ Version: 1.0 (versionCode: 1)
- ✅ Build script: `bash scripts/build-android.sh`
- ✅ Debug/release builds supported

### Progressive Web App (PWA)
- ✅ Manifest configured (`public/manifest.json`)
- ✅ Service worker exists (`public/sw.js`)
- ✅ All required icons present (72px - 512px)
- ✅ Apple splash screens present
- ❌ **MISSING:** Screenshots for app stores
- ✅ Build script: `npm run consciousness:pwa`

---

## 📋 Pre-Launch Checklist

### 1. Environment & Dependencies

```bash
# Verify all required tools
node --version           # Should be >= 18
npm --version            # Should be >= 10
npx cap --version        # Capacitor CLI

# iOS specific
xcodebuild -version      # Xcode
pod --version            # CocoaPods

# Android specific
$JAVA_HOME/bin/java -version     # Java 21
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --version
```

**Action Items:**
- [ ] Verify Node.js 18+ installed
- [ ] Verify Xcode latest stable
- [ ] Verify Android SDK tools
- [ ] Verify Java 21 (for Android)

---

### 2. Version Numbers & Metadata

**iOS (Info.plist):**
```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

**Android (build.gradle):**
```gradle
versionCode 1
versionName "1.0.0"
```

**Action Items:**
- [x] Android version set to 1.0 (versionCode: 1)
- [ ] iOS version needs explicit setting
- [ ] Sync version numbers across all platforms
- [ ] Document version bump strategy

---

### 3. App Store Assets

#### PWA Screenshots (MISSING - HIGH PRIORITY)

The manifest references 4 screenshots that don't exist:

```json
"screenshots": [
  "/screenshots/consciousness-matrix.png",      // 1080x1920
  "/screenshots/nested-windows.png",            // 1080x1920
  "/screenshots/spiritual-support.png",         // 1080x1920
  "/screenshots/platonic-patterns.png"          // 1080x1920
]
```

**Action Items:**
- [ ] Create `public/screenshots/` directory
- [ ] Generate consciousness-matrix.png (1080x1920)
- [ ] Generate nested-windows.png (1080x1920)
- [ ] Generate spiritual-support.png (1080x1920)
- [ ] Generate platonic-patterns.png (1080x1920)

**Screenshot Generation Script:**
```bash
# Create screenshots directory
mkdir -p public/screenshots

# Option 1: Take real app screenshots
npm run dev
# Navigate to each feature and use browser dev tools to take 1080x1920 screenshots

# Option 2: Use automated screenshot tool
npx playwright test --headed  # If playwright tests exist
```

#### iOS App Store Assets
- [ ] App icon (1024x1024)
- [ ] 6.7" Display screenshots (1290x2796) - minimum 3
- [ ] 5.5" Display screenshots (1242x2208) - minimum 3
- [ ] App preview video (optional but recommended)
- [ ] App description (max 4000 characters)
- [ ] Keywords (max 100 characters)
- [ ] Support URL
- [ ] Privacy policy URL

#### Google Play Store Assets
- [ ] Feature graphic (1024x500)
- [ ] Phone screenshots (minimum 2, max 8)
- [ ] 7" tablet screenshots (minimum 1, optional)
- [ ] 10" tablet screenshots (minimum 1, optional)
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] Privacy policy URL

---

### 4. API Keys & Environment Variables

**Required for production:**

```bash
# Database
DATABASE_URL=postgresql://...
POSTGRES_PASSWORD=<ROTATED_PASSWORD>  # Must rotate from committed value

# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Feature flags
NEXT_PUBLIC_CONSCIOUSNESS_PWA=true
MAIA_SAFE_MODE=false
```

**Action Items:**
- [ ] Create `.env.production` template
- [ ] Document all required environment variables
- [ ] Set up environment variables in deployment platforms
- [ ] **CRITICAL:** Rotate database password (currently exposed in git history)

---

### 5. Build Commands Reference

#### PWA Build
```bash
# Production PWA build
npm run consciousness:pwa

# With icon generation
npm run pwa:consciousness

# Verify output
ls -la out/
```

#### iOS Build
```bash
# Sync Capacitor
npm run consciousness:sync

# Build iOS app
npm run consciousness:ios

# Or manual:
npx cap sync ios
npx cap open ios
# Then build in Xcode
```

#### Android Build
```bash
# Debug build
npm run android:build

# Release build
npm run android:release

# Or using script directly:
bash scripts/build-android.sh release
```

---

### 6. Testing Checklist

**PWA Testing:**
- [ ] Install PWA on desktop (Chrome/Edge)
- [ ] Install PWA on mobile (Chrome, Safari)
- [ ] Verify offline functionality
- [ ] Test service worker updates
- [ ] Verify all icons load correctly
- [ ] Test manifest shortcuts
- [ ] Verify share target works

**iOS Testing:**
- [ ] Test on iPhone simulator (multiple sizes)
- [ ] Test on physical iPhone (via TestFlight)
- [ ] Verify all Capacitor plugins work
- [ ] Test HealthKit permissions (if applicable)
- [ ] Test local notifications
- [ ] Verify deep links
- [ ] Test background modes

**Android Testing:**
- [ ] Test on Android emulator (multiple sizes)
- [ ] Test on physical device
- [ ] Verify all Capacitor plugins work
- [ ] Test permissions (notifications, storage)
- [ ] Verify deep links
- [ ] Test background services

---

### 7. Security & Privacy

**Privacy Policy Requirements:**
- [ ] Create comprehensive privacy policy
- [ ] Host at public URL
- [ ] Include in app submissions
- [ ] Update manifest with privacy policy URL

**Data Collection Disclosure:**
Must disclose if collecting:
- ✅ Health data (HealthKit integration)
- ✅ User content (conversation history)
- ✅ Analytics data
- ✅ Device identifiers

**Action Items:**
- [ ] Create privacy policy document
- [ ] Add privacy policy to website
- [ ] Update App Store/Play Store submissions with data usage details
- [ ] Implement consent screens for sensitive permissions

---

### 8. Code Signing & Certificates

**iOS:**
- [ ] Apple Developer Account active
- [ ] Distribution certificate valid
- [ ] Provisioning profiles created
- [ ] App ID registered: `life.soullab.maia`
- [ ] Enable required capabilities:
  - [ ] HealthKit
  - [ ] Push Notifications
  - [ ] Background Modes

**Android:**
- [ ] Keystore generated for release signing
- [ ] Keystore backup secured
- [ ] Keystore credentials documented (securely)

```bash
# Generate Android keystore (if not exists)
keytool -genkey -v -keystore maia-release.keystore \
  -alias maia-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

---

### 9. App Store Submission Preparation

**iOS App Store Connect:**
1. [ ] Create app record in App Store Connect
2. [ ] Upload app icon (1024x1024)
3. [ ] Upload screenshots
4. [ ] Write app description
5. [ ] Set age rating
6. [ ] Add support URL
7. [ ] Add privacy policy URL
8. [ ] Submit for review

**Google Play Console:**
1. [ ] Create app in Play Console
2. [ ] Upload feature graphic
3. [ ] Upload screenshots
4. [ ] Write descriptions
5. [ ] Set content rating
6. [ ] Add privacy policy URL
7. [ ] Complete store listing
8. [ ] Upload APK/AAB
9. [ ] Submit for review

---

### 10. Post-Launch Monitoring

**Set up monitoring for:**
- [ ] Crash reporting (Sentry, Crashlytics)
- [ ] Analytics (Google Analytics, Mixpanel)
- [ ] Performance monitoring
- [ ] User feedback channels

---

## 🚀 Build Commands Quick Reference

```bash
# === Full Build Sequence ===

# 1. Clean build
rm -rf .next out ios/App/build android/app/build

# 2. Install dependencies
npm install

# 3. Build PWA
NEXT_PUBLIC_CONSCIOUSNESS_PWA=true npm run build

# 4. Sync to native apps
npx cap sync ios
npx cap sync android

# 5. Build iOS (in Xcode)
npx cap open ios
# Product > Archive

# 6. Build Android
cd android
./gradlew assembleRelease
cd ..

# === Platform-Specific Quick Builds ===

# PWA only
npm run consciousness:pwa

# iOS only (opens Xcode)
npm run consciousness:ios

# Android debug
npm run android:build

# Android release
npm run android:release
```

---

## ❌ Critical Blockers

### 1. Missing Screenshots (PWA)
**Impact:** PWA cannot be listed in app stores without screenshots
**Solution:** Generate 4 screenshots (1080x1920 each)
**Effort:** 1-2 hours

### 2. Database Password Rotation
**Impact:** Security risk from exposed password in git history
**Solution:** Rotate password, update all environments
**Effort:** 30 minutes

### 3. iOS Version Number
**Impact:** Cannot submit to App Store without valid version
**Solution:** Set CFBundleShortVersionString and CFBundleVersion
**Effort:** 5 minutes

---

## ⚠️ Important Warnings

### 4. Environment Variables in Git
**Files previously tracked:**
- `.env.sovereign` (contained DB password)
- `.env.sovereign.maia` (contained connection string)
- `.env.staging`

**Status:** Removed from tracking ✅
**Required action:** Rotate all exposed credentials

### 5. Build Artifacts in Git
**Large iOS archives found:**
- `ios/App/App_Build*.xcarchive` (multiple builds)
- `ios/DerivedData/*`

**Recommendation:** Add to .gitignore
```bash
# Add to .gitignore
ios/App/*.xcarchive
ios/DerivedData/
ios/build/
android/app/build/
```

---

## 📝 Next Immediate Actions (Priority Order)

1. **Create PWA Screenshots** (30 min - 1 hour)
   ```bash
   mkdir -p public/screenshots
   # Take screenshots of 4 key features at 1080x1920
   ```

2. **Rotate Database Password** (30 min)
   ```bash
   # Generate new password
   NEW_PASS=$(openssl rand -base64 32)

   # Update PostgreSQL
   psql -U postgres -c "ALTER USER maia PASSWORD '$NEW_PASS';"

   # Update .env files (not committed)
   ```

3. **Set iOS Version Numbers** (5 min)
   - Edit `ios/App/App/Info.plist`
   - Set version to 1.0.0 (build 1)

4. **Clean Up .gitignore** (5 min)
   ```bash
   # Add build artifacts
   echo "ios/App/*.xcarchive" >> .gitignore
   echo "ios/DerivedData/" >> .gitignore
   echo "ios/build/" >> .gitignore
   ```

5. **Test Full Build Pipeline** (1 hour)
   ```bash
   # PWA
   npm run consciousness:pwa

   # iOS
   npm run consciousness:ios

   # Android
   npm run android:build
   ```

6. **Create Privacy Policy** (2-4 hours)
   - Draft comprehensive privacy policy
   - Host on website
   - Update manifests

---

## ✅ What's Already Good

- ✅ Capacitor fully configured
- ✅ PWA manifest comprehensive with shortcuts
- ✅ All required icons generated
- ✅ Build scripts for all platforms
- ✅ Next.js configured for both standalone and export
- ✅ Service worker implemented
- ✅ Android build gradle configured
- ✅ iOS Info.plist exists
- ✅ Proper app IDs set (`life.soullab.maia`)

---

## 📞 Support Resources

**Capacitor Docs:**
- https://capacitorjs.com/docs
- https://capacitorjs.com/docs/ios
- https://capacitorjs.com/docs/android

**PWA Resources:**
- https://web.dev/progressive-web-apps/
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps

**App Store Submission:**
- iOS: https://developer.apple.com/app-store/review/guidelines/
- Android: https://support.google.com/googleplay/android-developer/

---

**Status:** Ready for platform builds with minor fixes needed
**Estimated time to launch readiness:** 4-6 hours
**Primary blockers:** Screenshots, password rotation, iOS version
