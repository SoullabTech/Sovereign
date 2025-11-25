/**
 * Bardic Blessing Service - Orchestration Layer
 *
 * Integrates blessing detection with chat flow
 * Manages blessing state and user interactions
 *
 * @module lib/bardic/blessing-service
 */

import {
  detectBlessingMoment,
  checkForMilestone,
  type BlessingMoment,
  type BlessingContext,
} from './blessing-moments';
import { getRecentEpisodes } from '@/lib/services/episode-service';
import { getCrystallizingTeloi } from '@/lib/services/telos-service';
import { getUserMicroacts, getMicroactStreak } from '@/lib/services/microact-service';

// ============================================================================
// BLESSING DETECTION IN CHAT FLOW
// ============================================================================

export interface ChatBlessingCheck {
  userId: string;
  currentMessage: string;
  sessionId?: string;
}

export interface BlessingDetectionResult {
  hasBlessing: boolean;
  blessing?: BlessingMoment;
  shouldShow: boolean;
  dismissedRecently?: boolean;
}

/**
 * Check if current message triggers a blessing moment
 * Call this after MAIA generates a response but before returning to user
 */
export async function checkForBlessing(
  params: ChatBlessingCheck
): Promise<BlessingDetectionResult> {
  const { userId, currentMessage } = params;

  try {
    // Gather context for blessing detection
    const context = await gatherBlessingContext(userId, currentMessage);

    // Detect blessing moment
    const blessing = await detectBlessingMoment(context);

    if (!blessing) {
      return {
        hasBlessing: false,
        shouldShow: false,
      };
    }

    // Check if user recently dismissed this type of blessing
    const dismissedRecently = await wasBlessingRecentlyDismissed(
      userId,
      blessing.suggestedOffering
    );

    return {
      hasBlessing: true,
      blessing,
      shouldShow: !dismissedRecently,
      dismissedRecently,
    };
  } catch (error) {
    console.error('Blessing detection error (non-fatal):', error);
    return {
      hasBlessing: false,
      shouldShow: false,
    };
  }
}

// ============================================================================
// CONTEXT GATHERING
// ============================================================================

async function gatherBlessingContext(
  userId: string,
  currentMessage: string
): Promise<BlessingContext> {
  // Gather recent episodes (for pattern detection)
  const recentEpisodes = await getRecentEpisodes(userId, 10);

  // Gather crystallizing teloi
  const crystallizingTeloi = await getCrystallizingTeloi(userId, 5);

  // Gather microact data (for milestone detection)
  const microacts = await getUserMicroacts(userId, { limit: 20 });

  // Calculate streak for most active microact
  let streak: number | undefined;
  if (microacts.length > 0) {
    const topMicroact = microacts.sort(
      (a, b) => b.totalCount - a.totalCount
    )[0];
    streak = await getMicroactStreak(topMicroact.id!);
  }

  return {
    currentMessage,
    recentEpisodes: recentEpisodes.map((ep) => ({
      sceneStanza: ep.sceneStanza,
    })),
    microacts: microacts.map((m) => ({
      totalCount: m.totalCount,
      actionPhrase: m.actionPhrase,
    })),
    streak,
    crystallizingTeloi: crystallizingTeloi.map((t) => ({
      phrase: t.phrase,
      strength: t.strength,
    })),
  };
}

// ============================================================================
// BLESSING DISMISSAL TRACKING
// ============================================================================

// In-memory cache of recent dismissals (could be moved to Redis/DB for production)
const dismissalCache = new Map<string, Map<string, number>>();

const DISMISSAL_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if user dismissed this blessing type recently
 */
async function wasBlessingRecentlyDismissed(
  userId: string,
  offeringType: string
): Promise<boolean> {
  if (!dismissalCache.has(userId)) {
    return false;
  }

  const userDismissals = dismissalCache.get(userId)!;
  const lastDismissedAt = userDismissals.get(offeringType);

  if (!lastDismissedAt) {
    return false;
  }

  const timeSinceDismissal = Date.now() - lastDismissedAt;
  return timeSinceDismissal < DISMISSAL_COOLDOWN_MS;
}

