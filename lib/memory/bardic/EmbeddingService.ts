/**
 * EmbeddingService
 *
 * Generates vector embeddings for episodes using OpenAI
 * Enables semantic similarity search for recognition
 *
 * Architecture:
 * - Generate embeddings via server-side /api/memory/embed route
 * - Store in bardic_episode_embeddings table (pgvector)
 * - Use for fast approximate nearest neighbor search
 *
 * SECURITY: Calls server-side API route (never exposes API keys)
 */

import { EmbeddingRepo, type SimilarEpisode } from './storage/EmbeddingRepo';

export interface GenerateEmbeddingInput {
  text: string;
  stanza?: string;
  placeCue?: string;
  senseCues?: string[];
}

export interface EmbeddingResult {
  embedding: number[];
  similarityHash?: string;
}

export class EmbeddingService {
  private model = 'text-embedding-ada-002';

  /**
   * Generate embedding for episode
   *
   * Combines multiple sources:
   * - Stanza (compressed essence)
   * - Place cue (location context)
   * - Sense cues (sensory triggers)
   * - Optional full text
   *
   * This creates a rich semantic representation
   * Calls secure server-side API route
   */
  async generate(input: GenerateEmbeddingInput): Promise<EmbeddingResult> {
    try {
      // Call server-side API route (keeps OpenAI API key secure)
      const response = await fetch('/api/memory/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: input.text,
          stanza: input.stanza,
          placeCue: input.placeCue,
          senseCues: input.senseCues,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        embedding: data.embedding,
        similarityHash: data.similarityHash,
      };
    } catch (error) {
      console.error('[EmbeddingService] Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Store embedding for episode
   *
   * Uses Postgres-native storage via EmbeddingRepo
   */
  async store(episodeId: string, result: EmbeddingResult): Promise<boolean> {
    try {
      await EmbeddingRepo.upsertEmbedding({
        episodeId,
        model: this.model,
        embedding: result.embedding,
        similarityHash: result.similarityHash,
        decayRate: 0.0, // Future: implement memory decay
      });

      console.log(`[EmbeddingService] Stored embedding for episode ${episodeId}`);
      return true;
    } catch (error) {
      console.error('[EmbeddingService] Error storing embedding:', error);
      return false;
    }
  }

  /**
   * Generate and store embedding for episode
   *
   * Convenience method combining generate + store
   */
  async embedEpisode(
    episodeId: string,
    input: GenerateEmbeddingInput
  ): Promise<boolean> {
    try {
      const result = await this.generate(input);
      return await this.store(episodeId, result);
    } catch (error) {
      console.error('[EmbeddingService] Error embedding episode:', error);
      return false;
    }
  }

  /**
   * Find similar episodes using vector search
   *
   * Uses pgvector cosine similarity
   * Returns episode IDs sorted by similarity
   */
  async findSimilar(
    embedding: number[],
    limit: number = 10,
    minSimilarity: number = 0.7
  ): Promise<SimilarEpisode[]> {
    try {
      return await EmbeddingRepo.findSimilar({
        embedding,
        limit,
        minSimilarity,
      });
    } catch (error) {
      console.error('[EmbeddingService] Error finding similar:', error);
      return [];
    }
  }

  /**
   * Check if an episode has an embedding stored
   */
  async hasEmbedding(episodeId: string): Promise<boolean> {
    try {
      return await EmbeddingRepo.hasEmbedding(episodeId);
    } catch (error) {
      console.error('[EmbeddingService] Error checking embedding:', error);
      return false;
    }
  }

  /**
   * Delete embedding for an episode
   */
  async deleteEmbedding(episodeId: string): Promise<boolean> {
    try {
      return await EmbeddingRepo.deleteEmbedding(episodeId);
    } catch (error) {
      console.error('[EmbeddingService] Error deleting embedding:', error);
      return false;
    }
  }
}

/**
 * Create singleton instance
 */
let embeddingService: EmbeddingService | null = null;

export function getEmbeddingService(): EmbeddingService {
  if (!embeddingService) {
    embeddingService = new EmbeddingService();
  }
  return embeddingService;
}
