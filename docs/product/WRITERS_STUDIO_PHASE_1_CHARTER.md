# Writer's Studio — Phase 1 Construction Charter

> **Status:** Draft v1. **Authored by Kelly, 2026-08-02.** Recorded verbatim in substance by
> Claude; **not ratified.** Kelly ratifies.
>
> **Relationship to canon:** [`WRITERS_STUDIO_PRODUCT_DEFINITION.md`](./WRITERS_STUDIO_PRODUCT_DEFINITION.md)
> (merged #870) says **what the finished Studio must be**. It does not say **in what order it
> gets built**. This document holds only that: the construction sequence, the north star image
> to test against, and the decision rule for Phase 1. Where the two disagree, the Product
> Definition governs.

---

## The framing correction

Phase 1 is **not** "start building the Writer's Studio."

Phase 1 is **building the Canvas substrate — not the experience.**

That distinction is the whole point of this document. Without it, the likely failure is
recreating the brown manuscript page under a new name.

## Definition of Done — Phase 1

> Establish the technical substrate that will support the Writer's Canvas. **Do not attempt to
> complete the Writer's Studio experience.** Every decision should preserve existing persistence
> while moving toward the Canvas becoming the primary workspace.

## The objective, stated to the builder

> The objective of Phase 1 is not to improve the existing manuscript page.
> The objective is to make the Canvas the primary workspace.
>
> The existing manuscript page is **implementation scaffolding.** Preserve its persistence
> layer, revision system, concurrency model, and editing engine — but **do not preserve it as
> the member experience.**
>
> Every implementation decision should move functionality **into the Canvas** rather than
> making the manuscript page **more permanent.**

## North star (the image everything is tested against)

> The Writer's Studio should feel like **sitting down at a large creative worktable, not opening
> a document.**

When a member enters, they should not feel like Word, Google Docs, or Scrivener. They should
feel like they have walked into a room where all of their thoughts, notes, keeps, ideas,
decisions, journal entries, conversations, sources, and projects are available to be gathered,
arranged, and gradually transformed into writing.

---

## The sequence

Phase 1 proceeds in this order. Each sub-phase is its own slice.

### Phase 1A — Complete the writing substrate

- Finish and stabilize the `WriterField` integration.
- Preserve autosave, revisions, concurrency, Explicit Insertion, and return state.
- Ensure chapter-scale performance remains excellent.
- **Do not redesign the UI.**

### Phase 1B — Complete Start Writing

- Blank-page creation.
- Untitled manuscripts.
- Singleton blank-page semantics.
- Identity-based routing.
- Multiple blank pages only **after** writing has begun.

### Phase 1C — Introduce projects

Not visually elaborate. Simply make the system understand:

```
Project
  └── Canvas
        └── WriterField
```

…without exposing all the future Canvas functionality yet.

### Phase 1D — Replace the entry point

**This is the important transition.**

When someone chooses a project they should no longer land on the brown manuscript page. They
enter the **Canvas shell**.

Initially that shell may contain almost nothing except:

```
Project
Shelf
Groups
WriterField
```

**That is acceptable.**

What is **not** acceptable:

```
Project → Brown manuscript page
```

---

## Decision rule (operative for every Phase 1 slice)

Inherited from the Product Definition and sharpened for construction:

> Never optimize the existing manuscript page into permanence. If a decision makes the old page
> a little better but delays or weakens the Canvas becoming the primary Writer's Studio
> experience, **prefer the Canvas.**

Two questions every Phase 1 PR must answer in its own description:

1. Does this move functionality **into the Canvas**, or does it make the manuscript page more
   permanent?
2. Which sub-phase (1A / 1B / 1C / 1D) does this belong to, and does it stay inside it?

## What Phase 1 explicitly does not deliver

Naming these prevents a later slice from being read as a regression:

- The full mode set (Write · Structure · Revise · Design · Publish). Phase 1 delivers the shell
  those modes will eventually live in, not the modes.
- Visual elaboration of the Canvas. "Almost nothing except Project / Shelf / Groups /
  WriterField" is the stated acceptable Phase 1 shell.
- Project selection UI beyond what 1C and 1D require to route correctly.
- Any judgment, clustering, ordering, naming, or suggestion by MAIA inside the Canvas.

## Success condition

Phase 1 succeeds if it **establishes the trajectory** — Canvas as primary workspace, manuscript
page demoted to substrate — **while preserving the robust persistence substrate already built**,
so that later phases do not force another architectural reset.

Phase 1 fails if, at its end, a truthful walkthrough of the member's entry path can still be
described as: *"It's the same brown page with a better editor."*
