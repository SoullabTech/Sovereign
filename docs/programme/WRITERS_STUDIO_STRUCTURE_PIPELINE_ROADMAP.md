# Writer's Studio — Structure Pipeline Roadmap

> **Preserved direction. Not a programme entry.**
>
> Per master brief **§A3.1**: *"A feature is not part of Writer's Studio merely because it has a
> specification."* This file records the founder-authored arc for the structure pipeline and the
> capabilities that stand downstream of it. It authorizes nothing. Each unit below enters the
> programme only when it carries all five of A3.1 — programme entry · dependency chain · executable
> vertical slice · real-Work acceptance case · path to production — and holds **custody on canonical**.
>
> ```text
> NORMATIVE AUTHORITY   docs/programme/WRITERS_STUDIO_MASTER_BRIEF.md
> LIVE STATE            docs/programme/WRITERS_STUDIO_PROGRAMME_BOARD.md
> DIRECTION (here)      docs/programme/WRITERS_STUDIO_STRUCTURE_PIPELINE_ROADMAP.md
> NEXT LANE CHARTER     docs/programme/WS2-05B-5HALF_MAIA_STRUCTURE_READER_LANE.md
> ```

| Field | Value |
|---|---|
| **Authored** | founder, 2026-08-31 |
| **Censused against** | canonical `55021771` (`origin/clean-main-no-secrets`, 2026-08-30) |
| **Status** | direction preserved · **no unit herein is entered** |
| **Governing invariant** | master brief **§A1.3** — the authority chain |

---

## 0. Census before direction

⛔ The board's rule holds here: **node states are evidence, not intention.** The unit chain below is
written in the numbering of the lane series that produced it (05A · 05B · 5½ · 6 · 06 · 07 · 08).
That numbering does **not** correspond to artifacts on canonical. Read at `55021771`, tree-wide:

```text
StructureEvidence        0 files
StructureInterpretation  0 files
StructureProposal        0 files
interpretStructure       0 files
StructureReader          0 files
AuthorStructureCommand   0 files
manuscript_structure_units  0 files  ·  no migration
```

What *is* on canonical, and is the real substrate any structure work must sit on:

```text
lib/manuscript/types.ts               manuscript + section types
lib/manuscript/ingest/segment.ts      mechanical segmentation
lib/manuscript/source/{arrivals,custody,omission}.ts   WS-01 source custody
app/api/sovereign/manuscripts/**      manuscripts · sections · drafts · revisions
database/migrations/20260721000003_press_manuscript_room.sql
database/migrations/20260824000001_manuscript_source_custody.sql
```

**The work was then located** (same day): `origin/claude/writers-studio-ws2-03b-qf49hj` @
`845adb88`, complete with 111 test cases. Custody is chartered as
`docs/programme/WS2-05B-CUSTODY-01_STRUCTURE_CUSTODY_UNIT.md`.

**Therefore:** where this roadmap says a unit is built or passing, that is a claim about a lane
branch, not about canonical. It is recorded here as direction so the work is not rebuilt
beside itself — which is exactly the failure §A3.1 exists to break. It is not recorded as state.

> This clone is **shallow** (181 commits). Commit-ancestry claims about lane SHAs cannot be made
> from it. File-presence claims can, and are what the census above asserts.

---

## 1. The spine

The structure pipeline is the mechanism by which the programme invariant becomes executable code
rather than a stated intention.

```text
MASTER BRIEF §A1.3                        STRUCTURE PIPELINE

SOURCE / MATERIAL                    ←→   StructureEvidence
        ↓ may                              mechanical perception of what exists
MAIA MAY NOTICE                      ←→   StructureInterpretation
        ↓ may                              MAIA reads the evidence, forms a reading
WRITER MAY RECOGNIZE                 ←→   StructureProposal
        ↓ may                              reviewable representation, member edits it
WRITER MAY DECIDE                    ←→   AuthorStructureCommand
        ↓ may                              ONE EXPLICIT SOVEREIGN ACT
WORK MAY CHANGE                      ←→   Structure Service
                                           authoritative units + memberships
```

⛔ **No automatic arrow. Every arrow may stop.** A reading can remain a reading. A proposal can be
edited and never adopted. A member can adopt nothing and lose nothing.

**The constitutional invariant of the whole pipeline:**

```text
MAIA result ──────X──────> manuscript structure of record
```

There must never be an executable path equivalent to:

```text
interpretStructure(...)
INSERT <structure units> ...
```

Only the member's explicit adoption act may cross that line. This is §A1.3's *"interpretation may
never silently become structure"* stated as a code fact rather than a principle.

---

## 2. Build sequence

```text
05A  AUTHOR STRUCTURE  — authoritative units + memberships
05B  5a  evidence / proposal plumbing
     5b  route + component
     5c  real composed witness
     5½  MAIA STRUCTURE READER              ← NEXT ELIGIBLE LANE
     6   SOVEREIGN ADOPTION                   HOLD until 5½ is witnessed

06   READ DIVISIONS WHOLE
07   CLEAN IMPORT ARTIFACTS                   07A census → 07B authorized normalization
08   SPLIT / MERGE WRITING UNITS

     SECTION-AWARE CHECKPOINT
     DEVELOPMENTAL NOTES + THREADS
     WHOLE-WORK INTELLIGENCE
     REVISION
     EXPRESSION / PUBLISH
```

