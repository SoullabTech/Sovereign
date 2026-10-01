# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R11 — Effect-Boundary Return

**Date:** 2026-10-01  
**Parent:** EC1-R10 test-execution authority `bd3cae10d0fd`  
**Class:** implementation attempt returned by existing constitutional boundary  
**Runtime changes:** NONE

## Attempted seam

R11 opened as the smallest implementation suggested by EC1-R10:

- add first-class `test_execution` to W0.v2;
- carry it through W2 authorized-core custody;
- project it into E1 as `tests.run` / `execute_checks`.

The implementation was attempted only in the working tree and was **not committed**.

## Falsifier found by the real substrate

The focused R11 proof reached E1 and was refused before authorization preview with:

`READ_ONLY_EXECUTION_MEMBRANE_REQUIRED`

Reason: R4/E1 canonical provider execution is intentionally review-only and refuses W0 authority containing `repo.write:worktree`.

Therefore making E1 carry local-candidate mutation authority would violate an existing constitutional boundary rather than complete convergence.

The uncommitted runtime/schema edits were reverted in full.

## Cross-programme census

JOP-04 already owns the missing effect-bearing execution question.

Current evidence:

- O0 classifies `worktree.write` and `verify.run` as separate orchestration acts;
- the deterministic `CAPABILITIES` registry remains read-only;
- `runCapability` still carries no authority object;
- JOP-04's Registration Boundary forbids effect-bearing capabilities while registration/routing/execution remain coupled;
- current code contains no effect contract in `CAPABILITIES` and no admitted effect-bearing invocation seam;
- JOP-04 later records explicitly keep effect-bearing implementation blocked.

Thus EC1 may not introduce a bespoke worktree-write executor without duplicating or bypassing JOP-04 jurisdiction.

## Ruling

> Provider cognition remains read-only. The JARVIS candidate mutation is a distinct effect-bearing orchestration act and must execute through an authority-bearing effect seam that satisfies JOP-04, not through E1 provider execution.

Consequences:

- EC1-R4 shadow projector remains valid as a pure evidence projector;
- EC1-R9 authority-unity law remains valid;
- EC1-R10 test-execution distinction remains valid;
- E1 must not be widened into repository mutation;
- no effect-bearing capability is added by EC1;
- no parallel authority store, grant type, or executor is admitted.

## Standing

```text
EC1-R11 implementation attempt:   RETURNED / REVERTED
E1 read-only membrane:             PRESERVED
JOP-04 effect embargo:             STILL LOAD-BEARING
Local-candidate effect executor:   NOT YET CANONICAL
Runtime shadow projection:         BLOCKED
Required next act:                 cross-programme JOP-04 effect-seam reconciliation
```
