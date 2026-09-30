# WRITERS-STUDIO-SMALL-BETA-01 / B4 — Exact Five-Migration Review Plan

**Date:** 2026-09-29
**Status:** BOUNDED INDEPENDENT REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF
**Live old reader at plan freeze:** `7a096281acc22bc91bfc66799ce9acb841921771`
**Application-code parent:** `b7ab784d95f1231c5f25a6c26dba3fa811d0d02d`

## Exact target relation

The deployment target is supplied externally by the Review-Custody harness and is never self-identified by a commit SHA embedded in this document. The target may be a canonical merge commit. The reviewer must compare immutable git tree bytes against application-code parent `b7ab784d95f1231c5f25a6c26dba3fa811d0d02d` and establish the exact target relation from bundle evidence.

The reviewer must independently confirm that the target changes no application, migration, dependency, deployment-script, or runtime bytes relative to `b7ab784d95f1231c5f25a6c26dba3fa811d0d02d`. Governance-document changes are permitted only in the B4 review plan and B4 deployment-readiness document. The review bundle must carry a target-vs-parent name/status diff derived from immutable git objects. The exact target commit is supplied externally by the Review-Custody harness and must be reproduced in the review's migration compatibility attestation.

## Exact production-pending set

At plan freeze, read-only production ledger comparison under one collation yields exactly these five pending migrations, in filename order:

1. `database/migrations/20260929000001_writer_understanding.sql`
   SHA-256 `b7c345dde35636dbffd3755e1c2f5e5e93415c4faba7796245a84e923f28e016`
2. `database/migrations/20260929000002_writer_declared_manuscript_state.sql`
   SHA-256 `e672321b7884e44c68271687999ccc3e96742667113a8a910682f4b263055638`
3. `database/migrations/20260929000003_ask_threads_living_work_subject.sql`
   SHA-256 `8fd3dc1ff47e6b3d6f4265c19be86cd9ee56e9d3cd827771e05b51f190a4020c`
4. `database/migrations/20260929000004_writer_studio_corrections.sql`
   SHA-256 `85e50576175557635791436412b92ea596ef972077bb730e98b166eb8627ba76`
5. `database/migrations/20260929000005_writer_studio_beta_feedback.sql`
   SHA-256 `b9125667e8cdc64197610a776ddfe7e87c63bd0dd8e37a3aec4bdf4693cdf557`

The deploy lane must rederive this set immediately before mutation. Any addition, removal, reorder, byte movement, live-reader movement, or target movement refuses this review.

## Deployment ordering

The governed production path is `scripts/deploy-production.sh deploy <exact-target-SHA>`.

For a migration-bearing release, the required order is:

exact target materialization → dependency audit → build → image provenance → admitted migration review/final compatibility/all-prefix compatibility → exact pending-set re-witness → exact live-reader re-witness → migrations commit independently in filename order → rollback tagging → candidate swap → running provenance/smoke.

A failed migration must leave the candidate unswapped and the exact old reader live. Because each migration commits independently, the reviewer must establish old-reader compatibility after every possible committed prefix 1 through 5, not only after the final schema.

The zero-drift `prepare-maia` / `cutover-maia` quick lane is not lawful for this target while these migrations are pending.

## Production preconditions supplied as bounded context, not review conclusions

Read-only B4 production witness immediately before this review found:

- `living_works`: 8 rows;
- `ask_threads`: 10 rows;
- `ask_turns`: 22 rows;
- `member_manuscripts`: 17 rows;
- existing `ask_threads` with `manuscript_id IS NULL`: 0;
- all five new schema surfaces absent before migration;
- current reader stamp: `7a096281a`;
- exact rollback tag `maia-sovereign:7a096281a` resolves to the current live image.

The independent reviewer has no production shell/database authority. These facts are provided only to bound practical lock/compatibility reasoning; the review must not claim it measured production itself.

## Independent review questions

The reviewer must independently establish or reject all of the following from exact source bytes:

