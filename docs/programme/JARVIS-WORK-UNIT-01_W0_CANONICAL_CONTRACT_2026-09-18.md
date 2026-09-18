# JARVIS-WORK-UNIT-01 / W0 — Canonical Work Unit Contract

**Date:** 2026-09-18
**Status:** RATIFIED FOR W1 IMPLEMENTATION
**Base authority:** Founder continuation of the ordered JARVIS engineering sequence after Routing Intelligence adjudication and J3-B closure.
**Scope:** Work Unit contract only. No provider execution, merge, deploy, production access, or authority widening is granted by this record.

## 1. Purpose

A Work Unit is the governed container inside which JARVIS may reason about, route, execute, verify, and eventually deliver a bounded piece of work.

A Work Unit is **not an agent** and is not a grant of ambient autonomy.

The canonical control flow is:

```text
Human Intent
    ↓
Work Unit
    ↓
Routing
    ↓
Execution
    ↓
Independent Evidence
    ↓
Adjudication
```

The model never owns the work. The Work Unit owns the boundaries.

## 2. Canonical domains

### Identity

- `id`
- `programme`
- `parent_work_unit`
- `objective`
- `work_class`
- `task_shape`

### Context

- `context_refs[]`
- `evidence_refs[]`
- `assumptions[]`
- `unknowns[]`

### Scope

- `repository`
- `base_ref`
- `allowed_paths[]`
- `forbidden_paths[]`

### Authority

- `repository_read`
- `repository_write`
- `shell`
- `network_external`
- `provider_spend`
- `external_disclosure`
- `merge`
- `deploy`
- `production_read`
- `production_write`

### Routing

- `requested_posture`
- `router_version`
- `route_record`
- `primary`
- `challengers[]`

### Execution

- `attempts[]`
- `artifacts[]`
- `diffs[]`
- `test_results[]`

### Evaluation

- `acceptance_conditions[]`
- `falsification_conditions[]`
- `stop_conditions[]`
- `verifier_results[]`

### Provenance

- `creator`
- `authorizing_act`
- `source_commits[]`
- `model_identity[]`
- `resulting_commits[]`
- `timestamps[]`

### State

- `lifecycle_state`
- `disposition`
- `supersedes`

## 3. Work classification

`work_class` answers what kind of change is being attempted:

- `RESEARCH`
- `PATCH`
- `REFACTOR`
- `REBUILD`
- `ARCHITECTURE`
- `VERIFICATION`
- `DELIVERY`

`task_shape` answers the routing problem:

- `mechanical_code`
- `deep_reasoning`

These are independent.

A Work Unit may therefore be, for example:

```text
work_class = REBUILD
task_shape = deep_reasoning
```

This distinction is intended to prevent an implementation agent from treating a required rebuild as an incremental patch.

## 4. Lifecycle

The canonical lifecycle is:

```text
DRAFT
  ↓
BOUNDED
  ↓
AUTHORIZED
  ↓
ROUTED
  ↓
EXECUTING
  ↓
EVIDENCE_READY
  ↓
ADJUDICATED
  ↓
CLOSED
```

Non-success exits:

- `STOPPED`
- `RETURNED`
- `SUPERSEDED`

There is no direct `EXECUTING → CLOSED` transition.

W2 will implement and falsify the transition law. W0 defines it only.

## 5. Constitutional invariants

### W-I1 — No ambient authority

A Work Unit possesses only authority explicitly recorded inside its authority block.

Unknown fields, environment state, credentials, network availability, model availability, or surrounding process state cannot enlarge authority.

### W-I2 — Routing cannot widen authority

A route may name authority that would be required for a later act.

A route cannot grant it.

For any Work Unit `W` and route `R(W)`:

```text
authority(R(W)) ⊆ authority(W)
```

### W-I3 — Authorized core becomes immutable

Once a Work Unit reaches `AUTHORIZED`, changing objective, work class, task shape, scope, authority, acceptance conditions, falsification conditions, or stop conditions requires a new superseding Work Unit.

W2 owns this law.

### W-I4 — Attempts are append-only

Failed, refused, partial, or rejected attempts remain part of provenance.

