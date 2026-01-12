/**
 * Decision Persistence Service
 *
 * Persists orchestrator decisions for agent evolution analysis.
 * Uses clean schema: decisions, candidates, votes, feedback (all separate).
 *
 * This enables:
 * - Agent accuracy tracking over time
 * - Dissent mining (finding prescient minority votes)
 * - Confidence calibration analysis
 * - Weight optimization based on outcomes
 *
 * Schema: 20260113000002_decision_trace_clean.sql
 */

import { query, queryOne } from '../db/postgres';
import { delegateToExecutor, isDelegationEnabled } from './executorDelegationService';

// =============================================================================
// TYPES
// =============================================================================

export interface Candidate {
  source: string;        // "mythic_atlas", "router", "classifier_v2"
  label: string;         // candidate label
  score?: number;        // raw score from source (0..1 if normalized)
  rank?: number;         // 1..k
  rationale?: string;    // short tag like "gap=12.5%" or "top2_close"
  evidence?: Record<string, any>;
}

export interface CommitteeVote {
  committee: string;     // "mythic_atlas_committee", "ain_deliberation"
  member: string;        // "shadow_agent", "cbt_agent", "dream_agent"
  label: string;         // the member's voted label
  confidence?: number;   // 0..1
  weight?: number;       // weight used in aggregation
  rationale?: string;    // short string or tag
  meta?: Record<string, any>;
}

export interface DecisionInput {
  sessionId: string;
  turnId: number;
  assistantMessageId?: string;

  // Orchestrator final choice
  finalLabel: string;             // e.g. "WATER_2::ORPHAN", "FIRE_1::WARRIOR"
  finalConfidence?: number;       // 0..1 if available
  decidedBy: string;              // "atlas_confident" | "deliberation_pending" | "committee" | "manual_override"
  mode?: string;                  // "dialogue" | "counsel" | "scribe"

  // Timing + trace
  decisionMs?: number;
  deliberationTriggered: boolean;
  triggerReason?: string;         // "atlas_uncertain" | "gap_below_threshold" | "confident_classification" | "risk_flag"

  // Classifier candidates (NOT votes)
  candidates?: Candidate[];

  // Committee votes (ONLY when committee actually runs)
  votes?: CommitteeVote[];

  // Extra metadata
  meta?: Record<string, any>;
}

export interface PersistedDecision {
  id: string;
  sessionId: string;
  turnId: number;
  assistantMessageId?: string;
  finalLabel: string;
  finalConfidence?: number;
  decidedBy: string;
  mode?: string;
  createdAt: Date;
  decisionMs?: number;
  deliberationTriggered: boolean;
  triggerReason?: string;
  meta: Record<string, any>;
}

// =============================================================================
// CORE PERSISTENCE
// =============================================================================

/**
 * Persist a decision and return its ID
 *
 * Call this for EVERY assistant turn, not just uncertain ones.
 * Confident turns provide the baseline for calibration analysis.
 *
 * The decision_id should be included in the response metadata
 * so feedback can be linked.
 */
