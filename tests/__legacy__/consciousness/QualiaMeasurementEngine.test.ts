/**
 * QUALIA MEASUREMENT ENGINE TESTS
 *
 * Comprehensive test suite for consciousness measurement system
 * Tests QRI Symmetry Theory of Valence implementation
 */

import {
  QualiaMeasurementEngine,
  SymmetryCalculator,
  ValenceMeasurer,
  AINSophMapper,
  ConsciousnessDimensions,
  QualiaInput,
  QualiaState
} from '../QualiaMeasurementEngine';

describe('QualiaMeasurementEngine', () => {
  let engine: QualiaMeasurementEngine;

  beforeEach(() => {
    engine = new QualiaMeasurementEngine();
  });

  describe('Consciousness Dimensions', () => {
    it('should capture all 6 dimensions within valid range [0,1]', async () => {
      const input: QualiaInput = {
        dimensions: {
          clarity: 0.8,
          energy: 0.7,
          connection: 0.6,
          expansion: 0.5,
          presence: 0.9,
          flow: 0.75
        },
        description: 'Clear and present',
        insights: [],
        symbols: [],
        texture: { sensory: [], emotional: [], cognitive: [], somatic: [] },
        context: {
          practice: 'meditation',
          duration: 1800,
          intention: 'Open awareness',
          setting: 'solo',
          userId: 'test-user-123'
        },
        timestamp: new Date()
      };

      const result = await engine.captureQualiaState(input, 'test-user-123');

      expect(result.dimensions.clarity).toBe(0.8);
      expect(result.dimensions.energy).toBe(0.7);
      expect(result.dimensions.connection).toBe(0.6);
      expect(result.dimensions.expansion).toBe(0.5);
      expect(result.dimensions.presence).toBe(0.9);
      expect(result.dimensions.flow).toBe(0.75);

      // All dimensions should be in valid range
      Object.values(result.dimensions).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    it('should calculate overall state from dimensions', async () => {
      const dimensions: ConsciousnessDimensions = {
        clarity: 0.8,
        energy: 0.8,
        connection: 0.8,
        expansion: 0.8,
        presence: 0.8,
        flow: 0.8
      };

      const input: QualiaInput = {
        dimensions,
        description: 'High state',
        insights: [],
        symbols: [],
        texture: { sensory: [], emotional: [], cognitive: [], somatic: [] },
        context: {
          practice: 'meditation',
          duration: 1800,
          intention: '',
          setting: 'solo',
          userId: 'test-user-123'
        },
        timestamp: new Date()
      };

      const result = await engine.captureQualiaState(input, 'test-user-123');

      // High balanced state should have high symmetry
      expect(result.symmetry.global).toBeGreaterThan(0.7);
    });
  });

  describe('Symmetry Theory of Valence (QRI)', () => {
    let calculator: SymmetryCalculator;

    beforeEach(() => {
      calculator = new SymmetryCalculator();
    });

    it('should calculate global symmetry correctly', () => {
      const dimensions: ConsciousnessDimensions = {
        clarity: 0.5,
        energy: 0.5,
        connection: 0.5,
        expansion: 0.5,
        presence: 0.5,
        flow: 0.5
      };

      const symmetry = calculator.calculateGlobalSymmetry(dimensions);

      // Perfect balance should have high symmetry
      expect(symmetry).toBeCloseTo(1.0, 1);
    });

    it('should detect asymmetry in unbalanced states', () => {
      const asymmetricDimensions: ConsciousnessDimensions = {
        clarity: 0.9,
        energy: 0.1,
        connection: 0.9,
        expansion: 0.1,
        presence: 0.9,
        flow: 0.1
      };

      const symmetry = calculator.calculateGlobalSymmetry(asymmetricDimensions);

      // Highly unbalanced state should have lower symmetry
      expect(symmetry).toBeLessThan(0.5);
    });

    it('should calculate harmonic relationships', () => {
      const dimensions: ConsciousnessDimensions = {
        clarity: 0.5,
        energy: 0.667, // 2/3 ratio
        connection: 0.75, // 3/4 ratio
        expansion: 0.5,
        presence: 0.5,
        flow: 0.5
      };

      const harmonics = calculator.calculateHarmonics(dimensions);

      expect(harmonics).toContain(0.5);
      expect(harmonics).toContain(0.667);
      expect(harmonics).toContain(0.75);
      expect(harmonics.length).toBeGreaterThan(0);
    });

    it('should measure fractality (self-similarity)', () => {
      const highSymmetryDims: ConsciousnessDimensions = {
        clarity: 0.8,
        energy: 0.8,
        connection: 0.8,
        expansion: 0.8,
        presence: 0.8,
        flow: 0.8
      };

      const fractality = calculator.calculateFractality(highSymmetryDims);

      // High symmetry should correlate with high fractality
      expect(fractality).toBeGreaterThan(0.7);
    });

    it('should validate STV hypothesis: symmetry correlates with positive valence', async () => {
      // High symmetry state
      const highSymmetryInput: QualiaInput = {
        dimensions: {
          clarity: 0.8,
          energy: 0.8,
          connection: 0.8,
          expansion: 0.8,
          presence: 0.8,
          flow: 0.8
        },
        description: 'Blissful state',
        insights: [],
        symbols: [],
        texture: { sensory: [], emotional: [], cognitive: [], somatic: [] },
        context: {
          practice: 'meditation',
          duration: 1800,
          intention: '',
          setting: 'solo',
          userId: 'test-user-123'
        },
        timestamp: new Date()
      };

      const highSymmetryResult = await engine.captureQualiaState(highSymmetryInput, 'test-user-123');

      // Low symmetry state
      const lowSymmetryInput: QualiaInput = {
        dimensions: {
          clarity: 0.2,
          energy: 0.9,
          connection: 0.1,
          expansion: 0.8,
          presence: 0.3,
          flow: 0.1
        },
        description: 'Chaotic state',
        insights: [],
        symbols: [],
        texture: { sensory: [], emotional: [], cognitive: [], somatic: [] },
        context: {
          practice: 'meditation',
          duration: 1800,
          intention: '',
          setting: 'solo',
          userId: 'test-user-123'
        },
        timestamp: new Date()
      };

      const lowSymmetryResult = await engine.captureQualiaState(lowSymmetryInput, 'test-user-123');

      // STV hypothesis: Higher symmetry → More positive valence
      expect(highSymmetryResult.symmetry.global).toBeGreaterThan(lowSymmetryResult.symmetry.global);
      expect(highSymmetryResult.valence.value).toBeGreaterThan(lowSymmetryResult.valence.value);
    });
  });

  describe('Valence Measurement', () => {
    let measurer: ValenceMeasurer;

    beforeEach(() => {
      measurer = new ValenceMeasurer();
    });

    it('should calculate valence from dimensions', () => {
      const positiveDimensions: ConsciousnessDimensions = {
        clarity: 0.9,
        energy: 0.8,
        connection: 0.9,
        expansion: 0.8,
        presence: 0.9,
        flow: 0.8
      };

      const valence = measurer.calculateValence(positiveDimensions, 0.85);

      // High dimensions + high symmetry → positive valence
      expect(valence.value).toBeGreaterThan(0);
      expect(valence.intensity).toBeGreaterThan(0.5);
    });

    it('should handle negative valence for low dimensions', () => {
      const negativeDimensions: ConsciousnessDimensions = {
        clarity: 0.2,
        energy: 0.2,
        connection: 0.2,
        expansion: 0.2,
        presence: 0.2,
        flow: 0.2
      };

      const valence = measurer.calculateValence(negativeDimensions, 0.3);

      // Low dimensions + low symmetry → negative valence
      expect(valence.value).toBeLessThan(0);
    });

    it('should calculate valence intensity', () => {
      const extremeDimensions: ConsciousnessDimensions = {
        clarity: 1.0,
        energy: 1.0,
        connection: 1.0,
        expansion: 1.0,
        presence: 1.0,
        flow: 1.0
      };

      const valence = measurer.calculateValence(extremeDimensions, 1.0);

      // Extreme state should have high intensity
      expect(valence.intensity).toBeGreaterThan(0.8);
    });

    it('should link valence symmetry to global symmetry', () => {
      const dimensions: ConsciousnessDimensions = {
        clarity: 0.7,
        energy: 0.7,
        connection: 0.7,
        expansion: 0.7,
        presence: 0.7,
        flow: 0.7
      };

      const globalSymmetry = 0.85;
      const valence = measurer.calculateValence(dimensions, globalSymmetry);

      // Valence symmetry should match global symmetry
      expect(valence.symmetry).toBeCloseTo(globalSymmetry, 1);
    });
  });

  describe('AIN Soph Mapping', () => {
    let mapper: AINSophMapper;

    beforeEach(() => {
      mapper = new AINSophMapper();
    });

    it('should map dimensions to elements', () => {
      const dimensions: ConsciousnessDimensions = {
        clarity: 0.9, // Air
        energy: 0.8, // Fire
        connection: 0.7, // Water
        expansion: 0.6,
        presence: 0.8, // Earth
        flow: 0.7
      };

      const mapping = mapper.mapToAINSoph(dimensions, 0.8);

      // Elements should sum to ~1
      const elementSum =
        mapping.elements.earth +
        mapping.elements.water +
        mapping.elements.air +
        mapping.elements.fire;

      expect(elementSum).toBeCloseTo(1, 1);

      // High clarity → High air
      expect(mapping.elements.air).toBeGreaterThan(0.2);

      // High energy → High fire
      expect(mapping.elements.fire).toBeGreaterThan(0.2);
    });

    it('should determine alchemical phase from valence', () => {
      const highValenceDims: ConsciousnessDimensions = {
        clarity: 0.9,
        energy: 0.9,
        connection: 0.9,
        expansion: 0.9,
        presence: 0.9,
        flow: 0.9
      };

      const mapping = mapper.mapToAINSoph(highValenceDims, 0.9);

      // High positive state → Rubedo (integration) or Citrinitas (illumination)
      expect(['citrinitas', 'rubedo']).toContain(mapping.currentPhase);
    });

    it('should identify activated sefirot', () => {
      const highClarityDims: ConsciousnessDimensions = {
        clarity: 0.95,
        energy: 0.5,
        connection: 0.5,
        expansion: 0.5,
        presence: 0.5,
        flow: 0.5
      };

      const mapping = mapper.mapToAINSoph(highClarityDims, 0.7);

      // High clarity should activate Chokhmah (wisdom) or Binah (understanding)
      const activated = mapping.activatedSefirot;
      expect(activated.length).toBeGreaterThan(0);
      expect(activated.some(s => s === 'chokhmah' || s === 'binah')).toBe(true);
    });
  });

  describe('Full Qualia State Capture', () => {
    it('should capture complete qualia state with all components', async () => {
      const input: QualiaInput = {
        dimensions: {
          clarity: 0.8,
          energy: 0.7,
          connection: 0.9,
          expansion: 0.75,
          presence: 0.85,
          flow: 0.8
        },
        description: 'Deep meditation with clear awareness and strong presence',
        insights: [
          'Realized the impermanent nature of thoughts',
          'Felt deep connection to breath'
        ],
        symbols: ['ocean', 'light', 'spiral'],
        texture: {
          sensory: ['visual', 'kinesthetic'],
          emotional: ['peace', 'joy', 'gratitude'],
          cognitive: ['clarity', 'insight', 'metacognition'],
          somatic: ['warmth', 'energy', 'lightness']
        },
        context: {
          practice: 'meditation',
          duration: 3600,
          intention: 'Cultivate awareness and compassion',
          setting: 'retreat',
          substances: [],
          userId: 'test-user-123'
        },
        timestamp: new Date()
      };

      const result = await engine.captureQualiaState(input, 'test-user-123');

      // Verify all components present
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.duration).toBe(3600);

      // Dimensions
      expect(result.dimensions).toEqual(input.dimensions);

      // Valence
      expect(result.valence.value).toBeGreaterThanOrEqual(-1);
      expect(result.valence.value).toBeLessThanOrEqual(1);
      expect(result.valence.intensity).toBeGreaterThanOrEqual(0);
      expect(result.valence.intensity).toBeLessThanOrEqual(1);

      // Symmetry
      expect(result.symmetry.global).toBeGreaterThanOrEqual(0);
      expect(result.symmetry.global).toBeLessThanOrEqual(1);
      expect(result.symmetry.harmonics.length).toBeGreaterThan(0);

      // Phenomenology
      expect(result.description).toBe(input.description);
      expect(result.insights).toEqual(input.insights);
      expect(result.symbols).toEqual(input.symbols);
      expect(result.texture).toEqual(input.texture);

      // AIN Soph
      expect(result.ainSophMapping.elements).toBeDefined();
      expect(result.ainSophMapping.currentPhase).toBeDefined();
      expect(result.ainSophMapping.activatedSefirot.length).toBeGreaterThan(0);

      // Context
      expect(result.context).toEqual(input.context);
    });

    it('should handle minimal input gracefully', async () => {
      const minimalInput: QualiaInput = {
        dimensions: {
          clarity: 0.5,
          energy: 0.5,
          connection: 0.5,
          expansion: 0.5,
          presence: 0.5,
          flow: 0.5
        },
        description: '',
        insights: [],
        symbols: [],
        texture: { sensory: [], emotional: [], cognitive: [], somatic: [] },
        context: {
          practice: 'daily-life',
          duration: 0,
          intention: '',
          setting: 'solo',
          userId: 'test-user-123'
        },
        timestamp: new Date()
      };

      const result = await engine.captureQualiaState(minimalInput, 'test-user-123');

      // Should still produce valid output
      expect(result).toBeDefined();
      expect(result.valence).toBeDefined();
      expect(result.symmetry).toBeDefined();
      expect(result.ainSophMapping).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all dimensions at 0', async () => {
      const zeroDimensions: ConsciousnessDimensions = {
        clarity: 0,
        energy: 0,
        connection: 0,
        expansion: 0,
        presence: 0,
        flow: 0
      };

      const input: QualiaInput = {
        dimensions: zeroDimensions,
        description: 'Extreme low state',
        insights: [],
        symbols: [],
        texture: { sensory: [], emotional: [], cognitive: [], somatic: [] },
        context: {
          practice: 'meditation',
          duration: 600,
          intention: '',
          setting: 'solo',
          userId: 'test-user-123'
        },
        timestamp: new Date()
      };

      const result = await engine.captureQualiaState(input, 'test-user-123');

      // Should produce valid state even with zeros
      expect(result.valence.value).toBeLessThan(0);
      expect(result.symmetry.global).toBeDefined();
    });

    it('should handle all dimensions at 1', async () => {
      const maxDimensions: ConsciousnessDimensions = {
        clarity: 1,
        energy: 1,
        connection: 1,
        expansion: 1,
        presence: 1,
        flow: 1
      };

      const input: QualiaInput = {
        dimensions: maxDimensions,
        description: 'Peak experience',
        insights: [],
        symbols: [],
        texture: { sensory: [], emotional: [], cognitive: [], somatic: [] },
        context: {
          practice: 'meditation',
          duration: 7200,
          intention: '',
          setting: 'retreat',
          userId: 'test-user-123'
        },
        timestamp: new Date()
      };

      const result = await engine.captureQualiaState(input, 'test-user-123');

      // Should produce valid peak state
      expect(result.valence.value).toBeGreaterThan(0.5);
      expect(result.symmetry.global).toBeGreaterThan(0.8);
    });

    it('should handle timestamps correctly', async () => {
      const now = new Date();
      const input: QualiaInput = {
        dimensions: {
          clarity: 0.7,
          energy: 0.7,
          connection: 0.7,
          expansion: 0.7,
          presence: 0.7,
          flow: 0.7
        },
        description: '',
        insights: [],
        symbols: [],
        texture: { sensory: [], emotional: [], cognitive: [], somatic: [] },
        context: {
          practice: 'meditation',
          duration: 1800,
          intention: '',
          setting: 'solo',
          userId: 'test-user-123'
        },
        timestamp: now
      };

      const result = await engine.captureQualiaState(input, 'test-user-123');

      expect(result.timestamp).toEqual(now);
    });
  });

  describe('Statistical Validation', () => {
    it('should maintain consistent symmetry calculation across multiple calls', () => {
      const calculator = new SymmetryCalculator();
      const dimensions: ConsciousnessDimensions = {
        clarity: 0.75,
        energy: 0.75,
        connection: 0.75,
        expansion: 0.75,
        presence: 0.75,
        flow: 0.75
      };

      const results: number[] = [];
      for (let i = 0; i < 100; i++) {
        results.push(calculator.calculateGlobalSymmetry(dimensions));
      }

      // All results should be identical (deterministic)
      const first = results[0];
      expect(results.every(r => r === first)).toBe(true);
    });

    it('should show monotonic relationship: higher balance → higher symmetry', () => {
      const calculator = new SymmetryCalculator();

      const testCases = [
        { clarity: 0.2, energy: 0.8, connection: 0.3, expansion: 0.7, presence: 0.4, flow: 0.6 },
        { clarity: 0.4, energy: 0.6, connection: 0.4, expansion: 0.6, presence: 0.4, flow: 0.6 },
        { clarity: 0.5, energy: 0.5, connection: 0.5, expansion: 0.5, presence: 0.5, flow: 0.5 }
      ];

      const symmetries = testCases.map(dims => calculator.calculateGlobalSymmetry(dims));

      // More balanced states should have higher symmetry
      expect(symmetries[2]).toBeGreaterThan(symmetries[1]);
      expect(symmetries[1]).toBeGreaterThan(symmetries[0]);
    });
  });
});

/**
 * Integration tests with holographic field
 */
describe('QualiaMeasurementEngine Integration', () => {
  it('should integrate with holographic field state', async () => {
    const engine = new QualiaMeasurementEngine();

    const input: QualiaInput = {
      dimensions: {
        clarity: 0.8,
        energy: 0.7,
        connection: 0.9,
        expansion: 0.75,
        presence: 0.85,
        flow: 0.8
      },
      description: 'Connected to field',
      insights: [],
      symbols: [],
      texture: { sensory: [], emotional: [], cognitive: [], somatic: [] },
      context: {
        practice: 'meditation',
        duration: 1800,
        intention: '',
        setting: 'group',
        userId: 'test-user-123'
      },
      timestamp: new Date()
    };

    // Mock collective field state
    const mockFieldState = {
      coherence: 0.7,
      dimensions: {
        clarity: 0.75,
        energy: 0.7,
        connection: 0.85,
        expansion: 0.7,
        presence: 0.8,
        flow: 0.75
      }
    };

    const result = await engine.captureQualiaState(input, 'test-user-123', mockFieldState);

    // Result should reflect field influence
    expect(result).toBeDefined();
    expect(result.dimensions.connection).toBeCloseTo(0.9, 1);
  });
});
