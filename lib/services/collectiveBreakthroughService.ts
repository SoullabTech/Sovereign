// @ts-nocheck - Services prototype, not type-checked
/**
 * COLLECTIVE BREAKTHROUGH INTELLIGENCE (SOVEREIGN)
 *
 * Each person's transformation feeds the Aether field, enriching collective wisdom.
 * Like mycelial networks - individual growth nourishes the whole.
 *
 * Privacy-preserving: Only anonymized patterns, never personal content.
 *
 * Vision: "Something's moving through the field right now - others are feeling this shift too."
 *
 * SOVEREIGN: Uses local PostgreSQL, NOT Supabase (per Canon)
 */

import { query } from '@/lib/db/postgres';
import { createHash } from 'crypto';

// ============== Types ==============

export interface BreakthroughPattern {
  id?: string;
  pattern_id: string; // Hash - no user identifying info

  // What catalyzed the breakthrough
  catalyst: {
    type: 'question' | 'reflection' | 'practice' | 'archetypal_shift' | 'elemental_transition';
    archetype_from?: string;
    archetype_to?: string;
    elemental_phase_from?: string;
    elemental_phase_to?: string;
    practice_offered?: string;
  };

  // Pattern signature (semantic, not content)
  signature: {
    transformation_type: 'insight' | 'embodiment' | 'integration' | 'release' | 'awakening';
    emotional_shift: string;
    body_involvement: boolean;
    duration_to_breakthrough: number;
  };

  // Outcome
  outcome: {
    integration_level: 'emerging' | 'stabilizing' | 'embodied';
    follow_through: boolean;
    resonance_strength: number;
  };

  // Field conditions when breakthrough occurred
  field_conditions: {
    spiralogic_phase: string;
    dominant_element: string;
    moon_phase?: string;
    collective_phase?: string;
  };

  created_at: Date;
}

export interface BreakthroughCluster {
  cluster_id: string;
  theme: string;
  patterns: string[];
  common_catalysts: string[];
  typical_timeline: number;
  success_indicators: string[];
  collective_wisdom: string;
}

export interface CollectiveWisdom {
  active_movements: string[];
  relevant_patterns: BreakthroughPattern[];
  suggested_reflection: string;
  synchronicity_detected: boolean;
}

export interface BreakthroughContribution {
  catalyst_type: 'question' | 'reflection' | 'practice' | 'archetypal_shift' | 'elemental_transition';
  archetype_from?: string;
  archetype_to?: string;
  elemental_phase_from?: string;
  elemental_phase_to?: string;
  practice_offered?: string;
  transformation_type: 'insight' | 'embodiment' | 'integration' | 'release' | 'awakening';
  emotional_shift: string;
  body_involved: boolean;
  resonance_strength?: number;
  spiralogic_phase: string;
  dominant_element: string;
}

// ============== Service ==============

export class CollectiveBreakthroughService {
  /**
   * Hash user ID for anonymization (one-way, can't reverse)
   */
  private hashUserId(userId: string): string {
    const salt = process.env.BREAKTHROUGH_SALT || 'maia-collective-wisdom';
    return createHash('sha256').update(userId + salt).digest('hex');
  }

  /**
   * Contribute a breakthrough to the collective field (anonymized)
   */
  async contributeBreakthrough(
    userId: string,
    data: BreakthroughContribution
  ): Promise<{ success: boolean; patternId?: string }> {
    try {
      const patternId = this.hashUserId(userId);

      const result = await query(
        `INSERT INTO collective_breakthroughs (
          pattern_id,
          catalyst_type,
          archetype_from,
          archetype_to,
          elemental_phase_from,
          elemental_phase_to,
          practice_offered,
          transformation_type,
          emotional_shift,
          body_involvement,
          resonance_strength,
          spiralogic_phase,
          dominant_element
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id`,
        [
          patternId,
          data.catalyst_type,
          data.archetype_from || null,
          data.archetype_to || null,
          data.elemental_phase_from || null,
          data.elemental_phase_to || null,
          data.practice_offered || null,
          data.transformation_type,
          data.emotional_shift,
          data.body_involved,
          data.resonance_strength || 0.5,
          data.spiralogic_phase,
          data.dominant_element,
        ]
      );

      console.log('✨ [Collective] Breakthrough contributed to field');

      return { success: true, patternId };
    } catch (error) {
      console.error('❌ [Collective] Error contributing breakthrough:', error);
      return { success: false };
    }
  }

