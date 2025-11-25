/**
 * Bardic Memory System - Unified Exports
 *
 * Central export point for all bardic memory services, types, and utilities
 *
 * @module lib/bardic
 */

// ============================================================================
// SERVICES
// ============================================================================

export {
  // Episode Service
  createEpisode,
  getEpisode,
  getUserEpisodes,
  updateEpisode,
  deleteEpisode,
  getEpisodesByPlace,
  getEpisodesByElement,
  getSacredEpisodes,
  getRecentEpisodes,
  getRecalibrationEpisodes,
  getElementalDistribution,
  getEpisodeCount,
  createEpisodeVector,
  getEpisodeVector,
  updateEpisodeVector,
  deleteEpisodeVector,
  findSimilarEpisodes,
  type CreateEpisodeParams,
  type UpdateEpisodeParams,
  type CreateEpisodeVectorParams,
  type FindSimilarEpisodesOptions,
} from '@/lib/services/episode-service';

export {
  // Retrieval Protocol
  recognizeResonance,
  prepareReentry,
  recallEpisode,
  expressUncertainty,
  updateEpisodeMeaning,
  type RecognitionInput,
  type RecognitionSignal,
  type ReentryExperience,
  type EpisodeDetails,
  type RecallDepth,
} from '@/lib/services/retrieval-protocol';

export {
  // Telos Service (Fire Cognition)
  createTelos,
  getTelos,
  getActiveTeloi,
  getAllTeloi,
  getTeloiByOriginEpisode,
  updateTelos,
  deactivateTelos,
  reactivateTelos,
  adjustTelosStrength,
  deleteTelos,
  logTelosAlignment,
  getTelosAlignmentHistory,
  getEpisodeAlignments,
  calculateTelosProgress,
  detectCrystallization,
  getCrystallizingTeloi,
  queryWhatWantsToEmerge,
  queryWhatsPullingForward,
  queryWhatsBecomingClearer,
  type CreateTelosParams,
  type UpdateTelosParams,
  type LogTelosAlignmentParams,
  type CrystallizationMoment,
} from '@/lib/services/telos-service';

export {
  // Microact Service (Earth Layer)
  createMicroact,
  getMicroact,
  getUserMicroacts,
  getMicroactByPhrase,
  getMicroactsByVirtue,
  getTopMicroacts,
  updateMicroact,
  deleteMicroact,
  logMicroactOccurrence,
  logMicroactByPhrase,
  getOrCreateMicroact,
  getMicroactLogs,
  getEpisodeMicroacts,
  getRecentMicroactActivity,
  getVirtueLedger,
  getMicroactStreak,
  getMicroactFrequency,
  getAcceleratingMicroacts,
  type CreateMicroactParams,
  type UpdateMicroactParams,
  type LogMicroactParams,
  type VirtueLedgerEntry,
} from '@/lib/services/microact-service';

export {
  // Quota Service
  createUserQuota,
  getUserQuota,
  updateUserTier,
  checkQuota,
  logUsage,
  resetDailyQuota,
  blockUser,
  unblockUser,
  getUserUsageLogs,
  getSystemSummary,
  type UserQuota,
  type UserTier,
  type QuotaCheckResult,
  type LogUsageParams,
  type UsageLogEntry,
  type SystemUsageSummary,
} from '@/lib/services/quota-service';

// ============================================================================
// TYPES
// ============================================================================

export type {
  Episode,
  EpisodeVector,
  EpisodeLink,
  Cue,
  EpisodeCue,
  Telos,
  TelosAlignmentLog,
  Microact,
  MicroactLog,
  ElementalState,
  ElementName,
} from '@/lib/types';

// ============================================================================
// MIDDLEWARE
// ============================================================================

export {
  getUserIdFromAuth,
  checkUserQuota,
  withAuthAndQuota,
  safeLogUsage,
  estimateTokens,
  estimateTokensFromJson,
  verifyOwnership,
  type QuotaCheckResult as MiddlewareQuotaCheckResult,
  type AuthAndQuotaResult,
  type OwnershipCheckResult,
} from '@/lib/middleware/quota-middleware';

// ============================================================================
// COMPONENTS
// ============================================================================

export { BardicDrawer } from '@/components/Bardic/BardicDrawer';
export { FireQueryInterface } from '@/components/Bardic/FireQueryInterface';
export { BardicMenu, BardicMenuButton, InvocationHint } from '@/components/Bardic/BardicMenu';
export { BlessingOffer } from '@/components/Bardic/BlessingOffer';

// ============================================================================
// INVOCATIONS & BLESSINGS
// ============================================================================

export {
  detectInvocation,
  processBardicInvocation,
  getInvocationResponse,
  getUITrigger,
  INVOCATION_RESPONSES,
  type BardicInvocation,
  type BardicResponse,
  type UITrigger,
} from './invocations';

export {
  detectBlessingMoment,
  detectConversationEnd,
  detectBreakthrough,
  detectThreshold,
  detectPatternCircling,
  checkForMilestone,
  formatBlessing,
  type BlessingMoment,
  type BardicOffering,
  type BlessingContext,
  type MilestoneCheck,
  type BlessingPresentation,
} from './blessing-moments';

