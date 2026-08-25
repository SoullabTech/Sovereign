# MAIA Launch Experience — Specification

**Date:** 2026-08-25 · **Status:** Design specification. **Nothing here authorizes a production UI change.**
**Branch:** `claude/maia-onboarding-orientation-djtoii`
**Governed by:** `docs/canon/THE_HOUSE.md` · `docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md` ·
`docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` · `docs/canon/THE_MEMBERS_WORLD_IS_PRIMARY.md` ·
`docs/canon/MARKETING_CLAIM_DISCIPLINE.md` · `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` (14, 16)

**Claim layer of this document:** **Designed**, with clearly-marked **Vision** sections.
Every surface below carries its own Live / Designed / Vision tag. Where a tag says *Live*, it means
*present in source on `clean-main` lineage as read on 2026-08-25* — **not** a production verification.
No claim in this document may be repeated outward without the runtime check named in §11.

---

## 0 · What this document is

The research pass (2026-08-25) concluded that MAIA's launch problem is not a prettier chat screen; it is that
**conversation is carrying too much of the burden of orientation**. A new member effectively meets
*"Here is MAIA. Say something."* — and must understand what MAIA is, imagine what it can do, decide what is
appropriate to share, formulate it into language, and trust the system, all before receiving any value.

That diagnosis holds. This document turns it into a buildable specification across four surfaces:

| | Surface | Question it answers | Layer today |
|---|---|---|---|
| **A** | Public MAIA landing (`/`) | *Why would I want this, and why should I trust it?* | Live (needs restructure) |
| **B** | Guided Arrival (first visit, and on demand) | *I'm new. Where do I begin?* | Partly Live (ceremony), Designed (doorways) |
| **C** | MAIA House (authenticated home) | *I'm here. What can I do now?* | Partly Live (House sheet, `/home` portal) |
| **D** | Conversation | *the work itself* | Live |

The architectural change is that **conversation becomes D, not A.**

---

## 1 · The correction the research pass needs

The memo reads as if MAIA has no orientation architecture. It has a great deal — under different names, and
already constitutionally ruled. Before designing, the record must be straight, or we will re-invent shipped
work and re-litigate settled rulings.

**Already true in this repository (read from source, 2026-08-25):**

| Memo proposal | What already exists | Where |
|---|---|---|
| "Make MAIA House, not a dashboard" | **The House is already the navigation.** Grammar: *Your Center · Worlds · Rooms*. Feature rail retired 2026-07-22. | `components/maia/MaiaHouseSheet.tsx`, `lib/navigation/maiaNav.ts` |
| "Rooms, not features" | **Canon since 2026-07-28.** Rooms name human questions: Journal (*What happened?*), Changes (*What is changing?*), Commitments, Becoming. | `docs/canon/THE_HOUSE.md` |
| "Doorways, not a feature grid" | **Shipped in the sibling platform.** Now What? Client Home is an explicit door map with LIVE/GATED states and a rule that gated doors never render as placeholders. | `docs/design/now-what/NOW_WHAT_HOME_DOOR_MAP_2026-08-05.md` |
| "A short first arrival, not a tutorial" | **Arrival ceremony exists**, with a two-state model (durable `hasArrivedBefore`, session-temporary `arrivalInvoked`) and the ruling *"returning to Arrival is opening a room, not undoing an initiation."* | `lib/maia/arrivalState.ts` |
| "Returning members get continuity, not onboarding" | **`/home` already renders a gathering strip** from `maia_sessions` (last session) and `member_memory_atoms` (most recent kept atom, incl. `is_breakthrough`). | `app/home/page.tsx`, `components/portal/PortalThreshold.tsx` |
| "First screen should be a threshold" | **Design law #3**, already canon: *"The first screen is a threshold, not a dashboard."* | `docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md` |

**So the real gap is narrower and more specific than the memo states.** It is three things:

1. **There is no doorway layer.** The House answers *where can I go?* It does not answer *what is asking for my
   attention?* A member who does not already know the names of the rooms still has to invent their own entry.
2. **The authenticated arrival is split across two surfaces** — `/home` (PortalThreshold, gathering strip) and
   `/maia` (Arrival ceremony + conversation + House sheet) — with no ruling on which one is *the* threshold.
3. **The public landing carries eleven sections** (`SoullabLanding`) and ends by handing the burden back with
   *"Begin a conversation."* The conceptual material is strong; the transition into lived use is the weak seam.

