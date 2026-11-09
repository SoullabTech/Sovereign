# Writer's Studio Develop deploy 2026-11-09 — exact four-migration review plan

**Date:** 2026-11-09
**Status:** BOUNDED INDEPENDENT REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF
**Live old reader:** supplied externally by the harness through the bundle's
`MIGRATION_COMPATIBILITY_CONTEXT.json`, deliberately not embedded here (a plan that names a live
release goes stale when another lane deploys). The reviewer establishes the exact old reader from
the bundle; the deploy lane re-witnesses it immediately before mutation.
**Founder authorization:** "merge and deploy" (2026-11-09) for PR #2194 (Writer's Studio Develop
redesign, Sanctuary closure, conventions lane), merged as `aead4f6b1`. The first deploy attempt
was refused by this gate before any mutation; this plan is the lawful route through it.

## Exact target relation

The harness supplies the deployment target externally. The target must contain this plan and the
four migrations below. Because the gate reads the plan from the target commit, the target is the
canonical commit that adds this plan on top of `aead4f6b1`; it must differ from `aead4f6b1` only
by documentation. The reviewer establishes the exact relation from immutable git bytes where it
can, and otherwise says so. Any movement after review invalidates applicability.

## Exact production-pending set

The refused deploy's own preflight listed exactly these four migrations as pending, in this order:

1. `database/migrations/20261108000001_work_reading_scope.sql`
   sha256 `bfd5b8095a631b8c1ff18590ef0eef9298e75f978597d214ccf02e2f34d51283`
2. `database/migrations/20261108000002_writer_decision_events.sql`
   sha256 `9877e21d7ffbe2ff123898edbcd74bbd00a0433e2527d68ac33d4010e76148b7`
3. `database/migrations/20261108000003_living_work_kind.sql`
   sha256 `7a4346a08e4b0767c8e670783150e60f894c576c97d1deff6f1ae742115c6475`
4. `database/migrations/20261108000004_development_plans.sql`
   sha256 `0e96c94b394860f993dde74d650827720ed916c1faa2b85c5eacec1fc7751bdf`

No rollback (`database/rollbacks/`) file exists for any of the four. Each file carries its own
`BEGIN … COMMIT`, so each commits independently and a failure can leave any prefix applied.

## What each migration does

**1. `work_reading_scope`.** Creates `work_reading_scope_events` (append-only grant/revoke of a
standing permission for MAIA to read a Work's saved text; FK `members` ON DELETE RESTRICT, FK
`living_works` ON DELETE CASCADE; UPDATE, direct DELETE while the Work exists, and TRUNCATE refused
by triggers). On the **existing** table `context_disclosure_receipts` it: drops and re-adds three
CHECK constraints (`boundary`, `participation_basis`, `gesture`), each restated as the union of
the previously admitted values plus one new value; adds a nullable column `scope_event_id`; adds a
CHECK that `scope_event_id` is present iff the basis is `standing_authorization`; adds a BEFORE
INSERT trigger validating `scope_event_id` and a BEFORE UPDATE trigger refusing any change to it.

**2. `writer_decision_events`.** Creates one append-only table of the writer's settled and
withdrawn decisions (FK `members` ON DELETE RESTRICT, FK `living_works` ON DELETE CASCADE,
self-FK for withdraws; UPDATE / direct DELETE / TRUNCATE refused by triggers).

**3. `living_work_kind`.** Adds a nullable `kind TEXT` column to the **existing** table
`living_works` with a CHECK (`NULL` or `fiction` · `nonfiction` · `practitioner`). No default,
no backfill.

**4. `development_plans`.** Creates `development_plans` (FK `members` RESTRICT, `living_works`
CASCADE, `member_manuscripts` CASCADE), `development_plan_history` (CASCADE from plans;
append-only except cascade), and `development_plan_step_links` (FK
`manuscript_revision_authorizations` CASCADE, plans CASCADE, `members` CASCADE; append-only except
cascade), with a BEFORE UPDATE trigger on plans that keeps history.

