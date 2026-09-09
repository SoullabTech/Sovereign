/**
 * FIELD-TRUTH-01 — fabricated elemental identity is contained.
 *
 * The census established a concrete reachable path:
 *
 *   PFI fails → failure swallowed → Unified still runs → missing PFI element
 *   becomes "earth" → one-hot Earth prescription → an Earth identity reaches
 *   cognition as though something observed it.
 *
 * ⭐⭐ When a prerequisite is absent, downstream intelligence becomes
 *     UNAVAILABLE — not generic. Absence of an elemental reading is not Earth.
 *
 * ⛔ These tests do NOT cover the remaining fabricated inputs on the Unified leg
 * (0 / 0.5 / 'normal' / 'stable'). Those are separately owed and deliberately
 * out of scope, as is the turn-count intimacy defect in Resonance.
 */

import { buildFieldContext, formatFieldAddendum, getFieldTruthCounters } from '../fieldOrchestrator';

const mockPfi = jest.fn();
jest.mock('../../sovereign/pfiMindEntrypoint', () => ({
  generatePFIMindState: (...a: unknown[]) => mockPfi(...a),
}));

const mockGenerateField = jest.fn();
jest.mock('../../maia/resonance-field-system', () => ({
  ResonanceFieldGenerator: class {
    generateField(...a: unknown[]) { return mockGenerateField(...a); }
  },
}));

const mockCalc = jest.fn();
jest.mock('../../consciousness/field/UnifiedElementalFieldCalculator', () => ({
  UnifiedElementalFieldCalculator: {
    calculateUnifiedElementalField: (...a: unknown[]) => mockCalc(...a),
    getFieldHealthSummary: () => ({
      dominantElement: 'earth', coherenceLevel: 'moderate', emergenceIndicators: [],
    }),
    calculateElementalInterference: () => ({
      fireWater: 0, fireAir: 0, waterEarth: 0, earthAir: 0, allToAether: 0,
    }),
  },
}));

const RESONANCE = { elements: { fire: 0.2 }, wordDensity: 1, silenceProbability: 0, fragmentationRate: 0 };
const UNIFIED_STATE = {
  fireResonance: { fireElementBalance: 0.5 }, waterResonance: { waterElementBalance: 0.5 },
  earthResonance: { earthElementBalance: 0.9 }, airResonance: { airElementBalance: 0.5 },
  aetherResonance: { aetherElementBalance: 0.5 },
};


/**
 * RESONANCE-TRUTH makes `resonance.intimacy` PERMANENTLY unavailable — there is
 * no lawful intimacy signal, and the turn-count derivation is gone. So the
 * receipt is never empty, and "no unavailability" must be stated precisely:
 * no PFI, Unified or elemental absence — not "nothing at all".
 */
const absencesExcludingStructural = (ctx: any) =>
  (ctx?.unavailability ?? []).filter((u: any) =>
    !u.id.startsWith('resonance.'));

const args = (over: Record<string, unknown> = {}) => ({
  memberId: 'm1', sessionId: 's1', isSanctuary: false,
  depth: 6,                     // past both gates: resonance 3+, unified 4+
  text: 'a passage I am working on', ...over,
});

beforeEach(() => {
  mockPfi.mockReset(); mockGenerateField.mockReset(); mockCalc.mockReset();
  mockGenerateField.mockReturnValue(RESONANCE);
  mockCalc.mockReturnValue(UNIFIED_STATE);
});

describe('PFI unavailable — the defect the census found', () => {
  it('does NOT run Unified when PFI failed', async () => {
    mockPfi.mockRejectedValue(new Error('engine down'));
    const ctx = await buildFieldContext(args());
    expect(mockCalc).not.toHaveBeenCalled();
    expect(ctx!.unified).toBeUndefined();
  });

  it('never yields dominantElement "earth" from a failed PFI', async () => {
    mockPfi.mockRejectedValue(new Error('engine down'));
    const ctx = await buildFieldContext(args());
    expect(ctx!.unified?.dominantElement).toBeUndefined();
    expect(JSON.stringify(ctx)).not.toMatch(/dominantElement/);
  });

  it('records the absence with its reason rather than losing it', async () => {
    mockPfi.mockRejectedValue(new Error('engine down'));
    const ctx = await buildFieldContext(args());
    expect(ctx!.unavailability).toEqual(
      expect.arrayContaining([
        { id: 'pfi', reason: 'PFI engine failed or timed out' },
        { id: 'unified', reason: 'PFI prerequisite unavailable' },
      ]),
    );
  });

  it('does not list unified as a source it drew on', async () => {
    mockPfi.mockRejectedValue(new Error('engine down'));
    const ctx = await buildFieldContext(args());
    expect(ctx!.meta.sources).not.toContain('unified');
    expect(ctx!.meta.sources).not.toContain('pfi');
  });

  it('counts the failure, so frequency stops being unmeasurable', async () => {
    const before = getFieldTruthCounters();
    mockPfi.mockRejectedValue(new Error('engine down'));
    await buildFieldContext(args());
    const after = getFieldTruthCounters();
    expect(after.pfiFailures).toBe(before.pfiFailures + 1);
    expect(after.unifiedSkippedNoPfi).toBe(before.unifiedSkippedNoPfi + 1);
  });

  it('leaves the legs that do not depend on PFI intact', async () => {
    mockPfi.mockRejectedValue(new Error('engine down'));
    const ctx = await buildFieldContext(args());
    expect(ctx!.resonance).toBeDefined();
    expect(ctx!.meta.sources).toContain('resonance');
  });
});