Everything below is scoped to those three gaps. Where a memo idea duplicates shipped work, this spec says so
and does not re-specify it.

---

## 2 · Constitutional constraints on this design

These are not style preferences. A doorway layer is exactly the kind of feature that can quietly violate them.

**C1 · Direction of Authority (Invariant 16).**
Authority moves upward only: Encounter → Reflection → Recognition → Living Field. A doorway is at the
**Encounter** layer. It may frame *what kind of attention the member is bringing*. It may **not** manufacture
Reflection or Recognition on the member's behalf — no "you seem to be in a period of change", no assigned
phase, no inferred readiness. *The member may jump around; the system may not.*

**C2 · The House governing principle.**
> MAIA may open doors. It may not describe what is on the other side of one in the member's own life.

A doorway card may carry a count and a question. It may not carry a characterization. This kills a whole
class of tempting copy: *"Your relationship with boundaries has shifted"* is walking through the door
uninvited; *"You've returned to this nine times — would you like to look together?"* is a door.

**C3 · The member's world is primary.**
Doorway labels name **the member's life**, not our mechanisms. Not *Semantic Recall*, not *Spiralogic Phase*,
not *Elemental Orientation*. *"Something keeps repeating."*

**C4 · Cultural sovereignty (Invariant 14).**
Doorway language must not presuppose that *self*, *growth*, *healing*, *family*, or *spirit* mean the same
thing everywhere. Doorways describe **situations**, not **framings of the person**. `I don't know` is
first-class, not a fallback.

**C5 · Consent gates already shipped are binding on this surface.**
`member_daily_anchors.surface_preference` and `member_memory_atoms.return_preference` govern **what MAIA may
bring into conversation**, defaulting to private. Critically — and this distinction is the one most likely to
be lost in a House redesign:

> A member's own material is **private from MAIA**, not private from its member.

So: the House **may** show a member their own kept material (it is theirs, on their screen). The doorway
**may not** hand that material to MAIA's opening turn unless the item's preference allows it. See §6.3 for the
two-channel rule this produces.

**C6 · Interface humility / adaptive disappearance.**
The doorway layer must get quieter as a member gets oriented. A member who arrives knowing what they want
should be able to reach speech in one gesture, forever. Orientation scaffolding that never recedes becomes
the new burden.

---

## 3 · Surface A — Public MAIA landing

**Layer: Live surface, Designed restructure.** No copy below ships without the §10 claim pass.

### A.1 The job

Fifteen seconds to: *what is this, why is it different, what happens if I press the button.*

### A.2 Structure (desktop)

```
┌──────────────────────────────────────────────────────────────────────┐
│  SOULLAB                                   About · Research · Sign in│
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                         ( holoflower, quiet )                        │
│                                                                      │
│         A different kind of intelligence for the life                │
│                    you are actually living.                          │
│                                                                      │
│    MAIA helps you understand what you are experiencing, keep what     │
│    matters, and find your own way forward.                           │
│                                                                      │
│              [  Meet MAIA  ]     See how it works ↓                  │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  WHAT BRINGS PEOPLE HERE                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐              │
│  │ Life is       │ │ Something is  │ │ I'm trying to │              │
│  │ changing      │ │ weighing on me│ │ make a        │              │
│  │               │ │               │ │ decision      │              │
│  └───────────────┘ └───────────────┘ └───────────────┘              │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐              │
│  │ Something     │ │ I want to     │ │ I'm making    │              │
│  │ between me    │ │ understand    │ │ something     │              │
│  │ and someone   │ │ myself        │ │ that matters  │              │
│  └───────────────┘ └───────────────┘ └───────────────┘              │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  WHAT TALKING WITH MAIA IS LIKE                                      │
│    [ Change ] [ A relationship ] [ Creative work ]   ← selectable    │
│    ┌────────────────────────────────────────────────┐               │
│    │ short, real, transcript-grounded exchange      │               │
│    └────────────────────────────────────────────────┘               │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  A RELATIONSHIP THAT DEVELOPS WITH YOU                               │
│    Today            Talk through what is happening.                  │
│    Over time        Notice what keeps returning.                     │
│    When you return  You do not begin your life again from zero.      │
│                                                                      │
│         MAIA remembers with consent. Never by stealth.               │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  A HOUSE, NOT A CHATBOT        ( holoflower with rooms around it )   │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  WHY MAIA IS DIFFERENT — four statements, not fifteen features       │
├──────────────────────────────────────────────────────────────────────┤
│  UNDERNEATH  AIN OS · Spiralogic · sovereign infrastructure ·        │
│              consent architecture · research         ( collapsed )   │
└──────────────────────────────────────────────────────────────────────┘
```

