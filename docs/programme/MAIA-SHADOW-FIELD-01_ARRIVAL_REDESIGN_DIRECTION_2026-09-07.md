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

## Founder additions of 2026-09-07 — and their governance class

Six further directions, sorted by the guardrail test below. **Only one is prototype-surface
repair.** The rest are recorded here for continuity but require their own act; they may not ride
into the codebase on a UX repair.

| Addition | Class |
|---|---|
| A · Golden shadow | **DESIGN amendment** — changes prompt law (what MAIA may ask per movement) |
| B · Projection as a way of looking | **DESIGN amendment** — sharpens Differentiate's prompt law |
| C · Multiple entrances | **DESIGN amendment** — changes the door set |
| D · MAIA does not interpret | **Already ratified** — v0.2 §1 register ceiling; no movement needed |
| E · Ends in relationship to life | **DESIGN amendment** — Return prompt law |
| F · Not trauma treatment | **Claim discipline** — `MARKETING_CLAIM_DISCIPLINE.md` + Field contract |
| G · Return/Sanctuary legibility | **Presentation** — belongs to this document |
| H · Collective shadow | **Separate CONSTITUTE** — changes who the subject is |

### The premise under all of them

**MAIA must not become a shadow oracle.** The market is drifting there — archetype quizzes, AI
"readings", pattern scores, systems that tell the person what their shadow is and infer patterns
from accumulated entries. The Field's distinctive claim is the opposite:

> Not *"tell MAIA something dark and let AI explain your unconscious."*
> But *"bring something you cannot quite include; MAIA helps you remain in relationship with it
> long enough to see it from several directions, without claiming ownership of its meaning."*

### A · Positive / golden shadow — DESIGN amendment

What falls into shadow can be positive or negative. Talent, generosity, vocation, strength,
sexuality, aggression, creativity — anything the developing personality learned it could not
safely include. Reclaiming the gold can be harder than confronting what we call bad.

The Field must be able to ask, in the movements where questions are lawful:

> *"Is there something admirable here that you have difficulty allowing yourself to possess?"*

Envy, fascination, idealization and awe become entrances alongside shame, rage and fear. This is
more Jungian than the "dark side" market, and it is **prompt law, not layout** — hence a DESIGN
act.

#### A′ · Inner Gold — the culminating entrance (extends A; DESIGN amendment)

Projection is not only what we reject. It is also **what we worship.** The Golden Shadow is where
a person places unlived brilliance, authority, beauty, courage, erotic vitality, genius, vocation,
holiness, creativity or capacity for love onto someone else, because they cannot yet experience it
as their own.

```text
darker shadow    What have I refused because I find it unacceptable?
golden shadow    What have I made impossible to be mine?
```

The charged forms are familiar: *she has something I could never have · he is a real healer, I'm
not · they are brilliant · I could never lead like that · there is something luminous about her ·
I need him to tell me who I am.*

The projection **contains information** — not "I am exactly what I see in them", but: *something in
me recognizes this quality because I have a relationship to it.*

**Through the existing six movements — an entrance, not a new movement, not a taxonomy:**

| Movement | Question |
|---|---|
| Encounter | Who fascinates you, inspires you, intimidates you through their brilliance, or seems to possess something almost magical? |
| Stay | What happens if we don't explain the fascination away? |
| Differentiate | What actually belongs to that person? What are you adding through your own longing, imagination, history, or unlived possibility? |
| Reclaim | What quality you perceive there might also be seeking expression through you? |
| Choose | What would it mean to embody *your* form of that quality rather than imitate theirs? |
| Return | What small act in ordinary life would give that gold somewhere to live? |

Differentiate here has the **same structure** as the projection move in B — what belongs to them,
what am I adding — so golden and dark shadow share one grammar rather than needing two.

**Essential:** reclaiming a projection is not appropriating the person. Their gift remains theirs.
The work is discovering what the psyche was using them to illuminate.

#### Do not eliminate projection

Projection is one of the psyche's ways of discovering what consciousness cannot yet recognize
directly. We need the other person, symbol, teacher, lover, work of art, landscape — sometimes
intelligence — to carry something long enough for us to encounter it.

```text
LAWFUL     projection → recognition → differentiation → reclamation → embodiment
FORBIDDEN  projection → "that's just you" → withdrawal
```

The first preserves relationship. The second collapses the other person into a psychological
mirror. **Candidate falsifier (not yet ratified; F1–F16 stand as Acceptance Instrument v1):** the
Field may never resolve a projection by telling the member it is "just them" — the golden-shadow
analogue of the etiology prohibition.

