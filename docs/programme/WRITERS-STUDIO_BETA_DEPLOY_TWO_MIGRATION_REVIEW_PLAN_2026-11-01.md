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
6. Reader rollback to `d49dbc98d…` remains lawful after migration 1 alone and after both;
   no down-migration is required for reader rollback.
7. DDL lock and constraint-validation risk (ACCESS EXCLUSIVE on `developmental_readings` and
   `house_member_preferences` during constraint replacement) is acceptable, or is recorded
   as a finding.

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
  (the previous House constraints).

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