All four open `BEGIN` then `SET LOCAL lock_timeout = '5s'` and use `IF NOT EXISTS` /
`DROP … IF EXISTS` so a re-run is safe.

## Production facts supplied to the reviewer

Read-only, counts and schema only, taken 2026-11-09 ~19:05Z; no member content:

- None of `work_reading_scope_events`, `writer_decision_events`, `development_plans`,
  `development_plan_history`, `development_plan_step_links` exists. `living_works.kind` and
  `context_disclosure_receipts.scope_event_id` do not exist. `living_works`,
  `member_manuscripts` and `manuscript_revision_authorizations` exist.
- Production's current receipt CHECKs: `boundary` ∈ {`writers_studio.focus->maia_cognition`,
  `writers_studio.developmental_ask->maia_cognition`,
  `writers_studio.review_discuss->maia_cognition`, `writers_studio.editorial_turn->maia_cognition`};
  `participation_basis` = `member_invoked`; `gesture` ∈ {`ask_maia`, `work_with_this`,
  `widen_focus`, `authorize_sections`, `discuss_finding`}.
- Existing receipts: 41 rows — boundary `developmental_ask` 6, `editorial_turn` 35; basis
  `member_invoked` 41; gesture `work_with_this` 35, `authorize_sections` 6.
  `context_disclosure_receipts.member_id` is `text`. Existing receipt triggers:
  `context_disclosure_receipt_governed_delete_trigger`, `…_monotonic_trigger`,
  `…_restore_refusal_trigger`.
- `living_works`: 28 rows. `gen_random_uuid()` is available.
- Ledger: the newest applied migrations are the `202611010…`–`20261105000003` set; none of the four
  above is recorded.

## Deployment ordering (as implemented in `scripts/deploy-production.sh`)

1. exact target materialization; 2. build and pre-swap image provenance; 3. admitted migration
review, compatibility and all-prefix compatibility; 4. exact pending-set re-witness; 5. exact
old-reader re-witness; 6. migrations, in the order above, **while the old reader is live**;
7. rollback tags and candidate swap; 8. running provenance, health and smoke tests.
A failed migration must leave the candidate unswapped and the old reader live.

## Independent review questions

1. **Additive.** Establish that no migration drops, rewrites or backfills existing data. The
   receipt CHECK drop/re-add is the one non-trivial change: confirm each restated set is a
   superset of production's current set above, and that every existing receipt row satisfies the
   re-added CHECKs and the new `standing_has_scope` CHECK.
2. **Lock-timeout law.** Each migration sets `lock_timeout` inside its transaction before any DDL;
   `ALTER TABLE` on `context_disclosure_receipts` and `living_works` takes an ACCESS EXCLUSIVE
   lock and re-validates CHECKs over 41 and 28 rows. Judge the lock risk.
3. **Old reader writes to receipts still succeed.** Every boundary, basis and gesture value the
   exact old reader writes is still admitted, and the old reader's receipt INSERT and its
   `attempted → crossed` UPDATE pass the new triggers (it never sets `scope_event_id`). Read the
   old-reader receipt writer and its callers named below.
4. **Old reader and `living_works.kind`.** The old reader's INSERTs into `living_works` name their
   columns and its reads do not break on an extra nullable column (search may scope; read the
   files you rely on).
5. **New foreign keys and the old reader's deletes.** The new tables reference `members`
   (RESTRICT), `living_works`, `member_manuscripts` and `manuscript_revision_authorizations`
   (CASCADE). Between migration and swap all new tables are empty, so judge whether the old
   reader's account deletion, Work deletion, manuscript deletion and authorization erasure still
   succeed in that window.
6. **Prefix compatibility.** Prefixes 1, 1–2, 1–3 and 1–4 are each compatible with the exact old
   reader still being live.
