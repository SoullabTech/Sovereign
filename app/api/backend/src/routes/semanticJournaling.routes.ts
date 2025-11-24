/**
 * Semantic Journaling Routes - LlamaIndex-enhanced pattern analysis API
 * Deep journaling insights and archetypal pattern recognition
 */

import { Router, Request, Response } from 'express';
import { semanticJournalingService } from '../services/SemanticJournalingService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @route POST /api/semantic/analyze-patterns
 * @description Analyze user's journaling patterns using semantic AI
 */
router.post('/analyze-patterns', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const patterns = await semanticJournalingService.analyzeJournalingPatterns(userId);

    res.json({
      success: true,
      patterns: patterns.map(p => ({
        id: p.id,
        type: p.pattern_type,
        content: p.pattern_content,
        confidence: p.confidence_score,
        insights: p.insights,
        suggestions: p.suggested_explorations,
        memoriesInvolved: p.memories_involved.length,
        createdAt: p.created_at
      }))
    });

  } catch (error: any) {
    logger.error('Failed to analyze patterns:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Pattern analysis failed'
    });
  }
});

/**
 * @route GET /api/semantic/journey-insights/:userId
 * @description Generate predictive insights about user's spiritual journey
 */
router.get('/journey-insights/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const insights = await semanticJournalingService.generateJourneyInsights(userId);

    res.json({
      success: true,
      insights: insights.map(insight => ({
        id: insight.id,
        type: insight.insight_type,
        content: insight.insight_content,
        confidence: insight.confidence_level,
        suggestions: insight.actionable_suggestions,
        spiritualContext: insight.spiritual_context,
        supportingMemoriesCount: insight.supporting_memories.length,
        createdAt: insight.created_at
      }))
    });

  } catch (error: any) {
    logger.error('Failed to generate journey insights:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Journey insight generation failed'
    });
  }
});

/**
 * @route GET /api/semantic/archetypal-constellation/:userId
 * @description Map user's archetypal constellation
 */
router.get('/archetypal-constellation/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const constellation = await semanticJournalingService.mapArchetypalConstellation(userId);

    if (!constellation) {
      return res.json({
        success: true,
        constellation: null,
        message: 'Insufficient data for archetypal constellation mapping'
      });
    }

    res.json({
      success: true,
      constellation: {
        id: constellation.id,
        primaryArchetype: constellation.primary_archetype,
        secondaryArchetypes: constellation.secondary_archetypes,
        description: constellation.constellation_description,
        evolutionaryStage: constellation.evolutionary_stage,
        challenges: constellation.integration_challenges,
        opportunities: constellation.growth_opportunities,
        supportingMemoriesCount: constellation.supporting_memories.length,
        createdAt: constellation.created_at
      }
    });

  } catch (error: any) {
    logger.error('Failed to map archetypal constellation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Archetypal constellation mapping failed'
    });
  }
});

/**
 * @route POST /api/semantic/cross-session-analysis
 * @description Analyze themes and patterns across multiple sessions
 */
