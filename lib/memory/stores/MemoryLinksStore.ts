/**
 * Memory Links Store
 *
 * Manages cross-memory relationships:
 * - Pattern beads linking to supporting evidence
 * - Contradiction detection
 * - Evolution chains (how understanding developed)
 * - Causal/trigger relationships
 */

import { query } from '../../db/postgres';

export type MemoryLinkType =
  | 'supports'       // Memory A supports/evidences Memory B
  | 'contradicts'    // Memory A contradicts Memory B
  | 'evolves'        // Memory A is an evolution/update of Memory B
  | 'repeats'        // Memory A is a recurrence of Memory B pattern
  | 'triggers'       // Memory A triggered Memory B (causal)
  | 'derives_from';  // Memory A was derived/synthesized from Memory B

export type LinkCreator = 'system' | 'user' | 'synthesis_job' | 'maia';

export interface MemoryLink {
  id: string;
  userId: string;
  fromTable: string;
  fromId: string;
  toTable: string;
  toId: string;
  linkType: MemoryLinkType;
  weight: number;
  confidence: number;
  createdBy: LinkCreator;
  createdAt: string;
}

export interface CreateLinkInput {
  userId: string;
  fromTable: string;
  fromId: string;
  toTable: string;
  toId: string;
  linkType: MemoryLinkType;
  weight?: number;
  confidence?: number;
  createdBy?: LinkCreator;
}

