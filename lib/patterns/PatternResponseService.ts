/**
 * Pattern Response Service — Wire 3
 *
 * Detects when a member responds to a pattern offering,
 * classifies the response, and updates the pattern_ledger.
 *
 * Strategy (no-UI version):
 * - Before each oracle turn, check if a pattern was offered in a recent turn
 * - If so, scan the user's current message for confirmation/rejection signals
 * - Update the pattern_ledger and pattern_offering_events accordingly
 * - If confirmed, capture the member's language as their own naming
 *
 * Design principles:
 * - Conservative classification (default to 'unclear' — never presume)
 * - Member language is sacred (store exact words, not interpretation)
 * - Fire-and-forget updates (never block oracle)
 *
 * Philosophy: "The member decides. We just listen for the decision."
 */

import { query } from '@/lib/db/postgres';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type ResponseClass = 'confirmed' | 'partial' | 'rejected' | 'unclear';

export interface PendingOffer {
  patternId: string;
  offeringEventId: string;
  offeredAtTurn: number;
}

export interface ResponseClassification {
  responseClass: ResponseClass;
  memberLabel?: string; // Member's own words for the pattern (if confirmed)
}

// ═══════════════════════════════════════════════════════════════
// In-Memory Offer Receipts
// ═══════════════════════════════════════════════════════════════

/**
 * Track pending offers per session. When a pattern is offered,
 * store a receipt so we can check the next user message.
 *
 * Using global Map (same pattern as oracle rate limiter):
 * keyed by sessionId → pending offer.
 */
const __pendingOffers: Map<string, PendingOffer> =
  // @ts-ignore — match existing globalThis pattern
  globalThis.__pendingOffers || new Map();
// @ts-ignore
globalThis.__pendingOffers = __pendingOffers;

/**
 * Record that a pattern was offered in this session.
 * Called by the oracle route after injecting an offer.
 */
export function recordPendingOffer(
  sessionId: string,
  patternId: string,
  conversationDepth: number
): void {
  __pendingOffers.set(sessionId, {
    patternId,
    offeringEventId: '', // Will be set when we query the latest event
    offeredAtTurn: conversationDepth,
  });
}

/**
 * Check if there's a pending offer for this session.
 * Only returns the offer if it was from the previous turn
 * (user's current message is the response).
 */
export function getPendingOffer(
  sessionId: string,
  currentDepth: number
): PendingOffer | null {
  const pending = __pendingOffers.get(sessionId);
  if (!pending) return null;

  // Only treat the message as a response if it's the turn
  // immediately after the offer (within 2 turns for safety)
  const turnsSinceOffer = currentDepth - pending.offeredAtTurn;
  if (turnsSinceOffer < 1 || turnsSinceOffer > 2) {
    // Too old — clear the receipt
    __pendingOffers.delete(sessionId);
    return null;
  }

  return pending;
}

/**
 * Clear the pending offer for a session (after processing).
 */
export function clearPendingOffer(sessionId: string): void {
  __pendingOffers.delete(sessionId);
}

// ═══════════════════════════════════════════════════════════════
// Response Classification
// ═══════════════════════════════════════════════════════════════

/**
 * Classify a user's response to a pattern offering.
 * CONSERVATIVE: defaults to 'unclear' unless signal is strong.
 *
 * Never interprets ambiguity as agreement.
 */
