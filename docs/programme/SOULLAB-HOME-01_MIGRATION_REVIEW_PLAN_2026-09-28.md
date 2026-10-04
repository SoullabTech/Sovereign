# SOULLAB-HOME-01 — Production Migration Review Plan

**Date:** 2026-09-28
**Status:** BOUNDED REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF
**Live old reader:** `2cb9dca13a95c0fbe7479ecbe64a2029eb2dbb4d`
**Target:** the exact docs-only successor named by `MIGRATION_COMPATIBILITY_CONTEXT.json`
**Runtime relation:** target runtime code is identical to the live old reader; this successor adds review evidence only.

## Why this review exists

The House code is already live, but production schema is behind the reader.
A request to `/home` currently fails because `house_member_preferences` does not yet exist.
The quick `deploy-maia` lane intentionally skips migrations. The correct repair is the governed
migrate-before-swap lane, bound to an independent review of the exact pending relation.

## Exact production-pending set observed before review

The deploy lane independently observed these nine pending migrations, in order:

1. `database/migrations/20260925000001_house_member_preferences.sql`
2. `database/migrations/20260925000002_house_center_preferences.sql`
3. `database/migrations/20260925000003_house_shortcut_catalog.sql`
4. `database/migrations/20260925000004_decision_scope_membranes.sql`
5. `database/migrations/20260926000001_member_facet_crossings.sql`
6. `database/migrations/20260926000002_writer_studio_work_themes.sql`
7. `database/migrations/20260926000003_writer_studio_theme_occurrences.sql`
8. `database/migrations/20260927000001_house_dream_catalog.sql`
9. `database/migrations/20260927000002_personal_decision_choice_events.sql`

The deploy lane must derive this set again immediately before mutation.
Any addition, removal, reorder, byte movement, live-reader movement, or target movement refuses this review.

## Required compatibility questions

The independent reviewer must decide whether the live reader can tolerate:

- prefix 1: House preference table creation;
- prefix 2: House center preference widening;
- prefix 3: House shortcut catalog widening;
- prefix 4: Decision ownership/scope membrane changes;
- prefix 5: member facet crossing storage;
- prefix 6: Writer's Studio work-theme substrate;
- prefix 7: Writer's Studio theme occurrence storage;
- prefix 8: House Dream catalog widening;
- prefix 9: Personal Decision choice-event history;
- and the final schema after all nine migrations.

A verdict of `REVISE` or `BLOCKED` is lawful and must not be converted to approval.
## Minimum physical Reads

The reviewer must run from the bundle root and physically Read, at minimum:

1. this plan;
2. `MIGRATION_COMPATIBILITY_CONTEXT.json`;
3. `PENDING_MIGRATIONS.json`;
4. all nine pending migration files;
5. target `scripts/deploy-production.sh`;
6. target `lib/house/preferencesStore.ts`;
7. target `app/api/studio/decisions/route.ts`;
8. target `app/api/studio/decisions/[id]/route.ts`;
9. target `app/api/studio/decisions/[id]/experiences/route.ts`;
10. target `lib/house/facetCrossing.server.ts`;
11. target `lib/manuscript/developmentalReading/store.ts`;
12. target `lib/manuscript/developmentalReading/contract.ts`;
13. target `lib/writersStudio/themes/store.ts`;
14. target `app/api/studio/decisions/[id]/choice/route.ts`;
15. the corresponding old-reader source under `old-reader/2cb9dca13a95c0fbe7479ecbe64a2029eb2dbb4d/`
    for every domain used as compatibility evidence.

Additional Read calls are allowed. Grep/Glob may scope discovery but witness no coverage.
Bash, Write, Edit, web, and mutation tools are forbidden to the independent reviewer.
## Required review output

The review must carry ordinary REVIEW-CUSTODY fields:

- `verdict`: `APPROVED | REVISE | BLOCKED`;
- `plan_sha256`;
- `trace_id`;
- `reviewer`;
- non-empty `summary`;
- `findings`;
- `coverage.files`;
- explicit `limitations`.

For deployment, the admitted verdict must be `APPROVED`.

The same review bytes must carry `migration_compatibility` with instrument
`migration-compatibility/v1`, exact old-reader and target commits, the exact ordered
nine migration paths and SHA-256 values, non-empty rationale, explicit limitations,
and old-reader evidence entries with repo path, SHA-256, and physically Read trace path.

`migration_compatibility.failure_prefix_compatibility` is mandatory with instrument
`migration-prefix-compatibility/v1`. It must contain exactly nine ordered prefix entries,
each bound to the exact migration ending that prefix, with non-empty rationale and explicit limitations.

## Closing condition

Production migration may proceed only when the composed gate reports:

`MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`

for the live relation immediately preceding mutation. Anything else is a refusal.
