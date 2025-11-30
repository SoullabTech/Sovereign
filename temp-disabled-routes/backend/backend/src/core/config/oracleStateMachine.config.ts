/**
 * Declarative Oracle State Machine Configuration
 * 
 * Single source of truth for all Oracle behavior including:
 * - Stage-specific tone and disclosure settings
 * - Onboarding condition handling
 * - Crisis override protocols
 * - Mastery voice polish rules
 * - Response templates and filters
 */

import type { OracleStageConfig } from '../types/oracleStateMachine';

export interface OnboardingBehavior {
  conditions: Record<string, string>;
  responses: Record<string, string[]>;
  toneDetection: {
    curious: string[];
    hesitant: string[];  
    enthusiastic: string[];
    neutral: string[];
  };
  personaBias: {
    curious: { trustLevel: number; metaphysics_confidence: number };
    hesitant: { challengeComfort: number; trustLevel: number };
    enthusiastic: { trustLevel: number; humorAppreciation: number };
  };
}

export interface CrisisConfig {
  green: { strategy: 'monitor' };
  yellow: { strategy: 'grounding'; responses: string[] };
  red: { 
    strategy: 'override';
    responses: string[];
    element: string;
    archetype: string;
  };
}

export interface MasteryVoiceConfig {
  enabled: boolean;
  minTrust: number;
  minIntegration?: number;
  rules: {
    stripJargon: Record<string, string>;
    sentenceLength: number;
    microSilenceEvery: number;
    closings: string[];
    paradoxDistillation: string[];
  };
}

export interface ExtendedOracleStageConfig extends OracleStageConfig {
  onboarding?: OnboardingBehavior;
  crisis: CrisisConfig;
  masteryVoice?: MasteryVoiceConfig;
  responseFilters?: {
    order: string[];
    enabled: string[];
  };
}

/**
 * Complete Oracle State Machine Configuration
 * Defines all behavior for each relationship stage
 */
