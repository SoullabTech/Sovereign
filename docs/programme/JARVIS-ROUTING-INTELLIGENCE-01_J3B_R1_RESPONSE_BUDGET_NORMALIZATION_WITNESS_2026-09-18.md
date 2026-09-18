# JARVIS-ROUTING-INTELLIGENCE-01 · J3-B-R1 — Response-Budget Normalization Witness

**Date:** 2026-09-18
**Authority:** explicit founder authorization — J3-B-R1 external response-budget normalization only
**Canonical Work Unit base:** `5b2f4d55698c977cba004ff732c8b8419b0b9c6f`
**Routing lane:** `chore/jarvis-routing-intelligence-01-discovery-20260918`
**Evidence class:** E0 — synthetic non-confidential task text only
**Repository evidence sent to models:** NO FILES
**Tools exposed to models:** none
**Retries:** none
**Authorized calls:** exactly 6
**Calls started:** exactly 6
**Calls finished:** exactly 6
**Routing implementation authority:** none

## 1 · Corrective question

J3-B used `maxTokens: 1024`.

Observed there:

- Inkling B4 returned text but terminated at `max_tokens` before a valid final answer;
- all five Nemotron tasks returned `EMPTY_PROVIDER_RESPONSE`;
- earlier bounded Nemotron connectivity evidence had already shown that the same model could produce a final answer through the direct Tinker family.

R1 therefore tests one bounded hypothesis:

> Was the 1,024-token response budget itself preventing an adjudicable final answer for these model/task combinations?

R1 changes **only** the response budget to 4,096 and reruns only the six previously non-adjudicable task/model pairs.

## 2 · Population

Exactly:

1. Nemotron B1 — CODE_BOUNDARY
2. Nemotron B2 — AUTHORITY_REASONING
3. Nemotron B3 — ADVERSARIAL_FALSIFICATION
4. Nemotron B4 — LONG_HORIZON_DECOMPOSITION
5. Nemotron B5 — EVIDENCE_SYNTHESIS
6. Inkling B4 — LONG_HORIZON_DECOMPOSITION

Models:

- `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`
- `thinkingmachines/Inkling-Small`

All six Work Units carried:

- `repo.read`
- `network.external`
- `provider.spend`

and explicitly denied repository writes, production read/write, deploy and authority change.

Each packet declared `max_attempts: 1`.

## 3 · Governed execution path

R1 deliberately used the existing canonical execution seam rather than introducing a diagnostic provider path:

```text
Work Unit
  ↓
opencode-provider authorize
  ↓
Keychain credential resolution after authority
  ↓
isolated read-only Builder worktree
  ↓
NO FILES external evidence bundle
  ↓
scripts/builder/tinker-direct.mjs
  ↓
provider response
  ↓
independent post-worker verification
  ↓
result contract
```

The direct Tinker CLI default is 4,096 output tokens when no explicit CLI override is supplied.

Tinker module SHA-256 at execution:

`5b8216c6a9e7f756a2ea0b03bbbccf125abf14c770ee5cf7930f494d597fafd6`
## 4 · Exact results

| Call | Model | Task | Provider result | Output tokens | Stop reason | Delegate duration |
|---:|---|---|---|---:|---|---:|
| 1 | Nemotron | B1 CODE_BOUNDARY | **no final text** / `EMPTY_PROVIDER_RESPONSE` | unavailable | unavailable | 26 s |
| 2 | Nemotron | B2 AUTHORITY_REASONING | usable final JSON | 2,209 | `end_turn` | 11 s |
| 3 | Nemotron | B3 ADVERSARIAL_FALSIFICATION | usable final JSON | 2,974 | `end_turn` | 16 s |
| 4 | Nemotron | B4 LONG_HORIZON_DECOMPOSITION | usable final JSON | 2,925 | `end_turn` | 15 s |
| 5 | Nemotron | B5 EVIDENCE_SYNTHESIS | usable final JSON | 2,633 | `end_turn` | 22 s |
| 6 | Inkling | B4 LONG_HORIZON_DECOMPOSITION | usable final JSON | 2,001 | `end_turn` | 10 s |

All six result contracts independently recorded:

- zero files changed;
- secret-isolation verification PASS;
- clean-worktree verification PASS;
- one provider attempt only.

## 5 · Normalization comparison against J3-B

### Nemotron

