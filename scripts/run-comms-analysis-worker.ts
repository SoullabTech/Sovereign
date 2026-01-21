#!/usr/bin/env tsx
/**
 * COMMS SPINE: Analysis Worker
 *
 * Drains the comms_analysis_queue and runs MAIA analysis on each message.
 *
 * Usage:
 *   npm run comms:worker
 *
 * Dev: Run locally alongside the app
 * Prod: Deploy as a separate background service
 *
 * The worker uses FOR UPDATE SKIP LOCKED to safely handle
 * multiple workers running concurrently (if needed for scale).
 */

import os from 'node:os';
import { query, queryOne, closePool } from '../lib/db/postgres';
import { analyzeCommsMessage } from '../lib/comms/maiaAnalyzer';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 1000; // How often to check for new jobs when idle
const MAX_CONSECUTIVE_ERRORS = 10; // Shut down if too many errors in a row
const BATCH_SIZE = 1; // Process one at a time for now
const WORKER_ID = `${os.hostname()}:${process.pid}`; // Unique identity for this worker instance

// ─────────────────────────────────────────────────────────────────────────────
// JOB PROCESSING
// ─────────────────────────────────────────────────────────────────────────────

interface QueueJob {
  id: string;
  message_id: string;
  thread_id: string;
  attempts: number;
}

/**
 * Claim the next available job from the queue.
 * Uses FOR UPDATE SKIP LOCKED for safe concurrent access.
 * Tracks worker identity for debugging and stale job detection.
 */
async function claimNextJob(): Promise<QueueJob | null> {
  const result = await queryOne<QueueJob>(
    `UPDATE comms_analysis_queue
     SET status = 'processing',
         attempts = attempts + 1,
         started_at = NOW(),
         claimed_by = $1,
         claimed_at = COALESCE(claimed_at, NOW()),
         heartbeat_at = NOW()
     WHERE id = (
       SELECT id FROM comms_analysis_queue
       WHERE status = 'queued'
       ORDER BY queued_at ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED
     )
     RETURNING id, message_id, thread_id, attempts`,
    [WORKER_ID]
  );
  return result;
}

/**
 * Mark a job as successfully completed.
 */
async function markJobDone(jobId: string): Promise<void> {
  await query(
    `UPDATE comms_analysis_queue
     SET status = 'done', finished_at = NOW()
     WHERE id = $1`,
    [jobId]
  );
}

/**
 * Mark a job as failed with error message.
 */
async function markJobFailed(jobId: string, error: unknown): Promise<void> {
  const errorMsg = error instanceof Error ? error.message : String(error);
  await query(
    `UPDATE comms_analysis_queue
     SET status = 'failed', last_error = $2, finished_at = NOW()
     WHERE id = $1`,
    [jobId, errorMsg.slice(0, 4000)]
  );
}

/**
 * Process a single job.
 */
async function processJob(job: QueueJob): Promise<void> {
  console.log(`[Worker] Processing job ${job.id} (message: ${job.message_id}, attempt: ${job.attempts})`);

  try {
    const result = await analyzeCommsMessage(job.message_id);
    await markJobDone(job.id);

    if (result) {
      console.log(`[Worker] Job ${job.id} completed: type=${result.classification.inferred_type}, safety=${result.safety.detected}`);
    } else {
      console.log(`[Worker] Job ${job.id} completed (no analysis needed)`);
    }
  } catch (error) {
    console.error(`[Worker] Job ${job.id} failed:`, error);
    await markJobFailed(job.id, error);
    throw error; // Re-throw to track consecutive errors
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────────────────────────────────────

let running = true;
let consecutiveErrors = 0;

/**
 * Main worker loop.
 */
async function runWorkerLoop(): Promise<void> {
  console.log('[Worker] MAIA Comms Analysis Worker starting...');
  console.log(`[Worker] Identity: ${WORKER_ID}`);
  console.log(`[Worker] Poll interval: ${POLL_INTERVAL_MS}ms`);
  console.log('[Worker] Press Ctrl+C to stop\n');

  while (running) {
    try {
      const job = await claimNextJob();

      if (!job) {
        // No jobs available, wait and try again
        await sleep(POLL_INTERVAL_MS);
        continue;
      }

      await processJob(job);
      consecutiveErrors = 0; // Reset on success

    } catch (error) {
      consecutiveErrors++;
      console.error(`[Worker] Error (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`, error);

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.error('[Worker] Too many consecutive errors, shutting down');
        running = false;
        break;
      }

      // Back off on errors
      await sleep(POLL_INTERVAL_MS * 2);
    }
  }

  console.log('[Worker] Worker stopped');
}

/**
 * Sleep for the specified number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────────────────────────────────
// SHUTDOWN HANDLING
// ─────────────────────────────────────────────────────────────────────────────

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[Worker] Received ${signal}, shutting down gracefully...`);
  running = false;

  // Give current job time to finish
  await sleep(2000);

  await closePool();
  console.log('[Worker] Database pool closed');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

runWorkerLoop().catch((error) => {
  console.error('[Worker] Fatal error:', error);
  process.exit(1);
});
