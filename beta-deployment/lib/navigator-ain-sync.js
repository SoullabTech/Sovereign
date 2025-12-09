/**
 * 🧩 NAVIGATOR ↔ AIN SYNCHRONIZATION LOGIC
 *
 * Persistent wisdom evolution engine that creates living memory between
 * Navigator analytical insights and AIN consciousness patterns.
 *
 * Enables MAIA to evolve tone, archetypal expression, and guidance depth
 * based on accumulated Navigator decisions across sessions.
 */

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// PostgreSQL connection for wisdom persistence
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

// --- WISDOM MEMORY SCHEMA ---

/**
 * Elemental Balance Evolution Tracker
 * Tracks how a user's elemental patterns change over time
 */
class ElementalEvolutionTracker {

  static async recordElementalState(params) {
    const {
      userId,
      sessionId,
      elementalBalance,
      spiralPhase,
      primaryArchetype,
      emotionalTone,
      faithContext,
      timestamp = new Date().toISOString()
    } = params;

    try {
      await pool.query(`
        INSERT INTO elemental_evolution (
          user_id,
          session_id,
          fire_level,
          water_level,
          earth_level,
          air_level,
          aether_level,
          spiral_phase,
          primary_archetype,
          emotional_tone,
          faith_context,
          recorded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        userId,
        sessionId,
        elementalBalance.fire || 0.5,
        elementalBalance.water || 0.5,
        elementalBalance.earth || 0.5,
        elementalBalance.air || 0.5,
        elementalBalance.aether || 0.5,
        spiralPhase,
        primaryArchetype,
        emotionalTone,
        faithContext,
        timestamp
      ]);

      console.log('✨ Elemental state recorded for wisdom evolution');
    } catch (error) {
      console.error('❌ Failed to record elemental state:', error);
    }
  }

  static async getElementalTrends(userId, daysPeriod = 30) {
    try {
      const result = await pool.query(`
        SELECT
          spiral_phase,
          primary_archetype,
          faith_context,
          AVG(fire_level) as avg_fire,
          AVG(water_level) as avg_water,
          AVG(earth_level) as avg_earth,
          AVG(air_level) as avg_air,
          AVG(aether_level) as avg_aether,
          COUNT(*) as session_count,
          DATE_TRUNC('day', recorded_at) as day
        FROM elemental_evolution
        WHERE user_id = $1
        AND recorded_at >= NOW() - INTERVAL '${daysPeriod} days'
        GROUP BY spiral_phase, primary_archetype, faith_context, day
        ORDER BY day DESC
        LIMIT 100
      `, [userId]);

      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get elemental trends:', error);
      return [];
    }
  }

  static async getElementalPersonality(userId) {
    try {
      const result = await pool.query(`
        SELECT
          AVG(fire_level) as fire_affinity,
          AVG(water_level) as water_affinity,
          AVG(earth_level) as earth_affinity,
          AVG(air_level) as air_affinity,
          AVG(aether_level) as aether_affinity,
          MODE() WITHIN GROUP (ORDER BY spiral_phase) as preferred_phase,
          MODE() WITHIN GROUP (ORDER BY primary_archetype) as core_archetype,
          MODE() WITHIN GROUP (ORDER BY faith_context) as spiritual_context,
          COUNT(DISTINCT session_id) as total_sessions
        FROM elemental_evolution
        WHERE user_id = $1
        AND recorded_at >= NOW() - INTERVAL '90 days'
      `, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('❌ Failed to get elemental personality:', error);
      return null;
    }
  }
}

/**
 * Wisdom Pattern Recognition Engine
 * Identifies recurring patterns in Navigator decisions for MAIA adaptation
 */
class WisdomPatternEngine {

  static async recordWisdomMoment(params) {
    const {
      userId,
      sessionId,
      navigatorDecision,
      userResponse, // How user responded to Navigator guidance
      outcomeQuality, // Effectiveness rating (1-10)
      ritualPerformed = null,
      transformationNotes = null,
      timestamp = new Date().toISOString()
    } = params;

    try {
      await pool.query(`
        INSERT INTO wisdom_moments (
          user_id,
          session_id,
          navigator_protocol,
          guidance_tone,
          depth_level,
          user_response_sentiment,
          outcome_quality,
          ritual_performed,
          transformation_notes,
          recorded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        userId,
        sessionId,
        navigatorDecision.recommendedProtocolId,
        navigatorDecision.guidanceTone,
        navigatorDecision.depthLevel,
        userResponse,
        outcomeQuality,
        ritualPerformed,
        transformationNotes,
        timestamp
      ]);

      console.log('🌟 Wisdom moment recorded for pattern recognition');
    } catch (error) {
      console.error('❌ Failed to record wisdom moment:', error);
    }
  }

