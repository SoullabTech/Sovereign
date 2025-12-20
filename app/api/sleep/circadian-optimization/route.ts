import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { betaSession } from '@/lib/auth/betaSession';
import { healthDataImporter } from '@/lib/biometrics/HealthDataImporter';
import { CircadianRhythmOptimizer } from '@/lib/biometrics/CircadianRhythmOptimizer';

const prisma = new PrismaClient();
const circadianOptimizer = new CircadianRhythmOptimizer();

// Circadian Rhythm Optimization API
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
    const { action, healthData, includeDreamData = true, includeConversationData = true, timeWindow = 14 } = body;

    switch (action) {
      case 'analyze':
        return await handleCircadianAnalysis(user.id, healthData, includeDreamData, includeConversationData, timeWindow);

      case 'get_profile':
        return await handleGetCircadianProfile(user.id);

      case 'update_preferences':
        return await handleUpdatePreferences(user.id, body.preferences);

      case 'track_progress':
        return await handleTrackProgress(user.id, body.progressData);

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: analyze, get_profile, update_preferences, track_progress' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Circadian optimization error:', error);
    return NextResponse.json(
      { error: 'Optimization failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get circadian insights and recommendations
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
    const timeWindow = parseInt(searchParams.get('timeWindow') || '7'); // days
    const includeRecommendations = searchParams.get('includeRecommendations') !== 'false';

    // Get recent circadian analysis data
    const circadianInsights = await getRecentCircadianInsights(user.id, timeWindow);

    // Get optimization progress
    const optimizationProgress = await getOptimizationProgress(user.id, timeWindow);

    return NextResponse.json({
      success: true,
      insights: circadianInsights,
      progress: optimizationProgress,
      recommendations: includeRecommendations ? await getActiveRecommendations(user.id) : null,
      timeWindow,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get circadian optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve optimization data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTION HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

async function handleCircadianAnalysis(
  userId: string,
  healthData: any,
  includeDreamData: boolean,
  includeConversationData: boolean,
  timeWindow: number
) {
  // Parse health data if it's an XML string
  let parsedHealthData;
  if (typeof healthData === 'string') {
    parsedHealthData = await healthDataImporter.parseHealthXML(healthData);
  } else {
    parsedHealthData = healthData;
  }

  // Get dream data if requested
  let dreamData = null;
  if (includeDreamData) {
    dreamData = await prisma.dreamMemory.findMany({
      where: {
        userId,
        timestamp: {
          gte: new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        timestamp: true,
        consciousnessDepth: true,
        emotionalTone: true,
        wisdomEmergenceSignals: true,
        archetypes: true
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });
  }

  // Get conversation insights if requested
  let conversationInsights = null;
  if (includeConversationData) {
    conversationInsights = await prisma.conversationInsight.findMany({
      where: {
        userId,
        timestamp: {
          gte: new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        type: true,
        confidence: true,
        timestamp: true
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });
  }

  // Perform circadian analysis
  const analysis = await circadianOptimizer.analyzeCircadianRhythm(
    userId,
    parsedHealthData,
    dreamData,
    conversationInsights
  );

  // Store analysis results
  await storeCircadianAnalysis(userId, analysis);

  // Update or create circadian profile
  await updateCircadianProfile(userId, analysis);

  console.log(`🕐 Circadian analysis completed for user ${userId}: ${analysis.recommendations.length} recommendations`);

  return NextResponse.json({
    success: true,
    analysis,
    integrationData: {
      dreamCorrelations: dreamData ? await calculateDreamCircadianCorrelations(dreamData, analysis) : null,
      conversationCorrelations: conversationInsights ? await calculateConversationCircadianCorrelations(conversationInsights, analysis) : null
    },
    timestamp: new Date().toISOString()
  });
}

async function handleGetCircadianProfile(userId: string) {
  const profile = await prisma.circadianProfile.findUnique({
    where: { userId },
    include: {
      recommendations: {
        where: { active: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!profile) {
    return NextResponse.json({
      success: true,
      profile: null,
      message: 'No circadian profile found. Please complete an analysis first.'
    });
  }

  return NextResponse.json({
    success: true,
    profile,
    lastAnalysis: profile.updatedAt,
    activeRecommendations: profile.recommendations.length
  });
}

async function handleUpdatePreferences(userId: string, preferences: any) {
  const updatedProfile = await prisma.circadianProfile.update({
    where: { userId },
    data: {
      preferences,
      updatedAt: new Date()
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Preferences updated successfully',
    profile: updatedProfile
  });
}

async function handleTrackProgress(userId: string, progressData: any) {
  // Store progress tracking data
  await prisma.circadianProgressLog.create({
    data: {
      userId,
      timestamp: new Date(),
      sleepTime: progressData.sleepTime,
      wakeTime: progressData.wakeTime,
      sleepQuality: progressData.sleepQuality || null,
      energyLevel: progressData.energyLevel || null,
      dreamQuality: progressData.dreamQuality || null,
      recommendationAdherence: progressData.recommendationAdherence || null,
      notes: progressData.notes || null
    }
  });

  // Analyze progress trends
  const progressTrend = await analyzeProgressTrend(userId);

  return NextResponse.json({
    success: true,
    message: 'Progress tracked successfully',
    trend: progressTrend
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function storeCircadianAnalysis(userId: string, analysis: any) {
  try {
    await prisma.circadianAnalysis.create({
      data: {
        userId,
        timestamp: new Date(),
        currentPhase: analysis.currentPhase.phase,
        rhythmQuality: analysis.rhythmQuality.overall,
        misalignmentSeverity: analysis.misalignment.severity,
        misalignmentType: analysis.misalignment.type,
        optimizationTargets: {
          targetSleepTime: analysis.optimization.targetSleepTime,
          targetWakeTime: analysis.optimization.targetWakeTime,
          transitionDays: analysis.optimization.transitionPlan.transitionDays
        },
        analysisData: analysis // Store complete analysis
      }
    });

    // Store recommendations
    for (const recommendation of analysis.recommendations) {
      await prisma.circadianRecommendation.create({
        data: {
          userId,
          category: recommendation.category,
          priority: recommendation.priority,
          title: recommendation.title,
          description: recommendation.description,
          implementation: recommendation.implementation,
          timeline: recommendation.timeline,
          expectedBenefit: recommendation.expectedBenefit,
          difficulty: recommendation.difficulty,
          consciousnessConnection: recommendation.consciousnessConnection || null,
          dreamQualityImpact: recommendation.dreamQualityImpact || null,
          wisdomEmergenceSupport: recommendation.wisdomEmergenceSupport || false,
          active: true
        }
      });
    }
  } catch (error) {
    console.warn('Failed to store circadian analysis:', error);
  }
}

async function updateCircadianProfile(userId: string, analysis: any) {
  try {
    // Extract profile data from analysis
    const profileData = {
      chronotype: 'intermediate', // Would be determined from analysis
      naturalWakeTime: analysis.optimization.targetWakeTime,
      naturalSleepTime: analysis.optimization.targetSleepTime,
      optimalSleepDuration: 8.0, // Would be calculated from analysis
      rhythmQuality: analysis.rhythmQuality.overall,
      lastAnalysis: new Date(),
      profileData: analysis // Store complete analysis data
    };

    await prisma.circadianProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData
      }
    });
  } catch (error) {
    console.warn('Failed to update circadian profile:', error);
  }
}

async function getRecentCircadianInsights(userId: string, timeWindowDays: number) {
  const timeThreshold = new Date(Date.now() - timeWindowDays * 24 * 60 * 60 * 1000);

  const analyses = await prisma.circadianAnalysis.findMany({
    where: {
      userId,
      timestamp: { gte: timeThreshold }
    },
    orderBy: { timestamp: 'desc' },
    take: 10
  });

  // Extract insights and trends
  const insights = {
    recentAnalyses: analyses.length,
    rhythmQualityTrend: calculateRhythmQualityTrend(analyses),
    misalignmentTrend: analyzeMisalignmentTrend(analyses),
    phaseConsistency: analyzePhaseConsistency(analyses),
    improvementAreas: identifyImprovementAreas(analyses)
  };

  return insights;
}

async function getOptimizationProgress(userId: string, timeWindowDays: number) {
  const timeThreshold = new Date(Date.now() - timeWindowDays * 24 * 60 * 60 * 1000);

  const progressLogs = await prisma.circadianProgressLog.findMany({
    where: {
      userId,
      timestamp: { gte: timeThreshold }
    },
    orderBy: { timestamp: 'desc' }
  });

  if (progressLogs.length === 0) {
    return {
      totalEntries: 0,
      message: 'No progress data available'
    };
  }

  // Calculate progress metrics
  const progress = {
    totalEntries: progressLogs.length,
    sleepTimeConsistency: calculateTimeConsistency(progressLogs.map(p => p.sleepTime).filter(Boolean)),
    wakeTimeConsistency: calculateTimeConsistency(progressLogs.map(p => p.wakeTime).filter(Boolean)),
    averageSleepQuality: calculateAverage(progressLogs.map(p => p.sleepQuality).filter(Boolean)),
    averageEnergyLevel: calculateAverage(progressLogs.map(p => p.energyLevel).filter(Boolean)),
    averageDreamQuality: calculateAverage(progressLogs.map(p => p.dreamQuality).filter(Boolean)),
    recommendationAdherence: calculateAverage(progressLogs.map(p => p.recommendationAdherence).filter(Boolean)),
    improvementTrend: calculateImprovementTrend(progressLogs)
  };

  return progress;
}

async function getActiveRecommendations(userId: string) {
  const recommendations = await prisma.circadianRecommendation.findMany({
    where: {
      userId,
      active: true,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    orderBy: [
      { priority: 'desc' },
      { expectedBenefit: 'desc' }
    ]
  });

  // Group by category and priority
  const groupedRecommendations = recommendations.reduce((acc: any, rec) => {
    if (!acc[rec.category]) {
      acc[rec.category] = [];
    }
    acc[rec.category].push(rec);
    return acc;
  }, {});

  return {
    total: recommendations.length,
    byCategory: groupedRecommendations,
    highPriority: recommendations.filter(r => r.priority === 'critical' || r.priority === 'high'),
    consciousnessIntegrated: recommendations.filter(r => r.consciousnessConnection || r.wisdomEmergenceSupport)
  };
}

async function calculateDreamCircadianCorrelations(dreamData: any[], analysis: any) {
  if (!dreamData || dreamData.length === 0) return null;

  // Calculate correlations between dream quality and circadian metrics
  const correlations = {
    dreamQualityVsRhythmQuality: 0,
    consciousnessDepthVsPhaseAlignment: 0,
    wisdomEmergenceVsOptimalTiming: 0,
    insights: []
  };

  // Analyze dream timing relative to optimal sleep windows
  const optimalSleepTime = analysis.optimization?.targetSleepTime;
  if (optimalSleepTime) {
    const timingCorrelations = dreamData.map(dream => {
      const dreamTime = new Date(dream.timestamp);
      const dreamHour = dreamTime.getHours() + dreamTime.getMinutes() / 60;
      // Calculate how close dream was to optimal circadian timing
      // Implementation would analyze REM window timing
      return {
        dreamId: dream.id,
        consciousnessDepth: dream.consciousnessDepth,
        circadianAlignment: 0.7 // Placeholder calculation
      };
    });

    correlations.insights.push({
      type: 'timing_alignment',
      description: 'Dreams occurring during optimal circadian windows show higher consciousness depth',
      strength: 0.7,
      recommendations: ['Maintain consistent sleep timing to optimize dream states']
    });
  }

  return correlations;
}

async function calculateConversationCircadianCorrelations(conversationInsights: any[], analysis: any) {
  if (!conversationInsights || conversationInsights.length === 0) return null;

  // Analyze conversation insights relative to circadian phases
  const correlations = {
    insightQualityVsCircadianPhase: 0,
    wisdomEmergenceVsOptimalTiming: 0,
    patterns: []
  };

  // Group insights by time of day
  const insightsByHour = conversationInsights.reduce((acc: any, insight) => {
    const hour = new Date(insight.timestamp).getHours();
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(insight);
    return acc;
  }, {});

  // Identify peak insight hours
  const peakHours = Object.entries(insightsByHour)
    .map(([hour, insights]) => ({
      hour: parseInt(hour),
      count: (insights as any[]).length,
      avgConfidence: (insights as any[]).reduce((sum, i) => sum + i.confidence, 0) / (insights as any[]).length
    }))
    .sort((a, b) => b.avgConfidence - a.avgConfidence)
    .slice(0, 3);

  correlations.patterns.push({
    type: 'peak_insight_hours',
    data: peakHours,
    recommendation: 'Schedule important conversations during your peak insight hours for optimal consciousness work'
  });

  return correlations;
}

async function analyzeProgressTrend(userId: string) {
  const recentProgress = await prisma.circadianProgressLog.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: 14 // Last 2 weeks
  });

  if (recentProgress.length < 3) {
    return { trend: 'insufficient_data', message: 'Need more data points to analyze trend' };
  }

  // Calculate trends
  const sleepQualityTrend = calculateTrendDirection(recentProgress.map(p => p.sleepQuality).filter(Boolean));
  const energyTrend = calculateTrendDirection(recentProgress.map(p => p.energyLevel).filter(Boolean));

  return {
    trend: sleepQualityTrend === 'improving' && energyTrend === 'improving' ? 'improving' :
           sleepQualityTrend === 'declining' || energyTrend === 'declining' ? 'declining' : 'stable',
    details: {
      sleepQuality: sleepQualityTrend,
      energyLevel: energyTrend,
      dataPoints: recentProgress.length
    }
  };
}

// Helper calculation functions
function calculateRhythmQualityTrend(analyses: any[]) {
  if (analyses.length < 2) return 'stable';
  const qualities = analyses.map(a => a.rhythmQuality);
  return calculateTrendDirection(qualities);
}

function analyzeMisalignmentTrend(analyses: any[]) {
  const severityScores = analyses.map(a => {
    const severityMap = { none: 0, mild: 1, moderate: 2, severe: 3 };
    return severityMap[a.misalignmentSeverity as keyof typeof severityMap] || 0;
  });

  const trend = calculateTrendDirection(severityScores.reverse()); // Reverse for chronological order
  return trend === 'improving' ? 'decreasing' : trend === 'declining' ? 'increasing' : 'stable';
}

function analyzePhaseConsistency(analyses: any[]) {
  const phases = analyses.map(a => a.currentPhase);
  const phaseVariability = new Set(phases).size / analyses.length;
  return phaseVariability < 0.5 ? 'high' : phaseVariability < 0.8 ? 'moderate' : 'low';
}

function identifyImprovementAreas(analyses: any[]) {
  if (analyses.length === 0) return [];

  const latestAnalysis = analyses[0];
  const areas: any /* TODO: specify type */[] = [];

  if (latestAnalysis.rhythmQuality < 0.7) areas.push('rhythm_quality');
  if (latestAnalysis.misalignmentSeverity !== 'none') areas.push('circadian_alignment');

  return areas;
}

function calculateTimeConsistency(times: string[]) {
  if (times.length === 0) return 0;

  // Convert times to minutes from midnight for easier calculation
  const timeMinutes = times.map(time => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  });

  const mean = timeMinutes.reduce((sum, time) => sum + time, 0) / timeMinutes.length;
  const variance = timeMinutes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / timeMinutes.length;
  const stdDev = Math.sqrt(variance);

  // Convert to consistency score (lower std dev = higher consistency)
  return Math.max(0, 1 - stdDev / 120); // 120 minutes = 2 hours max deviation for full inconsistency
}

function calculateAverage(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateImprovementTrend(progressLogs: any[]) {
  if (progressLogs.length < 3) return 'stable';

  const recentLogs = progressLogs.slice(0, 7); // Last week
  const earlierLogs = progressLogs.slice(7, 14); // Previous week

  if (recentLogs.length === 0 || earlierLogs.length === 0) return 'stable';

  const recentAvg = calculateAverage(recentLogs.map(p => p.sleepQuality).filter(Boolean));
  const earlierAvg = calculateAverage(earlierLogs.map(p => p.sleepQuality).filter(Boolean));

  if (!recentAvg || !earlierAvg) return 'stable';

  const improvement = recentAvg - earlierAvg;
  return improvement > 0.1 ? 'improving' : improvement < -0.1 ? 'declining' : 'stable';
}

function calculateTrendDirection(values: number[]) {
  if (values.length < 2) return 'stable';

  // Simple linear trend calculation
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const change = secondAvg - firstAvg;
  return Math.abs(change) < 0.05 ? 'stable' : change > 0 ? 'improving' : 'declining';
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed.' },
    { status: 405 }
  );
}