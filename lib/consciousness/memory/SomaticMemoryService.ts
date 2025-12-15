/**
 * SOMATIC MEMORY SERVICE
 *
 * Tracks body wisdom patterns - where tension lives, what triggers it, what helps
 * Part of MAIA's 5-Layer Memory Palace - Layer 3
 */

import { query, queryOne } from '../../database/postgres';
import { v4 as uuidv4 } from 'uuid';

export type BodyRegion = 'shoulders' | 'chest' | 'throat' | 'jaw' | 'back' | 'belly' | 'hips' | 'legs' | 'full_body';
export type TensionFrequency = 'chronic' | 'episodic' | 'rare' | 'seasonal';
export type PatternStatus = 'active' | 'improving' | 'resolved' | 'monitoring';

export interface TensionTrackingEntry {
  date: Date;
  tensionLevel: number; // 1-10
  context?: string;
  spiralStage?: string;
}

export interface InterventionEntry {
  intervention: string;
  effectiveness: number; // 1-10
  lastUsed?: Date;
}

export interface SomaticMemory {
  id?: number;
  userId: string;
  patternId: string;

  // Body region
  bodyRegion: BodyRegion;

  // Pattern details
  patternName: string;
  tensionLevel: number; // 1-10
  frequency: TensionFrequency;

  // Triggers
  emotionalTriggers: string[];
  situationalTriggers: string[];
  relationalTriggers: string[];

  // Tracking
  progressionTimeline: TensionTrackingEntry[];
  currentStatus: PatternStatus;

  // Interventions
  interventionsThatWork: InterventionEntry[];
  interventionsIneffective: InterventionEntry[];

  // Pattern recognition
  linkedEmotionalPatterns: string[];
  linkedSpiralStages: string[];
  linkedArchetypalThemes: string[];

  firstNoticed: Date;
  lastUpdated: Date;
}

export class SomaticMemoryService {
  /**
   * Create or update a somatic pattern
   */
  async trackSomaticPattern(params: {
    userId: string;
    bodyRegion: BodyRegion;
    patternName: string;
    tensionLevel: number;
    frequency: TensionFrequency;
    emotionalTriggers?: string[];
    situationalTriggers?: string[];
    relationalTriggers?: string[];
    spiralStage?: string;
    context?: string;
  }): Promise<SomaticMemory> {
    const patternId = uuidv4();

    // Add current reading to timeline
    const timelineEntry: TensionTrackingEntry = {
      date: new Date(),
      tensionLevel: params.tensionLevel,
      context: params.context,
      spiralStage: params.spiralStage
    };

    try {
      const result = await queryOne<any>(
        `INSERT INTO somatic_memories (
          user_id, pattern_id, body_region, pattern_name, tension_level, frequency,
          emotional_triggers, situational_triggers, relational_triggers,
          progression_timeline, current_status, first_noticed, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', NOW(), NOW())
        ON CONFLICT (pattern_id) DO UPDATE SET
          tension_level = EXCLUDED.tension_level,
          frequency = EXCLUDED.frequency,
          emotional_triggers = EXCLUDED.emotional_triggers,
          situational_triggers = EXCLUDED.situational_triggers,
          relational_triggers = EXCLUDED.relational_triggers,
          progression_timeline = somatic_memories.progression_timeline || EXCLUDED.progression_timeline,
          last_updated = NOW()
        RETURNING *`,
        [
          params.userId,
          patternId,
          params.bodyRegion,
          params.patternName,
          params.tensionLevel,
          params.frequency,
          params.emotionalTriggers || [],
          params.situationalTriggers || [],
          params.relationalTriggers || [],
          JSON.stringify([timelineEntry])
        ]
      );

      console.log('💪 [Somatic] Tracked pattern:', params.bodyRegion, params.tensionLevel);
      return this.mapToSomaticMemory(result);
    } catch (error) {
      console.error('Error tracking somatic pattern:', error);
      throw error;
    }
  }

  /**
   * Get all somatic patterns for a user
   */
  async getUserSomaticPatterns(userId: string): Promise<SomaticMemory[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM somatic_memories
         WHERE user_id = $1
         ORDER BY tension_level DESC, last_updated DESC`,
        [userId]
      );

      return results.map(r => this.mapToSomaticMemory(r));
    } catch (error) {
      console.error('Error retrieving somatic patterns:', error);
      return [];
    }
  }

  /**
   * Get active patterns for a specific body region
   */
  async getBodyRegionPatterns(
    userId: string,
    bodyRegion: BodyRegion
  ): Promise<SomaticMemory[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM somatic_memories
         WHERE user_id = $1 AND body_region = $2 AND current_status = 'active'
         ORDER BY tension_level DESC`,
        [userId, bodyRegion]
      );

