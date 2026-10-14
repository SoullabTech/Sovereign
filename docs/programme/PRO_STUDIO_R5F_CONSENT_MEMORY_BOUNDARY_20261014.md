# Pro Studio / MAIA R5f — consent audit and member-scoped session recall
Date: October 14, 2026
Standing: **ISOLATED SOURCE CANDIDATE, NOT RELEASE QUALIFIED**

Parent exact frozen R5e source: `b29d6a968791cd49183eedbce8d15eed003573aa`.
R5f branch: `fix/pro-studio-r5f-consent-memory-20261014` on authorized T7 Shield.
The release branch, existing member data, runtime flags and production deployments remain untouched.

## Two specific source defects
1. The R5e conversation-turns route calls content-free `recordConsentState()`
   fire-and-forget, then immediately awaits `TurnsStore.addExchange()`.
   A missing/failed audit may coexist with durable member turns and HTTP 200.
   A successful write response is therefore NOT durable proof of the required
   S5 consent audit.
2. `MemoryBundleService.getRecentTurns(userId,sessionId,'session')`
   called `TurnsStore.getSessionTurns(sessionId)`. SQL filtered only by
   session ID. A different member's same-session identifier could select
   the wrong conversation history; the existing bound route GET is not the
   same internal memory code path.

## R5f proposal in isolated source
- Introduce `TurnsStore.addAuditedExchange`, using a single PostgreSQL
  `transaction()`: insert/verify the authenticated member's exact,
  immutable content-free `runtime_consent_state` record, write a user and
  MAIA turn with server-minted provenance, verify both seq and owner, then
  commit together. Failure of any step rolls back everything.
- Retain the same per-turn Sanctuary refusal; no durable turn can enter the
  transaction under Sanctuary.
- Require BOTH `sessionId` and verified `memberId` in
  `TurnsStore.getSessionTurns()`, and filter `WHERE session_id=$1 AND user_id=$2`.
- Pass the same member ID from the MemoryBundle caller. The Scribe
  summarizer takes its member ID from the existing server-stored
  `maia_sessions.member_id`; refuses memberless historical sessions rather
  than making a session-ID-only content query.
- Existing raw `addExchange` remains for other legacy code paths; **R5f
  does not yet certify every writer or global memory reader**.

## Qualifying evidence and open checks
- Focused adversarial Jest tests cover owner-bound SQL, mandatory transaction,
  rejected mismatched consent record, incomplete pair and Sanctuary.
- Next: repeat exact candidate governed no-regression TypeScript, optimized
  production build and isolated real PostgreSQL failure/rollback tests
  before Class A technical acceptance can be declared.
- Consent audit row and turns on historical backup recovery still require
  R20 monotonic deletion/revocation protection, independent certification.
- R4F chart-passage and derived-memory recall permissions remain separate.
- Genuine MAIA model response, voice conversation, physical Safari,
  independent human Class A, production image/rollback and consented tester
  beta release remain on HOLD.

This document does NOT authorize production changes, merge, invitations,
member data writes, billing, cloud accounts or R20 signing keys.
Tracking: https://github.com/SoullabTech/Sovereign/issues/1819
Combined beta: https://github.com/SoullabTech/Sovereign/issues/1816
