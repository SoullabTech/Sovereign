# iOS R1 Architecture Audit — Native TestFlight Shell

**Date:** 2026-07-27
**Auditor:** Claude (sole authorized implementation lane, per execution brief)
**Repo state at audit:** branch `chore/e2e-layout-invariants`, HEAD `28414051f9a2b50ac0e81ea1f2f7044d63e079cf` (`fix(ios): anchor short transcript content to bottom, reduce dead space`)
**Working tree:** DIRTY — 282 uncommitted paths, 54 stashes (shared worktree carrying multiple lanes' work)

---

## Provenance annotation (added on copy into the isolated lane)

This audit was performed in the dirty shared worktree at `28414051f`
(`chore/e2e-layout-invariants`). On 2026-07-27 it was copied into the isolated
verification worktree at the governed base `0827d48c834cba24b5db4152c3add69318c7c13f`
(`origin/clean-main-no-secrets`, branch `feature/ios-native-r1-verification`) and each
finding was re-verified against that base:

- **Identical on the governed base** (byte-for-byte): `package.json`,
  `scripts/build-ios.sh`, `scripts/capacitor-patch-routes.sh`, `ios/App/App/Info.plist`,
  `ios/App/App.xcodeproj/project.pbxproj`. All headline identity facts (bundle ID,
  versions, team, target, permissions, pipeline) therefore hold unchanged.
- **Differ, governed base is NEWER** — the shared tree's branch predates these base
  changes: `capacitor.config.ts` (dev-server URL is now env-overridable via
  `CAPACITOR_DEV_SERVER_URL`; the hardcoded `192.168.4.210` is only a backward-compat
  default, so governed-finding #6 "stale dev IP" is softened on the base),
  `next.config.js` and `lib/http/apiBase.ts` (build identity is now
  `NEXT_PUBLIC_BUILD_*` with truthful `UNSTAMPED` fallbacks — item 11's description of
  `BUILD_STAMP` reflects the older shared-tree version), and `lib/mobile/mobileAllowlist.ts`
  (shared tree adds `/maia/field-dashboard`, not on base — not audit-relevant).
- Core architecture claims re-confirmed on the base: `output: 'export'` under
  `CAPACITOR_BUILD` (`next.config.js:60`), `appId: 'life.soullab.maia'` / `webDir: 'out'`
  (`capacitor.config.ts:21-23`), `FALLBACK_API_BASE_URL = 'https://soullab.life'`
  (`lib/http/apiBase.ts:14`).

Baseline verification proceeds from `0827d48c8`, not from the dirty tree.

---

## Headline finding

**The native iOS project the brief asks to create already exists and is mature.**
This is not a greenfield Capacitor integration. The repository contains a complete,
previously-archived iOS shell:

| Property | Value | Evidence |
|---|---|---|
| Bundle identifier | `life.soullab.maia` | `ios/App/App.xcodeproj/project.pbxproj` |
| Display name | `Soullab` (Info.plist) / app name `MAIA Consciousness Computing` (capacitor.config.ts) | `ios/App/App/Info.plist`, `capacitor.config.ts` |
| Marketing version | `1.2.0` | pbxproj + Info.plist |
| Build number | `CURRENT_PROJECT_VERSION = 743`, `CFBundleVersion = 2496` (pipeline bumps Info.plist) | pbxproj, Info.plist |
| Development team | `ZVK2X646Z2` (committed in pbxproj) | pbxproj |
| Deployment target | iOS 16.0 | pbxproj, `ios/App/Podfile` |
| Capacitor | 8.0.2 (`@capacitor/core`, `/ios`, `/cli` all `^8.0.2`) | `package.json` |
| Native scaffolding | Xcode project + workspace, Podfile/Podfile.lock, fastlane, `ExportOptions.plist`, `PrivacyInfo.xcprivacy`, AppIcon + Splash assets, custom Swift plugins (`AudioSessionManager.swift`, `VoiceController.swift`, `HandwritingOCR.swift`) | `ios/App/*` |
| TestFlight pipeline | `npm run ios:testflight` → `scripts/deploy-testflight.sh`; fastlane present | `package.json`, `ios/App/fastlane` |

Build numbering in the thousands plus a committed TestFlight deploy script indicate
prior archive/upload history. **Unverified from the repo alone:** whether any build is
currently live in App Store Connect / TestFlight, and whether team `ZVK2X646Z2` signing
assets are still valid on this Mac. These must be checked against App Store Connect
directly (founder/Apple account access), not inferred.

**Consequence for the brief:** Phases 1–2 ("add Capacitor", "configure Xcode project")
are already done. R1 work is *re-verification and release engineering* of an existing
shell — not creation. The brief's evidence discipline (compiled → simulator → device →
archived → uploaded → installed → walk-passed) still applies in full, starting from zero
evidence for the current codebase state.

---

## The 17 required determinations

1. **Framework and version:** Next.js `^15.5.11` (package.json; CLAUDE.md says "Next.js 16" — package.json is authoritative), React `^19.1.1`. *(Brief said "Capacitor 8 … modern web application"; actual Capacitor is 8.0.2 — already current major.)*
2. **Package manager:** npm (package-lock.json; all scripts invoke npm/npx).
3. **Build command (iOS lane):** `npm run ios:build` → `scripts/build-ios.sh debug` (or `ios:release`). Web bundle step: `npm run ios:bundle` = `CAPACITOR_BUILD=1 CAPACITOR_MODE=beta npm run build && npx cap sync ios`.
4. **Static asset generation:** YES — `next.config.js:43-45`: `output: 'export'`, `distDir: 'out'` when `CAPACITOR_BUILD` is set. This is the established, working path.
5. **Live server requirement:** The *UI* exports statically; all `/api` routes are stripped from the bundle (`scripts/capacitor-patch-routes.sh` moves `app/api` aside during build) and the native app calls the production server at `https://soullab.life`. A mobile-mode allowlist (`MOBILE_MODE=1`, backed by `lib/mobile/mobileAllowlist.ts`) restricts which routes ship in the bundle. `force-dynamic` routes must be in `EXCLUDED_DYNAMIC_ROUTES` (known trap, CLAUDE.md).
6. **Authentication mechanism:** Custom members system (passkey + username/password → `/api/members/*`), session cached client-side in `localStorage.beta_user`. **Known iOS constraint:** `SameSite=Lax` cookies are NOT sent cross-origin from the WKWebView, so authenticated calls carry an `x-member-id` header via `apiFetch()` (`lib/http/apiBase.ts`). Sign in with Apple + Google Auth plugins are already registered (`packageClassList`) with a Google URL scheme in Info.plist — these predate R1 and are NOT to be reworked.
7. **Cookie/domain assumptions:** Web relies on first-party cookies at `soullab.life`; iOS deliberately routes around cookies via the header model above. `apiBaseUrl()` hard-falls-back to `https://soullab.life` and force-detects iOS even if `Capacitor.isNativePlatform()` misreports. Native HTTP (`CapacitorHttp: enabled`) bypasses CORS in WKWebView.
8. **Streaming behavior:** Conversation responses stream from `/api` endpoints on the production origin; `apiFetch` wraps calls with an explicit timeout cap so a stalled native bridge surfaces a labeled timeout rather than trapping the WebView. Physical-device verification of streaming is a required R1 gate, not assumed.
9. **Audio capture/playback:** Existing native stack: `capacitor-voice-recorder` (7.0.6), `@capacitor-community/speech-recognition`, custom `AudioSessionManager.swift` + `VoiceController.swift`. `NSMicrophoneUsageDescription` + `NSSpeechRecognitionUsageDescription` already present. Prod MAIA voice = OpenAI TTS path (per project memory; voice architecture Phase 0 PR #753 is HELD and must not be entangled with R1).
10. **File upload:** Web file input path plus `@capacitor/filesystem` + `@capacitor/share` already installed. R1 uses the existing web input path per the brief; native plugins are present but no new file work is authorized.
11. **Environment variables:** `CAPACITOR_BUILD=1`, `CAPACITOR_MODE=dev|beta|prod` (beta default → soullab.life; dev points at a LAN dev server `192.168.4.210:3000` — stale IP, dev-mode only), `NEXT_PUBLIC_API_BASE_URL` (optional; hard fallback exists), `MAIA_AUDIT_FINGERPRINT_SECRET=build-placeholder` for the bundle build. No production secrets embedded — API access is authenticated per-member at runtime.
12. **CSP/origin restrictions:** No `server.url` in prod-like builds (local assets); no `allowNavigation` list currently needed. No `NSAppTransportSecurity` / `NSAllowsArbitraryLoads` key exists in Info.plist — ATS is at Apple defaults (HTTPS enforced). **This satisfies the brief's ATS requirement as-is; do not add exceptions.**
13. **Manifest/PWA files:** PWA manifest + full apple-splash icon set exist under `public/` (currently modified in the dirty tree — those modifications belong to another lane, not R1).
14. **Existing native/Capacitor artifacts:** Extensive — see headline table. Also `capacitor.config.ts` note: **remote `server.url` mode breaks `Capacitor.getPlatform()` and native plugins** (documented in-file, capacitor#2373). This forecloses Model A.
15. **iOS-specific CSS/viewport work:** Substantial and recent (HEAD commit itself is an iOS transcript-layout fix; `dvh` + safe-area work throughout; e2e layout-invariant tests on this branch). **Standing invariant (project memory): core conversation-box geometry must NOT be derived from `visualViewport.height` / `dvh` / `svh` / `lvh` / keyboard height.** R1 native work must not disturb this.
16. **Production HTTPS origin:** `https://soullab.life` (self-hosted, Caddy on minisforum, Let's Encrypt TLS).
17. **Minimum iOS version:** 16.0 (pbxproj + Podfile), compatible with Capacitor 8.

---

## Architecture decision: Model A vs Model B

**Decision: Model B — bundled web assets calling the remote production API.**

This is not a preference; it is the only viable model here:

- The repo already implements Model B end-to-end (static export → route patching → `cap sync` → embed `maia.html` as the WebView entry).
- Model A (remote shell via `server.url`) is *documented in the repo as broken* for this app: it makes `Capacitor.getPlatform()` return `'web'`, disabling every registered native plugin, including the voice stack R1 must verify.
- The brief's own rule — "prefer the smallest architecture that preserves behavior and security" — selects the proven existing path over re-architecting either direction.

---

## Governed findings (brief deviations to surface, not paper over)

1. **Hard-stop condition 12 is active for the branch step.** The shared worktree has 282 uncommitted paths spanning many lanes (landing components, auth, middleware, icons, docs, feature-flags — some staged). `git checkout clean-main-no-secrets` + new branch cannot be done cleanly without stashing/committing other lanes' work, and project memory forbids `git add -A` / bulk stashing in this worktree. **Branch creation needs a founder decision on tree handling** (options in the session report). Additionally, `scripts/capacitor-patch-routes.sh` has its own preflight guard that refuses to build on a dirty tree (`ALLOW_DIRTY=1` override exists but defeats reproducibility — not acceptable for an archive build).
2. **Phase 1 of the brief ("add Capacitor") is void** — performing it (`cap init`/`cap add ios`) would clobber a mature, governed native project. R1 must be re-scoped to: verify current shell builds → simulator → physical device → archive → upload → internal-tester walk, with the brief's evidence ledger and docs set unchanged.
3. **Display-name mismatch to resolve (founder decision):** Info.plist `CFBundleDisplayName` is `Soullab`; the brief expects `MAIA`. Also `appName` in capacitor.config.ts is `MAIA Consciousness Computing`. No change made; recorded as an open identity question.
4. **Permissions inventory is broader than R1 needs:** Info.plist already declares HealthKit (read HR/HRV), Bluetooth (OpenBCI EEG), Camera, Photo Library, Face ID, Contacts, Speech Recognition, Microphone. Several correspond to registered plugins (BluetoothLe, HealthKit config in capacitor.config.ts). The brief says "add only permissions actually exercised" — these are *pre-existing*, so removal is out of R1 scope without a ruling, but each must be truthfully represented in `IOS_PRIVACY_DATA_INVENTORY.md` and Apple privacy answers.
5. **Signing/team identity:** `DEVELOPMENT_TEAM = ZVK2X646Z2` is committed in the pbxproj. Whether repo policy permits this is a founder call (brief: "do not commit personal development-team identifiers if repository policy excludes them"). Apple account access, current certificate validity, and App Store Connect app record state are all founder-supplied facts (brief's "Decisions you must personally supply").
6. **Dev-server IP is stale:** `capacitor.config.ts` dev mode points at `192.168.4.210:3000`; current LAN reality is the `192.168.0.x` subnet. Harmless for beta/prod builds (dev block unused); noted for honesty, no change made.

---

## Evidence state at time of audit

| Gate | State |
|---|---|
| Compiled (current HEAD) | NOT VERIFIED |
| Simulator-tested | NOT VERIFIED |
| Physical-device-tested | NOT VERIFIED |
| Archived | NOT VERIFIED (historical builds exist; none for current state) |
| Uploaded | NOT VERIFIED |
| Available in TestFlight | NOT VERIFIED |
| Installed from TestFlight | NOT VERIFIED |
| Acceptance walk | NOT RUN |

No source was modified during this audit. This document is the sole Phase 0 artifact.
