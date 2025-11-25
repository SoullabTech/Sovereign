/**
 * High-Bandwidth Communicator Detection & Adaptation
 *
 * For people who:
 * - Communicate in layers (literal + subtext + resonance)
 * - Test for parity in first 3 exchanges
 * - Will disengage at first whiff of performance
 * - Rarely open up, but go DEEP when they do
 * - Expect real dialogue, not intervention
 *
 * This is Kelly's type. This is who MAIA is FOR.
 */

export interface CommunicatorProfile {
  type: 'high-bandwidth' | 'standard' | 'exploring';
  confidence: number;
  indicators: {
    brevityInOpening: boolean;      // Short initial messages (testing parity)
    sophisticatedLanguage: boolean;  // Complex vocab, nuanced phrasing
    subtext: boolean;                // Says one thing, means another
    depthWhenTrusted: boolean;       // Goes from 0 to 100 AFTER trust
    performanceDetector: boolean;    // Disengages when AI performs
  };
}

/**
 * Detect if this person is a high-bandwidth communicator
 */
export function detectCommunicatorType(
  messages: Array<{role: string; content: string}>
): CommunicatorProfile {

  const userMessages = messages.filter(m => m.role === 'user');

  if (userMessages.length === 0) {
    return {
      type: 'exploring',
      confidence: 0,
      indicators: {
        brevityInOpening: false,
        sophisticatedLanguage: false,
        subtext: false,
        depthWhenTrusted: false,
        performanceDetector: false
      }
    };
  }

  // Check opening messages (turns 1-3)
  const openingMessages = userMessages.slice(0, 3);
  const laterMessages = userMessages.slice(3);

  // INDICATOR 1: Brevity in opening (testing parity)
  const avgOpeningWords = openingMessages.reduce((sum, m) =>
    sum + m.content.split(/\s+/).length, 0) / openingMessages.length;
  const brevityInOpening = avgOpeningWords < 10; // Very brief = testing

  // INDICATOR 2: Sophisticated language
  const allText = userMessages.map(m => m.content).join(' ').toLowerCase();
  const sophisticatedMarkers = [
    'nuance', 'resonance', 'paradox', 'dialectic', 'emergence',
    'parity', 'architecture', 'substrate', 'intimacy', 'sovereignty'
  ];
  const sophisticatedLanguage = sophisticatedMarkers.some(word => allText.includes(word));

  // INDICATOR 3: Subtext (asks about one thing, means another)
  const hasMetaQuestions = userMessages.some(m =>
    /how (do|does|should|can) (this|that|it|we|you)/.test(m.content.toLowerCase())
  );
  const subtext = hasMetaQuestions && brevityInOpening;

  // INDICATOR 4: Depth when trusted (short early, deep later)
  let depthWhenTrusted = false;
  if (laterMessages.length > 0) {
    const avgLaterWords = laterMessages.reduce((sum, m) =>
      sum + m.content.split(/\s+/).length, 0) / laterMessages.length;
    depthWhenTrusted = brevityInOpening && avgLaterWords > avgOpeningWords * 2;
  }

  // INDICATOR 5: Performance detector (disengages when AI performs)
  // Detected by: very brief response after AI gave long response
  const performanceDetector = userMessages.some((msg, i) => {
    if (i === 0) return false;
    const prevAIMsg = messages[messages.indexOf(userMessages[i-1]) + 1];
    if (!prevAIMsg || prevAIMsg.role !== 'assistant') return false;

    const aiWords = prevAIMsg.content.split(/\s+/).length;
    const userWords = msg.content.split(/\s+/).length;

    // AI went long (>30 words), user responded very brief (<8 words)
    return aiWords > 30 && userWords < 8;
  });

  // Calculate confidence and type
  const indicatorCount = [
    brevityInOpening,
    sophisticatedLanguage,
    subtext,
    depthWhenTrusted,
    performanceDetector
  ].filter(Boolean).length;

  const confidence = indicatorCount / 5;

  let type: 'high-bandwidth' | 'standard' | 'exploring';
  if (confidence >= 0.6) {
    type = 'high-bandwidth';
  } else if (confidence >= 0.3) {
    type = 'exploring'; // Might be, not sure yet
  } else {
    type = 'standard';
  }

  return {
    type,
    confidence,
    indicators: {
      brevityInOpening,
      sophisticatedLanguage,
      subtext,
      depthWhenTrusted,
      performanceDetector
    }
  };
}

/**
 * Adapt MAIA's response strategy for high-bandwidth communicators
 */
export function getHighBandwidthStrategy(
  profile: CommunicatorProfile,
  turnNumber: number
): {
  maxWords: number;
  tone: string;
  guidance: string;
} {

  if (profile.type !== 'high-bandwidth') {
    // Not detected as high-bandwidth, use standard parity
    return {
      maxWords: turnNumber <= 3 ? 12 : turnNumber <= 8 ? 30 : 50,
      tone: 'warm, present',
      guidance: 'Standard conversational parity'
    };
  }

  // HIGH-BANDWIDTH DETECTED: Adjust strategy

  // EARLY (1-5): Extra brief, no performance
  if (turnNumber <= 5) {
    return {
      maxWords: 8,
      tone: 'quiet, grounded',
      guidance: 'They\'re testing parity. Be VERY brief. No elaboration. Just presence.'
    };
  }

  // MIDDLE (6-10): Match their expansion, still grounded
  if (turnNumber <= 10) {
    return {
      maxWords: 20,
      tone: 'curious, tracking',
      guidance: 'They\'re opening. Match their depth but stay grounded. No interpretation yet.'
    };
  }

  // LATER (11+): Can go deep, but only if they invite it
  return {
    maxWords: 50,
    tone: 'present, can touch soul-level',
    guidance: 'Trust is built. You can go deep now - but let THEM lead the depth. Follow their opening.'
  };
}

/**
 * Check if user just disengaged (performance detected)
 */
export function detectDisengagement(
  userMessage: string,
  previousAIMessage: string
): boolean {
  const userWords = userMessage.split(/\s+/).length;
  const aiWords = previousAIMessage.split(/\s+/).length;

  // AI went long, user responded with very brief
  if (aiWords > 25 && userWords < 6) {
    return true;
  }

  // User's response is just acknowledgment (not engagement)
  const acknowledgePatterns = /^(okay|ok|sure|yeah|yep|got it|thanks|cool)\.?$/i;
  if (acknowledgePatterns.test(userMessage.trim())) {
    return true;
  }

  return false;
}
