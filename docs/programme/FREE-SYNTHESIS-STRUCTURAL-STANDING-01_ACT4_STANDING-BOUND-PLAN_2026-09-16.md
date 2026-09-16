# FREE-SYNTHESIS-STRUCTURAL-STANDING-01 · ACT 4 — Standing-Bound Plan Interface

**Date:** 2026-09-16
**Base:** `b55c25fc0` / ACT 3 recovery taxonomy
**Mode:** offline R&D only
**Production authority:** NONE

## Question

Can present member standing be made structurally unavoidable in the model plan without pre-writing MAIA's synthesis, invoking a recovery pass, or adding meaningful behavioral prompt pressure?

## Instrument correction

The first ACT 4 comparison is **REJECTED / NO CAUSAL EVIDENCE**. In an attempt to make RAW and BOUND prompts share a common body, the RAW prompt was refactored enough that the frozen seed-211 failure disappeared. That comparison cannot establish an interface effect and is preserved only as instrument history.

The corrected baseline reruns the exact ACT 1 RAW prompt/schema. All four `rawPlanSha256` values reproduce the frozen ACT 1 artifact exactly; seed 211 again refuses as `superseded_without_current`.

## Standing-bound interface

The BOUND plan removes one decision from model authority:

- substrate owns the current claim head (`E-NOW`) and prepends it to visible ground;
- model may select optional historical context (`E-OLD`, `M-OLD`);
- model still writes all synthesis text and the question;
- synthesis support references remain model-selected;
- normal standing-envelope validation still governs the resulting plan.

The pure adapter passes **11/11** assertions: current standing is unavoidable, model history selection is preserved, synthesis/question are unchanged, stale history remains explicitly historical, and synthesis remains provisional.

## Corrected replay

Same local model (`llama3.1:8b`), temperature 0.2, seeds 42 / 137 / 211 / 509, same evidence and correction fixture.

### Exact RAW baseline

- prompt: 1,680 chars;
- observed prompt-eval count on rendered rows: 389;
- direct render: **3/4**;
- seed 211: `superseded_without_current`.

### BOUND minimal

- prompt: 1,715 chars (**+35**);
- observed prompt-eval count: 396 (**+7**);
- direct render: **4/4**;
- current standing visibly grounded: **4/4**;
- `E-NOW` present in model-selected synthesis support: **4/4**;
- ACT 2 recovery calls: **0**.

The model therefore remains free to synthesize, but it no longer controls whether the member's present standing is visible in the composition.

## What this does and does not prove

This bounded result supports moving **standing availability** out of model choice. It does not establish production reliability, population-level response quality, or the final wording/composition policy.

It is also not literally a zero-text intervention: the plan field description necessarily changes. The measured increase is 35 characters / 7 local prompt tokens, and no new behavioral coaching is added.

All four BOUND runs selected both optional historical context items. That is acceptable for this authority test but may be unnecessarily verbose. ACT 4 therefore does **not** authorize a final ground-selection policy.

## Relationship to ACT 2

ACT 2 remains necessary as a narrow containment backstop for admissible future interfaces that can still produce a recoverable composition omission. ACT 4 shows a preferable upstream direction: make current standing non-optional so the downstream recovery path is needed less often.

## Architectural finding

> **The model may choose what history is useful and what synthesis to offer. The substrate need not ask the model whether the member's present standing exists.**

This is a stronger separation than prompt instruction: current standing becomes an input invariant of composition rather than a behavior MAIA must remember to perform.

## Evidence

- `docs/programme/evidence/FREE_SYNTHESIS_STRUCTURAL_STANDING_ACT4_RAW_REPRO_2026-09-16.json`
- `docs/programme/evidence/FREE_SYNTHESIS_STRUCTURAL_STANDING_ACT4_BOUND_MINIMAL_2026-09-16.json`
- `docs/programme/evidence/FREE_SYNTHESIS_STRUCTURAL_STANDING_ACT4_SUMMARY_2026-09-16.json`
- `docs/programme/evidence/FREE_SYNTHESIS_STRUCTURAL_STANDING_ACT4_REJECTED_REFACTORED_2026-09-16.json`
- `scripts/research/structural-standing/standing-bound-plan.ts`
- `scripts/research/structural-standing/standing-bound-plan-proof.ts`
- `scripts/research/structural-standing/act4-standing-bound-corrected-replay.ts`

## Standing

ACT 4 is COMPLETE as bounded offline R&D. No production change is authorized or implied.

The next unresolved question is **ground economy**: once current standing is structurally bound, how much historical context should be rendered versus remain available only as support/perception, without losing transparency about reorganization?
