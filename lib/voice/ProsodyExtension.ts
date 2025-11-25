/**
 * Prosody Extension for Maya's Voice
 * Adds texture, weight, and elemental resonance to utterances
 * Making them feel dimensional, not flat
 */

import { ElementalState } from '../types/elemental';

// ============================================================================
// PROSODY PARAMETERS
// ============================================================================

export interface ProsodyWeight {
  duration: number;        // 0.5-3.0 (relative to normal)
  amplitude: number;       // 0.1-1.0 (soft to full)
  breathBefore: number;    // 0-2000ms pause before
  breathAfter: number;     // 0-2000ms pause after
  texture: 'crisp' | 'soft' | 'rounded' | 'suspended' | 'grounded';
  resonance: 'head' | 'chest' | 'throat' | 'whisper';
}

export interface UtteranceTexture {
  base: string;           // The utterance text
  weight: ProsodyWeight;  // How it's delivered
  elemental?: ElementalState; // Optional elemental coloring
}

// ============================================================================
// ELEMENTAL PROSODY MAPPING
// ============================================================================

export const ELEMENTAL_PROSODY: Record<string, Partial<ProsodyWeight>> = {
  fire: {
    duration: 0.7,        // Quick, decisive
    amplitude: 0.9,       // Clear, present
    texture: 'crisp',
    resonance: 'head',
    breathBefore: 100,
    breathAfter: 200
  },

  water: {
    duration: 1.8,        // Extended, flowing
    amplitude: 0.6,       // Softer, receptive
    texture: 'rounded',
    resonance: 'chest',
    breathBefore: 500,
    breathAfter: 800
  },

  earth: {
    duration: 1.0,        // Steady, grounded
    amplitude: 0.7,       // Solid, present
    texture: 'grounded',
    resonance: 'chest',
    breathBefore: 300,
    breathAfter: 400
  },

  air: {
    duration: 1.2,        // Light, connecting
    amplitude: 0.5,       // Gentle, curious
    texture: 'suspended',
    resonance: 'head',
    breathBefore: 200,
    breathAfter: 600
  },

  aether: {
    duration: 2.0,        // Spacious
    amplitude: 0.4,       // Almost whispered
    texture: 'suspended',
    resonance: 'whisper',
    breathBefore: 1000,
    breathAfter: 1500
  }
};

// ============================================================================
// TEXTURED UTTERANCE LIBRARY
// ============================================================================

export class TexturedUtteranceLibrary {
  /**
   * Processing/Thinking variants with prosody
   */
  static readonly THINKING: Record<string, UtteranceTexture> = {
    quick: {
      base: "Hm",
      weight: {
        duration: 0.5,
        amplitude: 0.7,
        breathBefore: 0,
        breathAfter: 300,
        texture: 'crisp',
        resonance: 'throat'
      }
    },

    deep: {
      base: "Hmm",
      weight: {
        duration: 1.5,
        amplitude: 0.5,
        breathBefore: 400,
        breathAfter: 600,
        texture: 'rounded',
        resonance: 'chest'
      }
    },

    veryDeep: {
      base: "Hmm...",
      weight: {
        duration: 2.5,
        amplitude: 0.4,
        breathBefore: 800,
        breathAfter: 1000,
        texture: 'suspended',
        resonance: 'chest'
      }
    }
  };

  /**
   * Emotional variants with weight
   */
  static readonly EMOTIONAL: Record<string, UtteranceTexture> = {
    brightDelight: {
      base: "Oh!",
      weight: {
        duration: 0.6,
        amplitude: 0.9,
        breathBefore: 0,
        breathAfter: 200,
        texture: 'crisp',
        resonance: 'head'
      }
    },

    softReceiving: {
      base: "Oh",
      weight: {
        duration: 1.8,
        amplitude: 0.3,
        breathBefore: 600,
        breathAfter: 1200,
        texture: 'soft',
        resonance: 'chest'
      }
    },

    holdingSpace: {
      base: "Mm",
      weight: {
        duration: 2.0,
        amplitude: 0.4,
        breathBefore: 800,
        breathAfter: 1500,
        texture: 'rounded',
        resonance: 'chest'
      }
    },

    recognition: {
      base: "Ahh",
      weight: {
        duration: 1.2,
        amplitude: 0.6,
        breathBefore: 200,
        breathAfter: 500,
        texture: 'suspended',
        resonance: 'throat'
      }
    }
  };