router.post('/cross-session-analysis', async (req: Request, res: Response) => {
  try {
    const { userId, sessionIds, timeRange } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Get patterns for comprehensive analysis
    const patterns = await semanticJournalingService.analyzeJournalingPatterns(userId);
    
    // Filter patterns by time range if provided
    let filteredPatterns = patterns;
    if (timeRange) {
      const startDate = new Date(timeRange.start);
      const endDate = new Date(timeRange.end);
      
      filteredPatterns = patterns.filter(p => {
        const createdDate = new Date(p.created_at);
        return createdDate >= startDate && createdDate <= endDate;
      });
    }

    // Analyze cross-session themes
    const crossSessionAnalysis = {
      totalPatterns: filteredPatterns.length,
      patternsByType: filteredPatterns.reduce((acc, p) => {
        acc[p.pattern_type] = (acc[p.pattern_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      highConfidencePatterns: filteredPatterns.filter(p => p.confidence_score > 0.8),
      emergingThemes: filteredPatterns
        .filter(p => p.pattern_type === 'recurring_theme')
        .sort((a, b) => b.confidence_score - a.confidence_score)
        .slice(0, 5),
      transformationProgression: filteredPatterns
        .filter(p => p.pattern_type === 'transformation_arc')
        .map(p => ({
          content: p.pattern_content,
          confidence: p.confidence_score,
          insights: p.insights
        }))
    };

    res.json({
      success: true,
      analysis: crossSessionAnalysis,
      timeRange: timeRange || 'all_time',
      analyzedPeriod: {
        start: filteredPatterns.length > 0 ? Math.min(...filteredPatterns.map(p => new Date(p.created_at).getTime())) : null,
        end: filteredPatterns.length > 0 ? Math.max(...filteredPatterns.map(p => new Date(p.created_at).getTime())) : null
      }
    });

  } catch (error: any) {
    logger.error('Failed to perform cross-session analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Cross-session analysis failed'
    });
  }
});

/**
 * @route POST /api/semantic/pattern-threading
 * @description Map how patterns thread through user's journey over time
 */
router.post('/pattern-threading', async (req: Request, res: Response) => {
  try {
    const { userId, patternType } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const allPatterns = await semanticJournalingService.analyzeJournalingPatterns(userId);
    
    let filteredPatterns = allPatterns;
    if (patternType) {
      filteredPatterns = allPatterns.filter(p => p.pattern_type === patternType);
    }

    // Sort by creation date to show threading over time
    const threadedPatterns = filteredPatterns
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(pattern => ({
        id: pattern.id,
        type: pattern.pattern_type,
        content: pattern.pattern_content,
        confidence: pattern.confidence_score,
        timestamp: pattern.created_at,
        insights: pattern.insights,
        memoryCount: pattern.memories_involved.length
      }));

    // Identify pattern evolution
    const evolution = {
      totalPatterns: threadedPatterns.length,
      timeSpan: threadedPatterns.length > 1 ? {
        start: threadedPatterns[0].timestamp,
        end: threadedPatterns[threadedPatterns.length - 1].timestamp
      } : null,
      confidenceProgression: threadedPatterns.map(p => p.confidence),
      averageConfidence: threadedPatterns.reduce((sum, p) => sum + p.confidence, 0) / threadedPatterns.length,
      evolutionTrends: identifyEvolutionTrends(threadedPatterns)
    };

    res.json({
      success: true,
      threading: {
        patterns: threadedPatterns,
        evolution,
        patternType: patternType || 'all_types'
      }
    });

  } catch (error: any) {
    logger.error('Failed to perform pattern threading:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Pattern threading failed'
    });
  }
});

/**
 * @route GET /api/semantic/pattern-predictions/:userId
 * @description Generate predictions about likely upcoming patterns or breakthroughs
 */
router.get('/pattern-predictions/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { lookAheadDays = 30 } = req.query;

    const insights = await semanticJournalingService.generateJourneyInsights(userId);
    const patterns = await semanticJournalingService.analyzeJournalingPatterns(userId);

    // Filter for predictive insights
    const predictions = insights.filter(i => 
      i.insight_type === 'breakthrough_prediction' || 
      i.insight_type === 'pattern_completion' ||
      i.insight_type === 'integration_opportunity'
    );

    // Analyze pattern momentum
    const recentPatterns = patterns.filter(p => {
      const daysSinceCreated = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated <= 14; // Last 2 weeks
    });

    const momentum = {
      recentPatternActivity: recentPatterns.length,
      averageConfidence: recentPatterns.reduce((sum, p) => sum + p.confidence_score, 0) / recentPatterns.length || 0,
      activePatternTypes: [...new Set(recentPatterns.map(p => p.pattern_type))],
      momentum: recentPatterns.length > 3 ? 'high' : recentPatterns.length > 1 ? 'moderate' : 'low'
    };

    res.json({
      success: true,
      predictions: predictions.map(p => ({
        type: p.insight_type,
        content: p.insight_content,
        confidence: p.confidence_level,
        suggestions: p.actionable_suggestions,
        timeframe: `Next ${lookAheadDays} days`
      })),
      momentum,
      lookAheadDays: parseInt(lookAheadDays as string)
    });

  } catch (error: any) {
    logger.error('Failed to generate pattern predictions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Pattern prediction failed'
    });
  }
});

/**
 * @route GET /api/semantic/health
 * @description Health check for semantic journaling service
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthStatus = {
      service: 'Semantic Journaling Service',
      status: 'healthy',
      features: [
        'LlamaIndex-Enhanced Pattern Recognition',
        'Archetypal Constellation Mapping',
        'Cross-Session Theme Threading',
        'Predictive Journey Insights',
        'Transformation Arc Analysis',
        'Shadow Integration Tracking'
      ],
      analysisTypes: [
        'recurring_theme',
        'archetypal_emergence', 
        'transformation_arc',
        'shadow_integration',
        'spiritual_progression'
      ],
      insightTypes: [
        'breakthrough_prediction',
        'pattern_completion',
        'integration_opportunity',
        'shadow_emergence',
        'spiritual_milestone'
      ],
      integrations: [
        'Soul Memory System',
        'Supabase Vector Storage',
        'Pattern Caching Layer'
      ],
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      ...healthStatus
    });

  } catch (error: any) {
    logger.error('Semantic service health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

// Helper function for evolution trend analysis
function identifyEvolutionTrends(patterns: any[]): string[] {
  const trends: string[] = [];
  
  if (patterns.length < 2) return trends;

  // Check confidence progression
  const confidences = patterns.map(p => p.confidence);
  const avgFirst = confidences.slice(0, Math.ceil(confidences.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(confidences.length / 2);
  const avgLast = confidences.slice(Math.floor(confidences.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(confidences.length / 2);
  
  if (avgLast > avgFirst + 0.1) {
    trends.push('Increasing pattern confidence over time');
  } else if (avgFirst > avgLast + 0.1) {
    trends.push('Decreasing pattern confidence - possible integration phase');
  }

  // Check pattern frequency
  if (patterns.length > 5) {
    trends.push('High pattern activity - intensive growth period');
  } else if (patterns.length > 2) {
    trends.push('Moderate pattern development');
  }

  return trends;
}

export default router;