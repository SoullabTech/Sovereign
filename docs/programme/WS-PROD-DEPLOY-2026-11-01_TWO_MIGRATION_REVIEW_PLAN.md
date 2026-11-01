# Production deploy 2026-11-01 — exact two-migration review plan (REVIEW-CUSTODY-01)

```
PURPOSE:     Plan for a separate, read-only Review Custody review of the two migrations a
             production deploy of current canonical would apply. Evidence instrument only.
OLD READER:  d49dbc98df5d448a05e13a7df21180c3bde304c6  (live production GIT_COMMIT, read 2026-11-01)
TARGET:      the canonical commit that contains this plan (named to the reviewer at run time;
             the custody record binds it as repo_head).
NOT:         Authorization to apply. The founder authorized this review and a full deploy
             through the gate on 2026-11-01. The gate states custody, never correctness.
```

## 1. Exact pending set (production `schema_migrations`, read 2026-11-01)

Neither file is recorded in production's ledger. Execution order is filename order:

| # | Path | SHA-256 |
|---|---|---|
| 1 | `database/migrations/20261002000002_writer_studio_chapter_overview_lens.sql` | `d45c56cfc84089f758b477430e8912cd864a549c1129a34ab789d2a1f95afaba` |
| 2 | `database/migrations/20261030000001_house_pro_studio_catalog.sql` | `61f1d0744aeaccdd9ffd82baf67e65584534f07f5dfa37c1d0fd429803fa38c1` |

The production gate re-derives this set from the exact migration context and the live ledger at deploy
time; if it moves, the deploy refuses and this review no longer applies.

## 2. Production facts supplied to the reviewer (read-only, 2026-11-01, counts only)

- `developmental_readings`: **25 rows**, 2456 kB total relation size.
- `house_member_preferences`: **3 rows**.
- Live constraint definitions:
  - `developmental_readings_commissioned_lens_check` admits exactly
    `structure, development, continuity, arc, themes, voice, coherence, reader` (no `overview`).
  - `house_member_preferences_shortcut_ids_cardinality_check`: `cardinality(shortcut_ids) <= 18`.
  - `house_member_preferences_center_ids_check` and `…_shortcut_ids_catalog_check` exist with an 18-id
    catalog that does not include `pro-studio`.
- Deploy ordering (DEPLOYMENT-SAFETY-03): gate → **migrate (old reader still live)** → tags → swap.
  Each migration file commits in its own transaction; a later failure leaves the earlier prefix applied
  with the old reader serving.

The reviewer has no production access. These facts are plan-reported.

## 3. Independent review questions

Answer each from the source. Do not infer beyond what you Read.

1. **M1 lens constraint.** Is the new `developmental_readings_commissioned_lens_check` a strict superset
   of the live one, so no existing row or old-reader insert can be rejected by it?
2. **M1 observation trigger.** M1 replaces `developmental_readings_observations_check()`. Compare it with
   the version live in production (the latest prior migration that defines it). Does the new function
   accept every observation shape the old reader writes and every shape plausibly already stored? Does it
   newly reject anything? Note: the trigger fires on INSERT/UPDATE, not on existing rows.
3. **M2 House catalog.** Are the new `center_ids` and `shortcut_ids` catalog checks, and the cardinality
   change (18 → 19), supersets of the live constraints, so the 3 existing rows and old-reader writes stay
   valid?
4. **Locks.** Each file sets `lock_timeout = '5s'` and runs in one transaction. Given the table sizes in
   §2, is `ADD CONSTRAINT … CHECK` (full validation under lock) an acceptable risk here, or is a
   `NOT VALID` / `VALIDATE CONSTRAINT` staging required? Justify from the sizes, not in general.
5. **Re-run safety.** If a file commits but its ledger row is not recorded, is re-running it safe
   (`DROP … IF EXISTS` / `CREATE OR REPLACE` / `ADD CONSTRAINT`)?
6. **Prefix compatibility after M1 alone** (M2 fails, old reader live): is the old reader fully
   compatible?
7. **Prefix compatibility after M1+M2** (swap fails or is delayed, old reader live): is the old reader
   fully compatible?
8. **Target reader requires both.** Does the target reader write `overview` readings and/or a
   `pro-studio` House id, so that a reader-only deploy without these migrations would fail those writes?
9. **Reader rollback.** After both migrations, can production roll back to the old reader
   `d49dbc98d` safely (constraints only widened)?
10. **Destructive operations.** Do either file delete, rewrite or narrow any data, column or constraint
    beyond the replacements named above?

## 4. Minimum physical Reads

Target (repository-relative):
- this plan
- `database/migrations/20261002000002_writer_studio_chapter_overview_lens.sql`
- `database/migrations/20261030000001_house_pro_studio_catalog.sql`
- `database/migrations/20260926000002_writer_studio_work_themes.sql` (the live trigger function version)
- `lib/manuscript/developmentalReader/contract.ts`
- `lib/manuscript/developmentalReading/freeze.ts`
- `lib/house/catalog.ts`
- `lib/house/preferencesStore.ts`

Old reader (under `old-reader/d49dbc98df5d448a05e13a7df21180c3bde304c6/`):
- `lib/manuscript/developmentalReader/contract.ts`
- `lib/manuscript/developmentalReading/freeze.ts`
- `lib/manuscript/developmentalReading/store.ts`
- `lib/house/catalog.ts`
- `lib/house/preferencesStore.ts`
- `app/api/house/preferences/route.ts`

## 5. Verdict

APPROVED, REVISE and BLOCKED are all lawful. A REVISE or BLOCKED result stops the deploy; it is not
converted. The review states what was read, not that the migrations are correct.