  /**
   * Rare/mythic variants - used sparingly
   */
  static readonly MYTHIC: Record<string, UtteranceTexture> = {
    releaseAndAmuse: {
      base: "Ha...",
      weight: {
        duration: 1.5,
        amplitude: 0.5,
        breathBefore: 400,
        breathAfter: 800,
        texture: 'soft',
        resonance: 'throat'
      }
    },

    whisperedYes: {
      base: "yes",
      weight: {
        duration: 0.8,
        amplitude: 0.2,
        breathBefore: 1000,
        breathAfter: 1000,
        texture: 'suspended',
        resonance: 'whisper'
      }
    },

    ancientKnowing: {
      base: "Mmm",
      weight: {
        duration: 3.0,
        amplitude: 0.3,
        breathBefore: 1500,
        breathAfter: 2000,
        texture: 'grounded',
        resonance: 'chest'
      }
    }
  };
}

// ============================================================================
// PROSODY ENGINE
// ============================================================================

export class ProsodyEngine {
  private elementalState?: ElementalState;
  private mythicCounter = 0;
  private mythicThreshold = 50; // Use mythic variant 1 in 50 times

  /**
   * Apply prosody weight to utterance based on context
   */
  applyProsody(
    utterance: string,
    emotionalIntensity: number,
    complexity: number,
    elementalState?: ElementalState
  ): UtteranceTexture {

    // Check for mythic variant opportunity
    if (this.shouldUseMythic(emotionalIntensity, complexity)) {
      const mythic = this.selectMythicVariant(utterance, emotionalIntensity);
      if (mythic) return mythic;
    }

    // Map to appropriate textured variant
    const texture = this.selectTexture(utterance, emotionalIntensity, complexity);

    // Apply elemental coloring if present
    if (elementalState) {
      texture.weight = this.blendWithElemental(texture.weight, elementalState);
    }

    return texture;
  }

  /**
   * Determine if mythic variant should be used
   */
  private shouldUseMythic(intensity: number, complexity: number): boolean {
    this.mythicCounter++;

    // Higher chance for mythic in profound moments
    const mythicProbability = (intensity * complexity) > 0.8 ? 0.1 : 0.02;
    const threshold = this.mythicThreshold * (1 - mythicProbability);

    if (this.mythicCounter >= threshold) {
      this.mythicCounter = 0;
      return true;
    }

    return false;
  }

  /**
   * Select appropriate mythic variant
   */
  private selectMythicVariant(
    utterance: string,
    intensity: number
  ): UtteranceTexture | null {

    if (utterance.includes("Mm") && intensity > 0.7) {
      return TexturedUtteranceLibrary.MYTHIC.ancientKnowing;
    }

    if (utterance === "Oh" && intensity < 0.3) {
      return TexturedUtteranceLibrary.MYTHIC.whisperedYes;
    }

    if (utterance === "Ha" || (utterance === "Ahh" && intensity > 0.6)) {
      return TexturedUtteranceLibrary.MYTHIC.releaseAndAmuse;
    }

    return null;
  }

