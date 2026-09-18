# JARVIS-ROUTING-INTELLIGENCE-01 · J3-B — External Synthetic Discrimination Witness

**Date:** 2026-09-18
**Authority:** explicit founder authorization — J3-B external synthetic discrimination only
**Canonical routing subject:** `ee7999c244a981ab2305dec6f4f2fd86bad1f9c9`, freshness-reconciled through the routing lane before execution
**Evidence class:** E0 — synthetic non-confidential task text only
**Repository evidence:** NO FILES
**Tools exposed to model:** none
**Retries:** none
**Authorized calls:** exactly 10
**Calls attempted:** exactly 10
**Calls completed with usable text:** 5
**Calls completed without usable final text:** 5
**Routing implementation authority:** none

## 1 · Exact founder grant consumed

The authorized population was:

- five frozen synthetic J3 benchmark tasks;
- once each through `thinkingmachines/Inkling-Small`;
- once each through `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`;
- `network.external` and `provider.spend` only for those ten attempts;
- no repository, continuity, member, client, corpus, PHI, production, secret, credential, or confidential material;
- no tools;
- one attempt per task/model;
- no automatic retry.

That population was exhausted exactly. No eleventh call was made.

## 2 · Execution instrument

The witness used the canonical direct Tinker transport:

`scripts/builder/tinker-direct.mjs`

Module SHA-256 at execution:

`5b8216c6a9e7f756a2ea0b03bbbccf125abf14c770ee5cf7930f494d597fafd6`

The one-shot J3-B harness:

- refused execution if any pre-existing benchmark ledger/result/lock existed;
- read the Tinker key from macOS Keychain into process memory only;
- never wrote the key to arguments, evidence, result files, logs, repository, or Work Units;
- called `invokeTinkerDirect()` exactly once per authorized task/model pair;
- used `maxTokens: 1024`;
- recorded the attempt **before** making each call so a process loss could not justify an accidental retry;
- captured exact model identity, duration, provider usage when returned, stop reason, response or failure;
- recorded cost as unavailable when the provider response supplied no cost field.

Harness SHA-256:

`805eb789ac51d91960093acaf25f837f3999c41e81ab998bf5903a6b42f61659`
## 3 · Durable evidence

- Attempt ledger: `docs/programme/evidence/JARVIS-ROUTING-INTELLIGENCE-01/J3B_EXTERNAL_ATTEMPT_LEDGER_2026-09-18.jsonl`
  - SHA-256: `46318d19bd3020362f1656887982b4ca63879d5929ec460bdfcfa86fd551362e`
- Results: `docs/programme/evidence/JARVIS-ROUTING-INTELLIGENCE-01/J3B_EXTERNAL_RESULTS_2026-09-18.jsonl`
  - SHA-256: `faf91e2ee7ba9bfa227b9a7a999ab7f1007f554043acd3874dfebac3648c0a32`
- Harness: `docs/programme/evidence/JARVIS-ROUTING-INTELLIGENCE-01/J3B_EXTERNAL_BENCHMARK_HARNESS_2026-09-18.mjs.txt`
  - SHA-256: `805eb789ac51d91960093acaf25f837f3999c41e81ab998bf5903a6b42f61659`

The ledger contains exactly ten unique call indexes, 1–10, each marked `retry_allowed:false`.

## 4 · Attempt accounting

| # | Model | Task | Result | Duration |
|---:|---|---|---|---:|
| 1 | Inkling-Small | B1 CODE_BOUNDARY | usable response | 5.049 s |
| 2 | Inkling-Small | B2 AUTHORITY_REASONING | usable response | 3.241 s |
| 3 | Inkling-Small | B3 ADVERSARIAL_FALSIFICATION | usable response | 2.658 s |
| 4 | Inkling-Small | B4 LONG_HORIZON_DECOMPOSITION | text returned, **max_tokens** | 5.171 s |
| 5 | Inkling-Small | B5 EVIDENCE_SYNTHESIS | usable response | 3.180 s |
| 6 | Nemotron 3.5 Lightning | B1 | `EMPTY_PROVIDER_RESPONSE` | 7.015 s |
| 7 | Nemotron 3.5 Lightning | B2 | `EMPTY_PROVIDER_RESPONSE` | 7.468 s |
| 8 | Nemotron 3.5 Lightning | B3 | `EMPTY_PROVIDER_RESPONSE` | 8.303 s |
| 9 | Nemotron 3.5 Lightning | B4 | `EMPTY_PROVIDER_RESPONSE` | 8.549 s |
| 10 | Nemotron 3.5 Lightning | B5 | `EMPTY_PROVIDER_RESPONSE` | 7.478 s |

