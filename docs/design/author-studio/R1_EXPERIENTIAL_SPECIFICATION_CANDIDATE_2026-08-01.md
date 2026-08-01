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

## Comparative anatomy — what each environment protects

Not a catalogue of software. Each of these succeeds at its own scale because it
protects **one invariant** ruthlessly, and accepts the costs of protecting it. The
useful question is never *what features does it have* but **what does it refuse to
compromise** — and then, for each: does the Studio inherit that, refuse it, extend
it, or is it ours alone?

| Environment | The invariant it protects | The cost it accepts | Studio |
| --- | --- | --- | --- |
| **iA Writer** | *The writing surface is the product. Everything else yields.* | No structure. Long works are unmanageable. | **Adopt** |
| **Ulysses** | *Navigation is always one gesture away and never occupies the page.* | A library model the writer must learn. | **Adopt** |
| **Scrivener** | *Structure is manipulable without interrupting writing.* | Structure surfaced so strongly that writing becomes project administration. | **Adopt the invariant, reject the expression** |
| **Bear** | *An idea enters with almost no ceremony.* | Little help once the body of work is large. | **Adopt** |
| **Craft** | *The document feels composed while it is being written.* | Formatting becomes a mode, and a mode competes with the sentence. | **Adopt partially** |
| **Obsidian** | *Connections are declared by the writer, never inferred.* | No help at all in seeing what is gathering. | **Adopt and extend** |
| **Apple Notes** | *Return costs nothing; nothing must be managed.* | No sense of a work as a whole. | **Adopt** |

### What that resolves, case by case

**From Ulysses we take the invariant, and it is the one we most obviously lack.**
174 sections with no way through them is a failure by Ulysses' standard and by
Scrivener's. Navigation is not a feature request; it is the property that makes a
long work habitable.

**From Scrivener we take the invariant and refuse the expression.** Structure must be
manipulable — but a binder that greets you turns a writing room into a project
manager. The test: can structure be reached and changed without the page ceasing to
be a page.

**From Craft we take typographic care and refuse the formatting mode.** A document
deserving of dignity is not the same as a document you style while writing it. Every
styling control is a mode switch, and mode switches end flow.

**From Obsidian we take the invariant and go further than it does.** Obsidian never
asserts connections because it has no intelligence that could. The Studio *does* —
MAIA could infer relationships across a body of work at any moment, and must not.
Protecting an invariant you have no capacity to violate is easy; protecting it while
holding the capacity is the harder thing, and it is constitutional here
(*the Studio may notice what is gathering; it may not pronounce what the work is
becoming*).

### What the Studio refuses that all of them permit

**Ambient measurement of the writer.** Every environment above surfaces a count
somewhere — words, characters, progress toward a target. The Studio refuses it on the
writing surface. A count measures activity; the room exists to support continuity.
This is a deliberate divergence, not an omission.

### What is ours alone

**A creative environment with intelligence present and constrained.** None of the
seven has to solve this: six have no intelligence, and the seventh treats it as an
authoring assistant. The Studio holds a participant that could summarise, connect,
and characterise a body of work — and is bound not to. That constraint is the
Studio's own contribution to this class of software, and nothing above can be
consulted about it.

**The Living Work as the object.** Every environment above organises around files,
sheets, or notes — an artifact. The candidate ontology organises around the body of
work that gives rise to artifacts. *Unratified, and named here only so it is not
mistaken for something inherited.*

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
