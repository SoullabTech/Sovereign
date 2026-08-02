# Now What? — Client Home: Experience Design

**Opened:** 2026-08-02 · **Lane:** `feature/now-what-client-home-pilot` · **Base:** `c0c8b0ba6`
**Status:** Design artifact. ⛔ Required **before** implementation. Not a presentation layer.

> **UI/UX is a primary product layer here.** For Larry's first real test the experience *is* part of
> the product hypothesis. The question is not only *can the system represent the relationship?* but
> **does the client experience the relationship as a coherent, beautiful, trustworthy place to
> continue their work?**

⚠️ **The biggest risk in this phase is not the missing tables. It is building a technically correct
coaching CRM dashboard.**

---

## 1. Experience thesis

> **This is where my work lives.**

The Home is the **emotional and cognitive threshold** of Now What?. A person arriving should feel
they are **returning to a place**, not opening software.

**The metaphor is a studio, a garden, a lodge — a personal workspace.** Not a console.

### 1.1 Productivity metaphors are disqualified

⛔ Not on this surface: metrics · KPI cards · task lists · menu grids · status dashboards · progress
bars implying completion · badge counts · streaks.

Those metaphors encode *"you have items to process."* This environment encodes *"your work is
continuing."* A coaching relationship is not a backlog.

### 1.2 MAIA is a resident, not the house

⭐⭐⭐ Load-bearing given AIN. The Home must **not** say *"Talk to AI."* It says:

> **Your work is here. MAIA is available when useful.**

The **relationship with Larry is primary**; MAIA is ambient support within it. If MAIA's affordance
is the most visually prominent element on the screen, the design has failed — regardless of how good
the conversation is.

### 1.3 Memory without surveillance

The Home may show **what the person left** and **what was explicitly shared with them**. It may never
show inferred state, engagement measures, or interpretation of their development.
⭐ *Reflect, don't diagnose.*

---

## 2. Arrival storyboard — the first 30 seconds

| Beat | Seconds | What the person meets |
|---|---|---|
| **1. Recognition** | 0–2 | *"Welcome back, [name]."* Quiet. No modal, no tour, no notification cluster. |
| **2. Location** | 2–6 | **Your work with Larry.** They learn *where they are* before being asked anything. |
| **3. What is alive** | 6–15 | Current focus, in their own words if they declared one. One thing, not a list. |
| **4. The invitation** | 15–25 | A single primary continuation. Not a menu of five equal doors. |
| **5. The periphery** | 25–30 | Field, past reflections, MAIA — **present but quiet**, discoverable without competing. |

⭐ **The opener changes.** `/now-what/room` asks *"Where's your attention right now?"* — optimized for
a conversation, and it **assumes the person already knows where they are.** The Home's job is
orientation; the question belongs *after* arrival, not as the front door.

### 2.1 Orientation before action — the four questions, in order

1. **Where am I?** → *Your work with Larry*
2. **What is alive?** → *Your current focus*
3. **What is waiting?** → *Commitments, practices, conversations*
4. **What can I do now?** → *Continue*

⛔ Do not invert this. Asking for input before establishing location is what makes software feel like
a form.

---

## 3. Information architecture

### 3.1 Calm hierarchy — weight is the design

⭐ **The hierarchy matters more than the components.** Not everything deserves equal weight; equal
weight is what produces a dashboard.

```
┌──────────────────────────────────────────────┐
│  Welcome back, [name]                        │  ← recognition, lightest
│                                              │
│  YOUR WORK WITH LARRY                        │  ← primary. location.
│  Current focus: ______                       │
│                                              │
│  [ Continue ]                                │  ← single primary action
├──────────────────────────────────────────────┤
│  What is alive now                           │  ← secondary
│    · commitment · practice · question        │
├──────────────────────────────────────────────┤
│  From Larry                                  │  ← secondary (see §3.3)
├──────────────────────────────────────────────┤
│  Your Field                                  │  ← tertiary, always present
│    reflections · keeps · questions           │
└──────────────────────────────────────────────┘
```

Three tiers, not four equal panels. One primary action per screen.

### 3.2 What belongs on Home vs elsewhere

| On Home | Elsewhere |
|---|---|
| Where I am · what's alive · what's waiting · one way to continue | Full program catalogue · complete session history · all keeps · settings · account · full reflection archive |

**Home is a threshold, not a container.** If a thing is better served by its own room, it gets a
door on Home — not a panel.

### 3.3 🔴 "From Larry" — the honest problem

The proposed composition includes *new note · resource · upcoming date*. **None of these has
storage.** Per the audit (`NOW_WHAT_CLIENT_HOME_PILOT_2026-08-02.md` §2.2), `coach_authored_notes`,
`coach_resource_recommendations`, `coach_important_dates` and `coach_client_shared_items` are all
deferred to an encrypted-content lane that does not exist.

**Three dispositions. This is a design decision, not a technical one:**

- **(a) Absent.** No slot, no heading. Home composes only what exists. Honest; but the *shape* of the
  relationship is invisible, and the pilot cannot observe how the panel would feel.
