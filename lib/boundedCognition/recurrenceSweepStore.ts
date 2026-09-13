/**
 * BCS-01A · Step 4 — minimum durable execution.
 *
 * Mechanics borrowed from the media-job precedent; MEANING borrowed from BCS-01A.
 * Every operation here has a predicate stated in the Step-1 preflight and the
 * Step-4 act; nothing persists a responsibility a later step has not earned.
 *
 * TWO ACTS, NEVER COLLAPSED. Creating a commission and enqueueing an execution
 * are separate calls, so the frozen commission is independently observable (P1)
 * and the one-shot gate exists before any queue mechanic runs.
 *
 * NOT PERSISTED, DELIBERATELY: `consumed` (the execution's existence is the fact),
 * `authorization_basis` prose (the commission reference is the basis), current or
 * effective permission (evaluated at the act), coverage, checkpoints, outputs,
 * lineage, currency, producer.
 */

import type { PoolClient, QueryResultRow } from 'pg';

export type Jurisdiction = 'sovereign' | 'external';
export type SweepStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

/** Anything that can run a parameterised query — a pool, a client, a transaction. */
export interface Queryable {
  query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: R[]; rowCount: number | null }>;
}

export interface NewCommission {
  memberId: string;
  manuscriptId: string;
  draftId: string;
  revisionNumber: number;
  revisionDigest: string;
  /** AUTHORIZED to read. Never coverage. */
  bodyScopeSectionIds: readonly string[];
  scopeFingerprint: string;
  maxJurisdiction: Jurisdiction;
}

export interface CommissionRow {
  id: string;
  member_id: string;
  manuscript_id: string;
  draft_id: string;
  revision_number: number;
  revision_digest: string;
  body_scope_section_ids: string[];
  scope_fingerprint: string;
  max_jurisdiction: Jurisdiction;
  commissioned_at: Date;
}

export interface ExecutionRow {
  id: string;
  commission_id: string;
  status: SweepStatus;
  attempts: number;
  max_attempts: number;
  requested_by: string;
  claimed_by: string | null;
  claimed_at: Date | null;
  heartbeat_at: Date | null;
  queued_at: Date;
  finished_at: Date | null;
}

export type StoreRefusal =
  | 'commission_already_executed'
  | 'commission_not_found'
  | 'execution_not_found'
  | 'not_running'
  | 'not_claim_owner'
  | 'already_terminal'
  | 'no_cancel_request';

export type StoreResult<T> = { ok: true; value: T } | { ok: false; refusal: StoreRefusal };

const COMMISSION_COLS = `id, member_id, manuscript_id, draft_id, revision_number, revision_digest,
  body_scope_section_ids, scope_fingerprint, max_jurisdiction, commissioned_at`;

const EXEC_COLS = `id, commission_id, status, attempts, max_attempts, requested_by,
  claimed_by, claimed_at, heartbeat_at, queued_at, finished_at`;

/** ACT ONE — the authorization. No execution is created here. */
export async function createCommission(
  db: Queryable,
  c: NewCommission,
): Promise<CommissionRow> {
  const { rows } = await db.query<CommissionRow>(
    `INSERT INTO recurrence_sweep_commissions
       (member_id, manuscript_id, draft_id, revision_number, revision_digest,
        body_scope_section_ids, scope_fingerprint, max_jurisdiction)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING ${COMMISSION_COLS}`,
    [
      c.memberId,
      c.manuscriptId,
      c.draftId,
      c.revisionNumber,
      c.revisionDigest,
      c.bodyScopeSectionIds,
      c.scopeFingerprint,
      c.maxJurisdiction,
    ],
  );
  return rows[0];
}

export async function loadCommission(
  db: Queryable,
  commissionId: string,
): Promise<CommissionRow | null> {
  const { rows } = await db.query<CommissionRow>(
    `SELECT ${COMMISSION_COLS} FROM recurrence_sweep_commissions WHERE id = $1`,
    [commissionId],
  );
  return rows[0] ?? null;
}

