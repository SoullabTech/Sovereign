import { query } from '@/lib/db/postgres';
import { patternRecencyWeight } from './patternRecencyWeight';

// ── MEMBER PATTERN HYPOTHESES ─────────────────────────────────────────────
// Primary source: pattern_ledger (aggregated longitudinal view).
// Fallback: conversation_insights raw stream (while ledger populates).
//
// Score formula:
//   score = average_significance * 0.4
//         + max_significance * 0.2
//         + ln(recurrence_count + 1) * 0.25
//         + recency_weight * 0.15
// ─────────────────────────────────────────────────────────────────────────

export interface PatternHypothesis {
  hypothesis: string;       // pattern_label
  score: number;            // computed weighted score
  source: string;           // pattern_type ('pattern' | 'growth_edge')
  recurrenceCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  triggerContexts: string[];
}

/**
 * Return up to `limit` recurring behavioral patterns for a member,
 * ordered by weighted score descending.
 *
 * Primary source: pattern_ledger (aggregated, longitudinal).
 * Fallback: conversation_insights (raw, while ledger populates).
 *
 * Graceful fallback: returns [] on any error — never blocks the oracle.
 *
 * @param memberId  - The member's user_id
 * @param limit     - Max hypotheses to return (default 3)
 * @param minScore  - Minimum weighted score threshold (default 0.55)
 */
export async function getTopHypotheses(
  memberId: string,
  limit = 3,
  minScore = 0.55
): Promise<PatternHypothesis[]> {
  if (!memberId) return [];

  // PRIMARY: pattern_ledger
  try {
    const result = await query(
      `SELECT
         COALESCE(pattern_key, 'unknown')   AS pattern_key,
         COALESCE(statement, 'Pattern')     AS pattern_label,
         COALESCE(pattern_type, 'pattern')  AS pattern_type,
         recurrence_count,
         first_seen_at,
         last_evidence_at                   AS last_seen_at,
         latest_significance,
         average_significance,
         max_significance,
         trigger_contexts
       FROM pattern_ledger
       WHERE member_id = $1
         AND status IN ('emerging', 'offered', 'confirmed', 'partial', 'active')
         AND pattern_key IS NOT NULL
       ORDER BY last_evidence_at DESC
       LIMIT 50`,
      [memberId]
    );

    if (result.rows.length > 0) {
      const scored = result.rows
        .map(row => {
          const avgSig = parseFloat(row.average_significance);
          const maxSig = parseFloat(row.max_significance);
          const count = row.recurrence_count as number;
          const recency = patternRecencyWeight(row.last_seen_at);
          const score = parseFloat(
            (avgSig * 0.4 + maxSig * 0.2 + Math.log(count + 1) * 0.25 + recency * 0.15).toFixed(4)
          );

          const contexts: string[] = Array.isArray(row.trigger_contexts)
            ? row.trigger_contexts
            : (row.trigger_contexts ? JSON.parse(row.trigger_contexts) : []);

          return {
            hypothesis: String(row.pattern_label).trim(),
            score,
            source: String(row.pattern_type),
            recurrenceCount: count,
            firstSeenAt: row.first_seen_at,
            lastSeenAt: row.last_seen_at,
            triggerContexts: contexts,
          };
        })
        .filter(h => h.hypothesis.length > 0 && h.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (scored.length > 0) return scored;
    }
  } catch (err) {
    console.warn('[Hypotheses] pattern_ledger read failed, trying fallback:', err);
  }

  // FALLBACK: conversation_insights (raw stream — ledger still populating)
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
        recurrenceCount: 1,
        firstSeenAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        triggerContexts: [],
      }))
      .filter(h => h.hypothesis.length > 0);

  } catch (err) {
    console.warn('[Hypotheses] Fallback load failed (non-critical):', err);
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
