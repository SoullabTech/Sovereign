# TURN-01 Desktop deployment integration

Kelly authorized deployment of the existing Conversational Space and I’m Done controls on 2026-09-17 after observing listening stop after a few turns. Production at investigation: fb391f20f; TURN-01 source: 421b2e1fb (not an ancestor of production). TURN-02/03 predictor work is excluded from this release.

## Repairs

- Desktop waits for actual speech before treating silence as an endpoint.
- Tap to Speak is a real button sharing the existing Speak action.
- Conversational Space preferences now govern Desktop MediaRecorder endpoint timing.
- Desktop learns only from pauses followed by resumed speech, using the existing bounded session rhythm policy.
- I’m Done finishes the real recording through a separate completion signal. Stop/navigation still revoke it. Provisional display text is never committed.
- Explicit mode cannot end a turn on silence. A safety ceiling releases capture and returns the final transcription as an editable draft; it does not send a member turn.
- A wholly silent capture is not sent for final transcription.

## Verification

90 focused tests pass, including all four pacing thresholds, explicit completion, late Done after cancellation, repeated turns, safety-limit disposition, and provisional/final separation. Desktop tests: 358/358. TypeScript: 229 diagnostics against baseline 239, zero regressions.

Read-only production migration preflight found exactly one pending migration: 20260916123000_turn_taking_preferences.sql. Full immutable-SHA deployment is required so the new preference columns ship with their readers/writers. Reverting the application does not require dropping these additive preference columns.

Production microphone acceptance remains pending. Required walk: choose and save I’m Done in Settings → Voice; speak, pause longer than ten seconds, continue, and press I’m Done once. MAIA must wait for the press. Repeat multiple turns; Stop must cancel capture. Automatic mode must respect each selected conversational space.


## Production reconciliation

During #1330 CI, 924845107 (relational-field shadow) was independently deployed. The 445a4d1a6 deployment controller was stopped before swap to preserve it. A second in-flight deployment then targeted d8a4ed010 (Safari interim-only finalization). Release PR #1331 retains both ancestors. Its one Safari conflict preserves TURN-01 explicit-floor precedence and selected pacing. Done also uses the Safari selector for browser interim-only speech; Desktop completion remains on its independent final-transcription path. Combined tests: 153/153. The extra branch reconciliation is deployment custody, not promotion of shadow output or TURN-02/03.
