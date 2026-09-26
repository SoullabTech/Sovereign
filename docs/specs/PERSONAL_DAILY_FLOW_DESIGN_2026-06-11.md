# Personal Daily Flow — Experience Design

**Date:** 2026-06-11
**Companion to:** `PERSONAL_PORTAL_REVEAL_2026-06-10.md` — the grounded audit + reveal architecture. That doc establishes *what is real*. This doc designs *what it feels like to move through a day*.
**Quality bar:** the Studio / Practitioner platform reveal — a felt threshold, a flowing arc, nothing generic.
**Telos (Ganesha–ADHD lineage):** help a person *stay tuned in* — to their own life, across the day's natural scatter.
**Governing canon:** MAIA Oath; Sovereignty Invariants (agency ↑, life pushed outward, system centrality ↓ over time); no attachment capture; no optimization theater.

---

## The spine: the portal is a threshold, not a destination

**Ganesha stands at thresholds. You bow, and you pass through.**

That image is the whole design. The Personal Portal is not a place to *stay* — it is a place to *arrive, gather, re-orient, and pass through* into your actual life. You return when the day scatters you; each return sends you back out.

This is not a softening of the canon — it **is** the canon. The Sovereignty Invariants require a system whose psychological centrality *decreases* over time and that pushes life *outward*. A daily-flow surface is the single most dangerous thing to get wrong: the entire productivity industry builds daily flows as dopamine loops engineered to retain. We build the opposite. The measure of this design's success is **how well it returns a person to their life** — not how long it holds their attention. A day where someone glances once, gets re-oriented, and vanishes into a life well-lived is a *perfect* day for this portal.

For the population it was built for — scattered attention, executive-function load — this is also simply *true to the need*. An ADHD brain does not need another thing to check. It needs a still point it can always return to, that holds what it cannot hold and hands it back without friction. A threshold. Not a feed.

So: **the portal is the still center. The day is the movement. MAIA holds the continuity so the person doesn't have to.** Everything below serves that.

---

## The daily arc — five movements

A day is a rhythm, not a dashboard. The flow follows the arc of a day. Each movement names *the felt moment*, *the real substrate* (Live vs Forming, grounded in the reveal audit), *Ganesha's role*, and *the language*.

### I. Threshold — arriving
*Felt.* You open MAIA. Something has gathered while you were away. No wall of modules, no number that went up — you are *received*. One breath: "Good morning, [name]." Then, quietly, what's alive — one or two things, never a list — and today's single thread.

*Substrate.* **Live:** name-safe greeting (`app/maia/page.tsx:349`), Daily Anchor's one-thread prompt (`lib/maia/dailyAnchor.ts`), `MaiaCenterField` as the still presence. **Forming:** the "what's alive" gathering strip (spiral state + recent/breakthrough atoms — data already fetched; the *surface* is the build).

*Ganesha.* The threshold deity. The hardest obstacle of the day removed here: *starting.* The threshold asks nothing; it gathers and offers.

*Language.* "Here is where your life is gathering." Not "Welcome back." Not "Your dashboard."

### II. Orientation — what I'm carrying
*Felt.* Without reconstructing anything, you see where you are: the element and phase you've been moving through, the thread you were with, the moment you marked as it mattered. You don't have to *hold* your life — MAIA holds it visibly, so you can set it down and pick it up.

*Substrate.* **Live:** spiral state (`lib/consciousness/spiralStatePersistence.ts` — element/phase/motion), breakthrough-marked atoms (`is_breakthrough`, member-set), atoms loader (`lib/maia/memoryAtomsLoader.ts`). The continuity already reaches the prompt; here it reaches *the person*.

*Ganesha.* Externalized working memory — the most load-bearing ADHD accommodation. Obstacle removed: *having to remember what you were doing.*

*Language.* "You've been with [thread]." "You marked this." Plain — never "your coherence is 84%."

### III. Moving through — the tools, always in view
*Felt.* The day scatters, as days do. But the tools are *there* — not summoned, not buried in a menu, not requiring you to remember they exist. Each friction point has a visible door:
- can't start / too many → **Focus Garden** (obstacle → gate)
- avoiding something — the unsent message, the dropped thread → **AvoidanceBreaker** (draft it, schedule the follow-up, close the loop — under a minute)
- energy shifted → **Now Card** (MAIA meets your capacity instead of demanding it)
- something alive to keep → **Quick Journal** / **Keep** (voice, dream, a marked atom)

*Substrate.* **Live:** Focus Garden (today Oracle-summoned — the design makes it *findable*), Quick Journal (`components/journal/QuickJournalSheet.tsx`), Keep/Capture, NeurodivergentValidation in the oracle (`lib/oracle/NeurodivergentValidation.ts`). **Forming:** AvoidanceBreaker (`components/focus/AvoidanceBreaker.tsx` — built, unwired), member Now Card (`/api/studio/energy` — Studio-only today).

*Ganesha.* The heart. Object permanence: *a tool you must remember to find does not exist for a scattered mind.* Ganesha removes the meta-obstacle — the obstacle of finding the obstacle-remover.

*Language.* Doors, not features. "Stuck?" "Something you're putting off?" "How's your energy?"

### IV. Re-entry — returning after scatter
*Felt.* You dissolved into the day, lost the thread, maybe drifted for hours. You come back. Nothing scolds you. The field is exactly as you left it. MAIA remembers where you were. No catch-up tax, no broken streak, no re-onboarding. You simply return.

*Substrate.* **Live:** Daily Anchor is *built for this* — "small places to return to yourself," explicitly scaling to "exhausted / numb / nonverbal days." Spiral state persistence means the field survives the gap.

*Ganesha.* The still point you can always return to. Re-entry is the core practice — not achievement, *return*. Obstacle removed: *the shame and friction of having drifted.*

