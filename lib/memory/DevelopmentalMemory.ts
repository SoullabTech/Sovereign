/**
 * DEVELOPMENTAL MEMORY SYSTEM
 *
 * Enables MAIA to remember and learn across sessions, connecting patterns
 * and building wisdom-level understanding for each member.
 *
 * Based on: artifacts/DEVELOPMENTAL_MEMORY_ARCHITECTURE.md
 * Database: developmental_memories table in maia_consciousness
 *
 * Philosophy:
 * - Surprise-based memory formation (breakthroughs, corrections, transitions)
 * - Entity + semantic retrieval for contextual recall
 * - Spiralogic-aware (tracks facets, cycles, growth)
 * - User feedback loops for continuous learning
 */

import { query as dbQuery } from '@/lib/db/postgres';
import { generateLocalEmbedding } from './embeddings';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type MemoryType =
  | 'effective_practice'      // Practice that worked well (8+/10)
  | 'ineffective_practice'    // Practice that didn't work (<= 3/10)
  | 'spiral_transition'       // Moving between Spiralogic facets
  | 'breakthrough_emergence'  // AIN ⭐⭐⭐ deliberation
  | 'ain_deliberation'        // Any AIN committee result
  | 'correction'              // User corrected MAIA
  | 'pattern';                // Detected recurring pattern

export interface DevelopmentalMemory {
  id: string;
  userId: string;
  memoryType: MemoryType;
  triggerEvent: any;  // JSONB - flexible event data
  facetCode?: string;  // e.g., "WATER-2", "FIRE-3"
  spiralCycle?: number;
  significance: number;  // 0-1, higher = more important
  formedAt: Date;
  recallCount: number;
  lastRecalledAt?: Date;
  vectorEmbedding?: number[];
  entityTags: string[];  // People, places, concepts, body regions
  userFeedback?: any;  // JSONB - thumbs up/down with context

  // Links to source events
  sourceBeadsTaskId?: string;
  sourceAinSessionId?: string;
  sourceConsciousnessEntryId?: string;

  // 🔮 CANON FIELDS: For canon beads with direct content
  contentText?: string;  // The actual canon text content
  authority?: string;    // 'CANON', 'MEMORY', 'RETRIEVAL', etc.
  scope?: string;        // 'GLOBAL', 'USER', etc.
}

export interface FormMemoryInput {
  userId: string;
  type: MemoryType;
  triggerEvent: any;
  facetCode?: string;
  spiralCycle?: number;
  significance?: number;
  entityTags?: string[];
  sourceBeadsTaskId?: string;
  sourceAinSessionId?: string;
  sourceConsciousnessEntryId?: string;
}

export interface RetrieveMemoriesInput {
  userId: string;
  entities?: string[];  // Filter by entity (e.g., ["shoulders", "breathing"])
  facet?: string;       // Filter by facet (e.g., "WATER-2")
  type?: MemoryType | MemoryType[];
  limit?: number;
  minSignificance?: number;
}

export interface MemoryFeedback {
  memoryId: string;
  feedback: 'up' | 'down';
  context?: string;  // What was happening when feedback given
  facetContext?: string;  // User's facet at feedback time
}

// ═══════════════════════════════════════════════════════════════
// DEVELOPMENTAL MEMORY SERVICE
// ═══════════════════════════════════════════════════════════════

export class DevelopmentalMemoryService {

