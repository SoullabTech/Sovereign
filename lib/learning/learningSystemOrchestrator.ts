// backend: lib/learning/learningSystemOrchestrator.ts
// MAIA Sovereign Learning System Orchestrator
// The "nervous system" that coordinates all four learning loops

import ConversationTurnService from './conversationTurnService';
import InteractionFeedbackService from './interactionFeedbackService';
import GoldResponseService from './goldResponseService';
import EngineComparisonService from './engineComparisonService';
import MisattunementTrackingService from './misattunementTrackingService';
import { ImprovementHypothesisGenerator, ImprovementHypothesis } from './ImprovementHypothesisGenerator';
import { GoldResponseService as GRS } from './goldResponseService';
import {
  getUserCognitiveProgression,
  getAverageCognitiveLevel
} from '../consciousness/cognitiveEventsService';

export interface LearningSummary {
  systemHealth: {
    isHealthy: boolean;
    recentTurns: number;
    recentFeedback: number;
    goldResponsesCount: number;
    pendingReviews: number;
    lastDreamtime?: Date;
  };
  loopA: {
    feedbackRate: number;
    averageAttunement: number;
    repairRate: number;
    commonEmotions: string[];
  };
  loopB: {
    goldResponsesThisWeek: number;
    approvalRate: number;
    topImprovementTypes: string[];
    pendingApprovals: number;
  };
  loopC: {
    engineCount: number;
    comparisonsThisWeek: number;
    reviewProgress: number;
    bestPerformingEngine: string;
  };
  loopD: {
    rupturesThisWeek: number;
    criticalPatterns: string[];
    needsAttention: number;
    reparSuccessRate: number;
  };
}

export interface DreamtimeOperationResult {
  operationId: number;
  turnsProcessed: number;
  goldResponsesCreated: number;
  comparisonsReviewed: number;
  hypothesesGenerated: number;
  patternsIdentified: string[];
  recommendations: string[];
  duration: number;
  success: boolean;
  errors: string[];
}

export interface LearningRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'rupture' | 'pattern' | 'engine' | 'system';
  title: string;
  description: string;
  actionItems: string[];
  affectedLoops: ('A' | 'B' | 'C' | 'D')[];
}

/**
 * MAIA Learning System Orchestrator
 *
 * This is MAIA's "learning nervous system" that coordinates the four learning loops:
 * - Loop A: In-the-moment micro-learning (real-time feedback)
 * - Loop B: Nightly "dreaming" (gold response processing)
 * - Loop C: Multi-engine constellation (shadow comparisons)
 * - Loop D: Human supervision (rupture tracking)
 *
 * The orchestrator provides:
 * - Unified learning analytics
 * - Automated dreamtime processing
 * - Pattern recognition across loops
 * - System health monitoring
 * - Learning recommendations
 */
export class LearningSystemOrchestrator {

  /**
   * FULL LEARNING INTEGRATION
   * This is called after each MAIA conversation turn to integrate all learning loops
   */
  static async integrateLearningFromTurn(data: {
    turnId: number;
    sessionId: string;
    userInput: string;
    maiaResponse: string;
    processingProfile: 'FAST' | 'CORE' | 'DEEP';
    primaryEngine: string;
    responseTimeMs: number;
    claudeConsultationUsed: boolean;
    consultationType?: string;
    consultationData?: any;
    shadowResponses?: Array<{
      engineName: string;
      responseText: string;
      responseTimeMs?: number;
    }>;
  }): Promise<void> {
    const { turnId, shadowResponses, claudeConsultationUsed, consultationData } = data;

    try {
      // LOOP C: Log shadow engine responses for comparison
      if (shadowResponses && shadowResponses.length > 0) {
        await EngineComparisonService.logShadowResponses(
          turnId,
          shadowResponses,
          data.processingProfile
        );
        console.log(`🔬 Loop C: Logged ${shadowResponses.length} shadow responses for turn ${turnId}`);
      }

      // LOOP B: Store Claude consultation as gold response if used
      if (claudeConsultationUsed && consultationData && consultationData.enhancementUsed) {
        await GoldResponseService.storeConsultationAsGold(
          turnId,
          data.maiaResponse,
          consultationData.enhancedResponse,
          {
            consultationType: consultationData.consultationType,
            attunementScore: consultationData.attunementScore,
            reasoning: consultationData.consultationReasoning
          }
        );
        console.log(`✨ Loop B: Claude consultation stored as gold response for turn ${turnId}`);
      }

      console.log(`🧠 Learning integration complete for turn ${turnId} | Claude: ${claudeConsultationUsed} | Shadows: ${shadowResponses?.length || 0}`);
    } catch (error) {
      console.error('❌ Failed to integrate learning from turn:', error);
    }
  }

