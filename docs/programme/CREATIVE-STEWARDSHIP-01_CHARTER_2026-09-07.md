# CREATIVE-STEWARDSHIP-01 — research charter

**Status:** PROPOSED · not opened · authorizes nothing
**Drafted:** 2026-09-07

## Mission

Discover what helps a creative person become more alive, absorbed, courageous,
curious and connected to their own work — and how Writer's Studio and MAIA can
steward those states **without taking authorship**.

**The unit of research is the creative moment, not the feature.**

## The two rules above the flow

> **Do not ask what feature a creative person needs. First ask what is happening
> in the creative person.**

> **The aim is not to increase engagement with Writer's Studio. The aim is to
> deepen engagement with the work.**

The second is constitutional, not stylistic. It is the sovereignty invariant —
*does this reduce the system's psychological centrality over time?* — stated for
a creative product. A finding that increases time-in-app and decreases contact
with the work is a **failed** finding, however good the metric looks.

## Anti-paperwork clause

This lane is deliberately lighter than the engineering acceptance lanes.
**Three living artifacts, no more:**

```text
1  THIS CHARTER              question · invariants · method
2  CREATIVE MOMENT LEDGER    raw observations, attributable
3  STEWARDSHIP PRINCIPLES    hypotheses → experiments → surviving rulings
```

No document per finding until a finding becomes an engineering lane. If the
research starts generating more records than moments, it has failed.

## The loop

```text
CREATE → NOTICE → UNDERSTAND → HYPOTHESIZE → TRY → OBSERVE → KEEP/DISCARD → BUILD
```

### Stage gates

```text
1 DISCOVER    existing research on creativity support, flow, incubation,
              autonomy, co-creativity, blocks, ritual, when help interferes
   GATE       does it materially change a design hypothesis? if not, STOP READING

2 EXPERIENCE  real creative work. Do NOT ask anyone to "test Writer's Studio."
              Ask them to write. Record only CHARGED moments.
   GATE       did something materially affect the creator's relationship to the
              work? if no, it is not evidence

3 PATTERN     group MOMENTS, not people. distinguish
              OBSERVED · HYPOTHESIS · PRINCIPLE
   GATE       never promote a nice idea straight to doctrine

4 PROTOTYPE   one pattern, smallest possible intervention
   GATE       does it improve the experience WITHOUT reducing authorship,
              truthfulness or control? if not, discard

5 CONSTITUTE  only repeated surviving evidence becomes a principle

6 BUILD       emit a bounded engineering card, never a redesign
```

## MAIA learns *with* the writer · Jarvis learns *from* the cohort

Neither may silently turn creative behaviour into training data.

**MAIA — inside the relationship.** May adjust posture to the writer's situation:
recede when they are moving, protect ambiguity when they are uncertain, offer a
small opening when stuck, restore the thread on return.

She may **not** declare an inner state. Not *"you are frustrated"* but *"it
sounds like something here may be getting in the way — is that right?"*

**Jarvis — backstage.** Never present in a creative session. Asks *what
repeatedly helps writers stay connected to their work*, never *what increases
time in app*.

### ⚠ The line that must be drawn before any build

```text
"When I'm drafting, don't suggest edits"   member-DECLARED   governs MAIA
"immersed → recede"                        system-INFERRED   models the writer
```

Both may exist. **They may not share a code path or a vocabulary**, or the
second will quietly become the first. This project already treats
system-inferred developmental state as held (Cat 1) — `living_field_affinities`
was barred under FR-06 on exactly these grounds, because it was
`created_by='system'` inference about a person.

A declared preference is the writer governing the room. An inferred state is the
room modelling the writer. Only the first is safe by default.

## Evidence classes — kept distinguishable

```text
1  WRITER TESTIMONY      highest value · never re-phrased into clinical language
                         when the writer's own words exist
2  OBSERVABLE EVENTS     facts: entered, wrote 37 min, kept a version, returned
                         NOT a fact: "entered flow for 37 minutes" — interpretation
3  CREATIVE-STATE MARKS  writer-chosen, after the work, never a popup mid-session
4  INTERVENTION OUTCOME  did it deepen · restore movement · clarify without
                         deciding · interrupt · overtake · flatten ambiguity ·
                         leave authorship intact
```

