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
 * Sovereignty invariant:
 *   Sanctuary sessions are NEVER processed. If one slips through,
 *   the summarizer itself also refuses. Belt AND suspenders.
 *
 * Modeled on run-comms-analysis-worker.ts for consistency.
 */

import os from 'node:os';
import crypto from 'node:crypto';
import { query, queryOne, closePool } from '../lib/db/postgres';
import { assertCorrectDb } from '../lib/scripts/dbSafetyGuard';
import {
  generateSessionRemembrance,
  storeRemembrance,
  SessionRemembrance,
} from '../lib/scribe/sovereignSummarizer';
import { VectorEmbeddingService } from '../lib/vector-embeddings';

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

async function markJobFailed(jobId: string, error: unknown): Promise<void> {
  const errorMsg = error instanceof Error ? error.message : String(error);
  await query(
    `UPDATE session_summary_queue
     SET status = 'failed', last_error = $2, finished_at = NOW()
     WHERE id = $1`,
    [jobId, errorMsg.slice(0, 4000)]
  );
  console.log(`[Summary] ❌ ${jobId} queued → processing → failed: ${errorMsg.slice(0, 200)}`);
}

/**
 * Bridge session remembrance into episodic_memories for resonance search.
 * Non-fatal: if this fails, the summary is still stored normally.
 */
async function bridgeRemembranceToEpisodicMemory(
  sessionId: string,
  memberId: string,
  remembrance: SessionRemembrance
): Promise<void> {
  try {
    const episodeId = `session-${crypto.randomUUID()}`;
    const title = `Session note: ${remembrance.essence.slice(0, 80)}`;

    // Combine essence + open loops into a searchable description
    const parts = [remembrance.essence];
    if (remembrance.openLoops.length > 0) {
      parts.push(`Open threads: ${remembrance.openLoops.join('. ')}`);
    }
    if (remembrance.nextStep) {
      parts.push(`Next: ${remembrance.nextStep}`);
    }
    const description = parts.join('\n\n');

    // Significance: sessions with open loops or next steps score higher
    const sig = Math.min(
      5 + (remembrance.openLoops.length > 0 ? 2 : 0) + (remembrance.nextStep ? 1 : 0),
      10
    );

    // Generate embedding for semantic resonance search
    let semanticVector: number[] | null = null;
    try {
      const embedder = new VectorEmbeddingService({
        dimension: 768,
      });
      semanticVector = await embedder.getEmbedding(`${title} ${description}`);
    } catch {
      // Non-fatal: text fallback still works
    }

    await query(
      `INSERT INTO episodic_memories
        (user_id, episode_id, experience_title, experience_description,
         experience_context, significance, emotional_intensity,
         semantic_vector, archetypal_resonances, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, NOW())`,
      [
        memberId,
        episodeId,
        title,
        description,
        `session_summary:${sessionId}`,
        sig,
        0.5,
        semanticVector ? JSON.stringify(semanticVector) : '[]',
        JSON.stringify(remembrance.themes.slice(0, 5)),
      ]
    );

    console.log(`[Summary→Memory] Bridged session ${sessionId} → ${episodeId}`);
  } catch (err) {
    console.error('[Summary→Memory] Bridge failed (summary still stored):', err);
  }
}

/**
 * Process a single summary job.
 */
async function processJob(job: SummaryJob): Promise<void> {
  console.log(`[Summary] 🔄 Processing session ${job.session_id} (attempt ${job.attempts})`);

  // Mark session as closing
  await query(
    `UPDATE maia_sessions SET status = 'closing', updated_at = NOW() WHERE id = $1`,
    [job.session_id]
  );

  const remembrance = await generateSessionRemembrance(job.session_id, MAX_TURNS_TO_READ);

  if (!remembrance) {
    // Null means sanctuary or empty — mark done without storing
    console.log(`[Summary] ⏭️  Session ${job.session_id} skipped (sanctuary or empty)`);
    await markJobDone(job.id);
    // Mark session completed even without summary
    await query(
      `UPDATE maia_sessions SET status = 'completed', completed_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [job.session_id]
    );
    return;
  }

  // Write remembrance to maia_sessions
  await storeRemembrance(job.session_id, remembrance);

  // Bridge to episodic memory for resonance search (non-fatal)
  if (job.member_id) {
    await bridgeRemembranceToEpisodicMemory(job.session_id, job.member_id, remembrance);
  }

  await markJobDone(job.id);

  console.log(`[Summary] 📝 Session ${job.session_id}: "${remembrance.essence.slice(0, 80)}..."`);
  console.log(`[Summary]    Themes: [${remembrance.themes.join(', ')}]`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SANCTUARY PURGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Delete conversation turns for sanctuary sessions that have been closed.
 * Runs periodically to ensure sanctuary content doesn't linger.
 */
async function purgeSanctuaryTurns(): Promise<void> {
  const result = await query<{ session_id: string }>(
    `DELETE FROM conversation_turns
     WHERE session_id IN (
       SELECT id FROM maia_sessions
       WHERE mode = 'sanctuary'
         AND status IN ('completed', 'closing')
     )
     RETURNING session_id`
  );

  const purged = result.rows?.length ?? 0;
  if (purged > 0) {
    const sessionIds = [...new Set(result.rows.map(r => r.session_id))];
    console.log(`[Summary] 🔒 Purged turns from ${sessionIds.length} sanctuary session(s)`);

    // Mark sanctuary sessions as completed
    await query(
      `UPDATE maia_sessions
       SET status = 'completed', completed_at = NOW(), updated_at = NOW()
       WHERE mode = 'sanctuary' AND status IN ('closing')
         AND id = ANY($1::text[])`,
      [sessionIds]
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────────────────────────────────────

let running = true;
let consecutiveErrors = 0;
let loopCount = 0;

async function runWorkerLoop(): Promise<void> {
  await assertCorrectDb();

  console.log('[Summary] MAIA Session Summary Worker starting...');
  console.log(`[Summary] Identity: ${WORKER_ID}`);
  console.log(`[Summary] Poll interval: ${POLL_INTERVAL_MS}ms`);
  console.log(`[Summary] Max turns per session: ${MAX_TURNS_TO_READ}`);
  console.log('[Summary] Press Ctrl+C to stop\n');

  while (running) {
    try {
      loopCount++;

      // Periodically reap stale jobs + purge sanctuary turns
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

        // Sanctuary purge
        try {
          await purgeSanctuaryTurns();
        } catch (e) {
          console.warn('[Summary] Sanctuary purge failed (non-fatal):', e);
        }
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
      console.error(`[Summary] Error (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`, error);

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
  console.error('[Summary] Fatal error:', error);
  process.exit(1);
});