### A.3 Rules

- **The six "what brings people here" cards are the same six doorways as Surface B and C.** One vocabulary
  across public, arrival, and House. A member who clicks *"Life is changing"* on the landing page and then
  signs in should meet that same door, in the same words.
- **The architecture section moves below the experience**, not above it. AIN OS remains — as *evidence for the
  promise*, not as a comprehension requirement.
- **The demo exchanges must be real transcript material**, member-consented or founder-authored, never
  synthesized "example" dialogue presented as representative. (Claim discipline: a fabricated exchange
  presented as what MAIA does is capability inflation regardless of how accurate we believe it to be.)
- **`Meet MAIA` replaces `Begin a conversation`.** The current CTA hands the orientation burden back at the
  exact moment we have earned interest.

### A.4 What is removed from the current eleven-section landing

Not deleted — **demoted below the fold or moved to `/about`**: Portfolio, Past Sites, Book Announcement,
Projects. These are Soullab-the-studio material; they compete with MAIA-the-product at the moment of decision.
This is a recommendation, not a ruling — see §11 Q4.

---

## 4 · Surface B — Guided Arrival

**Layer: Designed. Builds on Live `arrivalState` two-state model.**

### B.1 When it renders

| Condition | Behavior |
|---|---|
| No durable `maia_has_arrived` marker | Full guided arrival |
| Member chose *"Help me find the thread"* in the House | Same surface, invoked — **does not touch the durable marker** |
| Marker present, no invocation | Not rendered. Straight to the House. |

This is the existing constitution in `lib/maia/arrivalState.ts`, unchanged: *returning to Arrival is opening a
room, not undoing an initiation.* The doorway layer is added **inside** that model, not beside it.

### B.2 Wireframe (mobile-first, the real environment)

```
┌───────────────────────────┐        ┌───────────────────────────┐
│                           │        │                           │
│      ( holoflower )       │        │   What brings you here     │
│                           │  →     │        today?              │
│   Welcome to Soullab.     │        │                           │
│                           │        │ ┌───────────────────────┐ │
│  MAIA is an intelligence  │        │ │ Something is on my    │ │
│  you can talk with about  │        │ │ mind                  │ │
│  your life, relationships,│        │ ├───────────────────────┤ │
│  work, and questions.     │        │ │ I'm going through a   │ │
│                           │        │ │ change                │ │
│  You don't need to know   │        │ ├───────────────────────┤ │
│  what to ask, or how to   │        │ │ I want to understand  │ │
│  use AI.                  │        │ │ myself                │ │
│                           │        │ ├───────────────────────┤ │
│      [ Continue ]         │        │ │ I need clarity about  │ │
│                           │        │ │ a decision            │ │
│                           │        │ ├───────────────────────┤ │
└───────────────────────────┘        │ │ Something in a        │ │
                                     │ │ relationship          │ │
   screen 1 · ~12 seconds            │ ├───────────────────────┤ │
                                     │ │ I'm making something  │ │
                                     │ ├───────────────────────┤ │
                                     │ │ I'm just curious      │ │
                                     │ ├───────────────────────┤ │
                                     │ │ I don't know          │ │
                                     │ └───────────────────────┘ │
                                     │                           │
                                     │  ● Speak    ○ Type        │
                                     └───────────────────────────┘

                                        screen 2 · the doorway
```

Then **MAIA opens**, framed by the door — the member is not staring into an empty field.

Total: two screens. No questionnaire. No preference configuration. **Target: under 60 seconds to first
MAIA turn.**

### B.3 The opening turn is a frame, never a seed

Per the Now What? room precedent (*"the frame orients; it never seeds content"*), the door sets **how MAIA
opens**, not **what the member is dealing with**.

