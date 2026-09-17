# TURN-01 — Conversational Sovereignty Implementation — 2026-09-16

**Status:** Phase 1 implemented on `feature/voice-conversational-space-20260916`; production deployment not implied.

## Problem

Clients report that MAIA takes the conversational floor when they pause mid-thought. The live native path confirmed the mechanism: two competing hard-coded silence auto-submit paths (1.5 s audio-level silence and 2.5 s partial-result silence) could submit a member turn without evidence that the member intended to yield.

## Constitutional rule

**Silence is evidence of possible completion, never proof of completion. Explicit member floor ownership outranks automatic endpointing.**

## Delivered in Phase 1

1. **Conversational Space** member preference: Responsive 1.8 s · Natural 3.5 s (default) · Spacious 6 s · Contemplative 10 s.
2. **Learn my natural rhythm** (default ON): observes only pauses after which the member demonstrably continues; session EMA can only lengthen patience and stays inside the selected Space ceiling.
3. **Floor control**: Automatic, or `I’m Done button`, where silence has zero submission authority and the member explicitly yields.
4. **Native restart custody**: recognizer stop/restart is transport churn, not a conversational yield; explicit-floor turns preserve accumulated speech across native recognition cycles.
5. **Canonical explicit yield**: `I’m Done` calls the existing `processAccumulatedTranscript` path, retaining dedup, continuity, dispatch provenance, and parent submission.
6. **Visible state**: explicit mode displays `holding your floor` and an `I’m done` action distinct from Stop.
7. **Persistence**: `member_voice_preferences` stores conversational space, floor-control mode, and learn-rhythm preference.

## Non-deliverables / successor work

Phase 1 does **not** claim a learned prosodic or semantic end-of-turn classifier. A successor may add acoustic/prosodic projection, semantic incompleteness, backchannel prediction, and MAIA-TURN benchmark evaluation behind the same TURN-01 arbitration interface. Such work must not weaken explicit floor ownership or silently reduce a member's selected pause tolerance.

## Acceptance

- No native 1.5 s or 2.5 s auto-submit authority remains.
- Automatic timing has one resolved threshold.
- Explicit floor mode blocks web silence, native silence, and native-stop submission.
- Internal native cycles preserve the member's held turn.
- `I’m Done` uses the canonical guarded commit path.
- Adaptive learning never reduces the selected baseline.
- Existing dispatch provenance and transcript-commit tests remain green.
