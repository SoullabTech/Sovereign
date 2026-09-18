# JARVIS-ROUTING-INTELLIGENCE-01 · J2 — Candidate Routing Law

**Status:** CANDIDATE · DESIGN ONLY · NOT IMPLEMENTATION AUTHORITY
**Canonical evidence base:** `ee7999c244a981ab2305dec6f4f2fd86bad1f9c9`
**Purpose:** define what routing must mean before code is allowed to choose models automatically.

## 1 · Core law

> **Routing chooses a bounded intelligence attempt. It never chooses authority.**

A routing decision is valid only when five independent questions remain separate:

1. **What kind of work is this?**
2. **What evidence may leave which custody boundary?**
3. **Which model family is cognitively appropriate?**
4. **Which transport is authorized and available?**
5. **What standing may the resulting attempt acquire?**

No one answer may substitute for another.

## 2 · Routing order

```text
A. deterministic capability?
   YES → C0 / no model
   NO
    ↓
B. evidence admissibility
    ↓
C. task-shape classification
    ↓
D. primary model-family hypothesis
    ↓
E. independent review topology
    ↓
F. transport resolution
    ↓
G. explicit external authority, if needed
    ↓
H. execution attempt
    ↓
I. mechanical reconciliation
    ↓
J. human / governing authority
```

The router must fail closed when any earlier layer is unresolved.

## 3 · Evidence classes

| Class | Meaning | Current admissible paths |
|---|---|---|
| **E0 — TASK_TEXT** | synthetic / non-confidential task text only | local; external if `network.external` authorized |
| **E1 — REPOSITORY_LOCAL** | repository evidence available within isolated local worktree | Qwen / GPT-OSS local read-only |
| **E2 — CONTINUITY_LOCAL** | JARVIS / Claude historical continuity or other LOCAL_ONLY development memory | local only; no ambient external promotion |
| **E3 — EXTERNAL_REPO_BUNDLE** | exact founder/JARVIS-admitted repository files bounded for external review | direct external path only after explicit disclosure + network authority + spend where required |
| **E4 — SENSITIVE_OR_PRODUCTION** | member/client/PHI/secrets/production/confidential material | outside this programme; no external routing authorization created here |

Model capability never changes evidence class.
## 4 · Hard admissibility rules

### R1 — deterministic first

If a registered deterministic capability can answer the bounded question, no model is selected.

### R2 — local evidence stays local

E2 continuity may not cross to an external model merely because an external model is stronger, available, free, or requested by a subagent.

### R3 — external selection is not external execution

JARVIS may eventually **recommend** an external model family. The recommendation itself sends nothing.

Execution remains impossible until the Work Unit already carries all required authority for that attempt.

### R4 — provider/model selection cannot widen the Work Unit

A provider may consume only authority already present in the Work Unit. Provider resolution may narrow execution; it may never add permission.

### R5 — repository disclosure is a distinct constitutional fact

A future automatic external route must prove both:

- external network authority; and
- explicit repository-evidence disclosure authority for the exact bounded evidence.

The present implementation's disclosure-binding seam is unresolved and must be reconciled before automatic E3 routing ships.

### R6 — transport follows model-family choice

The cognitive decision is “Nemotron” or “Inkling,” not “Zen” or “Tinker.”

Only after the model family is selected may JARVIS resolve an authorized transport.

### R7 — unavailable transport does not rewrite the cognitive decision

If the intended model family has no admissible transport, the router returns a held/escalation state. It does not silently substitute another model and pretend the same review occurred.

## 5 · Independent review law

> **A retry is not a second opinion.**

For a provider-reviewed Work Unit, an independent second review must differ in at least one epistemically material dimension:

- model family; or
- deterministic verifier / non-model evidence process capable of falsifying the model claim.

Two attempts from the same model/checkpoint under the same evidence and prompt posture are retries, not independent reviews.

Until later adjudication changes the existing Work Unit law:

- one clean model attempt → `SECOND_REVIEW_OWED`;
- independent reviews that structurally disagree → `REVIEW_DISAGREEMENT`;
- any hard failure/reject → `REPAIR_BEFORE_WITNESS`;
- two or more clean independent attempts → at most `EVIDENCE_PRESENTED`.

Model agreement never creates merge, deploy, doctrine, production, or founder authority.
## 6 · Candidate task-shape taxonomy

This taxonomy is deliberately about **work**, not providers.

| Task shape | Description |
|---|---|
| **CODE_GROUNDED** | locate defects, trace symbols, inspect implementation, compare code to contract |
| **ARCHITECTURE_REASONING** | reconcile contracts, authority, system boundaries, multi-file design implications |
| **ADVERSARIAL_FALSIFICATION** | attack a proposed conclusion, find counterexamples, test hidden assumptions |
| **LONG_HORIZON_DECOMPOSITION** | break a large complex programme into bounded acts/dependencies while preserving constraints |
| **EVIDENCE_SYNTHESIS** | reconcile several bounded evidence sources without creating new authority |
| **FRONTIER_UNKNOWN** | task does not fit a validated local capability profile or contains unresolved novelty |

