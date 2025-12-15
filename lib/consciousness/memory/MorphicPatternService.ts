/**
 * MORPHIC PATTERN SERVICE
 *
 * Detects and tracks archetypal cycles - the universal patterns that repeat
 * Part of MAIA's 5-Layer Memory Palace - Layer 4
 */

import { query, queryOne } from '../../database/postgres';
import { v4 as uuidv4 } from 'uuid';

export type ArchetypalPattern =
  | 'heroes_journey'
  | 'dark_night'
  | 'sacred_wound'
  | 'inner_marriage'
  | 'axis_mundi'
  | 'rebirth'
  | 'initiation';

export type PatternStatus = 'active' | 'dormant' | 'integrated' | 'transforming';

export interface PatternPhase {
  phaseName: string;
  completed: boolean;
  completedAt?: Date;
  insights?: string[];
}

export interface WisdomGained {
  insight: string;
  gainedAt: Date;
  integrationLevel: number; // 1-10
}

export interface MorphicPattern {
  id?: number;
  userId: string;
  patternId: string;

  // Pattern identification
  patternName: string;
  archetypalPattern: ArchetypalPattern;
  currentPhase?: string;
  cyclicalNature: boolean;

  // Evolution tracking
  firstAppearance?: Date;
  lastAppearance?: Date;
  appearanceCount: number;
  integrationLevel: number; // 1-10
  currentStatus: PatternStatus;

  // Pattern phases
  phasesCompleted: string[];
  currentLessons: any[];
  wisdomGained: WisdomGained[];

  // Cross-references
  relatedEpisodes: string[]; // Episode IDs
  relatedSomaticPatterns: string[]; // Somatic pattern IDs
  relatedSemanticConcepts: string[]; // Semantic concept IDs

  // Archetypal intelligence
  shadowAspects: any[];
  lightAspects: any[];
  integrationOpportunities: any[];

  createdAt?: Date;
  updatedAt?: Date;
}

export class MorphicPatternService {
  /**
   * Detect and track a morphic pattern
   */
  async trackPattern(params: {
    userId: string;
    patternName: string;
    archetypalPattern: ArchetypalPattern;
    currentPhase?: string;
    integrationLevel?: number;
  }): Promise<MorphicPattern> {
    const patternId = uuidv4();

    try {
      const result = await queryOne<any>(
        `INSERT INTO morphic_pattern_memories (
          user_id, pattern_id, pattern_name, archetypal_pattern,
          current_phase, cyclical_nature, first_appearance, last_appearance,
          appearance_count, integration_level, current_status
        ) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW(), 1, $6, 'active')
        RETURNING *`,
        [
          params.userId,
          patternId,
          params.patternName,
          params.archetypalPattern,
          params.currentPhase || null,
          params.integrationLevel || 1
        ]
      );

      console.log('🌀 [Morphic] Tracked pattern:', params.archetypalPattern, params.patternName);
      return this.mapToMorphicPattern(result);
    } catch (error) {
      console.error('Error tracking morphic pattern:', error);
      throw error;
    }
  }

  /**
   * Record a pattern reappearance (cyclical nature)
   */
  async recordReappearance(
    userId: string,
    archetypalPattern: ArchetypalPattern,
    currentPhase?: string
  ): Promise<void> {
    try {
      await queryOne(
        `UPDATE morphic_pattern_memories
         SET
           last_appearance = NOW(),
           appearance_count = appearance_count + 1,
           current_phase = COALESCE($3, current_phase),
           current_status = 'active',
           updated_at = NOW()
         WHERE user_id = $1 AND archetypal_pattern = $2`,
        [userId, archetypalPattern, currentPhase]
      );

      console.log('🔄 [Morphic] Pattern reappeared:', archetypalPattern);
    } catch (error) {
      console.error('Error recording reappearance:', error);
    }
  }

  /**
   * Mark a phase as completed
   */
  async completePhase(
    patternId: string,
    phaseName: string,
    insights?: string[]
  ): Promise<void> {
    try {
      await queryOne(
        `UPDATE morphic_pattern_memories
         SET
           phases_completed = array_append(phases_completed, $2),
           current_lessons = CASE
             WHEN $3::jsonb IS NOT NULL THEN current_lessons || $3::jsonb
             ELSE current_lessons
           END,
           updated_at = NOW()
         WHERE pattern_id = $1`,
        [patternId, phaseName, insights ? JSON.stringify(insights) : null]
      );

      console.log('✅ [Morphic] Phase completed:', phaseName);
    } catch (error) {
      console.error('Error completing phase:', error);
    }
  }

  /**
   * Record wisdom gained from the pattern
   */
  async captureWisdom(
    patternId: string,
    wisdom: {
      insight: string;
      integrationLevel: number;
    }
  ): Promise<void> {
    const wisdomEntry: WisdomGained = {
      insight: wisdom.insight,
      gainedAt: new Date(),
      integrationLevel: wisdom.integrationLevel
    };

    try {
      await queryOne(
        `UPDATE morphic_pattern_memories
         SET
           wisdom_gained = wisdom_gained || $2::jsonb,
           updated_at = NOW()
         WHERE pattern_id = $1`,
        [patternId, JSON.stringify([wisdomEntry])]
      );

      console.log('💎 [Morphic] Wisdom captured:', wisdom.insight.substring(0, 50));
    } catch (error) {
      console.error('Error capturing wisdom:', error);
    }
  }

