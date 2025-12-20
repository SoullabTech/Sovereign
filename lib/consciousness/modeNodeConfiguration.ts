/**
 * Mode-Aware Node Configuration
 *
 * Configures how the three nodes (Sacred Mirror, Consultation, Supervisor)
 * behave in each of the three modes (Talk, Care, Note).
 *
 * Philosophy: Same architecture, different tuning.
 * The nodes adapt their emphasis and behavior based on mode context.
 */

import type {
  SacredMirrorStyle,
  SacredMirrorDepth,
  SacredMirrorRhythm,
  SacredMirrorEntryPoint,
  ConsultationType,
  SupervisorLayer,
} from '../types/three-node-architecture';

export type Mode = 'dialogue' | 'counsel' | 'scribe';

export type NodeEmphasis = 'HIGH' | 'MEDIUM' | 'LOW';

export interface SacredMirrorConfig {
  emphasis: NodeEmphasis;
  preferredStyles: SacredMirrorStyle[];
  depthRange: SacredMirrorDepth[];
  rhythmRange: SacredMirrorRhythm[];
  entryPoints: SacredMirrorEntryPoint[];
  varietyLevel: 'high' | 'medium' | 'low';
}

export interface ConsultationConfig {
  emphasis: NodeEmphasis;
  enabled: boolean;
  activationThreshold: number; // 0-1, lower = more likely to activate
  typesAllowed: ConsultationType[];
  minConfidence: number; // 0-1, minimum confidence to use consultation
  priority: 'speed' | 'depth' | 'pattern';
}

export interface SupervisorConfig {
  emphasis: NodeEmphasis;
  layersActive: SupervisorLayer[];
  blockThreshold: number; // 0-1, higher = more permissive
  regenerateThreshold: number; // 0-1, higher = less likely to regenerate
  feedbackDetail: 'minimal' | 'detailed' | 'meta-level';
  focusAreas: string[];
}

export interface ModeNodeConfiguration {
  mode: Mode;
  displayName: string;
  description: string;
  sacredMirror: SacredMirrorConfig;
  consultation: ConsultationConfig;
  supervisor: SupervisorConfig;
  defaultProcessingPath: 'FAST' | 'CORE' | 'DEEP';
  pathWeights: {
    FAST: number;
    CORE: number;
    DEEP: number;
  };
}

/**
 * Talk Mode (Dialogue) Configuration
 *
 * Emphasis: Speed, spontaneity, conversational presence
 * Sacred Mirror: HIGH - Quick conversational engagement
 * Consultation: LOW - Only for critical moments
 * Supervisor: MEDIUM - Safety net without over-correction
 */
const TALK_MODE_CONFIG: ModeNodeConfiguration = {
  mode: 'dialogue',
  displayName: 'Talk',
  description: 'Quick conversational presence, NLP-style engagement',

  sacredMirror: {
    emphasis: 'HIGH',
    preferredStyles: [
      'broad-wondering',
      'simple-presence',
      'specific-detail',
      'temporal-exploration',
    ],
    depthRange: ['surface', 'middle'],
    rhythmRange: ['quick', 'measured'],
    entryPoints: ['emotion', 'sensation', 'image', 'pattern'],
    varietyLevel: 'high', // Keep it fresh and spontaneous
  },

  consultation: {
    emphasis: 'LOW',
    enabled: false, // Default off, only activate for critical moments
    activationThreshold: 0.9, // Very high - only activate when crucial
    typesAllowed: ['safety-check', 'rupture-repair'],
    minConfidence: 0.7,
    priority: 'speed',
  },

  supervisor: {
    emphasis: 'MEDIUM',
    layersActive: ['OPUS_AXIOMS', 'LANGUAGE_RESONANCE'],
    blockThreshold: 0.8, // More permissive - let conversation flow
    regenerateThreshold: 0.6,
    feedbackDetail: 'minimal',
    focusAreas: [
      'user-centeredness',
      'conversational-flow',
      'grounded-presence',
      'natural-language',
    ],
  },

  defaultProcessingPath: 'FAST',
  pathWeights: {
    FAST: 0.60, // 60% of Talk mode
    CORE: 0.35, // 35% of Talk mode
    DEEP: 0.05, // 5% of Talk mode (only complex moments)
  },
};

/**
 * Care Mode (Counsel) Configuration
 *
 * Emphasis: Depth, safety, therapeutic holding
 * Sacred Mirror: HIGH - Deep embodied presence
 * Consultation: HIGH - Relational expertise required
 * Supervisor: HIGH - Protective and trauma-informed
 */
