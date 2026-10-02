# MAIA-AIN-INTEGRATION-01R1 — Tester Release Manifest

**Date:** 2026-09-27
**Boundary:** RECONCILED TESTER CANDIDATE READY FOR TOMORROW
**Runtime base:** `0dd5be166bdb487eb7b79e14c452fcd0353bd08c`
**Production mutation tonight:** NONE

## Acceptance control

The release candidate must preserve the founder-witnessed member experience already live on the runtime base:

- long-form relational continuity;
- Safari and Chrome voice carriage;
- automatic hands-free return after MAIA speech;
- Alloy TTS;
- current Sonnet conversational articulation when provider service is available;
- cross-browser and page-reload conversation continuity.

Any candidate that regresses this control is refused regardless of AIN test results.

## Census finding

The newer AIN work is not one missing divergent build.

Teaching Applications A0/A2 and RGR-06 are ancestors of the live lineage.
The I4 epistemic-join integration-shadow branch is divergent by ancestry, but its
runtime, migration, tests, witness script and primary records are already present
in the live tree byte-for-byte. The live I4 work-unit record is the fresher record.
## Live activation posture at freeze

Already ON in production:

- `AIN_KNOWLEDGE_GATE_ENABLED=1`
- `AIN_SHAPE_TELEMETRY=1`
- `MAIA_FIELD_CONTEXT_ENABLED=true`
- `MAIA_LONGTERM_WRITEBACK=1`
- `MAIA_PFI_FULL_INTEGRATION=true`
- `MAIA_PFI_MIND=true`
- `MAIA_SHADOW_MODE=1`
- `MAIA_STRICT_503=1`
- safe mode OFF.

Still closed:

- `MAIA_RELATIONAL_FIELD_SHADOW=0`
- `MAIA_RELATIONAL_FIELD_H8=0`
- `MAIA_RELATIONAL_FIELD_H8_CROSS_SESSION=0`
- `MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW` unset, therefore OFF.

The relational shadow member allowlist and model configuration may exist while
the outer gate remains OFF; they do not activate the shadow by themselves.

## Tester release posture

Tomorrow's baseline release does not require a new behavioral AIN merge.
It promotes the reconciled candidate while preserving all currently accepted
member-facing behavior.
### Canary sequence

1. Promote the exact frozen candidate only after founder review.
2. Re-run public health, authenticated MAIA conversation, Safari and Chrome voice.
3. Share baseline access with the small tester cohort.
4. Keep relational-field / epistemic-join shadow OFF during the first baseline walk.
5. If baseline remains clean, enable shadow only for explicit tester member ids.
6. Shadow activation remains observation-only and may not alter live answers.
7. Do not enable H8 cross-session or representation authority under this release.

Recommended first shadow canary:

- `MAIA_RELATIONAL_FIELD_SHADOW=1`
- `MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS=<explicit tester ids>`
- preserve one explicit shadow model;
- `MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW=1`
- keep `MAIA_RELATIONAL_FIELD_H8=0`
- keep `MAIA_RELATIONAL_FIELD_H8_CROSS_SESSION=0`.

This canary is separately authorized tomorrow; it is not part of tonight's runtime mutation.

## Evidence on current live lineage

- I4 constitutional matrix: **22/22 PASS**
- epistemic-join suite: **110/110 PASS**
- relational-shadow + voice control: **74/74 PASS**
- scoped epistemic-join typecheck: **EXIT 0**
- disposable I4 DB witness: **PASS**
## Tomorrow promotion checklist

Before any production promotion:

1. confirm exact candidate SHA and clean worktree;
2. confirm Anthropic and OpenAI provider probes are healthy;
3. confirm production database migration posture;
4. confirm no uncommitted provider experiment is included;
5. run the governed pre-deploy gate on the exact candidate;
6. verify serving identity after swap;
7. perform founder authenticated Safari and Chrome voice walk;
8. release to the named tester cohort only after that walk passes.

Rollback remains the immediately preceding production image.

## Explicit exclusions

This release does not authorize:

- member-wide relational shadow;
- I4 behavioral influence;
- H8 cross-session evidence;
- representation or standing promotion;
- new model/provider routing;
- unreviewed memory-schema expansion;
- the local uncommitted Anthropic billing-classification experiment;
- unrelated House, Writer's Studio, Decisions, Dream, Journal or other surface changes.

## Standing

> **CURRENT LIVE LINEAGE RECONCILED · AIN SUBSTRATE PRESENT · BEHAVIORAL CONTROL PRESERVED · TESTER RELEASE PACKAGE READY FOR FROZEN-CANDIDATE BUILD · NO PRODUCTION MUTATION TONIGHT**
