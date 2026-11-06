# Deploy 2026-11-05 — exact two-migration review plan (chart shares + push devices)

**Date:** 2026-11-05
**Status:** BOUNDED INDEPENDENT REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF
**Live old reader at plan freeze:** `956051b5a7116280dfb14e6df5ddb0822e5b57f3` (running in `maia-sovereign`, read 2026-11-05)
**Founder authorization:** "Yes, full deploy" (2026-11-05) for the merged tip carrying PR #2143, PR #2146, PR #2140 and PR #2145; the first deploy attempt was refused by this gate, and this plan is the lawful route through it.

## Exact target relation

The Review-Custody harness supplies the deployment target externally. This document never
identifies it by an embedded commit SHA. The target must contain this plan, the rollback file
for the push-devices migration, and the two migrations below. The reviewer must establish the
exact target relation from immutable git bytes. Any movement after review invalidates
applicability and requires a new review.

## Exact production-pending set

The first deploy attempt's own preflight listed exactly these two migrations as pending
against the production ledger, in this order:

1. `database/migrations/20261105000003_astrology_pro_chart_shares.sql`
   sha256 `efeb0fb4b9367c451ca12cb12f3009c34df7135ba970e1f7b73c17c2fd3840be`
2. `database/migrations/20261105000003_member_push_devices.sql`
   sha256 `89391584a911a0ee887f12ae83988ab9f2ee52ca97eb32ece68c66ddab5576d9`

The two files share the numeric prefix `20261105000003` and differ in the rest of the
filename; the production runner records migrations by full filename. The deploy lane must
independently re-derive the pending set immediately before mutation. Any addition, removal,
byte movement, live-reader movement or target movement refuses this review.

## What each migration does

**1. `astrology_pro_chart_shares`** (astrology lane, ASTRO-PRO-CHART-SHARE-01). Creates one
table of private, token-addressed, view-only links to a Pro saved chart: a unique 43-character
token, foreign keys to `members` (owner) and `astrology_pro_saved_charts`, both
`ON DELETE CASCADE`, an owner-attested consent timestamp, two opt-in flags, a counter, and
`revoked_at`. Creates a partial unique index (one live link per chart) and an owner index. It
rewrites no row and touches no other table. A rollback file exists:
`database/rollbacks/20261105000003_astrology_pro_chart_shares_ROLLBACK.sql`.

**2. `member_push_devices`** (PUSH-NOTIFICATIONS P1, built dark). Creates one table of a
member's registered iOS devices: `member_id` references `members` with `ON DELETE CASCADE`,
platform and environment CHECKs, a bounded token, timestamps and a revocation marker. Creates
a unique index on `(platform, environment, token)` and a partial index on active devices per
member. It stores no message content, rewrites no row and touches no other table. Rollback
file: `database/rollbacks/20261105000003_member_push_devices_ROLLBACK.sql`.

## Production facts supplied to the reviewer

Read-only and counts only: neither table exists in production today; the production ledger
already contains `astrology_pro_saved_charts` and its predecessors. No member data is supplied.

## Deployment ordering

1. exact target materialization;
2. build and provenance;
3. admitted migration review and all-prefix compatibility;
4. exact pending-set re-witness;
5. exact old-reader re-witness;
6. migrations, in the order above;
7. candidate swap;
8. running provenance and health.

A failed migration must leave the candidate reader unswapped.

## Independent review questions

1. **Additive only.** Each migration only creates a new table and its indexes (and, for
   chart shares, a table comment). Neither alters, drops or backfills any existing object.
2. **Lock-timeout law.** Each migration opens `BEGIN` and then `SET LOCAL lock_timeout`
   before any DDL, is transactional and re-runnable (`IF NOT EXISTS`).
3. **Old reader is unaffected.** The exact old reader never references either new table,
   so between migration and swap nothing reads or writes them. Establish this by reading the
   old-reader files named below; search may only scope.
