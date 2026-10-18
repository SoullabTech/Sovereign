# Stage K — Real Soullab session code with isolated Next.js 15 and PostgreSQL

**Date:** 2026-10-18 EDT  
**Research branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Pinned branch source:** `ae6e0e8f602dd909afc2c9effb34e2db7234c53b`  
**Middleware source:** tracked canonical checkout `e886888416062c7fcbcf899040e3827bc8013835`; local git blob `3a2020d67a0a4c2c4d6dc5d43ad6ff6849c598c8`  
**Status:** **Isolated real-session/real-database/real-browser acceptance PASSED. Real founder sign-in, full Soullab product build, production access and beta release NOT performed.**

## The question tested

Can the **actual existing Soullab founder route and authorization chain** admit a verified, unexpired session belonging to a server-allowlisted founder, reject a separate authenticated visitor (including a fixture admin role), and deny old sessions after revocation?

The earlier Stage I and J Mac Studio demos had run the original `requireFounder()` code but replaced the session provider with fictional HMAC-cookie validation. Stage K removes **that particular simulation**: the production source for session creation, validation, revocation, PostgreSQL queries, founder allowlist and the page are all compiled and executed.

**Critical limit:** The initial session *issuer* is still a synthetic endpoint that intentionally grants only **fictional local database accounts** for testing. This is **not the founder's real password, OAuth, passkey, or actual Soullab member sign-in**. No real customer, account record or bearer token was fetched, copied or used.

## What actually ran

An independent application was created at

`/tmp/soullab-wisdom-real-auth-fixture-20261018-v1/app`

on the authorized Mac Studio, with an isolated PostgreSQL 14.19 database at **127.0.0.1:54393**. The Next.js application ran at **127.0.0.1:3821**. Both were created under temporary, access-restricted directories; neither was connected to any Soullab production server or existing local database.

**Exact copied modules from pinned research branch:**
- `app/wisdom-keepers/wisdom/gather-preview/page.tsx`
- `components/wisdom/WisdomGatherFounderPreview.tsx`
- `lib/wisdom/wisdomGatherPreview.ts`
- `lib/founder/founderAuth.ts`
- `lib/auth/serverSessions.ts` — **real** `createSession`, `validateSession`, `getCurrentSession`, `revokeSession`, `getSessionFromCookie`
- `lib/auth/passwordUtils.ts`
- `lib/db/postgres.ts` — **real** PostgreSQL driver and parameterized `query`
- `lib/auth/identityAssertions.ts`, `lib/auth/verifiedAccess.ts`, `config/accessMatrix.ts`

**Middleware:** copied from the clean, tracked local canonical checkout at its separately recorded commit. It was **not represented as a source file from the older divergent Perry branch**. Nothing was merged or rebased.

**Local-only fixture additions:**
- A precise Next.js `next.config.mjs` preflight **refuses to build/start** unless `DATABASE_URL` points to the isolated `postgresql://wisdom_fixture@127.0.0.1:54393/wisdom_gather_fixture` identity, with the exact expected database name, role and loopback host. This prevents falling through to the live module's local-default database connection.
- A minimal `/signin` informational page and `/api/members/signin` fictional test session issuer, **not** copied from the actual production sign-in flow. The issuer is only enabled by a local-only flag, requires exact loopback host, exact same-origin Origin and a fixture-specific request header. No passwords or real member lookups occur.
- Two **invented** member rows in a fresh `members` table and fresh `auth_sessions` table: one free-tier, member-role fictional founder on an isolated founder allowlist; a second pro-tier, admin-role **nonfounder**. This intentionally proves the founder gate is not an ordinary client/admin role.
- Sessions issued via **Soullab's original `createSession` function** are actually stored in PostgreSQL, read via `validateSession`, and revoked via `revokeSession`. The test response places the real session token into the actual `maia_session` cookie for the **local temporary HTTP origin**. Its `secure:false` transport adaptation applies only to local loopback HTTP; Soullab's actual production `setSessionCookie` code is unchanged and uses secure cookies in production.
- The temporary database password and server-only fictional founder allowlist exist only in a mode-600 `.env.local` in the disposable app and a private password file. No credentials or session tokens are printed here or entered into the Git repository.

