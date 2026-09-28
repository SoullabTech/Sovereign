# PRODUCTION-MIGRATION-CUSTODY-INTEGRATION-01 — Production gate adapter integration witness

Date: 2026-09-28

## Boundary

Integrate the proven two-layer migration-custody composer into the production review seam as an additive alternative to the existing single-review path.

No migration, database mutation, reader swap, restart, merge, or deployment is authorized by this witness.

## Integration law

The production review function now has two explicit modes:

- `single` — default; preserves the existing `review-custody-migration-gate.ts` path.
- `two-layer` — must be explicitly selected with `MIGRATION_CUSTODY_MODE=two-layer`.

Unknown modes refuse.

Two-layer mode additionally requires:

- the normal base custody triplet;
- `MIGRATION_DELTA_REVIEW`;
- `MIGRATION_DELTA_PROJECTION`.

A failed two-layer gate returns failure. It cannot fall back to the legacy path.

Both modes cache the exact live old-reader identity only after their gate applies. Deploy/update then retain the existing Step-3 immediate relation re-witness before schema mutation.

Migration-only Step-3 scope remains unchanged in this act.

## Conformance

- shell syntax: PASS
- new composition matrix: 14/14 defeat candidates dead
- existing migration compatibility composition matrix: 6/6 defeat candidates dead
- existing Step-3 ordering witness: PASS
- existing review custody matrix: 14/14 defeat candidates dead
- integration source conformance: PASS
- TypeScript check for additive composer/integration tests: PASS
- git diff check: PASS

Integration conformance proves:

- default remains `single`;
- `two-layer` is explicit;
- unknown mode refuses;
- missing two-layer evidence refuses;
- failed composite cannot fall back to legacy;
- deploy/update remain gate → immediate re-witness+migrate → tags → swap;
- migration-only ordering scope is unchanged.

## Real evidence regression

After integration, the actual Review-01 + Review-02 evidence still returns:

> **TWO-LAYER MIGRATION CUSTODY COMPOSITION APPLIES**

for:

- base target `a71f6902b81f67aeb1389682391a1e96139e2061`;
- live/target `90abc99a921fe21cc40f6a84ed9c1ff2f3a93215`;
- 9 exact pending migration bytes;
- 8 exact reader-delta paths, all witnessed.

## Important target consequence

The integration commit itself advances the repository target beyond `90abc99a`.

Therefore the current Review-02 target binding **must not** be reused to run migrations against the integration commit.

The next act must independently bind the tooling-only delta from `90abc99a` to the exact integration candidate before any production mutation.

## Standing

> **PRODUCTION-MIGRATION-CUSTODY-INTEGRATION-01 — PASS · EXPLICIT TWO-MODE PRODUCTION SEAM · LEGACY DEFAULT PRESERVED · NO COMPOSITE FALLBACK · ALL INHERITED CONSTITUTIONAL SUITES GREEN · REAL 90abc COMPOSITION STILL APPLIES · STOP BEFORE MIGRATIONS**
