// @ts-nocheck - Prototype file, not type-checked
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { betaSession } from '@/lib/auth/betaSession';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// Dream Retrieval API - Get user's dreams with analysis and correlations
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // Filter by dream type
    const archetype = searchParams.get('archetype'); // Filter by archetype
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const includeAnalysis = searchParams.get('includeAnalysis') === 'true';
    const includeCorrelations = searchParams.get('includeCorrelations') === 'true';

    // Build dynamic where clause
    const where: any = { userId: user.id };

    if (type) {
      where.type = type;
    }

    if (archetype) {
      where.archetypes = {
        has: archetype
      };
    }

    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = new Date(dateFrom);
      if (dateTo) where.timestamp.lte = new Date(dateTo);
    }

    // Retrieve dreams with optional related data
    const dreams = await prisma.dreamMemory.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      include: {
        correlations: includeCorrelations ? {
          include: {
            // Include related consciousness data based on correlation type
            ...(includeCorrelations && {
              // This would need proper relations set up in schema
            })
          }
        } : false,
        sleepSession: includeAnalysis,
        ...(includeAnalysis && {
          // Include additional analysis data
        })
      }
    });

    // Get dream statistics
    const stats = await getDreamStatistics(user.id, where);

    // Process dreams for response
    const processedDreams = dreams.map(dream => ({
      id: dream.id,
      timestamp: dream.timestamp,
      content: dream.content,
      type: dream.type,

      // Core dream metrics
      lucidityLevel: dream.lucidityLevel,
      vividnessScore: dream.vividnessScore,
      emotionalIntensity: dream.emotionalIntensity,

      // Jungian analysis
      archetypes: dream.archetypes,
      dreamSymbols: dream.dreamSymbols,
      emotionalTone: dream.emotionalTone,
      shadowAspects: dream.shadowAspects,
      spiralPhase: dream.spiralPhase,

      // DreamWeaver analysis
      ...(includeAnalysis && {
        wisdomEmergence: dream.wisdomEmergenceSignals,
        elementalPatterns: dream.elementalPatterns,
        consciousnessDepth: dream.consciousnessDepth,
        transformationMarkers: dream.transformationMarkers,
        wisdomExtracted: dream.wisdomExtracted,
      }),

      // Sleep context
      sleepQuality: dream.sleepQuality,
      timeInBed: dream.timeInBed,
      wakeTime: dream.wakeTime,
      moonPhase: dream.moonPhase,
      circadianPhase: dream.circadianPhase,

      // Integration tracking
      integrationLevel: dream.integrationLevel,
      followUpNeeded: dream.followUpNeeded,

      // Correlations
      ...(includeCorrelations && {
        correlations: dream.correlations?.map(corr => ({
          type: corr.relatedType,
          strength: corr.correlationStrength,
          metrics: corr.correlationMetrics
        })) || []
      })
    }));

    return NextResponse.json({
      success: true,
      dreams: processedDreams,
      statistics: stats,
      pagination: {
        total: await prisma.dreamMemory.count({ where }),
        limit,
        offset,
        hasMore: dreams.length === limit
      }
    });

  } catch (error) {
    console.error('Dream retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve dreams', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get comprehensive dream statistics for the user
async function getDreamStatistics(userId: string, baseWhere: any = {}) {
  const where = { ...baseWhere, userId };

  try {
    // Basic counts
    const totalDreams = await prisma.dreamMemory.count({ where });
    const lucidDreams = await prisma.dreamMemory.count({
      where: { ...where, lucidityLevel: { gt: 0.3 } }
    });
    const nightmares = await prisma.dreamMemory.count({
      where: { ...where, type: 'nightmare' }
    });

    // Archetype frequency analysis
    const archetypeStats = await prisma.dreamMemory.findMany({
      where,
      select: { archetypes: true }
    });

    const archetypeFrequency = archetypeStats.reduce((acc: Record<string, number>, dream) => {
      dream.archetypes.forEach(archetype => {
        acc[archetype] = (acc[archetype] || 0) + 1;
      });
      return acc;
    }, {});

    // Average metrics
    const metrics = await prisma.dreamMemory.aggregate({
      where,
      _avg: {
        lucidityLevel: true,
        vividnessScore: true,
        emotionalIntensity: true,
        consciousnessDepth: true,
        integrationLevel: true
      }
    });

    // Recent trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentDreams = await prisma.dreamMemory.count({
      where: {
        ...where,
        timestamp: { gte: thirtyDaysAgo }
      }
    });

    // Wisdom emergence patterns
    const wisdomEmergenceDreams = await prisma.dreamMemory.count({
      where: {
        ...where,
        wisdomEmergenceSignals: {
          not: null
        }
      }
    });

    // Sleep quality correlation
    const sleepQualityStats = await prisma.dreamMemory.aggregate({
      where: {
        ...where,
        sleepQuality: { not: null }
      },
      _avg: {
        sleepQuality: true
      }
    });

    return {
      totals: {
        dreams: totalDreams,
        lucidDreams,
        nightmares,
        recentDreams
      },
      averages: {
        lucidity: metrics._avg.lucidityLevel,
        vividness: metrics._avg.vividnessScore,
        emotionalIntensity: metrics._avg.emotionalIntensity,
        consciousnessDepth: metrics._avg.consciousnessDepth,
        integration: metrics._avg.integrationLevel,
        sleepQuality: sleepQualityStats._avg.sleepQuality
      },
      patterns: {
        archetypeFrequency: Object.entries(archetypeFrequency)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10), // Top 10 archetypes
        wisdomEmergenceRate: totalDreams > 0 ? wisdomEmergenceDreams / totalDreams : 0,
        lucidityRate: totalDreams > 0 ? lucidDreams / totalDreams : 0
      }
    };

  } catch (error) {
    console.error('Statistics calculation error:', error);
    return {
      totals: { dreams: 0, lucidDreams: 0, nightmares: 0, recentDreams: 0 },
      averages: {},
      patterns: {}
    };
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { message: 'Method not allowed. Use GET to retrieve dreams.' },
    { status: 405 }
  );
}