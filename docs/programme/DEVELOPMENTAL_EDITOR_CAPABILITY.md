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

> **Dependency — scoped.** That knowledge is *Work Structure* — member-declared, per Phase 3A —
> not detected structure. Work Structure is a dependency of the **structure-aware lenses only**,
> not of the whole capability. The Editor is not one downstream feature waiting on one unit; parts
> of it can arrive before structure exists, and must, because that is where most writing begins.

---

# The whole genesis of a Work

⛔ **The Editor is not defined as "chapter developmental reading."** That is one stance at one
maturity. A Work does not begin as a manuscript, and an editor that only meets it there abandons
the writer for the entire period when help matters most.

```text
STARTER CONCEPT → IDEA → SCRAPS → FRAGMENTS → PILES OF NOTES → TRANSCRIPTS
   → RESEARCH → EMERGING WORK → STRUCTURED WORK → MATURE MANUSCRIPT
```

## Developmental stances

| Stance | What it does | Requires |
|---|---|---|
| **DISCOVER** | meets a starter concept or an idea; asks what is alive in it, what it is circling | nothing beyond the material |
| **GATHER** | meets scraps, fragments, notes, transcripts, research; notices recurrence, heat, what keeps returning | nothing beyond the material |
| **SHAPE** | proposes relationships among materials — adjacency, grouping, sequence | **may suggest relationships; may not declare structure** |
| **DEVELOP** | the seven lenses against an emerging or structured Work | structure-aware lenses require Work Structure |
| **REVISE** | continuity, sequencing, reader knowledge, compare, restore | authoritative Work Structure + recoverable history |

## What each stance is allowed to assert

```text
DISCOVER · early GATHER      no structure required
                             notices; asserts nothing about the Work

SHAPE from scraps/materials  may SUGGEST relationships
                             ⛔ may not DECLARE structure

continuity · sequencing ·    requires authoritative Work Structure —
reader knowledge             these are the structure-aware lenses

adoption into the Work       requires writer decision + provenance

revision · compare · restore requires recoverable history
```

The gradient is the point: **the Editor's authority to assert rises only as the writer's own
declarations rise.** It may always notice. It may suggest relationships once there are materials.
It may reason about sequence only once the writer has declared what the sequence *is*. It may
change the Work only by a writer's decision. That is the programme invariant expressed as a
maturity ladder rather than a single gate.

## Sequencing consequence

The first buildable slices are **DISCOVER** and **GATHER** — they depend on materials, which
precede structure. `SHAPE` follows. The structure-aware `DEVELOP` and `REVISE` lenses wait on the
structure unit. Chapter 10 exercises the mature end; it does not define the capability, and the
capability must not be scheduled as though it began there.

---

# Acceptance fixture — Chapter 10 (MATURE MANUSCRIPT stance only)

> **One fixture at one maturity.** This exercises `DEVELOP`/`REVISE` against a mature manuscript.
> It is not the definition of the capability, and `DISCOVER`/`GATHER`/`SHAPE` need their own
> fixtures drawn from real scraps, notes and transcripts before those slices are accepted.
>
> ⛔ **Fixture purpose is to test editor behaviour — not to settle or rewrite Chapter 10.** Nothing
> here rules on the authoritative Work.

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
