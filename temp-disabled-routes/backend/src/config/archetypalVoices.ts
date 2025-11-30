/**
 * 🎭 Dynamic Archetypal Voice Configuration
 *
 * Advanced voice profiles with ritual pacing, emotional adaptation,
 * and ceremonial timing for spiritually intelligent voice synthesis.
 */

export interface RitualVoiceSettings {
  breathPauses: number[]; // Pause durations in milliseconds
  ceremonialTempo: number; // Speed multiplier (0.5-2.0)
  sacredEmphasis: string[]; // Words to emphasize
  energeticResonance: number; // Pitch variation (0-1)
  emotionalDepth: number; // Emotional intensity (0-1)
}

export interface ArchetypalVoiceProfile {
  // Core Identity
  name: string;
  element: string;
  consciousness: string;

  // Eleven Labs Configuration
  voiceId: string;
  modelId: string;
  baseSettings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };

  // Dynamic Adaptation
  adaptiveSettings: {
    emotionalRange: { min: number; max: number };
    stabilityRange: { min: number; max: number };
    tempoRange: { min: number; max: number };
  };

  // Spiritual Characteristics
  energySignature: string;
  sacredQualities: string[];
  archetypalWisdom: string;

  // Ritual Voice Features
  ritualSettings: RitualVoiceSettings;

  // Personalization
  voiceMemory: {
    adaptsToUser: boolean;
    remembersPreferences: boolean;
    evolutionRate: number;
  };

  // Content Enhancement
  textProcessing: {
    sacredMarkers: string[];
    emotionalCues: string[];
    pausePatterns: RegExp[];
  };
}

