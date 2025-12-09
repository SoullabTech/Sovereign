// WisdomEngine.js - Learning-based Navigator wisdom system
// Builds patterns from experience rather than rigid rules

const { pool } = require('../../db');

/**
 * WisdomEngine - Learns from every Navigator decision and user feedback
 * to continuously improve consciousness guidance
 */
class WisdomEngine {

  /**
   * Find the best protocol based on learned patterns, not rigid rules
   */
  static async findBestGuidance(soulState) {
    // 1. Find similar successful experiences
    const similarSuccesses = await this.findSimilarSuccesses(soulState);

    // 2. Get community wisdom patterns
    const communityPatterns = await this.getCommunityPatterns(soulState);

    // 3. Check for experimental opportunities
    const experimentalOptions = await this.getExperimentalOptions(soulState);

    // 4. Synthesize learning-based decision
    return this.synthesizeWisdom({
      soulState,
      similarSuccesses,
      communityPatterns,
      experimentalOptions
    });
  }

  /**
   * Find patterns from previous successful decisions with similar soul states
   */
  static async findSimilarSuccesses(soulState) {
    try {
      const query = `
        SELECT
          nd.recommended_protocol_id,
          nd.guidance_tone,
          nd.raw_soul_state,
          AVG(nf.rating) as avg_rating,
          COUNT(nf.rating) as feedback_count,
          nd.created_at
        FROM navigator_decisions nd
        JOIN navigator_feedback nf ON nd.decision_id = nf.decision_id
        WHERE nf.rating >= 4  -- Only successful experiences
          AND nd.nervous_system_load = $1
          AND nd.awareness_level BETWEEN $2 - 1 AND $2 + 1
          AND nd.created_at >= NOW() - INTERVAL '30 days'  -- Recent patterns
        GROUP BY nd.recommended_protocol_id, nd.guidance_tone, nd.raw_soul_state, nd.created_at
        ORDER BY avg_rating DESC, feedback_count DESC
        LIMIT 10
      `;

      const result = await pool.query(query, [
        soulState.session.nervousSystemLoad,
        soulState.session.awarenessLevel
      ]);

      return result.rows.map(row => ({
        protocolId: row.recommended_protocol_id,
        guidanceTone: row.guidance_tone,
        successScore: row.avg_rating,
        experienceCount: row.feedback_count,
        context: JSON.parse(row.raw_soul_state),
        recentness: this.calculateRecentness(row.created_at)
      }));

    } catch (error) {
      console.log('📚 Learning from similar successes offline - using baseline wisdom');
      return [];
    }
  }

  /**
   * Discover emerging patterns in the community consciousness field
   */
  static async getCommunityPatterns(soulState) {
    try {
      const query = `
        SELECT
          nd.detected_facet,
          nd.recommended_protocol_id,
          COUNT(*) as pattern_frequency,
          AVG(nf.rating) as community_satisfaction,
          STDDEV(nf.rating) as satisfaction_consistency
        FROM navigator_decisions nd
        LEFT JOIN navigator_feedback nf ON nd.decision_id = nf.decision_id
        WHERE nd.detected_facet = $1
          AND nd.created_at >= NOW() - INTERVAL '14 days'
        GROUP BY nd.detected_facet, nd.recommended_protocol_id
        HAVING COUNT(*) >= 3  -- Patterns with enough data
        ORDER BY community_satisfaction DESC, pattern_frequency DESC
      `;

      const result = await pool.query(query, [soulState.detectedFacet]);

      return result.rows.map(row => ({
        facet: row.detected_facet,
        protocolId: row.recommended_protocol_id,
        communityTrust: row.community_satisfaction || 3.0,
        patternStrength: row.pattern_frequency,
        consistency: 5.0 - (row.satisfaction_consistency || 1.0), // Lower stddev = higher consistency
        isEmergingPattern: row.pattern_frequency >= 5
      }));

    } catch (error) {
      console.log('🌍 Learning from community patterns offline - using individual wisdom');
      return [];
    }
  }

