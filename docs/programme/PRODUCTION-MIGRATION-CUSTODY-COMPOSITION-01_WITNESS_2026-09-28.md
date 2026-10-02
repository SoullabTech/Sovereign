# PRODUCTION-MIGRATION-CUSTODY-COMPOSITION-01 — Additive two-layer rebind witness

Date: 2026-09-28

## Boundary

This act adds a read-only composition layer for the exact case where:
- Review-01 remains authoritative for an unchanged migration corpus;
- a later independently reviewed reader delta advances the live/target reader;
- the existing single-review gate must remain unchanged.

No deployment hook, database mutation, migration execution, target swap, or production restart is added.

## New additive surfaces

- `scripts/migration-custody-composition-core.ts`
- `scripts/migration-custody-composition-gate.ts`
- `tests/constitutional/migration-custody-composition/matrix.ts`

Existing authorities remain byte-identical to `90abc99a`:
- `scripts/review-custody.ts`
- `scripts/review-custody-core.ts`
- `scripts/review-custody-migration-gate.ts`
- `scripts/migration-compatibility-gate-core.ts`
- `scripts/migration-prefix-compatibility-core.ts`
- `scripts/deploy-production.sh`

## Law

The composition applies only when all are true:
1. base migration review is admitted and all-prefix compatible;
2. delta review is approved, compatible, and all-prefix compatible;
3. delta report bytes match their frozen source hash;
4. delta begins at the exact base-review target;
5. target is a descendant of that base;
6. delta touches no migration path;
7. every changed delta path was witnessed;
8. migration bytes/order match the base review exactly;
9. observed pending set still matches the exact reviewed set;
10. live reader equals the exact reviewed target.

## Falsifier witness

Pure matrix:
- lawful composition: PASS
- defeat candidates: **14 / 14 DEAD**

Real-evidence attacks:
- substituted delta report → REFUSED
- stale/wrong delta target → REFUSED
- missing delta coverage → REFUSED
- changed migration byte → REFUSED
- partial-prefix drift → REFUSED
- wrong live reader → REFUSED

Result: **6 / 6 DEAD**.

## Real evidence application

Against the current Review-01 / Review-02 artifacts:

> TWO-LAYER MIGRATION CUSTODY COMPOSITION APPLIES

- base target: `a71f6902b81f67aeb1389682391a1e96139e2061`
- live/target: `90abc99a921fe21cc40f6a84ed9c1ff2f3a93215`
- migrations: **9 exact pending bytes**
- delta files: **8 exact changed paths, all witnessed**
- delta review SHA-256: `94c19661f2eb690a9dbdc73ab5427293aba81056ea8dbdc5f4c729d8472b0908`

## Standing

> **PRODUCTION-MIGRATION-CUSTODY-COMPOSITION-01 — ADDITIVE COMPOSER PROVEN · 14/14 PURE FALSIFIERS DEAD · 6/6 REAL-EVIDENCE ATTACKS DEAD · EXISTING SINGLE-REVIEW GATE UNCHANGED · REAL 68ff→a71 + a71→90 COMPOSITION APPLIES · STOP BEFORE MIGRATIONS**
