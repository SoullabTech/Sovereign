# WS-DEVELOP — TWO ITEMS HANDED OVER

**From** `WRITERS-STUDIO — CAPABILITY COMPLETION · 01`
**To** the Develop lane. ⛔ **Neither is built here.** This lane found them while
the founder tested a real reading; they belong to the lane that owns the reader.
**Occasion** a whole-work `development` reading of ELEMENTAL_ALCHEMY —
`DEVELOPMENTAL-READER-04`, 262 of 262 sections, **23 observations**.

---

# 1 · DEVELOP-EVIDENCE-INTEGRITY — repair before relying on readings

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

## Repair direction (founder)

**Not another regex if it can be avoided.**

> The model should not freehand evidence identifiers that the structured
> observation does not carry.

So: **render section citations FROM the structured refs**, or at minimum
validate prose identifiers against them before an observation may stand.
Possibly the stronger, symmetric rule:

> Every evidentiary section named in prose must bind to a ref; every ref
> presented as supporting the claim must be intelligibly represented in the
> claim/evidence display.

### Falsifiers it must fail

```text
prose names 165 · refs omit 165            → observation invalid
prose names 36 and 92 · refs 36,71,49,65   → observation invalid
```

⚠️ **Note for whoever writes them:** assert over the exported constant or the
structured object, never over the source file's own bytes — a source scan for a
banned citation pattern matches the test that bans it (the C21 trap, 2026-09-07;
and the same family cost this lane two false readings).

---

# 2 · DEVELOP-PRESENTATION — make many bounded observations compose

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

## The shape the founder proposed

```text
WHAT MAIA NOTICED
The manuscript repeatedly reintroduces ideas, language and figures.

WHERE
19 evidenced recurrences

WHAT MAIA IS NOT CLAIMING
This does not establish that the repetition is unwanted or should be changed.

YOU DECIDE
Which recurrences feel intentional, structural, excessive, or important?
```

Detailed evidence follows that.

## ⛔ THE RESTRAINT ITSELF STAYS

This is **not** licence for MAIA to say *"this repetition is bad and you should
cut it."* The line —

> *the evidence does not establish defect, importance, priority, or that
> anything should change*

— is doing necessary authority work, and the writer assigns importance.

> **The problem is not that MAIA refuses. It is that the refusal is repeated so
> heavily it becomes louder than the perception.**

---

## PRIORITY

```text
DEVELOP-EVIDENCE-INTEGRITY   repair BEFORE relying heavily on readings
DEVELOP-PRESENTATION         turns correct seeing into something usable
```

Neither is built here. Neither is authorized here.
