# SOULLAB-LIVING-ARCHIVE-01 · Source Vault R1 — Pre-PR Evidence

**Status:** IMPLEMENTATION CANDIDATE · local evidence only · 2026-10-01

**Authority:** LA-27, LA-28, LA-29 and layered entry ratified by founder continuation act. R1 is limited to additive persistence + executable falsifiers. No source ingestion, no backfill, no member-facing route, no renderer.

## Candidate contents

- additive migration: `20261001215400_living_archive_source_vault.sql`;
- five domain-qualified tables: catalogue versions, artifacts, provenance claims, known gaps, lineage edges;
- `living_archive_*` namespace kept separate from MAIA-WISDOM Source Vault authority;
- structural `WITHHELD (THIRD PARTY)` no-geometry constraints;
- sub-artifacts structurally barred from Dark Field point visibility;
- fixed catalogue-unit v1 seed only; zero artifact/gap seed rows;
- pure Dark Field reference model, not a route/renderer;
- executable LA30-F1…F11 matrix;
- fail-closed rollback script that refuses once historical rows exist.

## Local witness

```text
LIVING-ARCHIVE-SOURCE-VAULT-R1: 11/11 falsifiers lethal; layered entry PASS; coordinate growth PASS; schema binding PASS
✅ Migration lock-timeout law: 1 migration(s) at/after 20261001000000 comply
```

`git diff --check` is clean.

### Isolated PostgreSQL 16 witness

The migration was applied to a clean ephemeral PostgreSQL 16 instance, with no Soullab production database involved:

```text
catalogue_versions=1
artifacts=0
known_gaps=0
bad_exact_rejected=yes
bad_sealed_gap_rejected=yes
bad_withheld_rejected=yes
rollback_with_data_refused=yes
rollback_empty_applied=t
```

This establishes that R1 seeds only the catalogue-unit definition, admits no historical artifact/gap rows, structurally refuses three representative privacy/date wrong worlds, and that the rollback is fail-closed once historical data exists while remaining usable on an empty R1 substrate.

## What the matrix proves

- F1 decorative points die;
- F2 sealed / artifact / known-gap darkness cannot collapse into one class;
- F3 behavior-derived thread recommendation/ranking dies;
- F4 completion pressure dies;
- F5 narrated awe dies;
- F6 wandering cannot be treated as abandonment;
- F7 sub-artifact granularity inflation dies;
- F8 quantity-bearing haze dies;
- F9 third-party shadow disclosure through points, threads or coordinates dies;
- F10 URL/network navigation telemetry dies;
- F11 coordinate drift dies;
- anonymous entry remains PUBLIC-only;
- adding catalogue records does not move existing `coord_v1` values;
- the migration itself is bound into the matrix so the runtime reference model cannot silently claim constraints the schema does not carry.

## Still owed before merge

- canonical parent admission of the substrate census PR;
- repository TypeScript/no-regression CI;
- empty-database reconstruction including the new migration;
- Docker/build gate;
- sovereignty / JARVIS / record-SHA gates;
- Class B migration rollback covenant.

No deployment or artifact ingestion is authorized by this evidence record.
