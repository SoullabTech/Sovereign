# My Work Field — UX Specification v1

**Status:** SPEC — for review, then implementation.
**Governed by:** `MY_WORK_FIELD_GOVERNANCE_MODEL_V1.md` (R1–R7) ·
`NOW_WHAT_HOME_ACTIVATION_MODEL_v0.md` §7.
**Replaces:** `components/now-what/ClientHome.tsx` as the member-facing surface.
**Referent:** deployed SHA `95b21ce42`.

---

## 0. Acceptance test — write this first, build to it

> **Can a new executive open this page and understand their next meaningful action without
> knowing anything about the database, the program structure, or coaching methodology?**

**Failure condition, stated as plainly:** if they must learn the difference between
*"Journey," "Field Object," "Decision"* and *"Reflection"* — **we rebuilt the filing
cabinet.**

**The specific trap this spec exists to avoid:** *the six areas with prettier names.* Renaming
`Decisions → Explore` while keeping six fixed blocks preserves the old ontology exactly. The
test is not whether the labels are nicer. It is whether the member ever has to think in
containers at all.

### Gates closed since the governance model

| Gate | State |
|---|---|
| 1 · Participation object | 🔲 **still open** — ruled in shape, needs a schema decision. **Blocks the Context layer only.** |
| 2 · Reflection ontology | ✅ **closed → (B)**. `Experience → member notices meaning → member keeps something → reflection emerges.` Reflection is **not** a module you open and write into; that shape is a productivity tool. |
| 3 · Gesture vocabulary | ✅ **closed** — §4 below. |

---

## 1. The governing layout rule — a contextual stream, not five modules

**The field composes from what exists. It is not a skeleton with holes.**

This is the direct fix for the arrival failure that opened this lane: six fixed sections
rendered as six empty paragraphs, which read as a broken product rather than a quiet one.

⛔ **Do not implement five permanent cards.** That recreates the original problem with new
labels:

```
My Work Field
  [Current Work]
  [Prepare]
  [Practice]
  [Explore]
  [Connect]
```

✅ **Implement a contextual stream:**

```
My Work Field

  Current work appears when there is current work.
  Preparation appears when there is preparation.
  Practice appears when there is practice.
  Explore appears when the member has something to explore.
  Connect appears when there is a relationship action.
```

> **The page is alive, not a dashboard.** A layer with no content **does not render** — no
> empty shell, no placeholder card, no "nothing here yet" repeated five times down the page.
> No dead rooms.

The five blocks in §2 are **the vocabulary of what can appear**, not a fixed template. §2's
order is the default reading order when several are present; it is not a layout skeleton.

One exception, §6: the **arrival state**, which is a single authored welcome — not five empty
ones.

---

## 2. Screen 1 — the field

Five blocks. **Resources and Field Memory are behind doors, not on the first screen** (a
deliberate reduction from the governance model's seven-layer table — layers are assembly
dimensions; only these five are surfaces).

```
MY WORK

  [CURRENT FOCUS]
  What you are working on now.
  ─────────────────────────────
  PREPARE
  What is coming next.
  ─────────────────────────────
  PRACTICE
  What you are trying.
  ─────────────────────────────
  EXPLORE
  What you are noticing.
  ─────────────────────────────
  CONNECT
  Who you are working with.
```

### 2.1 CURRENT FOCUS — the anchor

Opens with **context**, never with objects. The program is the *setting* of the sentence,
never its subject (R2).

| ⛔ | *"You are enrolled in Executive Leadership Program."* |
|---|---|
| ✅ | *"You are working on leading through conflict."* |

```
You are working on:   Leading difficult conversations
Within:               Leadership Presence · with Sarah
```

**Reads:** participation (Gate 1) ⋈ `field_programs.title` ·
`field_program_positions.focal_point` for the member's own words.

**Rule:** where member-stated and practitioner-seeded focus differ, the **member's** words
lead and the practitioner's is attributed (§3). Where `focal_point` is null, **the line does
not render** — no fabrication.

### ⚠️ Correction — Current Work must not depend on progress

Earlier drafts of this spec, and the mockups that preceded it, rendered **"Week 4 of 8."**
**That is now prohibited.** Progress framing converts development into completion tracking
and violates R4 at the display layer — the same way a `completed` status would violate it at
the data layer.

