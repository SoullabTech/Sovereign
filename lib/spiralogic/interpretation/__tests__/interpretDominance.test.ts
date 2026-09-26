/**
 * Test suite for the single versioned dominance rule (dominance_v1).
 *
 * Designed against the null-rate table (registration grammar spec,
 * pre-ratification data): `none` is a valid, expected verdict — first-class
 * ambiguity is the point, never an error path.
 */

import type { ChartPositions, Q1Body } from '../../registration';
import { Q1_BODIES } from '../../registration';
import {
  chartPositionsFromSignDegrees,
  ChartAdapterError,
  dominanceLabel,
  dominanceSentence,
  interpretDominance,
  INTERPRETATION_VERSION,
} from '../index';
import type { SignDegreeChart } from '../index';

// Mid-sign longitudes per element (Aries / Cancer / Taurus / Gemini).
const LONG = { fire: 5, water: 95, earth: 35, air: 65 } as const;

type ElementName = keyof typeof LONG;

/**
 * Build ChartPositions by assigning the ten Q1 bodies to elements in Q1
 * order. `counts` must sum to 10 (or 9 when `moonBranches` is given —
 * the Moon is then excluded from the assignment).
 */
function positionsFor(
  counts: Partial<Record<ElementName, number>>,
  moonBranches?: [number, number],
): ChartPositions {
  const assignable: Q1Body[] = moonBranches
    ? Q1_BODIES.filter((b) => b !== 'Moon')
    : [...Q1_BODIES];
  const bodies = {} as Record<Q1Body, number>;
  let i = 0;
  for (const element of ['fire', 'water', 'earth', 'air'] as ElementName[]) {
    for (let n = 0; n < (counts[element] ?? 0); n += 1) {
      bodies[assignable[i]] = LONG[element] + i * 0.001; // distinct longitudes, same sign
      i += 1;
    }
  }
  if (i !== assignable.length) {
    throw new Error(`test helper: counts sum to ${i}, expected ${assignable.length}`);
  }
  return moonBranches
    ? { bodies, mode: 'noon', moonBranches }
    : { bodies, mode: 'timed' };
}

describe('interpretDominance — verdict correctness (unbranched)', () => {
  it('crowns a clear dominant (lead >= 2) with a unique deficient', () => {
    const v = interpretDominance(positionsFor({ fire: 5, water: 2, earth: 2, air: 1 }));
    expect(v.verdict).toBe('fire');
    expect(v.grade).toBe('clear');
    expect(v.deficient).toBe('air');
    expect(v.moonSensitive).toBe(false);
    expect(v.tied).toBeUndefined();
    expect(v.reason).toBeUndefined();
  });

  it('grades a one-body lead as leaning', () => {
    const v = interpretDominance(positionsFor({ fire: 4, water: 3, earth: 2, air: 1 }));
    expect(v.verdict).toBe('fire');
    expect(v.grade).toBe('leaning');
    expect(v.deficient).toBe('air');
  });

  it('grades exactly CLEAR_LEAD (2.0) as clear', () => {
    const v = interpretDominance(positionsFor({ fire: 4, water: 2, earth: 2, air: 2 }));
    expect(v.verdict).toBe('fire');
    expect(v.grade).toBe('clear');
    // Three-way tie at the bottom: no deficient is manufactured.
    expect(v.deficient).toBeNull();
  });

  it('reports element weights and the full 12-key distribution', () => {
    const v = interpretDominance(positionsFor({ fire: 4, water: 3, earth: 2, air: 1 }));
    expect(v.elementWeights).toEqual({ fire: 4, water: 3, earth: 2, air: 1 });
    expect(Object.keys(v.distribution)).toHaveLength(12);
    const total = Object.values(v.distribution).reduce((a, b) => a + b, 0);
    expect(total).toBe(10);
  });

  it('total dominance still yields no deficient when the bottom is tied', () => {
    const v = interpretDominance(positionsFor({ fire: 10 }));
    expect(v.verdict).toBe('fire');
    expect(v.grade).toBe('clear');
    expect(v.deficient).toBeNull(); // water/earth/air tie at 0
  });
});

