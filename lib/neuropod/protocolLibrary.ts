// @ts-nocheck
/**
 * Neuropod Protocol Library
 *
 * Evidence-based psychoactivation protocols mapped to coherence validation.
 * Each protocol specifies:
 * - Stimulus parameters (binaural beats, haptics, light)
 * - Expected coherence changes (what we predict will happen)
 * - Validation criteria (how we know if it worked)
 * - Safety constraints (when to intervene)
 *
 * Based on: NEUROPOD_PSYCHOACTIVATION_EVIDENCE_BASE.md
 */

import type { ConsciousnessState } from './types';
import type { CoherenceSnapshot } from './coherenceTracker';

// ============================================================================
// TYPES
// ============================================================================

export interface PsychoactivationOutput {
  audio: {
    carrierLeft: number;   // Hz (e.g., 200)
    carrierRight: number;  // Hz (e.g., 210) → 10 Hz binaural beat
    amplitude: number;     // 0-1
    soundscape?: 'nature' | 'ambient' | 'silence' | 'singing-bowl' | 'forest' | 'ambient-music' | 'structured-rhythm';
  };

  haptic: {
    frequency: number;     // Hz (e.g., 40)
    amplitude: number;     // 0-1 (within safety caps)
    pattern: 'continuous' | 'pulsed' | 'breath-synced' | 'breath-pulse' | 'focus-pulse' | 'pulsed-gentle' | 'delta-sync';
    breathTiming?: {
      inhale: number;      // seconds
      hold1: number;
      exhale: number;
      hold2: number;
    };
  };

  light: {
    color: 'amber' | 'red' | 'white' | 'blue' | 'warm-white';
    intensity: number;     // 0-1 (within safety caps)
    modulation?: {
      frequency: number;   // Hz (avoid 15-25 Hz for epilepsy safety)
      amplitude: number;   // depth of modulation
    };
  };

  vibroacoustic?: {
    frequency: number;     // Hz (20-200 Hz range, focus 20-120 Hz)
    amplitude: number;     // 0-1 (max 0.75 safety cap)
    pattern: 'continuous' | 'pulsed' | 'breath-paced' | 'phase-locked' | 'rhythmic-pulse' | 'exploratory' | 'responsive';
    modulation?: 'none' | 'gentle-crescendo' | 'slow-oscillation-sync' | 'responsive';
  };
}

export interface ExpectedCoherenceChange {
  alphaPower: { min: number; max: number; target: number };
  betaPower?: { min: number; max: number; target: number };
  thetaPower?: { min: number; max: number; target: number };
  gammaPower?: { min: number; max: number; target: number };
  globalSynchrony?: { min: number; max: number; target: number };
  frontalParietalCoherence?: { min: number; max: number; target: number };
  hrvCoherence?: { min: number; max: number; target: number };
  defectDensity?: { min: number; max: number; target: number };
}

export interface ValidationCriteria {
  primaryMetric: string;              // e.g., "alphaPower"
  expectedDelta: number;              // Minimum change to consider "worked"
  effectSize?: number;                // Expected Cohen's d from literature
  responderThreshold?: number;        // What % of users should respond
  nullHypothesis: string;             // What we're testing against
}

export interface SafetyConstraints {
  maxIntensity: number;               // 0-1
  maxDuration: number;                // minutes
  exclusionCriteria: string[];        // Who shouldn't use this
  riskThresholds: {
    yellow: number;                   // Reduce intensity
    orange: number;                   // Shift to CALM
    red: number;                      // Emergency stop
  };
}

export interface StimulusProtocol {
  id: string;
  name: string;
  category: 'regulation' | 'entrainment' | 'transition';
  evidenceLevel: 'strong' | 'moderate' | 'weak' | 'experimental';
  description: string;
  targetState: ConsciousnessState;

  // What we output
  stimulus: PsychoactivationOutput;

  // What we expect to happen
  expectedChanges: ExpectedCoherenceChange;

  // How we validate it worked
  validation: ValidationCriteria;

  // Safety limits
  safety: SafetyConstraints;

  // Research backing
  citations: string[];

  // Honest claims
  marketingClaim: string;             // What we CAN say
  prohibitedClaims: string[];         // What we CANNOT say
}

// ============================================================================
// PHASE 1: REGULATION LIBRARY (Strong Evidence)
// ============================================================================

export const BREATH_PACED_GROUNDING: StimulusProtocol = {
  id: 'breath-paced-grounding',
  name: 'Breath-Paced Audio Grounding',
  category: 'regulation',
  evidenceLevel: 'strong',
  description: 'Gentle audio chimes synchronized with slow breathing (4-6 breaths/min) to increase HRV coherence',
  targetState: 'calm',

  stimulus: {
    audio: {
      carrierLeft: 200,
      carrierRight: 200,    // No binaural beat, just grounding tone
      amplitude: 0.4,       // Gentle
      soundscape: 'nature',
    },
    haptic: {
      frequency: 0.1,       // 0.1 Hz = one pulse every 10 seconds (exhale cue)
      amplitude: 0.3,
      pattern: 'breath-synced',
      breathTiming: {
        inhale: 4,          // 4 seconds in
        hold1: 2,           // 2 seconds hold
        exhale: 6,          // 6 seconds out (longer exhale = parasympathetic)
        hold2: 2,           // 2 seconds hold
      },
    },
    light: {
      color: 'amber',       // Warm, calming
      intensity: 0.3,
      modulation: {
        frequency: 0.07,    // ~14 second cycle (matches breath)
        amplitude: 0.2,     // Subtle pulsing
      },
    },
  },

  expectedChanges: {
    alphaPower: { min: 0.35, max: 0.55, target: 0.45 },
    hrvCoherence: { min: 0.5, max: 0.8, target: 0.65 },  // Primary target
    defectDensity: { min: 0.05, max: 0.15, target: 0.1 },
  },

  validation: {
    primaryMetric: 'hrvCoherence',
    expectedDelta: 0.15,    // HRV coherence should increase by at least 0.15
    effectSize: 0.6,        // Moderate effect size from HRV coherence literature
    responderThreshold: 0.65, // 65% of users should respond
    nullHypothesis: 'Breath-paced stimulation does not increase HRV coherence more than control',
  },

  safety: {
    maxIntensity: 0.6,
    maxDuration: 30,
    exclusionCriteria: [],  // Safe for everyone
    riskThresholds: {
      yellow: 0.3,
      orange: 0.6,
      red: 0.85,
    },
  },

  citations: [
    'Lehrer et al. (2000) - Heart rate variability biofeedback',
    'McCraty et al. (2009) - Coherence: Bridging personal, social, and global health',
  ],

  marketingClaim: 'Research-backed breathwork guidance that may improve HRV coherence and support calm states',
  prohibitedClaims: [
    'Guaranteed stress reduction',
    'Cures anxiety',
    'Instant calm',
  ],
};

