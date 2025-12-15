# CI/CD Setup Guide for MAIA Mobile Deployment

This guide explains how to configure GitHub Actions for automated mobile builds and deployments.

## Required GitHub Secrets

Navigate to: **Repository Settings → Secrets and variables → Actions → New repository secret**

### Android Secrets

| Secret Name | Description | How to Get It |
|-------------|-------------|---------------|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded Android keystore | `base64 -i android-release.keystore \| pbcopy` |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password | From keystore creation |
| `ANDROID_KEY_ALIAS` | Key alias (usually "maia-release") | From keystore creation |
| `ANDROID_KEY_PASSWORD` | Key password | From keystore creation |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Google Play Console service account JSON | From Google Play Console → API Access |

### iOS Secrets

| Secret Name | Description | How to Get It |
|-------------|-------------|---------------|
| `IOS_P12_BASE64` | Base64-encoded P12 certificate | `base64 -i Certificates.p12 \| pbcopy` |
| `IOS_CERTIFICATE_PASSWORD` | P12 certificate password | From certificate creation |
| `IOS_PROVISION_PROFILE_BASE64` | Base64-encoded provisioning profile | `base64 -i profile.mobileprovision \| pbcopy` |
| `APP_STORE_CONNECT_API_KEY` | App Store Connect API key (JSON) | From App Store Connect → Users and Access → Keys |

---

## Step-by-Step Setup

### 1. Android Keystore Setup

```bash
# Generate keystore (if you don't have one)
keytool -genkey -v -keystore android-release.keystore \
  -alias maia-release \
  -keyalg RSA -keysize 2048 -validity 10000

# Encode keystore to base64
base64 -i android-release.keystore | pbcopy

# Add to GitHub Secrets:
# - Name: ANDROID_KEYSTORE_BASE64
# - Value: [paste from clipboard]
```

### 2. iOS Certificate Setup

**Export from Xcode:**
1. Open **Keychain Access**
2. Find your distribution certificate under **My Certificates**
3. Right-click → **Export "Apple Distribution: ..."**
4. Save as `Certificates.p12` with a strong password
5. Encode to base64:
   ```bash
   base64 -i Certificates.p12 | pbcopy
   ```

**Add to GitHub Secrets:**
- `IOS_P12_BASE64`: [paste from clipboard]
- `IOS_CERTIFICATE_PASSWORD`: [your P12 password]

### 3. iOS Provisioning Profile

**Download from Apple Developer:**
1. Go to https://developer.apple.com/account/resources/profiles
2. Download your **App Store** provisioning profile
3. Encode to base64:
   ```bash
   base64 -i profile.mobileprovision | pbcopy
   ```
4. Add to GitHub Secret: `IOS_PROVISION_PROFILE_BASE64`

### 4. App Store Connect API Key

**Create API Key:**
1. Go to: App Store Connect → Users and Access → Keys
2. Click **+ (Generate API Key)**
3. Name: "GitHub Actions"
4. Access: **App Manager**
5. Download the `.p8` file
6. Create JSON file:
   ```json
   {
     "key_id": "YOUR_KEY_ID",
     "issuer_id": "YOUR_ISSUER_ID",
     "key": "-----BEGIN PRIVATE KEY-----\nYOUR_P8_CONTENT\n-----END PRIVATE KEY-----"
   }
   ```
7. Add entire JSON as GitHub Secret: `APP_STORE_CONNECT_API_KEY`

### 5. Google Play Service Account

**Create Service Account:**
1. Go to: Google Play Console → API Access
2. Click **Create Service Account**
3. Follow wizard to create new service account
4. Grant **Release Manager** permissions
5. Download JSON key
6. Add entire JSON content as GitHub Secret: `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

---

## Workflow Triggers

### Automatic Builds

| Event | What Gets Built | Deployment |
|-------|----------------|------------|
| Push to `main` | iOS, Android, PWA (all release builds) | Artifacts only |
| Push to `staging` | iOS, Android, PWA (debug builds) | Artifacts only |
| Pull Request | Quality checks only | None |
| Tag `v*.*.*` | iOS, Android, PWA (release + deploy) | TestFlight + Play Store (internal) |

### Manual Deployment

Go to: **Actions → MAIA Mobile Build & Deploy → Run workflow**

Options:
- ✅ **Deploy to TestFlight**: Uploads latest iOS build to TestFlight
- ✅ **Deploy to Play Store**: Uploads latest Android build to Play Store (internal track)

---

## Testing the Workflow

### 1. Test Quality Checks
```bash
git checkout -b test/ci-setup
git commit --allow-empty -m "Test CI/CD pipeline"
git push origin test/ci-setup
# Open PR and watch Actions tab
```

### 2. Test Full Build (without deploy)
```bash
git checkout main
git commit --allow-empty -m "Test full mobile build"
git push origin main
# Watch Actions tab - all 3 platforms should build
```

### 3. Test Deployment
```bash
# Create a version tag
npm run version:patch
git add -A
git commit -m "Bump version to $(node -p require('./package.json').version)"
git tag v$(node -p "require('./package.json').version")
git push origin main --tags
# Watch Actions - should deploy to TestFlight + Play Store
```

---

## Build Artifacts

After each successful build, download artifacts from:
**Actions → Workflow Run → Artifacts**

| Artifact | Contains | Retention |
|----------|----------|-----------|
| `android-debug-apk` | Debug APK for testing | 30 days |
| `android-release-apk` | Signed release APK | 90 days |
| `ios-ipa` | Signed IPA for App Store | 90 days |
| `pwa-build` | Static PWA files | 30 days |

---

## Troubleshooting

### Android Build Fails: "Keystore not found"
- Verify `ANDROID_KEYSTORE_BASE64` secret exists
- Ensure it's properly base64 encoded (no extra whitespace)

### iOS Build Fails: "Code signing error"
- Check that `IOS_P12_BASE64` and `IOS_PROVISION_PROFILE_BASE64` are set
- Verify certificate hasn't expired in Apple Developer Portal
- Ensure provisioning profile matches bundle ID: `life.soullab.maia`

### TestFlight Upload Fails
- Verify `APP_STORE_CONNECT_API_KEY` is valid JSON
- Check API key hasn't expired or been revoked
- Ensure API key has **App Manager** role

### Play Store Upload Fails
- Verify service account has **Release Manager** permissions
- Check that package name matches: `life.soullab.maia`
- Ensure version code is incremented (happens automatically via `version-bump.sh`)

---

## Security Best Practices

✅ **DO:**
- Rotate secrets every 90 days
- Use unique passwords for each keystore/certificate
- Enable 2FA on Apple/Google accounts
- Review Actions logs for exposed secrets

❌ **DON'T:**
- Commit `.env.android` or keystore files to git
- Share P12 passwords in plain text
- Use production keys in development branches
- Store secrets in code or config files

---

## Local Development vs CI/CD

| Task | Local Command | CI/CD Trigger |
|------|---------------|---------------|
| Debug build | `npm run android:build` | Push to any branch |
| Release build | `npm run android:release` | Push to `main` |
| Version bump | `npm run version:patch` | Commit + tag |
| TestFlight | Manual upload via Xcode | Tag `v*` |
| Play Store | Manual upload via console | Tag `v*` |

---

## Next Steps

1. ✅ Set up all GitHub Secrets (see tables above)
2. ✅ Test CI/CD with empty commit
3. ✅ Verify artifacts are created
4. ✅ Test manual deployment to TestFlight/Play Store
5. ✅ Document release process for team

---

**Last Updated:** December 14, 2025
**Workflow File:** `.github/workflows/mobile-deploy.yml`
