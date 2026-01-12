/**
 * Deliberation Persistence Service
 *
 * Persists committee deliberation results for agent evolution analysis.
 * Links deliberations to turns and feedback for training signal capture.
 *
 * This enables:
 * - Agent accuracy tracking over time
 * - Dissent mining (finding prescient minority votes)
 * - Confidence calibration analysis
 * - Weight optimization based on outcomes
 */

import { query } from '../db/postgres';
import { randomUUID } from 'crypto';

export interface CommitteeVote {
  member: string;
  classification: string;
  confidence: number;
  rationale?: string;
  flags?: string[];
  weight?: number;
}

export interface DeliberationInput {
  sessionId?: string;
  turnId?: number;
  committee?: string;
  finalClassification: string;
  finalConfidence?: number;
  decidedBy?: string;
  votes: CommitteeVote[];
  deliberationMs?: number;
  notes?: string;
  meta?: Record<string, any>;
}

export interface PersistedDeliberation {
  id: string;
  sessionId?: string;
  turnId?: number;
  committee: string;
  finalClassification: string;
  finalConfidence?: number;
  decidedBy: string;
  votesJson: CommitteeVote[];
  deliberationMs?: number;
  notes?: string;
  createdAt: Date;
}

/**
 * Persist a deliberation result and return its ID
 *
 * Call this when a committee deliberation occurs, BEFORE returning
 * the response to the user. The deliberation_id should be included
 * in the response metadata so feedback can be linked.
 */
export async function persistDeliberation(
  input: DeliberationInput
): Promise<string> {
  const deliberationId = randomUUID();

  try {
    // Add weights to votes if not present (for analysis)
    const votesWithWeights = input.votes.map(vote => ({
      ...vote,
      weight: vote.weight ?? getDefaultWeight(vote.member),
    }));

    await query(
      `INSERT INTO deliberations (
        id,
        session_id,
        turn_id,
        committee,
        final_classification,
        final_confidence,
        decided_by,
        votes_json,
        deliberation_ms,
        notes,
        meta_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        deliberationId,
        input.sessionId ?? null,
        input.turnId ?? null,
        input.committee ?? 'mythic_atlas',
        input.finalClassification,
        input.finalConfidence ?? null,
        input.decidedBy ?? 'committee',
        JSON.stringify(votesWithWeights),
        input.deliberationMs ?? null,
        input.notes ?? null,
        input.meta ? JSON.stringify(input.meta) : null,
      ]
    );

    // If turnId provided, link the turn to this deliberation
    if (input.turnId) {
      await query(
        `UPDATE maia_turns SET deliberation_id = $1 WHERE id = $2`,
        [deliberationId, input.turnId]
      );
    }

    console.log(
      `[Deliberation] Persisted | id=${deliberationId.slice(0, 8)}... ` +
      `| classification=${input.finalClassification} ` +
      `| confidence=${input.finalConfidence?.toFixed(2) ?? 'N/A'} ` +
      `| votes=${input.votes.length}`
    );

    return deliberationId;
  } catch (error) {
    console.error('[Deliberation] Failed to persist:', error);
    // Return the ID anyway so the flow continues
    // The deliberation just won't be linked for analysis
    return deliberationId;
  }
}

/**
 * Link feedback to a deliberation (for cases where feedback comes later)
 */
export async function linkFeedbackToDeliberation(
  feedbackId: number,
  deliberationId: string
): Promise<void> {
  try {
    await query(
      `UPDATE maia_turn_feedback SET deliberation_id = $1 WHERE id = $2`,
      [deliberationId, feedbackId]
    );
  } catch (error) {
    console.error('[Deliberation] Failed to link feedback:', error);
  }
}

/**
 * Get deliberation by ID (for debugging/analysis)
 */
export async function getDeliberation(
  deliberationId: string
): Promise<PersistedDeliberation | null> {
  const result = await query<any>(
    `SELECT * FROM deliberations WHERE id = $1`,
    [deliberationId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    sessionId: row.session_id,
    turnId: row.turn_id,
    committee: row.committee,
    finalClassification: row.final_classification,
    finalConfidence: row.final_confidence,
    decidedBy: row.decided_by,
    votesJson: row.votes_json,
    deliberationMs: row.deliberation_ms,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

/**
 * Get agent accuracy stats (for weight optimization)
 */
export async function getAgentAccuracyStats(
  agentName: string,
  daysBack: number = 30
): Promise<{
  totalVotes: number;
  votedWithConsensus: number;
  positiveOutcomes: number;
  negativeOutcomes: number;
  averageConfidence: number;
}> {
  const result = await query<any>(
    `SELECT
      COUNT(*) as total_votes,
      SUM(CASE WHEN voted_with_consensus THEN 1 ELSE 0 END) as voted_with_consensus,
      SUM(CASE WHEN positive_outcome THEN 1 ELSE 0 END) as positive_outcomes,
      SUM(CASE WHEN positive_outcome = FALSE AND attunement_score IS NOT NULL THEN 1 ELSE 0 END) as negative_outcomes,
      AVG(agent_confidence) as avg_confidence
    FROM agent_vote_outcomes
    WHERE agent = $1
      AND created_at >= NOW() - INTERVAL '1 day' * $2`,
    [agentName, daysBack]
  );

  const row = result.rows[0] || {};
  return {
    totalVotes: parseInt(row.total_votes || '0'),
    votedWithConsensus: parseInt(row.voted_with_consensus || '0'),
    positiveOutcomes: parseInt(row.positive_outcomes || '0'),
    negativeOutcomes: parseInt(row.negative_outcomes || '0'),
    averageConfidence: parseFloat(row.avg_confidence || '0'),
  };
}

/**
 * Get prescient dissent cases (agents who disagreed and were right)
 */
export async function getPrescientDissent(
  limit: number = 20
): Promise<Array<{
  agent: string;
  agentVote: string;
  agentConfidence: number;
  finalClassification: string;
  attunementScore: number;
  createdAt: Date;
}>> {
  const result = await query<any>(
    `SELECT * FROM prescient_dissent LIMIT $1`,
    [limit]
  );

  return result.rows.map(row => ({
    agent: row.agent,
    agentVote: row.agent_vote,
    agentConfidence: row.agent_confidence,
    finalClassification: row.final_classification,
    attunementScore: row.attunement_score,
    createdAt: row.created_at,
  }));
}

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
