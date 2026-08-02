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

## The unit of acceptance is the release object, not the PR

> **Added by Kelly, 2026-08-02**, after Phase 1 stopped being a line and became a graph.

The sequence above reads as linear — 1A, then 1B, then 1C, then 1D. **The work did not arrive
that way**, and the charter would be lying if it pretended otherwise. Independent lanes ran
concurrently, corrections landed after the slice they corrected had already merged, and
instrumentation appeared beside implementation rather than after it:

```
1A  #869  WriterField substrate ─────────┐
1B  #875  Start writing ──────────────┬──┤
1C  #877  Member Workbench / Keep ────┘  │
    #878  Arrangement verbs ───────┐     │
    #879  Walk probes ─────────────┤     │
    #880  Post-merge corrections ──┘     │
    #876  This charter ─────────────────┘
```

That is not disorder. It is what independent work looks like. But it changes what "done" can
mean, and the discipline has to change with it:

> **Release discipline shifts from *PR order* to *release object*.**
>
> The unit of acceptance is no longer an individual PR. It is the
> **Writer's Studio Phase 1 Release Candidate** — the merged work, the pending corrections,
> the instrumentation, and the experiential walk, accepted together.
>
> Only after *that* passes does deployment happen.

### Consequences, stated so they are not re-argued later

- **A merged PR is not an accepted capability.** #875 merged before its corrections existed and
  before its walk was run. Both facts are true; neither is a scandal; both belong to the release
  object rather than to the PR.
- **A correction to a merged slice is not a continuation of implementation.** It belongs to the
  same release object as the slice it corrects, and it does not reopen that slice's scope.
- **The walk is performed against the assembled candidate**, not against each PR as it lands.
  Walking a slice that a later PR will change is walking something that will not ship.
- **No new implementation lane opens until Phase 1 is a finished release object.** The Canvas
  work this charter is groundwork for — projects, thinking space, multiple works, the Studio
  environment — waits.

### Phase 1 release sequence

1. Merge **#880** — post-merge corrections (C1 concurrency coverage, C2 nullable title).
2. Merge **#879** — walk probes, if the instrumentation is wanted in the repository.
3. Merge **#878** — arrangement verbs, after review.
4. Perform the **full experiential walk** against the assembled candidate.
5. Deploy Phase 1 as **a single release**.

This preserves the property the project has been careful to build: **each phase becomes an
observed capability before the next one begins.**

## Every phase ends with a Release Record

> **Proposed by Kelly, 2026-08-02.** Stated here because this is where it arose. It is a
> **general rule, not a Phase 1 rule** — promoting it to canon (`docs/canon/`) is Kelly's call,
> not something this charter can perform.

A **Release Record is distinct from this Charter.** The Charter says what a phase intends and
in what order it should be built. The Release Record says **what actually shipped.**

**The structure is fixed** — seven sections, same order, every release, so that someone reading
Phase 7 in a year finds the same information in the same place they found it for Phase 1:

| § | Section | Purpose |
|---|---|---|
| 1 | **Identity** | release name, deployed commit(s), deployment date |
| 2 | **Composition** | PRs and issues included |
| 3 | **Acceptance evidence** | walks, tests, observations, reviewer sign-offs |
| 4 | **Residues** | accepted known limitations and rationale |
| 5 | **Deferred work** | explicitly moved to the next release |
| 6 | **Founder acceptance** | human authorization, never inferred |
| 7 | **Post-release observations** | only filled after deployment |

Template: [`releases/RELEASE_RECORD_TEMPLATE.md`](./releases/RELEASE_RECORD_TEMPLATE.md).

### ⭐ Three kinds of walk, and they are not interchangeable

§3 must **classify** every walk it records:

| Kind | Claim it supports |
|---|---|
| **Developer verification** | *this implementation behaves as intended* |
| **Slice verification** | *this PR satisfies its own acceptance criteria* |
| **Release acceptance** | *the assembled capability is ready for members* |

⛔ **Only a release-acceptance walk satisfies the release gate.** The others are recorded
explicitly labelled as *not* release acceptance. The failure this prevents is a later reader
collapsing several kinds of evidence into *"someone walked it."*

### Where the Release Record sits

```
Vision → Product Definition → Phase Charter → Implementation PRs → Release Candidate
      → Acceptance Walk → Release Record → Deployment → Observed Production Evidence
```

⭐ The point of the chain: **an implementation cannot become *finished* merely because the code
exists.** It must survive progressively stronger forms of evidence before it becomes part of
the platform.

**Why:** without it, a release has to be reconstructed months later by reading a sequence of PRs
and comments — which is exactly the reconstruction-from-recollection this project refuses
elsewhere. The Release Record makes **the release itself the historical unit**, rather than the
PR.

⛔ **A Release Record is written from verified state, never from intent.** Slots for which no
evidence yet exists are left **literally blank** — an unfilled acceptance line is information;
a plausible-looking one is a fabrication. It is completed *at* deployment, not before, and the
acceptance line is Kelly's to sign.

Phase 1's lives at [`releases/WRITERS_STUDIO_PHASE_1_RELEASE_RECORD.md`](./releases/WRITERS_STUDIO_PHASE_1_RELEASE_RECORD.md).

## Success condition

Phase 1 succeeds if it **establishes the trajectory** — Canvas as primary workspace, manuscript
page demoted to substrate — **while preserving the robust persistence substrate already built**,
so that later phases do not force another architectural reset.

Phase 1 fails if, at its end, a truthful walkthrough of the member's entry path can still be
described as: *"It's the same brown page with a better editor."*
