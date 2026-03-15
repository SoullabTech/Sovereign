/**
 * caseTransitionAnalytics Unit Tests
 *
 * Verifies the three-lane separation of facet transitions by provenance.
 *
 * Core contract:
 *   canonical transitions  = both nodes canonical — safe for movement graphs
 *   mixed transitions      = one canonical, one coerced — ontologically ambiguous
 *   coerced transitions    = both coerced — integrity analysis only
 *
 * The most important invariant:
 *   Coerced nodes must not silently inflate canonical transition counts.
 */

import { caseTransitionAnalytics } from '../elementNodeGenerator';
import { CaseElementNode } from '../facetRegistry';

// ─── Helpers ──────────────────────────────────────────────────────────────

let idCounter = 0;

function makeNode(
  facet: CaseElementNode['facet'],
  createdAt: Date,
  overrides: Partial<CaseElementNode> = {},
): CaseElementNode {
  return {
    id: `node-${++idCounter}`,
    caseId: 'case-uuid',
    practitionerId: 'prac-uuid',
    facet,
    element: 'fire',
    phaseIndex: 1,
    role: 'marker',
    stateValence: null,
    confidence: null,
    sourceType: null,
    sourceId: null,
    sessionContext: null,
    confirmedByPractitioner: false,
    confirmedAt: null,
    confirmedBy: null,
    practitionerNote: null,
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  };
}

function makeCoercedNode(
  facet: CaseElementNode['facet'],
  createdAt: Date,
  originalFacetValue = 'aether',
): CaseElementNode {
  return makeNode(facet, createdAt, {
    normalizationMeta: {
      wasLegacyFacet: true,
      originalFacetValue,
      wasCoercedToFacetKey: facet,
    },
  });
}

const t = (offset: number) => new Date(1741910400000 + offset * 1000); // base: 2026-03-14

// ─── Edge cases ───────────────────────────────────────────────────────────

describe('caseTransitionAnalytics: edge cases', () => {
  it('returns empty analytics for empty node list', () => {
    const result = caseTransitionAnalytics([]);
    expect(result.totalPairs).toBe(0);
    expect(result.hasLegacyTransitions).toBe(false);
    expect(result.canonicalTransitions).toHaveLength(0);
    expect(result.mixedTransitions).toHaveLength(0);
    expect(result.coercedTransitions).toHaveLength(0);
  });

  it('returns zero pairs for a single node', () => {
    const result = caseTransitionAnalytics([makeNode('fire_1', t(0))]);
    expect(result.totalPairs).toBe(0);
  });
});

// ─── All canonical ─────────────────────────────────────────────────────────

describe('caseTransitionAnalytics: all canonical', () => {
  it('canonical → canonical goes to canonicalTransitions only', () => {
    const nodes = [
      makeNode('fire_1', t(0)),
      makeNode('water_1', t(1)),
      makeNode('earth_2', t(2)),
    ];
    const result = caseTransitionAnalytics(nodes);
    expect(result.canonicalTransitions).toHaveLength(2);
    expect(result.mixedTransitions).toHaveLength(0);
    expect(result.coercedTransitions).toHaveLength(0);
    expect(result.hasLegacyTransitions).toBe(false);
    expect(result.totalPairs).toBe(2);
  });

  it('repeated canonical transition accumulates count', () => {
    const nodes = [
      makeNode('fire_1', t(0)),
      makeNode('water_1', t(1)),
      makeNode('fire_1', t(2)),
      makeNode('water_1', t(3)),
    ];
    const result = caseTransitionAnalytics(nodes);
    const fw = result.canonicalTransitions.find(tr => tr.from === 'fire_1' && tr.to === 'water_1')!;
    const wf = result.canonicalTransitions.find(tr => tr.from === 'water_1' && tr.to === 'fire_1')!;
    expect(fw.count).toBe(2);
    expect(wf.count).toBe(1);
    expect(result.totalPairs).toBe(3);
  });
});

// ─── Coerced does not pollute canonical ───────────────────────────────────

