# SAFETY-DELIVERY-01 — Live Safety Policy Decision Docket

Date: 2026-10-01
Status: CANDIDATE — founder/council adjudication required
Scope: canonical live member-turn safety consequence policy
Authority: none conferred by this document

## Why this docket exists

The canonical live MAIA ingress does not inherit the prototype \`MAIASafetyPipeline\` human-escalation policy.

The current evidence establishes:

1. \`/api/sovereign/app/maia/list\` is the canonical live member-turn ingress.
2. Its explicit \`enforceFieldSafety()\` call governs symbolic/depth-work eligibility, not message-level crisis detection.
3. No explicit live route-level human recipient resolver or human-delivery contract was established by the census.
4. The prototype pipeline contains alert machinery but has no proven live edge.
5. Youth documents describe stronger human notification promises, but youth admission is intended to remain closed pending safety adjudication.
6. Practitioner/client and emergency-contact records exist, but neither automatically grants crisis-recipient authority.

Therefore implementation cannot lawfully proceed by simply wiring an email/SMS target.

## Decision 1 — Adult live-member consequence posture

Choose one policy family.

### A — Resource / self-directed escalation only

MAIA may:
- detect bounded crisis language under an admitted detector
- respond directly with crisis/emergency resources
- encourage contact with local emergency services or a trusted human
- remain explicit that it cannot confirm a human has been reached

MAIA does not automatically contact:
- Soullab
- a practitioner
- an emergency contact
- another third party

unless a separate explicit recipient grant exists.

Standing:
lowest disclosure and authority expansion.

### B — Explicit opt-in safety recipient

A member may create a bounded recipient grant naming:
- recipient
- permitted consequence classes
- permitted transport
- disclosure scope
- effective period / revocation

Only an active grant can produce automatic human notification.

Standing:
adds member-authorized human consequence while preserving consent provenance.

### C — Professional-relationship recipient

For a member inside an active practitioner-client relationship, a practitioner may become a safety recipient only if the relationship includes an explicit safety-recipient grant.

An active practitioner relationship alone is insufficient.

Standing:
professional-context extension, requires practitioner + member policy alignment.

### D — Soullab safety responder

A governed Soullab on-call role receives selected safety consequences.

Requires:
- explicit member-facing disclosure
- staffing/coverage authority
- roster/runtime source of truth
- data minimization
- independent transport/failure witness
- operational SLA and closure protocol

Standing:
largest institutional duty and operational burden.

## Candidate minimal policy

Candidate only; NOT RATIFIED:

> For adult members, the default live posture is A — resource/self-directed escalation. Automatic third-party notification is unavailable unless an explicit, currently valid safety-recipient grant has been separately established. The system must never imply that a human has been contacted when no such grant and witnessed delivery exist.

Why this is the minimal candidate:
- matches current absence of a live recipient authority substrate
- preserves member sovereignty
- avoids inventing an institutional monitoring duty
- keeps resource presentation distinct from human delivery
- permits later opt-in recipient grants without changing the default

This candidate does not decide whether Soullab should later offer B, C, or D.

## Decision 2 — Crisis detector standing

A live detector must be separately admitted.

Required properties:
- current-message input is explicit
- high-consequence categories are narrowly defined
- false-positive/false-negative limits are documented
- detection is distinguishable from diagnosis
- no symbolic/developmental interpretation is used as crisis evidence
- detector output creates, at most, the consequence standing authorized by policy

Prototype detectors do not become live merely because they exist.

## Decision 3 — Disclosure scope

For any future human notification, choose the minimum disclosure profile.

Candidate baseline:
- member identity sufficient for the authorized recipient to know whom the event concerns
- consequence class / signal type
- timestamp
- action requested / response SLA
- NO transcript
- NO quote
- NO paraphrase of conversation content unless a separately authorized emergency policy explicitly permits it

Youth protocol already states a strong no-content rule for guardian outreach.

## Decision 4 — No-recipient behavior

Candidate invariant:

> Absence, expiry, ambiguity, or unavailability of recipient authority resolves to an explicit non-delivery state. It never falls back to "someone at Soullab."

Possible states:
- NO_SAFETY_RECIPIENT_GRANT
- RECIPIENT_NOT_AVAILABLE
- NO_PERMITTED_TRANSPORT
- AUTHORITY_AMBIGUOUS

Member-facing language must remain truthful about that state.

## Decision 5 — Sanctuary interaction

Sanctuary currently establishes a strong no-persistence boundary.

Before human notification is ever enabled from Sanctuary, policy must explicitly decide:
- whether imminent-safety consequence can override non-persistence
- what minimum event metadata may be emitted
- whether any content may leave the session
- how the member is told about the exception before entering Sanctuary

No implementation may infer this exception.

## Youth-specific adjudication

Existing youth documents describe:
- same-day Soullab team notification during coverage
- possible guardian contact for serious flags
- a private on-call roster
- no conversation-content disclosure

But canonical runtime lacks:
- guardian link schema
- guardian notification ledger
- executable on-call roster/resolver

Youth opening therefore requires a separate executable authority substrate before those promises can be truthful.

TEEN-CLOSED-01 should remain closed until that work is admitted.

## Council questions

Council review should answer:

1. Is default adult posture A accepted?
2. Should B (member opt-in recipient grant) be designed now, later, or never?
3. May an active practitioner relationship support C, and what explicit grant is required?
4. Does Soullab intend to assume the institutional duty implied by D?
5. What crisis categories create which consequence classes?
6. What exact information may leave the member context?
7. How does Sanctuary interact with imminent-safety consequence?
8. What human coverage / SLA is promised, if any?

## Implementation gate

No live human-escalation code may be opened until the relevant decisions above are ratified.

After ratification, the smallest lawful implementation sequence is:

1. recipient-grant schema/authority resolver
2. current-message crisis detector contract
3. delivery adapter with truthful consequence states
4. independent failure witness
5. member-facing disclosure and consent UX
6. synthetic runtime witness
7. production opening only after all gates pass

## Non-decision

This docket does not declare that automatic human escalation is clinically, ethically, or operationally superior.

It separates the available choices so implementation cannot decide policy by accident.
