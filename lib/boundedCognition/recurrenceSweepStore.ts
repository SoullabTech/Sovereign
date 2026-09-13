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
import { permitCrossing, type ExecutionJurisdiction, type ProtectionProvider } from './permission';
import { measureCurrency, type Currency } from './currency';
import {
  validateFrozenMaterial,
  type FrozenSectionProvider,
  type IntegrityRefusal,
} from './frozenSectionProvider';

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
  | 'scope_not_partitionable'
  | 'incomplete_partitions'
  | 'no_unfinished_partition'
  | 'partition_not_next'
  | 'partition_not_in_execution'
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
    // ONE DATABASE ACT. An interrupted two-statement version could leave a durable
    // execution with no frozen partition set, so the plan is derived in the same
    // statement that creates the execution — and fails with it.
    const { rows } = await db.query<ExecutionRow>(
      `WITH created AS (
         INSERT INTO recurrence_sweep_executions (commission_id, requested_by, max_attempts)
         VALUES ($1,$2,$3)
         RETURNING ${EXEC_COLS}
       ),
       plan AS (
         INSERT INTO recurrence_sweep_partitions (execution_id, ordinal, section_id)
         SELECT c.id, s.ord - 1, s.section_id
           FROM created c
           JOIN recurrence_sweep_commissions m ON m.id = c.commission_id
           CROSS JOIN LATERAL unnest(m.body_scope_section_ids) WITH ORDINALITY AS s(section_id, ord)
         RETURNING 1
       )
       SELECT ${EXEC_COLS}, (SELECT count(*) FROM plan) AS planned FROM created`,
      [commissionId, requestedBy, maxAttempts],
    );
    return { ok: true, value: rows[0] };
  } catch (e) {
    const code = (e as { code?: string }).code;
    const constraint = (e as { constraint?: string }).constraint;
    // A scope that cannot yield disjoint partitions refuses rather than being
    // silently deduplicated — that would change the frozen scope to obtain a plan.
    if (code === '23505' && constraint === 'recurrence_sweep_partitions_section_unique') {
      return { ok: false, refusal: 'scope_not_partitionable' };
    }
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
 * Liveness from the CURRENT claim incarnation only.
 *
 * ⭐ STEP 5: `claimed_by` alone is no longer sufficient ownership evidence. Once
 * expired-claim recovery exists, the SAME worker string can hold a LATER claim,
 * so every worker-owned operation must also match the attempt generation — the
 * ABA guard. `attempts` is that generation: a successful claim increments it
 * atomically, so the number returned by `claimNextExecution` identifies one claim
 * incarnation. No separate claim_token column is introduced.
 *
 * This records liveness truthfully; it reaps nothing.
 */
export async function heartbeat(
  db: Queryable,
  executionId: string,
  worker: string,
  expectedAttempt: number,
): Promise<StoreResult<ExecutionRow>> {
  const { rows } = await db.query<ExecutionRow>(
    `UPDATE recurrence_sweep_executions
        SET heartbeat_at = NOW()
      WHERE id = $1 AND status = 'running' AND claimed_by = $2 AND attempts = $3
      RETURNING ${EXEC_COLS}`,
    [executionId, worker, expectedAttempt],
  );
  if (rows[0]) return { ok: true, value: rows[0] };
  return { ok: false, refusal: 'not_claim_owner' };
}

async function terminate(
  db: Queryable,
  executionId: string,
  worker: string,
  expectedAttempt: number,
  status: 'completed' | 'failed',
): Promise<StoreResult<ExecutionRow>> {
  const { rows } = await db.query<ExecutionRow>(
    `UPDATE recurrence_sweep_executions
        SET status = $4, finished_at = NOW(),
            claimed_by = NULL, claimed_at = NULL, heartbeat_at = NULL
      WHERE id = $1 AND status = 'running' AND claimed_by = $2 AND attempts = $3
      RETURNING ${EXEC_COLS}`,
    [executionId, worker, expectedAttempt, status],
  );
  if (rows[0]) return { ok: true, value: rows[0] };
  return { ok: false, refusal: 'not_running' };
}

/**
 * Normal execution terminus against the frozen scope.
 *
 * ⭐ STEP 5 REPAIR: clears the current-claim fields — they describe the CURRENT
 * claim, and leaving them on a terminal row would widen them into "historical last
 * claim" by convenience (BCS-M1).
 *
 * ⭐ STEP 6 REFINEMENT: once a partitioned computation exists, completing with
 * unfinished partitions would make `completed` FALSE under its own predicate
 * ("reached its normal execution terminus against its frozen scope"). Normal
 * completion therefore requires every partition checkpointed. `failExecution` and
 * `observeCancellation` are non-normal terminal paths and keep no such condition.
 */
export async function completeExecution(
  db: Queryable,
  id: string,
  worker: string,
  attempt: number,
): Promise<StoreResult<ExecutionRow>> {
  const unfinished = await firstUnfinishedPartition(db, id);
  if (unfinished) return { ok: false, refusal: 'incomplete_partitions' };
  return terminate(db, id, worker, attempt, 'completed');
}

/** Terminated without its normal terminus, and not by an accepted cancellation. */
export const failExecution = (db: Queryable, id: string, worker: string, attempt: number) =>
  terminate(db, id, worker, attempt, 'failed');

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
  expectedAttempt: number,
): Promise<StoreResult<ExecutionRow>> {
  try {
    await client.query('BEGIN');
    const cur = await client.query<{ status: SweepStatus; claimed_by: string | null; attempts: number }>(
      `SELECT status, claimed_by, attempts FROM recurrence_sweep_executions WHERE id = $1 FOR UPDATE`,
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
    if (cur.rows[0].claimed_by !== worker || cur.rows[0].attempts !== expectedAttempt) {
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
          SET status = 'cancelled', finished_at = NOW(),
              claimed_by = NULL, claimed_at = NULL, heartbeat_at = NULL
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

/**
 * Invoke expired-claim recovery. The decision, the clock and the concurrency all
 * live in the database function; this is only the caller.
 *
 * Returns the number of executions whose claim was revoked — requeued where
 * attempts remain, failed where the budget is exhausted.
 */
export async function recoverExpiredClaims(
  db: Queryable,
  expiry: string,
): Promise<number> {
  const { rows } = await db.query<{ n: number }>(
    `SELECT fn_recover_expired_recurrence_sweep_claims($1::interval) AS n`,
    [expiry],
  );
  return Number(rows[0].n);
}

/* ── Step 6 · partitions and checkpoints ─────────────────────────────────── */

export interface PartitionRow {
  id: string;
  execution_id: string;
  ordinal: number;
  section_id: string;
}

/**
 * The earliest partition with no durable checkpoint. DERIVED, never stored: no
 * `progress`, no `last_completed_partition`, no `next_partition`, no
 * `completed_count`. The database already has the facts, and a second mutable
 * truth would drift from them.
 */
export async function firstUnfinishedPartition(
  db: Queryable,
  executionId: string,
): Promise<PartitionRow | null> {
  const { rows } = await db.query<PartitionRow>(
    `SELECT p.id, p.execution_id, p.ordinal, p.section_id
       FROM recurrence_sweep_partitions p
       LEFT JOIN recurrence_sweep_checkpoints c ON c.partition_id = p.id
      WHERE p.execution_id = $1 AND c.partition_id IS NULL
      ORDER BY p.ordinal
      LIMIT 1`,
    [executionId],
  );
  return rows[0] ?? null;
}

export async function listPartitions(
  db: Queryable,
  executionId: string,
): Promise<PartitionRow[]> {
  const { rows } = await db.query<PartitionRow>(
    `SELECT id, execution_id, ordinal, section_id FROM recurrence_sweep_partitions
      WHERE execution_id = $1 ORDER BY ordinal`,
    [executionId],
  );
  return rows;
}

/**
 * Record that one bounded execution unit completed.
 *
 * SERIALIZED AGAINST EXPIRED-CLAIM RECOVERY. The execution row is locked before
 * the claim is verified and the checkpoint inserted, so there is no lawful outcome
 * in which a checkpoint commits after the claim that authorized it was revoked.
 *
 * CLAIM GENERATION AUTHORIZES THE WRITE (Step 5): worker string equality is not
 * enough once reaping exists.
 *
 * PREFIX-SHAPED for this proving workload: only the earliest unfinished partition
 * may be checkpointed, which gives the charter geometry (completed 0…N, resume at
 * N+1) and stops a caller manufacturing progress by checkpointing a later unit.
 * ⛔ A proving-workload constraint, not a general law against future parallel
 * cognition — and success here does not authorize it.
 */
/**
 * Record that one bounded execution unit completed, TOGETHER WITH the frozen input
 * supplied to it. One transaction: both commit, or neither does.
 *
 * ⛔ THERE IS NO EXPORTED CHECKPOINT-WITHOUT-LINEAGE PATH (Step 7 §13). The bare
 * insert is not factored out as a public seam, because an external caller able to
 * reach it could create a checkpoint whose frozen input is unrecoverable.
 *
 * SERIALIZED AGAINST EXPIRED-CLAIM RECOVERY: the execution row is locked before the
 * claim is verified, so no checkpoint can commit after the claim that authorized it
 * was revoked.
 *
 * CLAIM GENERATION AUTHORIZES THE WRITE (Step 5): worker equality is not enough
 * once reaping exists.
 *
 * PREFIX-SHAPED: only the earliest unfinished partition may be checkpointed.
 */
export interface FrozenInputRecord {
  readonly rangeStart: number;
  readonly rangeEnd: number;
  readonly frozenDigest: string;
}

export async function recordCheckpointWithInputs(
  client: PoolClient,
  executionId: string,
  partitionId: string,
  worker: string,
  expectedAttempt: number,
  inputs: FrozenInputRecord,
): Promise<StoreResult<{ partitionId: string }>> {
  try {
    await client.query('BEGIN');
    const cur = await client.query<{ status: SweepStatus; claimed_by: string | null; attempts: number }>(
      `SELECT status, claimed_by, attempts FROM recurrence_sweep_executions
        WHERE id = $1 FOR UPDATE`,
      [executionId],
    );
    if (!cur.rows[0]) {
      await client.query('ROLLBACK');
      return { ok: false, refusal: 'execution_not_found' };
    }
    const e = cur.rows[0];
    if (e.status !== 'running') {
      await client.query('ROLLBACK');
      return { ok: false, refusal: 'not_running' };
    }
    if (e.claimed_by !== worker || e.attempts !== expectedAttempt) {
      await client.query('ROLLBACK');
      return { ok: false, refusal: 'not_claim_owner' };
    }

    const next = await client.query<PartitionRow>(
      `SELECT p.id, p.execution_id, p.ordinal, p.section_id
         FROM recurrence_sweep_partitions p
         LEFT JOIN recurrence_sweep_checkpoints c ON c.partition_id = p.id
        WHERE p.execution_id = $1 AND c.partition_id IS NULL
        ORDER BY p.ordinal LIMIT 1`,
      [executionId],
    );
    if (!next.rows[0]) {
      await client.query('ROLLBACK');
      return { ok: false, refusal: 'no_unfinished_partition' };
    }
    if (next.rows[0].id !== partitionId) {
      await client.query('ROLLBACK');
      const owned = await client.query(
        `SELECT 1 FROM recurrence_sweep_partitions WHERE id = $1 AND execution_id = $2`,
        [partitionId, executionId],
      );
      return {
        ok: false,
        refusal: owned.rowCount === 0 ? 'partition_not_in_execution' : 'partition_not_next',
      };
    }

    await client.query(
      `INSERT INTO recurrence_sweep_checkpoints (partition_id) VALUES ($1)`,
      [partitionId],
    );
    // Same transaction. A lineage failure rolls the checkpoint back with it.
    await client.query(
      `INSERT INTO recurrence_sweep_checkpoint_inputs
         (partition_id, range_start, range_end, frozen_digest)
       VALUES ($1,$2,$3,$4)`,
      [partitionId, inputs.rangeStart, inputs.rangeEnd, inputs.frozenDigest],
    );
    await client.query('COMMIT');
    return { ok: true, value: { partitionId } };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

/**
 * What a partition processor is given: partition identity and EPHEMERAL frozen
 * text. It returns no cognition — no observation, no occurrence set, no model call,
 * no classifier. Step 7 proves only that exact frozen material crossed into the
 * successful computation.
 */
export type PartitionProcessor = (
  partition: PartitionRow,
  frozenText: string,
) => Promise<void>;

export type MaterialRefusal =
  | StoreRefusal
  | IntegrityRefusal
  | 'refused_by_frozen_ceiling'
  | 'refused_by_current_protection';

/**
 * Perform ONE execution unit against real frozen Work material, then checkpoint it
 * together with its frozen input lineage.
 *
 * ORDER IS THE LAW HERE:
 *   1 verify the current claim incarnation      (Step 5 fencing reaches material custody)
 *   2 resolve authority FROM THE COMMISSION     (never an execution-side copy)
 *   3 permitCrossing BEFORE acquisition         (a refusal means the provider is never called)
 *   4 acquire · 5 validate integrity · 6 process · 7 checkpoint + lineage atomically
 *
 * A refusal at 1–3 leaves provider call count at zero: the material was never
 * acquired, not acquired and discarded.
 */
export async function runFrozenSweepPartition(
  client: PoolClient,
  executionId: string,
  worker: string,
  expectedAttempt: number,
  requested: ExecutionJurisdiction,
  protection: ProtectionProvider,
  provider: FrozenSectionProvider,
  process: PartitionProcessor,
): Promise<StoreResult<{ partition: PartitionRow }> | { ok: false; refusal: MaterialRefusal }> {
  const { rows } = await client.query<{
    status: SweepStatus; claimed_by: string | null; attempts: number;
    commission_id: string; draft_id: string; revision_number: number;
    revision_digest: string; max_jurisdiction: ExecutionJurisdiction;
  }>(
    `SELECT e.status, e.claimed_by, e.attempts, e.commission_id,
            m.draft_id, m.revision_number, m.revision_digest, m.max_jurisdiction
       FROM recurrence_sweep_executions e
       JOIN recurrence_sweep_commissions m ON m.id = e.commission_id
      WHERE e.id = $1`,
    [executionId],
  );
  if (!rows[0]) return { ok: false, refusal: 'execution_not_found' };
  const row = rows[0];

  if (row.status !== 'running') return { ok: false, refusal: 'not_running' };
  if (row.claimed_by !== worker || row.attempts !== expectedAttempt) {
    return { ok: false, refusal: 'not_claim_owner' };
  }

  // Authority follows commission_id. There is no execution-side copy to read.
  const verdict = permitCrossing(
    requested,
    { commissionId: row.commission_id, maxJurisdiction: row.max_jurisdiction },
    protection,
  );
  if (!verdict.ok) return { ok: false, refusal: verdict.refusal };

  const next = await firstUnfinishedPartition(client as unknown as Queryable, executionId);
  if (!next) return { ok: false, refusal: 'no_unfinished_partition' };

  const material = await provider.acquire({
    draftId: row.draft_id,
    revisionNumber: row.revision_number,
    sectionId: next.section_id,
  });

  const integrity = validateFrozenMaterial(
    material,
    { draftId: row.draft_id, revisionNumber: row.revision_number, revisionDigest: row.revision_digest },
    next.section_id,
  );
  if (!integrity.ok) return { ok: false, refusal: integrity.refusal };

  await process(next, material.text); // throws → no checkpoint, no lineage

  const cp = await recordCheckpointWithInputs(client, executionId, next.id, worker, expectedAttempt, {
    rangeStart: material.state.range.start,
    rangeEnd: material.state.range.end,
    frozenDigest: material.state.digest,
  });
  if (!cp.ok) return cp;
  return { ok: true, value: { partition: next } };
}

/* ── typed lineage loader ─────────────────────────────────────────────────── */

export interface FrozenSectionLineage {
  evidenceRef: { kind: 'section'; sectionId: string };
  manuscriptId: string;
  draftId: string;
  revisionNumber: number;
  revisionDigest: string;
  range: { start: number; end: number };
  frozenDigest: string;
}

/**
 * Reconstruct the exact relation for one checkpoint. Every identity resolves
 * through checkpoint → partition → execution → commission; none is duplicated on
 * the lineage row. ⛔ No prose, no authority, no causal language.
 */
export async function loadCheckpointLineage(
  db: Queryable,
  partitionId: string,
): Promise<FrozenSectionLineage | null> {
  const { rows } = await db.query<{
    section_id: string; manuscript_id: string; draft_id: string;
    revision_number: number; revision_digest: string;
    range_start: number; range_end: number; frozen_digest: string;
  }>(
    `SELECT p.section_id, m.manuscript_id, m.draft_id, m.revision_number, m.revision_digest,
            i.range_start, i.range_end, i.frozen_digest
       FROM recurrence_sweep_checkpoint_inputs i
       JOIN recurrence_sweep_partitions p  ON p.id = i.partition_id
       JOIN recurrence_sweep_executions e  ON e.id = p.execution_id
       JOIN recurrence_sweep_commissions m ON m.id = e.commission_id
      WHERE i.partition_id = $1`,
    [partitionId],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    evidenceRef: { kind: 'section', sectionId: r.section_id },
    manuscriptId: r.manuscript_id,
    draftId: r.draft_id,
    revisionNumber: r.revision_number,
    revisionDigest: r.revision_digest,
    range: { start: r.range_start, end: r.range_end },
    frozenDigest: r.frozen_digest,
  };
}

/**
 * Currency of one checkpoint's frozen input against the Work AS IT IS NOW.
 *
 * ⭐ DERIVED, NEVER STORED — no currency/stale/is_current column exists, so nothing
 * can drift from the Work. Reuses the Step-2 three-state rule rather than
 * re-deriving it.
 *
 * ⛔ Measuring changes nothing: no lifecycle transition, no requeue, no enqueue.
 * Staleness is a reason to recompute, never permission (FR-J9 §10).
 */
export async function measureCheckpointInputCurrency(
  db: Queryable,
  partitionId: string,
  currentDigest: (sectionId: string) => string | null,
): Promise<Currency> {
  const lineage = await loadCheckpointLineage(db, partitionId);
  if (!lineage) return 'unmeasured';
  return measureCurrency(
    [{ evidenceRef: lineage.evidenceRef.sectionId, frozenDigest: lineage.frozenDigest }],
    currentDigest,
  );
}
