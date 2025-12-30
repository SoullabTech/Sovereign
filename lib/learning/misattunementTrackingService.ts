// @ts-nocheck - Prototype file, not type-checked
// backend: lib/learning/misattunementTrackingService.ts
// Misattunement Tracking Service for MAIA's Loop D human supervision and rupture learning

import { pool } from '../database/pool';

export interface LogMisattunementInput {
  turnId: number;
  category: 'self-focused' | 'too-verbose' | 'invalidating' | 'over-interpreting' | 'dismissive' | 'therapeutic-jargon' | 'assumptive' | 'lecture-mode' | 'boundary-violation' | 'emotional-mismatch';
  subcategory?: string;
  severity: 1 | 2 | 3 | 4 | 5; // 1 = mild, 5 = severe rupture
  detectedBy: 'user' | 'developer' | 'auto-detector' | 'claude-review' | 'human-supervisor';
  detectionMethod?: 'explicit-feedback' | 'sentiment-analysis' | 'manual-review' | 'pattern-recognition';
  userQuote?: string; // Direct user quote expressing the issue
  maiaProblematicText?: string; // Specific part of MAIA's response that failed
  contextNote?: string; // Situational factors that contributed
}

export interface Misattunement {
  id: number;
  turnId: number;
  category: string;
  subcategory?: string;
  severity: number;
  detectedBy: string;
  detectionMethod?: string;
  userQuote?: string;
  maiaProblematicText?: string;
  contextNote?: string;
  internalNote?: string;
  patternIdentified: boolean;
  addressedInGold?: number; // Link to gold response that addresses this
  createdAt: Date;
}

export interface MisattunementPattern {
  category: string;
  occurrences: number;
  avgSeverity: number;
  commonTriggers: string[];
  recentTrend: 'increasing' | 'decreasing' | 'stable';
  exampleQuotes: string[];
}

export interface RuptureAnalysis {
  totalRuptures: number;
  severityBreakdown: Record<number, number>;
  categoryBreakdown: Record<string, number>;
  detectionSources: Record<string, number>;
  trends: {
    thisWeek: number;
    lastWeek: number;
    change: number;
  };
  topPatterns: MisattunementPattern[];
  needsImmedateAttention: Misattunement[];
}

/**
 * MAIA Misattunement Tracking Service
 *
 * This service implements Loop D learning: systematic tracking of where MAIA
 * fails relationally, enabling pattern recognition and rupture repair learning.
 *
 * Categories of misattunement:
 * - self-focused: Making conversation about MAIA instead of user
 * - too-verbose: Information overload, not reading the moment
 * - invalidating: Dismissing or minimizing user experience
 * - over-interpreting: Reading too much into what user said
 * - dismissive: Not taking user's concern seriously
 * - therapeutic-jargon: Using clinical language inappropriately
 * - assumptive: Making assumptions about user's experience
 * - lecture-mode: Teaching instead of being present
 * - boundary-violation: Overstepping relational boundaries
 * - emotional-mismatch: Missing user's emotional state
 */
export class MisattunementTrackingService {