      return results.map(r => this.mapToSomaticMemory(r));
    } catch (error) {
      console.error('Error retrieving body region patterns:', error);
      return [];
    }
  }

  /**
   * Track what interventions work for this pattern
   */
  async recordIntervention(
    patternId: string,
    intervention: string,
    effectiveness: number,
    works: boolean = true
  ): Promise<void> {
    const interventionEntry: InterventionEntry = {
      intervention,
      effectiveness,
      lastUsed: new Date()
    };

    const field = works ? 'interventions_that_work' : 'interventions_ineffective';

    try {
      await queryOne(
        `UPDATE somatic_memories
         SET ${field} = ${field} || $2::jsonb,
             last_updated = NOW()
         WHERE pattern_id = $1`,
        [patternId, JSON.stringify([interventionEntry])]
      );

      console.log(`💡 [Somatic] Recorded intervention (${works ? 'works' : 'ineffective'}):`, intervention);
    } catch (error) {
      console.error('Error recording intervention:', error);
    }
  }

  /**
   * Update pattern status
   */
  async updatePatternStatus(
    patternId: string,
    status: PatternStatus
  ): Promise<void> {
    try {
      await queryOne(
        `UPDATE somatic_memories
         SET current_status = $2, last_updated = NOW()
         WHERE pattern_id = $1`,
        [patternId, status]
      );

      console.log('📊 [Somatic] Updated pattern status:', status);
    } catch (error) {
      console.error('Error updating pattern status:', error);
    }
  }

  /**
   * Find patterns linked to a spiral stage
   */
  async findPatternsBySpiralStage(
    userId: string,
    spiralStage: string
  ): Promise<SomaticMemory[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM somatic_memories
         WHERE user_id = $1 AND $2 = ANY(linked_spiral_stages)
         ORDER BY tension_level DESC`,
        [userId, spiralStage]
      );

      return results.map(r => this.mapToSomaticMemory(r));
    } catch (error) {
      console.error('Error finding patterns by spiral stage:', error);
      return [];
    }
  }

  /**
   * Get chronic patterns (high tension, long duration)
   */
  async getChronicPatterns(userId: string): Promise<SomaticMemory[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM somatic_memories
         WHERE user_id = $1
           AND frequency = 'chronic'
           AND current_status = 'active'
         ORDER BY tension_level DESC`,
        [userId]
      );

      return results.map(r => this.mapToSomaticMemory(r));
    } catch (error) {
      console.error('Error retrieving chronic patterns:', error);
      return [];
    }
  }

  /**
   * Link pattern to emotional/archetypal patterns
   */
  async linkPattern(
    patternId: string,
    linkType: 'emotional' | 'spiral' | 'archetypal',
    linkValue: string
  ): Promise<void> {
    const field = linkType === 'emotional'
      ? 'linked_emotional_patterns'
      : linkType === 'spiral'
      ? 'linked_spiral_stages'
      : 'linked_archetypal_themes';

    try {
      await queryOne(
        `UPDATE somatic_memories
         SET ${field} = array_append(${field}, $2),
             last_updated = NOW()
         WHERE pattern_id = $1`,
        [patternId, linkValue]
      );

      console.log('🔗 [Somatic] Linked pattern:', linkType, linkValue);
    } catch (error) {
      console.error('Error linking pattern:', error);
    }
  }

  /**
   * Map database row to SomaticMemory interface
   */
  private mapToSomaticMemory(row: any): SomaticMemory {
    return {
      id: row.id,
      userId: row.user_id,
      patternId: row.pattern_id,
      bodyRegion: row.body_region,
      patternName: row.pattern_name,
      tensionLevel: row.tension_level,
      frequency: row.frequency,
      emotionalTriggers: row.emotional_triggers || [],
      situationalTriggers: row.situational_triggers || [],
      relationalTriggers: row.relational_triggers || [],
      progressionTimeline: typeof row.progression_timeline === 'string'
        ? JSON.parse(row.progression_timeline)
        : row.progression_timeline || [],
      currentStatus: row.current_status,
      interventionsThatWork: typeof row.interventions_that_work === 'string'
        ? JSON.parse(row.interventions_that_work)
        : row.interventions_that_work || [],
      interventionsIneffective: typeof row.interventions_ineffective === 'string'
        ? JSON.parse(row.interventions_ineffective)
        : row.interventions_ineffective || [],
      linkedEmotionalPatterns: row.linked_emotional_patterns || [],
      linkedSpiralStages: row.linked_spiral_stages || [],
      linkedArchetypalThemes: row.linked_archetypal_themes || [],
      firstNoticed: new Date(row.first_noticed),
      lastUpdated: new Date(row.last_updated)
    };
  }
}

// Singleton instance
export const somaticMemoryService = new SomaticMemoryService();
export default somaticMemoryService;
