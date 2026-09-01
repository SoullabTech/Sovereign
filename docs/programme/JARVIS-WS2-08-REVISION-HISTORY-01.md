# JARVIS-WS2-08-REVISION-HISTORY-01

> **Lane opened. Not authorized. Not started.**
>
> This document exists so the lane is defined before it is entered. It authorizes **no code, no
> schema, no route, no migration, no census**. Entering FIND requires the trigger below to be
> satisfied on canonical — not asserted in a session.

```text
LANE            JARVIS-WS2-08-REVISION-HISTORY-01
STATE           OPENED · BLOCKED ON TRIGGER
TRIGGER         Stage 7 developmental intelligence merged, witnessed, and closed
AUTHORIZES      nothing yet — FIND opens when the trigger is satisfied
ROADMAP STATUS  direction, not implementation authority
PRIOR LANE      docs/programme/JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01.md
NORMATIVE       docs/programme/WRITERS_STUDIO_MASTER_BRIEF.md
LIVE STATE      docs/programme/WRITERS_STUDIO_PROGRAMME_BOARD.md
ROADMAP         docs/programme/WRITERS_STUDIO_ROADMAP_STAGE_6_TO_15.md
OPENED          2026-09-01
```

**This document is a lane opening. It is not a spec, not a census, and not a schema.**
It authorizes no code, no migration, no table, no route, no test, and no census.
It exists so the direction is recorded before it is needed, and so that the first
person who reaches this lane does not begin by inventing version control.

---

## Jarvis header

> Do not begin Stage 8 by building version control. Begin by discovering what the
> Writer's Studio already means when the Work changes.
>
> Use **FIND → UNDERSTAND → DECIDE → BUILD → PROVE → DONE**.
>
> Finding a defect during the census does not authorize its repair.
>
> A save is not necessarily a revision. A fingerprint is not necessarily a version.
> A suggestion is not authorship. A restore must never erase history.
>
> **The history of the Work must remain as sovereign as the Work itself.**

---

## Mission

Build the system by which a writer can change a Work without losing the history of
what the Work was, why it changed, or who made the change.

The governing idea:

> **Revision should deepen authorship, not erase provenance.**

Stage 7 gives MAIA the ability to perceive and discuss development. Stage 8 answers
the next question: **what happens when the author actually begins changing the
manuscript in response?**

---

## Stage relationship

```text
6A   AuthorStructureCommand
 ↓
7    Developmental Intelligence
 ↓
8    Revision & History
```

### State of the chain

Founder-stated, 2026-09-01. **Recorded here, not written into the Programme Board** — the
board sets node states from canonical evidence only, and these have not been censused.

```text
6A   BUILT LOCALLY · awaiting authenticated walk + merge
 ↓
7    OPENED · BLOCKED ON 6A MERGE
 ↓
8    OPENED · BLOCKED ON STAGE 7 CLOSURE
```

### Why this lane is blocked

The trigger is Stage 7 closure — merged, witnessed, and closed.

**Stage 7 is already opened**, as `JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01` in
`docs/programme/`. It carries `STATE OPENED · BLOCKED ON TRIGGER`, with its own trigger
being *Stage 6A AuthorStructureCommand merged to canonical and witnessed*, and it records
the checkpoint state `Stage 7 OPENED · BLOCKED ON 6A MERGE`.

At the time of this correction that lane document has not yet reached canonical: it is
reachable at `ccf04f1ca` on `origin/claude/stage-7-developmental-intelligence-coebvj`, and
`origin/clean-main-no-secrets` does not carry the path. That is a statement about where the
document currently sits, not about whether the lane is open. **The lane is open.** Stage 7's
own rule — that a trigger is satisfied on canonical rather than asserted in a session —
applies to Stage 7's entry into FIND, and it applies identically here.

So Stage 8 waits on a lane that is itself waiting: 6A must merge and be witnessed before
Stage 7 may enter FIND, and Stage 7 must close before Stage 8 may enter 08A. Nothing in
this document changes that, and reading it is not an event that partially lifts it.

### Planning authority is not execution authority

These are separate, and the separation is the thing lane documents exist to protect.

```text
planning record may exist on canonical
        ↓
trigger not yet satisfied
        ↓
NO FIND / NO BUILD

6A merged + witnessed
        ↓
Stage 7 trigger satisfied
        ↓
FIND begins
```

A lane opening reaches canonical when the programme deliberately accepts it as a
programme record — **not** as a consequence of some other stage merging. 6A merging
satisfies Stage 7's *execution* trigger; it says nothing about when either planning
document should land. Conversely, a lane opening sitting on canonical grants no warrant
to begin the lane.

The Canvas Structure contract (`docs/design/contracts/writer-canvas-structure.md`) remains
the ratified constraint standing over the seam 6A will open: no reachable path writes
`manuscript_structure_units` today, and that must keep holding "when Stage 6 gives the
author a command that can."

---

## 08A — FIND: revision census

Jarvis starts read-only. **Do not begin with Git-like versioning architecture,
snapshots, CRDTs, diffs, or "undo history."** First discover what exists.