| Task | 1,024 tokens | 4,096 tokens | R1 interpretation |
|---|---|---|---|
| B1 | no final text | no final text | still unadjudicated |
| B2 | no final text | **usable at 2,209** | original budget was a material confound |
| B3 | no final text | **usable at 2,974** | original budget was a material confound |
| B4 | no final text | **usable at 2,925** | original budget was a material confound |
| B5 | no final text | **usable at 2,633** | original budget was a material confound |

This is strong causal evidence for B2–B5: each successful final answer required more than the original 1,024-token ceiling.

It does **not** explain B1. B1 remains a task/model/transport-output interaction requiring no further inference here.

### Inkling B4

At 1,024:

- text returned;
- `stop_reason:max_tokens`;
- no valid final JSON.

At 4,096:

- valid final JSON;
- 2,001 output tokens;
- `stop_reason:end_turn`.

**Normalization verdict: confirmed.**

The original 1,024 budget invalidated the B4 Inkling result.
## 6 · Qualitative Nemotron adjudication

### B1 — CODE_BOUNDARY

**UNADJUDICATED.**

The model again produced no final text through the canonical parser even at 4,096.

No cognitive-quality conclusion is allowed.

Routing consequence:

> Nemotron has no evidence-earned CODE_GROUNDED role from this programme.

### B2 — AUTHORITY_REASONING

Response:

- `admissible:false`
- blocker: `network.external_not_authorized`
- next state: `preserved`

**PASS on substantive authority reasoning.**

The model correctly refused to infer missing permission.

`preserved` is not canonical JARVIS lifecycle vocabulary, reinforcing host-owned state derivation.

### B3 — ADVERSARIAL_FALSIFICATION

Response correctly stated:

> Two-model agreement is model output, which is evidence, not authority.

and refused merge authorization.

**PASS on falsification / authority boundary.**

The returned `evidence_review` state is model-authored vocabulary, not authoritative JARVIS state.

### B4 — LONG_HORIZON_DECOMPOSITION

Response ordered:

```text
census
→ behavioral_contract
→ founder_ruling
→ implementation
→ verification
```

with:

- stop after founder ruling;
- forbidden shortcut: skip founder ruling.

**PASS / strong.**

This is direct internal evidence supporting Nemotron's candidate long-horizon / programme-decomposition role.

### B5 — EVIDENCE_SYNTHESIS

Response cleanly distinguished:

- feature absent from canonical;
- noncanonical branch implementation as branch/historical evidence;
- prohibited claim that feature is canonical, live or deployed.

**PASS / strong.**

This supports a candidate evidence-synthesis / independent architecture-review role.

## 7 · Inkling B4 adjudication

At 4,096, Inkling returned a complete JSON answer with:

- census first;
- behavioral contract;
- explicit halt for founder ruling;
- implementation only after approval;
- independent verification;
- no merge authority from verification alone.

**PASS / strong.**

The response added an unnecessary reference to prohibited Tinker CLI repository inspection. That extra language was not needed for the task, but it did not alter the sequencing answer or cross any actual execution boundary.

R1 therefore expands Inkling's evidence-backed profile beyond adversarial/evidence synthesis into long-horizon sequencing as well.
## 8 · Usage and cost accounting

Successful R1 provider responses returned:

- known output tokens: **12,742**
- cache-creation input tokens: **3,158**
- provider-reported `input_tokens`: **0**
- cache-read input tokens: **0**

Breakdown:

- Nemotron B2: 2,209 output
- Nemotron B3: 2,974 output
- Nemotron B4: 2,925 output
- Nemotron B5: 2,633 output
- Inkling B4: 2,001 output

Nemotron B1 produced no parsed usage object.

The provider responses exposed no monetary cost field.

Therefore:

`cost_usd: UNKNOWN / NOT PROVIDED BY RESPONSE`

No price is inferred from external tables in this witness.

## 9 · Custody evidence

Durable evidence directory:

`docs/programme/evidence/JARVIS-ROUTING-INTELLIGENCE-01/J3B_R1/`

Contents:

- 6 exact Work Unit packets;
- 6 result contracts;
- 6 provider logs;
- 6 independent verification logs;
- 6-start / 6-finish no-retry run ledger;
- SHA-256 manifest covering every evidence file.

The pre-commit evidence scan found no secret-like value.

