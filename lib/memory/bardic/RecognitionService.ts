/**
 * RecognitionService
 *
 * Fast, low-risk matching. No replays.
 * Recognizes familiar scenes through:
 * - Vector similarity (semantic)
 * - Cue matching (place, scent, people)
 * - Graph expansion (connected episodes)
 * - Affect resonance
 */

import { createClientComponentClient } from '@/lib/supabase';
import type {
  RecognitionInput,
  EpisodeCandidate,
  Episode,
  EpisodeCue,
  Cue
} from './types';

export class RecognitionService {
  private supabase = createClientComponentClient();

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

      // Fetch episode details
      const episodeIds = similar.map(s => s.episodeId);
      const { data, error } = await this.supabase
        .from('episodes')
        .select('*')
        .eq('user_id', input.userId)
        .in('id', episodeIds);

      if (error || !data) {
        console.error('[RecognitionService] Error fetching episodes:', error);
        return [];
      }

      // Map to candidates with similarity scores
      return data.map(ep => {
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

    // Search episodes that have matching cues
    const { data, error } = await this.supabase
      .from('episodes')
      .select('*')
      .eq('user_id', input.userId)
      .eq('sacred_flag', false)
      .overlaps('sense_cues', input.softCues);

    if (error || !data) {
      return [];
    }

    return data.map(ep => ({
      episodeId: ep.id,
      score: 0.8, // Cue matches are strong signals
      why: `Shares cues: ${input.softCues.join(', ')}`,
      episode: this.parseEpisode(ep)
    }));
  }

  /**
   * Graph expansion: find connected episodes
   */
  private async graphExpand(candidates: EpisodeCandidate[]): Promise<EpisodeCandidate[]> {
    if (candidates.length === 0) return [];

    const episodeIds = candidates.map(c => c.episodeId);

    // Find episodes linked to these candidates
    const { data, error } = await this.supabase
      .from('episode_links')
      .select('dst_episode_id, relation, weight, episodes(*)')
      .in('src_episode_id', episodeIds)
      .order('weight', { ascending: false })
      .limit(10);

    if (error || !data) {
      return [];
    }

    return data.map(link => ({
      episodeId: link.dst_episode_id,
      score: link.weight,
      why: `${this.relationToText(link.relation)} another familiar scene`,
      episode: this.parseEpisode(link.episodes)
    }));
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
  private parseEpisode(row: any): Episode {
    return {
      id: row.id,
      user_id: row.user_id,
      occurred_at: new Date(row.occurred_at),
      place_cue: row.place_cue,
      sense_cues: row.sense_cues,
      people: row.people,
      affect_valence: row.affect_valence,
      affect_arousal: row.affect_arousal,
      elemental_state: row.elemental_state || {
        fire: 0.5,
        air: 0.5,
        water: 0.5,
        earth: 0.5,
        aether: 0.5
      },
      scene_stanza: row.scene_stanza,
      sacred_flag: row.sacred_flag,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
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
