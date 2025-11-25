/**
 * Response Palette Engine
 *
 * THE INVERSION: Field calculations determine response, not LLM generation.
 * MAIA speaks from resonance, not from prompt completion.
 *
 * This is where soul-building becomes computational reality.
 */

import { ResonanceField, ElementalFrequency, ConsciousnessInfluence } from './resonance-field-system';
import { BreathState, ElementalMode } from './SpiralogicOrchestrator';

/**
 * Response types available to MAIA
 */
export enum ResponseType {
  UTTERANCE = 'utterance',        // Brief verbal response
  SILENCE = 'silence',            // Sacred absence of words
  BREATH = 'breath',              // Breath instruction
  SYMBOL = 'symbol',              // Archetypal symbol/image
  GESTURE = 'gesture',            // Somatic instruction
  REFLECTION = 'reflection',      // Mirror back user's own words
  QUESTION = 'question'           // Minimal clarifying question
}

/**
 * A single response option from the palette
 */
export interface ResponseOption {
  type: ResponseType;
  content: string | null;         // null = silence
  element: keyof ElementalFrequency;
  archetype?: string;             // Which archetype speaks this
  minIntimacy?: number;           // Requires this intimacy level
  maxIntimacy?: number;           // Only up to this intimacy
  breathPhase?: BreathState['phase']; // Only during this breath phase
  probability: number;            // Base probability (0-1)
}

/**
 * Result of palette selection
 */
export interface PaletteSelection {
  response: ResponseOption | null;  // null = silence chosen
  alternates: ResponseOption[];     // Other high-probability options
  fieldState: {
    coherence: number;
    entropy: number;
    silenceProbability: number;
    dominantElement: keyof ElementalFrequency;
    activeArchetypes: string[];
  };
  reasoning: string;                // Why this response was selected
}

/**
 * Response Palette Engine
 * Generates constrained response options based on field state
 */