Later success cannot rewrite earlier evidence.

W4 owns the attempt ledger.

### W-I5 — Retry is not independent review

Repeating the same provider role does not create an independent challenger.

### W-I6 — Builder cannot certify itself

Significant architecture, security, production, research, or high-value uncertain work requires independent evaluation according to the routing and evaluation policy.

### W-I7 — Delivery is distinct from implementation

```text
code exists
≠ merged
≠ deployed
≠ production witnessed
≠ canonical
```

No earlier state implies a later one.

## 6. W1 implementation boundary

W1 implements exactly:

1. a pure deterministic authorized-core validator;
2. deterministic normalization into an immutable `DRAFT` Work Unit;
3. fail-closed typed blockers for malformed, contradictory, or unbounded core input;
4. structural proof that the module has no execution, network, credential, filesystem, clock, randomness, routing, lifecycle-transition, merge, deploy, or production side effects.

W1 does **not** implement:

- lifecycle transitions;
- authorization acts;
- provider/model routing;
- provider execution;
- retry;
- attempt recording;
- verifier recording;
- repository mutation beyond the W1 implementation branch;
- merge;
- deploy;
- production reads or writes.

## 7. W1 authority semantics

`allowed_paths[]` defines the bounded repository scope available to the Work Unit. It may therefore be non-empty for a read-only Work Unit.

Repository write authority is one of:

- `none`
- `worktree`

If `repository_read = true`, at least one bounded repository-relative `allowed_path` is required.

If `repository_write = worktree`, `repository_read` must also be true and the same bounded path scope governs the admitted repository surface.

Whole-repository path grants and parent traversal forms are refused.

External disclosure is one of:

- `none`
- `task_text_only`
- `exact_bundle`

External disclosure or provider spend requires explicit `network_external = true`.

The schema does not infer authority from work class.

## 8. W1 deterministic draft rule

A valid W1 input produces:

```text
lifecycle_state = DRAFT
disposition = open
```

and empty future-owned fields:

```text
route_record = null
attempts = []
artifacts = []
diffs = []
test_results = []
verifier_results = []
model_identity = []
resulting_commits = []
timestamps = []
```

W1 cannot populate those fields from ambient state.

## 9. Successor sequence

After W1 proof:

```text
W2  deterministic lifecycle state machine
 ↓
W3  Routing Intelligence binding
 ↓
W4  append-only attempt + evidence ledger
 ↓
W5  synthetic end-to-end Work Unit witness
 ↓
RGR-01 first real research / engineering programme
```

No successor gate is authorized by W0 merely because it is named here.

## 10. W1 closure adjudication — 2026-09-18

Founder adjudication closes W1 on the following evidence:

- the W1 pure schema and validator are implemented on exact canonical base
  `a5a5fb65483b8957cd5bcdb17e7af934b7194276`;
- 22 / 22 deterministic falsification cases pass;
- syntax and staged-diff checks pass;
- GPT-OSS independent review returned `ACCEPT` with no findings;
- the Qwen challenger returned `RETURN`, but each of its four stated defects was
  directly falsified against the inspected source and proof suite:
  - `identity.objective` is required and normalized;
  - `work_class` is checked against the canonical enum;
  - `task_shape` is checked against the canonical enum;
  - acceptance, falsification, and stop condition lists are each required and tested.

The Qwen result is therefore classified **EVIDENCE-INVALID**, not as a substantive
architecture disagreement. No semantic winner is selected between competing
interpretations; the challenger claims failed source-grounding.

**W1 standing: CLOSED.**

Founder authorization opens:

**JARVIS-WORK-UNIT-01 / W2 — Deterministic Lifecycle State Machine only.**

W2 may implement and falsify:

```text
DRAFT → BOUNDED → AUTHORIZED → ROUTED → EXECUTING →
EVIDENCE_READY → ADJUDICATED → CLOSED
```

with `STOPPED`, `RETURNED`, and `SUPERSEDED` exits, no
`EXECUTING → CLOSED` shortcut, and authorized-core immutability across lifecycle
transitions.

W2 does not authorize provider calls, credential access, external network access,
JARVIS execution of repository work, merge, deploy, or production access.
