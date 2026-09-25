# WRITERS-STUDIO-NEXT-01 / A2-3
## RELATIONSHIP CUSTODY IMPLEMENTATION CONTRACT + MIGRATION DESIGN

**Date:** 2026-09-25
**Class:** implementation contract / migration design only
**Parent candidate:** 4016b632a88b79cb012c23423e445e457d7ac318
**A2-3 packet:** 0257aeb656a0aa46c01fd395067ede33bb395005c64681561495d85ffbc9140d · 17,974 bytes · 513 lines
**Runtime / schema / migration file / UI / deployment:** NONE

## I. Disposition

A2-3 defines an exact v1 schema and transaction contract for A2 relationship custody.

V1 admits:
- EDITORIAL_TURN;
- REVIEW_DISCUSS.

FOCUS_ACT is deliberately excluded until its Work/manuscript identity and durable successful-completion substrate are repaired/proved.

No migration is created by this act.
## II. Parent table — exact future design

Provisional future table: writer_editorial_relationships

Columns:
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- member_id UUID NOT NULL
- living_work_id UUID NOT NULL
- manuscript_id UUID NOT NULL
- creation_expression_id UUID NOT NULL
- contract_version TEXT NOT NULL CHECK contract_version = A2-1
- created_at TIMESTAMPTZ NOT NULL DEFAULT now()

No uniqueness on member_id + living_work_id + manuscript_id.

No current_scope, last_episode, last_section, scroll, caret, selection, transcript, summary, memory, disclosure, cognition or mutation authority column.
## III. Parent ownership constraints

Future migration first adds supporting uniqueness if not already present:
- living_works UNIQUE (id, member_id)
- member_manuscripts UNIQUE (id, member_id)

Parent then carries:
- FOREIGN KEY (living_work_id, member_id)
  REFERENCES living_works(id, member_id)
  ON UPDATE RESTRICT ON DELETE CASCADE
- FOREIGN KEY (manuscript_id, member_id)
  REFERENCES member_manuscripts(id, member_id)
  ON UPDATE RESTRICT ON DELETE CASCADE

This proves same-member Work and manuscript structurally.

Remove Work may delete the A2 parent.
Permanent manuscript deletion may delete the A2 parent.
Neither path reaches child conversations, readings or proposal chains through A2.
## IV. Creation declaration provenance

creation_expression_id is the exact living_work_expressions.id verified at parent mint.

It has NO foreign key.

Parent creation transaction must prove:
- verified server member identity;
- Living Work belongs to member;
- manuscript belongs to member;
- current declaration exists:
  living_work_id = parent Work;
  expression_type = manuscript;
  expression_id = manuscript;
  declared_by = member.

The Work, manuscript and declaration rows are held FOR KEY SHARE during creation.

After creation, deleting that declaration is lawful. The id may dangle as historical provenance and grants no future append authority.
## V. Parent immutability

V1 parent has no lawful UPDATE.

Future migration includes a BEFORE UPDATE trigger/function that always refuses.

Changing member, Work, manuscript or creation declaration cannot repoint a relationship.

A different binding means a different relationship id.

DELETE remains a separately governed future member/server act. Parent delete may cascade only to its A2 episode rows.
## VI. Episode table — exact future design

Provisional future table: writer_editorial_relationship_episodes

Common columns:
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- relationship_id UUID NOT NULL REFERENCES writer_editorial_relationships(id) ON DELETE CASCADE
- sequence INTEGER NOT NULL CHECK sequence >= 1
- child_kind TEXT NOT NULL
- requested_scope TEXT NOT NULL
- executed_scope TEXT NOT NULL
- temporal_posture TEXT NOT NULL
- history_policy TEXT NOT NULL
- continuation_authorized BOOLEAN NOT NULL
- authority_class TEXT NOT NULL
- carry_policy TEXT NOT NULL
- admitted_at TIMESTAMPTZ NOT NULL DEFAULT now()

UNIQUE (relationship_id, sequence).
## VII. Episode child identity columns

EDITORIAL_TURN columns:
- editorial_thread_id UUID
- editorial_proposal_chain_id UUID
- editorial_member_turn_index INTEGER
- editorial_maia_turn_index INTEGER

REVIEW_DISCUSS columns:
- review_thread_id UUID
- review_maia_turn_index INTEGER
- review_authorization_id UUID
- review_reading_id UUID
- review_observation_key TEXT

No child prose.
No observation_id authority column required.
No Focus columns in v1.
## VIII. Closed XOR and semantic checks

child_kind CHECK permits exactly:
- EDITORIAL_TURN
- REVIEW_DISCUSS

