/**
 * Pattern Hint — loads active patterns and formats them as a compact oracle hint.
 *
 * Design:
 * - Returns null for Tier A (threshold) — containment first, patterns second
 * - Top 3 by confidence, minimum 0.6 to avoid surfacing weak hypotheses
 * - Compact format: oracle uses patterns as ATTENTION, not assertions
 * - Graceful fallback: pattern load failure never blocks oracle
 *
 * Wire point: after spiral state load in oracle conversation route.
 * Inject into buildSacredAttendingPrompt as patternHint parameter.
 */

import { query } from '@/lib/db/postgres';

export interface PatternHintEntry {
  statement: string;
  scope: string;
  confidence: number;
  status: 'emerging' | 'offered' | 'confirmed' | 'partial';
}

/**
 * Load top active patterns for a member, formatted as an oracle attention hint.
 *
 * Returns null if no patterns are found, load fails, or tierA is true.
 * tierA: threshold conversations should be pattern-neutral (containment first).
 */
export async function getPatternHint(
  memberId: string,
  options: { tierA?: boolean } = {}
): Promise<string | null> {
  // Tier A: pattern-neutral — offer containment, not interpretation
  if (options.tierA) return null;

  try {
    const result = await query<PatternHintEntry>(
      `SELECT statement, scope, confidence, status
       FROM pattern_ledger
       WHERE member_id = $1
         AND status IN ('emerging', 'offered', 'confirmed', 'partial')
         AND confidence >= 0.6
       ORDER BY confidence DESC, last_evidence_at DESC
       LIMIT 3`,
      [memberId]
    );

    if (result.rows.length === 0) return null;

    const lines = result.rows.map((p) => {
      const statusNote = p.status === 'confirmed' ? ' (recognized by member)' : '';
      return `- ${p.statement}${statusNote}`;
    });

    return `# Pattern Awareness (IMPLICIT — attend, do not assert)
The following recurring patterns have been observed across this member's sessions.
Do NOT state these patterns directly. Use them as attention — notice if they surface
in what the member brings, and create space for them to find their own words.

${lines.join('\n')}

These are hypotheses, not diagnoses. The member's own recognition is what matters.
`;
  } catch (error) {
    // Graceful fallback — pattern load failure never blocks oracle
    console.warn('[pattern-hint] Load failed (non-critical):', error instanceof Error ? error.message : String(error));
    return null;
  }
}
