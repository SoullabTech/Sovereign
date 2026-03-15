/**
 * rowToNode Integration Tests
 *
 * Tests the seam where raw DB history meets canonical runtime CaseElementNode objects.
 * Focuses on legacy facet handling, null coercion, correctness of derived fields,
 * and normalization provenance metadata.
 */

import { rowToNode } from '../elementNodeGenerator';
import { FACET_REGISTRY, isFacetKey } from '../facetRegistry';

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Build a minimal valid DB row with required fields */
function makeRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'test-uuid-001',
    case_id: 'case-uuid-001',
    practitioner_id: 'practitioner-uuid-001',
    facet: 'fire_1',
    element: 'fire',
    phase_index: 1,
    role: 'marker',
    state_valence: null,
    confidence: null,
    source_type: null,
    source_id: null,
    session_context: null,
    confirmed_by_practitioner: false,
    confirmed_at: null,
    confirmed_by: null,
    practitioner_note: null,
    created_at: '2026-03-14T00:00:00Z',
    updated_at: '2026-03-14T00:00:00Z',
    ...overrides,
  };
}

// ─── Canonical row ─────────────────────────────────────────────────────────

describe('rowToNode: canonical facet row', () => {
  it('maps a canonical fire_1 row correctly', () => {
    const node = rowToNode(makeRow({ facet: 'fire_1', element: 'fire', phase_index: 1 }));
    expect(node.facet).toBe('fire_1');
    expect(node.element).toBe('fire');
    expect(node.phaseIndex).toBe(1);
    expect(isFacetKey(node.facet)).toBe(true);
  });

  it('derives element from registry, not from row.element (defense against stale row data)', () => {
    // Even if the row has wrong element data, we derive from the registry
    const node = rowToNode(makeRow({ facet: 'water_2', element: 'WRONG', phase_index: 99 }));
    expect(node.element).toBe('water');   // derived from FACET_REGISTRY[water_2]
  });

  it('maps all 15 canonical facets without error', () => {
    const keys = Object.keys(FACET_REGISTRY) as string[];
    for (const facet of keys) {
      const def = FACET_REGISTRY[facet as keyof typeof FACET_REGISTRY];
      const node = rowToNode(makeRow({ facet, element: def.element, phase_index: def.phaseIndex }));
      expect(node.facet).toBe(facet);
      expect(node.element).toBe(def.element);
      expect(isFacetKey(node.facet)).toBe(true);
    }
  });

  it('maps string confidence to float', () => {
    const node = rowToNode(makeRow({ confidence: '0.75' }));
    expect(node.confidence).toBe(0.75);
  });

  it('maps null confidence to null', () => {
    const node = rowToNode(makeRow({ confidence: null }));
    expect(node.confidence).toBeNull();
  });

  it('maps confirmed_at string to Date', () => {
    const node = rowToNode(makeRow({
      confirmed_by_practitioner: true,
      confirmed_at: '2026-03-14T12:00:00Z',
    }));
    expect(node.confirmedByPractitioner).toBe(true);
    expect(node.confirmedAt).toBeInstanceOf(Date);
  });
});

// ─── Legacy facet = 'aether' ───────────────────────────────────────────────

describe('rowToNode: legacy facet = "aether" (undifferentiated singleton)', () => {
  it('coerces to aether_1 (Emanation)', () => {
    const node = rowToNode(makeRow({ facet: 'aether', element: 'aether', phase_index: null }));
    expect(node.facet).toBe('aether_1');
    expect(node.element).toBe('aether');
    expect(isFacetKey(node.facet)).toBe(true);
  });

  it('phaseIndex falls back to def.phaseIndex (1) when row has null', () => {
    const node = rowToNode(makeRow({ facet: 'aether', phase_index: null }));
    expect(node.phaseIndex).toBe(1); // aether_1 phaseIndex = 1
  });

  it('preserves the confidence from the legacy row', () => {
    const node = rowToNode(makeRow({ facet: 'aether', confidence: '0.45', phase_index: null }));
    expect(node.facet).toBe('aether_1');
    expect(node.confidence).toBe(0.45);
  });
});

// ─── Unknown / invalid facet string ───────────────────────────────────────

describe('rowToNode: invalid facet string', () => {
  it('coerces unknown string to aether_1 via sentinel fallback', () => {
    const node = rowToNode(makeRow({ facet: 'totally_wrong', phase_index: null }));
    expect(node.facet).toBe('aether_1');
    expect(isFacetKey(node.facet)).toBe(true);
  });

  it('coerces empty string to aether_1', () => {
    const node = rowToNode(makeRow({ facet: '', phase_index: null }));
    expect(node.facet).toBe('aether_1');
  });
});

