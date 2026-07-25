# Mobile Conversation Verification Loop — Spec

> **Status:** RATIFIED IN PRINCIPLE (founder, 2026-07-24) with the staging amendment in §2.1. Final ratification pending founder confirmation of the applied amendment. No code, infra, or branch changes authorized by this document.
> **Date:** 2026-07-24
> **Staging classification (read-only verification, 2026-07-24):** **C** — shares the production DB by design → **prohibited** as a verification target. See §Open-decisions 1.
> **AMENDED 2026-07-24 (founder — supersedes the production-test default):** Environment hierarchy, safest first: **(1) isolated local test DB + local API** (approved first target) · (2) dedicated isolated staging, once separately built · (3) production-test exception ONLY as an extraordinary last resort with separate, named, per-use authorization. **No isolated environment ⇒ authenticated verification is BLOCKED** — never a silent production fallback. See amended §2 / §2.1.
> **Purpose:** Define the *fastest trustworthy* feedback loop for perfecting MAIA's mobile conversation experience.
> **Binding statement:** *The loop decides what "verified" means for every later mobile fix. A finding may only be closed against the lane its claim actually requires — no higher, no lower.*

The goal is **not** "build an app." iOS and Android are delivery vehicles; the conversation is the product. This spec exists so that *every interaction change can reach a phone in minutes and produce evidence anyone can trust* — without dragging text-layer fixes through native-plugin gates, and without letting fast iteration quietly become fast-but-false.

---

## 1. Two verification lanes

The loop has a real seam, dictated by how Capacitor loads assets (`capacitor.config.ts`). It falls exactly on the Phase 1 / Phase 2 boundary. Neither lane may make claims the other lane owns.

### Fast lane — Phase 1 (conversation surface)

**Covers:** text rendering · composer ergonomics · scrolling & auto-scroll · keyboard behavior · safe areas · gestures · Keep *surfacing* · delivery-state presentation (sending / sent / failed).

**Target cycle:**
```
change → device in seconds–minutes → observable evidence
```

**Mechanism:** Capacitor **dev mode** (`CAPACITOR_MODE=dev`, `server.url` → LAN dev server) on a **physical iPhone and physical Android device**, HMR where it proves reliable.

**Hard limit — what this lane MUST NOT claim:** anything gated on `Capacitor.getPlatform()` fidelity. In dev-server mode `getPlatform()` can report `web`, so native plugins (voice, mic, haptics, notifications, native auth) are **out of scope** here. Layout and interaction feel are in scope; native lifecycle is not.

### Native lane — Phase 2 (native fidelity)

**Covers:** microphone lifecycle · voice / TTS-STT · notifications · background audio · native authentication (Apple / Google) · HealthKit / BLE · app lifecycle (background / resume / cold start).

**Target cycle:**
```
build → cap sync → native compile → install → verify
```

**Mechanism:** local static export (`webDir: out`) → `cap sync` → Xcode / Gradle build → install to device. **Slower by design.** This is the only lane whose evidence may be cited for plugin or lifecycle behavior.

---

## 2. API-target ruling

**Ruling (amended 2026-07-24 — founder):** *The fast mobile loop defaults to an **isolated local test database + local API**. Shared staging is **prohibited** (it shares the production database). Production is **not** a fallback: if no isolated environment exists, authenticated verification is **blocked** until one is provisioned. A production-test run is an extraordinary exception requiring separate, named, per-use founder authorization.*

**Environment hierarchy (safest first):** (1) **isolated local test DB + local API** — the approved first target; (2) dedicated **isolated** staging, once separately built and verified isolated; (3) **production-test exception** — extraordinary last resort, separate per-use authorization only, never a default.

### Why this cannot stay implicit (grounded in `lib/http/apiBase.ts`)

`apiBaseUrl()` resolves in this order:

1. If `NEXT_PUBLIC_API_BASE_URL` is set → **trust it** (this is the only override lever).
2. Else if Capacitor native / `capacitor://` / `ionic://` / `file://` → **hardcoded `https://soullab.life`** (production).
3. Else localhost dev server → relative same-origin.
4. **Fall-through (LAN IP dev-server, e.g. `192.168.4.210`) → production fallback (`https://soullab.life`).**

Consequence: a physical-device fast-lane build that does **not** set `NEXT_PUBLIC_API_BASE_URL` **silently exercises production** — including writes against real member data. Therefore the fast-lane launcher **must** inline `NEXT_PUBLIC_API_BASE_URL=<staging>`; this is enforcement, not preference.

Production-with-a-throwaway-member is acceptable **only** as an explicit, announced exception, because it still risks: analytics pollution · accidental writes · confusing prod logs · production-only state contaminating results · testers forgetting which environment they inhabit.

