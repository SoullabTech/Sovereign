# Client Field Redesign v1 — Experience Model

**Date:** 2026-08-03 · **Status:** ⛔ **DESIGN CANDIDATE — RECORD ONLY.** Not ruled, not authorized, not scheduled.
Claude may Draft and Record, never Ratify. No implementation, no schema, no route, no copy change follows from this document.

**Grounded in:** [`NOW_WHAT_FIELD_ACTIVATION_AUDIT.md`](NOW_WHAT_FIELD_ACTIVATION_AUDIT.md) (Class A, incl. the `practitioner_seeded` amendment) and [`NOW_WHAT_FIELD_PARTICIPATION_RECONCILIATION.md`](NOW_WHAT_FIELD_PARTICIPATION_RECONCILIATION.md).
**Referent:** trunk = deployed `95b21ce42` for every path cited.

**Supersedes as architecture:** the five-band proposal (`CURRENT WORK · PREPARE · PRACTICE · EXPLORE · CONNECT`). ⭐ **It is retained as a candidate direction, not as the architecture** — three of its five bands require capabilities measured absent (§4).

---

## 0. The constraint

> ### **The Client Field should become simpler without becoming simpler than the person.**

The experience instinct is correct: *a CEO should not have to navigate a database.* The failure mode is
the fix that trades **member-authored structure** for **designer-authored structure** and calls it
simplification.

⭐⭐⭐ **The correction that shaped this document:** *Decisions · Commitments · Questions · Reflections*
are **not database categories.** They are tags the member's own gesture wrote (`spiralogic_phase`), and
`app/api/now-what/home/route.ts` groups by them *"never by inference over their content."* Replacing
them with `Prepare / Practice / Explore` would overwrite the member's declarations with ours.

**Synthesis:** simplify the **entry**, preserve the **authority**.

```
                    MY WORK FIELD
          What are you working with right now?
                     CURRENT WORK
                           │
        ┌──────────────┬───┴───────────┬──────────────┐
     Prepare        Practice        Explore        Connect
        │              │               │
  practitioner    member acts    member meaning
    offered         created         created
```

The surface gets simpler. The authority model underneath does not move.

---

## 0b. ⭐⭐⭐ The timidity failure mode — read this before implementing any prohibition above

> **Do not let the governance discipline make the product timid.**

After a long sequence of protecting against errors, the tempting build is: nothing suggested, nothing
surfaced, nothing guided, everything waiting on explicit action. **That would satisfy sovereignty and
fail the human.** An inert page is not a safe page — it is a different failure, and it is not detected by
any gate in this lane, because every gate here tests for *overreach* and none tests for *absence*.

### The sweet spot

> ### **Clear invitation without hidden authority.**

| ✅ The field may say | ⛔ The field may not say |
|---|---|
| *"Here is something you may want to explore."* | *"Here is what you should become."* |

**Necessary is not sufficient.** The rulings in this lane establish that the Client Field will not betray
the relationship — it does not claim absent capabilities, does not turn practitioner invitations into
member commitments, does not turn member meaning into practitioner property, does not expose the database
model as the human experience, and does not use language to smuggle authority. **Those are necessary
conditions. None of them produces delight.**

### The test the architecture must pass

⛔ Not *"is our architecture correct?"* → ✅ **"does the architecture disappear?"**

The ideal outcome is **not** a participant saying *"this is a universal field architecture with contextual
practitioner expressions."* It is:

> *"Oh. This is where my work is."* · *"I would start here."* · *"I know what I would do next."*

⭐ **A member should never see the architecture. They should feel its effects.**

### Why the one measured seam matters more than it looks

The Home says *"yours when you say so."* The copy is right, the data model is right, the distinction is
understood. The member's next natural question is *"where do I say so?"* — and today the answer requires
discovering a map.

**That is not a conceptual failure. It is a threshold design issue** — and it is the concrete instance of
this whole section. *The intelligence is present; it is not visible at the moment of need.*

---

## 1. What does the member see first?

**Current Work — the doorway.** Not an inventory, not a menu of rooms.

```
MY WORK

  CURRENT WORK          What am I working with?
                        Leadership Presence · current focus

  WHAT YOU ARE CARRYING Your decisions, commitments, questions, reflections
                        — in your words

  CONTINUE              Your sessions and conversations

  WITH                  Your practitioner and groups
```

### ⭐ The sequence / progress rule — testable, and it constrains copy

| | Allowed | Prohibited |
|---|---|---|
| **Sequence** — where the work currently is | ✅ *"Current focus: difficult conversations"* · *"Working with: Leadership Presence"* · *"Your coach has organized the next conversation around…"* | |
| **Progress** — how far along the person is | | ❌ *"Week 4 of 8"* · *"50% through"* · any count of completed vs remaining |

⚠️ **This is not a preference.** `components/now-what/ClientHome.tsx:463` already tells members:
*"No scores, rankings, progress measures, assessments or summaries of you."* `Week 4 of 8` is a
progress measure. Shipping it would break a promise **already made to members** and would fail G9,
which passes today.

---

## 2. What remains member-authored?

⛔ **Nothing in this list may be re-derived, inferred, or relabelled by the system.**