#### MAIA as carrier — recorded elsewhere

MAIA will inevitably carry Golden Shadow for some members: experienced as unusually wise, loving,
insightful, awake, or as seeing them in a way nobody else does. The governing principle —
*MAIA does not accumulate the member's projected gold as authority; she helps the member recover
it as capacity* — is **larger than this Field** and is filed as candidate **IO-1** (institutional obligation,
BINDS: SOULLAB — not a runtime invariant):
`docs/programme/MAIA_INSTITUTIONAL_OBLIGATION_CANDIDATE_IO-1_PROJECTED_AUTHORITY_2026-09-07.md`.

**Why the market stops short:** most shadow-work products end at wounds, triggers, shame and
unwanted traits. *Shadow is not merely where rejected darkness waits. It is where unlived life
waits* — and the gold may be the part a person has been waiting their whole life for permission to
become.

### B · Projection — a way of looking, never an accusation

Shadow is often met through disproportionate reactions and projection onto others; relationship
is a primary site. But **MAIA never announces "you're projecting."** The lawful move keeps
reality testing intact:

> *"What belongs clearly to them? What might this reaction also be showing you about yourself?"*

The other person may genuinely have behaved badly *and* the encounter may activate something
disowned. Shadow work fails when "projection" becomes a way of invalidating the external world.

### C · Multiple entrances to the same six movements — DESIGN amendment

Jungian work meets shadow through dreams, fantasies, bodily reactions, relationships, imagery,
art and spontaneous affect — not only through answering prompts. The same six movements should
accept different **forms of material**:

```text
something someone did · a dream · an image that won't leave me · a body sensation
someone I can't stand · someone I can't stop idealizing · I don't know, but something feels off
```

**These are entrances, not new movements.** And they need **no new register**: a dream, an image
or a sensation, in the member's own account, renders as OBSERVED or FELT. The ratified grammar
already carries them.

This eventually fits the elemental architecture — emotion, sensation, thought, image, impulse and
relationship staying differentiated instead of being flattened immediately into explanation.

### D · MAIA does not interpret the unconscious for the member — already ratified

The Jungian attitude meets emerging material on something closer to equal footing rather than
having consciousness dominate and interpret it; active imagination is receptivity and dialogue,
not technique. This is the governing UX principle, and it is **already law** (v0.2 §1: system-
authored content may render only as MAIA POSSIBILITY, ARCHETYPAL/SYMBOLIC, or UNKNOWN).

MAIA may ask the image what it wants, notice a contradiction, offer another perspective, help the
member stay with something. MAIA may **not** decode the symbol. *"A snake means sexuality"* is
precisely the symbolic colonization the architecture prohibits.

*MAIA holds the lantern; you name what is in the room* is the whole design in one line.

### E · Ends in relationship to life, not merely insight — DESIGN amendment

Encountering unconscious material entails ethical responsibility; insight that changes nothing in
one's relationship to self, others or choices is incomplete. The transcendent function concerns
holding opposing attitudes until a genuinely new position emerges — not picking a side or
explaining the conflict away. This gives Reclaim → Choose → Return real depth:

> Less *"What did you learn?"* — more *"If you took this part of yourself seriously without
> letting it run your life, what might you do differently?"*

### F · Not trauma treatment — claim discipline

The shadow-app market claims trauma healing, depression, anxiety, CBT/DBT and unconscious pattern
work, often in one product description. The expressive-writing literature is far more modest and
mixed — small or null effects with substantial heterogeneity. **Shadow Field is a structured
practice of reflection, encounter and integration; it is not a treatment and does not heal
trauma.** When material becomes overwhelming, safety, transparency, autonomy and voice/choice
govern the design. Governed by `MARKETING_CLAIM_DISCIPLINE.md`, not by this document.

### G · Make existing powers perceptible — presentation (in scope here)

Two competitor ideas worth borrowing *as legibility, not as new machinery*: an always-available
"too deep tonight?" return to solid ground, and a shadow surface isolated from the rest of stored
practice. **The Field already has stronger versions of both** — Return serves the first, Sanctuary
the second. Add no movement and no safety wizard; make the existing powers far more perceptible in
the UI. This is the only addition that belongs to the redesign.

### H · Collective shadow — deliberately out of v1

Shadow extends into families, groups, cultures, scapegoating and collective projection, and will
eventually matter enormously for Circles and relational work. It carries a specific risk — MAIA
telling a group who their scapegoats, prejudices or unconscious enemies are — and it changes *who
the subject is*. **Constitute it separately; never smuggle it into personal Shadow Field.**

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