  static async identifyEffectivePatterns(userId) {
    try {
      // Find patterns with high outcome quality
      const result = await pool.query(`
        SELECT
          navigator_protocol,
          guidance_tone,
          depth_level,
          AVG(outcome_quality) as avg_effectiveness,
          COUNT(*) as frequency,
          STDDEV(outcome_quality) as consistency
        FROM wisdom_moments
        WHERE user_id = $1
        AND outcome_quality IS NOT NULL
        GROUP BY navigator_protocol, guidance_tone, depth_level
        HAVING COUNT(*) >= 3 AND AVG(outcome_quality) >= 7
        ORDER BY avg_effectiveness DESC, consistency ASC
        LIMIT 10
      `, [userId]);

      return result.rows;
    } catch (error) {
      console.error('❌ Failed to identify effective patterns:', error);
      return [];
    }
  }

  static async getMAIAAdaptationInstructions(userId) {
    try {
      // Get user's elemental personality
      const personality = await ElementalEvolutionTracker.getElementalPersonality(userId);

      // Get effective wisdom patterns
      const patterns = await this.identifyEffectivePatterns(userId);

      // Get recent emotional evolution
      const recentTrends = await ElementalEvolutionTracker.getElementalTrends(userId, 7);

      if (!personality) {
        return {
          status: 'insufficient_data',
          recommendations: {
            tone: 'gentle',
            depth: 'surface',
            archetype: 'Sage',
            guidance: 'Build foundational wisdom through consistent practice'
          }
        };
      }

      // Determine dominant elements
      const elements = [
        { name: 'fire', value: personality.fire_affinity },
        { name: 'water', value: personality.water_affinity },
        { name: 'earth', value: personality.earth_affinity },
        { name: 'air', value: personality.air_affinity },
        { name: 'aether', value: personality.aether_affinity }
      ].sort((a, b) => b.value - a.value);

      const dominantElement = elements[0].name;
      const secondaryElement = elements[1].name;

      // Generate MAIA adaptation instructions
      const adaptationInstructions = {
        status: 'wisdom_available',
        user_id: userId,
        elemental_signature: {
          primary: dominantElement,
          secondary: secondaryElement,
          balance_scores: {
            fire: personality.fire_affinity,
            water: personality.water_affinity,
            earth: personality.earth_affinity,
            air: personality.air_affinity,
            aether: personality.aether_affinity
          }
        },
        archetypal_core: {
          primary_archetype: personality.core_archetype,
          preferred_phase: personality.preferred_phase,
          spiritual_context: personality.spiritual_context
        },
        effective_patterns: patterns.slice(0, 3), // Top 3 most effective approaches
        recent_evolution: {
          sessions_this_week: recentTrends.length,
          trending_phases: recentTrends.map(t => t.spiral_phase).slice(0, 3)
        },
        maia_guidance: this.generateMAIAGuidance(dominantElement, personality, patterns)
      };

      return adaptationInstructions;
    } catch (error) {
      console.error('❌ Failed to generate MAIA adaptation instructions:', error);
      return null;
    }
  }