  /**
   * Log a misattunement for learning analysis
   */
  static async logMisattunement(input: LogMisattunementInput): Promise<number> {
    const {
      turnId,
      category,
      subcategory,
      severity,
      detectedBy,
      detectionMethod,
      userQuote,
      maiaProblematicText,
      contextNote
    } = input;

    try {
      const query = `
        INSERT INTO maia_misattunements
          (turn_id, category, subcategory, severity, detected_by,
           detection_method, user_quote, maia_problematic_text, context_note)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;

      const values = [
        turnId,
        category,
        subcategory ?? null,
        severity,
        detectedBy,
        detectionMethod ?? null,
        userQuote ?? null,
        maiaProblematicText ?? null,
        contextNote ?? null
      ];

      const result = await pool.query(query, values);
      const misattunementId = result.rows[0].id as number;

      // Urgent logging for severe ruptures
      if (severity >= 4) {
        console.log(`🚨 SEVERE RUPTURE LOGGED | ID: ${misattunementId} | Category: ${category} | Severity: ${severity}/5`);
        console.log(`   User quote: "${userQuote}"`);
        console.log(`   Problematic text: "${maiaProblematicText}"`);
      } else {
        console.log(`⚠️ Misattunement logged | ID: ${misattunementId} | Category: ${category} | Severity: ${severity}/5 | Detected by: ${detectedBy}`);
      }

      // Auto-check for patterns after logging
      await this.checkForPatterns(category);

      return misattunementId;
    } catch (error) {
      console.error('❌ Failed to log misattunement:', error);
      throw new Error('Failed to log misattunement');
    }
  }

  /**
   * Quick logging for user-reported ruptures
   */
  static async logUserRupture(
    turnId: number,
    userFeedback: string,
    maiaResponse: string,
    severity: 1 | 2 | 3 | 4 | 5 = 3
  ): Promise<number> {
    // Auto-categorize based on user feedback
    const category = this.categorizeMisattunement(userFeedback, maiaResponse);

    return await this.logMisattunement({
      turnId,
      category,
      severity,
      detectedBy: 'user',
      detectionMethod: 'explicit-feedback',
      userQuote: userFeedback,
      maiaProblematicText: maiaResponse.length > 200 ?
        maiaResponse.substring(0, 200) + '...' :
        maiaResponse
    });
  }

  /**
   * Auto-categorize misattunement based on content analysis
   */
  private static categorizeMisattunement(userFeedback: string, maiaResponse: string): LogMisattunementInput['category'] {
    const feedbackLower = userFeedback.toLowerCase();
    const responseLower = maiaResponse.toLowerCase();

    // Check for specific patterns
    if (feedbackLower.includes('too long') || feedbackLower.includes('verbose') || feedbackLower.includes('too much')) {
      return 'too-verbose';
    }

    if (feedbackLower.includes('about yourself') || feedbackLower.includes('self-focused') || responseLower.includes('i feel') || responseLower.includes('i think')) {
      return 'self-focused';
    }

    if (feedbackLower.includes('dismissive') || feedbackLower.includes('invalidating') || feedbackLower.includes("don't understand")) {
      return 'invalidating';
    }

    if (feedbackLower.includes('assuming') || feedbackLower.includes('assumption')) {
      return 'assumptive';
    }

    if (feedbackLower.includes('lecturing') || feedbackLower.includes('teaching') || feedbackLower.includes('preachy')) {
      return 'lecture-mode';
    }

    if (feedbackLower.includes('therapy speak') || feedbackLower.includes('clinical') || feedbackLower.includes('jargon')) {
      return 'therapeutic-jargon';
    }

    if (feedbackLower.includes('reading too much') || feedbackLower.includes('over-interpreting')) {
      return 'over-interpreting';
    }

    // Default to emotional mismatch if no specific pattern
    return 'emotional-mismatch';
  }

  /**
   * Add internal note to misattunement (for developer/supervisor analysis)
   */
  static async addInternalNote(
    misattunementId: number,
    internalNote: string,
    patternIdentified: boolean = false
  ): Promise<boolean> {
    try {
      const query = `
        UPDATE maia_misattunements
        SET internal_note = $2,
            pattern_identified = $3
        WHERE id = $1
      `;

      await pool.query(query, [misattunementId, internalNote, patternIdentified]);

      console.log(`📝 Internal note added to misattunement ${misattunementId}${patternIdentified ? ' | Pattern identified' : ''}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to add internal note:', error);
      return false;
    }
  }

