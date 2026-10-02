# PORTAL-MESSAGE-IDENTITY-BOUNDARY-01

**Date:** 2026-10-01
**Evidence base:** commit:`ac7bfd353128210c5f1e7012e0b71a9256035834`
**Class:** A — identity / privacy / safety-delivery boundary

## Finding

The between-session portal message path collapsed two different practitioner identities into one variable named `practitionerId`.

Current baseline schema proves the identities are distinct:

- `practitioner_clients.practitioner_id` references `practitioners(id)` — the practice record;
- `message_policies.practitioner_id` references `members(id)` — the practitioner person;
- `client_messages.practitioner_id` references `members(id)`;
- `safety_concern_logs.practitioner_id` references `members(id)`.

`validateMessageToken()` joined `practitioner_clients` and returned `c.practitioner_id`, therefore returning the practice-record id.

The portal route then passed that same value into message policy lookup, message persistence, PHI encryption ownership, safety logging, and safety notification, all of which require the practitioner member id.

## Consequence

This is a source-proven identity-contract defect.

A practice-record UUID cannot satisfy the foreign-key contract of member-owned messaging tables unless the two unrelated UUIDs happened to be equal.

The route also queried `members.id = practitionerId` using the practice-record id, so even read-only messaging context could fail to resolve the practitioner person.

No production cross-member or destructive probe was used to demonstrate failure. The defect is established by current baseline foreign-key contracts plus the source call chain.

## Repair

The repair carries both identities explicitly:

`PortalPractitionerIdentity = { practitionerRecordId, practitionerMemberId }`

Token validation now joins `practitioners` and returns both values.

The portal slug resolves both values as well and requires both to match the token-derived relationship.

Use is then separated by table contract:

- practitioner-client relationship verification uses `practitionerRecordId`;
- member display identity uses `practitionerMemberId`;
- `message_policies` uses `practitionerMemberId`;
- `client_messages` uses `practitionerMemberId`;
- PHI encryption/decryption ownership uses `practitionerMemberId`;
- `safety_concern_logs` and safety email lookup use `practitionerMemberId`.

## Non-authorizations

This repair does not:

- create a MAIA member-to-practitioner send route;
- change crisis recognition;
- create automatic disclosure;
- change portal token scope or lifetime;
- widen practitioner access;
- change message urgency semantics;
- change Stage A PHI dual-write behavior;
- claim that practitioner email notification succeeds when the message merely persists;
- deploy anything.

## Falsifiers

The repair fails if:

1. `practitioner_clients` is queried with the practitioner member id instead of the practice-record id;
2. `message_policies`, `client_messages`, or `safety_concern_logs` receive the practice-record id;
3. PHI AAD binds a client message to the practice-record id instead of the practitioner member id;
4. the portal slug is verified against only one identity while the other differs;
5. `validatePortalAccess()` exposes a single ambiguous `practitionerId` again.

## Relation to SAFETY-DISCLOSURE-01

SAFETY-DISCLOSURE-01 R3 discovered this defect while asking whether portal message semantics could support a future member-controlled safety off-ramp.

The repair is prerequisite hygiene, not authorization for that off-ramp.

R3's existing holds remain:

- no borrowing of portal-token authority;
- no MAIA member-send route yet;
- no automatic safety disclosure;
- no widening of safety-adjacent PHI into messaging without the explicit Stage A / Phase 2B ruling;
- no conflation of message persistence with practitioner notification delivery.

## Standing

**IDENTITY CONTRACT REPAIRED IN CANDIDATE · BOTH PRACTITIONER IDENTITIES EXPLICIT · NO NEW DISCLOSURE AUTHORITY · NO DEPLOYMENT.**
