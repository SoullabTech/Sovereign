# JARVIS-ROUTING-INTELLIGENCE-01 · J5.v1 — Reconciled Route Contract

**Date:** 2026-09-18
**Status:** implementation contract under founder-ratified J5 law
**Repair base:** `7937fc7cf1b0aede76b4e5302e36800c85f997da`
**Reviewed donor:** `b42dc0d4c0d47c37f60a66bc06c52b4927118b84`
**Route version:** `J5.v1`

This contract succeeds the parallel R1 route contract only where that contract conflicts with the later founder-ratified J5 constitution. It does not erase or rewrite the historical R1 records.

## 1 · Governing precedence

The governing order for this reconciliation is:

1. `JARVIS-ROUTING-INTELLIGENCE-01 / J5` founder ruling;
2. J3/J4 evidence supporting model eligibility, review topology, and response-budget profiles;
3. compatible `R1-NEMOTRON-01` founder adjudication;
4. canonical R3 implementation mechanics where they do not conflict with J5.

The router selects capability and evidence posture. It never creates authority.

## 2 · R1 clauses explicitly superseded

The following R1 policy choices are superseded by J5:

- `single_mechanical` completion after one Qwen review;
- provider-id-first cognitive selection;
- omission of E0–E4 evidence custody as a first-class route input;
- any implication that route-level disclosure requirements alone satisfy lower execution authority;
- omission of bounded model/adapter response-budget provenance.

The following R1/R3 mechanics are retained:

- import-free deterministic route logic;
- immutable/versioned route records;
- typed blockers and reason codes;
- `required_authority` with `granted_authority: []`;
- exact external evidence bundle semantics;
- Nemotron Zen manual/text-only posture;
- MAIN-computed route preview;
- persisted route record;
- `provider_strategy: []` on route-bound Work Units;
- `execution_connected:false`;
- route-bound execution refusal;
- stale preview protection.## 3 · Pure cognitive route inputs

The pure router consumes only trusted structured facts:

```text
deterministic:
  capability: string | null
  registered: boolean

evidence_class:
  E0_TASK_TEXT
  E1_REPOSITORY_LOCAL
  E2_CONTINUITY_LOCAL
  E3_EXTERNAL_REPO_BUNDLE
  E4_SENSITIVE_OR_PRODUCTION

task_shape:
  CODE_GROUNDED
  ARCHITECTURE_REASONING
  ADVERSARIAL_FALSIFICATION
  LONG_HORIZON_DECOMPOSITION
  EVIDENCE_SYNTHESIS
  FRONTIER_UNKNOWN

review_pressure:
  ordinary
  high_value_uncertain

challenge_mode:
  none
  adversarial
  frontier

frontier_posture:
  none
  text_only_manual
  repository_grounded
```

Ambient credentials, Keychain state, provider health, network availability, model output, conversation memory, member data, and production data cannot change cognitive family selection.

## 4 · Deterministic first

A trusted host fact that an exact registered deterministic capability applies terminates model-family routing.

The pure route record names the deterministic capability and selects no model family.

MAIN derives this fact from the canonical deterministic registry. The pure router itself remains import-free.

## 5 · Evidence custody

### E0

Task text only.

### E1

Repository-local evidence held within the local read-only Work Unit context.

### E2

LOCAL_ONLY continuity or development-memory evidence.

E2 may be used locally but may never cross an external membrane under this programme.

### E3

Exact bounded repository evidence admitted for an external crossing.

An E1 external crossing becomes E3.

### E4

Sensitive / production material.

E4 is outside this programme's external routing authority and fails closed.## 6 · Evidence-backed model-family topology

### CODE_GROUNDED

```text
primary:     QWEN
independent: GPT_OSS
```

Inkling may be an explicit external challenger.

Nemotron has no CODE_GROUNDED standing from J3 evidence.

### ARCHITECTURE_REASONING

```text
primary:     GPT_OSS
independent: QWEN
```

Nemotron may be an explicit frontier challenger.

### EVIDENCE_SYNTHESIS

```text
primary:     GPT_OSS
independent: QWEN
```

Inkling and Nemotron may be explicit external challengers.

