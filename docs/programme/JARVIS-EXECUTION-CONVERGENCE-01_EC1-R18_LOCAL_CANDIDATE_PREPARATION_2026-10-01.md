# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R18 — Local Candidate Preparation

**Date:** 2026-10-01  
**Parent:** EC1-R17 canonical packet projection `09ecbdbcd9cf`  
**Class:** bounded non-executing preparation  
**Execution:** NONE

## Change

Added `jarvis-desktop/src/local-candidate-preparation.js`.

The coordinator prepares one structured local-candidate Work through a canonical-first sequence:

1. mint or accept one shared Work ID;
2. create or confirm W0.v2 with host-only `LOCAL_CANDIDATE` authority;
3. prove the canonical immutable core matches the requested intent;
4. transition only DRAFT → BOUNDED → AUTHORIZED;
5. project the Path A packet from the frozen W2 authority via EC1-R17;
6. persist or confirm the exact packet.

No routing, transport binding, provider grant, worker execution, W4 projection, or recovery action occurs.

## Partial-failure law

The write order is canonical-first.

A failure before packet creation may leave an AUTHORIZED canonical twin, but no executable legacy packet. Exact retry may complete that safe partial.

An existing canonical core mismatch refuses before packet creation.

An existing packet mismatch is never overwritten or repaired in place.

## Proof

`local-candidate-preparation-proof.mjs`: **7/7 PASS**.

Proves:

- canonical AUTHORIZED twin + projected packet preparation;
- `eligible:false` — preparation is not execution permission;
- exact retry convergence without packet rewrite or authority drift;
- safe recovery from a canonical-only DRAFT partial;
- mismatched canonical refusal before packet creation;
- mismatched packet refusal without overwrite;
- project-execution verifier refusal before packet persistence;
- structural absence of execution/routing/provider/grant/W4 calls.

## Standing

```text
shared Work identity:             ESTABLISHED
canonical local-candidate W0/W2: PREPARED TO AUTHORIZED
structured Path A packet:        PROJECTED FROM W2
packet authority duplication:    ELIMINATED
partial creation order:          CANONICAL-FIRST
execution eligibility:           FALSE
host decision custody:           AVAILABLE / NOT YET CONNECTED
runtime structured path:         IMPLEMENTED / NOT YET HOST-GATED
W4 projection:                   NOT YET WIRED
```

The next act may stage one local-candidate execution occurrence from this prepared pair, require an independent MAIN host decision, re-read and re-bind the canonical authorized core and packet at decision time, and only then call `MECH.runWorkUnit`. Legacy `runWorkUnit` behavior must remain unchanged.
