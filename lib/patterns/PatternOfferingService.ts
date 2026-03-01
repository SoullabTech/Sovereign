/**
 * Pattern Offering Service — Wire 2
 *
 * Queries active patterns for a member, applies gating logic,
 * and returns at most ONE formatted offering for injection
 * into the system prompt.
 *
 * Design principles:
 * - At most 1 offer per oracle call
 * - Never offer during high-intensity distress
 * - Never offer rejected/retired patterns
 * - Respect cooldown (min 7 days between re-offerings)
 * - Use existing epistemic tone templates
 * - Store offer receipt for response capture (Wire 3)
 *
 * Philosophy: "A mirror that occasionally taps on the glass —
 *              but only when the glass is calm."
 */

import { query } from '@/lib/db/postgres';
import {
  shouldOfferPattern,
  type PatternLedgerEntry,
} from '@/lib/maia/epistemicSourceTagger';
import {
  formatPatternOffering,
  type PatternOffering,
} from '@/lib/maia/epistemicToneKernels';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface OfferingContext {
  memberId: string;
  sessionId: string;
  conversationDepth: number;
  element: string;
  distressIntensity?: number | null;
}

export interface PatternOfferResult {
  /** The pattern being offered */
  patternId: string;
  /** Formatted offering text for system prompt injection */
  offeringText: string;
  /** The pattern statement (for logging) */
  statement: string;
  /** Confidence level */
  confidence: number;
}

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

/** Minimum conversation depth before offering patterns */
const MIN_DEPTH_FOR_OFFER = 4;

/** Minimum evidence count before considering a pattern for offering */
const MIN_EVIDENCE_FOR_OFFER = 2;

/** Maximum distress intensity that allows pattern offering */
const MAX_DISTRESS_FOR_OFFER = 0.5;

/** Minimum days between re-offerings of the same pattern */
const MIN_DAYS_BETWEEN_OFFERS = 7;

/** Maximum times a pattern can be offered before it's left alone */
const MAX_OFFER_COUNT = 3;

// ═══════════════════════════════════════════════════════════════
// Core Service
// ═══════════════════════════════════════════════════════════════

/**
 * Check if there's a pattern worth offering right now.
 * Returns null if no pattern should be offered (the common case).
 *
 * Gating sequence:
 * 1. Conversation deep enough?
 * 2. Not in distress doorway?
 * 3. Any eligible patterns exist?
 * 4. Epistemic cadence gate passes?
 * 5. Format and return the single best candidate
 */