**Exact build:** Next.js **15.5.11**, React **19.1.1**, PostgreSQL client `pg 8.23.0`, real middleware and route compiled in an optimized `next build` with a passing TypeScript check. The dependency install included a native `@next/swc-darwin-arm64 15.5.7` binary, the version listed in this particular Next.js 15.5.11 package's optionalDependencies; Next emitted a **nonfatal version-mismatch warning**. Do not describe the full canonical app build or dependency/lockfile reconciliation as complete.

## Exact acceptance evidence

**Live HTTP against the real Next.js 15 + PostgreSQL process:**
- Missing session → protected `Gather Together` route responds **404**.
- Forged member/role headers or `maia_member_id` without a verified session → **404**.
- Cross-origin fictional sign-in request → **403**; missing fixture-only request header → **403**.
- Valid PostgreSQL session belonging to an **admin-role nonfounder** → **404**, proving ordinary role/tier does not grant founder authorization.
- Valid PostgreSQL session belonging to the **server-allowlisted fictional founder** → **200**; the rendered page carries the true founder-review copy.
- Fabricated or malformed `maia_session` cookie → **404**.
- Session rows confirmed in the **isolated**, disposable PostgreSQL `auth_sessions` table. No production database activity.

**Actual Playwright WebKit against the running optimized Next.js 15 app:**
- Anonymous / query-claimed founder → **404**.
- Visitor session persisted through an actual PostgreSQL row but cannot enter the founder page → **404**.
- Fictional founder session persisted through PostgreSQL and opens the real route → **200**; the client hydrates and all four stages respond correctly.
- **Actual `revokeSession` updates the isolated database**, making the founder page return **404**. Manually replaying the previously valid cookie still returns **404**.
- Mobile 390px keyboard activation, no horizontal overflow, **no external browser network** and **no browser JavaScript errors**.

Combined WebKit result marker: `REAL_NEXT15_VERIFIED_SESSION_FOUNDER_ACCEPTANCE_PASS`.

The exact middleware module was included in this built application. The `/wisdom-keepers` access-matrix prefix itself is currently declared public; the **nested page's verified `requireFounder()` check is essential** and remains unchanged. No researcher should assume the middleware's route classification itself establishes founder-only access.

## Tests not performed / open release issues

1. **The real founder has NOT personally authenticated in this staging app.** Its test issuer has no password validation, Google/Apple OAuth, passkey, or real account connection. The user being the real founder does not authorize creating or forging a real Soullab session.
2. This is a **minimal exact-version integration of selected modules**, not a complete Next.js 15.5.11 `Sovereign` application build with all current services, middleware context, routing, cookies, configurations, and canonical locked dependency tree.
3. PostgreSQL downtime/fault injection and forced token-expiry mutation were *not completed* in this pass; do not claim either. The revocation path **was** demonstrated against a real PostgreSQL fixture.
4. The standalone test issuance cookie uses `secure:false` only for loopback HTTP. Production requires HTTPS with `secure:true`, and the complete Safari credential-delivery contract, middleware and cross-app cookie scope must be verified on the full combined build.
5. The project’s review branch remains four canonical commits behind at the earlier custody check. Do not merge its large source history blindly; integrate only the bounded Gather preview/route after reconciliation and independent security review.
6. Current Commons Circle UI and API remain founder-only. No cohort, member, keeper or meeting admission was enabled. The existing Soullab group/hybrid media still lacks a verified scoped multiperson 6–8-person privacy acceptance.
7. Glenn Perry remains unaffiliated. No outreach, copyrighted book corpus admission, embedding, recording, clinical service, member invite, database migration or production deployment was done.

## Recommended continuation and cleanup

- Perform an independent review of **real middleware + route**, forged-identity handling, cookie attributes, PostgreSQL session ownership and disabled/default-off behavior on the intended path.
- Reconcile the exact current canonical app and run a **full isolated build**; use fictional users to verify Safari sign-in, founder allowlist, session expiry/revocation, denied visitors and server flag behavior.
- Only with a **separate, explicit staging access authorization** should the real founder sign into an approved nonproduction Soullab environment using Soullab's actual sign-in. Never ask them to reveal passwords, session cookies, access headers or production secrets in chat.
- Once evidence is recorded, dispose of the temporary staging API that creates fictional sessions without credentials and the isolated PG service. Keep the earlier Stage J visual localhost preview separate.

**Disposition:** Existing Soullab session, database and founder authorization implementation has been verified end-to-end on an exact-version isolated build and in real Safari WebKit with fictional identities. **Real founder verification, full-app acceptance, and member rollout remain HOLD.**
