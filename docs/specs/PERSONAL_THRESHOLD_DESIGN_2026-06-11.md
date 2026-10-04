# The Threshold — Design Pass

**Date:** 2026-06-11
**Deepens:** `PERSONAL_DAILY_FLOW_DESIGN_2026-06-11.md` → Movement I (Threshold). Companion to `PERSONAL_PORTAL_REVEAL_2026-06-10.md` (grounded substrate).
**Why this movement first:** it is not first chronologically — it is first in *authority*. The toolkit solves obstacles; the Threshold decides whether a person even remembers why they came. Get the Threshold wrong and the rest of the flow opens to someone who has already lost the thread.

---

## The inversion this rests on

Most systems assume:

```
Life → App → More App → More App
```

This design proposes:

```
Life → Portal → Life
```

The portal is a **vestibule** — a place to arrive, gather, re-collect, and pass *back through* into your life. Not a place to stay. Ganesha guards thresholds; you bow and you pass through. Every decision below follows from this one fact: **the Threshold's job is to return you to your life, oriented — not to hold you.**

---

## The Threshold answers exactly three questions

Not information. Not options. Not productivity. A threshold answers three things and nothing else:

| Question | In plain voice | Honest source |
|---|---|---|
| **Where am I?** (existential, not geographic) | *"You are here."* | season (Live) + capacity (you set it) + weather (only if you offer it) |
| **What matters now?** (one thing, not everything) | *"This is what is gathering."* | your last thread + what you marked (Live) — never MAIA's judgment of significance |
| **Where do I go next?** (one door, not ten) | *"This way."* | the verb implied by what's gathering |

Three questions. One breath. That is the entire Threshold.

---

## The mechanism that makes it unique: *demand is how many questions the Threshold dares to ask*

The industry personalizes **content**. This personalizes **demand** — how much the portal asks of the person. The two halves of this design (the three questions, and the capacity matrix) are *the same object*:

> **Capacity determines how many of the three questions the Threshold asks.**

- **Exhausted day** → it asks only the first. *"You're here. That's enough for now."* It does not ask what matters. It does not ask where to go. **Withholding the question is the care.**
- **Fragmented day** → it asks the first two. *"You don't need to catch up. One thing is waiting for you."* Then a single card.
- **Open day** → it asks all three, layered and inviting.

No productivity app ever *withholds* a question — they ask everything, always, because every question is an engagement hook. This portal asks *less* when you have less. That single inversion is the design's signature.

