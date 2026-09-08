# WS-DEVELOP — TWO ITEMS HANDED OVER

**From** `WRITERS-STUDIO — CAPABILITY COMPLETION · 01`
**To** the Develop lane. ⛔ **Neither is built here.** This lane found them while
the founder tested a real reading; they belong to the lane that owns the reader.
**Occasion** a whole-work `development` reading of ELEMENTAL_ALCHEMY —
`DEVELOPMENTAL-READER-04`, 262 of 262 sections, **23 observations**.

---

# 0 · THE SEQUENCE — founder ruling, 2026-09-08

> ### Two sequential Develop acts, not one redesign. Integrity first, composition second.
>
> **If we mix them, a prettier reading could hide evidence defects.**

```text
DEVELOP REPAIR 01     Evidence-binding integrity
STOP                  prove every evidentiary claim binds to structured refs

DEVELOP REPAIR 02     Reading composition
                        whole-reading lead
                        manuscript-order default
                        evidence-derived grouping
                        constitutional language collapsed but preserved
                        detailed observations underneath
STOP                  founder witness

LATER                 large-work hierarchical reading architecture
```

⛔ **The perception ceiling is NOT touched by either act.** The long-manuscript
architecture is related and separate:

> Otherwise we will end up changing how MAIA reads the manuscript while
> simultaneously changing how we judge what she read. **Bad experimental
> design.**

---

# 1 · DEVELOP REPAIR 01 · EVIDENCE-BINDING INTEGRITY — first, non-negotiable

> ### Prose may not name evidence that its structured refs do not bind.

## The gap, structurally

```text
GUARANTEED TODAY        refs are valid
NOT GUARANTEED          everything the prose claims to rest on is in refs
```

**These are not equivalent, and the second is not merely unchecked — it is
uncheckable by the current design.** `bindEvidence(refs, evidence)` receives the
refs and nothing else; a claim's `text` never reaches the binder. So an
observation can bind every ref it carries while its sentences cite sections
those refs do not contain, and the system will call the reading sound.

## Two witnessed instances

Read from the rendered reading (not from stored rows — a fresh read of `refs`
should confirm before repair):

```text
o23   prose  "Section 165 states …", treating 165 as the first instance
      refs   187, 217
      →      165 named, unbound. A member checking the observation goes to
             165 and finds it is not cited.

o15   prose  "Sections 36 and 92 sustain a register …"
      refs   36, 71, 49, 65
      →      92 named but unbound; 71 bound but unnamed. Both directions
             broken in one observation.
```

## Why this has teeth

The whole contract of a developmental reading is *each observation resting on
named parts of the work.* An observation whose prose names parts its evidence
does not bind is **unauditable in the one way the design exists to make
auditable** — and it fails silently, looking exactly like a sound reading.

## The goal

> **An observation must never be able to say it rests on a section that its
> structured evidence does not bind.**

## The architecture

```text
MODEL PRODUCES     observation prose
                   + structured refs[]

VALIDATOR CHECKS   every section/evidence identifier named in prose
                   must exist in refs[]

RENDERER           renders citations / "rests on" from refs[]
                   NOT from model-written citation prose
```

### And further, where possible: stop the model freehanding citations at all

```text
INSTEAD OF   "Sections 36 and 92 sustain this register…"

THE MODEL    claim: "This register recurs across these passages."
PRODUCES     refs:  [36, 92]

THE UI       Rests on: §36 · §92
RENDERS
```

> **That makes the structured evidence the authority.**

## Hard falsifiers

Pin the exact failures found:

```text
prose says 165 · refs = [187, 217]           → REJECT
prose says 36, 92 · refs = [36, 71, 49, 65]  → REJECT
```

And also:

```text
invalid ref
missing ref
duplicate / ambiguous ref
ref whose source digest no longer matches the frozen reading subject
                                             → observation cannot stand
```

> ### No silent repair by MAIA. If evidence binding fails, the observation is invalid.

⚠️ **Note for whoever writes them:** assert over the exported constant or the
structured object, never over the source file's own bytes — a source scan for a
banned citation pattern matches the test that bans it (the C21 trap, 2026-09-07;
and the same family cost this lane two false readings).

---

# 2 · DEVELOP REPAIR 02 · READING COMPOSITION — only after integrity

> ### MAIA should make the pattern easier to see than the twenty-three individual findings are to read.

