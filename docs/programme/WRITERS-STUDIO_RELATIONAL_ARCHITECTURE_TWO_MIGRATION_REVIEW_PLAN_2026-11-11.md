# Writer's Studio relational architecture deploy 2026-11-11: two-migration review plan

**Date:** 2026-11-11
**Status:** a bounded, independent review plan. It confers no deployment authority by itself.
**Live old reader:** supplied by the harness through the bundle's `MIGRATION_COMPATIBILITY_CONTEXT.json`, not embedded here, because a plan that names a live release goes stale when another lane deploys. The deploy lane re-witnesses the old reader immediately before mutation.
**Founder authorization:** "Yes, merge and deploy" (2026-11-11), for the relational architecture stack. It is PR #2220, carrying #2216–#2220, merged as `053fde302`. The first deploy of `053fde302` was refused by this gate before any mutation. This plan is the lawful route through it.

## Exact target relation

The harness supplies the deployment target. The target must contain this plan and the two migrations below. It is the canonical commit that adds this plan on top of the canonical head it was branched from, and it differs from that head only by this document. The reviewer establishes this relation from immutable git bytes where possible, and otherwise says so. Any movement after review invalidates applicability.

## Exact production-pending set

The refused deploy's own preflight listed exactly these two migrations as pending, in this order:

1. `database/migrations/20261111000001_work_editorial_letters.sql`
   sha256 `a3f0ecf31a2916f66f7b339e31fc962ba5c53dba51ab48ea3906a3f5c591bcdd`
2. `database/migrations/20261111000002_editorial_pass_runs.sql`
   sha256 `baeee378a74eeff2a834675de717ae8117d93686885fdd977c39a91c53e0560a`

No rollback (`database/rollbacks/`) file exists for either. Each file carries its own `BEGIN … COMMIT`, so each commits independently, and a failure can leave the first applied without the second.

## What each migration does

**1. `work_editorial_letters`.** It creates two **new** tables and touches no existing table:
- `work_editorial_letters`: member, manuscript, draft revision, map JSONB, created_at.
- `work_place_decision_events`: member, manuscript, letter, place id, decision `intended | later | cleared`, decided_at.

Foreign keys: `members` ON DELETE CASCADE, `member_manuscripts` ON DELETE CASCADE, and `work_editorial_letters` ON DELETE CASCADE from the decision events. Both tables get a BEFORE UPDATE trigger that refuses any update; they are append-only. It creates the function `ws_letter_append_only()`.

**2. `editorial_pass_runs`.** It creates two **new** tables and touches no existing table:
- `editorial_pass_runs`: member, manuscript, draft revision, created_at.
- `editorial_pass_run_events`: run, state CHECK, lens, reading_id, refusal, letter_id, at.

Foreign keys: `members` and `member_manuscripts` ON DELETE CASCADE; runs ON DELETE CASCADE from events; `work_editorial_letters` ON DELETE SET NULL. **Migration 2 therefore depends on migration 1.** Both tables get a BEFORE UPDATE refusal trigger. It creates the function `ws_pass_run_append_only()`.

Both migrations open `BEGIN`, then set `SET LOCAL lock_timeout = '5s'` before any DDL. Both use `IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION` and `DROP TRIGGER IF EXISTS`, so a re-run is safe.

## Production facts supplied to the reviewer

These were read-only (counts and schema only) on 2026-11-11, with no member content:
- None of the four tables exists. Neither function exists.
- `members` exists (94 rows) and `member_manuscripts` exists (33 rows). `gen_random_uuid()` is available.
- The newest applied migrations are `20261108000002…`–`20261108000004…`. Neither migration above is recorded in the ledger.

## Deployment ordering (as implemented in `scripts/deploy-production.sh`)

1. Exact target materialization.
2. Build, and pre-swap image provenance.
3. Admitted migration review, compatibility and all-prefix compatibility.
4. Exact pending-set re-witness.
5. Exact old-reader re-witness.
6. Migrations, in the order above, **while the old reader is live**.
7. Rollback tags and candidate swap.
8. Running provenance, health and smoke tests.

A failed migration must leave the candidate unswapped and the old reader live.

## Independent review questions

