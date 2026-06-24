# x-member-id Authentication Audit — CRITICAL

**Date:** 2026-06-09
**Branch:** `security/x-member-id-hardening` (off `clean-main-no-secrets` @ `7e4e319c6`)
**Status:** Audit complete. **No code patched.** Scope decision pending.

## Severity: CRITICAL — authentication bypass + impersonation + privilege escalation

## Root cause
A **half-finished hardening**. `lib/auth/session.ts` `requireMemberId()` was correctly hardened (`x-member-id`-alone removed, see its line 54). The migration was **never propagated** to the dominant resolver, the access guards, the middleware gate, or 39 inline route reads — all of which still trust the **client-supplied** `x-member-id` header as proof of identity (and `x-maia-roles` as proof of role).

## Confirmed exploits

### E1 — Member impersonation (`getMemberIdFromRequest`, 156 callers)
`lib/auth/getMemberFromRequest.ts:15-22` reads `x-member-id`, validates only that the UUID **exists** in `members`, and returns it as the caller. **Existence ≠ authentication** — an attacker supplies exactly such a UUID.
- Exploit: `GET /api/<any-of-156-routes>` with header `x-member-id: <victim_uuid>` → act as victim (read/write their data).
- Cost to attacker: one victim UUID (not secret-grade; leaks via API responses, URLs, invites).

### E2 — Privilege escalation (middleware + `requireAccess`)
- `middleware.ts:87-88` — `isAuthenticated()` returns true if `x-member-id` is merely present.
- `middleware.ts:67-69` (`getUserRoles`) and `lib/security/requireAccess.ts:73-74` — roles read from the **client** `x-maia-roles` header; tier from `x-maia-tier`.
- `lib/security/requireAccess.ts:48-49` — `authenticated = Boolean(sessionCookie || memberIdHeader)`, `memberId = memberIdHeader || …`.
- Exploit: headers `x-member-id: <uuid>` + `x-maia-roles: admin` + `x-maia-tier: pro` → pass the access matrix **and** `requireAdmin()` as an admin.
- The legit client does **not** send `x-maia-roles`/`x-maia-tier` (confirmed: apiBase sets only `x-member-id` + anon-id) → this is **pure attacker surface; safe to remove**.

## Blast radius (off `7e4e319c6`)
| Path | Files | Status |
|---|---|---|
| `getMemberIdFromRequest` | 156 | ❌ trusts header (existence-only) |
| inline `headers.get('x-member-id')` in API routes | 39 | ❌ trusts header directly |
| `requireAccess`/`getAccessContext` family | 10 | ❌ trusts header + client roles |
| `requireMemberId` (session.ts) | 62 | ✅ hardened |

**Sensitive routes confirmed reading `x-member-id` directly:** admin (`agent-monitor`, `maia/substrate`, `maia/engine-comparisons`); money (`pricing/helper-fund/apply`, `/contribute`); ~20 `practitioner/practices/*`; member data (`members/beads`, `content/posts`, `field-analytics/report`).

## The iOS coupling — why this is NOT a blind patch
- `getMemberIdFromRequest` does **not** read `x-session-token`. On Safari/iOS (cookies ITP-blocked), the **only** working auth on its 156 routes today is the trusted `x-member-id`.
- The client (`lib/http/apiBase.ts` `apiFetchWithHeaders`) sends `x-session-token` **when it has one** (:533-536) **and** `x-member-id` (:543-545) — but logs cases where the session token is absent (:537-538).
- Therefore hardening the resolver to reject header-only identity **will log out any iOS/Safari user lacking a stored session token** unless we first (a) make the resolver validate `x-session-token`, and (b) confirm login reliably issues + persists one.

## Recommended remediation (phased)

### P1 — Harden the two central resolvers (high leverage; coupled to iOS)
1. `getMemberIdFromRequest`: add `x-session-token` → `auth_sessions` validation (mirror `session.ts`); honor `maia_session` cookie; accept `x-member-id` **only if it equals the session-derived member id** — never as identity alone. → closes **E1 for 156 routes via one edit**.
2. `getAccessContext` (requireAccess.ts): derive `authenticated`/`memberId` from a verified session; derive roles from `members.roles` by verified id (or a server-signed cookie), **not** the `x-maia-roles` header. → closes **E2** for the guard family.

**Pre-req (gating, read-only):** confirm `/api/members/signin` + `setSessionCookies` + `getSessionToken()` reliably issue & persist a session token for Safari/iOS. If not, fix that **first** or P1 logs out mobile users.

### P2 — Migrate the 39 inline-read routes to the hardened resolver.

### P3 — Middleware: stop treating `x-member-id` as authentication and `x-maia-roles`/`x-maia-tier` as authz. Edge runtime can't reach Postgres, so middleware stays **coarse**; authoritative identity/role checks live in route handlers via the P1 resolvers. Consider a signed/httpOnly role cookie set at login.

## What was NOT changed
Audit only — no code patched. Isolated worktree; nothing committed.
