# ASTRO-PRO-SAVED-CHARTS-01 — exact one-migration review plan

**Date:** 2026-11-04
**Status:** BOUNDED INDEPENDENT REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF
**Live old reader at plan freeze:** `42164624d4f883a61d5e7b9183a6cecd90ac847c`
**Candidate lineage before this plan:** `5c7613b316ae4b90cf8a9ecdc8c8978c6788b176` (merge of #2101)
**Founder authorization:** "Deploy it" (2026-11-04), after the merge of #2101.

## Exact target relation

The Review-Custody harness supplies the deployment target externally. This document never
identifies it by an embedded commit SHA. The target must contain this plan and the Pro
lineage above (PR #2101).

The reviewer must establish the exact target relation from immutable git bytes. Any
movement after review invalidates applicability and requires a new review. That includes
movement in the application, migrations, dependencies, deploy scripts or governance.

## Exact production-pending set

A read-only comparison against the production migration ledger found exactly one canonical
migration absent:

1. `database/migrations/20261104000001_astrology_pro_saved_charts.sql`
   SHA-256 `24acd313e28ce5ce32dfdb2d067f50797304331cfd602b25aec093f9f80b3720`

The deploy lane must independently re-derive the pending set immediately before mutation.
Any addition, removal, byte movement, live-reader movement or target movement refuses
this review.

## What the migration does

It creates `astro_pro_saved_charts`: a Pro member's saved charts for other people. Each row
holds birth inputs the owner typed (date, time, latitude, longitude, timezone, an optional
place label), a short label, the owner's `permission_attested_at`, and `created_at`. It has:
- a foreign key `owner_member_id → members(id)` with `ON DELETE CASCADE`;
- CHECK constraints on label length, coordinate ranges, timezone and place-label length;
- an index on `(owner_member_id, created_at DESC)`;
- a table comment.

It creates no trigger or function, stores no computed chart, note or free text, and alters
no existing table. Only the target's Pro routes read or write it, all of which require
Pro access (`ASTRO_PRO_PREVIEW_ENABLED` plus the founder-only phase in production).

## Deployment ordering

The governed production path must preserve this order:

1. exact target materialization;
2. build and provenance;
3. admitted migration review and all-prefix compatibility;
4. exact pending-set re-witness;
5. exact old-reader re-witness;
6. migrations in filename order;
7. candidate swap;
8. running provenance and health.

A failed migration must leave the candidate reader unswapped. With one migration there is
one committed prefix, and the reviewer must establish old-reader compatibility after it.

## Independent review questions

The reviewer must independently establish or reject each of the following:

1. The migration is purely additive for the exact old reader. It creates one table and one
   index, and changes no column, constraint, trigger or row of any existing table.
2. The exact old reader never reads or writes `astro_pro_saved_charts`.
3. Old-reader member deletion (`DELETE FROM members` in
   `app/api/members/delete-account/route.ts`) still succeeds after the migration; saved
   charts cascade away with their owner and nothing blocks that delete.
4. The migration follows the lock-timeout law: its own `BEGIN`, then
   `SET LOCAL lock_timeout`, before any DDL. Any lock it takes on `members` when the
   foreign key is created is bounded and acceptable for a production table of that size.
5. The migration is safe to re-run (`IF NOT EXISTS`) and its transaction leaves no partial
   schema on failure.
6. The target reader (`lib/astrology/proSavedCharts.ts`, `lib/astrology/proRouteAccess.ts`,
   `lib/astrology/proRequestGuard.ts`, `lib/astrology/proSubjectBirth.ts`, and the routes
   `app/api/astrology/pro/charts/route.ts` and `app/api/astrology/pro/charts/[id]/route.ts`)
   is compatible with the final schema: every query is scoped by the verified owner, and a
   chart that belongs to someone else is reported as missing.
7. Reader rollback to `42164624d…` remains lawful after the committed migration, and no
   down-migration is required.
8. No member-visible behaviour changes in production for anyone other than members with
   Pro access, which in production today is the founder alone.

A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into approval to
complete deployment.

## Minimum physical Reads

The independent reviewer must physically Read, at minimum:

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- `database/migrations/20261104000001_astrology_pro_saved_charts.sql`;
- `scripts/deploy-production.sh`;
- `scripts/run-sql-migrations.sh`;
- target `lib/astrology/proSavedCharts.ts`;
- target `lib/astrology/proRouteAccess.ts`;
- target `lib/astrology/proRequestGuard.ts`;
- target `lib/astrology/proSubjectBirth.ts`;
- target `lib/astrology/proAccess.ts`;
- target `app/api/astrology/pro/charts/route.ts`;
- target `app/api/astrology/pro/charts/[id]/route.ts`;
- exact old-reader `app/api/members/delete-account/route.ts`;
- exact old-reader `lib/astrology/proAccess.ts`;
- exact old-reader `app/api/astrology/pro/my-chart/route.ts`.

The old-reader paths live beneath `old-reader/<exact-old-reader-SHA>/...` in the
compatibility review bundle. Search may help find files but does not count as coverage.

## Required review JSON

The review must carry the ordinary Review-Custody fields:

- `verdict`: `APPROVED | REVISE | BLOCKED`;
- the exact `plan_sha256`;
- a stable `trace_id` equal to the reviewer's session identity;
- non-empty `reviewer`, `summary`, `findings` and `coverage.files`, and explicit
  `limitations`.

It must also carry `migration_compatibility` with:

- `instrument = migration-compatibility/v1`;
- verdict `COMPATIBLE` or `INCOMPATIBLE`;
- the exact full old-reader commit;
- the exact full target-reader commit;
- the exact single pending migration path and its SHA-256;
- old-reader evidence the reviewer physically read: repo path, SHA-256 and exact trace path;
- a non-empty rationale and explicit limitations;
- `failure_prefix_compatibility.instrument = migration-prefix-compatibility/v1`;
- verdict `ALL_PREFIXES_COMPATIBLE` only if prefix 1 is established;
- exactly one prefix entry, bound to its ending migration, with a rationale and explicit
  limitations.

The production gate recomputes the target migration hash and the old-reader evidence from
git objects. Self-reported hashes do not establish compatibility.

## Existing evidence may inform, not substitute

- `app/api/astrology/pro/charts/__tests__/savedChartsOwnership.test.ts` (ownership, refusals,
  storage shape);
- PR #2101's passing CI, including empty-database reconstruction.

None of these replaces a fresh independent review of this exact relation.

## Closing condition

This plan authorizes nothing by itself.

Deployment may advance only if the frozen composed gate reports:

`MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`

The gate must report that for:
- the exact live old reader;
- the exact target;
- the exact pending migration blob;
- the exact admitted review bytes;
- coverage physically witnessed in the trace.
