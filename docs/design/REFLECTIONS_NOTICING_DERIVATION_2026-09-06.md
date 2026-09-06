# Reflections — a gentler threshold into conversation

**Status: authorized scope, not yet built. 2026-09-06.**

## The Reflections-native reason

Not *"Journal is cleaner, therefore Reflections should become transient."* That
would be the mirror of the error the two-specimen method exists to prevent.

The reason is native to this room:

> **Reflections needs a gentler threshold into conversation, not less conversation.**

Journal revealed a quality of relational arrival — MAIA meets the member's
material by noticing, rather than by presenting an empty conversational surface.
That quality belongs in Reflections. The room's defining activity does not change:
*carrying a reflection into conversation with MAIA*. Only **how that conversation
begins** changes.

## Shape

```text
member opens kept reflection
        v
Discuss with MAIA
        v
MAIA's first canonical response appears quietly
in relation to the reflection:

    MAIA noticed   ...
    MAIA asked     ...

        v
Continue with MAIA
        v
contained canonical conversation
same thread - same response - no regeneration
```

## Load-bearing constraint

> **One exchange, two presentations.**

```text
DO NOT
  transient noticing  ->  generate again when Continue is pressed

DO
  one canonical exchange  ->  two presentations of the same exchange
  quiet first presence    ->  expanded continuing conversation
```

The first noticing **is already the canonical MAIA response in the thread**.
`Continue with MAIA` changes presentation depth, nothing else. Presentation
changes; ontology does not.

This yields:

- Journal's intimacy and restraint
- Reflections' continuing relationship
- no duplicated cognition
- no second MAIA identity
- no second generation
- **no retroactive persistence problem** — nothing transient is later smuggled
  into persistence, because nothing here was ever transient
- **no change to B's status** in the extraction

## Why B survives this change

```text
Journal      transient noticing        (nothing persists)
Reflections  persistent conversation   (the noticing is canonical from birth)

B  canonical thread continuity  ->  still ROOM-SPECIFIC
```

`MAIA_PRESENT_WITHOUT_BECOMING_THE_PLACE.md` (9915cc6e) remains true. The rooms
still diverge on B; they now converge on the *manner of arrival*, which is the
cross-field familiarity layer, not an invariant.

## Sharper principle this establishes

> **Conversation does not have to announce itself as conversation immediately.**

MAIA can first meet the member's material with restraint, and let the member
decide whether to deepen into the full conversational space.

## Ruling — Reflections-local composition, NOT a CMT-01 change (2026-09-06)

```text
CMT-01
  -> what constitutes the canonical turn
  -> identity, inputs, authority, candidates, gates, cognition path

REFLECTIONS OPENING
  -> how the already-canonical cognition is asked to compose its first reply
     for this room-specific threshold
```

**Do not touch:** `lib/maia/canonical-turn/**` - the producer registry - MIPA/M3 -
canonical candidate construction - canonical gates - turn identity.

### Verified precondition — the separation already exists and is enforced

Statically confirmed in `app/api/sovereign/app/maia/list/route.ts`. The route
constructs the canonical-turn **shadow** separately from the live
`getMaiaResponse` call, and the live call's `meta` object carries the
**PROMPT-AUTHORITY INVARIANT (PBR-001, 2026-08-12)**: the client request-body
rest-spread sits at the TOP of `meta` precisely so that *client-carried metadata
may not override server-authored context that enters MAIA's system prompt*. That
placement was chosen to fix the whole class at once rather than field by field,
after the same authority inversion was closed on `depthConfig` (SECREM-001).
`placeAddendum` is already a server-authored field in that class.

**Consequence:** `reflection_opening_v1` joins that class and is structurally
incapable of being supplied or overridden by a caller. The scope rests on an
invariant that exists, not on a convention.

## What to build

A **server-authored response-form contract** for the first handoff turn:

```text
responseForm = reflection_opening_v1

produce:
  noticed: one concise observation grounded in the reflection
  asked:   one genuine question arising from that observation
```

### Direction of authority

```text
model produces noticed + asked
        v
server returns structured fields
        v
UI labels them

NOT
model produces prose
        v
UI guesses which sentence was "noticed" and which was "asked"
```

This is what closes the attribution problem. A UI that split prose into labels
would assert a structure the cognition never produced — the same defect family as
a paraphrase inside quotation marks. **The labels must be true because the model
produced them, not because the interface arranged them.**

The server composes the canonical assistant text from those generated fields, so
the durable exchange carries the same semantic content the inline page displays.

```text
Discuss with MAIA
  -> one canonical POST
  -> one exchangeId
  -> one generated response
  -> durable member + MAIA turn

inline presentation      -> MAIA noticed / MAIA asked
Continue with MAIA       -> open existing canonical conversation
                         -> restore same exchange
                         -> NO injection, NO regeneration
```

### Ownership

```text
REFLECTIONS              first-response composition contract
                         inline noticing presentation
                         Continue gesture

CANONICAL SERVING ROUTE  validating this is the Reflections handoff seam
                         server-authoring the response-form instruction
                         producing + persisting the single exchange

CMT-01                   unchanged
```

### Escalation boundary — a hard stop, not a guideline

> If implementing `reflection_opening_v1` requires changing
> `constructCanonicalTurn`, the 38-producer registry, canonical candidate/gate
> semantics, or MIPA/M3 — **STOP.** The work has crossed into CMT-01 and needs
> that lane's authority.

**Do not bend that lane to make this feature fit.**

### Naming discipline

This is **not** "use Journal's response schema." Reflections derives its own
`reflection_opening_v1`. It may converge on the same human grammar — *MAIA
noticed / MAIA asked* — because that is becoming recognizable MAIA behaviour
across fields, while the **fate** of the response stays room-specific:

```text
Journal      noticing -> transient
Reflections  noticing -> canonical + continuable
```

Same presence, different posture — the cross-field familiarity layer doing
exactly the work it was separated out to do.
