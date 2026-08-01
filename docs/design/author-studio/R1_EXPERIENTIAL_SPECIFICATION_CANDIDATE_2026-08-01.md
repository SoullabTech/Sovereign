# R1 Working Draft — Experiential Specification

> **Status: Draft + Record, 2026-08-01. Governs nothing. Authorizes no build.**
> It defines what the room must *feel* like, so that future slices can be judged
> against something other than "does the PR work."
>
> **It does not touch the Living Work ontology.** A manuscript is a valid
> expression of a Living Work under the candidate ontology, so R1 can become
> excellent without prejudging what the Studio ultimately is. The two tracks
> reinforce each other; neither blocks the other.

## Why this exists

**A room can be technically complete and still not express the soul of the Studio.**
Implementation completeness and experiential completeness are different kinds of
completion, and only the first was ever being measured.

Every slice so far was locally reasonable — Home, Import, concurrency, typography.
None was ever reviewed against *"is this becoming the Studio we set out to build?"*
That question was never asked at merge time, because there was nothing to ask it
against. This document is that thing.

**Correction of record:** the comparative study of iA Writer, Ulysses, Scrivener,
Bear, Obsidian, Craft and Apple Notes was named as a set of lenses but never
performed — `git grep` over `docs` finds no mention of any of them. What follows is
that study, done now, rather than a recovery of one that existed.

---

## What the good ones actually do

Not their features. The properties that produce the feeling.

**iA Writer — the room has one job.** There is no sidebar, no inspector, no
formatting bar. The measure is fixed and generous. Everything that could be a
control is a keystroke instead. The lesson is not minimalism; it is that **every
visible element is a claim on attention, and most cannot justify the claim.**

**Ulysses — the work is a body, not a file.** You do not open documents; you move
through a library of sheets that belong to something. Structure is navigable
without leaving the writing. The lesson: **a long work needs to be traversable from
inside itself.**

**Scrivener — the manuscript has a shape you can see.** Its binder makes structure a
first-class object, so reordering is thinking, not file management. It is also the
cautionary case: **structure surfaced too aggressively turns writing into project
administration.**

**Bear — typing is the only interface.** Markup is typed, never selected from a
menu. Nothing modal. The lesson: **the fewer mode switches, the longer flow
survives.**

**Obsidian — relationships without imposed structure.** Connections are declared by
the writer, never inferred. The lesson, and it is the one closest to this project's
constitution: **the environment may hold relationships; it may not assert them.**

**Craft / Apple Notes — the page has physical dignity.** Margins, weight, and
restraint make a note feel like an object rather than a record. The lesson:
**typographic care reads as respect for the work.**

**What none of them do:** greet you, report on you, congratulate you, or offer to
help. Not one shows a word count on the writing surface by default.

---

## The properties R1 must have

Stated so they can be checked, not admired.

1. **The room has one job.** Everything on screen either is the writing or serves
   this session's writing. Nothing reports, greets, counts, or advertises.
2. **The work is recognisable before the software.** What the member sees first is
   their own words, in their own voice, in the typeface they write in.
3. **Nothing moves that the writer did not move.** No reflow, no jump, no
   auto-scroll that argues. A paragraph is where it was.
4. **Long work is traversable from inside.** Reaching chapter nine does not mean
   leaving the writing.
5. **No mode switches.** Marking, structuring and writing use the same gesture and
   the same instrument.
6. **The environment holds relationships; it never asserts them.** Nothing is
   inferred, characterised, or summarised.
7. **It survives hour four.** Nothing that is merely tolerable at minute four.
8. **It is quiet when it fails.** Errors are plain sentences that say what happened
   and what to do.
9. **Returning costs nothing.** The page opens where the writer left it, already
   theirs.
10. **The member could describe it without naming a feature.** *"It's where I write
    my book"* — not *"it has autosave, revisions and checkpoints."*

---

## R1 measured against them, honestly, today

| # | Property | Today |
| --- | --- | --- |
| 1 | One job | **Partial.** Page count, checkpoint count and an explanatory line sit above the writing. |
| 2 | Work before software | **No.** The Working Draft opens under a heading about editable copies; the book's name is not the first thing seen. |
| 3 | Nothing moves | **Yes**, as of Phase B slice 1. |
| 4 | Traversable | **No.** A 174-section manuscript has no navigation at all. |
| 5 | No mode switches | **Partial.** Writing is modeless; checkpointing is a form with a note field and a button. |
| 6 | Holds, never asserts | **Yes.** Constitutionally held, and it holds. |
| 7 | Survives hour four | **Unknown.** Untested by anyone. |
| 8 | Quiet failure | **Yes.** Plain sentences, no jargon. |
| 9 | Returning costs nothing | **Yes.** Caret, selection and scroll restore before paint. |
| 10 | Describable without features | **No.** The room currently explains itself. |

**Four of ten hold. One is unknown. Five do not.**

The five failures are not bugs. Every one was a locally reasonable decision that
nobody weighed against the whole.

---

## What this implies for the next slices

In the order the failures cost the most:

- **Navigation inside a long work** (property 4) — 174 sections with no way through
  is the largest single gap between this and any of the environments studied.
- **The work's name first, explanation last** (properties 2 and 10) — largely a copy
  and hierarchy change, not new machinery.
- **Fewer claims on attention above the writing** (property 1).
- **Checkpointing as a gesture rather than a form** (property 5).
- **An actual six-hour session** (property 7) — the only one that cannot be
  designed, only lived.

None of these is authorized by this document.

---

## How to use it

Before any Studio PR merges, answer one question in the PR body:

> **Which property does this move, and which does it cost?**

A slice that moves none is not necessarily wrong — Phase A moved none and was
necessary — but it should say so plainly rather than imply progress toward the room.

## What this does not do

It does not rule the Living Work ontology, authorize a build, rename anything, or
license any outward claim. It describes a standard. Meeting it is separate work,
separately authorized.