export const VIBROACOUSTIC_GROUNDING: StimulusProtocol = {
  id: 'vibroacoustic-grounding',
  name: 'Low-Frequency Vibroacoustic Grounding',
  category: 'regulation',
  evidenceLevel: 'moderate',
  description: 'Low-frequency vibration (20-40 Hz) + deep bass tones for somatic grounding and stress reduction',
  targetState: 'calm',

  stimulus: {
    audio: {
      carrierLeft: 80,      // Deep bass (felt as much as heard)
      carrierRight: 80,
      amplitude: 0.5,
      soundscape: 'ambient',
    },
    haptic: {
      frequency: 30,        // 30 Hz = low rumble (somatic grounding)
      amplitude: 0.5,
      pattern: 'continuous',
    },
    light: {
      color: 'red',         // Low-energy, grounding
      intensity: 0.2,
      modulation: {
        frequency: 0.5,     // Slow breathing cue
        amplitude: 0.3,
      },
    },
  },

  expectedChanges: {
    alphaPower: { min: 0.3, max: 0.5, target: 0.4 },
    defectDensity: { min: 0.05, max: 0.2, target: 0.1 },
  },

  validation: {
    primaryMetric: 'subjectiveCalmRating',
    expectedDelta: 1.0,     // Expect 1-point increase on 1-5 scale
    effectSize: 0.4,        // Small-to-moderate (vibroacoustic research is emerging)
    responderThreshold: 0.6,
    nullHypothesis: 'Vibroacoustic stimulation does not reduce subjective stress more than silence',
  },

  safety: {
    maxIntensity: 0.7,
    maxDuration: 45,
    exclusionCriteria: ['Pregnancy (vibration safety unclear)', 'Pacemaker'],
    riskThresholds: {
      yellow: 0.3,
      orange: 0.6,
      red: 0.85,
    },
  },

  citations: [
    'Punkanen & Ala-Ruona (2012) - Contemporary vibroacoustic therapy',
    'ScienceDirect - Vibroacoustic therapy effects (2024)',
  ],

  marketingClaim: 'Emerging vibroacoustic protocols that may support somatic regulation and stress reduction',
  prohibitedClaims: [
    'Proven pain relief',
    'Medical-grade therapy',
    'Replaces medication',
  ],
};

export const ALPHA_RELAXATION: StimulusProtocol = {
  id: 'alpha-relaxation',
  name: 'Alpha Band Relaxation (10 Hz)',
  category: 'regulation',
  evidenceLevel: 'moderate',
  description: '10 Hz binaural beat to support alpha coherence and relaxed alertness',
  targetState: 'calm',

  stimulus: {
    audio: {
      carrierLeft: 200,
      carrierRight: 210,    // 10 Hz binaural beat
      amplitude: 0.5,
      soundscape: 'nature',
    },
    haptic: {
      frequency: 10,        // Match the binaural beat frequency
      amplitude: 0.2,       // Subtle
      pattern: 'pulsed',
    },
    light: {
      color: 'amber',
      intensity: 0.3,
    },
  },

  expectedChanges: {
    alphaPower: { min: 0.35, max: 0.6, target: 0.48 },
    frontalParietalCoherence: { min: 0.4, max: 0.7, target: 0.55 },
  },

  validation: {
    primaryMetric: 'alphaPower',
    expectedDelta: 0.12,    // From binaural beat meta-analysis
    effectSize: 0.4,        // Small-to-moderate (high variability)
    responderThreshold: 0.6, // 60% responders
    nullHypothesis: '10 Hz binaural beat does not increase alpha power more than matched music without beat',
  },

  safety: {
    maxIntensity: 0.7,
    maxDuration: 30,
    exclusionCriteria: [],
    riskThresholds: {
      yellow: 0.3,
      orange: 0.6,
      red: 0.85,
    },
  },

  citations: [
    'Examine - Binaural beats modest effect on cognition, anxiety (2024)',
    'Extrica - Binaural beats anxiety meta-analysis (2024)',
  ],

  marketingClaim: 'Alpha-frequency binaural beats may support relaxation and calm focus in some users',
  prohibitedClaims: [
    'Guaranteed relaxation',
    'Proven anxiety treatment',
    'Works for everyone',
  ],
};

// ============================================================================
// NEW: VIBROACOUSTIC PROTOCOLS (Evidence-Based State Support)
// ============================================================================

export const BREATH_PACED_VIBROACOUSTIC: StimulusProtocol = {
  id: 'breath-paced-vibroacoustic',
  name: 'Breath-Paced Vibroacoustic Grounding',
  category: 'regulation',
  evidenceLevel: 'moderate',
  description: 'Breath pacing at 5.5 breaths/min with synchronized vibroacoustic pulses to increase HRV coherence',
  targetState: 'grounded',

  stimulus: {
    audio: {
      carrierLeft: 200,
      carrierRight: 200,    // No binaural beat
      amplitude: 0.4,
      soundscape: 'forest',
    },
    vibroacoustic: {
      frequency: 30,        // Low-frequency grounding
      amplitude: 0.5,       // Within safety cap (0.75 max)
      pattern: 'breath-paced',
      modulation: 'none',
    },
    haptic: {
      frequency: 0.09,      // 5.5 breaths/min = 0.09 Hz
      amplitude: 0.3,
      pattern: 'breath-pulse',
    },
    light: {
      color: 'amber',
      intensity: 0.3,
    },
  },

  expectedChanges: {
    alphaPower: { min: 0.35, max: 0.55, target: 0.45 },
    hrvCoherence: { min: 0.5, max: 0.85, target: 0.68 },  // Primary target
    defectDensity: { min: 0.05, max: 0.15, target: 0.1 },
  },

  validation: {
    primaryMetric: 'hrvCoherence',
    expectedDelta: 0.18,    // HRV coherence should increase by at least 0.18
    effectSize: 0.6,        // Medium-large effect
    responderThreshold: 0.7, // 70% of users should respond
    nullHypothesis: 'Vibroacoustic + breath pacing does not increase HRV coherence more than breath pacing alone',
  },

  safety: {
    maxIntensity: 0.7,
    maxDuration: 15,
    exclusionCriteria: ['Pregnancy (vibration safety unclear)', 'Pacemaker'],
    riskThresholds: {
      yellow: 0.3,
      orange: 0.6,
      red: 0.85,
    },
  },

  citations: [
    'Lehrer et al. (2000) - HRV biofeedback at resonant frequency',
    'Low-frequency sound vibration stress study (Academia 2024)',
  ],

  marketingClaim: 'Breath-paced vibroacoustic stimulation combined with HRV biofeedback has been studied for stress reduction and nervous system regulation',
  prohibitedClaims: [
    'Guaranteed grounding',
    'Treats PTSD',
    'Cures anxiety',
  ],
};

