/**
 * EPISODIC MEMORY SERVICE
 *
 * Stores and retrieves significant experiences with vector embeddings
 * Part of MAIA's 5-Layer Memory Palace - Layer 1
 */

import { query, queryOne } from '../../database/postgres';
import { v4 as uuidv4 } from 'uuid';

export interface EpisodicMemory {
  id?: number;
  userId: string;
  episodeId: string;
  timestamp: Date;

  // Experience data
  experienceTitle: string;
  experienceDescription: string;
  experienceContext?: string;
  significance: number; // 1-10
  emotionalIntensity: number; // 0-1
  breakthroughLevel: number; // 0-10

  // Vector embeddings (JSONB arrays until pgvector is installed)
  semanticVector?: number[];
  emotionalVector?: number[];
  somaticVector?: number[];

  // Connections
  relatedEpisodes?: string[];
  connectionStrengths?: number[];
  connectionTypes?: ('similar' | 'contrast' | 'progression' | 'pattern' | 'insight')[];

  // Metadata
  spiralStage?: string;
  archetypalResonances?: string[];
  frameworksActive?: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export class EpisodicMemoryService {
  /**
   * Store a significant experience as an episodic memory
   */
  async storeEpisode(params: {
    userId: string;
    title: string;
    description: string;
    context?: string;
    significance: number;
    emotionalIntensity: number;
    breakthroughLevel?: number;
    spiralStage?: string;
    archetypalResonances?: string[];
    frameworksActive?: string[];
  }): Promise<EpisodicMemory> {
    const episodeId = uuidv4();

    try {
      const result = await queryOne<any>(
        `INSERT INTO episodic_memories (
          user_id, episode_id, experience_title, experience_description,
          experience_context, significance, emotional_intensity, breakthrough_level,
          spiral_stage, archetypal_resonances, frameworks_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          params.userId,
          episodeId,
          params.title,
          params.description,
          params.context || '',
          params.significance,
          params.emotionalIntensity,
          params.breakthroughLevel || 0,
          params.spiralStage || null,
          params.archetypalResonances || [],
          params.frameworksActive || []
        ]
      );

      console.log('📖 [Episodic] Stored episode:', episodeId);
      return this.mapToEpisodicMemory(result);
    } catch (error) {
      console.error('Error storing episodic memory:', error);
      throw error;
    }
  }

  /**
   * Retrieve significant episodes for a user
   */
  async getSignificantEpisodes(
    userId: string,
    minSignificance: number = 7,
    limit: number = 10
  ): Promise<EpisodicMemory[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM episodic_memories
         WHERE user_id = $1 AND significance >= $2
         ORDER BY significance DESC, timestamp DESC
         LIMIT $3`,
        [userId, minSignificance, limit]
      );

      return results.map(r => this.mapToEpisodicMemory(r));
    } catch (error) {
      console.error('Error retrieving significant episodes:', error);
      return [];
    }
  }

  /**
   * Find episodes by archetypal resonance
   */
  async findEpisodesByArchetype(
    userId: string,
    archetype: string,
    limit: number = 5
  ): Promise<EpisodicMemory[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM episodic_memories
         WHERE user_id = $1 AND $2 = ANY(archetypal_resonances)
         ORDER BY significance DESC, timestamp DESC
         LIMIT $3`,
        [userId, archetype, limit]
      );

      return results.map(r => this.mapToEpisodicMemory(r));
    } catch (error) {
      console.error('Error finding episodes by archetype:', error);
      return [];
    }
  }

  /**
   * Find recent breakthrough moments
   */
  async getBreakthroughMoments(
    userId: string,
    minBreakthroughLevel: number = 7,
    limit: number = 5
  ): Promise<EpisodicMemory[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM episodic_memories
         WHERE user_id = $1 AND breakthrough_level >= $2
         ORDER BY breakthrough_level DESC, timestamp DESC
         LIMIT $3`,
        [userId, minBreakthroughLevel, limit]
      );

      return results.map(r => this.mapToEpisodicMemory(r));
    } catch (error) {
      console.error('Error retrieving breakthroughs:', error);
      return [];
    }
  }

  /**
   * Add connection between episodes
   */
  async connectEpisodes(
    episodeId: string,
    relatedEpisodeId: string,
    connectionType: 'similar' | 'contrast' | 'progression' | 'pattern' | 'insight',
    strength: number = 0.5
  ): Promise<void> {
    try {
      await queryOne(
        `UPDATE episodic_memories
         SET
           related_episodes = array_append(related_episodes, $2),
           connection_types = array_append(connection_types, $3),
           connection_strengths = array_append(connection_strengths, $4),
           updated_at = NOW()
         WHERE episode_id = $1`,
        [episodeId, relatedEpisodeId, connectionType, strength]
      );

      console.log('🔗 [Episodic] Connected episodes:', episodeId, '->', relatedEpisodeId);
    } catch (error) {
      console.error('Error connecting episodes:', error);
    }
  }

  /**
   * Get all episodes for a user (with pagination)
   */
  async getUserEpisodes(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<EpisodicMemory[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM episodic_memories
         WHERE user_id = $1
         ORDER BY timestamp DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return results.map(r => this.mapToEpisodicMemory(r));
    } catch (error) {
      console.error('Error retrieving user episodes:', error);
      return [];
    }
  }

  /**
   * Store vector embeddings for an episode
   * (For future integration with embedding models)
   */
  async updateEmbeddings(
    episodeId: string,
    embeddings: {
      semantic?: number[];
      emotional?: number[];
      somatic?: number[];
    }
  ): Promise<void> {
    try {
      await queryOne(
        `UPDATE episodic_memories
         SET
           semantic_vector = $2,
           emotional_vector = $3,
           somatic_vector = $4,
           updated_at = NOW()
         WHERE episode_id = $1`,
        [
          episodeId,
          embeddings.semantic ? JSON.stringify(embeddings.semantic) : null,
          embeddings.emotional ? JSON.stringify(embeddings.emotional) : null,
          embeddings.somatic ? JSON.stringify(embeddings.somatic) : null
        ]
      );

      console.log('🧬 [Episodic] Updated embeddings for:', episodeId);
    } catch (error) {
      console.error('Error updating embeddings:', error);
    }
  }

  /**
   * Map database row to EpisodicMemory interface
   */
  private mapToEpisodicMemory(row: any): EpisodicMemory {
    return {
      id: row.id,
      userId: row.user_id,
      episodeId: row.episode_id,
      timestamp: new Date(row.timestamp),
      experienceTitle: row.experience_title,
      experienceDescription: row.experience_description,
      experienceContext: row.experience_context,
      significance: row.significance,
      emotionalIntensity: parseFloat(row.emotional_intensity),
      breakthroughLevel: row.breakthrough_level,
      semanticVector: row.semantic_vector ? JSON.parse(row.semantic_vector) : undefined,
      emotionalVector: row.emotional_vector ? JSON.parse(row.emotional_vector) : undefined,
      somaticVector: row.somatic_vector ? JSON.parse(row.somatic_vector) : undefined,
      relatedEpisodes: row.related_episodes || [],
      connectionStrengths: row.connection_strengths || [],
      connectionTypes: row.connection_types || [],
      spiralStage: row.spiral_stage,
      archetypalResonances: row.archetypal_resonances || [],
      frameworksActive: row.frameworks_active || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}

// Singleton instance
export const episodicMemoryService = new EpisodicMemoryService();
export default episodicMemoryService;
