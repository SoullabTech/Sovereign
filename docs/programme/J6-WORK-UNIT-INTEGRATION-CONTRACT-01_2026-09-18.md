# J6-WORK-UNIT-INTEGRATION-CONTRACT-01

**Programme:** JARVIS-ROUTING-INTELLIGENCE-01
**Gate:** J6-WORK-UNIT-INTEGRATION-01
**Date:** 2026-09-18
**Status:** CONTRACT ONLY — IMPLEMENTATION NOT AUTHORIZED
**Canonical subject:** `c6ed841f8ebc378031b5c3fa0262e367a42dc3e8`
**W1-W5 merge subject:** `fab09573bea7a45e77df89d0975afb3312769f99`
**J5 donor evidence:** `e9f803771583884793a583f13655cadfa055f4f3`
**Governing routing law:** `JARVIS-ROUTING-INTELLIGENCE-01 / J5`

This contract reconciles the founder-ratified J5 family-first routing law with canonical JARVIS Work Unit W1-W5.

It authorizes no code implementation.

---

## 1 · Constitutional result

The integration law is:

> **W1-W5 is the canonical Work Unit substrate. J5.v1 is the governing routing law for new canonical Work Units. Neither historical W1-W5 v1 nor the J5 donor branch is rewritten in place.**

The successor architecture is versioned:

```text
Human intent
    ↓
W0.v2 canonical Work Unit
    ↓
W2.v2 authorization / immutable core
    ↓
W3.v2 J5.v1 cognitive route binding
    ↓
W3T.v1 governed family → transport binding
    ↓
W2.v2 execution admission
    ↓
W4.v2 append-only attempt / verifier evidence
    ↓
W2.v2 EVIDENCE_READY → ADJUDICATED → CLOSED
```

W2 remains the sole lifecycle-transition authority.

The route never grants authority.

The transport binder never changes model family.

The ledger never adjudicates semantic truth.

---

## 2 · Evidence basis

Exact canonical W1-W5 hashes at current canonical are unchanged from the W1-W5 merge:

- `work-unit-v1.mjs` — `f5c1734d…`
- `work-unit-lifecycle-v1.mjs` — `b8a13aa2…`
- `work-unit-routing-v1.mjs` — `ab382b73…`
- `work-unit-ledger-v1.mjs` — `b34d11ed…`

Historical W3 remains pinned to R1.v1 router SHA-256:

`2837520e2f4e27aed067a84a2f8148a8b1be2436f71a57aa21a4c06d72316b4f`

The proven J5 donor router at `e9f803771…` has SHA-256:

`84b2fe9e7e84fcb7833ca57ccc4bed298c303e8d17946b585981f696e7a106ef`

Current canonical also contains a separate compatibility `routing-intelligence-j6.mjs`, while W3.v1 continues to import the R1.v1 router.

Therefore canonical currently contains parallel routing/Work Unit surfaces. This contract defines their successor convergence rather than blessing both as co-equal authority.

---

## 3 · Interoperability finding

A synthetic interoperability probe used:

- exact canonical W1-W4 from `fab09573…`;
- exact J5.v1 router from `e9f803771…`.

Result:

### W3 binding

W3.v1 successfully bound a J5.v1 CODE route:

```text
primary:
  model_family = QWEN
  role = code_primary

challenger:
  model_family = GPT_OSS
  role = independent_local_challenger
```

### W4 identity admission

W4.v1 then refused the natural Qwen model identity:

```text
provider_id = qwen-local
model_id    = qwen3-coder:30b
role        = code_primary
```

with:

`MODEL_IDENTITY_NOT_IN_BOUND_ROUTE`

Reason:

> W4.v1 identifies route participants by `provider_id + role`; J5.v1 intentionally binds `model_family + role` before transport.

This proves a new canonical primitive is required between routing and W4 execution provenance.

That primitive is **governed transport binding**.
---

## 4 · Versioning decisions

Historical modules remain valid and unchanged.

