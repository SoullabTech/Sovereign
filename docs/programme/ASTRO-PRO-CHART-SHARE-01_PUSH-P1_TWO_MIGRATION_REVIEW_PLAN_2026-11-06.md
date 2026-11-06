# ASTRO-PRO-CHART-SHARE-01 + PUSH-NOTIFICATIONS / P1 — Exact Two-Migration Review Plan

**Date:** 2026-11-06
**Status:** BOUNDED INDEPENDENT REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF
**Live old reader at plan freeze:** `956051b5a7116280dfb14e6df5ddb0822e5b57f3`
**Candidate lineage before this plan:** `088fb49c520b55bffeb568a46766e3fec08faad5`

## Exact target relation

The deployment target is supplied externally by the Review-Custody harness and is never
self-identified by a commit SHA embedded in this document. The target must contain this
plan and the candidate lineage named above (PR #2140 chart shares, PR #2143 push devices).

The reviewer must establish the exact target relation from immutable git bytes. Any
application, migration, dependency, deploy-script, or governance movement after review
invalidates applicability and requires a new review.

## Exact production-pending set

Read-only production ledger comparison (2026-11-06) found these two candidate migrations
absent, and found neither table present in production. Both parent tables (`members`,
`astrology_pro_saved_charts`) are present. The deploy lane must independently rederive the
pending set immediately before mutation.

1. `database/migrations/20261105000003_astrology_pro_chart_shares.sql`
   SHA-256 `efeb0fb4b9367c451ca12cb12f3009c34df7135ba970e1f7b73c17c2fd3840be`
2. `database/migrations/20261105000003_member_push_devices.sql`
   SHA-256 `89391584a911a0ee887f12ae83988ab9f2ee52ca97eb32ece68c66ddab5576d9`

Filename order applies them in the order listed. Any addition, removal, reorder, byte
movement, live-reader movement, or target movement refuses this review.

## Deployment ordering

The governed production path must preserve:

exact target materialization → build/provenance → admitted migration review and
all-prefix compatibility → exact pending-set re-witness → exact old-reader re-witness
→ migrations in filename order → candidate swap → running provenance/health.

A failed migration must leave the candidate reader unswapped. Because migrations commit
independently, the reviewer must establish old-reader compatibility after every possible
committed prefix (after migration 1, after migrations 1–2), not only after the final schema.

## Independent review questions

The reviewer must independently establish or reject all of the following:

1. Migration 1 only creates `astrology_pro_chart_shares` and its two indexes, and touches
   no existing table, column, constraint or row.
2. Migration 1's foreign keys (`owner_member_id → members ON DELETE CASCADE`,
   `saved_chart_id → astrology_pro_saved_charts ON DELETE CASCADE`) cannot cause an
   old-reader delete or update of a member or saved chart to fail, and change no
   old-reader behaviour beyond removing share rows the old reader never reads.
3. Migration 2 only creates `member_push_devices` and its two indexes, and touches no
   existing table, column, constraint or row.
4. Migration 2's foreign key (`member_id → members ON DELETE CASCADE`) cannot cause an
   old-reader member delete to fail.
5. The exact old reader references neither new table, so it is compatible with the schema
   after prefix 1 and after prefix 1–2.
6. The target reader is compatible with the final schema: the share library, share routes,
   shared-chart routes, push-device route and delete-account route read and write only
   columns that exist, within the declared CHECK constraints.
7. Both migrations are safe to run twice (`IF NOT EXISTS`) and set `lock_timeout`, so a
   rerun after a ledger-insert failure does not fail and a held lock refuses rather than
   waits.
8. Reader rollback to `956051b5a...` remains lawful after each committed prefix and after
   the final schema; no DB down-migration is required for reader rollback.
9. DDL lock/index risks are acceptable for the observed production shape (both tables are
   new and empty; `astrology_pro_saved_charts` held 0 rows at plan freeze) or are recorded
   as findings requiring remediation.
10. Neither migration stores content a member did not knowingly give: chart-share rows hold
    no viewer data and no Ask MAIA question or answer; push-device rows hold only what the
    push service needs to address a device.

A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into
approval to complete deployment.

## Minimum physical Reads

The independent reviewer must physically Read, at minimum:

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- both pending migration files;
- `scripts/deploy-production.sh`;
- `scripts/run-sql-migrations.sh`;
- target `lib/astrology/proChartShares.ts`;
- target `app/api/astrology/pro/charts/[id]/share/route.ts`;
- target `app/api/shared-chart/[token]/ask/route.ts`;
- target `app/api/shared-chart/[token]/sky/route.ts`;
- target `app/api/members/push-device/route.ts`;
- target `lib/push/apns.ts`;
- target `app/api/members/delete-account/route.ts`;
- exact old-reader `lib/astrology/proSavedCharts.ts`;
- exact old-reader `app/api/members/delete-account/route.ts`.

The old-reader paths live beneath `old-reader/<exact-old-reader-SHA>/...` in the
compatibility review bundle. Search may scope discovery but does not witness coverage.

## Required review JSON

The review must carry the ordinary Review-Custody fields:

- `verdict`: `APPROVED | REVISE | BLOCKED`;
- exact `plan_sha256`;
- stable `trace_id` equal to the reviewer session identity;
- non-empty `reviewer`, `summary`, `findings`, `coverage.files`, and explicit
  `limitations`.

It must additionally carry `migration_compatibility` with:

- `instrument = migration-compatibility/v1`;
- verdict `COMPATIBLE` or `INCOMPATIBLE`;
- exact full old-reader commit;
- exact full target-reader commit;
- exact two ordered pending migration paths and SHA-256 values;
- physically witnessed old-reader evidence with repo path, SHA-256, and exact trace path;
- non-empty rationale and explicit limitations;
- `failure_prefix_compatibility.instrument = migration-prefix-compatibility/v1`;
- verdict `ALL_PREFIXES_COMPATIBLE` only if prefixes 1 and 2 are each established;
- exactly two prefix entries, each bound to its ending migration, with rationale and
  explicit limitations.

The production gate recomputes target migration hashes and old-reader evidence from git
objects. Self-reported hashes do not establish compatibility.

## Existing evidence may inform, not substitute

The PR #2140 and #2143 tests, CI empty-database reconstruction, and the author's own
reading may inform the review. They do not substitute for a fresh independent review of
this exact relation.

## Closing condition

This plan authorizes nothing by itself.

Deployment may advance only if the frozen composed gate reports:

`MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`

for the exact live old reader, exact target, exact ordered pending migration blobs,
exact admitted review bytes, and physically witnessed trace coverage.
