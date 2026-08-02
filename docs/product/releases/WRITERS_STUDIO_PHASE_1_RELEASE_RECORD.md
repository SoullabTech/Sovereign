# Release Record — Writer's Studio Phase 1

> **Status: INCOMPLETE — the release has not happened.** Every blank below is blank because the
> evidence does not exist yet. **Do not fill a slot to make the document look finished.**
>
> Structure is fixed by [`RELEASE_RECORD_TEMPLATE.md`](./RELEASE_RECORD_TEMPLATE.md) — seven
> sections, same order, every release. Governed by
> [`../WRITERS_STUDIO_PHASE_1_CHARTER.md`](../WRITERS_STUDIO_PHASE_1_CHARTER.md).
> Completed **at** deployment. §6 is Kelly's to sign.

**Last verified against the repository:** 2026-08-02, trunk `099de7aae`.

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
| #879 | Walk probes — read-only atom-immutability and MAIA-silence checks | OPEN |
| #880 | Post-merge corrections — C1 race coverage, C2 nullable title | OPEN |
| #876 | Phase 1 Charter + this record (governance; may or may not ride the release) | OPEN |
| [#863](https://github.com/SoullabTech/Sovereign/issues/863) | Canonical typecheck red — external blocker | OPEN |

⚠️ **#880 is not on trunk.** Verified by ancestry, not by badge:
`git merge-base --is-ancestor 4068f9a93 origin/clean-main-no-secrets` → **not an ancestor**.
While it remains unmerged the release object contains residues R3 and R4.

## 3. Acceptance evidence

⛔ Nothing here may be filled from intent, inference, or a passing test suite.

### 3a. Automated

| Check | Required | Result |
|---|---|---|
| `app/press` suite | 61/61 | *(blank)* |
| blank-route suite (arrives with #880) | 12/12 | *(blank)* |
| render-route suite (arrives with #880) | 7/7 | *(blank)* |
| workbench suites (#877, #878) | *(to be stated)* | *(blank)* |
| **clean-install DOM gate** — `npm ci && npx jest --config jest.dom.config.js` | WriterField DOM suite runs and passes | *(blank — currently cannot run, R6)* |
| `npm run typecheck` (no-regression gate) | no new diagnostic vs baseline | *(blank)* |
| Co-Lab boundary gate, in production | `31 passed · 0 failed · 0 warned` | *(blank)* |

⚠️ The **lockfile is the referent** for the DOM gate — not whatever exists in a shared
`node_modules`. ⛔ Do not run `npm install` in the shared checkout while other sessions are
active.

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
| Claude | #875 against Phase 1B acceptance (13 criteria) | *additive correction required* — C1, C2; delivered as #880 |
| *(blank)* | #878 | *(blank)* |
| *(blank)* | #879 | *(blank)* |
| *(blank)* | #880 | *(blank)* |

## 4. Residues

| # | Residue | Origin | Why it ships |
|---|---|---|---|
| R1 | **Scroll restoration is inert.** `.cm-scroller` has `overflow: visible`, so `scrollTop` is structurally 0; the real scroll owner is the `<main>` ancestor. | #869 | Pre-existing — the textarea had the same property, so this never worked. Repair needs the scrolling container's coordinates, not an editor property. A separate spatial-continuity defect. |
| R2 | **Keep removal appears inert in the UI** (observed after two clicks; one local fixture Keep remained). | #869 | Named in #869 as its own narrow defect, deliberately not repaired there. |
| R3 | **`title = NULL` can reach the book renderer as the literal `"null"`** — in `--metadata title=`, in `<title>`, and in the download filename. | #875 migration | Unreachable today *only by accident*: unnamed ⇒ `member_written` ⇒ zero `manuscript_sections` ⇒ the route's earlier 400. **Repaired by #880** — a residue only while #880 is unmerged. |
| R4 | **The blank-page creation race has no automated coverage on trunk.** | #875 | The race was *observed* and fixed, but its guard is unprotected against regression. **Repaired by #880** — a residue only while #880 is unmerged. |
| R5 | **Canonical typecheck is red** — `detectRelationalSignal` keyword map missing 5 `RelationshipTone` entries. | #863, OPEN | Pre-existing and external to this lane; reproduces with every Phase 1 slice removed. ⛔ #875's own stated gate was *do not merge until canonical is green*; that gate did not hold. **Unresolved.** |
| R6 | **#869's jsdom suite cannot run** — `@codemirror/*` absent from the shared `node_modules`; `jest -c jest.dom.config.js` → 0 tests, resolve failure. | environment | Not a code defect. ⛔ **Blocks the release until cleared** — see §3a. |

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
