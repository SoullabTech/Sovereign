# MAIA Developmental Editor — capability and acceptance fixture

> **Design, not build.** The freeze blocks implementation, not specification. This defines the
> capability and pins an executable acceptance fixture so the eventual unit is small and testable.
> It authorizes no code.

## What it is

A first-class MAIA mode that **reads the Work deeply, identifies developmental problems, brings
them to the writer with evidence, explores possibilities together, and changes the manuscript only
through writer decisions.**

Not *"rewrite this chapter."* The distinguishing behaviour is that it **shows the evidence before
proposing anything**, and that its proposals are options rather than a replacement draft.

It is the first member-facing instrument of the programme invariant (master brief §A1.3):

```text
SOURCE → MAIA MAY NOTICE → WRITER MAY RECOGNIZE → WRITER MAY DECIDE → WORK MAY CHANGE
```

Every arrow may stop.

## The lenses

Seven, not forty commands.

| Lens | Asks |
|---|---|
| **Structure** | Does this belong here? Does the sequence work? What is missing? What repeats? |
| **Development** | Which ideas are underdeveloped · sufficiently developed · overexplained · introduced too late · **abandoned** · repeated without advancing? |
| **Continuity** | Prospective language where *later* has already happened. Requires chronology across the Work, not phrase search. |
| **Arc** | What journey does this chapter take the reader through, and what journey has the whole book taken? |
| **Voice** | Where does this depart from the established voice *of this Work* — the manuscript itself is the reference, never an external standard. |
| **Coherence** | Internally consistent? Has a term changed meaning? Does this contradict an earlier chapter? |
| **Reader** | What does the reader already know here? Where might they lose orientation? |

## The passage workflow

For each flagged passage the editor shows: the original · why it was flagged · what developmental
function it currently serves · what function the chapter now needs. Then:

```text
[ Keep ]  [ Reframe ]  [ Move ]  [ Cut ]  [ Develop ]  [ Discuss with MAIA ]
```

⛔ **Rewrite is not among them and is never the default.** *Reframe* works from the writer's
existing language and asks how much intervention they want.

## Whole-Work awareness is the requirement, not a nicety

This is what makes it different from pasting text into an LLM. It must know where the passage
sits, what came before, what comes after, what has already been explained, what the chapter is
doing structurally, and what the whole book is doing — so it can distinguish **necessary synthesis
from redundant reintroduction.**

> **Dependency — corrected 2026-08-24.** An earlier version of this file said the Developmental
> Editor is downstream of the structure unit and "cannot be first in order." **That is wrong, and
> only true of some lenses.** Work Structure is a prerequisite for the *structure-aware* lenses —
> Continuity, structural gaps, sequencing, early/late introduction, section arc, "what has the
> reader already encountered?" It is **not** a prerequisite for the capability itself. Discover,
> Gather and Shape all operate before any structure exists, and that is where most writers actually
> begin.

---

# Acceptance fixture — Chapter 10

**Fixture**: `docs/book-studio/ELEMENTAL_ALCHEMY_MANUSCRIPT.md`, Chapter 10, lines **3492–3817**
(325 lines). Position: final chapter, after Chapters 5–9 = Fire · Water · Earth · Air · Aether.

Give it the untouched chapter. Pre-registered expected findings, each line-addressable so a miss
is a fail rather than a matter of taste:

| # | Finding | Evidence |
|---|---|---|
| **1** | **Prospective stance in a terminal chapter** | `L3519` — *"We will follow her along her developmental path."* The reader has already completed all five elements |
| **2** | **Reintroduction of developed material** | `L3513` *Part 1: Introduction to the Spiralogic Process* · `L3523` *Part 2: Understanding the Elements of Soul-Building* · `L3532` *Section 2: The Elements of the Spiralogic Process* — an introduction, in the last chapter |
| **3** | **Inverted teaching relationship** | The system is named and explained **first** (`L3513`–`L3536`); Maya arrives fourth, at `L3517`, as illustration of an already-stated method |
| **4** | **Abandoned thread — the promise is not kept** | Maya is introduced at `L3517` with a promise to follow her, then absent for ~80 lines of taxonomy, returns only as a worked example inside four element subsections (`L3601·3603·3614·3616·3627·3629·3640·3642`), and **disappears entirely for the final 145 lines** (`L3663`–`L3807`). 11 mentions across 325 lines |
| **5** | **Function conflict** | 12 Parts and 22 Sections — the chapter alternates between *introducing* Spiralogic and *synthesizing* it, and shifts into method/practice material (Parts 5–12) immediately before the Conclusion at `L3817` |

## The failure tests

**Fails if** it misses findings 1–4. Finding 5 is the harder one and is the quality bar.

**Fails differently — and worse — if its first move is an improved Chapter 10.** Producing a better
draft instead of bringing discoveries to the writer is a failure of the product philosophy, not a
quality shortfall. Both failure modes must be controls that can actually fail.

## A referent problem the fixture exposes

Three Chapter 10s exist in the repository and they disagree:

| draft | Ch10 lines | Maya |
|---|---|---|
| `ELEMENTAL_ALCHEMY_MANUSCRIPT` | 325 | 11 |
| `ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL` | 392 | 67 |
| `ELEMENTAL_ALCHEMY_REBUILT_COMPLETE_DRAFT` | 144 | **0** |