export const VIBROACOUSTIC_STRESS_REDUCTION: StimulusProtocol = {
  id: 'vibroacoustic-stress-reduction',
  name: 'Low-Frequency Vibroacoustic Stress Reduction',
  category: 'regulation',
  evidenceLevel: 'moderate',
  description: 'Low-frequency vibroacoustic stimulation (30-50 Hz) for acute stress reduction',
  targetState: 'calm',

  stimulus: {
    audio: {
      carrierLeft: 150,
      carrierRight: 150,    // Deep bass
      amplitude: 0.35,
      soundscape: 'ambient-music',
    },
    vibroacoustic: {
      frequency: 40,        // Mid-low range (based on stress study)
      amplitude: 0.45,
      pattern: 'continuous',
      modulation: 'none',   // Steady, no ramps
    },
    haptic: {
      frequency: 8,         // Slow theta-range pulse
      amplitude: 0.25,
      pattern: 'pulsed-gentle',
    },
    light: {
      color: 'red',         // Low-energy, grounding
      intensity: 0.2,
    },
  },

  expectedChanges: {
    alphaPower: { min: 0.3, max: 0.5, target: 0.4 },
    defectDensity: { min: 0.05, max: 0.2, target: 0.1 },
  },

  validation: {
    primaryMetric: 'edaReduction',
    expectedDelta: -0.18,   // 18% EDA reduction
    effectSize: 0.4,        // Small-to-moderate
    responderThreshold: 0.6,
    nullHypothesis: 'Low-frequency vibroacoustic does not reduce stress markers more than matched music alone',
  },

  safety: {
    maxIntensity: 0.7,
    maxDuration: 15,
    exclusionCriteria: ['Severe anxiety (may paradoxically increase arousal)', 'Pregnancy', 'Pacemaker'],
    riskThresholds: {
      yellow: 0.3,
      orange: 0.6,
      red: 0.85,
    },
  },

  citations: [
    'Effect of low-frequency sound vibration on acute stress response in university students (Academia 2024)',
    'Punkanen & Ala-Ruona (2012) - Contemporary vibroacoustic therapy',
  ],

  marketingClaim: 'Low-frequency vibroacoustic stimulation has shown promise in pilot studies for acute stress reduction',
  prohibitedClaims: [
    'Proven stress relief',
    'Medical-grade therapy',
    'Replaces medication',
  ],
};

export const VIBROACOUSTIC_SLEEP_PREP: StimulusProtocol = {
  id: 'vibroacoustic-sleep-prep',
  name: 'Vibroacoustic Sleep Preparation (CLAS-Inspired)',
  category: 'regulation',
  evidenceLevel: 'strong',
  description: 'Phase-locked vibroacoustic protocol inspired by CLAS research for pre-sleep state support',
  targetState: 'consolidation',

  stimulus: {
    audio: {
      carrierLeft: 100,
      carrierRight: 100,
      amplitude: 0.25,
      soundscape: 'silence',
    },
    vibroacoustic: {
      frequency: 25,        // Low delta-range
      amplitude: 0.35,
      pattern: 'phase-locked',
      modulation: 'slow-oscillation-sync',
    },
    haptic: {
      frequency: 1,         // 1 Hz slow pulse
      amplitude: 0.2,
      pattern: 'delta-sync',
    },
    light: {
      color: 'amber',
      intensity: 0.1,       // Very low
    },
  },

  expectedChanges: {
    thetaPower: { min: 0.4, max: 0.7, target: 0.55 },
    alphaPower: { min: 0.3, max: 0.5, target: 0.4 },
    defectDensity: { min: 0.05, max: 0.15, target: 0.1 },
  },

  validation: {
    primaryMetric: 'sleepQuality',
    expectedDelta: 0.7,     // 0.7 point increase on 0-10 scale
    effectSize: 0.5,        // Medium effect (extrapolated from CLAS)
    responderThreshold: 0.65,
    nullHypothesis: 'Vibroacoustic pre-sleep protocol does not improve sleep quality more than silence',
  },

  safety: {
    maxIntensity: 0.5,      // Conservative for pre-sleep
    maxDuration: 30,
    exclusionCriteria: ['Sleep apnea', 'Narcolepsy', 'Pregnancy', 'Pacemaker'],
    riskThresholds: {
      yellow: 0.25,         // Very conservative
      orange: 0.5,
      red: 0.75,
    },
  },

  citations: [
    'Closed-loop acoustic stimulation (CLAS) RCT 2024',
    'Phase-locked acoustic stimulation sleep enhancement studies',
  ],

  marketingClaim: 'Our sleep preparation protocol is inspired by closed-loop acoustic stimulation (CLAS) research, which has demonstrated measurable improvements in slow-wave sleep',
  prohibitedClaims: [
    'Treats insomnia',
    'Cures sleep disorders',
    'Guaranteed better sleep',
  ],
};

export const VIBROACOUSTIC_ATTENTION_RESET: StimulusProtocol = {
  id: 'vibroacoustic-attention-reset',
  name: 'Vibroacoustic Attention Reset (Flow Prep)',
  category: 'entrainment',
  evidenceLevel: 'weak',
  description: 'Brief high-coherence vibroacoustic session to reset attention and prepare for flow',
  targetState: 'clarity',

  stimulus: {
    audio: {
      carrierLeft: 200,
      carrierRight: 240,    // 40 Hz binaural beat (focus/gamma)
      amplitude: 0.5,
      soundscape: 'structured-rhythm',
    },
    vibroacoustic: {
      frequency: 50,        // Mid-range, alerting
      amplitude: 0.5,
      pattern: 'rhythmic-pulse',
      modulation: 'gentle-crescendo',
    },
    haptic: {
      frequency: 40,        // Gamma-range haptic pulse
      amplitude: 0.35,
      pattern: 'focus-pulse',
    },
    light: {
      color: 'white',
      intensity: 0.4,
    },
  },

  expectedChanges: {
    betaPower: { min: 0.25, max: 0.45, target: 0.35 },
    gammaPower: { min: 0.15, max: 0.3, target: 0.23 },
    frontalParietalCoherence: { min: 0.45, max: 0.7, target: 0.58 },
  },

  validation: {
    primaryMetric: 'taskPerformance',
    expectedDelta: 0.12,    // 12% improvement on sustained attention task
    effectSize: 0.4,        // Small-to-moderate
    responderThreshold: 0.55,
    nullHypothesis: 'Vibroacoustic attention reset does not improve task performance more than brief break alone',
  },

  safety: {
    maxIntensity: 0.7,
    maxDuration: 10,
    exclusionCriteria: ['Anxiety disorders (may over-activate)', 'Seizure history', 'Pregnancy', 'Pacemaker'],
    riskThresholds: {
      yellow: 0.3,
      orange: 0.6,
      red: 0.85,
    },
  },

  citations: [
    '40 Hz gamma entrainment research (limited vibroacoustic data)',
    'Vibroacoustic stress reduction studies (extrapolated)',
  ],

  marketingClaim: 'Vibroacoustic stimulation combined with gamma-frequency binaural beats may support attention and mental clarity for some users',
  prohibitedClaims: [
    'Boosts focus',
    'Improves productivity',
    'Guaranteed flow state',
  ],
};

