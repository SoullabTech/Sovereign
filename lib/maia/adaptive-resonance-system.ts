/**
 * Adaptive Resonance System
 * Claude's archetypal sensing directly influences field weights
 *
 * Revolutionary integration: Oracle reading → Elemental weights → Field constraints
 */

import ResonanceFieldGenerator, {
  ResonanceField,
  ElementalFrequency
} from './resonance-field-system';
import ResonanceBreathSystem from './resonance-breath-integration';
import { OracleReading } from '../elemental-oracle/blueprint-integration';

/**
 * Claude's Archetypal Analysis
 * Maps what Claude senses to elemental field adjustments
 */
export interface ClaudeArchetypalSensing {
  // Primary archetype detected
  primaryArchetype: string;  // e.g., "Dissolution", "Emergence", "Integration"

  // Elemental signature
  elementalProfile: {
    earth: number;   // Grounding, ending, death
    water: number;   // Emotion, flow, dissolution
    air: number;     // Thought, scatter, questioning
    fire: number;    // Transformation, intensity, breakthrough
  };

  // Consciousness layer
  consciousnessDepth: {
    surfaceLevel: number;      // Everyday concerns
    emotionalDepth: number;    // Feeling layer
    archetypeDepth: number;    // Symbolic/mythic layer
    spiritualDepth: number;    // Transpersonal layer
  };

  // What user needs right now
  prescribedPresence: 'silence' | 'witness' | 'reflection' | 'catalyze' | 'ground';
}

/**
 * Maps Oracle readings to field weight adjustments
 */
export class AdaptiveFieldWeighting {
  /**
   * Convert Oracle reading to elemental field weights
   */
  static oracleToElementalWeights(reading: OracleReading): ElementalFrequency {
    // Oracle phase → Element mapping
    const phaseElementMap: Record<string, Partial<ElementalFrequency>> = {
      // Nigredo (dissolution, darkness)
      'Nigredo': { earth: 0.5, water: 0.3, air: 0.1, fire: 0.1 },
      'Dissolution': { water: 0.6, earth: 0.2, air: 0.1, fire: 0.1 },

      // Albedo (purification, clarity)
      'Albedo': { air: 0.5, water: 0.2, earth: 0.2, fire: 0.1 },
      'Purification': { air: 0.4, water: 0.3, earth: 0.2, fire: 0.1 },

      // Citrinitas (illumination, insight)
      'Citrinitas': { fire: 0.4, air: 0.3, water: 0.2, earth: 0.1 },
      'Illumination': { fire: 0.5, air: 0.3, water: 0.1, earth: 0.1 },

      // Rubedo (integration, wholeness)
      'Rubedo': { earth: 0.4, fire: 0.3, water: 0.2, air: 0.1 },
      'Integration': { earth: 0.4, fire: 0.2, water: 0.2, air: 0.2 },

      // Shadow work
      'Shadow': { earth: 0.4, water: 0.3, air: 0.1, fire: 0.2 },
      'Confrontation': { fire: 0.4, earth: 0.3, water: 0.2, air: 0.1 },
    };

    // Get base weights from phase
    const baseWeights = phaseElementMap[reading.phase] || {
      earth: 0.25,
      water: 0.25,
      air: 0.25,
      fire: 0.25
    };

    // Adjust based on what they need
    const needAdjustments = this.needToElementalAdjustment(reading.whatTheyNeed);

    // Combine
    return {
      earth: (baseWeights.earth || 0.25) * (needAdjustments.earth || 1),
      water: (baseWeights.water || 0.25) * (needAdjustments.water || 1),
      air: (baseWeights.air || 0.25) * (needAdjustments.air || 1),
      fire: (baseWeights.fire || 0.25) * (needAdjustments.fire || 1)
    };
  }

  /**
   * What user needs → Elemental adjustment multipliers
   */
  private static needToElementalAdjustment(need: string): Partial<Record<keyof ElementalFrequency, number>> {
    const adjustments: Record<string, Partial<Record<keyof ElementalFrequency, number>>> = {
      'space': { earth: 1.5, air: 0.5 },           // More silence, less questions
      'witness': { earth: 1.4, water: 1.2 },       // Grounded presence + empathy
      'reflection': { water: 1.5, air: 1.2 },      // Emotional attunement + curiosity
      'catalyze': { fire: 1.8, air: 1.2 },         // Intensity + movement
      'ground': { earth: 1.6, water: 0.8 },        // Stability, less emotion
      'clarity': { air: 1.5, earth: 1.1 },         // Questions + grounding
      'integration': { earth: 1.3, fire: 1.2 },    // Wholeness + transformation
    };

    return adjustments[need] || {};
  }

