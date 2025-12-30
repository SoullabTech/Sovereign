// @ts-nocheck - Learning prototype (excluded from ship path)
// backend: lib/learning/interactionFeedbackService.ts
// User feedback tracking for MAIA's Loop A micro-learning

import { pool } from '../database/pool';

export interface FeedbackInput {
  turnId: number;
  userId?: string;

  // Quantitative feedback
  helpfulnessScore?: -1 | 0 | 1;  // bad | neutral | good
  attunementScore?: 1 | 2 | 3 | 4 | 5;  // how well MAIA read the moment

  // Qualitative feedback
  feltState?: string;  // 'seen', 'confused', 'annoyed', 'hurt', 'understood'
  depthMatch?: 'too shallow' | 'just right' | 'too deep';
  repairNeeded?: boolean;  // user indicates rupture/misattunement

  // Rich feedback
  freeformNote?: string;
  emotionalTags?: string[];  // ['frustrated', 'hopeful', 'misunderstood']
}

export interface FeedbackSummary {
  turnId: number;
  overallRating: 'positive' | 'neutral' | 'negative';
  primaryIssues: string[];
  repairNeeded: boolean;
  createdAt: Date;
}

/**
 * MAIA Interaction Feedback Service
 *
 * This service captures user feedback on MAIA's responses for Loop A micro-learning.
 * Every thumbs up/down, emotional tag, and "did this land?" contributes to
 * MAIA's understanding of what constitutes good relational intelligence.
 */
export class InteractionFeedbackService {

