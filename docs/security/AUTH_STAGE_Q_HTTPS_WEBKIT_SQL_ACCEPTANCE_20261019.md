---
title: "Stage Q — HTTPS WebKit and genuine PostgreSQL session acceptance"
date: "2026-10-19"
status: "isolated executable browser and SQL PASS; release HOLD"
authority: "test evidence, not founder release authority"
release: "HOLD"
---

# Stage Q — controlled HTTPS WebKit and PostgreSQL acceptance

## Exact candidate

- Review branch: `security/auth-stage-q-https-webkit-preflight-20261019`
- Tested GitHub candidate: `20ca9f379419e9daa312e4276449ee8c9699c5b8`
- Draft PR: [#1871](https://github.com/SoullabTech/Sovereign/pull/1871), based only on the isolated real-PostgreSQL review PR #1868.
- GitHub Actions: `Stage Q HTTPS WebKit Fixture (NO DEPLOY)`, run `39261585052`; job `118090756589`, **completed SUCCESS**.
- Source-pinned browser test: `docs/security/auth-stage-q-https-webkit.test.cjs`, Git blob `edffb2e3cfeaa7453f9619bf572db18953e9d8f8`.
- Branch comparison against parent: exactly two new files, the test and its dedicated CI workflow. No application runtime source, member data or protected canonical files changed.

## Actual executable acceptance

**Five WebKit browser tests PASSED (5/5, zero failed)** on October 19, 2026 (GitHub job log approximately 13:39 UTC).

The controlled runner started a fresh PostgreSQL 14 service with a fictional `members` scaffold and applied the unchanged canonical `20260119000001_auth_sessions.sql` migration. It loaded the real Stage Q TypeScript modules `lib/auth/serverSessions.ts`, `lib/auth/verifiedAccess.ts`, `app/api/members/signout/route.ts`, and `lib/auth/webSignOut.ts` via TypeScript transpilation with explicit test-only dependency bindings.

The runner generated its own short-lived TLS certificate/private key, listened only on `https://127.0.0.1:3843`, and drove a genuine Playwright **WebKit engine on Linux** with `ignoreHTTPSErrors` set for the ephemeral self-signed certificate. It did **not** connect to a real Soullab endpoint.

Observed boundaries:

1. **Actual browser cookie handling:** WebKit received the serverSessions-issued `maia_session` with `Secure` and `HttpOnly` attributes, could authenticate with it, could not see it via `document.cookie`, and honored cookie expiration on a same-origin sign-out.
2. **Persistent revocation/replay denial:** real PostgreSQL marked the signed-out session revoked; the old bearer token was rejected by the reviewed `deriveVerifiedAccess()` module after sign-out. The browser request carried the expected origin and host.
3. **Header-only Safari fallback:** a WebKit fetch carrying `x-session-token` without a cookie revoked that fictional SQL session and refused replay.
4. **Dual credential handling:** the reviewed webSignOut helper drove **two sequential real WebKit HTTPS POSTs** for distinct cookie/header credentials, revoking both SQL sessions independently. A conflicting cookie/header combination instead returned 409 without revoking either session or expiring the cookie.
5. **Partial failure honesty:** a disposable PostgreSQL trigger refused revocation. The browser observed HTTP 503 and cookie expiration while the original bearer remained valid; after the trigger was dropped, a header-based retry successfully revoked it and replay was denied.

GitHub log: `# tests 5`, `# pass 5`, `# fail 0`, test process successful. The ephemeral browser, TLS files and PostgreSQL container were shut down at job completion.

## Strict evidence limitations

- **WebKit is not Apple Safari.** This is Linux Playwright WebKit with a test trust exception for an ephemeral self-signed certificate, not a publicly trusted staging TLS certificate, macOS/iOS Safari, WKWebView, or TestFlight.
- **Minimal Node HTTPS adapter, not the full Next.js pipeline.** The fixture adapted only request-local cookies and Next JSON responses so the actual module functions could run. It did not compile Soullab's full Next16 app, run `proxy.ts`/access matrix in the genuine Next HTTP stack, or pass through production Caddy.
- **No production origin/Host verification.** The allowlist used one explicitly configured loopback URL. Actual staging/beta Caddy forwarded Host, multi-domain origins, and generated cookie scopes remain to be qualified independently.
- **No full database server crash/restart.** The SQL failure was an injected UPDATE refusal, followed by recovery of write authority. It did not simulate service termination or persistent backup/recovery.
- **No live member data, credentials, native transport, external domains, release approval or human security sign-off.** None are in scope for this fixture.

## Cumulative Stage Q acceptance to date

- Combined fictional server/client/two-transport contracts: **37/37 PASS**, whole-source TypeScript no-regression **PASS** at combined candidate `0ff7e2b4765cdf3402324843f5074efb5977defa`, PR #1867.
- Previous disposable PostgreSQL session/revocation acceptance: **5/5 PASS**, PR #1868.
- This controlled real WebKit HTTPS plus SQL fixture: **5/5 PASS**, PR #1871.
- These are distinct, explicitly bounded evidence sets; their passing totals are not a surrogate for a single production-shaped end-to-end proof.

## Next gates

1. A **full Next.js 16 request/proxy and HTTPS reverse-proxy acceptance** against a disposable PostgreSQL instance, preserving strict web-origin configuration.
2. A **real Apple Safari** check (and separately native iOS/Android clients) using approved nonmember environments and a valid staging TLS certificate.
3. Independent security reviewer disposition on actual combined code, followed by explicit founder-controlled merge and staging promotion authorization.
4. No real founder/member beta admission until the complete applicable identity, privacy and recovery gates pass.

**Disposition: isolated HTTPS WebKit + real SQL PASS; protected canonical, production, native release and member beta remain HOLD.**
