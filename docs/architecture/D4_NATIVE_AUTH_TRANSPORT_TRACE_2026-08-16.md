# D4 — Native Auth Transport: current-state trace (research, step 1–2)

Per founder R8: trace first, witness the cookie reality (don't assume "Safari blocks cookies"),
adjudicate transport A→B→C, then build. This is the **code trace**. Runtime questions it cannot
answer are marked ⟳ SIMULATOR-WITNESS-REQUIRED.

## What the code establishes (CODE-READ)

1. **App origin is genuinely cross-origin to the API.** Production Capacitor build sets
   `server: undefined` (`capacitor.config.ts:29`) — deliberately, with a comment that `server.url`
   breaks `Capacitor.getPlatform()`. The WebView loads bundled files from `capacitor://localhost`
   (iOS); `apiFetch` forces an absolute `https://soullab.life` base (`lib/http/apiBase.ts`). So app
   origin ≠ API origin. The cross-origin condition is real, not predicted.

2. **⭐ `CapacitorHttp` is ENABLED** (`capacitor.config.ts:58`). This is the finding that reframes
   the problem — and the earlier mobile-review agent missed it. CapacitorHttp patches `fetch`/XHR to
   run through the **native URLSession**, which uses the **native `HTTPCookieStorage`, not the
   WKWebView JS cookie jar**. Native URLSession is not bound by WKWebView's ITP/SameSite JS
   restrictions. So the premise behind the `x-session-token`-from-`localStorage` fallback ("cookies
   blocked by ITP", `getMemberFromRequest.ts:16`) **may not hold on native** — the `maia_session`
   cookie set by the verify response could already be stored and resent cross-origin by the native
   layer. ⟳ This is the single most important thing the simulator must witness.

3. **Server side already supports Option A.** `getMemberIdFromRequest` reads the `maia_session`
   cookie *first* (`:37`), then falls back to `x-session-token` (`:44`). If the native cookie is
   carried, member-scoped routes verify with **zero code change**.

4. **Cookie attributes are native-compatible.** verify sets `maia_session` HttpOnly, `sameSite:'lax'`,
   `secure` in production, scoped to the API domain (`email-code/verify/route.ts:167-173`). HttpOnly
   is irrelevant to native (it only blocks *page JS*, which is exactly the boundary we want to keep);
   native URLSession reads Set-Cookie directly.

5. **The current header path is half-built.** `apiFetch` adds `x-member-id` on native (forgeable, not
   a credential) and `x-session-token` *only if* `maia_session_token` is in `localStorage` — which the
   **email-code path never stores** (D4 defect). So today, email-code native users likely present
   neither a cookie (unknown ⟳) nor a session-token header.

## Adjudication (recommendation, pending witness)

- **Option A — preserve the HttpOnly cookie: RECOMMENDED, likely already viable.** CapacitorHttp +
  native cookie store may already carry `maia_session`. If the witness confirms it, D4 needs **no
  credential change** — only removal of the reliance on the forgeable `x-member-id` and confirmation
  the cookie is attached. Keeps opaque + HttpOnly + Secure + server-verified + invisible to page JS.
- **Option B — native secure storage + native bridge.** Fallback if the witness shows the cookie is
  *not* carried. Store the token in iOS Keychain/secure storage; native layer attaches it. Not
  `localStorage`.
- **Option C — JS-accessible `localStorage` token. NOT AUTHORIZED (R8).** Only with explicit recorded
  tradeoff if A and B both fail.

## Simulator readiness (confirmed)

`ios/App` Xcode project present · Xcode at `/Applications/Xcode.app` · **iPhone 17 Pro simulator
booted** (`8E1BBFCE-…`) · Capacitor CLI 8.0.2 · app `life.soullab.maia` **not yet installed** → build
required via `npm run ios:build` (CAPACITOR_BUILD static export → `cap sync ios` → xcodebuild debug).

## What the simulator witness must capture (step 6)

1. Real native sign-in (email → code) completes.
2. **Where the credential lands** — is `maia_session` in the native cookie store after verify?
3. The actual outgoing member-scoped request and **which credential rides it** (cookie? header?).
4. Server-side `auth_sessions` resolution → canonical member UUID.
5. Member-scoped endpoint returns that member's data.
6. Negative controls: x-member-id-only → DENY · x-maia-roles-only → DENY · invalid → DENY · none →
   DENY · valid → ALLOW · valid+stale-id → verified identity wins / mismatch rejects.

Physical iPhone repeats this as the final gate before member-facing hardening opens.

## Witness attempt 1 — BLOCKED by a build-tooling finding (not auth)

Vehicle: isolated worktree at prod SHA `39cc97d87` (auth files confirmed prod-identical), heavy
build inputs symlinked, no collision with the other active session. Ran the **known-good
`deploy-testflight.sh` recipe** (`CAPACITOR_BUILD=1 … npm run build` + `cap sync ios`), stopping
before archive.

**Finding: the Capacitor static export does not build cleanly at prod SHA.** Confirmed not an auth
issue and not the `@capacitor-community/contacts` warning (which the shipping pipeline tolerates —
founder-confirmed). The `next build --output:export` aborts on routes the patch script
(`capacitor-patch-routes.sh`) does not cover:

- 4 metadata OG-image routes without `force-static` (`app/{press,vision-studio,soullab-studio,
  now-what/welcome}/opengraph-image.tsx`) — neutralized in the worktree, cleared.
- `app/go/[handle]/page.tsx` — a dynamic route the script neither hides nor can auto-patch. The
  script auto-adds `generateStaticParams(){return []}` to *server* components (line 402-440) but
  **cannot** for *client* components (line 329) and relies on directory-exclusion for those; `go`
  is not in `MOBILE_TOP_LEVEL` yet was not hidden. Root cause is in the patch tooling, not auth.

**Interpretation (custody):** `web-prod-SHA ≠ iOS-buildable`. Routes added since the last successful
TestFlight ship accumulated without the patch script's exclusion lists keeping pace. This is a real
repo-health finding — **current main cannot ship to iOS without patch-script reconciliation** — and
it is entirely orthogonal to the Option-A credential question.

**Paths to the witness (credential architecture untouched either way):**
- (a) reconcile the patch script's route handling — bounded but real; also fixes iOS shippability;
- (b) build from the last-successful-iOS SHA (faster) **iff** its auth code (CapacitorHttp enable +
  cookie set/read) matches current — must verify before trusting the witness;
- (c) continue witness-scaffolding in the throwaway worktree (neutralize remaining breakers) — fast,
  touches nothing real, discarded after.

Next action: continue (c) autonomously; (b) is faster if a known-good iOS SHA is named.

## Witness attempt 2 — bind an existing artifact (founder-directed). Result: NO VALID ARTIFACT

Option (c) synthetic patching **stopped** per founder ruling — reshaping main until it compiles
produces a witness against a config that cannot ship, which is uninterpretable. Worktree
de-synthesized (OG-route edits reverted). Instead, hunted for an existing native artifact to bind.

Found:
- Installed sim app `life.soullab.maia` is a **ghost registration** — `get_app_container` resolves
  a path whose bundle no longer exists. Not usable.
- Two identical `.ipa`s (`./maia-ios-release.ipa`, `ios/App/output/App.ipa`), both **2026-05-29**.

**Binding test (founder step 3) — FAILED.** The D4-bearing substrate has moved since 2026-05-29:

| File | Last changed | vs May-29 artifact |
|---|---|---|
| `lib/auth/getMemberFromRequest.ts` | **2026-06-09** (`5b4eff3d5` — bind identity to verified session) | changed AFTER |
| `lib/http/apiBase.ts` (native transport) | 2026-07-27 | changed AFTER |
| `capacitor.config.ts` | 2026-07-24 | changed AFTER |
| `app/api/members/email-code/verify/route.ts` (cookie issuance) | 2026-06-04 | changed AFTER |
| `lib/auth/serverSessions.ts` | 2026-02-23 | stable |

The May-29 client predates the very hardening D4 exists to complete. Witnessing against it would
witness the **old, pre-`5b4eff3d5` system**. Not equivalent → **must not be used** (founder step 4).

## Consequence — a real dependency, surfaced

There is **no valid existing native artifact**, and option (c) is closed. Therefore the D4 runtime
witness **now requires a clean build of current main** — which is exactly what the route/patch-script
drift blocks. The "separate later unit" (Capacitor static-export reconciliation) is thus revealed to
be **on the critical path to the D4 witness**, not merely adjacent. It remains a distinct unit and
must not be smuggled into D4 as synthetic patching — but D4's witness is `BLOCKED_ON` it.

```
D4 RESEARCH                 COMPLETE
OPTION A                    PLAUSIBLE · NOT WITNESSED
NATIVE COOKIE TRANSPORT     WITNESS OWED
AUTH ARCHITECTURE           UNCHANGED · OPTION C CLOSED
EXISTING ARTIFACT           NONE VALID (May-29 predates 5b4eff3d5 hardening)
CURRENT-MAIN iOS EXPORT     BLOCKED · route/patch-script drift
D4 WITNESS                  BLOCKED_ON iOS-export reconciliation unit
MEMBER-FACING HARDENING     BLOCKED_ON D4 witness
```

## Correction (2026-08-16): the deterministic recipe is NOT the blocker — disk is

The `iOS-export reconciliation unit` is **downgraded from D4 prerequisite to later debt**. Founder
found the canonical deterministic pipeline `scripts/ios/build.sh`, which sets **`MOBILE_MODE=1`
before `capacitor-patch-routes.sh patch`** (removing non-allowlisted top-level trees *before* static
export) and stamps **`NEXT_PUBLIC_GIT_COMMIT`**. My two failed attempts used the stale drivers
(`build-ios.sh`, `deploy-testflight.sh`) which omit `MOBILE_MODE=1` — that, not a source defect, is
why `/vision-studio/opengraph-image` and `/go/[handle]` broke. So current source is very likely
iOS-buildable via the deterministic path; one clean attempt will confirm.

**Actual current blocker: DISK (external to the D4 code path).** Free ~14 GiB; target ~20. Safe
automated reclaim is unavailable — the harness permission layer refuses `rm -rf ~/Library/...`
(Xcode DerivedData / CocoaPods) despite founder authorization, and `docker system df` hangs so
Docker builder-cache pruning is HELD (precondition unmet: no measured builder cache + idle builder).
Founder will free ≥6 GiB user-side (outside the dev estate, or the two approved cache deletes in
their own terminal). Docker is to be left alone while unresponsive.

**⛔ Held / not authorized:** worktree deletion · Xcode Archives · the two `.ipa`s · `docker builder
prune` while df hangs · `docker system prune` (ever) · synthetic route neutralization · fallback
credential work · Option C.

### RESUME RECIPE (for the next lane — do exactly this, then stop on first failure)

1. **Re-resolve canonical fresh** — `git fetch origin clean-main-no-secrets; git rev-parse --short
   origin/clean-main-no-secrets`. Do **NOT** trust a remembered SHA. (Observed drift this session:
   `66d5d60c2` → `6d3c0cbc4` → re-resolve again.)
2. Fresh isolated worktree at that SHA; symlink `node_modules` + `ios/App/Pods`, copy `.env*`.
3. Deterministic prep = `scripts/ios/build.sh` steps 1–7, i.e.:
   `MOBILE_MODE=1 NEXT_PUBLIC_GIT_COMMIT=<sha>` → `capacitor-patch-routes.sh patch` →
   `CAPACITOR_BUILD=1 npm run build` → embed `maia.html`→`index.html` → revert patches →
   `cap sync ios` → `pod install`. **Stop before step 8** (build-number bump) and step 9 (archive).
4. Simulator `xcodebuild build` (`-sdk iphonesimulator -destination 'platform=iOS Simulator,
   name=iPhone 17 Pro'`), then `simctl install` to the booted sim.
5. **Witness** (transport, not secrets — never print the HttpOnly value): normal sign-in → server
   issues `maia_session` → protected CapacitorHttp request → `getMemberIdFromRequest` resolves the
   actor with **no** `x-member-id` authority → **negative control** (no session + forged
   `x-member-id` → DENY) → terminate/relaunch, repeat protected request for persistence.
6. **On first deterministic-build failure: STOP.** No route neutralization, no widening. Only then
   does the iOS route/driver-reconciliation unit become a proven prerequisite.

**Decision:** cookie carried+reused → Option A established (remove forgeable actor deps, no redesign).
Cookie not carried → Option A refuted, adjudicate Option B; Option C stays closed.