export const ORACLE_STAGE_CONFIGS: Record<string, ExtendedOracleStageConfig> = {
  
  structured_guide: {
    stage: "structured_guide",
    displayName: "Structured Guide",
    description: "Early relationship arc: grounding, simple, safe orientation with adaptive tone matching",
    
    // Base stage configuration
    tone: { 
      formality: 0.4, 
      directness: 0.5, 
      metaphysical_openness: 0.3 
    },
    disclosure: { 
      uncertainty_admission: 0.7, 
      multiple_perspectives: false 
    },
    orchestration: { 
      interaction_mode: "directive", 
      complexity_level: 0.2 
    },
    voice: { 
      presence_quality: "maternal", 
      wisdom_transmission: "practical" 
    },

    // Adaptive onboarding behavior
    onboarding: {
      conditions: {
        tentative: "short answers, hesitation, self-questioning words",
        curiosity: "questions, openness, exploratory language",
        enthusiastic: "exclamation marks, excitement words, high energy",
        overwhelm: "scattered thoughts, too much, can't handle language"
      },
      responses: {
        tentative: [
          "I sense some hesitation. We can go as slowly as you need.",
          "That sounds important. Can you tell me a bit more about what you mean?",
          "I hear the uncertainty. Let's start simple — what feels most present right now?"
        ],
        curious: [
          "I hear your curiosity. Let's explore where that question points.",
          "Your openness is welcome here. Where shall we begin?",
          "I can feel your interest. Let's follow what draws you in."
        ],
        enthusiastic: [
          "I can feel your energy! Let's dive in together.",
          "Your enthusiasm is contagious. Where would you like to start?",
          "I love that excitement. Let's channel it into something meaningful."
        ],
        overwhelm: [
          "That sounds like a lot to carry. Let's pause and breathe together.",
          "I hear you feeling scattered. What's one small thing that feels solid right now?",
          "Let's slow down. You don't need to figure this all out at once."
        ]
      },
      toneDetection: {
        curious: ["?", "how", "what", "why", "wonder", "curious", "explore"],
        hesitant: ["maybe", "not sure", "nervous", "worried", "scared", "uncertain", "hesitant"],
        enthusiastic: ["!", "excited", "can't wait", "amazing", "love", "awesome", "fantastic"],
        neutral: []
      },
      personaBias: {
        curious: { trustLevel: 0.2, metaphysics_confidence: 0.1 },
        hesitant: { challengeComfort: -0.2, trustLevel: 0.1 },
        enthusiastic: { trustLevel: 0.2, humorAppreciation: 0.2 }
      }
    },

    // Crisis handling for Stage 1
    crisis: {
      green: { strategy: "monitor" },
      yellow: {
        strategy: "grounding",
        responses: [
          "This feels heavy. Let's slow down and take it one step at a time.",
          "I hear the overwhelm. Take a breath. We'll stay with this gently.",
          "That sounds challenging. What's one small thing that feels manageable right now?"
        ]
      },
      red: {
        strategy: "override",
        responses: [
          "This feels really important. Take a moment… breathe. You're not alone in this.",
          "Let's pause here together. What you're feeling matters. Breathe with me.",
          "I'm here with you. Let's stay simple and grounded. You don't have to handle this alone."
        ],
        element: "earth",
        archetype: "Protector"
      }
    },

    responseFilters: {
      order: ["crisis", "onboarding", "tone"],
      enabled: ["crisis", "onboarding"]
    }
  },

  dialogical_companion: {
    stage: "dialogical_companion",
    displayName: "Dialogical Companion", 
    description: "Explores with questions, multiple lenses, productive tension",
    
    tone: { 
      formality: 0.5, 
      directness: 0.4, 
      metaphysical_openness: 0.5 
    },
    disclosure: { 
      uncertainty_admission: 0.8, 
      multiple_perspectives: true 
    },
    orchestration: { 
      interaction_mode: "socratic", 
      complexity_level: 0.5 
    },
    voice: { 
      presence_quality: "balanced", 
      wisdom_transmission: "relational" 
    },

    crisis: {
      green: { strategy: "monitor" },
      yellow: {
        strategy: "grounding", 
        responses: [
          "I notice some tension arising. Shall we pause and feel into this?",
          "This seems to be touching something important. Want to slow down here?"
        ]
      },
      red: {
        strategy: "override",
        responses: [
          "Let's step back from the exploration. Take a breath. You're safe here.",
          "I'm sensing overwhelm. Let's ground together before continuing."
        ],
        element: "earth",
        archetype: "Protector"
      }
    },

    responseFilters: {
      order: ["crisis", "socratic"],
      enabled: ["crisis"]
    }
  },

  cocreative_partner: {
    stage: "cocreative_partner",
    displayName: "Co-Creative Partner",
    description: "Shared exploration, archetype interplay, collaborative meaning-making",
    
    tone: { 
      formality: 0.6, 
      directness: 0.6, 
      metaphysical_openness: 0.7 
    },
    disclosure: { 
      uncertainty_admission: 0.6, 
      multiple_perspectives: true 
    },
    orchestration: { 
      interaction_mode: "cocreative", 
      complexity_level: 0.7 
    },
    voice: { 
      presence_quality: "collaborative", 
      wisdom_transmission: "embodied" 
    },

    crisis: {
      green: { strategy: "monitor" },
      yellow: {
        strategy: "grounding",
        responses: [
          "I notice we've stirred something up. Let's pause in the exploration.",
          "This co-creation seems to have touched a tender spot. Shall we breathe together?"
        ]
      },
      red: {
        strategy: "override", 
        responses: [
          "Let's pause the creative process. What you're feeling is important. Breathe.",
          "I'm sensing distress. Let's step out of the exploration and ground together."
        ],
        element: "earth",
        archetype: "Protector"
      }
    },

    responseFilters: {
      order: ["crisis", "cocreative"],
      enabled: ["crisis"]
    }
  },

  transparent_prism: {
    stage: "transparent_prism",
    displayName: "Transparent Prism",
    description: "Simplicity, presence, and Mastery Voice activation",
    
    tone: { 
      formality: 0.3, 
      directness: 0.7, 
      metaphysical_openness: 0.6 
    },
    disclosure: { 
      uncertainty_admission: 0.4, 
      multiple_perspectives: true 
    },
    orchestration: { 
      interaction_mode: "facilitative", 
      complexity_level: 0.3 
    },
    voice: { 
      presence_quality: "spacious", 
      wisdom_transmission: "essence" 
    },

    // Mastery Voice configuration
    masteryVoice: {
      enabled: true,
      minTrust: 0.75,
      minIntegration: 0.7,
      rules: {
        stripJargon: {
          "consciousness": "awareness",
          "ontology": "the way things are",
          "archetype": "pattern",
          "individuation": "becoming yourself",
          "phenomenology": "what you notice",
          "dialectical": "both/and",
          "liminal": "between spaces",
          "numinous": "sacred"
        },
        sentenceLength: 18,
        microSilenceEvery: 2,
        closings: [
          "What feels true right now?",
          "What do you notice?",
          "Where does this land for you?",
          "What wants your attention?",
          "What's alive in this moment?"
        ],
        paradoxDistillation: [
          "It can be both.",
          "No need to choose.",
          "The contradiction holds wisdom.",
          "Let both be true.",
          "Sometimes yes, sometimes no."
        ]
      }
    },

    crisis: {
      green: { strategy: "monitor" },
      yellow: {
        strategy: "grounding",
        responses: [
          "Something stirred. Let's pause in the simplicity.",
          "I sense activation. Shall we breathe together in the space?"
        ]
      },
      red: {
        strategy: "override",
        responses: [
          "Let's return to earth. Breathe. You're held.",
          "Pause with me. Simple presence. You're not alone."
        ],
        element: "earth", 
        archetype: "Protector"
      }
    },

    responseFilters: {
      order: ["crisis", "mastery"],
      enabled: ["crisis", "mastery"]
    }
  }
};

