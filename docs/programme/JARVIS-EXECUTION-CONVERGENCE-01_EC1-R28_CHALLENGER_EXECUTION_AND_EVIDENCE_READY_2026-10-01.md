# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R28 — Challenger Execution and Evidence Ready

**Date:** 2026-10-01  
**Parent:** EC1-R27 read-only challenger E1 seam `9a959dfd7e10`  
**Class:** bounded execution/lifecycle witness  
**New executor:** NONE

## Finding

No new challenger executor was required.

The existing canonical E1 transaction already provides the correct sequence:

1. exact current preview;
2. explicit human one-shot grant;
3. final R4/R5A revalidation;
4. grant claim immediately before provider dispatch;
5. provider execution;
6. durable-result persistence;
7. grant settlement;
8. W4 attempt/artifact/test-result append.

R27's participant-scoped read-only authority makes that existing path lawful for `local-review-1` while leaving Qwen primary on the host-decision mutation path.

## Proof

`local-candidate-challenger-execution-r28-proof.mjs`: **5/5 PASS**.

Proves:

- a human-authorized GPT-OSS challenger executes through E1 and records a completed `independent_model_review` attempt;
- the execution grant is consumed after the attempt;
- challenger completion plus the existing local-candidate verifier evidence satisfies the unchanged canonical `EVIDENCE_READY` law;
- challenger execution remains held until an explicit human grant exists;
- Qwen primary cannot use the canonical E1 confirm path;
- no local-candidate-specific `EVIDENCE_READY` shortcut exists.

The real executor is unchanged. The proof uses the existing `executeCanonicalProvider` injection seam only to make provider execution hermetic while exercising the real grant, settlement, W4 and lifecycle transaction.

## Standing

```text
Qwen primary candidate:             HOST-DECIDED / VERIFIED / W4 RECORDED
GPT-OSS challenger:                 E1 HUMAN-GRANTED / COMPLETED / W4 RECORDED
structured verifier evidence:       PRESENT
all required route participants:    COMPLETED
canonical EVIDENCE_READY:           PASS
Qwen E1 bypass:                     REFUSED
challenger auto-authorization:      NONE
lifecycle special case:             NONE
```

The next act is an end-of-programme lifecycle/admission witness: prove that this converged Work can proceed through the existing human adjudication and closure semantics without any EC1-specific authority or lifecycle code. If that passes, no further execution-convergence mechanism should be introduced before production/runtime witnessing.
