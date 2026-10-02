# PRODUCTION-MIGRATION-PREFIX-REPAIR-01 — Fresh Repaired Nine-Migration Review Plan

**Date:** 2026-09-28  
**Status:** BOUNDED REVIEW PLAN · PRIOR NINE-HASH REVIEWS SUPERSEDED  
**Live old reader:** `90abc99a921fe21cc40f6a84ed9c1ff2f3a93215`  
**Repair parent:** `2f3cc1dbbaf4fe0e8e616205814a7116fbbe35dc`

## Why this plan exists

The fresh single-gate review for target `808cbef7...` correctly BLOCKED because migration prefix 1 created `house_member_preferences` without `center_ids`, and prefixes 2–7 could enforce House catalogs narrower than the live reader.

Those House migration bytes have now been repaired.

Because migrations 1–3 changed bytes, every prior nine-migration hash binding is invalid for this repaired sequence. This plan is the new review root.

## Exact repaired pending set and hashes

1. `database/migrations/20260925000001_house_member_preferences.sql`  
   `b5e4bae5c9fd38fcc46462bb26d149b141596bb474659fb525d602756852c807`
2. `database/migrations/20260925000002_house_center_preferences.sql`  
   `68de29fc85dc9d09794836eacd7e61ff38d0be0e59ede44424bf80e6490b34e8`
3. `database/migrations/20260925000003_house_shortcut_catalog.sql`  
   `eee4423f8b97b6216bf84494cb6fed7e28ccf9d4abd834a028d5dd109f0d07ad`
4. `database/migrations/20260925000004_decision_scope_membranes.sql`  
   `8868a0e9d7a4ddc9aa2a9cb928961ab20c2ee40a159577a3948cb3135d215b4e`
5. `database/migrations/20260926000001_member_facet_crossings.sql`  
   `4aad927f861ef63946b93fc7b7705dca4ee1f294ea908ff1792d4f930cae1714`
6. `database/migrations/20260926000002_writer_studio_work_themes.sql`  
   `78abef0d268c4b280c425b98d6c51ada96818f9cd1ebea535a47e022bdb3b8cb`
7. `database/migrations/20260926000003_writer_studio_theme_occurrences.sql`  
   `6bdd735f64e0def5271fab523bfb018b86be8bfff883a3682ae00d1c5d05ad52`
8. `database/migrations/20260927000001_house_dream_catalog.sql`  
   `4a45696b6ea2e4a52ce2f9dcb89c76a8a3365c9a33f9bce70a24f878a331d992`
9. `database/migrations/20260927000002_personal_decision_choice_events.sql`  
   `5abd5339194c497a88f8f556d526214e0555bcf17adaf75b759df5e79722616b`

The deploy lane must rederive this exact ordered set and recompute every hash before mutation.

## Repaired House prefix law

The reviewer must independently verify:

- prefix 1 creates `center_ids` immediately;
- prefix 1 already admits the live reader's complete 18-place House catalog, including `dream`;
- prefix 1 allows up to 18 shortcuts and 5 centers;
- migrations 2, 3, and 8 are idempotent reassertions/widenings rather than required repairs of an unsafe durable prefix;
- every House preference value lawful in the live reader remains lawful after every committed House prefix.

## Remaining migration review questions

The reviewer must also independently re-establish:

- migration 4 decision/experience ownership compatibility;
- migration 5 crossing-table additivity;
- migration 6 developmental-reading Themes widening compatibility;
- migration 7 occurrence-storage additivity;
- migration 9 choice-history compatibility;
- target-reader compatibility with the final repaired schema;
- all nine committed-prefix states.

## Local repair evidence available as context

Local-only validation has already shown:

- focused Jest migration/catalog tests: 12 / 12 PASS;
- failure-prefix constitutional falsifiers: 5 / 5 DEAD;
- migration-compatibility falsifiers: 10 / 10 DEAD;
- isolated PostgreSQL prefix execution:
  - migration 1 applied successfully;
  - full 18-place House row including `dream` inserted at prefix 1;
  - migrations 2, 3, and 8 re-applied successfully.

This evidence may inform the review but does not substitute for the fresh exact-target independent review.

## Required review output

The admitted review must carry ordinary REVIEW-CUSTODY fields plus:

- `migration-compatibility/v1`;
- exact old reader `90abc99a...`;
- exact target commit produced by this plan-only successor;
- exact repaired ordered nine path/hash pairs above;
- witnessed old-reader evidence;
- non-empty rationale and limitations;
- `migration-prefix-compatibility/v1` with exactly nine ordered prefix entries.

The verdict must remain `REVISE` or `BLOCKED` if any high or medium issue remains.

## Closing condition

This plan authorizes nothing by itself.

Only the existing frozen production single-review gate may establish:

`MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`

for the exact repaired target relation.

**STOP before merge, migration, or deployment.**