export const VIBROACOUSTIC_SOMATIC_EXPLORATION: StimulusProtocol = {
  id: 'vibroacoustic-somatic-exploration',
  name: 'Vibroacoustic Somatic Exploration (Advanced)',
  category: 'transition',
  evidenceLevel: 'experimental',
  description: 'User-controlled vibroacoustic exploration for interoceptive awareness (high screening required)',
  targetState: 'introspective',

  stimulus: {
    audio: {
      carrierLeft: 120,
      carrierRight: 120,
      amplitude: 0.3,
      soundscape: 'silence',
    },
    vibroacoustic: {
      frequency: 50,        // Variable 20-80 Hz (user-controlled)
      amplitude: 0.5,       // Max 0.65 (user-controlled)
      pattern: 'exploratory',
      modulation: 'responsive',
    },
    haptic: {
      frequency: 0,         // No haptic (full-body vibroacoustic only)
      amplitude: 0,
      pattern: 'pulsed',
    },
    light: {
      color: 'amber',
      intensity: 0.2,
    },
  },

  expectedChanges: {
    thetaPower: { min: 0.35, max: 0.6, target: 0.48 },
    alphaPower: { min: 0.3, max: 0.5, target: 0.4 },
    defectDensity: { min: 0.1, max: 0.3, target: 0.18 },
  },

  validation: {
    primaryMetric: 'interoceptiveAwareness',
    expectedDelta: 7,       // +7 points on Interoceptive Awareness Scale
    effectSize: 0.5,        // Medium (estimated)
    responderThreshold: 0.6,
    nullHypothesis: 'Vibroacoustic somatic exploration does not increase interoceptive awareness more than quiet rest',
  },

  safety: {
    maxIntensity: 0.65,     // Lower than standard for experimental protocol
    maxDuration: 20,
    exclusionCriteria: [
      'Psychosis history',
      'Severe dissociation',
      'Unintegrated trauma',
      'Bloom Level < 4',     // High screening: Pattern recognition demonstrated
      'No prior somatic/meditation experience',
      'Pregnancy',
      'Pacemaker',
    ],
    riskThresholds: {
      yellow: 0.25,         // Very strict
      orange: 0.5,
      red: 0.7,
    },
  },

  citations: [
    'Somatic therapy literature (no specific vibroacoustic studies)',
    'Interoceptive awareness research (extrapolated)',
  ],

  marketingClaim: 'Vibroacoustic somatic exploration is an experimental protocol for interoceptive awareness, available only to users with demonstrated grounding and integration capacity',
  prohibitedClaims: [
    'Releases trauma',
    'Guaranteed emotional breakthroughs',
    'Replaces therapy',
    'Digital psychedelic',
  ],
};

// ============================================================================
// NEW: ASSR PROTOCOLS (Auditory Steady-State Response - Entrainment Focus)
// ============================================================================

export const ASSR_RECEPTIVE_ABSORPTION: StimulusProtocol = {
  id: 'assr-receptive-absorption',
  name: 'ASSR Receptive Absorption (10 Hz Isochronic)',
  category: 'entrainment',
  evidenceLevel: 'moderate',
  description: '10 Hz isochronic tones with ASSR validation for receptive, open awareness states',
  targetState: 'receptive',

  stimulus: {
    audio: {
      carrierLeft: 200,
      carrierRight: 200,    // No binaural beat; using isochronic instead
      amplitude: 0.5,
      soundscape: 'ambient', // Isochronic tones embedded in ambient soundscape
    },
    haptic: {
      frequency: 10,        // Sync to isochronic rhythm
      amplitude: 0.25,
      pattern: 'pulsed',
    },
    light: {
      color: 'amber',
      intensity: 0.3,
      modulation: {
        frequency: 10,      // Multimodal entrainment
        amplitude: 0.25,    // Subtle
      },
    },
  },

  expectedChanges: {
    alphaPower: { min: 0.4, max: 0.7, target: 0.55 },
    thetaPower: { min: 0.3, max: 0.5, target: 0.4 },
    frontalParietalCoherence: { min: 0.45, max: 0.7, target: 0.58 },
    globalSynchrony: { min: 0.45, max: 0.7, target: 0.58 },
  },

  validation: {
    primaryMetric: 'assrPLV',  // Phase-Locking Value at 10 Hz
    expectedDelta: 0.35,        // PLV > 0.3 = entrainment detected
    effectSize: 0.5,            // From ASSR literature
    responderThreshold: 0.65,   // 65% should show measurable entrainment
    nullHypothesis: '10 Hz isochronic stimulation does not produce measurable ASSR (PLV < 0.3)',
  },

  safety: {
    maxIntensity: 0.7,
    maxDuration: 25,
    exclusionCriteria: ['Seizure history', 'Active psychosis', 'Severe dissociation'],
    riskThresholds: {
      yellow: 0.35,
      orange: 0.6,
      red: 0.85,
    },
  },

  citations: [
    'PMC - ASSR binaural beats entrainment review (2023)',
    'The 40-Hz ASSR enhanced by beta-band subharmonics (ResearchGate 2023)',
  ],

  marketingClaim: 'Auditory steady-state response (ASSR) protocols with measurable neural entrainment; we validate phase-locking in real-time',
  prohibitedClaims: [
    'Guaranteed absorption',
    'Instant meditative states',
    'Replaces meditation practice',
  ],
};

