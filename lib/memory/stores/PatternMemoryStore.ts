/**
 * Pattern Memory Store
 *
 * Manages emergent pattern records in developmental_memories.
 * Patterns are stored as stable memory records that can be linked to
 * the experiences that support them.
 *
 * Pattern keys follow format: "pattern_type:identifier"
 * Examples:
 *   - recurring_somatic:chest
 *   - recurring_emotion:anxiety
 *   - facet_dwelling:FIRE-2
 *   - potential_spiritual_bypassing
 */

import { query } from '../../db/postgres';
import { generateLocalEmbedding } from '../embeddings';

export interface PatternRecord {
  id: string;
  userId: string;
  patternKey: string;
  description: string;
  confidence: number;
  facetCode?: string;
  seenCount: number;
  firstSeenAt: Date;
  lastSeenAt: Date;
}

export interface UpsertPatternInput {
  userId: string;
  patternKey: string;
  description?: string;
  facetCode?: string;
  confidence?: number;
}

/**
 * Generate human-readable description from pattern key
 */
function describePattern(patternKey: string): string {
  const descriptions: Record<string, string> = {
    recurring_somatic: 'Recurring focus on body region',
    recurring_emotion: 'Recurring emotional pattern',
    facet_dwelling: 'Extended time in facet without movement',
    potential_spiritual_bypassing: 'Mental insights without emotional integration',
  };

  const [type, identifier] = patternKey.split(':');
  const base = descriptions[type] ?? `Pattern: ${type}`;
  return identifier ? `${base}: ${identifier}` : base;
}

export const PatternMemoryStore = {
  /**
   * Upsert a pattern by its unique key.
   * If pattern exists for this user, increments seen_count and updates last_seen.
   * If new, creates the pattern record.
   * Returns the pattern's ID for linking.
   */
  async upsertByKey(input: UpsertPatternInput): Promise<string> {
    const { userId, patternKey, facetCode, confidence = 0.7 } = input;
    const description = input.description ?? describePattern(patternKey);

    // Check if pattern already exists for this user
    const existing = await query<{ id: string; seen_count: number }>(
      `
      SELECT id,
             (trigger_event->>'seenCount')::int as seen_count
      FROM developmental_memories
      WHERE user_id = $1
        AND memory_type = 'emergent_pattern'
        AND entity_tags @> ARRAY[$2]::text[]
      LIMIT 1
      `,
      [userId, patternKey]
    );

    if (existing.rows.length > 0) {
      // Update existing pattern
      const row = existing.rows[0];
      const newSeenCount = (row.seen_count ?? 1) + 1;

      await query(
        `
        UPDATE developmental_memories
        SET
          trigger_event = trigger_event || jsonb_build_object(
            'seenCount', $3::int,
            'lastSeenAt', NOW()
          ),
          significance = LEAST(1.0, significance + 0.05),
          last_confirmed_at = NOW()
        WHERE id = $1 AND user_id = $2
        `,
        [row.id, userId, newSeenCount]
      );

      console.log(`📊 [PatternMemory] Updated pattern '${patternKey}' (seen ${newSeenCount}x)`);
      return row.id;
    }

    // Create new pattern record
    const embedding = await generateLocalEmbedding(description);

    const result = await query<{ id: string }>(
      `
      INSERT INTO developmental_memories (
        user_id,
        memory_type,
        trigger_event,
        facet_code,
        spiral_cycle,
        significance,
        vector_embedding,
        entity_tags,
        content_text,
        confirmed_by_user,
        visibility
      ) VALUES (
        $1,
        'emergent_pattern',
        $2,
        $3,
        1,
        $4,
        $5::vector,
        ARRAY[$6]::text[],
        $7,
        false,
        'private'
      )
      RETURNING id
      `,
      [
        userId,
        JSON.stringify({
          patternKey,
          description,
          seenCount: 1,
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        }),
        facetCode ?? null,
        confidence,
        `[${embedding.join(',')}]`,
        patternKey,
        description,
      ]
    );

    const id = result.rows[0]?.id ?? '';
    console.log(`🆕 [PatternMemory] Created new pattern '${patternKey}' → ${id}`);
    return id;
  },

  /**
   * Get all patterns for a user
   */
  async getPatterns(userId: string): Promise<PatternRecord[]> {
    const result = await query<{
      id: string;
      user_id: string;
      trigger_event: any;
      significance: number;
      facet_code: string | null;
      entity_tags: string[];
    }>(
      `
      SELECT id, user_id, trigger_event, significance, facet_code, entity_tags
      FROM developmental_memories
      WHERE user_id = $1
        AND memory_type = 'emergent_pattern'
        AND (valid_to IS NULL OR valid_to > NOW())
      ORDER BY significance DESC,
               (trigger_event->>'lastSeenAt')::timestamp DESC
      `,
      [userId]
    );

    return (result.rows ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      patternKey: row.entity_tags?.[0] ?? row.trigger_event?.patternKey ?? 'unknown',
      description: row.trigger_event?.description ?? '',
      confidence: row.significance,
      facetCode: row.facet_code ?? undefined,
      seenCount: row.trigger_event?.seenCount ?? 1,
      firstSeenAt: new Date(row.trigger_event?.firstSeenAt),
      lastSeenAt: new Date(row.trigger_event?.lastSeenAt),
    }));
  },

  /**
   * Get pattern by key (for linking)
   */
  async getByKey(userId: string, patternKey: string): Promise<PatternRecord | null> {
    const result = await query<{
      id: string;
      user_id: string;
      trigger_event: any;
      significance: number;
      facet_code: string | null;
    }>(
      `
      SELECT id, user_id, trigger_event, significance, facet_code
      FROM developmental_memories
      WHERE user_id = $1
        AND memory_type = 'emergent_pattern'
        AND entity_tags @> ARRAY[$2]::text[]
      LIMIT 1
      `,
      [userId, patternKey]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      patternKey,
      description: row.trigger_event?.description ?? '',
      confidence: row.significance,
      facetCode: row.facet_code ?? undefined,
      seenCount: row.trigger_event?.seenCount ?? 1,
      firstSeenAt: new Date(row.trigger_event?.firstSeenAt),
      lastSeenAt: new Date(row.trigger_event?.lastSeenAt),
    };
  },

  /**
   * Get top patterns for a user (for session context)
   */
  async getTopPatterns(userId: string, limit: number = 5): Promise<PatternRecord[]> {
    const all = await this.getPatterns(userId);
    return all.slice(0, limit);
  },
};