### Census targets

```text
manuscript persistence        revision/version tables
draft sections                snapshots
source sections               restore code
working draft                 comparison utilities
history drawer                content hashes/fingerprints
autosave                      Ask MAIA thread state
save boundaries               proposal provenance
timestamps                    structure revision state
import provenance             editor undo/redo
conflict/reconnect behavior   multi-tab behavior
```

### Classification vocabulary

Every mechanism found is classified as exactly one of:

```text
EXISTS · PARTIAL · LEGACY · DUPLICATE · EPHEMERAL
PERSISTED · AUTHORITATIVE · NOT AUTHORITATIVE · MISSING · DO NOT REUSE
```

### Questions FIND must answer

- What is currently persisted when prose changes?
- Is there any recoverable historical text?
- Does autosave overwrite the previous state?
- What exactly does the History drawer currently represent?
- Are histories manuscript-wide or section-local?
- Are changes attributable to member / MAIA / import / system?
- Is there an existing revision identifier?
- Are fingerprints being used as versions when they are only change detectors?
- What happens if two tabs edit the same Work?
- What happens after reconnect?
- Can any existing "restore" path destroy newer work?
- What provenance already survives a rewrite?

### Stop rule

**Discovering a revision defect does not authorize repairing it.** The census
records the defect and stops. Repair is a separate authorized act.

---

## 08B — UNDERSTAND: the ontology of change

Before implementing history, separate things that are easy to collapse.

```text
WORK STATE  →  EDIT  →  REVISION EVENT  →  REVISION STATE  →  HISTORY
```

These are not synonyms. A keystroke is not necessarily a revision. An autosave is not
necessarily a revision. A database row update is not necessarily an authorially
meaningful revision. **A hash is not a version identity.**

Jarvis must determine the existing semantics before choosing new ones.

### Four kinds of change

1. **Ordinary writing** — the writer types *"She walked home."* then changes it to
   *"She returned home before dawn."* This may be continuous composition, not a named
   revision event.
2. **Deliberate revision** — the author intentionally revises a passage, chapter, or
   larger movement. This may deserve a durable boundary.
3. **Structural change** — a chapter moves, sections merge, structure changes. This is
   history too, but it is not identical to prose revision.
4. **MAIA-assisted change** — MAIA may have helped generate a possibility, but the
   author decides whether anything enters the Work.

### Constitutional boundary

Stage 8 inherits the sovereignty doctrine directly:

> A developmental insight is not a revision. A generated possibility is not a revision.
> **Only a change to the authored Work becomes revision history.**

And:

> **History must record what actually happened, not infer authorship from textual
> similarity.**

The second sentence is load-bearing. Provenance must never collapse
`MAIA suggested → member considered → member authored change` into
`MAIA changed the manuscript`. If MAIA suggested *"The house had gone quiet."* and the
member later wrote *"By midnight the entire house was silent."*, the system must not
manufacture a provenance claim that MAIA wrote that sentence because the two resemble
one another.

---

## 08C — DECIDE: the minimal revision object

**Do not freeze this schema before FIND.** Stage 8 should expect to need concepts
equivalent to the following — these are conceptual placeholders, **not schema
authorization**:

```ts
RevisionIdentity
RevisionScope
RevisionActor
RevisionReason
RevisionParent
RevisionTimestamp
RevisionProvenance
```

The census determines whether the canonical unit is a snapshot, an event, a patch, a
section revision, a manuscript revision, a checkpoint, or some hybrid.

**Rule.** Do not let "revision" become synonymous with every autosave. That produces
technically exhaustive history and humanly useless history.

---

## 08D — HISTORY

The writer should eventually be able to answer:

```text
What did this chapter look like yesterday?
What changed?  When?
What did I deliberately revise?
What came from an imported source?
What structure did the Work have then?
Was MAIA involved?
Can I see the previous version?
Can I recover it?
```

History should feel like **memory of the Work**, not database telemetry.

---

## 08E — COMPARE

Eventually, `VERSION A ↕ VERSION B` at several useful scales:

```text
passage · section · chapter · whole Work · structure
```

Jarvis must discover what comparison infrastructure exists before choosing diff
semantics. A textual diff may be appropriate for prose and terrible for structural
history. **Do not presume one comparison mechanism fits both.**

---

## 08F — RESTORE

This is the sharp Stage 8 boundary. A restore is **not** `DELETE CURRENT; COPY OLD OVER IT`.

> **Restoring a prior state must itself create history; it must never erase the states
> that came after it.**

```text
A → B → C   ·   restore A   ·   must become   A → B → C → A'
```

not:

```text
A            (where B and C mysteriously disappear)
```

A restored state is a **new authored present derived from an earlier state**, not time
travel.

---

## 08G — MAIA + REVISION

Only after revision history itself is trustworthy should MAIA gain revision-oriented
capabilities. Potential future gestures:

```text
Show me what changed in this chapter
Why did we revise this section?
What unresolved developmental issues remain?
Compare this version with the earlier one
Where did this motif strengthen or disappear?
```

