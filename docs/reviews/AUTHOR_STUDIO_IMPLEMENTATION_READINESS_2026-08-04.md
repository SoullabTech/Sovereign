# Author Studio — Implementation Readiness Review

**Date:** 2026-08-04 · **Type:** repository audit · **Status:** findings only — authorizes no build
**Observer checkout:** `redesign/labtools-intent-first` @ `40c417fdf`
**Referent caveat:** this is a *canonical-checkout* audit. Nothing here is evidence about the
**deployed** referent. Per standing rule, any acceptance claim must re-measure at the deployed SHA.

---

---

## 0bis. Corrections applied after publication (2026-08-04, same day)

**⚠️ Referent correction — §1 under-reports the write surface.** This audit was measured at
`40c417fdf` on `redesign/labtools-intent-first`. That checkout **does not contain**
`app/press/manuscript/WriterField.tsx`. Trunk (`7404cf8c8`) and the **deployed build**
(`57b0324fd`) both do. §1's description of the write surface is therefore the *textarea-era*
editor; the live surface uses the `WriterField` handle (textarea-shaped API: `scrollTop`,
`setSelectionRange`, `focus`). The observer's branch was the wrong referent for that component.

**✅ Step-1 verification result (§6 sequence, item 1) — #892 is live.**

| Check | Result |
|---|---|
| PR #892 state | **MERGED** 2026-08-02T16:06Z → `clean-main-no-secrets`, merge commit `51c90ba7f` |
| Files | `WorkingDraftEditor.tsx` · `WriterField.tsx` · `app/press/studio/page.tsx` |
| Ancestor of trunk `7404cf8c8`? | **YES** |
| Ancestor of deployed `57b0324fd`? | **YES — #892 is in the deployed build** |
| Deploy lane / container | `deploy-lane` · created 2026-08-04T15:27:24Z |

Blocking corrections **(2) click-to-focus** and **(3) return by identity** are therefore *merged and
deployed*. ⛔ This is provenance, **not** acceptance: neither has been exercised by a **real member
click**, which is precisely the evidence W4 lacked. They are re-walk material, not passes.

**Vocabulary — superseded framing.** §0 below applies the §12.3 ruling on the assumption of **one
referent under two names**. That assumption was **overruled the same day**:
`docs/canon/WRITER_STUDIO_AUTHOR_STUDIO_DISTINCTION_2026-08-04.md` — Writer's Studio and Author
Studio are **two environments differing in kind**, with Author Studio contained inside Writer's
Studio. §0 is preserved unedited as the record of what was believed when the audit ran; read it
through the amendment. §12.3's procedural holding — ⛔ **rename nothing** — survives both.

---

## 0. Vocabulary — a correction that constrains this whole review

The continuation prompt uses **"Writer's Studio"** as the environment name. That was **ruled on
2026-08-04** (`docs/design/author-studio/AUTHOR_INTELLIGENCE_STACK_CLASSIFICATION_2026-08-04.md`
§12.3):

1. **Author Studio** and **Manuscript Room** are the **authoritative member-facing names**.
2. **Writer's Studio · Canvas · WriterField** are **implementation vocabulary**, not competing
   product names, until explicitly ratified.
3. ⛔ **Rename nothing today.**

This review therefore uses Author Studio / Manuscript Room for the product and reserves
"Writer's Studio" for the document lane of that name. This is not a redesign — it is the applicable
ruling.

**Measured referent divergence** (§12.1): two lanes describe this environment and **neither cites
the other**. `Author Studio` shape = `/press/studio` → `/press/manuscript` → Source / Working Draft,
**9 files** in `app/ components/ lib/`. `Writer's Studio` shape = Project → Canvas → WriterField,
**0 files**. The prompt's roadmap (Write · Gather · Shape · Refine · Publish) is a *third* phrasing;
the closest thing in code is `studioMap.ts`, which declares `gatherings · shape · release` as
`availability: 'later'`.

---

## 1. Observed — implementation that currently exists

### Layer 2 — Author Studio (`/press/studio`)
| File | Lines |
|---|---|
| `app/press/studio/page.tsx` | 237 |
| `app/press/studio/StudioShell.tsx` | 236 |
| `app/press/studio/YourWork.tsx` | 326 |
| `app/press/studio/studioMap.ts` | 165 |
| `app/press/studio/shellIdentity.ts` | 88 |
| `app/press/studio/useCurrentManuscript.ts` / `useLivingWorks.ts` | 62 / 74 |
| `__tests__/shellIdentity.test.ts`, `__tests__/studioMap.test.ts` | — |