| Domain | Historical | Successor |
|---|---|---|
| Work Unit schema | `W0.v1` | **`W0.v2`** |
| Lifecycle | `W2.v1` | **`W2.v2`** |
| Cognitive route | `R1.v1` | **`J5.v1`** |
| Route binding | `W3.v1` | **`W3.v2`** |
| Transport binding | none | **`W3T.v1`** |
| Evidence ledger | `W4.v1` | **`W4.v2`** |
| Synthetic E2E | `W5.v1` | **`W5.v2`** |

New modules must be versioned successors. Historical v1 modules must not silently change semantics.

A W0.v1 Work Unit is never reinterpreted as W0.v2.

If historical work requires J5.v1 semantics, the correct act is a new **superseding W0.v2 Work Unit**, not an in-place upgrade after authorization.

---

## 5 · W0.v2 — canonical authorized Work Unit

Recommended module:

`scripts/builder/work-unit-v2.mjs`

Recommended version:

`WORK_UNIT_VERSION = "W0.v2"`

### 5.1 Identity

W0.v2 identity contains:

```text
id
programme
parent_work_unit
objective
work_class
task_shape
capability
```

`capability` is nullable structured text identifying a candidate deterministic capability.

It is part of the authorized core because deterministic-first routing must not be changed after authorization without supersession.

### 5.2 J5 task shapes

W0.v2 admits exactly:

- `CODE_GROUNDED`
- `ARCHITECTURE_REASONING`
- `ADVERSARIAL_FALSIFICATION`
- `LONG_HORIZON_DECOMPOSITION`
- `EVIDENCE_SYNTHESIS`
- `FRONTIER_UNKNOWN`

Historical `mechanical_code` and `deep_reasoning` remain W0.v1 values.

They are not silently aliased inside W0.v2.

Compatibility/UI adapters may translate pre-authorization intent, but the stored W0.v2 value is one of the six J5 shapes.

### 5.3 Custody domain

W0.v2 adds an immutable authorized domain:

```text
custody:
  evidence_class
```

where `evidence_class` is:

- `E0_TASK_TEXT`
- `E1_REPOSITORY_LOCAL`
- `E2_CONTINUITY_LOCAL`
- `E3_EXTERNAL_REPO_BUNDLE`
- `E4_SENSITIVE_OR_PRODUCTION`

The stored class is the highest custody class admitted into the Work Unit's authorized purpose.

Adding evidence that requires a more restrictive custody class after AUTHORIZED requires supersession.

Individual `context.evidence_refs[]` may still evolve as evidence is appended; they may not widen the immutable custody ceiling.

### 5.4 Routing request domain

W0.v2 separates immutable routing intent from later route output:

```text
routing_request:
  requested_posture
  review_pressure
```

`requested_posture` retains the canonical intent vocabulary:

- `default`
- `local_only`
- `independent_review`
- `adversarial_challenge`
- `frontier_text`
- `frontier_repository`

`review_pressure` is:

- `ordinary`
- `high_value_uncertain`

Both are included in the W2.v2 authorized-core snapshot.

The historical `routing.requested_posture` field is not reused as mutable authority-bearing intent.

### 5.5 Routing result domain

Future-owned routing state is distinct:

```text
routing:
  router_version
  route_record
  primary
  challengers[]
  transport_bindings[]
```

These begin empty in DRAFT.

They are not part of the immutable authority core, but every append/binding is constrained by the immutable core.
---

## 6 · Canonical authority in W0.v2

W0.v2 preserves canonical Work Unit authority as the single source of truth:

```text
repository_read
repository_write
shell
network_external
provider_spend
external_disclosure
merge
deploy
production_read
production_write
```

`external_disclosure` remains exactly:

- `none`
- `task_text_only`
- `exact_bundle`

No second canonical disclosure boolean or act is added to W0.v2.

### 6.1 Projection to legacy/lower adapters

At an execution adapter boundary only:

```text
external_disclosure = exact_bundle
        ↓
derived compatibility permission
        ↓
repo.disclose:external-readonly
```

This is a deterministic one-way projection.

The compatibility permission is **not independently authorable** for a W0.v2 Work Unit.

A lower packet or UI cannot widen the canonical Work Unit by asserting `repo.disclose:external-readonly` when W0.v2 says otherwise.

