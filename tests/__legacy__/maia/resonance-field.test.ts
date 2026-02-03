/**
 * Resonance Field System Tests
 * Demonstrates emergence patterns and validates atmospheric constraints
 */

import ResonanceFieldGenerator, {
  ResonanceField,
  ResponsePalette,
  ProbabilityCascade
} from '../resonance-field-system';
import AdaptiveResonanceSystem from '../adaptive-resonance-system';

describe('Resonance Field System', () => {
  describe('Probability Cascade', () => {
    it('should shift from Air to Earth as intimacy deepens', () => {
      // Early conversation
      const early = ProbabilityCascade.calculateElementalWeights(5, 0.2, 'exploring');
      expect(early.air).toBeGreaterThan(early.earth);
      expect(early.air).toBeGreaterThan(0.4);

      // Deep conversation
      const deep = ProbabilityCascade.calculateElementalWeights(30, 0.8, 'intimate');
      expect(deep.earth).toBeGreaterThan(deep.air);
      expect(deep.earth).toBeGreaterThan(0.5);
    });

    it('should spike Fire during crisis', () => {
      const crisis = ProbabilityCascade.calculateElementalWeights(15, 0.5, 'crisis');
      expect(crisis.fire).toBeGreaterThan(0.6);
      expect(crisis.fire).toBeGreaterThan(crisis.earth + crisis.water + crisis.air);
    });

    it('should elevate Water during emotional deepening', () => {
      const deepening = ProbabilityCascade.calculateElementalWeights(20, 0.5, 'emotional');
      expect(deepening.water).toBeGreaterThan(0.3);
    });
  });

  describe('Response Palette Constraints', () => {
    it('should only allow minimal responses in Earth-heavy field', () => {
      const earthField: ResonanceField = {
        elements: { earth: 0.7, water: 0.1, air: 0.1, fire: 0.1 },
        consciousness: { conscious: 0.2, unconscious: 0.4, higherSelf: 0.3, lowerSelf: 0.1 },
        hemispheres: { leftBrain: 0.3, rightBrain: 0.7 },
        wordDensity: 0.3,
        silenceProbability: 0.7,
        fragmentationRate: 0.2,
        responseLatency: 3000,
        pauseDuration: 2500,
        intimacyLevel: 0.8,
        exchangeCount: 35
      };

      const palette = ResponsePalette.getConstrainedResponses(earthField);

      // Should mostly be minimal responses
      const minimalResponses = palette.filter(r =>
        r === null || r.length <= 5
      );
      expect(minimalResponses.length).toBeGreaterThan(palette.length * 0.7);

      // Should not contain elaborate responses
      expect(palette.every(r => !r || r.length < 20)).toBe(true);
    });

    it('should allow flowing responses in Water-heavy field', () => {
      const waterField: ResonanceField = {
        elements: { earth: 0.1, water: 0.6, air: 0.2, fire: 0.1 },
        consciousness: { conscious: 0.3, unconscious: 0.3, higherSelf: 0.2, lowerSelf: 0.2 },
        hemispheres: { leftBrain: 0.4, rightBrain: 0.6 },
        wordDensity: 0.6,
        silenceProbability: 0.3,
        fragmentationRate: 0.3,
        responseLatency: 1500,
        pauseDuration: 1500,
        intimacyLevel: 0.5,
        exchangeCount: 20
      };

      const palette = ResponsePalette.getConstrainedResponses(waterField);

      // Should contain empathic responses
      const empathicPhrases = ['Feel that', 'I\'m here', 'flow', 'Stay with'];
      const hasEmpathic = palette.some(r =>
        empathicPhrases.some(phrase => r?.includes(phrase))
      );
      expect(hasEmpathic).toBe(true);
    });

    it('should allow questions in Air-heavy field', () => {
      const airField: ResonanceField = {
        elements: { earth: 0.1, water: 0.2, air: 0.6, fire: 0.1 },
        consciousness: { conscious: 0.5, unconscious: 0.2, higherSelf: 0.2, lowerSelf: 0.1 },
        hemispheres: { leftBrain: 0.6, rightBrain: 0.4 },
        wordDensity: 0.8,
        silenceProbability: 0.2,
        fragmentationRate: 0.6,
        responseLatency: 800,
        pauseDuration: 1000,
        intimacyLevel: 0.2,
        exchangeCount: 5
      };

      const palette = ResponsePalette.getConstrainedResponses(airField);

      // Should contain questions
      const hasQuestions = palette.some(r => r?.includes('?') || r === 'Tell me.');
      expect(hasQuestions).toBe(true);
    });

    it('should allow intense responses in Fire-heavy field', () => {
      const fireField: ResonanceField = {
        elements: { earth: 0.1, water: 0.1, air: 0.1, fire: 0.7 },
        consciousness: { conscious: 0.3, unconscious: 0.2, higherSelf: 0.1, lowerSelf: 0.4 },
        hemispheres: { leftBrain: 0.5, rightBrain: 0.5 },
        wordDensity: 0.7,
        silenceProbability: 0.1,
        fragmentationRate: 0.4,
        responseLatency: 500,
        pauseDuration: 800,
        intimacyLevel: 0.4,
        exchangeCount: 12
      };

      const palette = ResponsePalette.getConstrainedResponses(fireField);

      // Should contain intense/active responses
      const intensePhrases = ['Yes!', 'Do it', 'Now', 'Go'];
      const hasIntense = palette.some(r =>
        intensePhrases.some(phrase => r?.includes(phrase))
      );
      expect(hasIntense).toBe(true);
    });
  });

  describe('Silence Probability', () => {
    it('should increase with Earth weight', () => {
      const generator = new ResonanceFieldGenerator();

      const field = generator.generateField(
        "...",
        { userWeather: 'contemplative' },
        30,
        0.8
      );

      // High earth + high intimacy = high silence
      expect(field.silenceProbability).toBeGreaterThan(0.5);
    });

    it('should be low in Fire-dominant fields', () => {
      const generator = new ResonanceFieldGenerator();

      const field = generator.generateField(
        "I need to do this now!",
        { userWeather: 'crisis' },
        10,
        0.3
      );

      // Fire should reduce silence probability
      expect(field.silenceProbability).toBeLessThan(0.3);
    });
  });

  describe('Field Evolution Over Conversation', () => {
    it('should track elemental shift toward Earth in intimate conversation', async () => {
      const generator = new ResonanceFieldGenerator();

      // Simulate conversation deepening
      for (let i = 0; i < 5; i++) {
        await generator.resonate("Hello", {}, i, i * 0.1);
      }

      for (let i = 5; i < 15; i++) {
        await generator.resonate(
          "I feel...",
          { userWeather: 'emotional' },
          i,
          i * 0.05
        );
      }

      for (let i = 15; i < 30; i++) {
        await generator.resonate(
          "...",
          { userWeather: 'contemplative' },
          i,
          i * 0.03
        );
      }

      const evolution = generator.analyzeFieldEvolution();

      expect(evolution.elementalShift).toContain('earth');
      expect(evolution.intimacyGrowth).toBeGreaterThan(0);
      expect(evolution.silenceTrend).toBeGreaterThan(0);
    });
  });

  describe('Response Latency', () => {
    it('should be longer in Earth fields', () => {
      const generator = new ResonanceFieldGenerator();

      const earthField = generator.generateField(
        "...",
        { userState: 'contemplative' },
        25,
        0.7
      );

      const airField = generator.generateField(
        "What do you think?",
        { userState: 'curious' },
        5,
        0.2
      );

      expect(earthField.responseLatency).toBeGreaterThan(airField.responseLatency);
      expect(earthField.pauseDuration).toBeGreaterThan(airField.pauseDuration);
    });
  });
});

