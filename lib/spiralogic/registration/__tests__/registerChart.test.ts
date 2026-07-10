/**
 * Spiralogic Registration Grammar v1 — invariant test suite.
 *
 * Written FROM the spec (docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md),
 * not from the implementation. One describe-block per INV, plus the
 * table-equivalence anti-fork pin (Kelly's chip 1) and fixture charts.
 *
 * Triage discipline (conformance report, 0 adopt / 4 relocate / 4 reject):
 * this suite asserts the ABSENCE of all seven undocumented decisions —
 * no dominance/deficiency, no tie-break, no planet weighting, no
 * coherencePractices/currentPhase/activeFacets, no vector/circle/spiral
 * vocabulary, no house/intake coupling, no async, no null return.
 */

import * as fs from 'fs';
import * as path from 'path';

import { registerChart } from '../registerChart';
import { RegistrationInputError } from '../errors';
import {
  GRAMMAR_VERSION,
  SIGNS_IN_LONGITUDE_ORDER,
  SIGN_TO_REGISTRATION,
} from '../table';
import type { ChartPositions, PhaseKey, Q1Body } from '../types';
import { PHASE_KEYS, Q1_BODIES } from '../types';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

/** All ten Q1 bodies at explicit longitudes. */
function makeBodies(longitudes: Partial<Record<Q1Body, number>>): Record<Q1Body, number> {
  const bodies = {} as Record<Q1Body, number>;
  for (const body of Q1_BODIES) {
    const lon = longitudes[body];
    if (lon === undefined) {
      throw new Error(`fixture error: missing longitude for ${body}`);
    }
    bodies[body] = lon;
  }
  return bodies;
}

/** One body per successive sign: Sun 15° Aries, Moon 45° Taurus, … Pluto 285° Capricorn. */
const SPREAD_BODIES = makeBodies({
  Sun: 15, // Aries      → fire_1
  Moon: 45, // Taurus    → earth_2
  Mercury: 75, // Gemini → air_3
  Venus: 105, // Cancer  → water_1
  Mars: 135, // Leo      → fire_2
  Jupiter: 165, // Virgo → earth_3
  Saturn: 195, // Libra  → air_1
  Uranus: 225, // Scorpio → water_2
  Neptune: 255, // Sagittarius → fire_3
  Pluto: 285, // Capricorn → earth_1
});

const SPREAD_CHART: ChartPositions = { bodies: SPREAD_BODIES, mode: 'timed' };

/** Hand-computed expected distribution for SPREAD_CHART (raw weights, all 12 keys). */
const SPREAD_EXPECTED: Record<PhaseKey, number> = {
  fire_1: 1,
  fire_2: 1,
  fire_3: 1,
  water_1: 1,
  water_2: 1,
  water_3: 0, // Pisces — no body
  earth_1: 1,
  earth_2: 1,
  earth_3: 1,
  air_1: 1,
  air_2: 0, // Aquarius — no body
  air_3: 1,
};

/** All ten bodies stacked in Aries. */
const STACKED_CHART: ChartPositions = {
  bodies: makeBodies({
    Sun: 1, Moon: 2, Mercury: 3, Venus: 4, Mars: 5,
    Jupiter: 6, Saturn: 7, Uranus: 8, Neptune: 9, Pluto: 10,
  }),
  mode: 'timed',
};

/** Noon chart with a sign-ambiguous Moon (Pisces ↔ Aries branches). SH-10: moonBranches replaces bodies.Moon. */
function noonSplitChart(): ChartPositions {
  const bodies = { ...SPREAD_BODIES } as Partial<Record<Q1Body, number>>;
  delete bodies.Moon;
  return {
    bodies: bodies as Record<Q1Body, number>,
    mode: 'noon',
    moonBranches: [355, 5], // Pisces → water_3, Aries → fire_1
  };
}

