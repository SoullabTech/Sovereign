# JARVIS-JEV-01 · JEV-INT-01
## External-Provider Governance Candidate Witness

**Date:** 2026-09-22  
**Base canonical:** `b23ae2d7fd31ee56841af3930b31658ab286a2a3`  
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
ef6c831b30dc23e1bbb25824f7993f3341bade8d

scripts/provider-policy.json
baee45fef093b5f582dc090d91962ae0bd3ff767

scripts/check-provider-governance.ts
4ac7a5781ff740e705c7b69457399dd6c0321943

docs/canon/DEVELOPMENT_PROVIDER_GOVERNANCE_CANDIDATE_2026-09-22.md
e93b4e46bfa8f31d5542acc3937c5628680075a6

scripts/builder/__tests__/development-provider-governance-proof.mjs
1ad313e1e33435d2e056c206dcf1a93757a76daf
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

passes: 13
failures: 0
JEV-INT-01 GOVERNANCE CANDIDATE — PASS
```

The proof establishes explicit vocabulary, no provider assignment, active hold standing,
separate network/disclosure/spend/provider-execution authority, the exact three-class
repository set, and the prior-ratification requirement for every future repository-class
provider assignment.

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

A throwaway two-commit Git fixture then exercised the lawful path:

```text
commit A
  machine-readable assignment record
  instrument = repository-provider-assignment/v1
  status     = ratified
  tier       = lab
  provider   = openai
  capability = repository_derived_metadata

commit B
  provider-policy assignment cites A by:
    record_path
    record_blob
    record_commit

guard at commit B
  → exit 0
```

The fixture is synthetic proof of mechanism, not a real provider authorization. It establishes
that the gate is neither a consistency-only check nor an impossible lock: assignment requires
a separately existing prior ratification object, and that object must match the exact
tier/provider/capability being assigned.

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
