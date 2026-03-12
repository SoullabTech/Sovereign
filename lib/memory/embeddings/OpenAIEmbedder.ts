/**
 * SOVEREIGNTY: OpenAI embeddings removed.
 *
 * Previously used text-embedding-ada-002 via the OpenAI API.
 * Now delegates to local Ollama (nomic-embed-text) — on-machine, no egress.
 *
 * Interface is preserved so callers requiring EmbeddingService continue to work.
 * embedBatch fans out to parallel single-embed calls against the local model.
 *
 * Requires Ollama running at http://localhost:11434 with nomic-embed-text pulled.
 * Graceful degradation: returns empty vectors if Ollama is unavailable.
 *
 * See lib/ai/openaiPolicy.ts for the zero-access doctrine.
 * See lib/memory/embeddings.ts for the underlying local embed function.
 */

import type { EmbeddingService } from '../core/MemoryCore';
import { generateLocalEmbedding } from '../embeddings';

export class OpenAIEmbedder implements EmbeddingService {
  async embed(text: string): Promise<number[]> {
    return generateLocalEmbedding(text);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => generateLocalEmbedding(t)));
  }

  clearCache(): void {
    // Local embeddings have no in-process cache at this layer
  }

  getCacheSize(): number {
    return 0;
  }
}