*Language.* "What would help you stay with your life today?" (already Live). Never "You haven't checked in since…"

### V. Integration — what gathered
*Felt.* Toward evening, a gentle closing — never a report. What you touched, what you kept, what's still warm. Optional. On a hard day, nothing. Tomorrow's gathering quietly begins.

*Substrate.* **Forming:** a light end-of-day surfacing drawn from the day's atoms/threads. Must never become a productivity summary or a guilt ledger.

*Ganesha.* Lord of beginnings — closing one threshold opens the next. The day's thread carries forward, so tomorrow's arrival already holds it.

*Language.* "Here's what gathered today." Offered, never owed.

---

## What makes it *flow* — experiential principles

1. **One thing at a time.** Never a wall. The flow reveals progressively (the repo already has a progressive-disclosure pattern). A wall of modules *is* the scatter we're treating.
2. **Offer, never demand.** Every moment is an invitation with a graceful empty state. Happy path and hard-day path are *the same surface at different densities* — not separate flows.
3. **Capacity-responsive.** The Now Card is not decoration — it modulates the density of everything. High energy surfaces more; low / numb / nonverbal strips to presence.
4. **Soft transitions.** Surfaces breathe into one another. `MaiaShell` already fades chrome around voice; extend that quality everywhere — nothing snaps, everything settles.
5. **Sacred, not clinical.** Gathering, carrying, returning, thresholds, elements. Never tasks, streaks, productivity, score. Reframing executive-function load as a wisdom practice is what makes it bearable — *the magic is the medicine.*
6. **The exit is the goal.** The flow is designed to *end* — to return you to your life. No infinite scroll, no engineered re-hook. The Sovereignty Invariant made experiential.

---

## The capacity matrix — designing for the hard days

Most daily-flow design assumes an open, well-resourced user. This one cannot. Daily Anchor already names the real range of human states; the whole flow must render across them — **same surfaces, different density.**

| State | Threshold | Orientation | Tools | Re-entry | Integration |
|---|---|---|---|---|---|
| **Open / good** | full gather + thread | full | all doors visible | pick up the thread | full closing |
| **Fragmented** | greeting + one anchor | one carried thread | Focus Garden foregrounded | "one small place" | skip |
| **Exhausted** | greeting only | dimmed | nothing demanded; Now Card = rest | presence, no thread | skip |
| **Numb** | greeting only | one quiet line | none foregrounded | "you don't have to feel it to be here" | skip |
| **Nonverbal** | presence; no words asked | none | none; voice / no-type ok | wordless return | skip |
| **Overloaded** | one breath, one thing | the single thread only | AvoidanceBreaker (close one loop) | "set one thing down" | skip |

The rule: **the worse the day, the less the portal asks.** Capacity is *declared* (Now Card), never *tested*.

> **Read this matrix as descriptive, not operative.** These are not modes the system detects and selects — that would be the system *deciding who you are today* (violating Invariant 14). They are what arrival feels like at each level of **person-controlled expansion of one floor.** The system offers depth; the person sets it. See `docs/architecture/THRESHOLD_NAVIGATION_DOCTRINE_2026-06-11.md`.

---

## Spatial model — grounded, so it's buildable

Maps the felt design onto real surfaces (reuse-first, per the reveal spec's Track A):

- **Still center** — `MaiaCenterField` (the I-Thou presence). Always there; everything orbits it.
- **The gathering** (My Life strip) — quiet, glanceable, around the center. Spiral element/phase + one or two alive threads + one marked moment. Data already returned by `/api/sovereign/app/maia/list`.
- **The toolkit** (My Practices / Ganesha) — permanently visible doors: Focus Garden, AvoidanceBreaker, Journal, Keep, Anchor. Object permanence is non-negotiable here.
- **The threads** (My Conversations) — the continuity surface (Track B; gated on recall deploy verification).
- **The Now Card** — a small capacity signal that *modulates the density of all of the above.* The one control that changes everything.
- **The chrome** (account, settings, membership) — deep, quiet, out of the center. (The audit found "Continuity"/"Patterns" miscast into settings — those lift *out* into the gathering; true settings stay deep.)

No new backend for the Live pieces. The flow is mostly *assembly + making-visible* — which is exactly why it is the safe Track A.

---

## Where this sits in the design process

Mirroring the Practitioner platform process:

1. **Audit** (done) — grounded current state; Live / Forming / Absent. (`PERSONAL_PORTAL_REVEAL` §1–2.5)
2. **Reveal architecture** (done) — the model, the tracks, the discipline. (`PERSONAL_PORTAL_REVEAL` §3–6)
3. **Flow design** (this doc) — the felt experience across a day.
4. **Track A build** (on your go-ahead) — surface the gathering + make the Ganesha toolkit permanently visible. Reuse-only; no backend, route, auth, or deploy changes.
5. **Track B** — net-new surfaces (My Conversations, member Now Card, AvoidanceBreaker wiring), each its own cut.

---

## Keeping beauty honest — the discipline that protects the flow

Beauty is where inflation hides. The guardrails (from the reveal spec, restated):

- Every felt moment above is tagged to **Live / Forming / Absent** substrate. Nothing in the *experience* claims a capability the *code* doesn't have.
- **Forming stays labeled forming** in any build (the gathering strip, member Now Card, AvoidanceBreaker, integration).
- **Banned vocabulary** on member surfaces until substrate exists: coherence, field state, resonance, RFI/UFI, "relationship memory," deep continuity.
- **Sovereignty test on every screen:** does it increase agency, push life outward, reduce the portal's centrality over time? A daily flow that fails the third test is not shippable, however beautiful.

The line, held: *we do not tell tomorrow's story as if it were today's* — even when tomorrow's story is this beautiful.
