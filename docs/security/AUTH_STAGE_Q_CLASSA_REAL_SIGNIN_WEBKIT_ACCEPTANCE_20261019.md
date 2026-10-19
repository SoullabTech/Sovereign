---
title: "Stage Q + PR1870 — Actual password sign-in through Caddy, Next16, WebKit and SQL"
date: "2026-10-19"
status: "isolated fictional credential and browser acceptance PASS; release HOLD"
authority: "test evidence, not release approval"
---

# Actual Class A password sign-in — bounded browser/SQL acceptance

## Provenance and custody

- Draft review PR: [#1883](https://github.com/SoullabTech/Sovereign/pull/1883), targeting only draft #1882's security branch.
- **Exactly tested source commit:** `7415d798f645802cd013107edfb69af3cb04abe6`.
- GitHub Actions workflow `Stage Q Real Class A Password Signin + Caddy/WebKit (NO DEPLOY)`, run `39297850753`, job `118215297343`: **completed SUCCESS**.
- Disposable compiled Next.js 16 build ID: `nbiBBcG_yVpgEo0OwRUXX`.
- Source-copied actual Class A sign-in handler: `app/api/members/signin/route.ts`, blob `4ea14beb385e83320cf6e586f990784fe47aacd8`.
- Reviewed real dependencies: bcrypt password utilities `98903d10eeb350c552171bee4b99a05a76603da5`, rate limiter `e17611b5b1fd6fce793256151884ae0c92d915c2`, authentication audit `4010df2a6fd016a4a436f8509dbfebfe105ab371`.
- PR #1870 verified-access resolver remained blob `6a0821fedf2e921d2d7e7091cdb73da11d197296`, Stage Q strict signout remained `5ef39a974759dc5d4f60bf5bf2eea375c7e7451e`, Caddyfile remained `9cffaa85d5b42a05cd1de7eb0726d8435b3e5b69`.
- Test fixture builder Git blob `cf77794e8431f957326254c7299d8c799e11bb48`; executable browser test blob `6f846d817cc8960bbe59ad723e1770ac057804db`; test-only workflow blob `2c56d635cd7956a728b8a267ecc8be3ac830d182`.
- No authentication application source files changed relative to the already reviewed #1882 parent; changes were confined to the reduced Next fixture, tests, and dedicated CI configuration.

## Exact execution outcomes

GitHub job logs establish all steps succeeded:

| Source-pinned acceptance | Outcome |
| --- | --- |
| Full MAIA/Studio browser sign-out helper and source wiring | **15/15 PASS** |
| Class A dual-credential fictional contract tests | **9/9 PASS** |
| Actual Caddy 2.10.2 + compiled Next.js 16 + Linux WebKit over ephemeral HTTPS + PostgreSQL 14 | **12/12 PASS** |
| Strict whole-source TypeScript no-regression | **PASS** |
| Reduced Next build, Caddy source derivation and fixture cleanup | **PASS** |

**36 tests, 36 passed, zero failed.** The TypeScript check covered **4,722 files**, observing **222 diagnostics against the existing baseline of 239**; it was not changed to absorb errors. Next built source `nbiBBcG_yVpgEo0OwRUXX`.

The first nine Caddy/browser/SQL tests were re-executed unchanged in their intent, now obtaining sessions through the **actual PR #1870 password sign-in handler** instead of the earlier fictional substitute handler.

Three additional browser/SQL falsifiers passed:

1. **Incorrect password:** a real bcrypt-verified fictional password mismatch returned HTTP 401. No new SQL session row or browser `maia_session` was issued.
2. **Post-issuance metadata failure:** a real PostgreSQL trigger refused `UPDATE members SET last_sign_in`. The handler retained its already committed session, returned typed `success:true` HTTP 200, and delivered a Secure/HttpOnly session cookie rather than misreporting HTTP 500.
3. **Session insertion failure:** a disposable PostgreSQL trigger refused `INSERT INTO auth_sessions`. The handler returned HTTP 503 without `success:true`, a session body, or an issued browser cookie.

The test used a newly created fictional-only PostgreSQL database, actual canonical auth-session/rate-limit/audit migrations, bcrypt-hashed synthetic passwords, and a source-derived real Caddy apex configuration on loopback. Actual site domains and existing staging, production, member, voice, memory or privacy data were not accessed. All containers, fixture files and ephemeral TLS resources were cleaned up.

## Precise limitations and release boundaries

- **Not Apple Safari.** The browser was Playwright WebKit on Linux with explicit trust for a temporary self-signed certificate; macOS/iOS Safari and WKWebView still require distinct acceptance.
- **Not the full Soullab product build.** The Next.js app was a **compiled reduced fixture**. It carried the actual authentication routes, bcrypt, rate limiter, audit writer, middleware/proxy/access matrix/session modules and signout code, but not the complete MAIA/Studio/Reflect rendered application.
- **One display helper was source-extracted.** The narrow `resolveMemberDisplayName` function was extracted directly from the source `lib/stellium/clients.ts` so the auth-only fixture would not import the broader practitioner/PHI subsystem. Its provenance was recorded in the fixture manifest. This is not a claim to have tested the entire original practitioner module.
- **No production Caddy/TLS/staging.** The Caddy source was transformed only for a fictional domain, local upstream, ephemeral TLS and disposable logs. Real deployed Host/Origin forwarding and public certificate validation are separate.
- **No real identity or recovery authority.** Test passwords, member rows, and sessions were fictional; the trigger refusals are SQL faults, not encrypted backup restore or a real account-recovery witness.
- The current staging compose still declares HTTP port 8090 and production-shared infrastructure; it is **not** a safe authentication fault-injection destination.
- PR #1870 plus Stage Q remain review candidates. Protected canonical merge, independent runtime image attestation, privacy and deletion/recovery gates, native transports, any expanded beta, and release promotion need their own exact-SHA process. During the single-steward beta phase founder approval may satisfy the constitutional Class A approval arithmetic, but this record is **not** such approval.

**Disposition: integrated Class A password/session/signout Caddy/Next/WebKit/SQL fictional acceptance PASS 36/36. Release, native clients, staging and real members HOLD.**
