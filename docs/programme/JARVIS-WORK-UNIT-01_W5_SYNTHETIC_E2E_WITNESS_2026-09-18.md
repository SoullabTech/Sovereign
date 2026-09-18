# JARVIS-WORK-UNIT-01 / W5 — Synthetic End-to-End Work Unit Witness

**Date:** 2026-09-18
**Status:** SYNTHETIC WITNESS GREEN · RED/GREEN FALSIFICATION GREEN · AWAITING FOUNDER ADJUDICATION
**Base:** W4 candidate commit `83019a4ab7d97115bc2d9fc53bf50ebee3ef0b1a`

## 1. Authorized boundary

W5 is a composition witness only.

It adds no new runtime Work Unit capability and no new authority surface.

The witness exercises only the already-established modules:

```text
W1  pure Work Unit schema
W2  deterministic lifecycle
W3  pure routing binding
W4  append-only evidence ledger
```

No provider/model is called.

No credentials are inspected.

No external network is accessed.

No OpenCode, Tinker, shell work, repository work, merge, push, deployment, or
production access occurs through the synthetic Work Unit.

RGR-01 remains closed.

## 2. Synthetic payload

The witness uses an entirely synthetic Work Unit:

```text
repository:
  synthetic/JARVIS-W5-WITNESS

base_ref:
  5555555555555555555555555555555555555555

resulting_commit:
  6666666666666666666666666666666666666666
```

The payload contains:

- no member data;
- no PHI;
- no production data;
- no real repository evidence;
- no real repository commit SHA as evidence;
- no external challenge;
- no network authority;
- no provider spend authority;
- no deployment or production authority.

Configured provider/model names appear only as synthetic routed provenance
labels. No inference request is made.

## 3. End-to-end sequence

The green witness executes this exact composition:

```text
W1
DRAFT
  ↓
W2
BOUNDED
  ↓
AUTHORIZED
  ↓
W3
ROUTED
  ↓
W4
register routed model identities
  ↓
W2
EXECUTING
  ↓
W4
failed primary attempt
  ↓
successful retry
  ↓
synthetic artifact
  ↓
synthetic diff
  ↓
synthetic test result
  ↓
synthetic resulting commit
  ↓
distinct challenger verifier evidence
  ↓
W2
EVIDENCE_READY
  ↓
ADJUDICATED
  ↓
CLOSED
```

W4 never advances lifecycle state.

W2 remains sole lifecycle authority.

## 4. Failure history deliberately included

The synthetic primary attempt is recorded as:

```text
status = failed
attempt_kind = initial
```

A later attempt is recorded as:

```text
status = completed
attempt_kind = retry
parent_attempt_id = failed initial attempt
```

The final CLOSED witness proves:

- both attempts remain present;
- original ordering remains present;
- the failed attempt remains byte-equivalent to its pre-retry snapshot;
- later success does not rewrite or conceal the failure.

This makes the append-only history law part of the positive end-to-end witness,
not only a negative unit test.

## 5. Distinct verifier provenance

The successful retry carries synthetic primary provenance:

```text
provider_id = gpt-oss-local
model_id = synthetic-gpt-oss-identity
role = deep_reasoning_primary
```

The verifier carries a distinct routed challenger identity:

```text
provider_id = qwen-local
model_id = synthetic-qwen-identity
role = independent_local_challenger
```

The verifier:

- has a distinct verifier id;
- targets the successful retry;
- does not share provider/model/role identity with the builder;
- records evidence disposition only;
- does not adjudicate semantic truth.

No model is called.

## 6. Final CLOSED evidence

The final CLOSED envelope retains:

### Exact authorized core

The W2 authorized-core snapshot captured at `AUTHORIZED` remains byte-equivalent
to the authorized core computed from the final CLOSED Work Unit.

### Exact route provenance

The final Work Unit retains the bound W3 routing domain, including:

```text
router_version = R1.v1
primary = gpt-oss-local / deep_reasoning_primary
challenger = qwen-local / independent_local_challenger
```

No route field is altered by W4 evidence or W2 closure.

### Complete evidence history

The final Work Unit retains:

```text
2 model identities
2 attempts
1 artifact
1 diff
1 test result
1 verifier result
1 resulting commit
```

### Lifecycle transition evidence

W2 returns an immutable transition record for every successful lifecycle move.

W5 retains those records in the synthetic witness artifact alongside the final
CLOSED lifecycle envelope.

The exact retained transition sequence is:

```text
DRAFT → BOUNDED
BOUNDED → AUTHORIZED
AUTHORIZED → ROUTED
ROUTED → EXECUTING
EXECUTING → EVIDENCE_READY
EVIDENCE_READY → ADJUDICATED
ADJUDICATED → CLOSED
```

W5 does **not** add a new transition-history field to the Work Unit schema. Doing
so would exceed the W5 grant to use only W1-W4.

The transition evidence is therefore part of the immutable W5 witness artifact,
not a new canonical W1 field.

## 7. Deterministic replay

The complete synthetic sequence is executed twice from identical structured
input.

