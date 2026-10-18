---
title: "Stage P — isolated sign-out and session-issuance security correction"
date: "2026-10-18"
status: review-only
authority: security-candidate
release: HOLD
---

# Stage P — Authentication correction: verified in isolation, not released

**Protected starting point:** `clean-main-no-secrets`, commit `6a144edabc686afc9b99828726c214dc7800158f`  
**Isolated code branch:** `security/auth-signout-session-issuance-review-20261018`  
**Fully tested code state before this witness:** `3fdf0fb6f2927222acdd830010f31f82596158eb`  
**Date:** 2026-10-18  
**Owner policy:** actual Soullab founder remains sole release operator. No promotion, deployment, production change, real-member use, or live credentials are part of these tests.

## Scope of the candidate (three runtime files plus tests)

1. **`config/accessMatrix.ts`** — declares an **exact** public `/api/members/signout` rule. This is necessary because expired/revoked/anonymous browser sessions must be able to clear credentials while `ACCESS_CONTROL_MODE=strict`; an authenticated-only outer gate cannot serve those states. The change does **not** open the whole `/api/members` namespace, permit other methods, or grant founder roles. The POST handler is separately responsible for CSRF/refusal.
2. **`app/api/members/signout/route.ts`** — conservative web-only sign-out. The POST requires a well-formed `Origin`, an exact match in **server-only** `AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS`, a matching incoming `Host`, and an `Sec-Fetch-Site` value of `same-origin` when present. Missing, null, foreign, same-site-but-cross-origin, and cross-site requests are refused. No CORS credential wildcard or inferred native `Origin:null` exception. All four browser auth cookies expire. The route updates `auth_sessions` only when the token is not already revoked; it reports `serverSessionRevoked:true` only when PostgreSQL confirms an updated row. A database error returns **503**, `success:false` and `localCookiesCleared:true` while explicitly disclosing that durable server revocation is not proven. Stale and absent cookie cases may successfully clear locally but report `serverSessionRevoked:false`.
3. **`app/api/members/signin/route.ts`** — a password check without a completed durable server session is not a successful login. Session creation/cookie-issuance failures return **503** with `success:false`, never a token or `success:true`. If a session was created before issuance failed, the route attempts `revokeSession` compensation and cookie expiry, recording an unconfirmed compensation without exposing raw credentials or database errors. The new failure audit uses the existing typed action `signin_failed`, rather than adding another occurrence of the protected source's preexisting invalid `password_signin` audit type.
4. **`docs/security/auth-signout-session-failure-contract.test.cjs`** — eight committed, repeatable no-network unit tests executing the actual TypeScript route functions with explicit fictional dependencies.

All other account APIs, `lib/founder/founderAuth.ts`, `lib/auth/serverSessions.ts`, `proxy.ts`, Sanctuary privacy settings, the Wisdom page, Circle membership, keeper source permissions, and production deployment configuration are **unchanged**.

## Why the Origin check was corrected twice

The first review candidate compared the trusted `Origin` to `request.nextUrl.origin`. In the running Next.js 16 fixture, `NextRequest.nextUrl.origin` **normalized `127.0.0.1` to `localhost`**, causing a real same-origin sign-out to return 403. This was caught by an HTTP test, not inferred. The patch now uses the server-configured trusted-origin list as its *authority* and the incoming `Host` as a **secondary equality check**, not as an alternative source of trust; spoofed forwarded-host assertions never augment the approved list. No production reverse-proxy Host behavior has been assumed: staging must separately verify the correct public `Host`/Origin handling behind Caddy before promotion.

**Important release dependency:** if `AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS` is absent, sign-out **refuses**. This is intentional fail-closed behavior, but means the branch may not be merged/deployed until the actual approved HTTPS origins and their edge forwarding have been verified/configured in a separate founder-controlled release procedure.

## Actual test environment

All runtime tests used the authorized Mac Studio, **not** production:

- A fresh **PostgreSQL 14.19** instance accessible only via a private Unix socket `/tmp/soullab-auth-rev-pg-r1/socket/.s.PGSQL.5561`; no test database TCP port was opened. Existing database listeners on `5432` and `5433` were not touched.
- Two fictional bcrypt-backed identities with random passwords under `/tmp`, both unrelated to real Soullab members. Actual protected auth-session, rate-limiter, and audit migrations were applied to the disposable schema.
- A reduced, compiled **Next.js 16.3.8** app on `127.0.0.1:3827`, running the exact protected proxy, real password/session DB client code, and the **three corrected candidate files**. The sign-in display was a clearly identified local test page, not Soullab's full `UnifiedAuth`. That fixture's build skipped full TypeScript validation; the independent governed type gate below was separately enforced.
- A loopback-only, **temporary self-signed HTTPS test proxy** on `https://127.0.0.1:3830`, using an ephemeral key/certificate that must not be published or adopted in production. HTTPS was necessary because real production-mode `maia_session` cookies use **Secure**, which WebKit correctly did not preserve over the initial plain-HTTP fixture. We did **not** disable the Secure attribute.
- No live member data, actual founder login, commercial API, Circle, keeper outreach, or multi-person video service was connected. The Mac Studio's earlier founder design preview on `127.0.0.1:3817` stayed separate.