/** True iff no execution has ever been created against this commission. */
export async function commissionIsUnconsumed(
  db: Queryable,
  commissionId: string,
): Promise<boolean> {
  const { rows } = await db.query<{ n: string }>(
    `SELECT count(*)::text AS n FROM recurrence_sweep_executions WHERE commission_id = $1`,
    [commissionId],
  );
  return rows[0].n === '0';
}

/**
 * ACT TWO — the explicit execution request.
 *
 * One-shot is enforced by the UNIQUE constraint, not by reading a flag first: a
 * check-then-insert could be lost to a concurrent second request. The violation
 * is translated truthfully rather than surfaced as a raw database error.
 */
export async function enqueueExecution(
  db: Queryable,
  commissionId: string,
  requestedBy: string,
  maxAttempts = 3,
): Promise<StoreResult<ExecutionRow>> {
  try {
    const { rows } = await db.query<ExecutionRow>(
      `INSERT INTO recurrence_sweep_executions (commission_id, requested_by, max_attempts)
       VALUES ($1,$2,$3)
       RETURNING ${EXEC_COLS}`,
      [commissionId, requestedBy, maxAttempts],
    );
    return { ok: true, value: rows[0] };
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === '23505') return { ok: false, refusal: 'commission_already_executed' };
    if (code === '23503') return { ok: false, refusal: 'commission_not_found' };
    throw e;
  }
}

/**
 * Claim exactly one eligible execution. The database owns concurrency:
 * FOR UPDATE SKIP LOCKED, the proven pattern.
 *
 * No `depends_on` logic — this workload has no execution dependency. No priority
 * ordering — none has been earned. FIFO by queued_at.
 */
export async function claimNextExecution(
  db: Queryable,
  worker: string,
): Promise<ExecutionRow | null> {
  const { rows } = await db.query<ExecutionRow>(
    `WITH picked AS (
       SELECT id FROM recurrence_sweep_executions
       WHERE status = 'queued' AND attempts < max_attempts
       ORDER BY queued_at ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED
     )
     UPDATE recurrence_sweep_executions e
        SET status = 'running',
            attempts = e.attempts + 1,
            claimed_by = $1,
            claimed_at = NOW(),
            heartbeat_at = NOW()
       FROM picked
      WHERE e.id = picked.id
      RETURNING ${EXEC_COLS.split(',').map((c) => `e.${c.trim()}`).join(', ')}`,
    [worker],
  );
  return rows[0] ?? null;
}

/**
 * Liveness from the CURRENT claimant only. A different worker may not refresh
 * another's claim, and a terminal execution may not heartbeat.
 *
 * This records liveness truthfully; it reaps nothing. Crash recovery is the next
 * responsibility and is not smuggled in here.
 */
export async function heartbeat(
  db: Queryable,
  executionId: string,
  worker: string,
): Promise<StoreResult<ExecutionRow>> {
  const { rows } = await db.query<ExecutionRow>(
    `UPDATE recurrence_sweep_executions
        SET heartbeat_at = NOW()
      WHERE id = $1 AND status = 'running' AND claimed_by = $2
      RETURNING ${EXEC_COLS}`,
    [executionId, worker],
  );
  if (rows[0]) return { ok: true, value: rows[0] };
  return { ok: false, refusal: 'not_claim_owner' };
}

async function terminate(
  db: Queryable,
  executionId: string,
  worker: string,
  status: 'completed' | 'failed',
): Promise<StoreResult<ExecutionRow>> {
  const { rows } = await db.query<ExecutionRow>(
    `UPDATE recurrence_sweep_executions
        SET status = $3, finished_at = NOW()
      WHERE id = $1 AND status = 'running' AND claimed_by = $2
      RETURNING ${EXEC_COLS}`,
    [executionId, worker, status],
  );
  if (rows[0]) return { ok: true, value: rows[0] };
  return { ok: false, refusal: 'not_running' };
}

