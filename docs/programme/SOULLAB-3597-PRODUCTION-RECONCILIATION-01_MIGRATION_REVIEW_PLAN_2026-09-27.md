# SOULLAB-3597-PRODUCTION-RECONCILIATION-01 — Migration Review Plan

**Date:** 2026-09-27
**Status:** BOUNDED REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF
**Old reader:** `68ff4c29d76467b0ee2f72166f9304e21d5a01b7`

## Exact production-pending set observed before review

Read-only comparison of the candidate migration tree against production
`schema_migrations.filename` found these nine pending migrations, in order:

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
Any addition, removal, reorder, byte movement, old-reader movement, or target movement refuses this review.
## Deployment ordering

The governed lane is `scripts/deploy-production.sh deploy <SHA>`:

exact target build → migration review/compatibility gate → pending-set re-witness
→ migrations commit independently in filename order → candidate swap → provenance verification.

Therefore the old reader must remain compatible after **each of the nine possible committed prefixes**,
not merely after the final schema.

## Compatibility questions for the independent reviewer

Determine independently whether:

- migrations 1–3 create/widen House preference storage without invalidating any old-reader query or write;
- migration 4 widens existing Decision/Experience ownership membranes while preserving all old lawful rows and writes;
- migration 5 adds a new crossing relation table that the old reader can ignore;
- migration 6 widens developmental-reading lens/observation constraints while continuing to admit every old-reader observation shape;
- migration 7 adds occurrence storage over the new Work Theme substrate without affecting old-reader tables;
- migration 8 widens only the new House preference catalog introduced in this pending sequence;
- migration 9 adds member-authored Personal Decision choice history while preserving old `studio_decisions` compatibility;
- the target reader is compatible with the final schema.

A verdict of `REVISE` or `BLOCKED` is lawful and must not be converted to approval.

## Minimum physical Reads

The reviewer must Read this plan, `MIGRATION_COMPATIBILITY_CONTEXT.json`,
`PENDING_MIGRATIONS.json`, all nine pending migrations, and `scripts/deploy-production.sh`.
The reviewer must also Read enough target and old-reader source to establish the compatibility claims.
At minimum:

Target:
- `lib/house/preferencesStore.ts`
- `app/api/studio/decisions/route.ts`
- `app/api/studio/decisions/[id]/route.ts`
- `app/api/studio/decisions/[id]/experiences/route.ts`
- `lib/house/facetCrossing.server.ts`
- `lib/manuscript/developmentalReading/store.ts`
- `lib/manuscript/developmentalReading/contract.ts`
- `lib/writersStudio/themes/store.ts`
- `app/api/studio/decisions/[id]/choice/route.ts`

Old reader:
- `old-reader/68ff4c29d76467b0ee2f72166f9304e21d5a01b7/app/api/studio/decisions/route.ts`
- `old-reader/68ff4c29d76467b0ee2f72166f9304e21d5a01b7/app/api/studio/decisions/[id]/route.ts`
- `old-reader/68ff4c29d76467b0ee2f72166f9304e21d5a01b7/app/api/studio/decisions/[id]/experiences/route.ts`
- `old-reader/68ff4c29d76467b0ee2f72166f9304e21d5a01b7/lib/manuscript/developmentalReading/store.ts`
- `old-reader/68ff4c29d76467b0ee2f72166f9304e21d5a01b7/lib/manuscript/developmentalReading/contract.ts`

Grep/Glob may scope discovery but witness no coverage. Bash, Write, Edit, and mutation tools are forbidden.

## Required review output

The admitted review must be `APPROVED` to deploy and must carry ordinary review-custody fields plus
`migration_compatibility/v1` bound to the exact old reader, exact target, exact ordered nine migration paths/hashes,
non-empty rationale, explicit limitations, and witnessed old-reader evidence.

It must also carry `migration-prefix-compatibility/v1` with exactly nine ordered prefix entries,
each bound to the migration ending that prefix, with rationale and limitations.

The review proves custody and continued applicability, not migration correctness.
