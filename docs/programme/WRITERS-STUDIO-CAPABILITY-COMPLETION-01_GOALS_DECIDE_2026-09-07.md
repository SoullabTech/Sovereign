# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## GOALS — DECIDE (design of record)

**Opened by** founder act, 2026-09-07, from the ratified product boundary:

> **The writer declares the goal.
> The system may measure progress against it.
> MAIA may not invent the goal.**

**Status** DESIGN. **Not built.** Questions for founder ruling at §7.

---

## 1 · HARVEST — Goals is the most ratified thing in the rail

Under the GOVERNING-RECORD RULE, the record was read before any design:

| source | what it settles |
|---|---|
| `FIELD-MAP §1` | **"Goals strip"** in WS-WRITE — NEW |
| `FIELD-MAP §5` | **"active goals"** on Work Home — NEW |
| `FIELD-MAP §7` · `DESIGN-CONTRACT §120` | **goal progress against a writer-declared target is computed and showable** |
| **`DECISIONS.md` D-003** | *"Showable as measurement: word count, material count, chapter count, **goal progress against a writer-declared target**, reading time, version count…"* — founder, 2026-08-27 |
| `DECISIONS.md` D-019 | Goals sits in the **WORK SPACE** band |
| `FUNCTION-PLACEMENT §2` | **EXPLORE owns goals**; *"Goals and statistics land in EXPLORE"* |
| `app/writers-studio/maiaOffering.ts` | *"Writer-declared goal progress MAY be quantified… it measures the work against the writer's intent, and the writer owns both ends."* |
| `StudioLowerBand.tsx` | a Goals region that **states it has no substrate** and draws no bars — 04's three gold progress bars named as *"the single most tempting thing in the reference to fake"* |

**Goals needs no new permission.** Its one dangerous act — putting a number on a
writer's work — was authorized a year of decisions ago, precisely and narrowly.

### ⚠️ A placement tension the harvest exposes

`FUNCTION-PLACEMENT` says **EXPLORE owns goals**, and WRITE and Work Home show
them. But **EXPLORE is `later` in `STUDIO_MODES` — its room does not exist.**

So Goals' owner room is unbuilt while two of its viewing surfaces are live.
That is not a blocker (the lower band's Goals region is in WRITE and is already
drawn), but it means **v1 ships a view before an owner**, and that should be a
deliberate founder choice rather than a silent one. See §7 Q-D.

## 2 · THE SIX QUESTIONS

### Q1 · What kinds of goals belong here?

The candidates divide cleanly on one axis — **who can observe progress** — and
that axis, not the noun, is what should be built:

```text
MEASURABLE          a writer-declared target over a mechanically countable
                    quantity. words · sections. Progress is arithmetic over
                    the writer's own material.

INTENTION           a writer's stated aim whose progress only the writer can
                    report. "make the middle less abstract" · "finish the
                    Torus chapter". Progress is a member act, or nothing.
```

**"Finish Chapter 7" is an INTENTION, not a measurable goal.** The system cannot
know a chapter is finished; only the writer can say so. Treating it as
measurable is how a word count becomes a proxy for completion.

A **by-when** may bound either kind. It is not a third kind — and see Q2.

### Q2 · What does "progress" mean for each kind?

```text
MEASURABLE    the current count and the declared target. A figure and its
              denominator. Nothing else.

INTENTION     NO FIGURE EXISTS. It stands open until the writer says
              otherwise. There is no percentage of "less abstract".
```

> **A qualitative intention given a percentage is the exact failure
> `maiaOffering.ts` was written to stop** — a judgement wearing the costume of
> measurement, except here the system would be judging the writer rather than
> the work.

### Q3 · Mechanically observable vs writer-declared

Proposed as a **structural** distinction, not a UI one: an `intention` goal must
have **nowhere to put a number**. The type refuses the shape, the way
`MaiaInsight` refuses a score — because the pressure to render *something* next
to a goal is constant, and a nullable `target` column will eventually be filled.

```text
observable by the system    word count · section count      (already computed —
                            lib/writersStudio/draftWords.ts, manuscript_sections)
declarable only by writer   met · not met · abandoned · restated
```

### Q4 · What may a goal belong to?

**Reuse FR-07 exactly. It needs no new law:**

```text
PRIMARY ANCHOR        manuscript      (always present, so a goal is always
                                       declarable — in every Work-context state)
OPTIONAL LOCAL ANCHOR section         ("finish the Torus chapter")
OPTIONAL CONTEXT      Work            recorded when exactly one Work declares
                                       the manuscript, resolved server-side
```

**Not Work-primary**, for a second reason beyond FR-07's: a Work may hold
several manuscripts, and *words across a Work* has no honest definition. Keeping
the denominator on the manuscript keeps the arithmetic true.

### Q5 · What may MAIA do with a goal?

