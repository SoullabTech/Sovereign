/**
 * Writer's Studio dated beta grants (founder rulings 2026-11-13, recorded on #1800).
 *
 * Replaces, in stages, the open-ended boolean `ops_contacts.metadata.writers_studio_beta`:
 *   'legacy'     (default) — today's boolean only; the grant table is never read.
 *   'transition'           — an active dated grant admits; the legacy boolean admits only members who have never had a
 *                            dated grant. Used while every current tester is issued one, so no one loses access
 *                            mid-switch — and a revoke or expiry, once recorded, always stands.
 *   'dated'                — only an active dated grant admits; the boolean is retired.
 * Any other value of WS_BETA_GRANT_MODE behaves as 'legacy'.
 *
 * Founder/CTO witness access is unchanged and never expires here. A grant gives complimentary Pro until `expires_at`.
 * When it expires or is revoked the member keeps the Free Studio and loses only Pro (founder rulings 2026-11-13, #1800;
 * design #2263) — see `writersStudioStanding()` in betaAccessServer.ts. Works, revisions, identity and export are never
 * touched here.
 * NOT the Phase 1 purchase ledger: a beta grant is complimentary and owner-issued.
 */
import { query } from '@/lib/db/postgres';

export type BetaGrantMode = 'legacy' | 'transition' | 'dated';

export function betaGrantMode(env: Record<string, string | undefined> = process.env): BetaGrantMode {
  const v = env.WS_BETA_GRANT_MODE;
  return v === 'transition' || v === 'dated' ? v : 'legacy';
}

export type BetaGrantAction = 'grant' | 'extend' | 'revoke';

/**
 * Pure: is the member's latest grant event an active grant at `now`? Returns its expiry when active.
 *
 * `hasHistory` is true once the member has ANY dated-grant event. From then on the dated grant alone decides for them:
 * the legacy boolean can never re-admit someone whose grant was revoked or has expired (review on #2261 / #1800).
 */
export type BetaGrantDecision =
  | { active: true; expiresAt: Date; hasHistory: true }
  | { active: false; hasHistory: false }
  /** The grant ended: `expired` (its term ran out) or `revoked` (an owner revoked it). `endedAt` is when, if recorded. */
  | { active: false; hasHistory: true; ended: 'expired' | 'revoked'; endedAt: Date | null };

export function decideBetaGrant(
  latest: { action: BetaGrantAction; expires_at: Date | null; occurred_at?: Date | null } | null,
  now: Date = new Date(),
): BetaGrantDecision {
  if (!latest) return { active: false, hasHistory: false };
  if (latest.action === 'revoke') {
    return { active: false, hasHistory: true, ended: 'revoked', endedAt: latest.occurred_at ?? null };
  }
  // The table's CHECK requires an expiry on grant/extend; a missing one is read as already ended, never as open-ended.
  if (!latest.expires_at) return { active: false, hasHistory: true, ended: 'expired', endedAt: null };
  return latest.expires_at.getTime() > now.getTime()
    ? { active: true, expiresAt: latest.expires_at, hasHistory: true }
    : { active: false, hasHistory: true, ended: 'expired', endedAt: latest.expires_at };
}

/** Server read of the latest event. Throws on failure (the caller fails closed); never reads "no grant" from an outage. */
export async function activeBetaGrant(memberId: string, now: Date = new Date()) {
  const res = await query<{ action: BetaGrantAction; expires_at: Date | null; occurred_at: Date | null }>(
    `SELECT action, expires_at, occurred_at
       FROM writers_studio_beta_grant_events
      WHERE member_id = $1
      ORDER BY id DESC
      LIMIT 1`,
    [memberId],
  );
  return decideBetaGrant(res.rows[0] ?? null, now);
}
