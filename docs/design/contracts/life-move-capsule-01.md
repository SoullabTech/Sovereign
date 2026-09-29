# LIFE-MOVE-CAPSULE-01
## Ephemeral carrier from reflection into life

**Date:** 29 September 2026
**Status:** architecture contract
**Persistence:** none by default

A Life Move Capsule carries only what is necessary for a member-chosen movement into life and a truthful return.

It is not a task manager.

It is not behavioral surveillance.

It is not a compliance object.

## Conceptual shape

```text
LifeMoveCapsule
  livingObjectId?
  sourceVersionWitnessed?
  memberChosenMove
  expectation?
  whatWouldSurpriseMe?
  unknowns?
  createdAt
  returnMarker?
  privacy
```

## memberChosenMove

Required.

The exact member-owned movement.

Example:

> “Share the chapter with two readers and ask where they lose connection.”

Not:

> “Prove the chapter is clear.”

The first names an action.

The second smuggles in a desired conclusion.

## expectation

Optional.

What the member currently expects.

It is historical evidence about expectation, not a prediction engine.

## whatWouldSurpriseMe

Optional.

A useful anti-confirmation prompt.

Example:

> “I would be surprised if both readers found the core argument clear.”

This creates room for disconfirmation.

## unknowns

Optional.

What the member knows they do not yet know.

## returnMarker

Optional and explicit.

Examples:

- “Ask me about this tomorrow.”
- “I want to return after the conversation.”
- “Bring me back to this when I reopen the work.”

A Life Move does not require a return marker.

The person may simply live.

## Prohibited fields

The capsule must not silently add:

- success criteria;
- virtue labels;
- compliance status;
- emotional interpretation;
- predicted outcome probability;
- developmental rank;
- a requirement to report back.

## Expiration

If the member does not return, the system does not chase the loop by default.

A future scheduled reminder requires separate explicit authorization.

## Governing sentence

> **Carry the member's chosen movement into life; do not carry a theory of who they are.**