1. **Additive.** Establish that neither migration alters, drops, rewrites or backfills any existing table, column, constraint, trigger or data.
2. **Lock-timeout law.** Each migration sets `lock_timeout` inside its transaction before any DDL. Judge the lock risk of creating foreign keys to `members` and `member_manuscripts`, which take a SHARE ROW EXCLUSIVE lock on the referenced tables.
3. **Old reader unaffected.** The exact old reader has no code that reads or writes the new tables. Confirm by search and read what you rely on. Its existing queries are unaffected by new tables and functions.
4. **Old reader's deletes.** Every new foreign key that references `members` or `member_manuscripts` is ON DELETE CASCADE, and the new tables are empty between migration and swap. Judge whether old-reader account deletion (`app/api/members/delete-account/route.ts`) and manuscript deletion still succeed in that window and after.
5. **Prefix compatibility.** Prefix 1 alone, and prefix 1–2, are each compatible with the exact old reader still being live.
6. **Target reader against the final schema.** Judge whether the target's writers and readers produce statements consistent with the columns, CHECKs and triggers: `lib/writersStudio/letter/letterStore.ts` and `lib/writersStudio/studio/passRun.ts`. Note in particular whether any target code issues an UPDATE on these tables, which the triggers refuse.
7. **Consent and Sanctuary.**
   - A letter is written only by `app/api/sovereign/manuscripts/[id]/attention-map/route.ts`, behind `keepRefusal`, or by the server run.
   - A decision is written only by `app/api/sovereign/manuscripts/[id]/editorial-letter/decisions/route.ts`, behind `keepGate`.
   - A run is started only by `app/api/sovereign/manuscripts/[id]/editorial-pass/route.ts`, behind `keepGate`. It re-checks whole-Work permission and the account's Sanctuary default before each reading (`passRun.ts`).

   Is anything written without the member's own act, or in Sanctuary?
8. **Rollback.** Rollback is `scripts/deploy-production.sh rollback` to the previous image, with the schema left in place. Judge what the old reader would do with rows the target wrote. Expected: it ignores them, and account deletion cascades them away. Name anything lost or blocked.

A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into approval.

## Minimum physical Reads

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- the two migrations above;
- `scripts/deploy-production.sh`;
- `scripts/run-sql-migrations.sh`;
- target `lib/writersStudio/letter/letterStore.ts`;
- target `lib/writersStudio/studio/passRun.ts`;
- target `app/api/sovereign/manuscripts/[id]/attention-map/route.ts`;
- target `app/api/sovereign/manuscripts/[id]/editorial-letter/decisions/route.ts`;
- target `app/api/sovereign/manuscripts/[id]/editorial-pass/route.ts`;
- target `app/api/members/delete-account/route.ts`;
- exact old-reader `app/api/members/delete-account/route.ts`.

Old-reader paths live beneath `old-reader/<exact-old-reader-SHA>/...` in the bundle. Search may help find files but does not count as coverage.

## Required review JSON

Ordinary Review-Custody fields: `verdict`, `plan_sha256`, `trace_id` (the reviewer session id), `reviewer`, `summary`, `findings`, `coverage.files`, `limitations`.

And `migration_compatibility`:
- `instrument = migration-compatibility/v1`;
- `verdict`: COMPATIBLE or INCOMPATIBLE;
- the exact full old-reader and target commits;
- `pending`: the two paths with SHA-256, in the order above;
- `old_reader_evidence`: the old-reader files read, each with repo path, SHA-256 and trace path;
- `rationale`;
- `limitations`;
- `failure_prefix_compatibility`, with `instrument = migration-prefix-compatibility/v1`, verdict `ALL_PREFIXES_COMPATIBLE` only if both prefixes are established, and exactly **two** prefix entries. Prefix *n* is bound to the *n*th migration's path and SHA-256, each with `through_path`, `through_sha256`, `rationale` and `limitations`.

## Existing evidence may inform, not substitute

PR #2220 (merged as `053fde302`): CI was green, including the **empty database reconstruction** with both migrations applied, the TypeScript no-regression gate, and the covenant gates (Class B). The Writer's Studio suite passed 1,688 tests, with one known, deliberate red in `developAskable`. No browser walk and no real-database run of the new routes have been done.

## Closing condition

An admitted `APPROVED` review with `COMPATIBLE` and `ALL_PREFIXES_COMPATIBLE` licenses the migrate-before-swap sequence above, for this exact pending set and no other. It is not a statement that any migration or feature is correct.
