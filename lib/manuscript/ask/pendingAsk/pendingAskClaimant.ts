/**
 * S3 · P1 — THE DURABLE PENDING-ASK CLAIMANT.
 *
 *   ⭐⭐ The atomicity is IN THE MUTATION. There is no SELECT that decides and
 *       no UPDATE that merely records what was decided.
 *
 * ⛔ THIS GRANTS NOTHING. Winning the claim earns the right to CONTINUE a resume.
 * The invocation still re-derives the body requirement and the required section
 * set, still receives the member's explicit present gesture, still establishes a
 * fresh disclosure boundary, and still mints `may_cross` inside itself.
 *
 * ── WHY THE CLAIM OWNS ITS OWN STATEMENT ───────────────────────────────────
 *
 * The claim is deliberately a SINGLE autocommit statement and is never run
 * inside a transaction the caller controls. ⭐ Under a caller's REPEATABLE READ
 * transaction a losing race raises a serialization failure, which ABORTS that
 * transaction — and truthful re-classification is then impossible from inside
 * it: every follow-up statement fails with 25P02 instead of answering
 * "was this consumed, expired, or unknown?".
 *
 *   ⛔ A correctly refused replay may not masquerade as server failure, and a
 *     genuine server failure may not masquerade as replay.
 *
 * So the claimant refuses to depend on an isolation level it does not choose,
 * and any concurrency fault it cannot truthfully classify becomes `unavailable`
 * — ⛔ never `already_consumed`.
 *
 * ⭐ MEASURED, NOT PREDICTED (PostgreSQL 16.13, disposable cluster, 2026-09-10).
 * Two REPEATABLE READ transactions racing one ref:
 *
 *   winner  → { kind: 'claimed', … }
 *   loser   → { kind: 'unavailable',
 *               reason: 'state could not be established after a concurrency fault' }
 *
 * The loser's 40001 aborts its transaction, so the follow-up classification
 * fails with 25P02 and the substrate genuinely cannot say who consumed the
 * resume. ⭐ Reporting that honestly is the point: the alternative — calling it
 * `already_consumed` — would assert a member fact the database never
 * established. Under the claimant's own autocommit statement (READ COMMITTED),
 * the same race produces one `claimed` and seven `already_consumed`, with zero
 * `unavailable`.
 */

import { query as canonicalQuery } from '@/lib/db/postgres';
import type {
  ClaimOutcome, PendingAskClaimant, PendingAskRef,
} from './claimContract';

/**
 * The statement seam. ⭐ Injected so an instrument can supply an explicit,
 * independent connection — ⛔ never so a different substrate can be substituted.
 */
export interface SqlExecutor {
  query<T = Record<string, unknown>>(
    sql: string, params?: unknown[],
  ): Promise<{ rows: T[]; rowCount: number | null }>;
}

const canonicalExecutor: SqlExecutor = {
  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []) {
    const r = await canonicalQuery(sql, params as any[]);
    return { rows: r.rows as T[], rowCount: r.rowCount };
  },
};

/**
 * ⭐ THE CLAIM. The predicate INCLUDES "still pending" — `consumed_at IS NULL`
 * — so exactly one caller can win. The same shape `consumeOAuthState` uses, for
 * the reason its own header gives: *"SELECT-then-UPDATE would leave a window
 * where a replayed callback races the original and both store tokens."*
 */
const CLAIM = `
  UPDATE pending_ask_claims
     SET consumed_at = now()
   WHERE ref = $1
     AND consumed_at IS NULL
     AND expires_at > now()
  RETURNING member_id, manuscript_id, thread_id, reading_id, observation_key`;

/** Why the claim did not win — read AFTER the mutation, never before it. */
const CLASSIFY = `
  SELECT consumed_at IS NOT NULL AS consumed,
         completed_at IS NOT NULL AS completed,
         expires_at <= now()      AS is_expired
    FROM pending_ask_claims
   WHERE ref = $1`;

const COMPLETE = `
  UPDATE pending_ask_claims
     SET completed_at = now()
   WHERE ref = $1 AND consumed_at IS NOT NULL AND completed_at IS NULL`;

type ClaimRow = {
  member_id: string; manuscript_id: string; thread_id: string;
  reading_id: string; observation_key: string;
};
type ClassifyRow = { consumed: boolean; completed: boolean; is_expired: boolean };

/** Serialization failure · deadlock · a transaction already aborted by one. */
const isConcurrencyFault = (e: unknown): boolean => {
  const code = (e as { code?: string } | null)?.code;
  return code === '40001' || code === '40P01' || code === '25P02';
};

export function createPendingAskClaimant(
  exec: SqlExecutor = canonicalExecutor,
): PendingAskClaimant {
  const classify = async (ref: PendingAskRef): Promise<ClaimOutcome> => {
    const r = await exec.query<ClassifyRow>(CLASSIFY, [ref]);
    const row = r.rows[0];
    if (!row) return { kind: 'unknown' };
    if (row.consumed) {
      return { kind: 'already_consumed', completion: row.completed ? 'completed' : 'incomplete' };
    }
    if (row.is_expired) return { kind: 'expired' };
    /* Still pending, yet the mutation matched nothing. ⛔ Do NOT invent a
       member-facing verdict for a state the substrate cannot explain. */
    return { kind: 'unavailable', reason: 'claim matched no row while the resume is still pending' };
  };

  return {
    async claim(ref: PendingAskRef): Promise<ClaimOutcome> {
      try {
        const claimed = await exec.query<ClaimRow>(CLAIM, [ref]);
        const row = claimed.rows[0];
        if (row) {
          return {
            kind: 'claimed',
            coordinates: {
              memberId: row.member_id, manuscriptId: row.manuscript_id,
              threadId: row.thread_id, readingId: row.reading_id,
              observationKey: row.observation_key,
            },
          };
        }
      } catch (err) {
        /* ⭐ A concurrency fault is a DATABASE fact, not proof that another
           request consumed this Ask. Return to a fresh view and establish the
           actual state; if even that cannot be read, say so truthfully. */
        if (!isConcurrencyFault(err)) {
          return { kind: 'unavailable', reason: 'claim statement failed' };
        }
        try {
          return await classify(ref);
        } catch {
          return { kind: 'unavailable', reason: 'state could not be established after a concurrency fault' };
        }
      }

      try {
        return await classify(ref);
      } catch {
        return { kind: 'unavailable', reason: 'state could not be established' };
      }
    },

    async recordCompleted(ref: PendingAskRef): Promise<void> {
      await exec.query(COMPLETE, [ref]);
    },
  };
}
