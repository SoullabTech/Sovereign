# Release Record — Writer's Studio Phase 1

> **Status: RELEASE WALK FAILED (2026-08-02). Phase 1 is NOT ready for founder acceptance or deployment.** §1, §6 and §7 remain unfilled; §3a and §3b are filled from observation, and §3b records a
> **failure at W8**. Every remaining blank is blank because that evidence does not exist.
> **Do not fill a slot to make the document look finished.**
>
> Structure is fixed by [`RELEASE_RECORD_TEMPLATE.md`](./RELEASE_RECORD_TEMPLATE.md) — seven
> sections, same order, every release. Governed by
> [`../WRITERS_STUDIO_PHASE_1_CHARTER.md`](../WRITERS_STUDIO_PHASE_1_CHARTER.md).
> Completed **at** deployment. §6 is Kelly's to sign.

**Last verified against the repository:** 2026-08-02, trunk `bfdf5512c`. Composition re-verified by
`git merge-base --is-ancestor <merge-sha> origin/clean-main-no-secrets` for every row — not by PR
badge. **No evidence slot was filled by this re-verification; blanks that were blank remain blank.**

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

**Candidate release object, as assembled 2026-08-02** *(inspection output — naming a candidate is
not authorizing a deployment)*:

| | |
|---|---|
| Currently deployed | `7c9dd5192` (container created 2026-08-02T00:18Z) |
| Candidate tip | `bfdf5512c` |
| Range | `7c9dd5192..bfdf5512c` — **52 commits**, 9 merged PRs |
| Migrations in range | **1** — `20260802000001_manuscript_title_optional.sql` |
| Required deploy path | `scripts/deploy-production.sh deploy <SHA>` (full; runs migrations) |
| ⛔ Insufficient path | `pre-deploy-gate.sh deploy-maia <SHA>` — rebuilds `maia` only, **no migrations** |

⛔ The candidate tip moves whenever trunk moves. **Re-assemble immediately before deploying** and
name the SHA explicitly; a range recorded here is evidence of an inspection, not a standing
authorization.

> ⛔⛔ **HISTORICAL INSPECTION ONLY.** This candidate became stale when canonical advanced to
> `a1f021fbc`. It **must not** be used for deployment without a fresh release-object assembly and
> inspection against the exact SHA being authorized.

