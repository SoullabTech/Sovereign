# Writer's / Author Studio — review of the twelve named capabilities

```text
STATUS ............. CAPABILITY REVIEW. Decision instrument. ⛔ Not a change.
REFERENT ........... production 8ca322891 · container start 2026-08-14T17:54:58.843279669Z
                     (bound and rebound twice this session)
IMPLEMENTATION ..... ⛔ CLOSED (founder ruling 2026-08-14)
STUDIO RELEASE ..... ⛔ BLOCKED — block still live (ecology anatomy §0.3)
METHOD ............. .claude/skills/maia-capability-review, under the Stewardship Constitution
```

⚠️ **Prior work carried forward, not re-run.** `docs/design/author-studio/WRITERS_STUDIO_ECOLOGY_ANATOMY_2026-08-14.md`
(canonical, **today**) already establishes the enduring objects, the territories, and the
naming contradiction. Its Part 0 and Part 1 are **cited, not re-derived**. What is new here is
**layer-2/3 liveness evidence** and the mapping onto the twelve named capabilities.

---

## 1. Liveness evidence (Class: production data, measured 2026-08-14)

```text
living_works               total=3    members=2    newest=2026-08-02   ← 12 days stale
living_work_expressions    total=0    declarers=0  newest=—            ⛔ NEVER USED
living_work_materials      total=0    declarers=0  newest=—            ⛔ NEVER USED
member_manuscripts         total=4    members=4
manuscript_working_drafts  total=4    members=4    newest=2026-08-14   ⭐ TODAY
working_draft_revisions    total=6                 newest=2026-08-14   ⭐ TODAY
manuscript_sections        total=430
manuscript_renders         total=0                                     ⛔ NEVER USED

agent_runs, 30 days, origin_route matching writers-studio|press|book-studio  =  0
```

⭐ **The shape of the Studio in one reading:** *writing and revising are alive today across
four members. Everything the Living Work ontology adds — belonging, expression, publication —
has never been used once. And MAIA has never been invoked from any Studio route.*

⚠️ Rule 1 applied: counts alone would have read as "the substrate is live." Distribution
(2 members) plus recency (12 days stale for Works, zero-ever for belongings) says otherwise.
⚠️ Rule 2: the four working drafts are member-authored (`saved_by=member` on revisions), so
this is real use, not fixtures.

---

## 2. The twelve capabilities

| # | Capability | Class | First broken seam |
|---|---|---|---|
| 1 | Work-centered home | **C** | arrival — founder walk FAILED 2026-08-14 |
| 2 | Living manuscripts | **B** | silent identity fallback |
| 3 | Transcript & material intake | **C** | the confirm-or-redraw step at import |
| 4 | MAIA as creative companion | **D** | ⛔ no composer, no context handoff — either direction |
| 5 | Memory with provenance | **ABSENT** | no claim substrate exists |
| 6 | Structural perspective | **C** | MAIA half absent; drawer half conditional |
| 7 | Writer-controlled meaning | **B** ⚠️ unexercised | 0 declarations ever made |
| 8 | Draft & revision continuity | **B** | — |
| 9 | Materials distinguishable from the Work | **C** | import writes sections, bypassing belonging |
| 10 | Multiple creative distances | **C** | design-only, non-canonical |
| 11 | Expression & publishing | **C** | 0 renders, 0 expressions ever |
| 12 | Human authorship explicit | **B** ⚠️ trivially | passes *because* #4 is absent |

⚠️ **`ABSENT` is used deliberately for #5.** The A–E scale presumes a surface to classify;
**D (facade)** would overstate the case, because nothing presents at all.

### 1 · Work-centered home — **C**

Exists (Class: source) — `app/writers-studio/page.tsx` + `HomeView.tsx`, rendering *Your
works* / *Your writing*, each linking by identity via `canvasForManuscript`. Work creation is
genuinely wired: `page.tsx:62,82` POST `/api/sovereign/living-works`.

⛔ **Layer 2 fails on the operative acceptance result.** `FOUNDER_STUDIO_HOME_WALK_VERDICT_2026-08-14`:
walk **FAILED**, failure point *arrival / action semantics*, *"every top card duplicates
something beneath it"*, *"the Studio is asking you to understand its architecture before it
lets you continue your work."* Interaction clarity **failing**; not ready for a user walk.

### 2 · Living manuscripts — **B**

