/**
 * Bardic Blessings - Sacred Offerings at Key Moments
 *
 * Detects when to offer the Bardic Memory as a blessing (not hidden, but gifted)
 *
 * @module lib/bardic/blessing-moments
 */

// ============================================================================
// BLESSING MOMENT DETECTION
// ============================================================================

export interface BlessingMoment {
  type: 'conversation-end' | 'breakthrough' | 'threshold' | 'pattern-detected' | 'milestone' | 'user-seeking';
  confidence: number;
  suggestedOffering: BardicOffering;
  blessingText: string;
}

export type BardicOffering =
  | 'thread'           // Show narrative connections
  | 'fire-query'       // What wants to emerge
  | 'virtue-ledger'    // Your practice over time
  | 'crystallization'  // Something is manifesting
  | 'sacred-witness';  // Hold this moment

// ============================================================================
// CONVERSATION END DETECTION
// ============================================================================

/**
 * Detect if conversation is naturally ending (good place for blessing)
 */
export function detectConversationEnd(message: string): boolean {
  const endPatterns = [
    /thank you/i,
    /thanks/i,
    /appreciate/i,
    /grateful/i,
    /helpful/i,
    /this was good/i,
    /this helped/i,
    /feeling better/i,
    /clearer now/i,
    /i should go/i,
    /talk later/i,
    /goodnight/i,
    /good night/i,
    /bye/i,
    /see you/i,
  ];

  return endPatterns.some(pattern => pattern.test(message));
}

// ============================================================================
// BREAKTHROUGH DETECTION
// ============================================================================

/**
 * Detect breakthrough moments (clarity, realization, shift)
 */
export function detectBreakthrough(message: string): boolean {
  const breakthroughPatterns = [
    /i get it now/i,
    /that makes sense/i,
    /i see it/i,
    /clarity/i,
    /clear now/i,
    /breakthrough/i,
    /aha/i,
    /oh wow/i,
    /i understand/i,
    /this is exactly/i,
    /i realize/i,
    /i'm seeing/i,
  ];

  return breakthroughPatterns.some(pattern => pattern.test(message));
}

// ============================================================================
// THRESHOLD CROSSING DETECTION
// ============================================================================

/**
 * Detect threshold moments (decisions, endings, beginnings)
 */
export function detectThreshold(message: string): boolean {
  const thresholdPatterns = [
    /i'?m going to/i,
    /i decided/i,
    /i'm done with/i,
    /i'm ready/i,
    /i quit/i,
    /i'm starting/i,
    /new chapter/i,
    /turning point/i,
    /moving on/i,
    /letting go/i,
    /it's time/i,
  ];

  return thresholdPatterns.some(pattern => pattern.test(message));
}

// ============================================================================
// PATTERN DETECTION (across episodes)
// ============================================================================

/**
 * Detect when user is circling a pattern (needs to see the thread)
 */
export function detectPatternCircling(
  currentMessage: string,
  recentEpisodes: Array<{ sceneStanza: string }>
): boolean {
  // Simple keyword overlap check
  const currentWords = extractKeywords(currentMessage);

  let matchCount = 0;
  for (const episode of recentEpisodes.slice(0, 5)) {
    const episodeWords = extractKeywords(episode.sceneStanza);
    const overlap = currentWords.filter(w => episodeWords.includes(w));
    if (overlap.length >= 2) {
      matchCount++;
    }
  }

  // If 2+ recent episodes share keywords with current message → pattern
  return matchCount >= 2;
}

function extractKeywords(text: string): string[] {
  const stopwords = ['i', 'me', 'my', 'the', 'a', 'an', 'and', 'or', 'but', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'this', 'that', 'these', 'those', 'with', 'from', 'about', 'into', 'through', 'during', 'before', 'after', 'to', 'of', 'in', 'on', 'at', 'by', 'for'];

  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.includes(w));
}

// ============================================================================
// MILESTONE DETECTION
// ============================================================================

/**
 * Detect milestone moments (streaks, counts, achievements)
 */
export interface MilestoneCheck {
  hasMilestone: boolean;
  type?: 'streak' | 'count' | 'first-time';
  details?: string;
}

export async function checkForMilestone(
  userId: string,
  microacts?: Array<{ totalCount: number; actionPhrase: string }>,
  streak?: number
): Promise<MilestoneCheck> {
  // Check for streak milestones
  if (streak !== undefined) {
    if (streak === 7) {
      return {
        hasMilestone: true,
        type: 'streak',
        details: '7 day streak! 🔥',
      };
    }
    if (streak === 30) {
      return {
        hasMilestone: true,
        type: 'streak',
        details: '30 day streak! A month of practice! 🌟',
      };
    }
    if (streak === 100) {
      return {
        hasMilestone: true,
        type: 'streak',
        details: '100 day streak! This is who you are now. 💫',
      };
    }
  }

  // Check for count milestones
  if (microacts) {
    for (const microact of microacts) {
      if (microact.totalCount === 50) {
        return {
          hasMilestone: true,
          type: 'count',
          details: `${microact.actionPhrase}: 50 times! Half a hundred.`,
        };
      }
      if (microact.totalCount === 100) {
        return {
          hasMilestone: true,
          type: 'count',
          details: `${microact.actionPhrase}: 100 times! A century of practice.`,
        };
      }
    }
  }

  return { hasMilestone: false };
}

