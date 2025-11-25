/**
 * CueService
 *
 * Manages sensory triggers for episode re-entry:
 * - Place cues ("lake wind", "kitchen doorway")
 * - Scent cues ("cedar", "coffee")
 * - Music cues (songs, playlists)
 * - Ritual cues ("lighting candle", "morning walk")
 * - Threshold cues ("dawn", "dusk", "new moon")
 *
 * Cues are not just metadata - they are portals for reconstitution.
 * A cue's potency measures how strongly it evokes the episode.
 */

import { createClientComponentClient } from '@/lib/supabase';
import type {
  Cue,
  CueType,
  EpisodeCue,
  Episode
} from './types';

export interface CreateCueInput {
  userId: string;
  type: CueType;
  userWords: string; // How user describes it
  mediaRef?: string; // URL or file reference
}

export interface AssociateCueInput {
  episodeId: string;
  cueId: string;
  potency: number; // 0-1, how strong this cue is for this episode
}

export interface FindByCueInput {
  userId: string;
  cueId: string;
  minPotency?: number; // Filter by potency threshold
}

export class CueService {
  private supabase = createClientComponentClient();

  /**
   * Create a new cue
   *
   * Cues are user-specific. Same scent might mean different things to different people.
   */
  async create(input: CreateCueInput): Promise<Cue | null> {
    try {
      const { data, error } = await this.supabase
        .from('cues')
        .insert({
          user_id: input.userId,
          type: input.type,
          media_ref: input.mediaRef,
          user_words: input.userWords
        })
        .select()
        .single();

      if (error) {
        console.error('[CueService] Error creating cue:', error);
        return null;
      }

      return this.parseCue(data);
    } catch (error) {
      console.error('[CueService] Error:', error);
      return null;
    }
  }

  /**
   * Associate a cue with an episode
   *
   * Potency: how strongly this cue evokes this episode
   * - 1.0 = immediate, visceral reconstitution
   * - 0.7 = reliable trigger
   * - 0.5 = moderate connection
   * - < 0.5 = weak association
   */
  async associate(input: AssociateCueInput): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('episode_cues')
        .insert({
          episode_id: input.episodeId,
          cue_id: input.cueId,
          potency: input.potency
        });

      if (error) {
        console.error('[CueService] Error associating cue:', error);
        return false;
      }