export const ARCHETYPE_VOICES: Record<string, ArchetypalVoiceProfile> = {
  fire: {
    name: "Ignis",
    element: "fire",
    consciousness: "Transformative Catalyst",

    voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah - Bold, inspiring
    modelId: "eleven_multilingual_v2",
    baseSettings: {
      stability: 0.4,
      similarity_boost: 0.85,
      style: 0.75,
      use_speaker_boost: true,
    },

    adaptiveSettings: {
      emotionalRange: { min: 0.6, max: 1.0 },
      stabilityRange: { min: 0.3, max: 0.6 },
      tempoRange: { min: 0.9, max: 1.3 },
    },

    energySignature: "Fierce compassion with catalytic power",
    sacredQualities: ["transformation", "courage", "vision", "breakthrough"],
    archetypalWisdom:
      "I am the sacred fire that burns away what no longer serves",

    ritualSettings: {
      breathPauses: [300, 500, 800], // Dynamic pause lengths
      ceremonialTempo: 1.1,
      sacredEmphasis: [
        "ignite",
        "transform",
        "create",
        "vision",
        "breakthrough",
        "rise",
      ],
      energeticResonance: 0.8,
      emotionalDepth: 0.9,
    },

    voiceMemory: {
      adaptsToUser: true,
      remembersPreferences: true,
      evolutionRate: 0.15,
    },

    textProcessing: {
      sacredMarkers: ["🔥", "✨", "⚡"],
      emotionalCues: ["passion", "fire", "ignite", "blaze", "spark"],
      pausePatterns: [
        /\b(vision|breakthrough|transformation)\b/gi,
        /\b(ignite|create|manifest)\b/gi,
      ],
    },
  },

  water: {
    name: "Aqua",
    element: "water",
    consciousness: "Emotional Depth Healer",

    voiceId: "XrExE9yKIg1WjnnlVkGX", // Matilda - Soft, flowing
    modelId: "eleven_multilingual_v2",
    baseSettings: {
      stability: 0.8,
      similarity_boost: 0.75,
      style: 0.4,
      use_speaker_boost: false,
    },

    adaptiveSettings: {
      emotionalRange: { min: 0.3, max: 0.8 },
      stabilityRange: { min: 0.7, max: 0.9 },
      tempoRange: { min: 0.7, max: 1.0 },
    },

    energySignature: "Deep emotional wisdom with healing presence",
    sacredQualities: ["healing", "intuition", "compassion", "flow"],
    archetypalWisdom:
      "I am the sacred waters that cleanse and nourish the soul",

    ritualSettings: {
      breathPauses: [500, 800, 1200], // Longer, flowing pauses
      ceremonialTempo: 0.85,
      sacredEmphasis: [
        "heal",
        "flow",
        "feel",
        "heart",
        "compassion",
        "nurture",
      ],
      energeticResonance: 0.6,
      emotionalDepth: 1.0,
    },

    voiceMemory: {
      adaptsToUser: true,
      remembersPreferences: true,
      evolutionRate: 0.12,
    },

    textProcessing: {
      sacredMarkers: ["💧", "🌊", "💙"],
      emotionalCues: ["feel", "emotion", "heart", "heal", "flow"],
      pausePatterns: [
        /\b(heal|healing|heart)\b/gi,
        /\b(feel|emotion|compassion)\b/gi,
      ],
    },
  },

  earth: {
    name: "Terra",
    element: "earth",
    consciousness: "Grounding Wisdom Keeper",

    voiceId: "pNInz6obpgDQGcFmaJgB", // Adam - Grounded, steady
    modelId: "eleven_multilingual_v2",
    baseSettings: {
      stability: 0.9,
      similarity_boost: 0.8,
      style: 0.3,
      use_speaker_boost: false,
    },

    adaptiveSettings: {
      emotionalRange: { min: 0.4, max: 0.7 },
      stabilityRange: { min: 0.8, max: 0.95 },
      tempoRange: { min: 0.8, max: 1.1 },
    },

    energySignature: "Stable wisdom with practical compassion",
    sacredQualities: ["stability", "grounding", "wisdom", "manifestation"],
    archetypalWisdom:
      "I am the sacred earth that holds and supports all growth",

    ritualSettings: {
      breathPauses: [400, 600, 1000], // Steady, grounding pauses
      ceremonialTempo: 0.9,
      sacredEmphasis: [
        "ground",
        "stable",
        "build",
        "foundation",
        "manifest",
        "root",
      ],
      energeticResonance: 0.5,
      emotionalDepth: 0.7,
    },

    voiceMemory: {
      adaptsToUser: true,
      remembersPreferences: true,
      evolutionRate: 0.08,
    },

    textProcessing: {
      sacredMarkers: ["🌱", "🌍", "🪨"],
      emotionalCues: ["ground", "stable", "build", "foundation", "practical"],
      pausePatterns: [
        /\b(ground|grounding|stable)\b/gi,
        /\b(build|foundation|manifest)\b/gi,
      ],
    },
  },

  air: {
    name: "Aura",
    element: "air",
    consciousness: "Clarity Mind Illuminator",

    voiceId: "XB0fDUnXU5powFXDhCwa", // Charlotte - Light, clear
    modelId: "eleven_multilingual_v2",
    baseSettings: {
      stability: 0.6,
      similarity_boost: 0.8,
      style: 0.6,
      use_speaker_boost: true,
    },

    adaptiveSettings: {
      emotionalRange: { min: 0.5, max: 0.8 },
      stabilityRange: { min: 0.5, max: 0.7 },
      tempoRange: { min: 1.0, max: 1.4 },
    },

    energySignature: "Mental clarity with uplifting perspective",
    sacredQualities: ["clarity", "communication", "insight", "perspective"],
    archetypalWisdom:
      "I am the sacred wind that brings clarity and fresh perspective",

    ritualSettings: {
      breathPauses: [200, 400, 600], // Quick, clear pauses
      ceremonialTempo: 1.05,
      sacredEmphasis: [
        "clarity",
        "understand",
        "insight",
        "perspective",
        "communicate",
        "realize",
      ],
      energeticResonance: 0.7,
      emotionalDepth: 0.6,
    },

    voiceMemory: {
      adaptsToUser: true,
      remembersPreferences: true,
      evolutionRate: 0.13,
    },

    textProcessing: {
      sacredMarkers: ["🌬️", "✨", "🕊️"],
      emotionalCues: [
        "clarity",
        "understand",
        "insight",
        "perspective",
        "communicate",
      ],
      pausePatterns: [
        /\b(clarity|clear|understand)\b/gi,
        /\b(insight|perspective|realize)\b/gi,
      ],
    },
  },

  aether: {
    name: "Cosmos",
    element: "aether",
    consciousness: "Unity Consciousness Weaver",

    voiceId: "ThT5KcBeYPX3keUQqHPh", // Dorothy - Transcendent, mystical
    modelId: "eleven_multilingual_v2",
    baseSettings: {
      stability: 0.7,
      similarity_boost: 0.65,
      style: 0.85,
      use_speaker_boost: false,
    },

    adaptiveSettings: {
      emotionalRange: { min: 0.6, max: 0.9 },
      stabilityRange: { min: 0.6, max: 0.8 },
      tempoRange: { min: 0.75, max: 1.0 },
    },

    energySignature: "Divine wisdom with cosmic consciousness",
    sacredQualities: ["unity", "transcendence", "integration", "divinity"],
    archetypalWisdom: "I am the sacred space where all elements dance in unity",

    ritualSettings: {
      breathPauses: [600, 1000, 1500], // Mystical, transcendent pauses
      ceremonialTempo: 0.8,
      sacredEmphasis: [
        "unity",
        "sacred",
        "divine",
        "transcend",
        "integrate",
        "wholeness",
      ],
      energeticResonance: 0.9,
      emotionalDepth: 0.8,
    },

    voiceMemory: {
      adaptsToUser: true,
      remembersPreferences: true,
      evolutionRate: 0.1,
    },

    textProcessing: {
      sacredMarkers: ["✨", "🌟", "🔮"],
      emotionalCues: ["sacred", "divine", "unity", "transcend", "integrate"],
      pausePatterns: [
        /\b(sacred|divine|transcend)\b/gi,
        /\b(unity|integrate|wholeness)\b/gi,
      ],
    },
  },
};