### Visible environment identity

Non-production builds must show environment quietly but unmistakably:
```
STAGING · commit a1b2c3d · mode capacitor-dev · api staging
```
Production builds show no watermark.

### 2.1 Staging-availability amendment (ratified 2026-07-24)

> **Staging availability is verified, not presumed.** If no reachable and isolated staging backend exists, the first fast-lane implementation may use a time-bounded, visibly labeled production test exception with a dedicated test identity and prohibited sensitive-data use. Establishing full staging infrastructure is a separate authorization and must not silently expand the verification-loop slice.

**Outcome A — staging genuinely available:** use it as the fast-lane default via `NEXT_PUBLIC_API_BASE_URL=<staging URL>`.

**Outcome B — no isolated environment available:** authenticated verification is **BLOCKED** until an isolated local test DB (or isolated staging) is provisioned. A **labeled production-test exception** is an **extraordinary last resort requiring separate, named, per-use founder authorization** — never the default — and if ever invoked must be uncomfortable and explicit:
- dedicated throwaway test member — **never** real member conversations
- environment visibly marked **`PRODUCTION TEST`** with exact SHA + build mode
- a **named, time-bounded** test window
- server-log correlation for every action
- cleanup after the test
- **no Sanctuary or sensitive-content testing**
- **no broad tester distribution**

This keeps the loop spec from becoming a disguised staging-platform project. Full staging infrastructure is a **separate authorization**.

**Current disposition (2026-07-24, amended — founder): Outcome A (local) applies.** The first authenticated fast-lane proof uses an **isolated local test database** (`maia_consciousness_test`, dedicated role `maia_test_user`) **+ local API**, enforced by the fail-closed guard `scripts/verify-test-env.sh`. Staging is disqualified (classified **C** — shares production data). The production-test exception is **demoted to a separately-authorized last resort**. **No isolated environment ⇒ authenticated verification is blocked.**

---

## 3. Trust identity (commit + environment)

Every screenshot or verification record must be attributable to: **git SHA · branch · build mode · API target · platform · OS version · device/simulator · timestamp.**

**Already exists — do not rebuild:** `BUILD_STAMP` in `lib/http/apiBase.ts` (`commit`, `timestamp`, `version`) and `window.__apiBase`. **But it defaults to lying:** with env vars uninlined, `commit` is `'dev'` and `timestamp` is a *runtime* `new Date()` — a build that reports the moment you opened it, not the moment it was built. That is the "fast-but-false" trap in miniature.

**Task (surfacing, not greenfield):**
- Fast-lane build inlines `NEXT_PUBLIC_GIT_COMMIT`, `NEXT_PUBLIC_BUILD_TIME`, `NEXT_PUBLIC_VERSION`, and adds `NEXT_PUBLIC_API_BASE_URL` + build mode to the stamp.
- Expose the full identity through a **quiet diagnostics surface** (hidden sheet — long-press an inert element, or a `/diag` route). It need not clutter the member UI.
- Non-prod builds carry a subtle persistent watermark (env + short SHA).

This is what makes the fast loop *trustworthy* rather than merely *convenient*.

---

## 4. Evidence hierarchy

Each level proves only what it can. A seam climbs **only as high as its claim requires** — the recovery seam did not need native-plugin verification, and must not be held hostage to it.

