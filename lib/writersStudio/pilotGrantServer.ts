/**
 * Writer's Studio beta grant model — READ + FAIL-CLOSED public mutation seam.
 *
 * R9: NO exported app-server function here may mutate grant state. The R2/R3
 * raw SQL model was moved into scripts/writers-studio/r9-fixture and guarded
 * to fresh fictional loopback databases only, never a production import.
 *
 * The production-bound R20 authority remains UNPROVISIONED. A future
 * externally sealed mutation must use a separately accepted, privilege-
 * separated transactional implementation, not re-enable these helpers.
 */
import { query } from '@/lib/db/postgres';
import { PilotR20AuthorityUnavailable } from './pilotR20Authority';

export type WriterPilotApproval =
  | { eligible: true; basis: 'founder_approved_beta'; grantId: string }
  | { eligible: true; basis: 'founder_witness' }
  | { eligible: false; basis: 'no_founder_approval' };

export async function readWriterPilotApproval(memberId: string): Promise<WriterPilotApproval> {
  const r = await query<{ founder: boolean; grant_id: string | null }>(
    `SELECT
       EXISTS (
         SELECT 1 FROM members m
         WHERE m.id = $1 AND m.admin_role = 'founder'
           AND EXISTS (
             SELECT 1 FROM writer_studio_pilot_admission_control a
             WHERE a.singleton = TRUE AND a.founder_member_id = m.id
           )
       ) AS founder,
       (SELECT g.grant_id::text FROM writer_studio_beta_grants g
         JOIN members f ON f.id = g.approved_by
           AND f.admin_role = 'founder'
         JOIN writer_studio_pilot_admission_control a
           ON a.singleton = TRUE AND a.founder_member_id = f.id
         WHERE g.member_id = $1 AND g.grant_state = 'accepted'
           AND g.accepted_at IS NOT NULL AND g.revoked_at IS NULL
           AND (g.valid_until IS NULL OR g.valid_until > NOW())
           AND EXISTS (
             SELECT 1 FROM ops_contacts c
              WHERE c.member_id = g.member_id
                AND c.deleted_at IS NULL
                AND c.contact_type = 'beta_tester'
                AND c.pipeline_stage = 'active'
           )
         LIMIT 1) AS grant_id`,
    [memberId],
  );
  const row = r.rows[0];
  if (row?.founder === true) return { eligible: true, basis: 'founder_witness' };
  if (typeof row?.grant_id === 'string') return {
    eligible: true, basis: 'founder_approved_beta', grantId: row.grant_id,
  };
  return { eligible: false, basis: 'no_founder_approval' };
}

/**
 * Deprecated route-compatibility functions. No DB, transaction, feature
 * flag or injected signer can enable them. These are intentional safety
 * refusals until independent R20 Class A review admits a DIFFERENT path.
 */
export async function approvePilotWriter(
  _memberId: string, _founderId: string,
): Promise<boolean> {
  throw new PilotR20AuthorityUnavailable();
}

export async function acceptPilotWriter(_memberId: string): Promise<boolean> {
  throw new PilotR20AuthorityUnavailable();
}

export async function revokePilotWriter(
  _memberId: string, _founderId: string,
): Promise<boolean> {
  throw new PilotR20AuthorityUnavailable();
}
