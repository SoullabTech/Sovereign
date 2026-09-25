# WRITERS-STUDIO-NEXT-01 / A2-4
## RELATIONSHIP CUSTODY SCHEMA + STORE IMPLEMENTATION

**Date:** 2026-09-25
**Parent candidate:** e264121e57bd1b8b1cac3212b110537e183e3300
**Packet:** 55e20a2da2a99a7b04a695f55fd7a9bca5e451d3efdfd67409140f95a82b0b68 · 7,673 bytes · 224 lines
**UI / route contract / deployment:** NONE

## I. Result

A2-4 implements the v1 durable custody substrate without opening member-facing behavior.

Implemented:
- additive parent/episode migration;
- content-free relationship store;
- relationship create/read;
- transaction-local relationship preparation;
- exact Editorial episode validation/admission;
- exact Review Discuss validation/admission;
- immutable/idempotent episode semantics;
- local DB witness.

FOCUS remains excluded.
## II. Migration

File:
database/migrations/20260925000005_writer_editorial_relationship_custody.sql

SHA-256:
39c5c91dc31510cccb72f01d6fca35047730997f4758ca59e2b629ec62dd5b33

Creates:
- writer_editorial_relationships
- writer_editorial_relationship_episodes

Adds supporting composite uniqueness:
- living_works(id, member_id)
- member_manuscripts(id, member_id)

The new uniqueness does not narrow identity beyond the existing primary keys; it exists only as a composite FK target.
## III. Parent custody

writer_editorial_relationships stores only:
- id;
- member_id;
- living_work_id;
- manuscript_id;
- creation_expression_id;
- contract_version;
- created_at.

Same-member Work and manuscript ownership are structural composite foreign keys.

Both Work and manuscript deletion use ON DELETE CASCADE into A2 parent custody.

creation_expression_id deliberately has no FK, so a later lawful declaration removal neither blocks removal nor erases/repoints relationship history.

Parent UPDATE is refused by database trigger.
## IV. Episode custody

V1 child_kind is structurally closed to:
- EDITORIAL_TURN
- REVIEW_DISCUSS

No FOCUS_ACT.

The episode row stores:
- relationship-local sequence;
- child-native identity refs;
- requested/executed scope;
- temporal posture;
- history policy;
- continuation standing;
- authority class;
- PRESENTATION_ONLY carry;
- admitted_at.

No manuscript prose and no child reply/finding/proposal text are stored.

requested_scope = executed_scope is a database CHECK.
V1 scopes are only passage / section.
## V. Closed child semantics

EDITORIAL_TURN requires:
- thread id;
- proposal chain id;
- member turn index;
- MAIA turn index;
- CURRENT_FROZEN_LOCUS;
- CHILD_LOCAL_MULTI_TURN;
- continuation true;
- EDITORIAL_CHAIN.

REVIEW_DISCUSS requires:
- thread id;
- MAIA turn index;
- authorization id;
- reading id;
- observation key;
- AS_READ;
- history NONE;
- continuation false;
- R2_DISCLOSURE.

The XOR/semantic CHECK makes zero-kind and two-kind rows unrepresentable.
## VI. Store

File:
lib/writers-studio/relationshipCustody.ts

SHA-256:
36ea7cddf9ff4711b6e217b4bb90bfd9d43f8158a9c9e21919962def3be2b8ee

Exports:
- createEditorialRelationshipCustody
- readEditorialRelationshipCustody
- prepareRelationshipForAppendWithClient
- appendEditorialEpisodeWithClient
- appendReviewDiscussEpisodeWithClient
- idempotent wrappers for already-completed children.

No Focus append function is exported.
## VII. Lock and transaction law

For a new A2-mediated child act, the future live caller can:
1. begin its existing child transaction;
2. prepare A2 relationship custody before child completion;
3. lock Work FOR KEY SHARE;
4. lock manuscript FOR KEY SHARE;
5. lock current declaration FOR KEY SHARE;
6. lock A2 parent FOR UPDATE;
7. persist child completion;
8. append A2 episode using the same transaction client;
9. commit once.

The store itself never begins a second transaction for episode admission.

This preserves A2-3 L37: child completion and relationship episode can be one atomic fact.
## VIII. Editorial validator

Editorial admission proves:
- ask_thread belongs to member + relationship manuscript;
- ask_thread is bound to supplied proposal chain;
- proposal chain belongs to member;
- proposal_chain.work_id equals relationship manuscript;
- supplied member turn exists with speaker author;
- supplied MAIA turn exists with speaker maia.

Pair identity is supplied by the child operation.
The store does not infer pairing from timestamps or adjacency.
## IX. Review validator

