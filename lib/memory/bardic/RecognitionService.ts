/**
 * RecognitionService
 *
 * Fast, low-risk matching. No replays.
 * Recognizes familiar scenes through:
 * - Vector similarity (semantic)
 * - Cue matching (place, scent, people)
 * - Graph expansion (connected episodes)
 * - Affect resonance
 *
 * Architecture:
 * - Uses Postgres-native storage via RecognitionRepo
 * - Uses EmbeddingService for vector operations
 */

import type {
  RecognitionInput,
  EpisodeCandidate,
  Episode,
} from './types';
import { RecognitionRepo, type EpisodeRow, type LinkedEpisodeRow } from './storage/RecognitionRepo';

export class RecognitionService {
  /**
   * Recognize familiar scenes
   *
   * Returns top-k episode candidates with human-readable justifications
   */
  async recognize(input: RecognitionInput): Promise<EpisodeCandidate[]> {
    try {
      // 1. Vector search (semantic similarity)
      const byVector = await this.vectorSearch(input);

      // 2. Cue search (place, scent, people)
      const byCues = await this.cueSearch(input);

      // 3. Graph expansion (connected episodes)
      const byGraph = await this.graphExpand(byVector);

      // 4. Merge and rank by affect resonance
      const merged = this.mergeResults(byVector, byCues, byGraph);
      const ranked = this.rankByAffect(merged, input.affect);

      return ranked.slice(0, 5); // Top 5 candidates
    } catch (error) {
      console.error('[RecognitionService] Error:', error);
      return [];
    }
  }

  /**
   * Vector search using embeddings
   */
  private async vectorSearch(input: RecognitionInput): Promise<EpisodeCandidate[]> {
    try {
      // Generate embedding from recent text
      const { getEmbeddingService } = await import('./EmbeddingService');
      const embeddingService = getEmbeddingService();

      const { embedding } = await embeddingService.generate({
        text: input.recentText
      });

      // Find similar episodes using pgvector
      const similar = await embeddingService.findSimilar(embedding, 10, 0.7);

      if (similar.length === 0) {
        return [];
      }

      // Fetch episode details via RecognitionRepo
      const episodeIds = similar.map(s => s.episodeId);
      const episodes = await RecognitionRepo.getEpisodesByIds(input.userId, episodeIds);

      if (episodes.length === 0) {
        return [];
      }

      // Map to candidates with similarity scores
      return episodes.map(ep => {
        const match = similar.find(s => s.episodeId === ep.id);
        const similarity = match?.similarity || 0.7;

        return {
          episodeId: ep.id,
          score: similarity,
          why: `Semantically resonant (${Math.round(similarity * 100)}% match)`,
          episode: this.parseEpisode(ep)
        };
      });
    } catch (error) {
      console.error('[RecognitionService] Vector search error:', error);
      return [];
    }
  }

  /**
   * Cue-based search (place, scent, people)
   */
  private async cueSearch(input: RecognitionInput): Promise<EpisodeCandidate[]> {
    if (!input.softCues || input.softCues.length === 0) {
      return [];
    }

    try {
      // Search episodes that have matching cues via RecognitionRepo
      const episodes = await RecognitionRepo.getEpisodesByCues(input.userId, input.softCues);

      return episodes.map(ep => ({
        episodeId: ep.id,
        score: 0.8, // Cue matches are strong signals
        why: `Shares cues: ${input.softCues!.join(', ')}`,
        episode: this.parseEpisode(ep)
      }));
    } catch (error) {
      console.error('[RecognitionService] Cue search error:', error);
      return [];
    }
  }

  /**
   * Graph expansion: find connected episodes
   */
  private async graphExpand(candidates: EpisodeCandidate[]): Promise<EpisodeCandidate[]> {
    if (candidates.length === 0) return [];

    try {
      const episodeIds = candidates.map(c => c.episodeId);

      // Find episodes linked to these candidates via RecognitionRepo
      const linkedEpisodes = await RecognitionRepo.getLinkedEpisodes(episodeIds, 10);

      return linkedEpisodes.map(link => ({
        episodeId: link.id,
        score: link.link_weight,
        why: `${this.relationToText(link.link_relation)} another familiar scene`,
        episode: this.parseEpisode(link)
      }));
    } catch (error) {
      console.error('[RecognitionService] Graph expand error:', error);
      return [];
    }
  }

  /**
   * Merge results from different search strategies
   */
  private mergeResults(
    ...resultSets: EpisodeCandidate[][]
  ): EpisodeCandidate[] {
    const merged = new Map<string, EpisodeCandidate>();

    for (const results of resultSets) {
      for (const candidate of results) {
        const existing = merged.get(candidate.episodeId);
        if (!existing || candidate.score > existing.score) {
          merged.set(candidate.episodeId, candidate);
        }
      }
    }

    return Array.from(merged.values());
  }

  /**
   * Rank by affect resonance
   */
  private rankByAffect(
    candidates: EpisodeCandidate[],
    currentAffect?: { valence: number; arousal: number }
  ): EpisodeCandidate[] {
    if (!currentAffect) {
      return candidates.sort((a, b) => b.score - a.score);
    }

    return candidates
      .map(candidate => {
        const epAffect = candidate.episode.affect_valence || 0;
        const epArousal = candidate.episode.affect_arousal || 5;

        // Calculate affect distance
        const valenceDist = Math.abs(currentAffect.valence - epAffect);
        const arousalDist = Math.abs(currentAffect.arousal - epArousal);

        // Boost score if affect is resonant (similar)
        const affectBoost = 1 - (valenceDist / 10 + arousalDist / 10) / 2;
        const adjustedScore = candidate.score * (0.7 + 0.3 * affectBoost);

        return {
          ...candidate,
          score: adjustedScore
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Parse database row to Episode type
   */
  private parseEpisode(row: EpisodeRow | LinkedEpisodeRow): Episode {
    return {
      id: row.id,
      user_id: row.user_id,
      occurred_at: new Date(row.occurred_at),
      place_cue: row.place_cue ?? undefined,
      sense_cues: row.sense_cues as string[] | undefined,
      people: row.people as string[] | undefined,
      affect_valence: row.affect_valence ?? undefined,
      affect_arousal: row.affect_arousal ?? undefined,
      elemental_state: (row.elemental_state as Episode['elemental_state']) || {
        fire: 0.5,
        air: 0.5,
        water: 0.5,
        earth: 0.5,
        aether: 0.5
      },
      scene_stanza: row.scene_stanza ?? undefined,
      sacred_flag: row.sacred_flag ?? false,
      created_at: new Date(row.created_at),
      updated_at: row.updated_at ? new Date(row.updated_at) : new Date(row.created_at)
    };
  }

  /**
   * Convert relation enum to human text
   */
  private relationToText(relation: string): string {
    const map: Record<string, string> = {
      echoes: 'Echoes',
      contrasts: 'Contrasts with',
      fulfills: 'Fulfills',
      co_occurs: 'Happened around the same time as'
    };
    return map[relation] || relation;
  }
}

/**
 * Create singleton instance
 */
let recognitionService: RecognitionService | null = null;

export function getRecognitionService(): RecognitionService {
  if (!recognitionService) {
    recognitionService = new RecognitionService();
  }
  return recognitionService;
}
