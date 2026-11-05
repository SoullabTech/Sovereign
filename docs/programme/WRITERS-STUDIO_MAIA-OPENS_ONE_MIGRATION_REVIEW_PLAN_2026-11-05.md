# WRITERS-STUDIO MAIA OPENS — exact one-migration review plan

**Date:** 2026-11-05
**Status:** BOUNDED INDEPENDENT REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF
**Live old reader at plan freeze:** `08d5fcb2a5ddfe23ae1abc98c95176a1431ea093`
**Candidate lineage before this plan:** PR #2133 (Conversation Stage, merged as `fa535b692`) and PR #2135 (MAIA opens + import posture ask)
**Founder authorization:** "deploy" (2026-11-05), after a local walk of the import fix.

## Exact target relation

The Review-Custody harness supplies the deployment target externally. This document never
identifies it by an embedded commit SHA. The target must contain this plan and PR #2135.

The reviewer must establish the exact target relation from immutable git bytes. Any
movement after review invalidates applicability and requires a new review.

## Exact production-pending set

A read-only comparison against the production migration ledger found exactly one canonical
migration absent once PR #2135 lands:

1. `database/migrations/20261105000002_writer_editorial_opening_episode.sql`

The deploy lane must independently re-derive the pending set immediately before mutation.
Any addition, removal, byte movement, live-reader movement or target movement refuses
this review. The gate recomputes the migration hash from git objects.

## What the migration does

On `writer_editorial_relationship_episodes` it:
- adds one nullable column `editorial_opening_gesture text`;
- replaces the `child_kind` CHECK to admit a third value, `EDITORIAL_OPENING`;
- replaces `were_child_shape_scope_and_semantics`, keeping the `EDITORIAL_TURN` and
  `REVIEW_DISCUSS` branches as before plus `editorial_opening_gesture IS NULL`, and adding an
  `EDITORIAL_OPENING` branch (MAIA turn index 0, member turn index NULL, gesture exactly
  `opened_conversation_on_passage`);
- creates a partial unique index `were_editorial_opening_once` on `editorial_thread_id`
  where `child_kind = 'EDITORIAL_OPENING'`;
- comments the new column.

It rewrites no row, creates no trigger or function, and touches no other table.

## Deployment ordering

1. exact target materialization;
2. build and provenance;
3. admitted migration review and all-prefix compatibility;
4. exact pending-set re-witness;
5. exact old-reader re-witness;
6. migration;
7. candidate swap;
8. running provenance and health.

A failed migration must leave the candidate reader unswapped.

## Independent review questions

1. Existing rows satisfy the new shape CHECK: every existing row has
   `editorial_opening_gesture` NULL, and the `EDITORIAL_TURN` / `REVIEW_DISCUSS` branches are
   otherwise unchanged from the constraint they replace.
2. The exact old reader's inserts (`appendEditorialEpisodeWithClient`,
   `appendReviewDiscussEpisodeWithClient` in old-reader `lib/writers-studio/relationshipCustody.ts`)
   still satisfy the new constraints, because they never set the new column.
3. The exact old reader never writes `EDITORIAL_OPENING`, so between migration and swap no
   opening row can exist, and the old reader's reads are unaffected (prefix 1).
4. The migration follows the lock-timeout law (`BEGIN`, then `SET LOCAL lock_timeout`, before
   any DDL); the CHECK re-validation and index build are bounded for this table's size.
5. The migration is transactional and re-runnable (`IF NOT EXISTS` / `IF EXISTS`).
6. The target reader is compatible with the final schema: the opening write in
   `lib/writers-studio/relationshipCustody.ts` and its callers in
   `app/api/writers-studio/editorial/turn/route.ts` and
   `lib/manuscript/editorialRuntime/turn.ts` produce rows that satisfy the new branch, and an
   opening is refused under Sanctuary.
7. **Reader rollback.** After the new reader has written opening rows, a rollback to
   `08d5fcb2a…` is lawful for writes. Known degradation to judge: old-reader `mapEpisode`
   treats any non-`EDITORIAL_TURN` row as `REVIEW_DISCUSS`, so
   `GET /api/writers-studio/relationships/[id]` would present an opening with null review
   fields. The reviewer must judge whether that is an acceptable, presentation-only
   degradation or a blocker. No down-migration is required.
8. Member-visible change is limited to Writer's Studio Focus (MAIA speaks first) and import
   (an in-place Ordinary/Sanctuary choice for a writer with no stored choice).

A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into approval.

## Minimum physical Reads

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- `database/migrations/20261105000002_writer_editorial_opening_episode.sql`;
- `database/migrations/20260925000006_writer_editorial_scope_identity_successor.sql` (the constraint this migration replaces);
- `scripts/deploy-production.sh`;
- `scripts/run-sql-migrations.sh`;
- target `lib/writers-studio/relationshipCustody.ts`;
- target `app/api/writers-studio/editorial/turn/route.ts`;
- target `lib/manuscript/editorialRuntime/turn.ts`;
- target `lib/writersStudio/conversationOpening.ts`;
- exact old-reader `lib/writers-studio/relationshipCustody.ts`;
- exact old-reader `lib/writers-studio/relationshipCarriage.ts`;
- exact old-reader `app/api/writers-studio/relationships/[id]/route.ts`.

Old-reader paths live beneath `old-reader/<exact-old-reader-SHA>/...` in the bundle.
Search may help find files but does not count as coverage.

## Required review JSON

Ordinary Review-Custody fields (`verdict`, `plan_sha256`, `trace_id` = reviewer session id,
`reviewer`, `summary`, `findings`, `coverage.files`, `limitations`) and
`migration_compatibility` (`instrument = migration-compatibility/v1`; verdict; exact full
old-reader and target commits; the single pending migration path and SHA-256; old-reader
evidence with repo path, SHA-256 and trace path; rationale; limitations;
`failure_prefix_compatibility` with `instrument = migration-prefix-compatibility/v1`, verdict
`ALL_PREFIXES_COMPATIBLE` only if prefix 1 is established, exactly one prefix entry).

## Existing evidence may inform, not substitute

- `lib/writers-studio/__tests__/openingCustody.test.ts`, `openingCustody.pg.test.ts`,
  `app/api/writers-studio/editorial/turn/__tests__/openingRoute.test.ts`;
- PR #2135 CI, including empty-database reconstruction.

## Closing condition

This plan authorizes nothing by itself. Deployment may advance only if the frozen composed
gate reports `MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES` for the exact live old
reader, exact target, exact pending migration blob, exact admitted review bytes, and
coverage physically witnessed in the trace.
