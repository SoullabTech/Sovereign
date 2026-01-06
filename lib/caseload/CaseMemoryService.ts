/**
 * CASE MEMORY SERVICE
 *
 * Handles ingestion, chunking, embedding, and semantic search
 * for case-scoped memories. Uses local Ollama embeddings for
 * sovereignty compliance.
 */

import { query } from '@/lib/db/postgres';
import { generateLocalEmbedding } from '@/lib/memory/embeddings';
import { EmbeddingQueueService } from '@/lib/ai/EmbeddingQueueService';
import { embedWithOllama } from '@/lib/ai/localEmbeddingClient';

export type MemorySourceType = 'note' | 'capture' | 'consultation' | 'manual';
export type EmbedMode = 'sync' | 'queue' | 'none';

/**
 * Get embedding mode from explicit param or environment
 */
function getEmbedMode(explicit?: EmbedMode): EmbedMode {
  if (explicit) return explicit;
  const v = (process.env.MAIA_EMBEDDINGS_MODE || 'sync').toLowerCase();
  if (v === 'queue') return 'queue';
  if (v === 'none') return 'none';
  return 'sync';
}

export interface CaseMemoryChunk {
  id: string;
  case_id: string;
  member_id: string;
  source_type: MemorySourceType;
  source_id: string | null;
  occurred_at: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity?: number;
}

/**
 * Chunk text into manageable segments for embedding
 * Target ~1200 chars to stay within context limits
 */