describe('interpretDominance — none is a valid verdict, not an error', () => {
  it('returns none (with tied) on a tie for the top element', () => {
    const v = interpretDominance(positionsFor({ fire: 3, water: 3, earth: 2, air: 2 }));
    expect(v.verdict).toBe('none');
    expect(v.grade).toBe('none');
    expect(v.tied).toEqual(['fire', 'water']);
    expect(v.deficient).toBeNull(); // earth/air also tie at the bottom
    expect(v.moonSensitive).toBe(false);
  });

  it('lists tied elements in canonical order (fire, water, earth, air)', () => {
    const v = interpretDominance(positionsFor({ fire: 2, water: 3, earth: 2, air: 3 }));
    expect(v.verdict).toBe('none');
    expect(v.tied).toEqual(['water', 'air']);
  });

  it('a none verdict still carries distribution, weights, and provenance', () => {
    const v = interpretDominance(positionsFor({ fire: 3, water: 3, earth: 2, air: 2 }));
    expect(v.elementWeights).toEqual({ fire: 3, water: 3, earth: 2, air: 2 });
    expect(v.interpretation_version).toBe('dominance_v1');
    expect(v.grammar_version).toBe(1);
  });

  it('none can coexist with a unique deficient (the claims are independent)', () => {
    const v = interpretDominance(positionsFor({ fire: 3, water: 3, earth: 3, air: 1 }));
    expect(v.verdict).toBe('none');
    expect(v.tied).toEqual(['fire', 'water', 'earth']);
    expect(v.deficient).toBe('air');
  });
});

describe('interpretDominance — Moon branches (Q4 propagation)', () => {
  it('degrades to none with moonSensitive when the branches disagree', () => {
    // Without the Moon: fire 4, water 4, air 1. Branch A puts the Moon in
    // fire (fire wins), branch B in water (water wins) — a one-sign Moon
    // shift flips the crown, the ~39% class.
    const v = interpretDominance(
      positionsFor({ fire: 4, water: 4, air: 1 }, [LONG.fire, LONG.water]),
    );
    expect(v.verdict).toBe('none');
    expect(v.grade).toBe('none');
    expect(v.moonSensitive).toBe(true);
    expect(v.reason).toBe('moon_ambiguous');
    // Aggregated ground truth still travels: each branch contributed 0.5.
    expect(v.elementWeights).toEqual({ fire: 4.5, water: 4.5, earth: 0, air: 1 });
  });

  it('crowns when both branches agree, at the more conservative grade', () => {
    // Without the Moon: fire 4, water 3, earth 1, air 1.
    // Branch A (fire): lead 2 → clear. Branch B (earth): lead 1 → leaning.
    const v = interpretDominance(
      positionsFor({ fire: 4, water: 3, earth: 1, air: 1 }, [LONG.fire, LONG.earth]),
    );
    expect(v.verdict).toBe('fire');
    expect(v.grade).toBe('leaning'); // weaker branch governs
    expect(v.moonSensitive).toBe(false);
    expect(v.reason).toBeUndefined();
  });

  it('keeps agreement when both branches crown the same element clearly', () => {
    const v = interpretDominance(
      positionsFor({ fire: 6, water: 1, earth: 1, air: 1 }, [LONG.earth, LONG.air]),
    );
    expect(v.verdict).toBe('fire');
    expect(v.grade).toBe('clear');
    expect(v.moonSensitive).toBe(false);
  });

  it('nulls the deficient when the branches disagree on it', () => {
    // Without the Moon: fire 4, water 3, earth 1, air 1.
    // Branch A (earth): air is the unique quietest. Branch B (air): earth is.
    const v = interpretDominance(
      positionsFor({ fire: 4, water: 3, earth: 1, air: 1 }, [LONG.earth, LONG.air]),
    );
    expect(v.verdict).toBe('fire');
    expect(v.deficient).toBeNull();
  });

  it('returns none without moon_ambiguous when both branches decline over different ties', () => {
    // Without the Moon: fire 3, water 3, earth 2, air 1.
    // Branch A (earth): fire/water/earth tie. Branch B (air): fire/water tie.
    const v = interpretDominance(
      positionsFor({ fire: 3, water: 3, earth: 2, air: 1 }, [LONG.earth, LONG.air]),
    );
    expect(v.verdict).toBe('none');
    expect(v.moonSensitive).toBe(false);
    expect(v.reason).toBeUndefined();
    expect(v.tied).toBeUndefined(); // tie sets are branch-relative and differ
  });
});

