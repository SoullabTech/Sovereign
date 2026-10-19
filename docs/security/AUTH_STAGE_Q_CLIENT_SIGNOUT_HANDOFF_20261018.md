---
title: "Stage Q — client sign-out correctness, isolated review handoff"
date: "2026-10-18"
status: "review-only; runtime acceptance not executed"
release: "HOLD"
authority: "isolated candidate; no production approval"
---

# Stage Q client sign-out — source review and handoff

## Source custody

- Parent security candidate: `security/auth-stage-q-web-bearer-review-20261018`.
- Isolated client correction branch: `security/auth-stage-q-client-signout-review-20261018`.
- Parent Stage Q server candidate still requires independent security sign-off; the browser contract here is not permission to merge either branch.
- Scope confirmed by a branch comparison: only `lib/auth/webSignOut.ts`, `components/auth/SignOutIncompleteDialog.tsx`, `app/maia/page.tsx`, `app/studio/account/page.tsx`, `components/auth/UnifiedAuth.tsx`, and `docs/security/auth-stage-q-client-signout.test.cjs` differ from the parent candidate.

## Review candidate

1. **Explicit server-response contract.** `lib/auth/webSignOut.ts` no longer treats an HTTP response or resolved fetch as confirmed sign-out. It requires HTTP 200 plus `success:true`, `localCookiesCleared:true`, and a boolean `serverSessionRevoked` for each web request. Malformed, refused, or missing responses are unconfirmed.
2. **Separate browser cookie and stored Safari bearer.** A same-origin POST without bearer headers processes the HttpOnly-cookie credential first. If `maia_session_token` was present in localStorage, a second same-origin POST uses `x-session-token` after the first request completes. Both responses are checked. This avoids sending mismatched credentials in one request and cannot silently turn a partial revocation into complete success. No token is logged, placed in a URL, or accepted via streaming `_t`.
3. **Origin/native boundaries preserved.** Both requests use a relative same-origin path, `credentials:'same-origin'`, `mode:'same-origin'`, `redirect:'error'`, and no API-host fallback. The helper refuses native Capacitor; native authority requires its own separately reviewed implementation.
4. **HttpOnly-cookie local-exit invariant.** Client JavaScript cannot clear an HttpOnly cookie. The incomplete-flow "Clear this device only" action is offered only when the server reported cookie clearing in a complete web response or its exact typed 503 local-cookies-cleared failure response. A 403, 409, network error, malformed response, or native refusal leaves the local-exit action unavailable: the UI instead directs the member to retry or remove site data with browser controls. `leaveThisBrowser` enforces this invariant independently of the UI.
5. **Truthful member UI.** Both MAIA paths and Studio account now inspect the shared outcome, show an accessible incomplete-sign-out dialogue, and never redirect as if sign-out succeeded after a failed request. A deliberate partial local exit redirects to `/signin?signout=unconfirmed`, where UnifiedAuth shows an explicit warning and blocks the silent authed redirect for that visit. The Studio control was corrected from "Sign out of all devices" to **"Sign out of this device"**.
6. **Test source added.** `docs/security/auth-stage-q-client-signout.test.cjs` currently contains **15 authored, fictional, zero-network cases** covering successful cookie processing, Safari bearer-only and dual-session paths, no invented second revocation, 403/409/503 and partial failure, response and network failures, native refusal, explicit local exit, HttpOnly-cookie-uncleared denial, and UI wiring checks.

## Evidence limitations — DO NOT OVERCLAIM

- **The 15 new client tests were authored but NOT executed.** The earlier Stage Q isolated remote test attempt failed with `uv_cwd`; a subsequent retry was blocked by a tool safety check. The restriction was not bypassed. No Stage Q client unit-test PASS is claimed.
- **The preceding 12 server tests were also authored but not executed on this branch.** Historical Stage P isolated SQL/Safari passes are for a different source state; do not carry them forward.
- No Stage Q source compilation, TypeScript health gate, full production build, HTTPS/WebKit browser acceptance, genuine PostgreSQL failure injection, native-device acceptance, release origin/Host configuration, real member sign-in, or independent security sign-off was performed here.
- The main Mac Studio development worktree had unrelated uncommitted changes and was not modified.
- The MAIA account dropdown was inspected and invokes the corrected page callback. A repository-wide proof that no other sign-out caller or Account Popover is outstanding is still **open**; do not claim exhaustive caller inventory.

## Remaining acceptance requirements

- Run source-pinned 15-case client and 12-case server test suites in an *authorized* isolated environment without bypassing tool safety policy.
- Independently review server and client interaction across normal, missing, invalid, mismatched, stale, revoked, and mixed cookie/header credentials. Include real HTTPS Safari/WKWebView tests of cookie expiration between successive POSTs and HTTP 503 behavior.
- Validate origin/Host equality behind actual beta HTTPS and Caddy; ensure `AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS` is configured only through approved staging procedure, never guessed from an inbound request.
- Verify native session revocation separately, including Android `https://localhost` and Capacitor origin semantics, before enabling native sign-out.
- Prove server revocation, local-only cookie clearing, client warning persistence, keyboard accessibility, and site-data recovery in executable browser/SQL tests. Confirm the existing account/security page does not misleadingly imply all-device revocation.
- Repeat full-product build, governed type-health/no-regression, member identity boundaries, and independent security review.
- Preserve founder release authority: no merge, production deployment, authentic account testing, or real-member beta admission without separate approval.

**Disposition:** client source correction is a **review candidate**, not accepted runtime evidence. Protected canonical and production remain unchanged. **HOLD**.
