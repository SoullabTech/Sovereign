# Writer's Studio Phase 1 — Release Record

> **Status: INCOMPLETE — the release has not happened.** This is the record being assembled,
> not a record of a completed release. Every blank below is blank because the evidence does not
> exist yet. **Do not fill a slot to make the document look finished.**
>
> Governed by [`../WRITERS_STUDIO_PHASE_1_CHARTER.md`](../WRITERS_STUDIO_PHASE_1_CHARTER.md)
> § *Every phase ends with a Release Record*. Completed **at** deployment. The acceptance line
> is Kelly's to sign.

**Last verified against the repository:** 2026-08-02, trunk `099de7aae`.

---

## 1. Commit(s) deployed

| | |
|---|---|
| Deployed SHA | *(blank — no deployment has occurred)* |
| Deployed at | *(blank)* |
| Deploy path | *(blank — `deploy-production.sh deploy <SHA>` expected; carries migrations)* |
| `GIT_COMMIT` verified in the running container | *(blank)* |

⚠️ Phase 1 carries a migration (`20260802000001_manuscript_title_optional.sql`), so the quick
`deploy-maia` path is **not** sufficient — it runs no migrations.

## 2. PRs comprising the release

| PR | What | State |
|---|---|---|
| #869 | WriterField substrate — durable markdown writing surface (1A) | **MERGED** |
| #875 | Start writing — begin from a declared work without importing or naming (1B) | **MERGED** |
| #877 | Member Workbench — arrange Keeps on a private table | **MERGED** |
| #878 | Arrangement verbs — move, reorder, duplicate, return to Shelf | **MERGED** |
| #879 | Walk probes — read-only atom-immutability and MAIA-silence checks | OPEN |
| #880 | Post-merge corrections — C1 race coverage, C2 nullable title | OPEN |
| #876 | Phase 1 Construction Charter (governance, may or may not ride this release) | OPEN |

