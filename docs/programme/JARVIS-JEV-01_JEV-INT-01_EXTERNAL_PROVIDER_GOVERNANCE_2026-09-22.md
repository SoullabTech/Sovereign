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
5fa67175fa6d6347b4a1cc36bfa7c73b8d449105

scripts/provider-policy.json
70160b1041a32c199150eeae73330a306251e411

scripts/check-provider-governance.ts
8fff860a25082320e59a1ee81808689f9973ca16

docs/canon/DEVELOPMENT_PROVIDER_GOVERNANCE_CANDIDATE_2026-09-22.md
40f60bd178af6f72ffa530bc097535903865a674

scripts/builder/__tests__/development-provider-governance-proof.mjs
699e0f1bc61496544582f781761d790858da9668
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
canon_status                   candidate_not_ratified
interim_hold                   active
held_lab_data_classes          repository_source · constitutional_canon
unassigned_repository_classes  repository_derived_metadata · repository_source · constitutional_canon
```

## 4. Candidate proof

```text
node scripts/builder/__tests__/development-provider-governance-proof.mjs

passes: 11
failures: 0
JEV-INT-01 GOVERNANCE CANDIDATE — PASS
```

The proof establishes explicit vocabulary, no provider assignment, active hold standing, and
separate network/disclosure/spend/provider-execution authority.

## 5. Hostile mutations

The existing provider-governance guard was then exercised against three temporary policy
mutations. Each mutation was discarded and the candidate baseline restored.

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

restored candidate baseline
   → provider governance exit 0
```
The guard therefore treats a malformed or prematurely widened governance policy as an
instrument/policy error rather than as a lawful provider configuration.

## 6. What remains open

This act does **not** satisfy the first lift condition because the development-lane canon is
only a candidate.

It also does not by itself establish canonical capability-table standing because this branch
has not been adjudicated or admitted.

Even after later ratification/admission, Jev/TypeSafe receives no capability automatically.
Provider assignment remains a separate act.

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