### ADVERSARIAL_FALSIFICATION

No automatic local primary is invented by J5.v1.

An explicit adversarial challenge may select Inkling when evidence and authority posture are admissible.

### LONG_HORIZON_DECOMPOSITION

No automatic local primary is invented by J5.v1.

An explicit frontier challenge may select Nemotron when evidence and authority posture are admissible.

### FRONTIER_UNKNOWN

No automatic route. HOLD/refuse until a bounded task shape is resolved.

## 7 · Independent review law

A retry is not an independent second opinion.

For routed local work:

- Qwen + Qwen does not satisfy the review topology;
- GPT-OSS + GPT-OSS does not satisfy the review topology;
- Qwen + GPT-OSS may present independent local evidence;
- a qualifying deterministic falsifier may form another independent dimension.

No `single_mechanical` fast path exists in J5.v1.## 8 · Family before transport

The cognitive route record names model families, not provider ids.

Provider/transport resolution is a later pure step.

Examples:

```text
QWEN      → qwen-local
GPT_OSS   → gpt-oss-local
INKLING   → inkling-tinker
NEMOTRON  → nemotron-tinker
NEMOTRON + text_only_manual → nemotron-zen
```

If the preferred admissible transport is unavailable:

`HOLD`

The transport resolver may not silently substitute a different model family.

Nemotron NVIDIA remains outside automatic routing under the preserved R1-NEMOTRON-01 posture.

## 9 · External authority

External route evidence may name required authority but grants none.

Repository-grounded metered external review requires:

- `network.external`;
- `provider.spend`;
- `repository_external_disclosure`.

The route record always carries:

`granted_authority: []`

The lower Work Unit/provider seam separately requires:

`repo.disclose:external-readonly`

for E3 repository material.

Manual provider mode is subject to the same lower grant.

## 10 · Response-budget provenance

J5.v1 retains the J3-B-R1 bounded profiles:

- Inkling Tinker: 4096 maximum output tokens, no auto-expand;
- Nemotron Tinker: 4096 maximum output tokens, no auto-expand;
- Qwen local: adapter-managed bounded profile;
- GPT-OSS local: adapter-managed bounded profile with low-reasoning posture metadata.

A budget profile is evidence/provenance. It is not authority.## 11 · Route record

The immutable J5.v1 route record includes:

- `route_version`;
- `governing_law`;
- deterministic selection fact;
- `evidence_class`;
- `task_shape`;
- review pressure;
- challenge mode / frontier posture;
- primary model family;
- challenger model families;
- review dimensions;
- evidence policy;
- required authority;
- `granted_authority: []`;
- response-budget profile ids;
- execution disposition;
- `execution_authorized:false`;
- typed blockers;
- routing reason codes.

MAIN may add a separately computed `transport_resolution` produced from host-supplied provider readiness.

Transport readiness may HOLD the route but may not rewrite the cognitive family selection.

## 12 · R3 binding

The reconciled route keeps canonical R3's stronger binding membrane:

1. renderer submits intent fields, never a route record;
2. MAIN constructs trusted routing input;
3. MAIN computes the pure J5.v1 route;
4. MAIN separately resolves transport readiness;
5. exact route record is persisted to the Work Unit;
6. route-bound Work Unit has `provider_strategy: []`;
7. `routing_intelligence.execution_connected:false`;
8. routed UI hides Run Strategy;
9. MAIN refuses `run-provider`;
10. lower provider controller independently refuses route-bound execution.

R3 therefore remains preview/persistence only.

Explicit execution is a later gate.

## 13 · Durable host standing

Provider/model output is evidence only.

Lifecycle state is derived from structured durable result data.

Any result with:

- non-zero numeric `exit_code`;
- `test_results = fail`; or
- `recommended_next_action = reject`

is a failed/repair state.

Wrapper process success cannot override the durable provider result.

Model-authored strings such as MERGED, DEPLOYED, RATIFIED, or COMPLETE have no state-changing effect.

## 14 · Standing

This contract governs the reconciliation repair candidate only.

It authorizes no external call, spend, merge, deploy, production mutation, schema change, or member-facing MAIA change.

A repaired exact head must pass the union proof population before any PR action.