Trunk history: `417b97ab7` *Author Studio Home — the missing Layer 2 environment* · `f466fac2e` *a
member can declare that a work exists* · `4d1b07ed3` *re-found Studio arrival around the Living
Work* · `fa435b04a` *the shell says what the page says*.

`studioMap.ts` nav is already phase-shaped:
`Home` · **Current Book** → `Working Draft`, `Source`, `Import Manuscript` · **Coming later** →
`gatherings`, `shape`, `release` (all `availability: 'later'`).

### Layer 3 — Manuscript Room (`/press/manuscript`)
`page.tsx` = **1121 lines**, seven tabs:
`manuscript | draft | keeps | collections | emerging | export | book`.
Return behavior is implemented and tested: `returningState.ts` (`loadLastTab`/`saveLastTab`), with a
deep-link `?tab=` that always wins and a safe `manuscript` fallback. Tests: `exitGuard.test.ts`,
`returningState.test.ts`, `workingDraftClient.test.ts`.

### The write loop (roadmap phase 1) — the strongest part of the system
- `WorkingDraftEditor.tsx` (829) + `workingDraftClient.ts` (408).
- **Autosave**: `AUTOSAVE_DELAY_MS` debounce, **single-flight ordered saver** carrying
  `baseRevisionId`.
- **W-1 exit guard**: `beforeunload` + visibility flush explicitly closes the debounce gap, because
  the product said *"It autosaves as you write."*
- **Leave and return**: caret/scroll position persisted on a 400 ms timer; restored on re-entry.
- **Revision history**: list, checkpoint, and restore — restore takes the save lane so no autosave
  races or outlives it.
- **Concurrency**: `lib/manuscript/draftConcurrency.ts` + migration `20260731000001_draft_concurrency.sql`.

### Schema — `20260727000001_manuscript_working_drafts.sql`
- `manuscript_working_drafts` — `content`, `base_source_hash` (sha256 of the source sections),
  `revision_count`. UNIQUE per manuscript.
- `working_draft_revisions` — **append-only against modification**: `UPDATE` is refused by trigger
  (`working_draft_revisions_immutable()`); restore writes a **new** revision, history is never
  rewritten. `DELETE` is deliberately reachable **only** through the manuscript cascade — *member
  deletion sovereignty outranks archival completeness*.
- Source immutability is structural: `manuscript_sections` are never edited; the draft is a separate
  verbatim copy. **No interpretive columns, by construction.**

### API surface (all member-scoped, `force-dynamic`)
| Route | Lines | Verbs |
|---|---|---|
| `…/manuscripts/[id]/draft` | 254 | POST · GET · PUT (+ `__tests__`) |
| `…/manuscripts/[id]/draft/revisions` | 174 | GET · POST (+ `__tests__`) |
| `…/manuscripts/[id]/keeps` | 117 | POST · DELETE |
| `…/manuscripts/[id]/candidates` | 104 | POST |
| `…/manuscripts/[id]/collections` | 156 | — |
| `…/manuscripts/[id]/render` | 154 | POST `{pdf\|epub}` (+ `__tests__`) |
| `…/manuscripts/ingest` | — | upload |

Doctrine already enforced in code, not just docs:
- **keeps** — server re-verifies the passage exists **verbatim** in that section of the member's own
  manuscript before writing. *"Recognition is not inferred; recognition is enacted."* No detector,
  summarizer, or background job may call it.
- **candidates** — member-pulled only; the extractor's interpretive fields (`resonance`, `score`)
  are **dropped server-side**. *Evidence, never meaning. Proposes, never keeps.*
- **render** — ownership-gated (404s rather than leaking existence), records a `manuscript_renders`
  provenance row, streams bytes and deletes the temp file; a member's manuscript is never written to
  a served path.

### Supporting libs
`lib/manuscript/`: `ingest/parseUpload.ts` + `segment.ts` (docx/md, with fixtures),
`adapters/elementalAlchemyJsonToManuscript.ts`, `adapters/manuscriptAssetMap.ts`,
`render/renderMemberBook.ts` (+ pandoc/Paged.js configs, `computeSourceHash`), `types.ts`. Six test
files.

---

## 2. Reusable — what a next slice should build on, not beside

| Asset | Why it is reusable |
|---|---|
| Ordered single-flight saver + `draftConcurrency` + append-only revisions | A solved, tested write-safety triad. Any new editable surface should adopt it rather than re-derive it. |
| `keeps` + `candidates` | The **Gather** primitives already exist at doctrine strength (verbatim verification, member-pulled, interpretive fields stripped). Gather is largely a *surface* problem, not a substrate problem. |
| `renderMemberBook.ts` + `/render` | A complete **Publish** substrate incl. provenance and ownership gating. |
| `studioMap.ts` + `shellIdentity.ts` (both unit-tested) | A phase can be added to the Studio as **data**, not new architecture. `gatherings`/`shape`/`release` ids already reserved. |
| `returningState.ts` + caret persistence | Leave-and-return already generalizes. |
| `living_works` + `living_work_expressions` (`20260801000001`) | The declared-work container the Studio arrival is already re-founded around. |
| `parseUpload` / `segment` | Ingest for any new source type. |

