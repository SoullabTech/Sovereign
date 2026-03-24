/**
 * First Descent — Persistence
 *
 * Fire-and-forget writes, graceful-fallback reads.
 * Mirrors spiralStatePersistence.ts pattern.
 */

import { query } from '@/lib/db/postgres';
import type { DescentSeed } from './firstDescent';

// ── Read ─────────────────────────────────────────────────────────────────────

export async function hasCompletedFirstDescent(memberId: string): Promise<boolean> {
  try {
    const result = await query(
      `SELECT first_descent_completed FROM members WHERE id = $1`,
      [memberId]
    );
    return result.rows.length > 0 && result.rows[0].first_descent_completed === true;
  } catch (error) {
    console.warn('[FirstDescent] hasCompleted check failed:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false; // Graceful fallback — let them through
  }
}

export async function loadFirstDescentSeed(memberId: string): Promise<DescentSeed | null> {
  try {
    const result = await query(
      `SELECT origin_input, maia_reply, prompt_version, model_used, completed_at
       FROM member_first_descent
       WHERE member_id = $1`,
      [memberId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      originInput: row.origin_input,
      maiaReply: row.maia_reply,
      completedAt: row.completed_at?.toISOString?.() ?? row.completed_at,
      promptVersion: row.prompt_version ?? undefined,
      modelUsed: row.model_used ?? undefined,
    };
  } catch (error) {
    console.warn('[FirstDescent] loadSeed failed:', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null; // Graceful fallback
  }
}

// ── Write (fire-and-forget) ──────────────────────────────────────────────────

export function storeFirstDescent(memberId: string, seed: DescentSeed): void {
  _storeAsync(memberId, seed).catch((error) => {
    console.error('[FirstDescent] storeFirstDescent failed (non-blocking):', error);
  });
}

async function _storeAsync(memberId: string, seed: DescentSeed): Promise<void> {
  await query(
    `INSERT INTO member_first_descent (member_id, origin_input, maia_reply, prompt_version, model_used, completed_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (member_id)
     DO UPDATE SET
       origin_input = EXCLUDED.origin_input,
       maia_reply = EXCLUDED.maia_reply,
       prompt_version = EXCLUDED.prompt_version,
       model_used = EXCLUDED.model_used,
       completed_at = NOW()`,
    [memberId, seed.originInput, seed.maiaReply, seed.promptVersion ?? null, seed.modelUsed ?? null]
  );

  await query(
    `UPDATE members SET first_descent_completed = TRUE WHERE id = $1`,
    [memberId]
  );
}