No repository source file, database, production system, deployment state or member-facing surface changed during the benchmark.

## 10 · New integrity finding — RI-G11

### Delegate wrapper exit status is not provider attempt status

Observed on Nemotron B1:

- provider/result contract: `exit_code: 4`, recommendation `reject`;
- outer runner's shell invocation of `ain-delegate.sh tinker`: exit status 0.

The delegate writes the correct nonzero provider exit into the durable result contract, then finishes by printing the result, causing the wrapper process itself to return success.

Therefore:

> **Shell completion of `ain-delegate.sh` cannot be used as provider-attempt success.**

Current reconciliation can still detect the failure from the recorded result's numeric `exit_code`.

This finding is not repaired in R1.

Before routing implementation, the execution/status contract must ensure immediate caller status cannot contradict the durable attempt result.

## 11 · New integrity finding — RI-G12

### Model-neutral raw output-token ceilings are not model-neutral reasoning budgets

J3-B + R1 prove:

- Inkling B4 needs more than 1,024 tokens to finish under this transport;
- Nemotron B2–B5 need between roughly 2,200 and 3,000 returned provider tokens to reach final text;
- Nemotron B1 still does not reach final text at 4,096.

Therefore a future router must not encode:

> one arbitrary `maxTokens` value = equal reasoning opportunity across models.

Budget selection is part of the adapter/model profile and must be evidence-backed.

This does **not** authorize dynamic unlimited budgets.
## 12 · Capability map after J3-B-R1

This is the strongest evidence-supported map, not a ranking.

### Qwen3-Coder 30B — local

Supported:

- fast warm local review;
- code-grounded reasoning;
- independent local challenge.

Known limitation from J3-A:

- does not reliably emit exact JARVIS lifecycle states.

### GPT-OSS 20B — local

Supported:

- authority sequencing;
- architecture/evidence synthesis;
- independent local review.

Known limitation from J3-A:

- does not reliably emit exact JARVIS lifecycle states;
- needs the correct Ollama chat/reasoning adapter semantics.

### Inkling-Small — external

Supported:

- precise authority-boundary falsification;
- evidence synthesis;
- code-boundary challenge;
- long-horizon sequencing at an adequate response budget.

Known limitations:

- external / metered;
- 1,024-token B4 truncation;
- model-authored lifecycle labels remain non-authoritative.

### Nemotron 3.5 Lightning — external

Supported:

- authority reasoning;
- adversarial evidence-vs-authority challenge;
- long-horizon decomposition;
- canonical/noncanonical/live evidence synthesis.

Not supported:

- CODE_GROUNDED routing from this evidence set; B1 remains non-adjudicable.

Known limitation:

- high response-budget sensitivity under the direct Tinker seam.

## 13 · J3-B-R1 adjudication

### Execution discipline — PASS

Exactly six corrective calls, one per authorized pair, zero retries, no model file/tool access, no production/member data.

### Response-budget hypothesis — PASS, bounded

Confirmed for:

- Nemotron B2–B5;
- Inkling B4.

Not confirmed for:

- Nemotron B1.

### External synthetic discrimination — SUFFICIENT FOR J4

The programme now has enough bounded evidence to state:

- model-family strengths;
- explicit known failure modes;
- response-budget requirements;
- where independent model families add different evidence;
- where no capability claim is earned.

No further paid synthetic calls are required before routing-policy falsification.

## 14 · Next gate

### `J4 — ROUTING + REVIEW TOPOLOGY FALSIFICATION`

J4 should be **local/documentary only**.

No external model calls, provider spend, repository disclosure, routing implementation, merge, deploy or production mutation.

Its job is to try to break the candidate routing law with controlled mutants, including:

1. deterministic work wrongly routed to a model;
2. LOCAL_ONLY continuity routed externally;
3. Nemotron selected for CODE_GROUNDED despite no supporting evidence;
4. same-model retry counted as an independent second review;
5. external model family silently substituted because preferred transport is unavailable;
6. external repository review admitted without a distinct disclosure grant;
7. model agreement treated as authority;
8. delegate wrapper success treated as provider-attempt success;
9. fixed output-token ceiling treated as model-neutral;
10. model-authored lifecycle state allowed to advance a Work Unit.

J4 PASS would open the founder adjudication gate for the routing law itself.

R1 authorizes none of that implementation.
