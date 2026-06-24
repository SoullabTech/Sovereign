/**
 * noticingGate.ts
 *
 * Eligibility check for Experiment 01 ("Something I noticed").
 * Authority: docs/specs/EXPERIMENT_01_ATTENTION_MADE_VISIBLE_2026-06-20.md §"Scope & rollout"
 *
 * ALL conditions must be true to return eligible=true:
 *   1. isSanctuary = FALSE              (Sanctuary sessions are always excluded)
 *   2. current message is a LOW-CONCERN OPENER — the experiment must never compete
 *      with an immediate human concern; any substantive message withholds the offer
 *   3. members.noticing_enabled = TRUE  (explicit opt-in — DEFAULT FALSE)
 *   4. members.tester = TRUE            (tester-gated per Field Lab precedent)
 *   5. noticing_last_offered_at is NULL OR older than OFFER_INTERVAL_DAYS (14d floor)
 *   6. extractNoticingReferents returns ≥ 3 referents (enough signal + implies history)
 *
 * Occasional, not scheduled: sparseness emerges from the CONJUNCTION of conditions
 * (a returning member opening with a greeting, after the interval, with enough named
 * referents) — which a member cannot predict or trigger on purpose — not from a timer.
 *
 * Fail-closed: any query error returns eligible=false and does NOT propagate.
 */

import { query } from '@/lib/db/postgres';
import { extractNoticingReferents, type NoticingObservationsResult } from './noticingObservations';

// ── Constants ─────────────────────────────────────────────────────────────────

const OFFER_INTERVAL_DAYS = 14;
const MIN_REFERENTS_TO_OFFER = 3;
const MAX_OPENER_WORDS = 8;

/**
 * A "low-concern opener" is a clear greeting carrying no immediate ask for attention.
 * CONSTITUTIONAL RULE: the experiment must never compete with the conversation — the
 * offer is withheld whenever the member's message could be an immediate human concern.
 * Fail-safe: anything not unambiguously a greeting is treated as a concern and the
 * offer is withheld. Deterministic; no inference, no model.
 */
const OPENER_PATTERN =
  /^(hi|hello|hey|hiya|howdy|yo|greetings|good\s+(morning|afternoon|evening)|morning|afternoon|evening)([\s,.!]+maia)?[\s,.!?]*$/i;

function isLowConcernOpener(message: string): boolean {
  if (!message) return false;
  const trimmed = message.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.includes('?')) return false; // a question is an immediate ask for attention
  if (trimmed.split(/\s+/).length > MAX_OPENER_WORDS) return false;
  return OPENER_PATTERN.test(trimmed);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NoticingGateResult {
  eligible: boolean;
  /** Populated when eligible=true; carry to the route so we don't re-compute. */
  observations: NoticingObservationsResult | null;
}

// ── Gate ──────────────────────────────────────────────────────────────────────

export async function checkNoticingGate(opts: {
  memberId: string;
  isSanctuary: boolean;
  currentMessage: string;
}): Promise<NoticingGateResult> {
  const { memberId, isSanctuary, currentMessage } = opts;

  // Guard 1 — Sanctuary exclusion (no query needed)
  if (isSanctuary) return { eligible: false, observations: null };

  // Guard 2 — Never compete with an immediate human concern. The offer surfaces
  // only on a clear, low-concern opener; any substantive message withholds it.
  if (!isLowConcernOpener(currentMessage)) return { eligible: false, observations: null };

  try {
    // Single query: consent, tester flag, and throttle column together
    const memberRow = await query<{
      noticing_enabled: boolean;
      tester: boolean;
      noticing_last_offered_at: Date | null;
    }>(
      `SELECT noticing_enabled, tester, noticing_last_offered_at
       FROM members
       WHERE id = $1
       LIMIT 1`,
      [memberId],
    );

    if (memberRow.rows.length === 0) return { eligible: false, observations: null };

    const { noticing_enabled, tester, noticing_last_offered_at } = memberRow.rows[0];

    // Guard 3 — Explicit opt-in
    if (!noticing_enabled) return { eligible: false, observations: null };

    // Guard 4 — Tester gate
    if (!tester) return { eligible: false, observations: null };

    // Guard 5 — Throttle: null = never offered (eligible) OR older than interval
    if (noticing_last_offered_at !== null) {
      const daysSince =
        (Date.now() - new Date(noticing_last_offered_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < OFFER_INTERVAL_DAYS) {
        return { eligible: false, observations: null };
      }
    }

    // Guard 6 — Enough referents
    const observations = await extractNoticingReferents(memberId);
    if (!observations || observations.referents.length < MIN_REFERENTS_TO_OFFER) {
      return { eligible: false, observations: null };
    }

    return { eligible: true, observations };
  } catch (err) {
    // Fail-closed — gate errors must never surface to members or break the route
    console.warn(
      '[MAIA/noticing] gate error (fail-closed):',
      err instanceof Error ? err.message : String(err),
    );
    return { eligible: false, observations: null };
  }
}
