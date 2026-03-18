# ios
# iOS Build Guide — MAIA Sovereign

> **Toolchain**: Next.js + Capacitor → Fastlane → Xcode
> **Project**: `ios/App/App.xcworkspace`  · Scheme: `App`  · Bundle ID: `life.soullab.maia`
> **Signing**: Automatic (Team `ZVK2X646Z2`) — no manual profiles needed

---

## Prerequisites

| Tool | Minimum version | Check |
|------|----------------|-------|
| Xcode | 15.0 | `xcodebuild -version` |
| Node | 20 | `node --version` |
| npm | 10 | `npm --version` |
| Ruby | 3.3 | `ruby --version` |
| Bundler | 2.x | `bundle --version` |
| Capacitor CLI | via `npx` | `npx cap --version` |

---

## One-time setup

```bash
# From ios/App/
cd ios/App
bundle install
```

This reads `ios/App/Gemfile` and installs fastlane (pinned to `~> 2.231`) into the
bundler-managed gem set. It does **not** affect system gems.

---

## The Capacitor pre-step (why it matters)

MAIA's iOS app is a **Next.js static export** wrapped by Capacitor. Xcode does not
know about JavaScript — it only sees the files in `ios/App/App/public/`. Before every
iOS build, the web layer must be regenerated and synced into the native project:

```
MAIA-SOVEREIGN/
  scripts/capacitor-patch-routes.sh patch   ← remove server-only routes from Next.js
  npm run build (CAPACITOR_BUILD=1)          ← produce out/
  npx cap sync ios                           ← copy out/ → ios/App/App/public/
  scripts/capacitor-patch-routes.sh revert  ← restore routes
```

The `web_prepare` lane automates all of this. **Never archive/export without running
`web_prepare` first** — the app will build successfully but ship stale web content.

---

## Running a local build

```bash
cd ios/App
bundle exec fastlane ios build_local
```

This runs the full pipeline:

1. `web_prepare` — patch routes → `next build` → `cap sync ios` → revert patches
2. `bump_build` — increment `CFBundleVersion` (see below)
3. `gym` — `xcodebuild archive` + export IPA using `exportOptions.plist`

Artifacts land in `ios/App/build/`:

```
ios/App/build/
  App.xcarchive/    ← full archive (symbols, dSYMs)
  MAIA.ipa          ← export ready for TestFlight
  logs/             ← full xcodebuild output
```

---

## Build number (`CFBundleVersion`)

### How it is generated

`CFBundleVersion` is set to the **git commit count** of the current HEAD:

```
git rev-list --count HEAD
```

This is:
- **Monotonically increasing** — each commit produces a higher number
- **Deterministic** — the same commit always produces the same number
- **Offline-safe** — no API calls, no timestamps to drift

`MARKETING_VERSION` (`CFBundleShortVersionString`, currently `1.2.0`) is **not
changed** by any Fastlane lane. Update it manually in Xcode when releasing a new
user-facing version.

### How to read the current build number

```bash
/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' ios/App/App/Info.plist
```

### How to override the build number

Pass `BUILD_NUMBER` env var to any lane that calls `bump_build`:

```bash
BUILD_NUMBER=999 bundle exec fastlane ios build_local
# or just bump without building:
BUILD_NUMBER=999 bundle exec fastlane ios bump_build
```

### How to skip the bump (use whatever is in Info.plist)

```bash
bundle exec fastlane ios build_local skip_bump:true
```

---

## Other lanes

```bash
# Sync web assets only (no Xcode build)
bundle exec fastlane ios web_prepare

# Only bump the build number
bundle exec fastlane ios bump_build

# Clean derived data and build artifacts
bundle exec fastlane ios clean

# Build without re-running the web export (e.g., you just ran it manually)
bundle exec fastlane ios build_local skip_web_prepare:true
```

---

## Relationship to `scripts/build-ios.sh`

The existing `scripts/build-ios.sh` remains untouched. Fastlane is purely additive.
The two approaches are equivalent for local builds; prefer Fastlane going forward
because it is reproducible, documented, and will grow into TestFlight upload (Prompt 4).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `out/ is missing or empty` | `next build` failed | Run `npm run build` directly and check for TS/lint errors |
| `cap sync` fails with Pod errors | Stale Pods | `cd ios/App && pod install` |
| `No profiles for 'life.soullab.maia'` | Automatic signing misconfigured | Open `ios/App/App.xcworkspace` in Xcode; verify Signing & Capabilities shows Team `ZVK2X646Z2` |
| `MARKETING_VERSION` wrong in archive | Not updated in Xcode | Edit `MARKETING_VERSION` in Xcode Build Settings (not in Info.plist) |
| Build number not incrementing | Git history shallow or BUILD_NUMBER set | Check `git rev-list --count HEAD`; unset `BUILD_NUMBER` env var |
