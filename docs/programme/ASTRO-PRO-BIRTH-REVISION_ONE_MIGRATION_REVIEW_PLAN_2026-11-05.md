# ASTRO-PRO-BIRTH-REVISION-01 — exact one-migration review plan

**Date:** 2026-11-05
**Status:** BOUNDED INDEPENDENT REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF
**Live old reader at plan freeze:** `f90d03fba4e2da5b76226b15d0e66faa88bda059`
**Canonical before this change:** `7070d3d23ae682a32f54d3eef4f7ba6405e9b449` (adds #2114, Writer's Studio history page; no migrations, no scripts)

## The defect this repairs

`app/api/astrology/pro/my-chart/route.ts` and `lib/astrology/proSubjectBirth.ts` read
`members.astrology_birth_revision`. That code reached canonical on 2026-10-30 in
`79575c33f` ("No migrations"), and no migration on any branch creates the column. In
production every "Open my chart" request fails with PostgreSQL `42703` (undefined column),
witnessed in `maia-sovereign` logs on 2026-11-05. The founder sees *Chart unavailable*.

## Exact target relation

The Review-Custody harness supplies the target externally. The target must contain this
plan and the migration below. Any movement after review invalidates applicability.

## Exact production-pending set

1. `database/migrations/20261105000001_member_astrology_birth_revision.sql`
   SHA-256 `cb653ccac348ea15edcd6b5c76cff0ca36c3a0d81b8c2d371970032706731618`

The deploy lane must re-derive the pending set immediately before mutation.

## What the migration does

- adds `members.astrology_birth_revision bigint NOT NULL DEFAULT 0` (constant default:
  metadata-only, no table rewrite);
- creates function `members_bump_astrology_birth_revision()` and a `BEFORE UPDATE` row
  trigger on `members` that sets the revision to `OLD + 1` when any of `birth_date`,
  `birth_time`, `birth_location_lat`, `birth_location_lng`, `birth_location_name`,
  `birth_timezone` is distinct, and otherwise to `OLD` (a direct write cannot move it);
- comments the column.

It deletes nothing and changes no existing column, constraint or row value other than
adding the new column's default.

Local witness against production's `members` schema (pg_dump -s): applies cleanly, re-runs
cleanly; revision 0 → 1 on a birth change, unchanged on an identical value, on an unrelated
column, and on a direct write; 1 → 2 on a timezone change.

## Independent review questions

1. The migration is additive for the exact old reader `f90d03fba…`; that reader already
   selects the column, so it moves from failing to working.
2. Every existing `UPDATE members` statement in the old reader still succeeds with the
   trigger present (the trigger never raises).
3. Member deletion (`app/api/members/delete-account/route.ts`) is unaffected (UPDATE-only
   trigger).
4. Lock-timeout law: own `BEGIN`, `SET LOCAL lock_timeout`, before any DDL; the
   `ACCESS EXCLUSIVE` lock on `members` is brief and bounded.
5. Safe to re-run; no partial schema on failure.
6. Interaction with existing `members` triggers (`compute_tier_on_birth_date`,
   `members_updated_at`) is benign.
7. Reader rollback to `f90d03fba…` or `42164624d…` remains lawful after the migration.
8. Member-visible change is limited to members with Pro access (founder only in
   production); the target also adds an "Edit my birth details" link on the Pro page.

`REVISE` or `BLOCKED` is lawful and must never be converted into approval.

## Minimum physical Reads

- this plan; `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- `database/migrations/20261105000001_member_astrology_birth_revision.sql`;
- `scripts/deploy-production.sh`; `scripts/run-sql-migrations.sh`;
- target `app/api/astrology/pro/my-chart/route.ts`, `lib/astrology/proSubjectBirth.ts`,
  `app/api/members/profile/route.ts`;
- old-reader `app/api/astrology/pro/my-chart/route.ts`, `lib/astrology/proSubjectBirth.ts`,
  `app/api/members/profile/route.ts`, `app/api/members/delete-account/route.ts`.

## Required review JSON

As in `ASTRO-PRO-SAVED-CHARTS_ONE_MIGRATION_REVIEW_PLAN_2026-11-04.md`: ordinary
Review-Custody fields plus `migration_compatibility` (`migration-compatibility/v1`) with
exactly one prefix entry under `migration-prefix-compatibility/v1`.

## Closing condition

This plan authorizes nothing by itself. Deployment may advance only if the composed gate
reports `MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES` for the exact live reader,
target, pending blob, admitted review bytes and witnessed coverage.
