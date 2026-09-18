# JARVIS-WORK-UNIT-01 / W4 — Append-Only Attempt + Evidence Ledger

**Date:** 2026-09-18
**Status:** IMPLEMENTED · RED/GREEN FALSIFICATION GREEN · AWAITING FOUNDER ADJUDICATION
**Base:** W3 candidate commit `25f4bc1bceebcaebbbac7df4b31eb945f09fd120`

## 1. Authorized boundary

W4 implements only pure deterministic immutable evidence append operations.

It may append records to:

```text
execution.attempts
execution.artifacts
execution.diffs
execution.test_results
evaluation.verifier_results
provenance.model_identity
provenance.resulting_commits
```

W4 does not:

- call providers or models;
- inspect credentials or Keychain;
- access external networks;
- execute OpenCode, Tinker, shell, or repository work;
- mutate routing;
- mutate Work Unit identity, scope, authority, acceptance law, falsification law,
  or stop law;
- transition lifecycle state;
- merge;
- push;
- deploy;
- access production.

## 2. Pure append operation

W4 exposes one canonical operation:

```text
appendLedgerRecordV1(envelope, {
  kind,
  entry
})
```

The function:

1. validates lifecycle compatibility;
2. validates exact record shape;
3. validates record provenance against the bound W3 route;
4. validates duplicate/conflict rules;
5. clones the existing lifecycle envelope;
6. appends one immutable record;
7. proves authorized core, routing, lifecycle state, lifecycle disposition, and
   W2 guard are byte-equivalent before and after;
8. deep-freezes the result.

W4 never mutates the supplied envelope.

## 3. Lifecycle compatibility

W4 follows the Founder grant literally.

### ROUTED

Only model identity may be registered:

```text
provenance.model_identity
```

This allows the exact provider/model/role identity to be fixed before an attempt
is later recorded.

### EXECUTING

W4 may append:

```text
model_identity
attempt
artifact
diff
test_result
verifier_result
resulting_commit
```

No execution evidence is appended before `EXECUTING`.

No W4 append is admitted after `EXECUTING`.

Therefore verifier evidence needed by W2 is collected while the Work Unit is
still `EXECUTING`, after the attempt it evaluates already exists. W4 does not
advance lifecycle state. A later W2 act may move the fully populated Work Unit to
`EVIDENCE_READY`, then to `ADJUDICATED`.

This keeps W4 inside the explicit ROUTED/EXECUTING grant and preserves W2 as sole
lifecycle authority.

## 4. Model identity

Each model identity is immutable:

```text
{
  model_identity_id
  provider_id
  model_id
  role
}
```

The `provider_id + role` pair must already exist in the bound W3 route.

Model identity cannot introduce a provider or role absent from routing.

## 5. Attempt identity

Every attempt records:

```text
{
  attempt_id
  model_identity_id
  provider_id
  model_id
  role
  attempt_kind
  parent_attempt_id
  status
  evidence_refs[]
}
```

Attempt kinds:

```text
initial
retry
independent_review
```

Attempt statuses are evidence only:

```text
completed
failed
refused
rejected
insufficient
escalated
```

An attempt must:

- reference an existing model identity;
- match that identity exactly on provider/model/role;
- match a provider/role already present in the W3 route.

## 6. Retry ≠ independent review

### Initial

```text
attempt_kind = initial
parent_attempt_id = null
```

### Retry

A retry must point to an existing parent attempt and preserve the exact:

```text
provider_id
model_id
role
```

A retry may add evidence. It does not create an independent second opinion.

### Independent review

An independent review must:

- point to an existing parent attempt;
- use a distinct provider/model/role identity;
- use a challenger role already present in the bound route.

The same governed identity cannot be relabeled `independent_review`.

## 7. Append-only history

W4 appends one record at the end of the selected ledger.

Existing entries are not editable through W4.

A later successful retry therefore cannot alter an earlier:

```text
failed
refused
rejected
insufficient
escalated
```

attempt.

The earlier record remains byte-identical and in its original position.

## 8. Duplicate and conflict refusal

Every ledger kind has a stable immutable id:

| Kind | Stable id |
| --- | --- |
| model identity | `model_identity_id` |
| attempt | `attempt_id` |
| artifact | `artifact_id` |
| diff | `diff_id` |
| test result | `test_result_id` |
| verifier result | `verifier_id` |
| resulting commit | `commit_sha` |

If the same id is submitted with byte-equivalent normalized evidence:

```text
DUPLICATE_<KIND>_ID
```

If the same id is submitted with different evidence:

```text
CONFLICTING_<KIND>_RECORD
```

Both fail closed.

## 9. Attempt-bound execution evidence

Artifacts, diffs, test results, and resulting commits must reference an already
recorded attempt.

They cannot create an orphan record.

### Artifact

```text
artifact_id
attempt_id
kind
ref
digest
```

### Diff

```text
diff_id
attempt_id
base_ref
head_ref
digest
```

### Test result

