#!/usr/bin/env tsx
/**
 * MEDIA STUDIO: Processing Worker
 *
 * Drains the media_jobs queue and runs processing pipeline.
 * Uses FOR UPDATE SKIP LOCKED with dependency chain resolution.
 *
 * Usage:
 *   npx tsx scripts/run-media-worker.ts
 *
 * Same pattern as run-comms-analysis-worker.ts.
 */

import os from 'node:os';
import { query, queryOne, closePool } from '../lib/db/postgres';
import { PROCESSORS } from '../lib/media/processors';
import type { MediaJobRow } from '../lib/media/types';
import { sweepVaultErasureQueue } from '../lib/manuscript/source/eraseManuscript';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 1500;
const MAX_CONSECUTIVE_ERRORS = 10;
const WORKER_ID = `media:${os.hostname()}:${process.pid}`;
const REAPER_EVERY_N_LOOPS = 60;
const STALE_AFTER = '10 minutes';

/* WS-DELETE-01: ~every 90s at a 1500ms poll. Erasure is owed, not urgent — the
   obligation is durable, so a slow cadence costs nothing and keeps an idle
   worker from querying the queue every poll. Overridable ONLY so the erasure
   witness can prove autonomous invocation in seconds instead of minutes; the
   production default is the constant. */
const VAULT_ERASURE_EVERY_N_LOOPS = Math.max(
  1,
  Number(process.env.VAULT_ERASURE_EVERY_N_LOOPS) || 60,
);

// ─────────────────────────────────────────────────────────────────────────────
// JOB PROCESSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Claim the next available job, respecting dependency chains.
 * A job is claimable only if it has no depends_on, or its dependency is done.
 */
async function claimNextJob(): Promise<MediaJobRow | null> {
  const result = await queryOne<MediaJobRow>(
    `UPDATE media_jobs
     SET status = 'processing',
         attempts = attempts + 1,
         started_at = NOW(),
         claimed_by = $1,
         claimed_at = NOW(),
         heartbeat_at = NOW()
     WHERE id = (
       SELECT id FROM media_jobs
       WHERE status = 'queued'
         AND attempts < max_attempts
         AND (depends_on IS NULL
              OR depends_on IN (SELECT id FROM media_jobs WHERE status = 'done'))
       ORDER BY priority ASC, queued_at ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED
     )
     RETURNING *`,
    [WORKER_ID]
  );
  return result;
}

async function markJobDone(jobId: string): Promise<void> {
  await query(
    `UPDATE media_jobs SET status = 'done', finished_at = NOW() WHERE id = $1`,
    [jobId]
  );
}

async function markJobFailed(jobId: string, error: unknown): Promise<void> {
  const errorMsg = error instanceof Error ? error.message : String(error);
  await query(
    `UPDATE media_jobs SET status = 'failed', last_error = $2, finished_at = NOW() WHERE id = $1`,
    [jobId, errorMsg.slice(0, 4000)]
  );
}

async function markJobSkipped(jobId: string, reason: string): Promise<void> {
  await query(
    `UPDATE media_jobs SET status = 'skipped', last_error = $2, finished_at = NOW() WHERE id = $1`,
    [jobId, reason]
  );
}

/**
 * When a critical job fails, skip all downstream dependent jobs
 * and mark the project as errored.
 */
async function handleCriticalFailure(job: MediaJobRow): Promise<void> {
  // Skip all jobs that depend on this one (directly or transitively)
  await query(
    `WITH RECURSIVE deps AS (
       SELECT id FROM media_jobs WHERE depends_on = $1 AND status = 'queued'
       UNION ALL
       SELECT mj.id FROM media_jobs mj JOIN deps d ON mj.depends_on = d.id WHERE mj.status = 'queued'
     )
     UPDATE media_jobs SET status = 'skipped', last_error = 'upstream_critical_failure', finished_at = NOW()
     WHERE id IN (SELECT id FROM deps)`,
    [job.id]
  );

  // Mark project as error
  await query(
    `UPDATE media_projects SET status = 'error', updated_at = NOW() WHERE id = $1`,
    [job.project_id]
  );

  console.log(`[MediaWorker] Critical failure on ${job.job_type} — skipped downstream jobs, project marked error`);
}

