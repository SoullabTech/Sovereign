# SAFETY-DELIVERY-01 — Production Cut Readiness

Date: 2026-10-02
Status: deployment-order record; no production mutation
Canonical observed: `5f8d39c7f0ce206be42469e66f366c4ff82dc62e`
Production last successfully witnessed: `13a0308d706c684f21aa53741791cb224334ff82`

A later read-only SSH re-witness attempt timed out at the workstation transport layer. No production-state inference is made from that timeout.

## Purpose

Define the lawful deployment order for the safety-delivery programme without overwriting the current Writer's Studio production projection or claiming human delivery before it is witnessed.

## Production lineage finding

The last successful production witness resolved the running container to:

`GIT_COMMIT=13a0308d7`
→ full commit `13a0308d706c684f21aa53741791cb224334ff82`.

Repository ancestry checks establish that neither #1671 merge
`15a9175fb917cd9aa84a2735f7b3cf91a964b49b`
nor #1633 merge
`5c3d31c2a777ee62780906d8e07ba7b5fff47537`
is an ancestor of that deployed commit.

Against canonical
`5f8d39c7f0ce206be42469e66f366c4ff82dc62e`,
the merge base is
`298414555bbe7eccdf453b09e026737d4f7f4e29`.

At that witness point:
- production has **7** commits not in canonical;
- canonical has **177** commits not in production.

Therefore safety deployment is NOT licensed as a simple canonical fast-forward.

A production cut must preserve the actual running production projection, establish
its ancestry to the selected canonical safety commits explicitly, and add only
governed/admitted safety changes.

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

### Production ancestry custody candidate

#1728 — admit live `13a0308d7` ancestry without changing the canonical tree

The candidate establishes the exact live production commit as canonical ancestry while
resolving its merge tree byte-identically to current canonical. It is **Class A** and therefore
is not admissible until the custody floor is active and a governed distinct-human custodian
exists. It does not authorize deployment by itself.

If #1728 is lawfully admitted, the preferred production path may proceed from canonical
descendants that already contain the live production ancestry. If it is not admitted, G3 must
continue to build the production cut from the separately witnessed `13a0308d7` lineage.

### Evidence reconciliation

#1709 — #1671 admission-exception record
#1714 — post-#1671 register reconciliation
#1724 — #1633 admission-exception record

Documentation/evidence only; they do not themselves grant runtime or deployment authority.

## Current production configuration boundary

Read-only presence/auth witness on 2026-10-02 against the last successfully witnessed running SHA `13a0308d706c684f21aa53741791cb224334ff82`:

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
- #1728 is explicitly admitted or held/excluded under the custody floor
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

Choose the construction path from governed ancestry evidence:

- **If #1728 is lawfully admitted:** use a canonical descendant that contains the witnessed `13a0308d7` production ancestry, then select only the governed safety changes intended for the cut.
- **If #1728 is held or excluded:** create a dedicated production-cut branch from the actual running production lineage (or a later witnessed production anchor), rather than replacing it with canonical wholesale.

Whichever path is selected must:
1. preserve the admitted Writer's Studio production changes;
2. include only governed/admitted safety commits;
3. resolve overlaps explicitly;
4. prove the resulting tree contains every selected safety contract;
5. identify the exact candidate SHA and its ancestry to the witnessed production anchor.

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

Production artifact last successfully witnessed: `13a0308d706c684f21aa53741791cb224334ff82` · contains neither #1671 nor #1633 merge ancestry. Its merge base with canonical `5f8d39c7f0ce206be42469e66f366c4ff82dc62e` is `298414555bbe7eccdf453b09e026737d4f7f4e29`; production carries 7 unique commits and canonical carries 177 unique commits at that witness point. Projection ancestry must therefore be re-established explicitly.

Safety recipient: NOT DESIGNATED.

Independent human delivery: NOT READY FOR WITNESS.

Production cut: BLOCKED ON GOVERNANCE DISPOSITION + CLASS A CUSTODY + RECIPIENT AUTHORITY.

No new transport architecture is warranted at this boundary.