```text
test_result_id
attempt_id
suite
result = pass | fail | not_run
evidence_ref
```

A test result is evidence only. It does not contain acceptance, adjudication, or
winner semantics.

### Resulting commit

```text
commit_sha
attempt_id
```

The commit must be an exact 40-character Git SHA.

## 10. Builder ≠ verifier

Verifier records are:

```text
{
  verifier_id
  target_attempt_id
  verifier_kind
  provider_id
  model_id
  role
  disposition
  evidence_refs[]
}
```

Verifier kinds:

```text
deterministic
human
model
```

The verifier id cannot equal the attempt id it evaluates.

When the bound route requires independent local review, a model verifier may not
use the same provider/model/role identity as the target attempt.

A distinct challenger model from the bound route may record verifier evidence.

## 11. No semantic winner

Verifier dispositions are limited to evidence descriptions:

```text
mechanical_pass
mechanical_fail
supports
challenges
disagrees
insufficient
```

W4 has no `winner`, `selected_interpretation`, `accepted`, or equivalent
semantic-adjudication field.

Unknown fields fail closed.

W4 records disagreement. It cannot resolve it.

## 12. Evidence does not create authority

Every append snapshots before/after:

```text
authorized core
routing domain
lifecycle state
lifecycle disposition
W2 lifecycle guard
```

The append succeeds only if all five are unchanged.

The W2 authorized-core snapshot is also checked before every W4 operation.

Any post-authorization core mutation blocks the ledger write.

## 13. Green proof

Final W4 suite:

```text
31 passed · 0 failed
```

Regression suites remain:

```text
W1  22 passed · 0 failed
W2  27 passed · 0 failed
W3  28 passed · 0 failed
```

## 14. Red/green falsification

Four disposable mutations were executed outside the governed worktree.

### Probe A — destroy append-only prefix

Mutation replaced:

```text
ledger.push(new_record)
```

with destructive ledger replacement.

Result:

```text
10 passed · 21 failed
```

The suite detected loss/rewrite of prior attempt, artifact, verifier, and evidence
history.

### Probe B — allow same identity to masquerade as independent review

Mutation disabled the `RETRY_NOT_INDEPENDENT` check.

Result:

```text
30 passed · 1 failed
```

Only the dedicated retry/independence falsification failed.

### Probe C — allow builder self-verification

Mutation disabled the direct builder/verifier identity refusal.

Result:

```text
30 passed · 1 failed
```

Only the dedicated builder-self-verification falsification failed.

### Probe D — make a ledger append mutate deploy authority

Mutation inserted:

```text
next.work_unit.authority.deploy = true
```

during an append.

Result:

```text
3 passed · 28 failed
```

The immutable-authority membrane and downstream positive append cases all went
red.

The suite therefore discriminates the four load-bearing W4 laws.

## 15. Current standing

```text
W1 CLOSED
W2 CLOSED
W3 CLOSED by Founder adjudication
W4 IMPLEMENTED
W4 GREEN: 31 / 31
W4 RED PROBES: 4 / 4 discriminating
W4 FOUNDER ADJUDICATION OWED
W5 NOT OPEN
```

No W5 end-to-end Work Unit witness is authorized by this record.

## 16. Founder adjudication — W4 closure and W5 opening

**Founder act:** 2026-09-18

The Founder accepts W4 candidate commit
`83019a4ab7d97115bc2d9fc53bf50ebee3ef0b1a` and the recorded evidence:

- W1 schema: 22 / 22 passing;
- W2 lifecycle: 27 / 27 passing;
- ratified Routing Intelligence: 20 / 20 passing;
- W3 routing binding: 28 / 28 passing;
- W4 append-only ledger: 31 / 31 passing;
- sovereignty/pre-commit gates green;
- append-only history is preserved;
- retry cannot be relabeled independent review;
- builder self-verification is refused;
- duplicate/conflicting immutable records fail closed;
- later success cannot rewrite earlier failed/refused/rejected/insufficient/escalated evidence;
- W4 evidence cannot mutate Work Unit authority, routing, lifecycle state, or W2 authorized core;
- W4 never transitions lifecycle state or selects a semantic winner;
- four deliberate W4 mutations made the suite red;
- locally tracked canonical freshness had zero true file overlap with W4;
- no provider/model call, credential access, external network action, JARVIS repository execution,
  push, merge, deployment, or production access occurred during W4.

**W4 standing: CLOSED.**

The Founder authorizes **W5 — SYNTHETIC END-TO-END WORK UNIT WITNESS ONLY**.

W5 may construct one entirely synthetic, non-confidential Work Unit and exercise the
already-proven W1-W4 layers together through evidenced closure.

W5 must prove deterministic replay and the required end-to-end falsification cases.

W5 may not call providers/models, inspect credentials, access external networks,
execute OpenCode/Tinker/shell/repository work through JARVIS, use member/PHI/production
data, merge, push, deploy, or access production.

W5 stops after the synthetic witness, deterministic replay proof, and red/green
falsification evidence.

RGR-01 remains closed.