4. **Foreign-key effects on the old reader.** Both new tables reference `members` with
   `ON DELETE CASCADE`, and chart shares also references `astrology_pro_saved_charts` with
   `ON DELETE CASCADE`. Judge whether the old reader's account deletion
   (`app/api/members/delete-account/route.ts`) and its saved-chart deletion
   (`lib/astrology/proSavedCharts.ts`) still succeed once those tables exist (cascade removes
   child rows; no row exists in either new table at migration time).
5. **Target reader is compatible with the final schema.** `lib/astrology/proChartShares.ts`
   and its callers produce statements consistent with the table's columns and CHECKs; the
   push registration route and `lib/push/apns.ts` do the same for `member_push_devices`.
6. **Prefix 1 (only chart shares committed) and prefix 2 (both committed)** are each
   compatible with the exact old reader still being live.
7. **Dark-ness of push.** Nothing in the target calls the APNs sender or reads the push
   table apart from the registration endpoint and the account-deletion inventory; no Apple
   credential is configured, so nothing can be sent.
8. **Member-visible change.** Judge from the target routes and pages what a member or a
   third party can newly do: the owner can create a private chart-share link and a holder of
   the link can open a view-only page (`app/shared-chart/[token]/page.tsx`); a signed-in
   member can register a device token. State plainly anything that looks unconsented.
9. **Rollback.** Judge whether each rollback file is sufficient with a revert of the code,
   and what is lost (shared links stop working; registered devices are forgotten).

A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into approval.

## Minimum physical Reads

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- `database/migrations/20261105000003_astrology_pro_chart_shares.sql`;
- `database/migrations/20261105000003_member_push_devices.sql`;
- `database/rollbacks/20261105000003_astrology_pro_chart_shares_ROLLBACK.sql`;
- `database/rollbacks/20261105000003_member_push_devices_ROLLBACK.sql`;
- `scripts/deploy-production.sh`;
- `scripts/run-sql-migrations.sh`;
- target `lib/astrology/proChartShares.ts`;
- target `app/api/astrology/pro/charts/[id]/share/route.ts`;
- target `app/shared-chart/[token]/page.tsx`;
- target `lib/push/apns.ts`;
- target `app/api/members/push-device/route.ts`;
- target `app/api/members/delete-account/route.ts`;
- exact old-reader `app/api/members/delete-account/route.ts`;
- exact old-reader `lib/astrology/proSavedCharts.ts`.

Old-reader paths live beneath `old-reader/<exact-old-reader-SHA>/...` in the bundle.
Search may help find files but does not count as coverage.

## Required review JSON

Ordinary Review-Custody fields (`verdict`, `plan_sha256`, `trace_id` = reviewer session id,
`reviewer`, `summary`, `findings`, `coverage.files`, `limitations`) and
`migration_compatibility` (`instrument = migration-compatibility/v1`; `verdict` COMPATIBLE or
INCOMPATIBLE; exact full old-reader and target commits; `pending` = the two migration paths
with their SHA-256 in the order above; `old_reader_evidence` = the old-reader files read, each
with repo path, SHA-256 and the trace path; `rationale`; `limitations`;
`failure_prefix_compatibility` with `instrument = migration-prefix-compatibility/v1`, verdict
`ALL_PREFIXES_COMPATIBLE` only if both prefixes are established, and exactly **two** prefix
entries: the first bound to the chart-shares migration path and SHA-256, the second to the
push-devices migration path and SHA-256, each with `through_path`, `through_sha256`,
`rationale` and `limitations`).

## Existing evidence may inform, not substitute

- `lib/push/__tests__/apns.test.ts` and `app/api/members/push-device/__tests__/route.test.ts`;
- PR #2143 and PR #2140 CI, including empty-database reconstruction.

## Closing condition

An admitted `APPROVED` review with `COMPATIBLE` and `ALL_PREFIXES_COMPATIBLE` licenses the
migrate-before-swap sequence above for the exact pending set and no other. It is not a
statement that either migration or either feature is correct, and it confers no authority to
send a push notification or to publish any link.
