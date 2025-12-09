/**
 * Navigator Consciousness Matrix
 * Eight-Field Model for Complete Consciousness Computing
 *
 * Maps the non-obvious fields where consciousness is shaped before it becomes
 * "spiritual" or "religious" in language - the substrate of authentic awareness
 */

import { z } from 'zod';

// 1. EMBODIED / NEURO-SOMATIC FIELD
export const SomaticStateSchema = z.object({
  // Interoceptive awareness
  interoceptiveClarity: z.enum(['high', 'medium', 'low', 'dissociated']),
  gutState: z.enum(['open', 'tight', 'churning', 'empty', 'nauseous', 'calm']),
  heartState: z.enum(['steady', 'racing', 'heavy', 'tight', 'open', 'irregular']),
  breathPattern: z.enum(['shallow', 'deep', 'held', 'rapid', 'natural', 'labored']),

  // Autonomic patterns
  autonomicState: z.enum(['parasympathetic', 'sympathetic_mobilized', 'sympathetic_frozen', 'dorsal_shutdown', 'mixed']),
  regulationCapacity: z.enum(['high', 'medium', 'low', 'depleted']),

  // Physiological load
  sleepDebt: z.enum(['none', 'mild', 'moderate', 'severe']),
  hungerState: z.enum(['satisfied', 'hungry', 'hangry', 'nauseous', 'dysregulated']),
  hormonalInfluence: z.enum(['stable', 'fluctuating', 'heightened', 'depleted']),
  illnessLoad: z.enum(['none', 'minor', 'moderate', 'significant'],

  // Embodied tension patterns
  tensionHolding: z.array(z.enum(['jaw', 'neck', 'shoulders', 'chest', 'gut', 'hips', 'legs'])),
  bodyMood: z.enum(['energized', 'tired', 'agitated', 'peaceful', 'heavy', 'light', 'disconnected'])
});

// 2. AFFECTIVE CLIMATE & MOOD
export const AffectiveStateSchema = z.object({
  // Two-axis affect model
  valence: z.number().min(-1).max(1), // Pleasant (+1) to unpleasant (-1)
  arousal: z.number().min(0).max(1),  // Low (0) to high (1) activation

  // Background mood tones
  dominantMood: z.enum([
    'melancholic', 'buoyant', 'flat', 'anxious', 'irritable', 'tender',
    'restless', 'spacious', 'contracted', 'diffuse', 'sharp', 'flowing'
  ]),

  // Background affects (the weather of consciousness)
  backgroundAffects: z.array(z.enum([
    'unease', 'boredom', 'dread', 'contentment', 'anticipation', 'nostalgia',
    'emptiness', 'fullness', 'pressure', 'spaciousness', 'urgency', 'timelessness'
  ])),

  // Energetic gradients
  energeticTone: z.object({
    brightness: z.enum(['dull', 'dim', 'clear', 'bright', 'brilliant']),
    openness: z.enum(['contracted', 'closed', 'neutral', 'open', 'expanded']),
    density: z.enum(['heavy', 'thick', 'medium', 'light', 'ethereal'])
  }),

  affectStability: z.enum(['stable', 'fluctuating', 'labile', 'numbed'])
});

// 3. ATTENTION, SALIENCE, AND COGNITIVE STYLE
export const AttentionalStateSchema = z.object({
  // Attention pattern
  attentionMode: z.enum(['spotlight_focused', 'lantern_diffuse', 'scattered', 'fixated', 'flowing']),
  attentionStability: z.enum(['stable', 'jumpy', 'hyperfocused', 'unfocused']),

  // Salience hijacks
  saliencePattern: z.enum(['threat_focused', 'opportunity_focused', 'meaning_making', 'rumination', 'balanced']),
  cognitiveLoad: z.enum(['low', 'medium', 'high', 'overwhelmed']),

  // Cognitive style
  dominantCognitiveStyle: z.array(z.enum([
    'analytic', 'associative', 'imagistic', 'narrative', 'musical',
    'kinesthetic', 'spatial', 'logical', 'intuitive', 'somatic'
  ])),

  // Metacognitive awareness
  metacognitionLevel: z.enum(['low', 'medium', 'high']),
  thoughtRelation: z.enum(['identified', 'aware', 'witnessing', 'free']),

  // Self-reference vs world-orientation
  attentionOrientation: z.enum(['self_referential', 'world_oriented', 'relational', 'transcendent']),
  introspectiveCapacity: z.enum(['low', 'medium', 'high', 'excessive'])
});

// 4. TIME, MEMORY, AND DEVELOPMENTAL TRAJECTORY
export const TemporalStateSchema = z.object({
  // Micro-time experience
  timeFlow: z.enum(['flowing', 'dragging', 'rushing', 'fragmented', 'timeless', 'pressured']),
  presentMoment: z.enum(['connected', 'absent', 'avoiding', 'overwhelmed', 'peaceful']),

  // Narrative positioning
  lifeStoryPosition: z.enum([
    'beginning', 'building', 'plateau', 'crisis', 'transformation',
    'integration', 'completion', 'exile', 'return', 'repetition'
  ]),
  narrativeAgency: z.enum(['victim', 'hero', 'witness', 'participant', 'creator']),

  // Developmental trajectory
  developmentalPhase: z.enum([
    'identity_formation', 'intimacy_seeking', 'generativity', 'meaning_making',
    'wisdom_integration', 'legacy_creation', 'surrender_preparation'
  ]),

  // Memory patterns
  memoryMode: z.enum(['intrusive', 'repressed', 'idealized', 'fragmented', 'integrated', 'fluid']),
  pastRelation: z.enum(['haunted', 'nostalgic', 'integrated', 'dissociated', 'healing']),
  futureRelation: z.enum(['anxious', 'hopeful', 'open', 'avoidant', 'planning']),

  thresholdIndicators: z.array(z.enum([
    'career_transition', 'relationship_change', 'health_crisis', 'spiritual_awakening',
    'identity_shift', 'loss_grief', 'creative_emergence', 'authority_questioning'
  ]))
});

// 5. INTERSUBJECTIVE / RELATIONAL FIELD
export const RelationalStateSchema = z.object({
  // Attachment patterns
  attachmentStyle: z.enum(['secure', 'anxious', 'avoidant', 'disorganized', 'earned_secure']),
  attachmentActivation: z.enum(['calm', 'seeking', 'clinging', 'withdrawing', 'chaotic']),

  // Active relational dynamics
  dominantRole: z.enum([
    'parent', 'child', 'mentor', 'student', 'healer', 'wounded', 'leader', 'follower',
    'caretaker', 'rebel', 'mediator', 'outsider', 'performer', 'observer'
  ]),

  // Implicit others in the field
  implicitOthers: z.array(z.enum([
    'critical_parent', 'supportive_parent', 'inner_child', 'wise_elder', 'judge',
    'beloved', 'enemy', 'community', 'authority', 'God_punitive', 'God_loving',
    'universe_caring', 'universe_indifferent', 'peers', 'future_self'
  ])),

  // Transference patterns
  transferenceActive: z.boolean(),
  transferenceType: z.enum(['parental', 'sibling', 'romantic', 'authority', 'spiritual']).optional(),
  projectionLevel: z.enum(['minimal', 'moderate', 'high', 'extreme']),

  // Collective field influences
  collectiveAtmosphere: z.enum([
    'supportive', 'competitive', 'anxious', 'celebratory', 'grief', 'fear',
    'hope', 'anger', 'shame', 'pride', 'confusion', 'clarity'
  ]),

  boundaryState: z.enum(['healthy', 'rigid', 'porous', 'merged', 'isolated'])
});

// 6. CULTURAL, LINGUISTIC, AND MYTHIC FRAMES
export const CulturalFrameSchema = z.object({
  // Language games and discourse patterns
  dominantDiscourse: z.array(z.enum([
    'therapeutic', 'scientific', 'new_age', 'academic', 'shamanic', 'clinical',
    'productivity', 'self_help', 'trauma_informed', 'spiritual_bypass',
    'political', 'medical', 'business', 'artistic', 'philosophical'
  ])),

  // Mythic archetypal posture
  mythicPosture: z.enum([
    'hero', 'victim', 'witness', 'healer', 'judge', 'fool', 'sage', 'lover',
    'warrior', 'mother', 'father', 'child', 'rebel', 'creator', 'destroyer',
    'guide', 'seeker', 'guardian', 'shapeshifter', 'threshold_crosser'
  ]),

  // Cultural identity influences
  culturalIdentities: z.array(z.enum([
    'individualistic', 'collectivistic', 'hierarchical', 'egalitarian',
    'religious', 'secular', 'immigrant', 'indigenous', 'urban', 'rural',
    'working_class', 'middle_class', 'privileged', 'marginalized'
  ])),

  // Inherited patterns
  generationalPatterns: z.array(z.enum([
    'trauma', 'resilience', 'success_drive', 'scarcity_mind', 'abundance_mind',
    'authority_respect', 'authority_questioning', 'duty_honor', 'individual_expression'
  ])),

  frameRigidity: z.enum(['flexible', 'moderate', 'rigid', 'fundamentalist'])
});

// 7. INSTITUTIONAL, ECONOMIC, AND TECHNOLOGICAL FORCES
export const SystemicStateSchema = z.object({
  // Economic pressure and precarity
  economicStress: z.enum(['none', 'mild', 'moderate', 'severe', 'crisis']),
  workLifeBalance: z.enum(['healthy', 'strained', 'overworked', 'burned_out', 'unemployed']),
  financialSecurity: z.enum(['secure', 'comfortable', 'stressed', 'precarious', 'crisis']),

  // Platform and technological influences
  digitalOverwhelm: z.enum(['minimal', 'moderate', 'high', 'addicted']),
  socialMediaImpact: z.enum(['positive', 'neutral', 'negative', 'toxic', 'absent']),
  notificationStress: z.enum(['managed', 'moderate', 'high', 'constant']),

  // Institutional pressures
  institutionalLoad: z.array(z.enum([
    'bureaucracy', 'metrics_pressure', 'compliance_anxiety', 'liability_fear',
    'performance_monitoring', 'standardization_pressure', 'audit_culture'
  ])),

  // Systems of oppression impacts
  oppressionImpacts: z.array(z.enum([
    'racism', 'sexism', 'classism', 'ageism', 'ableism', 'homophobia',
    'transphobia', 'religious_discrimination', 'citizenship_status'
  ])),

  // Problem source assessment
  problemSource: z.enum(['primarily_intrapsychic', 'primarily_relational', 'primarily_systemic', 'mixed']),

  systemicAwareness: z.enum(['low', 'medium', 'high', 'activist'])
});

// 8. EDGE, ALTERED, AND EXTREME STATES
export const EdgeStateSchema = z.object({
  // Trauma activation indicators
  traumaIndicators: z.array(z.enum([
    'flashbacks', 'dissociation', 'hypervigilance', 'emotional_numbing',
    'intrusive_thoughts', 'somatic_activation', 'triggered_responses'
  ])),

  // Psychotic spectrum indicators
  psychoticIndicators: z.array(z.enum([
    'loose_associations', 'reference_ideas', 'grandiosity', 'paranoia',
    'thought_insertion', 'reality_testing_issues', 'bizarre_beliefs'
  ])),

  // Manic/hypomanic indicators
  maniaIndicators: z.array(z.enum([
    'pressured_speech', 'decreased_sleep', 'grandiose_plans', 'hypergraphia',
    'increased_goal_activity', 'poor_judgment', 'elevated_mood'
  ])),

  // Altered state indicators
  alteredStateMarkers: z.array(z.enum([
    'substance_influence', 'sleep_deprivation', 'meditation_effects',
    'breathwork_activation', 'ritual_trance', 'near_death_like',
    'mystical_experience', 'kundalini_activation'
  ])),

  // Safety and containment assessment
  safetyLevel: z.enum(['safe', 'caution', 'high_risk', 'crisis']),
  containmentNeeded: z.enum(['none', 'mild', 'moderate', 'high', 'professional']),
  groundingCapacity: z.enum(['high', 'medium', 'low', 'absent']),

  // Professional support indicators
  professionalSupportNeeded: z.enum(['none', 'spiritual_direction', 'therapy', 'psychiatric', 'medical_emergency']),

  extremeStateType: z.enum(['trauma_response', 'psychotic_episode', 'manic_episode', 'spiritual_emergency', 'medical_crisis']).optional()
});

// COMPLETE CONSCIOUSNESS MATRIX
export const ConsciousnessMatrixSchema = z.object({
  // Core identification
  timestamp: z.string().datetime(),
  userId: z.string(),
  sessionId: z.string(),

  // Eight consciousness fields
  somatic: SomaticStateSchema,
  affective: AffectiveStateSchema,
  attentional: AttentionalStateSchema,
  temporal: TemporalStateSchema,
  relational: RelationalStateSchema,
  cultural: CulturalFrameSchema,
  systemic: SystemicStateSchema,
  edge: EdgeStateSchema,

  // Integration assessment
  fieldCoherence: z.number().min(0).max(1), // How aligned the fields are
  dominantField: z.enum(['somatic', 'affective', 'attentional', 'temporal', 'relational', 'cultural', 'systemic', 'edge']),

  // Navigator protocol implications
  protocolRecommendation: z.enum([
    'depth_work_appropriate', 'stabilization_first', 'grounding_required',
    'professional_referral', 'emergency_protocols', 'standard_guidance'
  ]),

  depthWorkSafety: z.enum(['green', 'yellow', 'red']),

  // Confidence in assessment
  assessmentConfidence: z.number().min(0).max(1),
  missingFields: z.array(z.enum(['somatic', 'affective', 'attentional', 'temporal', 'relational', 'cultural', 'systemic', 'edge']))
});

export type ConsciousnessMatrix = z.infer<typeof ConsciousnessMatrixSchema>;
export type SomaticState = z.infer<typeof SomaticStateSchema>;
export type AffectiveState = z.infer<typeof AffectiveStateSchema>;
export type AttentionalState = z.infer<typeof AttentionalStateSchema>;
export type TemporalState = z.infer<typeof TemporalStateSchema>;
export type RelationalState = z.infer<typeof RelationalStateSchema>;
export type CulturalFrame = z.infer<typeof CulturalFrameSchema>;
export type SystemicState = z.infer<typeof SystemicStateSchema>;
export type EdgeState = z.infer<typeof EdgeStateSchema>;

// Signal detection patterns for each field
export const ConsciousnessSignals = {
  somatic: {
    // Language patterns that indicate somatic states
    interoceptiveClarity: {
      high: ['feel in my body', 'gut tells me', 'heart knows', 'breath shows'],
      medium: ['sense that', 'feel like', 'body says'],
      low: ['think', 'believe', 'suppose', 'guess'],
      dissociated: ['disconnected', 'numb', 'nothing', 'empty']
    },
    autonomicState: {
      parasympathetic: ['calm', 'peaceful', 'relaxed', 'grounded', 'settled'],
      sympathetic_mobilized: ['anxious', 'activated', 'energy', 'restless', 'wired'],
      sympathetic_frozen: ['stuck', 'paralyzed', 'frozen', 'can\'t move'],
      dorsal_shutdown: ['hopeless', 'giving up', 'can\'t feel', 'collapsed'],
      mixed: ['up and down', 'all over', 'conflicted', 'torn']
    }
  },

  affective: {
    valence_markers: {
      positive: ['good', 'great', 'wonderful', 'beautiful', 'love', 'joy', 'peace'],
      negative: ['bad', 'terrible', 'awful', 'hate', 'pain', 'suffering', 'dark'],
      neutral: ['okay', 'fine', 'whatever', 'meh', 'indifferent']
    },
    arousal_markers: {
      high: ['intense', 'overwhelming', 'explosive', 'rushing', 'fired up'],
      low: ['quiet', 'still', 'gentle', 'subdued', 'calm']
    }
  },

  attentional: {
    metacognition_indicators: {
      high: ['notice that I', 'aware of thinking', 'watching my mind', 'observe'],
      medium: ['realize', 'see that', 'recognize'],
      low: ['just think', 'believe', 'know', 'obvious']
    },
    attention_patterns: {
      scattered: ['all over', 'can\'t focus', 'distracted', 'everywhere'],
      fixated: ['obsessing', 'can\'t stop thinking', 'stuck on', 'ruminating']
    }
  },

  temporal: {
    life_position: {
      beginning: ['starting', 'new chapter', 'fresh start', 'birth'],
      crisis: ['falling apart', 'everything changing', 'don\'t know', 'chaos'],
      completion: ['finishing', 'end of era', 'letting go', 'death']
    },
    threshold_markers: ['transition', 'crossroads', 'turning point', 'edge', 'breakthrough']
  },

  relational: {
    attachment_activation: {
      seeking: ['need', 'want', 'miss', 'lonely', 'reach out'],
      withdrawing: ['alone', 'space', 'distance', 'protect myself'],
      clinging: ['can\'t let go', 'desperate', 'panic', 'abandon']
    },
    transference_indicators: ['reminds me of', 'just like my', 'always', 'never', 'everyone']
  },

  cultural: {
    discourse_markers: {
      therapeutic: ['process', 'heal', 'work through', 'trauma', 'trigger'],
      spiritual_bypass: ['everything happens for reason', 'meant to be', 'universe', 'manifesting'],
      productivity: ['optimize', 'efficient', 'results', 'goals', 'metrics']
    },
    mythic_postures: {
      victim: ['happening to me', 'unfair', 'why me', 'powerless'],
      hero: ['overcome', 'conquer', 'defeat', 'triumph', 'victory']
    }
  },

  systemic: {
    economic_stress: ['money', 'bills', 'rent', 'job', 'career', 'financial'],
    institutional_pressure: ['bureaucracy', 'system', 'they', 'policy', 'compliance']
  },

  edge: {
    trauma_language: ['triggered', 'flashback', 'dissociate', 'numb', 'hypervigilant'],
    mania_language: ['don\'t need sleep', 'special mission', 'connections everywhere', 'racing'],
    psychotic_language: ['they\'re watching', 'messages', 'special meaning', 'chosen']
  }
};

// Navigation Protocol Matrix - how each field configuration affects guidance
export const ProtocolMatrix = {
  // High edge state indicators override everything
  emergency_protocols: {
    conditions: ['edge.safetyLevel === "crisis"', 'edge.professionalSupportNeeded === "medical_emergency"'],
    actions: ['immediate_human_connection', 'crisis_resources', 'no_depth_work', 'stabilization_only']
  },

  // Professional referral needed
  referral_protocols: {
    conditions: [
      'edge.safetyLevel === "high_risk"',
      'edge.professionalSupportNeeded !== "none"',
      'somatic.regulationCapacity === "depleted"',
      'systemic.problemSource === "primarily_systemic"'
    ],
    actions: ['professional_referral', 'supportive_presence', 'resource_provision', 'gentle_guidance']
  },

  // Stabilization before depth work
  stabilization_protocols: {
    conditions: [
      'somatic.autonomicState === "sympathetic_frozen" || somatic.autonomicState === "dorsal_shutdown"',
      'affective.affectStability === "labile"',
      'attentional.cognitiveLoad === "overwhelmed"',
      'edge.containmentNeeded === "high"'
    ],
    actions: ['grounding_practices', 'nervous_system_regulation', 'short_sessions', 'concrete_support']
  },

  // Appropriate for depth work
  depth_work_protocols: {
    conditions: [
      'edge.safetyLevel === "safe"',
      'somatic.regulationCapacity === "high" || somatic.regulationCapacity === "medium"',
      'attentional.metacognitionLevel === "high" || attentional.metacognitionLevel === "medium"',
      'relational.boundaryState === "healthy"'
    ],
    actions: ['spiritual_depth_work', 'contemplative_practices', 'integration_support', 'wisdom_transmission']
  }
};