  /**
   * FEEDBACK INTEGRATION
   * Called when user provides feedback (thumbs, emotional tags, repair requests)
   */
  static async integrateFeedback(data: {
    turnId: number;
    feedback: {
      helpfulnessScore?: -1 | 0 | 1;
      attunementScore?: 1 | 2 | 3 | 4 | 5;
      feltState?: string;
      emotionalTags?: string[];
      repairNeeded?: boolean;
      userNote?: string;
    };
    maiaResponse: string;
  }): Promise<void> {
    const { turnId, feedback, maiaResponse } = data;

    try {
      // LOOP A: Record interaction feedback
      await InteractionFeedbackService.recordFeedback({
        turnId,
        helpfulnessScore: feedback.helpfulnessScore,
        attunementScore: feedback.attunementScore,
        feltState: feedback.feltState,
        repairNeeded: feedback.repairNeeded,
        freeformNote: feedback.userNote,
        emotionalTags: feedback.emotionalTags
      });
      console.log(`💝 Loop A: Feedback recorded for turn ${turnId}`);

      // LOOP D: Log misattunement if repair needed or negative feedback
      if (feedback.repairNeeded || feedback.helpfulnessScore === -1) {
        const userQuote = feedback.userNote || `Felt ${feedback.feltState}, repair needed: ${feedback.repairNeeded}`;
        const severity = feedback.repairNeeded ? 4 :
                        feedback.helpfulnessScore === -1 ? 3 : 2;

        await MisattunementTrackingService.logUserRupture(
          turnId,
          userQuote,
          maiaResponse,
          severity as any
        );
        console.log(`🚨 Loop D: Rupture logged for turn ${turnId} | Severity: ${severity}/5`);
      }

      // LOOP B: Promote excellent responses to gold corpus
      if (feedback.helpfulnessScore === 1 && feedback.attunementScore && feedback.attunementScore >= 4) {
        await GoldResponseService.promoteToGold(turnId, maiaResponse, {
          helpfulnessScore: feedback.helpfulnessScore,
          attunementScore: feedback.attunementScore,
          feltState: feedback.feltState,
          emotionalTags: feedback.emotionalTags
        });
        console.log(`🌟 Loop B: Excellent response promoted to gold corpus for turn ${turnId}`);
      }

    } catch (error) {
      console.error('❌ Failed to integrate feedback:', error);
    }
  }

