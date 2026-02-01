/**
 * Oracle Handlers - Orchestration layer for oracle memory and trust
 *
 * Routes lazy-import these handlers to avoid module-load issues
 */

import { z } from 'zod';
import { query } from '@/lib/db/postgres';
import type { NextRequest } from 'next/server';

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

const MemorySearchSchema = z.object({
  userId: z.string().min(1),
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(10),
});

/**
 * Get memory statistics for a user
 */
export async function getOracleMemoryStatsHandler(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    throw new Error('userId parameter is required');
  }

  try {
    // Get memory counts from various tables
    const [sessionResult, journalResult, dreamResult] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM maia_sessions WHERE user_id = $1`, [userId]),
      query(`SELECT COUNT(*) as count FROM holoflower_journal_entries WHERE user_id = $1`, [userId]),
      query(`SELECT COUNT(*) as count FROM dream_memories WHERE user_id = $1`, [userId]).catch(() => ({ rows: [{ count: 0 }] })),
    ]);

    const stats = {
      sessionCount: parseInt(sessionResult.rows[0]?.count || '0'),
      journalCount: parseInt(journalResult.rows[0]?.count || '0'),
      dreamCount: parseInt(dreamResult.rows[0]?.count || '0'),
      totalMemories:
        parseInt(sessionResult.rows[0]?.count || '0') +
        parseInt(journalResult.rows[0]?.count || '0') +
        parseInt(dreamResult.rows[0]?.count || '0'),
    };

    return {
      ok: true,
      userId,
      stats,
    };
  } catch (error: any) {
    console.error('[OracleMemory] Stats error:', error);
    return {
      ok: true,
      userId,
      stats: {
        sessionCount: 0,
        journalCount: 0,
        dreamCount: 0,
        totalMemories: 0,
      },
      note: 'Some memory tables may not exist yet',
    };
  }
}

/**
 * Search memories for a user
 */
export async function searchOracleMemoryHandler(raw: unknown) {
  const input = MemorySearchSchema.parse(raw);

  try {
    // Search across journal entries (primary memory source)
    const journalResult = await query(`
      SELECT
        id,
        'journal' as type,
        intention as content,
        created_at,
        tags
      FROM holoflower_journal_entries
      WHERE user_id = $1
        AND (
          intention ILIKE $2
          OR $2 = ANY(tags)
        )
      ORDER BY created_at DESC
      LIMIT $3
    `, [input.userId, `%${input.query}%`, input.limit]);

    return {
      ok: true,
      query: input.query,
      hasResults: journalResult.rows.length > 0,
      memories: journalResult.rows,
      totalFound: journalResult.rows.length,
    };
  } catch (error: any) {
    console.error('[OracleMemory] Search error:', error);
    return {
      ok: true,
      query: input.query,
      hasResults: false,
      memories: [],
      totalFound: 0,
      note: 'Memory search not yet fully configured',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRUST HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

const TrustFeedbackSchema = z.object({
  userId: z.string().min(1),
  feedback: z.enum(['more_direct', 'more_gentle', 'perfect']),
  sessionId: z.string().optional(),
  context: z.string().optional(),
});

/**
 * Get trust metrics for a user
 */
export async function getOracleTrustHandler(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    throw new Error('userId parameter is required');
  }

  try {
    // Get session count as proxy for relationship stage
    const sessionResult = await query(`
      SELECT COUNT(*) as count FROM maia_sessions WHERE user_id = $1
    `, [userId]);

    const sessionCount = parseInt(sessionResult.rows[0]?.count || '0');

    // Determine relationship phase based on session count
    let currentStage: 'DISCOVERY' | 'CALIBRATION' | 'MATURE';
    let stageProgress: number;

    if (sessionCount < 3) {
      currentStage = 'DISCOVERY';
      stageProgress = sessionCount / 3;
    } else if (sessionCount < 10) {
      currentStage = 'CALIBRATION';
      stageProgress = (sessionCount - 3) / 7;
    } else {
      currentStage = 'MATURE';
      stageProgress = Math.min(1, (sessionCount - 10) / 20);
    }

    // Calculate base trust score
    const baseTrust = Math.min(0.5 + sessionCount * 0.03, 1);

    return {
      ok: true,
      userId,
      currentStage,
      stageProgress,
      trustMetrics: {
        overallTrust: baseTrust,
        sessionCount,
        lastUpdated: new Date().toISOString(),
      },
      safetyStatus: {
        safe: true,
        concerns: [],
      },
    };
  } catch (error: any) {
    console.error('[OracleTrust] Get error:', error);
    return {
      ok: true,
      userId,
      currentStage: 'DISCOVERY',
      stageProgress: 0,
      trustMetrics: {
        overallTrust: 0.5,
        sessionCount: 0,
      },
      safetyStatus: {
        safe: true,
        concerns: [],
      },
      note: 'Trust metrics in default state',
    };
  }
}

/**
 * Record trust feedback from user
 */
export async function recordOracleTrustFeedbackHandler(raw: unknown) {
  const input = TrustFeedbackSchema.parse(raw);

  try {
    // Store feedback for future personality adaptation
    await query(`
      INSERT INTO oracle_trust_feedback (
        user_id,
        feedback_type,
        session_id,
        context,
        created_at
      )
      VALUES ($1, $2, $3, $4, NOW())
    `, [
      input.userId,
      input.feedback,
      input.sessionId || null,
      input.context || null,
    ]);

    console.log('✨ Trust feedback recorded:', {
      userId: input.userId,
      feedback: input.feedback,
    });

    return {
      ok: true,
      message: 'Feedback recorded successfully',
      feedback: input.feedback,
    };
  } catch (error: any) {
    // If table doesn't exist, still acknowledge feedback
    if (error?.code === '42P01') {
      console.log('[OracleTrust] Feedback received (table pending):', input.feedback);
      return {
        ok: true,
        message: 'Feedback acknowledged',
        feedback: input.feedback,
        note: 'Feedback storage pending migration',
      };
    }
    throw error;
  }
}
