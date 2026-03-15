import { query } from '@/lib/db/postgres';

// ── MEMBER PATTERN HYPOTHESES ─────────────────────────────────────────────
// Reads accumulated behavioral patterns from conversation_insights.
// Used to subtly inform MAIA's stance in CORE/DEEP turns — never stated aloud.
//
// Source: insight_type IN ('pattern', 'growth_edge'), ordered by insight_significance.
// Score proxy: insight_significance (0–1, default 0.5).
// ─────────────────────────────────────────────────────────────────────────

export interface PatternHypothesis {
  hypothesis: string;   // The insight text — describes a recurring dynamic
  score: number;        // insight_significance (0–1)
  source: string;       // insight_type ('pattern' | 'growth_edge')
}

/**
 * Return up to `limit` recurring behavioral patterns for a member,
 * ordered by significance descending.
 *
 * Graceful fallback: returns [] on any error — never blocks the oracle.
 *
 * @param memberId  - The member's user_id
 * @param limit     - Max hypotheses to return (default 3)
 * @param minScore  - Minimum insight_significance threshold (default 0.55)
 */
export async function getTopHypotheses(
  memberId: string,
  limit = 3,
  minScore = 0.55
): Promise<PatternHypothesis[]> {
  if (!memberId) return [];

  try {
    const result = await query(
      `SELECT
         insight_text   AS hypothesis,
         insight_significance AS score,
         insight_type   AS source
       FROM conversation_insights
       WHERE user_id = $1
         AND insight_type IN ('pattern', 'growth_edge')
         AND insight_significance >= $2
         AND insight_text IS NOT NULL
         AND LENGTH(TRIM(insight_text)) > 10
       ORDER BY insight_significance DESC, created_at DESC
       LIMIT $3`,
      [memberId, minScore, limit]
    );

    return result.rows
      .map(row => ({
        hypothesis: String(row.hypothesis).trim(),
        score: parseFloat(row.score ?? '0.5'),
        source: String(row.source),
      }))
      .filter(h => h.hypothesis.length > 0);

  } catch (err) {
    console.warn('⚠️ [Hypotheses] Load failed (non-critical):', err);
    return [];
  }
}

/**
 * Format top hypotheses as a compact prompt block for the system prompt.
 * Returns empty string when no hypotheses qualify.
 *
 * Tone: implicit, attentive, never diagnostic.
 */
export function buildHypothesisPromptBlock(
  hypotheses: PatternHypothesis[]
): string {
  if (hypotheses.length === 0) return '';

  return `
# Possible Emerging Dynamics (IMPLICIT)
Hold these lightly in the background. Do not name them directly or treat them as settled truths unless the member clearly brings them forward. Let them subtly inform what you notice, the gentleness of your pacing, and the depth of your questions.

Favor the member's present language over any of these when they diverge — the live moment always outranks stored pattern.

${hypotheses.map(h => `- ${h.hypothesis}`).join('\n')}

`;
}