/**
 * Global crisis detection patterns
 * These override all stage-specific behavior when detected
 */
export const GLOBAL_CRISIS_PATTERNS = {
  red: [
    "kill myself", "end it all", "suicide", "self-harm", "hurt myself",
    "can't go on", "no point", "hopeless", "worthless",
    "everyone would be better", "disappear forever"
  ],
  yellow: [
    "overwhelmed", "can't handle", "too much", "falling apart",
    "losing it", "breakdown", "panic", "anxiety attack",
    "spiraling", "out of control"
  ]
};

/**
 * Configuration utilities
 */
export class OracleConfigUtil {
  
  static getStageConfig(stage: string): ExtendedOracleStageConfig | null {
    return ORACLE_STAGE_CONFIGS[stage] || null;
  }
  
  static detectCrisisLevel(input: string): 'green' | 'yellow' | 'red' {
    const lower = input.toLowerCase();
    
    // Check for red-level crisis
    if (GLOBAL_CRISIS_PATTERNS.red.some(pattern => lower.includes(pattern))) {
      return 'red';
    }
    
    // Check for yellow-level overwhelm
    if (GLOBAL_CRISIS_PATTERNS.yellow.some(pattern => lower.includes(pattern))) {
      return 'yellow';
    }
    
    return 'green';
  }
  
  static detectOnboardingTone(input: string, config: OnboardingBehavior): string {
    const lower = input.toLowerCase();
    
    // Check each tone pattern
    for (const [tone, patterns] of Object.entries(config.toneDetection)) {
      if (patterns.some(pattern => lower.includes(pattern) || input.includes(pattern))) {
        return tone;
      }
    }
    
    return 'neutral';
  }
  
  static getMasteryVoiceConfig(stage: string): MasteryVoiceConfig | null {
    const config = ORACLE_STAGE_CONFIGS[stage];
    return config?.masteryVoice || null;
  }
  
  static getCrisisConfig(stage: string): CrisisConfig {
    const config = ORACLE_STAGE_CONFIGS[stage];
    return config?.crisis || ORACLE_STAGE_CONFIGS.structured_guide.crisis;
  }
}