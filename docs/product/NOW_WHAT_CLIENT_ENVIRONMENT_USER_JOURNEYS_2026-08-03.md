# Now What? — Client Environment User Journeys

**Date:** 2026-08-03 · **Status:** ⛔ **DESIGN + FINDINGS. No ruling, no build authority.**

The test is not whether the rooms are logically beautiful. It is:

> **Can a normal human being use this without learning the architecture?**

Three journeys, each walked against what actually exists. Companion to
[the environment map](NOW_WHAT_CLIENT_ENVIRONMENT_MAP_2026-08-03.md).

**The stage framing converges with what the map produced independently** — Foundation (Home ·
Program · Reflect) → Continuity (Calendar · Sessions) → Connection (Messages · Resources · Groups).
The map derived that order from substrate and boundaries; the product story arrived at the same order
from relationship logic. That agreement is worth noting: *the boundary decides the order, and the
order turns out to be the humane one anyway.*

---

## Journey 1 — New client: *"Larry invited me. What happens?"*

| Beat | What should happen | Reality today |
|---|---|---|
| 1 | Opens Larry's invitation link | ✅ `createPendingRelationship` exists (`lib/coachField/invitation.ts`, #902) |
| 2 | Lands on a door that names Larry | 🔴 **the door names a *field*, not Larry** — see below |
| 3 | Sets up a key | ✅ members system exists |
| 4 | **Meets the platform's own onboarding** | 🔴🔴 **blocking — see below** |
| 5 | Arrives at *"your work with Larry"* | ◐ relationship exists; Home not built |
| 6 | Accepts, and the relationship becomes real | ✅ `acceptInvitation` exists |

### 🔴🔴 Finding 1 — the new client meets the Daimon before they meet Larry

The documented onboarding is **universal and mandatory**: `/begin → /intro-maia → /intro-daimon →
/test-elemental → /faq → /onboarding → /maia`, described as *"All members follow the same
onboarding"* with *"No shortcuts — each step must be completed in sequence."*

So a client whose executive coach invited them to continue their work is asked, before reaching
Larry, to meet *"I'm Maia,"* then *"I am a Daimon by design,"* then *"Enter the Lab,"* then complete
an elemental orientation.

> **This is the largest unaddressed obstacle in the client environment, and it is not a design
> question — it already exists in production.**

It fails the constitutional test directly: the person must learn the architecture — and a
cosmology — before they can do the thing they came to do. It also inverts the ordering the whole
environment is built on: **the relationship should be the first thing encountered, not the last.**

*Verified against project documentation, not walked authenticated.* The exact live behaviour for an
invited practitioner-client should be walked before anything is decided — it is possible an
invitation path already diverges, and that would change the finding.

**Three possible resolutions, none ruled:**

1. **Relationship-first entry** — an invited client enters through the relationship and meets the
   platform's own story later, or never. Larry's client is there for Larry.
2. **A practitioner-scoped onboarding** — same structural steps, spoken in the language of the
   practice rather than of MAIA.
3. **Onboarding as a room, not a gate** — available, not required.

⚠️ Whichever is chosen, it is a **ratification** item: the existing flow is documented as an
invariant with explicit "no shortcuts" language, so changing it is amending a stated rule, not
adjusting a screen.

### 🔴 Finding 2 — the front door speaks in AIN vocabulary

Observed live at `soullab.life` (unauthenticated), the door reads: *"If someone invited you to a new
**field**, open the link they sent — it carries what this door needs to set up a **key**… Signing in
is how the **room** knows whose **field** to hold."*

Careful, honest, and written in a vocabulary the client does not have. **Cheapest repair in the
entire environment:** name the person. *"Sign in to continue your work with Larry."*

---

## Journey 2 — Returning client: *"I have a session tomorrow. Where do I go?"*

| Beat | What should happen | Reality today |
|---|---|---|
| 1 | Opens the app, sees the session named | ⛔ Home not built |
| 2 | Sees where they are in the program | ✅ substrate exists (`coach_program_enrollments`) |
| 3 | Prepares — *what would you like to explore?* | ⛔ no substrate; and preparation is **theirs**, not a form Larry reads |
| 4 | Reviews what they carried from last time | ✅ member-owned kept material exists |
| 5 | Arrives at the conversation | 🔴 **`sessions.team_id` omitted by four INSERT paths (#899) — session creation is broken** |

**Verdict: designable, not walkable.** Two of five beats have no substrate and one sits on an open
defect. #899 is on the critical path for this journey and for Calendar.

⭐ **The design point that matters here:** *preparation belongs to the client.* A "prepare for your
session" field that Larry can read is a homework surface, and it converts a room of their own into an
obligation. If preparation is shared, it must be **an act of sharing**, visible as one.

---

## Journey 3 — Between sessions: *"I have something I want to work with."*

| Beat | What should happen | Reality today |
|---|---|---|
| 1 | Opens the app with an intention already formed | ✅ |
| 2 | Goes to their own space without passing through the relationship | ◐ member surfaces exist; the room is not named as theirs |
| 3 | Writes | ✅ member-owned primitives exist |
| 4 | Marks something to carry forward | ✅ live and production-verified in member use |
| 5 | Optionally asks MAIA something | ✅ live — constrained to L1 unprompted, L2/L3 on invitation |
| 6 | Leaves. **Larry learns nothing.** | ✅ **already true** — person-owned material is unreachable from practitioner queries |

**Verdict: this is the journey that is nearly walkable today**, and it is also the one that carries
the strongest boundary. That is not a coincidence — the sovereignty substrate was built first.

⭐ **The return test applies here:** *when the person comes back after time away, what do they
naturally resume?* Their own material, by their own gesture — **kept, not last**. This journey is the
one that proves the platform is more than a scheduling tool, and it needs the least new code.

---

## What the three journeys say together

| | Journey 1 | Journey 2 | Journey 3 |
|---|---|---|---|
| Substrate | mostly exists | mostly missing | mostly exists |
| Blocker | **onboarding gate** (ratification) | **#899** (defect) | naming and framing only |
| Constitutional risk | high — architecture before relationship | medium — preparation becoming homework | low — already the strongest boundary |

**The order to work in is 3 → 1 → 2**, which is not the order they occur in a client's life:

- **3** needs framing more than building, and demonstrates the difference immediately.
- **1** is blocked by a ruling, not by engineering — and the ruling can be made now.
- **2** is blocked by a defect that must be fixed regardless.

## The sentence for Larry

Not seven rooms. Five familiar things: **Home** (your work with Larry) · **Program** (the journey
we're on) · **Calendar & Sessions** (where we meet and continue) · **Reflect** (your private space) ·
**Connect & Resources** (staying supported).

And the one that explains the sequence:

> **We are opening capabilities in the order that preserves trust** — not *we haven't built those
> features yet.*

## What this does not do

No code, no components, no screens. Finding 1 is **verified against project documentation, not
against an authenticated walk** — walk it before ruling. Nothing here resolves the pending
constitution or BD referents, or authorizes the encrypted lane.
