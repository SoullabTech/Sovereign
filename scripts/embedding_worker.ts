/**
 * EMBEDDING WORKER
 *
 * Background worker that processes the embedding job queue.
 * Pulls pending jobs, generates embeddings via Ollama, updates chunks.
 *
 * Usage:
 *   npx tsx scripts/embedding_worker.ts
 *   MAIA_EMBEDDINGS_MODE=queue npx tsx scripts/embedding_worker.ts
 */

import { query } from '@/lib/db/postgres';
import { EmbeddingQueueService } from '@/lib/ai/EmbeddingQueueService';
import { embedWithOllama } from '@/lib/ai/localEmbeddingClient';

function toVectorLiteral(v: number[]) {
  return `[${v.join(',')}]`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('embedding_worker: started');
  console.log(`  Model: ${process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text'}`);
  console.log(`  Base URL: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`);
  console.log('  Press Ctrl+C to stop\n');

  let processed = 0;
  let errors = 0;

  // Status logging interval
  const statusInterval = setInterval(() => {
    if (processed > 0 || errors > 0) {
      console.log(`[status] processed: ${processed}, errors: ${errors}`);
    }
  }, 30000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nembedding_worker: shutting down...');
    clearInterval(statusInterval);
    console.log(`Final stats: processed=${processed}, errors=${errors}`);
    process.exit(0);
  });

  while (true) {
    const job = await EmbeddingQueueService.claimNext();

    if (!job) {
      await sleep(400);
      continue;
    }

    try {
      const { embedding, model } = await embedWithOllama({
        text: job.input,
        model: job.model,
      });

      await query(
        `
        UPDATE case_memory_chunks
        SET embedding = $2::vector,
            embedding_model = $3,
            embedded_at = now()
        WHERE id = $1
        `,
        [job.target_id, toVectorLiteral(embedding), model]
      );

      await EmbeddingQueueService.markDone(job.id);
      processed += 1;

      // Brief log for each success
      if (processed % 10 === 0) {
        console.log(`[progress] ${processed} chunks embedded`);
      }
    } catch (e: any) {
      errors += 1;
      console.error(`[error] job ${job.id}: ${e?.message || e}`);
      await EmbeddingQueueService.markError(job.id, String(e?.message || e));
    }
  }
}

main().catch((e) => {
  console.error('embedding_worker: fatal error', e);
  process.exit(1);
});
