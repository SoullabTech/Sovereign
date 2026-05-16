/**
 * Phase A.2 continuity-state reset — promptContinuityState tests.
 *
 * Verifies the one-shot per-session flag that suppresses Whisper's
 * previousTail prompt for exactly one chunk following a silence-
 * hallucination rejection.
 *
 * Test cases (Kelly, 2026-05-16, narrow-scope patch):
 *   - mark sets the flag; consume returns true once then false
 *   - flags are per-session and do not bleed
 *   - re-marking after consume re-arms the one-shot
 */
import {
  markSilenceHallucination,
  consumeSkipPromptFlag,
  _peekSkipPromptFlag,
  _resetAllSkipPromptFlags,
} from '../promptContinuityState';

describe('promptContinuityState', () => {
  beforeEach(() => {
    _resetAllSkipPromptFlags();
  });

  it('mark sets the flag; consume returns true exactly once, then false', () => {
    expect(_peekSkipPromptFlag('session-1')).toBe(false);
    expect(consumeSkipPromptFlag('session-1')).toBe(false);

    markSilenceHallucination('session-1');
    expect(_peekSkipPromptFlag('session-1')).toBe(true);

    expect(consumeSkipPromptFlag('session-1')).toBe(true);
    expect(_peekSkipPromptFlag('session-1')).toBe(false);
    expect(consumeSkipPromptFlag('session-1')).toBe(false);
  });

  it('flags are per-session — marking session-A does not affect session-B', () => {
    markSilenceHallucination('session-A');
    expect(_peekSkipPromptFlag('session-B')).toBe(false);
    expect(consumeSkipPromptFlag('session-B')).toBe(false);
    expect(consumeSkipPromptFlag('session-A')).toBe(true);
  });

  it('re-marking after consume re-arms the one-shot (silence twice in a row both reset)', () => {
    markSilenceHallucination('session-1');
    expect(consumeSkipPromptFlag('session-1')).toBe(true);

    // Second silence-hallucination event — should re-arm the flag for the
    // next real chunk.
    markSilenceHallucination('session-1');
    expect(_peekSkipPromptFlag('session-1')).toBe(true);
    expect(consumeSkipPromptFlag('session-1')).toBe(true);
    expect(consumeSkipPromptFlag('session-1')).toBe(false);
  });
});
