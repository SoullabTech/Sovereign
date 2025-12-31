/**
 * Conversation Memory Uses Store
 *
 * Tracks which memories MAIA used in each response.
 * Essential for:
 * - Debugging wrong recalls
 * - User transparency ("MAIA remembered X because...")
 * - Training data for retrieval improvements
 * - Memory quality analytics
 */

import { query } from '../../db/postgres';

export type MemoryUseType =
  | 'preference'      // User preference applied
  | 'evidence'        // Supporting evidence for insight
  | 'pattern'         // Derived pattern referenced
  | 'counterexample'  // Contrasting memory for nuance
  | 'context'         // Background context
  | 'breakthrough';   // Referenced breakthrough moment

export type MemoryUseFeedback = 'helpful' | 'irrelevant' | 'wrong';

export interface ConversationMemoryUse {
  id: string;
  userId: string;
  sessionId: string;
  messageId: string;
  memoryTable: string;
  memoryId: string;
  usedAs: MemoryUseType;
  retrievalScore?: number;
  semanticScore?: number;
  recencyScore?: number;
  confidenceScore?: number;
  userFeedback?: MemoryUseFeedback;
  feedbackNote?: string;
  createdAt: string;
}

export interface RecordMemoryUseInput {
  userId: string;
  sessionId: string;
  messageId: string;
  memoryTable: string;
  memoryId: string;
  usedAs: MemoryUseType;
  retrievalScore?: number;
  semanticScore?: number;
  recencyScore?: number;
  confidenceScore?: number;
}

