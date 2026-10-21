# KELLY'S WORLD — LIVING FIELD LIBRARY 01 · R7 First Local Synthesis Witness · 2026-10-01

## Witness subject

Founder-oriented query:

> What have we established about capability and authority?

The source packet was generated from the Living Field Library trace and bound to the existing JARVIS C1 local reasoning substrate.

No external model, write authority, repository mutation, or new IPC surface was used.

## First falsifier bite

The first live C1 run executed successfully but returned citations as `file.md (3)` rather than the required `file.md:3`.

Canonical `verifyEvidence()` therefore returned:
- citations: 0
- containment: failed
- proposal: refused with `NO_RELIED_SOURCES`

The answer was not admitted.

R6 was repaired by hardening the literal citation instruction.

## Admissible live witness

A later run using `qwen2.5:7b` produced:
- local execution: PASS
- authorized fragments offered: 8
- citations: **14/14 contained**
- invalid citations: 0
- wrapper contract: PASS
- standing: **CANDIDATE_UNESTABLISHED**
- relation warrant: none

The canonical verifier resolved cited basenames/full paths back to exact materialized fragments at repository SHA `6bc764da1`.

The wrapper now consumes that governed resolution rather than performing a weaker filename guess.

## Semantic-quality finding

The same model still proposed tensions that were not actually contradictions, including treating date/scope difference as conflicting authority.

Therefore:

> **Citation containment is not semantic entailment.**

R7 separates:
- local execution verification;
- citation containment;
- semantic review.

Even with perfect citation containment, semantic review remains:

`UNREVIEWED`

The result may be displayed as candidate orientation. It may not be presented as ratified law, source fact, established relation, or adjudicated synthesis.

## Repairs admitted by the witness

1. Grokker query stop-words now remove meta-inquiry words such as `established`.
2. Multi-token query coverage receives a ranking bonus so exact intersections outrank generic one-token matches.
3. Local synthesis instructions explicitly state that silence, omission, scope difference, or detail difference do not constitute contradiction.
4. Canonical verifier fragment resolution is authoritative for source descent.
5. The UI labels evidence as **citation containment**, not generic correctness.
6. Every local synthesis shows **semantic review: UNREVIEWED** until a separate semantic review act occurs.

Focused Grokker stack remains **16/16 PASS** after these repairs.

## Standing

**R7 PASS for runtime binding and epistemic containment.**

This is not a finding that `qwen2.5:7b` is the preferred Grokker synthesis model.

A model-suitability comparison is a separate act.

No merge or deploy is authorized.
