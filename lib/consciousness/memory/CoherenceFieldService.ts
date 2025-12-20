/**
 * COHERENCE FIELD SERVICE
 *
 * Tracks real-time elemental balance (Fire, Water, Earth, Air, Aether)
 * Part of MAIA's 5-Layer Memory Palace - Phase 3
 */

import { query, queryOne } from '../../database/postgres';

export interface CoherenceFieldReading {
  id?: number;
  userId: string;
  sessionId: string;
  readingTimestamp: Date;

  // Elemental levels (0-1)
  fireLevel: number;    // Vision, passion, initiation
  waterLevel: number;   // Emotion, flow, grief
  earthLevel: number;   // Grounding, embodiment, stability
  airLevel: number;     // Clarity, communication, perspective
  aetherLevel: number;  // Spirit, mystery, connection

  // Overall coherence
  coherenceScore: number; // 0-1
  balanceQuality: string; // harmonious, fire_dominant, water_flooding, etc.

  // Imbalances
  elementalDeficiency: string[];
  elementalExcess: string[];

  // Recommendations
  balancingRecommendations: any[];

  // Context
  conversationContext?: string;
  spiralStage?: string;
  archetypalInfluences: string[];

  createdAt?: Date;
}

export class CoherenceFieldService {
  /**
   * Take a coherence field reading
   */
  async recordReading(params: {
    userId: string;
    sessionId: string;
    elementalLevels: {
      fire: number;
      water: number;
      earth: number;
      air: number;
      aether: number;
    };
    context?: string;
    spiralStage?: string;
    archetypalInfluences?: string[];
  }): Promise<CoherenceFieldReading> {
    const { fire, water, earth, air, aether } = params.elementalLevels;

    // Calculate overall coherence (how balanced the elements are)
    const coherenceScore = this.calculateCoherence(params.elementalLevels);

    // Determine balance quality
    const balanceQuality = this.assessBalanceQuality(params.elementalLevels);

    // Detect imbalances
    const { deficiency, excess } = this.detectImbalances(params.elementalLevels);

    // Generate balancing recommendations
    const recommendations = this.generateRecommendations(
      params.elementalLevels,
      deficiency,
      excess
    );

    try {
      const result = await queryOne<any>(
        `INSERT INTO coherence_field_readings (
          user_id, session_id, reading_timestamp,
          fire_level, water_level, earth_level, air_level, aether_level,
          coherence_score, balance_quality,
          elemental_deficiency, elemental_excess,
          balancing_recommendations,
          conversation_context, spiral_stage, archetypal_influences
        ) VALUES (
          $1, $2, NOW(),
          $3, $4, $5, $6, $7,
          $8, $9,
          $10, $11,
          $12,
          $13, $14, $15
        )
        RETURNING *`,
        [
          params.userId,
          params.sessionId,
          fire, water, earth, air, aether,
          coherenceScore,
          balanceQuality,
          deficiency,
          excess,
          JSON.stringify(recommendations),
          params.context || null,
          params.spiralStage || null,
          params.archetypalInfluences || []
        ]
      );

      console.log('🌊 [Coherence] Field reading recorded:', balanceQuality, `(${(coherenceScore * 100).toFixed(0)}%)`);
      return this.mapToReading(result);
    } catch (error) {
      console.error('Error recording field reading:', error);
      throw error;
    }
  }

  /**
   * Get latest reading for a user
   */
  async getLatestReading(userId: string): Promise<CoherenceFieldReading | null> {
    try {
      const result = await queryOne<any>(
        `SELECT * FROM coherence_field_readings
         WHERE user_id = $1
         ORDER BY reading_timestamp DESC
         LIMIT 1`,
        [userId]
      );

      return result ? this.mapToReading(result) : null;
    } catch (error) {
      console.error('Error getting latest reading:', error);
      return null;
    }
  }

