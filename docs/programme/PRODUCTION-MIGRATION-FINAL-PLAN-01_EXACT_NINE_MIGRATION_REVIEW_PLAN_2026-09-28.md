# PRODUCTION-MIGRATION-FINAL-PLAN-01 — Exact Nine-Migration Review Plan

**Date:** 2026-09-28  
**Status:** BOUNDED REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF  
**Live old reader:** `90abc99a921fe21cc40f6a84ed9c1ff2f3a93215`  
**Parent candidate:** `742553a897b64fe79bbc43c43f35ed5fc0a2db95`

## Exact production-pending set

This plan governs exactly these nine production-pending migrations, in filename order:

1. `database/migrations/20260925000001_house_member_preferences.sql`
2. `database/migrations/20260925000002_house_center_preferences.sql`
3. `database/migrations/20260925000003_house_shortcut_catalog.sql`
4. `database/migrations/20260925000004_decision_scope_membranes.sql`
5. `database/migrations/20260926000001_member_facet_crossings.sql`
6. `database/migrations/20260926000002_writer_studio_work_themes.sql`
7. `database/migrations/20260926000003_writer_studio_theme_occurrences.sql`
8. `database/migrations/20260927000001_house_dream_catalog.sql`
9. `database/migrations/20260927000002_personal_decision_choice_events.sql`

The deploy lane must derive this set again immediately before mutation. Any addition, removal, reorder, byte movement, old-reader movement, or target movement refuses the review.

## Deployment ordering

The governed lane is the existing production single-review path in `scripts/deploy-production.sh`.

The required sequence is:

exact target build → admitted migration review / compatibility gate → exact pending-set re-witness → exact live-reader re-witness → migrations commit independently in filename order → candidate swap → running provenance verification.

Therefore the exact live reader `90abc99a...` must remain compatible after every possible committed prefix 1 through 9, not only after the final schema.

## Independent-review questions

The reviewer must independently establish or reject all of the following:

1. migrations 1–3 and 8 create or widen House preference storage without invalidating any lawful `90abc99a...` read or write;
2. migration 4 preserves every lawful Decision / Experience read and write shape of `90abc99a...`;
3. migration 5 is additive with respect to `90abc99a...`;
4. migrations 6–7 preserve every lawful developmental-reading shape emitted or consumed by `90abc99a...`;
5. migration 9 preserves existing `studio_decisions` compatibility for `90abc99a...`;
6. the exact target reader produced from this plan-only successor remains compatible with the final nine-migration schema;
7. every committed prefix leaves `90abc99a...` safe if a later migration fails and the candidate is never swapped.

A verdict of `REVISE` or `BLOCKED` is lawful and must not be converted into approval.

## Reader continuity fact to verify

The parent candidate `742553a...` differs from live reader `90abc99a...` only by offline migration-custody tooling, a falsifier matrix, and programme documentation. This plan itself is documentation-only.

The reviewer must still verify that fact from exact target bytes rather than relying on this statement.

## Minimum physical Reads

The reviewer must physically Read, at minimum:

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- `PENDING_MIGRATIONS.json`;
- all nine pending migration files;
- `scripts/deploy-production.sh`;
- target `lib/house/preferencesStore.ts`;
- target `app/house/page.tsx`;
- target `app/api/house/preferences/route.ts`;
- target `app/api/studio/decisions/route.ts`;
- target `app/api/studio/decisions/[id]/route.ts`;
- target `app/api/studio/decisions/[id]/experiences/route.ts`;
- target `app/api/team/channels/[channelId]/decisions/route.ts`;
- target `lib/manuscript/developmentalReading/store.ts`;
- target `lib/manuscript/developmentalReading/contract.ts`;
- target `lib/writersStudio/themes/store.ts`;
- target `app/api/studio/decisions/[id]/choice/route.ts`;
- enough exact `90abc99a...` old-reader source to establish the compatibility claims above.

Grep/Glob may scope discovery but witness no coverage. Mutation tools are forbidden to the independent reviewer.

## Required admitted review

The admitted review must carry ordinary REVIEW-CUSTODY fields plus:

- `migration_compatibility.instrument = migration-compatibility/v1`;
- exact full old-reader commit `90abc99a...`;
- exact full target commit produced by this plan-only successor;
- the exact ordered nine migration paths and SHA-256 values;
- non-empty rationale;
- explicit limitations;
- physically witnessed old-reader evidence.

It must also carry `failure_prefix_compatibility.instrument = migration-prefix-compatibility/v1` with exactly nine ordered prefix entries, each bound to the migration ending that prefix with rationale and limitations.

The production gate must recompute target migration hashes and old-reader evidence from git objects. Self-reported hashes are not sufficient.

## Existing evidence may inform, not substitute

Prior Review-01, Review-02, tooling-delta review, and three-hop rebind evidence may be supplied as context. They do not substitute for the fresh exact-target review required by this plan.

## Closing condition

This plan authorizes nothing by itself.

The act may advance only if the frozen single-review gate reports:

`MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`

for the exact live reader, exact new target, exact ordered nine pending migration blobs, exact admitted review bytes, and witnessed trace coverage.

Anything else is a refusal.

**STOP before merge, migration, or deployment after freezing the plan-only target SHA.**
