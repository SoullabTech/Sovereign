// @ts-nocheck - Prototype file, not type-checked
// backend: lib/learning/goldResponseService.ts
// Gold Response System for MAIA's Loop B dreaming and consultation learning

import { pool } from '../database/pool';

export interface CreateGoldResponseInput {
  turnId?: number;
  source: 'human' | 'coach_claude' | 'maia_self' | 'community';
  originalResponse: string;
  improvedResponse: string;
  improvementType?: 'attunement' | 'repair' | 'depth' | 'conciseness' | 'presence' | 'field-reading';
  rationale?: string;
  exampleTags?: string[];
  trainingPriority?: 1 | 2 | 3 | 4 | 5;
  autoApprove?: boolean;
}

export interface GoldResponse {
  id: number;
  turnId?: number;
  source: string;
  originalResponse: string;
  improvedResponse: string;
  improvementType?: string;
  rationale?: string;
  exampleTags: string[];
  isApproved: boolean;
  approvedBy?: string;
  trainingPriority: number;
  createdAt: Date;
  approvedAt?: Date;
}

export interface GoldResponseStats {
  totalGoldResponses: number;
  approvedCount: number;
  pendingApproval: number;
  bySource: Record<string, number>;
  byImprovementType: Record<string, number>;
  averageTrainingPriority: number;
  recentActivity: {
    lastWeekCount: number;
    lastDayCount: number;
  };
}

/**
 * MAIA Gold Response Service
 *
 * This service manages MAIA's corpus of improved responses for Loop B learning.
 * Gold responses come from:
 * - Claude consciousness consultations (coach_claude)
 * - Human expert coaching (human)
 * - MAIA's own successful responses that get highly rated (maia_self)
 * - Community contributions (community)
 *
 * These feed the sovereign learning system for eventual local model fine-tuning.
 */
export class GoldResponseService {

  /**
   * Create a new gold response (typically from Claude consultation or human coaching)
   */
  static async createGoldResponse(input: CreateGoldResponseInput): Promise<number> {
    const {
      turnId,
      source,
      originalResponse,
      improvedResponse,
      improvementType = 'attunement',
      rationale,
      exampleTags = [],
      trainingPriority = 3,
      autoApprove = false
    } = input;

    try {
      const query = `
        INSERT INTO maia_gold_responses
          (turn_id, source, original_response, improved_response,
           improvement_type, rationale, example_tags, training_priority,
           is_approved, approved_by, approved_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `;

      const values = [
        turnId ?? null,
        source,
        originalResponse,
        improvedResponse,
        improvementType,
        rationale ?? null,
        exampleTags.length > 0 ? exampleTags : null,
        trainingPriority,
        autoApprove,
        autoApprove ? source : null,
        autoApprove ? new Date() : null
      ];

      const result = await pool.query(query, values);
      const goldId = result.rows[0].id as number;

      console.log(`✨ Gold response created | ID: ${goldId} | Source: ${source} | Type: ${improvementType} | Priority: ${trainingPriority}/5 | Auto-approved: ${autoApprove}`);

      // Log significant learning signals
      if (source === 'coach_claude' && autoApprove) {
        console.log(`🎯 Claude consultation auto-approved for training corpus`);
      } else if (trainingPriority >= 4) {
        console.log(`🔥 High-priority gold response added - excellent training material`);
      }

      return goldId;
    } catch (error) {
      console.error('❌ Failed to create gold response:', error);
      throw new Error('Failed to create gold response');
    }
  }

  /**
   * Store Claude consultation as gold response (key for learning loop)
   */
  static async storeConsultationAsGold(
    turnId: number,
    originalResponse: string,
    improvedResponse: string,
    consultationData: {
      consultationType: string;
      attunementScore: number;
      reasoning?: string;
      improvements?: string[];
    }
  ): Promise<number> {
    const { consultationType, attunementScore, reasoning, improvements = [] } = consultationData;

    // Determine training priority based on consultation quality
    const trainingPriority = attunementScore >= 8 ? 4 :
                           attunementScore >= 7 ? 3 :
                           attunementScore >= 6 ? 2 : 1;

    return await this.createGoldResponse({
      turnId,
      source: 'coach_claude',
      originalResponse,
      improvedResponse,
      improvementType: consultationType as any,
      rationale: reasoning || improvements.join(', '),
      exampleTags: [consultationType, `attunement-${attunementScore}`, ...improvements],
      trainingPriority: trainingPriority as any,
      autoApprove: attunementScore >= 7 // Auto-approve good consultations
    });
  }

