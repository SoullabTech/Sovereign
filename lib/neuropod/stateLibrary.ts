/**
 * Neuropod State Library
 *
 * Comprehensive taxonomy of consciousness states with:
 * - Biometric signatures (EEG bands, coherence patterns, HRV)
 * - Evidence-backed protocols
 * - Expected phenomenology
 * - Safety considerations
 *
 * States organized by category:
 * - Regulation (calm, grounded, centered)
 * - Cognitive (clarity, focus, flow)
 * - Creative (divergent, receptive, insightful)
 * - Hemispheric (left-brain analytical, right-brain holistic)
 * - Depth (introspective, contemplative, transcendent)
 * - Integration (consolidation, wisdom, meaning-making)
 *
 * Evidence levels: strong (meta-analyses), moderate (multiple studies), emerging (preliminary), theoretical
 */

import type { PsychoactivationOutput } from './protocolLibrary';

// ============================================================================
// TYPES
// ============================================================================

export type StateCategory =
  | 'regulation'      // Stress reduction, grounding, parasympathetic activation
  | 'cognitive'       // Attention, clarity, processing speed
  | 'creative'        // Divergent thinking, insight, novelty
  | 'hemispheric'     // Left/right brain specialization
  | 'depth'           // Introspection, contemplation, transcendence
  | 'integration';    // Consolidation, meaning-making, wisdom

export type EvidenceLevel = 'strong' | 'moderate' | 'emerging' | 'theoretical';

export interface BiometricSignature {
  // EEG band power (0-1, relative to baseline)
  delta?: { min: number; max: number; target: number };  // 0.5-4 Hz (deep sleep, unconscious)
  theta?: { min: number; max: number; target: number };  // 4-8 Hz (meditation, creativity, memory)
  alpha?: { min: number; max: number; target: number };  // 8-12 Hz (relaxed alertness, calm)
  beta?: { min: number; max: number; target: number };   // 12-30 Hz (active thinking, focus)
  gamma?: { min: number; max: number; target: number };  // 30-100 Hz (insight, binding, high cognition)

  // Coherence patterns
  frontalParietalCoherence?: { min: number; max: number; target: number };  // Attention, executive function
  leftRightSync?: { min: number; max: number; target: number };            // Hemispheric integration
  globalSynchrony?: { min: number; max: number; target: number };           // Unity, coherence

  // Autonomic markers
  hrvCoherence?: { min: number; max: number; target: number };              // Heart-brain coherence
  respirationRate?: { min: number; max: number; target: number };           // Breaths per minute
  edaArousal?: { min: number; max: number; target: number };                // Skin conductance (stress)

  // DMT mathematics metrics
  defectDensity?: { min: number; max: number; target: number };
  fieldAlignment?: { min: number; max: number; target: number };
  consciousnessTemperature?: { min: number; max: number; target: number };
}

export interface ConsciousnessState {
  id: string;
  name: string;
  category: StateCategory;
  evidenceLevel: EvidenceLevel;

  description: string;
  phenomenology: string[];          // What it feels like

  biometricSignature: BiometricSignature;
  recommendedProtocols: string[];   // IDs from protocolLibrary

  contraindications: string[];
  safetyNotes: string[];

  citations: string[];
  marketingClaim: string;
}

// ============================================================================
// REGULATION STATES
// ============================================================================

