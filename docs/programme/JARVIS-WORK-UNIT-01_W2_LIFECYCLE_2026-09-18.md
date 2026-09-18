# JARVIS-WORK-UNIT-01 / W2 — Deterministic Lifecycle State Machine

**Date:** 2026-09-18
**Status:** IMPLEMENTED · FALSIFICATION GREEN · AWAITING FOUNDER ADJUDICATION
**Base:** W1 closure commit `add54c8e3f86656fdfc235adab39ae81e54cfed3`

## 1. Authorized boundary

W2 implements only the deterministic Work Unit lifecycle law authorized by the Founder:

```text
DRAFT → BOUNDED → AUTHORIZED → ROUTED → EXECUTING →
EVIDENCE_READY → ADJUDICATED → CLOSED
```

with exit states:

```text
STOPPED
RETURNED
SUPERSEDED
```

and with no `EXECUTING → CLOSED` shortcut.

W2 does not call providers, inspect credentials, access external networks, execute repository work through JARVIS, merge, deploy, or access production.

## 2. Runtime shape

W2 wraps the canonical W1 Work Unit in a pure lifecycle envelope:

```text
LifecycleEnvelopeV1 {
  work_unit
  guard {
    lifecycle_version
    work_unit_id
    current_state
    authorized_core_snapshot
  }
}
```

The guard is not a new authority surface. It is a deterministic conformance instrument used to detect mutation of the already-authorized core.

Before `AUTHORIZED`:

```text
authorized_core_snapshot = null
```

When entering `AUTHORIZED`, W2 captures the canonical authorized core.

Every later transition compares the current core to that snapshot and fails closed if they differ.

## 3. Authorized core

The W2 authorized-core snapshot contains:

### Identity

- id
- programme
- parent_work_unit
- objective
- work_class
- task_shape

### Scope

- repository
- base_ref
- allowed_paths
- forbidden_paths

### Authority

- repository_read
- repository_write
- shell
- network_external
- provider_spend
- external_disclosure
- merge
- deploy
- production_read
- production_write

### Evaluation law

- acceptance_conditions
- falsification_conditions
- stop_conditions

The following are intentionally not part of the immutable authorized core because later gates must be able to populate them without widening authority:

- context/evidence references;
- route record and selected model roles;
- execution attempts/artifacts/diffs/test results;
- verifier results;
- model provenance and resulting commits.

This allows W3 and W4 to add governed evidence while W2 continues to detect any mutation of the actual authority-bearing contract.

## 4. Transition request

Every W2 transition requires explicit structured evidence:

```text
{
  to
  evidence_ref
  reason_code
}
```

Special transitions add only their bounded fields:

### Entering AUTHORIZED

```text
authorization_ref
```

If a pre-existing `provenance.authorizing_act` conflicts with the supplied authorization reference, W2 refuses.

### Entering ADJUDICATED

```text
adjudication = accepted
```

Rejected/returned/stopped outcomes do not masquerade as accepted adjudication; they use the explicit exit states.

### Entering SUPERSEDED

```text
superseded_by
```

Self-supersession is refused.

Unknown transition fields fail closed instead of being silently ignored.

## 5. Transition prerequisites

### DRAFT → BOUNDED

Requires a valid W1 Work Unit and explicit transition evidence.

### BOUNDED → AUTHORIZED

Requires an explicit authorization reference.

### AUTHORIZED → ROUTED

Requires:

- a bound router version;
- a structured route record;
- unchanged authorized core.

W3 will own actual route binding.

### ROUTED → EXECUTING

Requires the bound route record to remain present.

### EXECUTING → EVIDENCE_READY

Requires at least one recorded execution attempt.

W4 will own the durable append-only attempt ledger.

### EVIDENCE_READY → ADJUDICATED

Requires:

- at least one verifier result;
- explicit accepted adjudication.

### ADJUDICATED → CLOSED

Is the only successful closure path.

## 6. Terminal-state law

`CLOSED`, `STOPPED`, `RETURNED`, and `SUPERSEDED` are sealed terminal states.

No later transition is admitted from them.

## 7. Falsification evidence

Green suite:

```text
27 passed · 0 failed
```

The suite proves, among other things:

- W1 DRAFT is the only valid lifecycle-entry state;
- no state may skip the canonical spine;
- authorization reference is mandatory;
- bound route is required before ROUTED;
- attempt evidence is required before EVIDENCE_READY;
- verifier evidence is required before ADJUDICATED;
- only accepted adjudication reaches ADJUDICATED;
- `EXECUTING → CLOSED` is impossible;
- terminal states are sealed;
- STOPPED / RETURNED / SUPERSEDED are explicit exits;
- authority mutation after AUTHORIZED is refused;
- objective mutation after AUTHORIZED is refused;
- evaluation-law mutation after AUTHORIZED is refused;
- non-core context/evidence may evolve;
- lifecycle guard/state mismatch fails closed;
- unknown transition fields fail closed;
- transition records are deterministic and inspectable.

## 8. Red/green discrimination

Two disposable mutation probes were run outside the repository worktree.

### Probe A — illegally admit EXECUTING → CLOSED

Mutation:

```text
EXECUTING: EVIDENCE_READY
        ↓
EXECUTING: CLOSED
```

Result:

```text
20 passed · 7 failed
```

The proof suite went red, including the explicit no-shortcut test and downstream lifecycle tests.

### Probe B — disable the authorized-core mutation guard

Mutation disabled the comparison between the current authorized core and the stored snapshot.

Result:

```text
24 passed · 3 failed
```

The suite went red on:

- authority mutation;
- objective mutation;
- evaluation-law mutation.

Both probes therefore discriminate the load-bearing W2 laws rather than merely confirming a happy path.

## 9. Current standing

W2 implementation and mechanical falsification are complete.

No provider or model review was run because the Founder W2 grant explicitly forbids provider calls.

Therefore this record does **not** self-declare W2 closed.

Current standing:

```text
W2 IMPLEMENTED
W2 FALSIFICATION GREEN
W2 FOUNDER ADJUDICATION OWED
W3 NOT YET OPEN
```
