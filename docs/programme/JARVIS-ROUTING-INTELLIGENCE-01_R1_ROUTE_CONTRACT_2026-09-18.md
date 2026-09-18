# JARVIS-ROUTING-INTELLIGENCE-01 / R1 — Deterministic Route Contract

**Date:** 2026-09-18
**State:** CONTRACT + FALSIFICATION SPECIFICATION ONLY — NOT EXECUTABLE
**Base:** 0895acfe345bec05827b931d379daeb852088467
**Discovery head:** 5cfd7748daadfed28e375606a213268792300bb4

This artifact defines what a future routing decision must look like and how it must be falsified before any execution path may consume it.

It does not implement routing, call a model, inspect a credential, authorize external access, authorize spend, mutate a Work Unit, merge, deploy, or touch production.

## 1. Founder ruling carried forward

### R1-NEMOTRON-01

For governed repository-grounded Nemotron review:

- nemotron-tinker is the designated JARVIS Nemotron Work Unit lane.
- nemotron-zen remains text-only/manual frontier reasoning only while automated delegation is unsupported.
- nemotron-zen may not appear as an executable Work Unit primary or challenger.
- nemotron-nvidia remains outside automatic routing V1 pending separate disclosure/cost adjudication.

The router chooses capability. It never chooses authority.
## 2. Orthogonal route inputs

The discovery vocabulary mixed task identity with review pressure. V1 separates four questions:

1. What kind of reasoning is this?
2. How much independent review is owed?
3. Is a special challenger requested?
4. What evidence and authority are actually available?

No model is permitted to answer those questions for itself.

A future pure router may consume structured inputs equivalent to:

~~~text
task_shape: mechanical_code | deep_reasoning
review_pressure: ordinary | high_value_uncertain
challenge_mode: none | adversarial | frontier
frontier_posture: none | text_only_manual | repository_grounded

evidence:
  local_worktree_available: boolean
  external_bundle_refs: exact bounded refs[]
  task_text_available: boolean
~~~
~~~text
authority:
  repo_read: boolean
  repo_write_scope: none | worktree
  network_external: boolean
  provider_spend: boolean
  repository_external_disclosure: boolean

work_unit:
  risk_class
  explicit_independent_review: boolean
~~~

The pure routing decision must not inspect API keys, macOS Keychain, environment credentials, provider health endpoints, network state, live model output, conversation memory, member data, or production data.

Provider readiness is a later execution/admission concern. It cannot change the deterministic routing law.

## 3. Deterministic route record

The future router must return one immutable, inspectable record equivalent to:

~~~text
route_version
task_shape
review_pressure
challenge_mode
primary: { provider_id, role }
challengers: [{ provider_id, role, execution_disposition }]
review_policy
evidence_policy
required_authority: { acts[], disclosures[] }
execution_disposition
blockers[]
routing_reason_codes[]
~~~

The record is evidence about intended capability selection. It is not authority and it is not an execution receipt.
## 4. Provider roles admitted to V1 routing

| Provider | V1 routing role | Automated Work Unit execution? | Evidence posture |
| --- | --- | ---: | --- |
| qwen-local | primary mechanical reviewer; local challenger | yes, subject to existing authority | isolated worktree read-only |
| gpt-oss-local | primary deep-reasoning reviewer; local challenger | yes, subject to existing authority | isolated worktree read-only |
| inkling-tinker | external adversarial challenger only | only after explicit external authority | exact allowlisted bundle |
| nemotron-tinker | external frontier repository challenger | only after explicit external authority | exact allowlisted bundle |
| nemotron-zen | manual/text-only frontier option | no automated delegation | task text only |
| nemotron-nvidia | registered, outside automatic routing V1 | no | not adjudicated |

Primary-provider law:

- Inkling is never an ordinary primary.
- Tinker Nemotron is frontier escalation evidence, not an ordinary V1 primary.
- Zen is never an executable Work Unit route.
- External provider failure is never an automatic fallback target for another external provider.

## 5. Deterministic local routing

### Ordinary mechanical code

Primary: qwen-local.
Review policy: single_mechanical.
External route: none.

This fast path is allowed only when the Work Unit does not independently require a second review and local read-only review is already authorized.

### Ordinary deep reasoning

Primary: gpt-oss-local.
Challenger: qwen-local.
Review policy: independent_local_second.
### High-value or uncertain conclusions

Mechanical:
- primary qwen-local
- challenger gpt-oss-local

Deep reasoning:
- primary gpt-oss-local
- challenger qwen-local

