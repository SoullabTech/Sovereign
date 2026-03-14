# ios
# TestFlight Upload Guide — MAIA Sovereign
# docs/ios_testflight.md

> **One command to ship a beta:**
> ```bash
> cd ios/App
> bundle exec fastlane ios beta
> ```

---

## Prerequisites

Complete [docs/ios_build.md](./ios_build.md) setup first (Gemfile, bundle install).

You need:
- An Apple Developer account with access to **App Store Connect** for `life.soullab.maia`
- The app already created in App Store Connect (it exists: `MAIA Consciousness Computing`)
- An **App Store Connect API Key** (one-time setup, steps below)

---

## Step 1 — Create an App Store Connect API Key

1. Open [App Store Connect → Users and Access → Integrations → App Store Connect API](https://appstoreconnect.apple.com/access/api)
2. Click **+** to generate a new key
3. Name it something like `MAIA Fastlane` — role: **App Manager** (minimum needed for TestFlight)
4. Download the `.p8` file **immediately** — Apple only lets you download it once
5. Note the **Key ID** (e.g. `ABC1234DEF`) and the **Issuer ID** (UUID at top of the page)

---

## Step 2 — Set env vars locally

Create `ios/App/.env.local` (gitignored, never committed):

```bash
cp ios/App/.env.example ios/App/.env.local
```

Fill it in. Use **Option A** (base64 content) — it's cleaner than a file path:

```bash
# Generate the base64 value from your downloaded .p8 file:
base64 -i ~/Downloads/AuthKey_YOURKEYID.p8 | tr -d '\n'
```

Copy the output into `ios/App/.env.local`:

```
ASC_KEY_ID=ABC1234DEF
ASC_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ASC_KEY_CONTENT=MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdw...  (long base64 string)
```

Or use **Option B** (file path) if you prefer to keep the `.p8` on disk:

```
ASC_KEY_ID=ABC1234DEF
ASC_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ASC_KEY_PATH=/Users/soullab/keys/AuthKey_ABC1234DEF.p8
```

---

## Step 3 — Load env vars and run

```bash
cd ios/App

# Load the env file (fastlane reads .env.local automatically if present,
# but you can also export manually):
set -a && source .env.local && set +a

bundle exec fastlane ios beta
```

**What happens:**

1. Validates that `ASC_KEY_ID`, `ASC_ISSUER_ID`, and key content/path are set
2. Calls `build_local` (web_prepare → bump_build → archive → export IPA)
3. Uploads `ios/App/build/MAIA.ipa` to TestFlight
4. Returns immediately — does not wait for Apple's processing (usually 5–15 min)

---

## Golden path checklist

Before every TestFlight upload, confirm:

- [ ] You are on the correct git branch (usually `main`)
- [ ] `git status` is clean (or changes are intentional)
- [ ] `ASC_KEY_ID`, `ASC_ISSUER_ID`, and key content are set
- [ ] `MARKETING_VERSION` in Xcode Build Settings is correct (e.g. `1.2.0`)
- [ ] You haven't uploaded this exact build number before (Fastlane's `bump_build` handles this automatically)

---

## Options

```bash
# Skip the web rebuild if you just ran it (saves ~3 min):
bundle exec fastlane ios beta skip_web_prepare:true

# Use a specific build number (e.g. for hotfix):
BUILD_NUMBER=999 bundle exec fastlane ios beta

# Skip the build number increment entirely:
bundle exec fastlane ios beta skip_bump:true
```

---

## If signing fails

| Symptom | Cause | Fix |
|---------|-------|-----|
| `No profiles for 'life.soullab.maia'` | Automatic signing can't find team | Open workspace in Xcode → Signing & Capabilities → confirm Team is `ZVK2X646Z2` |
| `Team ID mismatch` | Wrong team in exportOptions.plist | Verify `teamID` in `ios/App/exportOptions.plist` is `ZVK2X646Z2` |
| `Bundle ID mismatch` | App ID not registered | App Store Connect → Certificates, IDs & Profiles → confirm `life.soullab.maia` exists |
| `No certificate found` | Cert expired or not on this machine | Open Xcode → Settings → Accounts → Manage Certificates → create new distribution cert |
| `Keychain access denied` | CI/headless context | Not applicable for local builds; this only affects GitHub Actions runners |

## If the upload fails

| Symptom | Cause | Fix |
|---------|-------|-----|
| `403 Forbidden` | API key doesn't have App Manager role | Regenerate key in ASC with App Manager role |
| `Invalid API key` | Wrong Key ID or Issuer ID | Double-check values in `.env.local` against ASC |
| `Duplicate build number` | Same CFBundleVersion already in ASC | Run `bundle exec fastlane ios bump_build` then retry, or use `BUILD_NUMBER` override |
| `Missing compliance` | Missing export compliance answers | Already handled: `ITSAppUsesNonExemptEncryption=false` is in Info.plist |
| Upload times out | Large IPA + slow connection | Retry — `skip_waiting_for_build_processing: true` means the upload itself is separate from processing |

---

## After upload

1. Go to [App Store Connect → TestFlight](https://appstoreconnect.apple.com/apps)
2. Wait for build processing (5–15 min)
3. The build appears under **iOS** → **TestFlight** → **Builds**
4. To distribute: add to a tester group or send direct invites
5. `notify_external_testers: false` is set by default — you control when testers see it
