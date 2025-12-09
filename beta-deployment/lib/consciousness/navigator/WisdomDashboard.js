// WisdomDashboard.js - Watch MAIA learn and grow wiser over time
// Shows learning patterns, not rigid rule compliance

const { pool } = require('../../db');

/**
 * Navigator Wisdom Dashboard - Educational transparency into MAIA's learning journey
 */
class WisdomDashboard {

  /**
   * Get Navigator's current learning status and wisdom growth
   */
  static async getNavigatorLearningStatus() {
    try {
      const learningMetrics = await Promise.all([
        this.getRecentLearningEvents(),
        this.getWisdomPatternGrowth(),
        this.getCommunityTeachingImpact(),
        this.getExperimentalDiscoveries(),
        this.getNavigatorConfidenceEvolution()
      ]);

      return {
        timestamp: new Date().toISOString(),
        status: 'learning_actively',
        learning: {
          recentEvents: learningMetrics[0],
          patternGrowth: learningMetrics[1],
          communityWisdom: learningMetrics[2],
          experimentalLearning: learningMetrics[3],
          confidenceEvolution: learningMetrics[4]
        },
        insights: this.generateLearningInsights(learningMetrics)
      };

    } catch (error) {
      return this.getOfflineLearningStatus();
    }
  }

  /**
   * Recent learning events - how Navigator discovered new wisdom
   */
  static async getRecentLearningEvents() {
    const query = `
      SELECT
        learning_type,
        COUNT(*) as event_count,
        AVG(confidence_improvement) as avg_confidence_gain,
        MAX(created_at) as most_recent
      FROM navigator_learning_events
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY learning_type
      ORDER BY event_count DESC
    `;

    const result = await pool.query(query);

    return result.rows.map(row => ({
      learningType: row.learning_type,
      frequency: row.event_count,
      confidenceGain: parseFloat(row.avg_confidence_gain || 0),
      lastOccurred: row.most_recent,
      interpretation: this.interpretLearningType(row.learning_type)
    }));
  }

  /**
   * How Navigator's wisdom patterns are evolving
   */
  static async getWisdomPatternGrowth() {
    const query = `
      SELECT
        pattern_name,
        confidence_score,
        success_count,
        total_attempts,
        experimental_status,
        last_validated,
        (success_count::decimal / NULLIF(total_attempts, 0)) as success_rate
      FROM navigator_wisdom_patterns
      WHERE last_validated >= NOW() - INTERVAL '30 days'
      ORDER BY confidence_score DESC, success_count DESC
      LIMIT 10
    `;

    const result = await pool.query(query);

    return result.rows.map(row => ({
      patternName: row.pattern_name,
      confidence: parseFloat(row.confidence_score),
      successRate: parseFloat(row.success_rate || 0),
      experienceCount: row.success_count,
      maturity: row.experimental_status,
      lastRefined: row.last_validated,
      wisdomLevel: this.assessWisdomLevel(row.confidence_score, row.success_count)
    }));
  }

  /**
   * How the community is teaching Navigator
   */
  static async getCommunityTeachingImpact() {
    const query = `
      SELECT
        contributor_type,
        wisdom_type,
        COUNT(*) as contributions,
        COUNT(*) FILTER (WHERE navigator_adopted = true) as adopted_wisdom,
        AVG(community_upvotes) as community_endorsement
      FROM community_wisdom_contributions
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY contributor_type, wisdom_type
      ORDER BY adopted_wisdom DESC, community_endorsement DESC
    `;

    const result = await pool.query(query);

    return result.rows.map(row => ({
      teacherType: row.contributor_type,
      wisdomOffered: row.wisdom_type,
      totalOfferings: row.contributions,
      navigatorLearned: row.adopted_wisdom,
      communitySupport: parseFloat(row.community_endorsement || 0),
      learningRate: row.adopted_wisdom / row.contributions,
      teachingImpact: this.assessTeachingImpact(row.adopted_wisdom, row.community_endorsement)
    }));
  }