describe('Adaptive Resonance System', () => {
  describe('Oracle Integration', () => {
    it('should adjust field weights based on Oracle reading', async () => {
      const system = new AdaptiveResonanceSystem();

      // Oracle detects Nigredo/dissolution
      const response = await system.respond(
        "Everything is falling apart",
        {}
      );

      // Should have high Earth/Water
      expect(response.field.elements.earth + response.field.elements.water)
        .toBeGreaterThan(0.6);

      // Should have high silence probability
      expect(response.field.silenceProbability).toBeGreaterThan(0.4);
    });

    it('should shift to Fire during breakthrough moments', async () => {
      const system = new AdaptiveResonanceSystem();

      const response = await system.respond(
        "I just realized something!",
        {}
      );

      // Should have elevated Fire
      expect(response.field.elements.fire).toBeGreaterThan(0.3);

      // Should have lower silence probability
      expect(response.field.silenceProbability).toBeLessThan(0.4);
    });
  });

  describe('Genuine Emergence', () => {
    it('should produce different responses to same input due to field randomness', async () => {
      const system = new AdaptiveResonanceSystem();

      const responses: (string | null)[] = [];
      for (let i = 0; i < 10; i++) {
        const result = await system.respond("I'm lost", {});
        responses.push(result.response);
      }

      // Should have variety (not all the same)
      const unique = new Set(responses);
      expect(unique.size).toBeGreaterThan(1);

      // But all should be field-appropriate (short, present)
      responses.forEach(r => {
        expect(r === null || r.length < 20).toBe(true);
      });
    });
  });

  describe('Intimacy Deepening', () => {
    it('should increase silence as conversation deepens', async () => {
      const system = new AdaptiveResonanceSystem();

      // Early exchanges
      const early: (string | null)[] = [];
      for (let i = 0; i < 10; i++) {
        const result = await system.respond("Hey", {});
        early.push(result.response);
      }

      // Later exchanges (simulate intimacy)
      const late: (string | null)[] = [];
      for (let i = 0; i < 30; i++) {
        await system.respond("...", {});
      }
      for (let i = 0; i < 10; i++) {
        const result = await system.respond("...", {});
        late.push(result.response);
      }

      // Count silences
      const earlySilences = early.filter(r => r === null).length;
      const lateSilences = late.filter(r => r === null).length;

      expect(lateSilences).toBeGreaterThan(earlySilences);
    });

    it('should track intimacy level increasing', async () => {
      const system = new AdaptiveResonanceSystem();

      const initialIntimacy = system.getFieldAnalysis().intimacyLevel;

      // Simulate vulnerable sharing
      for (let i = 0; i < 10; i++) {
        await system.respond(
          "I'm scared and don't know what to do",
          {}
        );
      }

      const finalIntimacy = system.getFieldAnalysis().intimacyLevel;

      expect(finalIntimacy).toBeGreaterThan(initialIntimacy);
    });
  });
});

