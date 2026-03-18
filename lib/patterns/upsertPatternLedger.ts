import { query } from '@/lib/db/postgres';
import { normalizePatternInsight } from './normalizePatternInsight';

export interface PatternLedgerInput {
  memberId: string;
  insightId: string;
  insightType: 'pattern' | 'growth_edge';
  insightText: string;
  significance: number;
  createdAt: string;
  triggerContext?: string | null;
}

const MAX_EVIDENCE_REFS = 10;
const MAX_TRIGGER_CONTEXTS = 8;

/**
 * Upsert a pattern_ledger row from a new conversation_insight.
 * Fire-and-forget safe — never throws, always graceful fallback.
 *
 * Design invariant: conversation_insights is the raw event stream.
 * pattern_ledger is the aggregated longitudinal view derived from it.
 */
export async function upsertPatternLedger(input: PatternLedgerInput): Promise<void> {
  if (!input.memberId || !input.insightText) return;

  try {
    const { patternKey, patternLabel, patternType } = normalizePatternInsight(
      input.insightText,
      input.insightType
    );

    const sig = Math.max(0, Math.min(1, input.significance));
    const now = input.createdAt || new Date().toISOString();

    // Check for existing row
    const existing = await query(
      `SELECT id, recurrence_count, average_significance, max_significance,
              trigger_contexts, evidence_refs, supporting_insight_ids
       FROM pattern_ledger
       WHERE member_id = $1 AND pattern_key = $2`,
      [input.memberId, patternKey]
    );

    // Map insightType to a scope value the table's CHECK constraint accepts
    const scope = 'theme';

    if (existing.rows.length === 0) {
      // INSERT new ledger row
      // Production table requires: statement (NOT NULL), scope (NOT NULL, CHECK constraint).
      // pattern_key and the longitudinal columns were added via 20260315130000_pattern_ledger_evolution.sql.
      const triggerContexts = input.triggerContext
        ? JSON.stringify([input.triggerContext])
        : '[]';
      const evidenceRefs = JSON.stringify([{ text: input.insightText.slice(0, 200), at: now }]);
      const insightIds = JSON.stringify([input.insightId]);

      await query(
        `INSERT INTO pattern_ledger (
           member_id, pattern_key, pattern_type,
           statement, scope,
           recurrence_count,
           first_seen_at, last_evidence_at,
           latest_significance, average_significance, max_significance,
           trigger_contexts, evidence_refs, supporting_insight_ids,
           confidence
         ) VALUES ($1,$2,$3,$4,$5,1,$6,$6,$7,$7,$7,$8,$9,$10,$7)`,
        [
          input.memberId, patternKey, patternType,
          patternLabel, scope,
          now, sig,
          triggerContexts, evidenceRefs, insightIds,
        ]
      );
    } else {
      const row = existing.rows[0];
      const count = (row.recurrence_count as number) + 1;

      // Recompute stats
      const prevAvg = parseFloat(row.average_significance);
      const newAvg = parseFloat(((prevAvg * (count - 1) + sig) / count).toFixed(4));
      const newMax = Math.max(parseFloat(row.max_significance), sig);

      // Append trigger context (deduped, capped)
      const existingContexts: string[] = Array.isArray(row.trigger_contexts)
        ? row.trigger_contexts : JSON.parse(row.trigger_contexts || '[]');
      let newContexts = existingContexts;
      if (input.triggerContext && !existingContexts.includes(input.triggerContext)) {
        newContexts = [...existingContexts, input.triggerContext].slice(-MAX_TRIGGER_CONTEXTS);
      }

      // Append evidence ref (capped)
      const existingEvidence: object[] = Array.isArray(row.evidence_refs)
        ? row.evidence_refs : JSON.parse(row.evidence_refs || '[]');
      const newEvidence = [
        ...existingEvidence,
        { text: input.insightText.slice(0, 200), at: now },
      ].slice(-MAX_EVIDENCE_REFS);

      // Append insight ID (capped)
      const existingIds: string[] = Array.isArray(row.supporting_insight_ids)
        ? row.supporting_insight_ids : JSON.parse(row.supporting_insight_ids || '[]');
      const newIds = [...new Set([...existingIds, input.insightId])].slice(-MAX_EVIDENCE_REFS);

      await query(
        `UPDATE pattern_ledger SET
           recurrence_count = $1,
           last_evidence_at = $2,
           latest_significance = $3,
           average_significance = $4,
           max_significance = $5,
           trigger_contexts = $6::jsonb,
           evidence_refs = $7::jsonb,
           supporting_insight_ids = $8::jsonb,
           confidence = $4,
           updated_at = now()
         WHERE member_id = $9 AND pattern_key = $10`,
        [
          count, now, sig, newAvg, newMax,
          JSON.stringify(newContexts),
          JSON.stringify(newEvidence),
          JSON.stringify(newIds),
          input.memberId, patternKey,
        ]
      );
    }
  } catch (err) {
    console.warn('[PatternLedger] Upsert failed (non-critical):', err);
  }
}
