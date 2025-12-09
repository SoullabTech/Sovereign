import { NextRequest, NextResponse } from 'next/server';
import { PremiumStorageService } from '@/lib/services/premium-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      conversationId,
      analysisData,
      fullTranscript
    } = body;

    if (!userId || !conversationId || !analysisData || !fullTranscript) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, conversationId, analysisData, fullTranscript' },
        { status: 400 }
      );
    }

    // Validate analysis data structure
    const requiredAnalysisFields = [
      'consciousness_level',
      'archetype_patterns',
      'shadow_work_insights',
      'sacred_geometry_connections',
      'developmental_stage',
      'transformation_indicators'
    ];

    const missingFields = requiredAnalysisFields.filter(
      field => !(field in analysisData)
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing analysis data fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const storageService = PremiumStorageService.getInstance();
    const analysis = await storageService.storeEnhancedConversation(
      userId,
      conversationId,
      analysisData,
      fullTranscript
    );

    return NextResponse.json({
      success: true,
      analysis,
      message: 'Enhanced conversation stored successfully'
    });

  } catch (error) {
    console.error('Error storing enhanced conversation:', error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('Premium storage not initialized')) {
        return NextResponse.json(
          {
            error: 'Premium storage not initialized for user',
            code: 'STORAGE_NOT_INITIALIZED'
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to store enhanced conversation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // For now, we'll use Prisma directly since we don't have a get method in the service yet
    // In a production system, this would be moved to the service layer
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    let whereClause: any = { userId };
    if (conversationId) {
      whereClause.conversationId = conversationId;
    }

    const conversations = await prisma.enhancedConversationAnalysis.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.enhancedConversationAnalysis.count({
      where: whereClause,
    });

    return NextResponse.json({
      success: true,
      conversations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error retrieving enhanced conversations:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve enhanced conversations' },
      { status: 500 }
    );
  }
}