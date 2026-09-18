# JARVIS-ROUTER-01 — Governed Multi-Model Routing Law — 2026-09-17

**Standing:** BOUNDED IMPLEMENTATION · OFFLINE PROOF GREEN · EXECUTION ORCHESTRATION NOT YET OPEN

## Purpose

JARVIS now has multiple working model transports. The next problem is not connectivity; it is
governed participation:

- which model is primary for a given Work Unit;
- when a second model must challenge the first;
- what evidence each model may see;
- when external spend may occur;
- what happens when models disagree;
- and what, if anything, model output is allowed to advance.

This record defines that routing law without creating a second authority system.

## Existing law preserved

`scripts/builder/router.mjs` already contains the Desktop Alpha cost router:

```text
C0  deterministic capability
C1  bounded local model
C3  frontier/external reasoning
```

`route(task)` is preserved unchanged. JARVIS-ROUTER-01 adds `planModelRoute(task)` beside it.

The planner is **not an intent classifier**. It does not read task prose and guess. It consumes
structured Work Unit metadata only.

## Provider roles

| Provider | Default role | Transport | Standing |
|---|---|---|---|
| `qwen-local` | code / repository worker | OpenCode → Ollama | local-established |
| `gpt-oss-local` | reasoning / synthesis worker | OpenCode → Ollama | local-established |
| `inkling-tinker` | adversarial challenger | JARVIS direct Tinker | evaluation-only |
| `nemotron-tinker` | deep reasoner / disagreement analysis | JARVIS direct Tinker | external-candidate |
| `nemotron-zen` | manual interactive utility | OpenCode Zen | interactive-only; never auto-routed |
| `nemotron-nvidia` | optional governed external provider | OpenCode → NVIDIA | external-candidate |

Provider standing is capability metadata only. It never grants integration, governance, or
epistemic authority.

## Default law: local first

JARVIS defaults to `routing_profile: local-first`.

```text
implementation / testing / migration
    → Qwen primary

architecture / security / governance / verification / archaeology
independent evaluation / provider evaluation / bounded repair review
    → GPT-OSS primary
```

High-risk and high-assurance classes receive an independent **local** challenger by default:

```text
Qwen primary     → GPT-OSS local challenger
GPT-OSS primary  → Qwen local challenger
```

This challenge is local and does not consume provider spend.

## External routing requires two independent keys

External-provider authority is necessary but not sufficient.

An external call is eligible only when BOTH are true:

1. the Work Unit authority envelope grants `network.external` + `provider.spend`; and
2. the Work Unit carries explicit external routing intent.

Explicit routing intent is one of:

```text
external_review: true
routing_profile: external-deep
review_policy: adversarial
```

Therefore a packet cannot spend merely because spend authority happens to exist.

## Evidence classification

External models are eligible only for declared:

```text
synthetic
public
repo_nonconfidential
```

The following do not route externally under ROUTER-01, even when spend authority exists:

```text
unspecified
member
client
phi
secret
production
```

This is a declared boundary, not semantic inference. If `data_class` is absent, JARVIS treats it as
`unspecified` and external review is blocked.

Direct Tinker still enforces its own bounded `allowed_files` membrane; routing eligibility does not
replace that transport-level control.

## External review

`external_review: true` keeps the local primary and admits Inkling only after authority and
data-class eligibility pass.

```text
local primary
    ↓
local challenger when required
    ↓
Inkling adversarial challenger   ← explicit external review only
```

Inkling is evaluation-only. Its agreement or disagreement cannot close the Work Unit.

## External-deep

`routing_profile: external-deep` is an explicit exception to local-first:

```text
Nemotron 3.5 Lightning primary
    ↓
Inkling-Small adversarial challenger
```

JARVIS refuses this profile if provider authority or external-safe evidence classification is
missing. It never silently downgrades an explicit external-deep request to a different plan.

## Disagreement

`external_tiebreaker: true` may nominate Nemotron when a primary/challenger pair materially
disagrees.

