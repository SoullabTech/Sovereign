# MAIA Shadow Field — Arrival & Room Redesign Direction

**Date:** 2026-09-07 · **Lane:** MAIA-SHADOW-FIELD-01 · **Status: DIRECTION ONLY — NOT AUTHORIZED**

## Custody

This document is **design direction, not a repair**. It changes no code. The P8 witness subject
stays frozen (code-identical through `2277119cd`) and the §12 rubric stays unspent. Nothing here
may be implemented until:

1. the one Network datum is captured, and
2. the founder witness attempt is closed **BLOCKED** (witness §13).

It is **PROTOTYPE-surface work, not a DESIGN reopening.** Constitution v0.2 and the DESIGN
register table are unchanged; no law, register, memory rule, or provenance rule moves. If a
proposal here would require one to move, it is out of scope and returns to CONSTITUTE.

Origin: founder direction after the blocked walk of 2026-09-07, responding to witness §13's
architectural finding that the standalone route presents an overlay component as the room.

## The premise

Most of the shadow-work market is journaling, archetype quizzes, mood tracking and mystical
decoration. MAIA's premise is different — a sovereign relational field in which the person names
what is present and MAIA holds light without claiming interpretive authority. The redesign
borrows the *structural* pattern that stronger contemplative interfaces share (one focal action,
constrained measure, progressive disclosure, explicit privacy choice, full-screen sense of
place) and rejects the genre's aesthetics entirely.

## 1 · The threshold becomes a full room

No modal. No sheet. No clickable scrim. The route owns the viewport.

```text
┌──────────────────────────────────────────────────────────────┐
│  ← The House                                   Shadow Field  │
│                            ◯                                 │
│                      subtle lantern                          │
│                       SHADOW FIELD                           │
│         A place to meet what you have not yet                │
│                  been able to include.                       │
│              MAIA holds the lantern.                         │
│            You name what is in the room.                     │
│                 ─────────────────                            │
│      What this is            What this is not                │
│      Questions               Diagnosis                       │
│      Ways of looking         Reading your unconscious        │
│      Your own words          A permanent record              │
│      ┌────────────────────────────────────┐                  │
│      │ Sanctuary                          │        toggle    │
│      │ Nothing from this sitting is kept. │                  │
│      └────────────────────────────────────┘                  │
│               [ Enter the Shadow Field ]                     │
│                        Not now                               │
└──────────────────────────────────────────────────────────────┘
```

**The copy stays.** The writing is already doing what the canon asks; it is the architecture that
is unworthy of it.

## 2 · Sanctuary as a real decision

The tiny checkbox is the wrong primitive. This is not a remembered preference — it is a
sovereignty decision about the psychological container, and it belongs in the environment rather
than in explanatory prose (SAMHSA trauma-informed principles: safety, transparency,
collaboration, voice and choice). A substantial choice surface: `○ Regular field` / `○ Sanctuary`,
or one large toggle card with an unmistakable state.

**Constraint:** Sanctuary Mode invariant 5 — default off. Regular field is the pre-selected state;
Sanctuary is an explicit act.

## 3 · Entering should feel like entering

A restrained 400–700 ms transition: House chrome recedes, the lantern becomes slightly more
present, Arrival language dissolves, MAIA's first invitation emerges. No theatrical animation, no
occult vortex. The transition communicates: *you have crossed a threshold, and you remain
completely free to leave.*

**Constraint:** honour `prefers-reduced-motion`, and never let the transition block or delay the
exit control. Imposed theatrics are their own sovereignty failure.

## 4 · The room is radically quiet

One MAIA turn at a time. No dashboard, no card grid, no progress percentage, no "Shadow Level 3",
no archetype assignment, no diagnostic sidebar. **The intelligence is in the conversation, not the
interface.** (This is also F-series enforcement: a progress model and a hidden profile are exactly
what DISCOVER retired.)

## 5 · An actual reading measure

~600–760 px of prose on desktop, ≈55–75 characters per line — not 1800 px. Empty space then
surrounds a composition instead of being unused viewport.

## 6 · Exit must be deliberate — but never negotiated

