# Home — Room State Walk

### One room, five arrival states

**Status:** ⏸️ **DEFINED, NOT EXECUTABLE.** ⛔ **Specification walk, design-time.** Home is not built.
**Date:** 2026-08-03 · **Room:** Home (client surface, plus Larry's surface where a state spans both)

---

## 0. ⚠️ Fifth near-collision — what makes this a distinct object

Three neighbours, none superseded:

| Artifact | Scope | Shape |
|---|---|---|
| [Client Arrival Baseline Walk](CLIENT_ARRIVAL_BASELINE_WALK_2026-08-03.md) | the **threshold** — does AIN OS need multiple doors? | **path walk**: many steps, one state |
| [House Rooms §3a](../NOW_WHAT_HOUSE_ROOMS_2026-08-03.md) | what each room is **for** | design instrument, not a walk |
| **This** | whether **one room** holds up | **state walk**: one surface, many states |

> ⭐⭐⭐ **Path walk ≠ state walk.** The baseline walk asks *can a person get there?* and its steps 6–9
> already record `not reached` because no room exists. This asks *once there, does the room still make
> sense when the person's situation changes?* Those fail differently and must not be merged.

## 1. ⛔ Why this cannot be executed, and what that means

**Home is not built.** Slice 0 has not started. Therefore:

- This walk is run **against the specification**, at a desk, by a reader — not against a surface.
- ⛔ **Nothing it produces is experience evidence.** It cannot show that the room works; it can only
  show that the design has, or has not, decided what the room does in each state.
- A state whose answer is *"the spec does not say"* is the finding. **That is the entire point.**

> **`blocked` ≠ `failed` ≠ `not reached` ≠ `undecided`.** This walk produces the fourth.

When Home exists, the same five states become an **executed** walk requiring a human operator, a
branch-owned DB, and Claude-in-Chrome for hit-testing — the preconditions already recorded in the
baseline walk. ⛔ Credentials are never entered by Claude.

**Why Home rather than Reflect:** Reflect is member-only, so states 4 and 5 barely bite there. Home is
the surface where the client's view and Larry's view both exist — which is where privacy states are
actually load-bearing.

## 2. The five states

| # | State | The question it really asks |
|---|---|---|
| **S1** | a **new** client arrives | does the room explain itself without teaching the system? |
| **S2** | a **returning** client arrives | does it resume, rather than restart? |
| **S3** | a client with **no activity** arrives | is emptiness *hospitable* or does it read as failure? |
| **S4** | a client with **private material** arrives | does their own privacy stay invisible **to them** as a mechanism? |
| **S5** | a client **withdraws** something | ⭐⭐⭐ **two-surface test** — see below |

### The five states are three *kinds*, and each must be tested independently

| Kind | Asks | States |
|---|---|---|
| **Empty-state** | what does the environment communicate **before** there is material? | S1, S3 |
| **Populated-state** | what happens when there **is** material? | S2 |
| **Boundary-state** | what happens when material exists but **should not be visible**? | S4, S5 |

⭐⭐⭐ **Passing one kind is no evidence about another.** A room can hold up beautifully when populated
and fail completely when empty — and the empty case is the one a real first client meets. These are
not severities of the same test; they are different tests, and a walk that runs only the populated
kind has not walked the room.

⚠️ **S5 is stated misleadingly if framed as an arrival.** The client's withdrawal is trivial on their
own surface — they did it, they know. **The test is what Larry's Home shows afterward**, and the
requirement is that the withdrawn item be **unreconstructible**: not by content, and not by position,
count, spacing, or ordering. S5 must therefore be walked on **both** surfaces, in this order:
capture Larry's view → client withdraws → capture Larry's view → **diff.** A visible difference other
than the item's own absence is a failure.

## 3. Acceptance questions, per state

Judged by a reader against the spec; when executed, by a human operator.

1. **Does the room still make sense?** — is it recognisably the same place in this state?
2. **Does anything private become visible?** — including by inference from shape.
3. **Does the person know what to do next?** — without being taught the architecture.

Plus, carried from the item-level instrument ([Design Principles §4/§4a](../NOW_WHAT_DESIGN_PRINCIPLES_2026-08-03.md)) and applied to whatever the state renders:
**whose act put this here**, **does it serve the reason they arrived**, and **what would change if it were absent.**

⚠️ **Confabulation guard applies unchanged.** Do not ask *"did this feel supportive?"* Ask what they
expected to happen next, and ask them to say **in their own words** who can see what they just wrote.
**The vocabulary they reach for unprompted is the finding; their agreement is not.**

## 4. Expected findings — stated in advance, to be confirmed or refuted

Recorded so the walk can **fail against a prediction** rather than be narrated afterward.

| State | Prediction |
|---|---|
| S1 | ⚠️ fails before Home — the documented flow routes new members through `/intro-daimon` and an elemental orientation **before** they reach Larry (Journey-1 finding) |
| S2 | ◐ the spec's five bands support resumption; *"here is what you are carrying"* is ratifiable as written |
| S3 | 🔴 **weakest state.** The spec designs a populated Home. An empty Program, no sessions, and nothing kept is the **most likely first experience** of a real new client, and it is the least specified |
| S4 | ◐ likely passes on the client's own surface — *"Current focus"* is admissible because it is **theirs** |
| S5 | ⏳ **undecided by construction** — Q-P2 is open, and the *"render only what exists"* resolution is proposed, not ruled. The walk cannot pass a state whose rule has not been made |

⭐⭐⭐ **S3 is the one to look at first.** It needs no ruling, no encrypted lane, and no new tables —
only a decision about what an empty room says. **Hospitable emptiness is a design act, not a default.**

### S3 candidate input — existing empty-state observation (2026-08-03)

**Observation source:** current member-reachable surfaces, read from source. **Status: candidate input
only.** ⛔ Does not establish member experience evidence.

| | |
|---|---|
| **Observed** | existing AIN OS empty-state behaviours |
| **Inference** | a possible **inherited** empty-state idiom for Now What? Home |
| **⛔ Unknown** | whether members experience any of it as welcoming, clear, or meaningful |

A recurring pattern is already present across surfaces:

1. **Honest absence** — *"nothing kept yet"* (`/maia/moments`) · *"nothing held yet"*
   (`/maia/anchor/history`) · *"No shared spaces yet"* (`/maia/portal`) · *"No book yet"*
   (`/press/studio`). Lowercase, muted, unelaborated.
2. **No deficit interpretation** — absence is framed as a state, not a failure, and never as
   something missing *from the person*. `/maia/orientation` states it outright: *"Quiet means nothing
   has been placed here yet — not that nothing…"*. `/now-what/position` carries it as a code
   invariant: *"Empty renders as honest absence, never inferred placement."*
3. **A human gesture is the filling action** — spaces populate through an authored act: keeping,
   holding, inviting, completing a practice, beginning a work.
4. **Candidate inheritance for S3** — an empty Home should likely **inherit this grammar rather than
   invent one.**

⭐⭐⭐ **This partly refutes the §4 prediction, and the refutation is the more useful result.** The
prediction was that empty states would expose unconscious product habits. In most observed cases the
system **already carries a mature empty-state language**. That changes the design task from *"invent a
humane empty state"* to **"preserve and extend an existing relational grammar into a new
environment"** — a materially safer move.

⭐⭐ **`/maia/portal` and `/now-what/next` resolve the empty-and-hospitable contradiction**, and the
formula is worth stating exactly:

```
name what is absent  +  name the human act that creates what comes next      ✅
name what is absent  +  generate something to fill the gap                   ⛔
```

The invitation points at a **person's act**, never at system-authored material. That is precisely the
guard against filling emptiness with manufactured meaning.

⚠️ **Outlier:** `/maia/ideas` renders *"No ideas yet."* — sentence case, full stop, no continuation;
structurally *"No records found."* It frames absence as a lack, and it demonstrates that the good
idiom is **a convention, not an enforced one.** Conventions drift.

⛔ **The empty-state investigation is closed.** It has done its job. The remaining S3 question is the
human one — what a member actually experiences on encountering these states — and no further reading
of source can answer it.

### The empty state is the first relationship moment, not an edge case

Platforms are designed backwards from the mature successful user — active program, completed sessions,
accumulated history, resources, messages. **The first real client arrives with almost none of it.**
What the room says then is not a fallback; it is the opening move of the relationship.

> ❌ *"No activity yet."* — frames absence as **failure**, and makes the person's first experience a
> report of what they lack.
> ✅ *"Your work with Larry begins here."* — the system is not reporting a lack. **It is holding a
> place.**

The design question, stated so it can be answered rather than defaulted:

> **How does an empty room communicate welcome without pretending something exists?**

Both halves bind. Fabricating suggested next steps, sample content, or an encouraging progress
indicator fails the second half — that is inventing material to avoid an honest emptiness, and it is
the same move as manufacturing meaning the member did not author. ⛔ **The empty state must be empty
and hospitable at once.**

## 5. Saying this to Larry

He does not need the architecture. He needs to know why the product gets built this way:

> **"We are testing three moments: when someone has nothing yet, when the relationship is active, and
> when something personal is intentionally private. Most software only tests the middle one."**

And the bridge to the practical tools he actually wants:

> **"We are not removing practical tools. We are making sure every practical tool sits inside the
> right human context."**

Calendar, programs, sessions, communication, resources all still belong. They simply have to answer:
*who is this for · who owns the meaning · what relationship does this preserve.*

## 5a. ⏸️ Named gap — a transition walk (NOT started, no authorization)

The walk family has an obvious hole, recorded so that whoever hits it recognises a **missing
instrument** rather than a defect in the two that exist:

```
Arrival walk  →  Room state walk  →  ⏸️ transition walk?
(can I enter?)   (does the room hold?)   (can I move?)
```

Home explains where you are; Program explains the journey; Sessions explain conversations — and
*"how did I get from what I was doing yesterday to what I need today?"* is answered by none of them.
**That is a movement problem, not a room problem**, and many digital experiences fail precisely at the
seams. ⛔ Not proposed, not scheduled — held as a recognised gap.

## 6. What this cannot produce

Whether the designed environment works · whether Larry's clients adopt it · any evidence about rooms
other than Home · and any authorization to build. **The walk supplies findings; rulings remain founder
acts.** ⛔ No result may be recorded against §4's predictions until a reader or operator actually runs
it — this document is a definition, not a run.
