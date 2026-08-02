# Writer's Studio — Phase 3: Projects Become Real

**Status:** RECORDED (Kelly, 2026-08-01). Not authorized for build. Sequence gate unmet.
**Author of record:** Kelly. This document records the directive verbatim in §1–§6 and adds
one grounding section (§7) reporting what the existing schema already implies. §7 is
observation, not ruling.

---

## 1. The question Phase 3 answers

Phase 2 gives members a thinking surface: Shelf, cards, piles, arrangement, return.
Phase 3 answers: **How does a member sustain several bodies of work without losing
continuity between them?**

This is where the Writer's Studio stops being one workbench and becomes a life of projects.

## 2. Core outcome

A member can have several active projects at once — a book, a course, a talk, a retreat,
an article, research, an unnamed emerging work. They enter Writer's Studio, choose one,
work inside its Canvas, leave, enter another, and later return to each exactly where they
stopped.

## 3. The load-bearing modeling question

> Is a Workbench Table itself the project, or is it an arrangement surface belonging to a
> Living Work?

Not to be automatically equated. The safer model:

```text
Living Work / Project
    ├── Canvas arrangement
    ├── WriterField expressions
    ├── Keeps and other field objects
    ├── return state
    └── later Design / Publish state
```

A Table is the project's **current arrangement surface** — not the enduring project itself.
This preserves the established distinction:

- **Living Work:** what endures
- **Canvas/Table:** where attention and arrangement happen
- **Expression:** what takes form

## 4. Slices

- **3A — Project chooser.** On entering Writer's Studio: continue an existing project, or
  begin a new one. Unnamed projects allowed. No inferred "current project". No automatic
  selection based on recent activity. **The member chooses.**
- **3B — Bind Canvas to project identity.** Each project gets its own persisted Workbench
  arrangement. The same member switches projects without cards, piles, or names bleeding
  between them.
- **3C — Per-project writing continuity.** Each project remembers: active writing
  expression; caret and selection; real page/container scroll; current pile or group; open
  tools; last chosen posture. This is where the previously discovered **inert
  scroll-restoration defect** is finally fixed correctly — keyed to the actual project and
  the real scroll container.
- **3D — Project switching.** A→B→A. Before leaving a project: flush current writes;
  confirm revision; persist arrangement and return state. Never keep competing unsaved
  local project states.
- **3E — Several forms, without rigid typing.** A project may optionally say what form it
  is currently taking (book / course / talk / workshop / article / research / not yet
  known). Form stays **member-authored and revisable**. It guides the furniture offered; it
  does not lock the ontology.

## 5. What Phase 3 must not become

Do not build: a dashboard full of project metrics; AI-selected Current Focus; automatic
project relationships; cross-project clustering; permanent project types; multiple local
copies reconciled afterward; Design or Publish yet.

## 6. Acceptance

Phase 3 succeeds when a member can:

1. create three different projects;
2. leave each in a different state;
3. move between them;
4. return to the correct Canvas arrangement;
5. return to the correct writing and caret position;
6. see **no content or state leak** between projects;
7. keep one project unnamed;
8. choose what to work on without the system choosing for them.

**Decisive question:** *Does the Studio feel capable of holding a creative life, rather
than merely opening several documents?*

### Sequence

Phase 3 begins only after:

- #875 closes Start Writing;
- the active member-Workbench lanes become committed and reconciled;
- Phase 2's arrangement verbs are stable.

Then: project chooser → project-bound Canvas → per-project continuity → switching.
That gives Phase 4 a sound base for additional field objects and richer postures.

---

## 7. Grounding — what the existing schema already implies

*Observation as of 2026-08-01. Reported, not ruled. Steward question: "what architecture is
already implied by what exists?"*

**Gate state: UNMET.** [#875](https://github.com/SoullabTech/Sovereign/pull/875) (Start
Writing) is **OPEN**. [#877](https://github.com/SoullabTech/Sovereign/pull/877) (member
Workbench Keep slice) is **OPEN**, not merged, not deployed — its gate is still Kelly's
authenticated walk. Both sequence preconditions are unsatisfied. Phase 3 is recorded, not
opened.

**The proposed tree is already about two-thirds present in schema:**

