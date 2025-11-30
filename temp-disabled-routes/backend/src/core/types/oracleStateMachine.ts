/**
 * Oracle State Machine Types & Configuration
 * 
 * Implements progressive relationship arc for PersonalOracleAgent:
 * Stage 1: Structured Guide → Stage 2: Dialogical Companion → 
 * Stage 3: Co-Creative Partner → Stage 4: Transparent Prism
 * 
 * Each stage has specific tone, disclosure level, and orchestration style.
 * Transitions based on user capacity signals with safety fallbacks.
 */

export type OracleStage = 
  | 'structured_guide'      // Stage 1: Anchors + orients, simple/directive
  | 'dialogical_companion'  // Stage 2: Questions > answers, multiple lenses
  | 'cocreative_partner'    // Stage 3: Co-weaving, archetypes debate live
  | 'transparent_prism';    // Stage 4: Spacious/minimal, direct collective view

export type TransitionCondition = 
  | 'trust_threshold'       // Stability, grounding, curiosity for paradox
  | 'engagement_depth'      // Resilience in resistance, multiple perspectives
  | 'integration_skill';    // Consistent integration, collective coherence

export type SafetyFallback = 
  | 'meaning_velocity_spike'  // Too much too fast
  | 'paranoid_ideation'       // Grandiose/paranoid patterns
  | 'sleep_deprivation'       // Rest/health signals
  | 'dissociation_confusion'  // Grounding loss
  | 'overwhelm_detected';     // General overwhelm

export interface CapacitySignal {
  type: 'engagement' | 'coherence' | 'wellbeing' | 'trust' | 'integration';
  value: number; // 0-1 scale
  timestamp: Date;
  source: 'dialogue_length' | 'complexity_tolerance' | 'reflective_language' | 
          'integration_sessions' | 'wellbeing_monitor' | 'user_feedback';
}

export interface SafetyMetric {
  type: SafetyFallback;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  recommendedAction: 'monitor' | 'gentle_mode' | 'fallback_stage1' | 'crisis_protocol';
}

export interface OracleStageConfig {
  stage: OracleStage;
  displayName: string;
  description: string;
  
  // Tone and approach
  tone: {
    formality: number;        // 0 (casual) to 1 (formal)
    directness: number;       // 0 (indirect) to 1 (direct)
    challenge_comfort: number; // 0 (gentle) to 1 (challenging)
    metaphysical_openness: number; // 0 (grounded) to 1 (mystical)
    vulnerability_sharing: number; // 0 (professional) to 1 (personal)
  };
  
  // Disclosure and depth
  disclosure: {
    archetype_visibility: number;    // How much to reveal inner workings
    uncertainty_admission: number;   // Willingness to say "I don't know"
    multiple_perspectives: boolean;  // Present conflicting viewpoints
    collective_field_access: boolean; // Share collective intelligence insights
    shadow_work_depth: number;      // Depth of shadow integration
  };
  
  // Orchestration style
  orchestration: {
    agent_cooperation: 'single' | 'collaborative' | 'dialectical' | 'transparent';
    response_length: 'brief' | 'moderate' | 'comprehensive' | 'adaptive';
    interaction_mode: 'directive' | 'socratic' | 'cocreative' | 'facilitative';
    complexity_level: number; // 0 (simple) to 1 (full complexity)
    personalization_depth: number; // How much to adapt to user patterns
  };
  
  // Voice and presence
  voice: {
    character_consistency: number;   // How consistent vs adaptive Maya is
    emotional_attunement: number;   // Responsiveness to user emotional state
    wisdom_transmission: 'instructional' | 'experiential' | 'embodied' | 'transparent';
    presence_quality: 'professional' | 'maternal' | 'peer' | 'transcendent';
  };
  
  // Transition criteria (what signals advancement to next stage)
  advancement: {
    required_capacity_signals: CapacitySignal['type'][];
    minimum_threshold: number;    // Overall readiness score 0-1
    session_count_minimum: number;
    stability_window_days: number; // How long to maintain readiness
    override_possible: boolean;   // Can user explicitly request advancement
  };
  
