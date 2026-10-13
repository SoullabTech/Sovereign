# PRO-STUDIO-REFLECT → MAIA cookie-only recovery (R3)
Date: October 13, 2026
Status: **LOCAL CLASS A CANDIDATE — NOT MERGED, NOT RELEASE APPROVED**

## Problem and observed evidence
A member with a server-verified, unrevoked, onboarded session can enter
the invitation-gated `/pro-studio/reflect` preview. If browser localStorage
was cleared or belonged to an obsolete MAIA version, MAIA's older client-side
`checkAndMigrateSession()` could override the server-verified identity and
redirect from `/maia/encounter` to sign-in or Home.

## Small proposed correction
On `fresh` or `migrate` browser continuity only, ask existing
`GET /api/members/session` for a validated same-origin cookie identity.
Recover *display cache only* for an already-onboarded member. Do not grant
membership, paid tier, practitioner identity, clinical access, MAIA memory,
or data transfer. Refuse missing/revoked/expired/not-onboarded identity,
explicit client sign-out, invalid server response and network failure.

## Local technical evidence
- 23/23 focused Jest tests PASS.
- Strict targeted TypeScript check PASS for new helper/tests.
- Focused lint of new helper/tests PASS.
- Isolated local Next 16.3.8 + disposable PG16 + WebKit desktop/mobile
  navigation PASS for fictional normal and cookie-only Reflect → MAIA URL,
  and DENY for noninvited/revoked/signed-out access to Reflect.
- Entire MAIA encounter or historical conversation continuity NOT
  certified; synthetic database omitted many other MAIA-only tables,
  causing expected 500/503 on unrelated service calls.
- Full-project `tsc` remains red on broad baseline modules outside
  this isolated change. No current candidate claim of full-project
  typecheck or production build qualification.

## Release fence
This file does not authorize a merge, public access, tester invitations,
configuration, role elevation, MAIA data reads or changes to Writer's Studio.
Independent Class A security review, whole application integration testing
and exact-artifact rollback must independently pass. Reviewer issue:
https://github.com/SoullabTech/Sovereign/issues/1816
