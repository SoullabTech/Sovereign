/**
 * Confidence Decay Calculator
 *
 * Calculates effective confidence for memories based on:
 * - Time since last confirmation
 * - Memory type-specific half-lives
 * - User confirmation status
 *
 * Philosophy: Memories don't disappear, but unconfirmed ones fade in retrieval priority.
 * A preference from 2 years ago that was never confirmed should score lower than
 * a recent observation, even if originally high-significance.
 */

export type MemoryTypeForDecay =
  | 'preference'
  | 'boundary'
  | 'event'
  | 'dream'
  | 'pattern'
  | 'effective_practice'
  | 'ineffective_practice'
  | 'breakthrough_emergence'
  | 'correction'
  | 'ain_deliberation'
  | 'spiral_transition';

/**
 * Half-lives for different memory types (in days)
 * After this many days without confirmation, confidence drops to 50% of original
 */
export const HALF_LIVES: Record<MemoryTypeForDecay, number> = {
  preference: 365,           // Preferences stable but should be re-confirmed yearly
  boundary: 365,             // Boundaries very stable
  event: 90,                 // Events fade faster - "that happened" less critical over time
  dream: 60,                 // Dream memories fade relatively quickly
  pattern: 180,              // Patterns should be periodically validated
  effective_practice: 120,   // What worked before may not work now
  ineffective_practice: 60,  // What didn't work - less need to remember long-term
  breakthrough_emergence: 180, // Breakthroughs are significant but need integration
  correction: 90,            // Corrections relevant for a while
  ain_deliberation: 120,     // AIN results moderate persistence
  spiral_transition: 180,    // Spiral transitions meaningful over medium term
};

/**
 * Minimum confidence floor - memories never drop below this
 * Ensures even old unconfirmed memories can still be retrieved if relevant
 */
export const CONFIDENCE_FLOOR = 0.3;

/**
 * Calculate the effective confidence with decay applied
 *
 * @param baseConfidence Original confidence/significance (0-1)
 * @param memoryType Type of memory for half-life lookup
 * @param lastConfirmedAt When the memory was last confirmed (or null)
 * @param formedAt When the memory was created
 * @param confirmedByUser Whether user has ever confirmed this
 * @returns Effective confidence with decay applied (0.3-1.0)
 */
export function calculateDecayedConfidence(
  baseConfidence: number,
  memoryType: string,
  lastConfirmedAt: Date | null,
  formedAt: Date,
  confirmedByUser: boolean = false
): number {
  // Type-safe lookup with fallback
  const halfLifeDays = HALF_LIVES[memoryType as MemoryTypeForDecay] ?? 90;

  // Reference point: last confirmation if exists, otherwise formation date
  const referenceDate = lastConfirmedAt ?? formedAt;

  // Days since reference
  const msElapsed = Date.now() - referenceDate.getTime();
  const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);

  // Bonus for user-confirmed memories: slower decay (1.5x half-life)
  const effectiveHalfLife = confirmedByUser ? halfLifeDays * 1.5 : halfLifeDays;

  // Exponential decay: confidence * 2^(-days/half_life)
  const decayFactor = Math.pow(2, -daysElapsed / effectiveHalfLife);

  // Apply decay with floor
  const decayedConfidence = baseConfidence * decayFactor;

  return Math.max(CONFIDENCE_FLOOR, decayedConfidence);
}

/**
 * Calculate retrieval score with all components
 *
 * @param params Score components
 * @returns Combined retrieval score (0-1)
 */
export function calculateRetrievalScore(params: {
  semanticSimilarity: number;      // 0-1, from vector search
  recencyDays: number;             // Days since formed
  memoryType: string;
  baseConfidence: number;
  lastConfirmedAt?: Date | null;
  formedAt: Date;
  confirmedByUser?: boolean;
  typeMatchBonus?: number;         // 0-0.15, if query matches memory type
}): {
  total: number;
  components: {
    semantic: number;
    recency: number;
    confidence: number;
    typeMatch: number;
  };
} {
  // Weights for score components
  const WEIGHTS = {
    semantic: 0.40,
    recency: 0.25,
    confidence: 0.25,
    typeMatch: 0.10,
  };

  // 1. Semantic similarity (already 0-1)
  const semanticScore = params.semanticSimilarity;

  // 2. Recency score with exponential decay (half-life 30 days)
  const recencyScore = Math.pow(2, -params.recencyDays / 30);

  // 3. Confidence with decay
  const effectiveConfidence = calculateDecayedConfidence(
    params.baseConfidence,
    params.memoryType,
    params.lastConfirmedAt ?? null,
    params.formedAt,
    params.confirmedByUser ?? false
  );

  // 4. Type match bonus (if query intent matches memory type)
  const typeMatchScore = params.typeMatchBonus ?? 0;

  // Combine scores
  const total =
    semanticScore * WEIGHTS.semantic +
    recencyScore * WEIGHTS.recency +
    effectiveConfidence * WEIGHTS.confidence +
    typeMatchScore * WEIGHTS.typeMatch;

  return {
    total: Math.min(1, Math.max(0, total)),
    components: {
      semantic: semanticScore,
      recency: recencyScore,
      confidence: effectiveConfidence,
      typeMatch: typeMatchScore,
    },
  };
}

/**
 * Determine type match bonus based on query intent
 */
export function getTypeMatchBonus(
  queryIntent: string,
  memoryType: string
): number {
  const INTENT_TYPE_MATCHES: Record<string, string[]> = {
    dream: ['dream', 'pattern'],
    relationship: ['relationship', 'event', 'pattern'],
    guidance: ['effective_practice', 'breakthrough_emergence', 'pattern'],
    shadow: ['ineffective_practice', 'correction', 'pattern'],
    preference: ['preference', 'boundary'],
    planning: ['effective_practice', 'event', 'breakthrough_emergence'],
    general: [],
  };

  const matchingTypes = INTENT_TYPE_MATCHES[queryIntent] ?? [];

  if (matchingTypes.includes(memoryType)) {
    return 0.15; // Full bonus
  }

  // Partial bonus for related types
  const relatedTypes: Record<string, string[]> = {
    dream: ['event', 'breakthrough_emergence'],
    relationship: ['correction', 'breakthrough_emergence'],
    guidance: ['correction', 'ain_deliberation'],
  };

  if ((relatedTypes[queryIntent] ?? []).includes(memoryType)) {
    return 0.08; // Partial bonus
  }

  return 0;
}

/**
 * Check if a memory should prompt for confirmation
 * Returns true if the memory is stale enough to ask "is this still true?"
 */
export function shouldPromptForConfirmation(
  memoryType: string,
  lastConfirmedAt: Date | null,
  formedAt: Date,
  confirmedByUser: boolean
): boolean {
  // Only prompt for user-confirmed memories (don't pester about auto-detected ones)
  if (!confirmedByUser) {
    return false;
  }

  const referenceDate = lastConfirmedAt ?? formedAt;
  const daysElapsed = (Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);

  // Threshold is half the half-life (prompt before confidence drops too much)
  const halfLife = HALF_LIVES[memoryType as MemoryTypeForDecay] ?? 90;
  const threshold = halfLife * 0.5;

  return daysElapsed > threshold;
}

/**
 * Format days elapsed for display
 */
export function formatDaysAgo(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}
