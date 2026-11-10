# Develop plan → passage → apply → leave → return → undo: journey witness (2026-11-09)

Lane: Writer's Studio (owner #1800). Branch `feature/ws-work-continuity-part-a-suite`. Candidate: the commit that adds this file.
Evidence classes kept apart. ⛔ Not a founder walk, not an independent review, not production. Stage is opt-in (`NEXT_PUBLIC_WS_DEVELOP_STAGE=1`).

## What was walked (browser, local harness, throwaway DB, stand-in model, fictional *The Long Harbour*)
1. Whole-work reading permission granted. Plan asked for in the writer's words → MAIA handed all 4 chapters, **4 receipts**, 2 grounded steps, 1 invented step dropped with a note.
2. *Work on this passage* → Write opened **the desk on the exact step sentence** (first walk found it held the passage but opened nothing; fixed: the hand-off now opens the desk, as a selection + Talk with MAIA does).
3. Desk: *Show me an edit* → Use it → text changed, "You used this. Undo". Server linked the desk's authorization to the step (accepted · same chapter · after the plan). Step stayed **Working on it**.
4. Left and returned to Develop: "You applied a change here in the passage desk. Whether that resolves the step is yours to say." + "This chapter has changed since the plan was made".
5. Refusals: *Work on this passage* on the changed step → **refused in place in Develop**, no navigation; forced through to Write → **refused there, visible on the page** (first walk: silent — the shared failure state is cleared on Work arrival; fixed with the hand-off's own notice). Status unchanged by either refusal.
6. Returned to Write, selected the sentence → the desk offered "You used MAIA's wording here. Undo" → Undo → "Undone. Your own wording is back."
7. Develop, nothing told: "You applied a change here and then undid it." Chapter matches what MAIA read again, so the change warning cleared.
8. Writer set **Resolved** → kept, alongside "applied, then undone". Four states separate.

## Automated evidence
- Unit + jsdom: `developmentPlan` (incl. `decideHandoff`, every refusal and the order of checks), `planClient` (no verdict ⇒ refuse), `developStage` (events, resolved ≠ applied, unverified notice).
- Real routes + throwaway DB: `plan.probe` 8/8, `plan-links.probe` 4/4 (wrong chapter · not accepted · other manuscript · other member · other member's plan · before the plan · another manuscript's route · no such step · one change one step · malformed · no smuggled claims · append-only). Lethality: weakening the store's chapter+accepted checks fails the refusal test; an unbound store fails the manuscript-binding test.
- ⚠️ On one run straight after recreating the probe database, 2 of 12 failed; 3 later runs 12/12. **Not explained**; not reproduced.
- Regression across Writer's Studio suites: 9 failing suites **also fail at `493f2d6da`** (pre-existing: listen ×6, KDP cover, askSourceCloseout, manuscriptImportWork). Two failures were this work's and are fixed: Remove copy now names "its plans" (drift guard + word-for-word copy test + mutation runner updated together); the plan no longer reads settled decisions (see Held).

## Founder ruling
- **Plans read the writer's settled decisions — RULED 2026-11-09: "Yes, same terms"** (as the Ask route). The closed reader list in `standingOutsideCognition.test.ts` is widened by exactly the plans route, with the ruling cited beside it. Same terms hold by construction: the plans route refuses in Sanctuary or unstated Sanctuary before any read. The plan prompt skips settled items unless the writer asks to revisit them.
- Review findings 1–4 on hand-off: fixed and unit-tested; finding 3 (unsaved buffer) and 4 (ordering) **not exercised in the browser**.

## Not done
Nonfiction book walk · real-model walk · revision-pinned provenance (G2) · readings in the Work conversation (G6, now next) · independent review of this exact source · founder walk.
Migration `20261108000004` (now also `development_plan_step_links`) remains an unapplied candidate. No merge, deploy or default switch.
