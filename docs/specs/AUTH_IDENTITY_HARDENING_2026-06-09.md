# Auth / Identity Hardening — Spec

**Date**: 2026-06-09
**Status**: GOVERNING SPEC (merged 2026-06-09). Step 2 (token-first resolver, bridge-preserving) is implemented in the working tree; P0 telemetry patched into it. **Authorized:** Step 2 + P0 telemetry only. **NOT authorized:** S1, S3–S7 (enforcement) — held pending P0-findings review. **No deploy** until the merged spec + redacted telemetry are reviewed.
**Track**: #9 — auth only. **Blocks**: M3 multi-team access enforcement. Does **not** touch route restructure / notifications / commons.
**Source**: security-auditor pass + direct verification of `middleware.ts` and `ApiMiddleware` usage; merged 2026-06-09 with the P0 observe-first track (supersedes `SESSION_AUTH_HARDENING_SPEC_2026-06-09.md`).

---

## Governance — observe-first, four gates, redaction (merged 2026-06-09)

This is now the **single governing spec** for the auth-hardening track. It merges the security-auditor inventory + Steps S1–S7 (below) with the **P0 observe-first discipline**, the **four review gates**, and the **logging redaction hard rule** (formerly `SESSION_AUTH_HARDENING_SPEC_2026-06-09.md`, now superseded).

**Authorization (2026-06-09):** Step 2 (token-first resolver, bridge-preserving) is sanctioned + implemented; P0 telemetry is patched into it. Everything that *enforces* — S1 (`||'active'`), S3/S4 (middleware), S5 (bridge removal), S6, S7 — is **held pending review of P0 findings**. **Token-derived identity ALWAYS wins over identifier-derived identity.**

### Observe-first
Before any enforcement (S3–S7), the Step 2 resolver emits **P0 telemetry** so we can *enumerate and classify* every path that still authenticates via a bare identifier — purpose is **find + classify, not count volume**. S5 (remove bridge) is gated on this telemetry showing tokens are issued + persisted across **all** login/native paths.

### Logging redaction — HARD RULE
P0 telemetry logs **presence + classification only**. NEVER: token values, member IDs (not even prefixes), phone/email, message content, or any raw path that can contain UUIDs (mask to `:id`, drop the query string). Allowed fields (exactly):
`credentialSource` · `trafficClass` · `routeBucket` · `xSessionTokenHeaderPresent` · `maiaSessionCookiePresent` · `deprecatedIdentifierPresent` · `credentialConflictPresent`.
Deduped per classification-tuple (**no member id stored or logged**) to avoid flooding.

### Four review gates (apply across all steps)
1. **Credential precedence + conflict** — order `x-session-token` → `maia_session` → flagged bridge. When a validated credential and a deprecated identifier coexist → token wins, identifier ignored, `credentialConflictPresent=true` logged. An identifier MUST NEVER override a validated credential.
2. **Issuance completeness (highest risk)** — *No authenticated path reaches application functionality without an `auth_sessions`-backed credential.* The proof is **measured**: the *next* native request carries `x-session-token` (via the `xSessionTokenHeaderPresent` telemetry), not "a DB row exists." Gates S5.
3. **Rollback semantics** — S2–S4/S6 reversible within one deploy; **S5 (remove bridge) is a one-way door**, gated on a measured bridge-usage threshold across a full usage cycle (incl. infrequent clients). S6 (`refresh-and-redirect` reissue) is the no-hard-logout path.
4. **Service-to-service classification** — `trafficClass` distinguishes browser / native / sse. Cron + webhook already use machine credentials (`CRON_SECRET`, Stripe signature), not identifiers — confirm exhaustively (incl. legacy `app/api/_backend`) before treating identifier use as human auth.

### P0 instrumentation point
`lib/auth/getMemberFromRequest.ts` (the Step 2 resolver) emits `[AuthP0] auth_telemetry …` on requests where a deprecated identifier was used OR coexisted with a validated credential. The two team SSE `_m` consumers (`team/channels/[channelId]/stream`, `team/dm/[dmId]/stream`) remain the only identifier-in-URL surface (separate `SOULCOMMS_TEAM_IN_URL` work) — instrumented under S5 scope, not now.

---

## The core insight (good news)

**No new cryptography is needed.** The hardened mechanism already exists and is correctly implemented:
`x-session-token` (native/Safari) and `maia_session` cookie (web), both validated against `auth_sessions` (`session_token` + `expires_at > NOW()` + `revoked = FALSE`), in `lib/auth/session.ts` (`requireMemberId`), `lib/practitioner/auth.ts`, and `lib/capture/captureAuth.ts`. Issuance is correct (`signin` → `createSession()` → real token → cookie + `localStorage.maia_session_token`).

The problem is **adoption**, not design: `lib/auth/getMemberFromRequest.ts` (`getMemberIdFromRequest`, used by ~201 routes) ignores `x-session-token` and resolves identity from a **bare, forgeable identifier** (`x-member-id` header or `maia_member_id` cookie, existence-checked only). And `middleware.ts` auth/role checks are presence-based placeholders.

> The iOS/Capacitor `x-member-id` workaround is real (WKWebView drops cross-origin `SameSite=Lax` cookies). The bug is that it makes the **member UUID the credential**. The replacement already exists — `x-session-token` — it just isn't honored on the universal path. **Retire the UUID-as-password, keep a native-safe credential.**

---

## Risk inventory (audit + verification annotations)

