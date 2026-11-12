# Sound Studio + Writer's Studio relational architecture deploy 2026-11-11: three-migration review plan

**Date:** 2026-11-11
**Status:** a bounded, independent review plan. It confers no deployment authority by itself.
**Supersedes:** `docs/programme/WRITERS-STUDIO_RELATIONAL_ARCHITECTURE_TWO_MIGRATION_REVIEW_PLAN_2026-11-11.md`. That plan named two migrations and the pre-correction SHA-256 of `20261111000002`; both are now wrong. It is left byte-for-byte as written.
**Live old reader:** supplied by the harness through the bundle's `MIGRATION_COMPATIBILITY_CONTEXT.json`, not embedded here, because a plan that names a live release goes stale when another lane deploys. The deploy lane re-witnesses the old reader immediately before mutation.
**Founder authorization:**
- "1 unblock 2 deploy 3 merge and deploy" (2026-11-11), for Sound Studio (LISTEN-01, #1979): #2199, #2202, #2203.
- "Yes, merge and deploy" (2026-11-11), for the relational architecture stack: #2220.
- "Yes, run it here" (2026-11-11): one deploy carrying both, because canonical now holds both.
- "Yes, ship session fixes" (2026-11-11): the in-place correction of `20261111000002`, #2227.

The full deploy of canonical `3555668f5` was refused by this gate before any mutation (three pending migrations, no admitted review). This plan is the lawful route through it.

## Exact target relation

The harness supplies the deployment target. The target must contain this plan, the three migrations below and the regression test `tests/constitutional/ws-delete/dynamic/run-pass-run-letter-erasure-pg16.sh`. It is the canonical commit that adds this plan on top of the canonical head that carries #2227, and it differs from that head only by this document. The reviewer establishes this relation from immutable git bytes where possible, and otherwise says so. Any movement after review invalidates applicability.

## Exact production-pending set

The refused deploy's preflight listed exactly these three as pending, in this order. Production's ledger was re-read (read-only) on 2026-11-11: its newest row is `20261108000004_development_plans.sql`, and no `20261109*` or `20261111*` row exists.

1. `database/migrations/20261109000001_sound_studio_reviews.sql`
   sha256 `3b1d40494613f1a122deacfcedd6d9d1c1def3396d0806a403110cc667a8cc7f`
2. `database/migrations/20261111000001_work_editorial_letters.sql`
   sha256 `a3f0ecf31a2916f66f7b339e31fc962ba5c53dba51ab48ea3906a3f5c591bcdd`
3. `database/migrations/20261111000002_editorial_pass_runs.sql` (as corrected by #2227)
   sha256 `43676c02d79089b87995a02bb591cf5f0361b061a60085498c46441bd09f19f9`

No rollback (`database/rollbacks/`) file exists for any of them. Each file carries its own `BEGIN … COMMIT`, so each commits independently, and a failure can leave any prefix applied.

## What each migration does

**1. `sound_studio_reviews`.** It creates one **new** table, `sound_studio_reviews`, and touches no existing table.
- Columns: member, work id (CHECK on pattern), passage label, elapsed ms, `lines` JSONB (an array of 1–12 items), `transcript` JSONB (NULL unless the reviewer chose to keep it; at most 40 items), consent version, origin (`review_guide | maia_bridge`) and created_at.
- One foreign key: `members` ON DELETE CASCADE.
- Two indexes and two comments. No trigger and no function.

**2. `work_editorial_letters`.** It creates two **new** tables and touches no existing table:
- `work_editorial_letters`: member, manuscript, draft revision, map JSONB and created_at.
- `work_place_decision_events`: member, manuscript, letter, place id, decision (`intended | later | cleared`) and decided_at.

Foreign keys: `members` and `member_manuscripts` ON DELETE CASCADE, and `work_editorial_letters` ON DELETE CASCADE from the decision events. Both tables get a BEFORE UPDATE trigger that refuses any update. It creates the function `ws_letter_append_only()`.

**3. `editorial_pass_runs`.** It creates two **new** tables and touches no existing table:
- `editorial_pass_runs`: member, manuscript, draft revision and created_at.
- `editorial_pass_run_events`: run, state CHECK, lens, reading_id, refusal, letter_id and at.

Foreign keys: `members` and `member_manuscripts` ON DELETE CASCADE; runs ON DELETE CASCADE from events; and `work_editorial_letters` ON DELETE SET NULL. **Migration 3 therefore depends on migration 2.**

Triggers and functions:
- `editorial_pass_runs` keeps a BEFORE UPDATE trigger on `ws_pass_run_append_only()`, which refuses every update.
- `editorial_pass_run_events` has its own function, `ws_pass_run_event_append_only()`, added by #2227. It allows exactly one UPDATE: the letter_id foreign key's own SET NULL. That means the update fires inside another trigger (`pg_trigger_depth() > 1`), `letter_id` goes from a value to NULL, and every other column is unchanged (`to_jsonb(NEW) - 'letter_id' = to_jsonb(OLD) - 'letter_id'`). It refuses every other UPDATE.

Before #2227, the events trigger refused that SET NULL too. Once a pass had recorded its letter, deleting the letter, erasing the manuscript or deleting the account therefore failed.

All three migrations open `BEGIN`, then set `SET LOCAL lock_timeout = '5s'` before any DDL. All use `IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION` and `DROP TRIGGER IF EXISTS`, so a re-run is safe.

## Production facts supplied to the reviewer

These were read-only (counts and catalog only) on 2026-11-11, with no member content, on PostgreSQL 16.13:
- None of the five tables exists (`sound_studio_reviews`, `work_editorial_letters`, `work_place_decision_events`, `editorial_pass_runs`, `editorial_pass_run_events`).
- None of the three functions exists.
- `members` has 94 rows and `member_manuscripts` 33. Both `id` columns are `uuid`.
- `gen_random_uuid()` is available.
- The live reader's environment has the Sound Studio review flag off: `SOULLAB_LISTEN_REVIEW_ENABLED=1` is absent from `.env.production` (count 0).

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

1. **Pending set and hashes.** The three paths and SHA-256 values above are exactly the target's bytes. Production records none of them.
2. **Additive.** Establish that no migration alters, drops, rewrites or backfills any existing table, column, constraint, trigger or data. Nothing they create exists in production.
3. **Lock-timeout law.** Each migration sets `lock_timeout` inside its transaction before any DDL. Judge the lock risk of the new foreign keys, which take a SHARE ROW EXCLUSIVE lock on `members` (migrations 1–3) and `member_manuscripts` (migrations 2–3).
4. **Old reader unaffected, and prefix compatibility.** The exact old reader has no code that reads or writes the new tables or functions; confirm by search, and read what you rely on. Prefix 1, prefix 1–2 and prefix 1–3 must each be compatible with the exact old reader still being live. Migration 3 requires migration 2's `work_editorial_letters`.
5. **The events trigger allows exactly the foreign key's SET NULL.** Judge whether `ws_pass_run_event_append_only()` admits anything other than the referential SET NULL of `letter_id`. The test `tests/constitutional/ws-delete/dynamic/run-pass-run-letter-erasure-pg16.sh` claims these results: deleting a letter, a manuscript and an account succeeds, while five ordinary UPDATEs are refused. Those five are a direct `letter_id → NULL`, a state change, `letter_id → NULL` together with another column, an update on `editorial_pass_runs`, and an update on `work_editorial_letters`. Read the test; say whether it proves that claim, and what it does not cover.
6. **Target reader against the final schema.** Judge whether the target's writers and readers produce statements consistent with the columns, CHECKs and triggers, and whether any issues an UPDATE the triggers refuse:
   - `lib/writersStudio/letter/letterStore.ts`
   - `lib/writersStudio/studio/passRun.ts`
   - `app/api/listen/review/route.ts`
   - `app/api/listen/review/[id]/route.ts`
   - `app/api/admin/monitor/sound-studio-reviews/route.ts`
7. **Deletion with the tables populated.** Every new foreign key that references `members` or `member_manuscripts` is ON DELETE CASCADE. Judge whether target account deletion (`app/api/members/delete-account/route.ts`) and manuscript erasure (`lib/manuscript/source/eraseManuscript.ts`) succeed when all five tables hold the member's rows, including a completed pass with its letter. Also judge whether the old reader's account deletion succeeds in the window between migration and swap.
8. **Rollback.** Rollback is `scripts/deploy-production.sh rollback` to the previous image, with the schema left in place. `scripts/rollback-guards/` holds no guard for the old reader. Judge what the old reader would do with rows the target wrote. Expected: it ignores them, and account deletion cascades them away. Name anything lost or blocked, and whether a data guard is needed.
9. **Consent, Sanctuary and the dark launch.**
   - A Sound Studio review row is written only by the reviewer's deliberate confirm (`POST /api/listen/review`, behind `requireListenReviewer`), and the raw transcript only when the reviewer chose to keep it. Confirm that with the review flag off, no route writes or reads `sound_studio_reviews` for a member.
   - A letter is written only at synthesis or by the server run. A decision is written only by the member's own request. A run is started only by the member's request, and it re-checks whole-Work permission and the account's Sanctuary default before each reading.

   Is anything written without the member's own act, or in Sanctuary?

A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into approval.

## Minimum physical Reads

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- the three migrations above;
- `tests/constitutional/ws-delete/dynamic/run-pass-run-letter-erasure-pg16.sh`;
- `scripts/deploy-production.sh`;
- `scripts/run-sql-migrations.sh`;
- target `lib/writersStudio/letter/letterStore.ts`;
- target `lib/writersStudio/studio/passRun.ts`;
- target `app/api/sovereign/manuscripts/[id]/attention-map/route.ts`;
- target `app/api/sovereign/manuscripts/[id]/editorial-letter/decisions/route.ts`;
- target `app/api/sovereign/manuscripts/[id]/editorial-pass/route.ts`;
- target `app/api/listen/review/route.ts`;
- target `app/api/listen/review/[id]/route.ts`;
- target `lib/listening/listenReviewerGate.ts`;
- target `app/api/admin/monitor/sound-studio-reviews/route.ts`;
- target `app/api/members/delete-account/route.ts`;
- target `lib/manuscript/source/eraseManuscript.ts`;
- exact old-reader `app/api/members/delete-account/route.ts`;
- exact old-reader `lib/manuscript/source/eraseManuscript.ts`.

Old-reader paths live beneath `old-reader/<exact-old-reader-SHA>/...` in the bundle. Search may help find files but does not count as coverage.

## Required review JSON

Ordinary Review-Custody fields: `verdict`, `plan_sha256`, `trace_id` (the reviewer session id), `reviewer`, `summary`, `findings`, `coverage.files`, `limitations`.

And `migration_compatibility`:
- `instrument = migration-compatibility/v1`;
- `verdict`: COMPATIBLE or INCOMPATIBLE;
- the exact full old-reader and target commits;
- `pending`: the three paths with SHA-256, in the order above;
- `old_reader_evidence`: the old-reader files read, each with repo path, SHA-256 and trace path;
- `rationale`;
- `limitations`;
- `failure_prefix_compatibility`, with `instrument = migration-prefix-compatibility/v1`, verdict `ALL_PREFIXES_COMPATIBLE` only if all three prefixes are established, and exactly **three** prefix entries. Prefix *n* is bound to the *n*th migration's path and SHA-256, each with `through_path`, `through_sha256`, `rationale` and `limitations`.

## Existing evidence may inform, not substitute

- **#2202 (Sound Studio review guide):** listening suite green; CI green, including empty-database reconstruction.
- **#2203 (media tickets):** listening suite 253/253 after the merge with canonical; CI green.
- **#2220 (merged as `053fde302`):** CI green, including empty-database reconstruction, the TypeScript no-regression gate and the covenant gates (Class B). The Writer's Studio suite passed 1,688 tests, with one known red.
- **#2227:** the regression test above fails on PostgreSQL 16.15 at its test-only commit (all three deletes refused) and passes at the fix on PostgreSQL 16.15 and 17.7, run on throwaway loopback clusters.

Not done anywhere: a browser walk, or a real-database run of the new routes.

## Closing condition

An admitted `APPROVED` review with `COMPATIBLE` and `ALL_PREFIXES_COMPATIBLE` licenses the migrate-before-swap sequence above, for this exact pending set and no other. It is not a statement that any migration or feature is correct.