| ⛔ Never render | ✅ Render instead |
|---|---|
| Week 4 of 8 | Current focus |
| 60% complete | Current theme |
| 3 of 5 completed | Next conversation |
| any progress bar or streak | What you are working with |

`field_programs.focal_points[]` is an **ordered array**, and its ordinal position must **not**
be surfaced as `Week N of M`. The array orders the practitioner's sequence for *assembly*
(Governance §6, source 2); it is not a completion denominator.

### 2.2 PREPARE — what is coming next

Composes **only** from the three authorized `Next` sources (Governance §6): time-bound
events · explicit sequence · member-declared continuation.

```
Thursday, 3:00 PM · with Sarah
Bring:  one relationship challenge you are navigating
```

**Reads:** `sessions` / `group_sessions` / `calendar_events` for the fact ·
`field_program_lessons.reflection_prompt` for *Bring*.

⛔ No inferred importance, no "most relevant," no ordering that implies significance. Order
is chronological. If there is no scheduled event and no carried-forward item, **this block
does not render.**

### 2.3 PRACTICE — what you are trying

Two states on one surface, never merged (R7).

```
Suggested by Sarah
  Notice where you avoid direct feedback.
  [ I want to practise this ]

You are practising
  Pause before responding in conflict.       since 28 July
```

**Reads:** `field_program_lessons.practice` (offered) ·
`member_field_note_threads` tag `practice` (active).

**The transition is a member gesture and creates a new member-authored object.** It never
relabels the practitioner's. No progress bar, no streak, no completion state, no compliance
signal of any kind.

### 2.4 EXPLORE — what you are noticing

The member's own meaning-making, in their own words, in the order they kept them. Not
ranked, not summarised, not scored.

```
What kind of leader am I becoming?
I apologise before stating my position.
```

**Reads:** `member_field_note_threads` — `decision` · `question` · default.

Per Gate 2 (B), **there is no "write a reflection" affordance here.** Reflection emerges from
keeping, downstream of experience. The only door is into the work itself.

### 2.5 CONNECT — who you are working with

```
Sarah · your coach                    [ Message ]
Leadership Cohort · 12 members        [ Conversation ]
```

**Reads:** `practitioner_clients` / `client_relationships` · `client_group_members`.

Carries the existing consent boundary verbatim: the coach sees what the member has shared,
one piece at a time, withdrawable.

---

## 3. Attribution & state language (R4 + R7)

One surface, many authors — **visually unified, epistemically differentiated.** Every line
must let the member know **who said this about me.**

| State | Renders as | Never as |
|---|---|---|
| **Offered** | *"Suggested by Sarah"* | *"Your commitment"* |
| **Active** | *"You are practising"* | *"Assigned"* |
| **Kept** | *"You decided to carry forward"* | *"Completed"* |

Coach-stated content is **always** attributed and **never** rendered in the member's own
voice — *"Your coach identified this as a focus,"* never *"Your focus is…"*
(Activation Model §7.3).

---

## 4. Gesture vocabulary — Gate 3, closed

**The system never exposes database nouns. The gesture creates the object; the object does
not create the gesture.**

### The four verbs — the complete member-facing verb set for v1

```
Continue    Practice    Explore    Keep
```

| ⛔ Object-named | ✅ Gesture |
|---|---|
| Create Decision | **Continue** — *"I want to work with this."* |
| Add Commitment | **Practice** — *"I want to practise this."* |
| New Reflection | **Keep** — *"I want to keep this."* |
| Open Explore | **Explore** — *"I want to explore this."* |

### ⛔ Prohibited verbs

```
Create    Add    Complete    Submit    Track
```

**These words quietly convert development into productivity software.** They are banned from
every button, heading and label on this surface — not discouraged, banned.

Any verb outside the four is a **spec change**, not an implementation detail.

---

## 5. Behind the doors

Not on screen 1. Reached from context, never from a nav bar:

- **Resources** — `library_sources` (ratified only) · `field_program_lessons.material_ids[]`
- **Client Field Memory** — decisions · commitments · insights · reflections · things worth
  keeping. The *integration* layer; My Work Field is *orientation*.
- **The room** — the hearth. Entered from the work, not as a destination (Model 3).

---

## 6. Arrival state — no participation yet

The single most common first render, and the one the old Home got wrong.