Similarly:

- `network_external = true` projects to lower `network.external`;
- `provider_spend = true` projects to lower `provider.spend`.

Canonical authority always wins.

---

## 7 · W2.v2 — lifecycle and authorized-core ownership

Recommended module:

`scripts/builder/work-unit-lifecycle-v2.mjs`

Recommended version:

`LIFECYCLE_VERSION = "W2.v2"`

The lifecycle spine remains:

```text
DRAFT
→ BOUNDED
→ AUTHORIZED
→ ROUTED
→ EXECUTING
→ EVIDENCE_READY
→ ADJUDICATED
→ CLOSED
```

with terminal exits:

- `STOPPED`
- `RETURNED`
- `SUPERSEDED`

There is still no `EXECUTING → CLOSED` shortcut.

### 7.1 W2.v2 authorized core

The snapshot contains:

- identity, including `task_shape` and `capability`;
- scope;
- authority;
- custody;
- routing_request;
- acceptance conditions;
- falsification conditions;
- stop conditions.

The following remain future-owned/non-core:

- evidence/context references;
- route record;
- transport bindings;
- execution attempts;
- artifacts/diffs/tests;
- verifier results;
- model identities;
- resulting commits.

This ensures that changing:

- task shape;
- custody class;
- requested routing posture;
- review pressure;
- capability;
- authority;

after AUTHORIZED requires a superseding Work Unit.

---

## 8 · J5.v1 — canonical cognitive router

The canonical successor route module should have an unambiguous name:

`scripts/builder/routing-intelligence-j5-v1.mjs`

This avoids rewriting historical `routing-intelligence.mjs` R1.v1 and avoids treating `routing-intelligence-j6.mjs` as a second permanent canonical router.

The J5.v1 cognitive router remains pure:

- no credentials;
- no Keychain;
- no provider readiness;
- no filesystem;
- no network;
- no model call;
- no authority mutation.

It chooses:

- deterministic capability vs model reasoning;
- evidence posture;
- model family;
- role;
- review topology;
- required authority;
- bounded response-budget profile provenance.

It does **not** choose authority.

It does **not** execute providers.

### 8.1 Stable route participants

Every non-deterministic route participant must have a stable immutable:

`participant_id`

and:

```text
participant_id
model_family
role
review_dimension
required_for_completion
```

Examples:

```text
primary
local-review-1
external-challenge-1
```

W3T and W4.v2 bind to `participant_id`, not array position.

### 8.2 Evidence-backed topology

The contract preserves:

#### CODE_GROUNDED

- primary `QWEN`
- required independent local `GPT_OSS`
- optional explicit Inkling challenger
- Nemotron prohibited absent new evidence

#### ARCHITECTURE_REASONING

- primary `GPT_OSS`
- required independent local `QWEN`
- optional explicit Nemotron frontier challenger

#### EVIDENCE_SYNTHESIS

- primary `GPT_OSS`
- required independent local `QWEN`
- optional explicit Inkling/Nemotron challenge

#### ADVERSARIAL_FALSIFICATION

No invented automatic local primary. Explicit evidence-backed challenge only.

#### LONG_HORIZON_DECOMPOSITION

No invented automatic local primary. Explicit evidence-backed frontier challenge only.

#### FRONTIER_UNKNOWN

No automatic route.

### 8.3 Response-budget provenance

J5.v1 retains evidence-backed profiles:

- Inkling Tinker — 4096, no auto-expand;
- Nemotron Tinker — 4096, no auto-expand;
- Qwen local — adapter-managed bounded profile;
- GPT-OSS local — adapter-managed bounded profile with proven low-reasoning posture metadata.
---

## 9 · W3.v2 — J5 cognitive route binding

Recommended module:

`scripts/builder/work-unit-routing-v2.mjs`

Recommended version:

`ROUTING_BINDING_VERSION = "W3.v2"`

W3.v2 operates only on an AUTHORIZED W0.v2/W2.v2 envelope.

### 9.1 Projection

W3.v2 derives J5 input only from canonical Work Unit fields.

#### Deterministic capability

