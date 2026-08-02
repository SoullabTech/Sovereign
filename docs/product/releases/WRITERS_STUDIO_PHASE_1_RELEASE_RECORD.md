# Release Record — Writer's Studio Phase 1

> **Status: INCOMPLETE — §1, §3b, §6 and §7 are unfilled. The release has not happened.** Every blank below is blank because the
> evidence does not exist yet. **Do not fill a slot to make the document look finished.**
>
> Structure is fixed by [`RELEASE_RECORD_TEMPLATE.md`](./RELEASE_RECORD_TEMPLATE.md) — seven
> sections, same order, every release. Governed by
> [`../WRITERS_STUDIO_PHASE_1_CHARTER.md`](../WRITERS_STUDIO_PHASE_1_CHARTER.md).
> Completed **at** deployment. §6 is Kelly's to sign.

**Last verified against the repository:** 2026-08-02, trunk `9e1611306` (composition complete).

---

## 1. Identity

| | |
|---|---|
| Release name | Writer's Studio Phase 1 |
| Deployed SHA | *(blank — no deployment has occurred)* |
| Deployment date | *(blank)* |
| Deploy path | *(blank — `scripts/deploy-production.sh deploy <SHA>` expected)* |
| `GIT_COMMIT` verified in the running container | *(blank)* |

⚠️ **This release carries a migration** (`20260802000001_manuscript_title_optional.sql`), so the
quick `deploy-maia` path is **not** sufficient — it runs no migrations.

## 2. Composition

