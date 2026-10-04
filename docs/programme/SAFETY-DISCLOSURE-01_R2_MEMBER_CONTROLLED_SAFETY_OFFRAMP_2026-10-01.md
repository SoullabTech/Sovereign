# SAFETY-DISCLOSURE-01 · R2 — Member-Controlled Safety Off-Ramp

**Date:** 2026-10-01
**Status:** DESIGN CANDIDATE · no UI wiring · no transport change
**Parent:** SAFETY-DISCLOSURE-01 authority contract + R1 substrate census

## Purpose

Define the lowest-authority way MAIA may help a member contact their practitioner after a deterministic safety response without converting crisis recognition into disclosure authority.

## Existing substrate chosen

The existing portal between-session message **contract** is the correct behavioral model for an active safety contact because:

- the member authors the message;
- the member selects urgency, including `safety_concern`;
- the message has an actual practitioner delivery/notification path;
- it is already distinct from private reflection and from passive field visibility.

**The existing portal route itself is not directly reusable from canonical MAIA.** `/api/portal/[slug]/messages` is token-authenticated, while the canonical MAIA member turn is authenticated through the ordinary member session. R2 therefore reuses the member-authored message semantics, not portal-token authority.

`sendClientMessage()` is an internal persistence/service seam, not an authentication boundary. Any future MAIA off-ramp requires a separately governed authenticated-member resolver that establishes the exact practitioner-client relationship before supplying `clientId` and `practitionerId` to that service.

Now What? practitioner visibility is not used as the safety-contact mechanism. It is a quieter, revocable field-sharing act, not an urgency signal.

`bringForward()` is also not used as the safety-contact mechanism. It is a relational snapshot object model, not a notification channel.

## R2 law

### O1 — Offer, never send

After a hard safety override, MAIA may offer a member-controlled action such as:

> Message my practitioner

The offer is not a disclosure.

No message is created, sent, shared, or persisted merely because the recognizer fired or because the action is visible.

### O2 — Recipient must already be real

The action may appear only when the system can establish a real practitioner-client relationship for the authenticated member.

A practitioner must never be guessed from profile data, old notes, a generic practitioner role, or a member-supplied arbitrary identifier.

If there is more than one valid practitioner relationship, the member must choose the recipient before anything can be sent.

### O3 — Composer first

Choosing `Message my practitioner` opens the existing message-composer posture.

It does not send directly from the MAIA safety response.

The final crossing still requires the member's ordinary Send act.

### O4 — No system-authored safety message

By default the composer opens without MAIA-authored interpretation of the crisis turn.

The system must not generate a clinical summary, diagnosis, risk score, explanation, or 'what happened' narrative for the practitioner.

### O5 — Current member words may be copied only by a second explicit act

A low-friction optional gesture may be offered:

> Use what I just told MAIA

If chosen, it may copy only the member's current utterance into the draft.

It may not include:

- hidden conversation history;
- MAIA's crisis classification;
- cognitive profile or field-safety state;
- inferred risk level;
- memory, astrology, relationship, developmental, or shadow context;
- MAIA-authored interpretation.

The draft remains editable and unsent until the member chooses Send.

### O6 — Urgency remains a member act

`safety_concern` must not be silently preselected merely because crisis recognition fired.

The composer may explain the available urgency choices, but the member selects the urgency attached to their outgoing message.

This preserves the existing law demonstrated by the portal substrate: the member authors both the content and its urgency declaration.

### O7 — Declining creates nothing

If the member ignores or declines the off-ramp:

- no practitioner notification occurs;
- no disclosure record is created;
- no risk state is persisted;
- no refusal or decline is exposed to the practitioner;
- ordinary privacy remains intact.

### O8 — Safety resources do not depend on practitioner contact

The deterministic member-facing safety floor remains complete without this off-ramp.

Practitioner messaging is an optional relational act, not a prerequisite for receiving immediate crisis-resource guidance.

## Falsifiers

R2 is defeated if any implementation:

1. auto-sends when crisis recognition fires;
2. auto-selects a practitioner without relationship authorization;
3. auto-selects `safety_concern` based on model/system classification;
4. sends MAIA's interpretation rather than member-authored or explicitly copied member words;
5. includes hidden context in the draft;
6. treats opening the composer as consent to send;
7. records the member's decline for practitioner consumption;
8. makes practitioner availability a condition for the deterministic safety response.

## Relation to PR #1678

The practitioner-field recipient-boundary defect found during R1 is separate from this off-ramp.

Any recipient resolution used here must obey the same identity law: authenticated member identity must resolve through the actual practitioner-client relationship. Generic practitioner role is never sufficient.

## Additional integration hold

Before implementation, R3 must resolve:

- authenticated MAIA-member → exact practitioner-client relationship translation;
- whether the current message persistence contract is acceptable for safety-adjacent content, including its present plaintext + encrypted-column write behavior;
- how practitioner notification is invoked without importing portal-token authority;
- how message policy availability is surfaced before offering the action;
- multi-practitioner selection when more than one live relationship exists.

## Standing

**CANDIDATE DESIGN · MEMBER-CONTROLLED OFFER ONLY · MESSAGE CONTRACT REUSED, NOT PORTAL-TOKEN AUTHORITY · NO AUTOMATIC DISCLOSURE · NO IMPLEMENTATION AUTHORIZED BY THIS RECORD.**
