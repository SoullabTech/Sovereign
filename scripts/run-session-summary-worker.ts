#!/usr/bin/env tsx
/**
 * SESSION SUMMARY WORKER
 *
 * Drains the session_summary_queue and generates sovereign remembrances.
 *
 * Usage:
 *   npx tsx scripts/run-session-summary-worker.ts
 *
 * Flow:
 *   queued → processing → done (or failed)
 *
 * RF01 R1-A: worker is held outside an explicitly fictional test process.
 * Existing mixed/unknown sessions must never be summarized based only on
 * maia_sessions.mode. The old automatic mode-based purge and embedding bridge
 * are removed; R1-B will govern deletion and restoration separately.
 */

import os from 'node:os';
import { query, queryOne, closePool } from '../lib/db/postgres';
import { assertCorrectDb } from '../lib/scripts/dbSafetyGuard';
import { evaluateSummaryEligibility, summaryProviderFixtureEnabled } from '../lib/sanctuary/sessionSummaryEligibility';
import {
  generateSessionRemembrance,
  storeRemembrance,
} from '../lib/scribe/sovereignSummarizer';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 2000; // Check every 2s (summaries are less urgent than comms)
const MAX_CONSECUTIVE_ERRORS = 10;
const WORKER_ID = `summary:${os.hostname()}:${process.pid}`;
const REAPER_EVERY_N_LOOPS = 60;
const STALE_AFTER = '10 minutes'; // Summaries take longer than comms analysis
const MAX_TURNS_TO_READ = 60;

// ─────────────────────────────────────────────────────────────────────────────
// JOB PROCESSING
// ─────────────────────────────────────────────────────────────────────────────

interface SummaryJob {
  id: string;
  session_id: string;
  member_id: string | null;
  attempts: number;
}

/**
 * Claim the next available job. FOR UPDATE SKIP LOCKED for safe concurrency.
 */
async function claimNextJob(): Promise<SummaryJob | null> {
  const result = await queryOne<SummaryJob>(
    `UPDATE session_summary_queue
     SET status = 'processing',
         attempts = attempts + 1,
         started_at = NOW(),
         claimed_by = $1,
         claimed_at = NOW(),
         heartbeat_at = NOW()
     WHERE id = (
       SELECT id FROM session_summary_queue
       WHERE status = 'queued'
       ORDER BY queued_at ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED
     )
     RETURNING id, session_id, member_id, attempts`,
    [WORKER_ID]
  );
  return result;
}

async function markJobDone(jobId: string): Promise<void> {
  await query(
    `UPDATE session_summary_queue
     SET status = 'done', finished_at = NOW()
     WHERE id = $1`,
    [jobId]
  );
  console.log(`[Summary] ✅ ${jobId} queued → processing → done`);
}

async function markJobFailed(jobId: string, _error: unknown): Promise<void> {
  // Model and SQL errors can echo member words. Queue metadata never
  // persists arbitrary exception text, even in a fictional worker rehearsal.
  await query(
    "UPDATE session_summary_queue SET status='failed', "+
    "last_error='SUMMARY_ELIGIBILITY_OR_PROVIDER_HELD', finished_at=NOW() WHERE id=$1",
    [jobId],
  );
  console.warn('[Summary] job refused (fixed reason; no member content logged)');
}

/**
 * Episodic bridging and embeddings are intentionally NOT performed here.
 * A summary's existence never authorizes another external provider, another
 * durable memory object, or new influence over the member.
 */

/**
 * Process a single summary job.
 */