// ============================================================================
// BLESSING MOMENT ORCHESTRATOR
// ============================================================================

export interface BlessingContext {
  currentMessage: string;
  recentEpisodes?: Array<{ sceneStanza: string }>;
  microacts?: Array<{ totalCount: number; actionPhrase: string }>;
  streak?: number;
  crystallizingTeloi?: Array<{ phrase: string; strength: number }>;
}

/**
 * Detect if this is a moment to offer a Bardic blessing
 */
export async function detectBlessingMoment(
  context: BlessingContext
): Promise<BlessingMoment | null> {
  const { currentMessage, recentEpisodes, crystallizingTeloi, microacts, streak } = context;

  // ========================================================================
  // 1. CONVERSATION END (offer thread or virtue ledger)
  // ========================================================================
  if (detectConversationEnd(currentMessage)) {
    // If pattern detected, offer thread
    if (recentEpisodes && detectPatternCircling(currentMessage, recentEpisodes)) {
      return {
        type: 'conversation-end',
        confidence: 0.9,
        suggestedOffering: 'thread',
        blessingText: "Before you go... would you like to see the thread you've been weaving? I sense a pattern across your recent conversations.",
      };
    }

    // Otherwise offer virtue ledger
    return {
      type: 'conversation-end',
      confidence: 0.85,
      suggestedOffering: 'virtue-ledger',
      blessingText: "Before you go... would you like to see what you've been cultivating? Your practice has been accruing.",
    };
  }

  // ========================================================================
  // 2. BREAKTHROUGH (offer thread to see how you got here)
  // ========================================================================
  if (detectBreakthrough(currentMessage)) {
    return {
      type: 'breakthrough',
      confidence: 0.95,
      suggestedOffering: 'thread',
      blessingText: "This clarity... it didn't come from nowhere. Would you like to see the thread that led here?",
    };
  }

  // ========================================================================
  // 3. THRESHOLD CROSSING (offer fire query)
  // ========================================================================
  if (detectThreshold(currentMessage)) {
    return {
      type: 'threshold',
      confidence: 0.9,
      suggestedOffering: 'fire-query',
      blessingText: "You're crossing a threshold. Would you like to see what else wants to emerge? The Bard can show you what's crystallizing.",
    };
  }

  // ========================================================================
  // 4. CRYSTALLIZATION DETECTED (offer fire query)
  // ========================================================================
  if (crystallizingTeloi && crystallizingTeloi.length > 0) {
    const telos = crystallizingTeloi[0];
    return {
      type: 'pattern-detected',
      confidence: 0.95,
      suggestedOffering: 'crystallization',
      blessingText: `Something is crystallizing: "${telos.phrase}". Would you like to see what's manifesting?`,
    };
  }

  // ========================================================================
  // 5. MILESTONE REACHED (offer virtue ledger)
  // ========================================================================
  const milestone = await checkForMilestone(context.currentMessage, microacts, streak);
  if (milestone.hasMilestone) {
    return {
      type: 'milestone',
      confidence: 1.0,
      suggestedOffering: 'virtue-ledger',
      blessingText: `${milestone.details} Would you like to see the full story of what you've been building?`,
    };
  }

  // ========================================================================
  // 6. PATTERN CIRCLING (offer thread)
  // ========================================================================
  if (recentEpisodes && detectPatternCircling(currentMessage, recentEpisodes)) {
    return {
      type: 'pattern-detected',
      confidence: 0.85,
      suggestedOffering: 'thread',
      blessingText: "You've touched this theme before. Would you like to see the thread?",
    };
  }

  return null;
}

// ============================================================================
// BLESSING PRESENTATION
// ============================================================================

export interface BlessingPresentation {
  messageToUser: string;
  offerButton: {
    text: string;
    icon: string;
    action: BardicOffering;
  };
  dismissButton: {
    text: string;
  };
}

/**
 * Format the blessing for presentation to user
 */
export function formatBlessing(moment: BlessingMoment): BlessingPresentation {
  const offerings: Record<BardicOffering, { buttonText: string; icon: string }> = {
    'thread': { buttonText: 'Show me the thread', icon: '🧵' },
    'fire-query': { buttonText: 'Let the Bard speak', icon: '🔥' },
    'virtue-ledger': { buttonText: 'Show my practice', icon: '💚' },
    'crystallization': { buttonText: 'See what\'s crystallizing', icon: '✨' },
    'sacred-witness': { buttonText: 'Hold this sacred', icon: '🙏' },
  };

  const offering = offerings[moment.suggestedOffering];

  return {
    messageToUser: moment.blessingText,
    offerButton: {
      text: offering.buttonText,
      icon: offering.icon,
      action: moment.suggestedOffering,
    },
    dismissButton: {
      text: 'Not right now',
    },
  };
}
