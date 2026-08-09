# My Work Field — Governance Model v1

**Status:** **RULED — founder, 2026-08-03.** Governs the member-facing Now What? environment.
Authorizes no code.
**Referent:** deployed SHA `95b21ce42`; schema + code read at trunk `5e8f8a5bb`.
**Supersedes:** the six-area IA in `NOW_WHAT_MEMBER_HOME_INFORMATION_ARCHITECTURE.md` §3 as
*navigation*. That document's object mapping (§4), gap analysis (§5) and phasing (§6) remain
valid as the **assembly layer**.
**Preserves:** `NOW_WHAT_HOME_ACTIVATION_MODEL_v0.md` §7 — Model 3, gesture grammar,
MAIA-proposes/member-declares, coach attribution, sequence discipline.

---

## 0. The turning point

> **We do not need to build a new Client Field. We need to expose the intelligence that
> already exists.**

The mistake was treating the Home as an empty shell needing more features. The schema
inventory (IA §5) showed six of seven capabilities already built, authored and unwired. The
member experience was simply not assembled around the human's question.

Programs · Lessons · Groups · Sessions · Library · Messages are **backend ingredients**, not
destinations. The member needs one field that answers: *What am I doing? Why does it matter?
What is next? Who am I doing it with?*

---

## 1. Architecture

```
                         PRACTITIONER
             Creates programs, practices, resources,
                  groups, sessions, guidance
                              ↓
                    MEMBER WORK FIELD
        ┌─────────────────────────────────────┐
        │  Current Work                       │
        │  "Leadership Presence"              │
        │  Week 4 · Difficult Conversations   │
        │                                     │
        │  Prepare    Bring this Thursday     │
        │  Practice   Try this experiment     │
        │  Explore    What you are noticing   │
        │  Resources  Materials, recordings   │
        │  Connect    Coach + community       │
        └─────────────────────────────────────┘
                              ↓
                    MEMBER FIELD MEMORY
          Decisions · Commitments · Insights
          Reflections · Things worth keeping
```

Three strata, one direction of authority: the practitioner offers, the member works, the
member's acts accumulate as their own field memory. **Nothing flows back up.**

---

## 2. The six rulings

### R1 — The Field is the member's single working environment

One field, many intelligent layers. Not six rooms, not a dashboard, not a database browser.

⛔ Forbids: parallel destinations the member must choose between; any navigation that
requires understanding the object model.

### R2 — Programs are containers, not destinations

**A program provides context, not identity.** The human is the center.

| ⛔ | *"You are enrolled in Executive Leadership Program."* |
|---|---|
| ✅ | *"You are working on leading through conflict. Here is where you are, what is next, and what you are carrying."* |

⛔ Forbids: making the program the subject of the sentence; an "Enter Program" model where
the program is a place the member goes.

### R3 — Enrollment is explicit participation

```
Practitioner creates program
        ↓
Practitioner invites member
        ↓
Member accepts / enters          ← the participation fact
        ↓
Program becomes part of My Work Field
```

A member is in a program through **explicit participation**. Explicitly **not**:
practitioner relationship · client list · declared position · inferred activity.

*This protects sovereignty: a coach can create, a coach can invite, a member participates.*

> **🔴 Finding — R3 had no object.** Verified at `5e8f8a5bb`: the only
> member↔`field_programs` link is `field_program_positions`, a *position statement*, not a
> participation fact. `academy_enrollments`, `client_group_members`, `workflow_enrollments`
> and `circle_memberships` belong to other systems. **This corrects IA §4's "no new tables"
> claim.** It is also the root cause of **D5** — the Home infers participation from position
> *because participation has nowhere to live.*

#### R3.1 — RULED: participation is a first-class object

The earlier assumption *"the infrastructure already exists"* was **only partially true.** The
program container exists; **the relationship between a member and the program does not exist
as a first-class object.** That distinction is the whole issue. The missing object is not a
detail — **it is the bridge.**