`identity.capability` is checked against the static canonical deterministic registry by the pure binding layer.

The J5 router receives only:

```text
capability
registered true|false
```

The cognitive router itself remains import-free.

#### Task shape

`identity.task_shape` maps directly to the J5 six-shape vocabulary.

No `mechanical_code/deep_reasoning` collapse occurs.

#### Custody

`custody.evidence_class` maps directly to J5 E0-E4.

#### Review posture

`routing_request.requested_posture` maps to:

- challenge mode;
- frontier posture.

The mandatory J5 local independent topology is never disabled by `default`, `local_only`, or historical `independent_review`.

#### Review pressure

`routing_request.review_pressure` maps directly; W3.v2 does not infer it from work class or ambient state.

### 9.2 Evidence references

W3.v2 retains W3.v1's strong explicit-ref law.

Examples remain typed and exact:

- local-worktree ref bound to exact base SHA;
- external-bundle opaque bounded refs;
- approved-task-text refs.

No whole-repository fallback.

### 9.3 E1 → E3 crossing

The Work Unit may remain:

`custody.evidence_class = E1_REPOSITORY_LOCAL`

while an external route participant receives:

`E3_EXTERNAL_REPO_BUNDLE`

for the exact bounded bundle.

This is a **route evidence projection**, not a mutation of the authorized Work Unit custody class.

E2 cannot cross externally.

E4 external routing is refused.

### 9.4 Authority subset

W3.v2 preserves:

`authority(route) ⊆ authority(work_unit)`

A route requiring:

- external network;
- provider spend;
- exact-bundle disclosure;

cannot bind unless the immutable Work Unit already contains those authorities.

A route may name required authority. It grants none.

### 9.5 W2 ownership

W3.v2 populates only routing output and then calls W2.v2 for:

`AUTHORIZED → ROUTED`

W3.v2 never writes lifecycle state directly.
---

## 10 · W3T.v1 — governed family → transport binding

This is the new architectural primitive.

Recommended module:

`scripts/builder/work-unit-transport-v1.mjs`

Recommended version:

`TRANSPORT_BINDING_VERSION = "W3T.v1"`

W3T operates only on a ROUTED W0.v2/W2.v2 envelope.

It does not change the cognitive route.

It does not change model family.

It does not grant authority.

### 10.1 Transport binding record

Each append-only binding record contains:

```text
transport_binding_id
supersedes_binding_id | null

route_participant_id
model_family
role

provider_id
model_id
adapter_id
transport_posture
execution_mode

response_budget_profile_id
evidence_class

authority_projection:
  repository_read
  network_external
  provider_spend
  external_disclosure

readiness:
  status
  evidence_ref
```

### 10.2 Binding status

`readiness.status` is one of:

- `READY`
- `HOLD`
- `MANUAL_ONLY`
- `REFUSED`

No credential value or secret is stored.

A host may produce a bounded readiness evidence reference after checking:

- provider availability;
- credential readiness;
- network posture;
- adapter availability;
- authority projection.

### 10.3 No family substitution

If the selected family has no admissible transport:

`HOLD`

W3T may not choose another model family.

If Nemotron Tinker is unavailable and Inkling is available, a Nemotron participant remains Nemotron and is held.

### 10.4 Append-only transport history

Bindings are append-only.

A later binding may supersede an earlier HOLD or stale binding through:

`supersedes_binding_id`

The earlier record remains immutable.

W2.v2 considers only the latest non-superseded binding for each required route participant.

### 10.5 Deterministic routes

A deterministic route has no model transport binding.

W2.v2 instead requires the route's exact registered deterministic capability to remain bound for execution admission.
---

## 11 · W2.v2 ROUTED → EXECUTING admission

W2.v2 must be strengthened.

For a non-deterministic route, `ROUTED → EXECUTING` is refused unless every route participant marked:

`required_for_completion = true`

has a valid latest transport binding.

Accepted binding states:

- `READY`;
- `MANUAL_ONLY` where the route explicitly requires a manual-only participant.

Rejected transition states:

- no binding;
- `HOLD`;
- `REFUSED`;
- binding whose model family/role does not match the route participant;
- binding whose authority projection exceeds the Work Unit;
- binding superseded by a newer record.

