# F5-CONFORMANCE-REPAIR-01 · P5-D-R1 — RESULT

**Date:** 2026-09-17
**Authority:** `F5-CONFORMANCE-REPAIR-01_P5D-R1_FOUNDER_AUTHORIZATION_2026-09-17.md`
**Returned gate:** `d349f48ce` · P5-E migration STOP

```text
R1 FENCE TARGET AUTHORITY          PASS
VIEW / MATVIEW EXCLUSION           PASS
ORDINARY TABLE TARGETING           PASS
PARTITIONED TABLE TARGETING        PASS
UNKNOWN STORAGE KIND FAIL-CLOSED   PASS
FRESH BOOTSTRAP                    PASS
P5-A MIGRATION                     PASS
P5-D MIGRATION                     PASS
PRODUCTION / STAGING               UNTOUCHED
```

## 1 · Defect repaired

P5-E proved that the P5-D migration's `information_schema.columns` discovery widened its row-trigger population to fifteen views. R1 replaces that accidental population with an explicit PostgreSQL relation-kind authority boundary.

The repair is deliberately smaller than P5-D: no erasure disposition, registry classification, executor behavior, route, client, Circle semantics, lineage rule, or restore contract changed.

## 2 · Acceptance verdict

The six R1 acceptance conditions are discharged:

1. **PASS** — ordinary and materialized views cannot enter the generic trigger population;
2. **PASS** — ordinary (`r`) and partitioned (`p`) durable tables remain generic-fence targets;
3. **PASS** — Circle special-state tables remain outside the generic fence and keep the dedicated Circle S5 fence;
4. **PASS** — an unexpected identity-bearing foreign table (`f`) makes the migration fail loudly;
5. **PASS** — a fresh canonical bootstrap and unmodified full migration runner apply both P5 migrations;
6. **PASS** — no production/staging connection or real member mutation occurred.

## 3 · Repository evidence

```text
P5 regression suites       13 / 13 PASS
P5 regression tests        123 / 123 PASS
ship TypeScript            229 diagnostics vs baseline 239 · 0 regressions
ci:sovereignty             PASS
member-ID logging          532 / 532 baseline · 0 new
design canon               PASS · no changed member-facing surface
git diff --check           PASS
```

Critical candidate blobs before commit:

```text
database/migrations/20260917000002_account_erasure_p5d_s5_fences.sql
  7c7f3ea5ddcca05cd01ddc1a6585d7dad92b8713

lib/erasure/__tests__/accountErasureS5Fences.test.ts
  2d3b41bb3284d7230568efda243a57e3253a3046

docs/programme/F5-CONFORMANCE-REPAIR-01_P5D-R1_FOUNDER_AUTHORIZATION_2026-09-17.md
  ceac81870db029d762d6db226588325634a1dd63
```

## 4 · Standing

```text
P5-A     COMPLETE
P5-B     COMPLETE
P5-C     COMPLETE
P5-D     CANDIDATE · R1 MIGRATION DEFECT REPAIRED
P5-D-R1  PASS

P5-E migration STOP condition       DISCHARGED
P5-E executor runtime rehearsal     CLOSED · new founder continuation required
P5-E governed restore rehearsal     CLOSED · new founder continuation required
P5-E rollout-readiness ruling       NOT YET EARNED
CANONICAL MERGE / DEPLOY            CLOSED
PRODUCTION                          UNTOUCHED
```

R1 does not itself resume P5-E. The next exact act is a new founder continuation reopening the disposable executor + governed-restore rehearsal against this repaired candidate.