export const CALM: ConsciousnessState = {
  id: 'calm',
  name: 'Calm',
  category: 'regulation',
  evidenceLevel: 'strong',

  description: 'Parasympathetic activation, stress reduction, relaxed alertness',
  phenomenology: [
    'Body feels relaxed, soft',
    'Mind is quiet but alert',
    'Breath is slow and deep',
    'Sense of safety, ease'
  ],

  biometricSignature: {
    alpha: { min: 0.35, max: 0.6, target: 0.48 },
    theta: { min: 0.2, max: 0.4, target: 0.3 },
    beta: { min: 0.15, max: 0.35, target: 0.25 },
    hrvCoherence: { min: 0.5, max: 0.85, target: 0.68 },
    respirationRate: { min: 4, max: 8, target: 6 },
    edaArousal: { min: 0.1, max: 0.3, target: 0.2 },
    defectDensity: { min: 0.05, max: 0.15, target: 0.1 },
    fieldAlignment: { min: 0.6, max: 0.9, target: 0.75 },
  },

  recommendedProtocols: ['breath-paced-grounding', 'alpha-relaxation', 'vibroacoustic-grounding'],

  contraindications: [],
  safetyNotes: ['Safe for all users', 'Can be used as intervention state during overwhelm'],

  citations: [
    'Lehrer et al. (2000) - HRV biofeedback and coherence',
    'Meta-analysis: Alpha binaural beats for relaxation',
  ],

  marketingClaim: 'Evidence-backed protocols for parasympathetic activation and stress reduction',
};

export const GROUNDED: ConsciousnessState = {
  id: 'grounded',
  name: 'Grounded',
  category: 'regulation',
  evidenceLevel: 'moderate',

  description: 'Somatic awareness, body connection, present-moment anchoring',
  phenomenology: [
    'Strong body awareness',
    'Felt sense of weight, gravity',
    'Connection to physical sensations',
    'Here-and-now presence'
  ],

  biometricSignature: {
    theta: { min: 0.25, max: 0.45, target: 0.35 },
    alpha: { min: 0.3, max: 0.5, target: 0.4 },
    respirationRate: { min: 6, max: 10, target: 8 },
    edaArousal: { min: 0.15, max: 0.35, target: 0.25 },
    consciousnessTemperature: { min: 0.1, max: 0.3, target: 0.2 },
  },

  recommendedProtocols: ['vibroacoustic-grounding', 'breath-paced-grounding'],

  contraindications: ['Pacemaker (for vibroacoustic)', 'Pregnancy (vibration safety unclear)'],
  safetyNotes: ['Use low-frequency vibration (20-40 Hz)', 'Gentle intensity'],

  citations: [
    'Vibroacoustic therapy literature',
    'Somatic experiencing research',
  ],

  marketingClaim: 'Somatic grounding protocols using low-frequency vibration and breathwork',
};

export const CENTERED: ConsciousnessState = {
  id: 'centered',
  name: 'Centered',
  category: 'regulation',
  evidenceLevel: 'moderate',

  description: 'Emotional equilibrium, balanced arousal, stable attention',
  phenomenology: [
    'Neither too activated nor too drowsy',
    'Emotional steadiness',
    'Can respond flexibly to demands',
    'Inner stability'
  ],

  biometricSignature: {
    alpha: { min: 0.4, max: 0.6, target: 0.5 },
    beta: { min: 0.2, max: 0.4, target: 0.3 },
    theta: { min: 0.2, max: 0.35, target: 0.28 },
    hrvCoherence: { min: 0.55, max: 0.8, target: 0.68 },
    frontalParietalCoherence: { min: 0.45, max: 0.7, target: 0.58 },
    defectDensity: { min: 0.05, max: 0.2, target: 0.12 },
  },

  recommendedProtocols: ['alpha-relaxation', 'breath-paced-grounding'],

  contraindications: [],
  safetyNotes: ['Gentle transition state', 'Good pre-session baseline'],

  citations: [
    'Neurofeedback literature on alpha/theta balance',
  ],

  marketingClaim: 'Balanced arousal protocols for emotional equilibrium',
};

// ============================================================================
// COGNITIVE STATES
// ============================================================================

