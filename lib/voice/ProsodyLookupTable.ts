/**
 * Prosody Lookup Table
 * Automatic prosody profiles for every utterance
 * Maps text → breath shape → voice delivery
 */

import { ElementalState } from '../types/elemental';

// ============================================================================
// CORE PROSODY SHAPE
// ============================================================================

export interface ProsodyShape {
  // Duration/elongation
  length: 'short' | 'medium' | 'long' | 'extended';

  // Amplitude/force
  intensity: 'whisper' | 'soft' | 'neutral' | 'strong' | 'full';

  // Tonal register
  pitch: 'low' | 'mid' | 'high' | 'rising' | 'falling';

  // Breath pattern
  breath: 'held' | 'released' | 'flowing' | 'suspended';

  // Additional texture
  texture: 'smooth' | 'rough' | 'crystalline' | 'grounded' | 'ethereal';

  // Timing in milliseconds
  duration: number;
  pauseBefore: number;
  pauseAfter: number;
}

// ============================================================================
// MASTER LOOKUP TABLE
// ============================================================================

export const PROSODY_LOOKUP: Record<string, ProsodyShape> = {
  // ========== PROCESSING/CONTEMPLATION ==========

  'Hm': {
    length: 'short',
    intensity: 'neutral',
    pitch: 'mid',
    breath: 'held',
    texture: 'rough',
    duration: 200,
    pauseBefore: 0,
    pauseAfter: 300
  },

  'Hmm': {
    length: 'medium',
    intensity: 'soft',
    pitch: 'low',
    breath: 'held',
    texture: 'smooth',
    duration: 500,
    pauseBefore: 200,
    pauseAfter: 500
  },

  'Hmm...': {
    length: 'long',
    intensity: 'soft',
    pitch: 'low',
    breath: 'released',
    texture: 'smooth',
    duration: 1200,
    pauseBefore: 400,
    pauseAfter: 800
  },

  'Ahh': {
    length: 'medium',
    intensity: 'neutral',
    pitch: 'falling',
    breath: 'released',
    texture: 'smooth',
    duration: 600,
    pauseBefore: 100,
    pauseAfter: 400
  },

  // ========== EMOTIONAL RESONANCE - POSITIVE ==========

  'Oh!': {
    length: 'short',
    intensity: 'strong',
    pitch: 'high',
    breath: 'released',
    texture: 'crystalline',
    duration: 300,
    pauseBefore: 0,
    pauseAfter: 200
  },

  'Ha': {
    length: 'short',
    intensity: 'soft',
    pitch: 'mid',
    breath: 'released',
    texture: 'rough',
    duration: 250,
    pauseBefore: 0,
    pauseAfter: 300
  },

  'Wow': {
    length: 'long',
    intensity: 'neutral',
    pitch: 'high',
    breath: 'flowing',
    texture: 'smooth',
    duration: 800,
    pauseBefore: 200,
    pauseAfter: 600
  },

  // ========== EMOTIONAL RESONANCE - HEAVY ==========

  'Oh': {
    length: 'medium',
    intensity: 'soft',
    pitch: 'low',
    breath: 'flowing',
    texture: 'smooth',
    duration: 600,
    pauseBefore: 400,
    pauseAfter: 800
  },

  'Mm': {
    length: 'medium',
    intensity: 'neutral',
    pitch: 'mid',
    breath: 'held',
    texture: 'grounded',
    duration: 500,
    pauseBefore: 300,
    pauseAfter: 700
  },

  'Mmm...': {
    length: 'extended',
    intensity: 'soft',
    pitch: 'low',
    breath: 'flowing',
    texture: 'smooth',
    duration: 1500,
    pauseBefore: 600,
    pauseAfter: 1000
  },

  // ========== GROUNDING/ACKNOWLEDGMENT ==========

  'Okay': {
    length: 'short',
    intensity: 'neutral',
    pitch: 'mid',
    breath: 'released',
    texture: 'grounded',
    duration: 400,
    pauseBefore: 200,
    pauseAfter: 400
  },

  'Yes': {
    length: 'short',
    intensity: 'neutral',
    pitch: 'mid',
    breath: 'released',
    texture: 'smooth',
    duration: 300,
    pauseBefore: 100,
    pauseAfter: 300
  },

  'I see': {
    length: 'medium',
    intensity: 'soft',
    pitch: 'mid',
    breath: 'flowing',
    texture: 'smooth',
    duration: 500,
    pauseBefore: 200,
    pauseAfter: 500
  },

  // ========== TRANSITIONS ==========

  'Alright': {
    length: 'medium',
    intensity: 'neutral',
    pitch: 'falling',
    breath: 'released',
    texture: 'grounded',
    duration: 600,
    pauseBefore: 400,
    pauseAfter: 600
  },

  'So': {
    length: 'short',
    intensity: 'neutral',
    pitch: 'rising',
    breath: 'held',
    texture: 'smooth',
    duration: 300,
    pauseBefore: 500,
    pauseAfter: 200
  },

  // ========== MYTHIC/RARE VARIANTS ==========

  'Ha...': {
    length: 'long',
    intensity: 'soft',
    pitch: 'falling',
    breath: 'released',
    texture: 'rough',
    duration: 900,
    pauseBefore: 400,
    pauseAfter: 1000
  },

  'yes': {
    length: 'short',
    intensity: 'whisper',
    pitch: 'low',
    breath: 'suspended',
    texture: 'ethereal',
    duration: 400,
    pauseBefore: 800,
    pauseAfter: 800
  },

  'Ahhh': {
    length: 'extended',
    intensity: 'soft',
    pitch: 'falling',
    breath: 'released',
    texture: 'crystalline',
    duration: 1200,
    pauseBefore: 300,
    pauseAfter: 1000
  },

  // ========== SILENCE (SPECIAL CASE) ==========

  '': {
    length: 'extended',
    intensity: 'whisper',
    pitch: 'low',
    breath: 'suspended',
    texture: 'ethereal',
    duration: 0,
    pauseBefore: 1000,
    pauseAfter: 1500
  }
};