Review admission proves:
- authorization act coordinates match member, manuscript, thread, reading and observation key;
- authorization consumption exists and completed_at is non-null;
- completion_ref is exact threadId:maiaTurnIndex;
- MAIA turn exists;
- ask_thread reading identity is review_discuss_r2_1 and matches readingId + observationKey.

observation_id is not used as authority.
## X. Idempotency and child deletion

Partial unique indexes enforce:
- one editorial child act by thread + MAIA turn;
- one Review child act by authorization id.

Same child + same relationship recovers the existing episode.
Same child + different relationship refuses.

Child identity refs deliberately have no FKs.

Therefore lawful child deletion can make a child unavailable without:
- blocking deletion;
- cascading A2 history away;
- setting child identity null;
- repointing the episode.
## XI. DB witness

Witness:
tests/constitutional/writers-studio/a2-4-custody/witness.ts

SHA-256:
52143800a0761a3dd374cf7ecce426f2295711a9be3466239fb0246506431609

Result:
**19/19 PASS**

Witnessed:
- plural relationships per Work/manuscript;
- content-free read;
- editorial admission;
- idempotent retry;
- same child cannot attach elsewhere;
- foreign manuscript/Work child refusal;
- foreign member child refusal;
- Review admission;
- ordered two-kind read;
- parent immutability;
- episode immutability;
- atomic forced rollback;
- atomic commit;
- concurrent append serialization;
- declaration removal preserves history and blocks append;
- parent delete removes only A2 episodes;
- Living Work deletion removes A2 parent;
- manuscript deletion removes A2 parent;
- Focus absent from v1 schema.
## XII. Empty-database reconstruction

Canonical repository path:
- scripts/bootstrap-database.sh
- npm run db:migrate
- npm run db:verify-bootstrap

Final result:
**5/5 PASS**

- baseline schema-only check PASS;
- blank DB bootstrap PASS;
- baseline contains no application rows PASS;
- migrations apply cleanly PASS;
- application schema gate PASS.

A naive raw replay of every historical SQL file was also attempted first and failed at historical migration 20251231_memory_architecture_enhancements.sql because developmental_memories was absent.

That raw replay is not the canonical reconstruction protocol. It is recorded as a non-authoritative exploratory failure and no historical migration was changed.
## XIII. Schema census

Confirmed on disposable witness DB:
- parent PK;
- same-member Work FK ON DELETE CASCADE;
- same-member manuscript FK ON DELETE CASCADE;
- contract_version = A2-1;
- episode relationship FK ON DELETE CASCADE;
- sequence >= 1;
- UNIQUE relationship + sequence;
- exact requested/executed scope CHECK;
- passage/section-only CHECKs;
- PRESENTATION_ONLY carry CHECK;
- two-kind child CHECK;
- closed child semantic/XOR CHECK;
- editorial child partial unique index;
- Review child partial unique index.

No Focus columns exist.
## XIV. Type and regression standing

A2-4 focused typecheck: PASS.

The repository-wide dependency graph has one pre-existing noUncheckedIndexedAccess diagnostic in lib/db/postgres.ts insertOne(), so the A2-4 tsconfig uses the repository dependency strictness rather than editing that unrelated helper.

Inherited verification:
- A2-3 37/37 GREEN · 35/35 DEAD;
- A2-2 55/55 GREEN · 30/30 DEAD;
- A2-1 24/24 GREEN · 24/24 DEAD;
- R2-2 17/17 GREEN;
- editorial-runtime lethal · 0 failures;
- Focus 64/64 PASS;
- design canon PASS;
- no-Supabase PASS;
- provider governance PASS;
- ci:sovereignty PASS;
- voice identity 29/29 PASS;
- git diff --check PASS.
## XV. Exact product boundary

A2-4 changes no:
- app route;
- request body;
- response body;
- component;
- page;
- feature flag;
- Focus runtime;
- prompt/provider path;
- deployment surface.

It creates a new runtime store module, but no live member-facing caller invokes it yet.

Therefore A2 custody exists as schema + store capability, not as a live unified Writer's Studio relationship.

## XVI. Recommended successor

> **WRITERS-STUDIO-NEXT-01 / A2-5 — RELATIONSHIP IDENTITY CARRIAGE + LIVE EDITORIAL/REVIEW ATOMIC ADMISSION ONLY**

A2-5 should carry an explicit A2 relationship identity through the existing member/server conversation boundary and wire Editorial + Review completion transactions into the A2-4 store.

No Focus.

A2-5 is recommended, not opened.
## XVII. Stop

> **FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A2-4 RELATIONSHIP CUSTODY SCHEMA + STORE IMPLEMENTATION**

A2-4 STOPS BEFORE LIVE RELATIONSHIP IDENTITY CARRIAGE, UI COMPOSITION, FOCUS, DEPLOYMENT OR A3.
