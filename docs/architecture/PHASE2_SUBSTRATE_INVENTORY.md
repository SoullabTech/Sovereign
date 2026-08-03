# Phase 2 Substrate Inventory

**Answers two questions only: what already exists, and what does not yet exist.**
No code was changed. Nothing here authorizes building any of it.

Schema observed against production at audit time (candidate `bfdf5512c`).

---

## 1. Exists — with substrate and rows

| Concept | Table / module | Rows (prod) | Notes |
| --- | --- | --- | --- |
| **Field Object** | `member_memory_atoms` | 142 | Carries its own biography: `kept_at`, `last_touched_at`, `last_surfaced_at`, `surface_count`, `still_here_count`, `marked_breakthrough_at`, plus `member_lens_passes`. Provenance via `generated_by`; **0 rows are `member-gesture`** |
| **Living Work** | `living_works` | 3 | Member-scoped, deliberately plural |
| **Expression** | `living_work_expressions` | — | `living_work_id`, `expression_type`, `expression_id`, `declared_by`, `declared_at`. Open `expression_type`; declaration is member-attributed |
| **Manuscript** | `member_manuscripts` | 1 | `title` now nullable; `provenance ∈ {member_uploaded, member_written}` |
| **Manuscript body** | `manuscript_sections`, `manuscript_working_drafts`, `manuscript_renders` | — | Sections exist only for `member_uploaded` provenance |
| **Arrangement surface** | `workbench_tables` | 1 | `arranger_id`, `name`, `layout` JSONB |
| **Uploaded material** | `workbench_uploads` | 0 | Sanctuary column present; FTS on reviewed text only |
| **Ideas** | `member_ideas`, `member_idea_blocks`, `member_idea_recognition_events` | 29 | |

## 2. Exists — substrate present, unused or unwired

| Concept | Where | State |
| --- | --- | --- |
| **Project (a Project model)** | `studio_projects` | Table exists, **0 rows**. Columns: `id`, `member_id`, `team_id`, `name`, `description`, `color`, `is_archived`. Predates the ruled Field/Project/Project-Development ontology — see `SUPERSEDED_IMPLEMENTATION_SURFACES.md` §4 |
| **Multiple tables per member** | `workbench_tables` | Schema supports many; UI ships one (`findOrCreateTable` uses `ORDER BY updated_at DESC LIMIT 1`). Deliberate deferral per `WORKBENCH_ARCHITECTURE_v0.md` §12 |
| **Source adapter interface** | `lib/workbench/sources/types.ts` | `WorkbenchSource {kind, search, resolve}` + registry. Registered: `uploaded`, `keep`. Declared but unimplemented: `ideas`, `journals`, `decisions` |
| **Sanctuary second layer** | `lib/workbench/sanctuary.ts` | `isSanctuary()` exists and **has no callers**; adapters filter inside their own queries |
| **Graduation** | `lib/workbench/graduate.ts` | Reachable founder-only; hidden on the member surface. See superseded surfaces §1 |

## 3. Does not exist — no table, no module, no route

| Concept | Status |
| --- | --- |
| **`project_references`** | MISSING |
| **`placements`** (as a durable object) | MISSING — placement exists only as pointers inside `workbench_tables.layout` |
| **`project_development_records`** | MISSING |
| **`development_notes`** | MISSING |
| **Relationship history of any kind** | MISSING — nothing records that a work drew a Field Object into its orbit |
| **Project ↔ Workbench-table edge** | MISSING — `workbench_tables` has no `living_work_id` / `project_id` column and no FK |
| **Contextual retrieval / "worth revisiting"** | MISSING |
| **Project Shelf** (distinct from Field Shelf) | MISSING — one Shelf exists, fed by adapter fan-out |

## 4. Structural observations (facts, not proposals)

**Placement cannot carry history as currently modelled.** `workbench_tables.layout` holds
`{ id, source, ref }` with no timestamp and no predecessor, and is overwritten wholesale on every
`PATCH`. There is no append-only trace and no prior version to diff.

**Cards are pointers, not copies.** Content is resolved at read time via `adapter.resolve(ref)`.
Nothing in the arrangement path copies or consumes a Field Object.

**Two of three biographies have substrate; one has none.** The Field Object's biography exists
(§1). The Project's is planned as the `Project Development Record` (§3, missing). The
Project ↔ Field relationship has no representation at all.

**A Project model already exists and is empty.** `studio_projects` is unused. Whether it is the
Project of the ruled ontology, a different object with a colliding name, or superseded scaffolding
is **not determined by this inventory**.

**Expressions already have a declaration record.** `living_work_expressions` carries `declared_by`
and `declared_at` NOT NULL, so the "who declared this" property is already modelled for expressions
and not for references.

---

**This inventory answers "what exists." It does not propose what to build, in what order, or
whether to build it.**