| Door | MAIA's opening (Designed copy — needs voice review) |
|---|---|
| Something is on my mind | *"Start wherever it is. It doesn't have to be organized."* |
| I'm going through a change | *"What's changing?"* |
| I want to understand myself | *"What's the part you keep circling?"* |
| I need clarity about a decision | *"What are you deciding between?"* |
| Something in a relationship | *"Who is it, and what's happening between you?"* |
| I'm making something | *"What are you working on?"* |
| I'm just curious | *"Ask me anything you want. I'll tell you what I actually am."* |
| I don't know | *"That's a fine place to start. What's been taking up room lately?"* |

**Prohibited in every one of these:** any statement about the member. Not *"it sounds like you're in
transition."* The member has said nothing yet; there is nothing to reflect. (C1, C2.)

### B.4 The doorway is a member act, not an inference

Modeled on `arrivalState`'s discipline:

- The chosen door is **session-scoped by default**. It frames this conversation's opening turn and then dies.
- It is **not** persisted as a member attribute, not written to `member_spiral_state`, not used to seed an
  element, and **not** shown back to the member as a characterization ("You entered through Water").
- If we later want persistence — *"you usually come in through decisions"* — that is a **separate ruling** and
  a separate consent surface. It is Recognition-layer material and may not be manufactured from Encounter-layer
  clicks. See §11 Q2.

---

## 5 · Surface C — MAIA House (authenticated threshold)

**Layer: Designed, on Live substrate.** This is the memo's central proposal, reconciled with the shipped House.

### C.1 The reconciliation that must happen first

Two authenticated thresholds exist today: `/home` (PortalThreshold + gathering strip) and `/maia` (Arrival →
conversation, House reachable as a sheet). **They overlap and neither is ruled as canonical.** This spec
recommends:

> **`/maia` is the threshold. The House sheet becomes the House *screen* on arrival, not only a drawer.**
> `/home`'s gathering strip (last session, most recent kept atom) is absorbed into it and `/home` redirects.

Rationale: design law #3 says the first screen is a threshold; a member should not have to choose between two
homes; and the House is already the ruled navigation grammar. **This requires a ruling — §11 Q1.**

### C.2 Wireframe — returning member, desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│  ◇                        SOULLAB                          ⌂  ⚙︎     │
│                                                                      │
│                   Good afternoon, Kelly.                             │
│                What is asking for attention?                         │
│                                                                      │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │ WHERE YOU WERE                                             │    │
│   │ A conversation, Tuesday · 24 exchanges        Continue →   │    │
│   └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│   ┌─────────────────────┐  ┌─────────────────────┐                  │
│   │ TALK IT THROUGH     │  │ FIND MY NEXT STEP   │                  │
│   │ Something is on     │  │ I'm uncertain what  │                  │
│   │ my mind             │  │ to do next          │                  │
│   └─────────────────────┘  └─────────────────────┘                  │
│   ┌─────────────────────┐  ┌─────────────────────┐                  │
│   │ UNDERSTAND A        │  │ RELATIONSHIPS       │                  │
│   │ PATTERN             │  │ Something between   │                  │
│   │ Something keeps     │  │ me and another      │                  │
│   │ repeating           │  │ person              │                  │
│   └─────────────────────┘  └─────────────────────┘                  │
│   ┌─────────────────────┐  ┌─────────────────────┐                  │
│   │ MAKE SOMETHING      │  │ YOUR OWN MATERIAL   │                  │
│   │ Writing, ideas,     │  │ Journal · Keeps ·   │                  │
│   │ projects            │  │ Changes · Anchor    │                  │
│   └─────────────────────┘  └─────────────────────┘                  │
│                                                                      │
│              I don't know where to begin  →                          │
│                                                                      │
│   ─────────────────────────────────────────────────────────────     │
│   ● Talk to MAIA      ○ Type instead        The House ⌂             │
└──────────────────────────────────────────────────────────────────────┘
```

### C.3 Wireframe — first return (one prior session, nothing kept yet)

```
┌───────────────────────────┐
│                           │   No "Where you were" card — there is
│    Good evening, Kelly.   │   nothing the member kept. The strip
│                           │   renders ONLY on real evidence.
│  What is asking for       │
│  attention?               │   No "Your own material" door either:
│                           │   an empty room is a broken promise.
│  ┌─────────────────────┐  │   (Now What? door-map precedent:
│  │ Talk it through     │  │    gated doors are absent, never
│  ├─────────────────────┤  │    placeholdered.)
│  │ Find my next step   │  │
│  ├─────────────────────┤  │
│  │ Understand a pattern│  │
│  ├─────────────────────┤  │
│  │ Relationships       │  │
│  ├─────────────────────┤  │
│  │ Make something      │  │
│  └─────────────────────┘  │
│                           │
│  I don't know where to    │
│  begin →                  │
│                           │
│  ● Talk    ○ Type    ⌂   │
└───────────────────────────┘
```

### C.4 Member-state matrix

| State | Evidence | Threshold renders |
|---|---|---|
| **S0 · Never arrived** | no `maia_has_arrived` | Surface B (guided arrival) |
| **S1 · Arrived, nothing kept** | marker, 0 atoms, 0 journal | Doorways + `I don't know` only |
| **S2 · Returning, has a last session** | `maia_sessions` row | + *Where you were* card |
| **S3 · Returning, has kept material** | atoms / journal / changes | + *Your own material* door |
| **S4 · Has consented ambient anchor** | `surface_preference` ∈ (`contextual_doorway`, `ritual_review_opt_in`) | + anchor line, in the member's own words |
| **S5 · Deep member** | many rooms populated | Doorways recede (C6) — see §5.5 |

