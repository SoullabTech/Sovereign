/**
 * The bounded retention sweep for ABANDONED uploads (founder-approved 2026-11-03).
 *
 * WHAT IT REMOVES. An upload intent that never reached a recorded arrival (PENDING_BYTES, WRITING_BYTES, BYTES_VERIFIED), created at
 * least 24 hours ago, whose write lease has lapsed. Such an intent can never be claimed, never appears as a named upload, and holds
 * an encrypted file and the wrapped key that opens it. The member has had a day to finish it; nothing else will.
 *
 * WHAT IT NEVER TOUCHES.
 *   - a RECORDED arrival, claimed or not. Recorded-but-unclaimed uploads have a documented 24-hour retention design
 *     (20261022000002_writer_source_arrival_retention_index.sql) but deleting one on a timer would make a member's later
 *     "Create Work" fail while they are still reviewing, so it is NOT applied here and stays a separate decision. Claimed custody is
 *     never expired by anything.
 *   - an intent with a live write lease: another request may be mid-write.
 *   - anything younger than the floor. The floor is enforced HERE, not only in the script, so a caller bug cannot sweep everything.
 *
 * HOW. Every removal goes through `discardIncompleteLanding`, the same protocol a member's own removal uses (row lock, tombstone,
 * durable erasure obligation, R20 seal, destroy, clear), with one difference: the deletion is recorded as the retention sweep's act
 * (`governance`, authorized by the ruling), never as a member's request. All the locking and re-checks happen there, under the row
 * lock, so a race with a finishing upload resolves to `in_progress` or `already_recorded` and nothing is deleted.
 *
 * SAFE BY DEFAULT. A dry run is the default and deletes nothing. Output is content-free: counts, states, ages, a pseudonymous
 * member reference and the intent id. Never a filename, a path, a key, or an error message.
 *
 * NOT WIRED. Nothing runs this on a schedule. Putting it in a compose file or a cron is a deployment decision, and until that
 * is made the 24-hour promise is DESIGNED, not LIVE. No member-facing copy may claim it.
 */
import { query } from '@/lib/db/postgres';
import { memberRef } from '@/lib/privacy/memberRef';
import { discardIncompleteLanding, type DiscardIncompleteOutcome } from './discardIncompleteLanding';

export const SWEEP_MIN_AGE_HOURS = 24;
export const SWEEP_DEFAULT_LIMIT = 50;
export const SWEEP_MAX_LIMIT = 500;

export class SweepConfigError extends Error {
  constructor(readonly code: 'sweep_age_below_floor' | 'sweep_age_invalid' | 'sweep_limit_invalid') {
    super(code);
    this.name = 'SweepConfigError';
  }
}

export interface SweepCandidate {
  intentId: string;
  memberRef: string;
  state: string;
  ageHours: number;
}

export interface SweepReport {
  mode: 'dry_run' | 'applied';
  olderThanHours: number;
  limit: number;
  considered: number;
  byState: Record<string, number>;
  oldestAgeHours: number | null;
  candidates: SweepCandidate[];
  outcomes: Record<'discarded' | 'in_progress' | 'already_recorded' | 'not_found' | 'erasure_pending' | 'failed', number>;
}

export function validateSweepOptions(input: { olderThanHours?: unknown; limit?: unknown }): { olderThanHours: number; limit: number } {
  const olderThanHours = input.olderThanHours === undefined ? SWEEP_MIN_AGE_HOURS : input.olderThanHours;
  if (typeof olderThanHours !== 'number' || !Number.isInteger(olderThanHours)) throw new SweepConfigError('sweep_age_invalid');
  if (olderThanHours < SWEEP_MIN_AGE_HOURS) throw new SweepConfigError('sweep_age_below_floor');
  const limit = input.limit === undefined ? SWEEP_DEFAULT_LIMIT : input.limit;
  if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > SWEEP_MAX_LIMIT) throw new SweepConfigError('sweep_limit_invalid');
  return { olderThanHours, limit };
}

export async function sweepAbandonedLandings(
  input: { apply?: boolean; olderThanHours?: number; limit?: number } = {},
): Promise<SweepReport> {
  const { olderThanHours, limit } = validateSweepOptions(input);
  const apply = input.apply === true;

  const found = await query<{ id: string; member_id: string; state: string; age_hours: string | number }>(
    `SELECT id, member_id, state,
            EXTRACT(EPOCH FROM (clock_timestamp() - created_at)) / 3600 AS age_hours
       FROM writer_source_landing_intents
      WHERE state <> 'ARRIVAL_RECORDED'
        AND created_at < clock_timestamp() - make_interval(hours => $1::int)
        AND (lease_expires_at IS NULL OR lease_expires_at <= clock_timestamp())
      ORDER BY created_at, id
      LIMIT $2`,
    [olderThanHours, limit],
  );

  const candidates: SweepCandidate[] = found.rows.map((r) => ({
    intentId: r.id,
    memberRef: memberRef(r.member_id),
    state: r.state,
    ageHours: Math.floor(Number(r.age_hours)),
  }));
  const byState: Record<string, number> = {};
  for (const c of candidates) byState[c.state] = (byState[c.state] ?? 0) + 1;

  const outcomes: SweepReport['outcomes'] = { discarded: 0, in_progress: 0, already_recorded: 0, not_found: 0, erasure_pending: 0, failed: 0 };
  if (apply) {
    for (let i = 0; i < found.rows.length; i++) {
      const row = found.rows[i]!;
      try {
        const outcome: DiscardIncompleteOutcome = await discardIncompleteLanding(row.id, row.member_id, { authority: 'retention_sweep' });
        outcomes[outcome.kind] += 1;
      } catch (error) {
        // The error NAME only: the message can carry SQL text and parameters. One failure never stops the pass.
        outcomes.failed += 1;
        console.error('[MAIA/press] abandoned-upload sweep: one removal failed', { name: error instanceof Error ? error.name : 'unknown' });
      }
    }
  }

  return {
    mode: apply ? 'applied' : 'dry_run',
    olderThanHours,
    limit,
    considered: candidates.length,
    byState,
    oldestAgeHours: candidates.length ? Math.max(...candidates.map((c) => c.ageHours)) : null,
    candidates,
    outcomes,
  };
}
