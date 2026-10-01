# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R4 — Shadow W4 Projection

**Date:** 2026-09-30  
**Parent:** EC1-R3 freeze `c2c70ac25a17`  
**Class:** bounded implementation · shadow only  
**Runtime cutover:** NONE

## Purpose

Project an already-proven legacy local-native candidate effect into the existing W4.v2 evidence vocabulary without re-executing, re-validating, widening authority, transitioning lifecycle, or mutating execution grants.

The projector is deliberately pure. It accepts:

- an already `EXECUTING` W0/W2 v2 envelope;
- a CLAIMED grant identity already associated with the Work;
- a READY `qwen-local / qwen3-coder:30b / ollama-direct` transport binding;
- the existing legacy durable result;
- a successful `validateNativePatchResult()` custody proof.

It emits only a new immutable envelope value.
## Existing W4 records used

No schema was added. The projector composes:

- `model_identity`;
- coding `attempt`;
- durable-result `artifact`;
- `diff`;
- `resulting_commit`;
- coding `test_result`;
- distinct `deterministic_verification` attempt;
- `verifier_result`.

Stable record identities are derived from the execution grant. Re-projecting byte-equivalent evidence returns `CONVERGED` and appends nothing.

## Admission checks

Projection refuses before W4 mutation when any of these disagree:

- Work identity ↔ grant Work identity;
- grant identity ↔ projected attempt;
- W0 authorized base ↔ durable-result starting SHA ↔ verified candidate parent;
- durable-result ending SHA ↔ verified candidate commit;
- NPA1 patch digest ↔ verified patch digest;
- NPA1 changed paths ↔ durable result paths ↔ verified Git paths;
- NPA1 is not `PATCH_APPLIED`;
- local Qwen binding is missing/not READY;
- lifecycle is not `EXECUTING`;
- local-native result is not passing.
## Proof

`scripts/builder/__tests__/local-native-candidate-projection-v1-proof.mjs`

- **7/7 PASS** — projection, convergence, identity refusal, evidence mismatch refusal, NPA1/custody requirement, lifecycle/binding requirement, and structural no-effects guard.
- Existing W4.v2 proof: **23/23 PASS**.
- Existing W5.v2 composition: **12 composition assertions + 24 falsifiers PASS**.
- Frozen EC1-R3 matrix: **12/12 reference PASS · 13/13 defeat candidates killed · LETHAL + DISCRIMINATING**.
- EC1-R3 freeze: **INTACT**.

## Boundary

This act does **not** wire the projector into:

- `runWorkUnit()`;
- `executeRun()`;
- `ain-delegate.sh`;
- Desktop IPC;
- provider execution;
- O5 recovery;
- W2 lifecycle;
- grant mutation.

The structural proof rejects effect-bearing imports/calls in the projector.

## Standing

```text
EC1-R3 constitution:          FROZEN / INTACT
EC1-R4 projector:             IMPLEMENTED
Projection mode:              SHADOW ONLY
New W4 schema:                NO
Runtime execution cutover:    NO
Legacy Path A behavior:       UNCHANGED
Shadow proof:                 7/7 PASS
Existing W4/W5 regressions:   GREEN
EC1-R5 runtime shadow wire:   NOT OPENED
```

The next act, if opened, is a **shadow runtime wire** that invokes this projector only after the existing Path A custody verifier succeeds, then compares legacy result truth with projected W4 truth. It must not make W4 authoritative yet.
