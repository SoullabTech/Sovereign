/**
 * ReentryService
 *
 * Opens episodes using stanza + cue
 * Gates re-entry based on:
 * - Consent (not sacred)
 * - Capacity (affect arousal check)
 * - Titration (gradual, not overwhelming)
 *
 * Principle: Memory as RE-ENTRY (ritual reconstitution) not RETRIEVAL (extraction)
 *
 * Architecture:
 * - Uses Postgres-native storage via ReentryRepo
 */

import type {
  ReentryResult,
  Episode,
  Cue
} from './types';
import { ReentryRepo, type EpisodeRow, type CueRow } from './storage/ReentryRepo';

export class ReentryService {
  /**
   * Attempt to re-enter an episode
   *
   * Gates:
   * 1. Sacred check - sacred episodes are held, not handled
   * 2. Capacity check - is user in state to receive this?
   * 3. Cue selection - pick strongest cue for re-entry
   */
  async reenter(
    userId: string,
    episodeId: string,
    currentArousal?: number
  ): Promise<ReentryResult> {
    try {
      // 1. Fetch episode via ReentryRepo
      const episodeRow = await ReentryRepo.getEpisode(userId, episodeId);

      if (!episodeRow) {
        return {
          allowed: false,
          reason: 'Episode not found'
        };
      }

      // 2. Sacred gate
      if (episodeRow.sacred_flag) {
        return {
          allowed: false,
          reason: 'sacred',
          episode: this.parseEpisode(episodeRow)
        };
      }

      // 3. Capacity gate (affect arousal check)
      const arousal = currentArousal ?? 5; // Default to moderate
      const capacityOk = this.capacityGate(arousal);

      if (!capacityOk) {
        return {
          allowed: false,
          reason: 'capacity',
          episode: this.parseEpisode(episodeRow)
        };
      }

      // 4. Pick strongest cue for this episode
      const cue = await this.pickCue(episodeId);

      // 5. Return stanza + cue for ritual re-entry
      return {
        allowed: true,
        stanza: episodeRow.scene_stanza ?? undefined,
        cue,
        episode: this.parseEpisode(episodeRow)
      };
    } catch (error) {
      console.error('[ReentryService] Error:', error);
      return {
        allowed: false,
        reason: 'error'
      };
    }
  }

  /**
   * Capacity gate
   *
   * Checks if user is in state to receive memory re-entry
   * Based on current affect arousal (0-10)
   *
   * Principle: Titration - don't overwhelm
   */
  private capacityGate(arousal: number): boolean {
    // If arousal is very high (>= 8), not safe to re-enter potentially intense memory
    // User needs grounding first
    const threshold = 8;

    return arousal < threshold;
  }

  /**
   * Pick strongest cue for this episode
   *
   * Cues: place, scent, music, ritual, threshold
   * Potency: how strong this cue is for reconstituting the scene
   */
  private async pickCue(episodeId: string): Promise<Cue | undefined> {
    const cueRow = await ReentryRepo.getStrongestCue(episodeId);

    if (!cueRow) {
      return undefined;
    }

    return this.parseCue(cueRow);
  }

  /**
   * Mark episode as sacred
   *
   * Sacred episodes are:
   * - Not indexed (no embeddings)
   * - Not linked (no graph connections)
   * - Held in silence (minimal handling)
   *
   * Use cases:
   * - Trauma that needs professional support
   * - Peak experiences that resist language
   * - Moments that feel too vulnerable to analyze
   */
  async markSacred(userId: string, episodeId: string): Promise<boolean> {
    const success = await ReentryRepo.markSacred(userId, episodeId);
    if (success) {
      console.log(`[ReentryService] Episode ${episodeId} marked sacred`);
    }
    return success;
  }

  /**
   * Unmark episode as sacred (if user chooses)
   */
  async unmarkSacred(userId: string, episodeId: string): Promise<boolean> {
    const success = await ReentryRepo.unmarkSacred(userId, episodeId);
    if (success) {
      console.log(`[ReentryService] Episode ${episodeId} unmarked sacred`);
    }
    return success;
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
   * Parse database row to Cue type
   */
  private parseCue(row: CueRow): Cue {
    return {
      id: row.id,
      user_id: row.user_id,
      type: row.type as Cue['type'],
      media_ref: row.media_ref ?? undefined,
      user_words: row.user_words ?? undefined,
      created_at: new Date(row.created_at)
    };
  }
}

/**
 * Create singleton instance
 */
let reentryService: ReentryService | null = null;

export function getReentryService(): ReentryService {
  if (!reentryService) {
    reentryService = new ReentryService();
  }
  return reentryService;
}
