# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R22 — Host-Decision W4 Projection

**Date:** 2026-10-01  
**Parent:** EC1-R21 route-bound execution decision `9a920b0fb712`  
**Class:** pure W4 projection adaptation  
**Persistence/runtime wire:** NONE

## Purpose

Adapt the original EC1-R4 local-candidate projector to the actual converged authority path without fabricating an E1 provider execution grant.

The original grant-mode projector remains unchanged and testable. R22 adds a second pure export:

`projectHostDecidedLocalCandidateV1(...)`

It accepts an already `EXECUTING` W0/W2 envelope plus one durable VERIFIED Path A run whose effect was authorized by an EC1-R21 host decision.

## Authority and provenance

R22 requires and rechecks:

- W0 capability `local-native-candidate`;
- W2 lifecycle `EXECUTING`;
- Path A run state `VERIFIED`;
- exact EC1-R21 one-shot host decision;
- decision run id + Work id;
- exact decided packet digest;
- exact W2 authorized-core digest;
- exact current W3 route digest;
- exact active READY Qwen W3T transport binding;
- Qwen primary route identity (`QWEN / code_primary`);
- structured Path A packet/result/verification lineage.

No `grant` or `grant_id` is accepted or required by this path.

## Evidence truth

The immutable delegate result remains truthful:

`exit_code = 0`  
`test_results = not_run`

because the delegate did not run the structured verifier.

The later Path A runtime evidence independently carries:

- NPA1 + candidate-commit custody;
- `structured_verification_pending=true` at custody time;
- exact verifier-plan digest;
- structured inspection result `PASS`;
- final run-level `test_results=pass`;
- terminal run state `VERIFIED`.

R22 does not rewrite the delegate artifact to say tests ran earlier than they did.

## W4 projection

Existing W4 kinds only:

- Qwen `model_identity` from W3/W3T;
- primary coding `attempt` keyed from the EC1-R21 decision id;
- exact durable-result `artifact`;
- host execution-decision `artifact`;
- `diff`;
- `resulting_commit`;
- structured-inspection `test_result`;
- distinct deterministic-verification `attempt`;
- `verifier_result` with `mechanical_pass`.

Coding-attempt status is still derived by the canonical durable-result mapper. `exit_code=0` maps to `completed`; structured verifier standing remains separate evidence.

Stable identities derive from the host decision id, not from a provider grant.

## Proof

Combined projector proof: **14/14 PASS**.

Legacy EC1-R4 cases: **7/7 PASS**.  
Host-decision R22 cases: **7/7 PASS**.

R22 specifically proves:

- valid VERIFIED host-decided run projects with no grant fields;
- exact second projection converges with no duplicate records;
- wrong/incomplete EC1-R21 decision refuses;
- route or active Qwen transport drift refuses;
- non-VERIFIED run refuses;
- structured runtime PASS is mandatory;
- immutable delegate `not_run` result is accepted truthfully;
- verifier-plan splice is refused.

Regression wall:

- W4.v2: **23/23 PASS**;
- W5.v2 composition: **12 assertions + 24 falsifiers PASS**;
- EC1-R21 decision: **11/11 PASS**;
- EC1-R21 host flow: **9/9 PASS**;
- EC1-R20 routing: **6/6 PASS**.

## Boundary

This act does not read or write files, transition lifecycle, claim grants, invoke providers/models, run Git, run verification, mutate a canonical Work file, or wire projection into Path A.

## Standing

```text
EC1-R4 grant-mode projector:       PRESERVED
EC1-R22 host-decision projector:   IMPLEMENTED / PURE
provider grant fabrication:        NONE
route/Qwen provenance:             REQUIRED
immutable delegate result:         PRESERVED
structured verifier PASS:          REQUIRED
W4 persistence:                    NOT WIRED
runtime projection:                NOT WIRED
```

The next act may persist the projected envelope into the canonical Work Unit store only after a VERIFIED structured Path A run, using the current on-disk EXECUTING envelope as the comparison base. It must be idempotent and must refuse stale or conflicting W4 state.