The transition request names the exact admitted binding ids.

W2 does not inspect credentials itself.

The lower execution adapter must re-check readiness immediately before every actual provider call.

A later credential/provider failure becomes W4 evidence; it never rewrites the route family.

---

## 12 · W4.v2 — family-first execution provenance

Recommended module:

`scripts/builder/work-unit-ledger-v2.mjs`

Recommended version:

`LEDGER_VERSION = "W4.v2"`

W4.v2 preserves W4.v1 append-only history and strengthens identity around family-first routing.

### 12.1 Model identity

A model identity record contains:

```text
model_identity_id
route_participant_id
transport_binding_id

model_family
provider_id
model_id
role
```

Admission requires:

1. route participant exists;
2. `model_family + role` matches that participant;
3. referenced transport binding exists;
4. binding belongs to the same participant/family/role;
5. provider/model match the binding.

W4 therefore no longer expects provider identity to appear inside the cognitive route.

### 12.2 Attempts

Attempts remain append-only.

Statuses remain evidence:

- `completed`
- `failed`
- `refused`
- `rejected`
- `insufficient`
- `escalated`

### 12.3 Retry

A retry preserves the exact governed model identity of its parent.

It does not create independent review.

Changing provider or model identity is not silently relabeled a retry.

### 12.4 Independent review

A model independent review must:

- reference a challenger route participant;
- use a distinct model identity;
- use a **different model_family from the target attempt**.

Two providers from the same model family do not constitute independent cognitive review.

This is the J5 same-family exclusion.

### 12.5 Verifier law

Builder ≠ verifier remains.

Model verifiers required for independent review must use a distinct family from the target attempt.

Human and deterministic verifiers remain valid non-model verification classes according to W4 rules.

Verifier disposition is evidence only.

It is never semantic adjudication.
---

## 13 · Durable provider result → W4 evidence

Canonical v2 execution must have one result-to-attempt mapping.

The durable provider result outranks wrapper/process success.

Recommended precedence:

```text
provider admission refused
  → refused

durable exit_code != 0
  → failed

recommended_next_action = reject
  → rejected

evidence_sufficient = false
  → insufficient

escalation_required = true
  → escalated

otherwise
  → completed
```

The mapping is deterministic and produces a W4.v2 attempt record.

The provider wrapper may not declare success when the durable result is failure.

The result mapper does not transition lifecycle.

### 13.1 W2 after attempt evidence

W2 remains sole lifecycle authority.

A failed/refused/rejected/insufficient/escalated attempt:

- remains permanently in W4 history;
- may lead to retry while EXECUTING;
- may lead to explicit RETURNED or STOPPED;
- cannot be erased by later success.

No legacy `deriveLifecycle()` result may override W2 for W0.v2 Work Units.

---

## 14 · Desktop R3 convergence

The canonical Desktop flow must create canonical W0.v2 Work Units, not parallel legacy packets.

### 14.1 Preview remains prospective

`preview-route` may remain before Work Unit creation.

It is:

- non-authoritative;
- non-persistent;
- non-executing;
- clearly marked preview.

The preview is computed from intended fields.

It does not count as W3 binding.

### 14.2 Canonical creation

Create produces:

`W0.v2 DRAFT`

not an already-route-bound legacy packet.

### 14.3 Authorization

Lifecycle acts move the canonical Work Unit:

`DRAFT → BOUNDED → AUTHORIZED`

through W2.v2.

Route-affecting intent is already frozen in the authorized core.

### 14.4 Canonical route binding

W3.v2 recomputes the route from the exact AUTHORIZED Work Unit.

The bound route, not the preview, is canonical.

A preview/bound-route difference must be shown, not silently ignored.

### 14.5 R3 membrane

After route binding:

- immutable route record persisted;
- `provider_strategy: []` in any legacy compatibility projection;
- Desktop representation remains `execution_connected:false`;
- routed UI exposes no direct provider-run control;
- stale preview protections remain.

### 14.6 Transport binding

W3T.v1 binds exact transports after ROUTED.