| Member-authored | Mechanism | Evidence |
|---|---|---|
| The **meaning tags** — decision · practice(commitment) · question · reflection | `spiralogic_phase`, written by the member's gesture | `home/route.ts` `KIND_OF_TAG` |
| The **keeping** act | `member_decision_at` — the anchor, not row creation | `home/route.ts:86` |
| **Position** in a program — confirm · restate in own words · depart | `POST /api/now-what/program-position`; departure is a hard DELETE, *"a closed-state column would be an enrollment ledger by another name"* | `programPositionService.ts:185-215` |
| The **sharing boundary** | `can_be_shown_to_practitioner`, member-set, defaults false | `home/route.ts` |
| **Withdrawal** of visibility | `WithdrawVisibility.tsx` | shipped |

**Implication for the redesign:** *"the client should never need to know whether something is a decision
or a commitment"* is achievable **only** as a presentation choice over material the member already
labelled — never by dropping the label. The member's word for their own thing survives even when the
band above it is named for an activity.

---

## 3. What is practitioner-offered?

| Practitioner-authored | State |
|---|---|
| **Programs** — title, `kind` (coaching/training/workshop/course/retreat), ordered `focal_points`, `current_focal_point` | ✅ live: `programAuthoringService.ts`, `/api/practitioner/programs`, `/studio/programs` |
| **Lessons / materials** | ✅ authored (`field_program_lessons`) · ❌ **no member read path** |
| **Seeding a member's position** (*"placed at enrollment, assumed until the member speaks"*) | ⛔ **declared and rendered, no writer — cannot occur** |

⭐ **The boundary the schema already enforces, and the redesign must not soften:** a practitioner may
create **pathways**; only the member's gesture creates **inclusion** (`stated_by` + `member_confirmed_at`,
NULL until the member speaks). A practitioner never authors a Field Object.

---

## 4. What requires a missing capability?

| Band | Blocking absence | Class |
|---|---|---|
| **Prepare** | no member read path for `field_program_lessons` — zero member-side readers, no route | **capability gap (member side)** |
| **Practice — practitioner half** (*"Try noticing when you avoid conflict"*) | the **invitation/offer writer does not exist** — same absence as `practitioner_seeded` | **capability gap** |
| **Connect — communication** | **no substrate at all**; every messaging migration is `team_*`, a different lane | **unavailable — defer** |
| **Current Work — the member's confirm gesture** | exists and works; **the Home does not door into it** (`/now-what/position` reachable only from the map) | **activation — navigation remedy** |

### ⭐⭐⭐ The missing middle is an invitation layer, not content

```
Practitioner creates opportunity
        ↓
Member receives invitation      ⛔ THIS DOES NOT EXIST
        ↓
Member chooses relationship to it
        ↓
Member creates meaning
```

The absent object is not a document, a lesson, or a message. It is **the act by which something becomes
offered to a specific member**, and the member's answer to it. ⛔ **Not designed here, and not
authorized** — and it is downstream of a ruling nobody has made: *may a practitioner seed at all, or must
every entry originate with the member?*

---

## 5. v1 versus future

**v1 builds only where the capability is already alive.**

| | Scope |
|---|---|
| ✅ **v1** | **Current Work** — make the doorway clear, including a door to the position gesture (navigation, not build) · **What you are carrying** — the member's own material under one heading, labels preserved |
| ⏳ **After the delivery path exists** | Prepare |
| ⏳ **After offered-vs-chosen is ruled and built** | Practice, practitioner half |
| ⏳ **After communication has an object model** | Connect |

⛔ **Do not build chat because "Connect" exists conceptually.** A conceptual band is not a substrate.

---

## 6. Open rulings this depends on

| # | Ruling | Held by |
|---|---|---|
| **R1** | Home orientation — Option A (*what is alive*) vs Option B (*what am I enrolled in*). This document proposes a **hybrid**: B-shaped doorway over A-shaped material. ⚠️ **Still a reversal of a live ruling** (Home inventory superseded; *"the act must emerge from meaning, not from a register of past acts"*) and must be made as one | founder |
| **R2** | May a practitioner **seed** a member's position at all? | founder |
| **R3** | Should `field_program_lessons` reach members, and by what edge? | founder |
| **R4** | Field Object **versioning / declaration** | founder — ⏳ upstream of offering and of any UI |
| **R5** | Is adding a Home door to `/now-what/position` correct, or does the threshold deliberately exclude it? | founder |

---

## 7. Non-goals

⛔ This document does not: author or name an invitation object · authorize any band · rule R1–R5 ·
change copy, routes, or schema · reverse the superseded Home inventory · build messaging · promote the
five-band proposal to architecture · ratify anything.

---

## 8. Status

```
Constraint                     ✅ simpler, never simpler than the person
Member authority               ✅ preserved — labels are the member's, not ours
Sequence vs progress rule      ✅ stated + testable · "Week 4 of 8" withdrawn
v1 scope                       Current Work + What you are carrying
Deferred                       Prepare · Practice(practitioner) · Connect
Missing middle                 invitation layer — named, not designed
R1–R5                          ⏳ open
Implementation                 ⛔ not authorized
```

> The redesign is not *"simplify the UI."*
> It is **preserve the authority model while simplifying the experience** — and the difference between
> those two is the whole product.

*The system does not outrun the evidence.*
