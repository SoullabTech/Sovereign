/**
 * RecallService
 *
 * The third R: Recognition → Reentry → RECALL
 *
 * After recognition and re-entry, recall loads full artifacts:
 * - Conversation transcripts
 * - Insights extracted
 * - Microacts generated
 * - Related episodes
 *
 * Principles:
 * - Titration: Load artifacts gradually, not all at once
 * - Relevance: Filter for what matters to current context
 * - Respect: Sacred episodes remain held (no artifacts)
 * - Reconstitution: Present artifacts in way that evokes, not just lists
 */

import { createClientComponentClient } from '@/lib/supabase';
import type {
  RecallResult,
  Episode,
  Microact
} from './types';

export interface RecallInput {
  userId: string;
  episodeId: string;
  includeTranscripts?: boolean;
  includeInsights?: boolean;
  includeMicroacts?: boolean;
  includeRelated?: boolean;
  maxInsights?: number;
  maxMicroacts?: number;
  maxRelated?: number;
}

export class RecallService {
  private supabase = createClientComponentClient();

  /**
   * Recall an episode with artifacts
   *
   * Loads full details + optional artifacts based on user needs
   */
  async recall(input: RecallInput): Promise<RecallResult | null> {
    try {
      // 1. Load episode
      const { data: episode, error } = await this.supabase
        .from('episodes')
        .select('*')
        .eq('id', input.episodeId)
        .eq('user_id', input.userId)
        .single();

      if (error || !episode) {
        console.error('[RecallService] Episode not found:', error);
        return null;
      }

      // 2. Sacred check - return episode only, no artifacts
      if (episode.sacred_flag) {
        return {
          episode: this.parseEpisode(episode),
          artifacts: undefined
        };
      }

      // 3. Load artifacts (if requested)
      const artifacts: RecallResult['artifacts'] = {};

      if (input.includeTranscripts) {
        artifacts.transcript = await this.loadTranscript(input.episodeId);
      }

      if (input.includeInsights) {
        artifacts.insights = await this.loadInsights(
          input.episodeId,
          input.maxInsights ?? 5
        );
      }

      if (input.includeMicroacts) {
        artifacts.microacts = await this.loadMicroacts(
          input.episodeId,
          input.maxMicroacts ?? 3
        );
      }

      return {
        episode: this.parseEpisode(episode),
        artifacts
      };
    } catch (error) {
      console.error('[RecallService] Error:', error);
      return null;
    }
  }

  /**
   * Load conversation transcript for episode
   *
   * In future, this will load from conversation_logs table
   * For now, placeholder
   */
  private async loadTranscript(episodeId: string): Promise<string | undefined> {
    // TODO: Implement when conversation logging is in place
    // For now, return undefined
    return undefined;
  }

  /**
   * Load insights extracted from episode
   *
   * Insights are key realizations, patterns noticed, or meaningful shifts
   * Stored as short phrases or sentences
   */
  private async loadInsights(
    episodeId: string,
    maxCount: number
  ): Promise<string[] | undefined> {
    // TODO: Implement when insights extraction is in place
    // This would query an insights table or extract from episode metadata
    // For now, return undefined
    return undefined;
  }

  /**
   * Load microacts generated from episode
   *
   * Microacts are tiny embodied practices suggested based on this episode
   */
  private async loadMicroacts(
    episodeId: string,
    maxCount: number
  ): Promise<Microact[] | undefined> {
    try {
      // Find microacts linked to this episode via logs
      const { data, error } = await this.supabase
        .from('microact_logs')
        .select('microact_id, microacts(*)')
        .eq('episode_id', episodeId)
        .order('timestamp', { ascending: false })
        .limit(maxCount);

      if (error || !data || data.length === 0) {
        return undefined;
      }

      // Parse unique microacts
      const microactMap = new Map<string, Microact>();
      for (const log of data) {
        if (log.microacts && !microactMap.has(log.microacts.id)) {
          microactMap.set(log.microacts.id, this.parseMicroact(log.microacts));
        }
      }

      return Array.from(microactMap.values());
    } catch (error) {
      console.error('[RecallService] Error loading microacts:', error);
      return undefined;
    }
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
   * Parse database row to Microact type
   */
  private parseMicroact(row: any): Microact {
    return {
      id: row.id,
      user_id: row.user_id,
      description: row.description,
      context: row.context,
      element_bias: row.element_bias,
      created_at: new Date(row.created_at)
    };
  }
}

/**
 * Create singleton instance
 */
let recallService: RecallService | null = null;

export function getRecallService(): RecallService {
  if (!recallService) {
    recallService = new RecallService();
  }
  return recallService;
}
