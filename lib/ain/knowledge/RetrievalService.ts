/**
 * AIN Knowledge Retrieval Service
 *
 * Mode-aware contextual retrieval from the embedded knowledge base.
 * Pulls relevant wisdom based on conversation context and MAIA's current mode.
 */

import { query } from '@/lib/db/postgres';
import { generateLocalEmbedding } from '@/lib/memory/embeddings';
import { toPgVectorLiteral } from '@/lib/db/pgvector';

export interface RetrievalResult {
  chunkId: string;
  sourceTitle: string;
  sourceFile: string;
  chunkText: string;
  domain: string;
  categories: string[];
  similarity: number;
}

export interface RetrievalOptions {
  /** Maximum chunks to return */
  limit?: number;
  /** Minimum similarity threshold (0-1) */
  minSimilarity?: number;
  /** Filter to specific domains */
  domains?: string[];
  /** Filter to specific categories */
  categories?: string[];
  /** User ID for tracking */
  userId?: string;
  /** Session mode for tracking */
  sessionMode?: string;
}

// Mode to domain/category mapping
const MODE_FILTERS: Record<string, { domains?: string[]; categories?: string[] }> = {
  // Care/Consult modes - therapeutic focus
  care: {
    domains: ['therapeutic', 'somatic'],
    categories: ['cbt', 'dbt', 'attachment', 'schema', 'ptsd', 'somatic', 'gestalt', 'existential'],
  },
  consult: {
    domains: ['therapeutic', 'somatic', 'jungian'],
    categories: ['cbt', 'dbt', 'attachment', 'schema', 'ptsd', 'somatic', 'psychodynamic', 'humanistic'],
  },

  // Talk mode - broader wisdom
  talk: {
    domains: ['jungian', 'consciousness', 'philosophy'],
    categories: ['jungian', 'consciousness', 'divided_brain', 'mythology', 'flow'],
  },

  // Scribe/Note modes - reflective
  scribe: {
    domains: ['jungian', 'consciousness'],
    categories: ['jungian', 'consciousness', 'alchemy', 'mythology'],
  },

  // Divination modes
  divination: {
    domains: ['divination'],
    categories: ['enneagram', 'human_design', 'iching', 'astrology'],
  },

  // Somatic/body focus
  somatic: {
    domains: ['somatic'],
    categories: ['somatic', 'breathwork'],
  },

  // Archetypal focus
  archetypal: {
    domains: ['jungian'],
    categories: ['jungian', 'alchemy', 'mythology', 'shamanic'],
  },

  // CBT focus
  cbt: {
    categories: ['cbt', 'dbt'],
  },
};

/**
 * Retrieve relevant knowledge chunks for a query
 */