| PR / Issue | What | State |
|---|---|---|
| #869 | WriterField substrate — durable markdown writing surface (1A) | **MERGED** |
| #875 | Start writing — begin from a declared work without importing or naming (1B) | **MERGED** |
| #877 | Member Workbench — arrange Keeps on a private table | **MERGED** |
| #878 | Arrangement verbs — move, reorder, duplicate, return to Shelf | **MERGED** 2026-08-02 03:06:49Z |
| #879 | Walk probes — read-only atom-immutability and MAIA-silence checks | **MERGED** 2026-08-02 12:05:16Z |
| #880 | Post-merge corrections — C1 race coverage, C2 nullable title | **MERGED** 2026-08-02 12:33:43Z |
| #876 | Phase 1 Charter + this record (governance) | **MERGED** 2026-08-02 12:21:55Z |
| [#863](https://github.com/SoullabTech/Sovereign/issues/863) | Canonical typecheck red — external blocker | OPEN |

✅ **Composition complete as of 2026-08-02.** Every component verified on trunk `9e1611306` by
ancestry, not by badge — `git merge-base --is-ancestor 4068f9a93 origin/clean-main-no-secrets`
→ **is an ancestor**, and the C1/C2 files are present in the tree. Residues R3 and R4 close
with it.

⚠️ #863 remains open and is deliberately listed: it is pre-existing debt carried by the
release, not a component of it. See R5.

## 3. Acceptance evidence

⛔ Nothing here may be filled from intent, inference, or a passing test suite.

### 3a. Automated

**Observed 2026-08-02 against trunk `9e1611306`** — the assembled candidate, after all of
§2 merged. Environment: isolated worktree, **`npm ci` from the lockfile** (not a shared
`node_modules` — see R6 and the note below).

| Check | Required | Result |
|---|---|---|
| `app/press` suite | 61/61 | ✅ **61/61** |
| blank-route suite (#880) | 12/12 | ✅ **12/12** |
| render-route suite (#880) | 7/7 | ✅ **7/7** |
| workbench suites (#877, #878) | all pass | ✅ **94/94** |
| combined node-environment sweep | all pass | ✅ **270/270**, 19 suites |
| **clean-install DOM gate** — `npm ci && npx jest --config jest.dom.config.js` | WriterField DOM suite runs and passes | ✅ **10/10** — R6 CLEARED |
| `npm run typecheck` (no-regression gate) | no new diagnostic vs baseline | ✅ **239 = baseline 239** |
| Co-Lab boundary gate, in production | `31 passed · 0 failed · 0 warned` | *(blank — requires the deployed container; measuring it now would measure the OLD build, not this candidate)* |

### ⚠️ The environment is part of the measurement

The same commit gives **opposite answers** depending on how dependencies were installed:

| Environment | `npm run typecheck` |
|---|---|
| shared `node_modules` (missing `@codemirror/*`) | **FAILS** — 4 *new* diagnostics, all `TS2307: Cannot find module '@codemirror/…'` in `WriterField.tsx` |
| clean `npm ci` from the lockfile | **PASSES** — 239 = baseline 239 |

⭐ **The lockfile is the referent.** A gate result measured against a shared or drifted
`node_modules` is a measurement of that directory, not of the release candidate.

⛔ Do not run `npm install` in the shared checkout while other sessions are active.

### 3b. Walks

**Release-acceptance walk** — performed by: *(blank)* · date: *(blank)* · build walked: *(blank)*

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

⚠️⚠️ **As of 2026-08-02 no release-acceptance walk has been run.** It was a gate on #875 and did
not block that merge.

**Other walks performed — ⛔ NOT release acceptance:**

| Walk | Kind | Where recorded |
|---|---|---|
| Workbench arrangement verbs | Slice verification | #878, commit `c49026716` — *"record the walk result and the one question left open"* |
| #869 authenticated editor walk (380,675-char draft) | Slice verification | #869 PR body |
| #875 route-level exercise | Developer verification | #875 PR body — the author states the experiential walk was **not** run |

⛔ None of the above satisfies §3b. A later reader must not collapse them into *"someone walked
it."*

### 3c. Reviewer sign-offs

| Reviewer | Scope reviewed | Disposition |
|---|---|---|
| Claude | #875 against Phase 1B acceptance (13 criteria) | *additive correction required* — C1, C2; delivered as #880, **merged** |
| *(blank)* | #878 | *(blank)* |
| *(blank)* | #879 | *(blank)* |
| *(blank)* | #880 | *(blank)* |

## 4. Residues

| # | Residue | Origin | Why it ships |
|---|---|---|---|
| R1 | **Scroll restoration is inert.** `.cm-scroller` has `overflow: visible`, so `scrollTop` is structurally 0; the real scroll owner is the `<main>` ancestor. | #869 | Pre-existing — the textarea had the same property, so this never worked. Repair needs the scrolling container's coordinates, not an editor property. A separate spatial-continuity defect. |
| R2 | **Keep removal appears inert in the UI** (observed after two clicks; one local fixture Keep remained). | #869 | Named in #869 as its own narrow defect, deliberately not repaired there. |
| R3 | ~~`title = NULL` reaching the book renderer as the literal `"null"`~~ | #875 migration | **CLOSED 2026-08-02** — #880 merged; `title = ms.rows[0].title ?? UNTITLED_EXPRESSION` verified present on trunk `9e1611306`. |
| R4 | ~~The blank-page creation race has no automated coverage~~ | #875 | **CLOSED 2026-08-02** — #880 merged; blank-route suite 12/12 on trunk, with a 5-case mutation matrix. |
| R5 | **#863 remains open**, but it is **not a gate failure.** | #863, OPEN | ⚠️ **Restated 2026-08-02.** The two `detectRelationalSignal` diagnostics still exist and are visible in `npm run typecheck:full` — but they sit **inside the 239-error baseline**, so they cannot fail the no-regression gate, which passes. The "canonical typecheck red" cited on #875 as its merge blocker reproduces **only in an environment missing `@codemirror/*`**, where the failure is 4 `TS2307` diagnostics in `WriterField.tsx` — i.e. R6, misattributed. #863 is real pre-existing debt and stays open; it is **not** a Phase 1 release blocker. |
| R6 | ~~#869's jsdom suite cannot run — `@codemirror/*` absent~~ | environment | **CLOSED 2026-08-02** — `npm ci` from the lockfile installs them; DOM suite runs **10/10**. The gap was the shared `node_modules`, never the lockfile. ⛔ Standing rule: gates are measured from a clean install, and `npm install` is not run in a shared checkout while other sessions are active. |

## 5. Deferred work

- **The full mode set** — Write · Structure · Revise · Design · Publish. Phase 1 delivers the
  shell those modes will live in, not the modes.
- **Visual elaboration of the Canvas.** "Almost nothing except Project / Shelf / Groups /
  WriterField" was the stated acceptable Phase 1 shell.
- **Projects as a first-class object beyond what 1C/1D require to route correctly** — multiple
  simultaneous projects, project selection UI, the `living_work_id` edge on Table.
- **Graduation into drafts, uploads, and the Ideas / Journals / Decisions sources** — each
  deferred by the Workbench slice for its own stated reason.
- **R1 and R2** — carried forward, not repaired.
- **#863** — pre-existing typecheck debt, not a Phase 1 blocker (R5).
- Any **judgment, clustering, ordering, naming, or suggestion by MAIA** inside the Canvas. The
  room stays silent.

## 6. Founder acceptance

> *Does the assembled Writer's Studio Phase 1 do what it was meant to do?*

**Verdict:** *(blank — Kelly's to sign)*

⛔ **Never inferred.** Not from §3a, not from §3b, not from evidence quality.

## 7. Post-release observations

⛔ Only filled after deployment.

| Date | Observation | Source |
|---|---|---|
| *(empty — no deployment has occurred)* | | |

---

## Sign-off gate

Complete only when: §1 names a deployed SHA verified in the running container · §3a has no blank
required row · §3b carries a **release-acceptance** walk performed by a named person against the
assembled candidate · §6 carries Kelly's verdict.

**Until then this document is evidence that the release has not happened — which is its job.**
