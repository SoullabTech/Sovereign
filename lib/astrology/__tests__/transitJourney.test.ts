import {
  chooseTransitActivation,
  fieldContextLines,
  fieldTimelineRange,
  natalWebLinks,
  possibleHumanExpressions,
  transitTradition,
} from '@/lib/astrology/transitJourney';
import type { TransitActivation } from '@/lib/astrology/transitField';

function activation(overrides: Partial<TransitActivation> = {}): TransitActivation {
  return {
    id: 'saturn-square-sun',
    transiting: {
      body: 'Saturn', longitude: 10, sign: 'Aries', degree: 10,
      retrograde: false, stationary: false, speedPerDay: 0.05,
    },
    natal: { point: 'Sun', longitude: 100, sign: 'Cancer', degree: 10 },
    aspect: { name: 'square', angle: 90, symbol: '□' },
    deviation: 0.5,
    allowedOrb: 3,
    motion: 'applying',
    scale: 'major',
    reasons: ['test'],
    timing: {
      windowStart: '2026-09-01T00:00:00.000Z',
      windowEnd: '2026-11-01T00:00:00.000Z',
      openStart: false,
      openEnd: false,
      passes: [{ at: '2026-10-15T00:00:00.000Z', deviation: 0, perfects: true }],
      nextExact: '2026-10-15T00:00:00.000Z',
      lastExact: null,
      precision: 'hour',
    },
    authority: 'calculated',
    ...overrides,
  };
}

describe('transit journey semantics', () => {
  it('keeps symbolic tradition explicitly separate from calculated fact', () => {
    const text = transitTradition(activation());
    expect(text).toContain('Western transit tradition');
    expect(text).toContain('moving Saturn');
    expect(text).toContain('natal Sun');
  });

  it('offers possibilities rather than claims of lived experience', () => {
    const lines = possibleHumanExpressions(activation());
    expect(lines).toHaveLength(3);
    expect(lines.join(' ')).toContain('might');
    expect(lines.join(' ')).not.toMatch(/you will/i);
  });

  it('uses the natal aspect library only for the contacted point web', () => {
    const links = natalWebLinks('Sun', [
      { planet1: 'Sun', planet2: 'Saturn', type: 'square', orb: 0.8 },
      { planet1: 'Moon', planet2: 'Venus', type: 'trine', orb: 0.2 },
    ]);
    expect(links).toHaveLength(1);
    expect(links[0].otherPoint).toBe('Saturn');
    expect(links[0].coreQuestion).toBeTruthy();
  });

  it('names converging current-field contacts without inventing importance', () => {
    const first = activation();
    const second = activation({
      id: 'saturn-trine-moon',
      natal: { point: 'Moon', longitude: 130, sign: 'Leo', degree: 10 },
      aspect: { name: 'trine', angle: 120, symbol: '△' },
    });
    expect(fieldContextLines(first, [first, second])[0]).toContain('one strand');
  });

  it('returns the exact activation the wheel is displaying', () => {
    const looser = activation({ id: 'saturn-square-sun', deviation: 0.8 });
    const tighter = activation({
      id: 'saturn-trine-moon',
      natal: { point: 'Moon', longitude: 130, sign: 'Leo', degree: 10 },
      aspect: { name: 'trine', angle: 120, symbol: '△' },
      deviation: 0.2,
    });
    const chosen = chooseTransitActivation([tighter, looser], 'Saturn', [
      { natalPlanet: 'Sun', aspectType: 'square', orb: 0.8 },
    ]);
    expect(chosen?.id).toBe('saturn-square-sun');
  });

  it('falls back to the tightest body contact when the wheel is unfocused', () => {
    const looser = activation({ id: 'saturn-square-sun', deviation: 0.8 });
    const tighter = activation({
      id: 'saturn-trine-moon',
      natal: { point: 'Moon', longitude: 130, sign: 'Leo', degree: 10 },
      aspect: { name: 'trine', angle: 120, symbol: '△' },
      deviation: 0.2,
    });
    expect(chooseTransitActivation([looser, tighter], 'Saturn', [])?.id).toBe('saturn-trine-moon');
  });

  it('builds a bounded now-centered timeline range', () => {
    const now = Date.parse('2026-10-01T00:00:00.000Z');
    const range = fieldTimelineRange([activation()], now);
    expect(range.start).toBeLessThan(now);
    expect(range.end).toBeGreaterThan(now);
    expect(range.end - range.start).toBeGreaterThanOrEqual(30 * 86_400_000);
  });
});