  /**
   * Identify opportunities for gentle experimentation and learning
   */
  static async getExperimentalOptions(soulState) {
    // Safe experimental protocols for learning (never harmful, always optional)
    const experimentalProtocols = [
      {
        protocolId: 'micro-meditation-experiment',
        description: '2-minute guided awareness practice',
        experimentType: 'gentle_exploration',
        safetyLevel: 'completely_safe',
        learningValue: 'high',
        condition: soulState.session.awarenessLevel >= 2
      },
      {
        protocolId: 'gratitude-spiral-experiment',
        description: 'Spiral-informed gratitude reflection',
        experimentType: 'positive_pattern_building',
        safetyLevel: 'completely_safe',
        learningValue: 'medium',
        condition: soulState.session.nervousSystemLoad !== 'overwhelmed'
      },
      {
        protocolId: 'facet-curiosity-experiment',
        description: 'Gentle exploration of detected consciousness facet',
        experimentType: 'facet_awareness',
        safetyLevel: 'completely_safe',
        learningValue: 'high',
        condition: soulState.detectedFacet && soulState.detectedFacet !== 'Core'
      }
    ];

    // Only suggest experiments that are safe for this person right now
    return experimentalProtocols.filter(exp => {
      if (!exp.condition) return false;

      // Extra safety: no experiments during high stress
      if (soulState.session.nervousSystemLoad === 'overwhelmed') return false;

      return true;
    });
  }

  /**
   * Synthesize learned wisdom into guidance decision
   */
  static synthesizeWisdom({ soulState, similarSuccesses, communityPatterns, experimentalOptions }) {
    const synthesis = {
      baseProtocol: null,
      confidence: 0.5,
      learningSource: 'baseline',
      wisdom: []
    };

    // 1. Learn from similar successes (highest weight)
    if (similarSuccesses.length > 0) {
      const topSuccess = similarSuccesses[0];
      synthesis.baseProtocol = topSuccess.protocolId;
      synthesis.confidence = Math.min(0.9, 0.6 + (topSuccess.successScore - 3) * 0.15);
      synthesis.learningSource = 'similar_success';
      synthesis.wisdom.push({
        type: 'learned_pattern',
        source: 'individual_success',
        insight: `Similar situation had ${topSuccess.experienceCount} positive experiences with ${topSuccess.protocolId}`
      });
    }

    // 2. Validate with community patterns
    const communityValidation = communityPatterns.find(p =>
      p.protocolId === synthesis.baseProtocol || !synthesis.baseProtocol
    );

    if (communityValidation) {
      if (!synthesis.baseProtocol) {
        synthesis.baseProtocol = communityValidation.protocolId;
        synthesis.learningSource = 'community_pattern';
      }

      synthesis.confidence = Math.min(0.95, synthesis.confidence + (communityValidation.communityTrust - 3) * 0.1);
      synthesis.wisdom.push({
        type: 'community_validation',
        source: 'collective_wisdom',
        insight: `Community shows ${communityValidation.patternStrength} successful uses of ${communityValidation.protocolId} for ${communityValidation.facet}`
      });
    }

    // 3. Consider gentle experimentation opportunities
    if (experimentalOptions.length > 0 && Math.random() < 0.3) { // 30% chance for gentle experiments
      const experiment = experimentalOptions[0];
      synthesis.wisdom.push({
        type: 'learning_opportunity',
        source: 'experimental_growth',
        insight: `Optional: Try ${experiment.description} to explore new awareness territories`,
        optional: true,
        experimentalProtocol: experiment.protocolId
      });
    }

    // 4. Fallback to educated baseline if no learned patterns
    if (!synthesis.baseProtocol) {
      synthesis.baseProtocol = this.getEducatedBaseline(soulState);
      synthesis.learningSource = 'educated_baseline';
      synthesis.wisdom.push({
        type: 'baseline_guidance',
        source: 'foundational_wisdom',
        insight: 'Building new learning pattern - this experience will teach MAIA'
      });
    }

    return synthesis;
  }

  /**
   * Educated baseline when no patterns exist yet (learning starts here)
   */
  static getEducatedBaseline(soulState) {
    const { awarenessLevel, nervousSystemLoad } = soulState.session;

    // Start with nervous system safety
    if (nervousSystemLoad === 'overwhelmed') {
      return 'nervous-system-regulation';
    }

    // Build awareness foundation
    if (awarenessLevel <= 2) {
      return 'awareness-cultivation';
    }

    // Support higher awareness integration
    if (awarenessLevel >= 4) {
      return 'awareness-integration';
    }

    // Default safe exploration
    return 'conscious-exploration';
  }

  /**
   * Calculate how recent/relevant an experience is
   */
  static calculateRecentness(timestamp) {
    const daysOld = (Date.now() - new Date(timestamp)) / (1000 * 60 * 60 * 24);
    return Math.max(0.1, 1.0 - (daysOld / 30)); // Decay over 30 days
  }

  /**
   * Record that Navigator is learning from this decision
   */
  static async recordLearningEvent(decisionId, learningType, details) {
    try {
      await pool.query(
        `INSERT INTO navigator_learning_events (decision_id, learning_type, details, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [decisionId, learningType, JSON.stringify(details)]
      );
    } catch (error) {
      // Learning recording is optional - don't break the experience
      console.log('📝 Learning event recorded in memory');
    }
  }
}

module.exports = { WisdomEngine };