| Level | Evidence it yields | Can legitimately prove | Cannot prove |
| --- | --- | --- | --- |
| **Desktop integration** | Browser + automated tests | delivery logic, state ownership, retry/idempotency, persistence behavior | anything touch/viewport/keyboard-specific |
| **Simulator** | WebKit / layout evidence | hydration, responsive layout, basic keyboard & safe-area geometry | real IME, real gesture feel, native plugins, perceived latency |
| **Physical device — fast lane** | real touch + viewport + keyboard | composer, scrolling, auto-scroll, keyboard obstruction, gestures, perceived interaction quality, Keep surfacing | mic/voice, notifications, background/lifecycle, native auth |
| **Native build** | plugin + lifecycle fidelity | microphone lifecycle, notifications, background audio, native auth, HealthKit/BLE, cold-start/resume | nothing higher; this is fidelity's ceiling |
| **Staging / prod confirmation** | deployed environment | end-to-end integration, release confidence | pre-deploy correctness (that's the lanes above) |

---

## 5. Repeatable operator flow (fast lane)

One script, runnable by someone who was not present tonight:
```
1. clean baseline        (clean-main, clean worktree — never the dirty branch)
2. exact commit          (record SHA; it goes in the stamp)
3. launch environment    (staging backend reachable; NEXT_PUBLIC_API_BASE_URL=staging)
4. launch device build   (Capacitor dev build → physical iPhone + Android)
5. open test conversation
6. perform named cases   (from the audit's case list)
7. capture evidence      (screenshots + console/network logs, stamped)
8. record result         (finding · lane · pass/fail · stamp)
```
Success criterion: reproducibility without reconstructing archaeology.

---

## 6. Keep — status of record

> **Keep already has a deployed persistence substrate** (the "Keep this moment" mark gesture, deployed `459dbcc4c`, wired-not-surfacing, awaiting first natural member mark). The current work is **discoverability and interaction design, not a new storage system.**

Constraints: the first-class header action **opens the existing flow** and **preserves member choice** — **no auto-save**, **no second persistence model**. Keep is verified in the **physical fast lane** (surfacing/interaction), not the native lane.

---

## 7. Separation of concerns

- The **verification harness is not** a recovery-seam change and **is not** a Keep product change. Ship the harness alone; prove product seams *through* it afterward.
- Work begins from **`clean-main` in a clean worktree**. The current `chore/e2e-layout-invariants` branch (271 dirty files, shared worktree) **is not a valid baseline**.
- No second persistence model, no product behavior change, rides in on the harness.

---

## 8. Audit integration

Every mobile audit finding gains a required field: **`Required verification lane`** — the *lowest* lane that can actually close the claim. Seed mapping (applies to `docs/ux/MOBILE_TEXT_EXPERIENCE_AUDIT.md` once this spec is ratified):

| Finding | Required verification lane |
| --- | --- |
| Retry / send ownership | Desktop integration |
| Header Keep (surfacing) | Physical fast lane |
| Auto-scroll intent | Physical fast lane |
| Keyboard obstruction | Physical fast lane |
| IME composition | Physical fast lane + specific keyboard |
| Mic lifecycle | Native lane |
| Notifications | Native lane |

This prevents every issue from being dragged through the same oversized gate.

---

## Open decisions (need founder / ops ruling)

1. **~~Does a reachable staging backend exist for mobile today?~~ RESOLVED 2026-07-24 → Classification C (not an isolated default).** A staging stack is declared (`docker-compose.staging.yml`, `Caddyfile.staging`, `.env.staging`, pm2 `maia-staging` on :3010). Read-only verification: `staging.soullab.life` **does resolve** — but to `32.219.7.166`, the *same public IP as the production apex*; staging is served **HTTP-only on port `:8090`** (no valid staging TLS; no evidence `:8090` is externally forwarded → not device-reachable off-LAN); container liveness intentionally not probed (a local/hairpin-NAT probe is non-authoritative per project canon). **Categorical disqualifier:** `docker-compose.staging.yml` states it **"Shares production database"** — so it is *not isolated by design* and could not satisfy Outcome A even if stood up. **Therefore the fast lane proceeds under the §2.1 labeled production-test exception** until an isolated staging backend is separately authorized. Standing up isolated staging is a *separate authorization*, not part of the harness slice. **Update 2026-07-24 (founder):** Priority-1 is now an **isolated local test DB** — provisioned as `maia_consciousness_test` (owner `maia_test_user`) on the local Mac Studio Postgres; the fail-closed guard `scripts/verify-test-env.sh` refuses any DB name other than `maia_consciousness_test`, any non-local API, `soullab.life`, or shared staging. Staging remains **C / prohibited**.
2. **Staging member seeding** — how representative member state gets into staging (so fast-lane findings reflect real conditions).
3. **HMR reliability on-device** — one-time proof that dev-server HMR actually reaches a physical iPhone + Android over LAN before we promise "seconds."
4. **Diagnostics surface form** — hidden sheet vs `/diag` route vs persistent watermark; and whether a watermark is ever acceptable in a prod build.
5. **Android cleartext** — dev config uses `cleartext: true` over `http://…:3000`; prefer staging over HTTPS to keep parity with prod transport.

## Recommended first implementation slice (after ratification)

**Staging API selection + visible commit/environment identity + one-command Capacitor fast-lane launch.**
- Inline `NEXT_PUBLIC_API_BASE_URL` (staging) + `NEXT_PUBLIC_GIT_COMMIT` / `_BUILD_TIME` / `_VERSION` into the fast-lane build.
- Surface the stamp (quiet sheet + non-prod watermark).
- Wrap the §5 flow into one command.

Then **Keep** becomes the first product seam proven *through* the loop.

---

*Stop here for founder ruling. On approval, the first slice above is built from `clean-main` in a clean worktree, and only then is the mobile text audit finished against this spec.*
