/**
 * WS-TIERS-R2 — founder-specific, accepted Writer Studio pilot admission.
 * SQL always consults current membership/CRM and actual founder standing.
 * These operations DO NOT admit private manuscripts or open held R20 features.
 *
 * Product review only: DB-only revocation is NOT safe against old DB restores.
 * Do not activate write endpoints until independent revocation authority and
 * Class A/source rollback approval are available.
 */
import { query, transaction } from '@/lib/db/postgres';

export type WriterPilotApproval =
  | { eligible: true; basis: 'founder_approved_beta' | 'founder_witness' }
  | { eligible: false; basis: 'no_founder_approval' };

export async function readWriterPilotApproval(memberId: string): Promise<WriterPilotApproval> {
  const r = await query<{ founder: boolean; granted: boolean }>(
    `SELECT
       EXISTS (
         SELECT 1 FROM members m
         WHERE m.id = $1 AND m.admin_role = 'founder'
           AND EXISTS (
             SELECT 1 FROM writer_studio_pilot_admission_control a
             WHERE a.singleton = TRUE AND a.founder_member_id = m.id
           )
       ) AS founder,
       EXISTS (
         SELECT 1 FROM writer_studio_beta_grants g
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
       ) AS granted`,
    [memberId],
  );
  const row = r.rows[0];
  if (row?.founder === true) return { eligible: true, basis: 'founder_witness' };
  if (row?.granted === true) return { eligible: true, basis: 'founder_approved_beta' };
  return { eligible: false, basis: 'no_founder_approval' };
}

export async function approvePilotWriter(memberId: string, founderId: string): Promise<boolean> {
  return transaction(async (tx) => {
    // Serializes approvals across simultaneous requests. We deliberately
    // count revoked rows too: two original canary seats do not silently
    // replenish on revocation or create a rolling beta cohort.
    const gate = await tx.query<{ initial_seat_cap: number; founder_member_id: string | null }>(
      `SELECT initial_seat_cap, founder_member_id FROM writer_studio_pilot_admission_control
        WHERE singleton = TRUE FOR UPDATE`,
    );
    if (gate.rows[0]?.initial_seat_cap !== 2
      || gate.rows[0]?.founder_member_id !== founderId) return false;
    const count = await tx.query<{ n: number }>(
      `SELECT COUNT(*)::int AS n FROM writer_studio_beta_grants`,
    );
    if (!count.rows[0] || count.rows[0].n >= 2) return false;

    const r = await tx.query<{ member_id: string }>(
      `INSERT INTO writer_studio_beta_grants (member_id, approved_by)
       SELECT m.id, f.id
         FROM members m CROSS JOIN members f
        WHERE m.id = $1 AND f.id = $2 AND f.admin_role = 'founder'
          AND EXISTS (
            SELECT 1 FROM ops_contacts c
             WHERE c.member_id = m.id AND c.deleted_at IS NULL
               AND c.contact_type = 'beta_tester'
               AND c.pipeline_stage = 'active'
          )
       ON CONFLICT (member_id) DO NOTHING
       RETURNING member_id`,
      [memberId, founderId],
    );
    return r.rows.length === 1;
  });
}

/** Only the signed-in writer can accept their own already-approved invitation. */
export async function acceptPilotWriter(memberId: string): Promise<boolean> {
  const r = await query<{ member_id: string }>(
    `UPDATE writer_studio_beta_grants g
        SET grant_state = 'accepted', accepted_at = NOW()
      WHERE g.member_id = $1 AND g.grant_state = 'pending'
        AND (g.valid_until IS NULL OR g.valid_until > NOW())
        AND EXISTS (
          SELECT 1 FROM members f
           JOIN writer_studio_pilot_admission_control a
             ON a.singleton = TRUE AND a.founder_member_id = f.id
           WHERE f.id = g.approved_by AND f.admin_role = 'founder'
        )
        AND EXISTS (
          SELECT 1 FROM ops_contacts c
           WHERE c.member_id = g.member_id AND c.deleted_at IS NULL
             AND c.contact_type = 'beta_tester' AND c.pipeline_stage = 'active'
        )
      RETURNING g.member_id`,
    [memberId],
  );
  return r.rows.length === 1;
}

export async function revokePilotWriter(memberId: string, founderId: string): Promise<boolean> {
  const r = await query<{ member_id: string }>(
    `UPDATE writer_studio_beta_grants g
        SET grant_state = 'revoked', revoked_at = NOW(), revoked_by = $2
      WHERE g.member_id = $1 AND g.grant_state IN ('pending','accepted')
        AND EXISTS (
          SELECT 1 FROM members f
           JOIN writer_studio_pilot_admission_control a
             ON a.singleton = TRUE AND a.founder_member_id = f.id
           WHERE f.id = $2 AND f.admin_role = 'founder'
        )
      RETURNING g.member_id`,
    [memberId, founderId],
  );
  return r.rows.length === 1;
}