An explicit Work Unit request for independent review upgrades any otherwise-single local route to independent_local_second. It may increase review obligation. It may not increase authority.

## 6. External challenge law

### Adversarial

challenge_mode = adversarial proposes inkling-tinker as challenger.

Before execution, all are required:

- network.external
- provider.spend
- repository_external_disclosure for repository-grounded evidence

If any requirement is absent, execution_disposition = held_for_external_authority.

The router may describe the held act. It may not execute it.

### Frontier repository-grounded

challenge_mode = frontier and frontier_posture = repository_grounded proposes nemotron-tinker.

The same network, spend, and repository-disclosure requirements apply.

Evidence is the exact bounded external bundle only.
### Frontier text-only/manual

challenge_mode = frontier and frontier_posture = text_only_manual may surface nemotron-zen only with execution_disposition = manual_only.

It must never create an automated Work Unit provider attempt.

## 7. Evidence and authority law

Evidence does not widen by inheritance.

| Route | Maximum evidence |
| --- | --- |
| Qwen local | isolated Work Unit worktree, read-only |
| GPT-OSS local | isolated Work Unit worktree, read-only |
| Inkling via Tinker | exact external allowlisted bundle |
| Nemotron via Tinker | exact external allowlisted bundle |
| Nemotron Zen manual | founder-approved task text only |

A repository-grounded external challenge with no exact bundle refs is blocked as EVIDENCE_BUNDLE_REQUIRED. It does not silently become whole-repository disclosure.

The route function may name required authority. It may never grant, add, or widen authority.

It may not mutate repo.read, repo.write:worktree, network.external, provider.spend, production.read, production.write, deploy, authority.change, or repository_external_disclosure.

## 8. Review and stop law

A clean primary attempt does not decide whether another review is owed. The route review_policy does.

- single_mechanical may complete after one mechanically clean, falsifiable local review.
- independent_local_second owes the declared second local reviewer.
- external_challenge_proposed is a held proposal until founder authority exists.
- manual_frontier_proposed can never be auto-run.

Disagreement creates founder review. JARVIS must not select a semantic winner.
A provider cascade stops if an attempt fails technically, is refused by provider governance, recommends rejection, reports evidence insufficiency, hits an escalation condition, or encounters a route blocker.

A failed local review does not authorize an external retry. External spend is never an automatic recovery mechanism.

## 9. Falsification matrix

F-R1 — ordinary mechanical stays local and single:
- primary qwen-local
- single_mechanical
- no external provider
- no external authority requirement

F-R2 — deep reasoning does not route by provider order:
- primary gpt-oss-local
- challenger qwen-local
- independent_local_second

F-R3 — high-value mechanical gains local independent review:
- qwen primary
- GPT-OSS challenger
- no externalization

F-R4 — high-value deep reasoning reverses local roles:
- GPT-OSS primary
- Qwen challenger

F-R5 — Inkling is never ordinary primary.

F-R6 — adversarial challenge missing network, spend, or disclosure is held:
- propose inkling-tinker
- name missing requirements
- no Tinker call
- no Keychain lookup
- no Work Unit widening
F-R7 — external adversarial evidence remains exact bundle only; never whole repository.

F-R8 — repository-grounded frontier Nemotron is nemotron-tinker:
- never nemotron-zen
- never nemotron-nvidia in V1

F-R9 — Zen remains manual-only:
- may be surfaced for text-only/manual frontier reasoning
- never creates governed provider attempt

F-R10 — repository-grounded external review with zero bundle refs blocks as EVIDENCE_BUNDLE_REQUIRED.

F-R11 — route cannot expand authority:
- required authority may be named
- granted authority from the route itself is always none

F-R12 — provider failure stops cascade; no external recovery call.

F-R13 — disagreement has no automatic winner; founder review is required.

F-R14 — identical structured input yields a byte-equivalent semantic route record.
Changing credentials, Keychain contents, network availability, or provider health must not change the pure route result.

F-R15 — invalid or contradictory routing input fails closed with typed blockers; the router never guesses.

## 10. Implementation admission gate

Only after Founder adjudication of this contract may the next gate open:

**JARVIS-ROUTING-INTELLIGENCE-01 / R2 — Pure Router + Red/Green Falsification**

R2 may authorize one pure routing module and one deterministic falsification suite.

R2 does not authorize provider calls, credential lookup, Work Unit mutation, Desktop execution wiring, external spend, merge, deploy, or production access.

Until R2 is explicitly opened, this contract remains design authority only.
