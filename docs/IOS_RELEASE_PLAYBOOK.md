# MAIA iOS Release Playbook

> **One command to build. One command to upload. Zero manual steps.**

This playbook is the single source of truth for producing a TestFlight build of MAIA.
All steps are encoded in scripts. Nothing lives in memory.

---

## Quick Reference

| Goal | Command |
|------|---------|
| Check environment | `./scripts/ios/doctor.sh` |
| Clean all artifacts | `./scripts/ios/clean.sh` |
| Full clean (incl. Pods) | `./scripts/ios/clean.sh --full` |
| Build IPA | `./scripts/ios/build.sh` |
| Build (reuse web export) | `./scripts/ios/build.sh --skip-web` |
| Upload to TestFlight | `./scripts/ios/upload.sh` |
| Upload + notify testers | `./scripts/ios/upload.sh --notify` |

---

## Green Path (First Release or After Any Problem)

Run these commands in sequence. Each validates its own output before proceeding.

### Step 1 — Verify environment

```bash
./scripts/ios/doctor.sh
```

All checks must pass (✅). Fix any failures before continuing.
Warnings (⚠️) are informational — review but may not block the build.

**What it checks:**
- Node.js >= 22, npm >= 10
- Xcode installed, xcodebuild accessible
- Ruby >= 3.3, Bundler present
- Fastlane installed via `bundle exec` in `ios/App/`
- CocoaPods >= 1.16
- Capacitor >= 8
- `ios/App/App.xcworkspace` exists
- `ios/App/Podfile.lock` present (pods installed)
- `ios/App/App/Info.plist` exists
- `ios/App/exportOptions.plist` exists
- Bundle ID is `life.soullab.maia`
- Team ID `ZVK2X646Z2` present in Fastfile
- Code-signing certificate present (Apple Distribution or iPhone Distribution)
- ASC API key exists at `~/.appstoreconnect/private_keys/AuthKey_36J9MBP9U6.p8`

---

### Step 2 — Clean (recommended before any release build)

```bash
./scripts/ios/clean.sh
```

Removes:
- `out/` (Next.js web export)
- `.next/` (Next.js cache)
- `ios/App/build/` (xcarchive + IPA)
- `ios/App/output/`
- `~/Library/Developer/Xcode/DerivedData/App-*`
- Fastlane artifacts

Does **not** remove `node_modules/` or `ios/App/Pods/`.

#### Full clean (when pods are suspect)

```bash
./scripts/ios/clean.sh --full
```

Also removes `ios/App/Pods/` and `ios/App/Podfile.lock`.
`build.sh` will reinstall pods from scratch.

---

### Step 3 — Build

```bash
./scripts/ios/build.sh
```

Full pipeline:
1. Patches dynamic routes for static export
2. Runs `CAPACITOR_BUILD=1 npm run build` → `out/`
3. Patches `out/index.html` → `/enter` redirect
4. Reverts route patches (trap ensures this even on failure)
5. `npx cap sync ios` — copies web assets into native project
6. `pod install` — integrates CocoaPods
7. Bumps `CFBundleVersion` (git commit count, monotonically increasing)
8. `xcodebuild archive` → `ios/App/build/App.xcarchive`
9. `xcodebuild -exportArchive` → `ios/App/build/MAIA.ipa`

**Expected duration:** ~10–20 min on first run, ~8–12 min with clean pods

**Output:**
```
ios/App/build/App.xcarchive
ios/App/build/MAIA.ipa
```

#### Build options

```bash
# Skip Next.js rebuild — reuse existing out/ (~3 min saved)
./scripts/ios/build.sh --skip-web

# Keep current CFBundleVersion
./scripts/ios/build.sh --skip-bump

# Skip pre-clean of build dir (not recommended)
./scripts/ios/build.sh --skip-clean
```

---

### Step 4 — Upload

```bash
./scripts/ios/upload.sh
```

Uploads `ios/App/build/MAIA.ipa` to TestFlight.
Testers are **not notified** by default.

**Auth:**
Uses `~/.appstoreconnect/private_keys/AuthKey_36J9MBP9U6.p8` automatically.
Set `ASC_KEY_CONTENT` (base64) for CI environments (see CI section below).

#### Upload options