export const CLARITY: ConsciousnessState = {
  id: 'clarity',
  name: 'Clarity',
  category: 'cognitive',
  evidenceLevel: 'moderate',

  description: 'Mental sharpness, perceptual brightness, cognitive precision',
  phenomenology: [
    'Thoughts are crisp, clear',
    'Perceptions feel vivid',
    'Mental "fog" lifted',
    'Easy access to knowledge'
  ],

  biometricSignature: {
    beta: { min: 0.3, max: 0.55, target: 0.43 },
    gamma: { min: 0.15, max: 0.35, target: 0.25 },
    alpha: { min: 0.25, max: 0.45, target: 0.35 },
    frontalParietalCoherence: { min: 0.5, max: 0.75, target: 0.63 },
    globalSynchrony: { min: 0.4, max: 0.65, target: 0.53 },
  },

  recommendedProtocols: ['gamma-focus-40hz', 'alpha-relaxation'],

  contraindications: ['Seizure history (for gamma protocols)', 'Active mania'],
  safetyNotes: ['Monitor for overstimulation', 'Can be activating for anxious users'],

  citations: [
    '40 Hz gamma stimulation research',
    'Beta binaural beats for focus',
  ],

  marketingClaim: 'Gamma and beta entrainment protocols for cognitive sharpness',
};

export const FOCUS: ConsciousnessState = {
  id: 'focus',
  name: 'Focus',
  category: 'cognitive',
  evidenceLevel: 'strong',

  description: 'Sustained attention, concentration, task engagement',
  phenomenology: [
    'Ability to stay on task',
    'Distractions fade to background',
    'Effort feels effortless',
    'Time perception altered (absorbed)'
  ],

  biometricSignature: {
    beta: { min: 0.35, max: 0.6, target: 0.48 },
    gamma: { min: 0.2, max: 0.4, target: 0.3 },
    alpha: { min: 0.2, max: 0.4, target: 0.3 },
    frontalParietalCoherence: { min: 0.55, max: 0.8, target: 0.68 },
    consciousnessTemperature: { min: 0.4, max: 0.6, target: 0.5 },
  },

  recommendedProtocols: ['gamma-focus-40hz'],

  contraindications: ['Seizure history', 'Photosensitivity'],
  safetyNotes: ['40 Hz light modulation requires screening', 'Shorter sessions (20 min max)'],

  citations: [
    'Iaccarino et al. (2016) - 40 Hz gamma entrainment',
    'ASSR literature on sustained attention',
  ],

  marketingClaim: '40 Hz gamma entrainment for sustained attention (studied in cognitive research contexts)',
};

export const FLOW: ConsciousnessState = {
  id: 'flow',
  name: 'Flow',
  category: 'cognitive',
  evidenceLevel: 'emerging',

  description: 'Effortless action, challenge-skill balance, timelessness',
  phenomenology: [
    'Action and awareness merge',
    'Self-consciousness disappears',
    'Time distortion (hours feel like minutes)',
    'Intrinsic motivation, joy in doing'
  ],

  biometricSignature: {
    alpha: { min: 0.3, max: 0.5, target: 0.4 },
    theta: { min: 0.3, max: 0.5, target: 0.4 },
    gamma: { min: 0.2, max: 0.4, target: 0.3 },
    frontalParietalCoherence: { min: 0.6, max: 0.85, target: 0.73 },
    globalSynchrony: { min: 0.5, max: 0.75, target: 0.63 },
    defectDensity: { min: 0.1, max: 0.25, target: 0.17 },
  },

  recommendedProtocols: ['theta-absorption', 'gamma-focus-40hz'],

  contraindications: [],
  safetyNotes: ['Difficult to induce directly', 'Best as natural emergence during task engagement'],

  citations: [
    'Csikszentmihalyi - Flow theory',
    'Neurofeedback studies on flow states (alpha-theta)',
  ],

  marketingClaim: 'Alpha-theta protocols that may support flow-conducive brain states',
};

// ============================================================================
// CREATIVE STATES
// ============================================================================

