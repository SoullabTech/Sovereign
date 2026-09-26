# WRITERS-STUDIO-NEXT-01 / A2-5R3
## LIVE RELATIONSHIP IDENTITY CARRIAGE + EDITORIAL/REVIEW ATOMIC ADMISSION

**Date:** 2026-09-25
**Parent candidate:** ec3103797ae381913d070bc5a5f05103aee78aff
**Packet:** a1d3e03ae588de4b522d6ac1039bcbb80722b5d1b0392ba0d9b9db31e5d32c5e · 4,734 bytes · 148 lines
**UI / Focus / deployment / A3:** NONE

## I. Result

A2-5R3 makes explicit A2 relationship identity live across existing Editorial and Review Discuss server acts.

Implemented:
- exact A2 relationship create API;
- exact A2 relationship read API;
- optional relationshipId on Editorial turn;
- optional relationshipId on Review Discuss;
- pre-cognition relationship/manuscript/current-declaration validation;
- Editorial A2 episode admission inside the existing MAIA outcome transaction;
- Review A2 episode admission inside the existing post-cognition completion transaction.
## II. Explicit identity law

relationshipId is never inferred.

No code path chooses:
- latest relationship;
- first relationship;
- current relationship;
- thread-derived relationship;
- proposal-chain-derived relationship;
- reading/session-derived relationship.

Absence preserves existing child behavior and writes no A2 episode.

Presence names exactly one member-owned relationship.

The parent API deliberately creates a new relationship for every successful POST; it never silently reuses an existing relationship.
## III. Parent API

POST:
- /api/writers-studio/relationships
- exact body: livingWorkId + manuscriptId
- verified member comes from server session identity
- creates one new relationship
- no singleton collapse

GET:
- /api/writers-studio/relationships/[id]
- exact relationship id only
- ownership-scoped
- foreign-owned id returns not-found
- content-free relationship/episode metadata only

Existing /api/writers-studio/editorial/relationships remains untouched because it means child Editorial relationships already open on a passage.
## IV. Shared carriage preflight

New module:
lib/writers-studio/relationshipCarriage.ts

Before cognition an A2-mediated act proves:
- relationship exists and belongs to member;
- relationship manuscript matches the child manuscript;
- current Living Work → manuscript declaration still exists.

Editorial additionally proves:
- thread belongs to same member/manuscript;
- thread is Editorial and has proposal chain;
- proposal-chain locus_scope_kind is measured.

A bad relationship therefore refuses before the new child act is persisted.
## V. Editorial atomic admission

Editorial request accepts optional relationshipId.

Without relationshipId:
- existing route/runtime behavior remains unchanged;
- no A2 episode is written.

With relationshipId:
1. route preflights relationship before member turn persistence;
2. read-only Editorial assembly freezes locus_scope_kind beside locus text and predecessor;
3. provider cognition runs unchanged;
4. inside persistMaiaEditorialOutcome transaction:
   - A2 parent is prepared/locked;
   - MAIA turn is appended;
   - optional Direction/ProposalVersion and binding are appended;
   - exact EDITORIAL_TURN A2 episode is appended;
   - one commit closes the whole MAIA outcome.

A2 failure rolls back all MAIA durable outcome facts. The member turn remains because it was authored and persisted before cognition, exactly as the existing Editorial law requires.
## VI. Review atomic admission

Review Discuss request accepts optional relationshipId.

Without relationshipId:
- existing R2-2 behavior remains unchanged;
- no A2 episode is written.

With relationshipId:
1. route preflights relationship before reading/cognition;
2. Review cognition remains AS_READ with identical inputs;
3. inside the existing post-cognition transaction:
   - A2 parent is prepared/locked;
   - MAIA turn is appended;
   - disclosure receipts are confirmed crossed;
   - authorization completion is recorded;
   - exact REVIEW_DISCUSS A2 episode is appended with NULL manuscript locus scope;
   - one commit closes the completion.

A2 failure rolls back MAIA turn, disclosure confirmation, authorization completion, and A2 episode together.
## VII. No cognition carry

relationshipId is custody identity only.

Editorial:
- assembly blocks are unchanged;
- canonical Writer turn construction receives no relationship content;
- relationshipAdmission is passed only to post-cognition persistence.

Review:
- runReviewDiscuss receives only existing ctx + question;
- relationshipId is not added to input manifest, system prompt, historical evidence, question, or provider request;
- relationship handling exists only before cognition as eligibility check and after cognition as custody.

No prompt, provider/model selection, disclosure authority, history policy, Review continuation, THEN_VS_NOW, or Work mutation law changes.
## VIII. Live HTTP witness

Witness:
tests/constitutional/writers-studio/a2-5r3-live-carriage/witness.ts

Environment:
- fresh disposable PostgreSQL database;
- real Next.js server;
- real auth sessions;
- real Editorial + Review routes;
- real A2 schema/store;
- real child stores and transactions;
- Anthropic transport only is wire-stubbed.