```bash
# Notify external testers
./scripts/ios/upload.sh --notify

# Set changelog text
./scripts/ios/upload.sh --changelog "Bug fixes and journal improvements"

# Upload a specific IPA
./scripts/ios/upload.sh --ipa /path/to/other.ipa
```

**Expected duration:** 3–8 min depending on upload speed + App Store Connect processing

**After upload:**
Build appears in App Store Connect → TestFlight within ~10 min.
Processing ("Waiting for Review" → "Ready to Submit") takes 15–45 min.

---

## Red Paths (What Breaks and How to Fix It)

### R1. Web build fails

**Symptom:** `npm run build` exits with error, `out/` not created.

**Diagnosis:**
```bash
cd ~/MAIA-SOVEREIGN
CAPACITOR_BUILD=1 npm run build 2>&1 | tail -30
npm run typecheck
```

**Common causes:**
- TypeScript error — fix the type error, then retry
- Route patches not reverted — run: `./scripts/capacitor-patch-routes.sh revert`
- Missing env var — check `.env.local` has `MAIA_AUDIT_FINGERPRINT_SECRET`

---

### R2. `cap sync` fails

**Symptom:** `npx cap sync ios` exits non-zero.

**Diagnosis:**
```bash
cd ~/MAIA-SOVEREIGN
npx cap sync ios 2>&1
```

**Common causes:**
- `out/` is empty — run web build first
- Capacitor version mismatch — run `npm install`
- Stale native plugin — delete `ios/App/App` native assets and re-sync

---

### R3. Pod install fails

**Symptom:** `pod install` exits with error.

**Diagnosis:**
```bash
cd ios/App
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install --verbose 2>&1 | tail -40
```

**Common fixes:**
```bash
# Option A: clear cache
pod cache clean --all
LANG=en_US.UTF-8 pod install

# Option B: full wipe
./scripts/ios/clean.sh --full
# then re-run build.sh (it will run pod install)

# Option C: update specs repo
pod repo update
pod install
```

---

### R4. Archive fails

**Symptom:** `xcodebuild archive` exits with error.

**Diagnosis:**
```bash
cd ios/App
xcodebuild archive \
  -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath /tmp/test.xcarchive \
  -allowProvisioningUpdates \
  CODE_SIGN_STYLE=Automatic \
  2>&1 | grep -E "(error:|BUILD FAILED|SUCCEEDED)"
```

**Common causes:**

| Error | Fix |
|-------|-----|
| No valid signing certificate | Open Xcode → Signing & Capabilities → resolve automatically |
| `build/` xattr missing | `xattr -w com.apple.xcode.CreatedByBuildSystem true ios/App/build` |
| Provisioning profile expired | Sign into developer.apple.com, renew profile |
| Swift compilation error | Check console for `.swift` file error, fix code |
| Missing native plugin | Run `npx cap sync ios` then retry |

---

### R5. Export IPA fails

**Symptom:** `xcodebuild -exportArchive` fails, no `.ipa` file.

**Diagnosis:**
```bash
# Check exportOptions.plist
cat ios/App/exportOptions.plist

# Try export manually with verbose output
xcodebuild -exportArchive \
  -archivePath ios/App/build/App.xcarchive \
  -exportPath /tmp/ipa-test \
  -exportOptionsPlist ios/App/exportOptions.plist \
  2>&1 | tail -20
```

**Common causes:**
- `exportOptions.plist` references wrong team ID — check `ZVK2X646Z2`
- Distribution certificate expired — renew in Xcode / developer.apple.com

---

### R6. Upload fails — authentication

**Symptom:** Fastlane exits with auth error.

**Diagnosis:**
```bash
# Check key file exists
ls -la ~/.appstoreconnect/private_keys/AuthKey_36J9MBP9U6.p8

# Verify env vars
echo $ASC_KEY_ID
echo $ASC_ISSUER_ID

# Test manually
cd ios/App
ASC_KEY_ID=36J9MBP9U6 \
ASC_ISSUER_ID=2f3ea491-8e65-4769-b503-3c50172f10ab \
ASC_KEY_PATH=~/.appstoreconnect/private_keys/AuthKey_36J9MBP9U6.p8 \
bundle exec fastlane ios upload_ipa
```