/**
 * Record that user dismissed a blessing
 */
export function recordBlessingDismissal(
  userId: string,
  offeringType: string
): void {
  if (!dismissalCache.has(userId)) {
    dismissalCache.set(userId, new Map());
  }

  const userDismissals = dismissalCache.get(userId)!;
  userDismissals.set(offeringType, Date.now());
}

/**
 * Clear dismissal (when user accepts a blessing)
 */
export function clearBlessingDismissal(
  userId: string,
  offeringType: string
): void {
  if (!dismissalCache.has(userId)) {
    return;
  }

  const userDismissals = dismissalCache.get(userId)!;
  userDismissals.delete(offeringType);
}

// ============================================================================
// BLESSING ANALYTICS (for learning which blessings resonate)
// ============================================================================

export interface BlessingInteraction {
  userId: string;
  blessingType: BlessingMoment['type'];
  offeringType: BlessingMoment['suggestedOffering'];
  action: 'shown' | 'accepted' | 'dismissed';
  timestamp: Date;
  confidence: number;
}

// In-memory analytics (could be persisted to DB)
const blessingAnalytics: BlessingInteraction[] = [];

/**
 * Log blessing interaction
 */
export function logBlessingInteraction(interaction: BlessingInteraction): void {
  blessingAnalytics.push(interaction);

  // Keep only last 1000 interactions in memory
  if (blessingAnalytics.length > 1000) {
    blessingAnalytics.shift();
  }
}

/**
 * Get blessing acceptance rate for a user
 */
export function getUserBlessingAcceptanceRate(userId: string): number {
  const userInteractions = blessingAnalytics.filter(
    (i) => i.userId === userId && (i.action === 'accepted' || i.action === 'dismissed')
  );

  if (userInteractions.length === 0) {
    return 0;
  }

  const acceptedCount = userInteractions.filter((i) => i.action === 'accepted').length;
  return acceptedCount / userInteractions.length;
}

/**
 * Get most accepted blessing types (system-wide)
 */
export function getMostAcceptedBlessingTypes(): Array<{
  type: BlessingMoment['type'];
  acceptanceRate: number;
  count: number;
}> {
  const typeStats = new Map<
    BlessingMoment['type'],
    { accepted: number; total: number }
  >();

  for (const interaction of blessingAnalytics) {
    if (interaction.action === 'shown') continue;

    if (!typeStats.has(interaction.blessingType)) {
      typeStats.set(interaction.blessingType, { accepted: 0, total: 0 });
    }

    const stats = typeStats.get(interaction.blessingType)!;
    stats.total++;
    if (interaction.action === 'accepted') {
      stats.accepted++;
    }
  }

  return Array.from(typeStats.entries())
    .map(([type, stats]) => ({
      type,
      acceptanceRate: stats.accepted / stats.total,
      count: stats.total,
    }))
    .sort((a, b) => b.acceptanceRate - a.acceptanceRate);
}

// ============================================================================
// HELPER: Silent Episode Creation After Every Message
// ============================================================================

import { createEpisode } from '@/lib/services/episode-service';

export interface AutoEpisodeParams {
  userId: string;
  message: string;
  affectValence?: number;
  affectArousal?: number;
  dominantElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
}

/**
 * Silently create an episode after every chat message
 * This runs in background - errors are logged but don't affect user experience
 */
export async function autoCreateEpisode(params: AutoEpisodeParams): Promise<void> {
  const { userId, message, affectValence, affectArousal, dominantElement } = params;

  try {
    // Extract essence (first 100 chars as scene stanza)
    const sceneStanza = message.substring(0, 100).trim();

    await createEpisode({
      userId,
      datetime: new Date(),
      sceneStanza,
      affectValence: affectValence ?? 0.5,
      affectArousal: affectArousal ?? 0.5,
      dominantElement: dominantElement ?? 'air', // Default to air for chat
    });
  } catch (error) {
    // Non-fatal - log but don't throw
    console.error('Auto episode creation failed (non-fatal):', error);
  }
}
