# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R8 — MAIN Dual-Shadow Create Mode

**Date:** 2026-10-01  
**Parent:** EC1-R7 dual-shadow coordinator `f392ac1a3151`  
**Class:** bounded MAIN wiring  
**Execution authority:** NONE

## Change

`jarvis:work-unit-action` / `action=create` now recognizes one additional explicit mode:

`mode: "dual-shadow"`

It requires both `legacy_spec` and `canonical_spec` and delegates only to `DUAL_SHADOW.createDualShadow(...)` using MAIN-derived canonical SHA, clock, environment, and human actor identity.

The existing `canonical-v2` branch remains separate and ahead of dual-shadow. The legacy branch remains the default fallthrough.

## Boundary

Dual-shadow MAIN mode does not call:

- `MECH.runWorkUnit`;
- provider execution;
- execution authorization;
- grant issue/claim/consume;
- W2 lifecycle transition;
- EC1-R4 candidate projection.

No renderer control exposes `dual-shadow` yet. The mode is therefore an explicit internal MAIN surface, not a user-visible execution path.

The two request schemas remain explicit and separate. MAIN does not translate legacy provider-selection fields into canonical-v2 intent.

## Proof

`main-dual-shadow-mode-proof.mjs`: **7/7 PASS**.

Regression wall:

- EC1-R7 dual-shadow proof: **6/6 PASS**;
- EC1-R6 shared-ID proof: **8/8 PASS**;
- canonical-v2 Desktop proof: **30/30 PASS**;
- legacy operator tests: **9/9 PASS**;
- EC1-R5 identity matrix: **LETHAL + DISCRIMINATING**;
- EC1-R5 freeze: **INTACT**.

## Standing

```text
MAIN dual-shadow mode:          IMPLEMENTED
Renderer exposure:              NONE
Execution authority:            NONE
Legacy create default:          UNCHANGED
Canonical-v2 create default:    UNCHANGED
Dual representation creation:   AVAILABLE VIA MAIN
Path A execution:               UNCHANGED
W4 shadow projection runtime:   NOT WIRED
```

The next act may only examine a post-execution shadow-projection wire for Work created through this shared-ID dual-shadow path. Existing historical packets remain outside the programme.