export function classifyResponse(userText: string): ResponseClassification {
  const text = userText.toLowerCase().trim();

  // --- Explicit confirmation ---
  const confirmPatterns = [
    /\b(yes|yeah|yep|exactly|absolutely|that'?s?\s+(?:it|right|true|me|exactly))\b/,
    /\b(i\s+do\s+(?:that|this)|that(?:'?s|\s+is)\s+(?:so\s+)?(?:true|accurate|right|me))\b/,
    /\b(spot\s+on|nailed\s+it|hit\s+(?:the\s+)?(?:nail|mark|home))\b/,
    /\b(i\s+(?:can\s+)?see\s+(?:that|it)|that\s+lands|that\s+resonates)\b/,
    /\b(definitely|100\s*%|for\s+sure|totally)\b/,
  ];

  for (const pattern of confirmPatterns) {
    if (pattern.test(text)) {
      // Try to extract member's own naming language
      const memberLabel = extractMemberLabel(userText);
      return { responseClass: 'confirmed', memberLabel };
    }
  }

  // --- Explicit rejection ---
  const rejectPatterns = [
    /\b(no|nope|not\s+(?:really|me|true|right|that|quite))\b/,
    /\b(doesn'?t\s+(?:fit|land|resonate|feel\s+right))\b/,
    /\b(i\s+don'?t\s+(?:think\s+so|see\s+(?:it|that)|agree))\b/,
    /\b(off\s+(?:base|mark)|wrong|incorrect)\b/,
    /\b(that'?s\s+not\s+(?:it|me|right|what))\b/,
  ];

  for (const pattern of rejectPatterns) {
    if (pattern.test(text)) {
      return { responseClass: 'rejected' };
    }
  }

  // --- Partial recognition ---
  const partialPatterns = [
    /\b(sort\s+of|kind\s+of|partially|somewhat|maybe|in\s+a\s+way)\b/,
    /\b(part\s+of\s+(?:it|that|me)|sometimes|not\s+always\s+but)\b/,
    /\b(i\s+(?:can\s+)?see\s+(?:some|part)\s+of\s+(?:that|it))\b/,
  ];

  for (const pattern of partialPatterns) {
    if (pattern.test(text)) {
      const memberLabel = extractMemberLabel(userText);
      return { responseClass: 'partial', memberLabel };
    }
  }

  // Default: unclear (never presume)
  return { responseClass: 'unclear' };
}

/**
 * Extract the member's own language for naming the pattern.
 * Looks for phrases like "it's like...", "I call it...", "it's my..."
 *
 * Returns undefined if no naming language found.
 */
function extractMemberLabel(userText: string): string | undefined {
  const text = userText.trim();

  // Look for naming patterns
  const namingPatterns = [
    /(?:it'?s?\s+(?:like|my)|i\s+call\s+(?:it|that)|that'?s?\s+my)\s+["']?(.{5,60})["']?/i,
    /["'](.{5,40})["']\s*(?:pattern|thing|habit|cycle)/i,
    /i\s+(?:think\s+of\s+it\s+as|would\s+call\s+(?:it|that))\s+["']?(.{5,60})["']?/i,
  ];

  for (const pattern of namingPatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      // Clean up and return
      return match[1].trim().replace(/[."'!?,]+$/, '').trim();
    }
  }

  return undefined;
}

// ═══════════════════════════════════════════════════════════════
// Database Updates
// ═══════════════════════════════════════════════════════════════

/**
 * Process a member's response to a pattern offering.
 * Updates both pattern_offering_events and pattern_ledger.
 * Fire-and-forget.
 */
export function processPatternResponse(
  pending: PendingOffer,
  memberId: string,
  userText: string,
  sessionId: string
): void {
  const classification = classifyResponse(userText);

  // Fire-and-forget
  _processResponseAsync(pending, memberId, userText, sessionId, classification).catch((error) => {
    console.warn('[pattern-response] Failed to process response:', {
      patternId: pending.patternId.substring(0, 8) + '...',
      responseClass: classification.responseClass,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  // Log for observability
  console.log('[pattern-response]', {
    patternId: pending.patternId.substring(0, 8) + '...',
    responseClass: classification.responseClass,
    hasLabel: !!classification.memberLabel,
  });
}

async function _processResponseAsync(
  pending: PendingOffer,
  memberId: string,
  userText: string,
  sessionId: string,
  classification: ResponseClassification
): Promise<void> {
  // Update the most recent offering event for this pattern
  // PostgreSQL doesn't support ORDER BY/LIMIT in UPDATE — use subquery
  await query(
    `UPDATE pattern_offering_events
     SET response_type = $1,
         response_text = $2,
         response_at = NOW()
     WHERE id = (
       SELECT id FROM pattern_offering_events
       WHERE pattern_id = $3
         AND member_id = $4
         AND response_type IS NULL
       ORDER BY offered_at DESC
       LIMIT 1
     )`,
    [
      classification.responseClass === 'unclear' ? 'no_response' : classification.responseClass,
      userText.substring(0, 500), // Bounded
      pending.patternId,
      memberId,
    ]
  );

  // Update ledger based on classification
  switch (classification.responseClass) {
    case 'confirmed':
      await query(
        `UPDATE pattern_ledger
         SET status = 'confirmed',
             member_response = $1,
             member_response_at = NOW()
         WHERE id = $2`,
        [
          classification.memberLabel || userText.substring(0, 200),
          pending.patternId,
        ]
      );
      break;

    case 'partial':
      await query(
        `UPDATE pattern_ledger
         SET status = 'partial',
             member_response = $1,
             member_response_at = NOW()
         WHERE id = $2`,
        [
          classification.memberLabel || userText.substring(0, 200),
          pending.patternId,
        ]
      );
      break;

    case 'rejected':
      await query(
        `UPDATE pattern_ledger
         SET status = 'rejected',
             member_response = $1,
             member_response_at = NOW(),
             retired_at = NOW(),
             retirement_reason = 'member_rejected'
         WHERE id = $2`,
        [userText.substring(0, 200), pending.patternId]
      );
      break;

    case 'unclear':
      // Don't change status — pattern stays where it was
      // The offer still counts (times_offered was already incremented)
      break;
  }
}

// ═══════════════════════════════════════════════════════════════
// Follow-up Naming Request
// ═══════════════════════════════════════════════════════════════

/**
 * If a pattern was confirmed but no label was extracted,
 * return a prompt section asking MAIA to gently request naming.
 */
export function buildNamingFollowUpPrompt(
  classification: ResponseClassification,
  patternStatement: string
): string {
  if (classification.responseClass !== 'confirmed' || classification.memberLabel) {
    return '';
  }

  return `
# Pattern Naming Invitation

The member confirmed a pattern ("${patternStatement}") but hasn't named it in their own words.
At a natural point in your response, gently invite them to name it:
- "If you had to name this pattern, what would you call it?"
- "What's your word for this?"
- "How would you describe this to yourself?"

This is optional — don't force it if the conversation is moving elsewhere.
`;
}