export const MemoryLinksStore = {
  /**
   * Create a link between two memories
   */
  async createLink(input: CreateLinkInput): Promise<string> {
    const result = await query<{ id: string }>(
      `
      INSERT INTO memory_links (
        user_id, from_table, from_id, to_table, to_id,
        link_type, weight, confidence, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (from_table, from_id, to_table, to_id, link_type)
      DO UPDATE SET
        weight = EXCLUDED.weight,
        confidence = EXCLUDED.confidence
      RETURNING id
      `,
      [
        input.userId,
        input.fromTable,
        input.fromId,
        input.toTable,
        input.toId,
        input.linkType,
        input.weight ?? 1.0,
        input.confidence ?? 0.8,
        input.createdBy ?? 'system',
      ]
    );

    return result.rows[0]?.id ?? '';
  },

  /**
   * Create multiple links (for pattern derivation)
   */
  async createBatch(links: CreateLinkInput[]): Promise<void> {
    if (links.length === 0) return;

    const values: any[] = [];
    const placeholders: string[] = [];
    let paramIndex = 1;

    for (const link of links) {
      placeholders.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
      );
      values.push(
        link.userId,
        link.fromTable,
        link.fromId,
        link.toTable,
        link.toId,
        link.linkType,
        link.weight ?? 1.0,
        link.confidence ?? 0.8,
        link.createdBy ?? 'system'
      );
    }

    await query(
      `
      INSERT INTO memory_links (
        user_id, from_table, from_id, to_table, to_id,
        link_type, weight, confidence, created_by
      )
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (from_table, from_id, to_table, to_id, link_type)
      DO NOTHING
      `,
      values
    );
  },

  /**
   * Get all links FROM a memory (what does this memory support/trigger/etc.)
   */
  async getLinksFrom(
    memoryTable: string,
    memoryId: string
  ): Promise<MemoryLink[]> {
    const result = await query<MemoryLink>(
      `
      SELECT
        id,
        user_id as "userId",
        from_table as "fromTable",
        from_id as "fromId",
        to_table as "toTable",
        to_id as "toId",
        link_type as "linkType",
        weight,
        confidence,
        created_by as "createdBy",
        created_at as "createdAt"
      FROM memory_links
      WHERE from_table = $1 AND from_id = $2
      ORDER BY weight DESC
      `,
      [memoryTable, memoryId]
    );

    return result.rows ?? [];
  },

  /**
   * Get all links TO a memory (what supports/contradicts this memory)
   */
  async getLinksTo(
    memoryTable: string,
    memoryId: string
  ): Promise<MemoryLink[]> {
    const result = await query<MemoryLink>(
      `
      SELECT
        id,
        user_id as "userId",
        from_table as "fromTable",
        from_id as "fromId",
        to_table as "toTable",
        to_id as "toId",
        link_type as "linkType",
        weight,
        confidence,
        created_by as "createdBy",
        created_at as "createdAt"
      FROM memory_links
      WHERE to_table = $1 AND to_id = $2
      ORDER BY weight DESC
      `,
      [memoryTable, memoryId]
    );

    return result.rows ?? [];
  },

  /**
   * Get supporting evidence for a pattern memory
   * Returns the memories that support this derived pattern
   */
  async getSupportingEvidence(
    patternTable: string,
    patternId: string
  ): Promise<Array<{ table: string; id: string; weight: number; confidence: number }>> {
    const result = await query<{
      fromTable: string;
      fromId: string;
      weight: number;
      confidence: number;
    }>(
      `
      SELECT
        from_table as "fromTable",
        from_id as "fromId",
        weight,
        confidence
      FROM memory_links
      WHERE to_table = $1
        AND to_id = $2
        AND link_type IN ('supports', 'derives_from')
      ORDER BY weight DESC
      `,
      [patternTable, patternId]
    );

    return (result.rows ?? []).map(r => ({
      table: r.fromTable,
      id: r.fromId,
      weight: r.weight,
      confidence: r.confidence,
    }));
  },

  /**
   * Get contradicting memories
   * Important for nuanced responses - "but you also said..."
   */
  async getContradictions(
    userId: string,
    memoryTable: string,
    memoryId: string
  ): Promise<Array<{ table: string; id: string; confidence: number }>> {
    const result = await query<{
      otherTable: string;
      otherId: string;
      confidence: number;
    }>(
      `
      SELECT
        CASE
          WHEN from_table = $2 AND from_id = $3 THEN to_table
          ELSE from_table
        END as "otherTable",
        CASE
          WHEN from_table = $2 AND from_id = $3 THEN to_id
          ELSE from_id
        END as "otherId",
        confidence
      FROM memory_links
      WHERE user_id = $1
        AND link_type = 'contradicts'
        AND (
          (from_table = $2 AND from_id = $3)
          OR (to_table = $2 AND to_id = $3)
        )
      ORDER BY confidence DESC
      `,
      [userId, memoryTable, memoryId]
    );

    return (result.rows ?? []).map(r => ({
      table: r.otherTable,
      id: r.otherId,
      confidence: r.confidence,
    }));
  },

  /**
   * Get evolution chain for a memory
   * Shows how understanding developed over time
   */
  async getEvolutionChain(
    userId: string,
    memoryTable: string,
    memoryId: string
  ): Promise<Array<{ table: string; id: string; direction: 'evolved_from' | 'evolved_to' }>> {
    const result = await query<{
      fromTable: string;
      fromId: string;
      toTable: string;
      toId: string;
    }>(
      `
      WITH RECURSIVE evolution AS (
        -- Base: direct evolution links
        SELECT
          from_table, from_id, to_table, to_id, 1 as depth
        FROM memory_links
        WHERE user_id = $1
          AND link_type = 'evolves'
          AND (
            (from_table = $2 AND from_id = $3)
            OR (to_table = $2 AND to_id = $3)
          )

        UNION ALL

        -- Recursive: follow the chain
        SELECT
          ml.from_table, ml.from_id, ml.to_table, ml.to_id, e.depth + 1
        FROM memory_links ml
        JOIN evolution e ON (
          (ml.from_table = e.to_table AND ml.from_id = e.to_id)
          OR (ml.to_table = e.from_table AND ml.to_id = e.from_id)
        )
        WHERE ml.user_id = $1
          AND ml.link_type = 'evolves'
          AND e.depth < 10
      )
      SELECT DISTINCT from_table as "fromTable", from_id as "fromId",
             to_table as "toTable", to_id as "toId"
      FROM evolution
      `,
      [userId, memoryTable, memoryId]
    );

    const chain: Array<{ table: string; id: string; direction: 'evolved_from' | 'evolved_to' }> = [];

    for (const row of result.rows ?? []) {
      if (row.fromTable === memoryTable && row.fromId === memoryId) {
        chain.push({ table: row.toTable, id: row.toId, direction: 'evolved_to' });
      } else if (row.toTable === memoryTable && row.toId === memoryId) {
        chain.push({ table: row.fromTable, id: row.fromId, direction: 'evolved_from' });
      }
    }

    return chain;
  },

  /**
   * Delete a link
   */
  async deleteLink(id: string): Promise<void> {
    await query('DELETE FROM memory_links WHERE id = $1', [id]);
  },

  /**
   * Update link weight (e.g., strengthen when user confirms)
   */
  async updateWeight(id: string, newWeight: number): Promise<void> {
    await query(
      'UPDATE memory_links SET weight = $1 WHERE id = $2',
      [Math.min(5.0, Math.max(0, newWeight)), id]
    );
  },

  /**
   * Count supporting evidence for a pattern
   * Useful for pattern confidence calculation
   */
  async countSupports(
    patternTable: string,
    patternId: string
  ): Promise<number> {
    const result = await query<{ count: string }>(
      `
      SELECT COUNT(*) as count
      FROM memory_links
      WHERE to_table = $1
        AND to_id = $2
        AND link_type IN ('supports', 'derives_from')
      `,
      [patternTable, patternId]
    );

    return parseInt(result.rows[0]?.count ?? '0', 10);
  },
};