  /**
   * UNIFIED LEARNING ANALYTICS
   * Get comprehensive view of all learning loops
   */
  static async getLearningAnalytics(): Promise<LearningSummary> {
    try {
      // System health check
      const systemHealth = await ConversationTurnService.checkLearningSystemHealth();

      // Loop A analytics
      const loopAData = await InteractionFeedbackService.getRecentFeedbackPatterns(24 * 7); // Last week

      // Loop B analytics
      const goldStats = await GoldResponseService.getGoldResponseStats();

      // Loop C analytics
      const comparisonAnalytics = await EngineComparisonService.getComparisonAnalytics(7);
      const enginePerformance = await EngineComparisonService.getEnginePerformanceStats();
      const bestEngine = enginePerformance.length > 0 ? enginePerformance[0].engineName : 'none';

      // Loop D analytics
      const ruptureAnalysis = await MisattunementTrackingService.getRuptureAnalysis(7);

      return {
        systemHealth: {
          isHealthy: systemHealth.tablesExist && systemHealth.recentTurns > 0,
          recentTurns: systemHealth.recentTurns,
          recentFeedback: systemHealth.recentFeedback,
          goldResponsesCount: goldStats.totalGoldResponses,
          pendingReviews: comparisonAnalytics.reviewProgress.pending + goldStats.pendingApproval,
          lastDreamtime: undefined // Would track last dreamtime operation
        },
        loopA: {
          feedbackRate: loopAData.totalFeedback,
          averageAttunement: loopAData.averageAttunement,
          repairRate: loopAData.repairRate,
          commonEmotions: loopAData.commonEmotions
        },
        loopB: {
          goldResponsesThisWeek: goldStats.recentActivity.lastWeekCount,
          approvalRate: goldStats.totalGoldResponses > 0 ?
            (goldStats.approvedCount / goldStats.totalGoldResponses) * 100 : 0,
          topImprovementTypes: Object.keys(goldStats.byImprovementType).slice(0, 3),
          pendingApprovals: goldStats.pendingApproval
        },
        loopC: {
          engineCount: comparisonAnalytics.mostActiveEngines.length,
          comparisonsThisWeek: comparisonAnalytics.totalComparisons,
          reviewProgress: comparisonAnalytics.reviewProgress.percentage,
          bestPerformingEngine: bestEngine
        },
        loopD: {
          rupturesThisWeek: ruptureAnalysis.trends.thisWeek,
          criticalPatterns: ruptureAnalysis.topPatterns.map(p => p.category),
          needsAttention: ruptureAnalysis.needsImmedateAttention.length,
          reparSuccessRate: 0 // Would need to track repair attempts vs success
        }
      };
    } catch (error) {
      console.error('❌ Failed to get learning analytics:', error);
      // Return safe defaults
      return {
        systemHealth: { isHealthy: false, recentTurns: 0, recentFeedback: 0, goldResponsesCount: 0, pendingReviews: 0 },
        loopA: { feedbackRate: 0, averageAttunement: 0, repairRate: 0, commonEmotions: [] },
        loopB: { goldResponsesThisWeek: 0, approvalRate: 0, topImprovementTypes: [], pendingApprovals: 0 },
        loopC: { engineCount: 0, comparisonsThisWeek: 0, reviewProgress: 0, bestPerformingEngine: 'none' },
        loopD: { rupturesThisWeek: 0, criticalPatterns: [], needsAttention: 0, reparSuccessRate: 0 }
      };
    }
  }

