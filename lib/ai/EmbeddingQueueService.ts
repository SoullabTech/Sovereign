/**
 * EMBEDDING QUEUE SERVICE
 *
 * DB-based queue for async embedding generation.
 * Decouples text ingestion from embedding computation.
 */

import { query } from '@/lib/db/postgres';

export type EmbeddingJob = {
  id: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  target_table: string;
  target_id: string;
  model: string;
  input: string;
  attempts: number;
};

export class EmbeddingQueueService {
  /**
   * Enqueue a case memory chunk for embedding
   */
  static async enqueueCaseMemoryChunk(params: {
    chunkId: string;
    input: string;
    model?: string;
  }) {
    const model = params.model || process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

    await query(
      `
      INSERT INTO embedding_jobs (job_type, target_table, target_id, model, input)
      VALUES ('case_memory_chunk', 'case_memory_chunks', $1, $2, $3)
      ON CONFLICT DO NOTHING
      `,
      [params.chunkId, model, params.input]
    );
  }

  /**
   * Claim the next pending job for processing
   * Uses FOR UPDATE SKIP LOCKED for concurrent workers
   */
  static async claimNext(): Promise<EmbeddingJob | null> {
    const maxAttempts = Number(process.env.EMBEDDING_MAX_ATTEMPTS || 5);

    const { rows } = await query(
      `
      WITH picked AS (
        SELECT id
        FROM embedding_jobs
        WHERE status = 'pending'
          AND attempts < $1
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE embedding_jobs j
      SET status = 'processing',
          locked_at = now(),
          attempts = attempts + 1,
          updated_at = now()
      FROM picked
      WHERE j.id = picked.id
      RETURNING j.id, j.status, j.target_table, j.target_id, j.model, j.input, j.attempts;
      `,
      [maxAttempts]
    );

    return (rows[0] as EmbeddingJob) || null;
  }

  /**
   * Mark a job as completed
   */
  static async markDone(jobId: string) {
    await query(
      `
      UPDATE embedding_jobs
      SET status='done', completed_at=now(), updated_at=now()
      WHERE id=$1
      `,
      [jobId]
    );
  }

  /**
   * Mark a job as errored
   */
  static async markError(jobId: string, err: string) {
    await query(
      `
      UPDATE embedding_jobs
      SET status='error', last_error=$2, updated_at=now()
      WHERE id=$1
      `,
      [jobId, err.slice(0, 5000)]
    );
  }

  /**
   * Get count of pending jobs (for UI backlog indicator)
   */
  static async backlogCount(): Promise<number> {
    const { rows } = await query(
      `SELECT count(*)::int AS n FROM embedding_jobs WHERE status='pending'`,
      []
    );
    return rows?.[0]?.n ?? 0;
  }

  /**
   * Get queue stats
   */
  static async stats(): Promise<Record<string, number>> {
    const { rows } = await query(
      `SELECT status, count(*)::int AS n FROM embedding_jobs GROUP BY status`,
      []
    );
    const stats: Record<string, number> = {};
    for (const row of rows) {
      stats[row.status] = row.n;
    }
    return stats;
  }
}
