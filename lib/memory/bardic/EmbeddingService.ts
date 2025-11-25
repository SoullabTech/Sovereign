/**
 * EmbeddingService
 *
 * Generates vector embeddings for episodes using OpenAI
 * Enables semantic similarity search for recognition
 *
 * Architecture:
 * - Generate embeddings from episode text + stanza
 * - Store in episode_vectors table (pgvector)
 * - Use for fast approximate nearest neighbor search
 * - Calculate LSH/SimHash for even faster matching
 *
 * SECURITY: Calls server-side /api/memory/embed route (never exposes API keys)
 */

import { createClientComponentClient } from '@/lib/supabase';
import type { Episode } from './types';

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
  private supabase = createClientComponentClient();

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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: input.text,
          stanza: input.stanza,
          placeCue: input.placeCue,
          senseCues: input.senseCues
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        embedding: data.embedding,
        similarityHash: data.similarityHash
      };
    } catch (error) {
      console.error('[EmbeddingService] Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Store embedding for episode
   *
   * Inserts into episode_vectors table with pgvector support
   */
  async store(episodeId: string, result: EmbeddingResult): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('episode_vectors')
        .insert({
          episode_id: episodeId,
          embedding: result.embedding,
          similarity_hash: result.similarityHash,
          decay_rate: 0.0 // Future: implement memory decay
        });

      if (error) {
        console.error('[EmbeddingService] Error storing embedding:', error);
        return false;
      }

      console.log(`[EmbeddingService] Stored embedding for episode ${episodeId}`);
      return true;
    } catch (error) {
      console.error('[EmbeddingService] Error:', error);
      return false;
    }
  }

  /**
   * Generate and store embedding for episode
   *
   * Convenience method combining generate + store
   */
  async embedEpisode(episodeId: string, input: GenerateEmbeddingInput): Promise<boolean> {
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
  ): Promise<Array<{ episodeId: string; similarity: number }>> {
    try {
      // Use pgvector's cosine similarity operator (<=>)
      // Note: This requires proper pgvector setup and RPC function
      const { data, error } = await this.supabase.rpc('match_episodes', {
        query_embedding: embedding,
        match_threshold: 1 - minSimilarity, // Convert to distance
        match_count: limit
      });

      if (error) {
        console.error('[EmbeddingService] Error finding similar:', error);
        return [];
      }

      return data.map((row: any) => ({
        episodeId: row.episode_id,
        similarity: 1 - row.distance // Convert distance back to similarity
      }));
    } catch (error) {
      console.error('[EmbeddingService] Error:', error);
      return [];
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