/** Noon chart where both Moon branches resolve to the SAME sign (both Aries). */
function noonSameSignChart(): ChartPositions {
  const chart = noonSplitChart();
  return { ...chart, moonBranches: [10, 20] };
}

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/** Recursively collect every key in an object tree. */
function allKeys(value: unknown, acc: string[] = []): string[] {
  if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      acc.push(k);
      allKeys(v, acc);
    }
  }
  return acc;
}

/** 29°59′59.99″ within a sign, as a decimal-degree offset. */
const CUSP_HIGH = 29 + 59 / 60 + 59.99 / 3600; // 29.99999722…

// ---------------------------------------------------------------------------
// INV-1 — Determinism
// ---------------------------------------------------------------------------

describe('INV-1 determinism', () => {
  test('identical input → deep-equal output and identical fingerprint', () => {
    const a = registerChart(deepClone(SPREAD_CHART));
    const b = registerChart(deepClone(SPREAD_CHART));
    expect(b).toEqual(a);
    expect(b.input_fingerprint).toBe(a.input_fingerprint);
    expect(a.input_fingerprint).toMatch(/^[0-9a-f]{64}$/); // SHA-256 hex
  });

  test('grammar_version is present and === 1', () => {
    const profile = registerChart(SPREAD_CHART);
    expect(profile.grammar_version).toBe(1);
    expect(GRAMMAR_VERSION).toBe(1);
  });

  test('fingerprint is independent of bodies key insertion order (canonical sorted serialization, SH-12)', () => {
    const reversedEntries = Object.entries(SPREAD_BODIES).reverse();
    const reordered: ChartPositions = {
      bodies: Object.fromEntries(reversedEntries) as Record<Q1Body, number>,
      mode: 'timed',
    };
    expect(registerChart(reordered).input_fingerprint).toBe(
      registerChart(SPREAD_CHART).input_fingerprint,
    );
  });

  test('different input → different fingerprint', () => {
    const moved: ChartPositions = {
      bodies: { ...SPREAD_BODIES, Sun: 16 },
      mode: 'timed',
    };
    expect(registerChart(moved).input_fingerprint).not.toBe(
      registerChart(SPREAD_CHART).input_fingerprint,
    );
  });

  test('mode participates in the fingerprint', () => {
    const noon: ChartPositions = { bodies: SPREAD_BODIES, mode: 'noon' };
    expect(registerChart(noon).input_fingerprint).not.toBe(
      registerChart(SPREAD_CHART).input_fingerprint,
    );
  });

  test('pure sync interface: returns a profile, not a Promise, never null (triage #7 rejected)', () => {
    const result = registerChart(SPREAD_CHART);
    expect(result).not.toBeNull();
    expect(typeof (result as unknown as { then?: unknown }).then).toBe('undefined');
  });
});

// ---------------------------------------------------------------------------
// INV-2 — Totality
// ---------------------------------------------------------------------------