  /**
   * Select standard textured variant
   */
  private selectTexture(
    utterance: string,
    intensity: number,
    complexity: number
  ): UtteranceTexture {

    // Thinking utterances
    if (utterance.startsWith("Hm")) {
      if (complexity > 0.8) {
        return TexturedUtteranceLibrary.THINKING.veryDeep;
      } else if (complexity > 0.5) {
        return TexturedUtteranceLibrary.THINKING.deep;
      }
      return TexturedUtteranceLibrary.THINKING.quick;
    }

    // Emotional utterances
    if (utterance === "Oh!") {
      return TexturedUtteranceLibrary.EMOTIONAL.brightDelight;
    }

    if (utterance === "Oh") {
      return TexturedUtteranceLibrary.EMOTIONAL.softReceiving;
    }

    if (utterance === "Mm") {
      return TexturedUtteranceLibrary.EMOTIONAL.holdingSpace;
    }

    if (utterance === "Ahh") {
      return TexturedUtteranceLibrary.EMOTIONAL.recognition;
    }

    // Default: create basic texture
    return {
      base: utterance,
      weight: {
        duration: 1.0,
        amplitude: 0.7,
        breathBefore: 200,
        breathAfter: 400,
        texture: 'rounded',
        resonance: 'throat'
      }
    };
  }

  /**
   * Blend prosody with elemental state
   */
  private blendWithElemental(
    weight: ProsodyWeight,
    elemental: ElementalState
  ): ProsodyWeight {

    const elementalProsody = ELEMENTAL_PROSODY[elemental.dominant];
    if (!elementalProsody) return weight;

    // Blend 70% original, 30% elemental
    return {
      duration: weight.duration * 0.7 + (elementalProsody.duration || 1) * 0.3,
      amplitude: weight.amplitude * 0.7 + (elementalProsody.amplitude || 0.7) * 0.3,
      breathBefore: Math.round(weight.breathBefore * 0.7 + (elementalProsody.breathBefore || 200) * 0.3),
      breathAfter: Math.round(weight.breathAfter * 0.7 + (elementalProsody.breathAfter || 400) * 0.3),
      texture: elementalProsody.texture || weight.texture,
      resonance: weight.resonance // Keep original resonance
    };
  }
}

// ============================================================================
// SSML GENERATION FOR TTS
// ============================================================================

export class SSMLGenerator {
  /**
   * Convert textured utterance to SSML for OpenAI TTS
   * Note: OpenAI TTS has limited SSML support, so we approximate
   */
  static toSSML(texture: UtteranceTexture): string {
    const { base, weight } = texture;

    // OpenAI doesn't support full SSML, but we can use timing
    let ssml = '';

    // Add breath before
    if (weight.breathBefore > 500) {
      ssml += '... ';
    } else if (weight.breathBefore > 200) {
      ssml += ', ';
    }

    // The utterance itself
    ssml += base;

    // Add breath after
    if (weight.breathAfter > 1000) {
      ssml += '... ';
    } else if (weight.breathAfter > 500) {
      ssml += ', ';
    } else if (weight.breathAfter > 200) {
      ssml += '. ';
    }

    return ssml.trim();
  }

  /**
   * Generate prosody hints for TTS config
   */
  static toProsodyConfig(weight: ProsodyWeight): any {
    return {
      speed: 1.0 / weight.duration,  // Inverse - longer duration = slower
      pitch: weight.resonance === 'whisper' ? 0.8 :
             weight.resonance === 'head' ? 1.1 : 1.0,
      volume: weight.amplitude,

      // Custom parameters for future TTS systems
      custom: {
        texture: weight.texture,
        resonance: weight.resonance,
        breathBefore: weight.breathBefore,
        breathAfter: weight.breathAfter
      }
    };
  }
}

// ============================================================================
// INTEGRATION
// ============================================================================

/**
 * Main integration for prosody-aware utterances
 */
export function generateTexturedUtterance(
  baseUtterance: string | null,
  context: {
    emotionalIntensity: number;
    complexity: number;
    elementalState?: ElementalState;
  }
): { text: string; config: any } | null {

  if (!baseUtterance) return null;

  const engine = new ProsodyEngine();
  const texture = engine.applyProsody(
    baseUtterance,
    context.emotionalIntensity,
    context.complexity,
    context.elementalState
  );

  return {
    text: SSMLGenerator.toSSML(texture),
    config: SSMLGenerator.toProsodyConfig(texture.weight)
  };
}

export default {
  ProsodyEngine,
  TexturedUtteranceLibrary,
  SSMLGenerator,
  generateTexturedUtterance,
  ELEMENTAL_PROSODY
};