# Writer's Studio beta deploy · Exact Two-Migration Review Plan (2026-11-01)

```
PURPOSE:   Review-Custody plan for the two production-pending migrations carried by the
           founder-authorized deploy of canonical (founder, 2026-11-01: "Yes, after they
           merge"; "Yes, run the review").
OLD READER: d49dbc98df5d448a05e13a7df21180c3bde304c6 (live production reader, read 2026-11-01)
NOT:       Authority to deploy, to apply either migration, or to change production.
           Custody states that a review is bound and still applies; it never states that a
           migration is correct.
```

## Exact target relation

The deployment target is supplied externally by the Review-Custody harness and is never
self-identified by a commit SHA embedded in this document. The target must contain this
plan.

The reviewer must establish the exact target relation from immutable git bytes. Any
application, migration, dependency, deploy-script or governance movement after review
invalidates applicability and requires a new review.

## Exact production-pending set

A read-only comparison of production `schema_migrations.filename` with the target's
migration files found exactly these two absent, in this order. The deploy lane rederives
the pending set immediately before mutation.

1. `database/migrations/20261002000002_writer_studio_chapter_overview_lens.sql`
   SHA-256 `d45c56cfc84089f758b477430e8912cd864a549c1129a34ab789d2a1f95afaba`
2. `database/migrations/20261030000001_house_pro_studio_catalog.sql`
   SHA-256 `61f1d0744aeaccdd9ffd82baf67e65584534f07f5dfa37c1d0fd429803fa38c1`

Any addition, removal, reorder, byte movement, live-reader movement or target movement
refuses this review.

Migration 2 belongs to the House / Pro Studio lane (HOUSE-PRO-STUDIO-01). Its inclusion
in this deploy is the founder's decision; this review assesses only its compatibility.

## Deployment ordering

The target's `scripts/deploy-production.sh` runs the review gate after the exact image is
built and provenance-verified, then migrations, then the candidate swap. A migration
failure therefore leaves the old reader live. The reviewer must confirm this ordering from
the target script rather than from this paragraph.

## Independent review questions

The reviewer must independently establish or reject each of the following:

1. Migration 1's replacement `developmental_readings_commissioned_lens_check` admits every
   lens value the exact old reader can write, and every value present under the previous
   constraint, so it cannot reject an old-reader-valid row or fail on existing rows.
2. Migration 1's replacement `developmental_readings_observations_check()` trigger function
   admits every observation shape the exact old reader writes, including the four-field
   canonical identity group, and refuses nothing the previous function accepted.
3. Migration 2's replacement `house_member_preferences_center_ids_check` and
   `house_member_preferences_shortcut_ids_*` constraints admit every value the exact old
   reader can write and every value valid under the previous constraints.
4. Both migrations are each one transaction with `SET LOCAL lock_timeout = '5s'`; a lock
   timeout or any failure rolls the file back and leaves the schema at the prior
   compatible prefix.
5. The target reader is compatible with the final schema: it writes the `overview` lens and
   the `pro-studio` catalog id only after the constraints admit them.
6. Reader rollback to `d49dbc98d…` is lawful under the conditions in "Reader rollback"
   below: the schema needs no down-migration, and data the target reader writes is handled
   by the stated check and repair. The reviewer establishes whether those conditions are
   sufficient, including whether the exact old reader tolerates stored `overview` readings
   in every path that loads or displays them.
7. DDL lock and constraint-validation risk (ACCESS EXCLUSIVE on `developmental_readings` and
   `house_member_preferences` during constraint replacement) is acceptable for the observed
   table sizes below, or is recorded as a finding.

## Reader rollback (revision 3)

History, kept: revision 1's review (session `0d88896e-…`) returned `REVISE` because rolling
back to `d49dbc98d…` is lawful for the schema but not unconditionally for data. Revision 2
added a check and repair for `pro-studio`; its review (session `a549010d-…`) returned
`REVISE` because the check matched one id only, an emptied Center would silently show no
places, and the procedure had no enforced order. Revision 3 replaces that procedure.

**What the old reader rejects.** The exact old reader's `parseIds`
(`lib/house/preferences.ts`) throws on a `center_ids` or `shortcut_ids` array that is longer
than its limit (5 and 18), holds an id outside its 18-id catalog, or holds a duplicate. The
check below tests exactly those rules, for every row however it was written.