That nomination is **not an automatic call**. The plan records:

```text
trigger: material_disagreement
automatic: false
disagreement_policy: STOP_AND_REVIEW
```

Execution still requires the Work Unit's provider authority and attempt budget.

## Standing and Work Unit advancement

### Universal law

> **Model output alone is never sufficient to advance standing.**

Every `planModelRoute()` result sets:

```text
model_output_sufficient: false
```

### Implementation / testing / migration

Model output standing:

```text
CANDIDATE_EXECUTION
```

Next gate:

```text
independent_verification
```

The existing Work Unit lifecycle may reach `ready_to_integrate` only after independent checks pass.

### Architecture / security / verification / evaluation

Model output standing:

```text
ADVISORY_EVIDENCE
```

Next gate:

```text
epistemic_guard
```

Model agreement does not create `OBSERVATION`, `PROVEN`, or `INVARIANT`. Those statuses still require
probative evidence under `epistemic-guard.mjs`.

### Governance

Model output standing:

```text
GOVERNANCE_ADVISORY_ONLY
```

Next gate:

```text
governance_gate
```

Only an authenticated resolver with the role required by `jarvis-governance-gate.mjs` may close the
governance question. Models may identify or analyze an authority boundary; they may not resolve it.

## Canonical Work Unit routing fields

The optional Work Unit schema now carries:

```json
{
  "routing_profile": "local-first | external-deep",
  "review_policy": "auto | none | local | adversarial",
  "data_class": "unspecified | synthetic | public | repo_nonconfidential | member | client | phi | secret | production",
  "external_review": false,
  "external_tiebreaker": false
}
```

These are Work-Unit-level facts. They are deliberately excluded from the projected delegate packet.
A worker therefore cannot rewrite its own routing intent by changing execution output.

`scripts/builder/work-unit-route.mjs` deterministically combines those facts with the canonical
permission envelope and returns the model participation plan.

## Proof

Exact branch proofs after the ROUTER-01 implementation:

```text
node scripts/builder/__tests__/router-alpha-proof.mjs
12 passed, 0 failed

node scripts/builder/__tests__/work-unit-proof.mjs
37 passed · 0 failed

node scripts/builder/__tests__/router-model-routing-proof.mjs
45 passed · 0 failed

node scripts/builder/__tests__/work-unit-route-proof.mjs
16 passed · 0 failed
```

The adversarial routing proof establishes, among other things:

- provider-spend authority alone never schedules an external model;
- external review requires explicit task intent;
- sensitive/unspecified data never routes externally;
- high-risk local work receives an independent local challenger;
- external-deep requires authority + safe evidence classification;
- Inkling is a challenger, never a closer;
- Nemotron disagreement analysis is nominated, never automatically invoked;
- interactive-only Zen is never selected by the automated planner;
- unknown task classes fail closed instead of being inferred from prose;
- every model plan preserves `model_output_sufficient: false`.

## Not done in ROUTER-01

- no new model/provider inference calls;
- no automatic primary/challenger execution chain;
- no automatic comparison of model answers;
- no automatic disagreement classification;
- no automatic Nemotron tie-breaker;
- no merge;
- no deployment;
- no production access;
- no change to MAIA member-facing behavior.

## Next gate

### JARVIS-ROUTER-02 — Multi-Model Orchestration

ROUTER-02 may consume a ROUTER-01 plan and execute its stages while preserving one canonical Work
Unit. It must prove, before activation:

1. primary and challenger attempts remain attributable to the same Work Unit;
2. role-specific outputs are stored separately rather than overwriting each other;
3. challenger context may include the primary claim but never verifier-only expectations;
4. a disagreement cannot be silently resolved by model voting;
5. external evidence uses the existing bounded Tinker membrane;
6. attempt/spend budgets are enforced per stage;
7. independent verification and epistemic/governance gates remain the only advancement authority.

Until ROUTER-02 closes, ROUTER-01 is a deterministic participation planner, not an autonomous
multi-model executor.