describe('Integration Demonstration', () => {
  it('should demonstrate complete flow: Oracle → Field → Response', async () => {
    console.log('\n=== RESONANCE FIELD DEMONSTRATION ===\n');

    const system = new AdaptiveResonanceSystem();

    // Test case 1: Dissolution
    console.log('TEST 1: User in dissolution');
    const r1 = await system.respond("Everything I built is crumbling", {});
    console.log('  Field:', {
      earth: r1.field.elements.earth.toFixed(2),
      water: r1.field.elements.water.toFixed(2),
      silence: r1.field.silenceProbability.toFixed(2)
    });
    console.log('  Response:', r1.response || '[silence]');
    console.log('  Quality:', r1.metadata.archetypeInfluence.presenceQuality);

    // Test case 2: Breakthrough
    console.log('\nTEST 2: User having breakthrough');
    const r2 = await system.respond("Oh! I finally see it!", {});
    console.log('  Field:', {
      fire: r2.field.elements.fire.toFixed(2),
      air: r2.field.elements.air.toFixed(2),
      silence: r2.field.silenceProbability.toFixed(2)
    });
    console.log('  Response:', r2.response || '[silence]');
    console.log('  Quality:', r2.metadata.archetypeInfluence.presenceQuality);

    // Test case 3: Deep intimacy
    console.log('\nTEST 3: Deep intimacy (after 30 exchanges)');
    for (let i = 0; i < 30; i++) {
      await system.respond("...", {});
    }
    const r3 = await system.respond("Thank you", {});
    console.log('  Field:', {
      earth: r3.field.elements.earth.toFixed(2),
      intimacy: r3.field.intimacyLevel.toFixed(2),
      silence: r3.field.silenceProbability.toFixed(2)
    });
    console.log('  Response:', r3.response || '[silence]');
    console.log('  Quality:', r3.metadata.archetypeInfluence.presenceQuality);

    console.log('\n=== FIELD EVOLUTION ===');
    const analysis = system.getFieldAnalysis();
    console.log(analysis.fieldEvolution);

    expect(true).toBe(true); // Always passes, this is for demonstration
  });
});