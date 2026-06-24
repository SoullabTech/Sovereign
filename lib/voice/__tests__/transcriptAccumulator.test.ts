/**
 * ContinuousConversation — "hearing half" transcript regression (iOS Safari PWA)
 *
 * Regression guard for the bug reported 2026-06-05 (Andrea tester): on iOS Safari
 * `recognition.continuous = true` is effectively ignored, so the browser fires
 * `onend` after every phrase. The component auto-restarts recognition to stay
 * listening within the SAME turn — but the restart's `onstart` used to
 * unconditionally run `accumulatedTranscript = ""`, discarding the first half of
 * the user's sentence. Only the last clause survived.
 *
 * The fix threads a `continuationRestartRef` flag: the `onend` auto-restart sets
 * it true immediately before `.start()`, and the next `onstart` consumes it to
 * PRESERVE (not wipe) the buffer. A genuinely new turn still wipes. `submit`
 * (processAccumulatedTranscript) and `stop` (stopListening) clear buffer + flag.
 *
 * These tests do NOT need a SpeechRecognition harness or an iOS device. The
 * load-bearing decision logic is extracted to `lib/voice/transcriptAccumulator.ts`
 * and imported BY THE COMPONENT (web path: onstart + onresult), so a regression in
 * the contract breaks the component and these tests together. The "core
 * regression" test FAILS if the continuation flag is ignored (i.e. if `start`
 * always wipes) — it is the real receipt.
 *
 * Scope: web / Web Speech path only. The native Capacitor path is separate and
 * was not changed by the fix.
 */

import {
  appendFinal,
  shouldPreserveTranscriptOnStart,
  transcriptTurnReducer,
  runTurnEvents,
  initialTurnState,
  type TurnEvent,
  type TurnState,
} from '@/lib/voice/transcriptAccumulator';

describe('transcript accumulation leaves', () => {
  describe('appendFinal', () => {
    it('sets the buffer when empty (first final of a turn)', () => {
      expect(appendFinal('', "I've been feeling")).toBe("I've been feeling");
    });

    it('appends later finals with a single space (across restarts)', () => {
      expect(appendFinal("I've been feeling", 'anxious about my job')).toBe(
        "I've been feeling anxious about my job",
      );
    });

    it('trims the incoming final so joins never double-space', () => {
      // onresult builds finalTranscript as `transcript + ' '`, so trailing
      // whitespace is the common case — appendFinal must absorb it.
      expect(appendFinal('one', '  two  ')).toBe('one two');
      expect(appendFinal('', '  lead  ')).toBe('lead');
    });
  });

  describe('shouldPreserveTranscriptOnStart', () => {
    it('preserves only on a pending continuation', () => {
      expect(shouldPreserveTranscriptOnStart(true)).toBe(true);
    });

    it('wipes on a genuinely new turn', () => {
      expect(shouldPreserveTranscriptOnStart(false)).toBe(false);
    });
  });
});

describe('continuous-mode turn lifecycle (transcriptTurnReducer)', () => {
  /**
   * THE CORE REGRESSION. Exact iOS Safari sequence:
   *   start → final("I've been feeling") → onend auto-restart → continuation start
   *   → final("anxious about my job") → silence submit.
   * The two halves must survive the mid-utterance restart and combine into one
   * transcript. Before the fix, the continuation `start` wiped "I've been feeling"
   * and the member was "only heard half" — this assertion would read just
   * "anxious about my job".
   */
  it('accumulates BOTH halves across a continuation restart within one turn', () => {
    const events: TurnEvent[] = [
      { type: 'start' }, // fresh turn
      { type: 'final', text: "I've been feeling" }, // first phrase
      { type: 'restart' }, // iOS fires onend mid-utterance → auto-restart arms continuation
      { type: 'start' }, // restart's onstart — MUST preserve the buffer
      { type: 'final', text: 'anxious about my job' }, // second phrase
    ];

    // State at the silence-submit boundary is what gets sent to the parent
    // (component reads accumulatedTranscript.current.trim() then clears).
    const atSubmit = runTurnEvents(events);
    expect(atSubmit.accumulated.trim()).toBe("I've been feeling anxious about my job");

    // The submit itself resets the buffer + the continuation flag.
    const afterSubmit = transcriptTurnReducer(atSubmit, { type: 'submit' });
    expect(afterSubmit.accumulated).toBe('');
    expect(afterSubmit.continuationPending).toBe(false);
  });

  it('survives MANY onend restarts in one turn (iOS fires onend per phrase)', () => {
    const atSubmit = runTurnEvents([
      { type: 'start' },
      { type: 'final', text: 'one' },
      { type: 'restart' },
      { type: 'start' },
      { type: 'final', text: 'two' },
      { type: 'restart' },
      { type: 'start' },
      { type: 'final', text: 'three' },
      { type: 'restart' },
      { type: 'start' },
      { type: 'final', text: 'four' },
    ]);
    expect(atSubmit.accumulated.trim()).toBe('one two three four');
  });

  it('a NON-continuation start wipes any stale buffer (genuinely new turn)', () => {
    // Leftover buffer with no pending continuation — e.g. a fresh mic tap.
    const stale: TurnState = { accumulated: 'leftover from before', continuationPending: false };
    const afterStart = transcriptTurnReducer(stale, { type: 'start' });
    expect(afterStart.accumulated).toBe('');
  });

  it('a submitted turn resets the flag so the NEXT start opens fresh', () => {
    // Turn one: a continuation accumulates, then submits.
    const submitted = runTurnEvents([
      { type: 'start' },
      { type: 'final', text: 'first turn' },
      { type: 'restart' },
      { type: 'start' },
      { type: 'final', text: 'continued' },
      { type: 'submit' },
    ]);
    expect(submitted.continuationPending).toBe(false);
    expect(submitted.accumulated).toBe('');

    // Turn two must NOT inherit a preserve: its opening start wipes.
    const nextTurn = runTurnEvents(
      [{ type: 'start' }, { type: 'final', text: 'second turn' }],
      submitted,
    );
    expect(nextTurn.accumulated.trim()).toBe('second turn');
  });

  it('a manual stop discards the in-flight buffer and clears the flag', () => {
    const stopped = runTurnEvents([
      { type: 'start' },
      { type: 'final', text: 'half a thought' },
      { type: 'restart' }, // continuation armed...
      { type: 'stop' }, // ...but user exits voice mode before the restart lands
    ]);
    expect(stopped.accumulated).toBe('');
    expect(stopped.continuationPending).toBe(false);

    // And a continuation can't "leak" across the stop: the next start wipes.
    const afterStop = transcriptTurnReducer(stopped, { type: 'start' });
    expect(afterStop.accumulated).toBe('');
  });

  it('does not mutate initialTurnState (reducer is pure)', () => {
    transcriptTurnReducer(initialTurnState, { type: 'final', text: 'x' });
    transcriptTurnReducer(initialTurnState, { type: 'restart' });
    expect(initialTurnState).toEqual({ accumulated: '', continuationPending: false });
  });
});