export const ASSR_CONTEMPLATIVE_THETA: StimulusProtocol = {
  id: 'assr-contemplative-theta',
  name: 'ASSR Contemplative Theta (6.5 Hz)',
  category: 'entrainment',
  evidenceLevel: 'moderate',
  description: '6.5 Hz theta-band ASSR protocol for contemplative absorption with breath coupling',
  targetState: 'contemplative',

  stimulus: {
    audio: {
      carrierLeft: 150,
      carrierRight: 156.5,  // 6.5 Hz binaural beat
      amplitude: 0.45,
      soundscape: 'ambient',
    },
    vibroacoustic: {
      frequency: 6.5,       // Match theta frequency
      amplitude: 0.4,
      pattern: 'pulsed',
      modulation: 'none',
    },
    haptic: {
      frequency: 0.08,      // ~5 breaths/min (slower for contemplative)
      amplitude: 0.25,
      pattern: 'breath-pulse',
    },
    light: {
      color: 'amber',
      intensity: 0.2,       // Low for absorption
    },
  },

  expectedChanges: {
    thetaPower: { min: 0.45, max: 0.75, target: 0.6 },
    alphaPower: { min: 0.4, max: 0.7, target: 0.55 },
    globalSynchrony: { min: 0.5, max: 0.8, target: 0.65 },
    defectDensity: { min: 0.05, max: 0.2, target: 0.12 },
    fieldAlignment: { min: 0.65, max: 0.95, target: 0.8 },  // High alignment = positive valence
  },

  validation: {
    primaryMetric: 'assrPLV',  // Phase-Locking Value at 6.5 Hz
    expectedDelta: 0.32,        // PLV > 0.3 = entrainment
    effectSize: 0.45,           // Moderate
    responderThreshold: 0.6,
    nullHypothesis: 'Theta-band ASSR does not produce measurable entrainment (PLV < 0.3)',
  },

  safety: {
    maxIntensity: 0.65,
    maxDuration: 30,
    exclusionCriteria: ['Seizure history', 'Severe dissociation', 'Unintegrated trauma (theta can surface material)'],
    riskThresholds: {
      yellow: 0.35,
      orange: 0.6,
      red: 0.8,
    },
  },

  citations: [
    'PMC - Binaural beats entrainment meta-analysis (2023)',
    'Meditation EEG theta-alpha synchrony studies',
  ],

  marketingClaim: 'Theta-band ASSR protocols studied in contemplative neuroscience; entrainment validated via phase-locking metrics',
  prohibitedClaims: [
    'Induces meditation',
    'Guaranteed absorption',
    'Spiritual awakening',
  ],
};

export const ASSR_GAMMA_INSIGHT: StimulusProtocol = {
  id: 'assr-gamma-insight',
  name: 'ASSR Gamma Insight Pulse (40 Hz)',
  category: 'entrainment',
  evidenceLevel: 'moderate',
  description: '40 Hz gamma-band ASSR for insight moments and cognitive binding',
  targetState: 'insightful',

  stimulus: {
    audio: {
      carrierLeft: 200,
      carrierRight: 240,    // 40 Hz binaural beat
      amplitude: 0.55,
      soundscape: 'structured-rhythm',
    },
    vibroacoustic: {
      frequency: 40,        // Match gamma
      amplitude: 0.45,
      pattern: 'pulsed',
      modulation: 'none',
    },
    haptic: {
      frequency: 40,        // Multimodal gamma entrainment
      amplitude: 0.35,
      pattern: 'pulsed',
    },
    light: {
      color: 'white',
      intensity: 0.45,
      modulation: {
        frequency: 40,      // CAREFULLY - not epileptogenic if amplitude low
        amplitude: 0.2,     // Very subtle modulation
      },
    },
  },

  expectedChanges: {
    gammaPower: { min: 0.2, max: 0.4, target: 0.3 },
    betaPower: { min: 0.25, max: 0.45, target: 0.35 },
    frontalParietalCoherence: { min: 0.5, max: 0.75, target: 0.63 },
    globalSynchrony: { min: 0.5, max: 0.75, target: 0.62 },
  },

  validation: {
    primaryMetric: 'assrPLV',  // Phase-Locking Value at 40 Hz
    expectedDelta: 0.38,        // Strong gamma ASSR expected
    effectSize: 0.55,           // Medium-large
    responderThreshold: 0.6,
    nullHypothesis: '40 Hz multimodal stimulation does not produce gamma ASSR (PLV < 0.3)',
  },

  safety: {
    maxIntensity: 0.65,
    maxDuration: 15,        // Shorter for high-frequency
    exclusionCriteria: [
      'Seizure history',
      'Epilepsy',
      'Photosensitivity',
      'Anxiety disorders (may over-activate)',
      'Mania/bipolar (gamma can trigger activation)',
    ],
    riskThresholds: {
      yellow: 0.4,          // More sensitive for gamma
      orange: 0.65,
      red: 0.85,
    },
  },

  citations: [
    'Iaccarino et al. (2016) - Gamma frequency entrainment',
    'Adaikkan et al. (2019) - Gamma binds higher-order brain regions',
    'The 40-Hz ASSR enhanced by beta-band subharmonics (2023)',
  ],

  marketingClaim: '40 Hz gamma-band ASSR protocols studied in cognitive neuroscience; may support moments of insight and cognitive binding',
  prohibitedClaims: [
    'Boosts IQ',
    'Guaranteed insights',
    'Cognitive enhancement',
  ],
};

