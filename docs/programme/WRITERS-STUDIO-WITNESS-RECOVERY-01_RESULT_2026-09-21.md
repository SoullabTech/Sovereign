# `WRITERS-STUDIO-WITNESS-RECOVERY-01` — WITNESS RESULT · 2026-09-21

**Standing of the candidate**: `SOURCE-REPAIRED · FALSIFIER-GREEN · RUNTIME CLOSURE NOT YET ESTABLISHED`
**Branch**: `claude/vibrant-bardeen-w5btk0` · **Base**: `06a4e50f3`
⛔ No merge. ⛔ No deploy. ⛔ Production untouched.

---

## 0 · ⚠️ THE ENVIRONMENT, STATED FIRST BECAUSE IT DECIDES THREE OF FOUR

This container has **no `ANTHROPIC_API_KEY`**. `ANTHROPIC_BASE_URL` is set — it is
this session's own agent proxy — and the structured router's adapter constructs
its client inside `execute()`, so without a key MAIA's cognition cannot run here.

⛔ **The session's own inference channel was not substituted, and that is a
ruling rather than a limitation.** W4, W3a and W3b measure *what MAIA produces
under her own prompt assembly and her own authorized provider*. Answering them
from a different model would produce a transcript with no bearing on the
question, indistinguishable in the record from a real one.

⭐ What **was** available, and was used: a disposable PostgreSQL 16 cluster
(`server_encoding = UTF8`), 438 of 494 migrations applied, 56 refused — the same
count the S3 route-integration witness recorded, on absent extensions and
predecessors. Every table the recovery path touches was created.

---

## 1 · RESULTS

| Finding | Result | Basis |
|---|---|---|
| **W4** — latitude-control discoverability | **NO EVIDENCE** | needs MAIA's cognition; no key |
| **Undo** — recovery legibility | **INSTRUMENTED-BUT-UNRESOLVED** | server chain witnessed; browser path not |
| **W3a** — contiguous-run boundary | **NO EVIDENCE** | needs MAIA's cognition; no key |
| **W3b** — fraction boundary | **NO EVIDENCE** | needs MAIA's cognition; no key |

⛔ Each is closed independently. **No result here is evidence for another.**

---

## 2 · UNDO — WHAT IS NOW WITNESSED, AND WHAT IS NOT

Instrument: `scripts/witness/undo-recovery-witness.ts`, run against the
disposable cluster. It refuses to start unless `DATABASE_URL` names a database
whose name contains `witness`, `shadow` or `disposable`.

### WITNESSED — a literal result of running the real modules

```
ok:              undoAvailability = ok              canUndo = true   MATCHES
  inline: control=true  reason=false
  page  : control=true  reason=false
work_moved:      undoAvailability = work_moved      canUndo = false  MATCHES
  inline: control=false reason=true
  page  : control=false reason=true
already_undone:  undoAvailability = already_undone  canUndo = false  MATCHES
  inline: control=false reason=false (block withdrawn — applied revision no longer shown)
  page  : control=false reason=false (block withdrawn — applied revision no longer shown)
no_snapshot:     undoAvailability = no_snapshot     canUndo = false  MATCHES
  inline: control=false reason=true
  page  : control=false reason=true

thread view: application.undoAvailability = work_moved · survives JSON = work_moved
custody absent AND undone AND moved → no_snapshot
RESULT: PASS · 0 failures
```

Four states seeded end to end through the real custody chain — `members` →
`member_manuscripts` → `manuscript_working_drafts` → `manuscript_draft_sections`
→ `proposal_chains` → `proposal_versions` → `ask_threads` →
`manuscript_revision_authorizations` → `manuscript_application_recovery` — and
read back through the **shipped** `readApplicationRecovery`. The desk output is
the **shipped `RevisionDesk`**, rendered by `react-dom/server`, not a copy.

⭐ **`already_undone` renders neither control nor reason, and that is correct**:
the client withdraws `appliedVersionId` once undone, so the block is gone and
`undoMessage` speaks instead. ⛔ It is recorded by name rather than waved
through — a blanket escape there would be the same silence this lane refuses.

⭐ **The payload link is closed.** The thread route returns `read.view`
verbatim, so reading the view is reading the JSON body; the field is present and
survives serialization.

### ⛔ NOT WITNESSED

**That the props arrive in the running application.** That is a browser fact and
this is not a browser: `RebuildStudioClient`'s state plumbing between
`readBoundEditorialThread` and the two props is the one remaining link.

⛔ Per the authorization: if neither a control nor a reason renders live, the
finding stays open as a prop/wiring defect. **The cause is not to be inferred
from absence.** ⭐ But the reading is now discriminating: a **sentence** means
the props arrived and undo was withheld; **silence** means they did not.

---

## 3 · W4 / W3a / W3b — PREPARED, NOT RUN

Instrument: `scripts/witness/editorial-scope-fixture-prep.ts` (exit 0,
`FIXTURES VALID · 0 problems`). It prints the passages and the exact acts, and
**asserts against the real `judgeProposalScope`** that each fixture breaches
exactly one bound:

| | words | removed | fraction (max 8%) | longest run (max 8) | verdict |
|---|---|---|---|---|---|
| **W3a** | 155 | 12 | **7.7% — INSIDE** | **12 — OUTSIDE** | `scope_removes_contiguous_passage` |
| **W3b** | 155 | 18 | **11.6% — OUTSIDE** | **5 — INSIDE** | `scope_removes_too_much` |
| **W4** | 195 | 40 | inside (latitude 5) | inside | `scope_removes_paragraphs` |

⭐⭐ **This is the repair for the two attempts that returned NO EVIDENCE.** The
old act asked for "something that plainly needs a substantial rewrite", which
MAIA correctly declines at Touch. These ask for a **specific, small, plausible**
edit she has no reason to refuse — and the law refuses it anyway.

⭐ **The founder's own instruction is now structurally enforced**: W3a *cannot*
fail on the fraction and W3b *cannot* fail on the run length, so neither can be
mis-scored against the other rule.

⚠️ **What this does not prove**: that MAIA performs the requested edit. That is
the live question, and the only thing founder presence is needed for.

---

## 4 · FOUNDER BURDEN — OBSERVATION ONLY

```
npx tsx scripts/witness/editorial-scope-fixture-prep.ts
```
Paste the passage, set the named controls, send the named act, record: proposal
produced or refused · the exact reason shown · which boundary fired.

For **W4**, the only question that cannot be settled mechanically is
experiential: *does she name the control once, in the words on screen, without
pressing?* ⛔ Repeated pointing at the checkbox is a CONTRADICTION, not a pass.

---

## 5 · CONTAINMENT

Disposable cluster, destroyed after the run · no production read · no deploy ·
no merge · statement parameters suppressed to types by the existing
`lib/db/postgres` discipline · the record carries no authored prose from any
member's work — the witness passages are neutral prose written for this purpose.

⚠️ `tsconfig.witness.json` exists so a witness can render the **shipped**
component rather than a copy: Next compiles `jsx: preserve` with the automatic
runtime itself, and a standalone `tsx` run has no such step. ⛔ It changes no
build and no gate.

---

## 6 · CARRIED FORWARD, UNCHANGED

⚠️ `lib/manuscript/development/__tests__/evidenceCannotAct.test.ts` fails on
`20260913000002_disclosure_boundary_developmental_ask.sql`, an S3-lane migration
caught by a filename pattern rather than by substance. **Outside this lane, not
repaired, not absorbed.**
