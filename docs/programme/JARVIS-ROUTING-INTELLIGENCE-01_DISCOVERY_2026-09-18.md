# JARVIS-ROUTING-INTELLIGENCE-01 — Routing-Law Discovery

**Date:** 2026-09-18
**State:** DISCOVERY / LAW PROPOSAL ONLY — NO ROUTING IMPLEMENTATION
**Base:** 0895acfe345bec05827b931d379daeb852088467
**Scope:** model/provider selection after PR #1374 entered canonical

This record does not authorize external calls, provider spend, repository disclosure, implementation, merge, deploy, production access, member-data access, or model self-authorization.

## 1. Purpose

JARVIS now has multiple reasoning workers. The next problem is not adding another model. It is deciding, governably and legibly, which capability should be asked to do what, with what evidence, under what authority, and what happens when reviewers disagree.

The router selects capability, never authority.

A model may produce evidence, critique, uncertainty, falsifiers, or a proposed next bounded act. A model may not create permission, close a constitutional gate, choose itself as authoritative, merge work, deploy work, or convert its own output into standing.

## 2. Observed canonical substrate

### 2.1 Provider registry

Canonical provider classes:

| Provider | Default role | Network | Metered | Standing | Adapter |
| --- | --- | ---: | ---: | --- | --- |
| qwen-local | Qwen3 Coder 30B | no | no | local-established | OpenCode |
| gpt-oss-local | GPT-OSS 20B | no | no | local-established | OpenCode |
| nemotron-nvidia | Nemotron 3 Ultra | yes | yes | external-candidate | OpenCode |
| nemotron-zen | Nemotron 3 Ultra Free | yes | no | interactive-only | OpenCode interactive; delegation unsupported |
| nemotron-tinker | Nemotron 3.5 Lightning / Ultra | yes | yes | external-candidate | direct Tinker |
| inkling-tinker | Inkling-Small / Inkling | yes | yes | evaluation-only | direct Tinker |

Provider choice is capability. It does not alter the Work Unit permission envelope.

### 2.2 Current Desktop strategy

The Work Unit composer currently exposes:

- qwen-local
- gpt-oss-local
- nemotron-zen
- inkling-tinker

Qwen and GPT-OSS are checked by default. Nemotron and Inkling are optional.

### 2.3 Current reconciliation law

Current reconciliation behaves as follows:

- no attempt → NOT_RUN
- one clean attempt → SECOND_REVIEW_OWED
- hard failure or reject → REPAIR_BEFORE_WITNESS
- explicit escalation → NEEDS_KELLY
- structured disagreement → REVIEW_DISAGREEMENT
- multiple clean attempts without structured disagreement → EVIDENCE_PRESENTED

JARVIS does not select a semantic winner between disagreeing providers.

### 2.4 Evidence surfaces are intentionally unequal

#### Local OpenCode reviewers — Qwen / GPT-OSS

The jarvis-readonly agent may read, glob, grep, list, and use LSP inside the isolated worktree.

It may not edit, run shell commands, launch subagents, browse the web, or access external directories.

Therefore local review is structurally whole-isolated-worktree read-only.

#### Direct Tinker reviewers — Inkling / Tinker Nemotron

The external-context bundler sends only Work Unit allowed_files:

- exact files only
- no directories or globs
- no symlinks
- no path escape
- no sensitive credential paths
- maximum 12 files
- maximum 128 KiB per file
- maximum 512 KiB total

The model has no filesystem or tools.

Therefore Tinker review is exact allowlisted evidence only.

#### Nemotron frontier text route

The existing frontier worker gives Nemotron founder-approved task text only and withholds repository, continuity, Claude history, member data, filesystem, and tools.

This is a separate posture from repository-grounded Work Unit review.

## 3. Discovery findings that must be resolved before implementation

### F1 — Desktop Nemotron is not a governably executable Work Unit provider

The Work Unit composer maps its Nemotron checkbox to nemotron-zen.

Canonical provider law marks nemotron-zen interactive-only with delegation unsupported. Governed Work Unit resolution therefore refuses it with PROVIDER_AUTOMATION_UNSUPPORTED.

Meanwhile nemotron-tinker is registered, governable, Keychain-backed, and not exposed by the Work Unit composer.

**Consequence:** routing implementation must not route governed repository review to nemotron-zen.

### F2 — AVAILABLE currently conflates discovery with executable capability

Desktop can render nemotron-zen as AVAILABLE when the frontier worker is configured even though governed Work Unit delegation will later refuse it.

**Required distinction:** capability state must eventually distinguish at least:

- available for text-only frontier use
- available for governed Work Unit delegation
- available only interactively
- unavailable / needs setup

### F3 — Current reconciliation hard-codes a second review

Every single clean Work Unit attempt becomes SECOND_REVIEW_OWED.

That conflicts with the intended routing policy where a low-risk mechanical task may be sufficiently answered by Qwen alone.

**Consequence:** second-review obligation must become a route/review-policy property rather than only an attempt-count rule.

### F4 — External disclosure presentation is broader than actual Tinker transport

Desktop currently asks authorization for external read-only repository inspection and says this is broader than the Evidence focus list.

The direct Tinker transport actually receives only the exact allowlisted bundle.

This is conservative over-disclosure, but not an exact description of the transport.

**Consequence:** routing law should encode the narrower real membrane and later reconcile presentation to it.

## 4. Candidate routing law

These are proposals for adjudication, not executable rules.

### R1 — Authority before capability

Routing may occur only inside the existing Work Unit authority envelope.

A desired route that needs additional network, disclosure, spend, production, integration, or deployment authority may be proposed but not executed.

### R2 — Local first

External models are escalation lanes, not the default substrate.