⚠️ **#880 is not on trunk.** Verified 2026-08-02: `git merge-base --is-ancestor 4068f9a93
origin/clean-main-no-secrets` → **not an ancestor**. Until it merges, the release object
contains the C2 defect described in §3.

## 3. Known residues — shipped knowingly, with reason

Each line is a defect or gap that is **understood and not repaired in this phase**. Nothing here
is a surprise; that is the point of recording it.

| # | Residue | Origin | Why it ships |
|---|---|---|---|
| R1 | **Scroll restoration is inert.** `.cm-scroller` has `overflow: visible`, so `scrollTop` is structurally 0. The real scroll owner is the `<main>` ancestor. | #869 | Pre-existing — the textarea had the same property, so this never worked. Repair needs the scrolling container's coordinates, not an editor property. A separate spatial-continuity defect. |
| R2 | **Keep removal appears inert in the UI** (observed after two clicks; one local fixture Keep remained). | #869 | Named in #869 as its own narrow defect, deliberately not repaired there. |
| R3 | **`title = NULL` can reach the book renderer as the literal `"null"`** — in `--metadata title=`, in `<title>`, and in the download filename. | #875 migration | *Unreachable today* only by accident: unnamed ⇒ `member_written` ⇒ zero `manuscript_sections` ⇒ the route's earlier 400. **Repaired by #880**; a residue only for as long as #880 is unmerged. |
| R4 | **The blank-page creation race has no automated coverage on trunk.** | #875 | The race was *observed* and fixed, but its guard is unprotected against regression. **Repaired by #880**; a residue only for as long as #880 is unmerged. |
| R5 | **Canonical typecheck is red** — `detectRelationalSignal` keyword map missing 5 `RelationshipTone` entries. | [#863](https://github.com/SoullabTech/Sovereign/issues/863), OPEN | Pre-existing and external to this lane; reproduces with every Phase 1 slice removed. ⛔ #875's own stated gate was *do not merge until canonical is green*; that gate did not hold. **Unresolved.** |
| R6 | **#869's jsdom suite cannot run** — `@codemirror/*` absent from the shared `node_modules`; `jest -c jest.dom.config.js` → 0 tests, resolve failure. | environment | Not a code defect. ⛔ **Blocks the release until cleared** — see §4. |

## 4. Acceptance evidence

⛔ **Nothing in this section may be filled from intent, inference, or a passing test suite.**
Each line records an observation that actually happened, by whom, against what.

### 4a. Automated

| Check | Required | Result |
|---|---|---|
| `app/press` suite | 61/61 | *(blank)* |
| blank-route suite (arrives with #880) | 12/12 | *(blank)* |
| render-route suite (arrives with #880) | 7/7 | *(blank)* |
| workbench suites (#877, #878) | *(to be stated)* | *(blank)* |
| **clean-install DOM gate** — `npm ci && npx jest --config jest.dom.config.js` | WriterField DOM suite runs and passes | *(blank — currently cannot run, R6)* |
| `npm run typecheck` (no-regression gate) | no new diagnostic vs baseline | *(blank)* |
| Co-Lab boundary gate, in production | `31 passed · 0 failed · 0 warned` | *(blank)* |

⚠️ The lockfile is the referent for the DOM gate — **not** whatever exists in a shared
`node_modules`. ⛔ Do not run `npm install` in the shared checkout while other sessions are
active.

### 4b. Experiential walk — against the **assembled candidate**, not per-PR

Performed by: *(blank)* · Date: *(blank)* · Build walked: *(blank)*

Fixture prerequisite: **a disposable local member with a declared Living Work and zero
manuscripts.** ⛔ Production verifies the member's real state only — states are never
manufactured there.

| # | Step | Observed |
|---|---|---|
| W1 | Declared work, no manuscript → **Start writing** is the primary action | *(blank)* |
| W2 | *Bring in existing writing* remains secondary | *(blank)* |
| W3 | Nothing is created before the explicit gesture | *(blank)* |
| W4 | WriterField opens genuinely blank | *(blank)* |
| W5 | First sentence autosaves | *(blank)* |
| W6 | Leave and return — the sentence persists | *(blank)* |
| W7 | No duplicate blank page is created (double-tap / retry) | *(blank)* |
| W8 | Workbench: place a Keep, group it, leave, return — it is where it was left | *(blank)* |
| W9 | Arrangement verbs — move, reorder, duplicate, return to Shelf | *(blank)* |
| W10 | Fixture cleanup restores the member exactly | *(blank)* |

⚠️ **As of 2026-08-02 no Phase 1 experiential walk has been run.** It was a gate on #875 and did
not block that merge. A workbench-scoped walk was recorded on #878 (`c49026716`) — that is
**not** this walk, and does not substitute for it.

### 4c. Founder acceptance

> *Does the assembled Writer's Studio Phase 1 do what it was meant to do?*

**Verdict:** *(blank — Kelly's to sign; not observable from data, and not inferable from §4a or §4b)*

## 5. Explicitly deferred to the next phase

- **The full mode set** — Write · Structure · Revise · Design · Publish. Phase 1 delivers the
  shell those modes will live in, not the modes.
- **Visual elaboration of the Canvas.** "Almost nothing except Project / Shelf / Groups /
  WriterField" was the stated acceptable Phase 1 shell.
- **Projects as a first-class object beyond what 1C/1D require to route correctly** — multiple
  simultaneous projects, project selection UI, the `living_work_id` edge on Table.
- **Graduation into drafts, uploads, and the Ideas / Journals / Decisions sources** — each
  deferred by the Workbench slice for its own stated reason.
- **R1 and R2** (§3) — carried forward, not repaired.
- Any **judgment, clustering, ordering, naming, or suggestion by MAIA** inside the Canvas. The
  room stays silent.

---

## Sign-off gate

This record may be marked complete only when: §1 names a deployed SHA verified in the running
container · §4a has no blank required row · §4b was performed against the assembled candidate
by a named person · §4c carries Kelly's verdict.

**Until then this document is evidence that the release has not happened — which is its job.**
