// @ts-nocheck - Prototype file, not type-checked
// backend: lib/learning/engineComparisonService.ts
// Engine Comparison Service for MAIA's Loop C multi-engine constellation learning

import { pool } from '../database/pool';

export interface LogEngineResponseInput {
  turnId: number;
  engineName: string;
  isPrimary: boolean;
  responseText: string;
  responseTimeMs?: number;
  processingProfile?: 'FAST' | 'CORE' | 'DEEP';
  confidenceScore?: number; // 0-1 if engine provides it
}

export interface EngineComparison {
  id: number;
  turnId: number;
  engineName: string;
  isPrimary: boolean;
  responseText: string;
  responseTimeMs?: number;
  processingProfile?: string;
  confidenceScore?: number;
  reviewerLabel?: string;
  reviewerNote?: string;
  attunementScore?: number;
  createdAt: Date;
  reviewedAt?: Date;
}

export interface EnginePerformanceStats {
  engineName: string;
  totalResponses: number;
  avgResponseTime: number;
  avgAttunement: number;
  avgHelpfulness: number;
  misattunementCount: number;
  avgMisattunementSeverity: number;
  recentUsage: {
    lastWeekResponses: number;
    lastDayResponses: number;
  };
}

export interface ComparisonCandidate {
  turnId: number;
  sessionId: string;
  userInput: string;
  primaryEngine: string;
  primaryResponse: string;
  shadowResponses: Array<{
    engineName: string;
    responseText: string;
    responseTimeMs?: number;
  }>;
  feedbackSignal?: {
    helpfulnessScore?: number;
    attunementScore?: number;
    repairNeeded?: boolean;
  };
}

/**
 * MAIA Engine Comparison Service
 *
 * This service implements Loop C learning: multi-engine constellation testing
 * where MAIA runs multiple engines in "shadow mode" to compare responses
 * and learn which engines perform best for different types of conversations.
 *
 * Flow:
 * 1. Primary engine responds to user
 * 2. Shadow engines generate responses in parallel (user never sees)
 * 3. During dreamtime, responses are compared and ranked
 * 4. Engine preferences are learned for different conversation types
 */
export class EngineComparisonService {

