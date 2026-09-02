/**
 * The rule under test: only evidence of MEMBER silence may end the member's
 * turn. An 800–2500ms iOS recognition-task restart is not the member pausing.
 *
 * The negative controls carry as much weight as the positives. A suspension
 * that never lifts would be a mic that can never finish a turn, and a deferral
 * that never bounds would hold a member's words hostage to a dead recognizer.
 */

import {
  mayResumeSilenceClock,
  mayArmSilenceClock,
  shouldDeferTurnClose,
  MAX_TURN_CLOSE_DEFERRALS,
  AUDIBLE_SPEECH_WINDOW_MS,
} from '../silenceClockAuthority';

describe('silenceClockAuthority — arming', () => {
  it('refuses to arm a turn-end clock while capture is suspended', () => {
    expect(mayArmSilenceClock({ suspended: true })).toBe(false);
  });

  it('arms normally when capture is live', () => {
    expect(mayArmSilenceClock({ suspended: false })).toBe(true);
  });
});

describe('silenceClockAuthority — resuming', () => {
  it('resumes when recognition is confirmed started and an event arrived', () => {
    expect(mayResumeSilenceClock({ suspended: true, nativeStatus: 'started' })).toBe(true);
  });

  it('does NOT resume on a straggling event while the recognizer is stopped', () => {
    // The frame that arrives just after a task dies must not lift the
    // suspension inside the very gap it exists to cover.
    expect(mayResumeSilenceClock({ suspended: true, nativeStatus: 'stopped' })).toBe(false);
  });

  it('is a no-op when nothing is suspended', () => {
    expect(mayResumeSilenceClock({ suspended: false, nativeStatus: 'started' })).toBe(false);
  });
});

const T = 1_000_000;
const close = (over: Partial<Parameters<typeof shouldDeferTurnClose>[0]> = {}) =>
  shouldDeferTurnClose({
    now: T,
    nativeStatus: 'started',
    lastHighAudioAt: T - 500,
    deferrals: 0,
    ...over,
  });

describe('silenceClockAuthority — turn-close deferral', () => {
  it('defers while capture is live and the member is audibly speaking', () => {
    // Recognition has not produced the new task's first partial yet. Closing
    // here would end a sentence mid-breath on a transcription lag.
    expect(close()).toBe(true);
  });

  it('closes when the audio has gone quiet — that IS member silence', () => {
    expect(close({ lastHighAudioAt: T - AUDIBLE_SPEECH_WINDOW_MS })).toBe(false);
  });

  it('closes when capture never came back', () => {
    expect(close({ nativeStatus: 'stopped' })).toBe(false);
  });

  it('closes when no audio was ever heard', () => {
    expect(close({ lastHighAudioAt: 0 })).toBe(false);
  });

  it('is bounded — stops deferring at the cap', () => {
    // Live audio with a recognizer producing nothing must not hold the
    // member's words indefinitely.
    expect(close({ deferrals: MAX_TURN_CLOSE_DEFERRALS - 1 })).toBe(true);
    expect(close({ deferrals: MAX_TURN_CLOSE_DEFERRALS })).toBe(false);
  });
});

describe('silenceClockAuthority — the reported failure, as a sequence', () => {
  it('an 800ms restart mid-sentence neither arms nor closes a turn', () => {
    const stopAt = T;
    // Recognizer dies mid-sentence: clocks suspend.
    let suspended = true;
    expect(mayArmSilenceClock({ suspended })).toBe(false);

    // 800ms later a frame arrives but the state event has not landed yet.
    expect(
      mayResumeSilenceClock({ suspended, nativeStatus: 'stopped' })
    ).toBe(false);

    // The close would fire here on the old code path; the member is audible.
    expect(
      shouldDeferTurnClose({
        now: stopAt + 2_500,
        nativeStatus: 'started',
        lastHighAudioAt: stopAt + 2_000,
        deferrals: 0,
      })
    ).toBe(true);

    // Recognition confirms started; timing resumes and the member's own pause
    // is once again the thing that ends the turn.
    if (mayResumeSilenceClock({ suspended, nativeStatus: 'started' })) suspended = false;
    expect(suspended).toBe(false);
    expect(mayArmSilenceClock({ suspended })).toBe(true);
  });
});
