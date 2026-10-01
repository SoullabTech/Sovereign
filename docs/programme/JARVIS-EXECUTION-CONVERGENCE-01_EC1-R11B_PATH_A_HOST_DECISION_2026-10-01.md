# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R11B — Path A Host Decision Custody

**Date:** 2026-10-01  
**Parent:** reconciled EC1 + JOP-04 current lineage `f65e67ff0`  
**Class:** bounded non-executing substrate  
**Runtime dispatch wiring:** NONE

## Lineage

`f65e67ff0` is three commits ahead of EC1-R10 and includes the current-lineage JOP-04 RB-6A/RB-6B repairs. This act therefore reuses the repaired host-decision architecture rather than recreating it from the older EC1 branch state.

## Change

Two non-executing capabilities are introduced:

1. **Host-only W0 authority profile `LOCAL_CANDIDATE`**
   - repository read;
   - worktree write;
   - bounded shell;
   - explicit `test_execution=true`;
   - no network, spend, merge, deploy, production read/write.

2. **`local-candidate-execution-decision.js`**
   - stages one host-minted occurrence;
   - binds repository root, Path A run id, exact packet digest, Work id, and canonical authorized-core digest;
   - keeps `decided=false` until a separate host constitution act;
   - re-verifies the exact binding before constitution;
   - one-shot decision only.

## Authority-profile proof

`local-candidate-authority-profile-proof.mjs`: **6/6 PASS**.

It proves:

- ordinary canonical-v2 creation remains read-only;
- only a host option can select `LOCAL_CANDIDATE`;
- renderer/canonical spec cannot name the profile;
- malformed `test_execution` fails closed;
- W2 authorized-core snapshot contains `test_execution=true` after AUTHORIZED;
- no consequential/external authority is added.

Regression wall remains green:

- W0.v2: **12/12**;
- W2.v2: **13/13**;
- canonical-v2 Desktop: **30/30**;
- EC1-R10 matrix/freeze: intact.

## Host-decision proof

`local-candidate-execution-decision-proof.mjs`: **9/9 PASS**.

The decision custody rejects:

- incomplete binding;
- forged occurrence identity;
- repository-root drift;
- run-occurrence drift;
- packet drift;
- canonical-authority drift;
- second decision on the same occurrence.

The same valid binding may remain pending indefinitely with no decision constituted.

## Boundary

This act does **not**:

- call `MECH.runWorkUnit`;
- call `spawnDelegate`;
- change `executeRun`;
- expose a renderer action;
- widen E1 provider execution;
- register an effect-bearing deterministic capability;
- claim that arbitrary verification commands are safely bounded.

The final point is now the next blocker: Path A verification commands are arbitrary shell programs, so exact invocation binding alone is insufficient to establish effect scope.

## Standing

```text
JOP-04 RB-6A current lineage:      PRESENT
JOP-04 RB-6B host decision:        PRESENT
LOCAL_CANDIDATE W0 profile:        IMPLEMENTED / HOST-ONLY
Path A decision custody:           IMPLEMENTED / NOT WIRED
Decision withheld arm:             PROVEN
Runtime delegate dispatch:         UNCHANGED
E1 read-only membrane:             PRESERVED
Verification shell scope:          UNRESOLVED / BLOCKING
```

The next act is a verifier-effect constitution. No Path A execution is admitted until the exact verification program can be shown to remain inside its granted effect scope.
