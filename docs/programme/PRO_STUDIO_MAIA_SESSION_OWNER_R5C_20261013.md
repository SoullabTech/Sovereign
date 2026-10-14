# Pro Studio R5c — MAIA Session-Start Ownership Security Correction

Date: October 13, 2026
Standing: **ISOLATED CORRECTION CANDIDATE — independent Class A security and beta deployment HOLD**

## Proven negative finding in frozen R5b
Exact prior source SHA `f21f8cc569ff7322fa1787d0af92f024368d7dc1`.
Actual Next.js 16.3.8 production compiled route
`POST /api/maia/session/start`, local loopback HTTPS,
restored **fictional PostgreSQL16**, two fictional UUID members:

1. No auth cookie + body member A: HTTP 200, durable session assigned A.
2. No auth cookie + same session ID + body member B: HTTP 200, owner overwritten to B.
3. Valid authenticated cookie A + body member B: HTTP 200, owner B persisted.

This confirms MAIA session attribution is client-asserted and mutable, not
derived from verified server member identity. It does NOT prove cross-member
text retrieval, possession of another person's credential, or exposure of
real member data. No production service/data was accessed by the negative test.

## Narrow R5c correction (one route, additive tests)
- Resolve authoritative member via `getCurrentSession()` with revocable,
  unexpired server-backed `auth_sessions` token.
- Member claims made without a verified session receive HTTP 401.
- Member claims contrary to that verified session receive HTTP 403.
- Missing member claim with valid cookie derives the authenticated member.
- Genuine anonymous guest sessions remain memberless; optional guest anon ID
  is limited to a string and cannot upgrade the guest to an authenticated member.
- The unique-session-ID upsert can refresh an existing session ONLY when
  the stored member and anonymous identifier exactly match the incoming
  canonical identities. No `COALESCE(EXCLUDED.member_id,old.member_id)`
  reassociation. A cross-owner conflict returns HTTP 409.
- No new database migration, trust-header shortcut, secret, provider capability,
  member attribute or consent grant introduced.

## Technical acceptance to freeze against exact revision
- 9 source-isolated Jest tests cover unauthenticated claims, A/B mismatch,
  verified identity, no member claim, guest identity, revoked/back-end failure,
  invalid input, and no-match session ID collisions.
- Real disposable PostgreSQL16 + Next.js application route, localhost HTTPS:
  authenticated A accepted with owner A; B ownership and guest collision
  rejected; guest remains guest; revoked session rejects membership; concurrent
  A/B session ID collision returns exactly one HTTP 200 and one HTTP 409.
- Await exact revision's app-wide no-regression TypeScript, local production
  build, full React browser Home/House/MAIA guard tests, and recovery-failure
  negatives before technical release qualification is claimed.

## Explicit known limits
- Guest anon ID alone is still client-controlled and is NOT an authentication
  credential. Guest session lifecycle and session-ID entropy need further
  independent review before claiming cross-anonymous privacy isolation.
- Downstream session finalization/summaries, `TurnsStore.getSessionTurns`,
  derived memories, R4F chart retention/recall permissions, and complete MAIA
  conversation/voice consent are **NOT qualified** by session-start fixes.
- Browser account guards prevent accidental stale UI; hostile in-origin JS
  holding a valid cookie retains that member's authorized JSON rights.
- A PostgreSQL fictional backup-and-restore is not R20 deletion-safe durable
  signer/recovery acceptance; historical backups can reintroduce revoked data.

## Release stop
No merge, push, production/member data write, live feature flag, invitation,
billing or schema migration may proceed from this document. Qualified human
Class A security/privacy review, R20, full MAIA conversation, physical Safari,
deployed image digest/cache and rollback, tester consent and separate
founder/operator exact-artifact GO remain outstanding.

GitHub tracker: https://github.com/SoullabTech/Sovereign/issues/1816