export const RECEPTIVE: ConsciousnessState = {
  id: 'receptive',
  name: 'Receptive',
  category: 'creative',
  evidenceLevel: 'moderate',

  description: 'Open awareness, non-judgmental observation, allowing',
  phenomenology: [
    'Not trying to control experience',
    'Curious, open attitude',
    'Willing to be surprised',
    'Listening more than doing'
  ],

  biometricSignature: {
    theta: { min: 0.35, max: 0.6, target: 0.48 },
    alpha: { min: 0.35, max: 0.55, target: 0.45 },
    beta: { min: 0.15, max: 0.35, target: 0.25 },
    leftRightSync: { min: 0.5, max: 0.8, target: 0.65 },
    consciousnessTemperature: { min: 0.3, max: 0.5, target: 0.4 },
  },

  recommendedProtocols: ['theta-absorption', 'alpha-relaxation'],

  contraindications: [],
  safetyNotes: ['Can be destabilizing for users with poor boundaries', 'Use grounding check-ins'],

  citations: [
    'Theta binaural beats and receptivity',
    'Meditation EEG studies',
  ],

  marketingClaim: 'Theta-alpha protocols for open, receptive awareness',
};

export const CREATIVE: ConsciousnessState = {
  id: 'creative',
  name: 'Creative',
  category: 'creative',
  evidenceLevel: 'moderate',

  description: 'Divergent thinking, novel associations, ideation',
  phenomenology: [
    'Ideas flow easily',
    'Unexpected connections arise',
    'Playful, experimental mindset',
    'Reduced critical filtering'
  ],

  biometricSignature: {
    theta: { min: 0.4, max: 0.65, target: 0.53 },
    alpha: { min: 0.3, max: 0.5, target: 0.4 },
    gamma: { min: 0.15, max: 0.35, target: 0.25 },
    leftRightSync: { min: 0.55, max: 0.85, target: 0.7 },
    defectDensity: { min: 0.15, max: 0.35, target: 0.25 },  // Some "disorder" helps creativity
  },

  recommendedProtocols: ['theta-absorption', 'gamma-focus-40hz'],

  contraindications: [],
  safetyNotes: ['Can be scattered for anxious users', 'Combine with grounding'],

  citations: [
    'Hommel et al. (2016) - Gamma binaural beats and cognitive flexibility',
    'Theta oscillations and creative cognition',
  ],

  marketingClaim: 'Theta-gamma protocols studied for divergent thinking and cognitive flexibility',
};

export const INSIGHTFUL: ConsciousnessState = {
  id: 'insightful',
  name: 'Insightful',
  category: 'creative',
  evidenceLevel: 'emerging',

  description: 'Aha moments, sudden understanding, pattern recognition',
  phenomenology: [
    'Sudden clarity, "I see it now"',
    'Problem dissolves or reframes',
    'Gestalt shifts',
    'Felt sense of "rightness"'
  ],

  biometricSignature: {
    gamma: { min: 0.25, max: 0.5, target: 0.38 },      // Insight = gamma burst
    theta: { min: 0.3, max: 0.5, target: 0.4 },
    alpha: { min: 0.25, max: 0.45, target: 0.35 },
    globalSynchrony: { min: 0.5, max: 0.75, target: 0.63 },  // Binding across regions
  },

  recommendedProtocols: ['gamma-focus-40hz', 'theta-absorption'],

  contraindications: ['Seizure history'],
  safetyNotes: ['Cannot force insight', 'Create conditions, allow emergence'],

  citations: [
    'Jung-Beeman et al. - Gamma and insight',
    'Kounios & Beeman - Neuroscience of insight',
  ],

  marketingClaim: 'Gamma-theta protocols that may support insight-conducive brain states (research ongoing)',
};

// ============================================================================
// HEMISPHERIC STATES
// ============================================================================

