# Stage Q — genuine Next.js 16 strict-proxy HTTPS acceptance
Date: 2026-10-19
Disposition: ISOLATED PASS — RELEASE HOLD

## Exact executable witness
- Tested commit: `de9028b6d4b35f91d21730c3eb6676f461377f30`.
- GitHub Actions: `Stage Q Next16 Strict HTTPS Fixture (NO DEPLOY)`; run `39269331617`, job `118117927609`; **SUCCESS**.
- Compiled Next.js 16 disposable application BUILD PASS: `d11x7b74aeSW4cp8gP9fH`.
- Runtime tests: **6 tests / 6 passed / 0 failed** (verified from GitHub job logs).
- CI workflows for tested SHA: sovereignty, diagram, labeling, covenant, Docker build and dedicated Stage Q Next16 workflow completed successfully.

## Covered
1. Strict actual Next proxy refuses anonymous protected Writer's Studio room and unmapped member API.
2. Actual Next session cookies were Secure/HttpOnly; member tier/role claims server-derived; sign-out revokes PostgreSQL session and old bearer replay cannot regain access.
3. GET, null/missing/foreign origin and cross-site sign-out attempts refused.
4. Cookie/header sessions revoked individually; conflicting credentials fail closed.
5. Real SQL-triggered revocation refusal returns 503 with cookie expiration; retry restores durable revocation.
6. Expired/already-revoked fictional sessions can clear cookies without fabricating new server revocation.

The test fixture assembled exact reviewed `proxy.ts`, `config/accessMatrix.ts`, `lib/auth/verifiedAccess.ts`, `lib/auth/identityAssertions.ts`, `lib/auth/serverSessions.ts`, `lib/db/postgres.ts`, and `app/api/members/signout/route.ts` source with a **test-only** sign-in path and minimal private page. It ran as a compiled Next.js 16 application behind ephemeral HTTPS forwarding, using Playwright WebKit on Linux and PostgreSQL 14 containing only fictional records. The test sign-in handler was a fixture, not the real UnifiedAuth and full app login.

## Limitations
- Not a full production-shaped Soullab build or deployed Caddy configuration.
- Not Apple Safari on macOS/iOS, native Capacitor, or publicly trusted beta TLS.
- No live founder/member accounts, client privacy data, actual production PostgreSQL, real database server crash/restart or independent human security approval.
- Next build fixture configured its own minimal app and `typescript.ignoreBuildErrors`; the governed no-regression TypeScript gate for the combined auth candidate passed separately at `0ff7e2b4765cdf3402324843f5074efb5977defa`.
- Prior acceptance remains distinct: 37/37 fictional client/server contracts, 5/5 genuine PostgreSQL and 5/5 Linux WebKit+SQL. Their totals are not proof of a full production end-to-end test.

## Remaining release gates
1. Exact-domain and Host/Origin behavior behind actual staging Caddy with valid TLS, approved fictional test identity and no real member admission.
2. Apple Safari validation, separately native iOS/Android authority.
3. Independent security review of combined authentication changes, then separate founder authorization for promotion and release.
4. Full-product build, recovery and applicable privacy/consent acceptance.

**RELEASE HOLD.** Protected canonical, production and member beta remain unchanged; PR #1874 stays a draft.
