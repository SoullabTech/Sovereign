# Long-Arc Creative Continuity — Candidate Capability

**Status: Cat 1 — Preserved direction. Held, not authorized.**
**Not ratified · not selected · not scheduled · no build authorization.**
Date: 2026-07-30 · Origin: Jondi (capability), Kelly (formulation)

This document preserves a direction so it can be cited and ruled on. It authorizes nothing.
It is **not** an implementation roadmap item — see §4.

---

## 1. The capability

> The Studio helps writers travel across years of journals, notes, talks, manuscripts, research,
> and other creative work, bringing related material back into view **with clear provenance**, so
> the connections and evolution of their own thinking become visible **to them**.

    The Studio gathers.
    The Studio juxtaposes.
    The Studio preserves provenance.
    The author discovers the meaning.

## 2. The governing invariant — Revelation, Not Interpretation

> The Studio may **reveal relationships within** a writer's own work.
> It does **not author higher-order meaning about** that work.

**Admissible:**
> "You wrote about this idea in a journal from 2019, a conference talk in 2022, and Chapter Four
> of your manuscript."

**Inadmissible:**
> "The central theme of your life's work is belonging."

The first preserves authorship. The second **transfers interpretive authority from the writer to
the system**. This distinction must remain explicit wherever this capability is discussed.

The promise, in one sentence:

> **The Studio brings your own work back into view. What it means remains yours to discover.**

## 3. Why this is constitutional, not stylistic

This is the Constitutional Direction of Authority applied to a body of work: authority moves
upward through authored experience; the system may not manufacture higher-order meaning. Naming a
person's life-theme is the system authoring meaning *about* them — the displacement the direction
constraint exists to prevent.

It is also what makes the capability **survivable for a scholar**. A doctoral candidate can cite a
juxtaposition. They cannot cite a machine's account of their own intellectual evolution. The
discipline is not a limitation on the feature; it is the reason the feature can exist at all in
academic work.

Related held direction: `RELATIONAL_DOORWAYS_CANDIDATE_2026-07-19.md` — *"AIN does not preserve
the field; it keeps the doorways."* Same shape: the system holds the opening; the person crosses.

## 4. Why this is not a roadmap item

It is not "search across documents." It is the eventual convergence of **corpus management ·
provenance · temporal continuity · identity · permissions · authorship · retrieval · and
constitutional limits on inference**.

It shapes many future decisions rather than fitting into a release. Treating it as a schedulable
feature would be a category error.

**A body of work is broader than books** — journals, essays, lectures, podcasts, research,
correspondence, unfinished manuscripts, conference talks, dissertations, articles, future books.
The Studio should not treat these as isolated projects; over years it should help the author see
the conversation running through all of them.

## 5. Known blockers (facts, verified 2026-07-30)

- **`library_sources` has no member-scoping column.** The nearest thing to a Source table cannot
  express member ownership. Adding `member_id` to a populated shared-corpus table (2,228 rows)
  requires a backfill ruling: NULL = shared vs orphan.
- **`Suggestion` and `Release` are absent from the schema entirely.**
- This territory overlaps capabilities **held under freeze**: pattern attunement, cross-layer
  synthesis, member-facing "field state". No part of this candidate lifts that freeze.

## 6. What would be required before any build

A founder ruling on:
1. whether juxtaposition-with-provenance is admissible under the freeze, and at what scope;
2. member scoping and backfill for `library_sources`;
3. what counts as a "connection" the system may surface without interpreting;
4. whether surfacing is member-pulled or may ever be ambient (cf. the Daily Anchor
   standing-consent gate — eligibility must originate in a member act, not a deploy flag).

---

**Bearing:** *"Not because it makes MAIA more powerful, but because it makes the author more
present to their own work."*