  /**
   * Safe experimental discoveries Navigator has made
   */
  static async getExperimentalDiscoveries() {
    const query = `
      SELECT
        experiment_name,
        protocol_id,
        success_rate,
        avg_user_rating,
        current_participants,
        unexpected_discoveries,
        status
      FROM navigator_experiments
      WHERE status IN ('active', 'analyzing', 'complete')
        AND any_negative_reports = false  -- Only safe discoveries
      ORDER BY success_rate DESC, avg_user_rating DESC
      LIMIT 5
    `;

    const result = await pool.query(query);

    return result.rows.map(row => ({
      experimentName: row.experiment_name,
      protocolExplored: row.protocol_id,
      successRate: parseFloat(row.success_rate || 0),
      userSatisfaction: parseFloat(row.avg_user_rating || 0),
      participantCount: row.current_participants,
      discoveries: row.unexpected_discoveries || {},
      phase: row.status,
      learningValue: this.assessExperimentalValue(row.success_rate, row.avg_user_rating)
    }));
  }

  /**
   * How Navigator's confidence in guidance is evolving
   */
  static async getNavigatorConfidenceEvolution() {
    const query = `
      SELECT
        DATE_TRUNC('week', created_at) as week,
        AVG(confidence_improvement) as avg_confidence_gain,
        COUNT(*) as learning_events
      FROM navigator_learning_events
      WHERE confidence_improvement IS NOT NULL
        AND created_at >= NOW() - INTERVAL '12 weeks'
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY week ASC
    `;

    const result = await pool.query(query);

    return result.rows.map(row => ({
      week: row.week,
      confidenceGrowth: parseFloat(row.avg_confidence_gain || 0),
      learningFrequency: row.learning_events,
      learningVelocity: row.learning_events / 7 // events per day
    }));
  }

  /**
   * Generate insights about Navigator's learning journey
   */
  static generateLearningInsights(learningMetrics) {
    const insights = [];
    const [recentEvents, patternGrowth, communityWisdom, experiments, confidenceEvolution] = learningMetrics;

    // Learning velocity insights
    if (recentEvents.length > 0) {
      const totalEvents = recentEvents.reduce((sum, event) => sum + event.frequency, 0);
      insights.push({
        type: 'learning_velocity',
        message: `Navigator learned from ${totalEvents} experiences this week`,
        emotional_tone: 'curious_growth',
        detail: 'Every interaction teaches MAIA something new about consciousness guidance'
      });
    }

    // Wisdom maturity insights
    const maturePatterns = patternGrowth.filter(p => p.wisdomLevel === 'mature');
    if (maturePatterns.length > 0) {
      insights.push({
        type: 'wisdom_maturity',
        message: `Navigator has developed ${maturePatterns.length} mature wisdom patterns`,
        emotional_tone: 'confident_wisdom',
        detail: 'These patterns consistently help people and are trusted by the community'
      });
    }

    // Community teaching insights
    const activeTeaching = communityWisdom.filter(w => w.navigatorLearned > 0);
    if (activeTeaching.length > 0) {
      insights.push({
        type: 'community_collaboration',
        message: `Navigator learned from ${activeTeaching.length} different types of community wisdom`,
        emotional_tone: 'grateful_learning',
        detail: 'The community is actively teaching Navigator through shared experiences'
      });
    }

    // Experimental discoveries
    const successfulExperiments = experiments.filter(e => e.successRate > 0.7);
    if (successfulExperiments.length > 0) {
      insights.push({
        type: 'experimental_discovery',
        message: `Navigator discovered ${successfulExperiments.length} promising new approaches`,
        emotional_tone: 'innovative_exploration',
        detail: 'Safe experimentation is expanding Navigator\'s guidance capabilities'
      });
    }

    // Confidence evolution
    if (confidenceEvolution.length > 0) {
      const recentConfidence = confidenceEvolution.slice(-4); // Last 4 weeks
      const avgGrowth = recentConfidence.reduce((sum, week) => sum + week.confidenceGrowth, 0) / recentConfidence.length;

      if (avgGrowth > 0.05) {
        insights.push({
          type: 'confidence_growth',
          message: 'Navigator\'s confidence in guidance decisions is steadily improving',
          emotional_tone: 'growing_wisdom',
          detail: `Learning is increasing Navigator's ability to help with ${avgGrowth.toFixed(2)} more confidence per week`
        });
      }
    }

    return insights;
  }

