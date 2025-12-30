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
 *
 * Architecture:
 * - Uses Postgres-native storage via RecallRepo
 */

import { RecallRepo, type EpisodeRow, type MicroactRow } from './storage/RecallRepo';
import type { RecallResult, Episode, Microact } from './types';

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
  /**
   * Recall an episode with artifacts
   *
   * Loads full details + optional artifacts based on user needs
   */
  async recall(input: RecallInput): Promise<RecallResult | null> {
    try {
      // 1. Load episode
      const episodeRow = await RecallRepo.getEpisode(input.userId, input.episodeId);

      if (!episodeRow) {
        console.error('[RecallService] Episode not found');
        return null;
      }

      // 2. Sacred check - return episode only, no artifacts
      if (episodeRow.sacred_flag) {
        return {
          episode: this.parseEpisode(episodeRow),
          artifacts: undefined
        };
      }

      // 3. Load artifacts (if requested)
      const artifacts: RecallResult['artifacts'] = {};

      if (input.includeTranscripts) {
        artifacts.transcript = await RecallRepo.getTranscriptForEpisode(input.episodeId);
      }

      if (input.includeInsights) {
        const insights = await RecallRepo.getInsightsForEpisode(
          input.episodeId,
          input.maxInsights ?? 5
        );
        if (insights.length > 0) {
          artifacts.insights = insights;
        }
      }

      if (input.includeMicroacts) {
        const microactRows = await RecallRepo.getMicroactsForEpisode(
          input.episodeId,
          input.maxMicroacts ?? 3
        );
        if (microactRows.length > 0) {
          artifacts.microacts = microactRows.map(row => this.parseMicroact(row));
        }
      }

      return {
        episode: this.parseEpisode(episodeRow),
        artifacts: Object.keys(artifacts).length > 0 ? artifacts : undefined
      };
    } catch (error) {
      console.error('[RecallService] Error:', error);
      return null;
    }
  }

  /**
   * Create a new microact
   */
  async createMicroact(params: {
    userId: string;
    description: string;
    context?: string;
    elementBias?: string;
  }): Promise<Microact | null> {
    try {
      const row = await RecallRepo.createMicroact({
        userId: params.userId,
        description: params.description,
        context: params.context,
        elementBias: params.elementBias,
      });
      return this.parseMicroact(row);
    } catch (error) {
      console.error('[RecallService] Error creating microact:', error);
      return null;
    }
  }

  /**
   * Log a microact event
   */
  async logMicroactEvent(params: {
    userId: string;
    microactId: string;
    episodeId?: string;
    eventType: 'suggested' | 'started' | 'completed' | 'skipped';
    notes?: string;
  }): Promise<boolean> {
    try {
      await RecallRepo.logMicroactEvent({
        userId: params.userId,
        microactId: params.microactId,
        episodeId: params.episodeId,
        eventType: params.eventType,
        notes: params.notes,
      });
      return true;
    } catch (error) {
      console.error('[RecallService] Error logging microact event:', error);
      return false;
    }
  }

  /**
   * Get user's microacts
   */
  async getUserMicroacts(userId: string, limit?: number): Promise<Microact[]> {
    try {
      const rows = await RecallRepo.getUserMicroacts(userId, limit);
      return rows.map(row => this.parseMicroact(row));
    } catch (error) {
      console.error('[RecallService] Error getting user microacts:', error);
      return [];
    }
  }

  /**
   * Parse database row to Episode type
   */
  private parseEpisode(row: EpisodeRow): Episode {
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
   * Parse database row to Microact type
   */
  private parseMicroact(row: MicroactRow): Microact {
    const validElements = ['fire', 'air', 'water', 'earth', 'aether'] as const;
    const elementBias = row.element_bias && validElements.includes(row.element_bias as typeof validElements[number])
      ? row.element_bias as 'fire' | 'air' | 'water' | 'earth' | 'aether'
      : undefined;

    return {
      id: row.id,
      user_id: row.user_id,
      description: row.description,
      context: row.context ?? undefined,
      element_bias: elementBias,
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
