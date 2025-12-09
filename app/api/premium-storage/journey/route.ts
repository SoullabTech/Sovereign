import { NextRequest, NextResponse } from 'next/server';
import { PremiumStorageService } from '@/lib/services/premium-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    const storageService = PremiumStorageService.getInstance();
    const journeyMap = await storageService.generateConsciousnessJourney(userId);

    if (!journeyMap) {
      return NextResponse.json(
        {
          error: 'No consciousness analysis data found for user',
          code: 'NO_DATA_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      journeyMap,
      message: 'Consciousness journey generated successfully'
    });

  } catch (error) {
    console.error('Error generating consciousness journey:', error);
    return NextResponse.json(
      { error: 'Failed to generate consciousness journey' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const journeyMaps = await prisma.consciousnessJourneyMap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.consciousnessJourneyMap.count({
      where: { userId },
    });

    // Calculate consciousness progression summary
    const progressionSummary = journeyMaps.length > 0 ? {
      latest_consciousness_level: journeyMaps[0].averageConsciousnessLevel,
      latest_developmental_stage: journeyMaps[0].latestDevelopmentalStage,
      total_sessions: journeyMaps[0].sessionCount,
      journey_span_days: journeyMaps.length > 1 ?
        Math.ceil(
          (journeyMaps[0].createdAt.getTime() - journeyMaps[journeyMaps.length - 1].createdAt.getTime())
          / (1000 * 60 * 60 * 24)
        ) : 0,
    } : null;

    return NextResponse.json({
      success: true,
      journeyMaps,
      progressionSummary,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error retrieving consciousness journeys:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve consciousness journeys' },
      { status: 500 }
    );
  }
}