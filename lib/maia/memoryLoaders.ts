/**
 * Memory Loaders — compact DB readers for the memory orchestrator
 *
 * Pure read helpers that pull only the fields the orchestrator needs.
 * No raw transcripts. No large payloads. No schema changes. Each loader
 * fails gracefully (returns []) so the orchestrator can run with thin or
 * empty inputs without breaking the route.
 *
 * These exist because the orchestrator is a pure function — it does not
 * read from the DB itself. The route handler is responsible for loading
 * what should bias the current turn and passing it in.
 *
 * Currently used by:
 *   - app/api/oracle/conversation/route.ts
 *   - app/api/between/chat/route.ts
 */

import { query } from '@/lib/db/postgres';
import type {
  DevelopmentalMemorySnapshot,
  ThemeSignalSnapshot,
} from './types/memoryOrchestrator';

/**
 * Load the most recent / highest-significance developmental memories for a user.
 *
 * Returns at most `limit` snapshots, ordered by significance DESC, formed_at DESC.
 * Pulls only the compact fields the orchestrator needs — never raw content_text.
 */
export async function loadRecentDevelopmentalMemories(
  userId: string,
  limit: number = 3,
): Promise<DevelopmentalMemorySnapshot[]> {
  if (!userId) return [];
  try {
    const result = await query<{
      id: string;
      memory_type: string | null;
      facet_code: string | null;
      significance: string | number;
      formed_at: Date;
    }>(
      `SELECT id, memory_type, facet_code, significance, formed_at
       FROM developmental_memories
       WHERE user_id = $1
         AND (valid_to IS NULL)
       ORDER BY significance DESC, formed_at DESC
       LIMIT $2`,
      [userId, limit],
    );
    return result.rows.map((r) => ({
      id: r.id,
      memory_type: r.memory_type,
      facet_code: r.facet_code,
      significance: typeof r.significance === 'string' ? parseFloat(r.significance) : r.significance,
      formed_at: r.formed_at,
      directional_cue: null, // No distillation in first version; orchestrator falls back to generic prime
    }));
  } catch (err) {
    console.warn('[memoryLoaders] loadRecentDevelopmentalMemories failed (non-fatal):', err);
    return [];
  }
}

/**
 * Load the most recent theme signals for a user.
 *
 * Returns at most `limit` snapshots, ordered by detected_at DESC.
 * Used as a low-weight pattern_cue source in the orchestrator.
 */
export async function loadRecentThemeSignals(
  userId: string,
  limit: number = 10,
): Promise<ThemeSignalSnapshot[]> {
  if (!userId) return [];
  try {
    const result = await query<{
      theme: string;
      signal_type: string;
      resonance_strength: number | null;
      element: string | null;
      detected_at: Date;
    }>(
      `SELECT theme, signal_type, resonance_strength, element, detected_at
       FROM member_theme_signals
       WHERE member_id = $1
       ORDER BY detected_at DESC
       LIMIT $2`,
      [userId, limit],
    );
    return result.rows.map((r) => ({
      theme: r.theme,
      signal_type: r.signal_type,
      resonance_strength: r.resonance_strength,
      element: r.element,
      detected_at: r.detected_at,
    }));
  } catch (err) {
    console.warn('[memoryLoaders] loadRecentThemeSignals failed (non-fatal):', err);
    return [];
  }
}
