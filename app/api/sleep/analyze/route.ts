import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { betaSession } from '@/lib/auth/betaSession';
import { healthDataImporter, type ParsedHealthData } from '@/lib/biometrics/HealthDataImporter';

const prisma = new PrismaClient();

// Sleep-Dream Correlation Analysis API
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
    const { sleepData, analysisType = 'comprehensive', timeWindow = 30 } = body;

    if (!sleepData) {
      return NextResponse.json(
        { error: 'Sleep data required' },
        { status: 400 }
      );
    }

    // Parse the health data if it's a raw XML string
    let parsedHealthData: ParsedHealthData;
    if (typeof sleepData === 'string') {
      parsedHealthData = await healthDataImporter.parseHealthXML(sleepData);
    } else {
      parsedHealthData = sleepData;
    }

    // Store sleep sessions in database for correlation analysis
    const sleepSessions = await storeSleepSessions(user.id, parsedHealthData.sleep);

    // Get user's recent dreams for correlation analysis
    const recentDreams = await prisma.dreamMemory.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        correlations: true
      },
      orderBy: { timestamp: 'desc' }
    });

    // Analyze sleep patterns and their correlation with dreams
    const analysis = await analyzeSleepDreamCorrelations(
      parsedHealthData,
      sleepSessions,
      recentDreams,
      analysisType
    );

    // Calculate readiness and recommendations
    const readinessScore = healthDataImporter.calculateReadiness(parsedHealthData);
    const recommendations = generateSleepRecommendations(analysis, parsedHealthData);

    console.log('💤 Sleep-dream analysis completed:', {
      userId: user.id,
      sleepSessions: sleepSessions.length,
      dreams: recentDreams.length,
      readinessScore,
      correlations: analysis.correlations?.length || 0
    });

    return NextResponse.json({
      success: true,
      analysis,
      readinessScore,
      recommendations,
      sleepSessions: sleepSessions.length,
      dreamCorrelations: analysis.correlations?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sleep analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Store sleep sessions in database
async function storeSleepSessions(userId: string, sleepSessions: any[]) {
  const storedSessions = [];

  for (const session of sleepSessions.slice(0, 30)) { // Last 30 sessions
    try {
      // Check if session already exists
      const existing = await prisma.sleepSession.findFirst({
        where: {
          userId,
          startTime: session.startDate,
          endTime: session.endDate
        }
      });

      if (!existing) {
        const stored = await prisma.sleepSession.create({
          data: {
            userId,
            startTime: session.startDate,
            endTime: session.endDate,
            durationHours: session.durationHours,
            sleepStages: session.stages || {},
            qualityMetrics: {
              efficiency: session.durationHours > 0 ?
                ((session.stages?.rem || 0) + (session.stages?.core || 0) + (session.stages?.deep || 0)) / session.durationHours : 0,
              deepSleepRatio: session.stages?.deep ? session.stages.deep / session.durationHours : 0,
              remRatio: session.stages?.rem ? session.stages.rem / session.durationHours : 0
            }
          }
        });
        storedSessions.push(stored);
      }
    } catch (error) {
      console.warn('Failed to store sleep session:', error);
    }
  }

  return storedSessions;
}

// Analyze sleep-dream correlations
async function analyzeSleepDreamCorrelations(
  healthData: ParsedHealthData,
  sleepSessions: any[],
  dreams: any[],
  analysisType: string
) {
  const correlations = [];
  const patterns = {
    sleepQualityDreamDepth: [],
    remStageDreamContent: [],
    circadianDreamTiming: [],
    hrvDreamCoherence: []
  };

  // Analyze correlations between sleep sessions and dreams
  for (const dream of dreams) {
    const dreamDate = new Date(dream.timestamp);

    // Find sleep session within 12 hours of dream
    const associatedSleep = sleepSessions.find(session => {
      const sleepEnd = new Date(session.endTime);
      const timeDiff = Math.abs(dreamDate.getTime() - sleepEnd.getTime());
      return timeDiff < 12 * 60 * 60 * 1000; // Within 12 hours
    });

    if (associatedSleep) {
      // Calculate sleep quality impact on dream characteristics
      const sleepQuality = calculateSleepQuality(associatedSleep);
      const dreamDepth = dream.consciousnessDepth || 0;
      const wisdomEmergence = dream.wisdomEmergenceSignals !== null;

      correlations.push({
        dreamId: dream.id,
        sleepSessionId: associatedSleep.id,
        sleepQuality,
        dreamDepth,
        wisdomEmergence,
        correlation: calculateCorrelationStrength(sleepQuality, dreamDepth, wisdomEmergence)
      });

      // Track patterns
      patterns.sleepQualityDreamDepth.push({ sleepQuality, dreamDepth });

      if (associatedSleep.sleepStages?.rem) {
        patterns.remStageDreamContent.push({
          remDuration: associatedSleep.sleepStages.rem,
          archetypes: dream.archetypes?.length || 0,
          symbolRichness: dream.dreamSymbols?.length || 0
        });
      }

      patterns.circadianDreamTiming.push({
        sleepStart: new Date(associatedSleep.startTime).getHours(),
        dreamTime: dreamDate.getHours(),
        dreamQuality: dream.emotionalTone?.intensity || 0
      });
    }
  }

  // Find HRV correlations with dream coherence
  for (const dream of dreams) {
    const dreamDate = new Date(dream.timestamp);
    const hrvWindow = healthData.hrv.filter(hrv => {
      const timeDiff = Math.abs(dreamDate.getTime() - hrv.startDate.getTime());
      return timeDiff < 24 * 60 * 60 * 1000; // Within 24 hours
    });

    if (hrvWindow.length > 0) {
      const avgHRV = hrvWindow.reduce((sum, h) => sum + h.value, 0) / hrvWindow.length;
      const dreamCoherence = dream.consciousnessDepth || 0;

      patterns.hrvDreamCoherence.push({
        hrv: avgHRV,
        dreamCoherence,
        wisdomEmergence: dream.wisdomEmergenceSignals !== null
      });
    }
  }

  return {
    correlations,
    patterns,
    insights: generateSleepDreamInsights(patterns, correlations),
    sleepOptimization: generateSleepOptimization(patterns, healthData),
    circadianAlignment: analyzeCircadianAlignment(patterns, healthData)
  };
}

// Calculate sleep quality score
function calculateSleepQuality(sleepSession: any): number {
  const efficiency = sleepSession.qualityMetrics?.efficiency || 0;
  const deepSleepRatio = sleepSession.qualityMetrics?.deepSleepRatio || 0;
  const remRatio = sleepSession.qualityMetrics?.remRatio || 0;

  // Weighted quality score
  return (efficiency * 0.4) + (deepSleepRatio * 5 * 0.3) + (remRatio * 4 * 0.3);
}

// Calculate correlation strength between sleep and dream metrics
function calculateCorrelationStrength(sleepQuality: number, dreamDepth: number, wisdomEmergence: boolean): number {
  let correlation = 0;

  // Base correlation between sleep quality and dream depth
  const normalizedSleep = Math.min(1, sleepQuality);
  const normalizedDream = dreamDepth / 10; // Assuming dream depth scale 0-10
  correlation = normalizedSleep * normalizedDream;

  // Bonus for wisdom emergence with good sleep
  if (wisdomEmergence && sleepQuality > 0.7) {
    correlation += 0.2;
  }

  return Math.min(1, correlation);
}

// Generate insights from sleep-dream patterns
function generateSleepDreamInsights(patterns: any, correlations: any[]): string[] {
  const insights = [];

  // Sleep quality insights
  const avgCorrelation = correlations.length > 0 ?
    correlations.reduce((sum, c) => sum + c.correlation, 0) / correlations.length : 0;

  if (avgCorrelation > 0.7) {
    insights.push("Strong correlation detected between sleep quality and dream depth - your sleep patterns are optimally supporting consciousness expansion");
  } else if (avgCorrelation > 0.4) {
    insights.push("Moderate sleep-dream correlation - there's room to optimize sleep patterns for enhanced dream consciousness");
  } else {
    insights.push("Low sleep-dream correlation detected - consider implementing circadian rhythm optimization strategies");
  }

  // REM sleep insights
  if (patterns.remStageDreamContent.length > 0) {
    const avgRem = patterns.remStageDreamContent.reduce((sum: number, p: any) => sum + p.remDuration, 0) / patterns.remStageDreamContent.length;
    const avgSymbols = patterns.remStageDreamContent.reduce((sum: number, p: any) => sum + p.symbolRichness, 0) / patterns.remStageDreamContent.length;

    if (avgRem > 1.5 && avgSymbols > 3) {
      insights.push("Optimal REM sleep duration is producing rich symbolic dream content - excellent for archetypal integration");
    } else if (avgRem < 1.0) {
      insights.push("REM sleep may be insufficient for deep symbolic processing - consider sleep environment optimization");
    }
  }

  // HRV insights
  if (patterns.hrvDreamCoherence.length > 0) {
    const highHrvDreams = patterns.hrvDreamCoherence.filter((p: any) => p.hrv > 50);
    const wisdomEmergenceRate = highHrvDreams.filter((p: any) => p.wisdomEmergence).length / (highHrvDreams.length || 1);

    if (wisdomEmergenceRate > 0.6) {
      insights.push("High HRV periods correlate strongly with wisdom emergence in dreams - your nervous system coherence supports deep insights");
    }
  }

  // Circadian insights
  if (patterns.circadianDreamTiming.length > 0) {
    const earlyDreams = patterns.circadianDreamTiming.filter((p: any) => p.dreamTime < 6);
    if (earlyDreams.length > patterns.circadianDreamTiming.length * 0.5) {
      insights.push("Many dreams occurring in early morning hours - optimal for REM dream recall and integration");
    }
  }

  return insights;
}

// Generate sleep optimization recommendations
function generateSleepOptimization(patterns: any, healthData: ParsedHealthData): any[] {
  const recommendations = [];

  // Sleep timing optimization
  if (healthData.sleep.length > 0) {
    const avgBedtime = healthData.sleep.slice(0, 7).reduce((sum, s) => {
      return sum + s.startDate.getHours() + (s.startDate.getMinutes() / 60);
    }, 0) / Math.min(healthData.sleep.length, 7);

    if (avgBedtime > 24 || avgBedtime < 2) {
      recommendations.push({
        type: 'timing',
        title: 'Optimize Bedtime for Dream States',
        description: 'Consider earlier bedtime (10-11 PM) to maximize deep sleep and REM stages for enhanced dream consciousness',
        priority: 'medium'
      });
    }
  }

  // HRV optimization for dream coherence
  const recentHRV = healthData.hrv.slice(0, 5);
  if (recentHRV.length > 0) {
    const avgHRV = recentHRV.reduce((sum, h) => sum + h.value, 0) / recentHRV.length;

    if (avgHRV < 40) {
      recommendations.push({
        type: 'coherence',
        title: 'Enhance Nervous System Coherence',
        description: 'Low HRV may impact dream depth. Try breathwork or meditation 1-2 hours before sleep',
        priority: 'high'
      });
    }
  }

  // Sleep environment for symbolic processing
  const avgDeepSleep = healthData.sleep.slice(0, 7).reduce((sum, s) => {
    return sum + (s.stages?.deep || 0);
  }, 0) / Math.min(healthData.sleep.length, 7);

  if (avgDeepSleep < 1.0) {
    recommendations.push({
      type: 'environment',
      title: 'Optimize Sleep Environment for Deep States',
      description: 'Cool room (65-68°F), complete darkness, and consistent routine support deep sleep stages crucial for dream processing',
      priority: 'medium'
    });
  }

  return recommendations;
}

// Analyze circadian alignment with consciousness cycles
function analyzeCircadianAlignment(patterns: any, healthData: ParsedHealthData): any {
  const alignment = {
    score: 0,
    factors: [],
    recommendations: []
  };

  // Sleep consistency analysis
  if (healthData.sleep.length > 3) {
    const bedtimes = healthData.sleep.slice(0, 7).map(s =>
      s.startDate.getHours() + (s.startDate.getMinutes() / 60)
    );

    const avgBedtime = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
    const variance = bedtimes.reduce((sum, time) => sum + Math.pow(time - avgBedtime, 2), 0) / bedtimes.length;
    const consistency = Math.max(0, 1 - Math.sqrt(variance) / 3);

    alignment.score += consistency * 30;
    alignment.factors.push({
      name: 'Sleep Timing Consistency',
      score: consistency,
      impact: 'Consistent sleep timing supports stable circadian rhythm for dream consciousness'
    });
  }

  // REM timing analysis
  const dreamTimes = patterns.circadianDreamTiming;
  if (dreamTimes.length > 0) {
    const optimalRem = dreamTimes.filter((d: any) => d.dreamTime >= 4 && d.dreamTime <= 7).length;
    const remScore = optimalRem / dreamTimes.length;

    alignment.score += remScore * 25;
    alignment.factors.push({
      name: 'REM/Dream Timing',
      score: remScore,
      impact: 'Dreams during natural REM windows (4-7 AM) tend to be more vivid and memorable'
    });
  }

  // HRV circadian pattern
  if (healthData.hrv.length > 0) {
    const morningHRV = healthData.hrv.filter(h => {
      const hour = h.startDate.getHours();
      return hour >= 6 && hour <= 10;
    });

    const eveningHRV = healthData.hrv.filter(h => {
      const hour = h.startDate.getHours();
      return hour >= 18 && hour <= 22;
    });

    if (morningHRV.length > 0 && eveningHRV.length > 0) {
      const morningAvg = morningHRV.reduce((sum, h) => sum + h.value, 0) / morningHRV.length;
      const eveningAvg = eveningHRV.reduce((sum, h) => sum + h.value, 0) / eveningHRV.length;

      // Healthy circadian HRV pattern: higher in evening, lower in morning
      const circadianPattern = eveningAvg > morningAvg ? 1 : morningAvg / eveningAvg;

      alignment.score += circadianPattern * 20;
      alignment.factors.push({
        name: 'HRV Circadian Rhythm',
        score: circadianPattern,
        impact: 'Natural HRV variation supports autonomic nervous system balance for dream states'
      });
    }
  }

  alignment.score = Math.min(100, alignment.score);

  return alignment;
}

// Generate sleep recommendations
function generateSleepRecommendations(analysis: any, healthData: ParsedHealthData): any[] {
  const recs = [];

  // Add sleep optimization recommendations
  recs.push(...analysis.sleepOptimization);

  // Add circadian alignment recommendations
  if (analysis.circadianAlignment.score < 70) {
    recs.push({
      type: 'circadian',
      title: 'Improve Circadian Rhythm Alignment',
      description: 'Your circadian rhythm could be better aligned for optimal dream states. Consider light therapy and consistent sleep timing.',
      priority: 'high'
    });
  }

  // Dream correlation recommendations
  const avgCorrelation = analysis.correlations.length > 0 ?
    analysis.correlations.reduce((sum: number, c: any) => sum + c.correlation, 0) / analysis.correlations.length : 0;

  if (avgCorrelation < 0.5) {
    recs.push({
      type: 'integration',
      title: 'Enhance Sleep-Dream Integration',
      description: 'Low correlation between sleep quality and dream depth. Try dream journaling within 5 minutes of waking to strengthen the connection.',
      priority: 'medium'
    });
  }

  return recs;
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to analyze sleep patterns.' },
    { status: 405 }
  );
}