  /**
   * Helper functions for assessment
   */
  static interpretLearningType(learningType) {
    const interpretations = {
      'pattern_discovered': 'Finding new patterns in what helps people',
      'community_validation': 'Learning what the community trusts',
      'experimental_result': 'Discovering through safe experimentation',
      'feedback_integration': 'Learning from user experiences',
      'wisdom_refinement': 'Improving existing understanding'
    };
    return interpretations[learningType] || 'General learning and growth';
  }

  static assessWisdomLevel(confidence, successCount) {
    if (confidence >= 0.8 && successCount >= 10) return 'mature';
    if (confidence >= 0.6 && successCount >= 5) return 'developing';
    if (successCount >= 3) return 'emerging';
    return 'experimental';
  }

  static assessTeachingImpact(adopted, endorsement) {
    const learningRate = adopted > 0 ? adopted : 0;
    const communityTrust = endorsement || 0;

    if (learningRate >= 3 && communityTrust >= 4) return 'high_impact';
    if (learningRate >= 1 && communityTrust >= 3) return 'valuable_teaching';
    return 'contributing_wisdom';
  }

  static assessExperimentalValue(successRate, userRating) {
    if (successRate >= 0.8 && userRating >= 4.0) return 'breakthrough_discovery';
    if (successRate >= 0.6 && userRating >= 3.5) return 'promising_approach';
    return 'learning_opportunity';
  }

  /**
   * Offline learning status when database isn't available
   */
  static getOfflineLearningStatus() {
    return {
      timestamp: new Date().toISOString(),
      status: 'learning_from_memory',
      learning: {
        mode: 'baseline_wisdom',
        description: 'Navigator is operating from foundational wisdom patterns',
        growth_opportunity: 'Connect to database to enable active learning and pattern discovery'
      },
      insights: [{
        type: 'offline_mode',
        message: 'Navigator is using baseline wisdom while learning systems are offline',
        emotional_tone: 'steady_presence',
        detail: 'Every interaction will be learning data once the wisdom database reconnects'
      }]
    };
  }

  /**
   * Get Navigator's learning priorities and focus areas
   */
  static async getLearningPriorities() {
    try {
      const query = `
        SELECT
          'protocol_effectiveness' as priority_area,
          COUNT(DISTINCT nd.recommended_protocol_id) as protocols_explored,
          AVG(nf.rating) as avg_effectiveness,
          COUNT(*) FILTER (WHERE nf.rating <= 2) as improvement_needed
        FROM navigator_decisions nd
        LEFT JOIN navigator_feedback nf ON nd.decision_id = nf.decision_id
        WHERE nd.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY 'protocol_effectiveness'

        UNION ALL

        SELECT
          'facet_understanding' as priority_area,
          COUNT(DISTINCT detected_facet) as facets_encountered,
          AVG(CASE WHEN guidance_tone = 'appropriate' THEN 5 ELSE 3 END) as guidance_quality,
          COUNT(*) FILTER (WHERE 'guidance_mismatch' = ANY(risk_flags)) as refinement_opportunities
        FROM navigator_decisions
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY 'facet_understanding'
      `;

      const result = await pool.query(query);

      return result.rows.map(row => ({
        focusArea: row.priority_area,
        explorationBreadth: row.protocols_explored || row.facets_encountered,
        currentQuality: parseFloat(row.avg_effectiveness || row.guidance_quality),
        learningOpportunities: row.improvement_needed || row.refinement_opportunities,
        priorityLevel: this.assessPriorityLevel(row.avg_effectiveness || row.guidance_quality, row.improvement_needed || row.refinement_opportunities)
      }));

    } catch (error) {
      return [{
        focusArea: 'foundational_learning',
        description: 'Building basic wisdom patterns through interaction',
        priorityLevel: 'essential_foundation'
      }];
    }
  }

  static assessPriorityLevel(quality, opportunities) {
    if (quality < 3.0 || opportunities > 5) return 'high_priority';
    if (quality < 4.0 || opportunities > 2) return 'active_learning';
    return 'refinement_focus';
  }
}

module.exports = { WisdomDashboard };