export const LEFT_BRAIN: ConsciousnessState = {
  id: 'left-brain',
  name: 'Left-Brain Analytical',
  category: 'hemispheric',
  evidenceLevel: 'emerging',

  description: 'Sequential processing, language, logic, detail-oriented',
  phenomenology: [
    'Step-by-step thinking',
    'Verbal, linguistic mode',
    'Detail focus, parts over whole',
    'Logical, linear reasoning'
  ],

  biometricSignature: {
    beta: { min: 0.4, max: 0.65, target: 0.53 },
    gamma: { min: 0.2, max: 0.4, target: 0.3 },
    // Note: "left brain" lateralization is complex and task-dependent
    // This is a simplified heuristic
  },

  recommendedProtocols: ['gamma-focus-40hz'],  // Beta-gamma for analytical

  contraindications: [],
  safetyNotes: ['Left/right brain dichotomy is oversimplified', 'Use cautiously in marketing'],

  citations: [
    'Hemispheric specialization literature (with caveats)',
  ],

  marketingClaim: 'Beta-gamma protocols for analytical, detail-oriented cognition (hemispheric lateralization is complex)',
};

export const RIGHT_BRAIN: ConsciousnessState = {
  id: 'right-brain',
  name: 'Right-Brain Holistic',
  category: 'hemispheric',
  evidenceLevel: 'emerging',

  description: 'Parallel processing, spatial, intuitive, gestalt',
  phenomenology: [
    'Big-picture thinking',
    'Visual-spatial mode',
    'Whole over parts',
    'Intuitive leaps, pattern recognition'
  ],

  biometricSignature: {
    theta: { min: 0.35, max: 0.6, target: 0.48 },
    alpha: { min: 0.35, max: 0.6, target: 0.48 },
    gamma: { min: 0.15, max: 0.35, target: 0.25 },
  },

  recommendedProtocols: ['theta-absorption', 'alpha-relaxation'],

  contraindications: [],
  safetyNotes: ['Left/right brain dichotomy is oversimplified', 'Use cautiously in marketing'],

  citations: [
    'Hemispheric specialization literature (with caveats)',
  ],

  marketingClaim: 'Theta-alpha protocols for holistic, pattern-based cognition (hemispheric lateralization is complex)',
};

export const INTEGRATED_HEMISPHERES: ConsciousnessState = {
  id: 'integrated-hemispheres',
  name: 'Integrated (Hemispheric Balance)',
  category: 'hemispheric',
  evidenceLevel: 'moderate',

  description: 'Balanced left-right communication, whole-brain coherence',
  phenomenology: [
    'Both analytical and intuitive',
    'Detail and big-picture together',
    'Language and imagery integrated',
    'Flexible switching between modes'
  ],

  biometricSignature: {
    leftRightSync: { min: 0.6, max: 0.9, target: 0.75 },      // High interhemispheric coherence
    globalSynchrony: { min: 0.5, max: 0.8, target: 0.65 },
    alpha: { min: 0.35, max: 0.6, target: 0.48 },
    theta: { min: 0.25, max: 0.45, target: 0.35 },
  },

  recommendedProtocols: ['alpha-relaxation', 'annealing-pathway'],

  contraindications: [],
  safetyNotes: ['Interhemispheric coherence is measurable via EEG'],

  citations: [
    'Solcà et al. (2016) - Binaural beats increase interhemispheric alpha coherence',
  ],

  marketingClaim: 'Alpha-frequency protocols shown to increase interhemispheric coherence (published research)',
};

// ============================================================================
// DEPTH STATES
// ============================================================================

