# Writer MAIA — Field Containment

**Status:** Ratified 2026-08-06. Foundational architectural constraint, founder-authored.
**Nature:** Governing law, not a feature specification. Future designs for Writer MAIA
are evaluated *against* this document; they do not redefine it.

**Not indexed in `MEMORY.md` — deliberately.** At ratification the memory index was past its
character ceiling and loading only partially; adding an entry risked silently dropping an
already-ratified item from the loaded window. The index update is deferred until the index
architecture is repaired. **Absence from the index does not indicate absence of ratification** —
this document is the canonical source and is sufficient for governance on its own.

**Provenance — this law elevates, it does not invent.** The invariant already existed as
developer intent in the writing surfaces (see Appendix). What changed on 2026-08-06 is its
standing: from a convention held by hand in code comments to a constitutional constraint.
That distinction matters — the boundary was discovered in the architecture, not imposed on it.

Sibling of [`WRITER_STUDIO_AUTHOR_STUDIO_DISTINCTION_2026-08-04.md`](./WRITER_STUDIO_AUTHOR_STUDIO_DISTINCTION_2026-08-04.md).
Governed by [`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`](./CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md).

---

## 1. Purpose

Writer MAIA exists as a **distinct field** because a work is not a person.

Elsewhere in the platform MAIA companions a member, a relationship, or a practitioner.
In the writing surfaces it attends a *work* — an object with its own continuity, its own
materials, and its own duration. That is a different constitutional relationship, and it
is only real if it has an edge. Without containment, "Writer MAIA" is member MAIA with a
different prompt, and the distinction collapses on first commit.

The field is what makes the relationship real. This document defines the field.

---

## 2. Containment Principle

> **Writer MAIA is a bounded conversational field whose continuity belongs to the work,
> not to the member.**

What the field knows is a property of the work. It is not a view onto the member.

---

## 3. Architectural Consequences

1. **No memory bleed.**
   Content originating in the writing field — manuscript text, attached materials, margin
   notes — may not be written into member-scoped memory (atoms, semantic memory,
   conversational recall). Those loaders are member-keyed by construction; anything landing
   there surfaces at `/maia` whether or not that was intended. Containment is enforced at
   **write** time, not at read time.

2. **No door out.**
   The writing surfaces do not link to the member MAIA conversation as their reflective
   affordance. Reflection either happens inside the writing field or it does not happen yet.

3. **No shared conversational thread.**
   A writing-field exchange is not a turn in the member's ongoing MAIA conversation.

4. **Separate continuity and persistence.**
   Distinct storage, distinct history, distinct continuity. The work's thread resumes as
   the work's thread.

5. **Crossing the boundary requires an explicit, user-initiated consent event.**
   No implicit, inferred, or convenience-motivated transfer in either direction.

### 3.1 The boundary is bidirectional

Ruled 2026-08-06. Not for cleanliness — **to preserve authorship.**

If member MAIA silently carries knowledge of the writer's life into the writing room, the
work is no longer emerging solely from what the writer chose to place before it: the field
arrives already populated. Conversely, if the manuscript influences the member's ongoing
MAIA conversation without an explicit crossing, the work escapes its own context.

> **Invariant.** Everything Writer MAIA knows is there because the writer intentionally
> brought it into the writing field. Everything outside the writing field remains outside
> until the writer intentionally carries it across.

### 3.1.1 Thresholds present crossings; they do not perform them

Ruled 2026-08-06.

> **Keep authorizes retention in the source field. It does not authorize crossing into the
> writing field.**

Proximity, retrieval, and prior retention may not substitute for the crossing act. §3's
requirement of an explicit person-initiated gesture makes the person — not the system — the
creator of the crossing.

A **threshold** may therefore expose candidates from another field without crossing them.
A threshold may: perform member-scoped read-only retrieval; show eligible material; identify
where each candidate came from; let the writer decide whether to carry a specific item
across; and serve as the audited choke point for that presentation.

A threshold may **not**: prepopulate a manuscript, project, canvas, or writing-field memory;
treat Keep as permission to cross; persist an item into the writing field without a separate,
explicit per-item gesture; infer that opening a threshold surface means "import everything
shown"; or allow later persistence to absorb threshold material automatically.

**`lib/bookStudio/mirrorSources.ts` is a permitted threshold — not a constitutional
exception.** Its permission is conditional on remaining read-only, and that condition is
mechanically asserted (§4.3). Verified read-only at ratification: `SELECT` only, no
`INSERT`/`UPDATE`/`DELETE` path. If any threshold surface persists or silently seeds a
candidate, that behavior is a violation, not an inherited allowance.

### 3.2 The field, not the file type

Every persisted artifact created within Writer Studio — **conversations, notes,
reflections, analyses, and derived structures** — belongs to the writing field by default.
It does not enter the member's broader MAIA memory unless the user performs an explicit
transfer gesture.

This keeps the rule about *the field*, rather than tying it only to manuscript text.
Derived artifacts are the likeliest leak: they do not look like manuscript, so they are the
ones a future implementation will be tempted to treat as ordinary member memory.

---

## 4. Temporal Constraint

**This must be implemented before any writing interaction persists data.**

Once writing content enters member-scoped memory the architecture is effectively
irreversible without compromising provenance and future prompts. Material that has already
shaped prompts cannot be un-surfaced; deletion does not restore the boundary.

The constraint is free to honor today and expensive at first commit. It is therefore a
**precondition of building**, not a property of what gets built.

### 4.1 The named trigger — Canvas Phase C

"Before persistence" is a vague warning. The project has a concrete event instead:

> **Canvas Phase C** — `app/book-studio/canvas/page.tsx`, docblock:
> *"Pending Phase C (MAIA integration): move state from localStorage → database."*