  /**
   * Get readings for a session
   */
  async getSessionReadings(
    userId: string,
    sessionId: string
  ): Promise<CoherenceFieldReading[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM coherence_field_readings
         WHERE user_id = $1 AND session_id = $2
         ORDER BY reading_timestamp ASC`,
        [userId, sessionId]
      );

      return results.map(r => this.mapToReading(r));
    } catch (error) {
      console.error('Error getting session readings:', error);
      return [];
    }
  }

  /**
   * Get recent readings (last N days)
   */
  async getRecentReadings(
    userId: string,
    days: number = 7
  ): Promise<CoherenceFieldReading[]> {
    try {
      const results = await query<any>(
        `SELECT * FROM coherence_field_readings
         WHERE user_id = $1
           AND reading_timestamp >= NOW() - INTERVAL '${days} days'
         ORDER BY reading_timestamp DESC`,
        [userId]
      );

      return results.map(r => this.mapToReading(r));
    } catch (error) {
      console.error('Error getting recent readings:', error);
      return [];
    }
  }

  /**
   * Analyze elemental patterns over time
   */
  async analyzeElementalPatterns(
    userId: string,
    days: number = 30
  ): Promise<{
    averageCoherence: number;
    elementalAverages: {
      fire: number;
      water: number;
      earth: number;
      air: number;
      aether: number;
    };
    commonImbalances: {element: string, frequency: number}[];
  }> {
    try {
      const results = await query<any>(
        `SELECT
           AVG(coherence_score) as avg_coherence,
           AVG(fire_level) as avg_fire,
           AVG(water_level) as avg_water,
           AVG(earth_level) as avg_earth,
           AVG(air_level) as avg_air,
           AVG(aether_level) as avg_aether
         FROM coherence_field_readings
         WHERE user_id = $1
           AND reading_timestamp >= NOW() - INTERVAL '${days} days'`,
        [userId]
      );

      const row = results[0] || {};

      return {
        averageCoherence: parseFloat(row.avg_coherence || '0'),
        elementalAverages: {
          fire: parseFloat(row.avg_fire || '0'),
          water: parseFloat(row.avg_water || '0'),
          earth: parseFloat(row.avg_earth || '0'),
          air: parseFloat(row.avg_air || '0'),
          aether: parseFloat(row.avg_aether || '0')
        },
        commonImbalances: [] // TODO: Implement imbalance frequency analysis
      };
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      return {
        averageCoherence: 0,
        elementalAverages: { fire: 0, water: 0, earth: 0, air: 0, aether: 0 },
        commonImbalances: []
      };
    }
  }

  /**
   * Calculate coherence score (how balanced are the elements)
   */
  private calculateCoherence(levels: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  }): number {
    const values = [levels.fire, levels.water, levels.earth, levels.air, levels.aether];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    // Calculate variance
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

    // Lower variance = higher coherence (elements are balanced)
    // Convert to 0-1 scale
    const coherence = Math.max(0, 1 - (variance * 2));

    return Math.round(coherence * 100) / 100;
  }

  /**
   * Assess balance quality
   */
  private assessBalanceQuality(levels: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  }): string {
    const { fire, water, earth, air, aether } = levels;

    // Check for dominance (one element > 0.7)
    if (fire > 0.7) return 'fire_dominant';
    if (water > 0.7) return 'water_flooding';
    if (earth > 0.7) return 'earth_heavy';
    if (air > 0.7) return 'air_scattered';
    if (aether > 0.7) return 'aether_transcendent';

    // Check for deficiency (one element < 0.3)
    if (fire < 0.3) return 'fire_depleted';
    if (water < 0.3) return 'water_dried';
    if (earth < 0.3) return 'earth_ungrounded';
    if (air < 0.3) return 'air_stagnant';
    if (aether < 0.3) return 'aether_disconnected';

    // Check for harmony (all elements between 0.4-0.6)
    const allBalanced = Object.values(levels).every(v => v >= 0.4 && v <= 0.6);
    if (allBalanced) return 'harmonious';

    return 'dynamic_balance';
  }

  /**
   * Detect elemental imbalances
   */
  private detectImbalances(levels: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  }): {
    deficiency: string[];
    excess: string[];
  } {
    const deficiency: string[] = [];
    const excess: string[] = [];

    Object.entries(levels).forEach(([element, level]) => {
      if (level < 0.3) deficiency.push(element);
      if (level > 0.7) excess.push(element);
    });

    return { deficiency, excess };
  }

  /**
   * Generate balancing recommendations
   */
  private generateRecommendations(
    levels: any,
    deficiency: string[],
    excess: string[]
  ): any[] {
    const recommendations: any /* TODO: specify type */[] = [];

    if (excess.includes('fire')) {
      recommendations.push({
        element: 'fire',
        issue: 'excess',
        recommendation: 'Cool the fire. Water practices: grief, tears, flow. Earth practices: grounding, stillness.'
      });
    }

    if (excess.includes('water')) {
      recommendations.push({
        element: 'water',
        issue: 'excess',
        recommendation: 'Container the water. Earth practices: boundaries, structure. Fire practices: vision, direction.'
      });
    }

    if (deficiency.includes('earth')) {
      recommendations.push({
        element: 'earth',
        issue: 'deficiency',
        recommendation: 'Ground down. Body practices: feet on earth, somatic awareness, embodiment.'
      });
    }

    if (deficiency.includes('air')) {
      recommendations.push({
        element: 'air',
        issue: 'deficiency',
        recommendation: 'Gain perspective. Air practices: breath, communication, clarity of thought.'
      });
    }

    if (deficiency.includes('aether')) {
      recommendations.push({
        element: 'aether',
        issue: 'deficiency',
        recommendation: 'Connect to mystery. Aether practices: meditation, prayer, sacred attending.'
      });
    }

    return recommendations;
  }

  /**
   * Map database row to CoherenceFieldReading interface
   */
  private mapToReading(row: any): CoherenceFieldReading {
    return {
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      readingTimestamp: new Date(row.reading_timestamp),
      fireLevel: parseFloat(row.fire_level),
      waterLevel: parseFloat(row.water_level),
      earthLevel: parseFloat(row.earth_level),
      airLevel: parseFloat(row.air_level),
      aetherLevel: parseFloat(row.aether_level),
      coherenceScore: parseFloat(row.coherence_score),
      balanceQuality: row.balance_quality,
      elementalDeficiency: row.elemental_deficiency || [],
      elementalExcess: row.elemental_excess || [],
      balancingRecommendations: typeof row.balancing_recommendations === 'string'
        ? JSON.parse(row.balancing_recommendations)
        : row.balancing_recommendations || [],
      conversationContext: row.conversation_context,
      spiralStage: row.spiral_stage,
      archetypalInfluences: row.archetypal_influences || [],
      createdAt: row.created_at ? new Date(row.created_at) : undefined
    };
  }
}

// Singleton instance
export const coherenceFieldService = new CoherenceFieldService();
export default coherenceFieldService;