The rebuilt draft has already repaired the defect by a different route — Maya removed entirely,
replaced by the author's own turning point, with the thesis stated plainly and no prospective
language. A fourth Chapter 10 (`book-print-kdp-final`, 216 sections) is what is actually in
production.

**Developmental editing without a settled referent is the same class of error as calling an
interpretation a source.** Which draft is the Work is a founder decision, and the fixture above
names `ELEMENTAL_ALCHEMY_MANUSCRIPT` only because that is where the defect is richest — not
because it is the Work.

---

# It must be able to help a Work come into form

The Developmental Editor is **developmental intelligence across the whole life of a Work**, not an
instrument that arrives once a manuscript exists. Most writing does not begin with a manuscript.

## Four starting conditions

**1 · Seed** — *"I think I want to write something about grief as initiation."* Explore what is
alive in it, the questions underneath, what the writer already knows, what feels unresolved,
possible forms, related material, tensions. ⛔ It does **not** generate an outline and declare that
to be the Work.

```text
IDEA → conversation → possible threads → writer recognition → emerging Work
```

**2 · Scraps** — six paragraphs, three voice notes, a quote, half an introduction, a journal entry,
one scene, a title, an image, a question. *"I see three different currents here."* · *"These two
appear to be circling the same question from different directions."* **The writer decides whether
the relationship is real.**

**3 · Material field** — hundreds of notes, transcripts, research, with no settled structure.
Clustering · recurring themes · contradictions · gaps · possible relationships · source distinction
· emerging questions · possible shapes. And the invariant at this layer:

```text
MAIA detects cluster   ≠   a chapter exists
```

**A cluster can remain a cluster.**

**4 · Existing manuscript** — only here do the structure-aware lenses apply: continuity, arc,
repetition, abandoned threads, temporal positioning, reader knowledge, protagonist subordination,
whole-Work coherence.

## Four stances, freely traversed

| Stance | When | Asks |
|---|---|---|
| **Discover** | the Work barely exists | What is here? |
| **Gather** | material exists but is scattered | What belongs in the field around this Work? |
| **Shape** | patterns and possible forms appear | What might this be becoming? |
| **Develop** | there is enough form to examine | What is working · missing · underdeveloped · misplaced · repetitive · contradictory? |
| **Revise** | the writer is changing an established draft | *(later)* |

⛔ Not workflow stages. A writer moves backward and forward among them.

## "I don't know what this is yet" is a first-class state

A member must be able to create a Work called *Untitled — consciousness / nature / AI* and put
things into it for six months. ⛔ The Studio may **not** demand Book / Chapter / Section at
creation.

```text
WORK ├── idea ├── fragment ├── conversation ├── transcript
     ├── note ├── research ├── image └── question
```

**Form emerges from the Work; it is not demanded of it.** Maybe a book. Maybe an essay. Maybe a
course. Maybe something else.

> **Verified against canonical `8fa03f48a`: the substrate already allows this.** `living_works`
> requires only `member_id` and `title` — `purpose` is nullable, and **expressions live in a
> separate table, so a Work with zero expressions is valid**. `living_work_expressions.expression_type`
> is open `TEXT` by design, not constrained to `manuscript`. **No schema work is needed for the
> formless Work.** The gap is at the surface: the Studio presents the manuscript as the anchor, so
> the state exists in data and is unreachable in the interface.

## Fixtures — one per starting condition

| | Fixture | Tests |
|---|---|---|
| **A** | **Seed** — one paragraph describing a possible book | Opens possibility. Does not produce an outline and call it the Work |
| **B** | **Scraps** — 12 fragments that look unrelated | Notices relationships and offers them for the writer to accept or refuse |
| **C** | **Material field** — transcripts + notes + research + quotes | Helps coherence emerge. **A cluster stays a cluster** until the writer says otherwise |
| **D** | **Manuscript** — Elemental Alchemy Ch10 (above) | Reads developmentally across an existing Work |

**A good Developmental Editor behaves differently with each.** Fixtures A–C are not yet authored;
only D exists.

## The binding requirement

> ⛔ **In none of the four conditions may its first instinct be "here is the finished version."**

This is the single control that spans every fixture. A build that opens with a produced artifact
has failed the product philosophy in every starting condition, not only the manuscript one.

## The common failure condition

> ⛔ **MAIA must not convert developmental possibility into canonical Work without writer
> recognition and decision.**

Equal force at both ends of the range:

```text
"These seven scraps could form a chapter."     ← condition B
"Rewrite Chapter 10 this way."                 ← condition D
```

A build that honours this at D and breaks it at B has not passed. The seed and scraps conditions
are where the violation is *easiest*, because there is no established Work to contradict — which
is precisely why they are acceptance classes and not warm-ups.

## Fixture referent is not the Work referent

```text
FIXTURE REFERENT     ELEMENTAL_ALCHEMY_MANUSCRIPT.md  L3492–3817

AUTHORITATIVE WORK   UNRESOLVED / OUT OF SCOPE
REFERENT

FIXTURE DOCTRINE     Maya is protagonist.
                     Her lived development carries the teaching.
                     Spiralogic names and orients the pattern.
```

⛔ **No manuscript custody decision is implied.** The doctrine says how the fixture is read for
testing. It does not say what the book becomes, which draft is the Work, or whether Maya survives
into it. Three Chapter 10s disagree and a fourth is in production; that remains the founder's to
settle, and the fixture works regardless because it tests the editor, not the chapter.