## Verified results

**A. Real PostgreSQL and HTTP: PASS** on the exact corrected build.

- Valid fictional founder password created a persistent PostgreSQL session and a **Secure, HttpOnly** cookie. The founder-only Gather Together route returned 200.
- Valid ordinary fictional member obtained a separate session but received 404 at Gather Together. Forged admin/tier HTTP claims remained member/free under the protected proxy.
- Requests with no Origin, `Origin:null`, foreign Origin, same-site-but-cross-origin request metadata, and other untrusted assertions were refused with 403.
- Legitimate, configured same-origin sign-out returned 200, `serverSessionRevoked:true`, and expired the browser cookies. SQL recorded `revoked=true`, a revocation time and `user_signout` reason. **Replay of the old session returned 404**.
- A second sign-out with that already-revoked token, and a no-token sign-out, cleared locally without falsely claiming a new server revocation.
- GET sign-out is not accepted as a POST action.

**B. Safari/WebKit over local HTTPS: PASS** against the compiled Next.js app and real temporary SQL backend.

- Browser accepted and carried the actual **Secure, HttpOnly** session cookie over HTTPS.
- Founder could enter the real rendered React Gather Together review and switch its four stages.
- Browser sign-out revoked that durable session; old-session replay denied.
- Ordinary member remained denied founder access; mobile-sized WebKit keyboard interaction had no horizontal overflow.
- The browser recorded **no external requests or JavaScript errors**. This is not a production TLS/certificate or native iOS validation.

**C. Eight repeatable, isolated no-network tests: PASS (8/8).**

They exercise the unchanged route entrypoints with explicit in-memory substitutes for dependency failures: no login success on session insert failure; compensation on cookie-issuance failure; failed-compensation refusal; normal login success; bad-Origin rejection before any cookie/DB work; 503 plus cookie clearing when DB revocation is unavailable; true/false status for updated/stale/absent sessions; and default-deny when trusted web origins are unconfigured. These simulate faults and **do not prove real PostgreSQL outage recovery**.

**D. Full-source governed TypeScript gate: PASS.**

An independent disposable full protected-source archive plus the corrected three-file patch and the existing Gather Together preview ran Soullab's own unchanged `scripts/check-typehealth-baseline.js` under a no-network sandbox. After correcting the one new audit-action mismatch in the candidate, the gate reported:

- `tsconfig.ship.json`: **4,720** files, **222** diagnostics versus **239** baselined
- **No new TypeScript regressions** (gate exit 0)
- 763 additional checked source files versus baseline; 17 fewer baseline errors
- `typecheck-baseline.json` **not changed**, SHA-256 `aeb69e1691889f2aca4add80471e95361d9612cdbf28da894265c524cb6c9666`

The first gate run correctly failed because the new failure-audit line increased an existing `TS2322` audit-action mismatch from three to four occurrences. Rather than re-baselining or widening `AuthAction`, that added line was changed to the existing `signin_failed` type, and the gate passed on repeat.

## Remaining blockers — do not merge or deploy yet

1. **Independent security sign-off** of the exact three-file diff is not yet obtained. A code review by the same assistant is not an independent reviewer.
2. **Real database failure injection:** a larger disposable SQL fault-injection tool request was blocked by tool safety controls and was not rerun by bypassing those controls. Real PostgreSQL failure/recovery and mixed cookie-write failure were only simulated in isolated function tests; a true fault-injection acceptance is **not** claimed.
3. **Native session revocation:** web-only Origin discipline deliberately refuses native `Origin:null` or missing Origin. Native header bearer tokens and verified native-origin authority need a *separate* reviewed transport-specific solution. Do not add blanket `Origin:null` allowances to this web handler.
4. **Existing client sign-out UI:** MAIA, Studio account and Account Popover callers catch sign-out failures and continue local cleanup. A 503 means **the server token may remain live**, and the UI currently risks implying full sign-out. The client experience must represent `localCookiesCleared` separately from `serverSessionRevoked` and preserve an actionable warning/retry path. Do not silently modify those wider client routes under this narrow review branch.
5. **Production origin configuration:** approve exact HTTPS site/beta origins and verify actual trusted reverse-proxy Host preservation and cookie paths; `AUTH_SIGNOUT_TRUSTED_WEB_ORIGINS` currently defaults to deny.
6. **Whole-product candidate build:** Stage N previously passed the entire Next16 offline application build using the Gather preview without these auth corrections. Stage P verifies a smaller current-source integrated Next16 build and the full-source type-health gate, **not** a separate full-app production-mode build with this exact auth branch.
7. **Actual founder staging identity:** no real account/credential, production PostgreSQL, live staging login or persistent deployment was used. Circle cohort admission, private multiperson video, keeper permission and copyrighted source ingestion remain separate release gates.

### Disposition

**Exact-path web sign-out, durable SQL revocation, genuine founder/nonfounder separation, HTTPS/Safari cookies and baseline-no-regression: ISOLATED PASS.**

**Production/release/native/real-founder authentication: HOLD**, pending independent review, explicit origin configuration, native and member-UI compatibility, true recovery acceptance, and separate founder-controlled promotion.
