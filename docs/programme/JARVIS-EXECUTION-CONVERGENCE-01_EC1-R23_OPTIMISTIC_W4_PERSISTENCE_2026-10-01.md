# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R23 — Optimistic W4 Persistence

**Date:** 2026-10-01  
**Parent:** EC1-R22 host-decision W4 projection `b81271c8ec43`  
**Class:** bounded canonical-store persistence  
**Runtime completion wire:** NONE

## Writer census

Canonical W0/W4 persistence currently uses atomic file replacement but no shared canonical-Work writer lease or compare-and-swap primitive.

Current mutators include lifecycle transition, route/transport binding, E1 result append, verifier append, evidence-ready transition, O5 Path B recovery, work-unit control, and the local-candidate host lane.

The existing R3 grant-writer lease governs the grant-authority domain. It is not silently reinterpreted as a general W0/W4 writer lock in this act.

## Change

Added `persistHostDecidedLocalCandidateV1(...)` to the canonical W0/W4 store.

The function:

1. reads the current canonical Work envelope;
2. requires `EXECUTING + local-native-candidate`;
3. optionally verifies a caller-supplied expected envelope digest;
4. applies the pure EC1-R22 projector to that exact base;
5. returns `CONVERGED` without writing when W4 evidence is already identical;
6. re-reads the file immediately before persistence and refuses if the base digest changed;
7. atomically writes the projected envelope;
8. re-reads and verifies the persisted digest.

It performs no lifecycle transition, grant issue/claim/consume, provider/model call, or verifier execution.

## Proof

`local-candidate-w4-persistence-r23-proof.mjs`: **6/6 PASS**.

Proves:

- fresh VERIFIED host-decision projection persists into canonical W4;
- exact retry converges without duplicate records;
- caller stale base digest refuses before W4 mutation;
- envelope drift during projection is preserved and refuses overwrite;
- conflicting pre-existing W4 evidence is refused rather than replaced;
- the persistence seam contains no lifecycle transition or grant mutation.

Regression wall:

- EC1-R22/R4 projector: **14/14 PASS**;
- W4.v2: **23/23 PASS**;
- W5.v2: **12 composition assertions + 24 falsifiers PASS**;
- canonical-v2 Desktop: **30/30 PASS**.

## Explicit limitation

This is **optimistic stale detection**, not a cross-process serialization guarantee.

The second pre-write read detects changes that occur before that check. Because no shared W0/W4 writer lock/CAS exists, another process could in principle write after the final check and before/after the atomic rename.

Therefore this act does **not** authorize wiring R23 into runtime completion yet.

## Standing

```text
pure host-decision W4 projection:     PASS
canonical W4 persistence:             IMPLEMENTED / NOT WIRED
idempotent convergence:               PASS
stale-base refusal:                   PASS
mid-projection drift refusal:         PASS
cross-process mutual exclusion:       NOT ESTABLISHED
runtime completion wire:              BLOCKED ON WRITER ADMISSION
```

The next act is a concurrency admission witness: prove whether two supported production actors can actually attempt canonical Work mutation concurrently on the same local-candidate Work. Only if that race is reachable should a new writer-ownership mechanism be designed.