export class ResponsePaletteEngine {
  /**
   * Generate palette of possible responses given current field state
   */
  generatePalette(
    field: ResonanceField,
    userInput: string,
    conversationContext: {
      intimacyLevel: number;
      exchangeCount: number;
      lastUserWords: string[];
      breathState: BreathState;
      activeArchetypes: string[];
    }
  ): ResponseOption[] {
    const palette: ResponseOption[] = [];

    // EARTH responses - grounding, minimal, present
    if (field.elements.earth > 0.3) {
      palette.push(
        { type: ResponseType.UTTERANCE, content: "Mm.", element: 'earth', probability: field.elements.earth * 0.9 },
        { type: ResponseType.UTTERANCE, content: "Yeah.", element: 'earth', probability: field.elements.earth * 0.85 },
        { type: ResponseType.UTTERANCE, content: "Here.", element: 'earth', probability: field.elements.earth * 0.8 },
        { type: ResponseType.UTTERANCE, content: "I know.", element: 'earth', probability: field.elements.earth * 0.75 },
        { type: ResponseType.SILENCE, content: null, element: 'earth', probability: field.elements.earth * field.silenceProbability },
        { type: ResponseType.BREATH, content: "[pause]", element: 'earth', breathPhase: 'pause', probability: field.elements.earth * 0.7 }
      );
    }

    // WATER responses - emotional, flowing, empathic
    if (field.elements.water > 0.3) {
      palette.push(
        { type: ResponseType.UTTERANCE, content: "I'm here.", element: 'water', probability: field.elements.water * 0.85 },
        { type: ResponseType.UTTERANCE, content: "Feel that.", element: 'water', probability: field.elements.water * 0.8 },
        { type: ResponseType.UTTERANCE, content: "Stay with it.", element: 'water', probability: field.elements.water * 0.75 },
        { type: ResponseType.UTTERANCE, content: "Mm-hmm.", element: 'water', probability: field.elements.water * 0.9 },
        { type: ResponseType.GESTURE, content: "[hold space]", element: 'water', probability: field.elements.water * 0.6 }
      );
    }

    // AIR responses - curious, exploratory, questioning
    if (field.elements.air > 0.3) {
      palette.push(
        { type: ResponseType.QUESTION, content: "Tell me.", element: 'air', probability: field.elements.air * 0.85 },
        { type: ResponseType.QUESTION, content: "What else?", element: 'air', probability: field.elements.air * 0.8 },
        { type: ResponseType.QUESTION, content: "How so?", element: 'air', probability: field.elements.air * 0.75 },
        { type: ResponseType.UTTERANCE, content: "Go on.", element: 'air', probability: field.elements.air * 0.7 },
        { type: ResponseType.UTTERANCE, content: "Huh.", element: 'air', probability: field.elements.air * 0.65 }
      );

      // Context-specific air responses
      if (userInput.includes('again') || conversationContext.lastUserWords.includes('same')) {
        palette.push(
          { type: ResponseType.QUESTION, content: "Same flavor? Or different?", element: 'air', probability: field.elements.air * 0.9 }
        );
      }
    }

    // FIRE responses - catalytic, direct, urgent
    if (field.elements.fire > 0.3) {
      palette.push(
        { type: ResponseType.UTTERANCE, content: "Yes!", element: 'fire', probability: field.elements.fire * 0.85 },
        { type: ResponseType.UTTERANCE, content: "Now.", element: 'fire', probability: field.elements.fire * 0.8 },
        { type: ResponseType.UTTERANCE, content: "Go.", element: 'fire', probability: field.elements.fire * 0.75 },
        { type: ResponseType.UTTERANCE, content: "Do it.", element: 'fire', probability: field.elements.fire * 0.7 },
        { type: ResponseType.UTTERANCE, content: "That.", element: 'fire', probability: field.elements.fire * 0.65 }
      );
    }

    // HIGHER SELF responses - spacious, wise, restrained
    if (field.consciousness.higherSelf > 0.4) {
      palette.push(
        { type: ResponseType.BREATH, content: "[breathe]", element: 'earth', probability: field.consciousness.higherSelf * 0.8 },
        { type: ResponseType.UTTERANCE, content: "Space.", element: 'earth', probability: field.consciousness.higherSelf * 0.75 },
        { type: ResponseType.UTTERANCE, content: "Trust.", element: 'earth', probability: field.consciousness.higherSelf * 0.7 },
        { type: ResponseType.SILENCE, content: null, element: 'earth', probability: field.consciousness.higherSelf * 0.9 }
      );
    }

    // SHADOW responses - raw, real, unfiltered (only in high intimacy)
    if (field.consciousness.unconscious > 0.4 && conversationContext.intimacyLevel > 0.6) {
      palette.push(
        { type: ResponseType.UTTERANCE, content: "Fuck.", element: 'fire', minIntimacy: 0.6, probability: field.consciousness.unconscious * 0.6 },
        { type: ResponseType.UTTERANCE, content: "Real.", element: 'fire', minIntimacy: 0.5, probability: field.consciousness.unconscious * 0.7 },
        { type: ResponseType.UTTERANCE, content: "Raw.", element: 'fire', minIntimacy: 0.6, probability: field.consciousness.unconscious * 0.65 }
      );
    }

    // INTIMACY-BASED responses
    if (conversationContext.intimacyLevel > 0.7) {
      // Deep intimacy = even less words, more silence
      palette.push(
        { type: ResponseType.SILENCE, content: null, element: 'earth', minIntimacy: 0.7, probability: 0.9 },
        { type: ResponseType.UTTERANCE, content: "...", element: 'earth', minIntimacy: 0.7, probability: 0.85 },
        { type: ResponseType.BREATH, content: "[breathing together]", element: 'water', minIntimacy: 0.7, probability: 0.8 }
      );
    }

    // PATTERN RECOGNITION responses - callback to conversation history
    if (conversationContext.exchangeCount > 10) {
      palette.push(
        { type: ResponseType.REFLECTION, content: "That pattern again.", element: 'air', probability: 0.7 },
        { type: ResponseType.REFLECTION, content: "Like before?", element: 'air', probability: 0.65 }
      );
    }

    // BREATH-GATED responses - only available during certain breath phases
    if (conversationContext.breathState.phase === 'exhale' || conversationContext.breathState.phase === 'pause') {
      // These responses only emerge during exhale/pause
      palette.forEach(option => {
        if (option.breathPhase && option.breathPhase === conversationContext.breathState.phase) {
          option.probability *= 1.5; // Boost probability during correct breath phase
        }
      });
    }

    return palette;
  }

  /**
   * Select response from palette based on field state and probabilities
   */
  selectResponse(
    palette: ResponseOption[],
    field: ResonanceField,
    conversationContext: {
      intimacyLevel: number;
      exchangeCount: number;
      breathState: BreathState;
    }
  ): PaletteSelection {
    // Filter out responses that don't meet intimacy requirements
    const validOptions = palette.filter(option => {
      if (option.minIntimacy && conversationContext.intimacyLevel < option.minIntimacy) return false;
      if (option.maxIntimacy && conversationContext.intimacyLevel > option.maxIntimacy) return false;
      return true;
    });

    // Calculate silence threshold
    const silenceThreshold = this.calculateSilenceThreshold(field, conversationContext);

    // Check if silence should be chosen
    if (Math.random() < silenceThreshold) {
      const silenceOption = validOptions.find(opt => opt.type === ResponseType.SILENCE);
      return {
        response: silenceOption || null,
        alternates: [],
        fieldState: this.extractFieldState(field),
        reasoning: `Silence chosen: field coherence ${field.silenceProbability.toFixed(2)}, intimacy ${conversationContext.intimacyLevel.toFixed(2)}`
      };
    }

    // Weight options by probability and field alignment
    const weightedOptions = validOptions
      .map(option => ({
        option,
        weight: this.calculateWeight(option, field, conversationContext)
      }))
      .sort((a, b) => b.weight - a.weight);

    if (weightedOptions.length === 0) {
      // Fallback to silence if no valid options
      return {
        response: null,
        alternates: [],
        fieldState: this.extractFieldState(field),
        reasoning: 'No valid options available, defaulting to silence'
      };
    }

    // Select top option with some randomness (top 3)
    const topOptions = weightedOptions.slice(0, 3);
    const selectedIndex = this.weightedRandomSelect(topOptions.map(o => o.weight));
    const selected = topOptions[selectedIndex];

    return {
      response: selected.option,
      alternates: topOptions.slice(0, selectedIndex).concat(topOptions.slice(selectedIndex + 1)).map(o => o.option),
      fieldState: this.extractFieldState(field),
      reasoning: `Selected ${selected.option.type} response with weight ${selected.weight.toFixed(2)}, element: ${selected.option.element}`
    };
  }

