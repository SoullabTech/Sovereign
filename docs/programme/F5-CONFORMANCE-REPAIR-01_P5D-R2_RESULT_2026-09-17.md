# F5-CONFORMANCE-REPAIR-01 - P5-D-R2 RESULT

**Date:** 2026-09-17
**Authority:** `F5-CONFORMANCE-REPAIR-01_P5D-R2_FOUNDER_AUTHORIZATION_2026-09-17.md`
**Returned gate:** `32e5eb11b3bfce900fd5c2c95aff1ccbb4060462` - P5-E runtime seed STOP

```text
R2 RECORD-SHAPE REPAIR               PASS
PRE-ERASURE CIRCLE WRITES            PASS
ERASED-MEMBER ACTIVE STATE REFUSAL   PASS
GOVERNED-RESTORE CIRCLE PROJECTION   PASS
FRESH BOOTSTRAP + FULL MIGRATIONS    PASS
P5 REGRESSION MATRIX                 PASS
PRODUCTION / STAGING                 UNTOUCHED
```

## 1 - Defect repaired

The returned shared Circle trigger dereferenced `NEW.shared_by` and `NEW.member_id` across heterogeneous trigger RECORD shapes. R2 replaces that polymorphic field access with one trigger function per concrete relation shape.

No erasure disposition, activation-registry classification, executor sequence, route/client behavior, lineage rule, Circle outcome, or governed-restore contract changed.

## 2 - Acceptance verdict

All six R2 acceptance conditions are discharged:

1. **PASS** - ordinary pre-erasure inserts succeed on all three Circle relations;
2. **PASS** - each trigger function references only columns available on its own relation;
3. **PASS** - erased members cannot regain active share / response / membership outside governed restore;
4. **PASS** - governed restore yields `revoked`, `withdrawn + payload NULL`, and `left`;
5. **PASS** - fresh PostgreSQL 17.7 canonical bootstrap + full migration runner remain green;
6. **PASS** - P5 regression, type-health, sovereignty and design gates remain green.

## 3 - Repository evidence

```text
focused R2 S5 suite          8 / 8 PASS
P5 suites                   13 / 13 PASS
P5 tests                   124 / 124 PASS
ship TypeScript             229 diagnostics vs baseline 239 - 0 regressions
ci:sovereignty              PASS
member-ID logging           532 / 532 baseline - 0 new
design canon                PASS - no member-facing UI delta
git diff --check            PASS
```

Critical candidate blobs before commit:

```text
database/migrations/20260917000002_account_erasure_p5d_s5_fences.sql
  24ca3b587326c69396c37d4d287ab4a679ec9412

lib/erasure/__tests__/accountErasureS5Fences.test.ts
  a1d6ba4856d1f4328a966c5a4455248ba4af3228

docs/programme/F5-CONFORMANCE-REPAIR-01_P5D-R2_FOUNDER_AUTHORIZATION_2026-09-17.md
  3549f7f103e56a4b2066b4458321804fd67c002d

docs/programme/F5-CONFORMANCE-REPAIR-01_P5D-R2_DISPOSABLE_WITNESS_2026-09-17.md
  5aa4976a609244862162ce7eaf4b7cfaa0466d1c
```

## 4 - Standing

```text
P5-A      COMPLETE
P5-B      COMPLETE
P5-C      COMPLETE
P5-D      CANDIDATE - R1 + R2 runtime blockers repaired
P5-D-R1   CLOSED / PASS
P5-D-R2   CLOSED / PASS

P5-E runtime-seed STOP condition      DISCHARGED
P5-E executor runtime rehearsal       CLOSED - new founder continuation required
P5-E governed restore rehearsal       CLOSED - new founder continuation required
P5-E rollout-readiness ruling         NOT YET EARNED
CANONICAL MERGE / DEPLOY              CLOSED
PRODUCTION                            UNTOUCHED
```

R2 does not itself resume P5-E. The next exact act is a new founder continuation reopening the synthetic executor plus pre-erasure backup / governed-restore rehearsal against this repaired candidate.