  /**
   * Link misattunement to gold response that addresses it
   */
  static async linkToGoldResponse(
    misattunementId: number,
    goldResponseId: number
  ): Promise<boolean> {
    try {
      const query = `
        UPDATE maia_misattunements
        SET addressed_in_gold = $2
        WHERE id = $1
      `;

      await pool.query(query, [misattunementId, goldResponseId]);

      console.log(`🔗 Misattunement ${misattunementId} linked to gold response ${goldResponseId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to link to gold response:', error);
      return false;
    }
  }

  /**
   * Get recent misattunements for review
   */
  static async getRecentMisattunements(
    limit: number = 20,
    minSeverity: number = 1,
    daysBack: number = 7
  ): Promise<Misattunement[]> {
    try {
      const query = `
        SELECT *
        FROM maia_misattunements
        WHERE severity >= $1
          AND created_at >= NOW() - INTERVAL '${daysBack} days'
        ORDER BY severity DESC, created_at DESC
        LIMIT $2
      `;

      const result = await pool.query(query, [minSeverity, limit]);

      return result.rows.map(row => ({
        id: row.id,
        turnId: row.turn_id,
        category: row.category,
        subcategory: row.subcategory,
        severity: row.severity,
        detectedBy: row.detected_by,
        detectionMethod: row.detection_method,
        userQuote: row.user_quote,
        maiaProblematicText: row.maia_problematic_text,
        contextNote: row.context_note,
        internalNote: row.internal_note,
        patternIdentified: row.pattern_identified,
        addressedInGold: row.addressed_in_gold,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('❌ Failed to get recent misattunements:', error);
      return [];
    }
  }

  /**
   * Check for emerging patterns after logging new misattunement
   */
  private static async checkForPatterns(category: string): Promise<void> {
    try {
      // Check if this category has appeared 3+ times in last 24 hours
      const query = `
        SELECT COUNT(*) as count
        FROM maia_misattunements
        WHERE category = $1
          AND created_at >= NOW() - INTERVAL '24 hours'
      `;

      const result = await pool.query(query, [category]);
      const count = parseInt(result.rows[0].count);

      if (count >= 3) {
        console.log(`🔍 PATTERN ALERT: ${category} misattunement occurred ${count} times in last 24 hours`);

        // Auto-mark recent instances as pattern-identified
        const updateQuery = `
          UPDATE maia_misattunements
          SET pattern_identified = true
          WHERE category = $1
            AND created_at >= NOW() - INTERVAL '24 hours'
            AND pattern_identified = false
        `;

        await pool.query(updateQuery, [category]);
      }
    } catch (error) {
      console.warn('⚠️ Failed to check for patterns:', error);
    }
  }

  /**
   * Get comprehensive rupture analysis
   */
  static async getRuptureAnalysis(daysBack: number = 30): Promise<RuptureAnalysis> {
    try {
      // Total ruptures and severity breakdown
      const summaryQuery = `
        SELECT
          COUNT(*) as total_ruptures,
          COUNT(CASE WHEN severity = 1 THEN 1 END) as severity_1,
          COUNT(CASE WHEN severity = 2 THEN 1 END) as severity_2,
          COUNT(CASE WHEN severity = 3 THEN 1 END) as severity_3,
          COUNT(CASE WHEN severity = 4 THEN 1 END) as severity_4,
          COUNT(CASE WHEN severity = 5 THEN 1 END) as severity_5
        FROM maia_misattunements
        WHERE created_at >= NOW() - INTERVAL '${daysBack} days'
      `;

      const summaryResult = await pool.query(summaryQuery);
      const summary = summaryResult.rows[0];

      // Category breakdown
      const categoryQuery = `
        SELECT category, COUNT(*) as count
        FROM maia_misattunements
        WHERE created_at >= NOW() - INTERVAL '${daysBack} days'
        GROUP BY category
        ORDER BY count DESC
      `;

      const categoryResult = await pool.query(categoryQuery);
      const categoryBreakdown: Record<string, number> = {};
      categoryResult.rows.forEach(row => {
        categoryBreakdown[row.category] = parseInt(row.count);
      });

      // Detection sources
      const detectionQuery = `
        SELECT detected_by, COUNT(*) as count
        FROM maia_misattunements
        WHERE created_at >= NOW() - INTERVAL '${daysBack} days'
        GROUP BY detected_by
      `;

      const detectionResult = await pool.query(detectionQuery);
      const detectionSources: Record<string, number> = {};
      detectionResult.rows.forEach(row => {
        detectionSources[row.detected_by] = parseInt(row.count);
      });

      // Weekly trends
      const trendsQuery = `
        SELECT
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as this_week,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '14 days'
                     AND created_at < NOW() - INTERVAL '7 days' THEN 1 END) as last_week
        FROM maia_misattunements
      `;

      const trendsResult = await pool.query(trendsQuery);
      const trends = trendsResult.rows[0];
      const thisWeek = parseInt(trends.this_week) || 0;
      const lastWeek = parseInt(trends.last_week) || 0;

      // Top patterns with examples
      const patternsQuery = `
        SELECT
          category,
          COUNT(*) as occurrences,
          AVG(severity) as avg_severity,
          ARRAY_AGG(DISTINCT user_quote) FILTER (WHERE user_quote IS NOT NULL) as example_quotes,
          ARRAY_AGG(DISTINCT context_note) FILTER (WHERE context_note IS NOT NULL) as common_triggers
        FROM maia_misattunements
        WHERE created_at >= NOW() - INTERVAL '${daysBack} days'
        GROUP BY category
        HAVING COUNT(*) >= 2
        ORDER BY COUNT(*) DESC, AVG(severity) DESC
        LIMIT 5
      `;

      const patternsResult = await pool.query(patternsQuery);
      const topPatterns: MisattunementPattern[] = patternsResult.rows.map(row => ({
        category: row.category,
        occurrences: parseInt(row.occurrences),
        avgSeverity: parseFloat(row.avg_severity),
        commonTriggers: (row.common_triggers || []).slice(0, 3),
        recentTrend: 'stable' as const, // Would need more complex analysis for trends
        exampleQuotes: (row.example_quotes || []).slice(0, 3)
      }));

      // Urgent items needing attention
      const urgentQuery = `
        SELECT *
        FROM maia_misattunements
        WHERE (severity >= 4 OR pattern_identified = true)
          AND addressed_in_gold IS NULL
          AND created_at >= NOW() - INTERVAL '7 days'
        ORDER BY severity DESC, created_at DESC
        LIMIT 5
      `;

      const urgentResult = await pool.query(urgentQuery);
      const needsImmedateAttention: Misattunement[] = urgentResult.rows.map(row => ({
        id: row.id,
        turnId: row.turn_id,
        category: row.category,
        subcategory: row.subcategory,
        severity: row.severity,
        detectedBy: row.detected_by,
        detectionMethod: row.detection_method,
        userQuote: row.user_quote,
        maiaProblematicText: row.maia_problematic_text,
        contextNote: row.context_note,
        internalNote: row.internal_note,
        patternIdentified: row.pattern_identified,
        addressedInGold: row.addressed_in_gold,
        createdAt: row.created_at
      }));

      return {
        totalRuptures: parseInt(summary.total_ruptures) || 0,
        severityBreakdown: {
          1: parseInt(summary.severity_1) || 0,
          2: parseInt(summary.severity_2) || 0,
          3: parseInt(summary.severity_3) || 0,
          4: parseInt(summary.severity_4) || 0,
          5: parseInt(summary.severity_5) || 0
        },
        categoryBreakdown,
        detectionSources,
        trends: {
          thisWeek,
          lastWeek,
          change: thisWeek - lastWeek
        },
        topPatterns,
        needsImmedateAttention
      };
    } catch (error) {
      console.error('❌ Failed to get rupture analysis:', error);
      return {
        totalRuptures: 0,
        severityBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        categoryBreakdown: {},
        detectionSources: {},
        trends: { thisWeek: 0, lastWeek: 0, change: 0 },
        topPatterns: [],
        needsImmedateAttention: []
      };
    }
  }

  /**
   * Get misattunements that need gold response creation
   */
  static async getMisattunementsNeedingGoldResponses(limit: number = 10): Promise<Misattunement[]> {
    try {
      const query = `
        SELECT *
        FROM maia_misattunements
        WHERE addressed_in_gold IS NULL
          AND (severity >= 3 OR pattern_identified = true)
        ORDER BY severity DESC, pattern_identified DESC, created_at DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);

      return result.rows.map(row => ({
        id: row.id,
        turnId: row.turn_id,
        category: row.category,
        subcategory: row.subcategory,
        severity: row.severity,
        detectedBy: row.detected_by,
        detectionMethod: row.detection_method,
        userQuote: row.user_quote,
        maiaProblematicText: row.maia_problematic_text,
        contextNote: row.context_note,
        internalNote: row.internal_note,
        patternIdentified: row.pattern_identified,
        addressedInGold: row.addressed_in_gold,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('❌ Failed to get misattunements needing gold responses:', error);
      return [];
    }
  }

  /**
   * Generate learning insights from misattunement patterns
   */
  static async generateLearningInsights(daysBack: number = 14): Promise<{
    criticalPatterns: string[];
    improvementAreas: string[];
    successIndicators: string[];
    recommendations: string[];
  }> {
    try {
      const analysis = await this.getRuptureAnalysis(daysBack);

      const criticalPatterns: string[] = [];
      const improvementAreas: string[] = [];
      const successIndicators: string[] = [];
      const recommendations: string[] = [];

      // Identify critical patterns
      for (const pattern of analysis.topPatterns) {
        if (pattern.occurrences >= 5 && pattern.avgSeverity >= 3) {
          criticalPatterns.push(`${pattern.category}: ${pattern.occurrences} occurrences, avg severity ${pattern.avgSeverity.toFixed(1)}`);
        }
      }

      // Improvement areas based on trends
      if (analysis.trends.change > 0) {
        improvementAreas.push(`Misattunements increased by ${analysis.trends.change} this week`);
      }

      // Success indicators
      if (analysis.trends.change < 0) {
        successIndicators.push(`Misattunements decreased by ${Math.abs(analysis.trends.change)} this week`);
      }

      const highSeverityCount = analysis.severityBreakdown[4] + analysis.severityBreakdown[5];
      if (highSeverityCount === 0) {
        successIndicators.push('No severe ruptures (4-5 severity) in recent period');
      }

      // Generate recommendations
      if (analysis.topPatterns.length > 0) {
        const topCategory = analysis.topPatterns[0].category;
        recommendations.push(`Focus gold response creation on ${topCategory} misattunements`);
      }

      if (analysis.needsImmedateAttention.length > 0) {
        recommendations.push(`${analysis.needsImmedateAttention.length} misattunements need immediate gold response creation`);
      }

      return {
        criticalPatterns,
        improvementAreas,
        successIndicators,
        recommendations
      };
    } catch (error) {
      console.error('❌ Failed to generate learning insights:', error);
      return {
        criticalPatterns: [],
        improvementAreas: [],
        successIndicators: [],
        recommendations: []
      };
    }
  }
}

export default MisattunementTrackingService;