```text
MAY      read it as context — it is the member's own declaration, exactly as
         workSituation.ts already carries purpose, form and stage
MAY      state the counted figure when the member asks

MAY NOT  create · edit · complete · abandon · restate a goal
MAY NOT  evaluate pace, or characterise progress at all
MAY NOT  raise a goal unprompted
MAY NOT  frame a reading in terms of a goal
         ("the middle drags, and you're behind on words")
```

The last is the subtle one: a goal must not become a **lens**. MAIA reading the
Work differently because the writer is short of a target would make the target
authoritative over the writing — inverting who is serving whom.

**Proposed default: MAIA references a goal only when the member raises it.**
Conservative, and looseners are easy later; the reverse is not.

### Q6 · When the underlying structure changes

**FR-08 generalizes, and should be stated as general rather than re-derived:**

```text
section renamed    the goal follows the section id; the surface prefers the
                   LIVE heading (the goal is about the section, not about the
                   words its heading had that day)

section deleted    the goal DEMOTES to manuscript scope, keeps the last-known
                   heading as history, and is never reattached by matching
```

But a **measurable** goal has a case Notes does not:

> A goal of "3,000 words in the Torus chapter" whose chapter is deleted has
> **lost its denominator.** Silently re-scoping it to the whole manuscript would
> *change what the writer promised themselves* — from a chapter to a book.

**Proposed: a demoted measurable goal becomes UNMEASURABLE and says so**, until
the writer re-anchors or restates it. Not zero, not re-based, not hidden.

## 3 · THE BOUNDARY, MADE EXECUTABLE

The founder's line:

> *"80% of your target word count" is measurement.
> "You're behind" is already interpretation.*

Proposed operational rule, because "don't be judgemental" is not testable:

```text
NO GOAL FIGURE MAY BE A FUNCTION OF THE CLOCK.
```

A by-when may **bound** a goal. It may never **generate a rate**. That single
rule forbids, by construction, the entire family this boundary is about:

```text
FORBIDDEN   pace · words per day required · projected completion date
            "on track" / "behind" / "ahead" · streaks · daily targets
            days remaining rendered against progress
            any comparison of progress to elapsed time

PERMITTED   the count · the target · the fraction
            the date the writer named, shown as a date
```

Because a rate is what turns intention into performance management. A number
compared to *the work* is measurement; the same number compared to *the calendar*
is a verdict about the writer.

## 4 · WHAT v1 WOULD NOT HAVE

streaks · reminders · notifications · history charts · comparisons across Works
· "goals you abandoned" · anything ambient. A goal the writer has not opened
should be silent.

## 5 · CANDIDATE SUBSTRATE (sketch, not authorized)

```sql
CREATE TABLE writer_goals (
  id, member_id, manuscript_id NOT NULL, living_work_id, section_id, anchor_heading,
  kind text CHECK (kind IN ('measurable','intention')),
  -- measurable only; a CHECK forbids a target on an intention, so the shape
  -- itself refuses a number on a qualitative aim
  metric text CHECK (metric IS NULL OR metric IN ('words','sections')),
  target integer CHECK (target IS NULL OR target > 0),
  CHECK ((kind = 'measurable') = (metric IS NOT NULL AND target IS NOT NULL)),
  statement text NOT NULL,        -- the writer's own words, always
  by_when date,                   -- bounds; never generates a rate
  standing text CHECK (standing IN ('open','met','set_aside')),
  created_at, updated_at
);
```

Progress is **never stored** — it is counted at read time from the material the
writer already has. A stored progress figure is a number that can go stale and
then be believed.

## 6 · WHAT NEEDS NO RULING

D-003 and `maiaOffering.ts` already authorize quantifying writer-declared goal
progress. FR-07 and FR-08 already supply anchoring and anchor-loss. **Goals
inherits its constitution; it does not need a new one.**

## 7 · QUESTIONS FOR FOUNDER RULING

```text
Q-A  Two kinds — MEASURABLE and INTENTION — with a number structurally
     impossible on an intention. Accepted?

Q-B  "No goal figure may be a function of the clock." Is this the right
     executable form of the performance-management boundary?

Q-C  A demoted measurable goal becomes UNMEASURABLE rather than re-based to
     the manuscript. Accepted?

Q-D  EXPLORE owns goals and EXPLORE is unbuilt. Does v1 ship as a VIEW in
     WRITE's lower band (where a Goals region already stands empty), with the
     owner deferred to EXPLORE — or does Goals wait for its room?

Q-E  May MAIA raise a goal unprompted? Proposed: NO — only when the member
     raises it.
```

## 8 · STANDING

```text
HARVEST      COMPLETE — Goals is ratified in six places; no new permission needed
DESIGN       this document
QUESTIONS    Q-A … Q-E open
BUILD        NOT AUTHORIZED
DEPLOY       NOT AUTHORIZED
```