Global checks:
- requested_scope = executed_scope
- requested_scope IN (passage, section)
- carry_policy = PRESENTATION_ONLY

EDITORIAL_TURN branch requires all editorial refs non-null, all Review refs null, and:
- temporal_posture = CURRENT_FROZEN_LOCUS
- history_policy = CHILD_LOCAL_MULTI_TURN
- continuation_authorized = true
- authority_class = EDITORIAL_CHAIN

REVIEW_DISCUSS branch requires all Review refs non-null, all editorial refs null, and:
- temporal_posture = AS_READ
- history_policy = NONE
- continuation_authorized = false
- authority_class = R2_DISCLOSURE

No zero-kind or two-kind row is representable.
## IX. Child references deliberately have no FKs

No episode child identity column references child tables by foreign key.

This is deliberate:
- RESTRICT would block lawful child deletion;
- CASCADE would erase parent relationship history;
- SET NULL would erase/repoint identity.

Child existence and completion are verified by the future admission transaction.

If a child later disappears lawfully, the parent episode remains content-free and reads as child unavailable.

No summary or copied prose substitutes for missing child content.
## X. Child-act uniqueness and idempotency

Future partial unique indexes:
- UNIQUE (editorial_thread_id, editorial_maia_turn_index)
  WHERE child_kind = EDITORIAL_TURN
- UNIQUE (review_authorization_id)
  WHERE child_kind = REVIEW_DISCUSS

One completed child act therefore belongs to at most one A2 relationship episode.

Retry semantics:
- same child + same relationship returns/reuses existing episode;
- same child + different relationship refuses;
- no timestamp idempotency.
## XI. Editorial completion validator

The future trusted server completion object supplies:
- relationship id;
- thread id;
- proposal chain id;
- member turn index;
- MAIA turn index;
- requested/executed scope snapshots.

Inside the child-completion transaction, validation proves:
- ask_threads.id = thread id;
- thread.member_id = relationship member;
- thread.manuscript_id = relationship manuscript;
- thread.proposal_chain_id = proposal chain id;
- proposal_chains.id = proposal chain id;
- proposal_chains.member_id = relationship member;
- proposal_chains.work_id = relationship manuscript;
- member turn exists with speaker author;
- MAIA turn exists with speaker maia.

The route/service-produced pair is used directly; adjacency and timestamps are never inferred.
## XII. Review completion validator

Inside the Review post-cognition transaction, validation proves:
- ask_authorization_acts.id = review_authorization_id;
- act member/manuscript/thread/reading/observation coordinates equal the relationship and requested child;
- ask_authorization_consumptions exists for that act;
- completed_at is non-null;
- completion_ref equals exact review_thread_id + review_maia_turn_index;
- matching ask_turn exists with speaker maia;
- Review address is readingId + observationKey;
- posture is AS_READ and history policy is NONE.

observation_id never substitutes for reading-local authority.
## XIII. Atomic completion law

A2 episode admission is not a best-effort write after child completion.

For new A2-mediated EDITORIAL_TURN and REVIEW_DISCUSS acts, episode insertion must occur in the SAME PostgreSQL transaction that durably records the child's successful completion.

Reason:
a crash between child completion and parent append would otherwise create a completed child act with no safe durable pairing for recovery.

Editorial future integration point:
- the transaction that persists the MAIA editorial outcome.

Review future integration point:
- the existing transaction that appends MAIA's turn, confirms disclosures and records authorization completion.

A2-4 must extend those transactions rather than append afterward.
## XIV. Lock ordering and sequence allocation

Future A2 integration uses this lock order:

1. read relationship binding under verified member identity;
2. lock living_works ownership row FOR KEY SHARE;
3. lock member_manuscripts ownership row FOR KEY SHARE;
4. lock current living_work_expressions declaration FOR KEY SHARE;
5. lock writer_editorial_relationships parent FOR UPDATE;
6. reverify unchanged relationship binding;
7. perform/validate child completion;
8. compute next relationship sequence while parent lock is held;
9. insert immutable A2 episode;
10. commit child completion and A2 episode atomically.

This order prevents parent-first deadlock against concurrent Work/manuscript deletion and serializes concurrent appends.
## XV. Current declaration at every append

creation_expression_id is not append permission.

Every append must re-prove a CURRENT living_work_expressions declaration for:
- relationship living_work_id;
- expression_type manuscript;
- relationship manuscript_id;
- relationship member_id as declared_by.

If declaration is absent:
- relationship remains readable as history;
- no new episode is admitted;
- no other Work is guessed;
- no latest/first declaration is substituted.