  /**
   * Update integration level
   */
  async updateIntegration(
    patternId: string,
    integrationLevel: number
  ): Promise<void> {
    try {
      await queryOne(
        `UPDATE morphic_pattern_memories
         SET integration_level = $2, updated_at = NOW()
         WHERE pattern_id = $1`,
        [patternId, integrationLevel]
      );

      console.log('📈 [Morphic] Integration level updated:', integrationLevel);
    } catch (error) {
      console.error('Error updating integration:', error);
    }
  }

  /**
   * Mark pattern as integrated
   */
  async integratePattern(patternId: string): Promise<void> {
    try {
      await queryOne(
        `UPDATE morphic_pattern_memories
         SET
           current_status = 'integrated',
           integration_level = 10,
           updated_at = NOW()
         WHERE pattern_id = $1`,
        [patternId]
      );

      console.log('🎯 [Morphic] Pattern integrated');
    } catch (error) {
      console.error('Error integrating pattern:', error);
    }
  }

  /**
   * Get active patterns for a user
   */
  async getActivePatterns(userId: string): Promise<MorphicPattern[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM morphic_pattern_memories
         WHERE user_id = $1 AND current_status = 'active'
         ORDER BY last_appearance DESC`,
        [userId]
      );

      return results.map(r => this.mapToMorphicPattern(r));
    } catch (error) {
      console.error('Error retrieving active patterns:', error);
      return [];
    }
  }

  /**
   * Get all patterns for a user
   */
  async getUserPatterns(userId: string): Promise<MorphicPattern[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM morphic_pattern_memories
         WHERE user_id = $1
         ORDER BY last_appearance DESC`,
        [userId]
      );

      return results.map(r => this.mapToMorphicPattern(r));
    } catch (error) {
      console.error('Error retrieving user patterns:', error);
      return [];
    }
  }

  /**
   * Find patterns by archetypal type
   */
  async findPatternsByType(
    userId: string,
    archetypalPattern: ArchetypalPattern
  ): Promise<MorphicPattern[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM morphic_pattern_memories
         WHERE user_id = $1 AND archetypal_pattern = $2
         ORDER BY last_appearance DESC`,
        [userId, archetypalPattern]
      );

      return results.map(r => this.mapToMorphicPattern(r));
    } catch (error) {
      console.error('Error finding patterns by type:', error);
      return [];
    }
  }

  /**
   * Link pattern to episodes, somatic patterns, or concepts
   */
  async linkToMemory(
    patternId: string,
    linkType: 'episode' | 'somatic' | 'concept',
    linkId: string
  ): Promise<void> {
    const field = linkType === 'episode'
      ? 'related_episodes'
      : linkType === 'somatic'
      ? 'related_somatic_patterns'
      : 'related_semantic_concepts';

    try {
      await queryOne(
        `UPDATE morphic_pattern_memories
         SET ${field} = array_append(${field}, $2),
             updated_at = NOW()
         WHERE pattern_id = $1`,
        [patternId, linkId]
      );

      console.log('🔗 [Morphic] Linked to', linkType, linkId);
    } catch (error) {
      console.error('Error linking to memory:', error);
    }
  }

  /**
   * Track shadow/light aspects
   */
  async trackAspect(
    patternId: string,
    aspectType: 'shadow' | 'light' | 'integration',
    aspect: any
  ): Promise<void> {
    const field = aspectType === 'shadow'
      ? 'shadow_aspects'
      : aspectType === 'light'
      ? 'light_aspects'
      : 'integration_opportunities';

    try {
      await queryOne(
        `UPDATE morphic_pattern_memories
         SET ${field} = ${field} || $2::jsonb,
             updated_at = NOW()
         WHERE pattern_id = $1`,
        [patternId, JSON.stringify([aspect])]
      );

      console.log('✨ [Morphic] Tracked', aspectType, 'aspect');
    } catch (error) {
      console.error('Error tracking aspect:', error);
    }
  }

  /**
   * Map database row to MorphicPattern interface
   */
  private mapToMorphicPattern(row: any): MorphicPattern {
    return {
      id: row.id,
      userId: row.user_id,
      patternId: row.pattern_id,
      patternName: row.pattern_name,
      archetypalPattern: row.archetypal_pattern,
      currentPhase: row.current_phase,
      cyclicalNature: row.cyclical_nature,
      firstAppearance: row.first_appearance ? new Date(row.first_appearance) : undefined,
      lastAppearance: row.last_appearance ? new Date(row.last_appearance) : undefined,
      appearanceCount: row.appearance_count,
      integrationLevel: row.integration_level,
      currentStatus: row.current_status,
      phasesCompleted: row.phases_completed || [],
      currentLessons: typeof row.current_lessons === 'string'
        ? JSON.parse(row.current_lessons)
        : row.current_lessons || [],
      wisdomGained: typeof row.wisdom_gained === 'string'
        ? JSON.parse(row.wisdom_gained)
        : row.wisdom_gained || [],
      relatedEpisodes: row.related_episodes || [],
      relatedSomaticPatterns: row.related_somatic_patterns || [],
      relatedSemanticConcepts: row.related_semantic_concepts || [],
      shadowAspects: typeof row.shadow_aspects === 'string'
        ? JSON.parse(row.shadow_aspects)
        : row.shadow_aspects || [],
      lightAspects: typeof row.light_aspects === 'string'
        ? JSON.parse(row.light_aspects)
        : row.light_aspects || [],
      integrationOpportunities: typeof row.integration_opportunities === 'string'
        ? JSON.parse(row.integration_opportunities)
        : row.integration_opportunities || [],
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined
    };
  }
}

// Singleton instance
export const morphicPatternService = new MorphicPatternService();
export default morphicPatternService;