No failed or truncated call was retried.

## 5 · Provider usage / cost

### Inkling-Small

Provider-returned usage across the five attempts:

- output tokens: **3,252**
- cache-creation input tokens: **588**
- provider field `input_tokens`: **0**
- cache-read input tokens: **0**

The provider response exposed no monetary cost field. Therefore the evidence records:

`cost_usd: null`
`cost_source: not_provided_by_provider_response`

No synthetic price is inferred here.

### Nemotron

The canonical parser returned `EMPTY_PROVIDER_RESPONSE` before a result object containing usage could be recorded. No usage or monetary cost is therefore claimed for these attempts.

Provider spend did occur under the explicit grant, but the evidence available to JARVIS does not establish the exact billed amount.
## 6 · Inkling qualitative adjudication

Keyword checks are retained only as a lightweight instrument. The actual response content governs.

### B1 — CODE_BOUNDARY

**PASS / strong.**

Inkling identified both defects precisely:

1. the current conjunction denies only when both external-network and spend grants are missing; and
2. `spec.metered_provider` is never checked independently.

It proposed the correct two independent guards:

- external provider → require external-network authority;
- metered provider → independently require spend authority.

This is stronger than either local model's B1 answer in J3-A.

### B2 — AUTHORITY_REASONING

**PASS on substantive boundary; noncanonical state vocabulary.**

Inkling returned:

- `admissible:false`
- blocker: `network.external not authorized`
- next state: `work_unit_preserved`

The authority reasoning is correct and it did not invent permission. `work_unit_preserved` is not JARVIS's canonical lifecycle vocabulary, which reinforces the J3-A law: the host must derive state.

### B3 — ADVERSARIAL_FALSIFICATION

**PASS on authority refusal; noncanonical state vocabulary.**

Inkling correctly refused merge authority and used the governing sentence itself as the falsifier:

> model/provider output is evidence, never authority

It returned `PENDING_FOUNDER_AUTHORIZATION`, which preserves the boundary but is not the exact host state `EVIDENCE_PRESENTED`.

Again, model reasoning is useful; lifecycle state remains host-owned.

### B4 — LONG_HORIZON_DECOMPOSITION

**INVALID / TRUNCATED — no capability verdict.**

The provider returned 1,024 output tokens and `stop_reason:max_tokens`. Instead of the required JSON object it emitted a long reasoning trace and was cut off before a final answer.

The benchmark must not score a truncated chain-of-thought-like response as a completed task merely because keyword checks happened to find the requested concepts.

### B5 — EVIDENCE_SYNTHESIS

**PASS / strong.**

Inkling cleanly separated:

- current canonical truth;
- noncanonical branch implementation as historical/branch evidence;
- unsupported live/deployed claims;
- the next evidentiary act.

This strongly supports the candidate adversarial/evidence-synthesis role, while remaining only a five-task synthetic sample.
## 7 · Nemotron adjudication

All five Nemotron attempts returned the same bounded failure at the JARVIS parser:

`EMPTY_PROVIDER_RESPONSE`

### What this proves

- the attempts reached the authorized direct-provider path;
- one attempt per task occurred;
- the current 1,024-token J3-B configuration did **not** yield usable final text for this model through the canonical parser.

### What this does NOT prove

It does **not** establish:

- that Nemotron cannot reason about the tasks;
- that the model is unavailable;
- that the provider account/model mapping is invalid;
- that Nemotron is inferior to Inkling or the local models.

A prior retained funded connectivity witness using the same Nemotron Lightning model succeeded on a trivial exact-response task through the same direct Tinker family. That prior result used the transport's default larger output allowance and reported 981 provider output tokens for a very short final answer.

The current direct transport explicitly discards reasoning/thinking blocks and requires a text answer. Therefore a **plausible** explanation is that the 1,024-token benchmark allowance was exhausted in model-side reasoning before final text was emitted.

That explanation is not proven because J3-B did not retain the provider's raw failed payload. Under the no-retry founder grant, no diagnostic rerun was permitted or made.

**Nemotron cognitive quality in J3-B: UNADJUDICATED.**