export const INTROSPECTIVE: ConsciousnessState = {
  id: 'introspective',
  name: 'Introspective',
  category: 'depth',
  evidenceLevel: 'moderate',

  description: 'Self-reflection, inner observation, psychological insight',
  phenomenology: [
    'Attention turned inward',
    'Observing thoughts, emotions',
    'Self-understanding deepening',
    'Metacognitive awareness'
  ],

  biometricSignature: {
    theta: { min: 0.4, max: 0.7, target: 0.55 },
    alpha: { min: 0.3, max: 0.5, target: 0.4 },
    beta: { min: 0.15, max: 0.3, target: 0.23 },
    frontalParietalCoherence: { min: 0.45, max: 0.7, target: 0.58 },
    consciousnessTemperature: { min: 0.3, max: 0.5, target: 0.4 },
  },

  recommendedProtocols: ['theta-absorption', 'annealing-pathway'],

  contraindications: ['Active psychosis', 'Severe dissociation'],
  safetyNotes: ['Can be destabilizing for fragile users', 'Use grounding protocols'],

  citations: [
    'Theta oscillations and introspection',
    'Default mode network studies',
  ],

  marketingClaim: 'Theta protocols for self-reflective states (used in contemplative contexts)',
};

export const CONTEMPLATIVE: ConsciousnessState = {
  id: 'contemplative',
  name: 'Contemplative',
  category: 'depth',
  evidenceLevel: 'strong',

  description: 'Meditative absorption, sustained open awareness, equanimity',
  phenomenology: [
    'Restful alertness',
    'Thought activity quiets',
    'Present-moment stability',
    'Equanimity, acceptance'
  ],

  biometricSignature: {
    theta: { min: 0.45, max: 0.75, target: 0.6 },
    alpha: { min: 0.4, max: 0.7, target: 0.55 },
    beta: { min: 0.1, max: 0.25, target: 0.18 },
    globalSynchrony: { min: 0.5, max: 0.8, target: 0.65 },
    defectDensity: { min: 0.05, max: 0.2, target: 0.12 },
    fieldAlignment: { min: 0.65, max: 0.95, target: 0.8 },
  },

  recommendedProtocols: ['theta-absorption', 'annealing-pathway', 'alpha-relaxation'],

  contraindications: [],
  safetyNotes: ['Safe for most users', 'Classic meditation state'],

  citations: [
    'Meditation EEG studies (extensive literature)',
    'Theta-alpha synchrony in experienced meditators',
  ],

  marketingClaim: 'Theta-alpha protocols studied extensively in meditation research',
};

export const TRANSCENDENT: ConsciousnessState = {
  id: 'transcendent',
  name: 'Transcendent',
  category: 'depth',
  evidenceLevel: 'theoretical',

  description: 'Unity, boundlessness, oceanic bliss, ego dissolution',
  phenomenology: [
    'Boundaries dissolve',
    'Sense of unity with everything',
    'Timelessness, spacelessness',
    'Profound peace, bliss, awe'
  ],

  biometricSignature: {
    globalSynchrony: { min: 0.85, max: 1.0, target: 0.95 },  // From 5-MeO-DMT research
    defectDensity: { min: 0.0, max: 0.05, target: 0.02 },    // Defects annihilated
    fieldAlignment: { min: 0.9, max: 1.0, target: 0.95 },    // Perfect alignment = bliss
    theta: { min: 0.5, max: 0.8, target: 0.65 },
    alpha: { min: 0.4, max: 0.7, target: 0.55 },
  },

  recommendedProtocols: ['annealing-pathway', 'wind-up-crescendo'],

  contraindications: [
    'Seizure history',
    'Active psychosis',
    'Severe dissociation',
    'Borderline personality disorder',
    'Recent trauma'
  ],
  safetyNotes: [
    'HIGHLY experimental',
    'Requires extensive screening',
    'Only for advanced users (Bloom 5+)',
    'Field-safe status required',
    'Continuous safety monitoring',
    'NOT claiming to replicate psychedelic breakthroughs'
  ],

  citations: [
    'Gomez Emilsson - 5-MeO-DMT phenomenology (global synchrony > 0.95)',
    'Meditation literature on unity experiences (jhanas, samadhi)',
  ],

  marketingClaim: 'Experimental protocols inspired by consciousness research; NOT a psychedelic simulation; outcomes highly variable',
};