  /**
   * Record user feedback on a conversation turn
   */
  static async recordFeedback(input: FeedbackInput): Promise<void> {
    const {
      turnId,
      userId,
      helpfulnessScore,
      attunementScore,
      feltState,
      depthMatch,
      repairNeeded = false,
      freeformNote,
      emotionalTags = []
    } = input;

    try {
      const query = `
        INSERT INTO maia_interaction_feedback
          (turn_id, user_id, helpfulness_score, attunement_score,
           felt_state, depth_match, repair_needed, freeform_note, emotional_tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;

      const values = [
        turnId,
        userId ?? null,
        helpfulnessScore ?? null,
        attunementScore ?? null,
        feltState ?? null,
        depthMatch ?? null,
        repairNeeded,
        freeformNote ?? null,
        emotionalTags.length > 0 ? emotionalTags : null
      ];

      await pool.query(query, values);

      // Log learning signal
      console.log(`💝 Feedback recorded | Turn: ${turnId} | Helpful: ${helpfulnessScore} | Attunement: ${attunementScore}/5 | Repair needed: ${repairNeeded}`);

      // If repair is needed, this should trigger rupture handling
      if (repairNeeded) {
        console.log(`🚨 Repair needed for turn ${turnId} - should trigger rupture handling`);
      }

    } catch (error) {
      console.error('❌ Failed to record feedback:', error);
      throw new Error('Failed to record interaction feedback');
    }
  }

  /**
   * Get feedback summary for a specific turn
   */
  static async getFeedbackSummary(turnId: number): Promise<FeedbackSummary | null> {
    try {
      const query = `
        SELECT
          turn_id,
          helpfulness_score,
          attunement_score,
          repair_needed,
          emotional_tags,
          created_at
        FROM maia_interaction_feedback
        WHERE turn_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await pool.query(query, [turnId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      // Determine overall rating
      let overallRating: 'positive' | 'neutral' | 'negative' = 'neutral';
      if (row.helpfulness_score === 1 || (row.attunement_score && row.attunement_score >= 4)) {
        overallRating = 'positive';
      } else if (row.helpfulness_score === -1 || row.repair_needed || (row.attunement_score && row.attunement_score <= 2)) {
        overallRating = 'negative';
      }

      // Extract primary issues
      const primaryIssues: string[] = [];
      if (row.repair_needed) {
        primaryIssues.push('repair_needed');
      }
      if (row.attunement_score && row.attunement_score <= 2) {
        primaryIssues.push('low_attunement');
      }
      if (row.helpfulness_score === -1) {
        primaryIssues.push('not_helpful');
      }

      return {
        turnId: row.turn_id,
        overallRating,
        primaryIssues,
        repairNeeded: row.repair_needed,
        createdAt: row.created_at
      };

    } catch (error) {
      console.error('❌ Failed to get feedback summary:', error);
      return null;
    }
  }

  /**
   * Get recent feedback patterns for learning analysis
   */
  static async getRecentFeedbackPatterns(hoursBack: number = 24): Promise<{
    totalFeedback: number;
    averageAttunement: number;
    repairRate: number;
    commonEmotions: string[];
    problematicPatterns: string[];
  }> {
    try {
      const query = `
        SELECT
          COUNT(*) as total_feedback,
          AVG(attunement_score) as avg_attunement,
          AVG(CASE WHEN repair_needed THEN 1 ELSE 0 END) as repair_rate,
          ARRAY_AGG(DISTINCT unnest(emotional_tags)) FILTER (WHERE emotional_tags IS NOT NULL) as all_emotions
        FROM maia_interaction_feedback
        WHERE created_at >= NOW() - INTERVAL '${hoursBack} hours'
      `;

      const result = await pool.query(query);
      const row = result.rows[0];

      // Extract problematic patterns
      const problematicQuery = `
        SELECT
          felt_state,
          COUNT(*) as occurrences
        FROM maia_interaction_feedback
        WHERE created_at >= NOW() - INTERVAL '${hoursBack} hours'
          AND (repair_needed = true OR attunement_score <= 2 OR helpfulness_score = -1)
        GROUP BY felt_state
        ORDER BY occurrences DESC
        LIMIT 5
      `;

      const problematicResult = await pool.query(problematicQuery);
      const problematicPatterns = problematicResult.rows
        .filter(r => r.felt_state)
        .map(r => `${r.felt_state}(${r.occurrences})`);

      return {
        totalFeedback: parseInt(row.total_feedback) || 0,
        averageAttunement: parseFloat(row.avg_attunement) || 0,
        repairRate: parseFloat(row.repair_rate) || 0,
        commonEmotions: row.all_emotions?.filter(Boolean).slice(0, 10) || [],
        problematicPatterns
      };

    } catch (error) {
      console.error('❌ Failed to get feedback patterns:', error);
      return {
        totalFeedback: 0,
        averageAttunement: 0,
        repairRate: 0,
        commonEmotions: [],
        problematicPatterns: []
      };
    }
  }

  /**
   * Quick feedback for thumbs up/down (common case)
   */
  static async recordQuickFeedback(
    turnId: number,
    thumbsUp: boolean,
    userId?: string
  ): Promise<void> {
    await this.recordFeedback({
      turnId,
      userId,
      helpfulnessScore: thumbsUp ? 1 : -1,
      attunementScore: thumbsUp ? 4 : 2  // assume good attunement for thumbs up
    });
  }

  /**
   * Rich feedback with emotional tags (for deeper analysis)
   */
  static async recordRichFeedback(
    turnId: number,
    feltState: string,
    emotionalTags: string[],
    userId?: string,
    notes?: string
  ): Promise<void> {
    // Determine if repair is likely needed based on felt state
    const negativeStates = ['confused', 'annoyed', 'hurt', 'dismissed', 'misunderstood'];
    const repairNeeded = negativeStates.some(state =>
      feltState.toLowerCase().includes(state)
    );

    await this.recordFeedback({
      turnId,
      userId,
      feltState,
      emotionalTags,
      repairNeeded,
      freeformNote: notes,
      // Infer scores from felt state
      helpfulnessScore: repairNeeded ? -1 : 1,
      attunementScore: repairNeeded ? 2 : 4
    });
  }
}

export default InteractionFeedbackService;