The old reader's 18 ids:
`writing, relationships, practices, community, studio, decisions, astrology, journal, dream,
reflections, ideas, changes, wisdom, library, divination, living-field, co-lab, anchor`.

**Check** (read-only; returns the number of rows the old reader would refuse):

```sql
WITH old AS (SELECT ARRAY['writing','relationships','practices','community','studio','decisions','astrology','journal','dream','reflections','ideas','changes','wisdom','library','divination','living-field','co-lab','anchor']::text[] AS ids)
SELECT count(*) AS failing_rows
FROM house_member_preferences p, old
WHERE (p.center_ids IS NOT NULL AND (
         cardinality(p.center_ids) > 5
         OR NOT (p.center_ids <@ old.ids)
         OR cardinality(p.center_ids) <> (SELECT count(DISTINCT e) FROM unnest(p.center_ids) e)))
   OR cardinality(p.shortcut_ids) > 18
   OR NOT (p.shortcut_ids <@ old.ids)
   OR cardinality(p.shortcut_ids) <> (SELECT count(DISTINCT e) FROM unnest(p.shortcut_ids) e);
```

**Repair** (one transaction; only rows the check would count):

```sql
BEGIN;
WITH old AS (SELECT ARRAY['writing','relationships','practices','community','studio','decisions','astrology','journal','dream','reflections','ideas','changes','wisdom','library','divination','living-field','co-lab','anchor']::text[] AS ids)
UPDATE house_member_preferences p SET
  center_ids = (SELECT CASE WHEN count(*) = 0 THEN NULL ELSE array_agg(e ORDER BY ord) END
                  FROM (SELECT e, min(ord) AS ord FROM unnest(p.center_ids) WITH ORDINALITY u(e, ord)
                        WHERE e = ANY(old.ids) GROUP BY e ORDER BY min(ord) LIMIT 5) s),
  shortcut_ids = (SELECT coalesce(array_agg(e ORDER BY ord), '{}')
                    FROM (SELECT e, min(ord) AS ord FROM unnest(p.shortcut_ids) WITH ORDINALITY u(e, ord)
                          WHERE e = ANY(old.ids) GROUP BY e ORDER BY min(ord) LIMIT 18) s),
  revision = p.revision + 1,
  updated_at = NOW()
FROM old
WHERE (p.center_ids IS NOT NULL AND (
         cardinality(p.center_ids) > 5
         OR NOT (p.center_ids <@ old.ids)
         OR cardinality(p.center_ids) <> (SELECT count(DISTINCT e) FROM unnest(p.center_ids) e)))
   OR cardinality(p.shortcut_ids) > 18
   OR NOT (p.shortcut_ids <@ old.ids)
   OR cardinality(p.shortcut_ids) <> (SELECT count(DISTINCT e) FROM unnest(p.shortcut_ids) e);
COMMIT;
```

The repair keeps the member's other places in their order, removes unknown ids and
duplicates, and trims to the old limits. A Center left with no places becomes `NULL`, which
the old reader reads as "use the House default", so the member sees the default Center
rather than an empty one. It bumps `revision` and `updated_at` so a client holding the old
revision can see the change. **A member's Pro Studio placement is lost on rollback**; that
is the accepted cost of rolling the reader back.

Witness (read-only, 2026-11-01, production): the check returned 0 rows. The repair's
expressions were evaluated as a `SELECT` over synthetic values only (no table write): a
Center of only `pro-studio` became `NULL`; `{writing, pro-studio, writing}` became
`{writing}`; a 19-id shortcut list became the old 18; a `NULL` Center stayed `NULL`; an
empty shortcut list stayed empty.

**Order, mandatory for any reader rollback to `d49dbc98d…`** (operator act on minisforum):

1. Stop the target reader so it cannot write House preferences:
   `docker stop maia-sovereign`. Members see a short outage; that is accepted.
2. Run the check. If it returns 0, go to step 4.
3. Run the repair, then the check again; it must return 0.
4. Roll the reader back: `scripts/deploy-production.sh rollback`.
5. Once the old reader is live, run the check again; it must return 0. If it does not, stop
   the old reader and repeat from step 3.

