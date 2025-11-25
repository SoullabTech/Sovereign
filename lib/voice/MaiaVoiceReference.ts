/**
 * Maya Voice Stage Directions Reference
 * Core utterances that emerge naturally from context
 * Never force - utterances should feel involuntary
 */

// ============================================================================
// CORE UTTERANCE TYPES
// ============================================================================

export interface ProcessingUtterances {
  deepQuestion: "Hmm" | "Hmm..." | null;    // Genuine consideration
  complexity: "Ahh" | null;                  // Recognition dawning
  searching: "";                             // Silent space
  connecting: "Oh" | null;                   // Pattern recognition
}

export interface EmotionalUtterances {
  // Positive spectrum
  celebration: "Oh!" | null;                 // Genuine excitement
  delight: "Ha" | null;                      // Soft surprise/pleasure
  wonder: "Wow" | null;                      // Authentic amazement

  // Heavy spectrum
  grief: "" | "Oh" | null;                   // Space or gentle receive (soft "Oh")
  pain: "Mm" | null;                         // Holding without fixing
  fear: "" | null;                           // Present silence

  // Neutral spectrum
  acknowledgment: "Yes" | "Okay" | null;     // Simple receipt
  understanding: "I see" | null;             // Clear comprehension
}

export interface TransitionUtterances {
  naturalShift: "";                          // No marker needed
  significantTurn: "Alright" | null;        // Acknowledging change
  returning: "So" | null;                    // Only if genuinely synthesizing
  deepening: "";                             // Let silence do the work
}

// ============================================================================
// IMPLEMENTATION INTERFACES
// ============================================================================

export interface ProcessedInput {
  raw: string;
  isQuestion: boolean;
  complexity: number;              // 0-1 scale
  emotionalWeight: number;         // 0-1 scale
  callsForResponse: boolean;
  hasUrgency: boolean;
  needsSpace: boolean;
}

export interface MayaContext {
  previousExchange: string | null;
  emotionalShift: number;          // 0-1 scale
  significantPatternShift: boolean;
  conversationDepth: number;       // 0-1 scale
  userState: 'exploring' | 'processing' | 'releasing' | 'integrating';
}

export interface EmotionalState {
  valence: 'positive' | 'negative' | 'neutral' | 'mixed';
  intensity: number;                // 0-1 scale
  stability: number;                // 0-1 scale
  trajectory: 'rising' | 'falling' | 'steady';
}

// ============================================================================
// UTTERANCE ENGINE
// ============================================================================

export class MayaUtteranceEngine {
  private config = {
    enabled: true,
    maxPerResponse: 1,
    requireGenuineEmergence: true,
    silenceThreshold: 0.7,          // Prefer silence unless strong signal
  };

  /**
   * Generate utterance only if it naturally emerges
   * Never force - most responses need no utterance
   */
  generateUtterance(
    input: ProcessedInput,
    context: MayaContext,
    emotionalField: EmotionalState
  ): string | null {

    // Never force an utterance
    if (!this.utteranceNaturallyEmerges(input, context, emotionalField)) {
      return null;
    }

    // Deep questions that require genuine thinking
    if (input.isQuestion && input.complexity > 0.7) {
      if (input.emotionalWeight > 0.6) {
        return "Hmm...";  // Deeper contemplation
      }
      return "Hmm";       // Active consideration
    }

    // Recognition or pattern connection
    if (context.significantPatternShift && context.emotionalShift > 0.5) {
      return "Ahh";       // Recognition dawning
    }

    // Emotional responses - must feel involuntary
    if (emotionalField.intensity > 0.8) {
      if (emotionalField.valence === 'positive') {
        if (emotionalField.trajectory === 'rising') {
          return "Oh!";   // Sharing excitement
        }
        if (input.complexity < 0.3) {
          return "Ha";    // Simple delight
        }
      }

      if (emotionalField.valence === 'negative') {
        if (input.needsSpace) {
          return "";      // Silence holds space
        }
        if (emotionalField.intensity > 0.9) {
          return "Oh";    // Soft, receiving weight
        }
      }
    }

    // Significant transitions
    if (context.significantPatternShift) {
      if (context.conversationDepth > 0.7) {
        return "";        // Deep work needs no markers
      }
    }

    // Default: no utterance
    return null;
  }

  /**
   * Check if utterance naturally emerges from moment
   */
  private utteranceNaturallyEmerges(
    input: ProcessedInput,
    context: MayaContext,
    emotionalField: EmotionalState
  ): boolean {
    // Utterance should feel involuntary
    const emergenceSignal =
      (input.callsForResponse ? 0.3 : 0) +
      (context.emotionalShift * 0.3) +
      (input.complexity * 0.2) +
      (emotionalField.intensity * 0.2);

    return emergenceSignal > this.config.silenceThreshold;
  }
}