These classes need benchmark discrimination before they drive automatic model choice.

## 7 · Model-role hypotheses — NOT YET ROUTING FACTS

### Qwen3-Coder 30B — hypothesis Q

**Candidate role:** primary local model for `CODE_GROUNDED` work and repository-local implementation review.

Why this is plausible:

- current JARVIS labels it local coding review;
- it is the current locally established code-focused model;
- Qwen's public model documentation positions Qwen3-Coder specifically for coding and agentic development.

**Standing:** hypothesis pending J3 benchmark.

### GPT-OSS 20B — hypothesis G

**Candidate role:** primary/independent local model for `ARCHITECTURE_REASONING`, `EVIDENCE_SYNTHESIS`, and governance/contract reasoning where broad structured reasoning matters more than code specialization.

Why plausible:

- current JARVIS labels it local reasoning review;
- OpenAI describes gpt-oss-20b as an open-weight model for low-latency/local specialized use with configurable reasoning and structured/agentic capabilities.

**Standing:** hypothesis pending J3 benchmark.

### Inkling-Small — hypothesis I

**Candidate role:** external independent challenger for `ADVERSARIAL_FALSIFICATION`, cross-domain review, and complex coding/reasoning when a genuinely different model family is valuable.

Why plausible:

- current JARVIS deliberately labels Inkling as external adversarial review;
- Thinking Machines describes Inkling-Small as a broad generalist with reasoning, coding and agentic capability.

**Standing:** transport proven by bounded funded connectivity witness; capability role unproven internally; external and metered.

### Nemotron — hypothesis N

**Candidate role:** external `LONG_HORIZON_DECOMPOSITION` / agentic-workflow review and frontier escalation where broad task decomposition or long context is material.

Why plausible:

- NVIDIA describes Nemotron 3.5 Lightning as optimized for long-running autonomous agents and agentic workflows;
- Nemotron has multiple available transports/models, making model-family/transport separation particularly important.

**Standing:** direct Lightning transport proven by bounded funded connectivity witness; comparative JARVIS role unproven internally.
## 8 · Candidate primary/secondary topology

Until J3 proves a better rule, the conservative topology is:

### Local default

```text
CODE_GROUNDED
  primary hypothesis: Qwen
  independent local review: GPT-OSS

ARCHITECTURE_REASONING / EVIDENCE_SYNTHESIS
  primary hypothesis: GPT-OSS
  independent local review: Qwen
```

This preserves the current dual-local posture while testing role specialization.

### External escalation triggers

An external review may be **recommended**, not automatically executed, when any of the following is true:

1. local reviewers materially disagree;
2. both local reviewers return unresolved uncertainty on the same consequential point;
3. the task is `FRONTIER_UNKNOWN`;
4. a Class A/high-risk claim depends on a capability not validated locally;
5. founder explicitly requests external challenge;
6. a future benchmark demonstrates reliable material uplift for that task class.

### Candidate external choice

```text
Need adversarial counterexample / independent conceptual challenge
    → Inkling hypothesis

Need long-horizon decomposition / agentic systems reasoning
    → Nemotron hypothesis

Neither profile is benchmark-established
    → HOLD model choice / founder selection
```

No external route is selected from “bigger model = better.”

## 9 · Transport resolution after model selection

### Qwen / GPT-OSS

Local Ollama/OpenCode only in this programme.

### Inkling

Direct Tinker bounded evidence bundle. External network + repository disclosure when E3 + provider spend + credential.

### Nemotron

Transport resolver may later choose among authorized/available Nemotron transports:

- Zen interactive/manual;
- direct NVIDIA;
- direct Tinker Lightning/Ultra.

A transport restriction may block execution. It does not change the requested cognitive role.

## 10 · Output standing

Model outputs may contribute:

- candidate finding;
- counterexample;
- unresolved question;
- recommended next bounded action;
- evidence-grounded review.

They may not themselves create:

- canonical fact;
- constitutional meaning;
- founder ruling;
- merge authority;
- deployment authority;
- production standing.

The highest automatic state reachable through model agreement alone remains **evidence presented**.

## 11 · Public capability sources used only to form benchmark hypotheses

These sources are not JARVIS authority and do not substitute for internal benchmark evidence:

- QwenLM — Qwen3-Coder official repository / model documentation.
- OpenAI — `gpt-oss-20b` official model documentation.
- Thinking Machines Lab — Inkling / Inkling-Small model card and release notes.
- NVIDIA — Nemotron 3.5 Lightning official model card.

J3 must test the actual deployed model versions and JARVIS transports rather than importing vendor benchmark rankings as routing truth.

## 12 · Gate

This candidate may advance to J3 only as a **benchmark contract**, not as implementation authority.

No routing code changes are authorized by this document.