1. Migration 1 is additive and does not change any table/query shape used by `7a096281a...`.
2. Migration 2 adds a nullable `living_works.manuscript_state` with a NULL-permitting check, and every old-reader `living_works` read/write remains lawful.
3. Migration 3 widens `ask_threads` from manuscript-only container identity to exactly one of manuscript/Living-Work containers without invalidating existing rows or any old-reader Ask/editorial insert, read, delete, trigger, or foreign-key expectation.
4. Replacing `ask_threads_freeze()` in migration 3 preserves every old-reader frozen-field invariant and does not accidentally unfreeze a field that old code relies on.
5. Migration 4 is additive, its foreign keys and append-only trigger are coherent with existing `ask_turns`/`living_works` ownership/cascade semantics, and it does not change an old-reader path.
6. Migration 5 is additive, stores only the bounded explicit beta evidence claimed by the feature, and does not change an old-reader path.
7. The target reader's writer-understanding, Work-first Ask, correction succession, beta-access, and beta-feedback code is compatible with the final schema and fails closed appropriately before its tables exist.
8. The pilot-access gate cannot be granted solely by a URL flag and feedback POST independently verifies pilot eligibility.
9. Reader rollback to `7a096281a...` remains lawful against every possible committed migration prefix and the final expanded schema; no DB down-migration is needed for reader rollback.
10. DDL locking/constraint-validation risks are materially acceptable or are identified as findings requiring remediation before deployment.
11. The exact target is application-byte-equivalent to application-code parent `b7ab784d95f1231c5f25a6c26dba3fa811d0d02d`, with only the two permitted B4 governance documents allowed to differ.

A verdict of `REVISE` or `BLOCKED` is lawful and must not be converted into approval to complete deployment.

## Minimum physical Reads

The reviewer must physically Read, at minimum:

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- all five pending migration files;
- `scripts/deploy-production.sh`;
- `scripts/run-sql-migrations.sh`;
- `lib/writersStudio/writerUnderstanding.ts`;
- `lib/writersStudio/writerUnderstandingServer.ts`;
- `app/api/sovereign/living-works/[id]/writer-understanding/route.ts`;
- `lib/manuscript/ask/threadStore.ts`;
- `lib/manuscript/ask/workContext.ts`;
- `lib/manuscript/ask/askReader.ts`;
- `app/api/sovereign/living-works/[id]/ask/route.ts`;
- `lib/writersStudio/writerCorrections.ts`;
- `lib/writersStudio/writerCorrectionsServer.ts`;
- `app/api/sovereign/living-works/[id]/corrections/route.ts`;
- `lib/writersStudio/betaAccessServer.ts`;
- `app/api/sovereign/writers-studio/beta-access/route.ts`;
- `app/api/sovereign/writers-studio/beta-feedback/route.ts`;
- `app/dev/writers-studio-p4r1/P4R1BetaFeedback.tsx`;
- exact old-reader `app/api/sovereign/living-works/route.ts`;
- exact old-reader `lib/manuscript/ask/threadStore.ts`;
- exact old-reader `lib/manuscript/editorialRuntime/thread.ts`;
- enough additional exact source discovered through Grep/Glob to adjudicate the questions above.

The old-reader paths live beneath `old-reader/<exact-old-reader-SHA>/...` in the compatibility review bundle.

Grep/Glob may scope discovery but do not witness coverage. Bash/shell, Write, Edit, mutation tools, network access, and database access are forbidden to the independent reviewer.

## Required review JSON

The review must contain the ordinary Review-Custody fields:

- `verdict`: `APPROVED | REVISE | BLOCKED`;
- exact `plan_sha256`;
- stable `trace_id` equal to the reviewer process session identity;
- non-empty `reviewer`, `summary`, `findings`, `coverage.files`, and explicit `limitations`.

It must additionally carry:

`migration_compatibility`:

- `instrument = migration-compatibility/v1`;
- verdict `COMPATIBLE` or `INCOMPATIBLE`;
- exact full old-reader commit;
- exact full target-reader commit;
- exact five ordered pending migration paths and SHA-256 values;
- physically witnessed old-reader evidence with repo path, SHA-256, and exact trace path beneath the old-reader root;
- non-empty rationale;
- explicit limitations;
- `failure_prefix_compatibility.instrument = migration-prefix-compatibility/v1`;
- verdict `ALL_PREFIXES_COMPATIBLE` only if every prefix 1..5 is genuinely compatible;
- exactly five prefix entries, each bound to the migration ending the prefix with non-empty rationale and explicit limitations.

The production gate recomputes target migration hashes and old-reader evidence from git objects. Self-reported hashes are not sufficient.

## Existing evidence may inform, not substitute

`WRITERS-STUDIO-SMALL-BETA-01_B4_DEPLOYMENT_READINESS_2026-09-29.md`, the B4 tests, migration-compatibility matrices, and prior deployment-safety records may be read as context. They do not substitute for this fresh independent review of the exact target relation.

## Closing condition

This plan authorizes nothing by itself.

Deployment may advance only if the frozen single-review gate reports:

`MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`

for the exact live old reader, exact target, exact five ordered pending migration blobs, exact admitted review bytes, and witnessed trace coverage.

Anything else is a refusal.
