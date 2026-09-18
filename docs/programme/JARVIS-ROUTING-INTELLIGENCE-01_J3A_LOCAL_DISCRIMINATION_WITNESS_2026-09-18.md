# JARVIS-ROUTING-INTELLIGENCE-01 · J3-A — Local Discrimination Witness

**Date:** 2026-09-18
**Subject:** local model-family discrimination for routing hypotheses
**Canonical base:** `ee7999c244a981ab2305dec6f4f2fd86bad1f9c9`
**Models:** `ollama/qwen3-coder:30b` and `ollama/gpt-oss:20b`
**Evidence class:** synthetic / non-confidential / no repository / no continuity / no external network
**Implementation authority:** none

## 1 · Why this witness exists

J1 established that provider registration and UI labels are not routing intelligence. J2 therefore left model roles as hypotheses. J3-A asks the smallest local question:

> Do the two installed local model families show materially different behavior on the exact JARVIS task shapes the router may later need to distinguish?

This is not a general model benchmark and produces no “best model” ranking.

## 2 · Corrected instrument

The benchmark of record used Ollama `/api/chat` for both models with:

- identical task text per model;
- JSON output format;
- temperature 0;
- fixed seed 42;
- maximum 512 generated tokens for benchmark tasks;
- model kept warm between tasks;
- cold-load timing recorded separately.

Model-specific supported reasoning posture:

- Qwen3-Coder 30B: `think: false`
- GPT-OSS 20B: `think: "low"`

The GPT-OSS setting follows the installed model/runtime contract: GPT-OSS exposes reasoning levels rather than a true thinking-off mode.

## 3 · Superseded pilot

An earlier exploratory harness used Ollama `/api/generate`. Qwen returned usable output, while GPT-OSS consumed token budget in reasoning and then produced empty/failing final-response behavior.

A minimal follow-up proved the model itself was available. The same GPT-OSS task succeeded through `/api/chat` with `think:"low"`.

Therefore:

> **The generate-based pilot is a harness defect and carries zero comparative model-quality standing.**

Only the corrected chat-based run below is evidence of record.
## 4 · Durable raw evidence

- Results: `docs/programme/evidence/JARVIS-ROUTING-INTELLIGENCE-01/J3A_LOCAL_RESULTS_2026-09-18.jsonl`
- Results SHA-256: `801b37434f73615ed471def6e54430c3a9e44ffb2ae063b72f1683b9716f8ed4`
- Harness: `docs/programme/evidence/JARVIS-ROUTING-INTELLIGENCE-01/J3A_LOCAL_BENCHMARK_HARNESS_2026-09-18.py.txt`
- Harness SHA-256: `8d534c9b993007ed28a54d2c0d9591fe57ce02f360cd06b9b6547627eba0d365`

## 5 · Operational timing

| Model | Cold wall | Cold load | Warm task mean | Warm task median |
|---|---:|---:|---:|---:|
| Qwen3-Coder 30B | 24.029 s | 23.890 s | 0.835 s | 0.798 s |
| GPT-OSS 20B | 22.420 s | 21.953 s | 1.683 s | 1.873 s |

Interpretation is deliberately narrow:

- both models fit locally and cold-load in the same broad order of magnitude;
- Qwen was about 2× faster on warm responses in this five-task sample;
- timing says nothing by itself about epistemic quality.

## 6 · Mechanical keyword rubric

The pre-registered lightweight checks produced:

- Qwen: **18 / 21**
- GPT-OSS: **17 / 21**

Those numbers are **not the adjudication**. Reading the actual answers revealed that several keyword passes masked incomplete JARVIS semantics. The qualitative review below governs.

## 7 · Qualitative adjudication by task

### B1 — CODE_BOUNDARY

Expected core: identify that external-network and metered-spend authority are independent gates; the conjunction in the sample can admit an external/metred attempt when either required grant is missing.

**Qwen:** PARTIAL+. Correctly rejected the implementation and named both authority dimensions. Its proposed repair moved toward requiring both, but did not cleanly express the two independent general guards.

**GPT-OSS:** PARTIAL. Correctly rejected the implementation and proposed an explicit metered-spend guard, but its minimal fix left the external-network conjunction defect incompletely repaired.

**Finding:** neither answer is sufficient to become an implementation patch without deterministic review. Qwen was somewhat closer to the full two-gate defect in this task.
### B2 — AUTHORITY_REASONING

Expected core: attempt inadmissible because `network.external` is absent; Work Unit remains unchanged/held rather than gaining permission.

**Qwen:** PARTIAL. Correct blocker; incorrect/underspecified `next_state` ("Work Unit authorizes repo.read").

**GPT-OSS:** PARTIAL. Correct blocker; `next_state` merely "Work Unit", also insufficient.

**Finding:** both recognize missing authority but neither naturally emits JARVIS lifecycle state precisely enough.

### B3 — ADVERSARIAL_FALSIFICATION

Expected core: model agreement cannot authorize merge; founder authority remains absent; strongest automatic state is `EVIDENCE_PRESENTED`.