Prefer local review when adequate because repository evidence stays on the Mac and no external-network or provider-spend grant is needed.

### R3 — Mechanical code work routes to Qwen

Primary candidate: qwen-local.

Examples:

- locate a coding defect
- assess a patch or diff
- inspect a test failure
- compare implementation to a mechanical contract
- identify a bounded code change

External escalation is not justified merely for convenience.

### R4 — Architecture and deep reasoning route to GPT-OSS

Primary candidate: gpt-oss-local.

Examples:

- architecture tradeoffs
- requirement decomposition
- contradiction analysis
- system-design reasoning
- governance-structure interpretation
- synthesis across multiple local files

### R5 — High-value or uncertain conclusions use an independent local pair

For a high-value, ambiguous, or expensive conclusion:

1. choose the primary local model by task shape
2. have the other local model read independently

Agreement is evidence, not authority.

Disagreement creates a founder gate.

### R6 — Independent second opinion is policy, not ceremony

Second review should be required when:

- route risk is high
- the conclusion is not mechanically falsifiable
- the first reviewer reports unresolved uncertainty
- architecture or governance boundaries are crossed
- evidence is materially ambiguous
- the Work Unit explicitly requests independent review

A low-risk mechanical review with explicit falsifiers may complete with one local reviewer only if the future route policy explicitly permits that fast path.

Until reconciliation changes, existing Work Units retain SECOND_REVIEW_OWED after one attempt.

### R7 — Inkling is the adversarial challenger

inkling-tinker should not be the ordinary primary reviewer.

Candidate uses:

- challenge a locally reached conclusion
- search for hidden assumptions
- attack a proposed architecture before founder ruling
- falsify apparent local consensus
- independently challenge a high-value decision

Execution requires explicit external-network authority, explicit provider-spend authority, and the exact bounded evidence bundle.

Inkling output cannot settle disagreement. It adds evidence only.

### R8 — Nemotron has two distinct postures

#### Text-only frontier reasoning

Existing frontier-worker posture:

- task text only
- no repository
- no history, continuity, or member data
- explicit external act

Use when repository evidence is unnecessary.

#### Governed repository-grounded external reasoning

Candidate canonical lane: nemotron-tinker.

Use when:

- the local pair is insufficient on a difficult architecture or reasoning problem
- frontier-scale independent review is justified
- exact repository evidence can be bounded
- the founder explicitly authorizes external disclosure and spend

nemotron-zen must not be used for governed Work Unit delegation while delegation remains unsupported.

nemotron-nvidia remains registered but should not enter automatic routing V1 until its disclosure and cost posture is separately adjudicated.

### R9 — External escalation may be proposed automatically, but executed explicitly

JARVIS may recommend an external adversarial or frontier review.

JARVIS may not silently turn that recommendation into network access, repository disclosure, or provider spend.

The external act remains a founder gesture.

### R10 — Evidence follows the route

| Route | Evidence surface |
| --- | --- |
| Qwen local | isolated worktree, read-only |
| GPT-OSS local | isolated worktree, read-only |
| Inkling via Tinker | exact allowlisted bundle only |
| Nemotron via Tinker | exact allowlisted bundle only |
| Nemotron frontier text | task text only |

No route inherits broader evidence merely because another route in the same Work Unit had broader access.

### R11 — Model output never advances authority

A model result may:

- satisfy a review attempt
- report mechanical evidence
- identify falsifiers
- recommend a bounded next act
- mark unresolved questions
- request escalation

A model result may not by itself:

- merge
- deploy
- mutate production
- create or widen authority
- close a founder or constitutional gate
- choose the winning semantic interpretation in a disagreement
- convert review-passed into implementation-accepted

### R12 — Fail closed and stop cascades

If an attempt fails technically, is refused by provider governance, recommends rejection, hits evidence insufficiency, or hits an escalation condition, the strategy stops before running the next provider automatically.

External spend must never be used as a fallback retry after a failed local attempt unless separately authorized.

## 5. Proposed V1 route vocabulary

A future deterministic router should return an inspectable route record with fields equivalent to:

- task_shape
  - mechanical_code
  - deep_reasoning
  - high_value_uncertain
  - adversarial_challenge
  - frontier_reasoning
- primary_provider
- review_policy
  - single_mechanical
  - independent_local_second
  - external_challenge_proposed
- evidence_policy
- external_authority_required
- routing_reason

The route decision must be visible before execution.

A model must not choose its own provider route.

## 6. Implementation gates after discovery

Before a router is written:

1. **Nemotron authority identity**
   - select the governable Nemotron Work Unit lane
   - keep Zen text-only / interactive semantics separate

2. **Capability-state vocabulary**
   - separate discoverable from governably executable

3. **Review-policy field**
   - make second-review obligation explicit in the Work Unit

4. **Evidence-policy field**
   - distinguish local whole-worktree read-only, exact external bundle, and text-only

5. **Deterministic route function**
   - pure function first
   - no provider call
   - no credential lookup
   - no Work Unit mutation

6. **Falsification suite**
   - mechanical task does not externalize
   - deep reasoning does not route to Qwen merely because it is first
   - disagreement cannot auto-pick a winner
   - missing spend or disclosure cannot be bypassed by routing
   - Inkling never becomes ordinary primary
   - Zen cannot be selected for governed delegation
   - no provider can expand evidence or authority

## 7. Standing

JARVIS-ROUTING-INTELLIGENCE-01 is **OPEN AT DISCOVERY**.

No routing implementation has been authorized or performed.

The next gate is:

**JARVIS-ROUTING-INTELLIGENCE-01 / R1 — Routing-Law Adjudication**

Adjudicate R1–R12 and findings F1–F4 before writing a router.
