/**
 * VOICE-ABORT-01 — regression contract for the conversation-killing guard.
 *
 * The defining test is `the 2026-08-27 production incident`. Before this
 * policy existed, a single 302ms recognition end after MAIA stopped speaking
 * was classified as an infinite abort loop, the microphone was killed, and the
 * member went on talking to a system that had stopped listening. That single
 * end must now be survivable.
 */
import {
  classifyRecognitionEnd,
  RAPID_END_LOOP_THRESHOLD,
  RAPID_END_WINDOW_MS,
} from '../rapidEndPolicy';

describe('classifyRecognitionEnd — the 2026-08-27 production incident', () => {
  it('does NOT declare a loop on the first 302ms end', () => {
    const out = classifyRecognitionEnd({ epochAgeMs: 302, consecutiveRapidEnds: 0 });
    expect(out.decision).toBe('recover');
    expect(out.nextCount).toBe(1);
  });

  it('survives the 300ms restart race repeated twice', () => {
    let count = 0;
    for (let turn = 0; turn < 2; turn++) {
      const out = classifyRecognitionEnd({ epochAgeMs: 302, consecutiveRapidEnds: count });
      expect(out.decision).toBe('recover');
      count = out.nextCount;
    }
  });

  it('a normal turn between rapid ends prevents them accumulating', () => {
    let count = classifyRecognitionEnd({ epochAgeMs: 302, consecutiveRapidEnds: 0 }).nextCount;
    // The member speaks; the epoch lives a normal length.
    const healthy = classifyRecognitionEnd({ epochAgeMs: 8000, consecutiveRapidEnds: count });
    expect(healthy.decision).toBe('not_rapid');
    count = healthy.nextCount;
    expect(count).toBe(0);
    // A later unrelated rapid end must start the run over, not finish it.
    expect(classifyRecognitionEnd({ epochAgeMs: 120, consecutiveRapidEnds: count }).decision)
      .toBe('recover');
  });
});

describe('classifyRecognitionEnd — a real loop is still caught', () => {
  it('declares abort_loop on the threshold-th consecutive rapid end', () => {
    let count = 0;
    const decisions: string[] = [];
    for (let i = 0; i < RAPID_END_LOOP_THRESHOLD; i++) {
      const out = classifyRecognitionEnd({ epochAgeMs: 50, consecutiveRapidEnds: count });
      decisions.push(out.decision);
      count = out.nextCount;
    }
    expect(decisions.slice(0, -1).every((d) => d === 'recover')).toBe(true);
    expect(decisions[decisions.length - 1]).toBe('abort_loop');
  });

  it('threshold is greater than one — one abort is never a loop', () => {
    expect(RAPID_END_LOOP_THRESHOLD).toBeGreaterThan(1);
  });
});

describe('classifyRecognitionEnd — window boundary', () => {
  it('an epoch exactly at the window is not rapid', () => {
    expect(classifyRecognitionEnd({ epochAgeMs: RAPID_END_WINDOW_MS, consecutiveRapidEnds: 2 }).decision)
      .toBe('not_rapid');
  });

  it('one millisecond under the window is rapid', () => {
    expect(classifyRecognitionEnd({ epochAgeMs: RAPID_END_WINDOW_MS - 1, consecutiveRapidEnds: 0 }).decision)
      .toBe('recover');
  });

  it('a long healthy epoch always resets the run', () => {
    expect(classifyRecognitionEnd({ epochAgeMs: 30000, consecutiveRapidEnds: 99 }).nextCount).toBe(0);
  });
});