---

## 3. Missing — capabilities that genuinely do not exist

| Roadmap phase | State |
|---|---|
| **1 Write** | **Exists.** The most complete phase. Blocked on acceptance, not on capability (§5). |
| **2 Gather** | **Substrate yes, phase no.** `keeps`/`collections` are *tabs inside one Manuscript Room*, scoped to one manuscript. There is no Studio-level gathering surface across works. `studioMap.gatherings` is a label with `availability: 'later'`. |
| **3 Shape** | **Nothing.** Label only. |
| **4 Refine** | **Nothing.** No route, component, or table. (`app/api/songwriter/refine` is a different studio's loop, not a model for this one.) |
| **5 Publish** | **Substrate yes, member path no.** `/render` produces pdf/epub; the Studio's `release` entry is `'later'`. The `export`/`book` tabs are Room-local, not a Studio phase. |
| Writing Project container | ⛔ **Explicitly not in R1** per the Three-Layer Ruling. Not a gap — a boundary. |
| Identity-based return routing | Missing; return is by position (blocking correction 3). |

**Cross-studio seam (the W8 failure, in structural terms):** the *Workbench Shelf* lives in
**Book Studio** (`app/book-studio/workbench`) and reads `member_memory_atoms` stamped
`generated_by='member-gesture'`, while the prominent member "Keep this moment" gesture creates a
**capsule**. Capsules are not atoms. A member with an ordinary MAIA conversation has **no reachable
gesture** that puts anything on the Shelf.

---

## 4. Duplicate work that must not be rebuilt

1. **Book Studio is a separate studio and stays separate.** It already has `canvas/`, `workbench/`,
   `drafts/`, `render/`, `passages/`, `ready-to-write/`, `illustrations/`, `design-system/`, plus
   `/api/book-studio/render/epub` and `import-docx`. ⛔ Do not merge; ⛔ equally, do not re-implement
   its render or shelf inside Author Studio.
2. **Two render paths already exist** (`/api/book-studio/render/epub` and
   `/api/sovereign/manuscripts/[id]/render`). Publish work should extend the sovereign one; a third
   is unjustifiable.
3. **`app/press/studio/` already IS the Layer 2 environment.** Any proposal to "build the Studio
   shell" is duplicate work — the shell exists, is tested, and is on trunk.
4. **The two-lane document divergence** is itself duplicated design effort. ⛔ Do not resolve it by
   building to whichever doc is open.

---

## 5. Open governance — binding constraints and unruled questions

### Blocking (Phase 1 is not accepted)
> **Release walk FAILED at W8.** Phase 1 is **not ready for founder acceptance or deployment.**
> W9 and all later Workbench steps were **not reached** — not "pending", not "passing", *unreached*.
> — `docs/releases/WRITERS_STUDIO_PHASE1_RELEASE_WALK_2026-08-02.md`

Three blocking corrections stand:
1. Connect a genuine, generally reachable member **Keep** act to the canonical Field Object
   substrate the Shelf consumes — or change the Shelf's admitted sources by **explicit ontology
   ruling**. ⛔ Do not silently treat capsules as atoms.
2. Fix **blank writing-field click-to-focus** and repeat the **real user action** (W4 was
   *qualified, not clean*: the field was hit-test reachable and `.focus()` worked programmatically,
   but a real click did not focus it; writing was possible only after DevTools focus).
3. Replace **return-by-position with identity routing** before project multiplicity makes the
   ambiguity consequential.

The ontology ruling for (1) **has been made** (`FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md`): the
capsule stays the review/refinement artifact; the member performs an **explicit act — "Keep in my
Field" — that mints the canonical atom** with member-authored provenance. The Shelf keeps reading
canonical Field Objects only.

Per the Phase 3 record §10: corrections (1) and (2) were **built in #892**; correction (3) has
**competing local implementations**, with Implementation A selected only *provisionally* and still
owing canonical discriminator alignment, cleanup of ambiguous Keep language, consolidation around
the governed `keepSource()` capability, and **authenticated member-path evidence**.
⚠️ Merge/deploy status of #892 was **not** verified by this audit and must be measured at the
deployed SHA before any re-walk.

### Governance instruments not closed
- **G1 — Founder felt-grammar walk** for the Workbench verb set (*does this feel like arranging
  insight, or managing records?*). **Not performed.** It is the **stated deployment gate.**
- **G2 — Member Experience Design Constitution yield clause: UNRULED**; charter recorded, not
  operative.
- **G3 — Phase 1 Release Record: not written.** Blanks stay blank.

### Unruled, upstream of implementation
- **A1** first member act binding a Field Object to a Project · **A2** may a Reference accumulate
  counters · **A3** where relationship history lives (no substrate exists).
- **F1** source-native id vs atom-as-canonical-anchor **unreconciled** (why `ideas`/`journals`/
  `decisions` adapters stay unregistered) · **F2** Shelf flattening gate stated, not lifted ·
  **F3** `isSanctuary()` has no callers — recorded drift, deliberately not wired.
- **Field Object versioning** — UNRULED, upstream of offerings and UI.
- **Voice Guardian** — UNRULED; the hinge is whether *evaluation itself constitutes a voice profile*.
- **Phase model A vs B** (sequential phases vs capability phases) — **held open on purpose.**
  ⛔ *Do not resolve it by building, and do not resolve it by renumbering.*

### Ratified and binding
- **Three-Layer Ruling** (2026-07-30): House → Author Studio (`/press/studio`) → Manuscript Room
  (`/press/manuscript`) → Working Draft. ⛔ No Layer 1 → Layer 3 jump.
- **R1 audience ruled**: Author Studio is **member-facing at R1**; **no Steward/founder tier gate**.
  *An existing permission mechanism can implement a ruling; it cannot supply one.*
- **Q10 exclusions** — building these breaches a granted ruling: Continuity Intelligence /
  Character Bible / World Bible (manuscript-wide patterns) · Reader Simulator (generalized
  suggestion engine) · Research Intelligence over the manuscript (embeddings / manuscript-chat) ·
  Voice Guardian built as a voice model.
- **Phase 3 (Projects)**: RECORDED, **not authorized for build**; sequence gate unmet.

---

## 6. Recommended next slice — one only

> **Close blocking correction (1)/(3): one governed member act — "Keep in my Field" — that mints a
> canonical Field Object from the ordinary MAIA capsule surface, consolidated behind a single
> `keepSource()` path, with authenticated member-path evidence.**

**Why this one.**

- **It is the only blocking correction still unbuilt.** (1) and (2) were built in #892; (3) is the
  one with competing provisional implementations and unpaid debt. Nothing downstream — Gather,
  Shape, Refine, Publish — can be walked while W8 fails, because W9+ were never reached.
- **Greatest real author value.** Today an author's recognitions are stranded: the prominent Keep
  gesture writes capsules, the Shelf reads atoms, and the only atom-minting path
  (`/maia/keep-capture`) requires a pre-existing developed Idea candidate. This slice is what makes
  "the things I noticed are here when I sit down to write" true for an ordinary author.
- **Minimal new architecture.** The ontology ruling already exists; `member_memory_atoms` already
  exists; the Shelf already reads canonical Field Objects; `keepSource()` already exists as the
  governed capability. This is **consolidation onto a ruled path**, not new substrate. No new table
  is implied. No new studio. No new route family.
- **Maximum reuse** — of the atom substrate, the existing Shelf reader, and the keeps doctrine
  already proven in `…/manuscripts/[id]/keeps` (verbatim verification; recognition enacted, not
  inferred).
- **Preserves human-first writing.** It adds an **explicit member act** and adds no inference,
  no detector, no background job, no interpretive column. It strengthens the boundary the W8
  failure exposed rather than papering over it.
- **Testable with real authors before expansion.** Completing it makes the Phase 1 walk **runnable
  past W8** for the first time.

**Explicitly out of this slice.** Gather/Shape/Refine/Publish surfaces · the Writing Project
container · Canvas/WriterField · any rename · resolving Model A vs Model B · anything on the Q10
list · Field Object versioning.

**Sequencing after the slice — not part of it.**
1. Verify #892's merge/deploy state **at the deployed SHA** (not from a working tree).
2. Re-run the Phase 1 walk **from W1**, not from W8 — a walk whose eighth step is the acceptance
   claim does not yield partial acceptance.
3. G1 founder felt-grammar walk (the stated deployment gate), then G3 Release Record.

⛔ This section recommends. It does not authorize. Build authorization for the slice is Kelly's.

---

## 7. What this document is not

Not a product proposal, not a redesign, not a phase-model resolution, not a rename, and not
evidence about production. Every status above is either quoted from a governance record or measured
from the canonical checkout at `40c417fdf`.
