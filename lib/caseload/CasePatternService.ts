/**
 * CASE PATTERN SERVICE
 *
 * Computes aggregated patterns from case notes and memories.
 * Provides theme/intervention/element frequency analysis.
 */

import { query } from '@/lib/db/postgres';

interface PatternItem {
  value: string;
  count: number;
}

export interface PatternSummary {
  themesTop: PatternItem[];
  interventionsTop: PatternItem[];
  elements: PatternItem[];
  spiralMoves: PatternItem[];
  noteCount: number;
  chunkCount: number;
  updatedAt: string;
}

/**
 * Tally values and return top N by frequency
 */
function tally(values: (string | null | undefined)[], topN = 12): PatternItem[] {
  const m = new Map<string, number>();

  for (const v of values) {
    const k = (v || '').trim();
    if (!k) continue;
    m.set(k, (m.get(k) || 0) + 1);
  }

  return [...m.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export class CasePatternService {
  /**
   * Compute pattern summary from notes
   */
  static async compute(caseId: string): Promise<PatternSummary> {
    // Get themes from notes (unnest array)
    const themesResult = await query<{ v: string }>(
      `SELECT unnest(COALESCE(themes_observed, '{}'::text[])) AS v
       FROM case_notes
       WHERE case_id = $1`,
      [caseId]
    );

    // Get interventions from notes
    const interventionsResult = await query<{ v: string }>(
      `SELECT unnest(COALESCE(interventions_used, '{}'::text[])) AS v
       FROM case_notes
       WHERE case_id = $1`,
      [caseId]
    );

    // Get element focus from notes
    const elementsResult = await query<{ v: string }>(
      `SELECT COALESCE(element_focus, '') AS v
       FROM case_notes
       WHERE case_id = $1`,
      [caseId]
    );

    // Get spiral movements from notes
    const spiralResult = await query<{ v: string }>(
      `SELECT COALESCE(spiral_movement, '') AS v
       FROM case_notes
       WHERE case_id = $1`,
      [caseId]
    );

    // Get counts
    const noteCountResult = await query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM case_notes WHERE case_id = $1`,
      [caseId]
    );

    const chunkCountResult = await query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM case_memory_chunks WHERE case_id = $1`,
      [caseId]
    );

    return {
      themesTop: tally(themesResult.rows.map((r) => r.v)),
      interventionsTop: tally(interventionsResult.rows.map((r) => r.v)),
      elements: tally(elementsResult.rows.map((r) => r.v)),
      spiralMoves: tally(spiralResult.rows.map((r) => r.v)),
      noteCount: parseInt(noteCountResult.rows[0]?.count || '0'),
      chunkCount: parseInt(chunkCountResult.rows[0]?.count || '0'),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Compute and upsert pattern summary
   */
  static async upsert(caseId: string): Promise<PatternSummary> {
    const summary = await this.compute(caseId);

    await query(
      `INSERT INTO case_patterns (case_id, computed_at, pattern_version, summary)
       VALUES ($1, NOW(), 1, $2::jsonb)
       ON CONFLICT (case_id)
       DO UPDATE SET computed_at = NOW(), pattern_version = case_patterns.pattern_version + 1, summary = $2::jsonb`,
      [caseId, JSON.stringify(summary)]
    );

    return summary;
  }

  /**
   * Get cached pattern summary (without recomputing)
   */
  static async get(caseId: string): Promise<{ summary: PatternSummary; computed_at: string } | null> {
    const result = await query<{
      case_id: string;
      computed_at: string;
      pattern_version: number;
      summary: PatternSummary;
    }>(
      `SELECT case_id, computed_at, pattern_version, summary
       FROM case_patterns
       WHERE case_id = $1`,
      [caseId]
    );

    if (!result.rows[0]) return null;

    return {
      summary: result.rows[0].summary,
      computed_at: result.rows[0].computed_at,
    };
  }
}