`scripts/deploy-production.sh rollback` does not run these steps itself. This plan is the
procedure, and the founder accepts that it is manual for this deploy. Making the rollback
command enforce it is a separate deploy-script change, outside this review.

Stored `overview` readings are not repaired. Whether every old-reader path that loads or
displays them tolerates them is plan question 6; if any does not, the reviewer records it.

Observed production sizes (read-only, 2026-11-01): `developmental_readings` 25 rows,
`house_member_preferences` 3 rows, rows the old reader would refuse 0.

A verdict of `REVISE` or `BLOCKED` is lawful and must never be converted into approval to
complete the deployment.

## Minimum physical Reads

The independent reviewer must physically Read, at minimum:

- this plan;
- `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- both pending migration files;
- `scripts/deploy-production.sh`;
- `scripts/run-sql-migrations.sh`;
- target `lib/manuscript/developmentalReading/store.ts`;
- target `lib/manuscript/developmentalReader/contract.ts`;
- target `lib/house/catalog.ts`;
- target `lib/house/preferencesStore.ts`;
- exact old-reader `lib/manuscript/developmentalReading/store.ts`;
- exact old-reader `lib/manuscript/developmentalReader/contract.ts`;
- exact old-reader `lib/house/catalog.ts`;
- exact old-reader `lib/house/preferencesStore.ts`;
- exact old-reader `database/migrations/20260926000002_writer_studio_work_themes.sql`
  (the previous lens constraint and observation trigger);
- exact old-reader `database/migrations/20260927000001_house_dream_catalog.sql`
  (the previous House constraints);
- exact old-reader `lib/house/preferences.ts` and `app/api/house/preferences/route.ts`
  (how stored House ids are parsed);
- exact old-reader `app/api/sovereign/manuscripts/[id]/readings/route.ts`,
  `app/api/sovereign/manuscripts/[id]/readings/[readingId]/route.ts`,
  `app/api/sovereign/manuscripts/[id]/attention-map/route.ts`,
  `lib/writersStudio/develop/liveLens.ts` and `lib/writersStudio/developClient.ts`
  (where stored readings are loaded and displayed);
- exact old-reader `app/writers-studio/develop/DevelopRoom.tsx`,
  `app/writers-studio/full-redesign/DevelopRoom.tsx`,
  `app/writers-studio/rebuild/RebuildStudioClient.tsx`,
  `app/writers-studio/rebuild/liveReview.ts`,
  `lib/manuscript/developmentalReading/assess.ts` and
  `app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx` (further reading consumers);
- target `lib/house/preferences.ts` (the target parser), and target
  `app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx` and
  `app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx` (where the target requests an
  `overview` reading).

The old-reader paths live beneath `old-reader/<exact-old-reader-SHA>/...` in the
compatibility review bundle. Search may scope discovery but does not witness coverage. If a
question needs another file, the reviewer Reads it and lists it in coverage.

## Required review JSON

The review must carry the ordinary Review-Custody fields:

- `verdict`: `APPROVED | REVISE | BLOCKED`;
- exact `plan_sha256`;
- stable `trace_id` equal to the reviewer session identity;
- non-empty `reviewer`, `summary`, `findings`, `coverage.files`, and explicit
  `limitations`.

It must additionally carry `migration_compatibility` with:

- `instrument = migration-compatibility/v1`;
- verdict `COMPATIBLE` or `INCOMPATIBLE`;
- exact full old-reader commit;
- exact full target-reader commit;
- the exact two ordered pending migration paths and SHA-256 values;
- physically witnessed old-reader evidence with repo path, SHA-256 and exact trace path;
- non-empty rationale and explicit limitations;
- `failure_prefix_compatibility.instrument = migration-prefix-compatibility/v1`;
- verdict `ALL_PREFIXES_COMPATIBLE` only if prefixes 1 and 2 are each established;
- exactly two prefix entries, each bound to its ending migration, with rationale and
  explicit limitations.

The production gate recomputes target migration hashes and old-reader evidence from git
objects. Self-reported hashes do not establish compatibility.

## Closing condition

The plan closes when an independent, physically witnessed review of exactly these two
migrations is admitted against the exact target, or when the review returns `REVISE` or
`BLOCKED` and the deploy is held.