describe('the absence is evidence for the receipt, never content for cognition', () => {
  it('strips unavailability from the prompt addendum', async () => {
    mockPfi.mockRejectedValue(new Error('engine down'));
    const ctx = await buildFieldContext(args());
    const addendum = formatFieldAddendum(ctx);
    expect(ctx!.unavailability).toBeDefined();
    expect(addendum).not.toMatch(/unavailab/i);
    expect(addendum).not.toMatch(/prerequisite/i);
  });

  it('adds nothing to an addendum when everything is available', async () => {
    mockPfi.mockResolvedValue({
      elementalDominance: 'water', coherenceLevel: 0.6, fieldWorkSafe: true,
      realm: 'personal', deepWorkRecommended: false,
    });
    const ctx = await buildFieldContext(args());
    expect(absencesExcludingStructural(ctx)).toEqual([]);
    expect(formatFieldAddendum(ctx)).toContain('[Field Intelligence]');
  });
});

describe('PFI available — the existing partial path is unchanged', () => {
  beforeEach(() => {
    mockPfi.mockResolvedValue({
      elementalDominance: 'Water', coherenceLevel: 0.6, fieldWorkSafe: true,
      realm: 'personal', deepWorkRecommended: true,
    });
  });

  it('still runs Unified', async () => {
    const ctx = await buildFieldContext(args());
    expect(mockCalc).toHaveBeenCalled();
    expect(ctx!.unified).toBeDefined();
    expect(ctx!.meta.sources).toEqual(expect.arrayContaining(['pfi', 'unified']));
  });

  it('derives the elemental prescription from the OBSERVED element, not a default', async () => {
    await buildFieldContext(args());
    const systems = mockCalc.mock.calls[0][0] as Record<string, any>;
    expect(systems.unifiedIntelligence.elementalPrescription.water).toBeGreaterThan(0.5);
    expect(systems.unifiedIntelligence.elementalPrescription.earth).toBeLessThan(0.5);
    expect(systems.affectDetector.archetypalRouting).toBe('Water');
  });

  it('records no PFI, Unified or elemental absence', async () => {
    const ctx = await buildFieldContext(args());
    expect(absencesExcludingStructural(ctx)).toEqual([]);
  });
});

describe('scope — what FIELD-TRUTH-01 deliberately did not touch', () => {
  it('leaves the other fabricated Unified inputs in place, separately owed', async () => {
    mockPfi.mockResolvedValue({
      elementalDominance: 'fire', coherenceLevel: 0.5, fieldWorkSafe: true,
      realm: 'personal', deepWorkRecommended: false,
    });
    await buildFieldContext(args());
    const systems = mockCalc.mock.calls[0][0] as Record<string, any>;
    // Pinned as a standing debt, NOT as approval: these are still fabricated,
    // and this test exists so removing them is a visible decision later.
    expect(systems.somaticResponse.windowOfTolerance).toBe(0.5);
    expect(systems.masterConsciousness.unifiedFieldStrength).toBe(0);
    expect(systems.advancedConsciousnessDetection.fieldQuality).toBe('normal');
    expect(systems.consciousnessLevelDetector.coherenceTrend).toBe('stable');
  });

  it('leaves Sanctuary meta-only behaviour untouched', async () => {
    const ctx = await buildFieldContext(args({ isSanctuary: true }));
    expect(ctx!.pfi).toBeUndefined();
    expect(ctx!.resonance).toBeUndefined();
    expect(ctx!.unified).toBeUndefined();
    expect(mockPfi).not.toHaveBeenCalled();
  });
});

/**
 * FIELD-TRUTH-03 — PFI honours absence.
 *
 *   A fallback may preserve operational posture.
 *   It may not manufacture observational content.
 *
 *   Honest absence must survive the entire derivation chain.
 */