      console.log(`[CueService] Associated cue ${input.cueId} with episode ${input.episodeId} (potency: ${input.potency})`);
      return true;
    } catch (error) {
      console.error('[CueService] Error:', error);
      return false;
    }
  }

  /**
   * Update cue potency for an episode
   *
   * Use this when you learn a cue is stronger/weaker than initially thought.
   * For example, after successful re-entry, boost potency.
   */
  async updatePotency(episodeId: string, cueId: string, newPotency: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('episode_cues')
        .update({ potency: newPotency })
        .eq('episode_id', episodeId)
        .eq('cue_id', cueId);

      if (error) {
        console.error('[CueService] Error updating potency:', error);
        return false;
      }

      console.log(`[CueService] Updated potency for cue ${cueId} on episode ${episodeId} to ${newPotency}`);
      return true;
    } catch (error) {
      console.error('[CueService] Error:', error);
      return false;
    }
  }

  /**
   * Find episodes associated with a cue
   *
   * Returns episodes sorted by potency (strongest first)
   */
  async findEpisodesByCue(input: FindByCueInput): Promise<Episode[]> {
    try {
      const minPotency = input.minPotency ?? 0.5;

      const { data, error } = await this.supabase
        .from('episode_cues')
        .select('episode_id, potency, episodes(*)')
        .eq('cue_id', input.cueId)
        .gte('potency', minPotency)
        .order('potency', { ascending: false });

      if (error || !data) {
        console.error('[CueService] Error finding episodes by cue:', error);
        return [];
      }

      // Filter to ensure user_id matches and not sacred
      return data
        .filter(row =>
          row.episodes &&
          row.episodes.user_id === input.userId &&
          !row.episodes.sacred_flag
        )
        .map(row => this.parseEpisode(row.episodes));
    } catch (error) {
      console.error('[CueService] Error:', error);
      return [];
    }
  }

  /**
   * Find all cues for a user
   *
   * Useful for displaying cue library or suggesting cues during episode creation
   */
  async findUserCues(userId: string, type?: CueType): Promise<Cue[]> {
    try {
      let query = this.supabase
        .from('cues')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error || !data) {
        console.error('[CueService] Error finding user cues:', error);
        return [];
      }

      return data.map(row => this.parseCue(row));
    } catch (error) {
      console.error('[CueService] Error:', error);
      return [];
    }
  }

  /**
   * Find cues associated with an episode
   *
   * Returns cues sorted by potency (strongest first)
   */
  async findCuesForEpisode(episodeId: string): Promise<Array<Cue & { potency: number }>> {
    try {
      const { data, error } = await this.supabase
        .from('episode_cues')
        .select('cue_id, potency, cues(*)')
        .eq('episode_id', episodeId)
        .order('potency', { ascending: false });

      if (error || !data) {
        console.error('[CueService] Error finding cues for episode:', error);
        return [];
      }

      return data
        .filter(row => row.cues)
        .map(row => ({
          ...this.parseCue(row.cues),
          potency: row.potency
        }));
    } catch (error) {
      console.error('[CueService] Error:', error);
      return [];
    }
  }

  /**
   * Delete a cue
   *
   * Cascades to episode_cues (associations removed automatically)
   */
  async delete(cueId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('cues')
        .delete()
        .eq('id', cueId)
        .eq('user_id', userId);

      if (error) {
        console.error('[CueService] Error deleting cue:', error);
        return false;
      }

      console.log(`[CueService] Deleted cue ${cueId}`);
      return true;
    } catch (error) {
      console.error('[CueService] Error:', error);
      return false;
    }
  }

  /**
   * Suggest cues from episode text
   *
   * Extract potential cues from free-form text:
   * - Place words: "kitchen", "park", "beach"
   * - Scent words: "coffee", "rain", "pine"
   * - Time words: "dawn", "dusk", "midnight"
   * - Sensory words: "warm", "cold", "bright"
   *
   * Returns suggested cue text (user can accept/edit)
   */
  async suggestCuesFromText(text: string): Promise<string[]> {
    // Simple keyword extraction
    // In production, use Claude for better extraction
    const lowerText = text.toLowerCase();

    const suggestions: string[] = [];

    // Place patterns
    const placePatterns = [
      /\b(kitchen|bedroom|office|park|beach|lake|mountain|cafe|restaurant|home|garden)\b/gi
    ];

    // Scent patterns
    const scentPatterns = [
      /\b(coffee|rain|pine|cedar|ocean|flowers|bread|smoke|vanilla|citrus)\b/gi
    ];

    // Time/threshold patterns
    const thresholdPatterns = [
      /\b(dawn|dusk|sunrise|sunset|midnight|afternoon|morning|evening|twilight)\b/gi
    ];

    // Extract matches
    for (const pattern of [...placePatterns, ...scentPatterns, ...thresholdPatterns]) {
      const matches = text.match(pattern);
      if (matches) {
        suggestions.push(...matches.map(m => m.toLowerCase()));
      }
    }

    // Deduplicate
    return Array.from(new Set(suggestions));
  }

  /**
   * Parse database row to Cue type
   */
  private parseCue(row: any): Cue {
    return {
      id: row.id,
      user_id: row.user_id,
      type: row.type,
      media_ref: row.media_ref,
      user_words: row.user_words,
      created_at: new Date(row.created_at)
    };
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
let cueService: CueService | null = null;

export function getCueService(): CueService {
  if (!cueService) {
    cueService = new CueService();
  }
  return cueService;
}
