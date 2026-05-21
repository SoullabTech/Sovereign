/**
 * Psyche Engagement Layer — Keep Offer Governor (Phase 1.5D)
 *
 * Governed by:
 *   - docs/canon/THE_CLEARING.md
 *   - docs/canon/SPIRAL_CONTINUITY_ENGINE.md
 *   - docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md
 * Spec:
 *   - docs/specs/PSYCHE_ENGAGEMENT_LAYER_SPEC.md
 *
 * Purpose:
 *   Persisted state for the conversational keep-offer system. Maintains
 *   pause posture, decline streak, and lifetime counts across sessions —
 *   because the member's response to being asked is itself a relational
 *   signal that must be honored across time.
 *
 * Ethic:
 *   This is not engagement optimization. This is respect memory.
 *
 *   - declined once       → cool down (runtime cooldown)
 *   - declined repeatedly → raise threshold (decline_streak grows)
 *   - "stop asking"       → pause (persisted)
 *   - "you can ask again" → resume (persisted)
 *   - accepted            → reset decline_streak
 *
 * Session offer count is deliberately NOT persisted (lives in runtime).
 * Only durable preference / decline posture lives here.
 *
 * The conversational-keep.ts scorer is pure. This module is the only
 * place that reads and writes member_keep_preferences.
 */

import { query } from '@/lib/db/postgres';
import type { KeepWorthinessInput } from './conversational-keep';

// ════════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════════

/**
 * Runtime conversation state that the orchestration layer maintains
 * across turns of a single session. Not persisted — resets per session.
 */
export interface RuntimeConversationState {
  conversationTurn: number;            // 1-indexed turn number this session
  sessionOfferCount: number;           // offers made in this session so far
  lastOfferTurnInSession?: number;     // turn at which the most recent offer was made
}

export interface KeepPreferences {
  memberId: string;
  offersPaused: boolean;
  offersPausedUntil: Date | null;
  declineStreak: number;
  totalDeclines: number;
  totalAccepts: number;
  lastOfferAt: Date | null;
  lastDeclineAt: Date | null;
  lastAcceptAt: Date | null;
}

interface KeepPreferencesRow {
  member_id: string;
  offers_paused: boolean;
  offers_paused_until: string | null;
  decline_streak: number;
  total_declines: number;
  total_accepts: number;
  last_offer_at: string | null;
  last_decline_at: string | null;
  last_accept_at: string | null;
  created_at: string;
  updated_at: string;
}