const CARE_MODE_CONFIG: ModeNodeConfiguration = {
  mode: 'counsel',
  displayName: 'Care',
  description: 'Deep therapeutic holding, shadow work, transformational depth',

  sacredMirror: {
    emphasis: 'HIGH',
    preferredStyles: [
      'embodied-inquiry',
      'temporal-exploration',
      'broad-wondering',
      'specific-detail',
    ],
    depthRange: ['deep'],
    rhythmRange: ['spacious', 'measured'],
    entryPoints: ['emotion', 'pattern', 'mystery', 'relationship', 'sensation'],
    varietyLevel: 'medium', // Depth over variety
  },

  consultation: {
    emphasis: 'HIGH',
    enabled: true, // Default on for Care mode
    activationThreshold: 0.3, // Low - activate frequently
    typesAllowed: [
      'relational-enhancement',
      'deep-shadow',
      'spiralogic-alignment',
      'safety-check',
      'rupture-repair',
    ],
    minConfidence: 0.6,
    priority: 'depth',
  },

  supervisor: {
    emphasis: 'HIGH',
    layersActive: [
      'OPUS_AXIOMS',
      'ELEMENTAL_ALIGNMENT',
      'PHASE_AWARENESS',
      'CAUTION_COMPLIANCE',
      'LANGUAGE_RESONANCE',
    ],
    blockThreshold: 0.4, // More protective - safety is paramount
    regenerateThreshold: 0.5,
    feedbackDetail: 'detailed',
    focusAreas: [
      'trauma-informed',
      'developmental-appropriateness',
      'safety-protocols',
      'pacing-sensitivity',
      'shadow-work-safety',
      'emotional-containment',
    ],
  },

  defaultProcessingPath: 'DEEP',
  pathWeights: {
    FAST: 0.05, // 5% of Care mode (simple acknowledgments)
    CORE: 0.25, // 25% of Care mode
    DEEP: 0.70, // 70% of Care mode (majority therapeutic)
  },
};

/**
 * Note Mode (Scribe) Configuration
 *
 * Emphasis: Observation, pattern recognition, documentation
 * Sacred Mirror: MEDIUM - Witnessing presence
 * Consultation: MEDIUM - Pattern coherence support
 * Supervisor: HIGH - Documentation quality assurance
 */
const NOTE_MODE_CONFIG: ModeNodeConfiguration = {
  mode: 'scribe',
  displayName: 'Note',
  description: 'Witnessing, pattern recognition, documentation, meta-awareness',

  sacredMirror: {
    emphasis: 'MEDIUM',
    preferredStyles: [
      'temporal-exploration',
      'broad-wondering',
      'specific-detail',
      'simple-presence',
    ],
    depthRange: ['middle', 'deep'],
    rhythmRange: ['measured', 'spacious'],
    entryPoints: ['pattern', 'mystery', 'relationship', 'emotion'],
    varietyLevel: 'low', // Consistency for observation
  },

  consultation: {
    emphasis: 'MEDIUM',
    enabled: true, // Conditional - for complex pattern work
    activationThreshold: 0.5, // Medium - activate for pattern recognition
    typesAllowed: ['spiralogic-alignment', 'relational-enhancement'],
    minConfidence: 0.65,
    priority: 'pattern',
  },

  supervisor: {
    emphasis: 'HIGH',
    layersActive: [
      'OPUS_AXIOMS',
      'PHASE_AWARENESS',
      'LANGUAGE_RESONANCE',
      'ELEMENTAL_ALIGNMENT',
    ],
    blockThreshold: 0.6, // Medium protection - accuracy matters
    regenerateThreshold: 0.55,
    feedbackDetail: 'meta-level',
    focusAreas: [
      'observation-accuracy',
      'pattern-groundedness',
      'meta-awareness-appropriateness',
      'witnessing-vs-interpreting',
      'evidence-based-claims',
      'temporal-coherence',
    ],
  },

  defaultProcessingPath: 'CORE',
  pathWeights: {
    FAST: 0.10, // 10% of Note mode (simple observations)
    CORE: 0.50, // 50% of Note mode
    DEEP: 0.40, // 40% of Note mode (complex patterns)
  },
};

/**
 * Get mode-specific node configuration
 */
export function getModeNodeConfiguration(mode: Mode): ModeNodeConfiguration {
  const configs: Record<Mode, ModeNodeConfiguration> = {
    dialogue: TALK_MODE_CONFIG,
    counsel: CARE_MODE_CONFIG,
    scribe: NOTE_MODE_CONFIG,
  };

  return configs[mode];
}

/**
 * Determine if consultation should activate based on mode config
 */
export function shouldActivateConsultation(
  mode: Mode,
  processingPath: 'FAST' | 'CORE' | 'DEEP',
  contextualSignals: {
    ruptureDetected?: boolean;
    complexityScore?: number; // 0-1
    shadowWorkPresent?: boolean;
    userVulnerability?: number; // 0-1
  }
): boolean {
  const config = getModeNodeConfiguration(mode);

  // If consultation disabled for this mode, skip
  if (!config.consultation.enabled) {
    // Exception: Always activate for detected ruptures
    if (contextualSignals.ruptureDetected) {
      return true;
    }
    return false;
  }

  // FAST path: Only activate if threshold is very low or rupture detected
  if (processingPath === 'FAST') {
    return contextualSignals.ruptureDetected || false;
  }

  // Calculate activation score based on contextual signals
  let activationScore = 0;

  if (contextualSignals.ruptureDetected) activationScore += 0.4;
  if (contextualSignals.complexityScore) activationScore += contextualSignals.complexityScore * 0.3;
  if (contextualSignals.shadowWorkPresent) activationScore += 0.2;
  if (contextualSignals.userVulnerability) activationScore += contextualSignals.userVulnerability * 0.3;

  // Check against mode's activation threshold
  return activationScore >= (1 - config.consultation.activationThreshold);
}