// ============================================================================
// INTEGRATION STATES
// ============================================================================

export const CONSOLIDATION: ConsciousnessState = {
  id: 'consolidation',
  name: 'Consolidation',
  category: 'integration',
  evidenceLevel: 'strong',

  description: 'Memory encoding, learning solidification, post-experience processing',
  phenomenology: [
    'Replaying experiences',
    'Connecting new to known',
    'Insights settling',
    'Felt sense of "locking in"'
  ],

  biometricSignature: {
    theta: { min: 0.3, max: 0.5, target: 0.4 },
    alpha: { min: 0.35, max: 0.6, target: 0.48 },
    delta: { min: 0.2, max: 0.4, target: 0.3 },  // Sleep-stage consolidation
    consciousnessTemperature: { min: 0.2, max: 0.4, target: 0.3 },  // Cooling phase
  },

  recommendedProtocols: ['alpha-relaxation', 'breath-paced-grounding'],

  contraindications: [],
  safetyNotes: ['Essential post-DEPTH phase', 'Should be ≥ 25% of session duration'],

  citations: [
    'Memory consolidation literature',
    'Sleep and theta oscillations',
  ],

  marketingClaim: 'Post-session protocols based on memory consolidation research',
};

export const MEANING_MAKING: ConsciousnessState = {
  id: 'meaning-making',
  name: 'Meaning-Making',
  category: 'integration',
  evidenceLevel: 'emerging',

  description: 'Narrative construction, sense-making, value clarification',
  phenomenology: [
    '"What does this mean for me?"',
    'Story-building, coherence',
    'Connecting to values, purpose',
    'Integration with life context'
  ],

  biometricSignature: {
    alpha: { min: 0.4, max: 0.65, target: 0.53 },
    theta: { min: 0.25, max: 0.45, target: 0.35 },
    frontalParietalCoherence: { min: 0.5, max: 0.75, target: 0.63 },
    leftRightSync: { min: 0.55, max: 0.8, target: 0.68 },
  },

  recommendedProtocols: ['alpha-relaxation', 'integrated-hemispheres'],

  contraindications: [],
  safetyNotes: ['Journaling prompts enhance this state', 'Verbal integration support helpful'],

  citations: [
    'Narrative psychology research',
    'Post-psychedelic integration literature',
  ],

  marketingClaim: 'Integration protocols with journaling prompts for meaning-making',
};

export const WISDOM: ConsciousnessState = {
  id: 'wisdom',
  name: 'Wisdom',
  category: 'integration',
  evidenceLevel: 'theoretical',

  description: 'Deep understanding, perspective-taking, compassionate clarity',
  phenomenology: [
    'Seeing with greater perspective',
    'Compassion for self and others',
    'Acceptance of paradox',
    'Embodied knowing, not just intellectual'
  ],

  biometricSignature: {
    alpha: { min: 0.45, max: 0.7, target: 0.58 },
    theta: { min: 0.3, max: 0.5, target: 0.4 },
    globalSynchrony: { min: 0.55, max: 0.8, target: 0.68 },
    fieldAlignment: { min: 0.7, max: 0.95, target: 0.83 },
    defectDensity: { min: 0.05, max: 0.15, target: 0.1 },
  },

  recommendedProtocols: ['contemplative', 'integrated-hemispheres', 'annealing-pathway'],

  contraindications: [],
  safetyNotes: ['Aspirational state', 'May emerge naturally from sustained practice'],

  citations: [
    'Wisdom and aging research',
    'Contemplative neuroscience',
  ],

  marketingClaim: 'Contemplative protocols that may support wisdom-conducive states over time',
};

// ============================================================================
// STATE REGISTRY
// ============================================================================

