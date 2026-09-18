# JARVIS-WORK-UNIT-01 / W3 — Pure Routing Binding

**Date:** 2026-09-18
**Status:** IMPLEMENTED · RED/GREEN FALSIFICATION GREEN · AWAITING FOUNDER ADJUDICATION
**Base:** W2 candidate commit `c8dbf997eb95da5da10f0c547cb2a464c09dc2c5`
**Ratified router source:** `0c410ce4d62258c56e2871b88be235e22363297e`
**Ratified router SHA-256:** `2837520e2f4e27aed067a84a2f8148a8b1be2436f71a57aa21a4c06d72316b4f`

## 1. Authorized boundary

W3 implements only pure routing binding:

```text
AUTHORIZED Work Unit
        ↓
canonical routing projection
        ↓
pure routeIntelligence()
        ↓
authority-subset proof
        ↓
bind routing domain
        ↓
W2 transitionLifecycleV1()
        ↓
ROUTED
```

W3 does not call providers or models, inspect credentials or Keychain, access
external networks, execute OpenCode or Tinker, execute repository work, write
attempts or verifier results, choose a semantic winner, merge, push, deploy, or
access production.

## 2. Exact Routing Intelligence provenance

The ratified pure Routing Intelligence source was copied byte-for-byte from
`JARVIS-ROUTING-INTELLIGENCE-01 / R2`.

The W3 proof computes the copied module SHA-256 and requires:

```text
2837520e2f4e27aed067a84a2f8148a8b1be2436f71a57aa21a4c06d72316b4f
```

Any source drift makes the W3 provenance proof fail.

## 3. Canonical Work Unit → router projection

W3 derives router input only from canonical Work Unit fields.

### Task shape

```text
work_unit.identity.task_shape
  → router.task_shape
```

### Review pressure

W3 does not invent `high_value_uncertain`.

Because W0 contains no canonical review-pressure field, W3 derives:

```text
review_pressure = ordinary
```

for every current posture.

A future high-value/uncertain route requires a separately ratified canonical
field; W3 does not infer it from work class, authority, or provider availability.

### Requested posture

```text
default
local_only
  → challenge_mode = none

independent_review
  → challenge_mode = none
  → explicit_independent_review = true

adversarial_challenge
  → challenge_mode = adversarial

frontier_text
  → challenge_mode = frontier
  → frontier_posture = text_only_manual

frontier_repository
  → challenge_mode = frontier
  → frontier_posture = repository_grounded
```

## 4. Load-bearing authority narrowing

The Work Unit may hold bounded repository-write authority for later execution.

Routing does not inherit it.

W3 always derives:

```text
router.authority.repo_write_scope = none
```

even when:

```text
work_unit.authority.repository_write = worktree
```

Therefore routing remains a read-only review act.

The Work Unit authority block is not mutated.

## 5. Canonical evidence references

W3 recognizes only explicit references already carried in
`work_unit.context.evidence_refs[]`.

### Local worktree evidence

```text
local-worktree:<exact base SHA>
```

The SHA must equal `work_unit.scope.base_ref`.

Without this exact evidence reference, the pure router receives
`local_worktree_available = false` and fails closed.

### External exact bundle

```text
external-bundle:<opaque bounded evidence ref>
```

Only these refs become `external_bundle_refs[]`.

No whole-repository fallback exists.

### Founder-approved task text

```text
approved-task-text:<opaque evidence ref>
```

Only this explicit evidence form permits
`task_text_available = true`.

## 6. External disclosure law

### Adversarial challenge

Requires Work Unit authority:

```text
network_external = true
provider_spend = true
external_disclosure = exact_bundle
```

and at least one `external-bundle:` evidence reference.

### Frontier repository challenge

Requires the same authority and exact-bundle evidence.

### Frontier text/manual

Requires:

```text
network_external = true
external_disclosure = task_text_only | exact_bundle
```

and an `approved-task-text:` evidence reference.

The resulting Zen route may be bound with
`execution_disposition = manual_only`.

W3 performs no external execution.

## 7. Deterministic route binding

For one derived routing input, W3 calls the pure router twice:

```text
first  = routeIntelligence(input)
second = routeIntelligence(input)
```

The two route records must be byte-equivalent under deterministic JSON
serialization.

Otherwise W3 fails with:

```text
NONDETERMINISTIC_ROUTE
```

## 8. Route authority subset proof

W3 independently proves:

```text
authority(route) ⊆ authority(work_unit)
```

The proof checks:

- Work Unit repository-read authority exists;
- `route.granted_authority` is exactly empty;
- every route-required `network.external` act already exists;
- every route-required `provider.spend` act already exists;
- every required repository disclosure is already authorized as
  `external_disclosure = exact_bundle`;