/** Normal execution terminus against the frozen scope. */
export const completeExecution = (db: Queryable, id: string, worker: string) =>
  terminate(db, id, worker, 'completed');

/** Terminated without its normal terminus, and not by an accepted cancellation. */
export const failExecution = (db: Queryable, id: string, worker: string) =>
  terminate(db, id, worker, 'failed');

export interface CancelRequestInput {
  requestedBy: string;
  authority: string;
  reason?: string;
}

/**
 * The ACT. Records who/when/under what authority and leaves the execution's
 * status untouched — a written request is never sufficient to claim `cancelled`.
 * A terminal execution refuses it: a completed execution cannot be retroactively
 * cancelled (withdrawal of completed outputs is a separate, undecided matter).
 */
export async function recordCancelRequest(
  client: PoolClient,
  executionId: string,
  req: CancelRequestInput,
): Promise<StoreResult<{ requestId: string; status: SweepStatus }>> {
  try {
    await client.query('BEGIN');
    const { rows } = await client.query<{ status: SweepStatus }>(
      `SELECT status FROM recurrence_sweep_executions WHERE id = $1 FOR UPDATE`,
      [executionId],
    );
    if (!rows[0]) {
      await client.query('ROLLBACK');
      return { ok: false, refusal: 'execution_not_found' };
    }
    if (['completed', 'failed', 'cancelled'].includes(rows[0].status)) {
      await client.query('ROLLBACK');
      return { ok: false, refusal: 'already_terminal' };
    }
    const ins = await client.query<{ id: string }>(
      `INSERT INTO recurrence_sweep_cancel_requests (execution_id, requested_by, authority, reason)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [executionId, req.requestedBy, req.authority, req.reason ?? null],
    );
    await client.query('COMMIT');
    // status deliberately returned unchanged — the interval is the point.
    return { ok: true, value: { requestId: ins.rows[0].id, status: rows[0].status } };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
}

/**
 * The FACT. Only the execution path, holding the claim and observing an accepted
 * request, may move `running` → `cancelled`.
 */
export async function observeCancellation(
  client: PoolClient,
  executionId: string,
  worker: string,
): Promise<StoreResult<ExecutionRow>> {
  try {
    await client.query('BEGIN');
    const cur = await client.query<{ status: SweepStatus; claimed_by: string | null }>(
      `SELECT status, claimed_by FROM recurrence_sweep_executions WHERE id = $1 FOR UPDATE`,
      [executionId],
    );
    if (!cur.rows[0]) {
      await client.query('ROLLBACK');
      return { ok: false, refusal: 'execution_not_found' };
    }
    if (cur.rows[0].status !== 'running') {
      await client.query('ROLLBACK');
      return { ok: false, refusal: cur.rows[0].status === 'queued' ? 'not_running' : 'already_terminal' };
    }
    if (cur.rows[0].claimed_by !== worker) {
      await client.query('ROLLBACK');
      return { ok: false, refusal: 'not_claim_owner' };
    }
    const req = await client.query(
      `SELECT 1 FROM recurrence_sweep_cancel_requests WHERE execution_id = $1`,
      [executionId],
    );
    if (req.rowCount === 0) {
      await client.query('ROLLBACK');
      return { ok: false, refusal: 'no_cancel_request' };
    }
    const upd = await client.query<ExecutionRow>(
      `UPDATE recurrence_sweep_executions
          SET status = 'cancelled', finished_at = NOW()
        WHERE id = $1
        RETURNING ${EXEC_COLS}`,
      [executionId],
    );
    await client.query('COMMIT');
    return { ok: true, value: upd.rows[0] };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
}

export async function loadExecution(
  db: Queryable,
  executionId: string,
): Promise<ExecutionRow | null> {
  const { rows } = await db.query<ExecutionRow>(
    `SELECT ${EXEC_COLS} FROM recurrence_sweep_executions WHERE id = $1`,
    [executionId],
  );
  return rows[0] ?? null;
}