function chunkText(text: string, maxChars = 1200): string[] {
  const cleaned = (text || '').trim();
  if (!cleaned) return [];

  const chunks: string[] = [];
  let i = 0;

  while (i < cleaned.length) {
    // Try to break at sentence/paragraph boundaries when possible
    let endIdx = Math.min(i + maxChars, cleaned.length);

    if (endIdx < cleaned.length) {
      // Look for natural break points
      const slice = cleaned.slice(i, endIdx);
      const lastPeriod = slice.lastIndexOf('. ');
      const lastNewline = slice.lastIndexOf('\n');
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > maxChars * 0.5) {
        endIdx = i + breakPoint + 1;
      }
    }

    chunks.push(cleaned.slice(i, endIdx).trim());
    i = endIdx;
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * Convert embedding array to PostgreSQL vector literal
 */
function toVectorLiteral(v: number[]): string {
  return `[${v.join(',')}]`;
}

export class CaseMemoryService {
  /**
   * Delete all chunks for a specific source (before re-ingesting)
   */
  static async deleteSourceChunks(params: {
    caseId: string;
    sourceType: MemorySourceType;
    sourceId: string;
  }): Promise<void> {
    const { caseId, sourceType, sourceId } = params;
    await query(
      `DELETE FROM case_memory_chunks
       WHERE case_id = $1 AND source_type = $2 AND source_id = $3`,
      [caseId, sourceType, sourceId]
    );
  }

  /**
   * Ingest text content into memory chunks with optional embedding
   *
   * @param embedMode - 'sync' (default): embed inline, 'queue': enqueue for async, 'none': no embedding
   */
  static async ingestText(params: {
    caseId: string;
    memberId: string;
    sourceType: MemorySourceType;
    sourceId?: string | null;
    occurredAt?: string;
    content: string;
    metadata?: Record<string, unknown>;
    embed?: boolean; // Legacy: if false, uses 'none' mode
    embedMode?: EmbedMode;
  }): Promise<{ inserted: number }> {
    const {
      caseId,
      memberId,
      sourceType,
      sourceId = null,
      occurredAt = new Date().toISOString(),
      content,
      metadata = {},
      embed = true,
      embedMode: explicitMode,
    } = params;

    // Determine embedding mode: explicit > env > legacy embed param
    const embedMode = explicitMode
      ? explicitMode
      : embed === false
        ? 'none'
        : getEmbedMode();

    const chunks = chunkText(content);
    if (!chunks.length) return { inserted: 0 };

    let inserted = 0;

    for (const chunk of chunks) {
      // Mode: sync - embed inline and insert
      if (embedMode === 'sync') {
        let embedding: number[] | null = null;
        let embeddingModel: string | null = null;

        try {
          const result = await embedWithOllama({ text: chunk });
          embedding = result.embedding;
          embeddingModel = result.model;
        } catch (err) {
          console.warn('[CaseMemory] Sync embedding failed, storing without vector:', err);
        }

        const hasEmbedding = embedding && embedding.length > 0;

        await query(
          `INSERT INTO case_memory_chunks (
            case_id, member_id, source_type, source_id,
            occurred_at, content, metadata,
            embedding, embedding_model, embedded_at
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7,
            ${hasEmbedding ? '$8::vector' : 'NULL'}, $9, ${hasEmbedding ? 'now()' : 'NULL'}
          )`,
          hasEmbedding
            ? [
                caseId,
                memberId,
                sourceType,
                sourceId,
                occurredAt,
                chunk,
                JSON.stringify(metadata),
                toVectorLiteral(embedding!),
                embeddingModel,
              ]
            : [
                caseId,
                memberId,
                sourceType,
                sourceId,
                occurredAt,
                chunk,
                JSON.stringify(metadata),
                null,
                null,
              ]
        );

        inserted += 1;
        continue;
      }

      // Mode: queue or none - insert without embedding
      const ins = await query<{ id: string }>(
        `INSERT INTO case_memory_chunks (
          case_id, member_id, source_type, source_id,
          occurred_at, content, metadata,
          embedding, embedding_model, embedded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NULL, NULL)
        RETURNING id`,
        [caseId, memberId, sourceType, sourceId, occurredAt, chunk, JSON.stringify(metadata)]
      );

      const chunkId = ins.rows[0]?.id;

      // Enqueue for async embedding if in queue mode
      if (embedMode === 'queue' && chunkId) {
        await EmbeddingQueueService.enqueueCaseMemoryChunk({
          chunkId,
          input: chunk,
        });
      }

      inserted += 1;
    }

    return { inserted };
  }

  /**
   * List recent memory chunks for a case
   */
  static async listRecent(params: {
    caseId: string;
    limit?: number;
  }): Promise<CaseMemoryChunk[]> {
    const { caseId, limit = 25 } = params;

    const result = await query<CaseMemoryChunk>(
      `SELECT id, case_id, member_id, source_type, source_id,
              occurred_at, content, metadata
       FROM case_memory_chunks
       WHERE case_id = $1
       ORDER BY occurred_at DESC
       LIMIT $2`,
      [caseId, limit]
    );

    return result.rows;
  }

  /**
   * Search for similar memory chunks using vector similarity
   */
  static async searchSimilar(params: {
    caseId: string;
    query: string;
    topK?: number;
  }): Promise<CaseMemoryChunk[]> {
    const { caseId, query: searchQuery, topK = 8 } = params;

    // Generate embedding for the search query
    const embedding = await generateLocalEmbedding(searchQuery);
    if (!embedding || embedding.length === 0) {
      // Fallback to recent if embedding fails
      console.warn('[CaseMemory] Search embedding failed, returning recent');
      return this.listRecent({ caseId, limit: topK });
    }

    const result = await query<CaseMemoryChunk>(
      `SELECT
         id, case_id, member_id, source_type, source_id,
         occurred_at, content, metadata,
         (1 - (embedding <=> $2::vector)) AS similarity
       FROM case_memory_chunks
       WHERE case_id = $1
         AND embedding IS NOT NULL
       ORDER BY embedding <=> $2::vector
       LIMIT $3`,
      [caseId, toVectorLiteral(embedding), topK]
    );

    return result.rows;
  }

  /**
   * Get chunk count for a case
   */
  static async getChunkCount(caseId: string): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM case_memory_chunks WHERE case_id = $1`,
      [caseId]
    );
    return parseInt(result.rows[0]?.count || '0');
  }
}
