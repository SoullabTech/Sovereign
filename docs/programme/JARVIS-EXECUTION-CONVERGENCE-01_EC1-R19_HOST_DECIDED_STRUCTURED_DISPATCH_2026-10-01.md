# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R19 — Host-Decided Structured Dispatch

**Date:** 2026-10-01  
**Parent:** EC1-R18 preparation `6c8445e5b19c`  
**Class:** bounded host-decision execution seam  
**Renderer exposure:** NONE

## Purpose

Make structured local-native execution impossible without a separately constituted host decision bound to the exact canonical authority, packet, Work identity, repository root, and Path A run occurrence.

This act does not expose a new renderer execution button.

## Production flow

The intended production cadence is now:

1. `mode: local-candidate-v2` creates a W0.v2 **DRAFT** with the host-only LOCAL_CANDIDATE authority profile and fixed capability `local-native-candidate`;
2. the existing canonical **Bound scope** gesture moves DRAFT → BOUNDED;
3. the existing canonical **Authorize Work Unit** gesture moves BOUNDED → AUTHORIZED and freezes the W2 authorized core;
4. local-candidate execution receives only Work ID + structured verifier plan — never a caller packet or caller execution-decision object;
5. MAIN re-projects the Path A packet from current W2 authority;
6. MAIN allocates the actual Path A run ID before confirmation;
7. R11B stages one occurrence binding root + run ID + Work ID + exact packet digest + W2 authorized-core digest;
8. native MAIN confirmation defaults to **Cancel** and displays the exact Work, run, objective, paths and verifier operations;
9. after approval, MAIN re-reads W2 and re-projects the packet; any drift refuses;
10. the host constitutes one one-shot decision;
11. the Builder mechanism independently re-verifies that decision against the exact root/run/Work/packet/core before persisting the run;
12. only then may the R16 structured runtime dispatch.

## Lower-seam hardening

`runWorkUnit()` now accepts an optional host-supplied run ID, but only structured-v1 uses the decision path.

For structured-v1 the mechanism requires:

- a fresh `r-xxxxxxxxxx` run ID;
- one constituted EC1-R11B decision;
- the exact W2 authorized-core digest;
- a decision whose binding recomputes against the exact root, run, Work and packet.

A missing, forged, stale, mismatched or unrelated decision returns `EXECUTION_DECISION_REQUIRED` **before a run record is persisted**.

The durable run record carries the execution decision that admitted that occurrence.

Legacy `runWorkUnit(root, packet, hooks)` callers remain valid and unchanged.

## Host-side refusals

Execution refuses before dispatch when:

- W0/W2 is not AUTHORIZED;
- the Work is not capability `local-native-candidate`;
- a Path A packet/result already exists;
- the canonical core or projected packet drifts while confirmation is open;
- Path A evidence appears while confirmation is open;
- structured verifier plan is not inspection-admitted;
- native confirmation is withheld.

Withholding confirmation executes nothing and creates no Path A run/packet/result.

## Proof

Host boundary: **7/7 PASS**.

Mechanism boundary: **3/3 PASS**:

- missing decision refused before persistence;
- mismatched decision refused before persistence;
- exact decision drives one real hermetic structured run to VERIFIED and is durably present in the run record.

MAIN composition: **8/8 PASS**.

Cross-lane regression wall:

- R11B decision custody: **9/9 PASS**;
- R11B authority profile: **6/6 PASS**;
- R16 focused: **11/11 PASS**;
- R16 success walk: **3/3 PASS**;
- R16 rollback walk: **3/3 PASS**;
- R17 packet projection: **9/9 PASS**;
- JOP-04 RB-6B decision: **9/9 PASS**;
- JOP-04 RB-6B host composition: **8/8 PASS**;
- legacy local-native Desktop suite: **6 PASS / 9 environment SKIP / 0 FAIL**;
- canonical-v2 Desktop: **30/30 PASS**.

## Explicit limits

R19 does **not**:

- expose local-candidate creation/execution in the renderer;
- execute project-code verifier operations;
- wire W4 projection;
- move the canonical W2 lifecycle beyond AUTHORIZED during Path A execution;
- solve crash-after-candidate-commit continuation;
- permit re-execution when Path A packet/result evidence already exists;
- replace legacy Path A.

## Standing

```text
W0 local-candidate DRAFT mode:        IMPLEMENTED / INTERNAL
Bound + Authorize gestures:           REUSED
W2 frozen authority:                  BOUND INTO DECISION
host execution occurrence:            IMPLEMENTED
native Cancel/Execute decision:        IMPLEMENTED
post-confirmation rebind:              IMPLEMENTED
mechanism-level decision verification: IMPLEMENTED
execution decision durable on run:     PROVEN
renderer execution control:            NONE
W4 shadow projection:                  NEXT BOUNDARY
```

The next act must reconcile the already-built EC1-R4 W4 projector with this new execution truth. R4 currently expects canonical `EXECUTING` state plus a CLAIMED canonical provider grant; R19 deliberately uses neither. Those old preconditions must not be forged. The next act is therefore a read-only projection-admission census before any W4 wiring.