- **(b) Named and empty.** The heading exists with a true empty state — *"Nothing from Larry yet."*
  ⚠️ **This is only honest if the channel genuinely exists and is empty.** Today it does not exist, so
  this copy would assert a capability the system lacks. ⛔ Disqualified until the lane opens.
- **(c) Designed, not shipped.** Full visual and interaction design produced now as prototype screens;
  **not built**. The pilot runs without it and reports the narrowed scope.

⭐ **Recommendation: (c).** It keeps the experience design complete — so the panel is not
retrofitted later into a layout that never anticipated it — while shipping nothing that overstates.
⛔ **(b) is the trap**: an empty state is a claim that the container is real.

---

## 4. Visual language

⚠️ **Constraints to confirm against canonical brand sources before execution — stated here as
inputs, not as settled fact:** the field is **navy, never purple**; Studio dark mode is expressed
through explicit tokens, **never Tailwind `dark:`**. Verify both before any component work.

| Dimension | Direction |
|---|---|
| **Density** | Low. Generous negative space. A crowded Home reads as a task queue. |
| **Typography** | One serif or humanist voice for the person's own words and Larry's; a quieter sans for system labels. **The member's language should look different from the interface's language.** |
| **Spacing** | Vertical rhythm that separates *tiers*, not just elements. Whitespace carries the hierarchy. |
| **Color** | Near-monochrome field. Color is **reserved for the member's own marks** — not for system status. ⛔ No red/green/amber health semantics anywhere. |
| **Motion** | Only to express continuity — a return, a reveal. ⛔ No attention-seeking motion, no looping ambient animation. Per standing ruling, motion is either *meaning-bearing* (expects an inference) or *atmospheric* (mood only); label which, never blur them. |
| **Imagery** | Admissible only if it depicts an act **with an author**. ⛔ No decorative abstraction implying system intelligence. |
| **Empty states** | The hardest surface here — see §6. Never apologetic, never instructive, never a call to action. |

---

## 5. Interaction principles

1. **Reveal, don't overwhelm.** Depth is available on request; the first screen is not an index.
2. **Invite, don't instruct.** No "Get started," no checklists, no onboarding nags.
3. **Reflect, don't diagnose.** The system may show what the person said; never what it concluded.
4. **Support agency, don't prescribe.** No recommended next action generated by the system. A
   "next step" is only shown if a **person** authored it.
5. **The member's world is primary.** Copy names the member's act, not the platform function —
   *"what you're carrying,"* not *"your saved items."*
6. **Absence is honest.** When something is not there, the surface says nothing rather than
   simulating a container.

⭐ **The boundary the UI must not undo:** `coach_client_selected_focus` is keyed on `members.id` with
**no `relationship_id`** — Larry's relationship *cannot address* the client's declared focus. The
interface must not present it as something Larry sees. **Presentation must not undo in appearance
what the schema made unreachable.**

---

## 6. Prototype screens required

Before implementation, six screens. ⭐ **The empty and quiet states are the real design work** — they
are where a relational environment is distinguished from a dashboard, and where the pilot's return
test is won or lost.

| # | Screen | What it must prove |
|---|---|---|
| 1 | **First arrival** — new client, invitation just accepted | Orientation with almost no content. Does it feel like a place, or an empty app? |
| 2 | **Returning client, active process** | The signature case. Recognition + location + one continuation. |
| 3 | **Active process, nothing new** | 🔴 Hardest. Nothing has changed since last visit. Must feel *held*, not *stale*. |
| 4 | **No active process** | Between programs, or invited but not enrolled. ⛔ Must not read as an error or a dead end. |
| 5 | **Larry has added something** | Designed per §3.3(c), **not built.** Proves the layout anticipates the channel. |
| 6 | **Something to reflect on** | Client has an unfinished thread of their own. Invitation without obligation. |

### 6.1 The signature test

> A client leaves for two weeks. They return. Do they experience
> *"here's another app"* — or **"something I began is still here"**?

⚠️ With "From Larry" absent, the only thing that can be waiting is **what the client themselves
left**. That is a real, testable result — and a **narrower claim** than the pilot's full intent. It
must be reported at that width.

---

## 7. Track structure — neither subordinate

| Track A — Relationship Model | Track B — Human Experience |
|---|---|
| What exists? | What does arrival feel like? |
| Who owns it? | What does the person understand immediately? |
| Who sees it? | What deserves attention? |
| Who can act on it? | What remains quiet? |
| | How does the environment invite continuation? |

⛔ **The experience architecture is resolved *alongside* the ownership architecture, not after it.**
The Home is not an assembly layer where data is made to appear and then made beautiful — that
confuses capability with experience, which is the failure mode this architecture has spent its whole
history avoiding.

Related: `NOW_WHAT_CLIENT_HOME_PILOT_2026-08-02.md` (Track A audit) ·
`docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` · the Member Experience Design Constitution
(*leave the member closer to their work*)