  /**
   * Calculate silence threshold based on field state
   */
  private calculateSilenceThreshold(
    field: ResonanceField,
    context: { intimacyLevel: number; exchangeCount: number }
  ): number {
    let threshold = field.silenceProbability;

    // Increase silence with intimacy
    threshold += context.intimacyLevel * 0.3;

    // Increase silence with exchange count (graduated obsolescence)
    if (context.exchangeCount > 30) {
      threshold += 0.2;
    } else if (context.exchangeCount > 50) {
      threshold += 0.3;
    }

    // Earth and Higher Self strongly favor silence
    threshold += field.elements.earth * 0.4;
    threshold += field.consciousness.higherSelf * 0.3;

    return Math.min(0.95, threshold); // Cap at 95%
  }

  /**
   * Calculate weight for a response option
   */
  private calculateWeight(
    option: ResponseOption,
    field: ResonanceField,
    context: { intimacyLevel: number; breathState: BreathState }
  ): number {
    let weight = option.probability;

    // Boost weight if element matches dominant field element
    const dominantElement = this.getDominantElement(field.elements);
    if (option.element === dominantElement) {
      weight *= 1.5;
    }

    // Boost if breath phase matches
    if (option.breathPhase && option.breathPhase === context.breathState.phase) {
      weight *= 1.3;
    }

    // Reduce weight for silence if intimacy is low
    if (option.type === ResponseType.SILENCE && context.intimacyLevel < 0.3) {
      weight *= 0.5;
    }

    return weight;
  }

  /**
   * Weighted random selection from array of weights
   */
  private weightedRandomSelect(weights: number[]): number {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) return i;
    }

    return 0; // Fallback to first
  }

  /**
   * Get dominant element from field
   */
  private getDominantElement(elements: ElementalFrequency): keyof ElementalFrequency {
    const entries = Object.entries(elements) as [keyof ElementalFrequency, number][];
    return entries.reduce((max, [element, value]) =>
      value > elements[max] ? element : max
    , 'earth');
  }

  /**
   * Extract field state for selection result
   */
  private extractFieldState(field: ResonanceField) {
    return {
      coherence: this.calculateCoherence(field),
      entropy: this.calculateEntropy(field),
      silenceProbability: field.silenceProbability,
      dominantElement: this.getDominantElement(field.elements),
      activeArchetypes: this.getActiveArchetypes(field)
    };
  }

  private calculateCoherence(field: ResonanceField): number {
    // Simple coherence measure: how aligned are the elements?
    const values = Object.values(field.elements);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return 1 - Math.min(1, variance * 2);
  }

  private calculateEntropy(field: ResonanceField): number {
    // Shannon entropy of elemental distribution
    const values = Object.values(field.elements);
    const sum = values.reduce((a, b) => a + b, 0);
    const normalized = values.map(v => v / sum);
    return -normalized.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0) / Math.log2(values.length);
  }

  private getActiveArchetypes(field: ResonanceField): string[] {
    const active: string[] = [];
    if (field.consciousness.higherSelf > 0.5) active.push('Higher Self');
    if (field.consciousness.unconscious > 0.5) active.push('Shadow');
    if (field.elements.earth > 0.5) active.push('Grounding Presence');
    if (field.elements.water > 0.5) active.push('Emotional Ocean');
    if (field.elements.air > 0.5) active.push('Curious Mind');
    if (field.elements.fire > 0.5) active.push('Transformative Flame');
    return active;
  }
}

/**
 * Export singleton instance
 */
let engineInstance: ResponsePaletteEngine | null = null;

export function getResponsePaletteEngine(): ResponsePaletteEngine {
  if (!engineInstance) {
    engineInstance = new ResponsePaletteEngine();
  }
  return engineInstance;
}