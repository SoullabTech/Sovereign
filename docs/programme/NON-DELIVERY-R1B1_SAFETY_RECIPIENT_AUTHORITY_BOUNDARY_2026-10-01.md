# NON-DELIVERY-R1B1 — Safety Recipient Authority & Delivery Boundary

Date: 2026-10-01
Canonical base: \`ac7bfd353128210c5f1e7012e0b71a9256035834\`
Mode: read-only authority census / design boundary

## Question

What existing canonical records, if any, lawfully identify a human recipient for a member-safety consequence?

## Finding 1 — Practitioner relationship

Canonical substrate:
- \`practitioner_clients\` is the canonical bounded professional relationship record.
- \`lib/coachField/identity.ts\` provides the typed identity translation and authorization seam.
- active and paused relationships may permit bounded reading; active alone permits practice writes.
- practitioner identity must be resolved through the relationship and \`practitioners.member_id\`; a bare \`practitioner_id\` cannot be trusted across tables.

Meaning:
An active practitioner relationship establishes professional relationship standing.

It does NOT, by itself, establish:
- emergency on-call duty
- consent to receive automated crisis alerts
- preferred safety transport
- after-hours availability
- authority to receive conversation content

Verdict:
POTENTIAL RECIPIENT SOURCE, NOT SUFFICIENT RECIPIENT AUTHORITY.

## Finding 2 — Client emergency information

Canonical substrate:
\`client_emergency_info\` stores:
- emergency contacts
- safety plan
- crisis resources
- risk notes and medical/safety information

Runtime consumers exist for practitioner session preparation and the practitioner emergency-info route.

Meaning:
An emergency contact entry says that a contact exists in the client's safety information.

It does NOT currently encode:
- consent for MAIA/Soullab to contact that person automatically
- which safety events authorize contact
- preferred notification channel
- whether contact remains current
- whether the contact has accepted a safety role

Verdict:
SAFETY CONTEXT, NOT AUTOMATIC DELIVERY AUTHORITY.

Do not convert \`is_primary\` into notification permission.

## Finding 3 — Youth guardian / on-call protocol

Canonical documents:
- \`docs/youth/GUARDIAN_CONSENT.md\`
- \`docs/youth/ON_CALL_PROTOCOL.md\`

The documents promise/describe:
- same-day Soullab team notification during coverage hours
- possible guardian contact for serious safety flags
- a private primary/backup on-call roster
- guardian outreach without conversation content
- explicit criteria for when guardian contact is warranted

Runtime/schema census:
- no \`guardian_links\` table was found
- no \`guardian_safety_alerts\` table was found
- no runtime guardian-recipient resolver was found
- no repository on-call roster or resolver was found
- the only \`guardian_links\` / \`guardian_safety_alerts\` references are TODO comments in \`teenSupportIntegration.ts\`

Verdict:
DOCUMENTED HUMAN PROCESS / PROMISE, NOT EXECUTABLE AUTHORITY SUBSTRATE.

This is a material governance gap because product-facing consent language currently describes a human notification process that runtime cannot prove.

## Finding 4 — Existing alert-service contact type

\`RealTimeAlertService\` accepts a \`TherapistContact\` carrying:
- email / phone
- preferred alert method
- emergency-only flag
- timezone
- optional on-call hours

But no canonical construction or authoritative data resolver for this contact type was found.

Verdict:
DELIVERY ADAPTER SHAPE, NOT RECIPIENT AUTHORITY.

## Required separation

The future system must distinguish:

1. RELATIONSHIP STANDING
   A practitioner/client or guardian relationship exists.

2. SAFETY-RECIPIENT AUTHORITY
   This person/role is authorized to receive this class of safety consequence.

3. CONTACT ROUTE
   A current address/phone/endpoint and permitted transport exist.

4. AVAILABILITY
   The recipient is eligible for this event at this time.

5. DISCLOSURE SCOPE
   The payload is limited to what the relationship and policy permit.

6. DELIVERY WITNESS
   The transport result establishes only the standing actually witnessed.

None may be inferred from another.

## Minimum recipient-resolution contract

A future resolver should return either an explicit refusal or a bounded recipient grant conceptually containing:

- recipient role
- recipient identity reference
- authority source
- relationship/source record
- consequence classes permitted
- disclosure scope
- permitted transport(s)
- current availability basis
- effective_from / effective_until where applicable
- revocation/expiry state

A raw email address or phone number is not a recipient grant.

## Refusal states

The resolver must be able to distinguish at least:
- NO_RELATIONSHIP
- RELATIONSHIP_NOT_ACTIVE
- NO_SAFETY_RECIPIENT_GRANT
- RECIPIENT_NOT_AVAILABLE
- NO_PERMITTED_TRANSPORT
- AUTHORITY_AMBIGUOUS
- RECIPIENT_RESOLVED

All refusal states remain non-delivery truth; none may be converted into "team notified."

## Privacy boundary

A recipient grant does not imply permission to disclose conversation content.

For youth, the existing protocol explicitly limits guardian outreach to the signal/logistics layer and prohibits transcript, quote, or paraphrase disclosure.

For practitioner alerts, disclosure scope must be derived from the governing professional relationship and safety policy, not assumed from technical reachability.

## Ruling

Do not close S1 or S2 by wiring:
- any active practitioner automatically
- any emergency contact automatically
- a generic Soullab team mailbox
- the private youth roster through ad-hoc environment variables
- guardian email/phone without an executable consent/authority record

The repository currently has enough substrate to design a lawful resolver, but not enough to infer one.

## Next lawful act

Before code:
\`NON-DELIVERY-R1B2 — SAFETY RECIPIENT POLICY ADJUDICATION\`

That act must decide which existing relationship(s) may become recipient grants, under what consequence classes and disclosure scopes, and how youth guardian/on-call authority becomes executable without violating the current consent promises.

Until that ruling exists:
- S1 remains OPEN
- S2 remains OPEN
- S3 remains OPEN
