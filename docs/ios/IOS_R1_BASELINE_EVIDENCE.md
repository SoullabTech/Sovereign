# iOS R1 Baseline Evidence — Existing Pipeline Verification

**Date:** 2026-07-27
**Lane:** isolated worktree `feature/ios-native-r1-verification` @ base `0827d48c8` (`origin/clean-main-no-secrets`)
**Discipline:** compiled → simulator → device → archived → uploaded → TestFlight → walk. Never collapsed.

## Toolchain (measured on this Mac Studio)

| Tool | Version |
|---|---|
| Node | v22.22.3 |
| npm | 10.9.8 |
| Capacitor CLI / core / ios | 8.0.2 |
| Next.js | 15.5.11 |
| Xcode | 26.3 (17C529) |
| Ruby | 3.3.11 |
| CocoaPods | 1.16.2 |
| `scripts/ios/doctor.sh` | **21 passed · 0 failed · 1 warning** (warning: ASC_KEY_ID/ASC_ISSUER_ID env unset — `upload.sh` sets them itself) |

## Signing evidence (recorded, not assumed)

- 3 valid identities in the login keychain: `Apple Development: Kelly Nezat (N9DTF6434L)` and **two** `iPhone Distribution: Kelly Nezat (ZVK2X646Z2)` — the committed team ID.
- App Store Connect API key present at `~/.appstoreconnect/private_keys/AuthKey_36J9MBP9U6.p8` — outside the repository, as required. No signing material is committed.
- The Release archive + IPA export below **succeeded with this signing configuration** — the signing identity is live, not just present.
- Current App Store Connect record state (existing TestFlight builds, listing name availability): **NOT yet inspected** — requires the upload step or ASC access.

## Finding: three divergent build entry points

| Entry point | Sets `MOBILE_MODE=1` | Status |
|---|---|---|
| `scripts/ios/build.sh` + `scripts/ios/upload.sh` | **yes** | **Canonical** per `docs/IOS_RELEASE_PLAYBOOK.md` ("One command to build. One command to upload."); the lane behind shipped builds 2491–2496 (May 2026) |
| `npm run ios:build` → `scripts/build-ios.sh` | no (full-app export) | Legitimate but non-canonical; **cannot complete on Next 15.5** (see failure 4) |
| `npm run ios:testflight` → `scripts/deploy-testflight.sh` / Fastfile `web_prepare` | no | Same full-app export; same limitation expected |

The architecture audit's item 3 named `npm run ios:build` as the build command from package.json; the playbook supersedes that — **R1 verification proceeds on `scripts/ios/build.sh`.**

## Measured failures (all found on the full-app `build-ios.sh` lane; fixes shared by all lanes)

1. **Code-generated OG image routes break `output: 'export'`.** Four `opengraph-image.tsx` route handlers (added 2026-07-10..12, after the last iOS work) fail page-data collection. Fixed in `341517bbb`: new `hide_og_image_routes`/`restore_og_image_routes` pair in `capacitor-patch-routes.sh`; static `.png`/`.jpg` OG images unaffected. Round-trip verified (4 excluded, 4 restored byte-exact).
2. **Patch revert was not byte-clean.** `revert_patched_pages` left one stray blank line per cycle in every patched page (3 lines injected, 2 removed), dirtying the tree and failing the next build's clean-tree preflight. Fixed in `341517bbb`: byte-exact backup + verbatim restore. Also `36b38e860`: committed `next-env.d.ts` as Next 15.5.11 actually regenerates it (stale reference line re-dirtied the tree every build).
3. **Next 15.5 rejects the inject-empty-`generateStaticParams` strategy.** Verified in Next's own source (`node_modules/next/dist/build/index.js`): `hasGenerateStaticParams` requires `prerenderedRoutes.length > 0`, so an empty array counts as *missing* under `output: 'export'`. All 18 injected pages were latent failures. Fixed in `6cf8c8299`: pages without `generateStaticParams` are moved aside (byte-exact backup/restore) instead of injected — artifact-identical, since an empty array never emitted any route.
4. **Full-app export lane is structurally blocked on Next 15.5 beyond the above** (recorded, *not* fixed — not the shipping path): after failures 1–3 were fixed, `/voice-controller-test` fails prerender because pages default to `dynamic = "error"` under export and something in its module graph reaches `cookies()`; `app/home`, `app/soul-portrait/preview/[id]`, `app/team/*` (5 files + layout) import `next/headers` and would fail next. The canonical `MOBILE_MODE=1` lane excludes or tolerates these. Reviving the full-app lane is out of R1 scope.

## Canonical baseline build — SUCCESS

`./scripts/ios/build.sh` (no flags, no modifications beyond the three commits above), run 2026-07-27:

```
Step 1  Pre-clean               ✅
Step 2  Next.js static export   ✅  (MOBILE_MODE=1 allowlisted bundle)
Step 3  index.html entry patch  ✅
Step 4  Revert route patches    ✅  (tree byte-clean afterward)
Step 5  cap sync ios            ✅
Step 6  CocoaPods               ✅
Step 7  Bump build number       ✅  2496 → 2497 (committed, per lane precedent)
Step 8  xcodebuild archive      ✅  Release, ios/App/build/App.xcarchive
Step 9  Export IPA              ✅  ios/App/build/MAIA.ipa  (** EXPORT SUCCEEDED **)
Duration: 0m 59s
```

## Evidence ledger

| Gate | State | Evidence |
|---|---|---|
| Compiled | **VERIFIED** | canonical build Steps 2–8, exit 0 |
| Archived | **VERIFIED** | `App.xcarchive` + signed `MAIA.ipa`, build 2497 (re-archived after entry-point fix `efb4eceff`) |
| Simulator-tested | **VERIFIED** (render + keyboard; authenticated flows deferred to device walk) | Simulator evidence section below |
| Physical-device-tested | NOT RUN — requires Kelly's iPhone (acceptance walk, ruling step 8) | |
| Uploaded | NOT RUN — ruling step 10, after device walk + rename commit | |
| Available/installed in TestFlight | NOT RUN | |
| Acceptance walk | NOT RUN | |

## Simulator evidence

**Device:** iPhone 17 Pro simulator (iOS runtime of Xcode 26.3), UDID `8E1BBFCE-256A-4AE7-8A6A-3DF5C7C8AB90`. App built headlessly (Debug, `xcodebuild`) from the same worktree and launched.

**Measured failure 5 — white screen on the unmodified canonical lane.** First launch rendered a permanent white screen. Cause verified structurally and empirically:

- `CapacitorRouter.route(for:)` (`@capacitor/ios` 8.0.2) maps **every extensionless path to `index.html`** — so the canonical lane's Step 3 stub (`index.html` → JS redirect to `/enter`) loads *itself* on every navigation: an infinite reload loop.
- Empirical confirmation: the simulator process emitted **3,000,509 log lines in 3 minutes** (≈88k redirect/index matches) while showing the white screen.
- This is the same defect the other two lanes fixed in March 2026 (`542b43a2f` build-ios.sh, `256513b65` deploy-testflight.sh — "eliminate JS redirect loop"). The canonical `scripts/ios/build.sh` (last touched 2026-03-03) predates the fix and never received it.
- **Historical scope of this finding (what the repo establishes vs. what it suggests).** Repo history establishes: `scripts/ios/build.sh` was unchanged from 2026-03-03 until today's fix, so at the build-2496 commit (`22629f246`, 2026-05-15) the checked-in script still wrote the `/enter` stub, and `@capacitor/ios` was already `^8.0.2` (same router behavior). What follows from that is bounded: *the current checked-in `scripts/ios/build.sh` could not have produced working builds under the measured conditions, indicating the historical shipping process differed in some material respect.* Which process actually produced 2491–2496 is a historical inference the repo cannot settle — plausible candidates include the other two lanes (both carrying the `maia.html` embed since 2026-03-09/10), a locally modified script, or manual steps; no build artifacts or CI logs exist to corroborate (CI deploys are disabled). This record makes no stronger claim.

**Fix** (`efb4eceff`): Step 3 now embeds `maia.html` directly as `index.html` (synchronous `history.replaceState('/maia')` before hydration), mirrors the defensive per-page URL fixups, and adopts the ≥5,000-byte size guard so a stub can never ship silently again.

**Result after fix:** app cold-launches to the MAIA arrival surface — navy field, Holoflower, "Welcome. Sign in to enter.", live focused email input with the iOS keyboard presented. Screenshot taken 2026-07-27 via the simulator harness. This proves: native shell boots, WebView serves the bundled export, entry route renders, keyboard interaction works.

**Scope note:** this is a *render* proof from the bundled static export. Sign-in against production, conversation, and voice are deliberately NOT exercised in the simulator — authenticated flows belong to the physical-device acceptance walk (ruling step 8, Kelly's account, Kelly's iPhone), and the microphone gate cannot be satisfied in a simulator at all.

## Ruling-order position after this record

Steps 1–5 of the founder ruling are complete (worktree ✓, audit committed ✓, baseline run ✓, failures/success recorded ✓, simulator launch verified ✓). Step 6 (signing) is complete except the App Store Connect record inspection, which happens at upload. Step 7 (minimum fixes) produced commits `341517bbb`, `36b38e860`, `6cf8c8299`, `177cf9edc`, `efb4eceff`. Steps 8–10 (physical-device walk → display-name commit → archive/upload/TestFlight install) require Kelly's device and account and remain open.
