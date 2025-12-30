/**
 * EmbeddingRepo - Postgres-native storage for bardic episode embeddings
 *
 * Replaces Supabase-based storage with direct lib/db/postgres.ts queries.
 * Uses pgvector for efficient similarity search.
 */

import { query } from '@/lib/db/postgres';

export interface StoredEmbedding {
  episodeId: string;
  model: string;
  embedding: number[];
  similarityHash?: string | null;
  contentHash?: string | null;
  metadata?: Record<string, unknown>;
  decayRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SimilarEpisode {
  episodeId: string;
  similarity: number;
}

/**
 * Normalize embedding values to prevent NaN/Infinity from reaching pgvector
 */
function normalizeEmbedding(v: number[]): number[] {
  return v.map((x) => {
    const n = Number(x);
    if (!Number.isFinite(n)) {
      throw new Error(`Invalid embedding value: ${x} (NaN/Infinity not allowed)`);
    }
    return n;
  });
}

/**
 * Format embedding array for pgvector insertion
 * pgvector expects format: '[0.1,0.2,0.3,...]'
 */
function toPgVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

export const EmbeddingRepo = {
  /**
   * Store or update an embedding for an episode
   */
  async upsertEmbedding(input: StoredEmbedding): Promise<void> {
    const embedding = normalizeEmbedding(input.embedding);

    await query(
      `
      INSERT INTO bardic_episode_embeddings
        (episode_id, model, embedding, similarity_hash, content_hash, metadata, decay_rate)
      VALUES
        ($1, $2, $3::vector, $4, $5, $6::jsonb, $7)
      ON CONFLICT (episode_id) DO UPDATE SET
        model = EXCLUDED.model,
        embedding = EXCLUDED.embedding,
        similarity_hash = EXCLUDED.similarity_hash,
        content_hash = EXCLUDED.content_hash,
        metadata = EXCLUDED.metadata,
        decay_rate = EXCLUDED.decay_rate,
        updated_at = now()
      `,
      [
        input.episodeId,
        input.model || 'text-embedding-ada-002',
        toPgVector(embedding),
        input.similarityHash ?? null,
        input.contentHash ?? null,
        JSON.stringify(input.metadata ?? {}),
        input.decayRate ?? 0.0,
      ]
    );
  },

  /**
   * Get embedding for a specific episode
   */
  async getEmbedding(episodeId: string): Promise<StoredEmbedding | null> {
    const res = await query(
      `
      SELECT
        episode_id,
        model,
        embedding::text,
        similarity_hash,
        content_hash,
        metadata,
        decay_rate,
        created_at,
        updated_at
      FROM bardic_episode_embeddings
      WHERE episode_id = $1
      `,
      [episodeId]
    );

    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    return {
      episodeId: row.episode_id,
      model: row.model,
      embedding: parseEmbeddingString(row.embedding),
      similarityHash: row.similarity_hash,
      contentHash: row.content_hash,
      metadata: row.metadata ?? {},
      decayRate: row.decay_rate,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  /**
   * Find episodes similar to a given embedding using cosine distance
   *
   * @param embedding - Query embedding vector
   * @param limit - Max results (default 10, max 50)
   * @param minSimilarity - Minimum similarity threshold (0-1, default 0.7)
   * @returns Episode IDs with similarity scores, sorted by similarity descending
   */
  async findSimilar(opts: {
    embedding: number[];
    limit?: number;
    minSimilarity?: number;
  }): Promise<SimilarEpisode[]> {
    const embedding = normalizeEmbedding(opts.embedding);
    const limit = Math.min(Math.max(opts.limit ?? 10, 1), 50);
    const minSimilarity = opts.minSimilarity ?? 0.7;

    // cosine distance: 1 - cosine_similarity, so we filter where distance < (1 - minSimilarity)
    const maxDistance = 1 - minSimilarity;

    const res = await query(
      `
      SELECT
        episode_id,
        1 - (embedding <=> $1::vector) as similarity
      FROM bardic_episode_embeddings
      WHERE (embedding <=> $1::vector) < $2
      ORDER BY embedding <=> $1::vector
      LIMIT $3
      `,
      [toPgVector(embedding), maxDistance, limit]
    );

    return res.rows.map((row: { episode_id: string; similarity: number }) => ({
      episodeId: row.episode_id,
      similarity: row.similarity,
    }));
  },

  /**
   * Delete embedding for an episode
   */
  async deleteEmbedding(episodeId: string): Promise<boolean> {
    const res = await query(
      `DELETE FROM bardic_episode_embeddings WHERE episode_id = $1`,
      [episodeId]
    );
    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Check if an embedding exists for an episode
   */
  async hasEmbedding(episodeId: string): Promise<boolean> {
    const res = await query(
      `SELECT 1 FROM bardic_episode_embeddings WHERE episode_id = $1 LIMIT 1`,
      [episodeId]
    );
    return res.rows.length > 0;
  },
};

/**
 * Parse pgvector string format back to number array
 * Format: '[0.1,0.2,0.3,...]'
 */
function parseEmbeddingString(str: string): number[] {
  if (!str) return [];
  // Remove brackets and split
  const cleaned = str.replace(/^\[|\]$/g, '');
  if (!cleaned) return [];
  return cleaned.split(',').map((v) => parseFloat(v));
}
