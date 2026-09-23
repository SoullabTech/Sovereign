# JARVIS-JEV-01 · JEV-INT-01
## External-Provider Governance Candidate Witness

**Date:** 2026-09-22
**Reconciled canonical:** `19be6b6ec7c8b4ddabbbc2a9d3d2ebce48fa2dc8`
**Disposition:** GOVERNANCE CANDIDATE AUTHORED · HOLD NOT LIFTED · NO PROVIDER ASSIGNED

## 1. Objective

Prepare the two prerequisites named by the 2026-09-20 Founder interim hold without
prematurely claiming either has acquired canonical standing.

The hold requires:

1. a development-lane governance canon authored **and ratified**;
2. explicit capability classes for repository source and constitutional canon.

This candidate authors the first and proposes the second as a reviewed provider-governance
amendment. It does not ratify itself.

## 2. Candidate population

```text
docs/canon/PROVIDER_GOVERNANCE.md
32295be5d1405a5af084bf47162f539735a0166f

scripts/provider-policy.json
baee45fef093b5f582dc090d91962ae0bd3ff767

scripts/check-provider-governance.ts
28589396116847c0442ee8459aa7b4f23169f4cd

docs/canon/DEVELOPMENT_PROVIDER_GOVERNANCE_CANDIDATE_2026-09-22.md
2c890d884610ba16e5e9b969cf7ff3147a07dc3c

scripts/builder/__tests__/development-provider-governance-proof.mjs
9beb811be85fab8c716d0015fc5e4162737e849c

.github/workflows/sovereignty-gate.yml
14ee58574e4224bae19661fe6f629d0fbd3388b2
```
## 3. Capability model

The provider policy now distinguishes:

```text
FUNCTION
chat · embedding · tts · stt · benchmark

DATA
member_data · member_audio
repository_derived_metadata
repository_source
constitutional_canon
```

Functional capability never implies data disclosure.

The three repository data classes are present in the candidate vocabulary and assigned to
**no provider**.

The machine-readable development boundary records:

```text
canon_status                         candidate_not_ratified
interim_hold                         active
held_lab_data_classes                repository_source · constitutional_canon
repository_data_classes              repository_derived_metadata · repository_source · constitutional_canon
unassigned_repository_classes        repository_derived_metadata · repository_source · constitutional_canon
repository_assignment_authorizations empty
```

## 4. Candidate proof

```text
node scripts/builder/__tests__/development-provider-governance-proof.mjs

passes: 15
failures: 0
JEV-INT-01 GOVERNANCE CANDIDATE — PASS
```

The proof establishes explicit vocabulary, no provider assignment, active hold standing,
separate network/disclosure/spend/provider-execution authority, the exact three-class
repository set, and the prior-canonical-authorization requirement for every future
repository-class provider assignment.

## 5. Hostile mutations and assignment-gate witness

The provider-governance guard was exercised against temporary policy mutations. Each mutation
was discarded and the candidate baseline restored.

```text
1. grant repository_source to lab.openai
   → exit 2
   → PROVIDER POLICY ERROR
   → class declared unassigned

2. grant unknown_future_class to lab.openai
   → exit 2
   → PROVIDER POLICY ERROR
   → unknown capability

3. set interim_hold=lifted while canon_status=candidate_not_ratified
   → exit 2
   → PROVIDER POLICY ERROR
   → hold cannot lift before ratification

4. DELIST repository_derived_metadata + ASSIGN it to lab.openai in the same edit
   → exit 2
   → PROVIDER POLICY ERROR
   → no separately ratified prior authorization record

5. introduce an authorization record in the same change as the assignment
   → exit 2
   → PROVIDER POLICY ERROR
   → authorization record cannot be resolved from its pinned prior commit

restored candidate baseline
   → provider governance exit 0
```

A throwaway Git fixture then discriminated branch ancestry from canonical admission:

```text
BASE
  canonical state before assignment authorization

AUTH_COMMIT
  machine-readable assignment record
  instrument = repository-provider-assignment/v1
  status     = ratified
  tier       = lab
  provider   = openai
  capability = repository_derived_metadata

ASSIGNMENT_COMMIT
  provider-policy assignment cites AUTH_COMMIT by:
    record_path
    record_blob
    record_commit

case C1 — AUTH_COMMIT is earlier on the SAME UNMERGED BRANCH,
          canonical base remains BASE
  → exit 2
  → "authorization commit … is not admitted to canonical base …"

case C2 — exact AUTH_COMMIT is supplied as the canonical base
  → exit 0

case C3 — canonical base SHA is declared but unavailable in local history
  → exit 3
  → PROVIDER GOVERNANCE INSTRUMENT ERROR
  → ancestry evidence unavailable
```

The fixture is synthetic proof of mechanism, not a real provider authorization and not evidence
that a human ratified anything. The guard proves **prior canonical custody, exact blob identity,
and record shape**. Human Founder/Class-A ratification remains an external governance fact.

The result is a genuine two-admission mechanism: an authorization record must first become
canonical; only a later assignment candidate based on that canonical state can pass.

## 6. What remains open

This act does **not** satisfy the first lift condition because the development-lane canon is
only a candidate.

It also does not by itself establish canonical capability-table standing because this branch
has not been adjudicated or admitted.

Even after later ratification/admission, Jev/TypeSafe receives no capability automatically.
Provider assignment remains a separate later act and must cite its own prior ratified
`repository-provider-assignment/v1` record by exact path, blob, and commit.

## 7. Standing

```text
dev-lane canon             AUTHORED AS CANDIDATE · NOT RATIFIED
repository capability set PROPOSED · MACHINE-READABLE
repository classes        ASSIGNED TO NO PROVIDER
interim hold              ACTIVE
Jev/TypeSafe provider     NOT ADMITTED
transport                 NOT AUTHORIZED
network authority         NOT CREATED
disclosure authority      NOT CREATED
spend authority           NOT CREATED
production                UNTOUCHED
```

The next state-changing step for this lane is Founder adjudication of the candidate governance
package. Ratification must be explicit; preparation is not ratification.
