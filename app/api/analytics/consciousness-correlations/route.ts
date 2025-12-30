// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { betaSession } from '@/lib/auth/betaSession';
import { DreamConsciousnessCorrelationEngine, CorrelationTimeWindow } from '@/lib/analytics/DreamConsciousnessCorrelationEngine';

const prisma = new PrismaClient();
const correlationEngine = new DreamConsciousnessCorrelationEngine();

// Initialize the engine on startup
correlationEngine.initialize().catch(console.error);

/**
 * DREAM-SLEEP-CONSCIOUSNESS CORRELATION ANALYTICS API
 *
 * Provides comprehensive correlation analysis across:
 * - Dreams and archetypal patterns
 * - Sleep quality and circadian rhythms
 * - Real-time conversation insights
 * - Wisdom emergence tracking
 *
 * Routes:
 * POST /api/analytics/consciousness-correlations - Generate new correlation analysis
 * GET  /api/analytics/consciousness-correlations - Retrieve historical analyses
 */

// Generate new correlation analysis
export async function POST(request: NextRequest) {
  try {
    const user = betaSession.getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      timeWindow,
      windowType = 'weekly',
      forceRegeneration = false
    } = body;

    console.log(`🔮 Starting correlation analysis for user ${user.id}`);

    // Determine time window
    let analysisWindow: CorrelationTimeWindow;

    if (timeWindow) {
      analysisWindow = {
        start: new Date(timeWindow.start),
        end: new Date(timeWindow.end),
        windowType: timeWindow.windowType || windowType
      };
    } else {
      // Default to last week
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);

      analysisWindow = {
        start,
        end,
        windowType: 'weekly'
      };
    }

    // Check if recent analysis exists (unless forcing regeneration)
    if (!forceRegeneration) {
      const existingAnalysis = await prisma.correlationAnalysis.findFirst({
        where: {
          userId: user.id,
          timeWindowStart: analysisWindow.start,
          timeWindowEnd: analysisWindow.end,
          windowType: analysisWindow.windowType,
          // Analysis is recent (within last 6 hours)
          analysisTimestamp: {
            gte: new Date(Date.now() - 6 * 60 * 60 * 1000)
          }
        },
        orderBy: { analysisTimestamp: 'desc' }
      });

      if (existingAnalysis) {
        console.log(`📊 Returning existing correlation analysis from ${existingAnalysis.analysisTimestamp.toISOString()}`);
        return NextResponse.json({
          success: true,
          analysis: existingAnalysis,
          cached: true,
          message: 'Retrieved recent correlation analysis'
        });
      }
    }

    // Generate new correlation analysis
    const analysisResult = await correlationEngine.analyzeCorrelations(
      user.id,
      analysisWindow
    );

    console.log(`✨ Correlation analysis complete: ${analysisResult.dominantPatterns.length} dominant patterns identified`);

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      cached: false,
      message: 'Correlation analysis generated successfully',
      summary: {
        dominantPatterns: analysisResult.dominantPatterns.length,
        emergingPatterns: analysisResult.emergingPatterns.length,
        breakthroughProbability: analysisResult.breakthroughPrediction.probability,
        overallIntegration: analysisResult.integrationProgress.overall_consciousness_development,
        timeWindow: analysisWindow
      }
    });

  } catch (error) {
    console.error('Correlation analysis error:', error);
    return NextResponse.json(
      {
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Try with a shorter time window or check that you have sufficient dream and conversation data'
      },
      { status: 500 }
    );
  }
}