// ============================================================================
// QUALITY CONTROL
// ============================================================================

export class UtteranceQualityControl {
  // Patterns to NEVER use
  private static readonly FORBIDDEN_PATTERNS = [
    /^So,\s+/i,                     // Formulaic opener
    /^Mm-hmm/i,                     // Therapy performance
    /^I hear you/i,                 // Unless specifically contextual
    /^That must be/i,               // Assumption pattern
    /^Thank you for sharing/i,      // Therapist mode
    /\[.*?\]/,                      // Stage directions
    /\(.*?\)/,                      // Parenthetical directions
  ];

  /**
   * Ensure no stage directions in spoken text
   */
  static cleanForSpeech(text: string): string {
    let cleaned = text;

    // Remove all stage directions and markup
    cleaned = cleaned
      .replace(/\[.*?\]/g, '')       // Remove bracketed directions
      .replace(/\(.*?\)/g, '')       // Remove parenthetical directions
      .replace(/\*.*?\*/g, '')       // Remove emphasized directions
      .replace(/_.*?_/g, '')          // Remove italicized directions
      .trim();

    return cleaned;
  }

  /**
   * Validate utterance is genuine, not performative
   */
  static validateUtterance(
    utterance: string | null,
    context: MayaContext
  ): boolean {
    if (!utterance) return true;     // No utterance is often most genuine

    // Check against forbidden patterns
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(utterance)) {
        console.warn(`Blocked performative utterance: "${utterance}"`);
        return false;
      }
    }

    return true;
  }
}

// ============================================================================
// NATURAL FLOW EXAMPLES
// ============================================================================

export const NATURAL_FLOW_EXAMPLES = {
  question: {
    user: "What do you think happens when we die?",
    maya: "Hmm. What feels true to you about it?",
    utterance: "Hmm",
    reason: "Deep question requiring genuine contemplation"
  },

  celebration: {
    user: "I got the job!",
    maya: "Oh! When do you start?",
    utterance: "Oh!",
    reason: "Genuine excitement, sharing the moment"
  },

  grief: {
    user: "I can't stop crying today",
    maya: "What kind of tears are they?",
    utterance: "",
    reason: "Silence holds space better than words"
  },

  complexity: {
    user: "Is it weird that I feel relief that she's gone?",
    maya: "Relief makes complete sense.",
    utterance: null,
    reason: "Direct response more powerful than utterance"
  },

  recognition: {
    user: "Wait, so my anxiety might actually be protecting me?",
    maya: "Ahh. What does it protect you from?",
    utterance: "Ahh",
    reason: "Recognition of insight dawning"
  }
};

// ============================================================================
// CONFIGURATION EXPORT
// ============================================================================

export const MAYA_UTTERANCE_CONFIG = {
  enabled: true,
  maxPerResponse: 1,
  requireGenuineEmergence: true,
  silenceThreshold: 0.7,

  // Never apply utterances formulaically
  utteranceMap: {
    processing: {
      deep: "Hmm",
      veryDeep: "Hmm...",
      recognition: "Ahh",
      connecting: "Oh",
      searching: ""
    },

    emotional: {
      celebration: { high: "Oh!", medium: null },
      delight: { genuine: "Ha", forced: null },
      wonder: { authentic: "Wow", mild: null },
      grief: { acute: "", held: "Oh", witnessed: "Mm" },
      fear: { present: "", acknowledged: null }
    },

    transition: {
      natural: "",
      significant: { deep: "", surface: "Alright" },
      synthesis: { genuine: "So", forced: null },
      deepening: ""
    }
  },

  // Validation rules
  rules: {
    noMultipleUtterances: true,
    noPerformativePatterns: true,
    requireContextualEmergence: true,
    preferSilence: true,
    noStageDirections: true
  }
};

// ============================================================================
// INTEGRATION HELPER
// ============================================================================

/**
 * Main integration point for Maya's voice system
 * Ensures no stage directions ever reach speech synthesis
 */
export function prepareForSpeech(
  text: string,
  userInput: string,
  context?: MayaContext
): string {
  // First, clean any stage directions
  const cleaned = UtteranceQualityControl.cleanForSpeech(text);

  // Don't add utterances if they're already in the text
  if (/^(Hmm|Oh|Ahh|Mm|Ha|Wow)[\s.,!]/.test(cleaned)) {
    return cleaned;
  }

  // Otherwise, check if utterance naturally emerges
  // (This would need full implementation with proper analysis)

  return cleaned;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  MayaUtteranceEngine,
  UtteranceQualityControl,
  prepareForSpeech,
  MAYA_UTTERANCE_CONFIG,
  NATURAL_FLOW_EXAMPLES
};