/**
 * Check if all jobs for a project are complete and update project status.
 */
async function checkProjectCompletion(projectId: string): Promise<void> {
  const result = await query(
    `SELECT
       COUNT(*) FILTER (WHERE status IN ('done', 'skipped')) as completed,
       COUNT(*) as total,
       COUNT(*) FILTER (WHERE status = 'failed' AND is_critical) as critical_failures
     FROM media_jobs WHERE project_id = $1`,
    [projectId]
  );

  const row = result.rows[0];
  if (parseInt(row.critical_failures) > 0) {
    // Already handled by handleCriticalFailure
    return;
  }

  if (parseInt(row.completed) === parseInt(row.total)) {
    await query(
      `UPDATE media_projects SET status = 'ready', updated_at = NOW() WHERE id = $1 AND status = 'processing'`,
      [projectId]
    );
    console.log(`[MediaWorker] Project ${projectId} — all jobs complete, status → ready`);
  }
}

async function updateHeartbeat(jobId: string): Promise<void> {
  await query(
    'UPDATE media_jobs SET heartbeat_at = NOW() WHERE id = $1',
    [jobId]
  );
}

/**
 * Process a single job.
 */
async function processJob(job: MediaJobRow): Promise<void> {
  console.log(`[MediaWorker] Processing ${job.job_type} for project ${job.project_id} (attempt ${job.attempts})`);

  const processor = PROCESSORS[job.job_type];
  if (!processor) {
    await markJobFailed(job.id, `Unknown job type: ${job.job_type}`);
    return;
  }

  // Set up heartbeat interval
  const heartbeatInterval = setInterval(() => {
    updateHeartbeat(job.id).catch(() => {});
  }, 30_000);

  try {
    await processor(job);
    await markJobDone(job.id);
    console.log(`[MediaWorker] ${job.job_type} done for ${job.project_id}`);
  } catch (error) {
    console.error(`[MediaWorker] ${job.job_type} failed:`, error);
    await markJobFailed(job.id, error);

    if (job.is_critical) {
      await handleCriticalFailure(job);
    }

    throw error;
  } finally {
    clearInterval(heartbeatInterval);
    // Check if project is complete after each job
    await checkProjectCompletion(job.project_id);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VAULT ERASURE OBLIGATIONS  (WS-DELETE-01)
//
// A SECOND, INDEPENDENT CONCERN sharing this worker's poll loop — not part of
// media processing, and deliberately not entangled with it.
//
// Why here (founder ruling, 2026-09-07): a member's Delete commits its rows and
// then owes the destruction of vault bytes. If that destruction fails, the
// obligation is durable but inert unless something returns for it. The inline
// sweep in the originating request cannot be that something — if it failed, it
// has already returned. Without an independent consumer that runs on its own,
// bytes stay retained behind a queue row that is permanently truthful and
// permanently unread.
//
// Why THIS worker: vault erasure is a storage/artifact lifecycle concern, and of
// the existing production triggers this one has the closest failure domain —
// durable work concerning stored bytes. It is hosted here rather than in a new
// scheduler because no new scheduling subsystem was warranted to solve a problem
// this narrow. It is NOT in the comms worker: someone could reasonably disable or
// replace communications processing some day and unknowingly disable erasure
// reconciliation along with it.
//
// The queue remains the canonical obligation. This worker is ONLY a consumer: it
// cannot decide that something should be erased, only carry out what a committed
// transaction already decided. Running it more often is never more destructive.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attempt the owed erasures. Never throws, and never touches the media error
 * budget — a vault that cannot be cleared is an operator problem, not a reason
 * to stop draining media jobs.
 *
 * Logs counts only. The queue holds a vault path and an errno by construction —
 * no member id, manuscript id, title, filename, or text — so no member content
 * can reach these logs through this path.
 */
async function runVaultErasureStep(): Promise<void> {
  try {
    const { destroyed, remaining } = await sweepVaultErasureQueue();
    if (destroyed > 0) {
      console.log(`[MediaWorker/erasure] destroyed ${destroyed} owed vault artifact(s)`);
    }
    if (remaining > 0) {
      /* Surfaced, every cycle it persists. An obligation that cannot be honoured
         must be visible rather than retried forever in the dark. */
      console.error(
        `[MediaWorker/erasure] ${remaining} vault erasure obligation(s) STILL OWED — `
          + `member deletions are not fully honoured; see vault_erasure_queue.last_error`,
      );
    }
  } catch (error) {
    console.error('[MediaWorker/erasure] sweep failed (non-fatal, will retry):', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────────────────────────────────────

let running = true;
let consecutiveErrors = 0;
let loopCount = 0;

async function runWorkerLoop(): Promise<void> {
  console.log('[MediaWorker] Media Studio Processing Worker starting...');
  console.log(`[MediaWorker] Identity: ${WORKER_ID}`);
  console.log(`[MediaWorker] Poll interval: ${POLL_INTERVAL_MS}ms`);
  console.log(`[MediaWorker] Stale job reaper: every ${REAPER_EVERY_N_LOOPS} loops, threshold ${STALE_AFTER}`);
  console.log('[MediaWorker] Press Ctrl+C to stop\n');

  while (running) {
    /* ── media work · vault-erasure obligations · sleep ──────────────────
       The erasure step sits in a `finally` because the media block both
       `continue`s (idle poll) and throws (job failure), and BOTH paths must
       still reach it. A media-job failure must never prevent the sweep from
       being attempted on that cycle — that is the whole point of hosting it
       beside media work rather than inside it. */
    try {
      loopCount++;

      // Periodically reap stale jobs
      if (loopCount % REAPER_EVERY_N_LOOPS === 0) {
        try {
          const row = await queryOne<{ fn_requeue_stale_media_jobs: number }>(
            `SELECT fn_requeue_stale_media_jobs($1::interval)`,
            [STALE_AFTER]
          );
          const requeued = row?.fn_requeue_stale_media_jobs || 0;
          if (requeued > 0) {
            console.log(`[MediaWorker] Requeued ${requeued} stale job(s)`);
          }
        } catch (e) {
          console.warn('[MediaWorker] Reaper failed (non-fatal):', e);
        }
      }

      const job = await claimNextJob();

      if (!job) {
        await sleep(POLL_INTERVAL_MS);
        continue;
      }

      await processJob(job);
      consecutiveErrors = 0;

    } catch {
      consecutiveErrors++;
      console.error(`[MediaWorker] Error (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS})`);

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.error('[MediaWorker] Too many consecutive errors, shutting down');
        running = false;
      } else {
        await sleep(POLL_INTERVAL_MS * 2);
      }
    } finally {
      /* Reached on every path out of the media block — idle `continue`, a
         processed job, or a thrown one. Independent of media outcome. */
      if (loopCount % VAULT_ERASURE_EVERY_N_LOOPS === 0) {
        await runVaultErasureStep();
      }
    }
  }

  console.log('[MediaWorker] Worker stopped');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────────────────────────────────
// SHUTDOWN
// ─────────────────────────────────────────────────────────────────────────────

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[MediaWorker] Received ${signal}, shutting down gracefully...`);
  running = false;
  await sleep(2000);
  await closePool();
  console.log('[MediaWorker] Database pool closed');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

runWorkerLoop().catch((error) => {
  console.error('[MediaWorker] Fatal error:', error);
  process.exit(1);
});