### CRITICAL
1. **`middleware.ts:83-84` — `maia_session` presence = authenticated**, including the literal `'active'`. *Verified.*
2. **`middleware.ts:87-88` — `x-member-id` header presence = authenticated** (no validation). *Verified.* Any HTTP client forges it.
3. **`getMemberFromRequest.ts:15-32` — `x-member-id`/`maia_member_id` UUID existence = identity** across ~201 routes. UUIDs are observable: `apiBase.ts:719-724` sends `x-member-id` on **all non-Safari web** fetches, so they appear in every browser network panel → low-friction impersonation.
4. **`middleware.ts:54-74` (`getUserRoles`) + `:32-47` (`getUserTier`) — roles/tier from client-supplied `maia_roles`/`maia_tier` cookies, no server verification.** *Verified.* Forge `maia_roles=["admin"]` → elevated. **Carries `TODO: Replace with actual implementation`.** → **Multi-team impact: platform-admin (`/team/admin`) and team-admin gates must enforce from the DB in the route handler after hardened identity, never from these cookies.**

### HIGH
5. **`setSessionCookies.ts:48` — `maia_session = sessionToken || 'active'`.** Any caller omitting the token writes the `'active'` placeholder. *Verified earlier.*
6. **`captureAuth.ts:103-109` — `MAIA_DEV_TRUST_BODY_ID` / `MAIA_TRUST_BODY_ID_IN_PROD=1`** can trust a body-supplied `userId` in prod if the override is set. Confirm the override is unset in `.env.production`.

### DOWNGRADED (verified)
7. **`lib/middleware/ApiMiddleware.ts` stub validators (`'demo-user'`/`'session-user'`)** — **NOT a live risk: zero app routes import this module.** Dead scaffold → delete. (Was audit HIGH #5.)

### MEDIUM / LOW
8. `setSessionCookies.ts:25` — `sessionToken` optional in `SessionData` invites the `'active'` bug. Make it required.
9. `apiBase.ts:719-724` — `x-member-id` broadcast on all web fetches; stop sending once the header is demoted.
10. `middleware.ts:94-96` — `_t`/`_m` SSE query-param auth: confirm these accept real session tokens, not bare member IDs (they land in logs/history).

---

## Target end state

```
Authoritative:    maia_session = real server-issued token (auth_sessions);  native/Safari = x-session-token bearer
Non-authoritative: maia_member_id / x-member-id = display/lookup hint only — never sufficient alone
Authorization:    tier + roles derived server-side from a validated session, never from client cookies
```

---

## Migration sequence (ordered, each step shippable)

**Step 1 — Remove `|| 'active'` (CRITICAL, no legit-user impact).** `setSessionCookies.ts:48`: require `sessionToken`; throw if absent. Callers that omit it are the bug.

**Step 2 — Harden `getMemberIdFromRequest` (HIGH, fixes ~201 routes at once).** Insert `x-session-token` → `auth_sessions` validation as **path 1**. Keep `x-member-id`/`maia_member_id` as a **deprecated, warn-logged** fallback during the bridge window (Step 5 removes them). Single change, all dependents inherit the fix.

**Step 3 — Fix `middleware.ts:isAuthenticated()` (CRITICAL, Edge-safe).** Middleware can't reach Postgres (Edge runtime). Reject empty/`'active'` `maia_session`; format-check token shape (64-hex from `generateSecureToken(32)`). Authoritative validation stays in route handlers (`requireMemberId`). Optionally set an httpOnly `maia_session_valid` flag only after DB-verified creation, for a DB-free middleware gate.

**Step 4 — Fix middleware tier/roles (HIGH).** Stop trusting `maia_tier`/`maia_roles` cookies for gating. Enforce role/tier decisions in route handlers via `requireMemberId()` + a `members` lookup. Middleware becomes coarse-only. **This is the gate multi-team platform/team admin must use.**

**Step 5 — Demote `x-member-id` (MEDIUM, bridge window).** After Step 2 ships + ~30d for clients to hold real tokens: `x-member-id` logs deprecation and falls through to session validation; after ~60d remove the auth path entirely (keep as routing hint only). Stop sending it from `apiBase.ts` web path.

**Step 6 — Compatibility bridge (no hard logout).** When `maia_session='active'` but `maia_member_id` present, redirect through the existing `app/api/auth/refresh-and-redirect/route.ts` to mint a real `auth_sessions` session and re-set the cookie — seamless reissue instead of logout.

**Step 7 — Delete `lib/middleware/ApiMiddleware.ts`** (verified unused). Removes the stub-validator footgun.

---

## Acceptance / verification per step

- **S1**: grep all `setSessionCookies` callers pass a real token; no `'active'` writes remain.
- **S2**: a request with only `x-member-id` (no valid session) → 401/null on a protected route; same request with valid `x-session-token` → resolves. Round-trip on web (cookie) + simulated native (header).
- **S3**: `maia_session='active'` request → middleware denies.
- **S4**: forged `maia_roles=["admin"]` cookie → no admin capability (handler re-derives from `members`).
- **S6**: an existing `'active'`+`maia_member_id` session → transparently upgraded, user not logged out.
- **Regression**: `npm run typecheck`, `npm run smoke`, signin/signout, native `apiFetch` path.

---

## Dependency on multi-team

- **M3 (access enforcement) stays blocked until Steps 1-4 ship.** A forged identity defeats `isMember()`; a forged `maia_roles` cookie defeats the admin gate. Hardened identity + DB-derived roles are prerequisites for the team boundary to mean anything.
- **Multi-team admin gates** (`/team/admin` platform, `/team/[teamSlug]/admin` team) must read `members.roles` / `studio_team_members.role` in the **route handler** after `requireMemberId()` — never from middleware cookies (Step 4).
- **M2 (routing identity)** is security-neutral but paused per directive to avoid spreading the weak helper.