```
PRACTITIONER → PROGRAM → [invitation] → MEMBER PARTICIPATION → MY WORK FIELD → MEMBER FIELD
                                         ↑ missing object
```

**`field_program_positions` may NOT become enrollment.** They answer different questions:

| | Answers | Example |
|---|---|---|
| **Participation** | *Am I actually participating in this container?* | "I joined Sarah's Executive Presence program." |
| **Position** | *How is this work currently described?* | "My focus is developing executive presence." |

Related, **not interchangeable.** Preserve `Enrollment → Position → Meaning`; never
`Position → pretend enrollment exists`.

#### R3.2 — RULED: the object stays minimal

**Not an LMS enrollment system.** It answers only *who · what · from whom · when · status*:

```
Program Participation
  member_id
  program_definition_id     -- binds to the existing field_programs container
  invited_by
  accepted_at
  status
  created_at
```

It is explicitly **not** progress tracking · compliance · completion · performance. It says
one thing: **"This person has entered this work."**

> ⚠️ **Binding seam to resolve at implementation:** the ruling names
> `program_definition_id`, while the deployed container is `field_programs`, keyed
> `(field_slug, program_slug)`. The participation object binds to that existing container —
> no second program table. The key shape is a mechanical decision, not a governance one.

### R4 — Practitioner creates opportunities; member creates meaning

**The distinction is the soul of the architecture.**

| Practitioner may create | Member alone creates |
|---|---|
| invitation | **commitment** |
| suggestion | **decision** |
| exercise | **reflection** |
| practice opportunity | **meaning** |
| resource, prompt, session | |

A practitioner may offer:

```
Practice:  Have one conversation this week.
```

The system may **not** represent that as:

```
Commitment:  Have one conversation this week.
```

until the member **adopts** it. Adoption is a member gesture and it creates a **new,
member-authored object** — it does not relabel the practitioner's.

> ✅ **The schema already enforces R4.** Practitioner practice lives in
> `field_program_lessons.practice`; member commitment lives in
> `member_field_note_threads` (tag `practice`). Different tables, structurally unconfusable.
> **The risk is entirely at the rendering layer** — R4 is a display ruling, not a data one.

### R5 — Home assembles context; it does not become a filing system

The field composes authored facts into one context. It does not become an archive to browse
or a place to file things.

### R6 — Field Objects emerge only through member acts

Nothing enters Member Field Memory except by a member gesture. Consistent with Activation
Model §7.2: **MAIA proposes meaning; the member declares it.** The tag is a member-authority
act.

---

#### R3.3 — the four facts vary independently

Participation cannot be represented by position because a member can:

- be **invited but not joined**
- **join but not yet have a stated focus**
- **have a focus** without the system knowing how they entered
- **leave a program while preserving Field Memory**

The last is a ruling in its own right: **withdrawal ends access, never memory.** What a
member authored remains theirs after they leave (R6).

Status enum: `invited · accepted · declined · withdrawn`.

---

## 3. Two layers, one person

**"My Work Field"** and **"Client Field"** are not synonyms and this model governs the first.

```
MY WORK FIELD   (orientation)   — What am I working with?
        ↓
CLIENT FIELD    (integration)   — What is becoming part of me?
```

My Work Field is the **daily interface**. Client Field is the **deeper developmental
substrate**. A person starts at the first and eventually arrives at the second. Different
moments; do not collapse them.

---

## 4. Field layers (not rooms)

**Current Work is the anchor.** The field opens with **context**, never with objects. Objects
emerge from the work.

⛔ Not: `Decisions · Commitments · Reflections · Resources`

✅ But:

```
You are working on:  Leadership Presence
Current focus:       Difficult conversations
Next:                Prepare for Thursday
With:                Sarah + cohort
```

