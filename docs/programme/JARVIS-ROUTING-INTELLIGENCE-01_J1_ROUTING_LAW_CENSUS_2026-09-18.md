# JARVIS-ROUTING-INTELLIGENCE-01 · J1 — Routing-Law Census

**Date:** 2026-09-18
**Mode:** DISCOVER / read-only
**Canonical subject:** `ee7999c244a981ab2305dec6f4f2fd86bad1f9c9`
**Implementation authorization:** none

## 1 · Census question

> What does current JARVIS actually know how to route, what evidence can each provider path actually see, what standing can provider outputs acquire, and what remains unproven before model choice may become intelligent?

## 2 · F1 — the current router is not a model router

### Observed fact

`scripts/builder/router.mjs` implements only:

```text
registered deterministic capability → C0
bounded_for_local + <= 4000 chars → C1
otherwise → C3
```

It deliberately does not inspect task prose or classify cognitive task type. Its header still records the historical state “no C2 lane exists” and names no Qwen/GPT-OSS/Inkling/Nemotron selection rule.

### Interpretation

The current router answers **cost/locality posture**, not “which intelligence should do this work?”

### Consequence

Adding provider IDs to this function without a new routing contract would conflate two different decisions.

## 3 · F2 — provider registration is admissibility, not cognitive fit

### Observed fact

`scripts/builder/opencode-provider.mjs` records:

- model allowlist;
- external-network requirement;
- metered-provider status;
- credential requirement;
- current standing;
- execution adapter.

Its resolver checks Work Unit permission and provider availability. It contains no task-fit scoring, cognitive-role model, confidence comparison, benchmark score, or second-review policy.

### Interpretation

Provider resolution may say **“this attempt is allowed.”** It cannot say **“this is the right intelligence for this task.”**
## 4 · F3 — current Desktop strategy is manual dual-local review

### Observed fact

The merged Work Unit composer currently presents:

- Qwen3 Coder 30B — checked by default — “local coding review”;
- GPT-OSS 20B — checked by default — “local reasoning review”;
- Nemotron — unchecked — external review;
- Inkling — unchecked — external adversarial review.

Those labels are presentation semantics. The founder still selects providers manually; no task classifier chooses among them.

### Interpretation

Current behavior is a **provider checklist**, not routing intelligence.

### Consequence

The existing labels are useful routing hypotheses but cannot become automatic law without discrimination evidence.

## 5 · F4 — current reconciliation requires multiple attempts but not independent intelligence

### Observed fact

`reconcileAttempts()` returns:

- zero attempts → `NOT_RUN`;
- one clean attempt → `SECOND_REVIEW_OWED`;
- any failed/rejected/non-zero attempt → `REPAIR_BEFORE_WITNESS`;
- structured disagreement → `REVIEW_DISAGREEMENT` / Kelly required;
- two or more clean attempts → `EVIDENCE_PRESENTED`, still requiring founder semantic judgment.

It counts **attempts**, not distinct model families.

### Interpretation

Two runs from the same model/checkpoint can currently satisfy the numerical “multiple attempts” condition.

### Consequence

A routing law needs an explicit definition of **independent second review**. Retry count and epistemic independence are not the same thing.

## 6 · F5 — evidence visibility differs materially by transport

### Local OpenCode providers — Qwen / GPT-OSS

Current governed OpenCode review:

- runs locally;
- receives an isolated repository worktree;
- has read/glob/grep/list/LSP capability;
- denies edit, shell, web, subagents, skills, and external-directory access;
- is governed by the Work Unit's `repo.read` authority.

The prompt carries `allowed_files`, but the OpenCode read permission is repository-scoped rather than a file-system enforcement of that list.

### Direct Tinker — Inkling and Tinker-hosted Nemotron

External direct Tinker receives:

- Work Unit task/prompt;
- a JARVIS-constructed bundle from exact `allowed_files`;
- maximum 12 files;
- maximum 128 KiB per file;
- maximum 512 KiB total;
- no filesystem, shell, web, skills, subagents, or tools.

Secret-bearing paths, traversal, globs, symlinks, directories and binary files are refused.
### Nemotron Zen interactive path

The current C3/Zen path is manual/interactive. The existing operator contract says task text only; repository and continuity material are not attached. Automated JARVIS delegation for `nemotron-zen` fails closed as `PROVIDER_AUTOMATION_UNSUPPORTED`.

### Continuity

JARVIS continuity is LOCAL_ONLY by default. Current continuity records explicitly refuse external bundling absent separate external eligibility. Model selection does not create that eligibility.

### Interpretation

“What evidence may this model see?” is not a model property. It is a **transport + Work Unit authority + evidence-class** decision.

## 7 · F6 — model family and provider transport are currently entangled

### Observed fact