  /**
   * Log engine response (primary or shadow) for comparison learning
   */
  static async logEngineResponse(input: LogEngineResponseInput): Promise<number> {
    const {
      turnId,
      engineName,
      isPrimary,
      responseText,
      responseTimeMs,
      processingProfile,
      confidenceScore
    } = input;

    try {
      const query = `
        INSERT INTO maia_engine_comparisons
          (turn_id, engine_name, is_primary, response_text,
           response_time_ms, processing_profile, confidence_score)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;

      const values = [
        turnId,
        engineName,
        isPrimary,
        responseText,
        responseTimeMs ?? null,
        processingProfile ?? null,
        confidenceScore ?? null
      ];

      const result = await pool.query(query, values);
      const comparisonId = result.rows[0].id as number;

      const responseType = isPrimary ? 'PRIMARY' : 'SHADOW';
      console.log(`🔬 ${responseType} engine response logged | Turn: ${turnId} | Engine: ${engineName} | Time: ${responseTimeMs}ms`);

      return comparisonId;
    } catch (error) {
      console.error('❌ Failed to log engine response:', error);
      throw new Error('Failed to log engine response for comparison');
    }
  }

  /**
   * Log multiple shadow engine responses at once (common case)
   */
  static async logShadowResponses(
    turnId: number,
    shadowResponses: Array<{
      engineName: string;
      responseText: string;
      responseTimeMs?: number;
      confidenceScore?: number;
    }>,
    processingProfile?: 'FAST' | 'CORE' | 'DEEP'
  ): Promise<number[]> {
    const comparisonIds: number[] = [];

    for (const shadow of shadowResponses) {
      try {
        const id = await this.logEngineResponse({
          turnId,
          engineName: shadow.engineName,
          isPrimary: false,
          responseText: shadow.responseText,
          responseTimeMs: shadow.responseTimeMs,
          processingProfile,
          confidenceScore: shadow.confidenceScore
        });
        comparisonIds.push(id);
      } catch (error) {
        console.warn(`⚠️ Failed to log shadow response from ${shadow.engineName}:`, error);
      }
    }

    console.log(`🔬 Logged ${comparisonIds.length}/${shadowResponses.length} shadow responses for turn ${turnId}`);
    return comparisonIds;
  }

  /**
   * Review/rank engine response (done during dreamtime processing)
   */
  static async reviewEngineResponse(
    comparisonId: number,
    review: {
      label: 'better' | 'worse' | 'neutral' | 'interesting';
      note?: string;
      attunementScore?: number; // 1-10
      reviewedBy?: string;
    }
  ): Promise<boolean> {
    const { label, note, attunementScore, reviewedBy = 'system' } = review;

    try {
      const query = `
        UPDATE maia_engine_comparisons
        SET reviewer_label = $2,
            reviewer_note = $3,
            attunement_score = $4,
            reviewed_at = NOW()
        WHERE id = $1
      `;

      await pool.query(query, [comparisonId, label, note, attunementScore]);

      console.log(`📝 Engine response reviewed | ID: ${comparisonId} | Label: ${label} | Attunement: ${attunementScore}/10`);
      return true;
    } catch (error) {
      console.error('❌ Failed to review engine response:', error);
      return false;
    }
  }

  /**
   * Get unreviewed engine comparisons for dreamtime processing
   */
  static async getUnreviewedComparisons(
    limit: number = 50,
    priorityTurns?: number[]
  ): Promise<ComparisonCandidate[]> {
    try {
      let query = `
        SELECT
          t.id as turn_id,
          t.session_id,
          t.user_input,
          t.primary_engine,
          t.maia_response as primary_response,
          ec.engine_name,
          ec.response_text,
          ec.response_time_ms,
          ec.is_primary,
          f.helpfulness_score,
          f.attunement_score,
          f.repair_needed
        FROM maia_conversation_turns t
        LEFT JOIN maia_engine_comparisons ec ON t.id = ec.turn_id
        LEFT JOIN maia_interaction_feedback f ON t.id = f.turn_id
        WHERE ec.reviewed_at IS NULL
          AND t.created_at >= NOW() - INTERVAL '7 days'
      `;

      const params: any[] = [];

      if (priorityTurns && priorityTurns.length > 0) {
        query += ` AND t.id = ANY($${params.length + 1})`;
        params.push(priorityTurns);
      }

      query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await pool.query(query, params);

      // Group by turn_id
      const candidatesMap = new Map<number, ComparisonCandidate>();

      for (const row of result.rows) {
        const turnId = row.turn_id;

        if (!candidatesMap.has(turnId)) {
          candidatesMap.set(turnId, {
            turnId,
            sessionId: row.session_id,
            userInput: row.user_input,
            primaryEngine: row.primary_engine,
            primaryResponse: row.primary_response,
            shadowResponses: [],
            feedbackSignal: {
              helpfulnessScore: row.helpfulness_score,
              attunementScore: row.attunement_score,
              repairNeeded: row.repair_needed
            }
          });
        }

        const candidate = candidatesMap.get(turnId)!;

        if (!row.is_primary && row.engine_name && row.response_text) {
          candidate.shadowResponses.push({
            engineName: row.engine_name,
            responseText: row.response_text,
            responseTimeMs: row.response_time_ms
          });
        }
      }

      const candidates = Array.from(candidatesMap.values())
        .filter(candidate => candidate.shadowResponses.length > 0); // Only turns with shadow responses

      return candidates;
    } catch (error) {
      console.error('❌ Failed to get unreviewed comparisons:', error);
      return [];
    }
  }

  /**
   * Get engine performance statistics
   */
  static async getEnginePerformanceStats(daysBack: number = 30): Promise<EnginePerformanceStats[]> {
    try {
      const query = `
        SELECT * FROM maia_engine_performance
        WHERE total_responses >= 5
        ORDER BY avg_attunement DESC, avg_helpfulness DESC
      `;

      const result = await pool.query(query);

      // Also get recent usage stats
      const usageQuery = `
        SELECT
          engine_name,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_week_responses,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 day' THEN 1 END) as last_day_responses
        FROM maia_engine_comparisons
        WHERE created_at >= NOW() - INTERVAL '${daysBack} days'
        GROUP BY engine_name
      `;

      const usageResult = await pool.query(usageQuery);
      const usageMap = new Map();
      usageResult.rows.forEach(row => {
        usageMap.set(row.engine_name, {
          lastWeekResponses: parseInt(row.last_week_responses),
          lastDayResponses: parseInt(row.last_day_responses)
        });
      });

      return result.rows.map(row => ({
        engineName: row.engine_name,
        totalResponses: row.total_responses || 0,
        avgResponseTime: parseFloat(row.avg_response_time) || 0,
        avgAttunement: parseFloat(row.avg_attunement) || 0,
        avgHelpfulness: parseFloat(row.avg_helpfulness) || 0,
        misattunementCount: row.misattunement_count || 0,
        avgMisattunementSeverity: parseFloat(row.avg_misattunement_severity) || 0,
        recentUsage: usageMap.get(row.engine_name) || {
          lastWeekResponses: 0,
          lastDayResponses: 0
        }
      }));
    } catch (error) {
      console.error('❌ Failed to get engine performance stats:', error);
      return [];
    }
  }

  /**
   * Get best engine recommendation for conversation type
   */
  static async getBestEngineForProfile(
    processingProfile: 'FAST' | 'CORE' | 'DEEP',
    minSampleSize: number = 10
  ): Promise<{
    recommendedEngine: string;
    confidence: number;
    stats: {
      avgAttunement: number;
      avgResponseTime: number;
      sampleSize: number;
    };
  } | null> {
    try {
      const query = `
        SELECT
          ec.engine_name,
          AVG(f.attunement_score) as avg_attunement,
          AVG(ec.response_time_ms) as avg_response_time,
          COUNT(*) as sample_size
        FROM maia_engine_comparisons ec
        JOIN maia_conversation_turns t ON ec.turn_id = t.id
        LEFT JOIN maia_interaction_feedback f ON t.id = f.turn_id
        WHERE ec.processing_profile = $1
          AND f.attunement_score IS NOT NULL
          AND ec.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY ec.engine_name
        HAVING COUNT(*) >= $2
        ORDER BY AVG(f.attunement_score) DESC, AVG(ec.response_time_ms) ASC
        LIMIT 1
      `;

      const result = await pool.query(query, [processingProfile, minSampleSize]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const avgAttunement = parseFloat(row.avg_attunement);
      const sampleSize = parseInt(row.sample_size);

      // Calculate confidence based on sample size and performance
      const confidence = Math.min(
        (sampleSize / 100) * (avgAttunement / 5),
        1.0
      );

      return {
        recommendedEngine: row.engine_name,
        confidence,
        stats: {
          avgAttunement,
          avgResponseTime: parseFloat(row.avg_response_time) || 0,
          sampleSize
        }
      };
    } catch (error) {
      console.error('❌ Failed to get best engine for profile:', error);
      return null;
    }
  }

  /**
   * Batch review multiple comparisons (for automated dreamtime processing)
   */
  static async batchReviewComparisons(
    reviews: Array<{
      comparisonId: number;
      label: 'better' | 'worse' | 'neutral' | 'interesting';
      attunementScore?: number;
      note?: string;
    }>,
    reviewedBy: string = 'dreamtime-auto'
  ): Promise<number> {
    let successCount = 0;

    for (const review of reviews) {
      try {
        const success = await this.reviewEngineResponse(review.comparisonId, {
          label: review.label,
          note: review.note,
          attunementScore: review.attunementScore,
          reviewedBy
        });

        if (success) successCount++;
      } catch (error) {
        console.warn(`⚠️ Failed to review comparison ${review.comparisonId}:`, error);
      }
    }

    console.log(`📊 Batch review complete: ${successCount}/${reviews.length} comparisons processed`);
    return successCount;
  }

  /**
   * Get engine comparison analytics for insights
   */
  static async getComparisonAnalytics(daysBack: number = 7): Promise<{
    totalComparisons: number;
    totalTurns: number;
    avgShadowResponsesPerTurn: number;
    mostActiveEngines: Array<{ name: string; count: number }>;
    reviewProgress: {
      reviewed: number;
      pending: number;
      percentage: number;
    };
  }> {
    try {
      // Main stats
      const statsQuery = `
        SELECT
          COUNT(*) as total_comparisons,
          COUNT(DISTINCT turn_id) as total_turns,
          COUNT(CASE WHEN reviewed_at IS NOT NULL THEN 1 END) as reviewed,
          COUNT(CASE WHEN reviewed_at IS NULL THEN 1 END) as pending
        FROM maia_engine_comparisons
        WHERE created_at >= NOW() - INTERVAL '${daysBack} days'
      `;

      const statsResult = await pool.query(statsQuery);
      const stats = statsResult.rows[0];

      // Engine activity
      const activityQuery = `
        SELECT engine_name, COUNT(*) as count
        FROM maia_engine_comparisons
        WHERE created_at >= NOW() - INTERVAL '${daysBack} days'
        GROUP BY engine_name
        ORDER BY count DESC
        LIMIT 5
      `;

      const activityResult = await pool.query(activityQuery);

      const totalComparisons = parseInt(stats.total_comparisons) || 0;
      const totalTurns = parseInt(stats.total_turns) || 0;
      const reviewed = parseInt(stats.reviewed) || 0;
      const pending = parseInt(stats.pending) || 0;

      return {
        totalComparisons,
        totalTurns,
        avgShadowResponsesPerTurn: totalTurns > 0 ? totalComparisons / totalTurns : 0,
        mostActiveEngines: activityResult.rows.map(row => ({
          name: row.engine_name,
          count: parseInt(row.count)
        })),
        reviewProgress: {
          reviewed,
          pending,
          percentage: totalComparisons > 0 ? (reviewed / totalComparisons) * 100 : 0
        }
      };
    } catch (error) {
      console.error('❌ Failed to get comparison analytics:', error);
      return {
        totalComparisons: 0,
        totalTurns: 0,
        avgShadowResponsesPerTurn: 0,
        mostActiveEngines: [],
        reviewProgress: {
          reviewed: 0,
          pending: 0,
          percentage: 0
        }
      };
    }
  }
}

export default EngineComparisonService;