⚠️ **This candidate is additionally ineligible on its merits, not only its age.** The Phase 1 walk
was run on 2026-08-02 and **failed at W8** — no reachable member gesture populates the Shelf (#881).
A release object that fails reachability cannot be rescued by founder grammar judgment, so the
sequence resumes at repair, not at acceptance. ⛔ Do not re-assemble a release object again until the
blocking corrections land and Phase 1 is re-run **from W1** — otherwise the work is auditing
candidates already known to be ineligible.

## 2. Composition

| PR / Issue | What | State |
|---|---|---|
| #869 | WriterField substrate — durable markdown writing surface (1A) | **MERGED** |
| #875 | Start writing — begin from a declared work without importing or naming (1B) | **MERGED** |
| #877 | Member Workbench — arrange Keeps on a private table | **MERGED** |
| #878 | Arrangement verbs — move, reorder, duplicate, return to Shelf | **MERGED** 2026-08-02 03:06:49Z |
| #879 | Walk probes — read-only atom-immutability and MAIA-silence checks | **MERGED** `62eedcf5e` |
| #880 | Post-merge corrections — C1 race coverage, C2 nullable title | **MERGED** `9e1611306` |
| #876 | Phase 1 Charter + this record (governance) | **MERGED** `5586720e0` |
| #882 | Member Field constitutional directive — canon recovery | **MERGED** `b174730d1` |
| #883 | Project Reference biography record | **MERGED** `bfdf5512c` |
| [#863](https://github.com/SoullabTech/Sovereign/issues/863) | Canonical typecheck red — external blocker | OPEN |

✅ **Every merged row above is ancestry-verified against `origin/clean-main-no-secrets`, not read
from a PR badge.** #882 additionally verified by content, because it carried final file *state*
rather than a commit replay — so its ratifying commit `6899223db` is deliberately **not** an
ancestor. ⛔ Do not treat that absence as the canon being missing; read the files from canonical.

⚠️ **The release object is all of trunk from the deployed SHA forward — not the Writer's Studio PRs
alone.** `7c9dd5192..bfdf5512c` is **52 commits**, and includes work from lanes outside this phase
(#871 DB degradation, #872 jest cache). Assembling it as "the Phase 1 PRs" would understate what
actually ships.

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

#### Independent reproduction — 2026-08-02, at this record's own head

R5 and R6 remove stated release blockers, so they were re-measured by a second
observer rather than carried forward on the first observation.

**Environment:** isolated git worktree, detached at `6316cdcaa` (the head of #881 itself),
**empty `node_modules`** before the run — not the shared dependency tree, and not the
stale `.claude/worktrees/rc-verify` checkout.

| Instrument | Outcome |
|---|---|
| `npm ci` | `added 2439 packages, and audited 2443 packages` — `@codemirror/*` resolved from the lockfile |
| `npx jest --config jest.dom.config.js` | **10/10**, 1 suite, exit 0 |
| `npm run typecheck` | **239 errors = baseline 239**, exit 0, `✅ No TypeScript regressions` (program 3994 files vs baseline 3965 — 29 new files entered, no new diagnostic) |
| `npm run typecheck:full` | exit 1, **239 diagnostics** — of which `detectRelationalSignal.ts(36,7)` and `(61,7)` `TS2739` are the #863 pair, **still present** |
| `WriterField.tsx` `TS2307` count | **0** — the "canonical typecheck red" cited on #875 does not reproduce on a clean install |

⛔ This reproduces the two rows; it does **not** re-open the W8 walk. §3b stands.

⭐ **The lockfile is the referent.** A gate result measured against a shared or drifted
`node_modules` is a measurement of that directory, not of the release candidate.

⛔ Do not run `npm install` in the shared checkout while other sessions are active.

### 3b. Walks

## 🔴 RELEASE WALK FAILED at W8 — Phase 1 is not ready for founder acceptance or deployment

**Release-acceptance walk** — performed by: **Claude** · date: **2026-08-02** · build walked:
**trunk `9e1611306`**, clean-install environment (`npm ci` from the lockfile), local dev DB.

Fixture: disposable local member `walk.phase1`, one declared Living Work ("The Salt Road"),
zero manuscripts, zero atoms. ⛔ Production verifies the member's real state only — states are
never manufactured there.

| # | Step | Observed |
|---|---|---|
| W1 | Declared work, no manuscript → **Start writing** is the primary action | ✅ **PASS** — shell identity and page heading both resolve to the declared work; *Start writing* is the filled primary button |
| W2 | *Bring in existing writing* remains secondary | ✅ **PASS** — secondary underlined text link beside, not above |
| W3 | Nothing is created before the explicit gesture | ✅ **PASS** — 0 manuscripts before the click; after it exactly 1, `title IS NULL`, `provenance = member_written`, **0 `manuscript_sections`**, **0 `living_work_expressions`**. Routed by identity: `?m=8b42016c…` matched the created row |
| W4 | WriterField opens genuinely blank | ⚠️ **NOT A CLEAN PASS** — field rendered correctly and empty (`.cm-content` = `"\n"`), but **a real click did not focus it**. See F1 |
| W5 | First sentence autosaves | ✅ **PASS** — 91 chars persisted byte-exact. Returning shows **"Your writing"** as orientation; `title` stayed `NULL` — no synthetic title persisted |
| W6 | Leave and return — the sentence persists | ✅ **PASS** on persistence — exact sentence resumed. ⚠️ but see F2: the return routes by **position**, not identity |
| W7 | No duplicate blank page is created (double-tap / retry) | ✅ **PASS** — three parallel requests → **exactly one** manuscript, one `201` + two `200`, identical id. Also confirmed the other half: because the first page had writing in it, this correctly created a *new* blank rather than reusing it |
| W8 | Workbench: place a Keep, group it, leave, return | 🔴 **FAIL** — no reachable member gesture can put a Keep on the Shelf. See F3 |
| W9 | Arrangement verbs — move, reorder, duplicate, return to Shelf | ⛔ **NOT REACHED** — blocked by W8 |
| W10 | Fixture cleanup restores the member exactly | ✅ **PASS** — every baseline count restored exactly (`members=5 · manuscripts=3 · drafts=2 · revisions=5 · sections=176 · works=0 · expressions=0 · atoms=1 · wb_tables=1`); the one pre-existing capsule belonging to another member was left untouched |

### 🔴 F3 — W8 failure: the Keep gesture and the Shelf use different substrates

The acceptance path was: **a member performs a genuine Keep gesture → that Keep becomes
available on the Workbench Shelf.** The running product does not connect those two acts.

| Surface | Writes / reads |
|---|---|
| **Keep this moment** (prominent, in the MAIA conversation) | writes a **capsule** — `POST /api/capsules/from-chat-window` → `reflection_capsules` |
| **Workbench Shelf** | reads **`member_memory_atoms`** where `generated_by = 'member-gesture'` |
| `/maia/keep-capture` (only UI writing those atoms) | calls `POST /api/psyche/portfolio/keep`, and can keep **only pre-existing source candidates** drawn from `member_ideas` / `member_idea_blocks` — it cannot create a spontaneous Keep |

**For a member with an ordinary MAIA conversation and no developed Idea, no reachable gesture
creates a Shelf item.** The fixture's keep-capture page was correctly empty; the Keep it *could*
perform became a capsule the Shelf does not read.

⛔ **Calling `POST /api/psyche/portfolio/keep` by hand was deliberately NOT done as acceptance
evidence.** It would prove the endpoint works; it would not prove a member can perform the act
the release claims to support. The opposite world — where members cannot get anything onto the
Shelf — produces the identical endpoint result, so the endpoint is **not an admissible
substitute for the missing member path**. Any atom minted that way is a *diagnostic
fixture — not release acceptance evidence.*

⛔ Do not silently treat capsules as atoms.

### ⚠️ F1 — blank WriterField click-to-focus fails

The empty editor was **hit-test reachable** — `elementFromPoint` at its centre returned
`.cm-line` inside `.cm-content`, `pointer-events: auto`, no overlay, and the box measured
608×33px at (329, 294). A real click on that centre did **not** focus it; `document.activeElement`
stayed on an ancestor `div`, and 91 typed characters went nowhere. Writing became possible only
after `.cm-content.focus()` was called programmatically.

**A member cannot call `.focus()` from DevTools.** Rendering is not reachability, and hit-testing
is not focus. W4 is therefore not a clean pass.

### ⚠️ F2 — return routes by position, not identity

*Start writing* correctly routes by manuscript identity (`?m=<id>`). *Continue Writing* returns
through `/press/manuscript?tab=draft` with **no `?m=`**. It reopened the correct manuscript here
only because the fixture had one. This is a **known seam surfaced by the release walk** — not a
failure in a single-manuscript fixture, but unsafe before multiple expressions or projects exist.

### Blocking corrections before Phase 1 can be re-walked

1. **Connect a genuine, generally reachable member Keep act to the canonical Field Object
   substrate the Shelf consumes** — or alter the Shelf's admitted sources through an explicit
   ontology ruling.

   ⛔ **NOT by auto-creating an atom when a capsule is saved** (Kelly, 2026-08-02). That is the
   obvious engineering response and it is refused: it would be **silent promotion**, which this
   project has ruled against repeatedly. *"This conversation mattered"* and *"this belongs in my
   enduring Field"* are **two different declarations**, and the member makes both or neither.

   ⭐⭐⭐ W8 did not expose a broken button. It exposed that **two models of "keeping" coexist in
   the running product**: the member is asked to perform the first act while the Workbench
   assumes the second already happened. That is the failure — and it is an architectural one.

   The correction is therefore gated on a constitutional question, not an implementation choice:

   > **What is the first deliberate act by which something becomes part of a person's enduring
   > Field?**

   See `docs/architecture/FIELD_OBJECT_DECLARATION_QUESTION_2026-08-02.md` — recorded, **not
   ratified**, and authorizing no implementation.
2. **Fix blank-WriterField click-to-focus**, then repeat the real user action.
3. **Replace return-by-position with identity routing** before project multiplicity makes the
   ambiguity consequential.

⭐ W1–W3 and W5–W7 passed and that evidence stands. It does **not** dilute the W8 failure —
finding exactly this is what the assembled release walk exists for.

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
| R5 | **NOT RESOLVED — reclassified.** `detectRelationalSignal` is missing 5 `RelationshipTone` entries and 5 relation entries. The defect is real and the code is still wrong. What changed is its *standing*: it is pre-existing debt carried by the release, **not a release gate**. | #863, OPEN | ⛔ **Do not read this row as fixed.** Both diagnostics — `detectRelationalSignal.ts(36,7)` and `(61,7)`, `TS2739` — are present today and visible in `npm run typecheck:full` (independently reproduced at `6316cdcaa`, §3a). They sit **inside** the 239-error baseline, so they cannot fail the no-regression gate, which passes at 239 = 239. Separately: the "canonical typecheck red" cited on #875 as its merge blocker does **not** reproduce on a clean install — that failure was 4 `TS2307` diagnostics in `WriterField.tsx`, i.e. **R6 misattributed to #863**. R5 stays open and stays a residue. It closes when #863 closes, not when this release ships. |
| R6 | ~~#869's jsdom suite cannot run — `@codemirror/*` absent~~ | environment | **CLOSED 2026-08-02** — `npm ci` from the lockfile installs them; DOM suite runs **10/10**. Independently reproduced at `6316cdcaa` from an empty `node_modules` (§3a). The gap was the shared `node_modules`, never the lockfile. ⛔ Standing rule: gates are measured from a clean install, and `npm install` is not run in a shared checkout while other sessions are active. |

## 5. Deferred work

⚠️ The three **blocking corrections** in §3b are *not* deferred work — they gate the re-walk.


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
