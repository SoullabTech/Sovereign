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
// CONSCIOUSNESS & SPIRITUAL TYPES (Phase 4.2B Step 5)
// ============================================================================

/**
 * Cognitive layer - Consciousness state modeling
 */
export * from './cognitive';

/**
 * Spiritual layer - Multi-tradition faith context integration
 */
export * from './spiritual';

/**
 * Elemental layer - Elemental framework and alchemical processing
 */
export * from './elemental';

// ============================================================================
// GENERATED INTERFACES (Phase 4.2C Module A)
// ============================================================================

/**
 * Auto-generated interface stubs from TS2339 pattern analysis
 * Includes: SystemContext, WisdomOracleContext, AstrologyContext, ReflectionContext
 */
export * from './generated';

// ============================================================================
// CONSCIOUSNESS BIOMARKERS (Phase 4.2D)
// ============================================================================

/**
 * Consciousness biomarker types - 13 therapeutic frameworks
 * Includes: Alchemical, Somatic, Polyvagal, IFS, Jungian, ACT, Spiralogic, etc.
 */
export * from './consciousness';
