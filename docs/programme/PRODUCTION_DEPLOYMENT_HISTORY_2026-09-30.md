# Production deployment history — 2026-09-30

**Kind:** operational evidence only. This record does not alter EARLY-FIELD-01, H1, or any runtime law.

## Purpose

This record separates production deployment history from the certified implementation records.
It records what was deployed, what the rollback tags mean now, and which runtime facts were
re-witnessed after the EARLY-FIELD-01 and H1 cohort-gate merges.

## Reported sequence earlier in the day

1. Production was deployed out of intended order to `7ec42ce6f` at approximately `23:28Z`.
2. Production was then moved forward to canonical `89f7876e8`.
3. A rollback occurred.
4. `89f7876e8` was redeployed and verified from both container environment and Docker
   `Config.Env`.
5. At that point EARLY-FIELD-01 was not yet present in production, so
   `LivingFieldInstrument` remained universally visible even though the early-field
   environment setting was closed.

These items are preserved as historical operational evidence. Exact timestamps for steps
2–4 were not reconstructed from Docker event history and are therefore not invented here.
## EARLY-FIELD-01 merge lineage

PR #1547 carried the certified EARLY-FIELD-01 implementation.

- certified implementation lineage: `c31b85a34` → `700d9d361`
- docs-only canonical refresh: `700d9d361` → `0e29c65df`
- PR #1547 merge commit: `cc1c5b4d79793dd7911d6aea0054e8c678d01bcb`
- base at merge: `71859c3a3e9cac7abaaf8d57bc54ef21bb533eca`
- merged at: `2026-10-01T00:26:13Z`

The implementation diff at `700d9d361` and `0e29c65df` was compared byte-for-byte
and was identical. Both heads completed CI successfully before merge.

## Canonical advanced again before final production verification

After #1547, H1 cohort gate PR #1551 merged onto canonical:

- #1551 head: `ad7b2d3ea2fe38bee85b3671ffd5fae6ba4cdc96`
- #1551 base: `cc1c5b4d79793dd7911d6aea0054e8c678d01bcb`
- #1551 merge / canonical: `3421a2096c3afcce617a394bca1ffe246171f39f`
- merged at: `2026-10-01T00:52:03Z`

The initial covenant-gates run on #1551 failed, then subsequent covenant-gates reruns passed.
The build, TypeScript no-regression gate, sovereignty, empty-database reconstruction,
JARVIS falsifiers, check-diagrams, Axis 1 and GitGuardian checks were successful before merge.
## Current production state re-witnessed

At the time of this record:

- live container `GIT_COMMIT` from `printenv`: `3421a2096`
- live Docker `Config.Env` `GIT_COMMIT`: `3421a2096`
- current canonical branch: `3421a2096c3afcce617a394bca1ffe246171f39f`
- live `maia-sovereign` container created: `2026-10-01T01:12:19Z`
- image `maia-sovereign:3421a2096` created: `2026-10-01T01:08:27Z`
- `EARLY_FIELD_ENABLED`: unset
- `EARLY_FIELD_MEMBER_IDS`: unset
- `HOUSE_STUDIO_H1_ENABLED`: unset
- `HOUSE_STUDIO_H1_MEMBER_IDS`: unset

For both cohort systems, the documented contract treats the unset switch as closed.

## Rollback tags now

The current image tags were inspected directly:

- `:current` / `:prod` → `3421a2096`
- `:previous` → `cc1c5b4d7`
- `:broken` → `89f7876e8`

Earlier references naming `04005ca7c` or `7ec42ce6f` as the current fallback are therefore
stale. The rollback target is an operational fact and must be re-checked before any rollback.

## Evidence still owed

EARLY-FIELD widening criterion 3 is not satisfied by an anonymous request. It still requires
a signed-in member outside the cohort to reach the Living Field, see no
`LivingFieldInstrument`, and receive `{"admitted":false}` from
`/api/early-field/admission`.

The independent #1539 witness remains separate and must record
`Origin witnessed: http://127.0.0.1:3139`. H1 admission uses its own established
`localhost:3100` environment.
