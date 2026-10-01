# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R20 — Route Provenance Integration

**Date:** 2026-10-01  
**Parent:** EC1-R19 host-decided dispatch `717c7c012d3b`  
**Class:** bounded non-executing W3/W3T integration  
**Provider execution:** FORBIDDEN for local-candidate Works

## Finding

Existing W3/W3T can truthfully represent the cognitive provenance of the structured local-candidate path.

For `CODE_GROUNDED + local_only + local-native-candidate`, W3 produces:

- primary: QWEN / `code_primary` / required;
- challenger: GPT_OSS / `independent_local_challenger` / required;
- primary evidence policy: local worktree read-only.

This matches the R19 execution truth: the Qwen model is toolless/read-only and JARVIS owns mutation.

The required GPT-OSS challenger is a completion obligation, not evidence that the Qwen primary cannot execute or be recorded first.

## Change

Added `local-candidate-routing.js`.

For one AUTHORIZED local-candidate Work it may:

1. bind the existing canonical W3 route;
2. bind the governed W3T transport for every required participant;
3. supersede HOLD bindings to READY using the existing non-executing readiness mechanism;
4. stop with the Work in `ROUTED`.

Both governed local transports are existing substrate:

- QWEN → `qwen-local / qwen3-coder:30b / ollama-direct`;
- GPT_OSS → `gpt-oss-local / gpt-oss:20b / ollama-direct`.

No model/provider call occurs.

## Alternate-executor closure

Local-candidate Works now explicitly refuse the canonical E1 provider execution context with:

`LOCAL_CANDIDATE_USES_HOST_DECISION_PATH`

Therefore W3/W3T supplies provenance and readiness only. It cannot create an E1 provider grant or execute Qwen through the canonical provider path.

Actual effect execution remains exclusively:

`R19 host decision → Path A structured-v1`.

Ordinary canonical-v2 Works retain the E1 provider execution path unchanged.

## Proof

`local-candidate-routing-r20-proof.mjs`: **6/6 PASS**.

Proves:

- exact QWEN primary + GPT-OSS challenger route;
- both governed local transport bindings READY;
- idempotent preparation;
- lifecycle remains ROUTED with zero attempts/artifacts/model identities/verifiers;
- E1 preview and E1 one-shot authorization refuse local candidates and create no grant;
- ordinary canonical Work retains E1 behavior;
- canonical status again exposes the route gesture at AUTHORIZED;
- routing coordinator has no provider/model execution, grant, W4 append, or EXECUTING transition.

Regression wall:

- R19 MAIN composition: **8/8 PASS** (route assertion superseded explicitly by R20);
- canonical-v2 Desktop: **30/30 PASS**;
- E1 pure boundary: **15/15 PASS**;
- JOP-04 RB-6B host composition: **8/8 PASS**.

## Standing

```text
W3 local-candidate route:          INTEGRATED
QWEN primary provenance:           TRUTHFUL
GPT-OSS challenger obligation:     PRESERVED
W3T local bindings:                READY / NON-EXECUTING
local-candidate lifecycle:         ROUTED
E1 provider grant/execution:       REFUSED
R19 host decision execution:       SOLE EXECUTOR
W4 projection:                     NOT YET WIRED
```

The next act may extend the R19 host-decision binding to include route digest + exact QWEN transport binding, transition W2 ROUTED → EXECUTING only after the host decision is constituted, and then adapt EC1-R4 projection to use that decision as effect authority while retaining W3/W3T for model provenance. No canonical provider grant may be fabricated.
