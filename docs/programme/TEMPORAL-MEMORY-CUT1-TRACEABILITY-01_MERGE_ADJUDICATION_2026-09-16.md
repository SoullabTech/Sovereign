# TEMPORAL-MEMORY-CUT1-TRACEABILITY-01 — MERGE ADJUDICATION

**Date:** 2026-09-16  
**Status:** ⭐ MERGE CANDIDATE ACCEPTED · deployment witness still required  
**Branch:** `feature/temporal-cut1-traceability-integration-20260916`

> Traceability is the instrument for future reconciliation, not the reconciliation itself.

## 1. Referent

Adjudicated head before this record: `d5d14d5c965480b01eab36f6e51ed94382f83142`.
Target: current `origin/clean-main-no-secrets` = `673533526b7d892883f56af01373699bf169840b`.
The target is the merge-base; the candidate is 14 temporal-memory commits ahead and contains no unrelated commit in that range.

Scope diff is limited to the temporal programme records, Cut-1 trace migration/sidecar, MemoryBundle wiring, voice turn binding, witness, and directly related tests.

## 2. Reproduced gates

### Functional / constitutional tests

```text
Test Suites: 5 passed, 5 total
Tests:       42 passed, 42 total
```

Includes Cut-1 traceability, fail-soft read/write behavior, call-site binding, Sanctuary boundary, and existing M1.5 observability contract.
### TypeScript no-regression

```text
program files : 4323 (baseline 3965)
errors        : 229  (baseline 239)
new diagnostics: 0
✅ No TypeScript regressions
```

### Member-identifier logging

```text
current violations: 534 (all baselined)
new violations:     0
✅ No NEW raw member identifiers reaching logging sinks
```

### Production read-only shadow

```text
TEMPORAL_CUT1_SHADOW
cutoff_pools=14
equivalent=14/14
members_with_top12_score_ties=0
```

Largest measured pool in this rerun: 1073 eligible rows. Baseline average 10.811 ms; observed average 13.569 ms. The 100 ms operational stop condition was not triggered.

## 3. Adjudication

The candidate satisfies the predeclared non-perturbation gate on the current production population: the observed query returns the same live Cut-1 count, identities, order, and live scores as the preserved baseline query for all 14 pools where Cut 1 is an actual cut.
Observer-read failure and trace-write failure remain non-authoritative by test. Trace evidence is bounded, content-minimized, append-only, and independently derivable from the preserved live/neutral top sets. Voice uses the existing `turnId`; Sanctuary remains outside retrieval and tracing.

The candidate does **not** change ranking, coefficients, `LIMIT 12`, validity, supersession, Cut 2, or member-visible response behavior.

**Merge adjudication: ACCEPT.**

Deployment remains a separate evidence act. Production closure requires:

1. migration present in the production database;
2. candidate runtime deployed at a known SHA;
3. at least one non-Sanctuary member-facing retrieval producing a durable Cut-1 trace row bound to session + turn/message id;
4. a zero-exclusion trace remains distinguishable from no trace;
5. no trace failure alters retrieval;
6. no claim that continuity improved merely because traceability exists.

Until those witnesses exist, Clause 2 repair is not claimed complete in production.
