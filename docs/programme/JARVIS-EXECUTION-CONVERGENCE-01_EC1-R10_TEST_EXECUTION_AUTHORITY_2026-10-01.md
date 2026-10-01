# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R10 — Test-Execution Authority

**Date:** 2026-10-01  
**Parent:** EC1-R9 authority-unity constitution `d3c388fd9835`  
**Class:** pre-implementation constitutional instrument  
**Runtime changes:** NONE

## Source finding

Current W0.v2 has a first-class shell scope:

- `none`;
- `read_only`;
- `bounded_write`.

Current E1 canonical permission projection nevertheless hardcodes `execute_checks: false`.

Legacy/human execution uses a distinct semantic authority, `tests.run`, and derives `execute_checks` from that authority.

Historical governed Work records also demonstrate that `shell: bounded_write` may coexist with `test_execution: false`. Therefore shell authority and test-execution authority are not interchangeable.

## Ruling

> Test execution is an independent authority dimension. It may not be inferred from shell scope, work class, local posture, repository-write authority, or the existence of verification commands.

For a converged local-native candidate effect, canonical authority must explicitly carry test-execution permission in addition to repository read/write authority.

No external/network/spend/merge/deploy authority may appear merely because test execution is allowed.

## Frozen laws

- **T1** bounded shell does not imply test execution;
- **T2** explicit test-execution authority survives even when shell is otherwise none;
- **T3** packet `tests.run` is projected iff canonical test-execution authority is true;
- **T4** local-candidate execution requires explicit test-execution authority;
- **T5** test-execution authority does not widen network/spend/merge/deploy authority;
- **T6** no implementation may infer test authority from shell scope.

## Matrix

Reference: **6/6 PASS**.  
Defeat candidates: **6/6 killed on named law**.  
Each defeat candidate changes exactly one decision.  
Matrix: **LETHAL + DISCRIMINATING**.  
Freeze: **INTACT**.

## Consequence

The next implementation act is now tightly bounded: add one first-class test-execution authority field to the current W0.v2 authority schema and carry it through authorized-core snapshot and E1 permission projection. The legacy packet projection may then map that explicit field to `tests.run`.

This act does **not** authorize execution and does not change W0.v2, E1, Path A, or Desktop behavior.

## Standing

```text
EC1-R9 authority unity:        FROZEN
EC1-R10 test authority:        FROZEN
W0.v2 test authority today:    MISSING
E1 execute_checks today:       HARD-CODED FALSE
shell ⇒ tests inference:        FORBIDDEN
runtime projection wire:       BLOCKED
next act:                      minimal W0/E1 test-authority seam
```
