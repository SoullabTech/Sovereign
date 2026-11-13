import { query } from '@/lib/db/postgres';
import { activeBetaGrant, betaGrantMode } from './betaGrants';

/**
 * SMALL-BETA-01 / B4 — server-side cohort membership.
 *
 * A query flag is presentation intent, never entitlement. The pilot consists of
 * active, member-linked founder-ops beta testers who are ALSO explicitly marked
 * for the Writer's Studio pilot (ops_contacts.metadata.writers_studio_beta = true).
 * Being a beta tester for another lane is not Writer's Studio admission; an
 * unmarked contact fails closed. Founder/CTO may enter for
 * witness/support without being represented as a beta tester.
 *
 * Dated beta grants (founder rulings 2026-11-13, #1800; lib/writersStudio/betaGrants.ts):
 * WS_BETA_GRANT_MODE chooses the source of beta standing.
 *   'legacy' (default) — the boolean above only. Exactly today's single query; the grant table is never read.
 *   'transition'       — an active dated grant OR the boolean. ⚠️ While here, revoking someone means revoking their
 *                        grant AND clearing their boolean.
 *   'dated'            — an active dated grant only; the boolean no longer admits.
 * A grant lookup failure throws (callers fail closed), never reads as "no grant".
 */
export type WritersStudioBetaAccess =
  | { eligible: true; basis: 'active_beta_tester' | 'founder_witness' }
  | { eligible: true; basis: 'dated_beta_grant'; expiresAt: string }
  | { eligible: false; basis: 'not_in_pilot' };

export async function writersStudioBetaAccess(memberId: string): Promise<WritersStudioBetaAccess> {
  const result = await query<{ beta: boolean; founder: boolean }>(
    `SELECT
       EXISTS (
         SELECT 1 FROM ops_contacts c
          WHERE c.member_id = $1
            AND c.deleted_at IS NULL
            AND c.contact_type = 'beta_tester'
            AND c.pipeline_stage = 'active'
            AND c.metadata @> '{"writers_studio_beta": true}'::jsonb
       ) AS beta,
       EXISTS (
         SELECT 1 FROM members m
          WHERE m.id = $1 AND m.admin_role IN ('founder','cto')
       ) AS founder`,
    [memberId],
  );
  const row = result.rows[0];
  if (row?.founder) return { eligible: true, basis: 'founder_witness' };

  const mode = betaGrantMode();
  if (mode !== 'legacy') {
    const grant = await activeBetaGrant(memberId);
    if (grant.active) return { eligible: true, basis: 'dated_beta_grant', expiresAt: grant.expiresAt.toISOString() };
    if (mode === 'dated') return { eligible: false, basis: 'not_in_pilot' };
  }

  if (row?.beta) return { eligible: true, basis: 'active_beta_tester' };
  return { eligible: false, basis: 'not_in_pilot' };
}