**Default to the floor; invite toward the ceiling.** The Threshold opens at its lowest-demand form and *expands* as capacity is confirmed — the opposite of every app, which opens maximal and makes you dial it down. An unknown state is met at the floor, never the ceiling. (A *learned prior* — opening at yesterday's level — is **Forming**; until then, floor-plus-invitation is the honest default.)

---

## Beat 1 — "Where am I?" — the hard, beautiful one

This is where the design either honors the person or quietly violates them. The rule that makes it sacred:

> **MAIA never tells you how you are.**

"Where am I?" is **co-authored**, never diagnosed. It has three honest inputs, each handled differently:

1. **Season — shown (Live).** Element and phase are *positional*, not emotional — safe to reflect. *"You're in a season of Fire."* Sourced from spiral state (`lib/consciousness/spiralStatePersistence.ts`: element/phase/motion). This is MAIA saying where you are *on the map*, not how you *feel*.

2. **Capacity — you set it (the Now Card is the Threshold's heartbeat).** One gesture: a low-cost, no-words way to say how much you can meet today. This is the single input that drives demand-personalization for the whole day. It is *offered*, never required — and if you don't answer, the portal stays at the floor. The energy substrate exists Studio-only (`/api/studio/energy`); a member Now Card is the **Forming** piece this beat most needs.

3. **Weather — held, never presumed.** Grief, hope, dread, tenderness. MAIA does **not** detect these and must never present them as fact ("you seem sad" is a violation). It *holds space* for them: the floor-state language ("You're here. That's enough.") is spacious enough to receive a grieving person without naming the grief. If *you* bring the weather — a journal line, a spoken word — MAIA can reflect it back. It never originates it.

The felt result of Beat 1: **met without being defined.** You are recognized (named, your season reflected) and left sovereign (your state is yours to declare). That is the Sovereignty Invariant at the most intimate point in the entire system — and it is also, simply, what it feels like to be greeted by someone who respects you.

*Capacity gesture — design intent (not final UI):* a single quiet control, wordless-capable, three-or-so positions from "barely here" to "open." Pre-fillable by a gentle guess later (Forming), always yours to move. On a nonverbal day it accepts a tap and nothing else; on a day you can't even tap, the floor already holds you.

---

## Beat 2 — "What matters now?" — the selection problem

One thing. Most designs fail here by showing everything — which *is* the scatter we are treating. The honest basis for choosing the one thing:

> **What's gathering is what *you* last touched or marked — never what MAIA judges to be important.**

- **Recency (Live).** The thread you left open — from spiral state / conversational recall.
- **Member-marking (Live).** What you flagged as it mattered — breakthrough atoms (`is_breakthrough`, member-set), kept material. *You* already told MAIA this matters; it simply hands it back.
- **No significance-ranking.** MAIA does not decide your manuscript matters more than your inbox. Synthesis of "what's important" is interpretive displacement — banned.

**Rich-day gather** (your example: *"Sophie tomorrow. The manuscript. Session Room."*) pulls from several sources at once:
- *the manuscript* → a thread / kept material — **Live**
- *Sophie tomorrow* → a person + time proximity — **Forming/Absent** (needs a personal calendar+relationship source; verify before claiming)
- *Session Room* → a Studio hand-off — **Forming** (cross-surface; see the paired-thresholds section)

So the *first honest build* of Beat 2 gathers from the Live sources (your last thread + what you marked); the people/calendar/Studio layer is a **Forming** enrichment, added only when its substrate is real.

**The escape hatch.** The Threshold offers its best honest guess and never insists: *"…or something else."* If MAIA guessed wrong, one tap re-opens the field. Being offered a thread you can decline is sovereign; being *assigned* one is not.

---

## Beat 3 — "Where do I go next?" — the door is the verb of the gathering

One door, not ten. And it is not a separate decision — **the door is generated by Beat 2.** What's gathering implies its own next action:

| What's gathering | The door (its verb) |
|---|---|
| an open conversation thread | *continue it* → back into MAIA, where you left off |
| something you've been avoiding | *close one loop* → AvoidanceBreaker |
| a "can't start" / too-many | *find the gate* → Focus Garden |
| just presence (hard day) | *"Begin gently."* → MAIA, no agenda |

This is why **the toolkit must not dominate the screen.** The order is:

```
Threshold → Orientation → Tool
```

Focus Garden, Keep, AvoidanceBreaker, the Now Card are things you **pick up while passing through** — not rooms you move into. The tool serves the Threshold, never the reverse. A threshold cluttered with tool-doors is just a dashboard wearing sacred language.

---

## The arrival itself — temporal choreography

"What does it feel like to arrive?" Arrival is a *sequence*, and its order is the craft:

1. **Settle before content.** A held beat of presence (`MaiaCenterField`) before any words. The portal *receives* you before it *informs* you. No dump, no flash of modules.
2. **Recognize.** *"Good morning, Kelly."* / *"You're here."* — named and met, not transacted.
3. **Gather, at the dared depth.** Beats 1–3, as many as capacity allows, unrolling like one sentence — not a wizard, not screens.
4. **Offer the door.** Then get out of the way.

The governing quality is **anti-urgency.** Urgency is the enemy of re-collection. Nothing pulses, counts down, or demands. The Threshold is the one place in the person's day that is *not* trying to get something from them. (Studio's felt line was *"the room is quiet, and ready for you."* The Personal equivalent lives in this register: *here is where your life is gathering.*)

---

## The negative space — what the Threshold refuses

A threshold is defined as much by what it will not do:

- **No badges, counts, or notifications.** A badge is a demand; this surface personalizes demand *down*.
- **No "you missed," no streak, no guilt.** Re-entry never carries a tax (the whole point of Re-entry, Movement IV).
- **No module wall / no full nav.** Tools are subordinate (Beat 3).
- **No inferred emotion presented as fact.** (Beat 1.)
- **No urgency, no autoplay, no infinite anything.** The exit is the goal.

---

## The Threshold across capacity — concrete copy

Same surface, different number of questions asked. (Copy is illustrative — register, not final wording.)

**Open**
> Good morning, Kelly.
> You're in a season of Fire.
> Three threads are gathering — Sophie tomorrow, the manuscript, the Session Room.
> *(all three questions; one door per thread)*

**Beginning** *(new phase / breakthrough motion)*
> Good morning, Kelly.
> Something's turning — you're at the start of something.
> One thread is opening. *(asks 1 + 2, names motion honestly from spiral state)*

**Hopeful / weather offered by the person**
> You're here — and lighter today, it sounds like.
> Here's what's gathering. *(reflects weather only because the person named it)*

**Fragmented**
> Welcome back.
> You don't need to catch up.
> One thing is waiting for you.
> *(asks 1 + 2; a single card; nothing else)*

**Overloaded**
> You're here.
> Let's set one thing down.
> *(asks 1, offers AvoidanceBreaker as the one door — close a single loop)*

**Exhausted**
> You're here.
> That's enough for now.
> [ Begin gently ]
> *(asks only 1)*

**Numb**
> You're here.
> You don't have to feel it to be here.
> *(asks only 1; no thread, no demand)*

**Nonverbal**
> *(presence only — `MaiaCenterField`, the greeting, no questions asked; voice / no-type accepted; the floor holds)*

The rule restated: **the worse the day, the fewer questions the Threshold dares to ask.** Capacity is *read from what you set*, never *tested*. These rows are **descriptive** — what each level of person-controlled expansion feels like — not modes the system detects and selects. The Threshold offers depth; the person sets it (see `docs/architecture/THRESHOLD_NAVIGATION_DOCTRINE_2026-06-11.md`).

---

## Studio ⇄ Portal — the paired thresholds

Two thresholds bracket a coherent day:

- **Studio** asks: *"Who needs me today?"* — care offered outward.
- **Personal Portal** asks: *"Where am I, before I go meet them?"* — life experienced inward.

For someone who is both a person and a practitioner (Kelly), they hand off: the Personal Threshold (*where am I?*) settles you, and then — if you have people today — gives onto the Studio Threshold (*who needs me?*). You meet others from a self you've just re-collected, not from scatter. This hand-off is **Forming** (cross-surface; "Session Room" in the rich gather is its seam). But the symmetry is the point: same architecture, opposite direction, one day held between them.

---

## Substrate honesty — what the first Threshold can truthfully do

| Beat | Live today | Forming | Absent / refused |
|---|---|---|---|
| **Where am I?** | season (spiral element/phase/motion) | member Now Card (energy is Studio-only); learned capacity prior | emotion detection — **refused on principle** |
| **What's gathering?** | last thread (recall); member-marked atoms/keeps | people+calendar layer; Studio "Session Room" hand-off | significance-ranking — **refused (no synthesis)** |
| **Which way?** | doors into Live threads/tools | learned default door | — |
| **Arrival feel** | `MaiaCenterField`, name-safe greeting, `MaiaShell` settle | capacity-scaled density | — |

**First honest Threshold (Track-A-shaped, reuse-only):** settle → recognize → show season → offer the one gathered thread (recency + marked) → one door. Capacity scaling begins with a manual gesture defaulting to the floor. Everything richer (Now Card, people/calendar, Studio hand-off, learned priors) is **Forming**, labeled as such, added as its substrate becomes real.

---

## The Threshold Principle (the four questions, resolved)

All four resolve on one axis — **continuity vs. interpretation** — caught in a single sentence:

> **The Threshold remembers what was placed, invites what is present, and never decides who the person is.**

Its three clauses *are* the three beats' sovereignty rules:
- *remembers what was placed* → Beat 2 (what's gathering is your placed / marked material) + learnable preferences
- *invites what is present* → Beat 1 capacity (co-authored — offered, never required)
- *never decides who the person is* → the weather / state boundary (held, never named)

### 1. The zero-input floor — *the floor requires nothing*
**Yes — the floor asks for nothing.** Not because a tap is hard, but because *being asked* is hard. The Threshold can say —

> You're here. That's enough for now.

— and stop. No rating, no capacity declaration, no self-assessment. Then, *only if the person turns toward it*, the capacity question becomes an **invitation, not a requirement**:

> How much do you have for today?

Sovereignty all the way down: the floor is reachable with **zero input**, and the one gesture is a door the person may open, never a gate they must pass.
*Substrate:* **Live** — render the floor by default; the Now Card is a secondary invitation, never a precondition.

### 2. Weather — *hold the shape, never name it*
**Never name; gentle holding allowed.** The Threshold may remember *tone* — not content, not conclusions — and let it set how gently it opens.

> Yesterday: "I don't know if I can do this anymore."
> Today: "Welcome back. Let's begin gently."

Nothing inferred aloud, nothing diagnosed, nothing named — yet the morning opens soft. The discipline that keeps this sovereign: **the inference sets MAIA's own posture, never a label on the person.** MAIA adjusts *itself* (how it opens), not its *description of you* (who you are). It is *the shape of care*, not a conclusion about the cared-for.
*Substrate:* **Forming — build last, most conservatively.** No tone→posture mechanism exists today; it must be built so its *only* output is MAIA's opening register — never a stored or surfaced state. The most delicate of the four; when in doubt it does nothing, because the floor already holds.

### 3. One foreground, several beneath — *gather, never menu*
**One visible thread; the rest available, collapsed.** The moment the Threshold reads as "choose from A/B/C/D/E," the gathering is lost.

> The manuscript is gathering.
> *Other threads: Sophie tomorrow · the Session Room*  (beneath, quiet)

One foreground, several background — the way attention actually works. Never a flat list; the list *is* the scatter.
*Substrate:* **Live** — recency + member-marked material already exist; foreground/background is a presentation rule.

### 4. Preferences, never states — *the clean line for what may be learned*
**The Threshold may learn preferences; it must never learn states.**
- Learnable (stable disposition): *"You usually like a richer morning view."*
- Co-authored only (transient condition): *"You were exhausted yesterday."*

A preference is a standing disposition; a condition is today's weather. Conditions are always declared by the person; preferences may be remembered.
*Substrate:* **Forming** — needs a small preference store (e.g. morning density) that holds *dispositions*, never *conditions*. Buildable and clean; the principle is the guardrail on what it's allowed to hold.

### The line — and where it already lives
| Remember (continuity — allowed) | Define (interpretation — forbidden) |
|---|---|
| what you placed (Sophie; the manuscript — named by you) | a transient condition as identity ("you are overwhelmed") |
| a stable preference ("you prefer richer mornings") | a transient state ("you were exhausted yesterday") |
| tone-as-posture (open more gently) | tone-as-label ("you seem sad") |

This is **not new doctrine.** It is the project's existing memory discipline — *member-placed vs. system-inferred, no synthesis, provenance-grounded* — arriving at the Threshold. The Sovereignty Invariants already run on this fault line; the Principle simply names it at the moment of arrival. That convergence is the evidence it's correct.

The Threshold can therefore be both **intelligent and humble**: it remembers what you placed, meets what you bring, and never tells you who you are. A rare combination in software — and the whole point.