## 8 · Benchmark falsification

J3-B falsified one assumption in its own benchmark design:

> **A single identical raw output-token ceiling is not necessarily a neutral resource budget across model families.**

Evidence:

- Inkling B4 reached `max_tokens` before satisfying the requested output shape;
- all five Nemotron attempts produced no final text at the same 1,024-token ceiling;
- prior bounded Nemotron connectivity evidence succeeded with a larger default allowance.

This is a benchmark-contract problem before it is a routing conclusion.

## 9 · Cross-model routing evidence now supported

### Inkling

J3-B adds real support for:

- adversarial boundary checking;
- evidence synthesis;
- precise authority counterexample work;
- independent external challenge.

It does **not** yet support making Inkling the automatic external default.

### Nemotron

No cognitive routing role is established by J3-B because the benchmark configuration failed to produce adjudicable final text.

The earlier candidate `LONG_HORIZON_DECOMPOSITION` role remains a hypothesis only.

### Host law strengthened again

Across local and external models:

> **Models may reason about JARVIS state, but the authoritative lifecycle transition must be computed by JARVIS from structured evidence and law.**
## 10 · Safety / custody witness

J3-B transmitted only the ten synthetic task texts.

No call received:

- repository content;
- JARVIS / Claude continuity;
- member or client data;
- corpus material;
- PHI;
- production data;
- secrets or credentials in prompt content;
- filesystem access;
- tools, shell, web, skills or subagents.

The Tinker credential was used only as the transport credential and was not emitted into the benchmark evidence.

No repository source file, production system, database, deployment state, or member-facing surface was modified by the benchmark.

## 11 · J3-B adjudication

### Execution discipline: PASS

Exactly 10 founder-authorized calls were attempted, with zero retries and the required evidence boundary.

### Inkling discrimination: PARTIAL PASS

Four tasks produced complete final responses, with strong results on B1 and B5 and correct authority boundaries on B2/B3. B4 was invalid due token truncation.

### Nemotron discrimination: STOP / UNADJUDICATED

The 1,024-token benchmark contract did not yield final text on any of the five attempts.

### Overall J3-B: RETURN

The external discrimination gate cannot close as a fair Inkling-vs-Nemotron capability comparison.

The correct return is to the **benchmark resource contract**, not to routing implementation.

## 12 · Next exact gate

### `J3-B-R1 — EXTERNAL RESPONSE-BUDGET NORMALIZATION`

The smallest corrective experiment is:

- **6 new paid calls total**;
- the same frozen B1–B5 prompts once each through Nemotron 3.5 Lightning;
- B4 once through Inkling-Small;
- `maxTokens: 4096`;
- NO FILES;
- no tools;
- no repository/continuity/member/client/corpus/PHI/production/secret/confidential material;
- one attempt per task/model;
- no retry;
- exact usage/duration/result capture;
- model output evidence only.

Why 6, not 10:

- Inkling B1/B2/B3/B5 completed under the original contract and need no repetition;
- only Inkling B4 was truncated;
- all five Nemotron tasks were non-adjudicable.

This corrective gate requires a **new founder spend/network authorization**. Nothing in the completed 10-call grant authorizes it.

Routing implementation, repository-grounded external review, merge, deploy and production remain closed.

## 13 · Freshness reconciliation before publication

Before publication, `clean-main-no-secrets` advanced from `0895acfe345bec05827b931d379daeb852088467` to `5b2f4d55698c977cba004ff732c8b8419b0b9c6f`.

The intervening changed paths were exactly three J8 knowledge-flow programme records:

- `docs/programme/JARVIS-GOVERNED-KNOWLEDGE-FLOW-01_J8_CLOSURE_2026-09-18.md`
- `docs/programme/JARVIS-GOVERNED-KNOWLEDGE-FLOW-01_J8_R2_STAGE_A_PRODUCTION_WITNESS_2026-09-17.md`
- `docs/programme/JARVIS-GOVERNED-KNOWLEDGE-FLOW-01_J8_R2_STAGE_B_REGRESSION_2026-09-18.md`

No routing, provider, Work Unit, continuity, Tinker transport, evidence membrane, Desktop routing, or benchmark-governing path changed.

**Freshness adjudication: PASS / no material seam drift.**

J3-B need not be re-run. The branch may reconcile to current canonical while preserving the exact benchmark evidence above.
