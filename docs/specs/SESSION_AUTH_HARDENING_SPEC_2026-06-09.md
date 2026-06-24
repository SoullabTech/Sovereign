# Session Auth Hardening Spec — `x-member-id` → session-token

> ⛔ **SUPERSEDED 2026-06-09** — merged into the governing spec **`docs/specs/AUTH_IDENTITY_HARDENING_2026-06-09.md`**, which now carries the P0 observe-first discipline, the four review gates, and the redaction rule from this document. Kept for history; do not implement from this file.

**Date:** 2026-06-09
**Status:** SPEC ONLY — **not authorized for implementation.** Read-only audit complete; no code changed.
**Track:** #2 (session / identity hardening)
**Audited on branch:** `fix/studio-calendar-timezone-edit` — confirm parity with `clean-main-no-secrets` before implementing.
**Rev:** 2 (added §4 Pre-P0 review gates + candidate inventory, per review 2026-06-09).

---

## 0. Governance (read first)

- **Every phase — including P0 observability — touches the auth/identity boundary and requires explicit per-phase review + go before execution.** Writing a log line into the auth path is itself an auth-surface change.
- This is the consent/identity boundary of a sovereignty-first system. Reversibility, flags, and "observe before enforce" are mandatory.
- **P0 is not approved until §4's four gates are answered.**

### ⚠️ THE LOAD-BEARING WARNING

> **Do not reject `x-member-id` before confirming `x-session-token` is issued and persisted across ALL login/native paths.**

Premature rejection logs every client out = the **"it forgot me"** trap. P5 — and flipping P2's flag off — is **gated on P1 complete + P0 telemetry showing ~100% session-token presence on authenticated requests across every login path.**

---

## 1. Problem

`x-member-id` (header) and `maia_member_id` (cookie) are **identifiers, not credentials.** `getMemberIdFromRequest()` (`lib/auth/getMemberFromRequest.ts:13-48`) accepts them on an **existence check only** (`SELECT id FROM members WHERE id=$1`) — possessing a member's UUID ⇒ authenticated as them. UUIDs are not secret (localStorage `beta_user`, every native `apiFetch` header, logs, the `_m` SSE query param).

- **Impact:** horizontal priv-esc / IDOR across **~166 `app/api` route files** calling `getMemberIdFromRequest`.
- **Secondary:** `middleware.ts isAuthenticated()` (`:81-99`) is presence-only; `x-maia-tier`/`x-maia-roles` **request** headers are client-assertable.

## 2. Known-good mechanism (already in-repo — the target)

- **`lib/auth/session.ts requireMemberId()` (`:32-76`)** — validates `maia_session` cookie **or** `x-session-token` header against `auth_sessions` (`revoked=FALSE AND expires_at>NOW()`); the `x-member-id` path was **already removed** here with the comment *"allowed impersonation attacks."*
- **`lib/capture/captureAuth.ts resolveCaptureUserId()` (`:78-116`)** — same validation.
- **Issuance at signin:** `app/api/members/signin/route.ts:116-123` → `createSession()` + `setSessionCookie()` + `maia_session_token` to localStorage.

**Hardening = make `getMemberIdFromRequest` behave like `requireMemberId`, in place** (1 fn fixes ~166 callers). Consolidate the duplicated `validateSessionToken` (`session.ts` + `captureAuth.ts`) into one.

## 3. Compatibility (iOS / Safari)

Cookies blocked cross-origin in WKWebView / Safari ITP → bearer-token **header**, not identifier trust. Client already sends `x-session-token` (`lib/http/apiBase.ts:535` Safari, `:606` native); native comment already states *"x-member-id alone is no longer accepted (security fix)."* Identifier-trust is the **legacy bridge to retire**, not a capability to preserve.

---

## 4. Pre-P0 review gates — four failure modes (must be answered before P0 is approved)

> These are where auth migrations go wrong. The biggest operational risk is **not** the security change — it is discovering a forgotten path that still authenticates solely through an identifier. **Finding those paths is the explicit purpose of P0 and P1.**

### Gate 1 — Credential precedence (resolved here; enforced in P2)
The resolver MUST have one unambiguous order:
1. `x-session-token` (validated against `auth_sessions`)
2. `maia_session` cookie (validated against `auth_sessions`)
3. Deprecated identifier bridge — **temporary, flagged, logged**

