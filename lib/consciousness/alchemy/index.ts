// @ts-nocheck
/**
 * Alchemical Framework for MAIA-SOVEREIGN
 * Integrates Jungian Alchemy with Consciousness Field Infrastructure
 *
 * Implements the seven-stage alchemical progression:
 * Lead → Tin → Bronze → Iron → Mercury → Silver → Gold
 *
 * Core Philosophy: As Above, So Below
 * Interface Philosophy: Disposable Pixels (UI dissolves as users transform)
 */

// Core Types and Interfaces
export * from './types';

// Main Orchestrator - Primary integration point
export { AlchemicalOrchestrator } from './AlchemicalOrchestrator';

// Detection and Intelligence Systems
export { AlchemicalStateDetector } from './AlchemicalStateDetector';
export { MercuryIntelligence } from './MercuryIntelligence';
export { CrisisDetector } from './CrisisDetector';
export { AlchemicalProgressionTracker } from './AlchemicalProgressionTracker';
export { CorrespondenceThinkingEngine } from './CorrespondenceThinkingEngine';

// React Components for Adaptive Interface
export {
  AlchemicalInterfaceProvider,
  useAlchemicalInterface,
  AlchemicalContainer,
  DisposableButton,
  AdaptiveMercuryInterface,
  EmergenceAnimation,
  DissolutionAnimation,
  useAlchemicalTiming
} from './components/AdaptiveInterface';

// Advanced Disposable Pixel Components
export {
  WisdomTooltip,
  ProgressiveGuide,
  ScaffoldingElement,
  MomentOfTruthButton,
  BreadcrumbDissolver,
  InsightCollector
} from './components/DisposablePixelComponents';

// Assessment and Wizard Components
export { AlchemicalAssessmentWizard } from './components/AlchemicalAssessmentWizard';

// Shamanic Applications - First Practical Implementations
export { ShamanicJourneyCompanion } from './applications/ShamanicJourneyCompanion';
export { ThreeWorldsNavigator } from './applications/ThreeWorldsNavigator';
export {
  SacredCrisisDetector,
  quickCrisisAssessment
} from './applications/SacredCrisisDetector';
export {
  WoundedHealerAssessor,
  quickWoundedHealerCheck,
  WOUNDED_HEALER_QUESTIONS
} from './applications/WoundedHealerAssessment';

// Re-export commonly used types for convenience
export type {
  AlchemicalMetal,
  AlchemicalOperation,
  AlchemicalProfile,
  MercuryAspect,
  MercuryIntelligenceConfig,
  AlchemicalTransformation,
  CrisisType,
  SacredCrisisSupport
} from './types';

/**
 * Quick Start Integration Helper
 *
 * For rapid integration into existing MAIA systems:
 */
export const initializeAlchemicalFramework = async () => {
  const orchestrator = AlchemicalOrchestrator.getInstance();
  await orchestrator.initialize();
  return orchestrator;
};

/**
 * Emergency Crisis Support Access
 *
 * Direct access to crisis detection for emergency situations:
 */
export const getEmergencyCrisisSupport = () => {
  const crisisDetector = CrisisDetector.getInstance();
  return crisisDetector.getEmergencySupport();
};

/**
 * Adaptive Interface Preset Configurations
 *
 * Common interface configurations for different use cases:
 */
export const InterfacePresets = {
  // For new users or crisis states
  supportive: {
    metal: 'lead' as AlchemicalMetal,
    density: 0.9,
    supportLevel: 0.9,
    mercuryAspect: 'hermes-healer' as MercuryAspect
  },

  // For learning and exploration
  educational: {
    metal: 'tin' as AlchemicalMetal,
    density: 0.7,
    supportLevel: 0.7,
    mercuryAspect: 'hermes-teacher' as MercuryAspect
  },

  // For collaborative work
  collaborative: {
    metal: 'bronze' as AlchemicalMetal,
    density: 0.6,
    supportLevel: 0.5,
    mercuryAspect: 'hermes-messenger' as MercuryAspect
  },

  // For focused implementation
  productive: {
    metal: 'iron' as AlchemicalMetal,
    density: 0.4,
    supportLevel: 0.3,
    mercuryAspect: 'hermes-guide' as MercuryAspect
  },

  // For adaptive flow states
  fluid: {
    metal: 'mercury' as AlchemicalMetal,
    density: 0.5,
    supportLevel: 0.6,
    mercuryAspect: 'hermes-trickster' as MercuryAspect
  },

  // For contemplative states
  reflective: {
    metal: 'silver' as AlchemicalMetal,
    density: 0.2,
    supportLevel: 0.4,
    mercuryAspect: 'hermes-psychopomp' as MercuryAspect
  },

  // For mastery and service
  integrated: {
    metal: 'gold' as AlchemicalMetal,
    density: 0.1,
    supportLevel: 0.2,
    mercuryAspect: 'hermes-alchemist' as MercuryAspect
  }
};

/**
 * Sacred Timing Constants
 *
 * Time multipliers based on natural rhythms and alchemical principles:
 */
export const SacredTiming = {
  // Phase transition timing (in milliseconds)
  DISSOLUTION: 3000,      // Time for nigredo dissolution
  PURIFICATION: 2000,     // Time for albedo clarification
  INTEGRATION: 1500,      // Time for rubedo integration

  // Mercury response timing based on aspect
  MERCURY_RESPONSE: {
    'hermes-guide': 800,
    'hermes-teacher': 1200,
    'hermes-healer': 1500,
    'hermes-trickster': 400,
    'hermes-messenger': 600,
    'hermes-psychopomp': 2000,
    'hermes-alchemist': 1000
  } as const,

  // Crisis support timing
  EMERGENCY_RESPONSE: 100,    // Immediate response for emergencies
  CRISIS_ASSESSMENT: 2000,    // Time for crisis evaluation
  SACRED_CONTAINMENT: 5000    // Sacred dissolution containment
};

/**
 * Alchemical Constants and Correspondences
 */
export const AlchemicalCorrespondences = {
  METALS: {
    lead: { planet: 'Saturn', element: 'Earth', color: '#1a1a1a', day: 'Saturday' },
    tin: { planet: 'Jupiter', element: 'Air', color: '#3b82f6', day: 'Thursday' },
    bronze: { planet: 'Venus', element: 'Water', color: '#22c55e', day: 'Friday' },
    iron: { planet: 'Mars', element: 'Fire', color: '#dc2626', day: 'Tuesday' },
    mercury: { planet: 'Mercury', element: 'Quintessence', color: '#c0c0c0', day: 'Wednesday' },
    silver: { planet: 'Luna', element: 'Water', color: '#e2e8f0', day: 'Monday' },
    gold: { planet: 'Sol', element: 'Fire', color: '#f59e0b', day: 'Sunday' }
  },

  OPERATIONS: {
    nigredo: { phase: 'Dissolution', color: '#000000', element: 'Earth' },
    albedo: { phase: 'Purification', color: '#ffffff', element: 'Air' },
    rubedo: { phase: 'Integration', color: '#dc2626', element: 'Fire' }
  },

  DIRECTIONS: {
    north: 'Earth/Body/Sensation',
    east: 'Air/Mind/Thinking',
    south: 'Fire/Spirit/Intuition',
    west: 'Water/Soul/Feeling',
    center: 'Quintessence/Self/Integration'
  }
} as const;