describe('FIELD-TRUTH-03 · a returned PFI object is not evidence', () => {
  it('declines Unified when PFI returned a fallback posture rather than observation', async () => {
    mockPfi.mockResolvedValue({
      source: 'fallback',                 // returns, does NOT throw
      elementalDominance: undefined,
      coherenceLevel: 0.5, resonanceIndex: 0.5,
      fieldWorkSafe: false, realm: 'MIDDLEWORLD', deepWorkRecommended: false,
    });
    const ctx = await buildFieldContext(args());
    expect(mockCalc).not.toHaveBeenCalled();
    expect(ctx!.unified).toBeUndefined();
    expect(ctx!.unavailability).toEqual(expect.arrayContaining([
      { id: 'pfi.evidence', reason: 'PFI returned a fallback operational posture, not observation' },
      { id: 'unified', reason: 'PFI returned operational posture, not evidence' },
    ]));
  });

  it('keeps the conservative POSTURE while refusing it as evidence', async () => {
    mockPfi.mockResolvedValue({
      source: 'fallback', elementalDominance: undefined,
      fieldWorkSafe: false, realm: 'MIDDLEWORLD', deepWorkRecommended: false,
      coherenceLevel: 0.5, resonanceIndex: 0.5,
    });
    const ctx = await buildFieldContext(args());
    // the posture survives — "in uncertainty, use the careful operating stance"
    expect(ctx!.pfi?.fieldWorkSafe).toBe(false);
    expect(ctx!.pfi?.realm).toBe('MIDDLEWORLD');
    // but no element is asserted, and nothing derives from it
    expect(ctx!.pfi?.element).toBeUndefined();
    expect(ctx!.unified).toBeUndefined();
  });

  it('declines Unified when PFI ran but no elemental signal reached it', async () => {
    mockPfi.mockResolvedValue({
      source: 'pfi_legacy', elementalDominance: undefined,   // FIELD-TRUTH-02 upstream absence
      coherenceLevel: 0.4, fieldWorkSafe: true, realm: 'MIDDLEWORLD', deepWorkRecommended: false,
    });
    const ctx = await buildFieldContext(args());
    expect(mockCalc).not.toHaveBeenCalled();
    expect(ctx!.unavailability).toEqual(expect.arrayContaining([
      { id: 'pfi.elementalDominance', reason: 'no elemental signal reached PFI' },
      { id: 'unified', reason: 'no elemental signal to derive from' },
    ]));
  });

  it('THE CHAIN: absence at the Elemental Oracle now survives all the way down', async () => {
    // This is the case the lineage census found still fabricating: FIELD-TRUTH-02
    // produced undefined, normalizeElement turned it back into Earth, PFI succeeded,
    // and Unified emitted dominantElement: 'earth'.
    mockPfi.mockResolvedValue({
      source: 'pfi_legacy', elementalDominance: undefined,
      coherenceLevel: 0.4, fieldWorkSafe: true, realm: 'MIDDLEWORLD', deepWorkRecommended: false,
    });
    const ctx = await buildFieldContext(args());
    expect(JSON.stringify(ctx)).not.toMatch(/earth/i);
  });

  it('still runs Unified for an evidence-bearing PFI with a real element', async () => {
    mockPfi.mockResolvedValue({
      source: 'pfi_legacy', elementalDominance: 'Water',
      coherenceLevel: 0.7, fieldWorkSafe: true, realm: 'MIDDLEWORLD', deepWorkRecommended: true,
    });
    const ctx = await buildFieldContext(args());
    expect(mockCalc).toHaveBeenCalled();
    expect(ctx!.unified).toBeDefined();
    expect(absencesExcludingStructural(ctx)).toEqual([]);
  });

  it('counts the states separately, so none can masquerade as another', async () => {
    const before = getFieldTruthCounters();
    mockPfi.mockResolvedValue({ source: 'fallback', elementalDominance: undefined,
      fieldWorkSafe: false, realm: 'MIDDLEWORLD', deepWorkRecommended: false });
    await buildFieldContext(args());
    mockPfi.mockRejectedValue(new Error('down'));
    await buildFieldContext(args());
    const after = getFieldTruthCounters();
    expect(after.pfiFallbackPosture).toBe(before.pfiFallbackPosture + 1);
    expect(after.pfiFailures).toBe(before.pfiFailures + 1);
    expect(after.pfiNoElement).toBe(before.pfiNoElement + 1);
    expect(after.unifiedSkippedNoPfi).toBe(before.unifiedSkippedNoPfi + 2);
  });
});