export async function persistDecision(
  input: DecisionInput
): Promise<string> {
  try {
    // 1) Insert main decision record
    const decisionResult = await queryOne<{ id: string }>(
      `INSERT INTO maia_decisions (
        session_id,
        turn_id,
        assistant_message_id,
        final_label,
        final_confidence,
        decided_by,
        mode,
        decision_ms,
        deliberation_triggered,
        trigger_reason,
        meta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        input.sessionId,
        input.turnId,
        input.assistantMessageId ?? null,
        input.finalLabel,
        input.finalConfidence ?? null,
        input.decidedBy,
        input.mode ?? null,
        input.decisionMs ?? null,
        input.deliberationTriggered,
        input.triggerReason ?? null,
        JSON.stringify(input.meta ?? {}),
      ]
    );

    if (!decisionResult) {
      throw new Error('Decision insert returned no ID');
    }

    const decisionId = decisionResult.id;

    // 2) Insert candidates (classifier outputs - NOT votes)
    if (input.candidates && input.candidates.length > 0) {
      for (const candidate of input.candidates) {
        await query(
          `INSERT INTO maia_decision_candidates (
            decision_id,
            source,
            label,
            score,
            rank,
            rationale,
            evidence
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            decisionId,
            candidate.source,
            candidate.label,
            candidate.score ?? null,
            candidate.rank ?? null,
            candidate.rationale ?? null,
            JSON.stringify(candidate.evidence ?? {}),
          ]
        );
      }
    }

    // 3) Insert votes (ONLY when committee actually runs)
    if (input.votes && input.votes.length > 0) {
      for (const vote of input.votes) {
        await query(
          `INSERT INTO maia_decision_votes (
            decision_id,
            committee,
            member,
            label,
            confidence,
            weight,
            rationale,
            meta
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            decisionId,
            vote.committee,
            vote.member,
            vote.label,
            vote.confidence ?? null,
            vote.weight ?? getDefaultWeight(vote.member),
            vote.rationale ?? null,
            JSON.stringify(vote.meta ?? {}),
          ]
        );
      }
    }

    const candidateCount = input.candidates?.length ?? 0;
    const voteCount = input.votes?.length ?? 0;

    console.log(
      `[Decision] Persisted | id=${decisionId.slice(0, 8)}... ` +
      `| label=${input.finalLabel} ` +
      `| confidence=${input.finalConfidence?.toFixed(2) ?? 'N/A'} ` +
      `| triggered=${input.deliberationTriggered} ` +
      `| candidates=${candidateCount} votes=${voteCount}`
    );

    // ─── AGENT ZERO DELEGATION HOOK ────────────────────────────────────────────
    // If the decision implies tool execution, delegate to Agent Zero
    // Check isDelegationEnabled() to ensure Agent Zero is configured
    if (isDelegationEnabled()) {
      try {
        const delegation = await delegateToExecutor(input.finalLabel, {
          deliberation_id: decisionId,
          session_id: input.sessionId,
          user_id: input.meta?.userId || input.meta?.user_id,
          requires_tools: input.meta?.requires_tools,
          actions: input.meta?.actions,
          execution_type: input.meta?.execution_type,
          execution_risk: input.meta?.execution_risk,
          execution_title: input.meta?.execution_title,
          execution_instructions: input.meta?.execution_instructions,
          decided_by: input.decidedBy,
        });

        if (delegation.delegated) {
          // Update the decision row with executor result
          await query(
            `UPDATE maia_decisions SET meta = COALESCE(meta, '{}'::jsonb) || $1::jsonb WHERE id = $2`,
            [JSON.stringify({
              executor: {
                provider: 'agent_zero',
                taskId: delegation.task?.id,
                ok: delegation.executionResult?.ok,
                summary: delegation.executionResult?.summary,
                durationMs: delegation.executionResult?.durationMs,
              }
            }), decisionId]
          );

          console.log(
            `[Decision] Executor delegation | id=${decisionId.slice(0, 8)}... ` +
            `| task=${delegation.task?.id?.slice(0, 8) ?? 'N/A'}... ` +
            `| ok=${delegation.executionResult?.ok}`
          );
        }
      } catch (delegationError) {
        // Log but don't fail the decision persistence
        console.warn('[Decision] Executor delegation failed:', delegationError);
      }
    }
    // ─── END AGENT ZERO DELEGATION HOOK ────────────────────────────────────────

    return decisionId;
  } catch (error) {
    console.error('[Decision] Failed to persist:', error);
    // Return empty string to indicate failure (non-blocking)
    return '';
  }
}

/**
 * Get decision by ID (for debugging/analysis)
 */
export async function getDecision(
  decisionId: string
): Promise<PersistedDecision | null> {
  const result = await queryOne<any>(
    `SELECT * FROM maia_decisions WHERE id = $1`,
    [decisionId]
  );

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    sessionId: result.session_id,
    turnId: result.turn_id,
    assistantMessageId: result.assistant_message_id,
    finalLabel: result.final_label,
    finalConfidence: result.final_confidence,
    decidedBy: result.decided_by,
    mode: result.mode,
    createdAt: result.created_at,
    decisionMs: result.decision_ms,
    deliberationTriggered: result.deliberation_triggered,
    triggerReason: result.trigger_reason,
    meta: result.meta,
  };
}

/**
 * Get decision with full trace (candidates + votes)
 */
export async function getDecisionWithTrace(
  decisionId: string
): Promise<{
  decision: PersistedDecision;
  candidates: Candidate[];
  votes: CommitteeVote[];
} | null> {
  const decision = await getDecision(decisionId);
  if (!decision) return null;

  const candidatesResult = await query<any>(
    `SELECT * FROM maia_decision_candidates WHERE decision_id = $1 ORDER BY rank ASC NULLS LAST`,
    [decisionId]
  );

  const votesResult = await query<any>(
    `SELECT * FROM maia_decision_votes WHERE decision_id = $1`,
    [decisionId]
  );

  return {
    decision,
    candidates: candidatesResult.rows.map(row => ({
      source: row.source,
      label: row.label,
      score: row.score,
      rank: row.rank,
      rationale: row.rationale,
      evidence: row.evidence,
    })),
    votes: votesResult.rows.map(row => ({
      committee: row.committee,
      member: row.member,
      label: row.label,
      confidence: row.confidence,
      weight: row.weight,
      rationale: row.rationale,
      meta: row.meta,
    })),
  };
}

// =============================================================================
// ANALYTICS (using views from clean schema)
// =============================================================================

/**
 * Get agent accuracy stats (for weight optimization)
 * Uses the agent_accuracy view from clean schema
 */
export async function getAgentAccuracyStats(
  memberName: string
): Promise<{
  totalVotes: number;
  avgConfidence: number;
  votedWithConsensus: number;
  correctWhenCorrected: number;
  totalCorrections: number;
} | null> {
  const result = await queryOne<any>(
    `SELECT * FROM agent_accuracy WHERE member = $1`,
    [memberName]
  );

  if (!result) return null;

  return {
    totalVotes: parseInt(result.total_votes || '0'),
    avgConfidence: parseFloat(result.avg_confidence || '0'),
    votedWithConsensus: parseInt(result.voted_with_consensus || '0'),
    correctWhenCorrected: parseInt(result.correct_when_corrected || '0'),
    totalCorrections: parseInt(result.total_corrections || '0'),
  };
}

/**
 * Get prescient dissent cases (agents who disagreed and were right)
 * Uses the prescient_dissent view from clean schema
 */
export async function getPrescientDissent(
  limit: number = 20
): Promise<Array<{
  decisionId: string;
  finalLabel: string;
  correctedLabel: string;
  member: string;
  memberVote: string;
  memberConfidence?: number;
  rationale?: string;
  createdAt: Date;
}>> {
  const result = await query<any>(
    `SELECT * FROM prescient_dissent LIMIT $1`,
    [limit]
  );

  return result.rows.map(row => ({
    decisionId: row.decision_id,
    finalLabel: row.final_label,
    correctedLabel: row.corrected_label,
    member: row.member,
    memberVote: row.member_vote,
    memberConfidence: row.member_confidence,
    rationale: row.rationale,
    createdAt: row.created_at,
  }));
}

/**
 * Get confidence calibration data
 * Uses the confidence_calibration view from clean schema
 */
export async function getConfidenceCalibration(): Promise<Array<{
  deliberationTriggered: boolean;
  triggerReason?: string;
  confidenceBand: string;
  total: number;
  positiveOutcomes: number;
  negativeOutcomes: number;
  corrections: number;
}>> {
  const result = await query<any>(
    `SELECT * FROM confidence_calibration`
  );

  return result.rows.map(row => ({
    deliberationTriggered: row.deliberation_triggered,
    triggerReason: row.trigger_reason,
    confidenceBand: row.confidence_band,
    total: parseInt(row.total || '0'),
    positiveOutcomes: parseInt(row.positive_outcomes || '0'),
    negativeOutcomes: parseInt(row.negative_outcomes || '0'),
    corrections: parseInt(row.corrections || '0'),
  }));
}

/**
 * Get decision feedback pairs for training analysis
 * Uses the decision_feedback_pairs view from clean schema
 */
export async function getDecisionFeedbackPairs(
  options: {
    limit?: number;
    onlyPositive?: boolean;
    onlyNegative?: boolean;
    onlyCorrected?: boolean;
  } = {}
): Promise<Array<{
  decisionId: string;
  sessionId: string;
  turnId: number;
  finalLabel: string;
  finalConfidence?: number;
  decidedBy: string;
  deliberationTriggered: boolean;
  feltSeenScore?: number;
  attunementScore?: number;
  safetyScore?: number;
  depthScore?: number;
  correctedLabel?: string;
  positiveOutcome: boolean;
  negativeOutcome: boolean;
  wasCorrected: boolean;
}>> {
  let sql = `SELECT * FROM decision_feedback_pairs WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (options.onlyPositive) {
    sql += ` AND positive_outcome = TRUE`;
  }
  if (options.onlyNegative) {
    sql += ` AND negative_outcome = TRUE`;
  }
  if (options.onlyCorrected) {
    sql += ` AND was_corrected = TRUE`;
  }

  sql += ` ORDER BY created_at DESC`;

  if (options.limit) {
    sql += ` LIMIT $${paramIndex}`;
    params.push(options.limit);
  }

  const result = await query<any>(sql, params);

  return result.rows.map(row => ({
    decisionId: row.decision_id,
    sessionId: row.session_id,
    turnId: row.turn_id,
    finalLabel: row.final_label,
    finalConfidence: row.final_confidence,
    decidedBy: row.decided_by,
    deliberationTriggered: row.deliberation_triggered,
    feltSeenScore: row.felt_seen_score,
    attunementScore: row.attunement_score,
    safetyScore: row.safety_score,
    depthScore: row.depth_score,
    correctedLabel: row.corrected_label,
    positiveOutcome: row.positive_outcome,
    negativeOutcome: row.negative_outcome,
    wasCorrected: row.was_corrected,
  }));
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Default weights for committee members
 * (matches deliberation_committee.py)
 */
function getDefaultWeight(member: string): number {
  const weights: Record<string, number> = {
    mythic_atlas: 1.20,
    spiralogic_kernel: 1.20,
    shadow_agent: 1.00,
    guide_agent: 1.00,
    mentor_agent: 1.00,
    dream_agent: 0.90,
    relationship_agent: 0.90,
    cbt_agent: 0.80,
  };
  return weights[member] ?? 1.0;
}

// =============================================================================
// BACKWARD COMPATIBILITY
// =============================================================================

// Re-export old function name for backward compatibility during migration
export const persistDeliberation = persistDecision;
