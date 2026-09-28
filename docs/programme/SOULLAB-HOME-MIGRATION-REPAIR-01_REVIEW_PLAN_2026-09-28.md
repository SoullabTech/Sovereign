# SOULLAB-HOME-MIGRATION-REPAIR-01 — Fresh Production Migration Review Plan

**Date:** 2026-09-28  
**Status:** BOUNDED REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF  
**Old reader:** `90abc99a921fe21cc40f6a84ed9c1ff2f3a93215`  
**Target:** the exact committed candidate containing this plan, bound by `review-custody/v1`.

## Why this fresh review exists

A prior independent review of the nine production-pending migrations correctly refused the original bytes because early committed prefixes were incompatible with the House reader:

- prefix 1 created `house_member_preferences` without `center_ids`;
- prefixes 1–2 constrained shortcuts to a subset narrower than the reader catalog;
- prefixes 2–7 did not admit `dream`, although the target reader could write it.

Those migration bytes have now been repaired. This review must assess the repaired bytes from scratch. The earlier blocked review is evidence of the defect, not authority for this candidate.

## Exact production-pending set

The production ledger currently leaves exactly these nine migrations pending, in this order:

1. `database/migrations/20260925000001_house_member_preferences.sql`
2. `database/migrations/20260925000002_house_center_preferences.sql`
3. `database/migrations/20260925000003_house_shortcut_catalog.sql`
4. `database/migrations/20260925000004_decision_scope_membranes.sql`
5. `database/migrations/20260926000001_member_facet_crossings.sql`
6. `database/migrations/20260926000002_writer_studio_work_themes.sql`
7. `database/migrations/20260926000003_writer_studio_theme_occurrences.sql`
8. `database/migrations/20260927000001_house_dream_catalog.sql`
9. `database/migrations/20260927000002_personal_decision_choice_events.sql`

Any addition, removal, reorder, byte movement, old-reader movement, or target movement invalidates this review.

## Required review questions

Determine independently whether:

1. the old reader `90abc99a9` remains compatible after each of the nine possible committed prefixes;
2. prefix 1 already contains every column queried/written by the target House preference reader/writer;
3. every House catalog constraint at every prefix admits the full target catalog, including `dream`;
4. migrations 2, 3, and 8 are non-narrowing/idempotent relative to prefix 1;
5. migrations 4–9 preserve all lawful old-reader reads/writes and do not require the candidate reader to be live before schema application;
6. the target reader is compatible with the final schema;
7. the normal governed deployment order must remain migrate-before-swap.

A verdict of `REVISE` or `BLOCKED` is lawful and must not be converted to approval.

## Required physical Reads

The reviewer must physically Read, at minimum:

- this plan;
- all nine pending migration files;
- `scripts/deploy-production.sh`;
- target:
  - `lib/house/catalog.ts`
  - `lib/house/preferencesStore.ts`
  - `lib/house/preferences.ts`
  - `app/api/studio/decisions/route.ts`
  - `app/api/studio/decisions/[id]/route.ts`
  - `app/api/studio/decisions/[id]/experiences/route.ts`
  - `lib/house/facetCrossing.server.ts`
  - `lib/manuscript/developmentalReading/store.ts`
  - `lib/manuscript/developmentalReading/contract.ts`
  - `lib/writersStudio/themes/store.ts`
  - `app/api/studio/decisions/[id]/choice/route.ts`
- old reader copies under `old-reader/90abc99a921fe21cc40f6a84ed9c1ff2f3a93215/`:
  - `lib/house/catalog.ts`
  - `lib/house/preferencesStore.ts`
  - `app/api/studio/decisions/route.ts`
  - `app/api/studio/decisions/[id]/route.ts`
  - `app/api/studio/decisions/[id]/experiences/route.ts`
  - `lib/manuscript/developmentalReading/store.ts`
  - `lib/manuscript/developmentalReading/contract.ts`

Grep/Glob may scope discovery but witness no coverage. Bash, Write, Edit, and mutation tools are forbidden.

## Required review output

The exact review JSON must include:

- `verdict`: `APPROVED | REVISE | BLOCKED`;
- `plan_sha256`;
- `trace_id`;
- `reviewer`;
- non-empty `summary`;
- `findings`;
- `coverage.files`;
- explicit `limitations`;
- `migration_compatibility` with:
  - instrument `migration-compatibility/v1`;
  - verdict `COMPATIBLE` only if justified;
  - exact old-reader commit;
  - exact target-reader commit;
  - exact ordered pending paths and SHA-256 values;
  - non-empty rationale;
  - explicit limitations;
  - non-empty `old_reader_evidence`, each with repository path, old-reader SHA-256, and physically witnessed `trace_path`;
- `migration_compatibility.failure_prefix_compatibility` with:
  - instrument `migration-prefix-compatibility/v1`;
  - verdict `ALL_PREFIXES_COMPATIBLE` only if justified;
  - exactly nine ordered prefix entries;
  - each entry bound to the migration ending that prefix by path and SHA-256;
  - non-empty rationale and explicit limitations.

## Existing technical witnesses — context, not authority

Before review, the repaired candidate has already passed:

- 49/49 existing House and migration compatibility tests;
- an isolated House SQL prefix witness at prefixes 1, 2, 3, and 8;
- all nine migrations applied in order against a disposable schema-only clone of production.

These witnesses do not substitute for the independent compatibility review or its physical Read custody.

## 2026-09-28 material-finding disposition and deployment-safety reconciliation

The first fresh review of repaired target `79dcc1bc2b01b607cea9eead94c626caf50f72a8`
returned `APPROVED / COMPATIBLE / ALL_PREFIXES_COMPATIBLE`, but the custody
instrument correctly refused admission because that review also carried one
**medium** finding: migration 4 could queue an ACCESS EXCLUSIVE lock ahead of
live traffic with no lock or statement timeout.

That finding has been dispositioned in the candidate now containing this plan:

- `20260925000004_decision_scope_membranes.sql` sets a transaction-local
  `lock_timeout = 5s` and `statement_timeout = 60s`;
- the general rollback path now retags `:previous -> :prod`, recreates only the
  `maia` reader with `--no-deps`, and verifies the running image identity;
- the quick `deploy-maia` lane now refuses any target with production-pending
  migrations and directs the operator to the full migrate-before-swap lane.

The four prior low findings remain reviewable hardening debt unless a fresh
review promotes any of them to material standing. No prior review is reused as
authority. A fresh independent review and fresh custody record are required for
the exact final target containing these bytes.

## 2026-09-28 second material-finding disposition

A fresh review of combined target `95f757a3d6f6820265c50e6ea42815c61f92375d`
again confirmed the migration relation as compatible, but returned `REVISE`
because migration 9 independently takes ACCESS EXCLUSIVE on live
`studio_decisions` while creating its composite unique key, without the
lock/statement bounds already added to migration 4.

That finding is now dispositioned in the candidate containing this plan:

- `20260927000002_personal_decision_choice_events.sql` sets transaction-local
  `lock_timeout = '5s'` and `statement_timeout = '60s'` immediately after
  `BEGIN`, matching migration 4's fail-fast production posture.

The review of `95f757a3d...` is not reused as authority. A fresh independent
review remains required for the exact candidate containing these bytes.