**Conflict rule (token present AND a conflicting `x-member-id`/`maia_member_id`):**
- Validate the token. **Use the token-derived member.** **Ignore the conflicting identifier.** **Log the mismatch** (security signal — stale client or impersonation attempt).
- **An identifier MUST NEVER override a validated credential.** (P0 logs these mismatches as a detection signal even before P2 enforces the rule.)

### Gate 2 — Session-issuance completeness (P1 is the highest-risk phase, not P2)
**Success criterion:** *No authenticated path reaches application functionality without an `auth_sessions`-backed credential.* Without that proof, P2 is a **logout event**, not a security improvement.
- Coverage set that must all issue **and persist** a token (DB row + cookie + **localStorage `maia_session_token`**): web signin, magic-link, email-code, register-email, `enter`, Google/Apple (web **and** native callbacks), native-biometry, biometric-session, WebAuthn, device-trust, team-invite register, dev-login, plus any service-account/automation flow.
- **Audit finding (de-risks, does not replace the proof):** most of these already call `createSession`/`setSessionCookie`/`setAccessCookies` (see §6 inventory); the no-token `setSessionCookies` (**plural**) has **zero live callers** (dead code). **The real residual gap is localStorage persistence:** a path can create the DB session + cookie yet fail to hand the token to the native/Safari client, which then silently falls back to `x-member-id`. **P1's true test is measured `x-session-token` presence on the *next* request (P0 telemetry), not "a row was created."**

### Gate 3 — Rollback semantics (define before removal)
- **P2–P4 reversible within one deploy** (flag flip / revert).
- **P5 (remove bridge) is a one-way door** → only after an **observation window** in which **measured bridge usage falls below an agreed threshold** across a full usage cycle (must include infrequent clients: monthly returners, un-updated native builds, cold starts). Threshold + window are **measured, not calendar-based.**
- Until the removal commit, `AUTH_ALLOW_IDENTIFIER_FALLBACK` must remain re-enableable. A hidden legacy client otherwise becomes an outage.

### Gate 4 — Service-to-service classification (P0 must tag traffic class)
A forged browser request and an internal automation are **different migration problems.** P0 MUST classify each request before treating identifier usage as human auth: **browser · native · internal-cron · webhook · SSE · automation.**
- **Audit finding:** sampled non-human routes authenticate **correctly** with machine credentials, not member identifiers — `app/api/stripe/webhook/route.ts` (Stripe signature), `app/api/cron/session-reminders/route.ts` + `app/api/focus/process-reminders/route.ts` (`CRON_SECRET`).
- **P0 must still confirm exhaustively**, especially the legacy `app/api/_backend/*` tree (`automation.routes.ts`, `facilitatorDashboard.routes.ts`) and any job that operates *on behalf of* a member.

---

## 5. Locked sequence

> Canonical phases. Each is independently reviewed and reversible. Do not collapse phases or skip the gates.

### P0 — Observe deprecated fallback
- **Purpose (per review):** *find every path that authenticates solely through an identifier*, and **classify it** (Gate 4) — not just count volume.
- **Change:** in `getMemberIdFromRequest`, when identity resolves via `x-member-id`/`maia_member_id` existence **and** no valid session token was present, emit a structured log: `{ memberIdPrefix, route, trafficClass, hasXSessionToken, viaHeaderVsCookie, tokenIdentifierMismatch }`. **No behavior change.**
- **Gate:** ⚠️ review before running — even logging is an auth-surface change (Kelly, 2026-06-09).
- **Verify:** breakdown by `trafficClass` × route × native-vs-web; enumerate straggler call sites (practitioner labtools raw `headers:{'x-member-id'}`; scripts; the 2 team SSE `_m` routes); count token↔identifier mismatches (Gate 1).
- **Reversible:** pure logging; remove anytime.

### P1 — Issue real tokens everywhere  *(highest-risk phase — Gate 2)*
- **Goal:** satisfy *No authenticated path reaches application functionality without an `auth_sessions`-backed credential.*
- **Change:** ensure every entry path in the Gate-2 coverage set mints a session (`createSession`+`setSessionCookie`+`setAccessCookies`) **and persists `maia_session_token`** so the next request carries `x-session-token`.
- **Verify (the proof, not a row count):** P0 telemetry shows `x-session-token` present on ~100% of authed native + web requests across **every** login path before any rejection is contemplated.