Result:
**21/21 PASS**
Witnessed:
- relationship POST creates plural ids for one Work/manuscript;
- relationship GET reads exact owned id;
- relationship GET hides foreign-owned id;
- Editorial without relationshipId succeeds with zero A2 episode;
- Editorial with relationshipId writes exact section-scoped A2 episode;
- wrong-manuscript relationship refuses before child write;
- Editorial post-provider A2 failure returns relationship refusal;
- Editorial A2 failure rolls back MAIA outcome;
- Editorial A2 failure writes no episode;
- Review without relationshipId succeeds with zero A2 episode;
- Review with relationshipId writes finding-scoped A2 episode with NULL manuscript scope;
- Review post-provider A2 failure returns relationship_unavailable;
- Review A2 failure rolls back MAIA turn;
- Review A2 failure rolls back authorization completion;
- Review A2 failure rolls back disclosure confirmation;
- Review A2 failure writes no episode;
- same completed Editorial child cannot attach to another relationship.
## IX. Atomic failure attack

Both live atomicity attacks delete the current Living Work → manuscript declaration after route preflight but during the provider call.

Editorial:
- preflight passed;
- member turn persisted;
- provider answered;
- completion transaction rechecked current declaration and refused;
- MAIA turn remained absent;
- A2 episode remained absent.

Review:
- preflight passed;
- author turn/authorization/disclosure attempts existed before cognition;
- provider answered;
- completion transaction rechecked declaration and refused;
- MAIA turn absent;
- authorization completion remained NULL;
- disclosure receipts remained unconfirmed;
- A2 episode absent.

This proves A2 custody is not a best-effort postscript.
## X. File identities

Review route:
c57688b048c2bc62558c580b10c13c16c20c3b8a1815b8597155817ce596e14c

Editorial turn route:
ab9e545b5a3832807e766bbb8a453f2bec37ce191938e3354a4c8cfdcb68db1d

Relationship POST route:
b518f8e91bae398ba509126c5f273df566ded6d73f5a814f3fcb6f848180e8b1

Relationship GET route:
41856764519f3cb43cb9d77e05539f8c6c3f908f57f8aacc5d082c84c0bfd6fb

Editorial assembly:
7007626fa1150eee9f251bbc4c56395e5f4c14e7361a39d95c1c5385247aa66d
Editorial turn runtime:
0cd5ee20cd53f535c4c97f17e58f34648f4a27ec8fab5727978c7669fd50f52a

Editorial MAIA outcome persistence:
8d2900b7b7e67584723466c3a387679b35612df82b0b18ea0fdc8b57651b29cb

Relationship carriage preflight:
be7f144eeb9a02b968dedeaa9850ce872383da11267d598518456fbfc738cadb

Live witness:
73b26700ce43685de8276fb07c0bc3a76b2a3694615b36650d0015b0e1573c6a

Dedicated typecheck:
dbb0290a0e2756286b4033f02d4c74b7b55e557bf586b6b08e2d562dbdfe2403
## XI. Regression standing

A2-5R3 live carriage: 21/21 PASS
A2-5R2 scope witness: 11/11 PASS
A2-4 custody witness: 19/19 PASS
Canonical blank-DB reconstruction: 5/5 PASS

A2-5R1: 18/18 GREEN · 18/18 DEAD
A2-3: 37/37 GREEN · 35/35 DEAD
A2-2: 55/55 GREEN · 30/30 DEAD
A2-1: 24/24 GREEN · 24/24 DEAD
R2-2: 17/17 GREEN
Editorial runtime: lethal · 0 failures
Proposal/selection: 35/35 PASS
Sanctuary Editorial: 22/22 PASS
Focus: 64/64 PASS
Repository TypeScript no-regression:
- 4458 program files
- 226 errors vs 239 baseline
- 13 errors fixed since baseline
- no regressions

Repository gates:
- design canon PASS
- no-Supabase PASS
- provider governance PASS
- ci:sovereignty PASS
- voice identity 29/29 PASS
- git diff --check PASS

No member-facing UI diff.
No Focus diff.
## XII. Current product standing

A2 parent relationship custody is now live at the server boundary for:
- Editorial turns;
- Review Discuss acts.

But existing clients do not yet create/select/carry relationshipId.

Therefore:
- the server capability is real;
- live atomic custody is real;
- the writer does not yet experience one visible unified relationship in the current UI.

That member-facing orchestration belongs to the next act.

## XIII. Recommended successor

> **WRITERS-STUDIO-NEXT-01 / A2-6 — MEMBER-FACING UNIFIED RELATIONSHIP ORCHESTRATION + SCOPE TRANSITIONS ONLY**

A2-6 should make one explicit A2 relationship available to the Writer’s Studio surface and carry its id through existing Editorial/Review gestures without flattening child subjects or injecting cross-episode cognition.
## XIV. Stop

> **FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A2-5R3 LIVE RELATIONSHIP IDENTITY CARRIAGE + EDITORIAL/REVIEW ATOMIC ADMISSION**

A2-5R3 STOPS BEFORE MEMBER-FACING RELATIONSHIP ORCHESTRATION, FOCUS, CROSS-EPISODE COGNITION, DURABLE PLACE, DEPLOYMENT OR A3.