export async function retrieveKnowledge(
  queryText: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult[]> {
  const {
    limit = 5,
    minSimilarity = 0.3,
    domains,
    categories,
    userId,
    sessionMode,
  } = options;

  try {
    // Generate embedding for query
    const queryEmbedding = await generateLocalEmbedding(queryText);

    if (!queryEmbedding || queryEmbedding.length === 0) {
      console.warn('[AIN Retrieval] No embedding generated, falling back to empty');
      return [];
    }

    // Build query with filters
    let sql = `
      SELECT
        id,
        source_title,
        source_file,
        chunk_text,
        domain,
        categories,
        1 - (embedding <=> $1::vector) as similarity
      FROM ain_knowledge_chunks
      WHERE embedding IS NOT NULL
    `;

    const params: (string | number | string[])[] = [toPgVectorLiteral(queryEmbedding)];
    let paramIndex = 2;

    // Domain filter
    if (domains && domains.length > 0) {
      sql += ` AND domain = ANY($${paramIndex})`;
      params.push(domains);
      paramIndex++;
    }

    // Category filter (any match)
    if (categories && categories.length > 0) {
      sql += ` AND categories && $${paramIndex}`;
      params.push(categories);
      paramIndex++;
    }

    // Similarity threshold and ordering
    sql += `
      AND 1 - (embedding <=> $1::vector) >= $${paramIndex}
      ORDER BY embedding <=> $1::vector
      LIMIT $${paramIndex + 1}
    `;
    params.push(minSimilarity);
    params.push(limit);

    const result = await query<{
      id: string;
      source_title: string;
      source_file: string;
      chunk_text: string;
      domain: string;
      categories: string[];
      similarity: number;
    }>(sql, params);

    const chunks = result.rows.map(row => ({
      chunkId: row.id,
      sourceTitle: row.source_title,
      sourceFile: row.source_file,
      chunkText: row.chunk_text,
      domain: row.domain,
      categories: row.categories || [],
      similarity: row.similarity,
    }));

    // Track retrieval if user provided
    if (userId && chunks.length > 0) {
      await trackRetrieval(userId, sessionMode, queryText, chunks);
    }

    return chunks;

  } catch (error) {
    console.error('[AIN Retrieval] Error:', error);
    return [];
  }
}

/**
 * Retrieve knowledge using mode-specific filters
 */
export async function retrieveForMode(
  queryText: string,
  mode: string,
  options: Omit<RetrievalOptions, 'domains' | 'categories'> = {}
): Promise<RetrievalResult[]> {
  const modeFilters = MODE_FILTERS[mode.toLowerCase()] || {};

  return retrieveKnowledge(queryText, {
    ...options,
    domains: modeFilters.domains,
    categories: modeFilters.categories,
    sessionMode: mode,
  });
}

/**
 * Format retrieved chunks for injection into prompt
 */
export function formatForPrompt(chunks: RetrievalResult[], maxTokens = 2000): string {
  if (chunks.length === 0) return '';

  let output = '';
  let estimatedTokens = 0;

  for (const chunk of chunks) {
    const chunkTokens = Math.ceil(chunk.chunkText.length / 4);

    if (estimatedTokens + chunkTokens > maxTokens) break;

    output += `\n---\n[${chunk.sourceTitle}]\n${chunk.chunkText}\n`;
    estimatedTokens += chunkTokens;
  }

  return output.trim();
}

/**
 * Track retrieval for analytics
 */
async function trackRetrieval(
  userId: string,
  sessionMode: string | undefined,
  queryText: string,
  chunks: RetrievalResult[]
): Promise<void> {
  try {
    await query(
      `INSERT INTO ain_knowledge_retrievals
       (user_id, session_mode, query_text, chunks_retrieved, retrieval_scores)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        sessionMode || 'unknown',
        queryText.substring(0, 500),
        chunks.map(c => c.chunkId),
        chunks.map(c => c.similarity),
      ]
    );
  } catch (error) {
    // Non-critical, don't fail retrieval
    console.warn('[AIN Retrieval] Failed to track:', error);
  }
}

/**
 * Get knowledge base stats
 */
export async function getKnowledgeStats(): Promise<{
  totalChunks: number;
  totalFiles: number;
  byDomain: Record<string, number>;
  recentRetrievals: number;
}> {
  try {
    const stats = await query<{ total_chunks: number; total_files: number }>(`
      SELECT COUNT(*) as total_chunks, COUNT(DISTINCT source_file) as total_files
      FROM ain_knowledge_chunks
    `);

    const byDomain = await query<{ domain: string; count: number }>(`
      SELECT domain, COUNT(*) as count
      FROM ain_knowledge_chunks
      GROUP BY domain
    `);

    const retrievals = await query<{ count: number }>(`
      SELECT COUNT(*) as count
      FROM ain_knowledge_retrievals
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);

    return {
      totalChunks: parseInt(String(stats.rows[0]?.total_chunks || 0)),
      totalFiles: parseInt(String(stats.rows[0]?.total_files || 0)),
      byDomain: byDomain.rows.reduce((acc, r) => {
        acc[r.domain] = parseInt(String(r.count));
        return acc;
      }, {} as Record<string, number>),
      recentRetrievals: parseInt(String(retrievals.rows[0]?.count || 0)),
    };
  } catch (error) {
    console.error('[AIN Stats] Error:', error);
    return { totalChunks: 0, totalFiles: 0, byDomain: {}, recentRetrievals: 0 };
  }
}
