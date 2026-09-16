# VOICE-SAFARI-SILENT-DEATH-01 — long-turn continuity repair

Date: 2026-09-16
Branch: `feature/voice-acoustic-turn-projection-20260916`
Parent witness head: `37ae82d85b732fbaf4621a66f82892235e25ec9e`

## Observed failure

During the TURN-03 A4 founder instrumentation walk on Safari 26.5, explicit-floor mode correctly held the member floor beyond both the Natural 3.5s floor and 6.0s ambiguity ceiling. The member resumed after a 15.81s pause and MAIA still did not seize the floor.

The capture then failed with `voice_capture_lost / silent_death / NO_AUDIO_FRAMES`. The forensic witness was `analyser_hearing_voice`: the track remained live, enabled and unmuted, the AudioContext remained running, and the page-local analyser continued to receive voice energy while `webkitSpeechRecognition` returned no further result/error/end event. This isolates the failure to the recognition pipeline rather than the physical microphone path.

A second defect was observed at explicit yield: Safari could display member speech only as an outstanding INTERIM while `accumulatedTranscript` still contained zero finalized characters. The existing `I'm done` path therefore logged `voice_explicit_yield_ignored chars=0` even though member-authored words were visibly present.

## Governing long-turn law

A browser recognition epoch is transport machinery, not a conversational turn boundary.

In explicit-floor mode, the member alone ends the turn. Safari may cycle or replace its recognizer internally, but those events may not submit, truncate, reset, or discard the held member utterance.

## Repair

1. Add an evidence-qualified Safari self-heal for exactly:
   - `silent_death`
   - forensic witness `analyser_hearing_voice`
   - Safari web path
   - explicit member floor
   - foreground page
   - live recognition state
   - no prior unproven self-heal attempt
2. Replace only the Web Speech recognizer; keep the member-facing floor/listening state and local analyser stream intact.
3. Permit one silent heal. The retry latch resets only after an actual recognition RESULT, not `onstart`, `onaudiostart`, or `onspeechstart`.
4. Before an explicit-floor browser epoch restart, materialize any outstanding visible interim into the held member turn and continuity buffer.
5. Before `I'm done` tests whether there is text to send, materialize the same outstanding visible interim so manual yield commits what the member can see.
6. Preserve all other capture-loss causes as fail-closed/member-initiated recovery.

## Scope

This repair strengthens long-turn continuity for Safari explicit-floor (`I'm done`) conversations. It does not change automatic endpointing thresholds or grant A4/live turn authority. Automatic-mode interim-tail behavior remains a separate evidence question.

Desktop sovereign capture remains separate: `DESKTOP_MAX_UTTERANCE_MS = 120000` is a safety ceiling, not a turn boundary; ordinary Desktop speech ends on silence.

## Qualification

- Focused Safari/liveness/restart/tail/A4/receiver suite: 99/99 PASS
- Broad voice/turn/capture regression suite: 166/166 PASS
- Desktop long-utterance + Safari + commit suite: 20/20 PASS
- TypeScript no-regression: 229 diagnostics vs baseline 239; 0 regressions
- `git diff --check`: PASS

## Live witness still owed

One post-repair founder Safari walk must prove:

1. explicit-floor status remains visible,
2. a long pause/recognizer cycle does not truncate/reset the turn,
3. if silent-death recurs, `voice_capture_self_heal` starts one fresh recognizer generation,
4. subsequent speech produces a recognition result and resets the one-attempt latch,
5. `I'm done` emits `voice_turn_a4_explicit_yield`,
6. exactly one canonical `voice_turn_committed` follows with trigger `manual`,
7. no duplicate dispatch and no lost visible tail.
