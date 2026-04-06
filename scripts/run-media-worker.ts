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

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 1500;
const MAX_CONSECUTIVE_ERRORS = 10;
const WORKER_ID = `media:${os.hostname()}:${process.pid}`;
const REAPER_EVERY_N_LOOPS = 60;
const STALE_AFTER = '10 minutes';

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
        break;
      }

      await sleep(POLL_INTERVAL_MS * 2);
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
