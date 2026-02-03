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
 *
 * Architecture:
 * - Uses Postgres-native storage via CueRepo
 * - Cues are user-scoped (same cue may mean different things to different users)
 */

import { CueRepo, type StoredCue } from './storage/CueRepo';
import type { Cue, CueType, Episode } from './types';

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
  /**
   * Create a new cue
   *
   * Cues are user-specific. Same scent might mean different things to different people.
   */
  async create(input: CreateCueInput): Promise<Cue | null> {
    try {
      const stored = await CueRepo.upsertCue({
        userId: input.userId,
        cueType: input.type,
        userWords: input.userWords,
        mediaRef: input.mediaRef,
      });

      return this.storedToCue(stored);
    } catch (error) {
      console.error('[CueService] Error creating cue:', error);
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
      await CueRepo.attachCueToEpisode({
        episodeId: input.episodeId,
        cueId: input.cueId,
        potency: input.potency,
      });

      console.log(
        `[CueService] Associated cue ${input.cueId} with episode ${input.episodeId} (potency: ${input.potency})`
      );
      return true;
    } catch (error) {
      console.error('[CueService] Error associating cue:', error);
      return false;
    }
  }

  /**
   * Update cue potency for an episode
   *
   * Use this when you learn a cue is stronger/weaker than initially thought.
   * For example, after successful re-entry, boost potency.
   */
  async updatePotency(
    episodeId: string,
    cueId: string,
    newPotency: number
  ): Promise<boolean> {
    try {
      const success = await CueRepo.updatePotency(episodeId, cueId, newPotency);

      if (success) {
        console.log(
          `[CueService] Updated potency for cue ${cueId} on episode ${episodeId} to ${newPotency}`
        );
      }

      return success;
    } catch (error) {
      console.error('[CueService] Error updating potency:', error);
      return false;
    }
  }

  /**
   * Find episodes associated with a cue
   *
   * Returns episodes sorted by potency (strongest first).
   *
   * NOTE: Returns minimal Episode stubs with only `id` and `user_id` populated.
   * Full Episode hydration will be available once EpisodeRepo is migrated.
   * For now, callers needing full Episode data should fetch separately.
   */
  async findEpisodesByCue(input: FindByCueInput): Promise<Episode[]> {
    try {
      const results = await CueRepo.findEpisodeIdsByCue({
        cueId: input.cueId,
        minPotency: input.minPotency ?? 0.5,
      });

      // Log for telemetry
      if (results.length > 0) {
        const cue = await CueRepo.getCue(input.cueId);
        if (cue) {
          await CueRepo.logCueEvent({
            cueType: cue.cueType,
            cueKey: cue.cueKey,
            eventType: 'search',
            score: results.length,
            metadata: { userId: input.userId, resultCount: results.length },
          });
        }
      }

      // Return minimal Episode stubs (API-stable, full hydration pending EpisodeRepo)
      return results.map((hit) => ({
        id: hit.episodeId,
        user_id: input.userId,
        occurred_at: new Date(0),
        place_cue: undefined,
        sense_cues: [],
        people: [],
        affect_valence: 0,
        affect_arousal: 0,
        elemental_state: { fire: 0.5, air: 0.5, water: 0.5, earth: 0.5, aether: 0.5 },
        scene_stanza: undefined,
        sacred_flag: false,
        created_at: new Date(0),
        updated_at: new Date(0),
      }));
    } catch (error) {
      console.error('[CueService] Error finding episodes by cue:', error);
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
      const stored = await CueRepo.listUserCues(userId, type);
      return stored.map((s) => this.storedToCue(s));
    } catch (error) {
      console.error('[CueService] Error finding user cues:', error);
      return [];
    }
  }

  /**
   * Find cues associated with an episode
   *
   * Returns cues sorted by potency (strongest first)
   */
  async findCuesForEpisode(
    episodeId: string
  ): Promise<Array<Cue & { potency: number }>> {
    try {
      const stored = await CueRepo.listEpisodeCues(episodeId);
      return stored.map((s) => ({
        ...this.storedToCue(s),
        potency: s.potency,
      }));
    } catch (error) {
      console.error('[CueService] Error finding cues for episode:', error);
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
      const success = await CueRepo.deleteCue(cueId, userId);

      if (success) {
        console.log(`[CueService] Deleted cue ${cueId}`);
      }

      return success;
    } catch (error) {
      console.error('[CueService] Error deleting cue:', error);
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
    const suggestions: string[] = [];

    // Place patterns
    const placePatterns = [
      /\b(kitchen|bedroom|office|park|beach|lake|mountain|cafe|restaurant|home|garden)\b/gi,
    ];

    // Scent patterns
    const scentPatterns = [
      /\b(coffee|rain|pine|cedar|ocean|flowers|bread|smoke|vanilla|citrus)\b/gi,
    ];

    // Time/threshold patterns
    const thresholdPatterns = [
      /\b(dawn|dusk|sunrise|sunset|midnight|afternoon|morning|evening|twilight)\b/gi,
    ];

    // Extract matches
    for (const pattern of [
      ...placePatterns,
      ...scentPatterns,
      ...thresholdPatterns,
    ]) {
      const matches = text.match(pattern);
      if (matches) {
        suggestions.push(...matches.map((m) => m.toLowerCase()));
      }
    }

    // Deduplicate
    return Array.from(new Set(suggestions));
  }

  /**
   * Convert StoredCue to Cue type for backward compatibility
   */
  private storedToCue(stored: StoredCue): Cue {
    return {
      id: stored.id,
      user_id: stored.userId,
      type: stored.cueType,
      media_ref: stored.mediaRef ?? undefined,
      user_words: stored.userWords ?? undefined,
      created_at: stored.createdAt ? new Date(stored.createdAt) : new Date(),
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
