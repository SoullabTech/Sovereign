/**
 * Writer's Studio dated beta grants (founder rulings 2026-11-13, recorded on #1800).
 *
 * Replaces, in stages, the open-ended boolean `ops_contacts.metadata.writers_studio_beta`:
 *   'legacy'     (default) — today's boolean only; the grant table is never read.
 *   'transition'           — an active dated grant OR the legacy boolean admits. Used while every current tester is
 *                            issued a dated grant, so no one loses access mid-switch.
 *   'dated'                — only an active dated grant admits; the boolean is retired.
 * Any other value of WS_BETA_GRANT_MODE behaves as 'legacy'.
 *
 * Founder/CTO witness access is unchanged and never expires here. A grant admits until `expires_at`; expiry removes
 * Pro capabilities only — Works, revisions, identity and export are governed elsewhere and are never touched.
 * NOT the Phase 1 purchase ledger: a beta grant is complimentary and owner-issued.
 */
import { query } from '@/lib/db/postgres';

export type BetaGrantMode = 'legacy' | 'transition' | 'dated';

export function betaGrantMode(env: Record<string, string | undefined> = process.env): BetaGrantMode {
  const v = env.WS_BETA_GRANT_MODE;
  return v === 'transition' || v === 'dated' ? v : 'legacy';
}

export type BetaGrantAction = 'grant' | 'extend' | 'revoke';

/** Pure: is the member's latest grant event an active grant at `now`? Returns its expiry when active. */
export function decideBetaGrant(
  latest: { action: BetaGrantAction; expires_at: Date | null } | null,
  now: Date = new Date(),
): { active: true; expiresAt: Date } | { active: false } {
  if (!latest || latest.action === 'revoke' || !latest.expires_at) return { active: false };
  return latest.expires_at.getTime() > now.getTime() ? { active: true, expiresAt: latest.expires_at } : { active: false };
}

/** Server read of the latest event. Throws on failure (the caller fails closed); never reads "no grant" from an outage. */
export async function activeBetaGrant(memberId: string, now: Date = new Date()) {
  const res = await query<{ action: BetaGrantAction; expires_at: Date | null }>(
    `SELECT action, expires_at
       FROM writers_studio_beta_grant_events
      WHERE member_id = $1
      ORDER BY id DESC
      LIMIT 1`,
    [memberId],
  );
  return decideBetaGrant(res.rows[0] ?? null, now);
}