export const STATE_LIBRARY: Record<string, ConsciousnessState> = {
  // Regulation
  [CALM.id]: CALM,
  [GROUNDED.id]: GROUNDED,
  [CENTERED.id]: CENTERED,

  // Cognitive
  [CLARITY.id]: CLARITY,
  [FOCUS.id]: FOCUS,
  [FLOW.id]: FLOW,

  // Creative
  [RECEPTIVE.id]: RECEPTIVE,
  [CREATIVE.id]: CREATIVE,
  [INSIGHTFUL.id]: INSIGHTFUL,

  // Hemispheric
  [LEFT_BRAIN.id]: LEFT_BRAIN,
  [RIGHT_BRAIN.id]: RIGHT_BRAIN,
  [INTEGRATED_HEMISPHERES.id]: INTEGRATED_HEMISPHERES,

  // Depth
  [INTROSPECTIVE.id]: INTROSPECTIVE,
  [CONTEMPLATIVE.id]: CONTEMPLATIVE,
  [TRANSCENDENT.id]: TRANSCENDENT,

  // Integration
  [CONSOLIDATION.id]: CONSOLIDATION,
  [MEANING_MAKING.id]: MEANING_MAKING,
  [WISDOM.id]: WISDOM,
};

// ============================================================================
// STATE SELECTION HELPERS
// ============================================================================

export function getStatesByCategory(category: StateCategory): ConsciousnessState[] {
  return Object.values(STATE_LIBRARY).filter((state) => state.category === category);
}

export function getStatesByEvidenceLevel(level: EvidenceLevel): ConsciousnessState[] {
  return Object.values(STATE_LIBRARY).filter((state) => state.evidenceLevel === level);
}

export function getStatesForUser(
  userProfile: {
    bloomLevel: number;
    bypassingScore: number;
    fieldSafeStatus: boolean;
    experienceLevel: 'novice' | 'intermediate' | 'advanced';
  }
): ConsciousnessState[] {
  const available = Object.values(STATE_LIBRARY).filter((state) => {
    // Transcendent only for advanced, field-safe, high Bloom
    if (state.id === 'transcendent') {
      return (
        userProfile.bloomLevel >= 5 &&
        userProfile.bypassingScore < 0.3 &&
        userProfile.fieldSafeStatus &&
        userProfile.experienceLevel === 'advanced'
      );
    }

    // Depth states require some readiness
    if (state.category === 'depth' && state.id !== 'contemplative') {
      return userProfile.bloomLevel >= 4 && userProfile.bypassingScore < 0.5;
    }

    // Regulation, cognitive, creative states available to all
    return true;
  });

  return available;
}

// ============================================================================
// STATE DISTANCE METRIC (How far is current state from target?)
// ============================================================================

export function computeStateDistance(
  currentBiometrics: Partial<BiometricSignature>,
  targetState: ConsciousnessState
): number {
  const targetSig = targetState.biometricSignature;
  let totalDistance = 0;
  let metricCount = 0;

  // Compare each metric
  const metrics: (keyof BiometricSignature)[] = [
    'alpha', 'beta', 'theta', 'gamma', 'delta',
    'frontalParietalCoherence', 'leftRightSync', 'globalSynchrony',
    'hrvCoherence', 'defectDensity', 'fieldAlignment'
  ];

  for (const metric of metrics) {
    const current = currentBiometrics[metric];
    const target = targetSig[metric];

    if (current !== undefined && target !== undefined && typeof current === 'number' && typeof target === 'object') {
      // Distance = how far current value is from target range
      if (current < target.min) {
        totalDistance += (target.min - current);
      } else if (current > target.max) {
        totalDistance += (current - target.max);
      }
      // If within range, distance = 0 for this metric

      metricCount++;
    }
  }

  return metricCount > 0 ? totalDistance / metricCount : 1.0;
}

export function isStateReached(
  currentBiometrics: Partial<BiometricSignature>,
  targetState: ConsciousnessState,
  tolerance: number = 0.1
): boolean {
  const distance = computeStateDistance(currentBiometrics, targetState);
  return distance < tolerance;
}
