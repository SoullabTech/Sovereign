# SAFETY-DISCLOSURE-01 · R4 — Authenticated Member Relationship Resolver Contract

**Date:** 2026-10-01
**Status:** CONTRACT · non-executing · no send route
**Parent:** R3 Authenticated Member Handoff Census

## Purpose

Define how canonical MAIA may discover whether the authenticated member has any practitioner relationship eligible for a future member-controlled message composer.

R4 is discovery and authorization shape only. It does not send, draft, persist, notify, or classify safety.

## Identity starting point

The only authority input is the authenticated ordinary member session:

`actorMemberId: members.id`

The resolver must not accept a request-supplied practitioner id, client id, relationship id, portal token, programme id, or MAIA-inferred practitioner identity as authority.

## Relationship derivation

Candidate relationships are derived from:

`practitioner_clients.member_id = actorMemberId`

For each row, `practitioner_clients.practitioner_id` is interpreted only as `practitioners.id`.

The practitioner person is then obtained through:

`practitioners.id → practitioners.member_id → members.id`

Both identities remain explicit:

- `practitionerRecordId` — practice record / relationship ownership;
- `practitionerMemberId` — human identity used by between-session messaging tables and safety notification.

PR #1694 is the prerequisite repair that makes this distinction explicit in the existing portal message path.

## Eligible relationship

A relationship may be offered to the member only when all are true:

1. `pc.member_id = actorMemberId`;
2. `pc.relationship_status IN ('active', 'paused')`;
3. the referenced practitioner record exists;
4. `practitioners.status = 'active'`;
5. `practitioners.member_id IS NOT NULL`;
6. effective between-session message policy exists and permits client messages.

Pending and ended relationships are not eligible.

A paused relationship may be readable/relationally standing, but R4 must separately respect the messaging policy rather than infer send permission from pause status alone.

## Effective message policy

Messaging policy identity is `practitionerMemberId`, because `message_policies.practitioner_id` references `members(id)`.

The effective-policy rule remains the existing one:

- prefer an active client-specific policy for this `clientId`;
- otherwise use the active practitioner default policy;
- if no active policy exists, messaging is unavailable.

`allow_client_messages` must be true before the future off-ramp is offered.

R4 may return human-readable policy context needed to decide whether the action is available, but it must not read message history or message bodies.

## Resolver output

The resolver returns zero or more bounded candidates:

`{ relationshipId, clientId, practitionerRecordId, practitionerMemberId, practitionerDisplayName, practiceDisplayName, messagingEnabled, policySummary }`

All ids are server-derived.

No candidate contains:

- member message content;
- MAIA conversation text;
- safety severity or risk score;
- private field material;
- memory/developmental/astrology/shadow context;
- portal token.

## Cardinality law

### Zero eligible candidates

Do not render `Message my practitioner`.

The deterministic safety response remains complete without the relational off-ramp.

### Exactly one eligible candidate

The future composer may truthfully name that practitioner/practice.

Opening the composer is still not consent to send.

### More than one eligible candidate

The member must choose the recipient.

The system must not infer a primary recipient from:

- recency;
- current programme;
- session context;
- memory;
- practitioner notes;
- MAIA preference/judgment;
- crisis severity.

## Falsifiers

R4 is defeated if:

1. a request-supplied practitioner/client id can widen the candidate set;
2. `pc.practitioner_id` is compared directly to a member id;
3. a message-policy query uses the practice-record id;
4. pending/ended relationships appear eligible;
5. missing policy is treated as permission;
6. multiple candidates are silently reduced to one;
7. crisis severity changes recipient eligibility;
8. discovery reads any message body or private reflection;
9. a portal token is synthesized, borrowed, or required.

## Relationship to R2/R3

R2's future `Message my practitioner` action may only render from this resolver's eligible-candidate result.

R3's portal-token boundary remains intact. R4 derives authority from the ordinary authenticated member relationship, not from portal credentials.

R4 does not itself call `sendClientMessage()`.

## Implementation hold

Implementation remains blocked by:

- admission/supersession of #1694;
- Stage A versus Phase 2B PHI ruling for safety-adjacent message use;
- notification-result contract;
- eventual Experience Contract and member-facing copy for the composer/off-ramp.

## Standing

**RESOLVER CONTRACT FROZEN · MEMBER SESSION IS THE ONLY ROOT AUTHORITY · ZERO/ONE/MANY RECIPIENT SEMANTICS EXPLICIT · NO SEND/DRAFT/DISCLOSURE IMPLEMENTED.**