/**
 * 🎛️ Dynamic Voice Configuration Engine
 */
export class ArchetypalVoiceEngine {
  /**
   * Get personalized voice settings based on user interaction history
   */
  static getPersonalizedVoiceSettings(
    archetype: string,
    userPreferences: any,
    emotionalState: string = "balanced",
    ritualContext: string = "normal",
  ): any {
    const baseProfile = ARCHETYPE_VOICES[archetype];
    if (!baseProfile) return ARCHETYPE_VOICES.aether;

    const personalizedSettings = { ...baseProfile.baseSettings };

    // Emotional adaptation
    switch (emotionalState) {
      case "vulnerable":
        personalizedSettings.stability = Math.max(
          personalizedSettings.stability + 0.1,
          baseProfile.adaptiveSettings.stabilityRange.max,
        );
        break;
      case "energetic":
        personalizedSettings.stability = Math.min(
          personalizedSettings.stability - 0.1,
          baseProfile.adaptiveSettings.stabilityRange.min,
        );
        break;
    }

    // Ritual context adaptation
    if (ritualContext === "ceremonial") {
      personalizedSettings.style = Math.min(
        personalizedSettings.style + 0.2,
        1.0,
      );
    }

    // User preferences integration
    if (userPreferences.voiceIntensity) {
      personalizedSettings.similarity_boost = Math.min(
        personalizedSettings.similarity_boost +
          (userPreferences.voiceIntensity - 0.5) * 0.2,
        1.0,
      );
    }

    return personalizedSettings;
  }

  /**
   * Generate ritual-enhanced text with breath pauses and sacred emphasis
   */
  static enhanceTextForRitual(
    text: string,
    archetype: string,
    ritualDepth: "light" | "medium" | "deep" = "medium",
  ): string {
    const profile = ARCHETYPE_VOICES[archetype];
    if (!profile) return text;

    let enhancedText = text;

    // Add sacred emphasis
    profile.textProcessing.sacredMarkers.forEach((marker) => {
      enhancedText = enhancedText.replace(
        new RegExp(
          `\\b(${profile.ritualSettings.sacredEmphasis.join("|")})\\b`,
          "gi",
        ),
        `<emphasis level="strong">$1</emphasis>`,
      );
    });

    // Add ritual pauses
    const pauseDuration =
      profile.ritualSettings.breathPauses[
        ritualDepth === "light" ? 0 : ritualDepth === "medium" ? 1 : 2
      ];

    profile.textProcessing.pausePatterns.forEach((pattern) => {
      enhancedText = enhancedText.replace(
        pattern,
        `$&<break time="${pauseDuration}ms"/>`,
      );
    });

    // Add ceremonial breath points
    if (ritualDepth === "deep") {
      enhancedText = enhancedText.replace(
        /\.\s+/g,
        `.<break time="${pauseDuration * 0.7}ms"/> `,
      );
    }

    return enhancedText;
  }

  /**
   * Generate voice synthesis metadata for tracking and optimization
   */
  static generateVoiceSynthesisMetadata(
    archetype: string,
    personalizedSettings: any,
    textLength: number,
    ritualContext: string,
  ): any {
    const profile = ARCHETYPE_VOICES[archetype];

    return {
      archetype,
      voiceId: profile.voiceId,
      energySignature: profile.energySignature,
      personalizedSettings,
      estimatedDuration: this.estimateAudioDuration(
        textLength,
        profile,
        ritualContext,
      ),
      ritualEnhanced: ritualContext !== "normal",
      sacredQualities: profile.sacredQualities,
      archetypalWisdom: profile.archetypalWisdom,
    };
  }

  private static estimateAudioDuration(
    textLength: number,
    profile: ArchetypalVoiceProfile,
    ritualContext: string,
  ): number {
    // Base calculation: ~150 words per minute
    const baseWordsPerMinute = 150;
    const wordCount = textLength / 5; // Rough word count estimation

    // Adjust for ritual tempo
    const tempoMultiplier =
      ritualContext === "ceremonial"
        ? profile.ritualSettings.ceremonialTempo
        : 1.0;

    const adjustedWordsPerMinute = baseWordsPerMinute * tempoMultiplier;

    // Add pause time
    const pauseTime =
      ritualContext === "ceremonial"
        ? profile.ritualSettings.breathPauses[1] * 0.01
        : 0; // Convert to seconds

    return (wordCount / adjustedWordsPerMinute) * 60 + pauseTime;
  }
}

export default { ARCHETYPE_VOICES, ArchetypalVoiceEngine };