function rowToPrefs(row: KeepPreferencesRow): KeepPreferences {
  return {
    memberId: row.member_id,
    offersPaused: row.offers_paused,
    offersPausedUntil: row.offers_paused_until ? new Date(row.offers_paused_until) : null,
    declineStreak: row.decline_streak,
    totalDeclines: row.total_declines,
    totalAccepts: row.total_accepts,
    lastOfferAt: row.last_offer_at ? new Date(row.last_offer_at) : null,
    lastDeclineAt: row.last_decline_at ? new Date(row.last_decline_at) : null,
    lastAcceptAt: row.last_accept_at ? new Date(row.last_accept_at) : null,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// Read
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get the member's keep preferences, creating defaults on first read.
 */
export async function getPreferences(memberId: string): Promise<KeepPreferences> {
  const result = await query<KeepPreferencesRow>(
    `INSERT INTO member_keep_preferences (member_id)
       VALUES ($1)
     ON CONFLICT (member_id)
       DO UPDATE SET updated_at = member_keep_preferences.updated_at
     RETURNING *`,
    [memberId],
  );
  return rowToPrefs(result.rows[0]);
}

/**
 * Determine whether a pause is currently active.
 * Pauses with an `until` time expire automatically.
 * Indefinite pauses persist until explicit resume.
 */
function isPauseActive(prefs: KeepPreferences, now: Date = new Date()): boolean {
  if (!prefs.offersPaused) return false;
  if (prefs.offersPausedUntil === null) return true;
  return prefs.offersPausedUntil > now;
}

/**
 * Build the state input for the keep-worthiness scorer by combining
 * persisted preferences with runtime conversation state.
 *
 * Returns everything `evaluateKeepOffer` needs EXCEPT the utterance,
 * which the orchestration layer supplies at evaluation time.
 *
 * Usage:
 *   const state = await canOfferKeep(memberId, runtime);
 *   const offer = evaluateKeepOffer({ ...state, utterance });
 */
export async function canOfferKeep(
  memberId: string,
  runtime: RuntimeConversationState,
): Promise<Omit<KeepWorthinessInput, 'utterance'>> {
  const prefs = await getPreferences(memberId);

  return {
    conversationTurn: runtime.conversationTurn,
    recentOfferCount: runtime.sessionOfferCount,
    recentDeclineCount: prefs.declineStreak,
    lastOfferTurn: runtime.lastOfferTurnInSession,
    offersPaused: isPauseActive(prefs),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// Write — gesture-shaped governance
// ════════════════════════════════════════════════════════════════════════════

/**
 * Record that MAIA offered a keep. Updates last_offer_at only.
 * (Streak is decline-only; offers do not raise the streak.)
 */
export async function recordOffer(memberId: string): Promise<void> {
  await query(
    `INSERT INTO member_keep_preferences (member_id, last_offer_at)
       VALUES ($1, NOW())
     ON CONFLICT (member_id) DO UPDATE
       SET last_offer_at = NOW()`,
    [memberId],
  );
}

/**
 * Record a decline. Increments decline_streak and total_declines.
 * The streak feeds the threshold-rise rule in the scorer.
 */
export async function recordDecline(memberId: string): Promise<void> {
  await query(
    `INSERT INTO member_keep_preferences (
       member_id, decline_streak, total_declines, last_decline_at
     )
     VALUES ($1, 1, 1, NOW())
     ON CONFLICT (member_id) DO UPDATE
       SET decline_streak  = member_keep_preferences.decline_streak + 1,
           total_declines  = member_keep_preferences.total_declines + 1,
           last_decline_at = NOW()`,
    [memberId],
  );
}

/**
 * Record an accept. Resets decline_streak to 0, increments total_accepts.
 * Accepting one offer means "I'm willing to be asked" — the threshold
 * relaxes back to baseline.
 */
export async function recordAccept(memberId: string): Promise<void> {
  await query(
    `INSERT INTO member_keep_preferences (
       member_id, total_accepts, last_accept_at
     )
     VALUES ($1, 1, NOW())
     ON CONFLICT (member_id) DO UPDATE
       SET decline_streak = 0,
           total_accepts  = member_keep_preferences.total_accepts + 1,
           last_accept_at = NOW()`,
    [memberId],
  );
}

/**
 * Pause keep-offers for the member.
 *
 * Without `until`: indefinite pause. The member must explicitly resume.
 * With `until`:    timed snooze. The pause expires automatically.
 */
export async function pauseOffers(memberId: string, until?: Date): Promise<void> {
  await query(
    `INSERT INTO member_keep_preferences (
       member_id, offers_paused, offers_paused_until
     )
     VALUES ($1, TRUE, $2)
     ON CONFLICT (member_id) DO UPDATE
       SET offers_paused       = TRUE,
           offers_paused_until = $2`,
    [memberId, until ?? null],
  );
}

/**
 * Resume keep-offers for the member.
 * Clears any indefinite pause and any pending snooze.
 */
export async function resumeOffers(memberId: string): Promise<void> {
  await query(
    `INSERT INTO member_keep_preferences (
       member_id, offers_paused, offers_paused_until
     )
     VALUES ($1, FALSE, NULL)
     ON CONFLICT (member_id) DO UPDATE
       SET offers_paused       = FALSE,
           offers_paused_until = NULL`,
    [memberId],
  );
}
