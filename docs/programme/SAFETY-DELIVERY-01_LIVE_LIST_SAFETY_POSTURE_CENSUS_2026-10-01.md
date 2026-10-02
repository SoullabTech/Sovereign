# SAFETY-DELIVERY-01 — Canonical /list Safety Posture Census

Date: 2026-10-01
Canonical lineage: includes merge #1663 at \`edf656496450795fa5c8089b4eb6e314ccc7bfd8\`
Scope: canonical live member-turn ingress only
Mode: read-only reachability / obligation census

## Question

What safety function is actually present at the canonical live MAIA ingress, and does current evidence establish a live human-escalation obligation?

## Canonical ingress

The route authority record admitted by SAFETY-DELIVERY-01 identifies:

\`/api/sovereign/app/maia/list\`

as the canonical live member-turn ingress.

That route imports \`enforceFieldSafety\` from:

\`lib/field/enforceFieldSafety.ts\`

It does not directly import:
- \`PersonalOracleAgent\`
- \`MAIASafetyPipeline\`
- \`IntegratedSafetySystem\`
- \`RealTimeAlertService\`
- \`alertSoullabTeam\`

## What enforceFieldSafety actually governs

\`enforceFieldSafety()\` receives:
- cognitiveProfile
- element
- userName
- facet
- archetype
- bloomLevel
- context

It does not receive the member's current message.

It routes through \`routePanconsciousField()\` and asks whether field/symbolic work is safe for the current cognitive profile.

When field work is not safe, the live route returns a mythic/field boundary response and does not proceed into deeper field work.

Therefore:

FIELD SAFETY here means:
- symbolic/depth-work eligibility
- cognitive/field routing boundary

It is not, by itself:
- self-harm detection
- suicide-risk classification
- emergency recipient resolution
- human escalation
- delivery confirmation

## Crisis-language evidence

The repository contains multiple crisis/self-harm detectors and prompt-level crisis instructions in other modules.

This census does not promote those modules into the live path merely because they exist.

Within the canonical \`/list\` route itself, the census found no explicit route-level import or call establishing:
- a crisis/self-harm detector on the current member message
- a human safety recipient resolver
- an external safety delivery contract
- a human-delivery witness

Downstream model/orchestrator behavior may still provide safety-oriented response language or resources. That is a different proposition from a human escalation contract and requires its own traced evidence.

## Relationship to S1

S1 remains architecture debt in the prototype \`MAIASafetyPipeline\`.

The absence of a live edge from \`/list\` to that pipeline means:

- do not wire the prototype into production merely to make S1 "green"
- do not call S1 a current production crisis-alert outage
- do not use the prototype's implied human-escalation policy as authority for the live route

## Does the live route currently have a non-delivery finding?

Not from this census alone.

A non-delivery finding requires an established obligation or claim that a human consequence should be delivered.

For the general adult \`/list\` route, this census establishes no canonical human-notification obligation.

Therefore the truthful current statement is:

> No explicit live route-level human escalation contract was established by this census.

That is not equivalent to:

> A human alert should have been delivered and failed.

The latter would require policy/authority evidence not yet established.

## Youth exception

Youth documents do contain stronger human-process promises:
- same-day Soullab team notification during coverage hours
- possible guardian contact for serious safety flags

But TEEN-CLOSED-01 currently intends youth registration to remain closed pending separate safety adjudication.

Those youth promises therefore belong to the youth-opening safety boundary, not as an inferred adult \`/list\` obligation.

The separate registration-gate audit found a missing enforcement call in initial registration; that defect is being handled in its own Class A lane.

## Next lawful question

Before adding live human escalation to \`/list\`, founder/policy authority must decide:

1. Is the adult live experience intended to provide resource presentation only, human escalation, or a bounded combination?
2. For which consequence classes, if any, may MAIA initiate human notification?
3. Who has lawful recipient standing?
4. What disclosure scope is permitted?
5. What happens when no lawful recipient exists?
6. What independent transport witnesses failure?
7. How does this interact with Sanctuary and other non-persistence boundaries?

## Ruling

Do not inherit crisis-delivery policy from prototype code.

Do not equate field-safety gating with crisis intervention.

Do not create a new non-delivery register line until a delivery obligation is established and a mechanism fails to satisfy it.

The next live-safety act is policy/adjudication, not transport wiring.
