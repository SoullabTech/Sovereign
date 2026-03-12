#!/usr/bin/env ts-node
/**
 * Stale Session Sweeper
 *
 * Closes sessions that have been left 'active' without a proper end-session call.
 * This happens when users close the browser tab or the app crashes before
 * the frontend calls POST /api/scribe/end-session.
 *
 * Without this, sessions accumulate as 'active' forever and never get summaries.
 *
 * What it does:
 *   1. Find sessions where ALL of the following are true:
 *      - status = 'active'
 *      - member_id IS NOT NULL       (anonymous sessions excluded — nothing to attribute)
 *      - mode IS NULL OR mode = 'continuity'  (sanctuary MUST NEVER be touched)
 *      - last_activity_at < NOW() - threshold  (truly stale)
 *      - conversation_turns count >= 2         (enough to summarize)
 *   2. Mark them 'completed'
 *   3. Enqueue to session_summary_queue (ON CONFLICT DO NOTHING — idempotent)
 *
 * Usage:
 *   docker exec maia-sovereign npx ts-node scripts/sweep-stale-sessions.ts
 *   docker exec maia-sovereign npx ts-node scripts/sweep-stale-sessions.ts --dry-run
 *   docker exec maia-sovereign npx ts-node scripts/sweep-stale-sessions.ts --threshold=4h
 *
 * ⚠️  Run inside Docker, not from host — the DB guard will reject localhost connections.
 *
 * Sovereignty invariants:
 *   - Sanctuary sessions NEVER touched: not closed, not enqueued, not summarized.
 *   - Anonymous sessions (no member_id) NEVER enqueued.
 *   - Sessions with < 2 turns NEVER enqueued (worker would skip anyway — avoid wasted jobs).
 *   - Idempotent: running twice produces the same result as running once.
 */

import { query } from '../lib/db/postgres';
import { assertCorrectDb } from '../lib/scripts/dbSafetyGuard';
import { applyDecay } from '../lib/consciousness/interpretiveLedger';
import { loadActiveHypotheses } from '../lib/consciousness/hypothesisBuffer';
import { shouldExpire } from '../lib/consciousness/gateEvaluator';
import type { SpiralogicPhase } from '../lib/types/interpretive-ledger';

// ============================================================================
// Config
// ============================================================================

const DRY_RUN = process.argv.includes('--dry-run');

const thresholdArg = process.argv.find(a => a.startsWith('--threshold='));
const STALE_THRESHOLD = thresholdArg
  ? thresholdArg.split('=')[1]   // e.g. "4h", "90m", "1 hour"
  : '2 hours';

/** Minimum turns for a session to be worth enqueuing. Must match worker's skip threshold. */
const MIN_TURNS = 2;

// ============================================================================
// Discovery
// ============================================================================

interface StaleSession {
  id: string;
  member_id: string;
  last_activity_at: string;
  mode: string | null;
  turn_count: number;
}

async function findStaleSessions(): Promise<StaleSession[]> {
  const result = await query<{
    id: string;
    member_id: string;
    last_activity_at: string;
    mode: string | null;
    turn_count: string;
  }>(
    `
    SELECT
      ms.id,
      ms.member_id,
      ms.last_activity_at::text,
      ms.mode,
      COUNT(ct.id)::text as turn_count
    FROM maia_sessions ms
    LEFT JOIN conversation_turns ct ON ct.session_id = ms.id
    WHERE ms.status = 'active'
      AND ms.member_id IS NOT NULL
      -- Sanctuary guard: mode must be NULL (unset) or explicitly 'continuity'.
      -- A != check silently excludes NULL rows in SQL — this is the safe version.
      AND (ms.mode IS NULL OR ms.mode = 'continuity')
      AND ms.last_activity_at < NOW() - $1::interval
    GROUP BY ms.id, ms.member_id, ms.last_activity_at, ms.mode
    HAVING COUNT(ct.id) >= $2
    ORDER BY ms.last_activity_at ASC
    `,
    [STALE_THRESHOLD, MIN_TURNS]
  );

  return (result.rows ?? []).map(r => ({
    id: r.id,
    member_id: r.member_id,
    last_activity_at: r.last_activity_at,
    mode: r.mode,
    turn_count: parseInt(r.turn_count, 10),
  }));
}