export const ConversationMemoryUsesStore = {
  /**
   * Record a memory being used in a response
   */
  async recordUse(input: RecordMemoryUseInput): Promise<string> {
    const result = await query<{ id: string }>(
      `
      INSERT INTO conversation_memory_uses (
        user_id, session_id, message_id,
        memory_table, memory_id, used_as,
        retrieval_score, semantic_score, recency_score, confidence_score
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
      `,
      [
        input.userId,
        input.sessionId,
        input.messageId,
        input.memoryTable,
        input.memoryId,
        input.usedAs,
        input.retrievalScore ?? null,
        input.semanticScore ?? null,
        input.recencyScore ?? null,
        input.confidenceScore ?? null,
      ]
    );

    return result.rows[0]?.id ?? '';
  },

  /**
   * Batch record multiple memory uses for a single response
   */
  async recordBatch(
    userId: string,
    sessionId: string,
    messageId: string,
    uses: Array<{
      memoryTable: string;
      memoryId: string;
      usedAs: MemoryUseType;
      retrievalScore?: number;
      semanticScore?: number;
      recencyScore?: number;
      confidenceScore?: number;
    }>
  ): Promise<void> {
    if (uses.length === 0) return;

    // Build batch insert
    const values: any[] = [];
    const placeholders: string[] = [];
    let paramIndex = 1;

    for (const use of uses) {
      placeholders.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
      );
      values.push(
        userId,
        sessionId,
        messageId,
        use.memoryTable,
        use.memoryId,
        use.usedAs,
        use.retrievalScore ?? null,
        use.semanticScore ?? null,
        use.recencyScore ?? null,
        use.confidenceScore ?? null
      );
    }

    await query(
      `
      INSERT INTO conversation_memory_uses (
        user_id, session_id, message_id,
        memory_table, memory_id, used_as,
        retrieval_score, semantic_score, recency_score, confidence_score
      )
      VALUES ${placeholders.join(', ')}
      `,
      values
    );
  },

  /**
   * Get memories used in a specific message/response
   */
  async getForMessage(messageId: string): Promise<ConversationMemoryUse[]> {
    const result = await query<ConversationMemoryUse>(
      `
      SELECT
        id,
        user_id as "userId",
        session_id as "sessionId",
        message_id as "messageId",
        memory_table as "memoryTable",
        memory_id as "memoryId",
        used_as as "usedAs",
        retrieval_score as "retrievalScore",
        semantic_score as "semanticScore",
        recency_score as "recencyScore",
        confidence_score as "confidenceScore",
        user_feedback as "userFeedback",
        feedback_note as "feedbackNote",
        created_at as "createdAt"
      FROM conversation_memory_uses
      WHERE message_id = $1
      ORDER BY retrieval_score DESC NULLS LAST
      `,
      [messageId]
    );

    return result.rows ?? [];
  },

  /**
   * Get recent memory uses for a user (for analytics/debugging)
   */
  async getRecentForUser(userId: string, limit: number = 50): Promise<ConversationMemoryUse[]> {
    const result = await query<ConversationMemoryUse>(
      `
      SELECT
        id,
        user_id as "userId",
        session_id as "sessionId",
        message_id as "messageId",
        memory_table as "memoryTable",
        memory_id as "memoryId",
        used_as as "usedAs",
        retrieval_score as "retrievalScore",
        semantic_score as "semanticScore",
        recency_score as "recencyScore",
        confidence_score as "confidenceScore",
        user_feedback as "userFeedback",
        feedback_note as "feedbackNote",
        created_at as "createdAt"
      FROM conversation_memory_uses
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    return result.rows ?? [];
  },

  /**
   * Record user feedback on memory retrieval quality
   */
  async recordFeedback(
    id: string,
    feedback: MemoryUseFeedback,
    note?: string
  ): Promise<void> {
    await query(
      `
      UPDATE conversation_memory_uses
      SET user_feedback = $1, feedback_note = $2
      WHERE id = $3
      `,
      [feedback, note ?? null, id]
    );
  },

  /**
   * Get memories frequently marked as wrong (for retrieval improvement)
   */
  async getProblematicMemories(
    userId: string,
    sinceDate?: Date
  ): Promise<Array<{ memoryTable: string; memoryId: string; wrongCount: number }>> {
    const since = sinceDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days

    const result = await query<{ memoryTable: string; memoryId: string; wrongCount: number }>(
      `
      SELECT
        memory_table as "memoryTable",
        memory_id as "memoryId",
        COUNT(*) as "wrongCount"
      FROM conversation_memory_uses
      WHERE user_id = $1
        AND user_feedback = 'wrong'
        AND created_at >= $2
      GROUP BY memory_table, memory_id
      HAVING COUNT(*) >= 2
      ORDER BY "wrongCount" DESC
      `,
      [userId, since.toISOString()]
    );

    return result.rows ?? [];
  },

  /**
   * Analytics: Get retrieval effectiveness stats
   */
  async getRetrievalStats(userId: string): Promise<{
    totalUses: number;
    helpfulCount: number;
    irrelevantCount: number;
    wrongCount: number;
    avgRetrievalScore: number;
  }> {
    const result = await query<{
      totalUses: string;
      helpfulCount: string;
      irrelevantCount: string;
      wrongCount: string;
      avgRetrievalScore: string;
    }>(
      `
      SELECT
        COUNT(*) as "totalUses",
        COUNT(*) FILTER (WHERE user_feedback = 'helpful') as "helpfulCount",
        COUNT(*) FILTER (WHERE user_feedback = 'irrelevant') as "irrelevantCount",
        COUNT(*) FILTER (WHERE user_feedback = 'wrong') as "wrongCount",
        AVG(retrieval_score) as "avgRetrievalScore"
      FROM conversation_memory_uses
      WHERE user_id = $1
      `,
      [userId]
    );

    const row = result.rows[0];
    return {
      totalUses: parseInt(row?.totalUses ?? '0', 10),
      helpfulCount: parseInt(row?.helpfulCount ?? '0', 10),
      irrelevantCount: parseInt(row?.irrelevantCount ?? '0', 10),
      wrongCount: parseInt(row?.wrongCount ?? '0', 10),
      avgRetrievalScore: parseFloat(row?.avgRetrievalScore ?? '0'),
    };
  },
};