  // Safety settings
  safety: {
    fallback_triggers: SafetyFallback[];
    monitoring_intensity: 'light' | 'moderate' | 'intensive';
    intervention_threshold: number; // When to auto-fallback
    recovery_requirement: number;  // Stability needed to return from fallback
  };

  // Mastery settings (Stage 4 simplification)
  mastery?: {
    enabled: boolean;            // if true, applies Mastery Voice filters
    simplifyResponses: boolean;  // reduce verbosity, strip jargon
    distillParadox: boolean;     // collapse complexity into essence
  };
}

export interface OracleStateMachine {
  currentStage: OracleStage;
  stageHistory: {
    stage: OracleStage;
    enteredAt: Date;
    exitedAt?: Date;
    reason?: 'advancement' | 'fallback' | 'user_request' | 'crisis' | 'initial';
  }[];
  
  // Current capacity assessment
  capacitySignals: CapacitySignal[];
  safetyMetrics: SafetyMetric[];
  readinessScore: number;        // Overall readiness for next stage
  stabilityScore: number;        // Current stage stability
  
  // User relationship metrics
  relationship: {
    sessionCount: number;
    trustLevel: number;           // 0-1
    challengeComfort: number;     // 0-1, how much directness user wants
    integrationConsistency: number; // 0-1, pattern of integration over time
    authenticityDetection: number;   // 0-1, ability to maintain authenticity
    collectiveFieldComfort: number;  // 0-1, readiness for collective insights
  };
  
  // Current configuration (derived from stage + personalization)
  activeConfig: OracleStageConfig;
  
  // Override settings
  overrides: {
    userRequestedStage?: OracleStage;
    temporaryGentleMode: boolean;
    crisisMode: boolean;
    customizations: Partial<OracleStageConfig>;
  };
  
  // Transition tracking
  pendingTransition?: {
    targetStage: OracleStage;
    readinessMet: boolean;
    stabilityPeriodStart?: Date;
    blockers: string[];
  };
}