// ─── Null phaseIndex on canonical facets ─────────────────────────────────

describe('rowToNode: null phaseIndex on canonical facets', () => {
  it('falls back to def.phaseIndex for fire_3 when row has null phase_index', () => {
    const node = rowToNode(makeRow({ facet: 'fire_3', phase_index: null }));
    expect(node.phaseIndex).toBe(3); // fire_3 phaseIndex = 3
  });

  it('falls back to def.phaseIndex for earth_2 when row has null phase_index', () => {
    const node = rowToNode(makeRow({ facet: 'earth_2', phase_index: null }));
    expect(node.phaseIndex).toBe(2); // earth_2 phaseIndex = 2
  });

  it('falls back to def.phaseIndex for aether_3 when row has null phase_index', () => {
    const node = rowToNode(makeRow({ facet: 'aether_3', phase_index: null }));
    expect(node.phaseIndex).toBe(3); // aether_3 phaseIndex = 3
  });
});

// ─── Normalization provenance metadata ────────────────────────────────────

describe('rowToNode: normalizationMeta provenance', () => {
  it('canonical rows have no normalizationMeta (undefined)', () => {
    const node = rowToNode(makeRow({ facet: 'fire_1', element: 'fire', phase_index: 1 }));
    expect(node.normalizationMeta).toBeUndefined();
  });

  it('all 15 canonical facets produce no normalizationMeta', () => {
    for (const facet of Object.keys(FACET_REGISTRY)) {
      const node = rowToNode(makeRow({ facet }));
      expect(node.normalizationMeta).toBeUndefined();
    }
  });

  it('legacy aether row produces normalizationMeta with correct fields', () => {
    const node = rowToNode(makeRow({ facet: 'aether', phase_index: null }));
    expect(node.normalizationMeta).toBeDefined();
    expect(node.normalizationMeta!.wasLegacyFacet).toBe(true);
    expect(node.normalizationMeta!.originalFacetValue).toBe('aether');
    expect(node.normalizationMeta!.wasCoercedToFacetKey).toBe('aether_1');
  });

  it('unknown string produces normalizationMeta preserving original value', () => {
    const node = rowToNode(makeRow({ facet: 'completely_unknown', phase_index: null }));
    expect(node.normalizationMeta).toBeDefined();
    expect(node.normalizationMeta!.wasLegacyFacet).toBe(true);
    expect(node.normalizationMeta!.originalFacetValue).toBe('completely_unknown');
    expect(node.normalizationMeta!.wasCoercedToFacetKey).toBe('aether_1');
  });

  it('empty string produces normalizationMeta preserving empty original', () => {
    const node = rowToNode(makeRow({ facet: '', phase_index: null }));
    expect(node.normalizationMeta).toBeDefined();
    expect(node.normalizationMeta!.originalFacetValue).toBe('');
    expect(node.normalizationMeta!.wasCoercedToFacetKey).toBe('aether_1');
  });

  it('normalizationMeta.wasCoercedToFacetKey always equals node.facet', () => {
    for (const raw of ['aether', 'totally_wrong', '', 'FIRE_1']) {
      const node = rowToNode(makeRow({ facet: raw, phase_index: null }));
      if (node.normalizationMeta) {
        expect(node.normalizationMeta.wasCoercedToFacetKey).toBe(node.facet);
      }
    }
  });
});

// ─── Optional fields round-trip ────────────────────────────────────────────

describe('rowToNode: optional fields', () => {
  it('maps stateValence correctly', () => {
    expect(rowToNode(makeRow({ state_valence: 'positive' })).stateValence).toBe('positive');
    expect(rowToNode(makeRow({ state_valence: 'negative' })).stateValence).toBe('negative');
    expect(rowToNode(makeRow({ state_valence: null })).stateValence).toBeNull();
  });

  it('maps sourceType correctly', () => {
    expect(rowToNode(makeRow({ source_type: 'case_memory' })).sourceType).toBe('case_memory');
    expect(rowToNode(makeRow({ source_type: null })).sourceType).toBeNull();
  });

  it('maps practitionerNote correctly', () => {
    expect(rowToNode(makeRow({ practitioner_note: 'Test note' })).practitionerNote).toBe('Test note');
    expect(rowToNode(makeRow({ practitioner_note: null })).practitionerNote).toBeNull();
  });

  it('maps date fields to Date instances', () => {
    const node = rowToNode(makeRow({
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    }));
    expect(node.createdAt).toBeInstanceOf(Date);
    expect(node.updatedAt).toBeInstanceOf(Date);
  });
});
