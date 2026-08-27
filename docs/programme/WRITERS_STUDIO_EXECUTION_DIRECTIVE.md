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
PRODUCT CODE TIP     cd8a95271   ← last commit that changed product code
DEPLOYED TO PROD     cd8a95271   ← verified via printenv GIT_COMMIT
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

## Build is open; delivery is released for this candidate

```text
BUILD MODE     OPEN      on the integration lane above
DELIVERY MODE  RELEASED  for cd8a95271 only
                         P0-D both legs witnessed on 83efa86df
                         production hold released by the founder
                         deploy run by the founder, provenance verified
LIVE IN PROD   cd8a95271  (2026-08-26)
```

Founder ruling 2026-08-26, Master Brief **A2.0**. The WS-01 freeze protects
**production**, not building: it blocks merge, deployment, and member-facing
claims, and nothing else.

**What released it.** P0-D's outstanding pasted leg was witnessed on the
deployed candidate (`83efa86df` read before and after, `member_supplied_text`
arrival with `artifact_ref`/`artifact_hash`/`artifact_size` all NULL), which
completed the P0 walk. The founder then ran the deploy himself:

```bash
scripts/deploy-production.sh deploy cd8a95271
```

6 migrations applied, provenance verified fail-closed
(`GIT_COMMIT=cd8a95271 == asserted`), all smoke tests PASS.

⛔ **Still true for everything not in `cd8a95271`.** BUILT is not DELIVERED.
Release is per-candidate, not a standing lift: the next unit is undeployed the
moment it is written.

📌 **WS-01 formal acceptance is still the founder's act.** Evidence 003 records
PASS; it does not accept. The record closes when he signs it, not when the
deploy succeeds.

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
| 0 | **WS-01** — close P0-D, release the production hold | P0-D **both legs witnessed**; founder acceptance outstanding |
| 1 | **WS-VISIBLE-01** — MAIA in the room, open rail, real Structure, rename | **DEPLOYED** `cd8a95271` |
| 2 | **DE-01 / DE-01A** — whole-Work Developmental Review, evidence-gated | **DEPLOYED** `cd8a95271` |
| 3 | **WS-PRO-01** — global find, safe replace, navigation | **DEPLOYED** `cd8a95271` |
| 4 | **VERSIONS-01** — keep, compare, restore | **DEPLOYED** `cd8a95271` |
| 5 | **SHIP** — reconcile the lane to canonical, deploy, founder witness | **DEPLOYED** — founder witness of the running room outstanding |
| 6 | **GATHER-02** — documents, notes, transcripts, recordings, images, links, prior drafts, with provenance visible | **DEPLOYED** `cd8a95271` |
| 7 | **DE-02** — form-sensitive lenses, finding lineage, incremental re-analysis, material-aware reading | **DEPLOYED** `cd8a95271` |
| 8 | **READER-01** — cumulative reader knowledge: what the Work has made available by a point. No personas, no deficit scores | **DEPLOYED** `cd8a95271` |
| 9 | **STRUCTURE-02** — member-defined structure, movement and threads, no universal chapter ontology | ⛔ **HELD** until the founder's walk |
| 10 | **MEMORY** — source → material → observation → recognition → decision → adopted change, inspectable end to end | |
| 11 | **SAFE EDIT** — explicit request only: snapshot → proposal → diff → accept or reject | |
| 12 | **EXPRESSION** — book → lecture, course, essay, audio. Genuine re-expression, not format conversion | |
| 13 | **AUTHOR'S STUDIO HANDOFF** — the writer declares the manuscript ready | |

Units 1–4 and 6–8 are **reachable in production** on `cd8a95271`. That makes them
*delivered*, not *done*: delivered means a member can reach the gesture. Done
means the founder has used it and it survived. Unit 5's remaining act is the
founder walking the live room and reporting what is wrong with it.

## The walk gate — before any further build

Founder ruling 2026-08-26, after the deploy. **STRUCTURE-02 is closed until the
founder has used the live room as a writer**, with real writing, not as a
systematic test of seven capabilities.

The reason is not ceremony. Member-defined movements and threads could deepen
the Studio considerably — but only in response to the actual phenomenology of
*this* room. Designing another conceptual layer before the room has been felt
elaborates a container nobody has yet inhabited.

The four questions carried into the walk:

1. **Does this feel like a place to write?** Not "does the feature work" — does
   the room gather attention around the work?
2. **Where is MAIA?** Within the creative field — aware of manuscript,
   materials, structure, history — or another application occupying the
   right-hand column?
3. **Does Materials preserve relationship?** Does *"How does it belong?"* invite
   the material's living relation to the work, or read as metadata entry?
4. **Can you move without thinking about the software?** manuscript → material →
   MAIA → structure → revision → back into prose as one continuous movement.

The fourth is the deepest acceptance criterion, because the seven deployed units
are not seven features. They are the first form of one architecture:

```text
material → attention → meaning → structure → expression → revision → reception
```

MAIA belongs inside that movement, not beside it.

### Three legitimate outcomes, and only three

| | Outcome | Consequence |
|---|---|---|
| **A** | **Accept WS-01** — the room coheres | Sign Evidence 003; STRUCTURE-02 opens |
| **B** | **Accept with bounded corrections** — architecture right, specific experiential fractures | Repair *without expanding scope*, then accept |
| **C** | **Do not accept** — something foundational about the room is wrong | STRUCTURE-02 stays closed; more structure would only elaborate the wrong container |

### Quarantined from this judgment

**CADDY-CUSTODY-01** and the **Resend quota / `auth:email-code`** failure are
open and both need fixing. Neither is evidence about whether the creative
architecture works, and neither may be cited in outcome A, B or C. Separate
lanes, separate judgments.

### Known before the walk — do not count it twice

Established by reading `lib/studio/companionStance.ts` on the deployed
candidate, not by using the room. `RoomFacts` — everything MAIA is given each
turn — carries the Work's identity, the declared materials, the manuscript
title, the draft length, and **the first 6,000 characters of the draft**.

It does not carry structure, revision history, the writer's current position in
the draft, or MAIA's own prior Developmental Review findings. So a writer
working in chapter nine is discussed by a companion reading chapter one.

Against question 2 this is a partial, structural answer: MAIA is **beside** the
movement, not inside it — and provably so, before anyone walks the room. If the
walk produces "she doesn't seem to know where I am", that is this, already
characterized. It is a bounded correction (outcome **B**), not a new discovery,
and it is not STRUCTURE-02.

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