Live and used **today** — 4 drafts across 4 members, 6 revisions, most recent today. Draft
concurrency guarded (`lib/manuscript/draftConcurrency.ts`, `20260731000001_draft_concurrency.sql`).

⚠️ Bounded gap: `selectManuscript` falls back to most-recent when the requested `?m` is absent
or unknown, and its own header names the hazard — *"an ignored identity is indistinguishable
from an absent one."* Safe for a one-manuscript member; degrades silently for others.

### 3 · Transcript & material intake — **C**

Exists: `/api/sovereign/manuscripts/ingest`, `/api/book-studio/import-docx`, workbench
uploads, `lib/manuscript/ingest/{parseUpload,segment}.ts`.

🔴 **First broken seam.** `segment.ts` splits on markdown H1–H3, `Chapter N`, **or any
all-caps line of 4–100 chars**. Its own doctrine header states: *"The member confirms or
redraws the cuts before anything is saved."* That confirm-or-redraw step was **not reachable**
by a real writer (member evidence, 2026-08-14): her question-family labels were cut into
chapters and she could find no way to refuse. ⭐ The capability is not missing — **the promised
member step is unreachable.**

### 4 · MAIA as creative companion — **D**

⛔ **The writer→MAIA crossing does not exist inside the Work.** Class A, both directions:
`app/writers-studio/canvas/page.tsx` contains **0** `<textarea|input|form>`; the Reflection
panel renders a heading, a module-scope constant (*"Reflection with MAIA will become available
when this Work can carry its context"*), and a *fold away* button, reached only through an
unlabelled 2px dot at 40% opacity. Across **189** `.ts` files in `lib/sovereign/` + `lib/maia/`:
zero matches for `manuscript · living_work · livingWork · working_draft · "book studio" ·
writers-studio`. No Studio surface calls any maia/oracle/reflection endpoint. Production
confirms: **0 studio-origin agent runs in 30 days.**

⭐ The placeholder is **honest, not deceptive** — it refuses to imply a capability that is
absent, which is the `studioMap` discipline applied to MAIA. ⚠️ And it still presented to a
real writer as breakage. Both are true.

⚠️ Residual, ⛔ unexamined: `chapter` (5 files) and `"the draft"` (1) in that same population.
The negative is scoped to the six terms named.

### 5 · Memory with provenance (suggested vs. recognized) — **ABSENT**

No claim record, no provenance axis, no surface. The governing design exists —
WS-HANDOFF-001 **R2** (⛔ no durable MAIA-authored `evidence_status`) and **R3** (refinement
mints a claim) — but it is **preserved and non-canonical** (`chore/preserve-ws-handoff-001` @
`29d62d927`) and explicitly authorizes no build. ⚠️ This capability cannot begin before #4.

### 6 · Structural perspective — **C**

Half exists: the Study Wall carries a **conditional** Structure drawer —
`page.tsx:180` *"no Structure drawer, and its absence is correct, not a gap"* — shown only when
the Work has structure. 430 `manuscript_sections` rows exist to populate it.
⛔ The other half — MAIA stepping back to see chapters, themes, gaps, sequencing — is #4, and
is absent. ⚠️ `manuscript_sections` carries **no temporal or authorship provenance**, so
structure cannot answer *who shaped this, or when*.

### 7 · Writer-controlled meaning — **B**, ⚠️ never exercised

Mechanism is real and wired: `refuseDeclaration` / `refuseBelonging` in
`lib/livingWork/domain.ts`, imported by **four live routes** under
`/api/sovereign/living-works/**`. Ownership is checked, not merely authorship;
`declared_by NOT NULL`; `CREATION_REQUIRES_A_MEMBER_ACT`.

⛔ **UNPROVEN in use: 0 expressions and 0 materials have ever been declared.** The guard has
never had to refuse anything a member did.

### 8 · Draft & revision continuity — **B**

Revisions written today; History drawer reads on open and re-reads after a kept version;
`canvasIdentity.ts` binds producer and consumer with a round-trip test so the `?id`/`?m`
divergence cannot recur silently. Exit guard flushes before manuscript swap.

### 9 · Materials stay distinguishable from the Work — **C**

The Living Work path is correct by construction: `living_work_materials` with
`declared_by NOT NULL`, a materials API, and a drawer whose placeholder is the member's own
sentence — *"What does this feed? In your words — or leave it unwritten."* Nothing attaches
automatically.

🔴 **First broken seam: the import path bypasses it entirely.** Ingest writes
`manuscript_sections` — i.e. straight into the Work — with no materials stage in between. So
the invariant holds where it is exercised (0 rows) and is silently absent on the one path a
writer actually used. ⭐ This is the same seam as #3, seen from the other side.

### 10 · Multiple creative distances — **C**

Partially present as drawers (Work · Materials · Structure · History) and Worktable
instruments. The generalized model — `aperture.distance {close · gathered · structural ·
outward}` — is **design-only and non-canonical** (WS-HANDOFF-001 R1), and R1 explicitly refuses
to promote those into product rooms. ⛔ *Outward* has no surface at all.

### 11 · Expression & publishing support — **C**

Substrate is unusually complete: `manuscript_renders` table, render routes (`/render`,
`/render/epub`), `lib/manuscript/render/*` (paged PDF, EPUB CSS, print CSS, canonical plates
Lua), `living_work_expressions` + declare gesture in `WorkDrawer.tsx`.
⛔ **`manuscript_renders` = 0 and `living_work_expressions` = 0. Nothing has ever been
rendered or declared as an expression.** Edition remains **DESIGNED only** (PR #995 branch;
`components/canvas/` still absent from canonical).

### 12 · Human authorship remains explicit — **B**, ⚠️ trivially

Structurally enforced: `NEVER_AUTHORED_BY_THE_SYSTEM` (title · purpose · type · theme ·
summary · status · phase · relationships), `declared_by NOT NULL`, no inferred columns,
`CREATION_REQUIRES_A_MEMBER_ACT`, migration inserts zero rows.

🔴 **The load-bearing observation of this review: #12 currently passes _because_ #4 is
absent.** There is no AI inference path into authorship because there is no AI in the Studio
at all. The moment #4 ships, #12 stops being structural and becomes behavioral — and the
instrument that would test it (WS-HANDOFF-001) is preserved, unbuilt, and **has never been
run to completion**. Tonight's witness reached Loop 1 and stopped.

---

## 3. Boundary findings

- ✅ **Sanctuary:** not reachable from any Studio surface; no Studio route reads sanctuary state.
- ✅ **Consent/provenance:** belonging and expression both require an owning-member declaration.
- ⚠️ **Provenance deficit:** `manuscript_sections` — the structure-bearing store — has neither
  temporal nor authorship columns. Any future claim about who changed structure, or when,
  cannot be grounded in that table.
- ⚠️ **Competing models (skill rule ⭐):** `studio_projects` exists, 0 rows, predates the ruled
  ontology, **unruled** (open question B2); `workbench_tables` has no `living_work_id`.

## 4. Debris inventory

`app/api/_backend/**` ingest scripts (legacy, non-member) · `/press/studio` redirect to
`/writers-studio` (reading it as the Studio is reading history) · `app/book-studio/*` running
in parallel with `app/writers-studio/*` · `manuscript_renders` schema with no producer.
⛔ Per rule 8, none of this is proposed for removal — *unused never means unwanted*.

## 5. UNPROVEN — explicitly

1. Whether any capability **functions** for a member end-to-end. No layer-2 walk was performed;
   no authenticated session was available, and walking production with member data is forbidden.
2. Whether the import confirm-or-redraw step exists in UI but is unreachable, or does not exist.
   ⚠️ Only source and one member report; not walked.
3. Whether the 5 `chapter` / 1 `"the draft"` files in `lib/sovereign|maia` constitute a context
   path. ⛔ Not opened.
4. Whether Studio Home's create-Work gesture is reachable by a member who has none. ⚠️ The
   subject observed tonight has `work=NONE` after using the Studio.

## 6. Bounded next units — ⛔ unexecuted, no authority conferred

Ranked by increase in human usefulness, ⛔ not by ease:

1. **Arrival** — Studio Home walk FAILED today; every other capability is reached through it.
2. **The import confirm-or-redraw step** — a promised member step that a real writer could not
   find. Restores refusal at the one seam writers actually touch.
3. **The writer→MAIA crossing** — #4, which #5, #6 and half of #10 all depend on.
4. **Materials-before-manuscript on the import path** — closes #3 and #9 at one seam.

⚠️ Each is a separate unit requiring its own authorization. Two founder questions are already
open and are **not re-raised here**: the Writer's-Studio ⊃ Author-Studio naming contradiction
(ecology anatomy §0.2/§9) and WS-HANDOFF-001's held items.

⛔ **No implementation. No repair. No production change. STOP.**
