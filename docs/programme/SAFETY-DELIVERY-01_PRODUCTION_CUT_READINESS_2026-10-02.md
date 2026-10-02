# SAFETY-DELIVERY-01 — Production Cut Readiness

Date: 2026-10-02
Status: deployment-order record; no production mutation
Canonical observed: `a2681a07772202d19d62595144e50e47574620f0`
Production observed: `7be140182`

## Purpose

Define the lawful deployment order for the safety-delivery programme without overwriting the current Writer's Studio production projection or claiming human delivery before it is witnessed.

## Production lineage finding

The running production container reports:

`GIT_COMMIT=7be140182`

That commit is a Writer's Studio production projection:

`feat(writers-studio): restore visible editing latitude preferences`

It does not contain the merged safety-human-delivery repair from #1671.

It is also not an ancestor of current `clean-main-no-secrets`.

The common ancestor between production `7be140182` and canonical at the time of the census is:

`298414555`

Therefore safety deployment is NOT a simple canonical fast-forward.

A production cut must preserve the admitted Writer's Studio production projection while adding only admitted safety changes.

## Current safety admission state

### Already canonical

#1671 — safety-human-delivery-r1

Provides:
- independent human-safety delivery substrate
- Twilio SMS / Slack acceptance semantics
- authenticated member safety endpoint
- prototype crisis fallback
- teen alert transport boundary
- Stellium failed-email fallback
- monitor independent-channel preflight/witness
- reply-to structural repair

### Class A review boundary

#1713 — current-base S4 circuit-breaker human delivery successor

Not production-admissible until its required review/branch-protection gates complete.

### Class A review boundary

#1715 — current-base live crisis member-response successor

Not production-admissible until its required review/branch-protection gates complete.

### Evidence reconciliation

#1714 — post-#1671 register reconciliation

Documentation only; does not gate runtime behavior.

## Current production configuration boundary

Read-only presence witness on 2026-10-02:

- Twilio account credential: present
- Twilio auth credential: present
- Twilio sending mechanism: present
- `SAFETY_ALERT_PHONE`: absent
- `SAFETY_ALERT_SLACK_WEBHOOK_URL`: absent
- legacy `SLACK_WEBHOOK_URL`: absent

No credential values were copied into this record.

A dedicated human safety recipient therefore has not been intentionally designated in production.

## Required deployment order

### G1 — Code admission

Before production projection:
- #1713 is merged/admitted or explicitly excluded from this cut
- #1715 is merged/admitted or explicitly excluded from this cut
- current canonical head is recorded

No unreviewed Class A code enters the production projection.

### G2 — Recipient authority

An authorized human explicitly designates at least one safety destination:

- `SAFETY_ALERT_PHONE`, or
- `SAFETY_ALERT_SLACK_WEBHOOK_URL`

Do not infer this recipient from:
- ordinary monitor recipients
- member phone numbers
- practitioner contact data
- historical addresses
- convenience

Recipient designation is an authority act, not a technical default.

### G3 — Production projection

Create a dedicated production-cut branch from the actual running production lineage (or a later witnessed production anchor), not by replacing it with canonical wholesale.

The projection must:
1. preserve the admitted Writer's Studio production changes;
2. port only admitted safety commits;
3. resolve overlaps explicitly;
4. prove the resulting tree contains every selected safety contract;
5. identify the exact candidate SHA.

### G4 — Pre-deploy falsifiers

Before deploy, candidate must prove:

- human safety config preflight script is present
- monitor test mode fails closed without independent delivery
- member-facing safety route cannot request `circuit_breaker`
- live crisis contract runs after durable member acceptance and before ordinary cognition
- live crisis contract performs no human disclosure
- circuit-breaker `humanNotified` cannot become true before affirmative delivery confirmation
- reply-to contract remains green
- sovereignty / PHI / provider / TypeScript / build gates pass

### G5 — Locked production deploy

Deploy/recreate the exact admitted production-cut SHA.

Witness:
- running `GIT_COMMIT` equals expected SHA
- health endpoint passes
- existing Writer's Studio tester surfaces remain intact
- no unrelated container/runtime state is deliberately changed

### G6 — Configuration preflight

Inside the exact running container:

`node scripts/check-safety-human-delivery-config.mjs`

Must exit 0.

This proves only configuration readiness.

It does NOT prove delivery.

### G7 — Provider acceptance witness

Run:

`scripts/witness/safety-human-delivery-witness.sh <EXPECTED_SHA>`

The wrapper must prove:
- artifact identity exact
- independent channel config READY
- DOWN alert accepted
- RECOVERED alert accepted

Provider acceptance is still not human receipt.

### G8 — Human receipt

The designated human confirms both test alerts actually arrived.

Only this act may satisfy the human-receipt portion of E2.

### G9 — Path witnesses

After the independent channel is witnessed, exercise bounded synthetic/non-member or otherwise governed witnesses for each admitted safety producer:

- S2 live teen crisis producer
- S3 Stellium failure fallback
- S4 circuit-breaker producer if #1713 admitted
- live crisis member-response contract separately for #1715 (no human disclosure)

S1 remains governed by its own reachability question because the prototype path is not established as live member ingress.

## Stop rules

STOP if:
- production running SHA changes before the cut is prepared
- Writer's Studio production projection would be lost
- a Class A PR lacks required review/admission
- no human safety recipient has been explicitly designated
- candidate SHA cannot be reproduced
- safety witness would expose member message content
- a provider acceptance is described as human receipt
- a test requires using real member crisis content

## Current standing

Code substrate: PARTIAL — #1671 merged; #1713/#1715 under Class A review.

Production artifact: NOT YET CONTAINS #1671.

Safety recipient: NOT DESIGNATED.

Independent human delivery: NOT READY FOR WITNESS.

Production cut: BLOCKED ON CLASS A ADMISSION + RECIPIENT AUTHORITY.

No new transport architecture is warranted at this boundary.