describe('caseTransitionAnalytics: coerced nodes do not pollute canonical lane', () => {
  it('canonical followed by coerced → mixed, not canonical', () => {
    const nodes = [
      makeNode('fire_1', t(0)),
      makeCoercedNode('aether_1', t(1)),
    ];
    const result = caseTransitionAnalytics(nodes);
    expect(result.canonicalTransitions).toHaveLength(0);
    expect(result.mixedTransitions).toHaveLength(1);
    expect(result.mixedTransitions[0]).toMatchObject({ from: 'fire_1', to: 'aether_1', count: 1 });
    expect(result.hasLegacyTransitions).toBe(true);
  });

  it('coerced followed by canonical → mixed, not canonical', () => {
    const nodes = [
      makeCoercedNode('aether_1', t(0)),
      makeNode('water_2', t(1)),
    ];
    const result = caseTransitionAnalytics(nodes);
    expect(result.canonicalTransitions).toHaveLength(0);
    expect(result.mixedTransitions).toHaveLength(1);
    expect(result.mixedTransitions[0]).toMatchObject({ from: 'aether_1', to: 'water_2', count: 1 });
  });

  it('coerced followed by coerced → coercedTransitions only', () => {
    const nodes = [
      makeCoercedNode('aether_1', t(0)),
      makeCoercedNode('aether_1', t(1)),
    ];
    const result = caseTransitionAnalytics(nodes);
    expect(result.canonicalTransitions).toHaveLength(0);
    expect(result.mixedTransitions).toHaveLength(0);
    expect(result.coercedTransitions).toHaveLength(1);
    expect(result.coercedTransitions[0]).toMatchObject({ from: 'aether_1', to: 'aether_1', count: 1 });
  });
});

// ─── Three lanes simultaneously ───────────────────────────────────────────

describe('caseTransitionAnalytics: three-lane mixed sequence', () => {
  it('correctly routes transitions to all three lanes', () => {
    const nodes = [
      makeNode('fire_1', t(0)),          // canonical
      makeNode('water_1', t(1)),         // canonical → canonical transition
      makeCoercedNode('aether_1', t(2)), // canonical → coerced → mixed
      makeCoercedNode('aether_1', t(3)), // coerced → coerced
      makeNode('earth_2', t(4)),         // coerced → canonical → mixed
    ];
    const result = caseTransitionAnalytics(nodes);

    // fire_1 → water_1: canonical
    expect(result.canonicalTransitions.find(tr => tr.from === 'fire_1' && tr.to === 'water_1')).toBeDefined();
    // water_1 → aether_1: mixed (canonical→coerced)
    expect(result.mixedTransitions.find(tr => tr.from === 'water_1' && tr.to === 'aether_1')).toBeDefined();
    // aether_1 → aether_1: coerced
    expect(result.coercedTransitions.find(tr => tr.from === 'aether_1' && tr.to === 'aether_1')).toBeDefined();
    // aether_1 → earth_2: mixed (coerced→canonical)
    expect(result.mixedTransitions.find(tr => tr.from === 'aether_1' && tr.to === 'earth_2')).toBeDefined();

    expect(result.totalPairs).toBe(4);
    expect(result.hasLegacyTransitions).toBe(true);
  });
});

// ─── Temporal ordering ────────────────────────────────────────────────────

describe('caseTransitionAnalytics: temporal ordering', () => {
  it('sorts by createdAt regardless of input order', () => {
    // Deliberately provide nodes out of order
    const nodes = [
      makeNode('earth_3', t(2)),  // third
      makeNode('fire_1', t(0)),   // first
      makeNode('water_2', t(1)),  // second
    ];
    const result = caseTransitionAnalytics(nodes);
    // Should be fire_1→water_2, water_2→earth_3 — not earth_3→fire_1
    expect(result.canonicalTransitions.find(tr => tr.from === 'fire_1' && tr.to === 'water_2')).toBeDefined();
    expect(result.canonicalTransitions.find(tr => tr.from === 'water_2' && tr.to === 'earth_3')).toBeDefined();
    expect(result.canonicalTransitions.find(tr => tr.from === 'earth_3' && tr.to === 'fire_1')).toBeUndefined();
  });
});

// ─── Invariants ───────────────────────────────────────────────────────────

describe('caseTransitionAnalytics: invariants', () => {
  it('sum of all transition counts equals totalPairs', () => {
    const nodes = [
      makeNode('fire_1', t(0)),
      makeCoercedNode('aether_1', t(1)),
      makeNode('water_2', t(2)),
      makeCoercedNode('aether_1', t(3)),
      makeCoercedNode('aether_1', t(4)),
    ];
    const result = caseTransitionAnalytics(nodes);
    const sumCounts = (trs: typeof result.canonicalTransitions) =>
      trs.reduce((acc, tr) => acc + tr.count, 0);
    const total = sumCounts(result.canonicalTransitions)
      + sumCounts(result.mixedTransitions)
      + sumCounts(result.coercedTransitions);
    expect(total).toBe(result.totalPairs);
  });
});
