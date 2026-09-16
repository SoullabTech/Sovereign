# TURN-03 A4 — Instrumentation Seal

**Date:** 2026-09-16
**State:** SEALED · NOT EXECUTED · HUMAN POPULATION UNOPENED · NO LIVE TURN AUTHORITY
**Branch:** `feature/voice-acoustic-turn-projection-20260916`
**Instrumentation commit:** `f570f62870621e388306c097578e86a61f17e7fa`

## What is sealed

A4 human-shadow instrumentation is implemented and durable. The observer measures real pause/resume timing and explicit `I'm Done` ground truth without owning transcript commit, cognition dispatch, TTS start, or endpoint timing.

Activation is fail-closed:

- `a4ShadowResearchEnabled` defaults to `false`;
- explicit tester research opt-in is required;
- explicit floor mode is also required;
- explicit floor mode alone is not research consent;
- ordinary member conversations produce no A4 research telemetry.

The web path observes existing analyser/VAD speech-state transitions. The native path observes the existing audio-level stream with hysteresis (`>= 0.02` speech, `< 0.01` silence). A4 opens no second microphone.

## Live-authority boundary

The historical web VAD automatic-submit path remains present for ordinary automatic mode. It is gated off during explicit floor ownership so an A4 research walk truthfully has zero silence-driven live commit authority.

The A4 observer exposes no transcript-send, cognition, TTS, native speech-recognition, fetch, or audio-capture API. It emits timing/count/category metadata only.

## Qualification

- A4 + ownership + TURN-01/02/benchmark suite: **64 / 64 PASS**.
- Transcript/capture/provenance regression suite: **41 / 41 PASS**.
- Final A4-specific suite after privacy/scope repairs: **14 / 14 PASS**.
- TypeScript no-regression: **PASS** — 229 diagnostics vs baseline 239; **0 regressions**.
- `git diff --check`: **PASS**.
- Instrumentation commit pre-commit sovereignty gates: **PASS**.
- Instrumentation commit pushed and exact origin match proven.

## Privacy boundary

Permitted A4 telemetry is limited to pause duration, selected Conversational Space, effective floor/ceiling, checkpoint, shadow decision, semantic cue category/count, observed continuation or explicit-yield event, and source path.

Raw audio and transcript text are not part of the A4 research record. A separate consented audio corpus, if ever desired, requires a separate custody act.

## What remains closed

This seal does **not** authorize:

- a founder instrumentation walk;
- any human A4 population;
- any threshold or cue tuning;
- any live endpoint influence;
- TURN-04;
- deployment;
- production behavior changes beyond the already-sealed explicit-floor safety guard.

The next lawful act is a separately governed founder instrumentation witness, followed only then by a frozen human-population plan if the instrumentation witness passes.