export {
  checkForBlessing,
  recordBlessingDismissal,
  clearBlessingDismissal,
  logBlessingInteraction,
  getUserBlessingAcceptanceRate,
  getMostAcceptedBlessingTypes,
  autoCreateEpisode,
  type ChatBlessingCheck,
  type BlessingDetectionResult,
  type BlessingInteraction,
  type AutoEpisodeParams,
} from './blessing-service';

// ============================================================================
// CONSTANTS
// ============================================================================

export const BARDIC_MEMORY_VERSION = '1.0.0';

export const TIER_LIMITS = {
  beta: {
    dailyMessages: 50,
    dailyTokens: 100000,
    dailyCostCents: 500,
    requestsPerMinute: 10,
    requestsPerHour: 200,
  },
  standard: {
    dailyMessages: 200,
    dailyTokens: 500000,
    dailyCostCents: 2000,
    requestsPerMinute: 20,
    requestsPerHour: 1000,
  },
  premium: {
    dailyMessages: 1000,
    dailyTokens: 2000000,
    dailyCostCents: 10000,
    requestsPerMinute: 60,
    requestsPerHour: 3000,
  },
  therapist: {
    dailyMessages: 500,
    dailyTokens: 1000000,
    dailyCostCents: 5000,
    requestsPerMinute: 30,
    requestsPerHour: 1500,
  },
  enterprise: {
    dailyMessages: 5000,
    dailyTokens: 10000000,
    dailyCostCents: 50000,
    requestsPerMinute: 120,
    requestsPerHour: 10000,
  },
  unlimited: {
    dailyMessages: 999999,
    dailyTokens: 999999999,
    dailyCostCents: 999999999,
    requestsPerMinute: 1000,
    requestsPerHour: 999999,
  },
} as const;

export const SONNET_4_PRICING = {
  inputTokensPerMillion: 3.0,
  outputTokensPerMillion: 15.0,
} as const;

export const ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'] as const;

export const RELATION_TYPES = [
  'echoes',
  'precedes',
  'follows',
  'mirrors',
  'contrasts',
  'amplifies',
] as const;

export const CUE_TYPES = [
  'visual',
  'auditory',
  'olfactory',
  'gustatory',
  'tactile',
  'somatic',
  'emotional',
] as const;

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Calculate total cost in cents from token usage
 */
export function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * SONNET_4_PRICING.inputTokensPerMillion;
  const outputCost = (outputTokens / 1_000_000) * SONNET_4_PRICING.outputTokensPerMillion;
  return Math.ceil((inputCost + outputCost) * 100); // Convert to cents
}

/**
 * Check if a telos is crystallizing based on strength and velocity
 */
export function isCrystallizing(
  strength: number,
  recentAlignment: number,
  velocity: number
): boolean {
  return recentAlignment > 0.3 && velocity > 0.05 && strength > 0.6;
}

/**
 * Calculate affect distance (Euclidean in valence/arousal space)
 */
export function calculateAffectDistance(
  a: { valence: number; arousal: number },
  b: { valence: number; arousal: number }
): number {
  const valenceDiff = Math.abs(a.valence - b.valence);
  const arousalDiff = Math.abs(a.arousal - b.arousal);
  return Math.sqrt(valenceDiff ** 2 + arousalDiff ** 2);
}

/**
 * Normalize affect distance to 0-1 similarity score
 */
export function affectSimilarity(
  a: { valence: number; arousal: number },
  b: { valence: number; arousal: number }
): number {
  const distance = calculateAffectDistance(a, b);
  const maxDistance = Math.sqrt(5); // sqrt(2^2 + 1^2)
  return 1 - Math.min(distance / maxDistance, 1);
}

/**
 * Calculate resonance strength from similarity, affect, and elemental match
 */
export function calculateResonance(
  similarity: number,
  affectMatch: number,
  elementalMatch: number
): number {
  return similarity * 0.5 + affectMatch * 0.3 + elementalMatch * 0.2;
}

/**
 * Format relation type for display
 */
export function formatRelationType(type: string): string {
  const typeMap: Record<string, string> = {
    echoes: 'Echoes of...',
    precedes: 'Led to...',
    follows: 'Followed from...',
    mirrors: 'Mirrors...',
    contrasts: 'Contrasts with...',
    amplifies: 'Amplifies...',
  };
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Get elemental color for UI theming
 */
export function getElementalColor(element: ElementName): string {
  const colors: Record<ElementName, string> = {
    fire: '#f97316', // orange-500
    water: '#0ea5e9', // sky-500
    earth: '#22c55e', // green-500
    air: '#8b5cf6', // violet-500
    aether: '#ec4899', // pink-500
  };
  return colors[element];
}

/**
 * Get elemental gradient for UI backgrounds
 */
export function getElementalGradient(element: ElementName): string {
  const gradients: Record<ElementName, string> = {
    fire: 'from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20',
    water: 'from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20',
    earth: 'from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20',
    air: 'from-sky-100 to-indigo-100 dark:from-sky-900/20 dark:to-indigo-900/20',
    aether: 'from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20',
  };
  return gradients[element];
}
