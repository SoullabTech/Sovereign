import { query } from '@/lib/db/postgres';

/**
 * SMALL-BETA-01 / B4 — server-side cohort membership.
 *
 * A query flag is presentation intent, never entitlement. The pilot consists of
 * active, member-linked founder-ops beta testers. Founder/CTO may enter for
 * witness/support without being represented as a beta tester.
 */
export type WritersStudioBetaAccess =
  | { eligible: true; basis: 'active_beta_tester' | 'founder_witness' }
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
       ) AS beta,
       EXISTS (
         SELECT 1 FROM members m
          WHERE m.id = $1 AND m.admin_role IN ('founder','cto')
       ) AS founder`,
    [memberId],
  );
  const row = result.rows[0];
  if (row?.founder) return { eligible: true, basis: 'founder_witness' };
  if (row?.beta) return { eligible: true, basis: 'active_beta_tester' };
  return { eligible: false, basis: 'not_in_pilot' };
}