The two witness objects must be byte-equivalent under deterministic JSON
serialization.

This includes:

- final lifecycle envelope;
- final Work Unit;
- lifecycle guard;
- routing record;
- all evidence ledgers;
- failed attempt history;
- verifier provenance;
- all seven transition records;
- witness invariant snapshots.

Green result:

```text
identical input
→ byte-equivalent semantic W5 witness
```

## 8. Required end-to-end falsification cases

The W5 suite contains all eight Founder-required negative cases.

### W5-F1 — skipping AUTHORIZED

A BOUNDED Work Unit is passed to W3 routing binding.

Expected:

```text
AUTHORIZED_WORK_UNIT_REQUIRED
```

Result: fail closed.

### W5-F2 — executing without a bound W3 route

An AUTHORIZED Work Unit attempts execution without routing.

Expected:

```text
ILLEGAL_LIFECYCLE_TRANSITION
```

An AUTHORIZED Work Unit also attempts `ROUTED` without a bound route.

Expected:

```text
BOUND_ROUTE_REQUIRED
```

Both fail closed.

### W5-F3 — EVIDENCE_READY without an attempt

A correctly ROUTED/EXECUTING Work Unit with no attempt tries to reach
`EVIDENCE_READY`.

Expected:

```text
EXECUTION_ATTEMPT_REQUIRED
```

Result: fail closed.

### W5-F4 — ADJUDICATED without verifier evidence

A Work Unit with an attempt but no verifier enters `EVIDENCE_READY`, then tries
to reach `ADJUDICATED`.

Expected:

```text
VERIFIER_RESULT_REQUIRED
```

Result: fail closed.

The witness also proves that once a Work Unit prematurely enters
`EVIDENCE_READY`, W4 cannot append a late verifier result. The system must use
an explicit exit/supersession rather than retroactively repairing the evidence
sequence.

### W5-F5 — EXECUTING → CLOSED

Expected:

```text
ILLEGAL_LIFECYCLE_TRANSITION
```

Result: fail closed.

### W5-F6 — authorized-core mutation

After authorization, synthetic deploy authority is mutated.

W3 refuses routing with:

```text
AUTHORIZED_CORE_MUTATED
```

### W5-F7 — retrospective ledger rewrite

An existing attempt id is resubmitted with changed historical status/evidence.

Expected:

```text
CONFLICTING_ATTEMPT_RECORD
```

The earlier record remains unchanged.

### W5-F8 — evidence creates authority

An artifact evidence record attempts to include:

```text
deploy = true
```

Expected:

```text
UNKNOWN_LEDGER_FIELD
```

The Work Unit authority remains:

```text
deploy = false
```

## 9. Green W5 proof

Final W5 composition suite:

```text
22 passed · 0 failed
```

The suite includes:

- 2 structural/synthetic-boundary controls;
- 10 positive end-to-end closure proofs;
- all 8 required negative falsification cases;
- 2 supplementary composition controls.

## 10. Integrated mutation probes

Five disposable composition mutations were run outside the governed worktree.

### Probe A — allow EXECUTING → CLOSED

Mutation changes the W2 spine:

```text
EXECUTING → EVIDENCE_READY
```

to:

```text
EXECUTING → CLOSED
```

Result:

```text
7 passed · 15 failed
```

The complete positive closure witness and shortcut falsification go red.

### Probe B — remove verifier prerequisite

The W2 check requiring verifier evidence before `ADJUDICATED` is disabled.

Result:

```text
21 passed · 1 failed
```

Only:

```text
W5-F4 — ADJUDICATED without verifier evidence
```

fails.

### Probe C — allow conflicting ledger-id rewrite

W4 duplicate/conflicting record detection is disabled.

Result:

```text
21 passed · 1 failed
```

Only:

```text
W5-F7 — retrospective ledger rewrite
```

fails.

### Probe D — admit unknown evidence fields

W4 exact evidence-field enforcement is disabled.

Result:

```text
21 passed · 1 failed
```

Only:

```text
W5-F8 — evidence cannot create authority
```

fails.

### Probe E — let routing inherit Work Unit write authority

W3 read-only narrowing is replaced with inherited Work Unit write authority.

Result:

```text
5 passed · 17 failed
```

The integrated route and closure path goes red.

All five mutations therefore discriminate at W5 composition level.

## 11. Full regression obligation

Before W5 candidate closure, the complete stack must remain green:

```text
W1 schema
W2 lifecycle
Routing Intelligence R2
W3 routing binding
W4 evidence ledger
W5 synthetic end-to-end witness
```

## 12. Current standing

```text
W1 CLOSED
W2 CLOSED
W3 CLOSED
W4 CLOSED by Founder adjudication
W5 SYNTHETIC WITNESS GREEN: 22 / 22
W5 REQUIRED FALSIFICATION: 8 / 8
W5 MUTATION PROBES: 5 / 5 discriminating
W5 DETERMINISTIC REPLAY: PASS
W5 FOUNDER ADJUDICATION OWED
RGR-01 CLOSED
```

No RGR-01 work is authorized by this record.
