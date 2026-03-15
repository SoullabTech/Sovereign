/**
 * caseFieldAnalytics Unit Tests
 *
 * Verifies that the analytics function correctly separates canonical from
 * legacy-coerced nodes across all distribution dimensions.
 *
 * Key contract being tested:
 *   - canonical counts are safe for transition graphs and frequency charts
 *   - legacyCoerced counts are always isolated — never silently included in canonical
 *   - ring/center, role, and facet distributions all honour provenance split
 */

import { caseFieldAnalytics } from '../elementNodeGenerator';
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

function makeCoercedNode(originalFacetValue: string, overrides: Partial<CaseElementNode> = {}): CaseElementNode {
  return makeNode({
    facet: 'aether_1',
    element: 'aether',
    phaseIndex: 1,
    normalizationMeta: {
      wasLegacyFacet: true,
      originalFacetValue,
      wasCoercedToFacetKey: 'aether_1',
    },
    ...overrides,
  });
}

// ─── Empty field ───────────────────────────────────────────────────────────

describe('caseFieldAnalytics: empty field', () => {
  it('returns zero counts and empty distributions for no nodes', () => {
    const analytics = caseFieldAnalytics([]);
    expect(analytics.provenance.total).toBe(0);
    expect(analytics.hasLegacyNodes).toBe(false);
    expect(analytics.facetFrequency).toHaveLength(0);
    expect(analytics.confirmedCount).toBe(0);
    expect(analytics.roleDistribution.marker).toEqual({ canonical: 0, legacyCoerced: 0 });
    expect(analytics.boardRegionDistribution.ring).toEqual({ canonical: 0, legacyCoerced: 0 });
    expect(analytics.boardRegionDistribution.center).toEqual({ canonical: 0, legacyCoerced: 0 });
  });
});

// ─── All canonical ─────────────────────────────────────────────────────────

describe('caseFieldAnalytics: all canonical', () => {
  it('hasLegacyNodes is false when all nodes are canonical', () => {
    const nodes = [
      makeNode({ facet: 'fire_1', element: 'fire', phaseIndex: 1, role: 'marker' }),
      makeNode({ facet: 'water_2', element: 'water', phaseIndex: 2, role: 'goal' }),
    ];
    const analytics = caseFieldAnalytics(nodes);
    expect(analytics.hasLegacyNodes).toBe(false);
    expect(analytics.provenance.legacyCoerced).toBe(0);
  });

  it('facetFrequency canonical counts are correct', () => {
    const nodes = [
      makeNode({ facet: 'fire_1', element: 'fire', phaseIndex: 1 }),
      makeNode({ facet: 'fire_1', element: 'fire', phaseIndex: 1 }),
      makeNode({ facet: 'earth_2', element: 'earth', phaseIndex: 2 }),
    ];
    const analytics = caseFieldAnalytics(nodes);
    const fire1 = analytics.facetFrequency.find(f => f.facet === 'fire_1')!;
    const earth2 = analytics.facetFrequency.find(f => f.facet === 'earth_2')!;
    expect(fire1.canonical).toBe(2);
    expect(fire1.legacyCoerced).toBe(0);
    expect(earth2.canonical).toBe(1);
    expect(earth2.legacyCoerced).toBe(0);
  });
});

// ─── Coerced nodes isolated from canonical ────────────────────────────────

describe('caseFieldAnalytics: coerced nodes do not pollute canonical counts', () => {
  it('legacyCoerced does not contribute to canonical in facetFrequency', () => {
    const nodes = [
      makeNode({ facet: 'aether_1', element: 'aether', phaseIndex: 1 }),  // canonical
      makeCoercedNode('aether'),                                            // coerced
    ];
    const analytics = caseFieldAnalytics(nodes);
    const aether1 = analytics.facetFrequency.find(f => f.facet === 'aether_1')!;
    expect(aether1.canonical).toBe(1);
    expect(aether1.legacyCoerced).toBe(1);
  });

  it('role distribution keeps canonical and coerced separate', () => {
    const nodes = [
      makeNode({ role: 'marker' }),                           // canonical marker
      makeCoercedNode('aether', { role: 'marker' }),          // coerced marker
      makeNode({ role: 'goal', facet: 'earth_1', element: 'earth', phaseIndex: 1 }), // canonical goal
    ];
    const analytics = caseFieldAnalytics(nodes);
    expect(analytics.roleDistribution.marker.canonical).toBe(1);
    expect(analytics.roleDistribution.marker.legacyCoerced).toBe(1);
    expect(analytics.roleDistribution.goal.canonical).toBe(1);
    expect(analytics.roleDistribution.goal.legacyCoerced).toBe(0);
  });

  it('boardRegionDistribution: coerced aether nodes count in center.legacyCoerced not center.canonical', () => {
    const nodes = [
      makeNode({ facet: 'aether_2', element: 'aether', phaseIndex: 2 }), // canonical center
      makeCoercedNode('aether'),                                            // coerced center
      makeNode({ facet: 'fire_1', element: 'fire', phaseIndex: 1 }),      // canonical ring
    ];
    const analytics = caseFieldAnalytics(nodes);
    expect(analytics.boardRegionDistribution.center.canonical).toBe(1);
    expect(analytics.boardRegionDistribution.center.legacyCoerced).toBe(1);
    expect(analytics.boardRegionDistribution.ring.canonical).toBe(1);
    expect(analytics.boardRegionDistribution.ring.legacyCoerced).toBe(0);
  });
});

