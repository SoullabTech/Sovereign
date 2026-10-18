---
tier: 4
authority: derivative
source_type: research
title: "Stage O — real disposable PostgreSQL sign-in and sign-out gate"
author: "Soullab isolated security acceptance for founder review"
version: "0.1"
date_added: "2026-10-18"
status: review
safe_for_retrieval: false
---

# Stage O — Genuine PostgreSQL authentication exercised; sign-out route HOLD

**Date:** 2026-10-18 EDT  
**Source:** `SoullabTech/Sovereign`  
**Pinned protected source:** `6a144edabc686afc9b99828726c214dc7800158f`  
**Gather Together research:** `research/glenn-perry-wisdom-candidate-20261017`  
**Disposition:** **Password sign-in, session issuance, and founder/member boundary witnessed against disposable PostgreSQL. Sign-out route reached HTTP 404 under the strict access matrix. Release HOLD.**

## What was actually used

The authorized Mac Studio hosted a **fresh, private PostgreSQL 14.19 instance** at `/tmp/soullab-wisdom-pg-fixture-20261018-r1`. It had:

- A distinct PostgreSQL data directory and **Unix socket only** on private path `.../socket/.s.PGSQL.5547`, permission-restricted under a `0700` parent. **No TCP listener** and no connection to the existing local PostgreSQL `5432` or Docker-owned `5433`.
- Two *entirely synthetic* member rows with random bcrypt passwords, generated for this acceptance only. No owner/founder/member account, personal name, email, password, production session, or MAIA record was imported.
- The existing canonical migrations `database/migrations/20260119000001_auth_sessions.sql`, `20260119000004_auth_rate_limits.sql`, and `20260828000001_audit_logs.sql` **applied unchanged** after creation of a minimal fictional `members` scaffold. This is not a full production-schema migration or full membership database.
- The actual Node `pg` driver connected through the explicitly verified Unix-socket `DATABASE_URL`. No fallback TCP connection was permitted.

A **separate disposable Next.js 16.3.8 test app** at `/tmp/soullab-gather-realpg-next16-20261018-r1` compiled successfully (exit 0) with the **unchanged current source** for `proxy.ts`, `config/accessMatrix.ts`, `lib/auth/verifiedAccess.ts`, `lib/auth/identityAssertions.ts`, `lib/db/postgres.ts`, `lib/auth/serverSessions.ts`, `lib/founder/founderAuth.ts`, `lib/auth/passwordUtils.ts`, `lib/auth/rateLimiter.ts`, `lib/security/authAudit.ts`, and the original `app/api/members/signin/route.ts` and `app/api/members/signout/route.ts`. The same staged Gather Together page/component/source modules were present.

**Scope honesty:** The test app used a minimal fictional login screen rather than Soullab's full `UnifiedAuth` front end, and a small test-only excerpt of the pure `resolveMemberDisplayName` function instead of loading unrelated PHI/practitioner code. Its Next build used test-only `typescript.ignoreBuildErrors` because the canonical sign-in route has pre-existing TypeScript diagnostic debt. The independent Stage N full source build and governed type-health PASS remain distinct. This was an **auth-focused genuine-PostgreSQL runtime test**, not a full-product or real founder login.

## Actual HTTP and SQL outcomes

The test app listened on **127.0.0.1:3822**; database access remained private to the socket. In its actual compiled Next.js request pipeline:

1. **Anonymous founder preview:** `GET /wisdom-keepers/wisdom/gather-preview` → **404**.
2. **Unknown fictional username and wrong fictional password:** `POST /api/members/signin` → **401** in both cases, with **no session row created** for either failed credential.
3. **Correct fictional founder password:** original bcrypt verifier and `createSession()` executed real SQL successfully → **HTTP 200**, signed-in member ID matched the fixture's server allowlist, a real `auth_sessions` record was created with unrevoked/unexpired state, and the server issued a **Secure, HttpOnly `maia_session` cookie** (plus member access cookie).
4. **Founder session:** `GET /wisdom-keepers/wisdom/gather-preview` with that session → **200**, rendering the review component.
5. **Correct fictional ordinary-member password:** sign-in → **200** with a separate database-backed session. Founder preview → **404**. A member-only test route → **200**, with role/tier derived by the real proxy from PostgreSQL, not asserted by the caller.
6. **Forged member-side role/tier:** client `X-Access-Roles: admin` and `X-Access-Tier: pro` were stripped/replaced by the proxy's real `member` and `free` claims; a conflicting `X-Member-Id` was refused with a **307 sign-in redirect**.
7. **Actual sign-out endpoint:** `POST /api/members/signout` → **404**. The handler exists in the build, but the current strict `config/accessMatrix.ts` contains an exact rule for `/api/members/signin`, **not** for `/api/members/signout`. Consequently the proxy refuses the latter as an unmapped route before the handler revokes the session or clears cookies.

