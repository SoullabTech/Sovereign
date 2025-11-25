/**
 * MAIA Type Definitions - Central Export
 *
 * Import all types from this single entry point:
 * ```typescript
 * import { Episode, Telos, UserQuota } from '@/lib/types';
 * ```
 *
 * @module lib/types
 */

// ============================================================================
// BARDIC MEMORY TYPES
// ============================================================================

export type {
  // Core types
  ElementalState,
  ElementName,
  FacetName,
  SenseCues,
  CueType,
  RecalibrationType,

  // Episode & related
  Episode,
  EpisodeVector,
  EpisodeLink,
  RelationType,

  // Cues & portals
  Cue,
  EpisodeCue,

  // Teloi (Fire cognition)
  Telos,
  TelosAlignmentLog,

  // Microacts (Earth layer)
  Microact,
  MicroactLog,

  // Field topology
  FieldEdge,
  EdgeType,

  // Retrieval protocol
  RecognitionInput,
  RecognitionSignal,
  ReentryExperience,
  RecallDepth,
  EpisodeDetails,

  // UX microflows
  DrawerParams,
  DrawerExperience,
  MadeleineParams,
  MadeleineExperience,
  SacredMomentParams,
  VirtueLedgerEntry,

  // Utility
  QuotaCheckResult as BardicQuotaCheck,
  ConsentGateResult,
} from './bardic-memory';

// ============================================================================
// USAGE TRACKING TYPES
// ============================================================================

export type {
  // Request types
  RequestType,
  ErrorType,
  UsageLogEntry,

  // Quota types
  UserTier,
  UserQuota,
  QuotaCheckResult,

  // System summary
  SystemUsageSummary,
  UsageSummary,

  // Configuration
  TierConfig,
} from './usage-tracking';

export {
  // Constants
  TIER_CONFIGS,
  SONNET_4_PRICING,

  // Utility functions
  calculateCost,
  formatCostUSD,
  formatSuccessRate,
} from './usage-tracking';

// ============================================================================
// RE-EXPORT FOR CONVENIENCE
// ============================================================================

/**
 * Most commonly used types for quick import
 */
export type {
  Episode,
  Telos,
  Microact,
  UserQuota,
  UsageLogEntry,
} from './bardic-memory';