  /**
   * DREAMTIME PROCESSING
   * Nightly batch job that processes learning candidates and generates insights
   */
  static async runDreamtimeProcessing(
    hoursBack: number = 24,
    maxCandidates: number = 100
  ): Promise<DreamtimeOperationResult> {
    const startTime = Date.now();
    const operationId = Math.floor(Math.random() * 1000000); // Would be from DB
    let turnsProcessed = 0;
    let goldResponsesCreated = 0;
    let comparisonsReviewed = 0;
    let hypothesesGenerated = 0;
    const patternsIdentified: string[] = [];
    const recommendations: string[] = [];
    const errors: string[] = [];

    try {
      console.log(`🌙 DREAMTIME PROCESSING START | Operation ${operationId} | Processing last ${hoursBack} hours`);

      // 1. Get learning candidates (high priority turns needing review)
      const candidates = await ConversationTurnService.getLearningCandidates(hoursBack, 5);
      console.log(`🔍 Found ${candidates.length} learning candidates`);

      // 2. Process misattunements needing gold responses
      const misattunements = await MisattunementTrackingService.getMisattunementsNeedingGoldResponses(10);
      for (const misattunement of misattunements) {
        try {
          // In a real system, this would generate gold responses using Claude
          // For now, we'll just mark the need
          recommendations.push(`Create gold response for ${misattunement.category} misattunement (Turn ${misattunement.turnId})`);
        } catch (error) {
          errors.push(`Failed to process misattunement ${misattunement.id}: ${error}`);
        }
      }

      // 3. Review engine comparisons
      const unreviewed = await EngineComparisonService.getUnreviewedComparisons(20);
      console.log(`📊 Found ${unreviewed.length} unreviewed engine comparisons`);

      for (const comparison of unreviewed) {
        try {
          // Auto-review based on user feedback
          if (comparison.feedbackSignal?.helpfulnessScore === 1) {
            // Mark primary as good, shadows as neutral for now
            // In real system, would use more sophisticated comparison
            recommendations.push(`Review comparison for turn ${comparison.turnId} - positive user feedback`);
            comparisonsReviewed++;
          }
        } catch (error) {
          errors.push(`Failed to review comparison for turn ${comparison.turnId}: ${error}`);
        }
      }

      // 4. Identify patterns across loops
      const learningInsights = await MisattunementTrackingService.generateLearningInsights(hoursBack);
      patternsIdentified.push(...learningInsights.criticalPatterns);
      recommendations.push(...learningInsights.recommendations);

      // 5. SELF-IMPROVEMENT LOOP: Generate improvement hypotheses
      // "MAIA proposes; Mentors approve; Production is human-signed."
      try {
        const hypothesisGenerator = new ImprovementHypothesisGenerator();
        const hypotheses = await hypothesisGenerator.generateHypotheses();
        hypothesesGenerated = hypotheses.length;

        if (hypotheses.length > 0) {
          console.log(`🧠 Loop E (Self-Improvement): Generated ${hypotheses.length} improvement hypotheses`);
          recommendations.push(`${hypotheses.length} improvement hypotheses generated - awaiting mentor review`);

          // Add critical hypotheses to patterns
          const criticalHypotheses = hypotheses.filter(h => h.priority === 'critical');
          for (const h of criticalHypotheses) {
            patternsIdentified.push(`CRITICAL: ${h.modification.target} - ${h.modification.rationale}`);
          }
        }
      } catch (error) {
        errors.push(`Hypothesis generation failed: ${error}`);
        console.error('❌ Failed to generate hypotheses:', error);
      }

      // 6. Generate learning recommendations
      const analytics = await this.getLearningAnalytics();

      if (analytics.loopD.needsAttention > 0) {
        recommendations.push(`URGENT: ${analytics.loopD.needsAttention} misattunements need immediate attention`);
      }

      if (analytics.loopB.pendingApprovals > 10) {
        recommendations.push(`Review ${analytics.loopB.pendingApprovals} pending gold response approvals`);
      }

      if (analytics.loopC.reviewProgress < 50) {
        recommendations.push(`Engine comparison review progress low: ${analytics.loopC.reviewProgress.toFixed(1)}%`);
      }

      turnsProcessed = candidates.length;
      const duration = Date.now() - startTime;

      console.log(`🌙 DREAMTIME PROCESSING COMPLETE | Duration: ${duration}ms | Turns: ${turnsProcessed} | Gold: ${goldResponsesCreated} | Comparisons: ${comparisonsReviewed} | Hypotheses: ${hypothesesGenerated} | Patterns: ${patternsIdentified.length}`);

      return {
        operationId,
        turnsProcessed,
        goldResponsesCreated,
        comparisonsReviewed,
        hypothesesGenerated,
        patternsIdentified,
        recommendations,
        duration,
        success: true,
        errors
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Dreamtime processing failed:', error);

      return {
        operationId,
        turnsProcessed,
        goldResponsesCreated,
        comparisonsReviewed,
        hypothesesGenerated,
        patternsIdentified,
        recommendations,
        duration,
        success: false,
        errors: [...errors, `Critical error: ${error}`]
      };
    }
  }

  /**
   * LEARNING RECOMMENDATIONS
   * Generate actionable recommendations based on current learning state
   */
  static async generateLearningRecommendations(): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];