// Retrieve historical correlation analyses
export async function GET(request: NextRequest) {
  try {
    const user = betaSession.getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const windowType = searchParams.get('windowType'); // Filter by window type
    const minCorrelationStrength = parseFloat(searchParams.get('minCorrelationStrength') || '0');
    const includeSummaryOnly = searchParams.get('summaryOnly') === 'true';

    console.log(`📊 Retrieving correlation analyses for user ${user.id}`);

    // Build query filters
    const whereClause: any = {
      userId: user.id,
      overallCorrelationStrength: {
        gte: minCorrelationStrength
      }
    };

    if (windowType) {
      whereClause.windowType = windowType;
    }

    // Retrieve analyses
    const analyses = await prisma.correlationAnalysis.findMany({
      where: whereClause,
      orderBy: { analysisTimestamp: 'desc' },
      take: limit,
      skip: offset,
      select: includeSummaryOnly ? {
        id: true,
        timeWindowStart: true,
        timeWindowEnd: true,
        windowType: true,
        analysisTimestamp: true,
        overallCorrelationStrength: true,
        wisdomEmergenceRate: true,
        shadowIntegrationActivity: true,
        archetypalActivationScore: true,
        patternsIdentified: true,
        confidence: true,
        breakthroughPrediction: true,
        integrationProgress: true
      } : undefined
    });

    // Get total count for pagination
    const totalCount = await prisma.correlationAnalysis.count({
      where: whereClause
    });

    // Generate trend analysis if multiple analyses available
    let trendAnalysis = null;
    if (analyses.length >= 2) {
      trendAnalysis = generateTrendAnalysis(analyses);
    }

    // Calculate aggregate statistics
    const statistics = {
      totalAnalyses: totalCount,
      avgCorrelationStrength: analyses.reduce((sum, a) => sum + a.overallCorrelationStrength, 0) / analyses.length,
      avgWisdomEmergenceRate: analyses.reduce((sum, a) => sum + a.wisdomEmergenceRate, 0) / analyses.length,
      avgShadowIntegrationActivity: analyses.reduce((sum, a) => sum + a.shadowIntegrationActivity, 0) / analyses.length,
      avgArchetypalActivation: analyses.reduce((sum, a) => sum + a.archetypalActivationScore, 0) / analyses.length,
      timeRange: analyses.length > 0 ? {
        earliest: analyses[analyses.length - 1]?.timeWindowStart,
        latest: analyses[0]?.timeWindowEnd
      } : null
    };

    console.log(`📈 Retrieved ${analyses.length} correlation analyses (${totalCount} total)`);

    return NextResponse.json({
      success: true,
      analyses,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount
      },
      statistics,
      trendAnalysis,
      filters: {
        windowType,
        minCorrelationStrength,
        summaryOnly: includeSummaryOnly
      }
    });

  } catch (error) {
    console.error('Get correlation analyses error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve analyses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate specific analysis insights
export async function PUT(request: NextRequest) {
  try {
    const user = betaSession.getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { analysisId, insightType } = body;

    if (!analysisId || !insightType) {
      return NextResponse.json(
        { error: 'Analysis ID and insight type required' },
        { status: 400 }
      );
    }

    // Retrieve the analysis
    const analysis = await prisma.correlationAnalysis.findFirst({
      where: {
        id: analysisId,
        userId: user.id
      }
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Generate specific insights based on type
    let insight;
    switch (insightType) {
      case 'breakthrough_prediction':
        insight = await generateBreakthroughInsight(analysis);
        break;
      case 'therapeutic_recommendations':
        insight = await generateTherapeuticRecommendations(analysis);
        break;
      case 'pattern_evolution':
        insight = await generatePatternEvolution(user.id, analysis);
        break;
      case 'wisdom_trajectory':
        insight = await generateWisdomTrajectory(analysis);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid insight type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      insight,
      insightType,
      analysisId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Generate insight error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate insight',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function generateTrendAnalysis(analyses: any[]) {
  const trends = {
    correlationStrength: [],
    wisdomEmergence: [],
    shadowIntegration: [],
    archetypalActivation: [],
    overallTrend: 'stable'
  };

  for (let i = 0; i < analyses.length; i++) {
    const analysis = analyses[i];
    trends.correlationStrength.push({
      timestamp: analysis.analysisTimestamp,
      value: analysis.overallCorrelationStrength
    });
    trends.wisdomEmergence.push({
      timestamp: analysis.analysisTimestamp,
      value: analysis.wisdomEmergenceRate
    });
    trends.shadowIntegration.push({
      timestamp: analysis.analysisTimestamp,
      value: analysis.shadowIntegrationActivity
    });
    trends.archetypalActivation.push({
      timestamp: analysis.analysisTimestamp,
      value: analysis.archetypalActivationScore
    });
  }

  // Calculate overall trend direction
  if (analyses.length >= 3) {
    const recent = analyses.slice(0, 3);
    const recentAvg = recent.reduce((sum, a) => sum + a.overallCorrelationStrength, 0) / recent.length;
    const older = analyses.slice(-3);
    const olderAvg = older.reduce((sum, a) => sum + a.overallCorrelationStrength, 0) / older.length;

    if (recentAvg > olderAvg * 1.1) {
      trends.overallTrend = 'ascending';
    } else if (recentAvg < olderAvg * 0.9) {
      trends.overallTrend = 'declining';
    }
  }

  return trends;
}

async function generateBreakthroughInsight(analysis: any) {
  const breakthroupData = analysis.breakthroughPrediction;

  return {
    title: 'Breakthrough Probability Analysis',
    probability: breakthroupData.probability,
    timeframe: breakthroupData.timeframe,
    keyIndicators: breakthroupData.supporting_indicators,
    recommendations: breakthroupData.recommended_actions,
    risk_factors: [
      'Resistance to shadow work',
      'Inconsistent sleep patterns',
      'Avoiding difficult conversations with MAIA'
    ],
    optimal_conditions: [
      'Regular dream journaling',
      'Consistent sleep schedule',
      'Open exploration of archetypal themes'
    ]
  };
}

async function generateTherapeuticRecommendations(analysis: any) {
  const therapeutic = analysis.therapeuticInsights;
  const dominantPatterns = analysis.dominantPatterns;

  return {
    title: 'Personalized Therapeutic Recommendations',
    primary_focus: therapeutic.dreamwork_focus_areas.slice(0, 2),
    daily_practices: therapeutic.daily_practice_suggestions,
    conversation_optimization: therapeutic.conversation_timing_optimization,
    environmental_setup: therapeutic.sleep_environment_recommendations,
    integration_work: dominantPatterns.map((pattern: any) => ({
      pattern: pattern.name,
      exercises: pattern.recommendations.shadowWork || pattern.recommendations.dreamWork,
      timing: pattern.recommendations.conversationTiming
    }))
  };
}

async function generatePatternEvolution(userId: string, currentAnalysis: any) {
  // Get previous analyses to show evolution
  const previousAnalyses = await prisma.correlationAnalysis.findMany({
    where: {
      userId,
      analysisTimestamp: {
        lt: currentAnalysis.analysisTimestamp
      }
    },
    orderBy: { analysisTimestamp: 'desc' },
    take: 3
  });

  const evolution = {
    title: 'Consciousness Pattern Evolution',
    current_dominant: currentAnalysis.dominantPatterns.map((p: any) => p.name),
    pattern_progression: [],
    emerging_themes: currentAnalysis.emergingPatterns.map((p: any) => p.name),
    integration_trajectory: currentAnalysis.integrationProgress
  };

  if (previousAnalyses.length > 0) {
    evolution.pattern_progression = previousAnalyses.map(analysis => ({
      timestamp: analysis.analysisTimestamp,
      dominant_patterns: analysis.dominantPatterns.map((p: any) => p.name),
      correlation_strength: analysis.overallCorrelationStrength
    }));
  }

  return evolution;
}

async function generateWisdomTrajectory(analysis: any) {
  return {
    title: 'Wisdom Emergence Trajectory',
    current_rate: analysis.wisdomEmergenceRate,
    trajectory: analysis.integrationProgress.wisdom_embodiment_trajectory,
    key_factors: {
      dream_depth: analysis.dreamSleepCorrelations.quality_prediction_accuracy,
      conversation_coherence: analysis.conversationDreamBridges.wisdom_emergence_cross_correlation,
      circadian_alignment: analysis.circadianAlignment.wisdom_emergence_chronotype_alignment
    },
    next_phase_prediction: {
      probability: analysis.breakthroughPrediction.probability,
      timeframe: analysis.breakthroughPrediction.timeframe,
      indicators_to_watch: [
        'Increased symbolic richness in dreams',
        'More embodied language in conversations',
        'Stronger body activation during insights'
      ]
    }
  };
}

// Handle unsupported methods
export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed.' },
    { status: 405 }
  );
}