// Default stage configurations
export const DEFAULT_STAGE_CONFIGS: Record<OracleStage, OracleStageConfig> = {
  structured_guide: {
    stage: 'structured_guide',
    displayName: 'Structured Guide',
    description: 'Anchors and orients with simple, directive guidance. Keeps complexity low.',
    
    tone: {
      formality: 0.3,
      directness: 0.7,
      challenge_comfort: 0.2,
      metaphysical_openness: 0.4,
      vulnerability_sharing: 0.1
    },
    
    disclosure: {
      archetype_visibility: 0.2,
      uncertainty_admission: 0.1,
      multiple_perspectives: false,
      collective_field_access: false,
      shadow_work_depth: 0.3
    },
    
    orchestration: {
      agent_cooperation: 'single',
      response_length: 'brief',
      interaction_mode: 'directive',
      complexity_level: 0.3,
      personalization_depth: 0.4
    },
    
    voice: {
      character_consistency: 0.8,
      emotional_attunement: 0.6,
      wisdom_transmission: 'instructional',
      presence_quality: 'maternal'
    },
    
    advancement: {
      required_capacity_signals: ['trust', 'engagement'],
      minimum_threshold: 0.5,
      session_count_minimum: 3,
      stability_window_days: 7,
      override_possible: false
    },
    
    safety: {
      fallback_triggers: ['meaning_velocity_spike', 'dissociation_confusion', 'overwhelm_detected'],
      monitoring_intensity: 'intensive',
      intervention_threshold: 0.3,
      recovery_requirement: 0.6
    }
  },

  dialogical_companion: {
    stage: 'dialogical_companion',
    displayName: 'Dialogical Companion',
    description: 'Questions over answers, presents multiple lenses, mediates archetypes.',
    
    tone: {
      formality: 0.2,
      directness: 0.5,
      challenge_comfort: 0.4,
      metaphysical_openness: 0.6,
      vulnerability_sharing: 0.3
    },
    
    disclosure: {
      archetype_visibility: 0.5,
      uncertainty_admission: 0.6,
      multiple_perspectives: true,
      collective_field_access: false,
      shadow_work_depth: 0.6
    },
    
    orchestration: {
      agent_cooperation: 'collaborative',
      response_length: 'moderate',
      interaction_mode: 'socratic',
      complexity_level: 0.6,
      personalization_depth: 0.7
    },
    
    voice: {
      character_consistency: 0.6,
      emotional_attunement: 0.8,
      wisdom_transmission: 'experiential',
      presence_quality: 'peer'
    },
    
    advancement: {
      required_capacity_signals: ['coherence', 'integration', 'engagement'],
      minimum_threshold: 0.6,
      session_count_minimum: 10,
      stability_window_days: 14,
      override_possible: true
    },
    
    safety: {
      fallback_triggers: ['paranoid_ideation', 'meaning_velocity_spike', 'overwhelm_detected'],
      monitoring_intensity: 'moderate',
      intervention_threshold: 0.4,
      recovery_requirement: 0.7
    }
  },

  cocreative_partner: {
    stage: 'cocreative_partner',
    displayName: 'Co-Creative Partner',
    description: 'Invites co-weaving, archetypes debate live, user defines symbols.',
    
    tone: {
      formality: 0.1,
      directness: 0.6,
      challenge_comfort: 0.7,
      metaphysical_openness: 0.8,
      vulnerability_sharing: 0.6
    },
    
    disclosure: {
      archetype_visibility: 0.8,
      uncertainty_admission: 0.8,
      multiple_perspectives: true,
      collective_field_access: true,
      shadow_work_depth: 0.8
    },
    
    orchestration: {
      agent_cooperation: 'dialectical',
      response_length: 'comprehensive',
      interaction_mode: 'cocreative',
      complexity_level: 0.8,
      personalization_depth: 0.9
    },
    
    voice: {
      character_consistency: 0.4,
      emotional_attunement: 0.9,
      wisdom_transmission: 'embodied',
      presence_quality: 'peer'
    },
    
    advancement: {
      required_capacity_signals: ['integration', 'coherence', 'wellbeing'],
      minimum_threshold: 0.75,
      session_count_minimum: 25,
      stability_window_days: 21,
      override_possible: true
    },
    
    safety: {
      fallback_triggers: ['sleep_deprivation', 'dissociation_confusion', 'overwhelm_detected'],
      monitoring_intensity: 'moderate',
      intervention_threshold: 0.5,
      recovery_requirement: 0.8
    }
  },

  transparent_prism: {
    stage: 'transparent_prism',
    displayName: 'Transparent Prism',
    description: 'Spacious and minimal, direct collective view, ensures integration.',
    
    tone: {
      formality: 0.0,
      directness: 0.4,
      challenge_comfort: 0.5,
      metaphysical_openness: 0.9,
      vulnerability_sharing: 0.8
    },
    
    disclosure: {
      archetype_visibility: 1.0,
      uncertainty_admission: 1.0,
      multiple_perspectives: true,
      collective_field_access: true,
      shadow_work_depth: 1.0
    },
    
    orchestration: {
      agent_cooperation: 'transparent',
      response_length: 'adaptive',
      interaction_mode: 'facilitative',
      complexity_level: 1.0,
      personalization_depth: 1.0
    },
    
    voice: {
      character_consistency: 0.2,
      emotional_attunement: 1.0,
      wisdom_transmission: 'transparent',
      presence_quality: 'transcendent'
    },
    
    advancement: {
      required_capacity_signals: [],
      minimum_threshold: 1.0,
      session_count_minimum: 50,
      stability_window_days: 30,
      override_possible: false
    },
    
    safety: {
      fallback_triggers: ['sleep_deprivation', 'dissociation_confusion'],
      monitoring_intensity: 'light',
      intervention_threshold: 0.6,
      recovery_requirement: 0.9
    },

    mastery: {
      enabled: true,
      simplifyResponses: true,
      distillParadox: true
    }
  }
};