    try {
      const analytics = await this.getLearningAnalytics();

      // Critical system health issues
      if (!analytics.systemHealth.isHealthy) {
        recommendations.push({
          priority: 'critical',
          type: 'system',
          title: 'Learning System Health Critical',
          description: 'Learning system tables missing or no recent activity detected',
          actionItems: [
            'Verify database schema is properly created',
            'Check conversation turn logging is working',
            'Verify learning integration in MAIA service'
          ],
          affectedLoops: ['A', 'B', 'C', 'D']
        });
      }

      // High rupture rate
      if (analytics.loopD.rupturesThisWeek > 10) {
        recommendations.push({
          priority: 'critical',
          type: 'rupture',
          title: 'High Rupture Rate Detected',
          description: `${analytics.loopD.rupturesThisWeek} ruptures this week - urgent attention needed`,
          actionItems: [
            'Review recent misattunements immediately',
            'Generate gold responses for top rupture patterns',
            'Consider increasing Claude consultation threshold'
          ],
          affectedLoops: ['D', 'B']
        });
      }

      // Pattern recognition
      if (analytics.loopD.criticalPatterns.length > 0) {
        recommendations.push({
          priority: 'high',
          type: 'pattern',
          title: 'Critical Misattunement Patterns Identified',
          description: `Recurring issues: ${analytics.loopD.criticalPatterns.join(', ')}`,
          actionItems: [
            'Create targeted gold responses for these patterns',
            'Review MAIA runtime prompts for these categories',
            'Consider additional consultation triggers'
          ],
          affectedLoops: ['D', 'B', 'A']
        });
      }

      // Low feedback rate
      if (analytics.loopA.feedbackRate < 10) {
        recommendations.push({
          priority: 'medium',
          type: 'system',
          title: 'Low User Feedback Rate',
          description: 'Users not providing enough feedback for learning',
          actionItems: [
            'Add more feedback prompts to UI',
            'Simplify feedback mechanisms',
            'Consider automated sentiment analysis'
          ],
          affectedLoops: ['A']
        });
      }

      // Engine optimization opportunities
      if (analytics.loopC.reviewProgress < 70) {
        recommendations.push({
          priority: 'medium',
          type: 'engine',
          title: 'Engine Comparison Reviews Lagging',
          description: `Only ${analytics.loopC.reviewProgress.toFixed(1)}% of comparisons reviewed`,
          actionItems: [
            'Run dreamtime processing more frequently',
            'Implement automated comparison scoring',
            'Review engine comparison criteria'
          ],
          affectedLoops: ['C']
        });
      }

      return recommendations.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    } catch (error) {
      console.error('❌ Failed to generate learning recommendations:', error);
      return [];
    }
  }

  /**
   * EXPORT TRAINING DATA
   * Export approved learning data for local model fine-tuning
   */
  static async exportTrainingData(format: 'jsonl' | 'csv' = 'jsonl'): Promise<{
    goldResponses: string[];
    engineComparisons: any[];
    metadata: {
      exportDate: Date;
      totalResponses: number;
      avgQuality: number;
      sourcesIncluded: string[];
    };
  }> {
    try {
      // Get approved gold responses
      const goldResponses = await GoldResponseService.exportTrainingData(3, 'chat');

      // Get engine performance data
      const engineStats = await EngineComparisonService.getEnginePerformanceStats();

      const goldStats = await GoldResponseService.getGoldResponseStats();

      return {
        goldResponses,
        engineComparisons: engineStats,
        metadata: {
          exportDate: new Date(),
          totalResponses: goldResponses.length,
          avgQuality: goldStats.averageTrainingPriority,
          sourcesIncluded: Object.keys(goldStats.bySource)
        }
      };
    } catch (error) {
      console.error('❌ Failed to export training data:', error);
      return {
        goldResponses: [],
        engineComparisons: [],
        metadata: {
          exportDate: new Date(),
          totalResponses: 0,
          avgQuality: 0,
          sourcesIncluded: []
        }
      };
    }
  }

  /**
   * LEARNING SYSTEM HEALTH CHECK
   * Quick verification that all learning loops are functioning
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    loops: {
      loopA: { status: string; lastActivity?: Date };
      loopB: { status: string; goldCount: number };
      loopC: { status: string; activeEngines: number };
      loopD: { status: string; recentRuptures: number };
    };
    recommendations: string[];
  }> {
    try {
      const analytics = await this.getLearningAnalytics();

      const loopA = {
        status: analytics.loopA.feedbackRate > 5 ? 'healthy' : 'degraded',
        lastActivity: undefined // Would track from recent feedback
      };

      const loopB = {
        status: analytics.loopB.goldResponsesThisWeek > 0 ? 'healthy' : 'degraded',
        goldCount: analytics.systemHealth.goldResponsesCount
      };

      const loopC = {
        status: analytics.loopC.engineCount > 1 ? 'healthy' : 'degraded',
        activeEngines: analytics.loopC.engineCount
      };

      const loopD = {
        status: analytics.loopD.needsAttention === 0 ? 'healthy' : 'critical',
        recentRuptures: analytics.loopD.rupturesThisWeek
      };

      const overallStatus =
        loopD.status === 'critical' ? 'critical' :
        [loopA.status, loopB.status, loopC.status].includes('degraded') ? 'degraded' :
        'healthy';

      const recommendations: any /* TODO: specify type */[] = [];
      if (loopA.status === 'degraded') recommendations.push('Increase user feedback collection');
      if (loopB.status === 'degraded') recommendations.push('Generate more gold responses');
      if (loopC.status === 'degraded') recommendations.push('Activate shadow engine comparisons');
      if (loopD.status === 'critical') recommendations.push('Address urgent misattunements immediately');

      return {
        status: overallStatus,
        loops: { loopA, loopB, loopC, loopD },
        recommendations
      };
    } catch (error) {
      console.error('❌ Learning system health check failed:', error);
      return {
        status: 'critical',
        loops: {
          loopA: { status: 'unknown' },
          loopB: { status: 'unknown', goldCount: 0 },
          loopC: { status: 'unknown', activeEngines: 0 },
          loopD: { status: 'unknown', recentRuptures: 0 }
        },
        recommendations: ['System health check failed - investigate learning system']
      };
    }
  }

  /**
   * 🧠 THE DIALECTICAL SCAFFOLD - COGNITIVE PROGRESSION ANALYTICS
   * Get user's cognitive development trajectory (Bloom's Taxonomy levels over time)
   *
   * Phase 1 Foundation: Basic retrieval for dashboards and quality gates
   * Future: Pattern recognition, bypassing detection, Community Commons eligibility
   */
  static async getCognitiveProgression(
    userId: string,
    options: {
      limit?: number;
      includeAverage?: boolean;
      includeBypassingPatterns?: boolean;
    } = {}
  ): Promise<{
    recentLevels: Array<{
      level: number;
      label: string;
      score: number;
      timestamp: Date;
    }> | null;
    averageLevel?: number | null;
    bypassingPatterns?: {
      spiritual: number;
      intellectual: number;
    };
  }> {
    try {
      const limit = options.limit || 20;

      // Retrieve recent cognitive progression
      const progression = await getUserCognitiveProgression(userId, limit);

      if (!progression || progression.length === 0) {
        return {
          recentLevels: null,
          averageLevel: options.includeAverage ? null : undefined,
          bypassingPatterns: options.includeBypassingPatterns ? { spiritual: 0, intellectual: 0 } : undefined,
        };
      }

      // Transform to timeline format
      const recentLevels = progression.map(turn => ({
        level: turn.numericLevel ?? turn.level,
        label: turn.label,
        score: turn.score,
        timestamp: new Date(), // Would be from created_at in DB
      }));

      // Calculate average cognitive level if requested
      let averageLevel: number | null | undefined = undefined;
      if (options.includeAverage) {
        averageLevel = await getAverageCognitiveLevel(userId, limit);
      }

      // Analyze bypassing patterns if requested
      let bypassingPatterns: { spiritual: number; intellectual: number } | undefined = undefined;
      if (options.includeBypassingPatterns && progression.length > 0) {
        const spiritualBypassing = progression.filter(t => t.bypassing?.spiritual).length;
        const intellectualBypassing = progression.filter(t => t.bypassing?.intellectual).length;

        bypassingPatterns = {
          spiritual: spiritualBypassing,
          intellectual: intellectualBypassing,
        };
      }

      console.log(`🧠 [Dialectical Scaffold] Cognitive progression retrieved for user ${userId.slice(0, 8)}: ${recentLevels.length} turns, avg ${averageLevel?.toFixed(2) || 'N/A'}`);

      return {
        recentLevels,
        averageLevel,
        bypassingPatterns,
      };
    } catch (error) {
      console.error('❌ Failed to retrieve cognitive progression:', error);
      return {
        recentLevels: null,
        averageLevel: options.includeAverage ? null : undefined,
        bypassingPatterns: options.includeBypassingPatterns ? { spiritual: 0, intellectual: 0 } : undefined,
      };
    }
  }

  /**
   * 🧠 COMMUNITY COMMONS QUALITY GATE
   * Check if user qualifies for Community Commons contribution based on cognitive level
   *
   * Requirement: Average Level 4+ (ANALYZE) over last 20 turns
   * Prevents: Level 1-2 regurgitation, Level 3 purely personal experience
   * Welcomes: Pattern recognition, original insights, embodied wisdom
   */
  static async checkCommunityCommonsEligibility(userId: string): Promise<{
    eligible: boolean;
    averageLevel: number | null;
    minimumRequired: number;
    reasoning: string;
  }> {
    try {
      const MINIMUM_LEVEL = 4.0; // Level 4: ANALYZE (pattern recognition minimum)
      const EVALUATION_WINDOW = 20; // Last 20 conversation turns

      const averageLevel = await getAverageCognitiveLevel(userId, EVALUATION_WINDOW);

      if (averageLevel === null) {
        return {
          eligible: false,
          averageLevel: null,
          minimumRequired: MINIMUM_LEVEL,
          reasoning: 'Insufficient conversation history (need at least 20 turns with cognitive tracking)',
        };
      }

      const eligible = averageLevel >= MINIMUM_LEVEL;

      const reasoning = eligible
        ? `Average cognitive level ${averageLevel.toFixed(2)} meets Level 4+ requirement. User demonstrates pattern recognition and structural thinking.`
        : `Average cognitive level ${averageLevel.toFixed(2)} below Level 4 requirement. Continue personal development before contributing to Community Commons.`;

      console.log(`🧠 [Community Commons] Eligibility check for ${userId.slice(0, 8)}: ${eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'} (${averageLevel.toFixed(2)} avg)`);

      return {
        eligible,
        averageLevel,
        minimumRequired: MINIMUM_LEVEL,
        reasoning,
      };
    } catch (error) {
      console.error('❌ Failed to check Community Commons eligibility:', error);
      return {
        eligible: false,
        averageLevel: null,
        minimumRequired: 4.0,
        reasoning: 'Error checking eligibility - please try again',
      };
    }
  }
}

export default LearningSystemOrchestrator;