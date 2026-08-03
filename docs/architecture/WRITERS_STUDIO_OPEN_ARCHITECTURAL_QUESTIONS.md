# Writer's Studio — Open Architectural Questions

**Inventory only. Nothing here is solved, and nothing here is a proposal.**

Grouped by subject. Each entry states where the question lives and what its current status is. A
question appearing here is *not* evidence that it should be answered now.

---

## A. Project References

**A1 — What is the first member act that establishes a relationship between a Field Object and a
Project?**
Source: `docs/architecture/PROJECT_REFERENCE_BIOGRAPHY_RECORD_2026-08-02.md` §3.
Status: **deliberately unresolved, recorded on canonical.** Candidates: explicit member declaration ·
first placement · another member-authored act. Phrased at the level of the act rather than the
Canvas gesture so a future Studio that creates the relationship without placement does not force a
model change.

**A2 — May a Reference accumulate counters at all?**
Source: same record, §4.
Status: constrained but unresolved. A Reference may accumulate member-authored or objectively
observable facts; it must not accumulate interpretive judgments. Whether `last_revisited` /
`placement_count` may exist requires a separate ruling on purpose, consent, retention, and whether
they may influence retrieval.

**A3 — Where does relationship history live, given that placement cannot carry it?**
Source: same record, §2. Status: unresolved; no substrate exists.

## B. Projects

**B1 — Is a Workbench Table the Project, or an arrangement surface belonging to a Project?**
Source: `WRITERS_STUDIO_PHASE_3_PROJECTS_2026-08-01.md`.
Status: recorded, not ruled. Schema fact: `workbench_tables` has no `living_work_id` and no FK.

**B2 — What is `studio_projects`?**
Status: **unruled.** Table exists with 0 rows and predates the ruled ontology. Whether it is the
Project, a colliding name, or superseded scaffolding is undetermined.

**B3 — Multiple tables / multiple projects per member.**
Source: `WORKBENCH_ARCHITECTURE_v0.md` §12 — "schema supports many; v0 UI ships with one."
Status: deliberate deferral, lift conditioned on lived contact.

## C. Phase sequencing

**C1 — Model A vs Model B phase map.**
Status: **held open.** To be reconciled deliberately after acceptance — explicitly not by building
or renumbering.

**C2 — 1C/1D vs 3A/3B overlap.**
Status: **unruled**, with a standing instruction not to resolve it by building.

**C3 — Phase 3 gate.**
Status: #875 / #877 / #878 are merged, but merge is not the walk. Phase 3 remains recorded, not
authorized.

## D. Expressions and manuscripts

**D1 — `lib/manuscript/types.ts` — five `TODO(phase-2)` markers**, all shape-collapse questions:
pick one of `{number, chapterNumber}` · collapse `content → fullContent` · collapse
`{excerpt, content_excerpt}` · introduce a wrapper type · verify whether `Part` generalizes against a
second member book.
Status: deferred in code, unowned by any ruling found in this pass.

**D2 — `lib/manuscript/adapters/elementalAlchemyJsonToManuscript.ts` — `TODO(phase-1, step-1c)`**:
inspect three sibling files before generalizing the adapter. Status: open.

**D3 — Does an Expression belong to a Project, a Living Work, or both?**
Substrate fact: `living_work_expressions` binds an expression to a `living_work_id`. No project edge
exists. Status: not posed as a ruling anywhere found in this pass; recorded here as a gap.

## E. Development Record

**E1 — Layer 3 is named `Project Development Record`** (ruled; never "Development Memory", which
collides with member-scoped `developmental_memories`).
Status: **named but unbuilt** — no table, no module, no route.

**E2 — What may MAIA do with it?** Bounded by ruling: revealing recorded development is permitted;
performing authorship is not. Status: ruled in principle, no implementation to test it against.

**E3 — Promotion L2 → L1** occurs only by member act; the system may offer, never perform.
Status: ruled; no implementation.

## F. Workbench internals

**F1 — §5 "source-native id" vs the atom-as-canonical-anchor ruling.**
Status: **unreconciled.** For `keep` the two coincide (the atom *is* the object the gesture created).
For `ideas` / `journals` / `decisions` the source row and the atom are different objects, which is
why those adapters remain unregistered.

**F2 — Shelf flattening.** A named gate: flattening blocks the second adapter. Status: gate stated,
not lifted; `shelf/route.ts` still does `.flat().sort()`.

**F3 — `isSanctuary()` has no callers.** The documented second sanctuary layer exists as code and is
never invoked. Status: recorded as drift, deliberately not wired.

**F4 — 2D placement / nested piles.** Deferred per §12 pending lived contact.

## G. Governance instruments not yet closed

**G1 — Founder felt-grammar walk** for the Workbench verb set: *do these feel like arranging insight,
or managing records?* Status: **not performed.** It is the stated deployment gate.

**G2 — Member Experience Design Constitution — yield clause.** Status: **unruled**; the charter is
recorded but not operative.

**G3 — Release Record for Phase 1.** Status: not written. Blanks are to stay blank.

---

**None of the above is answered by this document, and the existence of an entry here is not a reason
to answer it.**
