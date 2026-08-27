import {
  readTailSnapshot,
  shouldEmitThrottled,
  HIGH_FREQUENCY_TELEMETRY_MIN_INTERVAL_MS,
} from '../utteranceTail';

const T0 = 1_000_000;

function read(over: Partial<Parameters<typeof readTailSnapshot>[0]> = {}) {
  return readTailSnapshot({
    now: T0,
    lastInterimAt: 0,
    lastFinalAt: 0,
    lastInterimChars: 0,
    finalChars: 0,
    ...over,
  });
}

describe('readTailSnapshot — ordering C/D on the continuous path', () => {
  it('flags the tail at risk when an interim was never finalized', () => {
    // Ordering D: the 12s silence timer fires, last result was an interim.
    const s = read({
      now: T0 + 12_000,
      lastInterimAt: T0,
      lastFinalAt: T0 - 4_000,
      lastInterimChars: 37,
      finalChars: 210,
    });
    expect(s.interimOutstanding).toBe(true);
    expect(s.tailAtRisk).toBe(true);
    expect(s.msSinceLastInterim).toBe(12_000);
    expect(s.msSinceLastFinal).toBe(16_000);
  });

  it('does NOT flag a clean boundary — final landed after the last interim', () => {
    const s = read({
      now: T0 + 12_000,
      lastInterimAt: T0 - 500,
      lastFinalAt: T0,
      lastInterimChars: 0,
      finalChars: 210,
    });
    expect(s.interimOutstanding).toBe(false);
    expect(s.tailAtRisk).toBe(false);
  });

  it('treats an interim-only session as the worst case, not an exempt one', () => {
    // Ordering C in its purest form: nothing was ever finalized.
    const s = read({
      now: T0 + 12_000,
      lastInterimAt: T0,
      lastFinalAt: 0,
      lastInterimChars: 88,
      finalChars: 0,
    });
    expect(s.interimOutstanding).toBe(true);
    expect(s.tailAtRisk).toBe(true);
    expect(s.msSinceLastFinal).toBe(-1);
  });

  it('does not flag risk when material is outstanding but empty', () => {
    const s = read({
      now: T0 + 12_000,
      lastInterimAt: T0,
      lastFinalAt: T0 - 1_000,
      lastInterimChars: 0,
      finalChars: 210,
    });
    expect(s.interimOutstanding).toBe(true);
    expect(s.tailAtRisk).toBe(false);
  });

  it('reports -1, not a huge elapsed value, for boundaries never reached', () => {
    const s = read({ now: T0 });
    expect(s.msSinceLastInterim).toBe(-1);
    expect(s.msSinceLastFinal).toBe(-1);
    expect(s.interimOutstanding).toBe(false);
    expect(s.tailAtRisk).toBe(false);
  });

  it('clamps a backwards clock to 0 rather than emitting a negative age', () => {
    const s = read({ now: T0, lastInterimAt: T0 + 5_000, lastFinalAt: T0 + 1_000 });
    expect(s.msSinceLastInterim).toBe(0);
    expect(s.msSinceLastFinal).toBe(0);
  });

  it('normalizes negative and undefined character counts to 0', () => {
    const s = read({
      lastInterimAt: T0,
      lastInterimChars: -5,
      finalChars: undefined as unknown as number,
    });
    expect(s.interimCharCount).toBe(0);
    expect(s.finalCharCount).toBe(0);
    expect(s.tailAtRisk).toBe(false);
  });

  it('uses V5 field names so one parser reads both capture paths', () => {
    const s = read({ lastInterimAt: T0, lastInterimChars: 12, finalChars: 40 });
    expect(s).toHaveProperty('interimCharCount', 12);
    expect(s).toHaveProperty('finalCharCount', 40);
    expect(s).not.toHaveProperty('pendingInterimChars');
    expect(s).not.toHaveProperty('accumulatedChars');
  });

  it('is pure — repeated reads of the same input are identical', () => {
    const input = {
      now: T0 + 3_000,
      lastInterimAt: T0,
      lastFinalAt: T0 - 2_000,
      lastInterimChars: 12,
      finalChars: 40,
    };
    expect(readTailSnapshot(input)).toEqual(readTailSnapshot(input));
  });

  it('carries no transcript content — only counts and elapsed times', () => {
    const s = read({ lastInterimAt: T0, lastInterimChars: 12, finalChars: 40 });
    for (const value of Object.values(s)) {
      expect(typeof value === 'number' || typeof value === 'boolean').toBe(true);
    }
  });
});

describe('shouldEmitThrottled — throttle guards the log, not the data', () => {
  it('always emits the first line of a session', () => {
    expect(shouldEmitThrottled(T0, 0)).toBe(true);
  });

  it('suppresses a second emission inside the window', () => {
    expect(shouldEmitThrottled(T0 + 500, T0)).toBe(false);
  });

  it('emits again once the window has elapsed', () => {
    expect(
      shouldEmitThrottled(T0 + HIGH_FREQUENCY_TELEMETRY_MIN_INTERVAL_MS, T0),
    ).toBe(true);
  });

  it('honours an explicit interval override', () => {
    expect(shouldEmitThrottled(T0 + 100, T0, 50)).toBe(true);
    expect(shouldEmitThrottled(T0 + 10, T0, 50)).toBe(false);
  });
});

describe('measureTailOverlap — lost vs re-delivered, not merely lengths', () => {
  const { measureTailOverlap } = require('../utteranceTail');

  it('detects a fully re-delivered tail', () => {
    const r = measureTailOverlap('is this part', 'is this part that I meant');
    expect(r.overlapChars).toBe(12);
    expect(r.overlapRatio).toBe(1);
  });

  it('reports ~0 when the tail is genuinely gone', () => {
    const r = measureTailOverlap('is this part', 'and then we moved on');
    expect(r.overlapChars).toBe(0);
    expect(r.overlapRatio).toBe(0);
  });

  it('is not fooled by similar LENGTH — the defect this exists to prevent', () => {
    // Same length as the tail, entirely different words. A length-only
    // comparison would call this re-delivered and suppress a needed repair.
    const tail = 'is this part';
    const next = 'we left then';
    expect(next.length).toBe(tail.length);
    expect(measureTailOverlap(tail, next).overlapChars).toBe(0);
  });

  it('detects a partially re-delivered tail', () => {
    const r = measureTailOverlap('you to understand this', 'this is what I meant');
    expect(r.overlapChars).toBe(4);
    expect(r.overlapRatio).toBeCloseTo(4 / 22, 2);
  });

  it('normalizes case and whitespace across the restart seam', () => {
    expect(measureTailOverlap('IS   THIS  part', 'is this part again').overlapChars).toBe(12);
  });

  it('returns ratio -1 when there was no tail to compare', () => {
    expect(measureTailOverlap('', 'anything').overlapRatio).toBe(-1);
    expect(measureTailOverlap('   ', 'anything').overlapRatio).toBe(-1);
  });

  it('reports 0, not -1, when a tail existed but the next result was empty', () => {
    // Distinct cases: "nothing to compare" vs "compared and found nothing".
    expect(measureTailOverlap('is this part', '')).toEqual({ overlapChars: 0, overlapRatio: 0 });
  });

  it('returns counts only — never the words', () => {
    const r = measureTailOverlap('is this part', 'is this part again');
    expect(Object.keys(r).sort()).toEqual(['overlapChars', 'overlapRatio']);
    for (const v of Object.values(r)) expect(typeof v).toBe('number');
  });
});