// ============================================================================
// ELEMENTAL MODIFIERS
// ============================================================================

export const ELEMENTAL_MODIFIERS: Record<string, Partial<ProsodyShape>> = {
  fire: {
    length: 'short',
    intensity: 'strong',
    pitch: 'rising',
    texture: 'crystalline',
    duration: -200,  // Reduce duration
    pauseBefore: -100,
    pauseAfter: -100
  },

  water: {
    length: 'long',
    intensity: 'soft',
    breath: 'flowing',
    texture: 'smooth',
    duration: +400,  // Extend duration
    pauseBefore: +200,
    pauseAfter: +300
  },

  earth: {
    intensity: 'neutral',
    pitch: 'low',
    breath: 'released',
    texture: 'grounded',
    duration: 0,  // No change
    pauseBefore: +100,
    pauseAfter: +100
  },

  air: {
    length: 'medium',
    intensity: 'soft',
    pitch: 'high',
    breath: 'flowing',
    texture: 'ethereal',
    duration: -100,
    pauseBefore: 0,
    pauseAfter: +200
  },

  aether: {
    length: 'extended',
    intensity: 'whisper',
    breath: 'suspended',
    texture: 'ethereal',
    duration: +600,
    pauseBefore: +500,
    pauseAfter: +500
  }
};

// ============================================================================
// PROSODY ENGINE WITH AUTO-LOOKUP
// ============================================================================

export class AutoProsodyEngine {
  /**
   * Get prosody shape for utterance with optional elemental modifier
   */
  static getProsody(
    utterance: string,
    elemental?: ElementalState
  ): ProsodyShape {
    // Get base prosody from lookup
    const baseProsody = PROSODY_LOOKUP[utterance];

    if (!baseProsody) {
      // Default prosody for unknown utterances
      return {
        length: 'medium',
        intensity: 'neutral',
        pitch: 'mid',
        breath: 'released',
        texture: 'smooth',
        duration: 400,
        pauseBefore: 200,
        pauseAfter: 400
      };
    }

    // Apply elemental modifier if present
    if (elemental?.dominant) {
      return this.applyElementalModifier(baseProsody, elemental.dominant);
    }

    return baseProsody;
  }