**Every row is evidence-gated.** No card renders from a *capability*; it renders from a *fact about this
member*. This is the single most important implementation rule on this surface.

### C.5 Adaptive disappearance (C6)

The doorway grid is scaffolding. Proposed rule — **needs a ruling, §11 Q3**:

> Once a member has crossed into speech on N consecutive visits without using a doorway, the grid collapses
> behind a single quiet line — *"or choose a way in"* — and the composer takes the threshold.

The recede must be **member-legible and reversible**, never a silent personalization. A one-line, one-tap
restore. And the trigger is a member behavior count, not an inferred readiness score.

---

## 6 · Continuity, consent, and the two channels

### 6.1 What the returning House may show

The *Where you were* card and *Your own material* door surface **the member's own material to the member**.
That is permitted regardless of `return_preference` / `surface_preference` — those gates make material
*private from MAIA*, not private from its owner (C5, and the explicit test in
`lib/workbench/__tests__/keepSourceAdapter.test.ts`).

### 6.2 What the doorway may hand to MAIA

**Nothing that is not already eligible.** Choosing a door must not become a back channel that promotes a
private atom into MAIA's prompt.

```
   MEMBER-VIEW CHANNEL                 MAIA-PROMPT CHANNEL
   (the House screen)                  (the opening turn)
   ───────────────────                 ───────────────────
   all of the member's own    ───✗──►  only what passes the
   material, theirs to see             existing consent gates
                                       (return_preference /
                                       surface_preference)
```

### 6.3 The one exception, and it is a member act

If a member taps *Continue* on the *Where you were* card, they have **just performed a gesture naming that
thread**. That gesture is consent to resume *that thread*, in that moment, and nothing else. It does not
promote the thread's atoms to ambient eligibility, and it does not persist.

Precedent: the Now What? room passes an **opaque thread id** — *the member's words never ride the URL.* Same
rule here.

### 6.4 What the House may never say

- ❌ *"You've been quiet for a while."* (absence read as meaning)
- ❌ *"You seem to be working through something."* (characterization — C2)
- ❌ *"Your coherence is rising."* / any field-state or RFI/UFI surface (still frozen)
- ✅ *"You've returned to this nine times. Would you like to look at them together?"* (count + question)

---

## 7 · The elemental layer stays underneath

The memo's instinct is right and matches the shipped posture: **do not greet a new member with Fire · Water ·
Earth · Air · Aether and ask them to choose.** That converts our sophistication into their onboarding problem.

The doorways are ordinary human language. Spiralogic may **read** them; it may not **display** them, and it
may not **assert** them back.

```
   MEMBER SEES                    SYSTEM MAY READ            SYSTEM MAY NOT
   ──────────────                 ───────────────            ──────────────
   "Something is calling me"  →   fire-ish opening       ✗  "You are in Fire"
   "I need to understand what
    I'm feeling"              →   water-ish opening      ✗  a persisted element
   "I need to decide"         →   earth-ish opening      ✗  a phase assignment
   "This relationship"        →   air-ish opening        ✗  a displayed mandala
   "What does this all mean"  →   aether-ish opening     ✗  a readiness score
```