The registry contains several Nemotron transports:

- `nemotron-zen` — external, free, interactive-only under current restriction;
- `nemotron-nvidia` — external, metered, automated candidate;
- `nemotron-tinker` — external, metered, direct-Tinker automated candidate.

But the Desktop Work Unit provider list exposes `nemotron-zen`, while the automatic run controller cannot delegate that provider. `nemotron-tinker` is registered but is not in the current Work Unit composer provider list.

### Interpretation

“Choose Nemotron” and “choose the transport by which Nemotron runs” must be separate routing acts.

### Consequence

Provider availability must not become the cognitive routing policy.

## 8 · F7 — paid direct-provider evidence proves connectivity, not quality

### Retained noncanonical witness

The retained bounded funded-retest workspace contains two successful exact-response calls:

| Model | Result | Duration | Files/tools |
|---|---|---:|---|
| `thinkingmachines/Inkling-Small` | exact `INKLING_DIRECT_FUNDED_OK` | 5 s | none |
| `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` | exact `NEMOTRON_TINKER_DIRECT_OK` | 18 s | none |

Both recorded exit code 0, no file changes, no secret leakage and one attempt only.

### Evidence classification

These artifacts are **real local retained witness evidence but not current canonical programme records**.

They prove:

- account funding worked at that time;
- exact model IDs were reachable through the direct Tinker seam;
- response-contract and credential containment succeeded.

They do **not** prove:

- coding quality;
- architecture reasoning quality;
- adversarial-review quality;
- long-context fidelity;
- which model should be primary or secondary.
## 9 · F8 — repository-disclosure intent is recorded but not independently enforced by provider resolution

### Observed fact

The Desktop Work Unit authoring layer requires a founder checkbox for external repository review and writes:

`disclosure.repository_read_only_external = true`

However:

- `derivePermissionEnvelope()` carries `network.external` and `provider.spend`, not a distinct repository-disclosure act;
- `resolveOpenCodeProvider()` checks `external_network` and spend/credential conditions;
- current code search found the disclosure field itself consumed only by the authoring layer.

Direct Tinker still restricts actual transmitted repository material through exact `allowed_files`, which is an important containment layer.

### Interpretation

The UI has a stronger **declared disclosure distinction** than the provider authority resolver currently enforces as an independent permission dimension.

### Consequence

Automatic external routing must not be implemented until the intended disclosure authority is mechanically reconciled. J1 records this; it does not repair it.

## 10 · F9 — agreement never becomes authority

### Observed fact

Current Work Unit law says provider/model output is evidence, never authority.

The reconciliation controller preserves that boundary:

- one attempt cannot advance beyond second-review owed;
- disagreement is escalated rather than automatically resolved;
- multiple clean attempts reach only `EVIDENCE_PRESENTED`;
- founder semantic judgment remains required.

### Interpretation

Routing intelligence may choose **who looks** and **in what order**. It may not decide that agreement authorizes merge, deployment, doctrine, production change, or founder ruling.

## 11 · F10 — capability preference is the unresolved layer

Repository evidence supports role labels and execution constraints, but does not yet establish comparative quality between the four model families.

A brief local benchmark attempt was intentionally not treated as evidence after model-load latency prevented a clean bounded result. No benchmark score is claimed.

Therefore J1 must distinguish:

```text
HARD ROUTING LAW
authority / disclosure / locality / evidence / standing
        versus
CAPABILITY PREFERENCE
which model is better for which cognitive task
```

The first can be constituted from existing law now. The second requires a controlled benchmark.
## 12 · Falsifier — “provider registration is enough to automate routing”

### Mutant

Select a model automatically from the provider registry using only availability and model labels.

### Failure

This mutant cannot answer:

- whether the task is code-localization, architecture reasoning, falsification, or long-horizon synthesis;
- whether the evidence is LOCAL_ONLY or external-eligible;
- whether a second review is epistemically independent;
- whether the selected Nemotron transport is automatable;
- whether external repository disclosure is mechanically bound;
- whether model agreement may alter Work Unit standing.

### Verdict

**FAIL.** Provider registration is necessary execution plumbing, not routing intelligence.

## 13 · J1 bounded adjudication

### PASS

The repository now contains sufficient authority and execution evidence to define a **candidate hard routing law** covering:

- deterministic-first behavior;
- evidence admissibility;
- local/external boundary;
- model-family vs transport separation;
- second-review topology;
- output standing.

### STOP

J1 does not support automatic quality-based preference among Qwen, GPT-OSS, Inkling and Nemotron.

That requires J3 benchmark evidence.

## 14 · Next exact gate

**J2 — Candidate Routing Law.**

J2 may define hard routing invariants and explicit model-role hypotheses. It may not implement routing or present unbenchmarked role hypotheses as established model superiority.
