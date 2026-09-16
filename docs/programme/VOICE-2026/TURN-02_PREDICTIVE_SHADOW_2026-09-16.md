# TURN-02 — Predictive Turn Intelligence · Shadow Foundation

**Date:** 2026-09-16
**Base:** `421b2e1fb083991a914a0aafd68e19f3013e32a6` (`TURN-01`)
**Branch:** `feature/voice-turn-intelligence-20260916`

## Purpose

Add predictive turn intelligence without giving a predictor authority over the member's floor. TURN-01 remains constitutional authority: explicit floor ownership, active member speech, and the member-selected Conversational Space outrank every model output.

## What landed

- `lib/voice/turnArbiter.ts` — pure WAIT / BACKCHANNEL_CANDIDATE / YIELD_CANDIDATE / INSUFFICIENT_EVIDENCE arbiter.
- `lib/voice/turnBench.ts` — benchmark metrics with **false floor seizure rate** as a first-class measure.
- `ContinuousConversation` accepts an optional predictor snapshot and emits `voice_turn_shadow_decision` at the three existing silence boundaries.
- Shadow telemetry carries scores/counts only; no transcript content.
- No call site branches on the arbiter result. Existing TURN-01 commit behavior is unchanged.

## Evidence allowed into TURN-02

Direct conversational evidence only:
- explicit floor ownership
- current speech activity
- elapsed silence
- selected/learned TURN-01 pause threshold
- observed pause-then-continue history
- future acoustic/prosodic continuation/yield probabilities
- future semantic incomplete/yield probabilities
- future backchannel probability

Not admitted as floor evidence: inferred arousal, personality, "silence comfort", breath alignment, response pressure, diagnosis, or psychological state.

## Safety laws

1. Explicit floor ownership => WAIT regardless of predictor confidence.
2. Active member speech => WAIT.
3. TURN-02 cannot recommend yield before TURN-01's selected/learned threshold.
4. Conflicting continuation/yield evidence resolves toward WAIT.
5. Backchannel permission is separate from floor permission.
6. Missing predictor evidence => INSUFFICIENT_EVIDENCE; never manufacture certainty.
7. Shadow recommendations have zero dispatch authority.

## Qualification

- TURN-02 + TURN-01/provenance regression set: **61/61 PASS**.
- TypeScript no-regression gate: **PASS**, 0 new diagnostics.
- `git diff --check`: PASS before commit.

## Still closed

- model dependency/import
- acoustic/prosodic inference runtime
- semantic turn model
- backchannel playback
- arbiter-controlled live endpointing
- benchmark promotion threshold
- production deployment

Next act: establish **MAIA-TURN-BENCH-01** corpus/schema and a local predictor adapter experiment. Predictor output remains shadow-only until benchmark promotion is separately ruled.