### SYSTEM ACT is evidence, not recollection

The Studio already emits what it did — `[MAIA/press]` markers, `selectionTrace`,
develop-room phase transitions, refusal codes. Pair the felt report with the
system's own record **at that timestamp**.

*"MAIA interrupted me"* and *"a refusal rendered because the commission was
stale"* can be the same moment from two sides, and only one is checkable.
Without this the SYSTEM ACT column is the writer guessing at machinery.

### The ladder

```text
SIGNAL → REPEATED OBSERVATION → PATTERN → DESIGN HYPOTHESIS
       → EXPERIMENT → SURVIVING PRINCIPLE → BUILD
```

Demonstrated to work in this repo: a "40–100 false sections" estimate became
four, and a "hole in doctrine" became a narrow ruling — both because
characterization ran before repair.

## Consent — a precedent, not a new architecture

**Default: manuscript prose does not enter research.** Jarvis can learn from
state transitions, action events, timing, explicit feedback, writer-chosen
markers, intervention type and session outcome. Passages enter only on a
specific member act.

That promise has two live implementations to copy:

```text
member_daily_anchors.surface_preference   default private; member opts in
atoms return_preference                   same model
Sanctuary Mode                            the absolute-boundary case
```

And the ruling that made the first work: **eligibility originates from a member
act, not a deploy flag** — the env var was demoted to a kill-switch. Research
consent inherits that shape.

## Cohort protocol

**Arrival** — *"Use Writer's Studio for real work. We're interested in what
supports or interferes with your creative process, not whether you can test
every feature."* Give explicit permission **not** to explore features.

**During** — no surveys, no "how are we doing", no gamification, no Jarvis. MAIA
behaves normally. At most an unobtrusive **Mark this moment** gesture — a member
act, never a scoring surface.

**End of session** — 60–90 seconds, not a battery:

```text
How did the work feel today?
What helped?
What got between you and the work?
A moment when MAIA was especially helpful, or especially unhelpful?
Do you want to return to this work here?
```

### ⚠ Observer caveat

Founder sessions are the right place to **find** charged moments — nobody else
will notice as much. But an architect cannot un-know the architecture, and the
questions this lane most needs (*Where am I? What is this? Why is that grey?*)
are exactly the ones they cannot experience.

**Founder evidence may not promote an orientation or confusion finding past
HYPOTHESIS.** Mark every observation with who produced it — the same operator
attribution discipline the witness lanes use.

## Small cohort, honest claims

5–12 writers is deep qualitative research, not statistics. **Never** *"83% of
writers prefer X."* The gold is repeated moments and contrasts:

> Four writers became confused returning to a long manuscript. Three
> independently described unsolicited suggestions as breaking concentration. One
> preferred proactive support while revising but not while drafting.

## Candidate laws — CANDIDATE, not doctrine

```text
IMMERSION      when the writer is moving, the Studio recedes
UNCERTAINTY    creative ambiguity is not an error state
AUTHORSHIP     MAIA never solves merely because she can
RETURN         re-entry restores the living thread, not application state
ENCHANTMENT    the Studio makes the work more present, not the software
               more impressive
```

None is a principle until evidence earns it.

## The north-star question

Every synthesis ends here:

> **Did Writer's Studio deepen the writer's relationship with their own creative
> intelligence?**

Then: did they feel more the author or less · did they stay closer to the work ·
did uncertainty remain generative · did MAIA know when to enter and when to
disappear · did the environment support immersion · was returning easy · did
something become newly visible · did they leave with more creative energy than
they arrived with?

## First engagement

`WS2-08B` is the natural first subject — it already has a question this lane can
give an experiential standard to:

```text
Does the hierarchy make my book recognizable to me?
Can I see the whole without being overwhelmed by the parts?
Can I move whole → chapter → passage naturally?
Does the Studio preserve the structure I intended?
Can I correct it when the machine guessed wrong?
Does organization support immersion, or turn my manuscript into data?
```

> A writer should encounter their manuscript as a coherent work, not as a
> database's flat inventory of addressable fragments.

## What this charter does not do

Opens no lane. Recruits no cohort. Authorizes no instrumentation, no consent
surface, no MAIA posture change, and no build. Every stage begins with a founder
act.
