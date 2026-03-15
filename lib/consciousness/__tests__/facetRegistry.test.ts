/**
 * Facet Registry Contract Tests
 *
 * These tests protect the ontological backbone of the Spiralogic system.
 * A failing test here means the registry has drifted from the canonical
 * Elemental Alchemy model — this is a hard stop, not a warning.
 *
 * Source: "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life" — Kelly Nezat
 */

import {
  FACET_REGISTRY,
  VALID_FACET_KEYS,
  FacetKey,
  isFacetKey,
  normalizeLegacyFacetKey,
  coerceLegacyFacetKey,
  LEGACY_AETHER_SENTINEL,
  getAllFacets,
  getRingFacets,
  getCenterFacets,
  getFacetsByElement,
  scoreFacetMatch,
  scoreValence,
} from '../facetRegistry';

// ─── Registry integrity ───────────────────────────────────────────────────

describe('FACET_REGISTRY structural contract', () => {
  const allFacets = getAllFacets();

  it('contains exactly 15 facets', () => {
    expect(allFacets).toHaveLength(15);
  });

  it('has no duplicate facet keys', () => {
    const keys = allFacets.map(f => f.key);
    expect(new Set(keys).size).toBe(15);
  });

  it('has no duplicate uiOrder values', () => {
    const orders = allFacets.map(f => f.uiOrder);
    expect(new Set(orders).size).toBe(15);
  });

  it('uiOrder covers 1–15 with no gaps', () => {
    const orders = allFacets.map(f => f.uiOrder).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('every element has exactly 3 facets', () => {
    const elements = ['fire', 'water', 'earth', 'air', 'aether'] as const;
    for (const el of elements) {
      const facets = getFacetsByElement(el);
      expect(facets).toHaveLength(3);
    }
  });

  it('every facet has phaseIndex 1, 2, or 3', () => {
    for (const facet of allFacets) {
      expect([1, 2, 3]).toContain(facet.phaseIndex);
    }
  });

  it('every element has phase 1, 2, and 3 — no gaps', () => {
    const elements = ['fire', 'water', 'earth', 'air', 'aether'] as const;
    for (const el of elements) {
      const phases = getFacetsByElement(el).map(f => f.phaseIndex).sort();
      expect(phases).toEqual([1, 2, 3]);
    }
  });

  it('boardRegion is ring for 12 facets and center for 3 Aether facets', () => {
    expect(getRingFacets()).toHaveLength(12);
    expect(getCenterFacets()).toHaveLength(3);
  });

  it('only Aether facets have boardRegion center', () => {
    for (const facet of allFacets) {
      if (facet.element === 'aether') {
        expect(facet.boardRegion).toBe('center');
      } else {
        expect(facet.boardRegion).toBe('ring');
      }
    }
  });

  it('every facet has a non-empty canonicalName', () => {
    for (const facet of allFacets) {
      expect(facet.canonicalName).toBeTruthy();
    }
  });

  it('every facet has a non-empty displayName', () => {
    for (const facet of allFacets) {
      expect(facet.displayName).toBeTruthy();
    }
  });

  it('every facet has roleAffinities with at least one role', () => {
    for (const facet of allFacets) {
      expect(facet.roleAffinities.length).toBeGreaterThan(0);
    }
  });

  it('every facet has a non-empty developmentalLogic', () => {
    for (const facet of allFacets) {
      expect(facet.developmentalLogic).toBeTruthy();
    }
  });

  it('every facet has at least 3 typicalMarkers', () => {
    for (const facet of allFacets) {
      expect(facet.typicalMarkers.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('every facet has all three stateSignatures (positive, neutral, negative)', () => {
    for (const facet of allFacets) {
      expect(facet.stateSignatures.positive).toBeDefined();
      expect(facet.stateSignatures.neutral).toBeDefined();
      expect(facet.stateSignatures.negative).toBeDefined();
    }
  });

  it('every stateSignature has signals and description', () => {
    for (const facet of allFacets) {
      for (const valence of ['positive', 'neutral', 'negative'] as const) {
        const sig = facet.stateSignatures[valence];
        expect(sig.signals.length).toBeGreaterThan(0);
        expect(sig.description).toBeTruthy();
      }
    }
  });
});

// ─── Canonical names (book-sourced, must not change silently) ─────────────

describe('Canonical names match Elemental Alchemy source', () => {
  it.each([
    ['fire_1',   'Activating'],
    ['fire_2',   'Amplifying'],
    ['fire_3',   'Actualizing'],
    ['water_1',  'Being'],
    ['water_2',  'Balancing'],
    ['water_3',  'Becoming'],
    ['earth_1',  'Cultivating'],
    ['earth_2',  'Crystallizing'],
    ['earth_3',  'Clarifying'],
    ['air_1',    'Directing'],
    ['air_2',    'Discerning'],
    ['air_3',    'Delivering'],
    ['aether_1', 'Emanation'],
    ['aether_2', 'Elevation'],
    ['aether_3', 'Equilibrium'],
  ] as [FacetKey, string][])(
    '%s → canonicalName = %s',
    (key, expectedName) => {
      expect(FACET_REGISTRY[key].canonicalName).toBe(expectedName);
    }
  );
});

// ─── Aether triad specific ─────────────────────────────────────────────────

describe('Aether triad', () => {
  it('aether_1 is Emanation (threshold opening)', () => {
    expect(FACET_REGISTRY.aether_1.canonicalName).toBe('Emanation');
    expect(FACET_REGISTRY.aether_1.phaseIndex).toBe(1);
    expect(FACET_REGISTRY.aether_1.boardRegion).toBe('center');
    expect(FACET_REGISTRY.aether_1.uiOrder).toBe(13);
  });

  it('aether_2 is Elevation (transcendent awareness)', () => {
    expect(FACET_REGISTRY.aether_2.canonicalName).toBe('Elevation');
    expect(FACET_REGISTRY.aether_2.phaseIndex).toBe(2);
    expect(FACET_REGISTRY.aether_2.boardRegion).toBe('center');
    expect(FACET_REGISTRY.aether_2.uiOrder).toBe(14);
  });

  it('aether_3 is Equilibrium (conductor harmony)', () => {
    expect(FACET_REGISTRY.aether_3.canonicalName).toBe('Equilibrium');
    expect(FACET_REGISTRY.aether_3.phaseIndex).toBe(3);
    expect(FACET_REGISTRY.aether_3.boardRegion).toBe('center');
    expect(FACET_REGISTRY.aether_3.uiOrder).toBe(15);
  });

  it('getCenterFacets returns exactly the Aether triad in uiOrder', () => {
    const center = getCenterFacets().sort((a, b) => a.uiOrder - b.uiOrder);
    expect(center.map(f => f.key)).toEqual(['aether_1', 'aether_2', 'aether_3']);
  });
});

// ─── Sequence graph integrity ─────────────────────────────────────────────

describe('Sequence graph: precededBy and typicallyFollowedBy resolve to valid keys', () => {
  it('every precededBy reference resolves to a valid FacetKey', () => {
    for (const facet of getAllFacets()) {
      for (const ref of facet.precededBy) {
        expect(VALID_FACET_KEYS.has(ref)).toBe(true);
        // Provide a helpful error message on failure
        if (!VALID_FACET_KEYS.has(ref)) {
          throw new Error(`${facet.key}.precededBy contains invalid key: ${ref}`);
        }
      }
    }
  });

  it('every typicallyFollowedBy reference resolves to a valid FacetKey', () => {
    for (const facet of getAllFacets()) {
      for (const ref of facet.typicallyFollowedBy) {
        expect(VALID_FACET_KEYS.has(ref)).toBe(true);
        if (!VALID_FACET_KEYS.has(ref)) {
          throw new Error(`${facet.key}.typicallyFollowedBy contains invalid key: ${ref}`);
        }
      }
    }
  });
});

// ─── Type guards and key utilities ───────────────────────────────────────

describe('isFacetKey', () => {
  it('returns true for every valid FacetKey', () => {
    for (const key of VALID_FACET_KEYS) {
      expect(isFacetKey(key)).toBe(true);
    }
  });

  it('returns false for legacy singleton "aether"', () => {
    expect(isFacetKey('aether')).toBe(false);
  });

  it('returns false for arbitrary strings', () => {
    expect(isFacetKey('fire')).toBe(false);
    expect(isFacetKey('earth_4')).toBe(false);
    expect(isFacetKey('')).toBe(false);
    expect(isFacetKey('FIRE_1')).toBe(false);
  });
});

describe('VALID_FACET_KEYS', () => {
  it('contains exactly 15 entries', () => {
    expect(VALID_FACET_KEYS.size).toBe(15);
  });

  it('does not contain legacy "aether"', () => {
    expect(VALID_FACET_KEYS.has('aether')).toBe(false);
  });
});

// ─── Legacy normalization ─────────────────────────────────────────────────

describe('normalizeLegacyFacetKey', () => {
  it('returns valid FacetKey unchanged', () => {
    expect(normalizeLegacyFacetKey('fire_1')).toBe('fire_1');
    expect(normalizeLegacyFacetKey('aether_2')).toBe('aether_2');
  });

  it('returns LEGACY_AETHER_SENTINEL for legacy singleton "aether"', () => {
    expect(normalizeLegacyFacetKey('aether')).toBe(LEGACY_AETHER_SENTINEL);
    expect(normalizeLegacyFacetKey('aether')).toBe('aether_legacy');
  });

  it('returns LEGACY_AETHER_SENTINEL for unknown strings', () => {
    expect(normalizeLegacyFacetKey('unknown')).toBe(LEGACY_AETHER_SENTINEL);
    expect(normalizeLegacyFacetKey('')).toBe(LEGACY_AETHER_SENTINEL);
  });

  it('normalizes element-only strings (fire, water, earth, air) to phase 1', () => {
    expect(normalizeLegacyFacetKey('fire')).toBe('fire_1');
    expect(normalizeLegacyFacetKey('water')).toBe('water_1');
    expect(normalizeLegacyFacetKey('earth')).toBe('earth_1');
    expect(normalizeLegacyFacetKey('air')).toBe('air_1');
  });
});

describe('coerceLegacyFacetKey', () => {
  it('returns valid FacetKey unchanged', () => {
    expect(coerceLegacyFacetKey('earth_3')).toBe('earth_3');
  });

  it('coerces legacy "aether" to aether_1 by default', () => {
    expect(coerceLegacyFacetKey('aether')).toBe('aether_1');
  });

  it('coerces legacy "aether" to custom fallback when provided', () => {
    expect(coerceLegacyFacetKey('aether', 'water_1')).toBe('water_1');
  });

  it('always returns a valid FacetKey', () => {
    const inputs = ['aether', 'unknown', '', 'FIRE_1', 'fire', 'fire_1'];
    for (const input of inputs) {
      const result = coerceLegacyFacetKey(input);
      expect(isFacetKey(result)).toBe(true);
    }
  });
});

// ─── Registry helpers ─────────────────────────────────────────────────────

describe('getRingFacets', () => {
  it('returns 12 facets', () => {
    expect(getRingFacets()).toHaveLength(12);
  });

  it('contains no Aether facets', () => {
    for (const f of getRingFacets()) {
      expect(f.element).not.toBe('aether');
    }
  });
});

describe('getCenterFacets', () => {
  it('returns 3 facets', () => {
    expect(getCenterFacets()).toHaveLength(3);
  });

  it('contains only Aether facets', () => {
    for (const f of getCenterFacets()) {
      expect(f.element).toBe('aether');
    }
  });
});

// ─── Scoring helpers ──────────────────────────────────────────────────────

describe('scoreFacetMatch', () => {
  it('returns > 0 when text contains a typical marker', () => {
    expect(scoreFacetMatch('I have a vision calling me forward', 'fire_1')).toBeGreaterThan(0);
  });

  it('returns 0 when text contains no markers for that facet', () => {
    expect(scoreFacetMatch('nothing related here', 'fire_1')).toBe(0);
  });

  it('returns value in [0, 1]', () => {
    const score = scoreFacetMatch('vision spark inspiration calling passion dream', 'fire_1');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('scoreValence', () => {
  it('returns null when no valence signals match', () => {
    expect(scoreValence('completely unrelated text', 'fire_1')).toBeNull();
  });

  it('returns positive for coherent signal language', () => {
    const result = scoreValence('clear sense of calling direction emerging naturally', 'fire_1');
    expect(result).toBe('positive');
  });

  it('returns negative for shadow/constricted signal language', () => {
    const result = scoreValence('grandiose certainty urgency this will change everything', 'fire_1');
    expect(result).toBe('negative');
  });
});
