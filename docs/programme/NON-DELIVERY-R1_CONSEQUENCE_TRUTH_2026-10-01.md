# NON-DELIVERY-R1 — Consequence Truth

Date: 2026-10-01
Branch: \`fix/non-delivery-consequence-truth-r1-20261001\`
Canonical base: \`ac7bfd353128210c5f1e7012e0b71a9256035834\`
Class: A — Sacred Boundary / safety semantics

## Scope

This unit repairs what the safety runtime is allowed to claim about delivery.

It does not create:
- a new human recipient
- a guardian notification channel
- an independent pager
- a new safety threshold
- a new clinical policy

S1-S3 in \`docs/ops/NON_DELIVERY_REGISTER.md\` remain open.

## Canonical defect

Three safety paths had different mechanisms but the same epistemic problem:

1. crisis delivery could terminate with no configured alert service / therapist directory
2. teen-team notification was console-only
3. practitioner email provider acceptance was represented as "sent"

In addition, the crisis member-facing response promised to "connect you with immediate support" even on a runtime path where no human delivery existed.

## Contract introduced

\`lib/safety/consequenceDeliveryTruth.ts\` defines:

- DETECTED
- DELIVERY_REQUESTED
- TRANSPORT_ACCEPTED
- CHANNEL_REACHED
- HUMAN_ACKNOWLEDGED
- DELIVERY_FAILED
- DELIVERY_UNAVAILABLE
- DELIVERY_UNCONFIRMED

Witness classes:
- condition
- producer
- transport_acceptance
- transport_delivery
- human_acknowledgement
- failure

The state/witness mapping is centralized so callers cannot pair a stronger state with a weaker witness.

## Runtime changes

### Crisis / high-risk pipeline

\`MAIASafetyPipeline.processMessage()\` now exposes an optional \`metadata.consequence_delivery\`.

No service/directory or no eligible therapist produces \`DELIVERY_UNAVAILABLE\`.

Alert-service outcomes preserve the alert service's consequence state.

Crisis intervention records now include \`consequence_delivery_state\` in addition to per-transport detail.

The crisis response no longer claims that a human will be connected when no human receipt is proven.

### RealTimeAlertService

Per-channel provider/API success is now named \`transport_accepted\`.

The aggregate state is derived from the actual attempts:
- one or more accepted -> TRANSPORT_ACCEPTED
- attempted and all failed -> DELIVERY_FAILED
- no transport attempted -> DELIVERY_UNAVAILABLE

Provider/API acceptance does not establish channel delivery or human acknowledgement.

### Teen safety

\`alertSoullabTeam()\` now returns a consequence-delivery result.

Because the path is still unwired, its truthful result is \`DELIVERY_UNAVAILABLE\`.

No recipient is invented.

### Stellium practitioner safety notice

\`sendSafetyConcernNotification()\` now returns a consequence-delivery result.

Successful \`sendEmail()\` means \`TRANSPORT_ACCEPTED\`; the provider message id is retained as the reference.

The existing legacy \`safety_concern_logs.email_status='sent'\` field is not migrated in this unit. It remains a known naming debt; the returned consequence state is the stronger semantic contract.

## Lethal tests

New unit tests establish:
- producer activity cannot exceed DELIVERY_REQUESTED
- provider acceptance cannot become CHANNEL_REACHED
- provider acceptance cannot become HUMAN_ACKNOWLEDGED
- channel delivery requires a delivery witness
- human acknowledgement requires a human witness
- no attempted transport becomes DELIVERY_UNAVAILABLE
- attempted transport failure becomes DELIVERY_FAILED
- state/witness pairs remain consistent

New integration tests establish:
- the prototype no-service crisis path exposes DELIVERY_UNAVAILABLE
- the crisis member message does not claim a human was connected
- the unwired teen-team alert exposes DELIVERY_UNAVAILABLE

## Verification status

Local worktree verification:
- \`git diff --check\`: PASS
- Jest/typecheck: NOT RUN LOCALLY because this fresh worktree has no installed test dependencies and the main checkout does not contain usable Jest/tsc binaries.

Admission therefore requires CI to run the repository's normal test/typecheck/build/constitutional gates.

No local dependency install was introduced solely to make this lane green.

## Explicit non-closure

This unit does not close S1, S2, or S3.

Next bounded units are:

R1B — establish whether a live producer should adopt a governed crisis recipient/delivery path; do not promote the prototype constructor into production by assumption.

R1C — adjudicate and wire the teen-safety recipient policy or remove the dead alert abstraction.

R1D — add an independent failure witness for practitioner safety-notification failure.

Only runtime evidence of actual delivery may close the register rows.


## Reachability reconciliation

Canonical merge #1663 admitted `SAFETY-DELIVERY-01_S1_REACHABILITY_CENSUS_2026-10-01.md`. That census establishes that `PersonalOracleAgent` is source-marked outside the ship path and no live edge from the canonical `/api/sovereign/app/maia/list` ingress to `MAIASafetyPipeline` was found.

Therefore this R1 code repair is an architectural truth repair for the prototype pipeline and shared alert semantics; it is not evidence that current production member turns traverse that pipeline. S1 remains open under the #1663 closure rule.
