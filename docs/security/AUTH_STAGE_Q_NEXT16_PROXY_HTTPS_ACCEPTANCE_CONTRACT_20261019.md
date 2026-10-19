# Stage Q — Next.js 16 strict-proxy HTTPS acceptance contract
Date: 2026-10-19
Status: REVIEW ONLY / RELEASE HOLD

## Grounded parent and purpose
This contract starts from Stage Q Linux WebKit + real PostgreSQL PASS on tested SHA `20ca9f379419e9daa312e4276449ee8c9699c5b8`, with a documentation-only subsequent SHA `2a441880145dc7035071ce30b01cdd0c6fe780b5`. Parent PR #1871 remains a draft. The previous WebKit test used a minimal Node HTTPS adapter and DID NOT exercise the actual Next 16 proxy/matcher, origin forwarding, or full UnifiedAuth.

## Next required test specimen
Build an **entirely disposable reduced Next.js 16.3.8 application** from exact source blobs of `proxy.ts`, `config/accessMatrix.ts`, `lib/auth/verifiedAccess.ts`, `lib/auth/identityAssertions.ts`, `lib/auth/serverSessions.ts`, `lib/db/postgres.ts`, and `app/api/members/signout/route.ts` plus direct bounded imports. Include the current Stage Q sign-in route only when its exact source, metadata handling and fault tests are pinned. Use the unchanged canonical sessions migration on a newly initialized **fictional PostgreSQL 14** instance; no live database, member record, or default DATABASE_URL.

A temporary self-signed HTTPS proxy must forward to a loopback-only Next listener. Define and verify the edge Host behavior; set `AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS` to the exact approved fictional HTTPS origin for the test **only**. Preserve `ACCESS_CONTROL_MODE=strict`, all Next matcher behavior and the exact sign-out rule. Never allow the whole `/api/members/` prefix.

## Runtime falsifiers required for a PASS
1. Actual `POST /api/members/signout` passes through the Next 16 proxy in strict mode; `GET` does not invoke a revocation operation.
2. Browser origin equality, explicit trusted-origin allowlist and Host equality all hold across the temporary TLS proxy; no `X-Forwarded-Host`, `Origin:null`, omitted Origin or `Sec-Fetch-Site:cross-site` bypass.
3. Authentic Next `cookies()` emits Secure and HttpOnly session cookie and sends correctly scoped expirations. Real WebKit/Safari-compatible browser stores, sends and drops the cookie.
4. Real PostgreSQL confirms session issuance and revocation; old cookies and the old `x-session-token` cannot regain authority after revocation, including a restored/stale client assertion.
5. Two sequential browser requests handle distinct cookie and header tokens without cross-revocation or false success; simultaneous conflicting credentials fail closed.
6. SQL revocation refusal produces truthful 503 with local cookie-expiration evidence. Recovery and retry achieve durable revocation, not a merely cosmetic sign-out.
7. Anonymous, already-revoked and expired sessions can clear local cookies safely without privileged access, while the application never misstates new server revocation.
8. A complete `UnifiedAuth` web login and MAIA/Studio sign-out UX is separately witnessed; no 200 HTML redirect or rejected fetch may be counted as successful revocation.
9. Failures surface exact sanitized status and aggregate evidence; no raw passwords, session tokens, personal records, TLS private keys or actual member data enter logs.
10. Produce a source-and-build SHA manifest, browser/SQL result matrix, process cleanup record, and independently reviewable evidence.

## Stop conditions
- If full Next runtime requires widening protected code or access rights, **stop and return REVISE**, do not patch canonical.
- If a safety control blocks execution, do not bypass it.
- Do not put native `Origin:null` behind a fake browser exception.
- No real founder sign-in, staging modification, deployment, merge, new member cohort, billing or paid external review.

## Acceptance distinction
**The prior Stage Q 37/37 fictional tests, 5/5 genuine PostgreSQL tests, and 5/5 Linux WebKit+SQL tests remain valid for their respective tested SHAs. They do not establish this full Next/proxy/TLS gate.** The latter remains OPEN until the real Next request pipeline and all relevant falsifiers execute.

Release status: **HOLD**, pending full Next/edge acceptance, Apple Safari/browser-specific validation, native-client separate authorization, full recovery and independent security review.