**Founder proposal:** a `Leave Shadow Field? [Leave] [Stay]` confirmation.
**Ruling: rejected on constitutional grounds.** Constitution v0.2 §5 — *"Exit is one gesture,
immediate, always visible, no justification."* A confirmation makes exit two gestures and asks the
member to reconsider at the moment the law forbids anything standing between them and the door.
The person most likely to meet that dialog is the one who most needs the door to open on the first
press.

The diagnosis is right; the remedy inverts:

```text
REMOVE   scrim-dismiss entirely — leave() must not be bound to the background
KEEP     Leave as one gesture, always visible, never confirmed
PROTECT  by placement and affordance — Leave sited away from the primary flow,
         never adjacent to the input — never by a question
```

*Nothing accidental should exit the Field; nothing deliberate should be asked to justify itself.*

## 7 · Refusal needs human language

Witness §13's established finding is a redesign requirement. Never `if (!res.ok) return;`. At the
threshold the UI must distinguish at least: not signed in · no access · request failed ·
temporarily unavailable. W3C guidance is explicit that an unsuccessful action must produce clear
feedback rather than redisplaying the same state.

Model copy — note that it says what did **not** happen, which is the part that protects trust:

> **Session required.** Shadow Field needs an active MAIA session before it can open.
> Your entry has not begun and nothing has been recorded.
> `Sign in` · `Return to House`

## 8 · Spatial grammar — and its mapping to the ratified movements

The interface's hidden spatial grammar: **Threshold → Descent → Encounter → Return.** Never
exposed as wizard steps; that would cheapen it.

**This carries no authority.** The Field has six ratified movements and §12 scores against those.
Two vocabularies would drift, so the mapping is fixed here:

| Spatial (presentation) | Ratified movement (authority) |
|---|---|
| Threshold | pre-activation Arrival — no movement yet |
| Descent | door choice — still no MAIA turn |
| Encounter | Encounter · Stay · Differentiate · Reclaim · Choose |
| Return | Return |

Spatial grammar is presentation. It never renames, reorders, or merges a movement.

**And it never becomes executable.** There must be no second enum — no
`threshold | descent | encounter | return` — competing with the ratified movements in code. The
implementation carries two distinct things:

```text
PRESENTATION STATE          RATIFIED FIELD MOVEMENT
arrival                     Encounter
active                      Stay
returning / return          Differentiate
                            Reclaim
                            Choose
                            Return
```

Threshold/Descent/Encounter/Return stays design language in this document, under the mapping
above. It acquires no authority, no type, and no branch.

## 9 · Explicitly rejected directions

No gothic/occult UI · no therapy dashboard · no purple-gradient wellness · no "dark mode =
shadow" · no masks, shattered mirrors, ravens, smoky portals, or Jungian kitsch · no gamified
progress over psychological depth.

**The visual metaphor is light entering darkness — not darkness as decoration.**

## Likely architecture — one core, two containers

The emerging answer to "is the sheet bad code?" is no: it is being asked to perform the wrong job
on the standalone route.

```text
                    shared Shadow Field core
                           │
              ┌────────────┴────────────┐
              │                         │
     Standalone Field             Invoked Field
     full-route container         overlay/sheet container
              │                         │
      Shadow Field is              Shadow Field enters
         the place                 an existing context
```

Shared underneath: session lifecycle · the six ratified movements · prompt/cognition machinery ·
Sanctuary semantics · memory and provenance rules · refusal handling · constitutional exit
behaviour. **Different only at the container/presentation boundary.**

This is the likely shape, not a taken decision — the Invoked entrance remains deferred until
activation-turn isolation is structurally shown, and the split is a PROTOTYPE v2 act.

## The guardrail test

> **If a UX improvement requires law to move, it is no longer UX repair.**

A designer may change measure, composition, motion, hierarchy, affordances, responsive behaviour,
containers, and error presentation. The moment the work requires changing **exit, memory,
provenance, authority, or movement semantics**, it stops being prototype-surface repair and
returns to CONSTITUTE.

## Sequence

```text
1. capture the one Network datum
2. close founder walk attempt 1 — BLOCKED
3. restore the localhost founder session (environment prep, not subject change)
4. THEN this direction becomes the deliberate repair subject:
     restore functioning entry
     make refusal visible and humane
     rebuild Arrival as a room
     remove scrim-dismiss
     House discoverability only if the design requires it
5. a later successful walk is a NEW witness run against whatever subject then exists
```

Repair remains on HOLD.
