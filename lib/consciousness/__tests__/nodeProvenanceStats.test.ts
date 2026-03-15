/**
 * nodeProvenanceStats Unit Tests
 *
 * Verifies the segmentation of canonical vs legacy-coerced nodes.
 * Used by analytics, admin views, and transition graph filtering.
 *
 * Three distinct coercion classes, each representing a different failure origin:
 *   coercedFromAetherSingleton — pre-triadic ontology (expected in older cases)
 *   coercedFromInvalidString   — data corruption or write-path bypass
 *   coercedFromEmptyOrNull     — incomplete data at write time (highest repair priority)
 */

import { nodeProvenanceStats } from '../elementNodeGenerator';
import { CaseElementNode } from '../facetRegistry';

// ─── Helpers ──────────────────────────────────────────────────────────────

function makeNode(overrides: Partial<CaseElementNode> = {}): CaseElementNode {
  return {
    id: 'test-uuid',
    caseId: 'case-uuid',
    practitionerId: 'prac-uuid',
    facet: 'fire_1',
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
    createdAt: new Date('2026-03-14T00:00:00Z'),
    updatedAt: new Date('2026-03-14T00:00:00Z'),
    ...overrides,
  };
}

function makeCoercedNode(originalFacetValue: string): CaseElementNode {
  return makeNode({
    facet: 'aether_1',
    element: 'aether',
    phaseIndex: 1,
    normalizationMeta: {
      wasLegacyFacet: true,
      originalFacetValue,
      wasCoercedToFacetKey: 'aether_1',
    },
  });
}

// ─── Empty list ────────────────────────────────────────────────────────────

describe('nodeProvenanceStats: empty list', () => {
  it('returns all zeros for empty array', () => {
    const stats = nodeProvenanceStats([]);
    expect(stats).toEqual({
      total: 0,
      canonical: 0,
      legacyCoerced: 0,
      coercedFromAetherSingleton: 0,
      coercedFromInvalidString: 0,
      coercedFromEmptyOrNull: 0,
    });
  });
});

// ─── All canonical ─────────────────────────────────────────────────────────

describe('nodeProvenanceStats: all canonical', () => {
  it('counts all canonical when no normalizationMeta present', () => {
    const nodes = [makeNode(), makeNode({ facet: 'water_2', element: 'water', phaseIndex: 2 })];
    const stats = nodeProvenanceStats(nodes);
    expect(stats.total).toBe(2);
    expect(stats.canonical).toBe(2);
    expect(stats.legacyCoerced).toBe(0);
    expect(stats.coercedFromEmptyOrNull).toBe(0);
  });
});

// ─── Legacy aether singleton ───────────────────────────────────────────────

describe('nodeProvenanceStats: coercedFromAetherSingleton', () => {
  it('counts singleton aether coercions separately', () => {
    const nodes = [
      makeNode(),
      makeCoercedNode('aether'),
      makeCoercedNode('aether'),
    ];
    const stats = nodeProvenanceStats(nodes);
    expect(stats.total).toBe(3);
    expect(stats.canonical).toBe(1);
    expect(stats.legacyCoerced).toBe(2);
    expect(stats.coercedFromAetherSingleton).toBe(2);
    expect(stats.coercedFromInvalidString).toBe(0);
    expect(stats.coercedFromEmptyOrNull).toBe(0);
  });
});

// ─── Invalid string coercions ──────────────────────────────────────────────

describe('nodeProvenanceStats: coercedFromInvalidString', () => {
  it('counts non-canonical non-empty strings separately', () => {
    const nodes = [
      makeCoercedNode('totally_wrong'),
      makeCoercedNode('FIRE_1'),
      makeCoercedNode('fire_phase2'),
    ];
    const stats = nodeProvenanceStats(nodes);
    expect(stats.total).toBe(3);
    expect(stats.canonical).toBe(0);
    expect(stats.coercedFromInvalidString).toBe(3);
    expect(stats.coercedFromEmptyOrNull).toBe(0);
  });
});

// ─── Empty / null coercions ───────────────────────────────────────────────

describe('nodeProvenanceStats: coercedFromEmptyOrNull', () => {
  it('counts empty string as coercedFromEmptyOrNull', () => {
    const nodes = [makeCoercedNode('')];
    const stats = nodeProvenanceStats(nodes);
    expect(stats.coercedFromEmptyOrNull).toBe(1);
    expect(stats.coercedFromInvalidString).toBe(0);
  });

  it('empty is distinct from invalid string — each goes to correct bucket', () => {
    const nodes = [makeCoercedNode(''), makeCoercedNode('bad_value')];
    const stats = nodeProvenanceStats(nodes);
    expect(stats.coercedFromEmptyOrNull).toBe(1);
    expect(stats.coercedFromInvalidString).toBe(1);
    expect(stats.legacyCoerced).toBe(2);
  });
});

// ─── Mixed population ──────────────────────────────────────────────────────

describe('nodeProvenanceStats: mixed population', () => {
  it('correctly segments all four categories', () => {
    const nodes = [
      makeNode({ facet: 'earth_3', element: 'earth', phaseIndex: 3 }),
      makeNode({ facet: 'air_2', element: 'air', phaseIndex: 2 }),
      makeCoercedNode('aether'),
      makeCoercedNode('aether'),
      makeCoercedNode('bad_string'),
      makeCoercedNode(''),
    ];
    const stats = nodeProvenanceStats(nodes);
    expect(stats.total).toBe(6);
    expect(stats.canonical).toBe(2);
    expect(stats.legacyCoerced).toBe(4);
    expect(stats.coercedFromAetherSingleton).toBe(2);
    expect(stats.coercedFromInvalidString).toBe(1);
    expect(stats.coercedFromEmptyOrNull).toBe(1);
  });

  it('legacyCoerced = sum of all three coercion buckets (invariant)', () => {
    const nodes = [
      makeNode(),
      makeCoercedNode('aether'),
      makeCoercedNode('unknown'),
      makeCoercedNode(''),
    ];
    const stats = nodeProvenanceStats(nodes);
    expect(stats.legacyCoerced).toBe(
      stats.coercedFromAetherSingleton + stats.coercedFromInvalidString + stats.coercedFromEmptyOrNull,
    );
  });

  it('total = canonical + legacyCoerced (invariant)', () => {
    const nodes = [makeNode(), makeCoercedNode('aether'), makeCoercedNode('junk'), makeCoercedNode('')];
    const stats = nodeProvenanceStats(nodes);
    expect(stats.total).toBe(stats.canonical + stats.legacyCoerced);
  });
});
