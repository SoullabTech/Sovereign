/**
 * 🪷 COLLECTIVE FIELD AGGREGATOR
 *
 * Sacred stewardship service for anonymized collective consciousness analytics
 * Implements ethical field observation while protecting individual privacy
 */

const { Pool } = require('pg');

// PostgreSQL connection for field data aggregation
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'maia_consciousness',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxUses: 7500,
});

/**
 * Collective Field Stewardship Service
 * Provides ethical, anonymized insights into community consciousness evolution
 */
class CollectiveFieldSteward {

  /**
   * Calculate Field Coherence Index (FCI)
   * Combines elemental harmony, virtue growth, resonance stability, and archetypal alignment
   */
  static async calculateFieldCoherenceIndex() {
    try {
      // Get elemental harmony index (how balanced the collective elements are)
      const elementalHarmony = await this.getElementalHarmonyIndex();

      // Get virtue growth rate (collective spiritual development)
      const virtueGrowth = await this.getVirtueGrowthRate();

      // Get resonance stability (consistency of consciousness patterns)
      const resonanceStability = await this.getResonanceStability();

      // Get archetypal alignment (coherence of collective archetypal expression)
      const archetypeLignment = await this.getArchetypalAlignment();

      // Calculate FCI using the sacred formula
      const FCI = (elementalHarmony + virtueGrowth + resonanceStability + archetypeLignment) / 4;

      return {
        fci: Math.max(0, Math.min(1, FCI)), // Bound between 0 and 1
        components: {
          elemental_harmony: elementalHarmony,
          virtue_growth: virtueGrowth,
          resonance_stability: resonanceStability,
          archetypal_alignment: archetypeLignment
        },
        interpretation: this.interpretFCI(FCI),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error calculating Field Coherence Index:', error);
      return {
        fci: 0.5, // Default neutral coherence
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get Collective Elemental Resonance (anonymized)
   */
  static async getCollectiveElementalResonance() {
    try {
      const result = await pool.query(`
        SELECT
          AVG(fire_level) as fire_resonance,
          AVG(water_level) as water_resonance,
          AVG(earth_level) as earth_resonance,
          AVG(air_level) as air_resonance,
          AVG(aether_level) as aether_resonance,
          COUNT(DISTINCT user_id) as active_souls,
          STDDEV(fire_level) as fire_variance,
          STDDEV(water_level) as water_variance,
          STDDEV(earth_level) as earth_variance,
          STDDEV(air_level) as air_variance,
          STDDEV(aether_level) as aether_variance
        FROM elemental_evolution
        WHERE recorded_at >= NOW() - INTERVAL '7 days'
      `);

      if (result.rows.length === 0) {
        return this.getDefaultElementalResonance();
      }

      const data = result.rows[0];

      return {
        elemental_resonance: {
          fire: parseFloat(data.fire_resonance) || 0.5,
          water: parseFloat(data.water_resonance) || 0.5,
          earth: parseFloat(data.earth_resonance) || 0.5,
          air: parseFloat(data.air_resonance) || 0.5,
          aether: parseFloat(data.aether_resonance) || 0.5
        },
        field_metrics: {
          active_souls: parseInt(data.active_souls) || 0,
          elemental_variance: {
            fire: parseFloat(data.fire_variance) || 0,
            water: parseFloat(data.water_variance) || 0,
            earth: parseFloat(data.earth_variance) || 0,
            air: parseFloat(data.air_variance) || 0,
            aether: parseFloat(data.aether_variance) || 0
          }
        },
        dominant_element: this.identifyDominantElement({
          fire: parseFloat(data.fire_resonance) || 0.5,
          water: parseFloat(data.water_resonance) || 0.5,
          earth: parseFloat(data.earth_resonance) || 0.5,
          air: parseFloat(data.air_resonance) || 0.5,
          aether: parseFloat(data.aether_resonance) || 0.5
        }),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error getting collective elemental resonance:', error);
      return this.getDefaultElementalResonance();
    }
  }

  /**
   * Get Collective Virtue Evolution (anonymized)
   */
  static async getCollectiveVirtueEvolution() {
    try {
      const result = await pool.query(`
        SELECT
          AVG(outcome_quality) as avg_wisdom_quality,
          COUNT(*) as total_wisdom_moments,
          MODE() WITHIN GROUP (ORDER BY guidance_tone) as dominant_guidance_tone,
          COUNT(DISTINCT user_id) as participating_souls
        FROM wisdom_moments
        WHERE recorded_at >= NOW() - INTERVAL '7 days'
        AND outcome_quality IS NOT NULL
      `);

      if (result.rows.length === 0) {
        return this.getDefaultVirtueEvolution();
      }

      const data = result.rows[0];

      // Get virtue trend over time
      const trendResult = await pool.query(`
        SELECT
          DATE_TRUNC('day', recorded_at) as day,
          AVG(outcome_quality) as daily_wisdom_quality
        FROM wisdom_moments
        WHERE recorded_at >= NOW() - INTERVAL '30 days'
        AND outcome_quality IS NOT NULL
        GROUP BY day
        ORDER BY day
      `);

      const virtueTimeline = trendResult.rows.map(row => ({
        date: row.day,
        wisdom_quality: parseFloat(row.daily_wisdom_quality) || 5
      }));

      return {
        current_wisdom_quality: parseFloat(data.avg_wisdom_quality) || 5,
        total_wisdom_moments: parseInt(data.total_wisdom_moments) || 0,
        dominant_guidance_tone: data.dominant_guidance_tone || 'gentle',
        participating_souls: parseInt(data.participating_souls) || 0,
        virtue_timeline: virtueTimeline,
        growth_trend: this.calculateGrowthTrend(virtueTimeline),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error getting collective virtue evolution:', error);
      return this.getDefaultVirtueEvolution();
    }
  }

  /**
   * Get Archetypal Distribution (anonymized)
   */
  static async getArchetypalDistribution() {
    try {
      const result = await pool.query(`
        SELECT
          primary_archetype,
          COUNT(*) as frequency,
          AVG(fire_level + water_level + earth_level + air_level + aether_level) as avg_elemental_sum
        FROM elemental_evolution
        WHERE recorded_at >= NOW() - INTERVAL '7 days'
        AND primary_archetype IS NOT NULL
        GROUP BY primary_archetype
        ORDER BY frequency DESC
      `);

      const archetypalMap = result.rows.map(row => ({
        archetype: row.primary_archetype,
        frequency: parseInt(row.frequency),
        elemental_harmony: parseFloat(row.avg_elemental_sum) / 5 || 0.5
      }));

      return {
        archetypal_distribution: archetypalMap,
        dominant_archetype: archetypalMap[0]?.archetype || 'Seeker',
        archetypal_diversity: archetypalMap.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error getting archetypal distribution:', error);
      return {
        archetypal_distribution: [
          { archetype: 'Seeker', frequency: 1, elemental_harmony: 0.5 }
        ],
        dominant_archetype: 'Seeker',
        archetypal_diversity: 1,
        timestamp: new Date().toISOString()
      };
    }
  }

  // --- HELPER METHODS FOR FCI CALCULATION ---

  static async getElementalHarmonyIndex() {
    const resonance = await this.getCollectiveElementalResonance();
    const elements = resonance.elemental_resonance;

    // Calculate how close the elements are to ideal balance (0.6 each)
    const idealBalance = 0.6;
    const deviations = Object.values(elements).map(value => Math.abs(value - idealBalance));
    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;

    // Convert to harmony index (lower deviation = higher harmony)
    return Math.max(0, 1 - (avgDeviation * 2)); // Scale deviation to 0-1 range
  }

  static async getVirtueGrowthRate() {
    const virtues = await this.getCollectiveVirtueEvolution();
    const trend = virtues.growth_trend;

    // Normalize trend to 0-1 scale
    return Math.max(0, Math.min(1, (trend + 1) / 2)); // Assumes trend is between -1 and 1
  }

  static async getResonanceStability() {
    const resonance = await this.getCollectiveElementalResonance();
    const variances = Object.values(resonance.field_metrics.elemental_variance);
    const avgVariance = variances.reduce((sum, variance) => sum + variance, 0) / variances.length;

    // Convert to stability index (lower variance = higher stability)
    return Math.max(0, 1 - avgVariance); // Assumes variance is normalized 0-1
  }

  static async getArchetypalAlignment() {
    const archetypes = await this.getArchetypalDistribution();
    const diversity = archetypes.archetypal_diversity;

    // Moderate diversity indicates good alignment (not too scattered, not too uniform)
    const idealDiversity = 5; // Ideally 5 different archetypes active
    const diversityScore = 1 - Math.abs(diversity - idealDiversity) / idealDiversity;

    return Math.max(0, Math.min(1, diversityScore));
  }

  // --- UTILITY METHODS ---

  static identifyDominantElement(elementalSignature) {
    let maxValue = 0;
    let dominantElement = 'earth';

    Object.entries(elementalSignature).forEach(([element, value]) => {
      if (value > maxValue) {
        maxValue = value;
        dominantElement = element;
      }
    });

    return dominantElement;
  }

  static calculateGrowthTrend(timeline) {
    if (timeline.length < 2) return 0;

    const values = timeline.map(point => point.wisdom_quality);
    const n = values.length;
    const sumX = Array.from({length: n}, (_, i) => i).reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.map((y, i) => i * y).reduce((a, b) => a + b, 0);
    const sumXX = Array.from({length: n}, (_, i) => i * i).reduce((a, b) => a + b, 0);

    // Linear regression slope
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Normalize slope to reasonable range
    return Math.max(-1, Math.min(1, slope / 2));
  }

  static interpretFCI(fci) {
    if (fci >= 0.8) return 'High Coherence - The field resonates with sacred harmony';
    if (fci >= 0.6) return 'Good Coherence - The community flows with balanced wisdom';
    if (fci >= 0.4) return 'Moderate Coherence - The field seeks greater alignment';
    if (fci >= 0.2) return 'Low Coherence - The community needs grounding and care';
    return 'Very Low Coherence - Deep healing and stabilization needed';
  }

  // --- DEFAULT VALUES FOR EMPTY SYSTEMS ---

  static getDefaultElementalResonance() {
    return {
      elemental_resonance: {
        fire: 0.5,
        water: 0.5,
        earth: 0.6, // Slight grounding default
        air: 0.5,
        aether: 0.5
      },
      field_metrics: {
        active_souls: 0,
        elemental_variance: {
          fire: 0, water: 0, earth: 0, air: 0, aether: 0
        }
      },
      dominant_element: 'earth',
      timestamp: new Date().toISOString()
    };
  }

  static getDefaultVirtueEvolution() {
    return {
      current_wisdom_quality: 5,
      total_wisdom_moments: 0,
      dominant_guidance_tone: 'gentle',
      participating_souls: 0,
      virtue_timeline: [],
      growth_trend: 0,
      timestamp: new Date().toISOString()
    };
  }

  // --- STEWARDSHIP METHODS ---

  /**
   * Generate Field Report for Stewards
   */
  static async generateFieldReport() {
    const fci = await this.calculateFieldCoherenceIndex();
    const elemental = await this.getCollectiveElementalResonance();
    const virtue = await this.getCollectiveVirtueEvolution();
    const archetypal = await this.getArchetypalDistribution();

    return {
      field_coherence_index: fci,
      elemental_resonance: elemental,
      virtue_evolution: virtue,
      archetypal_distribution: archetypal,
      stewardship_notes: this.generateStewardshipNotes(fci, elemental, virtue),
      timestamp: new Date().toISOString()
    };
  }

  static generateStewardshipNotes(fci, elemental, virtue) {
    const notes = [];

    // FCI guidance
    if (fci.fci < 0.4) {
      notes.push('🔍 Field needs attention - consider community grounding rituals');
    } else if (fci.fci > 0.8) {
      notes.push('✨ Field is highly coherent - excellent time for deeper work');
    }

    // Elemental guidance
    const dominant = elemental.dominant_element;
    const elementalNotes = {
      fire: '🔥 Community is in creative/transformational phase',
      water: '💧 Community is processing emotions and healing',
      earth: '🌍 Community is grounding and stabilizing',
      air: '💨 Community is seeking clarity and understanding',
      aether: '✨ Community is exploring transcendent awareness'
    };
    notes.push(elementalNotes[dominant] || 'Community is in balanced exploration');

    // Virtue guidance
    if (virtue.growth_trend > 0.3) {
      notes.push('📈 Wisdom quality is growing - excellent progress');
    } else if (virtue.growth_trend < -0.3) {
      notes.push('📉 Wisdom quality declining - may need support');
    }

    return notes;
  }
}

// Health check for field aggregation service
async function checkFieldHealth() {
  try {
    const result = await pool.query('SELECT NOW()');
    return {
      healthy: true,
      timestamp: result.rows[0].now,
      service: 'collective_field_aggregator'
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      service: 'collective_field_aggregator'
    };
  }
}

module.exports = {
  CollectiveFieldSteward,
  checkFieldHealth
};