describe('interpretDominance — version stability (provenance axes, INV-8)', () => {
  it('emits the frozen version strings on every verdict shape', () => {
    expect(INTERPRETATION_VERSION).toBe('dominance_v1');
    const crowned = interpretDominance(positionsFor({ fire: 5, water: 2, earth: 2, air: 1 }));
    const none = interpretDominance(positionsFor({ fire: 3, water: 3, earth: 2, air: 2 }));
    for (const v of [crowned, none]) {
      expect(v.interpretation_version).toBe('dominance_v1');
      expect(v.grammar_version).toBe(1);
    }
  });
});

describe('chartPositionsFromSignDegrees — adapter', () => {
  const chart: SignDegreeChart = {
    sun: { sign: 'Aries', degree: 5 },
    moon: { sign: 'Aries', degree: 10 },
    mercury: { sign: 'Leo', degree: 12 },
    venus: { sign: 'Sagittarius', degree: 20 },
    mars: { sign: 'Aries', degree: 1 },
    jupiter: { sign: 'Cancer', degree: 3 },
    saturn: { sign: 'Scorpio', degree: 8 },
    uranus: { sign: 'Taurus', degree: 15 },
    neptune: { sign: 'Virgo', degree: 22 },
    pluto: { sign: 'Gemini', degree: 9 },
  };

  it('produces the verdict the equivalent raw longitudes produce', () => {
    const v = interpretDominance(chartPositionsFromSignDegrees(chart));
    // fire 5, water 2, earth 2, air 1
    expect(v.verdict).toBe('fire');
    expect(v.grade).toBe('clear');
    expect(v.deficient).toBe('air');
    expect(v.elementWeights).toEqual({ fire: 5, water: 2, earth: 2, air: 1 });
  });

  it('refuses an unknown sign rather than guessing', () => {
    const bad = { ...chart, sun: { sign: 'Ophiuchus', degree: 5 } };
    expect(() => chartPositionsFromSignDegrees(bad)).toThrow(ChartAdapterError);
  });

  it('clamps a legacy rounded 30.00° degree inside the stated sign', () => {
    const edge = { ...chart, sun: { sign: 'Aries', degree: 30 } };
    const positions = chartPositionsFromSignDegrees(edge);
    expect(positions.bodies.Sun).toBeLessThan(30); // still Aries → fire
  });
});

describe('phrasing helpers — PROPOSED default vocabulary', () => {
  const clear = interpretDominance(positionsFor({ fire: 5, water: 2, earth: 2, air: 1 }));
  const leaning = interpretDominance(positionsFor({ fire: 4, water: 3, earth: 2, air: 1 }));
  const none = interpretDominance(positionsFor({ fire: 3, water: 3, earth: 2, air: 2 }));

  it('labels the three grades distinctly', () => {
    expect(dominanceLabel(clear)).toBe('fire-dominant');
    expect(dominanceLabel(leaning)).toBe('leaning fire');
    expect(dominanceLabel(none)).toBe('balanced');
  });

  it('speaks none honestly instead of inventing a crown', () => {
    expect(dominanceSentence(none)).toContain('No single element leads');
    expect(dominanceSentence(clear)).toContain('Fire leads clearly');
    expect(dominanceSentence(leaning)).toContain('leans fire');
  });

  it('names the Moon uncertainty when that is why there is no verdict', () => {
    const ambiguous = interpretDominance(
      positionsFor({ fire: 4, water: 4, air: 1 }, [LONG.fire, LONG.water]),
    );
    expect(dominanceSentence(ambiguous)).toContain('Moon');
  });
});