The renderer may request a governed action but may not supply:

- provider_id;
- model_id;
- adapter_id;
- credential;
- raw authority envelope.

MAIN/controller derives them from the canonical route and transport binding.

### 14.7 Execution gesture

A future canonical execution action should accept only identifiers such as:

- Work Unit id;
- route participant id or transport binding id;
- explicit human confirmation.

It must not accept an arbitrary provider/model from the renderer.

Execution remains a later gate.

---

## 15 · Legacy compatibility boundary

The current repository contains both canonical W1-W5 and legacy J6/Desktop packet machinery.

This contract defines ownership.

### 15.1 `scripts/builder/work-unit.mjs`

Standing:

**compatibility only** for legacy packet/Work Unit flows.

It may:

- read/project legacy packet status;
- support historical Work Units;
- provide a compatibility execution envelope.

It may not be lifecycle authority for W0.v2.

It may not widen W0.v2 authority.

Its `deriveLifecycle()` output is non-authoritative for W0.v2.

### 15.2 `routing-intelligence.mjs`

Standing:

historical R1.v1 router for W3.v1/W0.v1.

Do not silently replace its semantics.

### 15.3 `routing-intelligence-j6.mjs`

Standing:

proven compatibility/donor implementation.

It is not a second permanent canonical router.

W3.v2 binds the named canonical successor:

`routing-intelligence-j5-v1.mjs`

A later retirement gate may remove redundant router surfaces after all consumers migrate.

### 15.4 Provider adapters

Existing provider adapters may be reused.

For W0.v2 they consume only a deterministic projection from:

- canonical Work Unit authority;
- W3T transport binding.

They may not accept renderer-authored authority as source truth.

### 15.5 `provider_strategy`

For canonical W0.v2 routed work, provider strategy is derived from transport bindings.

It is not a source of routing authority.

If projected into a legacy packet, it is an execution compatibility artifact only.
---

## 16 · Authority / lifecycle ownership map

| Question | Canonical owner |
|---|---|
| What is the work? | W0.v2 |
| Which task shape? | W0.v2 authorized core |
| What evidence custody is admitted? | W0.v2 custody |
| What authority exists? | W0.v2 authority |
| What routing posture was authorized? | W0.v2 routing_request |
| May core fields change after authorization? | W2.v2 — no, supersede instead |
| Deterministic or model reasoning? | J5.v1 route via W3.v2 |
| Which model family/role? | J5.v1 route via W3.v2 |
| May route widen authority? | W3.v2 — no |
| Which provider/model/adapter realizes that family? | W3T.v1 |
| May unavailable transport change family? | W3T.v1 — no |
| May execution begin? | W2.v2 only |
| Was the provider ready/admitted? | transport binding + lower adapter re-check |
| What actually happened in execution? | W4.v2 append-only attempt evidence |
| Is a retry independent? | W4.v2 — no |
| Is verifier independent? | W4.v2 |
| Is evidence sufficient for adjudication? | verifier evidence + explicit adjudication |
| May lifecycle advance? | W2.v2 only |
| Does model consensus create authority? | no |
| May merge/deploy/production occur? | separate explicit authority outside this contract |

---

## 17 · Required future module changes

### Add — versioned canonical successors

1. `scripts/builder/work-unit-v2.mjs`
2. `scripts/builder/work-unit-lifecycle-v2.mjs`
3. `scripts/builder/routing-intelligence-j5-v1.mjs`
4. `scripts/builder/work-unit-routing-v2.mjs`
5. `scripts/builder/work-unit-transport-v1.mjs`
6. `scripts/builder/work-unit-ledger-v2.mjs`

### Add — pure proofs

7. `scripts/builder/__tests__/work-unit-v2-proof.mjs`
8. `scripts/builder/__tests__/work-unit-lifecycle-v2-proof.mjs`
9. `scripts/builder/__tests__/routing-intelligence-j5-v1-proof.mjs`
10. `scripts/builder/__tests__/work-unit-routing-v2-proof.mjs`
11. `scripts/builder/__tests__/work-unit-transport-v1-proof.mjs`
12. `scripts/builder/__tests__/work-unit-ledger-v2-proof.mjs`