  /**
   * Blend base prosody with elemental characteristics
   */
  private static applyElementalModifier(
    base: ProsodyShape,
    element: string
  ): ProsodyShape {
    const modifier = ELEMENTAL_MODIFIERS[element];
    if (!modifier) return base;

    return {
      length: modifier.length || base.length,
      intensity: modifier.intensity || base.intensity,
      pitch: modifier.pitch || base.pitch,
      breath: modifier.breath || base.breath,
      texture: modifier.texture || base.texture,
      duration: Math.max(100, base.duration + (modifier.duration || 0)),
      pauseBefore: Math.max(0, base.pauseBefore + (modifier.pauseBefore || 0)),
      pauseAfter: Math.max(0, base.pauseAfter + (modifier.pauseAfter || 0))
    };
  }
}

// ============================================================================
// TTS INTEGRATION HELPERS
// ============================================================================

export class ProsodyToTTS {
  /**
   * Convert prosody shape to OpenAI TTS parameters
   */
  static toOpenAIParams(prosody: ProsodyShape): any {
    // Map intensity to speed (inverse relationship)
    const speedMap = {
      'whisper': 0.85,
      'soft': 0.9,
      'neutral': 0.95,
      'strong': 1.0,
      'full': 1.05
    };

    // Map length to additional speed modifier
    const lengthModifier = {
      'short': 1.1,
      'medium': 1.0,
      'long': 0.9,
      'extended': 0.8
    };

    return {
      speed: speedMap[prosody.intensity] * lengthModifier[prosody.length],
      // OpenAI doesn't support pitch/volume directly
      // These would be hints for post-processing
      hints: {
        pitch: prosody.pitch,
        texture: prosody.texture,
        breath: prosody.breath
      }
    };
  }

  /**
   * Convert to SSML approximation (for systems that support it)
   */
  static toSSML(utterance: string, prosody: ProsodyShape): string {
    const rateMap = {
      'short': 'fast',
      'medium': 'medium',
      'long': 'slow',
      'extended': 'x-slow'
    };

    const pitchMap = {
      'low': '-20%',
      'mid': '0%',
      'high': '+20%',
      'rising': '+10%',
      'falling': '-10%'
    };

    const volumeMap = {
      'whisper': 'x-soft',
      'soft': 'soft',
      'neutral': 'medium',
      'strong': 'loud',
      'full': 'x-loud'
    };

    let ssml = '';

    // Add pause before
    if (prosody.pauseBefore > 0) {
      ssml += `<break time="${prosody.pauseBefore}ms"/>`;
    }

    // Add the utterance with prosody
    ssml += `<prosody rate="${rateMap[prosody.length]}"
                      pitch="${pitchMap[prosody.pitch]}"
                      volume="${volumeMap[prosody.intensity]}">
              ${utterance}
            </prosody>`;

    // Add pause after
    if (prosody.pauseAfter > 0) {
      ssml += `<break time="${prosody.pauseAfter}ms"/>`;
    }

    return ssml;
  }

  /**
   * Create timing markers for synchronization
   */
  static toTimingMarkers(prosody: ProsodyShape): any {
    return {
      start: prosody.pauseBefore,
      utteranceDuration: prosody.duration,
      end: prosody.pauseBefore + prosody.duration + prosody.pauseAfter,
      totalDuration: prosody.pauseBefore + prosody.duration + prosody.pauseAfter
    };
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example: Automatic prosody attachment
 */
export function utteranceWithAutoProsody(
  text: string,
  context?: {
    elemental?: ElementalState;
  }
): {
  text: string;
  prosody: ProsodyShape;
  ttsParams: any;
  ssml: string;
} {
  const prosody = AutoProsodyEngine.getProsody(text, context?.elemental);

  return {
    text,
    prosody,
    ttsParams: ProsodyToTTS.toOpenAIParams(prosody),
    ssml: ProsodyToTTS.toSSML(text, prosody)
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  PROSODY_LOOKUP,
  ELEMENTAL_MODIFIERS,
  AutoProsodyEngine,
  ProsodyToTTS,
  utteranceWithAutoProsody
};