### 05B-5½ — MAIA Structure Reader · **next eligible**

Turns `StructureEvidence` into a `StructureInterpretation`. Nothing else. One real `StructureReader`
implementation, not a new architecture. Chartered separately:
`docs/programme/WS2-05B-5HALF_MAIA_STRUCTURE_READER_LANE.md`.

### 05B-6 — Sovereign adoption · **held**

Held until 5½ exists and is witnessed. Creates the adoption boundary that does not exist today.
Three questions are deliberately left open until the lane opens, because resolving them early would
import adoption concerns into 5½:

- **replacement** of existing structure — the highest-risk case;
- **re-proposal after adoption** — history and version semantics;
- **`adopted_from_id` provenance** — whether it remains necessary once proposal provenance is canonical.

### 06 — Read divisions whole

Where the Studio stops seeing only isolated sections: *"read the Water division"*, *"what happens
across these nine sections?"* Editing remains section-authoritative.

```text
division = perceptual / read scope
section  = writing authority
```

Larger-scale cognition without larger-scale destructive editing. This is A4.9 (structural
perspective) beginning to be satisfiable — and A1.5 still binds: **no universal chapter schema**,
units stay member-defined.

### 07 — Clean import artifacts · two-stage, never one

```text
07A  CENSUS          read-only; discover which import artifacts actually exist
        ↓ proof
07B  NORMALIZATION   only categories proved mechanically safe, only with explicit authority
```

⛔ No *"while we're here"* cleanup. 07 can change manuscript bytes, so census first, proof first,
authority first — with byte-exact preservation, provenance, transactionality, and a real-book witness.

### 08 — Split / merge writing units

Where the imported section boundary is not the actual writing boundary — one blob that is three
sections, three fragments that are one. This changes the boundaries of real writing, so it carries
07's heavier gate, not 04A's lighter one.

### Section-aware checkpoint

Its own unit. ⛔ Never a side effect of 07 or 08. At this point the Studio can say:

```text
We know what the Work contains.
We know its authorial structure.
We can read its meaningful divisions.
Import artifacts have been accounted for.
Writing-unit boundaries are trustworthy.
```

Only then does developmental work become reliable.

### Developmental notes + threads

Observations persist across the Work without becoming prose. The distinction is the substance:

```text
manuscript  ≠  developmental observation  ≠  thread  ≠  revision
```

Threads carry an idea introduced here and fulfilled later, a motif moving through several sections,
a developmental question, a promise made to the reader, something MAIA wants to keep attending to.
This is the connective tissue for whole-Work intelligence — and the data-model home for §A1.3's
required distinction between *MAIA observation*, *writer recognition* and *writer decision*.

### Whole-Work intelligence

```text
Where does Fire lose energy?
What does the book teach twice?
What begins but never completes?
Which promise does the introduction make that the ending never answers?
Where is an insight present conceptually but missing experientially?
Where does the reader need embodiment, story, image, silence, or synthesis?
How does the whole Work move?
```

⛔ The governing boundary does not relax as perception widens:

> **Perception may become increasingly whole-Work; authorship does not thereby become implicit.**

Sophisticated developmental intelligence produces **observations, not manuscript bytes**.

### Revision

Only after whole-Work perception is trustworthy.

```text
perception → developmental observation → author engages it
           → revision intention → writing operation
```

⛔ Never `perception → rewrite`. Intelligence does not get to mutate the book because it found
something.

### Expression / publish

Manuscript export · print · ebook · audiobook and spoken expression · excerpts · derivative teaching
material. Per §A4.13: **re-expression, not export** — a lecture is not a book in bullets.

---

## 3. The complete arc

```text
SEE → READ → UNDERSTAND → PROPOSE → AUTHOR DECIDES → STRUCTURE → DEVELOP → REVISE → EXPRESS
```

## 4. Three thresholds

Everything else is increment. These three change what the Studio *is*:

| | Threshold | What changes |
|---|---|---|
| **5½** | MAIA becomes a real reader | the system can form a reading of the Work's structure |
| **6** | Sovereign adoption | the member can turn a reading into authoritative structure — by one explicit act |
| **WWI** | Whole-Work Intelligence | MAIA can perceive the Work as a developing whole |

The third is where Writer's Studio becomes substantially more than a manuscript editor. The
architecture built at 5½ and 6 matters precisely because of it:

> **When MAIA eventually sees the whole book, seeing must never have quietly acquired the right
> to write it.**

---

## 5. What this file does not do

- It does not enter any unit into the programme (**§A3.1**).
- It does not change any node state on the Programme Board.
- It does not lift **BUILD MODE: CLOSED**, and it does not lift the Canvas / Phase 1 freeze.
- It does not assert that 05A or 05B-5a/5b/5c exist on canonical. §0 establishes that they do not.
