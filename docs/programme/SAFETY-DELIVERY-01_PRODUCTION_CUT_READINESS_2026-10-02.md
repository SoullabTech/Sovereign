# SAFETY-DELIVERY-01 — Production Cut Readiness

Date: 2026-10-02
Status: deployment-order record; no production mutation
Canonical observed: `d4655e6477fa40b8f94c5f8f91be47198288d2af`
Production currently witnessed: `13a0308d706c684f21aa53741791cb224334ff82`

## Purpose

Define the lawful deployment order for the safety-delivery programme without overwriting the current Writer's Studio production projection or claiming human delivery before it is witnessed.

## Production lineage finding

The current production witness resolves the running container to:

`GIT_COMMIT=13a0308d7`
→ full commit `13a0308d706c684f21aa53741791cb224334ff82`.

Merged PR #1727 converged that exact live production lineage into canonical ancestry:

- #1727 merge commit: `d4655e6477fa40b8f94c5f8f91be47198288d2af`
- parent 1: canonical Writer's Studio release `5f8d39c7f0ce206be42469e66f366c4ff82dc62e`
- parent 2: live production `13a0308d706c684f21aa53741791cb224334ff82`
- merge tree: byte-identical to the canonical parent
- effective runtime file diff introduced by the convergence act: **zero**

Therefore the live production SHA is now an ancestor of canonical. The earlier
7-vs-177 divergent-lineage state is historical evidence, not the current topology.

This resolves the ancestry problem only. It does **not** authorize deploying current
canonical, because canonical contains Class-A safety changes (#1671 and #1633) whose
post-facto governance disposition is still unresolved.

## Current safety admission state

### Canonical code with unresolved Class-A custody disposition

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

#1671 is canonical, but its self-authored Class-A merge occurred with zero reviews while the
standing custody law required fail-closed distinct-human concurrence. Canonical presence is
therefore **not by itself production authority**. Post-facto disposition remains required.

#1633 — server-side crisis assessment / live crisis composition

Provides the current canonical live server crisis detector and composition seam.

#1633 is also self-authored Class A, merged with zero reviews under the same unresolved
custody condition. PR #1724 records that admission exception. #1633 still requires explicit
post-facto governance disposition before this record may select it into a production cut.

### Pending Class A review boundary

#1713 — current-base S4 circuit-breaker human delivery successor

Not production-admissible until the Class-A custody floor is satisfied and its governed
review/admission completes.

### Closed / superseded lane

#1715 — current-base live crisis member-response successor

Closed and no longer a pending production prerequisite. Its intended live-crisis concern is
now represented by current canonical #1633 and must be governed there rather than revived
from the closed conflicting lane.

### Governance enforcement prerequisite

#1716 — Class-A custody floor

Mechanically fail-closes the already-required authoritative adjudication context when a
self-authored Class-A PR lacks a governed distinct-human custodian approval. This enforcement
must land before further Class-A admission is treated as ordinary.

### Production ancestry convergence — complete

#1727 — production/canonical lineage convergence

Merged as an ancestry-only Class-B act. Its merge commit
`d4655e6477fa40b8f94c5f8f91be47198288d2af` has the live production SHA
`13a0308d706c684f21aa53741791cb224334ff82` as a parent and a tree byte-identical
to its canonical parent.

This means production ancestry is now canonically represented without changing runtime code.
PR #1728 is closed as superseded and is not a deployment prerequisite.

### Evidence reconciliation

#1709 — #1671 admission-exception record
#1714 — post-#1671 register reconciliation
#1724 — #1633 admission-exception record

Documentation/evidence only; they do not themselves grant runtime or deployment authority.

## Current production configuration boundary

Read-only presence/auth witness on 2026-10-02 against current running SHA `13a0308d706c684f21aa53741791cb224334ff82`:

- Resend credential: present, but authenticated `GET /domains` returns `HTTP 400 · validation_error · API key is invalid`
- Twilio account credential: present
- Twilio auth credential: present
- Twilio sending mechanism: present
- `SAFETY_ALERT_PHONE`: absent
- `SAFETY_ALERT_SLACK_WEBHOOK_URL`: absent
- legacy `SLACK_WEBHOOK_URL`: absent

No credential values were copied into this record.

A dedicated human safety recipient therefore has not been intentionally designated in production, and E1 mail transport remains down independently of the safety-recipient gap.

## Required deployment order

### G0 — Governance floor and post-facto disposition

Before any safety code is selected for production:
- #1716 Class-A custody-floor enforcement is merged and required in the authoritative adjudication context
- #1671 receives an explicit post-facto governance disposition on its exact admitted merge
- #1633 receives an explicit post-facto governance disposition on its exact admitted merge
- no canonical presence is treated as production authority merely because a merge already occurred

Until those conditions are met, the safety cut is governance-blocked.

### G1 — Code admission

Before production projection:
- #1713 is merged/admitted under the custody floor or explicitly excluded from this cut
- #1715 remains closed and is not revived as an admission prerequisite
- selected #1671 / #1633 safety commits have an explicit governed disposition
- #1727 ancestry convergence remains present in the selected canonical head
- current canonical head is recorded

No unresolved or unreviewed Class A code enters the production projection.

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

Because #1727 has already made the witnessed `13a0308d7` production SHA an ancestor of
canonical, the preferred candidate is now a **canonical descendant that preserves that ancestry**.

That does not license deploying canonical wholesale before governance disposition. If any
canonical Class-A safety change is explicitly excluded from the production cut, construct a
dedicated descendant branch that removes/excludes only that governed-out change while
preserving the #1727 production ancestry relation.

The selected candidate must:
1. descend from the witnessed production anchor through the #1727 canonical ancestry;
2. preserve the admitted Writer's Studio production changes;
3. contain only safety changes with resolved governance/admission standing;
4. resolve any exclusion or overlap explicitly;
5. prove the resulting tree contains every selected safety contract;
6. identify the exact candidate SHA and its ancestry to the witnessed production anchor.

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
- live server crisis member-response contract from governed #1633 disposition (no human disclosure)

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

Code substrate: PARTIAL — #1671 and #1633 are canonical but governance-held; #1713 remains pending Class A; #1715 is closed/superseded.

Governance enforcement: #1716 pending; distinct-human custody is not yet constituted.

Production artifact currently witnessed: `13a0308d706c684f21aa53741791cb224334ff82` · still contains neither #1671 nor #1633 itself, but #1727 has now made this exact production SHA an ancestor of canonical merge `d4655e6477fa40b8f94c5f8f91be47198288d2af` with zero runtime-tree change. Production ancestry is therefore reconciled; governance disposition of the canonical Class-A safety changes remains the blocker.

Safety recipient: NOT DESIGNATED.

Independent human delivery: NOT READY FOR WITNESS.

Production cut: BLOCKED ON GOVERNANCE DISPOSITION + CLASS A CUSTODY + RECIPIENT AUTHORITY.

No new transport architecture is warranted at this boundary.