  /**
   * Get collective wisdom relevant to current user state
   */
  async getCollectiveWisdom(
    currentPhase: string,
    dominantElement: string,
    recentArchetype?: string
  ): Promise<CollectiveWisdom | null> {
    try {
      // Get relevant patterns using PostgreSQL function
      const patternsResult = await query(
        `SELECT * FROM get_relevant_breakthrough_patterns($1, $2, $3, 5)`,
        [currentPhase, dominantElement, recentArchetype || null]
      );

      // Get active field movements
      const movementsResult = await query(
        `SELECT * FROM get_active_field_movements(3)`
      );

      const patterns = patternsResult.rows || [];
      const movements = movementsResult.rows || [];

      if (patterns.length === 0) {
        return null;
      }

      // Format patterns to match expected interface
      const formattedPatterns: BreakthroughPattern[] = patterns.map((p: any) => ({
        id: p.id,
        pattern_id: '',
        catalyst: {
          type: p.catalyst_type,
          practice_offered: p.practice_offered,
        },
        signature: {
          transformation_type: p.transformation_type,
          emotional_shift: p.emotional_shift,
          body_involvement: false,
          duration_to_breakthrough: 0,
        },
        outcome: {
          integration_level: 'emerging',
          follow_through: false,
          resonance_strength: p.resonance_strength || 0.5,
        },
        field_conditions: {
          spiralogic_phase: '',
          dominant_element: '',
        },
        created_at: new Date(),
      }));

      // Format movements
      const activeMovements = movements.map((m: any) =>
        `${m.movement_description} (${m.participant_count} in field)`
      );

      // Synthesize wisdom
      const wisdom = this.synthesizeWisdom(formattedPatterns, activeMovements);

      return {
        active_movements: activeMovements,
        relevant_patterns: formattedPatterns,
        suggested_reflection: wisdom,
        synchronicity_detected: activeMovements.length > 0,
      };
    } catch (error) {
      console.error('❌ [Collective] Error retrieving wisdom:', error);
      return null;
    }
  }

  /**
   * Get recent field movements (for "others are experiencing this too" awareness)
   */
  async getActiveFieldMovements(): Promise<string[]> {
    try {
      const result = await query(`SELECT * FROM get_active_field_movements(3)`);
      return (result.rows || []).map((m: any) =>
        `${m.movement_description} (${m.participant_count} in field)`
      );
    } catch (error) {
      console.error('❌ [Collective] Error getting field movements:', error);
      return [];
    }
  }

  /**
   * Get breakthrough statistics for the field
   */
  async getFieldStats(): Promise<{
    totalBreakthroughs: number;
    last30Days: number;
    topCatalysts: string[];
    activeMovements: string[];
  }> {
    try {
      // Total count
      const totalResult = await query(
        `SELECT COUNT(*) as count FROM collective_breakthroughs`
      );

      // Last 30 days
      const recentResult = await query(
        `SELECT COUNT(*) as count FROM collective_breakthroughs
         WHERE created_at >= NOW() - INTERVAL '30 days'`
      );

      // Top catalysts
      const catalystResult = await query(
        `SELECT catalyst_type, COUNT(*) as count
         FROM collective_breakthroughs
         WHERE created_at >= NOW() - INTERVAL '30 days'
         GROUP BY catalyst_type
         ORDER BY count DESC
         LIMIT 3`
      );

      // Active movements
      const movements = await this.getActiveFieldMovements();

      return {
        totalBreakthroughs: parseInt(totalResult.rows[0]?.count || '0'),
        last30Days: parseInt(recentResult.rows[0]?.count || '0'),
        topCatalysts: (catalystResult.rows || []).map((r: any) => r.catalyst_type),
        activeMovements: movements,
      };
    } catch (error) {
      console.error('❌ [Collective] Error getting field stats:', error);
      return {
        totalBreakthroughs: 0,
        last30Days: 0,
        topCatalysts: [],
        activeMovements: [],
      };
    }
  }

  /**
   * Synthesize wisdom from collective patterns
   */
  private synthesizeWisdom(
    patterns: BreakthroughPattern[],
    movements: string[]
  ): string {
    if (patterns.length === 0) return '';

    const catalysts = patterns.map(p => p.catalyst.type);
    const mostCommon = this.getMostCommon(catalysts);

    const practices = patterns
      .map(p => p.catalyst.practice_offered)
      .filter(p => p) as string[];

    const commonPractice = practices.length > 0 ? this.getMostCommon(practices) : null;

    let wisdom = '';

    if (movements.length > 0) {
      wisdom += `Others in the field are experiencing similar shifts right now. `;
    }

    if (mostCommon === 'practice' && commonPractice) {
      wisdom += `Many have found that ${commonPractice} opened something unexpected. `;
    } else if (mostCommon === 'question') {
      wisdom += `Sometimes a well-timed question unlocks what's ready to emerge. `;
    } else if (mostCommon === 'archetypal_shift') {
      wisdom += `Archetypal transitions often come when we stop forcing and start witnessing. `;
    } else if (mostCommon === 'reflection') {
      wisdom += `Reflection has been a doorway for many in the field lately. `;
    }

    return wisdom.trim();
  }

  /**
   * Find most common element in array
   */
  private getMostCommon<T>(arr: T[]): T | null {
    if (arr.length === 0) return null;

    const counts: Record<string, number> = {};
    arr.forEach(item => {
      const key = String(item);
      counts[key] = (counts[key] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0][0] as T;
  }
}

// Singleton export
export const collectiveBreakthroughService = new CollectiveBreakthroughService();