// ─── Board region assignment ───────────────────────────────────────────────

describe('caseFieldAnalytics: boardRegion assignment', () => {
  it('fire/water/earth/air facets go to ring', () => {
    const nodes = [
      makeNode({ facet: 'fire_2', element: 'fire', phaseIndex: 2 }),
      makeNode({ facet: 'water_3', element: 'water', phaseIndex: 3 }),
      makeNode({ facet: 'earth_1', element: 'earth', phaseIndex: 1 }),
      makeNode({ facet: 'air_2', element: 'air', phaseIndex: 2 }),
    ];
    const analytics = caseFieldAnalytics(nodes);
    expect(analytics.boardRegionDistribution.ring.canonical).toBe(4);
    expect(analytics.boardRegionDistribution.center.canonical).toBe(0);
  });

  it('all three aether facets go to center', () => {
    const nodes = [
      makeNode({ facet: 'aether_1', element: 'aether', phaseIndex: 1 }),
      makeNode({ facet: 'aether_2', element: 'aether', phaseIndex: 2 }),
      makeNode({ facet: 'aether_3', element: 'aether', phaseIndex: 3 }),
    ];
    const analytics = caseFieldAnalytics(nodes);
    expect(analytics.boardRegionDistribution.center.canonical).toBe(3);
    expect(analytics.boardRegionDistribution.ring.canonical).toBe(0);
  });
});

// ─── Confirmed count ───────────────────────────────────────────────────────

describe('caseFieldAnalytics: confirmedCount', () => {
  it('only counts nodes with confirmedByPractitioner = true', () => {
    const nodes = [
      makeNode({ confirmedByPractitioner: true }),
      makeNode({ confirmedByPractitioner: true }),
      makeNode({ confirmedByPractitioner: false }),
    ];
    expect(caseFieldAnalytics(nodes).confirmedCount).toBe(2);
  });

  it('confirmedCount is zero when no nodes confirmed', () => {
    const nodes = [makeNode(), makeNode()];
    expect(caseFieldAnalytics(nodes).confirmedCount).toBe(0);
  });
});

// ─── hasLegacyNodes flag ───────────────────────────────────────────────────

describe('caseFieldAnalytics: hasLegacyNodes', () => {
  it('is true when any coerced node exists', () => {
    const nodes = [makeNode(), makeCoercedNode('aether')];
    expect(caseFieldAnalytics(nodes).hasLegacyNodes).toBe(true);
  });

  it('is false when all nodes are canonical', () => {
    const nodes = [makeNode(), makeNode({ facet: 'water_1', element: 'water', phaseIndex: 1 })];
    expect(caseFieldAnalytics(nodes).hasLegacyNodes).toBe(false);
  });
});

// ─── facetFrequency metadata ──────────────────────────────────────────────

describe('caseFieldAnalytics: facetFrequency metadata', () => {
  it('only includes facets that appear at least once', () => {
    const nodes = [makeNode({ facet: 'fire_1', element: 'fire', phaseIndex: 1 })];
    const analytics = caseFieldAnalytics(nodes);
    expect(analytics.facetFrequency).toHaveLength(1);
    expect(analytics.facetFrequency[0].facet).toBe('fire_1');
  });

  it('includes element and boardRegion from registry', () => {
    const nodes = [makeNode({ facet: 'aether_3', element: 'aether', phaseIndex: 3 })];
    const analytics = caseFieldAnalytics(nodes);
    const entry = analytics.facetFrequency[0];
    expect(entry.element).toBe('aether');
    expect(entry.boardRegion).toBe('center');
  });
});