Removing the declaration never rewrites existing episodes.
## XVI. Read contract

A2 read may expose:
- relationship id;
- member / Living Work / manuscript identity;
- episode ids and sequence;
- child kind and native child identity refs;
- requested/executed scope;
- temporal posture;
- history policy;
- continuation standing;
- authority class;
- carry policy;
- live child availability as a separately derived fact.

A2 storage never becomes a transcript.

Child bodies are fetched through child readers under child read law.
## XVII. Focus exclusion and future widening

FOCUS_ACT is absent from the v1 child_kind CHECK and has no reserved nullable columns.

Future additive widening requires:
1. correct Living Work ↔ manuscript identity through Focus;
2. a durable successful Focus completion fact;
3. completion bound to request/exchange + crossed disclosure;
4. Sanctuary/privacy proof;
5. a separately authorized child reference shape and migration.

A crossed disclosure receipt alone can never satisfy completion.

No Focus repair is part of A2-3.
## XVIII. Migration ordering

Future migration design order:
A. add supporting UNIQUE (id, member_id) constraints to living_works and member_manuscripts;
B. create writer_editorial_relationships;
C. add composite ownership FKs;
D. create writer_editorial_relationship_episodes;
E. add XOR, scope and child-semantic CHECKs;
F. add relationship sequence and child-act unique indexes;
G. add parent and episode refuse-all-UPDATE triggers/functions;
H. add comments documenting content-free, non-authorizing custody.

No backfill.
No historical child act becomes an A2 episode automatically.
## XIX. Rollback

Disposable migration rehearsal:
- if no A2 custody data has been admitted, drop episode table, parent table, then A2-only supporting constraints in reverse dependency order.

Operational rollback after A2 data exists:
- roll back application code only;
- retain A2 custody schema and data.

Dropping live A2 custody after admitted relationships exist is destructive and requires a separate governance act.

A routine rollback script must never erase A2 history.
## XX. Suite-first and final witness

Initial deliberately unsafe contract:
- reference 0/36;
- matrix exit 1;
- 34/34 named defeat candidates dead;
- strict typecheck PASS.

During implementation-contract refinement one additional atomicity defect was identified:
- post-completion best-effort A2 append can strand a completed child outside relationship custody.

L37 / D35 were added before final freeze.

Final result:
- reference 37/37 GREEN;
- defeat candidates 35/35 DEAD;
- strict typecheck PASS.

This refinement is recorded rather than presented as though L37 existed in the first RED run.
## XXI. Instrument identities

- model.ts — 422026bf00564fccd9361fd3c7d4c26fce7419b86b7f6a057e13af94f92f97f6
- laws.ts — 4c6be71bead8c79950ad0ff7a4ec884a23cb7fb94fcffc95cc292c637694e9fa
- design.ts — 9c13ae9cb41f0727d6bbaa81d1d5b9ccf44fadea613893db97b4ed8ae5273cd8
- candidates.ts — e9f5e90bc0dfeaa912700481f6121a73a1dc4114754d1602e66a965d22282002
- matrix.ts — f920c75463e3199b4fbeac3ec7aa24db58bf69d34fdb65805c086d78238ba794
- tsconfig — 4587e0527506b70efbdc82e80d9035252eb78b76760d7a3a85056b0c20d87c9f

No migration SQL file exists from A2-3.

## XXII. What is designed vs unimplemented

Designed:
- exact future parent table;
- exact future episode table;
- ownership FKs;
- non-FK child identity policy;
- XOR and semantic checks;
- child-act uniqueness;
- lock ordering;
- atomic child-completion integration;
- declaration revalidation;
- migration order and rollback law;
- Focus exclusion.
Unimplemented:
- every schema change above;
- migration runner entry;
- parent mint;
- append service;
- child validators;
- read service;
- transaction integration;
- UI composition.

## XXIII. Recommended successor

> **WRITERS-STUDIO-NEXT-01 / A2-4 — RELATIONSHIP CUSTODY SCHEMA + STORE IMPLEMENTATION ONLY**

A2-4 should implement only:
- the designed migration;
- parent custody store;
- content-free episode store;
- create/read primitives;
- atomic editorial/Review episode admission seams required by this contract;
- deterministic local database witnesses.

Focus remains excluded.

A2-4 is recommended, not opened.

## XXIV. Stop

> **FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A2-3 RELATIONSHIP CUSTODY IMPLEMENTATION CONTRACT + MIGRATION DESIGN**

A2-3 STOPS BEFORE MIGRATION OR RUNTIME IMPLEMENTATION.
