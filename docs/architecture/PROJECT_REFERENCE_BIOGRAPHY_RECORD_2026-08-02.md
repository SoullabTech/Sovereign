# Project References — the biography of a relationship

**Status: RECORD ACT. Not a ruling, not canon, not an authorization to implement.**

This document performs one act only: it *records* a distinction the current implementation cannot
express. It settles nothing. Point 3 is deliberately left open, and closing it is a Ratify act
reserved to the founder. See `feedback_state_changing_authority_is_explicit` — Discover / Draft /
Record change no state; Ratify / Implement do.

Occasion: founder observation, 2026-08-02, that the Studio's architecture has shifted from
document-centric to relationship-centric — from *"how do we help someone write a manuscript?"* to
*"how does a work come into relationship with a person's Field over time?"*

Applies the discipline of the ratified Member Field re-centering to References, which that canon
records as **not ratified** (a post-hoc addition).

---

## 1. Three biographies, which must remain distinct

| Biography | Of what | Status |
| --- | --- | --- |
| **Field Object** | the insight itself | **Exists** |
| **Project** | the work itself | **Planned** — the `Project Development Record` (Layer 3) |
| **Project ↔ Field relationship** | that a work drew an insight into its orbit | **Missing** |

The first two are not substitutes for the third. How an insight has lived, and how a work has
evolved, are different histories from how *this insight and this work* have been in relationship.

**Verified substrate for the first:** `member_memory_atoms` carries `kept_at`, `last_touched_at`,
`last_surfaced_at`, `surface_count`, `still_here_count`, `marked_breakthrough_at`, plus
`member_lens_passes`. The insight's own biography is real and already accumulating.

**Verified for the third:** nothing anywhere records it.

---

## 2. Current architectural limitation

**Placement is the only artifact representing the relationship today** — and placement cannot carry
history, by construction:

- Placements live in `workbench_tables.layout` (JSONB) as `{ id, source, ref }`. **No timestamp, no
  predecessor, no lifecycle.**
- The layout is **overwritten wholesale** on every `PATCH /api/book-studio/workbench/tables/[id]`.
  There is no append-only trace and no prior version to diff against.
- `Return to Shelf` removes the pointer. **Removing the final placement erases any evidence that the
  relationship ever existed.**

Consequence: the system currently records *thinking* — the arrangement in front of the member right
now — and does not record the *relationship* the thinking was expressing. The two have been
conflated because placement was the only artifact available to conflate them into.

This limitation is the finding. It is not a defect report against #877/#878, which correctly
implemented arrangement; it is the observation that arrangement was never the relationship.

---

## 3. Open constitutional question — deliberately unresolved

> **What is the first member act that establishes a relationship between a Field Object and a
> Project?**

Candidates include explicit member declaration, first placement, or some other member-authored act.
First placement may well turn out to be the right answer.

The question is phrased at the level of *the act*, not *the Canvas gesture*, on purpose: if a future
Studio establishes that relationship without any placement, the model must not have to change. A
question phrased as "does first placement create a Reference?" silently binds the ontology to
today's interaction.

**This must be resolved before implementation, not during it.** A Reference that comes into being
without a member act is a relationship the system asserted on the member's behalf — which the Member
Field amendments already forbid in the adjacent case (promotion L2→L1 only by member act; the system
may offer, never perform).

---

## 4. Governance constraint

> A Reference may accumulate **member-authored or objectively observable facts** about the
> relationship. It **must not** accumulate **interpretive judgments**.

| History — admissible | Interpretation — inadmissible |
| --- | --- |
| First referenced: 2026-08-02 | Important insight |
| Placed on Canvas | Core theme |
| Removed from Canvas | Strongest thread |
| Member added a rationale | Frequently revisited, therefore central |
| Linked to Development Note #17 | |

The left column is what happened. The right column is a verdict about what it meant — and the member
did not author it.

**Note the shape of the last inadmissible row.** It is the dangerous one, because it is built
*entirely* out of admissible facts. Counting is history; "therefore central" is interpretation. The
boundary is not the data, it is the inference drawn from it. A Reference may show a member that they
returned to something four times. It may not conclude anything from that, rank it against anything,
or surface it because of it.

Related hazard, recorded not ruled: `last_revisited` and `placement_count` are one renaming away
from engagement telemetry. The Daily Anchor standing-consent gate exists because surfacing had to
originate from a member act rather than a deploy flag; the same reasoning applies here before any
counter is added.

---

## What this record does not do

- It does not authorize a schema, a migration, a slice, or a phase.
- It does not rule on what creates a Reference (§3 is the open question).
- It does not reopen or amend the ratified Member Field re-centering.
- It does not bear on the Workbench deployment hold, which stands unchanged.

The next act in the Workbench lane remains the founder's felt-grammar walk.