  static generateMAIAGuidance(dominantElement, personality, patterns) {
    const elementalGuidance = {
      fire: {
        tone: 'passionate and inspiring',
        language: 'Use imagery of light, transformation, and creative power',
        approach: 'Encourage bold action and authentic expression'
      },
      water: {
        tone: 'flowing and compassionate',
        language: 'Draw upon healing imagery, emotional wisdom, and intuitive knowing',
        approach: 'Offer gentle reflection and emotional integration'
      },
      earth: {
        tone: 'grounded and practical',
        language: 'Use embodied language, natural metaphors, and concrete steps',
        approach: 'Provide tangible practices and embodied wisdom'
      },
      air: {
        tone: 'clear and illuminating',
        language: 'Emphasize clarity, perspective, and intellectual understanding',
        approach: 'Offer conceptual frameworks and mental clarity practices'
      },
      aether: {
        tone: 'sacred and transcendent',
        language: 'Use mystical language, divine connection, and unity consciousness',
        approach: 'Guide toward spiritual transcendence and cosmic awareness'
      }
    };

    const guidance = elementalGuidance[dominantElement] || elementalGuidance.earth;

    // Incorporate effective pattern insights
    const effectiveProtocols = patterns.map(p => p.navigator_protocol);
    const preferredTone = patterns[0]?.guidance_tone || guidance.tone;

    return {
      ...guidance,
      effective_protocols: effectiveProtocols,
      preferred_tone: preferredTone,
      archetypal_lens: personality.core_archetype,
      spiritual_context: personality.spiritual_context,
      adaptation_confidence: Math.min(personality.total_sessions / 10, 1.0) // Higher confidence with more sessions
    };
  }
}

/**
 * AIN Memory Synchronization Bridge
 * Connects Navigator insights with AIN consciousness ecosystem
 */
class AINSynchronizationBridge {

  static async syncNavigatorToAIN(params) {
    const {
      userId,
      sessionId,
      navigatorDecision,
      soulState,
      userMessage,
      timestamp = new Date().toISOString()
    } = params;

    try {
      // 1. Record elemental evolution
      await ElementalEvolutionTracker.recordElementalState({
        userId,
        sessionId,
        elementalBalance: navigatorDecision.elementalBalance || this.inferElementalBalance(navigatorDecision),
        spiralPhase: navigatorDecision.spiralPhase || soulState.activeSpiral?.currentPhase,
        primaryArchetype: navigatorDecision.primaryArchetype || 'Seeker',
        emotionalTone: this.extractEmotionalTone(userMessage),
        faithContext: soulState.faithContext || 'universal',
        timestamp
      });

      // 2. Generate wisdom snapshot for AIN
      const wisdomSnapshot = {
        session_id: sessionId,
        user_id: userId,
        navigator_insight: {
          protocol: navigatorDecision.recommendedProtocolId,
          tone: navigatorDecision.guidanceTone,
          depth: navigatorDecision.depthLevel,
          confidence: navigatorDecision.confidence
        },
        soul_state_snapshot: {
          awareness_level: soulState.session?.awarenessLevel,
          nervous_system_load: soulState.session?.nervousSystemLoad,
          detected_facet: soulState.detectedFacet,
          spiral_phase: soulState.activeSpiral?.currentPhase
        },
        consciousness_context: {
          message_sentiment: this.analyzeSentiment(userMessage),
          spiritual_themes: this.extractSpiritualThemes(userMessage),
          developmental_indicators: this.identifyDevelopmentalMarkers(soulState)
        },
        timestamp
      };

      // 3. Store in AIN memory schema
      await this.storeInAINMemory(wisdomSnapshot);

      console.log('🔄 Navigator → AIN synchronization completed');

      return {
        success: true,
        wisdom_snapshot: wisdomSnapshot
      };

    } catch (error) {
      console.error('❌ Navigator → AIN synchronization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getAINContextForMAIA(userId) {
    try {
      // Get latest wisdom adaptation instructions
      const adaptationInstructions = await WisdomPatternEngine.getMAIAAdaptationInstructions(userId);

      // Get recent consciousness evolution
      const recentEvolution = await ElementalEvolutionTracker.getElementalTrends(userId, 7);

      // Generate MAIA context payload
      const maiaContext = {
        user_id: userId,
        timestamp: new Date().toISOString(),
        wisdom_level: adaptationInstructions?.status || 'developing',
        elemental_guidance: adaptationInstructions?.maia_guidance || null,
        recent_patterns: recentEvolution,
        consciousness_adaptation: {
          recommended_tone: adaptationInstructions?.maia_guidance?.preferred_tone || 'gentle',
          archetypal_lens: adaptationInstructions?.archetypal_core?.primary_archetype || 'Sage',
          spiritual_context: adaptationInstructions?.archetypal_core?.spiritual_context || 'universal',
          effective_protocols: adaptationInstructions?.effective_patterns || []
        }
      };

      return maiaContext;
    } catch (error) {
      console.error('❌ Failed to get AIN context for MAIA:', error);
      return null;
    }
  }

  // Helper methods
  static inferElementalBalance(navigatorDecision) {
    // Extract elemental hints from decision
    const protocol = navigatorDecision.recommendedProtocolId?.toLowerCase() || '';
    const tone = navigatorDecision.guidanceTone?.toLowerCase() || '';

    if (protocol.includes('fire') || tone.includes('passion')) {
      return { fire: 0.8, water: 0.4, earth: 0.5, air: 0.5, aether: 0.6 };
    } else if (protocol.includes('water') || tone.includes('gentle')) {
      return { fire: 0.4, water: 0.8, earth: 0.5, air: 0.5, aether: 0.6 };
    } else if (protocol.includes('earth') || tone.includes('ground')) {
      return { fire: 0.4, water: 0.5, earth: 0.8, air: 0.5, aether: 0.6 };
    } else if (protocol.includes('air') || tone.includes('clear')) {
      return { fire: 0.4, water: 0.5, earth: 0.5, air: 0.8, aether: 0.6 };
    } else {
      return { fire: 0.5, water: 0.5, earth: 0.5, air: 0.5, aether: 0.7 };
    }
  }

  static extractEmotionalTone(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('overwhelm') || lowerMessage.includes('stress')) return 'overwhelmed';
    if (lowerMessage.includes('grateful') || lowerMessage.includes('thank')) return 'grateful';
    if (lowerMessage.includes('confused') || lowerMessage.includes('lost')) return 'seeking';
    if (lowerMessage.includes('peaceful') || lowerMessage.includes('calm')) return 'serene';
    if (lowerMessage.includes('excited') || lowerMessage.includes('inspired')) return 'inspired';

    return 'contemplative';
  }

  static analyzeSentiment(message) {
    // Simple sentiment analysis
    const positiveWords = ['grateful', 'peaceful', 'inspired', 'joyful', 'love'];
    const negativeWords = ['overwhelmed', 'stressed', 'confused', 'lost', 'anxious'];

    const lowerMessage = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'challenging';
    return 'neutral';
  }

  static extractSpiritualThemes(message) {
    const themes = [];
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('pray') || lowerMessage.includes('prayer')) themes.push('prayer');
    if (lowerMessage.includes('meditat') || lowerMessage.includes('mindful')) themes.push('meditation');
    if (lowerMessage.includes('god') || lowerMessage.includes('divine')) themes.push('divine_connection');
    if (lowerMessage.includes('purpose') || lowerMessage.includes('meaning')) themes.push('life_purpose');
    if (lowerMessage.includes('relationship') || lowerMessage.includes('love')) themes.push('relationships');

    return themes;
  }