### P2 — Harden `getMemberIdFromRequest`  *(enforces Gate 1)*
- **Change:** apply the Gate-1 precedence order; validate `x-session-token` + `maia_session` cookie token **first** (consolidated `validateSessionToken`); identifier path behind `AUTH_ALLOW_IDENTIFIER_FALLBACK` (**default `true`**), logging every use; **token always wins over a conflicting identifier; mismatch logged.**
- **Verify:** token-authed requests unaffected; conflicting-identifier requests use the token-derived member; fallback usage trends to zero.
- **Reversible:** single flag (Gate 3 — within one deploy).

### P3 — Middleware / role-trust cleanup
- **Change:** `isAuthenticated()` no longer treats a bare `x-member-id` (or unvalidated `maia_session`) as authed; drop `x-maia-roles`/`x-maia-tier` **request-header** trust (cookie-only, server-set). Middleware stays a coarse gate (Edge can't DB-validate); enforcement is the route-level strong extractor.
- **Verify:** spoofed `x-maia-roles: practitioner,admin` ignored. **Reversible** within one deploy.

### P4 — SSE `_m` → `_t`
- **Scope (audit-confirmed):** exactly two live `_m` consumers — `app/api/team/channels/[channelId]/stream/route.ts:25` and `app/api/team/dm/[dmId]/stream/route.ts:19` (`getMemberIdFromRequest(req) ?? url.searchParams.get('_m')`).
- **Change:** accept `_t` (session token, validated) for SSE; deprecate `_m`. **Reversible** within one deploy.

### P5 — Remove bridge  *(one-way door — Gate 3)*
- **Change:** flip `AUTH_ALLOW_IDENTIFIER_FALLBACK` → `false`, then delete the identifier path; remove `_m`.
- **PRECONDITION:** P1 complete **and** P0 telemetry showing bridge usage below threshold for a sustained observation window across web + native + **all** login paths (incl. infrequent clients).
- **Verify:** `x-member-id`-only request → 401. **Rollback:** flag until the removal commit; revert commit after.

## 6. Evidence & candidate inventory (implement without re-auditing)

| Concern | Location |
|---|---|
| Weak extractor (3 paths) | `lib/auth/getMemberFromRequest.ts:13-48` |
| Target resolver + `validateSessionToken` | `lib/auth/session.ts:32-76`; `lib/capture/captureAuth.ts:78-116` |
| Signin issuance | `app/api/members/signin/route.ts:116-123` |
| Magic-link issuance | `app/api/members/magic-link/route.ts:345` (`createSession`) |
| Other issuance paths (verify localStorage persist) | `members/{register-email,enter,email-code/verify}`, `auth/{signin/google,signin/apple,google/native-callback,apple/native-callback,native-biometry/verify,biometric-session,webauthn/authenticate/verify,dev-login}`, `team/invite/[token]/register` |
| No-token plural cookie helper — **0 live callers (dead)** | `lib/auth/setSessionCookies.ts` |
| Client sends `x-session-token` (Safari/native) | `lib/http/apiBase.ts:535, 606` (fallback `:545, 723`) |
| Middleware presence-auth + header tier/roles | `middleware.ts:81-99, 40, 67` |
| Non-human routes (correct machine creds) | `stripe/webhook` (signature), `cron/session-reminders` + `focus/process-reminders` (`CRON_SECRET`) |
| Legacy tree to classify in P0 | `app/api/_backend/src/routes/automation.routes.ts`, `facilitatorDashboard.routes.ts` |
| SSE identifier-in-URL (P4 scope = 2) | `app/api/team/channels/[channelId]/stream/route.ts:25`; `app/api/team/dm/[dmId]/stream/route.ts:19` |
| Blast radius | ~166 `app/api/**` files import `getMemberIdFromRequest` |

## 7. Open decisions for the owner
1. In-place harden vs per-route migration — **recommend in-place** (1 fn, 166 callers).
2. Token refresh / rotation on the 30-day `auth_sessions` expiry — native can't silently re-cookie; needs a refresh path + graceful re-auth (`app/api/auth/exchange`, `auth/refresh-and-redirect` are candidate seams).
3. Does `maia_member_id` cookie (httpOnly, path 2) retire with the header, or a slower lane?