That migration is the first-persistence moment. The gate, in checkable form:

> **No Phase C implementation may merge until Writer MAIA field containment has been
> implemented and verified.**

A reviewer can evaluate that against a diff. This is the quality the rule is meant to have:
**testable**, not merely stated.

### 4.2 Two phases, stated separately

The gate must not present a green static check as proof of a runtime mechanism that has no
subject yet. It therefore has two phases, and only the first is available today:

> **The construction boundary is enforceable now:** writing-field persistence must not
> acquire member-scoped material without a per-item crossing authorization.
>
> **Full containment verification remains unavailable** until writing-field persistence
> exists.

Enforced now (§4.3). Unavailable, and honestly named as unavailable, until Phase C ships.

### 4.3 The enforcing mechanism

`scripts/check-writer-field-containment.ts` — run as `npm run check:writer-containment`,
wired into the pre-commit gate written by `scripts/setup-githooks.sh`.

It encodes three rules:

1. **`threshold-must-stay-read-only`** — a listed permitted threshold that acquires a write
   statement fails. This is what makes §3.1.1's allowance conditional rather than blanket.
2. **`no-persistence-from-member-scope-without-crossing`** — a writing surface that reaches
   `member_memory_atoms` or `personal_spirals` *and* persists, without consuming a per-item
   crossing authorization, fails.
3. **`unlisted-member-scope-reader`** — a new reader of member-scoped memory from a writing
   surface fails until deliberately listed. A new reader is a governance event, not a silent
   addition; this holds even for a path that already carries crossing authorization.

**Verified by negative test at authorship**, not merely by observing green: each rule was
made to fire against a deliberately constructed violation, and the tree returned to green
after removal.

**Honest limits.** Static text analysis; it cannot prove absence of derivation through
indirection. The persistence half passes **vacuously** today because writing-field
persistence does not exist. A green result means *the violation has not been constructed* —
never *containment is verified*.

**Path scope.** Writer's Studio has no ruled route (canon marks route identity UNRULED), so
the check enumerates the concrete surfaces canon names rather than inventing one. That list
must be revisited when a route is ruled.

**Not wired to branch protection.** CI deploys are disabled here (no self-hosted runner), so
the enforcement surface is the pre-commit hook, which is real but local: a contributor who
bypasses hooks bypasses this. Do not cite it as structurally preventing a merge.

---

## 5. Scope

- **Governs:** Writer Studio.
- **Explicitly undecided:** whether it extends to the rest of Author Studio. That question
  is open and must be ruled on its own terms, not inherited by proximity.

### 5.1 The law governs utterance, not knowledge

Ruled 2026-08-06. §3's containment is a constraint on **flow**, not on what Writer MAIA may
know. It must not be read as a limit on depth of knowledge.

1. **The library is shared and inert.** Knowledge of writing, craft, publishing, creative
   psychology, and the literary and contemplative traditions is common inheritance. It is
   not member data and is not field-bound. The library, its retrieval, and the reasoning
   substrate may all be shared across every instance of Writer MAIA.

2. **Every utterance about a particular work is field-bound.** The moment MAIA says
   something about *this* work, that utterance belongs to the field in which it was formed.

3. **Field-boundedness depends on the object of the utterance, not on the origin of the
   supporting knowledge.** An observation drawn entirely from shared craft knowledge is
   still particular the instant it is *about* this manuscript. There is no layer of the
   library whose output is exempt.

4. **Expanding the library never expands MAIA's authority over the work.** A deeper library
   expands what MAIA may reflect and invite; it expands what MAIA may assert by exactly
   zero. The library may therefore deepen indefinitely without constitutional amendment.

**Under clause 4** — comparison is permitted; classification is not. *"This passage reminds
me of Baldwin"* invites recognition. *"This is a Baldwin move"* assigns identity. The first
offers the writer something to see; the second tells them what their work is. This is an
application of the authority rule, not a separate doctrine, and it generalizes to any
utterance that would name what the work is rather than show the writer what is there.

**This section is a consumer of authority, not a source of it.** Clause 4 exists to protect
invariants ruled elsewhere — chiefly that the system may never become more certain than the
creator, that MAIA is spiritually intelligent but never spiritually authoritative, and the
cultural-sovereignty invariant governing traditions whose vocabulary is not ours to
translate. Those are cited, not restated here; this document does not become their home.

**Deliberately not canonized:** any layer-by-layer taxonomy of the library. Such taxonomies
are design interpretation and may evolve. The clauses above hold regardless of how the
eventual implementation is structured, so the architecture can change without requiring
constitutional edits.

**This document is a precondition, not an authorization.** It does not lift the Writer's
Studio Phase 1 re-walk from W1.

---

## Appendix — Verified state at authorship (branch `feature/labtools-redesign`, `f5c5b7ab9`)

Recorded so a future session can tell how much of this is already true.

- **No door out exists in the writing surfaces.** No `/maia` link in `app/book-studio/**`.
  (The two `href="/maia"` occurrences live in `app/studio/threshold/page.tsx` — the
  practitioner Studio, a different surface.)
  *A previously stated "Reflection with MAIA →" link on Studio Home does not exist; that
  claim was incorrect and is retracted here.*
- **The containment instinct is already in the code as comments, not as enforcement:**
  - `app/book-studio/layout.tsx` — "Soul Mirror does NOT belong here — it lives at
    `/maia/soul-mirror` … separate doorway."
  - `app/book-studio/workbench/page.tsx` — "MAIA is silent in this room."
- **No Writer MAIA endpoint exists.** No reflection route targets a manuscript.
- **Canvas state is `localStorage`**, and its own docblock names
  *"Pending Phase C (MAIA integration): move state from localStorage → database."*
  **Phase C is the first-persistence moment this document's §4 binds.**
