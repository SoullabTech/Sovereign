---
title: "Stage Q — web bearer sign-out review and acceptance hold"
date: "2026-10-18"
status: "review-only"
release: "HOLD"
authority: "isolated security candidate"
---

# Stage Q — Web bearer sign-out review: HOLD

## Code candidate and isolation

Candidate branch: `security/auth-stage-q-web-bearer-review-20261018`, derived from `security/auth-signout-session-issuance-review-20261018`. Protected canonical and production were not changed. Two candidate code/test files were amended:

- `app/api/members/signout/route.ts`: after strict trusted-web-origin validation, a browser may present an `x-session-token` when its cookie is absent. Conflicting cookie and header token values produce 409 without revocation. The streaming `_t` query credential is not used. Native `Origin:null` is not accepted.
- `docs/security/auth-signout-session-failure-contract.test.cjs`: four additional synthetic test cases were added for header-only, cookie/header conflict, matching credentials, and untrusted-origin bearer rejection, bringing the authored suite to twelve cases.

No release, merge, enabled origin, production session, or live member data was involved.

## Critical client compatibility finding (source inspection)

1. `lib/http/apiBase.ts` chooses header-based authentication for Safari and native Capacitor. `apiFetchWithHeaders()` adds the locally retained `maia_session_token` as `x-session-token` while also using `credentials: 'include'`. A browser may therefore present **both** a cookie and a header credential.
2. A stale, different localStorage token paired with a newer cookie correctly yields **409** from Stage Q sign-out. However, `app/maia/page.tsx` `handleSignOut()` ignores `Response.ok`, catches only thrown errors, clears local auth state, and navigates to `/signin?from=signout`.
3. `app/studio/account/page.tsx` `handleSignOut()` likewise ignores HTTP status, catches only rejected fetches, clears part of local auth state, and navigates to `/signin`.
4. A 403, 409, or 503 HTTP response from `fetch` does **not** throw automatically. Both clients can therefore imply successful sign-out when the server did not revoke the session.
5. `lib/http/apiBase.ts` may select `https://soullab.life` as API base from another web origin. The server's exact web-origin/Host equality policy can reject that flow; beta and production origin/host behavior must be witnessed without loosening the origin gate.
6. The third Account Popover caller referenced by Stage P has not been located or independently audited in this Stage Q review. Do not claim exhaustive client compatibility.

## Dynamic acceptance status — NOT VERIFIED

An isolated temporary copy of the Stage Q sign-in route, sign-out route, and twelve-case test file was written to a disposable directory on the authorized Mac Studio. The main development worktree was already dirty with unrelated changes and was not changed.

The first terminal attempt failed before running tests with `ENOENT: uv_cwd`. A follow-up attempt was blocked by a tool safety check. The restriction was not bypassed. **No Stage Q test pass, database failure-injection pass, WebKit pass, type-health pass, or native acceptance is claimed.** Historical Stage P pass evidence belongs to a different source state and must not be counted as Stage Q verification.

## Required correction before promotion

- Add a shared, explicitly typed client sign-out result contract. Check HTTP status and `success`, `localCookiesCleared`, and `serverSessionRevoked` independently. Never treat a resolved `fetch` promise as successful revocation.
- Resolve real-world Safari cookie/header divergence without silently preferring an unknown credential, leaking tokens, or weakening browser origin/CSRF protection. If revocation fails or remains uncertain, render an actionable warning and avoid a false success message.
- Clarify whether the member intends **this session** or **all devices**. Stage Q only targets a session identified in this request; it must not imply global revocation.
- Audit all UI sign-out callers, including MAIA, Studio account, and Account Popover; native clients need a separate reviewed transport-specific authority policy.
- Execute the 12-case source-pinned test suite in an authorized test environment, then run real isolated PostgreSQL and HTTPS Safari fault/replay acceptance, native denial/compatibility tests, and governed full-product build/type gate.
- Obtain an independent security review and explicit founder-controlled staging release authorization. Do not merge or deploy on this evidence alone.

**Disposition:** candidate source preserved for security engineering; Stage Q dynamic acceptance and member UI compatibility **HOLD**.
