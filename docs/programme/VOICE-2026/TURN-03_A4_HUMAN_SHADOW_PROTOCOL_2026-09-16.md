# TURN-03 A4 — Human Shadow Protocol

**Date:** 2026-09-16
**State:** INSTRUMENTED · NOT EXECUTED · SEPARATE OPT-IN · EXPLICIT-FLOOR ONLY · NO LIVE TURN AUTHORITY

## Question

Does the A3 asymmetric floor-ownership candidate remain safe and useful when real people pause, resume, and explicitly yield during MAIA voice conversations?

A4 is observation, not endpointing. The experimental candidate may not cause MAIA to speak, commit a transcript, dispatch cognition, start TTS, or change a member's live silence timing.

## Instrumentation standing

The observer is now implemented behind a separate `a4ShadowResearchEnabled` input that defaults to `false`. Explicit `I'm Done` mode alone is not research consent. A4 observation requires both the governed research opt-in and explicit floor ownership.

The historical web VAD automatic-submit path is preserved for ordinary automatic mode, but is gated off whenever explicit floor ownership is active. This makes the A4 claim “silence has zero conversational authority” true without changing automatic-mode timing inside this research act.

## Safety condition

Every A4 research walk uses TURN-01 **explicit floor mode** (`I'm Done`). Silence therefore has zero conversational authority during the population.

The member's observed behavior supplies ground truth:

- speech resumes after silence → `continue`;
- member taps `I'm Done` → `yield`.

The candidate runs only as a shadow observer at the selected Conversational Space floor and its existing adaptive ceiling.

## Observation source

Pause timing comes from audio-state transitions, not transcript callback timing:

- web: the existing analyser/VAD speaking → silence and silence → speaking transitions;
- native: the existing audio-level stream with hysteresis (`>= 0.02` speech, `< 0.01` silence).

No second microphone is opened for A4.

## Recorded fields

Research telemetry may record only:

- pause duration;
- selected Conversational Space;
- effective floor and existing adaptive ceiling;
- floor/ceiling checkpoint;
- shadow candidate decision (`wait` / `yield_candidate`);
- semantic cue **category/count**, never transcript words;
- observed continuation or explicit-yield event;
- source path (`web_audio_vad`, `native_audio_level`, `ui_im_done`).

A4 does **not** add raw audio or transcript text to the research record.

## Privacy / consent

A4 requires explicit tester opt-in to a turn-timing research walk. The member remains in `I'm Done` mode for the whole governed population. Ordinary member conversations are not silently converted into research examples.

If a separate consented audio corpus is ever desired, that is a different custody act and remains outside this protocol.

## Frozen candidate under test

The A3 candidate remains unchanged during a governed A4 population:

- model completion cannot shorten member space;
- explicit floor and active speech always win;
- strong semantic continuation may hold beyond the generic ceiling;
- explicit semantic yield may hand off at the effective member floor;
- otherwise ambiguity is held until the existing Space ceiling;
- simultaneous speech onset outranks a timer boundary.

No threshold or cue rule may be tuned from early A4 rows and then applied to later rows in the same population.

## Required coverage before adjudication

Freeze a population plan before execution that includes:

- Natural, Spacious, and Contemplative members/turns;
- pauses below the floor;
- pauses between floor and ceiling;
- pauses at and beyond the ceiling;
- word search / hesitation;
- semantically complete but continuing thoughts;
- emotional or reflective pauses;
- re-entry after an apparently complete sentence;
- explicit `I'm Done` yields;
- ordinary implicit-feeling endings followed by explicit `I'm Done` only after the member genuinely decides to yield.

The exact N belongs in the execution authority, not this preparation record.

## Primary measures

1. **Projected false floor seizure rate** — shadow candidate would have yielded before observed continuation.
2. **Projected yield delay** — time between the member's actual `I'm Done` ground truth and the candidate's generic/semantic handoff point, evaluated counterfactually.
3. Coverage by Conversational Space and pause-duration band.
4. Boundary races: speech resuming at or immediately around a floor/ceiling checkpoint.

All rows remain in the population. No top-up, selective deletion, or post-hoc threshold change may manufacture a pass.

## Advancement law

A4 may support a future TURN-04 proposal only if real human evidence shows materially reduced projected false seizures without unacceptable yield delay across the declared population.

A4 itself grants no TURN-04 authority. TURN-04, deployment, or live endpoint influence remain CLOSED.