**Hard constraint:** a doorway click must not write `member_spiral_state`. That table is fed by the conductor
from actual conversation, with hysteresis. A click is not evidence of an element; treating it as such would
inject an unearned Recognition-layer claim from an Encounter-layer gesture (C1).

Discovery of the elemental map is a **later, member-initiated** disclosure — after orientation, per design
law #4 (*mystery comes after orientation*).

---

## 8 · Room architecture — what this spec does and does not touch

**Unchanged and inherited:** House grammar *Your Center · Worlds · Rooms*; the canonical rooms Journal,
Changes, Commitments, Becoming; the retirement of the feature rail; the orphan-recovery discipline in
`maiaNav.ts`.

**Two boundaries this spec explicitly does not cross:**

1. **Now What? stays out.** Ruled 2026-07-22: it is a **client build on AIN OS**, not a native MAIA room. Its
   door map is a design *precedent* to borrow, not a surface to merge. Its absence from the House is a
   correctness condition.
2. **Commitments and Becoming are Vision.** They do not exist. The House screen must not render them as doors —
   not greyed, not "coming soon". Absent until real (Now What? precedent, §5.4 rule).

**Mapping the six doorways onto the House:**

| Doorway (Encounter) | Opens into | Room it may later deposit into (member act only) |
|---|---|---|
| Talk it through | conversation | Journal / Keeps |
| Find my next step | conversation | Changes (later: Commitments — Vision) |
| Understand a pattern | conversation | Changes |
| Relationships | conversation | (Relationships room — currently off the rail; see `maiaNav.ts` note) |
| Make something | conversation | Ideas / Wisdom |
| Your own material | the House, directly | — |

A doorway **never files anything on the member's behalf.** Deposits into rooms remain member gestures.

---

## 9 · Mobile

Mobile is the environment, not a compression of the desktop (Member Experience Design Constitution, §"Mobile
is not the environment compressed").

- **One column. Doorways stack.** No 2×3 grid squeezed to 2×3 tiny.
- **The composer and the mic are always within thumb reach** — the doorway grid scrolls; the way to speak does
  not.
- **`Where you were` is the first card**, above the doorways, because returning is the dominant mobile case.
- **`I don't know where to begin` is pinned to the bottom of the doorway list**, never in a menu.
- **First arrival is two full screens**, not a modal stack, and must complete on a 375pt viewport without
  scrolling on screen 1.

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Good morning │   │ Talk it      │   │              │
│ Kelly.       │   │ through      │   │  conversation│
│              │   ├──────────────┤   │              │
│ What is      │   │ Find my next │   │              │
│ asking for   │   │ step         │   │              │
│ attention?   │   ├──────────────┤   │              │
│              │   │ Understand a │   │              │
│┌────────────┐│   │ pattern      │   │              │
││WHERE YOU   ││   ├──────────────┤   │              │
││WERE        ││   │ Relationships│   │              │
││Tue · 24 ex ││   ├──────────────┤   │              │
││ Continue → ││   │ Make         │   │              │
│└────────────┘│   │ something    │   │              │
│              │   ├──────────────┤   │              │
│ ( doorways   │   │ Your own     │   │              │
│   scroll )   │   │ material     │   │              │
│              │   └──────────────┘   │              │
├──────────────┤   ├──────────────┤   ├──────────────┤
│ ●  Talk   ⌂  │   │ I don't know │   │ ●  ⌨︎     ⌂  │
└──────────────┘   └──────────────┘   └──────────────┘
   scroll top         scroll end         after entry
```

---

## 10 · Claim discipline pass on the public copy

Per `MARKETING_CLAIM_DISCIPLINE.md`: every outward statement declares its **layer**, names its **center of
gravity**, and passes the **failure test** (strip Designed + Vision — does the story survive?).

| Proposed line | Layer | Center of gravity | Verdict |
|---|---|---|---|
| "A different kind of intelligence for the life you are actually living." | **Live** | positioning, no capability claim | ✅ ship |
| "Helps you understand what you are experiencing, keep what matters, and find your own way forward." | **Live** | conversation + Keeps (atoms are live) | ✅ ship |
| "MAIA remembers with consent. Never by stealth." | **Live** | consent gates: `surface_preference` default private, `return_preference` | ✅ ship — **the strongest differentiated claim we own** |
| "She doesn't diagnose or command." | **Live** | canon-enforced behavior | ✅ ship |
| "She helps you see rather than telling you who to be." | **Live** | C2 / Invariant 16 | ✅ ship |
| "Designed to return you to your life, not keep you inside an app." | **Live** (as intent) | must be stated as design commitment, not measured outcome | ⚠️ ship as commitment; **do not** claim measured reduction in centrality |
| "You don't have to begin your life again from zero." | **Designed** | conversational Phase 2 — FAST+CORE reach the prompt; DEEP does not | ⚠️ **fails the failure test as written for all tiers** — see below |
| "MAIA knows the whole house." | **Vision** | Commitments + Becoming don't exist | ❌ not publishable |
| "A relationship that develops with you" | **Designed** | continuity across sessions | ⚠️ permitted only in forward voice |
| Room diagram showing Journal · Changes · Commitments · Becoming | **Vision** | two of four rooms do not exist | ❌ diagram must show only live rooms |

**The continuity claim is the one to watch.** It is the emotional payload of the whole landing page, and it
rests on conversational recall that is verified on FAST + CORE only. Options: (a) scope the claim to what is
verified, (b) finish the DEEP wire (`ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §V) before launch, or (c) move
the payload onto Keeps, which is unambiguously live. **Recommendation: (c) for launch, (b) as the fix.**