export const ASSR_HYPNAGOGIC_DOORWAY: StimulusProtocol = {
  id: 'assr-hypnagogic-doorway',
  name: 'ASSR Hypnagogic Doorway (4-8 Hz Sweep)',
  category: 'transition',
  evidenceLevel: 'experimental',
  description: 'Slow theta sweep (4-8 Hz) with ASSR tracking for hypnagogic trance induction',
  targetState: 'introspective',

  stimulus: {
    audio: {
      carrierLeft: 150,
      carrierRight: 154,    // Start at 4 Hz, sweep to 8 Hz over 15 minutes
      amplitude: 0.4,
      soundscape: 'ambient',
    },
    vibroacoustic: {
      frequency: 6,         // Mid-theta (will sweep 4-8 Hz)
      amplitude: 0.35,
      pattern: 'pulsed',
      modulation: 'gentle-crescendo',
    },
    haptic: {
      frequency: 0.05,      // Very slow (3 breaths/min)
      amplitude: 0.2,
      pattern: 'breath-pulse',
    },
    light: {
      color: 'red',         // Low arousal
      intensity: 0.15,      // Very dim
    },
  },

  expectedChanges: {
    thetaPower: { min: 0.5, max: 0.8, target: 0.65 },
    alphaPower: { min: 0.35, max: 0.6, target: 0.48 },
    defectDensity: { min: 0.1, max: 0.35, target: 0.22 },  // Higher tolerance (hypnagogic can be disorderly)
    globalSynchrony: { min: 0.4, max: 0.7, target: 0.55 },
  },

  validation: {
    primaryMetric: 'assrPLV',  // Track PLV across 4-8 Hz sweep
    expectedDelta: 0.3,         // Entrainment at multiple theta frequencies
    effectSize: 0.4,            // Moderate (less research on sweeps)
    responderThreshold: 0.55,
    nullHypothesis: 'Theta sweep does not produce continuous ASSR entrainment',
  },

  safety: {
    maxIntensity: 0.6,
    maxDuration: 20,
    exclusionCriteria: [
      'Seizure history',
      'Psychosis (hypnagogic can blur reality boundaries)',
      'Severe dissociation',
      'Unintegrated trauma',
      'Bloom Level < 3',     // Need basic integration capacity
    ],
    riskThresholds: {
      yellow: 0.3,          // Conservative for trance induction
      orange: 0.55,
      red: 0.75,
    },
  },

  citations: [
    'Hypnagogic state EEG research (theta-alpha transition)',
    'ASSR literature (limited hypnagogic data)',
  ],

  marketingClaim: 'Experimental theta-sweep protocol for hypnagogic threshold exploration; ASSR entrainment monitored in real-time',
  prohibitedClaims: [
    'Lucid dreaming guarantee',
    'Astral projection',
    'Guaranteed visions',
    'Psychedelic simulation',
  ],
};

// ============================================================================
// PHASE 2: ENTRAINMENT LIBRARY (Measurable, Experimental)
// ============================================================================

export const GAMMA_FOCUS_40HZ: StimulusProtocol = {
  id: 'gamma-focus-40hz',
  name: 'Gamma Entrainment (40 Hz Focus)',
  category: 'entrainment',
  evidenceLevel: 'moderate',
  description: '40 Hz multisensory stimulation to entrain gamma-band activity and support focused attention',
  targetState: 'focus',

  stimulus: {
    audio: {
      carrierLeft: 200,
      carrierRight: 240,    // 40 Hz binaural beat
      amplitude: 0.6,
      soundscape: 'ambient',
    },
    haptic: {
      frequency: 40,        // Match gamma frequency
      amplitude: 0.4,
      pattern: 'pulsed',
    },
    light: {
      color: 'white',
      intensity: 0.5,
      modulation: {
        frequency: 40,      // 40 Hz light pulses (CAREFULLY - not epileptogenic)
        amplitude: 0.3,     // Subtle modulation, not full flashing
      },
    },
  },

  expectedChanges: {
    gammaPower: { min: 0.15, max: 0.35, target: 0.25 },
    globalSynchrony: { min: 0.45, max: 0.7, target: 0.58 },
  },

  validation: {
    primaryMetric: 'gammaPower',
    expectedDelta: 0.08,    // Modest gamma power increase
    effectSize: 0.5,        // From 40 Hz stimulation literature
    responderThreshold: 0.5, // Variable response
    nullHypothesis: '40 Hz stimulation does not increase gamma power more than 10 Hz control',
  },

  safety: {
    maxIntensity: 0.6,      // Conservative for light modulation
    maxDuration: 20,        // Shorter sessions for high-frequency stimulation
    exclusionCriteria: [
      'Seizure history',
      'Epilepsy',
      'Photosensitivity',
    ],
    riskThresholds: {
      yellow: 0.4,          // More sensitive thresholds
      orange: 0.65,
      red: 0.85,
    },
  },

  citations: [
    'Iaccarino et al. (2016) - Gamma frequency entrainment attenuates amyloid load',
    'Adaikkan et al. (2019) - Gamma entrainment binds higher-order brain regions',
    'Examine - 40 Hz sensory stimulation research (2024)',
  ],

  marketingClaim: 'Gamma-band sensory entrainment protocols studied in cognitive research contexts; outcomes vary by individual',
  prohibitedClaims: [
    'Boosts brain power',
    'Improves IQ',
    'Treats cognitive decline',
  ],
};

export const THETA_ABSORPTION: StimulusProtocol = {
  id: 'theta-absorption',
  name: 'Theta Band Absorption (6 Hz)',
  category: 'entrainment',
  evidenceLevel: 'weak',
  description: '6 Hz binaural beat to support theta activity and contemplative absorption',
  targetState: 'depth',

  stimulus: {
    audio: {
      carrierLeft: 200,
      carrierRight: 206,    // 6 Hz binaural beat
      amplitude: 0.5,
      soundscape: 'ambient',
    },
    haptic: {
      frequency: 6,
      amplitude: 0.3,
      pattern: 'pulsed',
    },
    light: {
      color: 'amber',
      intensity: 0.2,       // Low light for absorption
    },
  },

  expectedChanges: {
    thetaPower: { min: 0.25, max: 0.45, target: 0.35 },
    alphaPower: { min: 0.3, max: 0.5, target: 0.4 },
  },

  validation: {
    primaryMetric: 'thetaAlphaRatio',
    expectedDelta: 0.15,    // Theta/alpha ratio should increase
    effectSize: 0.3,        // Small effect (less research backing)
    responderThreshold: 0.5,
    nullHypothesis: 'Theta binaural beat does not increase theta/alpha ratio more than control',
  },

  safety: {
    maxIntensity: 0.7,
    maxDuration: 25,
    exclusionCriteria: [],
    riskThresholds: {
      yellow: 0.4,
      orange: 0.65,
      red: 0.85,
    },
  },

  citations: [
    'Binaural beats literature (mixed evidence for theta effects)',
  ],

  marketingClaim: 'Theta-frequency protocols may support contemplative states; research is ongoing',
  prohibitedClaims: [
    'Induces meditation',
    'Guarantees deep states',
    'Replaces meditation practice',
  ],
};

// ============================================================================
// PHASE 3: TRANSITION ARCHETYPES (Inspired by Phenomenology, Experimental)
// ============================================================================

