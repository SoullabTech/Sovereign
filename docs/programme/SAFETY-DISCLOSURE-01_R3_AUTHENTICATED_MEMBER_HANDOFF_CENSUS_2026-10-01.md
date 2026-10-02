# SAFETY-DISCLOSURE-01 · R3 — Authenticated Member Handoff Census

**Date:** 2026-10-01
**Status:** CENSUS · no implementation · no route wiring
**Parent:** R2 Member-Controlled Safety Off-Ramp

## Question

Can canonical MAIA reuse an existing authenticated member-to-practitioner message path directly?

## Finding

**No.** The current live message surfaces divide authority differently:

- `/api/portal/[slug]/messages` is client-facing but token-authenticated;
- `/api/comms/threads/[threadId]/messages` is session-authenticated but practitioner-side;
- `sendClientMessage()` is an internal service that expects already-resolved `clientId` and `practitionerId` and is not itself an authentication boundary.

Therefore a canonical MAIA off-ramp needs its own authenticated-member relationship resolver before it can lawfully reuse the message persistence/service contract.

## Existing portal route

The portal POST requires:

- practitioner slug;
- a message access token;
- token validation to derive client and practitioner identity;
- slug/practitioner consistency;
- member-authored message body;
- optional member-selected urgency.

When urgency is `safety_concern`, the route synchronously logs the safety concern and then invokes practitioner notification best-effort for a new log entry.

That route is a complete portal action, but its token is part of its authority. Canonical MAIA must not synthesize or bypass that token merely because the same member has an ordinary authenticated session.

## Existing comms thread route

The generic comms POST uses the authenticated session, but its actor is the practitioner.

It checks that the practitioner may send into the requested thread and persists practitioner-side replies.

It is not a member-to-practitioner off-ramp and must not be repurposed by swapping actor ids.

## Internal sendClientMessage service

`lib/portal/messages.ts::sendClientMessage()`:

- verifies the supplied `clientId` belongs to the supplied `practitionerId`;
- verifies messaging policy allows client messages;
- validates body length/content;
- persists a `client_to_practitioner` message;
- preserves member-selected urgency.

But it does not establish that the caller is the member behind `clientId`.

That authority comes from the route that resolved the ids. A future MAIA seam must establish this independently from the ordinary member session.

## Identity law for a future MAIA seam

The resolver must start from authenticated `members.id` and derive candidate relationships through `practitioner_clients.member_id`.

For each candidate, practitioner identity must be interpreted through the table contract:

- `practitioner_clients.practitioner_id` is a `practitioners.id` record;
- the receiving human/practice identity comes from that bounded relationship;
- relationship status and message policy must be evaluated before offering the action.

Do not accept request-supplied practitioner ids as authority.

## Multi-practitioner case

If zero eligible live relationships permit messaging:

- do not render `Message my practitioner`;
- the deterministic safety response remains complete without it.

If exactly one eligible relationship permits messaging:

- the composer may name that practitioner/practice truthfully.

If more than one eligible relationship permits messaging:

- the member must choose the recipient before content or urgency can be submitted;
- the system must not infer which practitioner is 'primary' from recency, memory, programme context, or MAIA judgment.

## Notification boundary

The practitioner safety notification is currently route-level behavior in the portal POST, not a side effect of `sendClientMessage()` itself.

The service still contains a TODO noting safety notification, so a future MAIA route cannot assume calling the service will notify anyone.

Any handoff implementation must explicitly account for:

1. message persistence result;
2. safety-concern log idempotency;
3. practitioner notification attempt/result;
4. truthful member confirmation of what actually occurred.

A persisted message is not proof that an email notification succeeded.

## PHI / persistence finding

`sendClientMessage()` currently writes both plaintext `body` and encrypted `body_enc` / `body_enc_meta` columns.

That is existing platform behavior and this census does not adjudicate its current legality or migration standing.

But a new MAIA safety off-ramp would intentionally route highly sensitive safety-adjacent content into this substrate. That is an expansion of use and must not occur without an explicit PHI/privacy review of the current plaintext-plus-encrypted write contract.

## Member-copy boundary

If R2 later supports `Use what I just told MAIA`, the only automatically copied text may be the current member utterance, and only after a second explicit member act.

The relationship resolver and message service must never receive hidden MAIA context, risk classification, model analysis, memory, or conversation history by default.

## Required pre-implementation gates

R3 leaves five blockers before any UI/code integration:

1. authenticated-member → relationship resolver design and falsifiers;
2. message-policy discovery contract;
3. multi-practitioner recipient-choice contract;
4. PHI/privacy ruling on the current message persistence shape for safety-adjacent content;
5. notification-result contract so 'message sent' and 'practitioner notified' cannot be conflated.

## Standing

**NO DIRECT AUTHENTICATED MEMBER SEND ROUTE EXISTS FOR CANONICAL MAIA · PORTAL AUTHORITY MUST NOT BE BORROWED · SERVICE SEMANTICS ARE REUSABLE ONLY AFTER A NEW MEMBER-AUTHORITY SEAM AND PHI REVIEW.**
