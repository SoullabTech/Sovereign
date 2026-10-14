# Pro Studio / MAIA R5e — Truthful Durable-Turn and History Responses
Date: October 14, 2026
Standing: **ISOLATED LOCAL SECURITY CANDIDATE — CLASS A HUMAN/COMBINED BETA DEPLOYMENT HOLD**

## Frozen source lineage
- Existing held, technically qualified R5d parent:
  `f05c580697029b16866f75d6ca121b04287fbe86`.
- New isolated worktree `/Volumes/T7 Shield/pro-studio-r5e-conversation-truth-20261014`,
  branch `fix/pro-studio-r5e-conversation-truth-20261014`.
- Protected release branch unchanged. No production, billing, member-data,
  live inference, invitations or migrations authorized by this document.

## Reproduced negative HTTP evidence at frozen R5d
Built Next.js 16.3.8 production mode with a restored, disposable PostgreSQL16
schema and fictional authenticated A/B members. The normal, valid database
passed account-scoped Get/POST, two durable turns and idempotent retry,
Sanctuary not persisting, server-minted provenance and content-free consent
audit metadata. Then the test deliberately removed ONLY the isolated test
`conversation_turns` table, leaving the valid authenticated A session.

- POST authenticated A `/api/conversation/turns` returned **HTTP 200**
  `{success:true,tableNotReady:true}` despite no durable writes.
- GET authenticated A history returned **HTTP 200**
  `{success:true,messages:[]}` despite a missing table.
- Both tested responses had **no explicit Cache-Control header**.
- No real members or production databases were accessed.

**This falsely represents an unavailable database as successful storage and
empty personal history.** It is unacceptable for accurate MAIA continuity.
The positive R5d account-isolation tests remain valid only for their scope.

## R5e narrow correction
- For every conversation-turn GET/POST response, set
  `Cache-Control: private, no-store, max-age=0, must-revalidate`
  and `Vary: Cookie, Origin`.
- GET missing-table errors now return HTTP 503
  `{success:false,error:'Conversation history unavailable'}`.
- POST missing-table errors now return HTTP 503
  `{success:false,error:'Conversation was not saved'}`.
- Unauthenticated 401 and owner claim mismatch 403 remain unchanged.
- Sanctuary continues to refuse durable turn writes and does not acquire
  additional retention or recall authority.
- No new schema, feature flag, rights or model provider was created.

## Review boundary and remaining issues
- The existing `recordConsentState` call is fire-and-forget; the main
  serving response can precede durable audit state. This is **not yet an
  independently accepted atomic consent/retention proof**.
- `MemoryBundleService.getRecentTurns(scope='session')` currently invokes
  `TurnsStore.getSessionTurns(sessionId)` without a member-id filter.
  The route's normal history GET is member-scoped, but the internal session
  recall branch requires further authority/reachability review.
- R4F prior chart-passage and derived-memory recall consent [#1817] remains
  independent and held.
- R20 signed deletion/revocation durable recovery [#1793] remains held:
  fictional historical SQL restore was demonstrated to resurrect both a
  revoked A session and an erased A turn.
- Actual MAIA text generation/response from a governed model, full MAIA
  voice/memory/consent end-to-end, physical Safari, independently accepted
  Class A human security/privacy review, production image digest/roll-back
  and consenting tester-only release GO are not provided by this change.

Required exact-source gates: new focused regression Jest tests, inherited
R5d session/voice/memory tests, governed no-new-TypeScript diagnostic check,
local Next production build, restored-fictional-PG authenticated HTTP
positive and missing-schema negative, no-store ingress under loopback HTTPS.
All tests must be tied to the committed R5e SHA before technical qualification.

**Do not deploy, merge or push this candidate, write member content, change
R20 recovery keys, or enable a public beta without distinct later approval.**

Review: https://github.com/SoullabTech/Sovereign/issues/1819
Pro Studio combined release: https://github.com/SoullabTech/Sovereign/issues/1816
