# Writer's Studio — Execution Directive

**This file owns the current sequence.** Read it before touching Writer's Studio,
and before opening any branch that would build any part of it.

- **This directive** — where we are and what is next.
- **`WRITERS_STUDIO_MASTER_BRIEF.md`** — product constitution. What the Studio is
  and what it may never do. Changes rarely.
- **`WRITERS_STUDIO_PROGRAMME_BOARD.md`** — observed state of each capability.

Do not reconstruct the programme from conversation history. Do not open a
competing implementation lane. If this directive and a transcript disagree,
this directive is wrong or the transcript is stale — check the repository, then
fix this file. Never build from the disagreement.

---

## Mission

The most complete and elegant professional writing environment for serious
long-form work — novels, nonfiction, dissertations, therapeutic and clinical
writing, teachings, frameworks, and the long-form thinking of people whose
writing is part of their work in the world.

**Writer's Studio**: create · gather · write · develop · structure · revise ·
remember · review.
**Author's Studio** (downstream, separate): typeset · design · proof · render ·
package · publish.

The handoff is explicit: a manuscript the writer declares ready leaves one and
enters the other. Nothing crosses that line implicitly.

## The one lane

```text
INTEGRATION BRANCH   claude/writers-studio-organization-wxpb7q
LIVE BRANCH TIP      RESOLVE FROM GIT — never cached here
PRODUCT CODE TIP     8b568c0bd   ← last commit that changed product code
CANONICAL            644d4f2c5
```

**The branch tip is deliberately absent.** A tracked file cannot hold the SHA
of the commit that contains it: writing the SHA in changes the commit, which
changes the SHA. Every "fix" produces a new wrong value. So resolve it, at
session start, from the only thing that knows:

```bash
git fetch origin claude/writers-studio-organization-wxpb7q
git rev-parse HEAD
git rev-parse origin/claude/writers-studio-organization-wxpb7q
```

**Never take a live branch SHA from documentation.** `PRODUCT CODE TIP` is
recorded because it does not have that problem — a later documentation commit
does not change which commit last touched product code.

**Rule of One.** One integration branch. One owner per capability. Before
opening a branch: inspect canonical, inspect this lane, inspect other active
sessions. If another lane already owns the surface, converge with it — do not
independently rebuild it. This lane exists because two sessions built the same
room from opposite ends and neither knew.

## Build is open; delivery is not

```text
BUILD MODE     OPEN    on the integration lane above
DELIVERY MODE  CLOSED  until WS-01 ACCEPTED
                       + production hold released
                       + exact ship candidate verified
```

Founder ruling 2026-08-26, Master Brief **A2.0**. The WS-01 freeze protects
**production**, not building: it blocks merge, deployment, and member-facing
claims, and nothing else. No Studio code deploys until WS-01 accepts.

⛔ **BUILT is not DELIVERED.** Nothing on this lane may be described to anyone
as a capability the Studio has.

## The room

One room. Modes change the centre, never the product.

```
LEFT     Work · Materials · Structure · Versions        (open, not folded)
CENTRE   the manuscript, or the current working view
RIGHT    MAIA
BELOW    contextual instruments around the manuscript
```

Primary capabilities are never hidden behind vertical labels. Whitespace makes
hierarchy, not emptiness.

## MAIA's standing

Observe → evidence → discuss. She never silently authors.

Six kinds of truth, and they never collapse into each other:

```
Source        what arrived                    immutable
Material      what the writer gathered        member-declared
Work          what the writer says they make  member-authored
Draft         the current expression          the writer's
Observation   what MAIA noticed               hers, and marked as hers
Decision      what the writer answered        theirs, and theirs only
```

MAIA observing is not the writer agreeing. Agreeing is not deciding. Deciding
is not the manuscript having changed. Three separate acts, three separate
records.

## No quality scores — binding

MAIA does not score the quality, coherence, health, balance, readiness or
completeness of a Work. No inferred percentages. No grades. No "Coherence:
Strong".

**Legitimate:** findings · passages · chapters · sections · threads · words ·
reading time · review coverage · resolved and unresolved counts · *10 of 12
writer-defined milestones*.

**Prohibited:** *76% Overall Cohesion* · *86% Movement Health* · *87% Complete*.

A percentage is allowed only when computed from an explicit, writer-declared,
measurable target.

Derived labels must name what they measure. "Wide reach — 18 passages across 6
parts" is a fact about evidence. "High priority" is a judgement about
importance, and importance is the writer's to assign.

## Current sequence

| # | Unit | State |
|---|---|---|
| 0 | **WS-01** — close P0-D, release the production hold | **BLOCKING** — pasted arrival outstanding |
| 1 | **WS-VISIBLE-01** — MAIA in the room, open rail, real Structure, rename | built, undeployed |
| 2 | **DE-01 / DE-01A** — whole-Work Developmental Review, evidence-gated | built, undeployed |
| 3 | **WS-PRO-01** — global find, safe replace, navigation | built, undeployed |
| 4 | **VERSIONS-01** — keep, compare, restore | built, undeployed |
| 5 | **SHIP** — reconcile the lane to canonical, deploy, founder witness | waiting on 0 |
| 6 | **GATHER-02** — documents, notes, transcripts, recordings, images, links, prior drafts, with provenance visible | built, undeployed |
| 7 | **DE-02** — form-sensitive lenses, finding lineage, incremental re-analysis, material-aware reading | built, undeployed |
| 8 | **READER-01** — cumulative reader knowledge: what the Work has made available by a point. No personas, no deficit scores | built, undeployed |
| 9 | **STRUCTURE-02** — member-defined structure, movement and threads, no universal chapter ontology | next to build |
| 10 | **MEMORY** — source → material → observation → recognition → decision → adopted change, inspectable end to end | |
| 11 | **SAFE EDIT** — explicit request only: snapshot → proposal → diff → accept or reject | |
| 12 | **EXPRESSION** — book → lecture, course, essay, audio. Genuine re-expression, not format conversion | |
| 13 | **AUTHOR'S STUDIO HANDOFF** — the writer declares the manuscript ready | |

Units 1–4 and 6–8 are **built and unshipped**. Merged code is not delivered. Until a
member can reach it in production, the state is *built*, not *done*.

## For every unit

```
inspect what exists  →  reuse before rebuilding  →  build the smallest
coherent slice  →  test  →  use it in the actual Studio  →  fix what feels
wrong  →  merge  →  deploy where authorized  →  verify the running artifact
→  next
```

A unit is complete when a member can reach it, perform the gesture, have the
result persist, and find it still there on return. Code presence is not
reachability. Passing tests are not deployment.

## Do not

- Write another roadmap unless reality invalidates this one.
- Build invisible substrate without an immediate product need.
- Open a duplicate lane.
- Treat merged code as delivered, or passing tests as deployment proof.
- Rebuild existing functionality before checking whether it is already there.
- Deploy while an acceptance witness owns production.

## Roles

**Conductor** — owns state, dependencies, lane ownership, collisions,
sequencing. Says what the next build is. Does not merge canonical or deploy
production.
**Builder** — reads this directive, inspects the code, implements the current
unit, runs the gates, produces the branch, reports the proof.
**Deploy lane** — deploys only when authorized, then proves the running
artifact.

---

*Amend this file when the sequence changes. It is short on purpose: if it grows
into a history, it has stopped doing its job.*
