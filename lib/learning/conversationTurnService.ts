// @ts-nocheck - Learning prototype (excluded from ship path)
// backend: lib/learning/conversationTurnService.ts
// Conversation turn logging service for MAIA's sovereign learning system

import { pool } from '../database/pool';

export interface LogTurnInput {
  sessionId: string;
  turnIndex: number;
  userId?: string;
  userInput: string;
  maiaResponse: string;
  processingProfile: 'FAST' | 'CORE' | 'DEEP';
  primaryEngine: string;

  // Learning metadata
  responseTimeMs?: number;
  claudeConsultationUsed?: boolean;
  consultationType?: string;
}

export interface TurnMetadata {
  turnId: number;
  sessionId: string;
  turnIndex: number;
  processingProfile: 'FAST' | 'CORE' | 'DEEP';
  primaryEngine: string;
  createdAt: Date;
}

/**
 * MAIA Conversation Turn Logging Service
 *
 * This service provides the foundation for MAIA's learning system by logging
 * every conversation turn with metadata needed for learning analysis.
 */
export class ConversationTurnService {

  /**
   * Log a conversation turn to the learning database
   * Returns the turn ID for referencing in feedback/learning services
   */
  static async logConversationTurn(input: LogTurnInput): Promise<number> {
    const {
      sessionId,
      turnIndex,
      userId,
      userInput,
      maiaResponse,
      processingProfile,
      primaryEngine,
      responseTimeMs,
      claudeConsultationUsed = false,
      consultationType
    } = input;

    try {
      const query = `
        INSERT INTO maia_conversation_turns
          (session_id, turn_index, user_id, user_input, maia_response,
           processing_profile, primary_engine, response_time_ms,
           claude_consultation_used, consultation_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `;

      const values = [
        sessionId,
        turnIndex,
        userId ?? null,
        userInput,
        maiaResponse,
        processingProfile,
        primaryEngine,
        responseTimeMs ?? null,
        claudeConsultationUsed,
        consultationType ?? null
      ];

      const result = await pool.query(query, values);
      const turnId = result.rows[0].id as number;

      console.log(`📝 Logged conversation turn ${turnId} | Session: ${sessionId} | Profile: ${processingProfile} | Engine: ${primaryEngine}`);

      return turnId;
    } catch (error) {
      console.error('❌ Failed to log conversation turn:', error);
      throw new Error('Failed to log conversation turn for learning system');
    }
  }

  /**
   * Get conversation turn by ID
   */
  static async getTurnById(turnId: number): Promise<TurnMetadata | null> {
    try {
      const query = `
        SELECT id, session_id, turn_index, processing_profile, primary_engine, created_at
        FROM maia_conversation_turns
        WHERE id = $1
      `;

      const result = await pool.query(query, [turnId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        turnId: row.id,
        sessionId: row.session_id,
        turnIndex: row.turn_index,
        processingProfile: row.processing_profile,
        primaryEngine: row.primary_engine,
        createdAt: row.created_at
      };
    } catch (error) {
      console.error('❌ Failed to get turn by ID:', error);
      return null;
    }
  }

  /**
   * Get recent turns for a session (for context building)
   */
  static async getRecentTurnsForSession(sessionId: string, limit: number = 10): Promise<TurnMetadata[]> {
    try {
      const query = `
        SELECT id, session_id, turn_index, processing_profile, primary_engine, created_at
        FROM maia_conversation_turns
        WHERE session_id = $1
        ORDER BY turn_index DESC
        LIMIT $2
      `;

      const result = await pool.query(query, [sessionId, limit]);

      return result.rows.map(row => ({
        turnId: row.id,
        sessionId: row.session_id,
        turnIndex: row.turn_index,
        processingProfile: row.processing_profile,
        primaryEngine: row.primary_engine,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('❌ Failed to get recent turns for session:', error);
      return [];
    }
  }

  /**
   * Get learning candidates from the past period (for dreamtime processing)
   */
  static async getLearningCandidates(
    hoursBack: number = 24,
    priorityThreshold: number = 5
  ): Promise<any[]> {
    try {
      const query = `
        SELECT *
        FROM maia_learning_candidates
        WHERE created_at >= NOW() - INTERVAL '${hoursBack} hours'
          AND review_priority >= $1
        ORDER BY review_priority DESC, created_at DESC
        LIMIT 100
      `;

      const result = await pool.query(query, [priorityThreshold]);
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get learning candidates:', error);
      return [];
    }
  }

  /**
   * Get engine performance statistics
   */
  static async getEnginePerformanceStats(daysBack: number = 30): Promise<any[]> {
    try {
      const query = `
        SELECT *
        FROM maia_engine_performance
        WHERE total_responses >= 5  -- Only engines with meaningful sample size
        ORDER BY avg_attunement DESC, avg_helpfulness DESC
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get engine performance stats:', error);
      return [];
    }
  }

  /**
   * Check if learning system is properly initialized
   */
  static async checkLearningSystemHealth(): Promise<{
    tablesExist: boolean;
    recentTurns: number;
    recentFeedback: number;
    lastOperation: string | null;
  }> {
    try {
      // Check if core tables exist
      const tablesQuery = `
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_name IN (
          'maia_conversation_turns',
          'maia_interaction_feedback',
          'maia_engine_comparisons',
          'maia_gold_responses',
          'maia_misattunements'
        )
      `;
      const tablesResult = await pool.query(tablesQuery);
      const tablesExist = parseInt(tablesResult.rows[0].count) >= 5;

      // Count recent activity
      const turnsQuery = `
        SELECT COUNT(*) as count
        FROM maia_conversation_turns
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      `;
      const turnsResult = await pool.query(turnsQuery);
      const recentTurns = parseInt(turnsResult.rows[0].count);

      const feedbackQuery = `
        SELECT COUNT(*) as count
        FROM maia_interaction_feedback
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      `;
      const feedbackResult = await pool.query(feedbackQuery);
      const recentFeedback = parseInt(feedbackResult.rows[0].count);

      // Get last operation
      const lastOpQuery = `
        SELECT operation_type
        FROM maia_learning_operations
        WHERE completed_at IS NOT NULL
        ORDER BY completed_at DESC
        LIMIT 1
      `;
      const lastOpResult = await pool.query(lastOpQuery);
      const lastOperation = lastOpResult.rows.length > 0 ? lastOpResult.rows[0].operation_type : null;

      return {
        tablesExist,
        recentTurns,
        recentFeedback,
        lastOperation
      };
    } catch (error) {
      console.error('❌ Failed to check learning system health:', error);
      return {
        tablesExist: false,
        recentTurns: 0,
        recentFeedback: 0,
        lastOperation: null
      };
    }
  }
}

// Export for integration with existing MAIA services
export { ConversationTurnService as default };