And eventually: *Help me revise this passage.*

That last gesture approaches another sovereignty threshold. **MAIA may generate
revision possibilities. She must not silently choose and install one.**

---

## 08H — DEVELOPMENTAL REVISION BRIDGE

Where Stage 7 developmental intelligence meets Stage 8 authored change:

```text
Developmental observation
        ↓
member judgment
        ↓
revision intention
        ↓
member authors change
        ↓
revision history
```

The system should preserve those relationships **without pretending causation it cannot
establish.** These facts may coexist:

```text
developmental reading R7
member marks observation O3 useful
member later revises section S12
```

They do not establish *"O3 caused revision S12"* — unless the author explicitly
connects them.

### Declaration, not timing

Provenance is established by an **explicit author declaration**, not by when that
declaration occurs. All three of these are legitimate:

```text
before revision   "I'm revising this because of O3"
during revision   "This change responds to O3"
after revision    "Link this revision to O3"
```

Each is the author making the relationship explicit. None is weaker than the others.

What is forbidden is the system supplying the relationship itself:

```text
revision text ≈ MAIA suggestion
        ↓
system infers
"This came from O3"
```

**That is the sovereignty boundary.** Similarity is evidence of resemblance, not of
provenance. Temporal proximity is not provenance either — a revision that follows an
observation by ten minutes has not thereby been caused by it.

### The upstream dependency on Stage 7

Because declaration may come after the revision, what must exist beforehand is not the
declaration but the **thing it refers to**. A later authored act can only point back at
an observation that still has an identity to point at.

```text
DevelopmentalReading R7
    └── Observation O3
            ↓
      explicit author declaration
            ↓
Revision / revision intention
```

This makes one demand on Stage 7, and it is not a demand for revision history:

> **A developmental observation must have durable identity sufficient for a later explicit
> author act to refer back to it. The system may record that declared relationship, but
> must never infer it from textual similarity or temporal proximity.**

That sentence does not prescribe any Stage 8 schema. It prevents `07C`/`07D` from choosing
an object model in which observations are disposable UI objects whose identity vanishes
when the page closes — a choice that would make truthful provenance impossible later, with
no repair available at Stage 8.

Stage 7 should therefore expect to need durable identity for at least:

```text
reading identity
observation identity
evidence identity
```

**Status of that sentence here:** it is recorded in this lane as a declared upstream
dependency. It is authoritative for Stage 7 only once it is frozen into
`JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01` itself. This document cannot bind that lane
from outside it.

---

## First Stage 8 witness

A real manuscript and a meaningful revision.

```text
initial Work state A
       ↓ member changes real prose
state B persists
       ↓
A remains recoverable
       ↓ compare A ↔ B
restore A
       ↓
new state C matches A's content
       ↓
B still exists
       ↓
history says restore occurred
       ↓
authorship/provenance remain truthful
```

### Falsifiers

```text
autosave destroys only recoverable prior state            FAIL
restore deletes later history                             FAIL
MAIA suggestion is recorded as authored prose             FAIL
member-written revision is attributed to MAIA             FAIL
history claims causation it cannot establish              FAIL
two revisions become indistinguishable                    FAIL
comparison uses wrong manuscript/section version          FAIL
reconnect silently overwrites newer authored work         FAIL
structure history and prose history contradict            FAIL
```

---

## DONE for Stage 8.1

Do not require the whole vision. **Stage 8.1 closes when:**

> A writer can make a meaningful change to a real Work, recover the prior state,
> understand what changed, and restore an earlier state without destroying any later
> history or confusing authorship.

That alone is a major threshold.

---

## Suggested Stage 8 sequence

```text
08A  REVISION CENSUS      What persistence/history machinery really exists?
08B  REVISION ONTOLOGY    What counts as a Work state, change, revision, checkpoint?
08C  REVISION IDENTITY    Establish durable revision identity and provenance.
08D  HISTORY              Expose meaningful history to the author.
08E  COMPARE              Compare authored states truthfully.
08F  RESTORE              Restore without destroying subsequent history.
08G  CROSS-SCALE HISTORY  Passage ↔ section ↔ chapter ↔ structure ↔ whole Work.
08H  DEVELOPMENTAL BRIDGE Connect Stage 7 insight to Stage 8 revision without
                          inventing causation.
```

---

## What this lane does not do

- It does not authorize `08A`. The census begins only after the trigger is met.
- It does not name tables, columns, migrations, routes, or components.
- It does not classify any existing mechanism. Every classification above is a
  vocabulary, not a finding.
- It does not assert that any revision defect exists in the Studio today. No such
  inspection was performed.
- It does not lift, weaken, or reinterpret the Canvas Structure contract's prohibition
  on non-authored structural change.
- It does not bind Stage 7. The durable-identity constraint in 08H is recorded here as a
  declared dependency; it governs `07C`/`07D` only once frozen into the Stage 7 lane.

The next legitimate act in this lane is the closure of Stage 7 — which itself waits on
6A merging to canonical and being witnessed. Not a line of code here.