### Later composition

13. `scripts/builder/__tests__/work-unit-e2e-v2-proof.mjs`

### Later Desktop convergence

Expected consumers to reconcile in a separate gate:

- `jarvis-desktop/src/main.js`
- `jarvis-desktop/src/operator-work-unit.js`
- `jarvis-desktop/src/work-unit-control.js`
- `jarvis-desktop/src/renderer.js`
- related Desktop tests/preload purpose proof

### Later compatibility adapter reconciliation

Expected seams:

- `scripts/builder/work-unit.mjs`
- `scripts/builder/opencode-provider.mjs`
- `scripts/ain-delegate.sh`

No deletion/retirement is authorized by this contract.
---

## 18 · Falsification plan

The successor implementation must fail these mutants.

### Schema / authorized core

1. W0.v1 object silently treated as W0.v2.
2. W0.v2 accepts `mechanical_code` or `deep_reasoning`.
3. task shape mutated after AUTHORIZED.
4. capability mutated after AUTHORIZED.
5. custody evidence class widened after AUTHORIZED.
6. routing posture/review pressure changed after AUTHORIZED.

### Custody / disclosure

7. E2 continuity externalized.
8. E4 sensitive/production routed externally.
9. E1 external crossing fails to become E3.
10. exact-bundle external execution admitted when Work Unit disclosure is not `exact_bundle`.
11. lower `repo.disclose:external-readonly` act widens canonical authority instead of being a projection.

### Cognitive routing

12. deterministic registered capability still routes to a model.
13. Nemotron admitted for CODE_GROUNDED.
14. CODE_GROUNDED omits GPT-OSS independent local review.
15. same-family retry counts as independent.
16. provider readiness changes the selected model family.
17. cognitive route contains provider_id as identity.

### Transport binding

18. transport binding names a family/role absent from route.
19. transport binding provider/model differs from its governed mapping.
20. unavailable transport silently substitutes another family.
21. HOLD transport admits ROUTED → EXECUTING.
22. superseded transport binding is treated as active.
23. renderer-supplied provider/model becomes canonical binding.
24. binding authority projection exceeds Work Unit authority.

### Ledger / durable result

25. W4.v2 model identity lacks route participant id.
26. model identity references no transport binding.
27. provider/model identity mismatches transport binding.
28. same model family with a different provider is counted as independent review.
29. retry changes governed model identity.
30. builder verifies itself.
31. failed/refused/rejected attempt is rewritten after later success.
32. wrapper exit 0 overrides durable nonzero provider result.
33. model prose such as MERGED/DEPLOYED advances lifecycle.

### Lifecycle

34. W3 writes ROUTED directly instead of W2.
35. W2 admits ROUTED → EXECUTING without required bindings.
36. W2 admits EXECUTING → CLOSED.
37. EVIDENCE_READY/ADJUDICATED prerequisites are bypassed.
38. terminal state reopened.
39. legacy `deriveLifecycle()` overrides W2.v2.

### Desktop / compatibility

40. preview route is persisted as canonical without AUTHORIZED W3 binding.
41. route-bound canonical Work Unit exposes direct provider selector.
42. `provider_strategy` becomes routing authority.
43. legacy packet authority exceeds W0.v2 source authority.
44. stale preview response replaces newer intent.
45. legacy and canonical Work Unit paths both claim lifecycle authority.

---

## 19 · Required red/green probes

Beyond happy-path tests, deliberate mutations must prove load-bearing laws.

At minimum:

1. remove W2.v2 authorized-core custody/routing-request fields → tests red;
2. allow same-family independent review in W4.v2 → tests red;
3. remove family-match check from W3T → tests red;
4. allow HOLD binding to satisfy execution admission → tests red;
5. map `external_disclosure=none` to repository-disclosure compatibility act → tests red;
6. allow renderer provider_id to override binding → Desktop/adapter proofs red;
7. let provider exit 0 override durable `exit_code != 0` → result/ledger proof red;
8. replace J5 family-first route participant with provider-first identity → W3T/W4 interoperability proof red.

---

## 20 · Implementation sequence