---

## 11 · Rulings required before build

| # | Question | Why it blocks |
|---|---|---|
| **Q1** | Is `/maia` the single authenticated threshold, with `/home` absorbed and redirected? | Two homes cannot both be the threshold; the whole surface hangs on this. |
| **Q2** | May a doorway choice ever persist beyond the session? | Persisted doorways become a Recognition-layer claim; needs its own consent surface (C1). Default in this spec: **no**. |
| **Q3** | What is the recede rule for the doorway grid (§5.5), and is it member-visible? | Silent adaptation is a sovereignty problem; no adaptation is a burden problem. |
| **Q4** | Does the public landing demote Portfolio / Past Sites / Book / Projects below MAIA? | Studio identity vs product clarity — a founder call, not a design one. |
| **Q5** | Which continuity claim carries the launch payload (§10)? | Determines whether the DEEP wire is a launch blocker. |

**Runtime verifications required before any "Live" tag here is repeated outward:**

```bash
# Doorway/House substrate — what a returning member actually has
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT count(*) FILTER (WHERE return_preference IS NOT NULL) AS atoms_with_pref, count(*) AS atoms FROM member_memory_atoms;"'

# Continuity claim — is the conversational block reaching the prompt
ssh soullab@minisforum 'docker logs maia-sovereign --since 24h 2>&1 | grep -E "conversational-block|atoms loaded"'
```

---

## 12 · Sequencing

**None of this touches production UI in this branch.** Order of work, each gated on the prior:

1. **Ruling pass** on Q1–Q5 (§11). Nothing is built before Q1.
2. **Doorway vocabulary lock** — one set of six words used on landing, arrival, and House. Voice review
   against `docs/canon/SOULLAB_VOICE_DOCTRINE_DAOIST.md` and the opening-turn copy in §4.3.
3. **Surface B (Guided Arrival)** first — it is additive, sits inside the existing `arrivalState` model, is
   reversible, and is where a new member's experience is worst today.
4. **Surface C (House threshold)** second, behind a flag, evidence-gated per the §5.4 matrix.
5. **Surface A (public landing)** last — it should describe an experience that already exists, per claim
   discipline. Restructuring the landing before B and C exist would be selling tomorrow's story as today's.

**Growth-obligation answers** (required by `CLAUDE.md` for any capability increase):

- *What uncertainty does this introduce, and how is it preserved?* — A doorway is the member's stated
  intention, which may be wrong or provisional. Preserved by making it session-scoped, non-persisted, and
  never reflected back as a fact about the member (§4.4).
- *What provenance and ownership boundaries does this require?* — The two-channel rule (§6.2): the member
  sees all of their own material; MAIA receives only what the existing consent gates permit.
- *What new responsibility does this create?* — Suggesting entry points is a form of influence. The
  responsibility is that doorways stay **situations, not framings of the person** (C4), and that the
  scaffolding recedes rather than becoming a permanent frame around the member's own attention (C6).

---

*The competitors ask: what can our product do for you? This asks: what is asking for your attention? The
second question is answerable by someone who does not yet know what we built — which is the whole problem.*
