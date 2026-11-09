# Review packet — Develop plan journey at `8a7b83659` (2026-11-09)

Content-free: no member data anywhere in this packet or its tests. Fixtures are fictional (*The Long Harbour*).
Lane: Writer's Studio (owner #1800) under Soullab Continuity #1982; release ledger #1938. Claude Code is the accountable executor; this packet is for **independent** reviewers.

## Exact candidate
- Commit: `8a7b83659` on `feature/ws-work-continuity-part-a-suite`. Base for this work: `493f2d6da`.
- Range: `git diff 493f2d6da..8a7b83659` — 24 non-doc files, +1528/−15.

## Changed paths (non-doc)
- Pure rules: `lib/writersStudio/developmentPlan.ts` (groundSteps, snapAnchor, applyStepEdits, staleStepIds, stepStanding, locateAnchor, decideHandoff, HANDOFF_REFUSAL_COPY)
- Store: `lib/writersStudio/developmentPlanStore.ts` (createPlan, latestPlan, editSteps [row lock], deletePlan, linkStepApplication, stepEvents)
- Client: `lib/writersStudio/planClient.ts`
- Routes: `app/api/sovereign/manuscripts/[id]/plans/route.ts` (GET, POST), `plans/[planId]/route.ts` (PATCH, DELETE), `plans/[planId]/links/route.ts` (POST)
- Model call: `lib/manuscript/ask/planReader.ts`
- Migration (candidate, unapplied anywhere real): `database/migrations/20261108000004_development_plans.sql` (development_plans, development_plan_history, development_plan_step_links)
- UI: `app/dev/writers-studio-pc3-live/DevelopStage.tsx`, `P4R1DevelopView.tsx`, `P4R1WriteEditController.tsx` (hand-off), `P4R1Pc3WriteEditView.tsx` (page notice)
- Copy and erasure: `lib/writersStudio/deleteWork.ts`, `app/api/members/delete-account/route.ts`
- Guards and tests: `lib/manuscript/standing/__tests__/standingOutsideCognition.test.ts`, `lib/writersStudio/__tests__/{developmentPlan,planClient,removalCopyDrift,removeCopyConversations}.test.ts`, `app/writers-studio/__tests__/developStage.test.ts`, `tests/constitutional/ws-develop-studio/{plan,plan-links}.probe.test.ts`, `tests/constitutional/ws-delete/mutants/run.mjs`, `scripts/witness/ws-continuity-walk.sh`

## Governing decisions
- Plan steps are directions anchored to exact passages; they never carry replacement prose and never change the manuscript; a step opens the existing passage desk (founder 2026-11-09).
- Proposed · applied · undone · writer-resolved are four separate states; an applied edit never resolves a step.
- Plans read settled decisions **on the same terms as the Ask route** (founder ruling 2026-11-09, "Yes, same terms"): Sanctuary excluded; settled items respected unless the writer asks to revisit; no model may widen the closed reader list.
- A plan is bound to member, manuscript, the chapter text MAIA read (per-chapter digest) and the settled-decision context she read (digest). Unknown is never treated as unchanged.
- Codex/Kimi review of repository source is blocked by the founder's interim hold of 2026-09-20. Local models (Ollama) are in bounds.

## Tests (evidence class in brackets)
- `developmentPlan.test.ts`, `planClient.test.ts`, `developStage.test.ts`: 50 [unit / jsdom].
- `plan.probe` 13 + `plan-links.probe` 4 = 17 [real routes, throwaway local DB, scripted model]. Four consecutive clean runs.
- Browser walk of plan → passage → apply → leave → return → undo on the novel [local harness, stand-in model]: `WS-DEVELOP-STUDIO_M4C_JOURNEY_WITNESS_2026-11-09.md`. Predates the last three commits.
- Lethality shown for: manuscript binding, conversation binding, link chapter/accepted checks (each test fails against the weakened code).

## Failure cases covered (each refuses and changes nothing)
Wrong manuscript · other member · no permission · Sanctuary on or unstated · revoked permission · stale chapter · unverifiable chapter · editor text differs from what MAIA read · unsaved / not-ready editor · decisions changed · decisions unknown · duplicate anchor · missing anchor · superseded (older) hand-off · repeated link (idempotent) · link to another chapter / unaccepted / earlier / other member's change · anchor change or added step at the database · null or malformed bodies · conversation from another manuscript · failed model call (receipts stay "attempted").

## Known open
- First test run straight after a schema change has twice failed 2 probe tests; unexplained, not reproduced in later runs.
- Not browser-walked since `c74074075`: unsaved-buffer, ordering, decisions-changed refusals.
- Sanctuary is asserted by the client (same as Ask).
- A link proves the change was on the step's chapter after the plan, not that it came from this exact hand-off (client tracks that; server cannot).
- G6 (a reading MAIA did in Develop missing from the next conversation) is open and next.
- Nonfiction walk and real-model walk not done.

## What we ask of a reviewer
Read the diff, not this summary. For each finding give file:line, a concrete failure scenario, severity and confidence, and say which parts you verified versus inferred.