| Tree branch | Existing substrate | State |
|---|---|---|
| Living Work / Project | `living_works` (`20260801000001_living_works.sql`) | Exists. Already plural-capable — the migration comment states explicitly that uniqueness per member is *deliberately not* encoded, "a member may steward multiple Living Works". `GET /api/sovereign/living-works` lists (no `LIMIT 1`). |
| WriterField expressions | `living_work_expressions` — open `expression_type`, `declared_by` + `declared_at` NOT NULL | Exists. Member declaration is structural, not inferable. |
| Canvas arrangement | `workbench_tables` (`20260522000003_workbench_v0.sql`) — `arranger_id`, `name`, `layout` JSONB | Exists, but scoped **to the member, not to a work**. There is no `living_work_id` column and no FK between the two tables. |
| Keeps / field objects | `workbench_uploads`; member-gesture atoms per #877 | Partially present; #877 not merged. |
| return state | — | **Nothing exists.** |
| Design / Publish state | — | Out of scope by directive. |

**Therefore the modeling question in §3 is not open in the schema — it is already answered
in the direction §3 prefers, and 3B is the missing edge.** `workbench_tables` is a
member-owned arrangement surface with no project identity. Binding it would add
`workbench_tables.living_work_id` (nullable, so existing unbound tables and unnamed
projects both survive), not merge the two concepts. Equating Table with Project would
require *collapsing* two tables that were authored separately — a harder change than
respecting the split.

**What Phase 3 would genuinely add, beyond what exists:**

1. `workbench_tables.living_work_id` — the arrangement→work edge (3B).
2. A per-project return-state substrate — no precedent in schema (3C). This is the only
   branch of the §3 tree with zero existing substrate, and the acceptance criteria most
   likely to be over-claimed. Note the standing rule: *storage is not standing* — a column
   is not a restored caret.
3. A member-facing chooser over an API that already lists (3A) — read path exists; the
   surface does not.
4. An optional member-authored `form` on `living_works` (3E).

**Two traps carried forward from prior lanes:**