export async function getPatternOffer(
  ctx: OfferingContext
): Promise<PatternOfferResult | null> {
  try {
    // Gate 1: Minimum conversation depth
    if (ctx.conversationDepth < MIN_DEPTH_FOR_OFFER) {
      return null;
    }

    // Gate 2: Not during distress
    if (ctx.distressIntensity && ctx.distressIntensity > MAX_DISTRESS_FOR_OFFER) {
      return null;
    }

    // Gate 3: Query eligible patterns (emerging or partial, with evidence)
    const candidates = await query<{
      id: string;
      statement: string;
      confidence: number;
      status: string;
      scope: string;
      times_offered: number;
      last_offered_at: string | null;
      evidence_count: number;
    }>(
      `SELECT
        pl.id,
        pl.statement,
        pl.confidence,
        pl.status,
        pl.scope,
        pl.times_offered,
        pl.last_offered_at,
        COUNT(pe.id)::int as evidence_count
      FROM pattern_ledger pl
      LEFT JOIN pattern_evidence pe ON pe.pattern_id = pl.id
      WHERE pl.member_id = $1
        AND pl.status IN ('emerging', 'partial')
        AND pl.confidence >= 0.3
        AND pl.times_offered < $2
      GROUP BY pl.id
      HAVING COUNT(pe.id) >= $3
      ORDER BY pl.confidence DESC, COUNT(pe.id) DESC
      LIMIT 5`,
      [ctx.memberId, MAX_OFFER_COUNT, MIN_EVIDENCE_FOR_OFFER]
    );

    if (candidates.rows.length === 0) {
      return null;
    }

    // Gate 4: Apply epistemic cadence gate to each candidate
    for (const row of candidates.rows) {
      const ledgerEntry: PatternLedgerEntry = {
        id: row.id,
        statement: row.statement,
        confidence: Number(row.confidence),
        status: row.status as PatternLedgerEntry['status'],
        evidenceRefs: [], // Not needed for gating
        scope: row.scope,
      };

      const lastOffered = row.last_offered_at
        ? new Date(row.last_offered_at)
        : undefined;

      if (!shouldOfferPattern(ledgerEntry, lastOffered, MIN_DAYS_BETWEEN_OFFERS)) {
        continue;
      }

      // Gate 5: Load evidence for formatting
      const evidenceRows = await query<{ excerpt: string }>(
        `SELECT excerpt
         FROM pattern_evidence
         WHERE pattern_id = $1
         ORDER BY detected_at DESC
         LIMIT 4`,
        [row.id]
      );

      const evidencePoints = evidenceRows.rows
        .map(e => e.excerpt)
        .filter(Boolean) as string[];

      // Format the offering using existing epistemic templates
      const offering: PatternOffering = {
        pattern: row.statement,
        confidence: Number(row.confidence),
        evidencePoints,
        scope: row.scope as PatternOffering['scope'],
      };

      const offeringText = formatPatternOffering(offering);

      // Record the offer attempt (fire-and-forget)
      _recordOfferAttempt(row.id, ctx.memberId, ctx.sessionId, offeringText);

      return {
        patternId: row.id,
        offeringText,
        statement: row.statement,
        confidence: Number(row.confidence),
      };
    }

    // No candidate passed all gates
    return null;
  } catch (error) {
    // Pattern offering must never break oracle
    console.warn('[pattern-offering] Failed to get offer:', {
      memberId: ctx.memberId.substring(0, 8) + '...',
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Offer Recording
// ═══════════════════════════════════════════════════════════════

/**
 * Record that a pattern was offered and update the ledger.
 * Fire-and-forget.
 */
function _recordOfferAttempt(
  patternId: string,
  memberId: string,
  sessionId: string,
  offeringText: string
): void {
  (async () => {
    try {
      // Insert offering event
      await query(
        `INSERT INTO pattern_offering_events
          (pattern_id, member_id, conversation_id, offering_text)
         VALUES ($1, $2, $3, $4)`,
        [patternId, memberId, sessionId, offeringText]
      );

      // Update ledger: mark as offered, increment count, update timestamp
      await query(
        `UPDATE pattern_ledger
         SET status = CASE WHEN status = 'emerging' THEN 'offered' ELSE status END,
             times_offered = times_offered + 1,
             last_offered_at = NOW()
         WHERE id = $1`,
        [patternId]
      );
    } catch (error) {
      console.warn('[pattern-offering] Failed to record offer:', {
        patternId: patternId.substring(0, 8) + '...',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  })();
}

// ═══════════════════════════════════════════════════════════════
// Prompt Injection Helper
// ═══════════════════════════════════════════════════════════════

/**
 * Build the system prompt section for a pattern offering.
 * Returns empty string if no offer is available.
 *
 * This section is added to the system prompt so MAIA can weave
 * the offering naturally into conversation — not as a separate
 * card or widget, but as part of the attending flow.
 */
export function buildPatternOfferPromptSection(
  offer: PatternOfferResult | null
): string {
  if (!offer) return '';

  return `
# Pattern Offering (HANDLE WITH CARE)

You have noticed a pattern in this member's process. You MAY offer it during this response
if it fits naturally — but ONLY as a gentle observation, never as a finding or diagnosis.

Pattern: "${offer.statement}"
Confidence: ${offer.confidence > 0.7 ? 'strong' : offer.confidence > 0.4 ? 'emerging' : 'tentative'}

RULES FOR OFFERING:
- Frame as hypothesis: "Something I'm noticing across our conversations..."
- Include 1-2 evidence points naturally (not as a list)
- Ask if it lands: "Does that resonate?" or "Does that fit?"
- If it doesn't fit the flow of this specific response, SKIP IT — the offer will come again later
- NEVER force the pattern into conversation where it doesn't belong
- If the member is in the middle of something important, PRIORITIZE THEIR THREAD over the offer
- End with clear exit: "If not, we drop it."

If you choose NOT to offer it this turn (because the conversation doesn't call for it), that's fine.
The pattern will remain available for a future turn.
`;
}

// ═══════════════════════════════════════════════════════════════
// Background Pattern Awareness (separate from offering)
// ═══════════════════════════════════════════════════════════════

export interface ActivePatternRow {
  id: string;
  statement: string;
  confidence: number;
  status: string;
  scope: string;
  lastEvidenceAt?: string;
}

/**
 * Retrieve the top active patterns for a member as background context.
 *
 * This is NOT the offering pipeline (which surfaces 1 pattern to present).
 * This gives MAIA silent awareness of all patterns she's accumulated —
 * so she can recognise echoes without necessarily offering them.
 *
 * @param memberId - Member UUID (as string)
 * @param limit    - Maximum patterns to return (default 5)
 */
export async function getActivePatternContext(
  memberId: string,
  limit: number = 5
): Promise<ActivePatternRow[]> {
  const result = await query<{
    id: string;
    statement: string;
    confidence: number;
    status: string;
    scope: string;
    last_evidence_at: string | null;
  }>(
    `SELECT
      id::text,
      statement,
      confidence,
      status,
      scope,
      last_evidence_at::text
    FROM pattern_ledger
    WHERE member_id = $1::uuid
      AND status NOT IN ('retired', 'rejected')
      AND confidence >= 0.25
    ORDER BY confidence DESC, last_evidence_at DESC NULLS LAST
    LIMIT $2`,
    [memberId, limit]
  );

  return (result.rows ?? []).map(r => ({
    id: r.id,
    statement: r.statement,
    confidence: Number(r.confidence),
    status: r.status,
    scope: r.scope,
    lastEvidenceAt: r.last_evidence_at ?? undefined,
  }));
}
