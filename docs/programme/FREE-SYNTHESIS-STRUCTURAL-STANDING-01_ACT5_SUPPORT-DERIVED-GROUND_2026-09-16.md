# FREE-SYNTHESIS-STRUCTURAL-STANDING-01 · ACT 5 — Support-Derived Ground

**Date:** 2026-09-16
**Base:** `54540a903` / ACT 4 standing-bound plan
**Mode:** offline R&D only
**Production authority:** NONE

## Question

Once present standing is substrate-bound, can visible historical grounding be derived from the evidence MAIA actually uses rather than selected through a separate model-controlled presentation field?

## Candidate law

> **Perception may be broad. Presentation should expose current standing plus the evidence actually used to support the synthesis.**

The model plan therefore contains only:

- free synthesis text;
- synthesis support evidence ids;
- optional question.

The substrate derives visible ground from the current claim head plus unique support ids. No separate `ground` or `contextEvidenceIds` choice remains in model authority.

## Pure composition proof

`support-derived-ground-proof.ts` passes **9/9** assertions:

- current support does not duplicate current ground;
- synthesis and question remain unchanged;
- current standing is always visible;
- superseded member history is shown only when directly cited as support;
- stale MAIA inference is shown only when directly cited and remains marked `stale_derived`;
- capacity overflow fails closed rather than silently dropping evidence.

## Local replay

Same correction fixture, same `llama3.1:8b`, temperature 0.2, seeds 42 / 137 / 211 / 509.

Support-derived planning renders **4/4** directly with no recovery pass.

Every run:

- visibly grounds only `E-NOW`;
- cites `E-NOW` as synthesis support;
- retains MAIA-owned provisional synthesis;
- moves into a forward question rather than reopening the corrected standing.

The model saw the full historical evidence field, but none of the four plans needed old evidence as explicit synthesis support. Historical evidence therefore remained available for perception without being mechanically replayed into the member-facing response.

## Economy

| condition | prompt chars | observed prompt tokens | direct renders | mean rendered chars |
| --- | ---: | ---: | ---: | ---: |
| RAW ACT 1 | 1,680 | 389 | 3/4 | — |
| BOUND ACT 4 | 1,715 | 396 | 4/4 | 732.8 |
| SUPPORT-DERIVED ACT 5 | **1,584** | **363** | **4/4** | **519.2** |

In this bounded fixture, removing model-controlled presentation selection makes both the cognitive interface and the rendered response smaller while preserving direct admissibility.

## Important new hazard — support reference is not semantic support

ACT 5 exposes the next unresolved gate. Seed 137 cites `E-NOW`, but its synthesis adds that other emotions may have been “previously overshadowed” by the focus on autonomy. `E-NOW` does not establish that proposition.

The envelope currently proves:

- the evidence id exists;
- its authorship/standing are substrate-owned;
- MAIA's synthesis remains provisional.

It does **not** prove that the cited evidence semantically entails or adequately supports every material clause in the synthesis.

So evidence descent is presently **referential**, not yet **semantic**. Provisional framing prevents authority laundering, but a valid citation must not be mistaken for proof of a claim.

## Architectural finding

ACT 5 supports a further separation:

```text
BROAD PERCEPTION
  full admissible evidence field
        ↓
FREE SYNTHESIS
  text + support references
        ↓
SUBSTRATE PRESENTATION
  current standing
  + only directly used historical support
        ↓
RELATIONAL RESPONSE
```

This is cleaner than asking the model separately what should be visible. The model chooses what it thinks; the substrate decides how evidence standing must be presented.

## Evidence

- `docs/programme/evidence/FREE_SYNTHESIS_STRUCTURAL_STANDING_ACT5_SUPPORT_DERIVED_2026-09-16.json`
- `docs/programme/evidence/FREE_SYNTHESIS_STRUCTURAL_STANDING_ACT5_SUMMARY_2026-09-16.json`
- `scripts/research/structural-standing/support-derived-ground.ts`
- `scripts/research/structural-standing/support-derived-ground-proof.ts`
- `scripts/research/structural-standing/act5-support-derived-replay.ts`

## Standing

ACT 5 is COMPLETE as bounded offline R&D. No production change is authorized or implied.

The next unresolved question is **semantic support validity**: how can a material MAIA-authored synthesis remain free and provisional while its declared evidence support cannot overclaim what the primary record actually warrants?