- unknown route authority names fail closed.

If the subset proof fails, the route is not bound.

## 9. Router blocker law

W3 refuses binding if the pure router:

- returns no structured route;
- returns a route-version mismatch;
- lacks a structured primary/challenger shape;
- returns any blocker;
- returns `refused`;
- returns `held_for_external_authority`;
- requests authority absent from the Work Unit.

Router blockers are carried forward as typed W3 evidence.

## 10. Lifecycle seam

W3 may bind only a W2 envelope whose:

```text
work_unit.state.lifecycle_state = AUTHORIZED
guard.current_state = AUTHORIZED
authorized_core_snapshot = current authorized core
```

The routing domain must still be unbound.

W3 populates only:

```text
routing.router_version
routing.route_record
routing.primary
routing.challengers
```

It then calls:

```text
transitionLifecycleV1(..., to = ROUTED)
```

W3 contains no direct assignment to `state.lifecycle_state`.

W2 therefore remains sole lifecycle authority.

## 11. Green proof

Final W3 suite:

```text
28 passed · 0 failed
```

Regression suites remain:

```text
W1  22 passed · 0 failed
W2  27 passed · 0 failed
```

The ratified Routing Intelligence module also remains subject to its original R2
proof suite.

## 12. Red/green falsification

Three disposable mutations were run outside the governed worktree.

### Probe A — remove read-only routing narrowing

Mutation:

```text
repo_write_scope = none
        ↓
repo_write_scope = work_unit.repository_write
```

Result:

```text
16 passed · 12 failed
```

The suite detected inheritance of worktree-write authority.

### Probe B — force authority-subset proof true

Mutation:

```text
subset = (missing.length === 0)
        ↓
subset = true
```

Result:

```text
27 passed · 1 failed
```

The explicit no-widening proof went red.

### Probe C — directly assign ROUTED before W2 transition

Mutation inserted:

```text
bound.work_unit.state.lifecycle_state = ROUTED
```

before `transitionLifecycleV1()`.

Result:

```text
16 passed · 12 failed
```

The W2 seam assertion and downstream routing bindings failed.

All three load-bearing W3 laws therefore discriminate.

## 13. Current standing

```text
W1 CLOSED
W2 CLOSED by Founder adjudication
W3 IMPLEMENTED
W3 GREEN: 28 / 28
W3 RED PROBES: 3 / 3 discriminating
W3 FOUNDER ADJUDICATION OWED
W4 NOT OPEN
```

No W4 attempt/evidence ledger work is authorized by this record.

## 14. Founder adjudication — W3 closure and W4 opening

**Founder act:** 2026-09-18

The Founder accepts W3 candidate commit
`25f4bc1bceebcaebbbac7df4b31eb945f09fd120` and the recorded evidence:

- W1 regression: 22 / 22 passing;
- W2 lifecycle: 27 / 27 passing;
- ratified Routing Intelligence R2: 20 / 20 passing;
- W3 pure routing binding: 28 / 28 passing;
- exact ratified router provenance preserved at SHA-256
  `2837520e2f4e27aed067a84a2f8148a8b1be2436f71a57aa21a4c06d72316b4f`;
- sovereignty/pre-commit gates green;
- routing narrows repository authority to read-only;
- route authority is independently proven to be a subset of Work Unit authority;
- `AUTHORIZED → ROUTED` remains under W2 lifecycle authority;
- three deliberate W3 mutations made the suite red;
- locally tracked canonical freshness had zero true file overlap with W1/W2/W3;
- no provider/model call, credential access, external network action, repository
  execution, merge, push, deployment, or production access occurred during W3.

**W3 standing: CLOSED.**

The Founder authorizes **W4 — PURE APPEND-ONLY ATTEMPT + EVIDENCE LEDGER ONLY**.

W4 may implement pure deterministic immutable append operations for:

- `execution.attempts`
- `execution.artifacts`
- `execution.diffs`
- `execution.test_results`
- `evaluation.verifier_results`
- `provenance.model_identity`
- `provenance.resulting_commits`

W4 must preserve append-only history, stable attempt/verifier identity,
retry ≠ independent review, builder ≠ verifier, evidence-without-authority,
authorized-core immutability, no retrospective repair, deterministic duplicate
refusal, lifecycle compatibility, and no semantic-winner authority.

W4 may not call providers/models, inspect credentials, access external networks,
execute OpenCode/Tinker/shell/repository work, mutate routing, mutate the
authorized core, transition lifecycle state, merge, push, deploy, or access
production.

W4 stops after its pure-ledger implementation and red/green falsification
witness. W5 is not opened by this adjudication.
