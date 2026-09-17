# F5-CONFORMANCE-REPAIR-01 - P5-E EXECUTOR + RESTORE REHEARSAL - RESULT

**Date:** 2026-09-17
**Authority:** `F5-CONFORMANCE-REPAIR-01_P5E-EXECUTOR-RESTORE_FOUNDER_AUTHORIZATION_2026-09-17.md`
**Subject:** `6df34018547c71c218230d8d826ce5a6f7136cb8`

```text
FRESH BOOTSTRAP + MIGRATIONS      PASS
SYNTHETIC ADJUDICATED SEED        PASS
PRE-ERASURE BACKUP                PASS
READ-ONLY ACTIVATION PREFLIGHT    FAIL-CLOSED / RETURN
EXECUTOR REHEARSAL                NOT RUN
GOVERNED RESTORE REHEARSAL        NOT RUN
P5-E VERDICT                      RETURN / STOP
PRODUCTION / STAGING              UNTOUCHED
```

## 1 - Returned defect

P5-E's mandatory read-only plan preflight correctly refused to activate before any destructive mutation. The returned boundary is not a Circle defect and not a migration-application defect. It is a mismatch between the governed erasure authority model and the actual fully migrated PostgreSQL schema.

Three coupled findings define the next bounded repair:

1. `runtimeMemberForeignKeys()` asks PostgreSQL for `name[]` but types it as `string[]`, making FK local-column identifiers unusable and occupancy unknown;
2. the v3 activation registry's migration-declaration graph is not equal to the runtime member-FK graph: 289 declarations / 264 effect groups versus 316 runtime constraints / 294 effect groups, with 36 runtime-only groups, 6 registry-only groups and 2 count mismatches;
3. the direct-locus registry contains one stale locus, `dream_entries`, absent from the canonical migrated runtime schema (319 declared / 318 resolved).

The executor's fail-closed behavior is therefore validated: it refused to convert incomplete authority/evidence into deletion.

## 2 - No-change consequence

The executor was never invoked. `account_erasure_acts=0`, member tombstones remain `0`, and the synthetic target member remains present. The pre-erasure backup was not replayed because there was no lawful erasure to restore against.

## 3 - Next bounded repair

```text
P5-D-R3 · RUNTIME SCHEMA AUTHORITY
```

R3 must make the activation authority mechanically reconcile to the canonical migrated runtime schema rather than assuming the migration-source graph is execution-identical.

At minimum R3 must prove:

1. runtime FK local columns are represented as real identifiers (`text[]` or equivalent), never stringified `name[]` payloads;
2. every runtime member-FK constraint/effect group is either governed by the activation registry or causes a precise fail-closed drift result;
3. stale migration declarations and duplicate/historical declarations cannot masquerade as current runtime constraints;
4. direct-locus succession accounts for schema removals such as `dream_entries` without turning absence into guessed zero;
5. the registry/source provenance and runtime execution graph remain distinguishable rather than collapsing one into the other;
6. only after a read-only preflight reports `candidate_destructive_plan`, `activationReady=true`, and zero blockers may P5-E resume executor/restore rehearsal.

This result does not authorize R3 by itself.

## 4 - Standing

```text
P5-A      COMPLETE
P5-B      COMPLETE
P5-C      COMPLETE
P5-D      CANDIDATE · R1/R2 repaired · R3 required
P5-D-R1   CLOSED / PASS
P5-D-R2   CLOSED / PASS

P5-E      RETURNED BEFORE EXECUTOR
P5-D-R3   CLOSED · NEW FOUNDER CONTINUATION REQUIRED

executor rehearsal                 NOT RUN
restore rehearsal                  NOT RUN
rollout-readiness ruling           NOT EARNED
canonical merge / deploy           CLOSED
production / staging               UNTOUCHED
```
