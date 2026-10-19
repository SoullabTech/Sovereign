---
title: "Stage Q — compiled Next.js 16 proxy and Caddy HTTPS SQL acceptance"
date: "2026-10-19"
status: "isolated runtime PASS, release HOLD"
authority: "CI execution evidence; not staging/production approval"
release: "HOLD"
---

# Stage Q — real Next.js 16 + Caddy + WebKit + PostgreSQL acceptance

## Exact executed artifact

- **Verified tested commit:** `00dc279c5a91d67d1dd7690491337348a4715184`
- **Branch:** `security/auth-stage-q-next16-caddy-preflight-20261019`
- **Draft PR:** [#1872](https://github.com/SoullabTech/Sovereign/pull/1872) — based on isolated WebKit security branch, **not** protected canonical.
- **GitHub Actions:** `Stage Q Next16 Caddy HTTPS Fixture (NO DEPLOY)`, run `39265976288`, job `118105726883`, **completed SUCCESS**.
- **Runtime test:** `docs/security/auth-stage-q-next16-caddy.test.cjs`, Git blob `5991973bfc079d267d4949c0e18b1b18b039aabb`.
- **Fixture builder:** `docs/security/auth-stage-q-next16-fixture-build.cjs`, Git blob `bc9ba984a1552127b12142f3c73b554cc6d2e861`.
- **Workflow:** `.github/workflows/auth-stage-q-next16-caddy-fixture.yml`, Git blob `83f643d2596b2c20a0262e6dfb17871f03e60142`.
- **GitHub result:** `# tests 6`, `# pass 6`, `# fail 0`; six test cases ran to completion and all cleanup stages completed.

## What was actually exercised

A disposable Ubuntu GitHub runner ran a **compiled Next.js 16.3.8 app in production mode**. The fixture assembler first checked 15 original Git blobs, then copied the original `proxy.ts`, complete `config/accessMatrix.ts`, `app/api/members/signin/route.ts`, `app/api/members/signout/route.ts`, `lib/auth/verifiedAccess.ts`, `lib/auth/serverSessions.ts`, `lib/auth/rateLimiter.ts`, `lib/auth/passwordUtils.ts`, `lib/db/postgres.ts`, `lib/security/authAudit.ts`, identity assertions and writer-route mapper. **Runtime authentication and authorization logic was not rewritten.** The only functional stub was an unrelated pure display-name helper that avoids importing practitioner/PHI modules.

The fixture used:

- A fresh **PostgreSQL 14** service, database `stageq_next_fictional`, user `stageq_next_fixture`, loopback runner port `5550`, with a minimal invented members scaffold and the unchanged canonical auth sessions, rate limiter and audit-log migrations.
- A genuine built `next start` server bound to **127.0.0.1:3827**, `NODE_ENV=production`, `ACCESS_CONTROL_MODE=strict`.
- A genuine **Caddy** HTTPS reverse proxy with an ephemeral self-signed certificate, standard **443** port, `bind 127.0.0.1`, `admin off`, and `auto_https disable_redirects`. Caddy forwarded requests to the Next16 server without weakening the application origin check.
- **Playwright WebKit on Linux**, with a test-only trust exception for the ephemeral certificate, and separate raw loopback HTTPS probes for missing/foreign origins.

All test data, member identities, emails and passwords were invented for CI. Production/staging endpoints, credentials, real members and existing local Mac Studio databases were not accessed.

## Six executable tests — all PASS

1. **Strict proxy:** anonymous requests to a mapped member-only API returned 401, while an unmapped member API returned strict matrix 404 before any application handler could grant access.
2. **Real password sign-in and claims:** bcrypt-backed fictional password sign-in produced a real durable PostgreSQL session and Secure/HttpOnly cookie. The genuine Next proxy propagated only database-derived member identity/free tier/member role despite forged inbound admin/pro headers; an ordinary member was refused at the admin page. Same-origin POST sign-out revoked the SQL record, expired the cookie and refused old session replay through the mapped protected route.
3. **Header-only bearer:** after removing the browser cookie, a valid header session authenticated, could sign out, and could no longer be replayed.
4. **Origin/Host and method:** null, missing or foreign Origin POST requests were refused and could not revoke a live session; unsupported GET sign-out was refused. The legitimate standard HTTPS Origin/Host combination succeeded with the original, unchanged handler policy.
5. **Genuine SQL revocation fault:** a disposable PostgreSQL trigger refused the revocation write. The actual Next route returned 503 and browser cookie clearing while explicitly recording no confirmed durable revocation; after dropping the trigger, a header-only retry revoked the session successfully.
6. **Post-issuance sign-in metadata fault:** a disposable PostgreSQL trigger made `last_sign_in` metadata unavailable after session creation. The reviewed candidate retained a truthful successful response with a durable usable authenticated session.

## Important initial failure and bounded correction

The first genuine Next/Caddy run at `6936fb9e811e77c9cbb6bf3439af8c7d8abf0670` compiled and launched, but finished **2 PASS / 4 FAIL**. Its nonstandard test origin `https://127.0.0.1:3844` encountered a portless downstream Host (`127.0.0.1`), triggering the application's **correct fail-closed 403** trust check. This is a test-environment Host/Origin mismatch, not evidence of successful malicious revocation.

The test configuration was changed to standard HTTPS port **443** so the expected URL origin and Host matched. The Caddy fixture was additionally bound explicitly to `127.0.0.1`, with unused listeners disabled. No application runtime, trust policy, protected origin list, TypeScript baseline or live Caddy configuration was altered. A superseded intermediate CI run was automatically cancelled, and is not counted as a PASS. **The only accepted Next/Caddy PASS is the exact tested commit above.**

## Boundaries that remain open

- **Not the full Soullab product build.** This is a small compiled Next16 application made from original production auth/proxy modules, with fixture pages and one display-name stub. The earlier whole-source TypeScript gate passed separately with **222 diagnostics versus 239 baselined**, without rebaselining.
- **Not Apple Safari or publicly trusted TLS.** Linux Playwright WebKit accepted an ephemeral self-signed certificate using a test exception; Safari on macOS/iOS, WKWebView and native iOS/Android credentials remain separate.
- **Not actual staging Caddy/Host configuration.** The controlled Caddyfile is disposable. The true Soullab/beta HTTPS domains, approved `AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS`, public certificate and reverse-proxy forwarding have not been verified or changed here.
- **Not a genuine full database service outage/restart or encrypted backup/restore acceptance.** SQL refusal and recovery occurred inside the disposable running database, not through PostgreSQL termination or production backups.
- **Not independent security sign-off or founder staging release authorization.** All related PRs remain drafts and protected canonical is unchanged.

## Cumulative bounded Stage Q evidence

- Combined fictional server, client, and two-transport suite **37/37 PASS** with governed whole-source TypeScript no-regression **PASS**, draft PR #1867.
- Genuine disposable SQL session/revocation cases **5/5 PASS**, draft PR #1868.
- Real HTTPS WebKit plus SQL adapter tests **5/5 PASS**, draft PR #1871.
- This compiled Next16 + real Caddy HTTPS + WebKit + SQL fixture **6/6 PASS**, draft PR #1872.

These are complementary tests, **not** full production-shape certification. Their totals must never be substituted for release approval.

**Disposition: Stage Q compiled Next16/Caddy isolated runtime PASS; Apple Safari, actual staging origin policy, native transport, independent security approval, protected canonical merge and member beta remain HOLD.**