## What the reading actually contains

**19 of 23 observations are `recurrence`.** That is not nineteen unrelated
ideas — it is **one finding stated nineteen ways**: the manuscript restates
itself at every scale, from identical opening sentences (o18: sections 116 and
118) to whole figures retold with new origin stories (o13: the crystal at 18, 32
and 34).

**The thinking is coherent. The form obscures it.**

## Three changes

**Order by the book by default.** The reading currently jumps
99 → 73 → 74 → 7 → 31 → 116 → 21 → 45 → 38 → 202 → 227 → 18 → 56 → 36 → 17 →
136 → 200 → 112 → 157 → 165. *A writer should be able to walk the book while
reading the evidence.*

**Stop repeating the constitutional limitation at full length.** The
"Does not establish" block appears near-identically 23 times and is the majority
of the reading by volume. ⛔ **Do not weaken it.** If the law requires it
attributable to every observation, use a compact per-observation marker or
expander instead of twenty-three full repetitions.

**Give `recurrence` internal shape ONLY if the evidence supports real
distinctions.** ⛔ *Do not split the taxonomy because 83% in one category looks
ugly.* But there may be genuinely different phenomena inside it — near-verbatim
repetition · re-explanation · structural return · repeated figure · repeated
origin story. **That is a small Develop inquiry, not arbitrary relabeling.**

## Three levels

**Level 1 — the whole.** Lead with the dominant pattern, then something factual:

```text
The manuscript repeatedly returns to and re-explains its central material
across multiple scales.

19 of 23 observations concern recurrence.
```

⛔ Not *"this is too repetitive."* ⛔ Not *"you should cut it."*
**Just the shape MAIA actually observed.**

**Level 2 — pattern families, IF the evidence supports them.** Inspect the 19
and ask whether real sub-patterns emerge. Possible, **not pre-approved**:
near-verbatim repetition · repeated explanatory passages · concepts
reintroduced with different framing · figures recurring · origin stories
retold · structural returns across distant sections.

> **The taxonomy remains the underlying evidence class. The grouping is a
> reading aid.** No new badges. No reclassification to make a chart prettier.

**Level 3 — the book's own shape, as the default view.**

```text
PART ONE      §7 · §17 · §18 · §21 …
PART TWO      §73 · §74 …
```

Optionally `By manuscript | By pattern` — but **manuscript order is the
default, because the writer is trying to understand a book, not an observation
database.**

## Collapsing the constitutional repetition without weakening it

The shared authority boundary, stated **once** near the top:

```text
WHAT THIS READING MEANS
MAIA is showing recurring patterns she can evidence in the manuscript. These
observations do not establish that a pattern is a defect, important, unwanted,
or something you should change.
```

Then each observation carries something compact —
`Observation only · you determine its importance` — with an expander if the
complete constitutional language must remain locally inspectable.

> **The law stays attributable to every observation without consuming most of
> the page.**

## Giving the writer a way to work with it

Per observation, the existing standing model: `Keep · Dismiss · Unresolved`.

At the **pattern** level, eventually and only if it fits that model:
`Intentional · Worth looking at · Not important to me · Unsure`.
⛔ **Not built automatically.**

> ### MAIA detects recurrence. The writer decides whether it is motif, rhythm, redundancy, pedagogy, style, or problem.

## ACCEPTANCE QUESTION

> **Can I understand what MAIA saw in my book within thirty seconds, then
> inspect exactly where she saw it — without surrendering the judgement of what
> it means?**

## ⛔ THE RESTRAINT ITSELF STAYS

This is **not** licence for MAIA to say *"this repetition is bad and you should
cut it."* The line —

> *the evidence does not establish defect, importance, priority, or that
> anything should change*

— is doing necessary authority work, and the writer assigns importance.

> **The problem is not that MAIA refuses. It is that the refusal is repeated so
> heavily it becomes louder than the perception.**

---

## STANDING

```text
DEVELOP REPAIR 01   evidence-binding integrity   FIRST · non-negotiable
STOP                founder proof
DEVELOP REPAIR 02   reading composition          AFTER integrity
STOP                founder witness
LATER               whole-work chunk / synthesis · separate R&D act

PERCEPTION CEILING  untouched by both acts
```

**Neither is built here. Neither is authorized here.** This lane found them and
hands them over.