describe('INV-2 totality', () => {
  test('all 10 Q1 bodies register: weights sum to 10 (timed)', () => {
    const { distribution } = registerChart(SPREAD_CHART);
    const sum = Object.values(distribution).reduce((s, w) => s + w, 0);
    expect(sum).toBe(10);
  });

  test('stacked chart: every body lands in exactly one phase (fire_1 = 10)', () => {
    const { distribution } = registerChart(STACKED_CHART);
    expect(distribution.fire_1).toBe(10);
    const sum = Object.values(distribution).reduce((s, w) => s + w, 0);
    expect(sum).toBe(10);
  });

  test('Moon split still sums to 10 (0.5 + 0.5)', () => {
    const { distribution } = registerChart(noonSplitChart());
    const sum = Object.values(distribution).reduce((s, w) => s + w, 0);
    expect(sum).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// INV-3 — Output shape (Q6 = C: distribution only, no derivations)
// ---------------------------------------------------------------------------

describe('INV-3 output shape', () => {
  test('profile carries exactly: distribution, grammar_version, mode, input_fingerprint (timed)', () => {
    const profile = registerChart(SPREAD_CHART);
    expect(Object.keys(profile).sort()).toEqual(
      ['distribution', 'grammar_version', 'input_fingerprint', 'mode'].sort(),
    );
  });

  test('distribution has all 12 keys, always', () => {
    const { distribution } = registerChart(STACKED_CHART);
    expect(Object.keys(distribution).sort()).toEqual([...PHASE_KEYS].sort());
  });

  test('weights are RAW, never percentages (SH-12 / Finding 8 lesson)', () => {
    const { distribution } = registerChart(STACKED_CHART);
    // A percent normalization would emit 100 here; raw weight is 10.
    expect(distribution.fire_1).toBe(10);
  });

  test('hand-computed fixture distribution matches exactly', () => {
    const { distribution } = registerChart(SPREAD_CHART);
    expect(distribution).toEqual(SPREAD_EXPECTED);
  });

  test('no dominant_element key (Q6 = C ratification)', () => {
    const profile = registerChart(SPREAD_CHART) as unknown as Record<string, unknown>;
    expect('dominant_element' in profile).toBe(false);
    expect('dominant' in profile).toBe(false);
    expect('deficient' in profile).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// INV-4 — Ontology-closed
// ---------------------------------------------------------------------------

describe('INV-4 ontology-closed', () => {
  const ALLOWED_PROFILE_KEYS = new Set([
    'distribution',
    'grammar_version',
    'mode',
    'moonUncertain',
    'input_fingerprint',
    ...PHASE_KEYS,
  ]);

  test('every emitted key ⊆ the 12 phase keys + metadata fields', () => {
    for (const chart of [SPREAD_CHART, noonSplitChart(), noonSameSignChart()]) {
      const keys = allKeys(registerChart(chart));
      for (const key of keys) {
        expect(ALLOWED_PROFILE_KEYS.has(key)).toBe(true);
      }
    }
  });

  test('no rejected/relocated vocabulary anywhere (triage: crowns, weights, facets, competing ontology)', () => {
    const forbidden =
      /dominant|deficient|tie|weight|vector|circle|spiral|coherencePractices|currentPhase|activeFacets|house|intake|practice|facet/i;
    const keys = allKeys(registerChart(noonSplitChart()));
    for (const key of keys) {
      expect(key).not.toMatch(forbidden);
    }
  });
});

// ---------------------------------------------------------------------------
// INV-5 — Cusp determinism (half-open [0°, 30°) on raw longitude)
// ---------------------------------------------------------------------------

describe('INV-5 cusp determinism', () => {
  function soloRegistration(longitude: number): PhaseKey {
    // All ten bodies at the same longitude → the whole weight lands on one key.
    const bodies = {} as Record<Q1Body, number>;
    for (const body of Q1_BODIES) bodies[body] = longitude;
    const { distribution } = registerChart({ bodies, mode: 'timed' });
    const hit = (Object.entries(distribution) as [PhaseKey, number][]).filter(([, w]) => w > 0);
    expect(hit).toHaveLength(1);
    expect(hit[0][1]).toBe(10);
    return hit[0][0];
  }

  const expectedKeyForSign = (signIndex: number): PhaseKey => {
    const sign = SIGNS_IN_LONGITUDE_ORDER[signIndex];
    const { element, phase } = SIGN_TO_REGISTRATION[sign];
    return `${element}_${phase}` as PhaseKey;
  };

  test('29°59′59.99″ Aries → fire_1', () => {
    expect(soloRegistration(CUSP_HIGH)).toBe('fire_1');
  });

  test('exactly 0°00′00″ Taurus (longitude 30) → earth_2', () => {
    expect(soloRegistration(30)).toBe('earth_2');
  });

  test('boundary fixtures at every sign boundary: k·30° belongs to sign k; k·30°+29°59′59.99″ stays in sign k', () => {
    for (let k = 0; k < 12; k++) {
      const key = expectedKeyForSign(k);
      expect(soloRegistration(k * 30)).toBe(key);
      expect(soloRegistration(k * 30 + CUSP_HIGH)).toBe(key);
    }
  });

  test('longitude 0 → Aries fire_1; just below 360 → Pisces water_3', () => {
    expect(soloRegistration(0)).toBe('fire_1');
    expect(soloRegistration(359.9999)).toBe('water_3');
  });
});

// ---------------------------------------------------------------------------
// INV-6 — Degraded input explicit (Q4 / SH-10 / SH-11)
// ---------------------------------------------------------------------------

describe('INV-6 degraded input explicit', () => {
  test("mode:'noon' is emitted on the profile", () => {
    const profile = registerChart({ bodies: SPREAD_BODIES, mode: 'noon' });
    expect(profile.mode).toBe('noon');
  });

  test("mode:'timed' is emitted and moonUncertain is absent", () => {
    const profile = registerChart(SPREAD_CHART);
    expect(profile.mode).toBe('timed');
    expect('moonUncertain' in profile).toBe(false);
  });

  test('Moon branch split: each branch sign gets 0.5, moonUncertain: true', () => {
    const profile = registerChart(noonSplitChart());
    expect(profile.moonUncertain).toBe(true);
    expect(profile.distribution.water_3).toBe(0.5); // Pisces branch
    // fire_1 already holds the Sun (15° Aries) → 1 + 0.5
    expect(profile.distribution.fire_1).toBe(1.5);
  });

  test('both branches same sign: full weight 1.0 there, moonUncertain STILL true (epistemic flag travels)', () => {
    const profile = registerChart(noonSameSignChart());
    expect(profile.moonUncertain).toBe(true);
    // Sun (1.0) + whole Moon (1.0) in Aries
    expect(profile.distribution.fire_1).toBe(2);
    const sum = Object.values(profile.distribution).reduce((s, w) => s + w, 0);
    expect(sum).toBe(10);
  });

  describe('SH-11 — out-of-vocabulary input THROWS RegistrationInputError', () => {
    test('missing Q1 body', () => {
      const bodies = { ...SPREAD_BODIES } as Partial<Record<Q1Body, number>>;
      delete bodies.Pluto;
      expect(() =>
        registerChart({ bodies: bodies as Record<Q1Body, number>, mode: 'timed' }),
      ).toThrow(RegistrationInputError);
    });

    test('non-finite longitude (NaN)', () => {
      expect(() =>
        registerChart({ bodies: { ...SPREAD_BODIES, Mars: NaN }, mode: 'timed' }),
      ).toThrow(RegistrationInputError);
    });

    test('non-finite longitude (Infinity)', () => {
      expect(() =>
        registerChart({ bodies: { ...SPREAD_BODIES, Venus: Infinity }, mode: 'timed' }),
      ).toThrow(RegistrationInputError);
    });

    test('longitude below range (negative)', () => {
      expect(() =>
        registerChart({ bodies: { ...SPREAD_BODIES, Sun: -0.0001 }, mode: 'timed' }),
      ).toThrow(RegistrationInputError);
    });

    test('longitude at/above 360 (half-open [0, 360))', () => {
      expect(() =>
        registerChart({ bodies: { ...SPREAD_BODIES, Sun: 360 }, mode: 'timed' }),
      ).toThrow(RegistrationInputError);
    });

    test('invalid Moon-branch longitude throws too', () => {
      const chart = noonSplitChart();
      expect(() =>
        registerChart({ ...chart, moonBranches: [355, 360] }),
      ).toThrow(RegistrationInputError);
    });

    test("moonBranches with mode:'timed' violates SH-10's iff → throws", () => {
      expect(() =>
        registerChart({ bodies: SPREAD_BODIES, mode: 'timed', moonBranches: [355, 5] }),
      ).toThrow(RegistrationInputError);
    });

    test('moonBranches AND bodies.Moon both present violates SH-10 (branches REPLACE Moon) → throws', () => {
      expect(() =>
        registerChart({ bodies: SPREAD_BODIES, mode: 'noon', moonBranches: [355, 5] }),
      ).toThrow(RegistrationInputError);
    });

    test("missing Moon with no branches throws even in mode:'noon'", () => {
      const bodies = { ...SPREAD_BODIES } as Partial<Record<Q1Body, number>>;
      delete bodies.Moon;
      expect(() =>
        registerChart({ bodies: bodies as Record<Q1Body, number>, mode: 'noon' }),
      ).toThrow(RegistrationInputError);
    });
  });
});

// ---------------------------------------------------------------------------
// INV-7 — No aether metric
// ---------------------------------------------------------------------------

describe('INV-7 no aether metric', () => {
  test('recursive key scan: no aether or coherence key anywhere in the profile', () => {
    for (const chart of [SPREAD_CHART, noonSplitChart()]) {
      const keys = allKeys(registerChart(chart));
      for (const key of keys) {
        expect(key.toLowerCase()).not.toContain('aether');
        expect(key.toLowerCase()).not.toContain('coherence');
      }
    }
  });

  test('distribution keys are exactly the 4×3 grammar — no 13th key', () => {
    const { distribution } = registerChart(SPREAD_CHART);
    expect(Object.keys(distribution)).toHaveLength(12);
  });
});

// ---------------------------------------------------------------------------
// Table equivalence — the anti-fork pin (Kelly's chip 1)
// ---------------------------------------------------------------------------

describe('table equivalence with spiralogicEngine.ts (anti-fork pin)', () => {
  // NOTE (spec question raised in the build report): the engine's
  // SIGNS_TO_ELEMENT is NOT exported (spiralogicEngine.ts:14, module-level
  // const). The build forbids modifying any existing file, so the pin reads
  // the engine SOURCE read-only and parses the table literal instead of
  // importing the binding. Same artifact, zero edits to live code.
  const enginePath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'lib',
    'astrology',
    'engines',
    'spiralogicEngine.ts',
  );

  function parseEngineTable(): Record<string, string> {
    const source = fs.readFileSync(enginePath, 'utf8');
    const block = source.match(
      /SIGNS_TO_ELEMENT[^=]*=\s*\{([\s\S]*?)\};/,
    );
    if (!block) throw new Error('SIGNS_TO_ELEMENT literal not found in spiralogicEngine.ts');
    const entries: Record<string, string> = {};
    for (const m of block[1].matchAll(/(\w+):\s*"(\w+)"/g)) {
      entries[m[1]] = m[2];
    }
    return entries;
  }

  test('engine table has exactly 12 signs and agrees with the grammar table on element, sign by sign', () => {
    const engineTable = parseEngineTable();
    expect(Object.keys(engineTable).sort()).toEqual(
      [...SIGNS_IN_LONGITUDE_ORDER].sort(),
    );
    for (const sign of SIGNS_IN_LONGITUDE_ORDER) {
      expect(engineTable[sign]).toBe(SIGN_TO_REGISTRATION[sign].element);
    }
  });
});

// ---------------------------------------------------------------------------
// Grammar table integrity (Q2)
// ---------------------------------------------------------------------------

describe('Q2 grammar table', () => {
  test('the 12 ratified rows, verbatim', () => {
    expect(SIGN_TO_REGISTRATION).toEqual({
      Aries: { element: 'fire', phase: 1 },
      Leo: { element: 'fire', phase: 2 },
      Sagittarius: { element: 'fire', phase: 3 },
      Cancer: { element: 'water', phase: 1 },
      Scorpio: { element: 'water', phase: 2 },
      Pisces: { element: 'water', phase: 3 },
      Capricorn: { element: 'earth', phase: 1 },
      Taurus: { element: 'earth', phase: 2 },
      Virgo: { element: 'earth', phase: 3 },
      Libra: { element: 'air', phase: 1 },
      Aquarius: { element: 'air', phase: 2 },
      Gemini: { element: 'air', phase: 3 },
    });
  });

  test('table is frozen (version-frozen grammar_version: 1)', () => {
    expect(Object.isFrozen(SIGN_TO_REGISTRATION)).toBe(true);
    expect(Object.isFrozen(SIGN_TO_REGISTRATION.Aries)).toBe(true);
    expect(Object.isFrozen(SIGNS_IN_LONGITUDE_ORDER)).toBe(true);
  });
});
