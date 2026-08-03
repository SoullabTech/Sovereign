# Open decision — Now What? walk instrument identity

**Status: RECORD ONLY. Awaiting founder decision. Nothing here authorizes anything.**
**Created:** 2026-08-03, after five evidence instruments accumulated in one lane without an
identity decision.

> Follows the shape and the rule of
> [`WALK_INSTRUMENT_OPEN_DECISION_2026-08-02.md`](WALK_INSTRUMENT_OPEN_DECISION_2026-08-02.md),
> which is scoped to the **Writer's Studio** lane and does **not** govern this one. What carries
> across is its rule, stated generally:
>
> **Do not create a walk before the question being walked is settled.**
> One artifact, one responsibility — ⛔ a container is not to be repurposed.

---

## The problem, stated precisely

The danger is **not** that multiple instruments exist. Multiple instruments can be healthy; they
answer different questions. The danger is:

```
Walk A measures X · Walk B measures Y · Walk C measures Z
        ↓
all become "the acceptance walk"
        ↓
a later pass cannot answer: what does a successful result actually PROVE?
```

**This is an identity problem, not a documentation problem** — and it governs future evidence
production, which is why it precedes producing more evidence.

## The five instruments now in this lane

| Artifact | Question it appears to ask | Authored |
|---|---|---|
| `reviews/NOW_WHAT_CLIENT_HOME_LARRY_ACCEPTANCE_WALK.md` | Would Slice 0, once built, be acceptable? | 2026-08-02 |
| `product/walks/NOW_WHAT_PRACTICE_WORKSPACE_LARRY_WALK_01.md` | Does the practitioner surface fit Larry's practice? | prior |
| `product/walks/HOME_ROOM_STATE_WALK_2026-08-03.md` | What do the five arrival states communicate? | parallel session |
| `product/NOW_WHAT_LARRY_PILOT_TEST_PLAN_2026-08-03.md` | *(unread — evidence-execution layer)* | parallel session |
| `product/walks/CLIENT_ARRIVAL_BASELINE_WALK_2026-08-03.md` | What does a client encounter today? | this session |

⚠️ Two were authored today by two sessions that could not see each other. **The accumulation is a
symptom of the same shared-checkout condition as the six collisions, not of anyone's carelessness.**

## Candidate taxonomy — founder-authored, explicitly NOT a ruling

**Second pass (2026-08-03), which adds the column that makes it operable:**

| Instrument | Primary question | Authority of result |
|---|---|---|
| **Observation walk** | what exists / what happens? | produces **evidence** |
| **Acceptance walk** | does this satisfy a defined criterion? | produces **acceptance evidence** |
| **State walk** | does the environment hold across changing conditions? | produces **boundary evidence** |
| **Transition walk** | where do seams fail between states or rooms? | produces **continuity evidence** |
| **Pilot / practice walk** | does this fit a real person's work? | produces **lived-practice evidence** |

> ⭐⭐ **A result can only carry the authority of the question the instrument was designed to answer.**

That is the rule the whole decision exists to establish. It blocks the common slide:

```
observation → interpretation → acceptance
```

— where someone sees something interesting and treats it as approval. An observation walk cannot
accept a release; an acceptance walk cannot discover an unanticipated experience. **The mistake would
be making them compete. They answer different questions.**

### ✅ The dropped categories, reconciled — walks are not gates

The three categories missing from the second pass were not lost; they belong to a **different
family**. Founder reconciliation (still a candidate, not a ruling):

> **A walk learns. A gate permits.**

**Walks — generate understanding**

| Walk | Question |
|---|---|
| Observation | what is happening? |
| State | does the environment hold under changing conditions? |
| Acceptance | does this satisfy a defined criterion? |
| Practice / Pilot | does this work in lived use? *(absorbs the first pass's "Experience")* |
| Transition | where do seams fail between states? |

**Gates — authorize movement**

| Gate | Question |
|---|---|
| Readiness | are prerequisites satisfied to begin? |
| Implementation verification | did the built thing match the authorized design? |

⭐ This fits the chain the whole lane has been building toward:

```
observation → evidence   ·   ruling → authority   ·   gate → transition   ·   implementation → artifact
```

### The rule connecting the two families

> **A walk can inform a gate. A walk cannot *satisfy* a gate — unless the gate explicitly names that
> walk as its evidence source.**

The exception is what makes it workable, and it must be **declared at the gate, in advance**. A gate
that names its evidence source can be opened by that source and by nothing else. A gate that names
none cannot be opened by a walk at all.

This blocks two opposite failures: **a discovery walk treated as approval**, and **a gate treated as
a suggestion**.

⚠️ **Consequence, concrete.** The five instruments in this lane are all **walks**. The deployment
gate in `specs/NOW_WHAT_LARRY_PRACTICE_WORKSPACE_UIUX_SPECIFICATION.md` (G1–G6) is a **gate** — and
**G6 currently reads as a walk result without naming its walk**: *"acceptance questions answered by
someone who is not Larry, first."* Under this rule G6 must either **name the instrument** that
satisfies it or be restated as something a walk cannot open. Until then it is exactly the ambiguity
this decision exists to remove.

## What must be decided

1. **Does this lane adopt a taxonomy at all**, or does each instrument simply state its own question?
2. **Which of the five is which kind** — and does any pair collapse into one instrument?
3. **Which may produce a result that changes a status** (acceptance/readiness), and which may only
   produce findings (observation/experience)?
4. **Ordering** — the baseline arrival walk was recommended first on the grounds that it needs
   nothing built. Does the pilot test plan already contain it, supersede it, or run beside it?
   ⚠️ **Unknown: the pilot test plan has not been read.** It may already answer question 4 and part
   of question 2.

## Options

| # | Option | What it would mean |
|---|---|---|
| 1 | **Adopt the taxonomy and classify all five** | Each instrument declares its kind; result authority follows from kind. Costs one sitting. |
| 2 | **Rule per-instrument, no taxonomy** | Each states its own question and authority. Cheaper now, and the fifth collision suggests the cost returns. |
| 3 | **Consolidate first, then classify** | Decide which instruments merge before assigning kinds. Fewest artifacts, most rework. |

## Preserved state — unchanged by this record

| Item | State |
|---|---|
| Client arrival baseline walk | **defined, not executed** |
| Larry acceptance walk | acceptance design, not executed |
| Home room state walk | authored by parallel session, unread here |
| Larry pilot test plan | authored by parallel session, **unread here** |
| Empty-state observation | **candidate input, not promoted to evidence** |
| Instrument taxonomy | **not adopted** |

## What this record does not do

It does not classify any instrument, merge or retire any of them, author criteria, select an option,
change any authorization status, or authorize a walk to run. It records the problem, the field, a
candidate taxonomy, and three options — and stops.