async function processJob(job: SummaryJob): Promise<void> {
  // R1-A metadata-only proof BEFORE session state changes, content reads,
  // model inference, embeddings or writes. Mode='continuity' is insufficient.
  if (!job.member_id) {
    await markJobFailed(job.id, 'SUMMARY_MEMBER_UNRESOLVED');
    return;
  }
  const eligible = await evaluateSummaryEligibility({
    sessionId: job.session_id, memberId: job.member_id, requireClosed: true,
  });
  if (!eligible.ok) {
    await markJobFailed(job.id, eligible.code);
    return;
  }

  const remembrance = await generateSessionRemembrance(job.session_id, MAX_TURNS_TO_READ);

  if (!remembrance) {
    // A refused or stale summary is never a successful derived-content job.
    await markJobFailed(job.id, 'SUMMARY_NOT_ELIGIBLE_AT_PROVIDER_TIME');
    return;
  }


  // The member may have changed posture or received a deletion manifest while
  // an asynchronous response was generated. The worker must recheck before
  // any derived-content write. storeRemembrance checks again.
  const beforeWrite = await evaluateSummaryEligibility({
    sessionId: job.session_id, memberId: job.member_id, requireClosed: true,
  });
  if (!beforeWrite.ok) {
    await markJobFailed(job.id, beforeWrite.code);
    return;
  }
  await storeRemembrance(job.session_id, remembrance);
  await markJobDone(job.id);
  // No essence/theme excerpts in worker logs.
  console.log('[Summary] eligible fictional session summary stored');

}

// R1-A: the old mode-only DELETE sweep is retired.
 // Per-turn retention/deletion requires authorized R1-B manifest, tombstone
 // and recovery qualification. No automatic session-mode purge exists.

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────────────────────────────────────

let running = true;
let consecutiveErrors = 0;
let loopCount = 0;

async function runWorkerLoop(): Promise<void> {
  // This is NOT a production summary grant. A Continuity choice authorizes
  // remembrance, not sending transcripts to an external summary provider.
  if (!summaryProviderFixtureEnabled()) {
    throw new Error('BACKGROUND_SUMMARIZATION_NOT_AUTHORIZED');
  }
  await assertCorrectDb();

  console.log('[Summary] MAIA Session Summary Worker starting...');
  console.log(`[Summary] Identity: ${WORKER_ID}`);
  console.log(`[Summary] Poll interval: ${POLL_INTERVAL_MS}ms`);
  console.log(`[Summary] Max turns per session: ${MAX_TURNS_TO_READ}`);
  console.log('[Summary] Press Ctrl+C to stop\n');

  while (running) {
    try {
      loopCount++;

      // Fictional rehearsal only: periodically reap stale jobs; no purge
      if (loopCount % REAPER_EVERY_N_LOOPS === 0) {
        try {
          const row = await queryOne<{ requeued: number }>(
            `SELECT fn_requeue_stale_summary_jobs($1::interval) AS requeued`,
            [STALE_AFTER]
          );
          if (row?.requeued && row.requeued > 0) {
            console.log(`[Summary] Requeued ${row.requeued} stale job(s)`);
          }
        } catch (e) {
          console.warn('[Summary] Reaper failed (non-fatal):', e);
        }

        // R1-A: No mode-only deletion from this worker. Deletion requires
        // explicit R1-B manifest and restoration custody, not a timer.
      }

      const job = await claimNextJob();

      if (!job) {
        await sleep(POLL_INTERVAL_MS);
        continue;
      }

      await processJob(job);
      consecutiveErrors = 0;

    } catch (error) {
      consecutiveErrors++;
      console.error('[Summary] provider or eligibility failure (details withheld)');

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.error('[Summary] Too many consecutive errors, shutting down');
        running = false;
        break;
      }

      await sleep(POLL_INTERVAL_MS * 3);
    }
  }

  console.log('[Summary] Worker stopped');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────────────────────────────────
// SHUTDOWN
// ─────────────────────────────────────────────────────────────────────────────

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[Summary] Received ${signal}, shutting down gracefully...`);
  running = false;
  await sleep(2000);
  await closePool();
  console.log('[Summary] Database pool closed');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY
// ─────────────────────────────────────────────────────────────────────────────

runWorkerLoop().catch((error) => {
  console.error('[Summary] worker unavailable or not authorized');
  process.exit(1);
});
