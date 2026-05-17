/**
 * Phase A.2 continuity-state reset — promptContinuityState tests.
 *
 * Verifies the one-shot per-session flag that suppresses Whisper's
 * previousTail prompt for exactly one chunk following a continuity break
 * (silence-hallucination OR whisper-no-text).
 *
 * Test cases:
 *   - Kelly, 2026-05-16 (narrow-scope patch): silence-hallucination triggers reset
 *   - Kelly, 2026-05-17 (Phase A.2 QA widening): whisper-no-text also triggers reset
 *     (telemetry from sentence 5→6 transition showed prompt bleed when only
 *     no-text chunks intervened between two real utterances)
 */
import {
  markContinuityBreak,
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

    markContinuityBreak('session-1');
    expect(_peekSkipPromptFlag('session-1')).toBe(true);

    expect(consumeSkipPromptFlag('session-1')).toBe(true);
    expect(_peekSkipPromptFlag('session-1')).toBe(false);
    expect(consumeSkipPromptFlag('session-1')).toBe(false);
  });

  it('flags are per-session — marking session-A does not affect session-B', () => {
    markContinuityBreak('session-A');
    expect(_peekSkipPromptFlag('session-B')).toBe(false);
    expect(consumeSkipPromptFlag('session-B')).toBe(false);
    expect(consumeSkipPromptFlag('session-A')).toBe(true);
  });

  it('re-marking after consume re-arms the one-shot (continuity break twice in a row both reset)', () => {
    markContinuityBreak('session-1');
    expect(consumeSkipPromptFlag('session-1')).toBe(true);

    // Second continuity break event — should re-arm the flag for the
    // next real chunk.
    markContinuityBreak('session-1');
    expect(_peekSkipPromptFlag('session-1')).toBe(true);
    expect(consumeSkipPromptFlag('session-1')).toBe(true);
    expect(consumeSkipPromptFlag('session-1')).toBe(false);
  });

  describe('Phase A.2 QA widening (2026-05-17): both event kinds trigger reset', () => {
    // Telemetry from session f35719bf showed sentence 6 inherited
    // "...sentence number five..." as previousTail through an intervening
    // whisper-no-text chunk (ch=13). Both silence-hallucination AND
    // whisper-no-text are absence-of-new-participation signals; both should
    // arm the prompt-reset flag.

    it('semantic uniformity: function name reads as event-agnostic continuity break', () => {
      // The renamed export reads correctly regardless of which event kind
      // caused the break. Callers can use it for either branch without
      // semantic mismatch.
      expect(typeof markContinuityBreak).toBe('function');
    });

    it('whisper-no-text trigger arms the flag the same way silence-hallucination does', () => {
      // Caller calls markContinuityBreak() from the whisper-no-text branch
      // (test verifies the flag-setting contract is identical to silence-
      // hallucination — the stream handler integration test that proves the
      // call site itself is exercised lives in the route handler logs/integration).
      markContinuityBreak('session-no-text');
      expect(_peekSkipPromptFlag('session-no-text')).toBe(true);
      expect(consumeSkipPromptFlag('session-no-text')).toBe(true);
      expect(_peekSkipPromptFlag('session-no-text')).toBe(false);
    });

    it('mixed event sequence: silence-hallucination then whisper-no-text both contribute', () => {
      markContinuityBreak('session-mixed');     // simulate silence-hallucination
      expect(consumeSkipPromptFlag('session-mixed')).toBe(true);

      // Next chunk after the silence: imagine it's a whisper-no-text chunk
      markContinuityBreak('session-mixed');     // simulate whisper-no-text
      expect(_peekSkipPromptFlag('session-mixed')).toBe(true);
      expect(consumeSkipPromptFlag('session-mixed')).toBe(true);
    });
  });
});