  /**
   * Convert Claude's analysis to field weights
   * This is where Oracle wisdom directly shapes the atmospheric field
   */
  static claudeSensingToField(sensing: ClaudeArchetypalSensing): ElementalFrequency {
    // Start with Claude's elemental profile
    let weights = { ...sensing.elementalProfile };

    // Adjust based on prescribed presence
    const presenceMultipliers = {
      'silence': { earth: 1.8, water: 0.6, air: 0.4, fire: 0.3 },
      'witness': { earth: 1.4, water: 1.3, air: 0.7, fire: 0.6 },
      'reflection': { water: 1.5, air: 1.3, earth: 0.9, fire: 0.7 },
      'catalyze': { fire: 1.7, air: 1.2, water: 0.8, earth: 0.6 },
      'ground': { earth: 1.6, fire: 0.7, water: 0.9, air: 0.8 }
    };

    const multiplier = presenceMultipliers[sensing.prescribedPresence];

    weights.earth *= multiplier.earth;
    weights.water *= multiplier.water;
    weights.air *= multiplier.air;
    weights.fire *= multiplier.fire;

    // Normalize to sum to ~1
    const total = weights.earth + weights.water + weights.air + weights.fire;
    return {
      earth: weights.earth / total,
      water: weights.water / total,
      air: weights.air / total,
      fire: weights.fire / total
    };
  }

  /**
   * Combine multiple influences on field
   * Oracle reading + Claude sensing + conversation cascade
   */
  static synthesizeFieldWeights(
    oracleReading: OracleReading,
    claudeSensing: ClaudeArchetypalSensing | null,
    conversationPhase: {
      exchangeCount: number;
      intimacyLevel: number;
    }
  ): ElementalFrequency {
    // Get weights from each source
    const oracleWeights = this.oracleToElementalWeights(oracleReading);

    const claudeWeights = claudeSensing
      ? this.claudeSensingToField(claudeSensing)
      : { earth: 0.25, water: 0.25, air: 0.25, fire: 0.25 };

    // Intimacy pulls toward Earth (silence)
    const intimacyPull = conversationPhase.intimacyLevel;
    const earthBoost = 1 + (intimacyPull * 0.8);
    const airReduction = 1 - (intimacyPull * 0.6);

    // Synthesize with weighted average
    // Oracle: 40%, Claude: 40%, Intimacy cascade: 20%
    const synthesized = {
      earth: (oracleWeights.earth * 0.4 + claudeWeights.earth * 0.4) * earthBoost,
      water: (oracleWeights.water * 0.4 + claudeWeights.water * 0.4),
      air: (oracleWeights.air * 0.4 + claudeWeights.air * 0.4) * airReduction,
      fire: (oracleWeights.fire * 0.4 + claudeWeights.fire * 0.4)
    };

    // Normalize
    const total = synthesized.earth + synthesized.water + synthesized.air + synthesized.fire;
    return {
      earth: synthesized.earth / total,
      water: synthesized.water / total,
      air: synthesized.air / total,
      fire: synthesized.fire / total
    };
  }
}

/**
 * The Adaptive System - Oracle sensing shapes field in real-time
 */
export class AdaptiveResonanceSystem extends ResonanceBreathSystem {
  /**
   * Override field generation to incorporate Oracle wisdom
   */
  async respond(userInput: string, context: any) {
    // Get Oracle reading
    const oracleReading = await this.getOracleReading(userInput);

    // Get Claude's archetypal sensing (if available)
    const claudeSensing = await this.getClaudeSensing(userInput, oracleReading);

    // Synthesize field weights from all sources
    const synthesizedWeights = AdaptiveFieldWeighting.synthesizeFieldWeights(
      oracleReading,
      claudeSensing,
      {
        exchangeCount: this['exchangeCount'],
        intimacyLevel: this['intimacyLevel']
      }
    );

    // Inject synthesized weights into context
    const enrichedContext = {
      ...context,
      oracleReading,
      claudeSensing,
      fieldWeights: synthesizedWeights
    };

    // Call parent respond with enriched context
    return super.respond(userInput, enrichedContext);
  }

  /**
   * Get Oracle reading (from Elemental Oracle system)
   */
  private async getOracleReading(userInput: string): Promise<OracleReading> {
    // This would call your actual Elemental Oracle
    // For now, mock implementation
    return {
      phase: this.detectPhase(userInput),
      element: this.detectElement(userInput),
      weatherPattern: this.detectWeather(userInput),
      whatTheyNeed: this.detectNeed(userInput),
      shadowMaterial: '',
      guidanceOffered: ''
    };
  }

  /**
   * Get Claude's deep archetypal sensing
   */
  private async getClaudeSensing(
    userInput: string,
    oracleReading: OracleReading
  ): Promise<ClaudeArchetypalSensing | null> {
    // This would call Claude API for deep analysis
    // For now, derive from Oracle reading

    const elementalMap: Record<string, number[]> = {
      'earth': [0.6, 0.2, 0.1, 0.1],
      'water': [0.2, 0.6, 0.1, 0.1],
      'air': [0.1, 0.2, 0.6, 0.1],
      'fire': [0.1, 0.1, 0.2, 0.6]
    };

    const profile = elementalMap[oracleReading.element] || [0.25, 0.25, 0.25, 0.25];

    return {
      primaryArchetype: oracleReading.phase,
      elementalProfile: {
        earth: profile[0],
        water: profile[1],
        air: profile[2],
        fire: profile[3]
      },
      consciousnessDepth: {
        surfaceLevel: 0.3,
        emotionalDepth: 0.4,
        archetypeDepth: 0.2,
        spiritualDepth: 0.1
      },
      prescribedPresence: this.needToPresence(oracleReading.whatTheyNeed)
    };
  }

