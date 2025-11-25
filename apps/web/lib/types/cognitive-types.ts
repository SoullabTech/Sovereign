/**
 * Cognitive Architecture Type Exports
 *
 * Central export point for all cognitive architecture types
 * used by LIDA, SOAR, ACT-R, MicroPsi, and Elemental Agents
 */

// Re-export consciousness profile from soullab-metadata
export type { ConsciousnessProfile } from './soullab-metadata';

// Re-export from LIDA workspace
export type {
  AttentionState,
  PerceptualCue,
  ElementalBalance,
  ArchetypalActivation
} from '../cognitive-engines/lida-workspace';

// Re-export from SOAR planner
export type {
  WisdomGoal,
  WisdomOperator,
  WisdomPlan,
  PredictedOutcome,
  RitualGuidance,
  IntegrationPath
} from '../cognitive-engines/soar-planner';

// Re-export from ACT-R memory
export type {
  DeclarativeMemory,
  ProceduralMemory,
  MemoryChunk,
  MemoryIntegration,
  ExperiencePattern,
  LearningUpdate,
  WisdomEvolution,
  MemoryStrengthening
} from '../cognitive-engines/actr-memory';

// Re-export from MicroPsi core
export type {
  EmotionalState,
  EmotionalResonance,
  MotivationalDrive,
  SpiritualEmotionalContext,
  HealingNeed
} from '../cognitive-engines/micropsi-core';

// Element type
export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';
