# MAIA R5d — Voice Member Identity and Safari Session Authority

Date: 2026-10-13
Standing: **ISOLATED SOURCE CANDIDATE — NOT MERGED/DEPLOYED, CLASS A HUMAN + BETA HOLD**

## Exact predecessor
- R5b member account browser correction: `f21f8cc569ff7322fa1787d0af92f024368d7dc1`.
- R5c session ownership correction: `144f3c867c3131fe8dbd2ebed8ad10230be5235b`.
- Separate R5d branch: `fix/pro-studio-r5d-voice-auth-authority-20261013` on encrypted-storage user's authorized T7 Shield. Frozen parent R5c remains untouched.
- Release branch `clean-main-no-secrets` unmodified. No merge, deployment, billing, member-data reads, tester invitations or migration.

## Source-proven voice boundary failure at frozen R5b/R5c
`POST /api/voice/stream-conversation` previously preferred
`bodyUserId || await getMemberIdFromRequest(req)`. Because body userId is
unverified, a caller could select another member's voice preferences and
member-memory bundle. This is **source evidence of an authorization risk**,
not a witnessed disclosure of any person's memory.

## Narrow R5d correction
- Streaming voice derives member ID only from `getMemberIdFromRequest(req)`,
  which validates a revocable server session from HttpOnly cookie or verified
  `x-session-token` Safari/iOS header. An unauthenticated caller specifying
  any member ID is rejected (401), and A cookie with B claim is rejected (403)
  before member voice settings or memory loading. Invalid claim types 400;
  DB/session authority failures 503 rather than claiming a guest identity.
- Real guest speech without a member claim may continue with
  `userId = null`, meaning **no member voice preferences or private memory**.
- R5c's MAIA session-start corrected owner/upsert boundary is aligned with
  the **same shared credential resolver**, preserving verified Safari token
  authorization without accepting `x-member-id` as a credential.
- Cross-member session-ID collision cannot reassign owner in PostgreSQL;
  ordinary guests remain memberless, and revoked sessions are refused.

## Isolated technical witness
- Focused Jest checks: 19/19 PASS across R5c session owner and R5d voice identity.
- Next.js compiled **development-mode** real route, disposable restored
  PostgreSQL16, localhost HTTPS, fictional A/B authenticated cookies and
  verified Safari `x-session-token`:
  guest claiming A voice 401; A cookie claiming B voice 403; revoked
  cookie A claim 401; invalid object claim 400; none invoked a text/voice
  model. Session-start: no-cookie member claim 401; A/B mismatch 403;
  valid A session 200 + A ownership; collision B->A 409; guest remains
  guest; revoked auth 401; concurrency A/B same sessionId produces one
  200 and one 409; Safari token A produces A-owned session 200.
- The synthetic PostgreSQL fixture was dumped/restored into another
  database and the same routes used the restored copy. This proves only
  compatibility for the fictional schema, not R20 historical deletion or
  revocation-safe recovery.
- App-wide no-regression TypeScript, full compiled Next production-build
  and exact production-mode retests must be repeated on the frozen R5d
  revision. Do not promote the dev witness into production certification.

## Blocking follow-up security and product work
- Actual authorized MAIA text Send, voice response, durable turn and
  member-only retrieval; no provider was invoked by the above negative tests.
- `MemoryBundleService.getRecentTurns('session')` and the
  `TurnsStore.getSessionTurns(sessionId)` unscoped-by-owner branch,
  `SessionFinalizer` and summary routes, and client-controllable guest
  `anonId` need independently reviewed owner/consent bounds.
- R4F prior chart passages, derived memories and cross-session recall must
  obey separate retention/recall consent and independently checked
  provenance [GitHub #1817].
- R20 independently signed historical deletion, recovery and signer custody
  remain OPEN [#1793, #1814].
- Physical iOS Safari/voice transport, secure microphone consent, actual
  deployed production image SHA, ingress no-store, rollback, exact consenting
  tester cohort, and independent qualified human Class A review remain HELD.

Review tracker: https://github.com/SoullabTech/Sovereign/issues/1819
Pro Studio release tracker: https://github.com/SoullabTech/Sovereign/issues/1816

**No production/member state, release flags, or account permissions changed.**