**The first-time member experience must not be "Nothing here yet."** It is a welcome.

**Not** five empty blocks. **One** authored invitation:

```
Your Work Field

A place for the work you choose to carry forward.

When your practitioner invites you into a program,
your current work will appear here.

You can also begin by bringing something
you want to explore.

[ Explore ]
```

Same discipline as today's empty states — *a real place to be standing, not a gap* — but
stated **once**, warmly, and never as an absence. **No dead rooms.**

---

## 7. Data binding summary

| Block | Sources | Gate |
|---|---|---|
| Current Focus | participation ⋈ `field_programs` · `field_program_positions` | **1** |
| Prepare | `sessions` · `group_sessions` · `calendar_events` · `field_program_lessons.reflection_prompt` | — |
| Practice | `field_program_lessons.practice` · `member_field_note_threads` (`practice`) | — |
| Explore | `member_field_note_threads` | — |
| Connect | `practitioner_clients` · `client_group_members` | — |

**Only Current Focus is blocked on Gate 1.** Prepare, Practice, Explore and Connect can be
built against existing schema now.

---

## 8. Anti-patterns — reject in review

- ⛔ Six fixed blocks with new names
- ⛔ Empty-state cards for layers with no content
- ⛔ A nav bar listing the layers
- ⛔ Any object noun in a button
- ⛔ Progress, completion, streaks, compliance, engagement scores
- ⛔ Practitioner content in the member's voice
- ⛔ Any ordering that implies *this matters more than that*

---

## 9. Implementation sequence

**Do not start with all five.** Building the full set at once forces placeholders, and
placeholders are how the dashboard comes back.

| Phase | Scope | Blocked on |
|---|---|---|
| **1** | Replace the `ClientHome` shell — new IA, contextual stream (§1), remove the empty-dashboard feel, arrival state (§6) | — |
| **2** | Bind existing data — Current Work where available · Explore (existing member material) · sessions + relationship context | — |
| **3** | Add the missing practitioner↔member pathways — Prepare · Practice · richer Connect | Gate 1 for full Current Work |

Phase 1 is a real deliverable on its own: it removes the failure that opened this lane.

---

## 9A. ⛔ The adoption transition — HELD for pilot design

Phase 2 shipped `01ed21d70`: an offered practice renders beside the member's own, visibly
distinct. **An offered practice still cannot become a member commitment.** The system stops
one arrow short:

```
Coach offers → Member sees → Member chooses → [ Member authors ]
                                                ↑ not built, deliberately
```

> **That is not a UI gap. It is the transition point** — the first place the implementation
> crosses from *rendering a relationship state* into *creating a new member-authority
> transition.* **This is a healthy stopping point.**

### ⚠️ Why the existing primitive is the risk, not the solution

`/api/now-what/field-note` already writes member-authored practice threads. **The primitive
exists.** That is precisely why this must not be rushed:

> **The question is not "can we build a write endpoint?" It is "what is the meaning of the
> write?"**

### The six questions any adoption gesture must answer first

1. Who **initiated** the transition?
2. What is **preserved** from the original offer?
3. What becomes **member-owned**?
4. Does **practitioner attribution remain**?
5. How does **withdrawal** work?
6. What happens if the member **changes the wording**?

⛔ These are not implementation details.

### ⚠️ The dangerous shape

| ⛔ | **"Add this practice"** — makes the system *a collector of commitments* |
|---|---|
| ⚠️ closer | *"Carry this forward"* · *"Make this yours"* — **but even these need the ruling behind them** |

### Two questions the pilot separates

1. **Does the between-session loop work without adoption?** — testable **now**:
   `Session → Reflection → Practice offered → Return`. Measures whether members recognise
   value in the offered layer at all.
2. **Does the member want to claim something?** — the *next* experiment, and it must be
   **tested with actual pilot participants, not assumed from the architecture.**

> **The next useful evidence is not more code. It is whether a real person looks at an
> offered practice and naturally wants to make a move. That gesture, when it appears,
> defines the transition.**

---

## 10. Not authorized by this spec

- ⛔ The participation object migration (Gate 1) — separate authorization.
- ⛔ MAIA-generated content in any block. A future guidance layer renders as
  *"Possible reflection,"* never under `Prepare` or `Next`.
- ⛔ Removal or modification of `ClientHome.tsx` before this spec is approved.