// ============================================================================
// Sanity checks before write
// ============================================================================

function assertNoneSanctuary(sessions: StaleSession[]): void {
  const sanctuary = sessions.filter(s => s.mode === 'sanctuary');
  if (sanctuary.length > 0) {
    // This should never happen given the WHERE clause — but if it does, abort.
    console.error('[Sweeper] ❌ SANCTUARY SESSIONS in result set — aborting. This is a bug.');
    console.error('[Sweeper]    Sessions:', sanctuary.map(s => s.id));
    process.exit(2);
  }
}

function assertAllHaveMemberId(sessions: StaleSession[]): void {
  const anon = sessions.filter(s => !s.member_id);
  if (anon.length > 0) {
    console.error('[Sweeper] ❌ ANONYMOUS SESSIONS in result set — aborting. This is a bug.');
    process.exit(2);
  }
}

// ============================================================================
// Close + Enqueue
// ============================================================================

async function closeSessions(sessions: StaleSession[]): Promise<{ closed: number; enqueued: number }> {
  if (sessions.length === 0) return { closed: 0, enqueued: 0 };

  const ids = sessions.map(s => s.id);

  // Mark all as completed in one shot.
  // Double-guard in WHERE: status='active' AND mode not sanctuary.
  // Paranoid second-level protection even if discovery query had a bug.
  const closeResult = await query(
    `UPDATE maia_sessions
     SET status = 'completed',
         mode   = COALESCE(mode, 'continuity'),
         completed_at = NOW(),
         updated_at   = NOW()
     WHERE id = ANY($1::text[])
       AND status = 'active'
       AND (mode IS NULL OR mode = 'continuity')`,
    [ids]
  );
  const closed = closeResult.rowCount ?? 0;

  // Enqueue each for summarization.
  // ON CONFLICT DO NOTHING = idempotent (unique constraint on session_id).
  let enqueued = 0;
  for (const s of sessions) {
    const r = await query(
      `INSERT INTO session_summary_queue (session_id, member_id)
       VALUES ($1, $2)
       ON CONFLICT (session_id) DO NOTHING`,
      [s.id, s.member_id]
    );
    if ((r.rowCount ?? 0) > 0) enqueued++;
  }

  return { closed, enqueued };
}

// ============================================================================
// Cognitive OS Decay
// ============================================================================

/**
 * runCogosDecay
 *
 * Applies developmental decay to:
 *   1. Interpretive ledger entries — reduces routing_influence_weight based on
 *      phase distance and inactivity; entries below 0.05 are marked 'expired'.
 *   2. Accumulating hypothesis buffer — expires hypotheses that have been
 *      inactive too long or whose structural_confidence has collapsed.
 *
 * Uses actual completed session counts (not estimate) for inactivity scoring.
 * Sanctuary sessions are excluded from the session count (sovereignty invariant).
 * Non-fatal: per-member failures are logged and the sweep continues.
 */