**Common causes:**
- Key file missing — download from App Store Connect → Users & Access → Keys
- Key revoked — generate a new key, update `.p8` file and `ASC_KEY_ID`
- Issuer ID wrong — verify in App Store Connect → Users & Access → Keys (top of page)

---

### R7. Build number rejected (duplicate)

**Symptom:** App Store Connect rejects with "build already exists".

**Fix:**
```bash
# Check current git commit count
git rev-list --count HEAD

# Manually set a higher build number
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion 9999" ios/App/App/Info.plist

# Then run upload only
./scripts/ios/upload.sh
```

---

### R8. "App is already using a higher version"

**Symptom:** Upload rejected — marketing version conflict.

**Fix:** Bump `CFBundleShortVersionString` in `ios/App/App/Info.plist`:
```bash
/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" ios/App/App/Info.plist
# → 1.0.0
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString 1.1.0" ios/App/App/Info.plist
```

---

## Environment Lock (Version Reference)

The following versions produced the last known-good TestFlight build.
Pin these if a build environment ever diverges.

| Tool | Required | Notes |
|------|----------|-------|
| Node.js | >= 22 | Use `.nvmrc` if available |
| npm | >= 10 | |
| Xcode | >= 16 | Check with `xcodebuild -version` |
| Ruby | >= 3.3 | Set via `.ruby-version` or rbenv |
| Bundler | any | `gem install bundler` |
| CocoaPods | >= 1.16 | `pod --version` |
| Capacitor CLI | >= 8 | `npx cap --version` |
| Fastlane | via Gemfile.lock | `bundle exec fastlane --version` |

---

## Key Identifiers

| Field | Value |
|-------|-------|
| Bundle ID | `life.soullab.maia` |
| Team ID | `ZVK2X646Z2` |
| Xcode Scheme | `App` |
| Workspace | `ios/App/App.xcworkspace` |
| IPA output | `ios/App/build/MAIA.ipa` |
| Archive output | `ios/App/build/App.xcarchive` |
| ASC Key ID | `36J9MBP9U6` |
| ASC Issuer ID | `2f3ea491-8e65-4769-b503-3c50172f10ab` |
| ASC Key path | `~/.appstoreconnect/private_keys/AuthKey_36J9MBP9U6.p8` |

---

## CI / Automated Build (Optional)

For CI environments where the `.p8` key cannot be stored as a file, encode it as base64:

```bash
# One-time: encode and copy to clipboard
base64 -i ~/.appstoreconnect/private_keys/AuthKey_36J9MBP9U6.p8 | tr -d '\n' | pbcopy
```

Set as a CI secret named `ASC_KEY_CONTENT`, then run:

```bash
export ASC_KEY_ID=36J9MBP9U6
export ASC_ISSUER_ID=2f3ea491-8e65-4769-b503-3c50172f10ab
export ASC_KEY_CONTENT="<paste base64 value>"

./scripts/ios/build.sh
./scripts/ios/upload.sh
```

The Fastlane `upload_ipa` lane decodes `ASC_KEY_CONTENT` to a temp file automatically.

---

## Useful Commands

```bash
# Check what's in TestFlight right now
# → App Store Connect → Apps → MAIA Consciousness Computing → TestFlight

# Check build number in Info.plist
/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" ios/App/App/Info.plist

# Check marketing version
/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" ios/App/App/Info.plist

# Git commit count (used as build number)
git rev-list --count HEAD

# List code signing identities
security find-identity -v -p codesigning

# Check cap sync would work
npx cap sync ios --dry-run 2>/dev/null || npx cap sync ios --list

# Verify IPA contents
cd ios/App/build && unzip -l MAIA.ipa | head -20
```

---

## Fastlane Lanes Reference

All lanes run from `ios/App/`:

```bash
cd ios/App

# Verify environment (parallel to doctor.sh)
bundle exec fastlane ios clean

# Build only (no upload)
bundle exec fastlane ios build_local

# Full pipeline: build + upload
bundle exec fastlane ios beta

# Upload only (requires existing IPA)
bundle exec fastlane ios upload_ipa

# Skip web build in any lane
bundle exec fastlane ios build_local skip_web_prepare:true

# Skip build number bump
bundle exec fastlane ios build_local skip_bump:true
```

---

*Maintained by: Soullab Engineering*
*Last updated: 2026-03*