- **Unnamed projects.** `living_works.title` is `NOT NULL`, softened by
  `20260801000002_living_work_title_optional.sql`. Acceptance criterion 7 ("keep one
  project unnamed") must be measured against the **canonical and production schema at the
  time acceptance is claimed** — not against this migration's text, and not against a
  measurement taken today. Deliberately not measured now: an early reading would itself
  become a stale referent.
- **The `atom ≠ Keep` discriminator.** `generated_by='member-gesture'` is what makes a Keep
  a Keep, and production has **zero** such rows. Do not describe the Canvas as containing
  member Keeps merely because the adapter exists — that becomes true only after #877
  merges, deploys, and a member performs the gesture.

---

## 8. Ruled sequence (Kelly, 2026-08-01)

Phase 3 is grounded but **not authorized**, because its two prerequisites are
*experiential*, not merely procedural:

- **#875** must prove a person can begin writing without importing or prematurely naming an
  expression.
- **#877** must prove members actually place, rearrange, leave, and return to their
  material.

Without those walks, Phase 3 would be designing project continuity around practices not yet
observed.

**Order:** walk #875 → walk #877 → merge/deploy both → project chooser → project-bound
Canvas → per-project continuity → switching.

**#875 walk must verify:** Start writing is primary · the field begins genuinely blank · no
Source or fake section is created · the first sentence saves · leave and return resumes
*Your writing* · duplicate untouched blank creation is prevented · no Living Work
relationship is inferred.

**#877 walk must verify:** a genuine member-kept item appears · the member places and groups
it · arrangement persists after leaving · source, atom, sanctuary posture, status, and
`return_preference` remain unchanged · uploads and graduation remain inaccessible · MAIA
remains silent.

**3A precedes 3B, deliberately.** The first Phase 3 implementation is the **project chooser
over existing Living Works** — not the schema edge. That lets members explicitly choose
among several works without yet claiming any existing Table belongs to one.

**3B follows lived use.** The `workbench_tables.living_work_id → living_works.id`
association is added only after a member has selected a work and entered its arrangement
surface — i.e. only once #877 proves the Table is used as an *enduring* arrangement rather
than merely visited once. When added it must be: member-authored · nullable · reversible ·
scoped to the same member · **never inferred from recency or activity**.

**No further Phase 3 architecture is needed until those two rooms produce evidence.**

---

## 9. State correction — 2026-08-02

**All three PRs have merged.** #875 `43857edac` (02:53:40Z) · #877 `fad4fe906` (02:38:16Z) ·
#878 `099de7aae` (03:06:49Z).

**This does not open Phase 3.** §8 named the prerequisites as *experiential, not
procedural*: #875 must **prove** a person can begin writing without importing or
prematurely naming; #877 must **prove** members actually place, rearrange, leave, and
return. A merge produces neither proof. Per the record, #875 merged **without its
corrections and without its walk**; #878 carries a workbench-scoped walk (`c49026716`) that
is explicitly **not** the Phase 1 walk. The evidence §8 required does not exist yet.

**Two rulings landed after this document was written, and both bind it:**

1. **Phase 1 is a release object, not a PR sequence** (Kelly, 2026-08-02 —
   `docs/product/WRITERS_STUDIO_PRODUCT_DEFINITION.md`, and charter
   [#876](https://github.com/SoullabTech/Sovereign/pull/876), still OPEN). The unit of
   acceptance is the Phase 1 Release Candidate — merged work + pending corrections +
   instrumentation + the experiential walk, accepted together. Its consequence is direct:
   **no new implementation lane opens until Phase 1 is a finished release object — the
   Canvas work (projects, thinking space, multiple works, the Studio environment) waits.**
   That clause names Phase 3.
2. **Member Field re-centering, RATIFIED 2026-08-02** (`6899223db`, amendments
   `a023da3eb`) — governs Phases 3 onward and **applies before Phase 3**. It constrains
   future work and authorizes no implementation. Phase 3 as written here predates it and
   has not been reconciled against it.

**Open coherence question, recorded not ruled:** Phase 1's construction order already
contains **1C — introduce projects** (`Project → Canvas → WriterField`) and **1D — choosing
a project lands in the Canvas shell**. That overlaps what §4 calls 3A and 3B. Whether Phase
3 begins where Phase 1 ends, or whether 3A was always Phase 1's 1C under a different name,
is not settled here — the Product Definition governs, and the charter is unmerged. **Do not
resolve this by building.**

**Standing status is therefore unchanged: Phase 3 remains recorded, not authorized.** The
next evidence-producing act is the Phase 1 walk against the assembled release candidate —
not a Phase 3 slice.

---

## 10. Two phase models — held open deliberately (Kelly, 2026-08-02)

There is **implementation convergence but not release convergence**:

| Layer | Status |
|---|---|
| Implementation | #875, #877, #878 merged into trunk |
| Corrections | #880 **open** |
| Instrumentation | #879 **open** |
| Release acceptance | Phase 1 founder walk **not performed** |
| Production | **not deployed** as the accepted release candidate |

The §9 overlap between Phase 1's 1C/1D and Phase 3's 3A/3B is the visible symptom of two
models both present in the current documents:

- **Model A — sequential phases.** Phase 1 (1A, 1B, **1C Projects**, **1D Canvas shell**) →
  Phase 2 thinking in space → Phase 3 multiple projects. Projects *begin* in Phase 1.
- **Model B — capability phases.** Phase 1 = writing capability · Phase 2 = thinking
  capability · Phase 3 = **project capability**. Everything involving projects — *including
  the Canvas shell* — belongs to Phase 3.

**This is left unresolved on purpose.** The ratified Member Field Directive has moved the
conceptual center of gravity enough that the phase map deserves deliberate reconciliation
rather than the preservation of historical numbering that may no longer reflect the
architecture. ⛔ Do not resolve it by building, and do not resolve it by renumbering.

**Order of operations — corrected 2026-08-02.** The convergence table above is a historical
snapshot: **#879 and #880 have since merged, the assembled Phase 1 walk RAN, and it FAILED
at W8.** That failure produced three corrections — (1) WriterField click-to-focus,
(2) manuscript return by identity, both built in **#892**; and (3) explicit Field Object
declaration from the capsule surface, which has competing local implementations with
Implementation A selected only *provisionally* and still owing canonical discriminator
alignment, cleanup of ambiguous Keep language, consolidation around the governed
`keepSource()` capability, and authenticated member-path evidence.

The accurate chain is therefore:

```text
Correction 3 canon alignment landed/verified
   ↓
Correction 3 implementation finished + selected
   ↓
Assemble a SINGLE release candidate containing #892 + the selected Correction 3
   ↓  ⭐ identify that candidate BY SHA — a walk evaluates one named assembled
   ↓     object, never "the current branch"
   ↓
Fresh baseline-recorded fixture
   ↓
Re-run the COMPLETE Phase 1 walk from W1   ⛔ never a resume at W8
   ↓
Founder acceptance of the assembled release object
   ↓
Reconcile Model A vs Model B
   ↓
Authorize the next phase
```

⚠️ **Do not wait on #879/#880, and do not attempt founder acceptance** — the member journey
it would accept is still broken.

**Governance principle extracted from this exchange** (durable, generalizes beyond this
project): *Implemented · Integrated · Accepted · Released* are four distinct transitions,
each requiring different evidence. **A merge produces neither proof.** Treating them as
interchangeable is precisely what the Release Record discipline exists to prevent.