export const WIND_UP_CRESCENDO: StimulusProtocol = {
  id: 'wind-up-crescendo',
  name: 'Wind-Up Crescendo (Phenomenology-Inspired)',
  category: 'transition',
  evidenceLevel: 'experimental',
  description: 'Gradual frequency rise (0.5 Hz → 40 Hz) with haptic "threshold pulse" - inspired by DMT phenomenology reports, NOT claiming equivalence',
  targetState: 'depth',

  stimulus: {
    // This is a TIME-VARYING stimulus (parameters change over session)
    // Implementation note: psychoactivationEngine will interpolate
    audio: {
      carrierLeft: 200,
      carrierRight: 200.5,  // Start at 0.5 Hz beat
      // Will ramp to: carrierRight: 240 (40 Hz beat) over 10 minutes
      amplitude: 0.3,       // Start gentle
      // Will ramp to: 0.7 at peak
      soundscape: 'ambient',
    },
    haptic: {
      frequency: 0.5,       // Start slow
      // Will ramp to: 40 Hz at peak
      amplitude: 0.2,
      pattern: 'pulsed',
    },
    light: {
      color: 'white',
      intensity: 0.1,
      // Will ramp to: 0.5 at peak
    },
  },

  expectedChanges: {
    // We expect spectral entropy to INCREASE (more disorder = exploration)
    alphaPower: { min: 0.2, max: 0.5, target: 0.35 },
    gammaPower: { min: 0.15, max: 0.4, target: 0.27 },
    globalSynchrony: { min: 0.4, max: 0.75, target: 0.58 },
  },

  validation: {
    primaryMetric: 'spectralEntropy',
    expectedDelta: 0.3,     // Entropy should increase during wind-up
    effectSize: 0.5,        // Estimated (no direct research)
    responderThreshold: 0.5,
    nullHypothesis: 'Wind-up crescendo does not increase spectral entropy more than flat 40 Hz stimulation',
  },

  safety: {
    maxIntensity: 0.7,
    maxDuration: 20,        // Shorter for intense protocols
    exclusionCriteria: [
      'Seizure history',
      'Active psychosis',
      'Severe anxiety',
    ],
    riskThresholds: {
      yellow: 0.35,         // Lower thresholds for experimental protocols
      orange: 0.6,
      red: 0.8,
    },
  },

  citations: [
    'Gomez Emilsson (QRI) - DMT phenomenology (descriptive, not prescriptive)',
    'Neural annealing theory - gradual intensification',
  ],

  marketingClaim: 'A transition ritual inspired by consciousness phenomenology research; experimental and not validated',
  prohibitedClaims: [
    'Digital DMT',
    'Simulates psychedelic breakthrough',
    'Replaces DMT',
    'Carrier wave breakthrough',
  ],
};

export const ANNEALING_PATHWAY: StimulusProtocol = {
  id: 'annealing-pathway',
  name: 'Neural Annealing Pathway (CALM → DEPTH → INTEGRATION)',
  category: 'transition',
  evidenceLevel: 'experimental',
  description: 'Multi-phase session using neural annealing principles: heat → explore → cool → crystallize',
  targetState: 'integration',

  // This is a MULTI-PHASE protocol (handled by annealingOptimizer)
  // Stimulus params will vary by phase
  stimulus: {
    audio: {
      carrierLeft: 200,
      carrierRight: 200,    // Will vary by phase
      amplitude: 0.5,
      soundscape: 'nature',
    },
    haptic: {
      frequency: 10,        // Will vary by phase
      amplitude: 0.3,
      pattern: 'pulsed',
    },
    light: {
      color: 'amber',
      intensity: 0.3,
    },
  },

  expectedChanges: {
    // Expect coherence to VARY across phases (up during heat, stabilize during cool)
    globalSynchrony: { min: 0.35, max: 0.75, target: 0.55 },
    defectDensity: { min: 0.05, max: 0.25, target: 0.12 },
  },

  validation: {
    primaryMetric: 'integrationRating',
    expectedDelta: 1.5,     // Expect higher integration than abrupt protocols
    effectSize: 0.6,        // From neural annealing theory
    responderThreshold: 0.7,
    nullHypothesis: 'Annealing pathway does not improve integration more than abrupt DEPTH session',
  },

  safety: {
    maxIntensity: 0.8,      // Can go higher because of gradual approach
    maxDuration: 45,
    exclusionCriteria: [
      'Seizure history',
      'Active psychosis',
    ],
    riskThresholds: {
      yellow: 0.35,
      orange: 0.65,
      red: 0.85,
    },
  },

  citations: [
    'Gomez Emilsson & Johnson (2019) - Neural annealing theory',
    'QRI - Psychedelic thermodynamics framework',
  ],

  marketingClaim: 'A gradual intensification protocol based on neural annealing principles; experimental validation ongoing',
  prohibitedClaims: [
    'Guaranteed breakthrough',
    'Psychedelic simulation',
    'Safe psychedelic alternative',
  ],
};

// ============================================================================
// PROTOCOL REGISTRY
// ============================================================================

export const PROTOCOL_LIBRARY: Record<string, StimulusProtocol> = {
  // Phase 1: Regulation (Strong Evidence)
  [BREATH_PACED_GROUNDING.id]: BREATH_PACED_GROUNDING,
  [VIBROACOUSTIC_GROUNDING.id]: VIBROACOUSTIC_GROUNDING,
  [ALPHA_RELAXATION.id]: ALPHA_RELAXATION,

  // Vibroacoustic Regulation (Evidence-Based)
  [BREATH_PACED_VIBROACOUSTIC.id]: BREATH_PACED_VIBROACOUSTIC,
  [VIBROACOUSTIC_STRESS_REDUCTION.id]: VIBROACOUSTIC_STRESS_REDUCTION,
  [VIBROACOUSTIC_SLEEP_PREP.id]: VIBROACOUSTIC_SLEEP_PREP,

  // Phase 2: Entrainment (Measurable)
  [GAMMA_FOCUS_40HZ.id]: GAMMA_FOCUS_40HZ,
  [THETA_ABSORPTION.id]: THETA_ABSORPTION,
  [VIBROACOUSTIC_ATTENTION_RESET.id]: VIBROACOUSTIC_ATTENTION_RESET,

  // ASSR Protocols (Entrainment with Phase-Locking Validation)
  [ASSR_RECEPTIVE_ABSORPTION.id]: ASSR_RECEPTIVE_ABSORPTION,
  [ASSR_CONTEMPLATIVE_THETA.id]: ASSR_CONTEMPLATIVE_THETA,
  [ASSR_GAMMA_INSIGHT.id]: ASSR_GAMMA_INSIGHT,
  [ASSR_HYPNAGOGIC_DOORWAY.id]: ASSR_HYPNAGOGIC_DOORWAY,

  // Phase 3: Transition Archetypes (Experimental)
  [WIND_UP_CRESCENDO.id]: WIND_UP_CRESCENDO,
  [ANNEALING_PATHWAY.id]: ANNEALING_PATHWAY,
  [VIBROACOUSTIC_SOMATIC_EXPLORATION.id]: VIBROACOUSTIC_SOMATIC_EXPLORATION,
};

