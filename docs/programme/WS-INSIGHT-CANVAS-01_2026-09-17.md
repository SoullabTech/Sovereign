# WS-INSIGHT-CANVAS-01 — Creative editorial workspace

Date: 2026-09-17. Base: canonical b603fe52e. Implementation; not deployed.

## Purpose
Keep the tidy Write/Develop rail while letting a writer open an observation across the canvas, understand its intention and reader effect, compare alternatives, and make an explicit revision. Repeated fire stories may introduce, deepen, or embody an idea; recurrence alone is not a reason to remove them.

## Delivered
- Native modal workspace preserves the mounted writer, return place, scroll, and local exploration drafts. Keyboard Escape and explicit return work; pending writes prevent premature closing.
- Develop displays all cited passages. Exact codepoint markers require body coverage, matching current SHA-256 digest, valid ranges, and current assessment. Stale, missing, or unverified evidence cannot authorize a passage revision.
- Context slider, marker toggle, passage navigation, verbatim observation, and reading limits remain visible. Develop hands the reading/observation/section identity to Write without changing the manuscript.
- Write compares current prose with a real conversation version, shows additions and removals, and lets the member adjust, save a member version, then explicitly apply that version. Existing member-owned endpoints retain author, chain, binding, conflict, and adoption authority.
- A local revision remains pinned to its original thread and predecessor. A 409 preserves the draft and requires deliberate reconciliation; no automatic retry or retargeting.
- Intention and reader fields precede an explicit discussion request. Optional questions cover recurrence, proportion/depth, chapter/book flow, examples, forms, and voice/rhythm. Opening or moving sliders never requests inference.
- Inspiration edits the existing declared Work purpose; no parallel Work or inspiration store. Bringing purpose into a question is explicit and does not send it.
- Gold lines display member-selected authenticated Keeps from their own work, with source attribution. Only the chosen Keep ID is a local display preference. Reflection custody and external quotations are not imported.

## Creative-process acceptance
Evaluate with writers through an actual passage decision, including the option to retain the original. These are proposed evaluation criteria, not instrumented scores or claims about achieved reader outcomes.

| Creative task | Evidence of useful support |
|---|---|
| Recover the initial inspiration | Writer can name what the piece must preserve and reference their saved purpose. |
| Understand a recurring story | Writer can distinguish the role of each occurrence before deciding whether to retain, deepen, redirect, or replace it. |
| Explore alternatives | Writer can compare plausible approaches without an imposed preferred answer. |
| Shape depth and form | Writer can judge length, examples, rhythm, imagery, and explanation in context. |
| Consider the reader | Writer states the intended reader experience; actual reader feedback later tests that intention. |
| Complete a revision | Only the chosen passage/version changes; writer can return to the manuscript and assess the result. |
| Retain authorship | Writer can challenge MAIA, keep current prose, and stop without adopting a suggestion. |

## Validation and remaining acceptance
The reproducible browser fixture imports the actual Write and Develop components, with controlled Next platform adapters and member API responses. It is candidate UI validation, not production backend acceptance.

Run `node scripts/witness/insight-canvas/build.cjs` then `node scripts/witness/insight-canvas/run.cjs`. Chromium and WebKit cover explicit member-version saving/adoption, predecessor conflict, draft retention, return scroll, inspiration opt-in, attributed gold selection, 390px layout, Escape, all three cited passages, evidence toggles, and Develop-to-Write handoff with original-place restoration. Both engines passed all eight summary groups combined.

Unit coverage includes digest races, superseded/unmeasured evidence, body coverage, unavailable hashing, absent references, foreign manuscript identity, invalid ranges, Unicode offsets, handoff identity, and lossless comparison reconstruction.

The existing Studio test population has two failing assertions in shellProjection.test.ts about older navigation copy/structure. Both were reproduced on untouched b603fe52e; that unrelated navigation file is unchanged. See PR for final gate totals.

Follow-up acceptance: a member should walk the actual three-fire-story example against their book, assess alternatives and voice, apply one chosen revision, and solicit reader feedback. Include a poet and a teaching/practice writer before generalizing suitability across forms. No automatic engagement or quality scoring was added.

External writers/thinkers as gold lines remain follow-up work: explicit selection, verified wording/source, and appropriate quotation handling are required. Generated text must never masquerade as an attributed quotation. No provider, migration, automatic manuscript write, or production deployment is introduced.

Final gates: TypeScript 229 existing diagnostics versus 239 baseline, zero regressions; preflight and design canon passed. Studio suites: 1,010 passed, the two reproduced baseline assertions failed (1,012 total). New evidence/comparison suite: 13/13 passed. Follow-up tracked as MAIA-SOVEREIGN-2y1.
