import type { Pool, PoolClient } from 'pg';
import { EXPERIENCE_POLICY, parseExperienceSubmission, type ExperienceSubmission } from './contract';

type ReportRow = {
  id: string; activity: ExperienceSubmission['activity']; usefulness: ExperienceSubmission['usefulness'];
  invitation: string | null; submitted_at: Date; expires_at: Date;
};
export type ExperienceReceipt = {
  id: string; activity: ExperienceSubmission['activity']; usefulness: ExperienceSubmission['usefulness'];
  invitation: string | null; submittedAt: string; expiresAt: string; basis: 'member_reported';
};
export type SubmitResult =
  | { state: 'recorded' | 'recovered'; report: ExperienceReceipt }
  | { state: 'refused'; reason: 'invalid_submission' | 'not_available' | 'different_report' | 'report_already_held' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIELDS = 'id, activity, usefulness, invitation, submitted_at, expires_at';
const receipt = (row: ReportRow): ExperienceReceipt => ({
  id: row.id, activity: row.activity, usefulness: row.usefulness, invitation: row.invitation,
  submittedAt: row.submitted_at.toISOString(), expiresAt: row.expires_at.toISOString(), basis: 'member_reported',
});
const same = (row: ReportRow, input: ExperienceSubmission) => row.activity === input.activity
  && row.usefulness === input.usefulness && row.invitation === (input.invitation?.id ?? null);

/**
 * BUILD CANDIDATE: injected pool, no runtime singleton or member-facing caller.
 * A future authenticated route supplies the verified member; a client field never does.
 * Transactional database evidence is not proof of running cleanup or backup erasure.
 */
export function createExperienceStore(pool: Pool) {
  async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    let discard = false;
    try {
      await client.query('BEGIN');
      await client.query("SET LOCAL statement_timeout = '2500ms'");
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch { discard = true; }
      throw error;
    } finally { client.release(discard); }
  }
  async function held(client: PoolClient, memberId: string, id: string): Promise<ReportRow | null> {
    const result = await client.query<ReportRow>(
      `SELECT ${FIELDS} FROM constellation_experience_reports
       WHERE id = $1 AND member_id = $2 AND expires_at > clock_timestamp()`, [id, memberId]);
    return result.rows[0] ?? null;
  }
  function recover(row: ReportRow, input: ExperienceSubmission): SubmitResult {
    return same(row, input) ? { state: 'recovered', report: receipt(row) }
      : { state: 'refused', reason: 'different_report' };
  }
  return {
    /** Called only after the person deliberately chooses to begin, never from a page load. */
    async issue(memberId: string): Promise<{ id: string; expiresAt: string }> {
      if (!UUID.test(memberId)) throw new Error('Invalid verified member identity');
      return transaction(async client => {
        const result = await client.query<{ id: string; expires_at: Date }>(
          `INSERT INTO constellation_experience_opportunities(member_id, policy)
           VALUES ($1, $2) RETURNING id, expires_at`, [memberId, EXPERIENCE_POLICY]);
        const row = result.rows[0];
        if (!row) throw new Error('Opportunity was not recorded');
        return { id: row.id, expiresAt: row.expires_at.toISOString() };
      });
    },
    async submit(memberId: string, opportunityId: string, raw: unknown): Promise<SubmitResult> {
      const parsed = parseExperienceSubmission(raw);
      if (!parsed.ok) return { state: 'refused', reason: 'invalid_submission' };
      if (!UUID.test(memberId) || !UUID.test(opportunityId)) return { state: 'refused', reason: 'not_available' };
      const input = parsed.value;
      try {
        return await transaction(async (client): Promise<SubmitResult> => {
          const prior = await held(client, memberId, opportunityId);
          if (prior) return recover(prior, input);
          // The atomic mutation is the claim, not the earlier read.
          const claim = await client.query(
            `UPDATE constellation_experience_opportunities SET consumed_at = clock_timestamp()
             WHERE id = $1 AND member_id = $2 AND policy = $3
               AND consumed_at IS NULL AND expires_at > clock_timestamp() RETURNING id`,
            [opportunityId, memberId, EXPERIENCE_POLICY]);
          if (claim.rowCount !== 1) {
            // A concurrent winner may have committed while the UPDATE waited.
            const winner = await held(client, memberId, opportunityId);
            return winner ? recover(winner, input) : { state: 'refused', reason: 'not_available' };
          }
          const result = await client.query<ReportRow>(
            `INSERT INTO constellation_experience_reports
               (id, member_id, policy, agreement, activity, usefulness, invitation)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING ${FIELDS}`,
            [opportunityId, memberId, EXPERIENCE_POLICY, input.agreement, input.activity, input.usefulness, input.invitation?.id ?? null]);
          const row = result.rows[0];
          if (!row) throw new Error('Report was not recorded');
          return { state: 'recorded', report: receipt(row) };
        });
      } catch (error) {
        if ((error as { code?: string; constraint?: string }).code === '23505'
            && (error as { constraint?: string }).constraint === 'constellation_experience_reports_member_id_policy_key') {
          return { state: 'refused', reason: 'report_already_held' };
        }
        throw error; // No row data or error text is logged by this module.
      }
    },
    async read(memberId: string, id: string): Promise<ExperienceReceipt | null> {
      if (!UUID.test(memberId) || !UUID.test(id)) return null;
      return transaction(async client => {
        const row = await held(client, memberId, id);
        return row ? receipt(row) : null;
      });
    },
    async withdraw(memberId: string, id: string): Promise<{ state: 'removed' | 'not_held' }> {
      if (!UUID.test(memberId) || !UUID.test(id)) return { state: 'not_held' };
      return transaction(async client => {
        const result = await client.query(
          'DELETE FROM constellation_experience_reports WHERE id = $1 AND member_id = $2 RETURNING id', [id, memberId]);
        // Consumed opportunity survives until its own expiry. Deletion cannot rearm it.
        return { state: result.rowCount === 1 ? 'removed' : 'not_held' };
      });
    },
    /** Maintenance mechanism only. No scheduler or production invocation is installed here. */
    async purgeExpired(): Promise<{ reportsRemoved: number; opportunitiesRemoved: number }> {
      return transaction(async client => {
        const reports = await client.query('DELETE FROM constellation_experience_reports WHERE expires_at <= clock_timestamp()');
        const opportunities = await client.query('DELETE FROM constellation_experience_opportunities WHERE expires_at <= clock_timestamp()');
        return { reportsRemoved: reports.rowCount ?? 0, opportunitiesRemoved: opportunities.rowCount ?? 0 };
      });
    },
  };
}