// ============================================================================
// PROTOCOL SELECTION LOGIC
// ============================================================================

export interface ProtocolSelectionCriteria {
  targetState: ConsciousnessState;
  userExperience: 'novice' | 'intermediate' | 'advanced';
  riskTolerance: 'conservative' | 'moderate' | 'exploratory';
  evidencePreference: 'strong-only' | 'moderate-ok' | 'experimental-ok';
}

export function selectProtocol(criteria: ProtocolSelectionCriteria): StimulusProtocol {
  const candidates = Object.values(PROTOCOL_LIBRARY).filter((protocol) => {
    // Match target state
    if (protocol.targetState !== criteria.targetState) return false;

    // Filter by evidence level
    if (criteria.evidencePreference === 'strong-only' && protocol.evidenceLevel !== 'strong') return false;
    if (criteria.evidencePreference === 'moderate-ok' && protocol.evidenceLevel === 'experimental') return false;

    // Filter by risk tolerance
    if (criteria.riskTolerance === 'conservative' && protocol.category === 'transition') return false;

    return true;
  });

  if (candidates.length === 0) {
    // Fallback: breath-paced grounding (safest)
    return BREATH_PACED_GROUNDING;
  }

  // Prioritize by evidence level
  const sorted = candidates.sort((a, b) => {
    const evidenceRank = { strong: 3, moderate: 2, weak: 1, experimental: 0 };
    return evidenceRank[b.evidenceLevel] - evidenceRank[a.evidenceLevel];
  });

  return sorted[0];
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export interface ProtocolValidationResult {
  protocolId: string;
  workedAsExpected: boolean;
  primaryMetricDelta: number;
  expectedDelta: number;
  effectSize: number;
  responderStatus: 'strong-responder' | 'moderate-responder' | 'non-responder';
  subjectiveRating?: number;
  adverseEvents: string[];
}

export function validateProtocolEffect(
  protocol: StimulusProtocol,
  baselineSnapshot: CoherenceSnapshot,
  interventionSnapshot: CoherenceSnapshot,
  subjectiveRating?: number
): ProtocolValidationResult {
  const validation = protocol.validation;
  const metric = validation.primaryMetric;

  // Extract metric values (simplified - actual implementation would use coherence data)
  let baselineValue = 0;
  let interventionValue = 0;

  // Map metric names to coherence snapshot fields
  if (metric === 'alphaPower') {
    baselineValue = baselineSnapshot.phaseCoupling.alphaPower;
    interventionValue = interventionSnapshot.phaseCoupling.alphaPower;
  } else if (metric === 'gammaPower') {
    baselineValue = baselineSnapshot.phaseCoupling.gammaPower;
    interventionValue = interventionSnapshot.phaseCoupling.gammaPower;
  } else if (metric === 'globalSynchrony') {
    baselineValue = baselineSnapshot.phaseCoupling.globalSynchrony;
    interventionValue = interventionSnapshot.phaseCoupling.globalSynchrony;
  } else if (metric === 'hrvCoherence') {
    // Would come from HRV sensor data
    baselineValue = 0.3; // placeholder
    interventionValue = 0.5; // placeholder
  }

  const delta = interventionValue - baselineValue;
  const workedAsExpected = delta >= validation.expectedDelta;

  // Calculate effect size (Cohen's d)
  const pooledSD = 0.15; // Simplified - would calculate from data
  const effectSize = delta / pooledSD;

  // Determine responder status
  let responderStatus: 'strong-responder' | 'moderate-responder' | 'non-responder';
  if (delta >= validation.expectedDelta * 1.5) {
    responderStatus = 'strong-responder';
  } else if (delta >= validation.expectedDelta * 0.5) {
    responderStatus = 'moderate-responder';
  } else {
    responderStatus = 'non-responder';
  }

  return {
    protocolId: protocol.id,
    workedAsExpected,
    primaryMetricDelta: delta,
    expectedDelta: validation.expectedDelta,
    effectSize,
    responderStatus,
    subjectiveRating,
    adverseEvents: [], // Would be populated from safety monitoring
  };
}

// ============================================================================
// CLOSED-LOOP ADAPTATION
// ============================================================================

export interface AdaptationRecommendation {
  action: 'continue' | 'increase-intensity' | 'decrease-intensity' | 'switch-protocol' | 'stop';
  reason: string;
  adjustedStimulus?: Partial<PsychoactivationOutput>;
}

export function adaptStimulus(
  protocol: StimulusProtocol,
  currentSnapshot: CoherenceSnapshot,
  targetReached: boolean,
  riskScore: number
): AdaptationRecommendation {
  // Safety first: if risk is too high, reduce or stop
  if (riskScore >= protocol.safety.riskThresholds.red) {
    return {
      action: 'stop',
      reason: `Risk score ${riskScore.toFixed(2)} exceeds red threshold ${protocol.safety.riskThresholds.red}`,
    };
  }

  if (riskScore >= protocol.safety.riskThresholds.orange) {
    return {
      action: 'decrease-intensity',
      reason: `Risk score ${riskScore.toFixed(2)} exceeds orange threshold ${protocol.safety.riskThresholds.orange}`,
      adjustedStimulus: {
        audio: {
          ...protocol.stimulus.audio,
          amplitude: protocol.stimulus.audio.amplitude * 0.7,
        },
        haptic: {
          ...protocol.stimulus.haptic,
          amplitude: protocol.stimulus.haptic.amplitude * 0.7,
        },
      },
    };
  }

  // If target reached and safe, continue
  if (targetReached && riskScore < protocol.safety.riskThresholds.yellow) {
    return {
      action: 'continue',
      reason: 'Target coherence reached and risk is low',
    };
  }

  // If not reaching target and safe, consider increasing intensity
  if (!targetReached && riskScore < protocol.safety.riskThresholds.yellow) {
    const currentIntensity = protocol.stimulus.audio.amplitude;
    if (currentIntensity < protocol.safety.maxIntensity) {
      return {
        action: 'increase-intensity',
        reason: 'Target not reached; safe to increase intensity',
        adjustedStimulus: {
          audio: {
            ...protocol.stimulus.audio,
            amplitude: Math.min(currentIntensity * 1.15, protocol.safety.maxIntensity),
          },
        },
      };
    } else {
      return {
        action: 'switch-protocol',
        reason: 'Max intensity reached but target not achieved; user may be non-responder to this protocol',
      };
    }
  }

  // Default: continue
  return {
    action: 'continue',
    reason: 'Proceeding as planned',
  };
}