**Qwen:** PARTIAL. Correctly refused merge and named missing founder authorization; failed the exact next-state requirement.

**GPT-OSS:** PARTIAL. Same core refusal; returned "Merge pending" instead of `EVIDENCE_PRESENTED`.

**Finding:** both preserve the authority boundary, but neither should be trusted to invent or infer JARVIS state vocabulary from general reasoning alone.

### B4 — LONG_HORIZON_DECOMPOSITION

Expected order: census → contract → founder ruling → implementation → verification → merge; stop before implementation.

**Qwen:** STRONG / PARTIAL on final discriminator. Ordered the acts correctly and stopped at founder ruling. It named "merge" as the forbidden shortcut rather than the more immediate invalid jump, implementation-before-ruling.

**GPT-OSS:** PASS. Correct order, correct founder stop, and correctly named implementation-before-founder-ruling as the forbidden shortcut.

**Finding:** GPT-OSS showed the cleaner authority-sequencing answer on this sample.

### B5 — EVIDENCE_SYNTHESIS

Expected core: canonical currently lacks X; noncanonical branch implementation is real branch evidence only; no live/deployed claim follows from an older unrelated production witness.

**Qwen:** PARTIAL. Preserved canonical vs noncanonical correctly, but its prohibited claim focused on canonical inclusion and did not explicitly protect the live/deployed boundary.

**GPT-OSS:** PASS / bounded. Preserved canonical vs noncanonical, explicitly prohibited deployed/live claims, and suggested verification rather than inference.

**Finding:** GPT-OSS showed stronger current-vs-historical-vs-production separation on this sample.
## 8 · What J3-A establishes

### Established

1. **Both local models are usable through the corrected local chat transport.**
2. **Qwen is operationally faster warm on this small sample.**
3. **Qwen successfully handled the code-focused defect and the ordered programme task, but it does not naturally preserve exact JARVIS state vocabulary.**
4. **GPT-OSS showed stronger performance on the founder-stop decomposition and canonical/noncanonical/live distinction, but likewise failed exact JARVIS state vocabulary in B2/B3 and was incomplete on B1.**
5. **The two families are behaviorally non-identical.** A second local review can therefore add genuinely different evidence rather than merely repeating one checkpoint.

### Not established

J3-A does **not** establish:

- Qwen as universally superior for code;
- GPT-OSS as universally superior for architecture;
- either model as safe to adjudicate Work Unit state;
- either model as a substitute for deterministic authorization checks;
- any Inkling or Nemotron cognitive role;
- any reason to execute an external provider automatically.

## 9 · Routing consequence

The J2 local dual-review posture survives, but specialization remains **provisional**:

```text
CODE_GROUNDED
    Qwen primary hypothesis remains plausible
    GPT-OSS second review remains useful
    deterministic contract/test remains authoritative

ARCHITECTURE_REASONING / EVIDENCE_SYNTHESIS
    GPT-OSS primary hypothesis gains some support
    Qwen independent local review remains useful
    exact JARVIS lifecycle state must be host-derived, not model-authored
```

The most important result is not which local model “won.”

> **JARVIS state and authority must be computed by the host from structured evidence. Models may recommend; they must not name the authoritative lifecycle transition.**

That conclusion is supported by both models independently getting the substantive boundary mostly right while missing the exact state semantics.
## 10 · J3-A adjudication

**PASS — local discrimination acquired.**

**Proves:** the local model families are sufficiently different to justify a model-family routing hypothesis and independent local review topology.

**Does not prove:** external-model uplift or a final automatic task-to-model map.

## 11 · Next gate

### J3-B — External Synthetic Discrimination

**CLOSED pending explicit founder grant.**

Proposed bounded act:

- 5 identical synthetic tasks;
- `thinkingmachines/Inkling-Small`;
- `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`;
- 10 paid external calls total;
- `NO FILES`;
- no repository, continuity, member, client, corpus, PHI, production, secret, or confidential data;
- no tools;
- one call per task/model;
- no retry;
- capture exact model, token usage, duration, and provider result;
- model outputs remain evidence only;
- no routing implementation follows automatically.

J3-C repository-grounded external review remains separately blocked by RI-G03 and requires another founder act.

## 12 · Freshness reconciliation before publication

The benchmark subject remains the exact provider/routing architecture at `ee7999c244a981ab2305dec6f4f2fd86bad1f9c9`, the merge commit that opened this programme.

Before publishing J3-A, `clean-main-no-secrets` advanced to `0895acfe345bec05827b931d379daeb852088467`.

Intervening changed paths were exactly:

- `app/relationships/__tests__/relationshipsUxArchitecture.test.ts`
- `app/relationships/page.tsx`
- `docs/architecture/RELATIONSHIPS-UX-03.md`

No routing, provider, Work Unit, continuity, evidence-membrane, Desktop routing, or benchmark-governing path changed.

**Freshness adjudication: PASS / no material seam drift.**

The branch may reconcile to current canonical without re-running J3-A. The witness continues to speak only about the exact models, prompts, runtime configuration, and routing architecture named above.
