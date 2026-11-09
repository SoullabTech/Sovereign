# WS-DEVELOP-STUDIO · M4 — the development plan (2026-11-09)

Status: **candidate, opt-in (stage flag), not independently reviewed, not walked in a browser.** Authorizes no migration, merge or deploy.

## What exists
- Migration candidate `20261108000004_development_plans.sql` (plans + append-only history). **Applied nowhere real.**
- A plan step = a direction anchored to an exact passage of a chapter MAIA was handed. It carries no replacement prose and cannot change the manuscript.
- Grounding is mechanical (`groundSteps`): an invented anchor, an unhanded chapter, or an incomplete step is dropped and counted. Writer may edit only wording, status, or remove (`applyStepEdits`); anchors are uneditable.
- Routes `plans` (GET/POST) and `plans/[planId]` (PATCH). POST needs a standing Work-level read permission, Sanctuary stated false, mints one receipt per chapter before text loads.

## Evidence (classes kept apart)
- Unit: `developmentPlan.test.ts` 9/9; `developStage.test.ts` 12/12 (jsdom, includes 5 plan tests).
- Shadow DB + real routes + scripted model: `plan.probe.test.ts` 6/6 on a throwaway local database (permission/Sanctuary refusals read nothing; 2 receipts for 2 chapters; invented steps dropped; manuscript content unchanged; other member gets 404; history kept and immutable; stale flag after a chapter edit; plan survives revoke; Work delete removes plans).
- **Not done:** browser walk, harness stub support for the plan tool, real-model check, independent review, founder walk.

## Gaps against the 2026-11-09 review criteria
1. Grounding: anchor+chapter yes; **saved revision, supporting evidence, intended effect: not captured** (basis stores a digest per chapter only).
2. Apply/preview/Undo through the passage desk: **not built** (M4b/M5).
3. Continuity on return: plan persists and is flagged stale; **pending proposals/applied edits: not built**.
4. Reading provenance by revision: **not built** — `lastRead` holds section ids and shows current text.
5. Refusal/isolation: wrong member, no permission, Sanctuary: tested. **Stale-revision apply, wrong-section apply, repeated apply: untestable until apply exists.**
6. Different forms (poetry, memoir, nonlinear): **untested**; chapter assumptions remain.
Also owed: exercise the Nov 8 finding (a commissioned reading unusable in the Work conversation) in the stage — **not verified by me**.

Held: "move chapter" lane; making the stage default; draft-protection guard rewrite.