  /**
   * FORM MEMORY
   *
   * Creates a new memory from a consciousness event.
   * Uses surprise-based triggers:
   * - High effectiveness (8+/10) → strong memory
   * - Breakthroughs (⭐⭐⭐) → very strong memory
   * - Transitions → significant memory
   * - Corrections → learning memory
   */
  async formMemory(input: FormMemoryInput): Promise<DevelopmentalMemory> {
    console.log(`🌀 [DEVELOPMENTAL MEMORY] Forming ${input.type} memory...`);

    // Generate embedding for semantic search
    const embeddingText = this.extractEmbeddingText(input);
    const vectorEmbedding = await generateLocalEmbedding(embeddingText);

    // Default significance based on memory type
    const defaultSignificance = {
      breakthrough_emergence: 0.95,
      spiral_transition: 0.90,
      correction: 0.85,
      effective_practice: 0.80,
      ain_deliberation: 0.75,
      ineffective_practice: 0.70,
      pattern: 0.60,
    };

    const significance = input.significance ?? defaultSignificance[input.type];

    const query = `
      INSERT INTO developmental_memories (
        user_id, memory_type, trigger_event, facet_code, spiral_cycle,
        significance, vector_embedding, entity_tags,
        source_beads_task_id, source_ain_session_id, source_consciousness_entry_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await dbQuery(query, [
      input.userId,
      input.type,
      JSON.stringify(input.triggerEvent),
      input.facetCode,
      input.spiralCycle ?? 1,
      significance,
      vectorEmbedding.length > 0 ? `{${vectorEmbedding.join(',')}}` : null,
      input.entityTags ?? [],
      input.sourceBeadsTaskId,
      input.sourceAinSessionId,
      input.sourceConsciousnessEntryId,
    ]);

    const memory = this.parseMemory(result.rows[0]);
    console.log(`✅ [MEMORY FORMED] ID: ${memory.id}, Type: ${memory.memoryType}, Significance: ${memory.significance}`);

    return memory;
  }

  /**
   * RETRIEVE MEMORIES
   *
   * Retrieves relevant memories using:
   * - Entity matching (exact match on entity_tags)
   * - Facet filtering (same Spiralogic position)
   * - Type filtering
   * - Significance threshold
   *
   * Returns most significant + recent first.
   */
  async retrieveMemories(input: RetrieveMemoriesInput): Promise<DevelopmentalMemory[]> {
    console.log(`🔍 [MEMORY RETRIEVAL] User: ${input.userId}, Entities: ${input.entities?.join(', ')}`);

    let query = `
      SELECT * FROM developmental_memories
      WHERE user_id = $1
    `;

    const params: any[] = [input.userId];
    let paramIndex = 2;

    // Filter by entities (contains ANY of the provided entities)
    if (input.entities && input.entities.length > 0) {
      query += ` AND entity_tags && $${paramIndex}`;
      params.push(input.entities);
      paramIndex++;
    }

    // Filter by facet
    if (input.facet) {
      query += ` AND facet_code = $${paramIndex}`;
      params.push(input.facet);
      paramIndex++;
    }

    // Filter by memory type
    if (input.type) {
      const types = Array.isArray(input.type) ? input.type : [input.type];
      query += ` AND memory_type = ANY($${paramIndex})`;
      params.push(types);
      paramIndex++;
    }

    // Filter by minimum significance
    if (input.minSignificance !== undefined) {
      query += ` AND significance >= $${paramIndex}`;
      params.push(input.minSignificance);
      paramIndex++;
    }

    // Order by significance DESC, then recency
    query += ` ORDER BY significance DESC, formed_at DESC`;

    // Limit results
    if (input.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(input.limit);
    }

    const result = await dbQuery(query, params);
    const memories = result.rows.map(row => this.parseMemory(row));

    // Update recall count for retrieved memories
    if (memories.length > 0) {
      await this.incrementRecallCounts(memories.map(m => m.id));
    }

    console.log(`📚 [RETRIEVED] ${memories.length} memories`);
    return memories;
  }

  /**
   * SEMANTIC SEARCH
   *
   * Finds memories by semantic similarity using vector embeddings.
   * Requires Ollama to be running for embeddings.
   */
  async semanticSearch(
    userId: string,
    query: string,
    limit: number = 10,
    threshold: number = 0.65
  ): Promise<DevelopmentalMemory[]> {
    console.log(`🔎 [SEMANTIC SEARCH] Query: "${query.substring(0, 50)}..."`);

    // Generate query embedding
    const queryEmbedding = await generateLocalEmbedding(query);

    if (queryEmbedding.length === 0) {
      console.warn('[SEMANTIC SEARCH] No embedding generated, falling back to empty results');
      return [];
    }

    // Cosine similarity search using pgvector
    const sql = `
      SELECT *,
        1 - (vector_embedding <=> $1::vector) as similarity
      FROM developmental_memories
      WHERE user_id = $2
        AND vector_embedding IS NOT NULL
        AND 1 - (vector_embedding <=> $1::vector) >= $3
      ORDER BY similarity DESC
      LIMIT $4
    `;

    const result = await dbQuery(sql, [
      `[${queryEmbedding.join(',')}]`,
      userId,
      threshold,
      limit,
    ]);

    const memories = result.rows.map(row => this.parseMemory(row));

    if (memories.length > 0) {
      await this.incrementRecallCounts(memories.map(m => m.id));
    }

    console.log(`🎯 [SEMANTIC RESULTS] ${memories.length} memories above ${threshold} similarity`);
    return memories;
  }

  /**
   * PROVIDE FEEDBACK
   *
   * Allows users to rate memory relevance with thumbs up/down.
   * Adjusts significance based on feedback in similar contexts.
   */
  async provideFeedback(feedback: MemoryFeedback): Promise<void> {
    console.log(`👍 [FEEDBACK] Memory ${feedback.memoryId}: ${feedback.feedback}`);

    // Get current memory
    const memory = await this.getMemoryById(feedback.memoryId);

    if (!memory) {
      console.error(`[FEEDBACK ERROR] Memory ${feedback.memoryId} not found`);
      return;
    }

    // Append feedback to user_feedback JSONB array
    const feedbackEntry = {
      feedback: feedback.feedback,
      context: feedback.context,
      facetContext: feedback.facetContext,
      timestamp: new Date().toISOString(),
    };

    const currentFeedback = memory.userFeedback ?? [];
    currentFeedback.push(feedbackEntry);

    // Adjust significance (±5% per feedback)
    const delta = feedback.feedback === 'up' ? 0.05 : -0.05;
    const newSignificance = Math.max(0, Math.min(1, memory.significance + delta));

    await dbQuery(
      `UPDATE developmental_memories
       SET user_feedback = $1, significance = $2, updated_at = NOW()
       WHERE id = $3`,
      [JSON.stringify(currentFeedback), newSignificance, feedback.memoryId]
    );

    console.log(`✅ [FEEDBACK APPLIED] New significance: ${newSignificance}`);
  }

  /**
   * DETECT STUCK PATTERNS
   *
   * Identifies when user has same issue 3+ times in 60 days.
   * Returns alert so MAIA can suggest deeper support.
   */
  async detectStuckPatterns(userId: string): Promise<any[]> {
    const sql = `
      SELECT
        entity_tags[1] as entity,
        COUNT(*) as occurrence_count,
        ARRAY_AGG(facet_code) as facets,
        ARRAY_AGG(formed_at ORDER BY formed_at) as timestamps
      FROM developmental_memories
      WHERE user_id = $1
        AND memory_type IN ('ineffective_practice', 'correction')
        AND formed_at > NOW() - INTERVAL '60 days'
        AND ARRAY_LENGTH(entity_tags, 1) > 0
      GROUP BY entity_tags[1]
      HAVING COUNT(*) >= 3
    `;

    const result = await dbQuery(sql, [userId]);

    if (result.rows.length > 0) {
      console.log(`⚠️ [STUCK PATTERNS] Found ${result.rows.length} recurring issues`);
    }

    return result.rows;
  }

  // ═══════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════

  private extractEmbeddingText(input: FormMemoryInput): string {
    // Create searchable text from trigger event
    const parts: string[] = [
      input.type,
      input.facetCode ?? '',
      ...(input.entityTags ?? []),
      JSON.stringify(input.triggerEvent),
    ];

    return parts.filter(Boolean).join(' ');
  }

  private parseMemory(row: any): DevelopmentalMemory {
    return {
      id: row.id,
      userId: row.user_id,
      memoryType: row.memory_type,
      triggerEvent: typeof row.trigger_event === 'string'
        ? JSON.parse(row.trigger_event)
        : row.trigger_event,
      facetCode: row.facet_code,
      spiralCycle: row.spiral_cycle,
      significance: parseFloat(row.significance),
      formedAt: new Date(row.formed_at),
      recallCount: row.recall_count,
      lastRecalledAt: row.last_recalled_at ? new Date(row.last_recalled_at) : undefined,
      vectorEmbedding: row.vector_embedding,
      entityTags: row.entity_tags ?? [],
      userFeedback: row.user_feedback,
      sourceBeadsTaskId: row.source_beads_task_id,
      sourceAinSessionId: row.source_ain_session_id,
      sourceConsciousnessEntryId: row.source_consciousness_entry_id,
      // 🔮 CANON FIX: Map content_text → contentText for canon beads
      contentText: row.content_text,
      authority: row.authority,
      scope: row.scope,
    };
  }

  private async getMemoryById(id: string): Promise<DevelopmentalMemory | null> {
    const result = await dbQuery(
      'SELECT * FROM developmental_memories WHERE id = $1',
      [id]
    );

    return result.rows.length > 0 ? this.parseMemory(result.rows[0]) : null;
  }

  private async incrementRecallCounts(memoryIds: string[]): Promise<void> {
    if (memoryIds.length === 0) return;

    await dbQuery(
      `UPDATE developmental_memories
       SET recall_count = recall_count + 1, last_recalled_at = NOW()
       WHERE id = ANY($1)`,
      [memoryIds]
    );
  }
}

// Singleton instance
export const developmentalMemory = new DevelopmentalMemoryService();
