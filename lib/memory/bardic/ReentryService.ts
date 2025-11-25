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
 */

import { createClientComponentClient } from '@/lib/supabase';
import type {
  ReentryResult,
  Episode,
  Cue
} from './types';

export class ReentryService {
  private supabase = createClientComponentClient();

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
      // 1. Fetch episode
      const { data: episode, error } = await this.supabase
        .from('episodes')
        .select('*')
        .eq('id', episodeId)
        .eq('user_id', userId)
        .single();

      if (error || !episode) {
        return {
          allowed: false,
          reason: 'Episode not found'
        };
      }

      // 2. Sacred gate
      if (episode.sacred_flag) {
        return {
          allowed: false,
          reason: 'sacred',
          episode: this.parseEpisode(episode)
        };
      }

      // 3. Capacity gate (affect arousal check)
      const arousal = currentArousal ?? 5; // Default to moderate
      const capacityOk = await this.capacityGate(arousal);

      if (!capacityOk) {
        return {
          allowed: false,
          reason: 'capacity',
          episode: this.parseEpisode(episode)
        };
      }

      // 4. Pick strongest cue for this episode
      const cue = await this.pickCue(episodeId);

      // 5. Return stanza + cue for ritual re-entry
      return {
        allowed: true,
        stanza: episode.scene_stanza,
        cue,
        episode: this.parseEpisode(episode)
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
  private async capacityGate(arousal: number): Promise<boolean> {
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
    const { data, error } = await this.supabase
      .from('episode_cues')
      .select('cue_id, potency, cues(*)')
      .eq('episode_id', episodeId)
      .order('potency', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return undefined;
    }

    return {
      id: data.cues.id,
      user_id: data.cues.user_id,
      type: data.cues.type,
      media_ref: data.cues.media_ref,
      user_words: data.cues.user_words,
      created_at: new Date(data.cues.created_at)
    };
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
    try {
      const { error } = await this.supabase
        .from('episodes')
        .update({ sacred_flag: true })
        .eq('id', episodeId)
        .eq('user_id', userId);

      if (error) throw error;

      // Also delete any embeddings/links (respect the sacred)
      await this.supabase
        .from('episode_vectors')
        .delete()
        .eq('episode_id', episodeId);

      await this.supabase
        .from('episode_links')
        .delete()
        .or(`src_episode_id.eq.${episodeId},dst_episode_id.eq.${episodeId}`);

      console.log(`[ReentryService] Episode ${episodeId} marked sacred`);
      return true;
    } catch (error) {
      console.error('[ReentryService] Error marking sacred:', error);
      return false;
    }
  }

  /**
   * Unmark episode as sacred (if user chooses)
   */
  async unmarkSacred(userId: string, episodeId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('episodes')
        .update({ sacred_flag: false })
        .eq('id', episodeId)
        .eq('user_id', userId);

      if (error) throw error;

      console.log(`[ReentryService] Episode ${episodeId} unmarked sacred`);
      return true;
    } catch (error) {
      console.error('[ReentryService] Error unmarking sacred:', error);
      return false;
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