### I1 — versioned canonical core

Add only:

- W0.v2;
- W2.v2;
- canonical J5.v1 router module;
- W3.v2;
- W3T.v1;
- their pure proof suites.

No W4.v2 yet.

No Desktop changes.

No provider execution.

Stop at exact-head evidence.

### I2 — provenance convergence

Add W4.v2 and durable-result mapping proofs.

Prove:

- route participant → transport binding → model identity;
- retry/independence;
- builder/verifier separation;
- append-only failure history.

Stop before Desktop.

### I3 — W5.v2 synthetic composition

Run one full synthetic Work Unit:

```text
DRAFT
→ BOUNDED
→ AUTHORIZED
→ J5 ROUTED
→ transport bound
→ EXECUTING
→ failed attempt
→ retry
→ independent verifier
→ EVIDENCE_READY
→ ADJUDICATED
→ CLOSED
```

with red/green mutations.

### I4 — Desktop canonical convergence

Migrate Desktop preview/create/status to canonical W0.v2/W2.v2/W3.v2/W3T.

Legacy path remains compatibility-only until a later retirement gate.

### I5 — explicit execution integration

Only after separate founder authorization.

No execution integration is implied by I1-I4.
---

## 21 · Smallest bounded implementation authorization

The smallest next implementation gate is **I1 only**.

It should not touch W4, Desktop, provider execution, PRs, deployment, or production.

Recommended founder act:

> **AUTHORIZE `JARVIS-ROUTING-INTELLIGENCE-01 / J6-WORK-UNIT-INTEGRATION-02 — I1 VERSIONED CORE + ROUTE/TRANSPORT BINDING ONLY`.**
>
> From the then-current canonical `clean-main-no-secrets`, implement new versioned modules only:
>
> - `work-unit-v2.mjs`
> - `work-unit-lifecycle-v2.mjs`
> - `routing-intelligence-j5-v1.mjs`
> - `work-unit-routing-v2.mjs`
> - `work-unit-transport-v1.mjs`
>
> and their pure deterministic falsification suites.
>
> Preserve all W0.v1/W2.v1/W3.v1/W4.v1 modules and proofs byte-for-byte except for documentary references if strictly required.
>
> Implement exactly the contract in `J6-WORK-UNIT-INTEGRATION-CONTRACT-01_2026-09-18.md` for:
>
> - six immutable J5 task shapes;
> - immutable capability;
> - immutable E0-E4 custody;
> - immutable routing request;
> - deterministic-first routing;
> - J5 family-first route participants with stable participant ids;
> - authority(route) subset of Work Unit authority;
> - E1→E3 route evidence projection;
> - W2 ownership of AUTHORIZED→ROUTED;
> - append-only W3T family→transport bindings;
> - no family substitution;
> - W2 refusal of ROUTED→EXECUTING without valid required transport bindings.
>
> Do not implement W4.v2, durable provider-result mapping, Desktop convergence, provider calls, credentials, external network execution, repository execution, merge, deployment, production access, schema changes, or member-facing MAIA changes.
>
> No paid/live model call is authorized.
>
> Require deliberate red/green falsifiers for:
>
> - authorized-core custody/routing mutation;
> - deterministic-first;
> - E2/E4 external refusal;
> - Nemotron CODE_GROUNDED refusal;
> - missing required local independent family;
> - family-before-transport;
> - transport HOLD;
> - no family substitution;
> - authority-subset violation;
> - ROUTED→EXECUTING without binding.
>
> Stop with a new exact candidate SHA and **`J6-WORK-UNIT-I1-EXACT-HEAD-EVIDENCE-01`**.
>
> Do not open/update a PR, merge, deploy, or touch production.

---

## 22 · Contract standing

**J6-WORK-UNIT-INTEGRATION-CONTRACT-01: COMPLETE AS A CONTRACT CANDIDATE.**

It changes no runtime code.

It creates no new authority.

It performs no provider call or spend.

It does not mutate PR #1383, the J5 donor, canonical W1-W5, database/schema, production, or MAIA member-facing behavior.

Implementation remains closed until a separate founder authorization.
