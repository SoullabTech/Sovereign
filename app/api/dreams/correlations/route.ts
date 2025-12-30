// @ts-nocheck - Prototype file, not type-checked
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { betaSession } from '@/lib/auth/betaSession';

const prisma = new PrismaClient();

// Dream Correlations API - Track patterns between dreams and consciousness states across time
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
    const dreamId = searchParams.get('dreamId');
    const correlationType = searchParams.get('type'); // elemental_state, maia_memory, sleep_session
    const timeWindow = parseInt(searchParams.get('timeWindow') || '7'); // days
    const minStrength = parseFloat(searchParams.get('minStrength') || '0.3');
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    if (dreamId) {
      // Get correlations for specific dream
      const correlations = await getDreamCorrelations(dreamId, user.id, {
        type: correlationType,
        includeMetrics
      });
      return NextResponse.json({ success: true, correlations });
    }

    // Get consciousness correlation patterns across all dreams
    const patterns = await getConsciousnessCorrelationPatterns(user.id, {
      timeWindow,
      minStrength,
      correlationType
    });

    return NextResponse.json({
      success: true,
      patterns,
      timeWindow,
      analysisTimestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dream correlations error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve correlations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Create new correlations through analysis
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
    const { action, timeWindow = 30 } = body;

    if (action === 'recalculate') {
      // Recalculate all correlations for user's recent dreams
      const correlations = await recalculateCorrelations(user.id, timeWindow);

      return NextResponse.json({
        success: true,
        correlationsCreated: correlations.created,
        correlationsUpdated: correlations.updated,
        analysisWindow: timeWindow
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use action: "recalculate"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Dream correlation creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create correlations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get correlations for a specific dream
async function getDreamCorrelations(dreamId: string, userId: string, options: any = {}) {
  const where: any = { dreamId };

  if (options.type) {
    where.relatedType = options.type;
  }

  const correlations = await prisma.dreamConsciousnessCorrelation.findMany({
    where,
    orderBy: { correlationStrength: 'desc' },
    include: options.includeMetrics ? {} : undefined
  });

  // Enhance correlations with related data
  const enhancedCorrelations = await Promise.all(
    correlations.map(async (correlation) => {
      let relatedData = null;

      try {
        switch (correlation.relatedType) {
          case 'elemental_state':
            relatedData = await prisma.elementalState.findUnique({
              where: { id: correlation.relatedId }
            });
            break;

          case 'maia_memory':
            relatedData = await prisma.mAIAMemory.findUnique({
              where: { id: correlation.relatedId },
              select: {
                id: true,
                content: true,
                timestamp: true,
                emotionalTone: true,
                conversationContext: true
              }
            });
            break;

          case 'sleep_session':
            relatedData = await prisma.sleepSession.findUnique({
              where: { id: correlation.relatedId }
            });
            break;
        }
      } catch (error) {
        console.warn(`Failed to fetch ${correlation.relatedType} data:`, error);
      }

      return {
        ...correlation,
        relatedData
      };
    })
  );

  return enhancedCorrelations;
}

// Analyze consciousness correlation patterns across user's dreams
async function getConsciousnessCorrelationPatterns(userId: string, options: any = {}) {
  const timeWindowMs = options.timeWindow * 24 * 60 * 60 * 1000;
  const timeThreshold = new Date(Date.now() - timeWindowMs);

  // Get recent dreams with correlations
  const dreams = await prisma.dreamMemory.findMany({
    where: {
      userId,
      timestamp: { gte: timeThreshold }
    },
    include: {
      correlations: {
        where: {
          correlationStrength: { gte: options.minStrength }
        },
        ...(options.correlationType && {
          where: { relatedType: options.correlationType }
        })
      }
    },
    orderBy: { timestamp: 'desc' }
  });

  // Analyze patterns
  const patterns = {
    // Elemental pathway correlations
    elementalPatterns: analyzeElementalCorrelations(dreams),

    // Archetypal progression patterns
    archetypeEvolution: analyzeArchetypeProgression(dreams),

    // Consciousness depth trends
    depthProgression: analyzeConsciousnessDepth(dreams),

    // Temporal correlation patterns
    temporalPatterns: analyzeTemporalCorrelations(dreams),

    // Cross-domain correlations (dreams ↔ waking consciousness)
    crossDomainCorrelations: analyzeCrossDomainCorrelations(dreams),

    // Wisdom emergence patterns
    wisdomEmergencePatterns: analyzeWisdomEmergencePatterns(dreams)
  };

  return {
    patterns,
    meta: {
      dreamsAnalyzed: dreams.length,
      timeWindow: options.timeWindow,
      correlationsFound: dreams.reduce((sum, d) => sum + d.correlations.length, 0)
    }
  };
}

// Analyze elemental pathway correlations across dreams and consciousness states
function analyzeElementalCorrelations(dreams: any[]) {
  const elementalCounts = { Fire: 0, Water: 0, Earth: 0, Air: 0, Aether: 0 };
  const elementalCorrelations: any = {};

  dreams.forEach(dream => {
    if (dream.elementalPatterns?.dominant) {
      const element = dream.elementalPatterns.dominant;
      elementalCounts[element]++;

      // Track correlations for this element
      dream.correlations.forEach((corr: any) => {
        if (corr.relatedType === 'elemental_state') {
          if (!elementalCorrelations[element]) {
            elementalCorrelations[element] = [];
          }
          elementalCorrelations[element].push({
            strength: corr.correlationStrength,
            timestamp: dream.timestamp
          });
        }
      });
    }
  });

  return {
    dominantElements: elementalCounts,
    correlationStrengths: elementalCorrelations,
    dominantElement: Object.entries(elementalCounts).reduce((a, b) =>
      elementalCounts[a[0]] > elementalCounts[b[0]] ? a : b
    )[0]
  };
}

// Analyze archetypal progression patterns over time
function analyzeArchetypeProgression(dreams: any[]) {
  const archetypeTimeline = dreams
    .filter(d => d.archetypes?.length > 0)
    .map(d => ({
      timestamp: d.timestamp,
      archetypes: d.archetypes,
      primary: d.archetypes[0]
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Detect archetypal phases and transitions
  const phases: any /* TODO: specify type */[] = [];
  let currentPhase = null;

  archetypeTimeline.forEach(entry => {
    if (!currentPhase || currentPhase.primary !== entry.primary) {
      if (currentPhase) phases.push(currentPhase);
      currentPhase = {
        primary: entry.primary,
        startDate: entry.timestamp,
        endDate: entry.timestamp,
        occurrences: 1
      };
    } else {
      currentPhase.endDate = entry.timestamp;
      currentPhase.occurrences++;
    }
  });

  if (currentPhase) phases.push(currentPhase);

  return {
    phases,
    progression: archetypeTimeline,
    dominantArchetype: phases.reduce((a, b) => a.occurrences > b.occurrences ? a : b, phases[0])?.primary,
    transitionPattern: phases.map(p => p.primary)
  };
}

// Analyze consciousness depth progression
function analyzeConsciousnessDepth(dreams: any[]) {
  const depthData = dreams
    .filter(d => d.consciousnessDepth !== null)
    .map(d => ({
      timestamp: d.timestamp,
      depth: d.consciousnessDepth,
      wisdomEmergence: d.wisdomEmergenceSignals !== null
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const averageDepth = depthData.reduce((sum, d) => sum + d.depth, 0) / depthData.length;
  const maxDepth = Math.max(...depthData.map(d => d.depth));
  const wisdomEmergenceRate = depthData.filter(d => d.wisdomEmergence).length / depthData.length;

  return {
    timeline: depthData,
    averageDepth: averageDepth || 0,
    maxDepth: maxDepth || 0,
    wisdomEmergenceRate,
    trend: calculateTrend(depthData.map(d => d.depth))
  };
}

// Analyze temporal correlation patterns
function analyzeTemporalCorrelations(dreams: any[]) {
  const timePatterns = {
    hourlyDistribution: {},
    weeklyDistribution: {},
    moonPhaseCorrelations: {},
    circadianCorrelations: {}
  };

  dreams.forEach(dream => {
    const date = new Date(dream.timestamp);
    const hour = date.getHours();
    const day = date.getDay();

    // Track hourly patterns
    timePatterns.hourlyDistribution[hour] = (timePatterns.hourlyDistribution[hour] || 0) + 1;

    // Track weekly patterns
    timePatterns.weeklyDistribution[day] = (timePatterns.weeklyDistribution[day] || 0) + 1;

    // Track moon phase correlations
    if (dream.moonPhase) {
      timePatterns.moonPhaseCorrelations[dream.moonPhase] = (timePatterns.moonPhaseCorrelations[dream.moonPhase] || 0) + 1;
    }

    // Track circadian correlations
    if (dream.circadianPhase) {
      timePatterns.circadianCorrelations[dream.circadianPhase] = (timePatterns.circadianCorrelations[dream.circadianPhase] || 0) + 1;
    }
  });

  return timePatterns;
}

// Analyze cross-domain correlations between dreams and waking consciousness
function analyzeCrossDomainCorrelations(dreams: any[]) {
  const crossDomainStrengths: any /* TODO: specify type */[] = [];
  const correlationTypes = { elemental_state: 0, maia_memory: 0, sleep_session: 0 };

  dreams.forEach(dream => {
    dream.correlations.forEach((corr: any) => {
      correlationTypes[corr.relatedType] = (correlationTypes[corr.relatedType] || 0) + 1;
      crossDomainStrengths.push(corr.correlationStrength);
    });
  });

  return {
    averageStrength: crossDomainStrengths.reduce((a, b) => a + b, 0) / crossDomainStrengths.length || 0,
    strongCorrelations: crossDomainStrengths.filter(s => s > 0.7).length,
    correlationsByType: correlationTypes,
    totalCorrelations: crossDomainStrengths.length
  };
}

// Analyze wisdom emergence patterns
function analyzeWisdomEmergencePatterns(dreams: any[]) {
  const wisdomDreams = dreams.filter(d => d.wisdomEmergenceSignals !== null);
  const emergenceFrequency = wisdomDreams.length / dreams.length;

  const emergencePatterns = {
    frequency: emergenceFrequency,
    totalOccurrences: wisdomDreams.length,
    bodyActivationPatterns: {},
    languageShiftPatterns: {},
    elementalAssociations: {}
  };

  wisdomDreams.forEach(dream => {
    const signals = dream.wisdomEmergenceSignals;
    if (signals?.bodyActivation) {
      Object.entries(signals.bodyActivation).forEach(([center, active]) => {
        if (active) {
          emergencePatterns.bodyActivationPatterns[center] = (emergencePatterns.bodyActivationPatterns[center] || 0) + 1;
        }
      });
    }

    if (dream.elementalPatterns?.dominant) {
      emergencePatterns.elementalAssociations[dream.elementalPatterns.dominant] =
        (emergencePatterns.elementalAssociations[dream.elementalPatterns.dominant] || 0) + 1;
    }
  });

  return emergencePatterns;
}

// Recalculate correlations for user's recent dreams
async function recalculateCorrelations(userId: string, timeWindowDays: number) {
  const timeWindowMs = timeWindowDays * 24 * 60 * 60 * 1000;
  const timeThreshold = new Date(Date.now() - timeWindowMs);

  // Get recent dreams
  const dreams = await prisma.dreamMemory.findMany({
    where: {
      userId,
      timestamp: { gte: timeThreshold }
    }
  });

  let created = 0;
  let updated = 0;

  for (const dream of dreams) {
    // Delete existing correlations
    await prisma.dreamConsciousnessCorrelation.deleteMany({
      where: { dreamId: dream.id }
    });

    // Recalculate correlations with elemental states
    const elementalStates = await prisma.elementalState.findMany({
      where: {
        userId,
        timestamp: {
          gte: new Date(dream.timestamp.getTime() - 7 * 24 * 60 * 60 * 1000),
          lte: new Date(dream.timestamp.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    for (const state of elementalStates) {
      const strength = calculateElementalCorrelation(dream, state);
      if (strength > 0.2) {
        await prisma.dreamConsciousnessCorrelation.create({
          data: {
            dreamId: dream.id,
            relatedType: 'elemental_state',
            relatedId: state.id,
            correlationStrength: strength,
            correlationMetrics: {
              elementalAlignment: dream.elementalPatterns,
              temporalProximity: calculateTemporalProximity(dream.timestamp, state.timestamp)
            }
          }
        });
        created++;
      }
    }
  }

  return { created, updated };
}

// Helper functions
function calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;
  return Math.abs(diff) < 0.1 ? 'stable' : diff > 0 ? 'increasing' : 'decreasing';
}

function calculateElementalCorrelation(dream: any, elementalState: any): number {
  let correlation = 0;

  if (dream.elementalPatterns?.dominant === elementalState.pathway) {
    correlation += 0.6;
  }
  if (dream.elementalPatterns?.secondary === elementalState.pathway) {
    correlation += 0.3;
  }

  // Temporal proximity bonus
  const timeDiff = Math.abs(dream.timestamp.getTime() - elementalState.timestamp.getTime());
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  const proximityBonus = Math.max(0, 0.4 - (hoursDiff / 24) * 0.4);
  correlation += proximityBonus;

  return Math.min(1.0, correlation);
}

function calculateTemporalProximity(time1: Date, time2: Date): number {
  const timeDiff = Math.abs(time1.getTime() - time2.getTime());
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  return Math.max(0, 1 - (hoursDiff / (24 * 7))); // Decays over 7 days
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed.' },
    { status: 405 }
  );
}