# Superseded Implementation Surfaces

Places where shipped implementation still reflects thinking the ruled model has moved past.

**No edits were made. Each entry states location, why superseded, whether currently reachable,
whether currently harmless, and which future gate owns it.** "Harmless" is a statement about the
present configuration only.

---

## 1. Graduation copies content into a file

**Location:** `lib/workbench/graduate.ts`; `app/api/book-studio/drafts/from-group/route.ts`

**Why superseded:** it resolves each card and writes the *content* into a markdown file
(`resolvedSections.push('## ' + title + '\n\n' + resolved.content.trim())`, then `writeFileSync` into
`docs/book-studio/drafts/<slug>.md`). That is **copy semantics** on a substrate whose stated
invariant is that cards are pointers and Expressions do not consume Field Objects. It also writes to
the server filesystem in a founder-owned directory rather than to a member-scoped store.

**Currently reachable:** founder only — the route is `requireFounder()`.

**Currently harmless:** yes, for members. The member surface passes `canGraduate={false}` and the
server gate refuses regardless of what renders.

**Future gate:** ruled canon states `graduate.ts` must be superseded **before member exposure**. The
gate is member exposure of graduation, not deployment of the current release object.

---

## 2. Shelf flattening

**Location:** `app/api/book-studio/workbench/shelf/route.ts` — `.flat().sort((a,b) => …createdAt…)`

**Why superseded:** the fan-out merges every adapter's results into one undifferentiated,
date-ordered list. Source identity survives per card but not in the list's structure, so the Shelf
cannot express that material from different acts is different in kind — the distinction the Field /
Reference model rests on.

**Currently reachable:** yes. Founder searches `uploaded`; members search `keep`. Because each role
currently has exactly one adapter, the flattening is **unobservable today**.

**Currently harmless:** yes, and only because no role has two adapters.

**Future gate:** named explicitly — Shelf flattening blocks the second adapter.

---

## 3. Manuscript-as-container

**Location:** `manuscript_sections`, `manuscript_working_drafts`, `manuscript_renders`;
`lib/manuscript/types.ts`

**Why superseded (partially):** the manuscript model treats a work as a container of ordered sections
with a single body. The ruled model puts the durable object in the Field and treats an Expression as
one thing that emerges from a relationship, not as the container of it. `lib/manuscript/types.ts`
still carries five `TODO(phase-2)` shape questions from the container era.

**Currently reachable:** yes — this is the live manuscript path.

**Currently harmless:** yes. `member_written` provenance already produces no `manuscript_sections`
rows, so the blank path does not assume a container. The assumption survives only on the
`member_uploaded` path, where it is accurate.

**Future gate:** unowned. No ruling found in this pass assigns it.

---

## 4. `studio_projects` — a prior Project identity

**Location:** table `studio_projects` (`id`, `member_id`, `team_id`, `name`, `description`, `color`,
`is_archived`), **0 rows**

**Why superseded (possibly):** it encodes a Project as a named, colored, archivable folder owned by a
member or team. The ruled ontology distinguishes Field / Project / Project Development and makes the
Field the platform root, with Studios only referencing. A folder-with-a-color is the pre-ruling
shape.

**Currently reachable:** unknown from this pass — the table exists and is empty; no consumer was
traced.

**Currently harmless:** yes, by emptiness.

**Future gate:** **B2 is unruled** (see open questions) — whether this is the Project, a colliding
name, or scaffolding to retire has not been decided. It should not be assumed either way.

---

## 5. `Return to Shelf` erases the only trace

**Location:** `lib/workbench/arrange.ts` (`returnToShelf`), persisted through
`workbench_tables.layout`

**Why superseded:** with Reference ruled as a durable layer distinct from Placement, removing a
Placement must never remove the Reference. Today Placement is the only artifact, so removing the last
one destroys all evidence the relationship existed.

**Currently reachable:** yes — it is a shipped member verb.

**Currently harmless:** yes in effect, because no Reference layer exists to be wrongly destroyed.
The behavior is correct for what is modelled and wrong for what is ruled.

**Future gate:** owned by A1 — what act creates a Reference. Until that is ruled, there is nothing
for `Return to Shelf` to preserve.

---

## 6. `isSanctuary()` — an uninvoked guarantee

**Location:** `lib/workbench/sanctuary.ts`

**Why superseded:** `WORKBENCH_ARCHITECTURE_v0.md` §8 describes it as the belt-and-suspenders layer
guarding single-`resolve` paths. It has **no callers**; adapters filter inside their own queries.

**Currently reachable:** no — dead code.

**Currently harmless:** yes. The effective boundary is enforced in both adapter paths.

**Future gate:** recorded as drift, to be reconciled separately. Explicitly **not** to be wired
ceremonially to make the document look fulfilled.

---

## 7. Single-table assumption in the member surface

**Location:** `app/maia/workbench/page.tsx` — `findOrCreateTable` uses
`ORDER BY updated_at DESC LIMIT 1`

**Why superseded (conditionally):** if a Project is ever bound to a table, one-table-per-member
silently collapses distinct projects into one surface.

**Currently reachable:** yes.

**Currently harmless:** yes — a deliberate deferral under §12, not an oversight, and no project
binding exists.

**Future gate:** B1 / B3.

---

## Summary of the pattern

Every entry above is harmless **because of a configuration, not because of a design**: one adapter
per role, an empty table, a founder-only gate, a missing layer. Each becomes live the moment its
gate opens. That is the reason to record them now rather than after the gate moves.