/**
 * Get supervisor validation strictness based on mode
 */
export function getSupervisorStrictness(mode: Mode): {
  blockThreshold: number;
  regenerateThreshold: number;
  layersActive: SupervisorLayer[];
} {
  const config = getModeNodeConfiguration(mode);

  return {
    blockThreshold: config.supervisor.blockThreshold,
    regenerateThreshold: config.supervisor.regenerateThreshold,
    layersActive: config.supervisor.layersActive,
  };
}

/**
 * Select appropriate Sacred Mirror style based on mode and context
 */
export function selectSacredMirrorStyle(
  mode: Mode,
  userInput: string,
  conversationContext?: {
    hasEmotion?: boolean;
    hasBodyLanguage?: boolean;
    hasTemporalReference?: boolean;
    hasPattern?: boolean;
  }
): SacredMirrorStyle {
  const config = getModeNodeConfiguration(mode);
  const preferredStyles = config.sacredMirror.preferredStyles;

  // Mode-specific style selection logic
  switch (mode) {
    case 'dialogue': // Talk mode
      // Prioritize conversational styles
      if (conversationContext?.hasEmotion && preferredStyles.includes('broad-wondering')) {
        return 'broad-wondering';
      }
      if (userInput.length < 50 && preferredStyles.includes('simple-presence')) {
        return 'simple-presence';
      }
      return preferredStyles[0];

    case 'counsel': // Care mode
      // Prioritize embodied and deep styles
      if (conversationContext?.hasBodyLanguage && preferredStyles.includes('embodied-inquiry')) {
        return 'embodied-inquiry';
      }
      if (conversationContext?.hasTemporalReference && preferredStyles.includes('temporal-exploration')) {
        return 'temporal-exploration';
      }
      return 'embodied-inquiry'; // Default for Care

    case 'scribe': // Note mode
      // Prioritize observational styles
      if (conversationContext?.hasPattern && preferredStyles.includes('temporal-exploration')) {
        return 'temporal-exploration';
      }
      if (conversationContext?.hasTemporalReference && preferredStyles.includes('temporal-exploration')) {
        return 'temporal-exploration';
      }
      return 'temporal-exploration'; // Default for Note

    default:
      return preferredStyles[0];
  }
}

/**
 * Get processing path recommendation based on mode and input complexity
 */
export function recommendProcessingPath(
  mode: Mode,
  inputComplexity: number // 0-1
): 'FAST' | 'CORE' | 'DEEP' {
  const config = getModeNodeConfiguration(mode);

  // Use weighted selection based on mode preferences
  if (inputComplexity < 0.3) {
    // Simple input - prefer FAST
    return mode === 'dialogue' ? 'FAST' : 'CORE';
  } else if (inputComplexity < 0.7) {
    // Moderate input - prefer CORE
    return mode === 'counsel' ? 'DEEP' : 'CORE';
  } else {
    // Complex input - prefer DEEP
    return mode === 'dialogue' ? 'CORE' : 'DEEP';
  }
}

/**
 * Log mode configuration for debugging
 */
export function logModeConfiguration(mode: Mode): void {
  const config = getModeNodeConfiguration(mode);

  console.log(`\n🎯 MODE CONFIGURATION: ${config.displayName.toUpperCase()}`);
  console.log('═'.repeat(60));
  console.log(`Description: ${config.description}`);
  console.log(`Default Path: ${config.defaultProcessingPath}`);
  console.log('\nNode Emphasis:');
  console.log(`  🌊 Sacred Mirror: ${config.sacredMirror.emphasis}`);
  console.log(`  🧠 Consultation:  ${config.consultation.emphasis} (enabled: ${config.consultation.enabled})`);
  console.log(`  🛡️ Supervisor:    ${config.supervisor.emphasis}`);
  console.log('\nPath Weights:');
  console.log(`  FAST: ${(config.pathWeights.FAST * 100).toFixed(0)}%`);
  console.log(`  CORE: ${(config.pathWeights.CORE * 100).toFixed(0)}%`);
  console.log(`  DEEP: ${(config.pathWeights.DEEP * 100).toFixed(0)}%`);
  console.log('═'.repeat(60) + '\n');
}

// Export configurations for testing/inspection
export const MODE_CONFIGS = {
  dialogue: TALK_MODE_CONFIG,
  counsel: CARE_MODE_CONFIG,
  scribe: NOTE_MODE_CONFIG,
};

export default {
  getModeNodeConfiguration,
  shouldActivateConsultation,
  getSupervisorStrictness,
  selectSacredMirrorStyle,
  recommendProcessingPath,
  logModeConfiguration,
  MODE_CONFIGS,
};