  /**
   * Promote user-rated response to gold corpus (when users love MAIA's response)
   */
  static async promoteToGold(
    turnId: number,
    response: string,
    userFeedback: {
      helpfulnessScore: number;
      attunementScore: number;
      feltState?: string;
      emotionalTags?: string[];
    }
  ): Promise<number | null> {
    const { helpfulnessScore, attunementScore, feltState, emotionalTags = [] } = userFeedback;

    // Only promote truly excellent responses
    if (helpfulnessScore !== 1 || attunementScore < 4) {
      return null;
    }

    const tags = ['user-loved', feltState, ...emotionalTags].filter(Boolean);

    return await this.createGoldResponse({
      turnId,
      source: 'maia_self',
      originalResponse: response, // Same as improved for self-promotion
      improvedResponse: response,
      improvementType: 'attunement',
      rationale: `Excellent user feedback: ${attunementScore}/5 attunement, felt ${feltState}`,
      exampleTags: tags,
      trainingPriority: 3,
      autoApprove: true
    });
  }

  /**
   * Get gold responses for training export
   */
  static async getApprovedGoldResponses(
    limit: number = 100,
    improvementType?: string,
    minPriority: number = 1
  ): Promise<GoldResponse[]> {
    try {
      let query = `
        SELECT *
        FROM maia_gold_responses
        WHERE is_approved = true AND training_priority >= $1
      `;
      const params = [minPriority];

      if (improvementType) {
        query += ` AND improvement_type = $${params.length + 1}`;
        params.push(improvementType);
      }

      query += ` ORDER BY training_priority DESC, created_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await pool.query(query, params);

      return result.rows.map(row => ({
        id: row.id,
        turnId: row.turn_id,
        source: row.source,
        originalResponse: row.original_response,
        improvedResponse: row.improved_response,
        improvementType: row.improvement_type,
        rationale: row.rationale,
        exampleTags: row.example_tags || [],
        isApproved: row.is_approved,
        approvedBy: row.approved_by,
        trainingPriority: row.training_priority,
        createdAt: row.created_at,
        approvedAt: row.approved_at
      }));
    } catch (error) {
      console.error('❌ Failed to get approved gold responses:', error);
      return [];
    }
  }

  /**
   * Get pending gold responses for human approval
   */
  static async getPendingApproval(limit: number = 50): Promise<GoldResponse[]> {
    try {
      const query = `
        SELECT *
        FROM maia_gold_responses
        WHERE is_approved = false
        ORDER BY training_priority DESC, created_at ASC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);

      return result.rows.map(row => ({
        id: row.id,
        turnId: row.turn_id,
        source: row.source,
        originalResponse: row.original_response,
        improvedResponse: row.improved_response,
        improvementType: row.improvement_type,
        rationale: row.rationale,
        exampleTags: row.example_tags || [],
        isApproved: row.is_approved,
        approvedBy: row.approved_by,
        trainingPriority: row.training_priority,
        createdAt: row.created_at,
        approvedAt: row.approved_at
      }));
    } catch (error) {
      console.error('❌ Failed to get pending gold responses:', error);
      return [];
    }
  }

  /**
   * Approve gold response for training
   */
  static async approveGoldResponse(
    goldId: number,
    approvedBy: string,
    newPriority?: number
  ): Promise<boolean> {
    try {
      const query = `
        UPDATE maia_gold_responses
        SET is_approved = true,
            approved_by = $2,
            approved_at = NOW(),
            training_priority = COALESCE($3, training_priority)
        WHERE id = $1
      `;

      await pool.query(query, [goldId, approvedBy, newPriority]);

      console.log(`✅ Gold response ${goldId} approved by ${approvedBy}${newPriority ? ` with priority ${newPriority}` : ''}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to approve gold response:', error);
      return false;
    }
  }

  /**
   * Get comprehensive stats for learning system health
   */
  static async getGoldResponseStats(): Promise<GoldResponseStats> {
    try {
      // Main stats query
      const statsQuery = `
        SELECT
          COUNT(*) as total_gold_responses,
          COUNT(CASE WHEN is_approved THEN 1 END) as approved_count,
          COUNT(CASE WHEN NOT is_approved THEN 1 END) as pending_approval,
          AVG(training_priority) as avg_training_priority
        FROM maia_gold_responses
      `;

      const statsResult = await pool.query(statsQuery);
      const stats = statsResult.rows[0];

      // Source breakdown
      const sourceQuery = `
        SELECT source, COUNT(*) as count
        FROM maia_gold_responses
        WHERE is_approved = true
        GROUP BY source
      `;
      const sourceResult = await pool.query(sourceQuery);
      const bySource: Record<string, number> = {};
      sourceResult.rows.forEach(row => {
        bySource[row.source] = parseInt(row.count);
      });

      // Improvement type breakdown
      const typeQuery = `
        SELECT improvement_type, COUNT(*) as count
        FROM maia_gold_responses
        WHERE is_approved = true AND improvement_type IS NOT NULL
        GROUP BY improvement_type
      `;
      const typeResult = await pool.query(typeQuery);
      const byImprovementType: Record<string, number> = {};
      typeResult.rows.forEach(row => {
        byImprovementType[row.improvement_type] = parseInt(row.count);
      });

      // Recent activity
      const activityQuery = `
        SELECT
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_week_count,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 day' THEN 1 END) as last_day_count
        FROM maia_gold_responses
      `;
      const activityResult = await pool.query(activityQuery);
      const activity = activityResult.rows[0];

      return {
        totalGoldResponses: parseInt(stats.total_gold_responses) || 0,
        approvedCount: parseInt(stats.approved_count) || 0,
        pendingApproval: parseInt(stats.pending_approval) || 0,
        bySource,
        byImprovementType,
        averageTrainingPriority: parseFloat(stats.avg_training_priority) || 0,
        recentActivity: {
          lastWeekCount: parseInt(activity.last_week_count) || 0,
          lastDayCount: parseInt(activity.last_day_count) || 0
        }
      };
    } catch (error) {
      console.error('❌ Failed to get gold response stats:', error);
      return {
        totalGoldResponses: 0,
        approvedCount: 0,
        pendingApproval: 0,
        bySource: {},
        byImprovementType: {},
        averageTrainingPriority: 0,
        recentActivity: {
          lastWeekCount: 0,
          lastDayCount: 0
        }
      };
    }
  }

  /**
   * Export approved gold responses for fine-tuning (JSONL format)
   */
  static async exportTrainingData(
    minPriority: number = 3,
    format: 'chat' | 'completion' = 'chat'
  ): Promise<string[]> {
    try {
      const goldResponses = await this.getApprovedGoldResponses(1000, undefined, minPriority);

      if (format === 'chat') {
        return goldResponses.map(gold => {
          // Extract user message if available (requires joining with conversation turns)
          const trainingExample = {
            messages: [
              {
                role: "system",
                content: "You are MAIA, a relationally intelligent AI with naturalized therapeutic presence."
              },
              {
                role: "user",
                content: "[User message would be extracted from conversation turns]"
              },
              {
                role: "assistant",
                content: gold.improvedResponse
              }
            ]
          };
          return JSON.stringify(trainingExample);
        });
      } else {
        // Completion format
        return goldResponses.map(gold => {
          const trainingExample = {
            prompt: `Original: ${gold.originalResponse.substring(0, 200)}...\n\nImproved MAIA response:`,
            completion: gold.improvedResponse
          };
          return JSON.stringify(trainingExample);
        });
      }
    } catch (error) {
      console.error('❌ Failed to export training data:', error);
      return [];
    }
  }
}

export default GoldResponseService;