| Layer | Answers | Authored by |
|---|---|---|
| **Context / Current Work** | *What am I engaged in?* | practitioner sequence + member position |
| **Next** | *What is already scheduled or explicitly carried forward?* | §6 — three sources only |
| **Prepare** | *What can I bring?* | practitioner prompt |
| **Practice** | *What is offered, or chosen?* | practitioner **offers** / member **chooses** |
| **Explore** | *What am I noticing and discovering?* | **member** |
| **Connect** | *Who is part of this work?* | relationship facts |
| **Resources** | *What supports the work?* | practitioner (ratified) |

Below the field: **Member Field Memory** — decisions, commitments, insights, reflections,
things worth keeping. Member-authored only (R6).

> The Field remains sovereign because **the system organizes orientation, not meaning.**

---

## 5. Attribution grammar — R4 made renderable

One surface, many authors. **The field is visually unified and epistemically
differentiated.** Rendered in one voice, the field would tell a member their coach's framing
as if it were their own — violating Activation Model §7.3 and the Direction of Authority.

> The car analogy holds for **mechanism**, not for **authorship**. A driver need not know how
> the engine works. A member must always be able to know **who said this about me.**

### R7 — RULED: three states, and the gesture between them

The danger in R4 is **not storage — it is language.** The field needs an explicit state
vocabulary:

| State | Reads as | Authored by |
|---|---|---|
| **Offered** | *"Your coach suggested…"* | practitioner |
| **Active** | *"You chose to work with…"* | member |
| **Kept** | *"You decided to carry forward…"* | member |

```
⛔ Your commitments:
     Complete the difficult conversation exercise.

✅ Suggested practice:
     Try noticing where you avoid difficult conversations.
   ↓ (member act)
✅ Your commitment:
     — appears only after the member chooses it
```

**This closes the biggest failure mode: `suggestion → commitment` with no human act in
between.** A transition between states is always a member gesture, never a render.

---

## 6. Salience — RULED

*"What matters now"* is a ranking, and **Next is where AI systems commonly cross the line.**

| | |
|---|---|
| ✅ **Assembly** | *"Your next session is Thursday."* |
| ⛔ **Recommendation** | *"You should focus on delegation."* |

> **The system may reveal momentum. It may not manufacture direction.**

### Authorized `Next` sources — closed set

1. **Time-bound events** — *session Thursday at 3 PM*
2. **Explicit sequence** — *Week 4 of 8*
3. **Member-declared continuation** — *"I want to return to this."*

**Not permitted:** AI ranking · inferred importance · "most relevant" · hidden
prioritization.

The system may say *"these things are active."* It may **not** say *"this matters most."*

**The fourth source stays closed.** If MAIA guidance is introduced later it must be its own
explicit layer, labelled as what it is:

```
✅  Possible reflection
⛔  Next
```

---

## 7. The seam

> **Participation creates access. Position describes orientation. Meaning belongs to the
> member.**

That sentence is what keeps this from becoming a coaching LMS or a CRM.

Behind the member's one field:

```
Program Definition → Participation → Position → Practices Offered
                   → Member Gestures → Field Memory
```

---

## 8. Sequence

| # | Stage | Status |
|---|---|---|
| 1 | Program identity | ✅ ruled (R2) |
| 2 | Container authority | ✅ ruled (R4, R7) |
| 3 | **Participation object** | 🔲 **P0 — ruled in shape, not built** |
| 4 | Salience / Next rule | ✅ ruled (§6) |
| 5 | Reflection ontology | 🔲 open edge — Activation Model §7.4 |
| 6 | Gesture vocabulary | 🔲 not started |
| 7 | My Work Field UI | 🔲 blocked on 3, 5, 6 |

## 9. What this does not authorize

- ⛔ No code. **No migration** — the participation object is ruled in *shape*; the schema
  change itself is a separate authorization.
- ⛔ No progress · completion · success · compliance · engagement fields on the
  participation object. Those would violate R4.
- ⛔ No fix to D1–D5 as standalone patches.
- ⛔ No fourth `Next` source, and no MAIA guidance rendered under a `Next` heading.