Final **aggregate-only** fictional database observation: 2 fictional members, **2 sessions**, **0 revoked**, 4 password-signin audit rows, and 0 remaining rate-limit rows (the canonical limiter was exercised and successful sign-ins reset its durable attempts). This means **successful database revocation was NOT established**. A separate attempt to perform a narrower follow-up runtime revocation witness was stopped by safety checks and was not counted as evidence.

No real credentials were used. The test did **not** verify genuine Safari Secure-cookie login over HTTPS, production cookies, actual `UnifiedAuth`, full application startup against this database, or Circle/video admission.

## Precise security/release blockers

**O-1 · Sign-out access boundary — CONFIRMED by live isolated test.** The strict outer matrix omits the exact sign-out route. Do **not** open an entire `/api/members` prefix or grant members founder privileges to fix it. A separate **founder-reviewed, isolated code-only** correction should decide an exact-path/method classification and provide a conservative origin/CSRF policy. Log-out must be meaningful even for stale or revoked cookies: local cookie clearing and durable server-side revocation have different guarantees and must be disclosed appropriately. Test ordinary member/founder, anonymous/expired/revoked, malformed cookie, foreign/null/missing Origin, native bridge, and sign-out failure during a database outage before promoting.

**O-2 · Sign-in success semantics — CODE-REVIEW FINDING, not a completed fault-injection test.** In the protected `app/api/members/signin/route.ts`, the `createSession()` call is inside a catch that explicitly says *continue without session*, followed by an unconditional `success: true` response. Under a session-insert failure, that branch appears capable of telling a client that sign-in succeeded without issuing a durable server session. This needs its own isolated failure-injection acceptance and explicit founder/security decision; **do not** claim it has already failed in production.

**O-3 · Full staging release is still separate.** The isolated runtime was intentionally limited to password-signin and authorization. It did not run the entire protected application against a production-shaped disposable database, conduct an actual browser `UnifiedAuth` flow over valid HTTPS, or establish genuine founder account identity. Stage N previously passed full-app **offline build and governed no-regression type health**, not this missing runtime acceptance.

The larger Sanctuary source-of-truth issue and Circle cohort admission remain independent blockers. Glenn Perry remains an unaffiliated reference; no keeper hosting, copyrighted text extraction, invite or session recording occurred.

## Cleanup and custody

After collecting only aggregate outcomes, the test Next.js process at `127.0.0.1:3822` was stopped by its verified PID; the disposable PG14 data cluster was stopped via its own `pg_ctl -D` path; the private socket was confirmed gone. Both temporary application/database directories, including synthetic plaintext fixture passwords and issued session tokens, were removed. The existing PostgreSQL/Docker listeners on **5432/5433** remained untouched.

The separate original founder-only design preview at **`http://127.0.0.1:3817/fixture`** continued to return **HTTP 200**. The main Mac Studio `MAIA-SERVICE-FIRST` worktree stayed clean. No protected branch, production deployment, real member data or environment credentials were modified.

## Proposed next bounded authorization

Open a **separate isolated auth-security correction review** for O-1 and O-2, based on current protected source, rather than silently expanding the long-running Perry/Wisdom research branch. Correct the exact access and session-success semantics, enforce origin/CSRF policy with demonstrated web/native compatibility, and complete real SQL-backed tests for sign-in, sign-out, session revocation and database failure. Once independently verified, reconcile with canonical under the founder's release approval. **Do not enable real founder staging sign-in until these boundaries are accepted.**

**Stage O outcome:** Actual SQL-backed sign-in and founder restriction **PASS**; session revocation by sign-out **BLOCKED**; production and member beta **HOLD**.