async function runCogosDecay(): Promise<void> {
  // Find all members with anything active in ledger or buffer
  const memberResult = await query<{ member_id: string }>(
    `SELECT DISTINCT member_id FROM (
       SELECT member_id FROM interpretive_ledger
        WHERE status = 'active'
       UNION
       SELECT member_id FROM accumulating_hypotheses
        WHERE status IN ('accumulating', 'eligible', 'worthy')
     ) AS m`,
  );

  const memberIds = memberResult.rows.map(r => r.member_id);
  if (memberIds.length === 0) {
    console.log('[Sweeper] [CogOS] Nothing to decay — no active ledger or buffer entries.');
    return;
  }

  console.log(`[Sweeper] [CogOS] Decaying ${memberIds.length} member(s).`);

  for (const memberId of memberIds) {
    try {
      // Load current Spiralogic phase from Bridge D state table
      const phaseRow = await query<{ phase: number }>(
        `SELECT phase FROM member_spiral_state WHERE member_id = $1`,
        [memberId],
      );
      const currentPhase = (phaseRow.rows[0]?.phase ?? 1) as SpiralogicPhase;

      // ── Ledger decay ────────────────────────────────────────────────────────
      const ledgerRows = await query<{ id: string; last_updated: string }>(
        `SELECT id, last_updated FROM interpretive_ledger
          WHERE member_id = $1 AND status = 'active'`,
        [memberId],
      );

      const sessionsSinceActive: Record<string, number> = {};
      for (const row of ledgerRows.rows) {
        const cnt = await query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM maia_sessions
            WHERE member_id = $1
              AND status = 'completed'
              AND (mode IS NULL OR mode = 'continuity')  -- sanctuary excluded
              AND completed_at > $2`,
          [memberId, row.last_updated],
        );
        sessionsSinceActive[row.id] = parseInt(cnt.rows[0]?.count ?? '0', 10);
      }

      if (!DRY_RUN) {
        await applyDecay(memberId, currentPhase, sessionsSinceActive);
      }

      // ── Buffer expiry ────────────────────────────────────────────────────────
      const hypotheses = await loadActiveHypotheses(memberId);
      let expired = 0;
      for (const h of hypotheses) {
        const cnt = await query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM maia_sessions
            WHERE member_id = $1
              AND status = 'completed'
              AND (mode IS NULL OR mode = 'continuity')
              AND completed_at > $2`,
          [memberId, h.last_updated],
        );
        const sessionsSinceLastEvidence = parseInt(cnt.rows[0]?.count ?? '0', 10);

        if (shouldExpire(h, currentPhase, sessionsSinceLastEvidence)) {
          if (!DRY_RUN) {
            await query(
              `UPDATE accumulating_hypotheses
                  SET status = 'expired', last_updated = NOW()
                WHERE id = $1`,
              [h.id],
            );
          }
          expired++;
        }
      }

      console.log(
        `[Sweeper] [CogOS] ${DRY_RUN ? '(dry) ' : ''}member ${memberId.slice(0, 8)}...` +
        ` phase=${currentPhase}` +
        ` ledger=${ledgerRows.rows.length}` +
        ` buffer=${hypotheses.length}` +
        ` buffer_expired=${expired}`,
      );
    } catch (err) {
      console.warn(`[Sweeper] [CogOS] Decay failed for member ${memberId.slice(0, 8)}... (non-fatal):`, err);
    }
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  // Verify DB before doing anything
  await assertCorrectDb();

  console.log(`\n[Sweeper] ${DRY_RUN ? '🔍 DRY RUN — ' : ''}threshold=${STALE_THRESHOLD} min_turns=${MIN_TURNS}`);

  const stale = await findStaleSessions();

  if (stale.length === 0) {
    console.log('[Sweeper] ✅ No stale member sessions found.');
  } else {
    // Paranoid pre-write checks
    assertNoneSanctuary(stale);
    assertAllHaveMemberId(stale);

    console.log(`[Sweeper] Found ${stale.length} stale session(s):`);
    for (const s of stale) {
      const age = Math.round((Date.now() - new Date(s.last_activity_at).getTime()) / 60000);
      console.log(`  - ${s.id} (member: ${s.member_id.slice(0, 8)}..., turns: ${s.turn_count}, age: ${age}m, mode: ${s.mode ?? 'unset'})`);
    }

    if (!DRY_RUN) {
      const { closed, enqueued } = await closeSessions(stale);
      console.log(`[Sweeper] ✅ closed=${closed} enqueued=${enqueued}`);
    } else {
      console.log('[Sweeper] DRY RUN — no session changes made.');
    }
  }

  // Cognitive OS decay pass — runs regardless of whether sessions were found
  await runCogosDecay();

  process.exit(0);
}

main().catch(err => {
  console.error('[Sweeper] Fatal:', err);
  process.exit(1);
});
