# PRODUCTION-MIGRATION-CANONICAL-RECONCILIATION-01 — Exact Merge-Target Review Plan

**Date:** 2026-09-28  
**Status:** BOUNDED REVIEW PLAN · NO DEPLOYMENT AUTHORITY BY ITSELF  
**Live old reader:** `90abc99a921fe21cc40f6a84ed9c1ff2f3a93215`  
**Canonical parent:** `f6ae4ab2c5868e70acc2388264c58825bef4b2fa`  
**Repaired migration parent:** `2934d293d63eec98cbe4c5fa35dc2058b760d924`  
**Reconciliation merge:** `900fc63715c3494f4b681a3e9201e06d4fa84d7b`

## Purpose

This plan governs the exact post-reconciliation reader produced by merging current canonical with the already-reviewed repaired migration branch.

The merge itself preserved the nine repaired migration bytes exactly. However, canonical contributes runtime Home/House/auth/MAIA/navigation changes, so target-reader compatibility must be freshly reviewed against the final repaired schema.

## Exact repaired pending migration set

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

Any byte/order drift refuses the review.

## Proven migration-prefix basis to re-establish

The reviewer must independently verify all nine prefixes remain compatible with live old reader `90abc99a...`, including:

- prefix 1 already contains `center_ids`;
- prefix 1 already admits the full 18-place House catalog including `dream`;
- prefixes 2, 3, and 8 are idempotent compatible reassertions;
- prefixes 4–9 retain their previously-reviewed compatibility properties.

Prior approval for target `2934d293d...` may inform but does not substitute for this exact-target review.

## Canonical reader delta that must be reviewed

Canonical `f6ae4ab2...` contributes reader/runtime changes including Home/House/auth/MAIA/navigation.

At minimum physically review:

- `app/home/HomeThreshold.tsx`
- `app/home/page.tsx`
- `app/home/__tests__/routeContract.test.ts`
- `app/house/MaiaThresholdLink.tsx`
- `app/maia/encounter/page.tsx`
- `app/maia/page.tsx`
- `components/maia/MaiaShell.tsx`
- `config/accessMatrix.ts`
- `lib/hooks/useUserAuth.ts`
- `lib/maia/maiaRuntimeContext.ts`
- `lib/maia/presence/place.ts`
- `lib/navigation/houseDestinations.ts`
- `lib/navigation/maiaNav.ts`
- `lib/navigation/studioNav.ts`
- `app/api/auth/refresh-and-redirect/route.ts`
- `components/auth/UnifiedAuth.tsx`

The review must establish whether any canonical change adds a new schema dependency, alters House preference read/write assumptions, or changes ownership/access behavior relevant to these migrations.

## Required target application reads

Also physically Read the target application surfaces used by the migration compatibility contract:

- `lib/house/catalog.ts`
- `lib/house/preferencesStore.ts`
- `app/api/house/preferences/route.ts`
- `app/api/studio/decisions/route.ts`
- `app/api/studio/decisions/[id]/route.ts`
- `app/api/studio/decisions/[id]/experiences/route.ts`
- `app/api/team/channels/[channelId]/decisions/route.ts`
- `lib/house/facetCrossing.server.ts`
- `lib/manuscript/developmentalReading/store.ts`
- `lib/manuscript/developmentalReading/contract.ts`
- `lib/writersStudio/themes/store.ts`
- `app/api/studio/decisions/[id]/choice/route.ts`
- `scripts/deploy-production.sh`

## Old-reader evidence

The review must use exact `90abc99a...` old-reader source and physically witness every old-reader evidence file it claims.

## Required result

The admitted review must carry:

- ordinary REVIEW-CUSTODY fields;
- `migration-compatibility/v1`;
- exact old reader `90abc99a...`;
- exact post-plan target commit;
- the nine repaired path/hash pairs above;
- witnessed old-reader evidence;
- non-empty rationale and limitations;
- `migration-prefix-compatibility/v1` with exactly nine ordered prefix entries.

Any high or medium defect requires `REVISE` or `BLOCKED`.

## Closing condition

This plan authorizes nothing by itself.

Only the existing frozen production single-review gate may establish:

`MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`

for the exact reconciliation target.

**STOP before migration or deployment.**