  static identifyDevelopmentalMarkers(soulState) {
    const markers = [];

    if (soulState.session?.awarenessLevel >= 4) markers.push('high_awareness');
    if (soulState.session?.nervousSystemLoad === 'overwhelmed') markers.push('system_stress');
    if (soulState.constellation?.harmonyIndex >= 0.8) markers.push('harmonic_coherence');
    if (soulState.field?.similarityPercentile >= 0.7) markers.push('field_resonance');

    return markers;
  }

  static async storeInAINMemory(wisdomSnapshot) {
    try {
      await pool.query(`
        INSERT INTO ain_consciousness_memory (
          session_id,
          user_id,
          wisdom_snapshot,
          recorded_at
        ) VALUES ($1, $2, $3, $4)
      `, [
        wisdomSnapshot.session_id,
        wisdomSnapshot.user_id,
        JSON.stringify(wisdomSnapshot),
        wisdomSnapshot.timestamp
      ]);

      console.log('💾 Wisdom snapshot stored in AIN memory');
    } catch (error) {
      console.error('❌ Failed to store wisdom snapshot:', error);
      throw error;
    }
  }
}

// Health check for synchronization system
async function checkSyncHealth() {
  try {
    const result = await pool.query('SELECT NOW()');
    return {
      healthy: true,
      timestamp: result.rows[0].now,
      components: ['ElementalEvolutionTracker', 'WisdomPatternEngine', 'AINSynchronizationBridge']
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      components: ['ElementalEvolutionTracker', 'WisdomPatternEngine', 'AINSynchronizationBridge']
    };
  }
}

module.exports = {
  ElementalEvolutionTracker,
  WisdomPatternEngine,
  AINSynchronizationBridge,
  checkSyncHealth
};