7. **Target reader against the final schema.** The target's writers
   (`lib/disclosure/workReadScopeWrite.ts`, `lib/disclosure/workReadScopeRead.ts`,
   `lib/disclosure/contextDisclosureReceipt.ts`, `lib/writersStudio/decisionRecordWrite.ts`,
   `lib/writersStudio/decisionRecord.ts`, `lib/writersStudio/developmentPlanStore.ts`) produce
   statements consistent with the columns, CHECKs and triggers; and the target account deletion
   (`app/api/members/delete-account/route.ts`) removes or accounts for rows in the three
   RESTRICT-referencing tables before deleting a member.
8. **Member-visible change and consent.** From the target code, what can a member newly do, and
   is anything created without the member's own gesture (scope grants, decisions, Work kind and
   plans are each meant to be written only by the member's act)?
9. **Rollback.** Rollback is `scripts/deploy-production.sh rollback` to the previous image, schema
   left in place (no rollback files). There is no rollback data guard for the old reader in
   `scripts/rollback-guards/`. Judge what the old reader would do with rows the target wrote: in
   particular, whether old-reader account deletion would be refused by the RESTRICT foreign keys
   of `work_reading_scope_events`, `writer_decision_events` or `development_plans` for a member
   who has such rows, and whether any old-reader receipt read would break on the new boundary,
   basis or gesture values. Name what is lost or blocked.

A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into approval.

## Minimum physical Reads

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- the four migrations above;
- `scripts/deploy-production.sh`;
- `scripts/run-sql-migrations.sh`;
- target `lib/disclosure/contextDisclosureReceipt.ts`;
- target `lib/disclosure/workReadScopeWrite.ts`;
- target `lib/disclosure/workReadScopeRead.ts`;
- target `lib/writersStudio/decisionRecordWrite.ts`;
- target `lib/writersStudio/developmentPlanStore.ts`;
- target `app/api/members/delete-account/route.ts`;
- exact old-reader `lib/disclosure/contextDisclosureReceipt.ts`;
- exact old-reader `lib/disclosure/disclosureBoundary.ts`;
- exact old-reader `app/api/members/delete-account/route.ts`;
- exact old-reader `app/api/sovereign/living-works/route.ts`.

Old-reader paths live beneath `old-reader/<exact-old-reader-SHA>/...` in the bundle. Search may
help find files but does not count as coverage.

## Required review JSON

Ordinary Review-Custody fields (`verdict`, `plan_sha256`, `trace_id` = reviewer session id,
`reviewer`, `summary`, `findings`, `coverage.files`, `limitations`) and `migration_compatibility`
(`instrument = migration-compatibility/v1`; `verdict` COMPATIBLE or INCOMPATIBLE; exact full
old-reader and target commits; `pending` = the four paths with SHA-256 in the order above;
`old_reader_evidence` = old-reader files read, each with repo path, SHA-256 and trace path;
`rationale`; `limitations`; `failure_prefix_compatibility` with
`instrument = migration-prefix-compatibility/v1`, verdict `ALL_PREFIXES_COMPATIBLE` only if all
four prefixes are established, and exactly **four** prefix entries, prefix *n* bound to the *n*th
migration's path and SHA-256, each with `through_path`, `through_sha256`, `rationale`,
`limitations`).

## Existing evidence may inform, not substitute

PR #2194: DB suites 130/130 including the Sanctuary negative suite on a disposable PostgreSQL 16
built from the production-derived baseline with these four migrations applied (0 errors); no
TypeScript regressions; CI green. No independent Class A/R20 code review of PR #2194 was
performed; the founder chose to merge and deploy regardless. This review covers the migration
act only.

## Closing condition

An admitted `APPROVED` review with `COMPATIBLE` and `ALL_PREFIXES_COMPATIBLE` licenses the
migrate-before-swap sequence above for this exact pending set and no other. It is not a statement
that any migration or feature is correct.