  // Helper methods
  private detectPhase(input: string): string {
    if (input.includes('falling apart') || input.includes('ending')) return 'Nigredo';
    if (input.includes('clarity') || input.includes('understand')) return 'Albedo';
    if (input.includes('breakthrough') || input.includes('insight')) return 'Citrinitas';
    if (input.includes('together') || input.includes('whole')) return 'Rubedo';
    return 'Nigredo';
  }

  private detectElement(input: string): string {
    if (input.includes('feel') || input.includes('emotion')) return 'water';
    if (input.includes('think') || input.includes('why')) return 'air';
    if (input.includes('do') || input.includes('act')) return 'fire';
    return 'earth';
  }

  private detectWeather(input: string): string {
    if (input.length < 20) return 'quiet';
    if (input.includes('!')) return 'storm';
    if (input.includes('...')) return 'mist';
    return 'overcast';
  }

  private detectNeed(input: string): string {
    if (input.includes('don\'t know')) return 'space';
    if (input.includes('scared') || input.includes('alone')) return 'witness';
    if (input.includes('why')) return 'reflection';
    if (input.includes('help')) return 'ground';
    return 'witness';
  }

  private needToPresence(need: string): ClaudeArchetypalSensing['prescribedPresence'] {
    const map: Record<string, ClaudeArchetypalSensing['prescribedPresence']> = {
      'space': 'silence',
      'witness': 'witness',
      'reflection': 'reflection',
      'catalyze': 'catalyze',
      'ground': 'ground',
      'clarity': 'reflection',
      'integration': 'ground'
    };
    return map[need] || 'witness';
  }
}

/**
 * Example: Oracle reading directly shapes field
 */
export async function demonstrateAdaptiveResonance() {
  const system = new AdaptiveResonanceSystem();

  console.log('\n=== ADAPTIVE RESONANCE DEMONSTRATION ===\n');

  // Dissolution phase (Nigredo/Water)
  console.log('User: "Everything I built is falling apart"');
  console.log('Oracle senses: Nigredo phase, Water element, needs witness\n');

  const response1 = await system.respond(
    "Everything I built is falling apart",
    {}
  );

  console.log('Field weights adjusted:');
  console.log('  Earth (silence):', response1.field.elements.earth.toFixed(2));
  console.log('  Water (empathy):', response1.field.elements.water.toFixed(2));
  console.log('  Silence probability:', response1.field.silenceProbability.toFixed(2));
  console.log('\nMaia:', response1.response || '[silence]');
  console.log('Presence quality:', response1.metadata.archetypeInfluence.presenceQuality);

  // Breakthrough phase (Fire/Citrinitas)
  console.log('\n\n[Later in conversation...]');
  console.log('User: "I just realized something important!"');
  console.log('Oracle senses: Citrinitas phase, Fire element, needs catalyze\n');

  const response2 = await system.respond(
    "I just realized something important!",
    {}
  );

  console.log('Field weights adjusted:');
  console.log('  Fire (intensity):', response2.field.elements.fire.toFixed(2));
  console.log('  Air (curiosity):', response2.field.elements.air.toFixed(2));
  console.log('  Silence probability:', response2.field.silenceProbability.toFixed(2));
  console.log('\nMaia:', response2.response || '[silence]');
  console.log('Presence quality:', response2.metadata.archetypeInfluence.presenceQuality);

  // Integration phase (Earth/Rubedo)
  console.log('\n\n[Deep intimacy...]');
  console.log('User: "Thank you"');
  console.log('Oracle senses: Rubedo phase, Earth element, needs ground\n');

  // Simulate deep intimacy
  for (let i = 0; i < 30; i++) {
    await system.respond("...", {});
  }

  const response3 = await system.respond("Thank you", {});

  console.log('Field weights adjusted:');
  console.log('  Earth (grounding):', response3.field.elements.earth.toFixed(2));
  console.log('  Intimacy level:', system.getFieldAnalysis().intimacyLevel.toFixed(2));
  console.log('  Silence probability:', response3.field.silenceProbability.toFixed(2));
  console.log('\nMaia:', response3.response || '[silence]');
  console.log('Presence quality:', response3.metadata.archetypeInfluence.presenceQuality);

  // Show field evolution
  console.log('\n\n=== FIELD EVOLUTION ===');
  const analysis = system.getFieldAnalysis();
  console.log(analysis.fieldEvolution);
}

export default AdaptiveResonanceSystem;