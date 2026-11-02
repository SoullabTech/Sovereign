# ASTRO-PRO-04 (#1893) — Pro tester grant: exact one-migration review plan

**Date:** 2026-11-01
**Status:** BOUNDED INDEPENDENT REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF
**Live old reader at plan freeze:** `feba366e93642571dd06d146d02dfdab04c310c5`
**Candidate lineage before this plan:** `c0129c670e6232558ca47a5e284bf638b4e3975f` (merge of #2055)

## Exact target relation

The Review-Custody harness supplies the deployment target externally. This document never
identifies it by an embedded commit SHA. The target must contain this plan and the Pro
tester grant lineage above (PR #2055).

The reviewer must establish the exact target relation from immutable git bytes. Any
movement after review invalidates applicability and requires a new review. That includes
movement in the application, migrations, dependencies, deploy scripts or governance.

## Exact production-pending set

A read-only comparison against the production migration ledger found exactly one canonical
migration absent:

1. `database/migrations/20261101000002_astro_pro_tester_grants.sql`
   SHA-256 `2125572c5b34060f125c535efb32d8180cae41712b2d5431f81edb2f692ea8bc`

The deploy lane must independently re-derive the pending set immediately before mutation.
Any addition, removal, byte movement, live-reader movement or target movement refuses
this review.

## What the migration does

It creates `astro_pro_tester_grant_events`. This is an append-only log of Astrology Pro
tester grants and revocations, with:
- a foreign key to `members(id)` with `ON DELETE CASCADE`;
- an index on `(member_id, id DESC)`;
- a `BEFORE UPDATE OR DELETE` row trigger that refuses every UPDATE, and refuses a DELETE
  while the event's member still exists;
- a `BEFORE TRUNCATE` statement trigger that refuses TRUNCATE.

It creates no other object and alters no existing table. Nothing in the target reader admits
a non-founder from this table unless `ASTRO_PRO_ACCESS_PHASE=tester-grant` is set. That
setting is not set in production.

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

1. The migration is purely additive for the exact old reader. It creates one table, one
   index, two trigger functions and two triggers. It changes no column, constraint or row
   of any existing table.
2. The exact old reader never reads or writes `astro_pro_tester_grant_events`, and never
   defines the trigger functions this migration creates or replaces.
3. Old-reader member deletion (`DELETE FROM members` in
   `app/api/members/delete-account/route.ts`) still succeeds after the migration. Any
   cascaded deletion of grant events must be permitted by the guard trigger, because the
   member row is already gone when the cascade fires. The guard must also not block or
   slow the transaction in a way that changes the old reader's behaviour.
4. The migration follows the lock-timeout law: its own `BEGIN`, then
   `SET LOCAL lock_timeout`, before any DDL. Any lock it takes on `members`, for example
   when the foreign key is created, is bounded and acceptable for a production table of
   that size.
5. The migration is safe to re-run (`IF NOT EXISTS`, `CREATE OR REPLACE`,
   `DROP TRIGGER IF EXISTS`), and its transaction leaves no partial schema on failure.
6. The target reader (`lib/astrology/proAccess.ts`, `lib/astrology/proTesterGrants.ts`, the
   Pro page and the Pro chart API) is compatible with the final schema. With no
   `ASTRO_PRO_*` setting it admits no one. In `founder-only` it admits only the founder. A
   failed grant lookup admits no one.
7. Reader rollback to `feba366e9…` remains lawful after the committed migration, and no
   down-migration is required.
8. No member-visible behaviour changes in production as a result of this migration and
   target, given the current absence of `ASTRO_PRO_*` settings.

A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into approval to
complete deployment.

## Minimum physical Reads

The independent reviewer must physically Read, at minimum:

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- `database/migrations/20261101000002_astro_pro_tester_grants.sql`;
- `scripts/deploy-production.sh`;
- `scripts/run-sql-migrations.sh`;
- target `lib/astrology/proAccess.ts`;
- target `lib/astrology/proTesterGrants.ts`;
- target `lib/astrology/founderOnlyPreviewAccess.ts`;
- target `app/astrology/pro-preview/page.tsx`;
- target `app/api/astrology/pro/my-chart/route.ts`;
- target `scripts/astro-pro-tester-grant.ts`;
- exact old-reader `app/api/members/delete-account/route.ts`;
- exact old-reader `lib/astrology/founderOnlyPreviewAccess.ts`;
- exact old-reader `app/astrology/pro-preview/page.tsx`;
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

Some existing evidence may inform the review but does not substitute for it:
- the access tests (`__tests__/astrology-pro-access.test.ts`);
- the scratch-Postgres witness recorded in PR #2055, which covered applying twice, refusing
  edits, deletes, truncation and unknown actions, and removal on member erasure;
- the type-health and guard results.

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
