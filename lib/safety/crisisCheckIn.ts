/**
 * SAFETY-CRISIS-01: the short-lived "MAIA just asked about safety" flag.
 *
 * Set by the route after an AMBIGUOUS turn, and ONLY when MAIA's reply actually
 * asked the member a safety question (`maiaAskedAboutSafety`). Read on the next
 * turns, so that a bare "yes" can escalate to the CLEAR referral.
 *
 * What it holds: a session key, a turn budget and an expiry. No member text, no
 * MAIA text, no member identifier beyond the session key the route already
 * holds. It lives in process memory only: nothing is written, logged or
 * persisted, and a restart clears it. That is the right failure: a lost flag
 * returns the turn to single-turn assessment, it never invents an escalation.
 *
 * It runs under Sanctuary too. It stores no content, and the alternative (no
 * escalation on "yes") is the safety gap this exists to close.
 */

const TURNS = 2;
const TTL_MS = 15 * 60 * 1000;
const MAX_ENTRIES = 5000;

const pending = new Map<string, { turnsLeft: number; expiresAt: number }>();

/** Record that MAIA asked a safety question in this session. */
export function markSafetyCheckIn(sessionKey: string, now: number = Date.now()): void {
  if (!sessionKey) return;
  pending.delete(sessionKey);
  if (pending.size >= MAX_ENTRIES) {
    const oldest = pending.keys().next().value;
    if (oldest !== undefined) pending.delete(oldest);
  }
  pending.set(sessionKey, { turnsLeft: TURNS, expiresAt: now + TTL_MS });
}

/**
 * Consume one turn of a pending check-in. Returns true if a check-in was pending
 * for this turn. The flag is spent after its turn budget or on expiry.
 */
export function takeSafetyCheckIn(sessionKey: string, now: number = Date.now()): boolean {
  if (!sessionKey) return false;
  const entry = pending.get(sessionKey);
  if (!entry) return false;
  if (entry.expiresAt <= now) {
    pending.delete(sessionKey);
    return false;
  }
  entry.turnsLeft -= 1;
  if (entry.turnsLeft <= 0) pending.delete(sessionKey);
  return true;
}

/** Clear a pending check-in (answered, or escalated). */
export function clearSafetyCheckIn(sessionKey: string): void {
  pending.delete(sessionKey);
}

/** Test seam only. */
export function __resetSafetyCheckIns(): void {
  pending.clear();
}
