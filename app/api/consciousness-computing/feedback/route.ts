import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      accuracy,
      emergentInsight,
      sessionWord,
      consciousnessLevel,
      unexpectedElements,
      sessionType,
      userId,
      timestamp
    } = body;

    // Validate required fields
    if (!accuracy || !emergentInsight || !sessionWord) {
      return NextResponse.json(
        { error: 'Missing required fields: accuracy, emergentInsight, sessionWord' },
        { status: 400 }
      );
    }

    // Store feedback in ConsciousnessComputingFeedback table
    const feedback = await prisma.consciousnessComputingFeedback.create({
      data: {
        userId: userId || 'anonymous',
        sessionType: sessionType || 'consciousness_computing_pioneer',
        accuracyRating: accuracy,
        emergentInsight: emergentInsight,
        sessionWord: sessionWord,
        consciousnessLevel: consciousnessLevel,
        unexpectedElements: unexpectedElements,
        metadata: {
          source: 'consciousness_computing_portal',
          version: '1.0',
          timestamp: timestamp || new Date().toISOString()
        }
      }
    });

    // Store analytics (fire and forget)
    prisma.consciousnessComputingAnalytics.create({
      data: {
        event: 'consciousness_computing_feedback',
        userId: userId || 'anonymous',
        properties: {
          accuracy_rating: accuracy,
          session_word: sessionWord,
          has_emergent_insight: emergentInsight.length > 10,
          has_unexpected_elements: unexpectedElements && unexpectedElements.length > 10,
          consciousness_level: consciousnessLevel,
          session_type: sessionType
        }
      }
    }).then(() => console.log('📊 [Analytics] Consciousness feedback tracked'))
      .catch(err => console.warn('⚠️ [Analytics] Failed to track:', err));

    console.log('✅ [Consciousness Feedback] Successfully stored:', {
      feedback_id: feedback.id,
      user_id: userId,
      accuracy: accuracy,
      session_word: sessionWord
    });

    return NextResponse.json({
      success: true,
      feedback_id: feedback.id,
      message: 'Feedback stored successfully'
    });

  } catch (error) {
    console.error('🔴 [Consciousness Feedback] API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving feedback analytics (admin/research use)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('user_id');
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate time filter based on range
    let timeFilter: string | null = null;
    const now = new Date();
    switch (timeRange) {
      case '1d':
        timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case '7d':
        timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '30d':
        timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'all':
      default:
        timeFilter = null;
        break;
    }

    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }
    if (timeFilter) {
      whereClause.createdAt = { gte: new Date(timeFilter) };
    }

    const feedback = await prisma.consciousnessComputingFeedback.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Calculate aggregate metrics
    const analytics = {
      total_feedback: feedback.length,
      average_accuracy: feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.accuracyRating, 0) / feedback.length : 0,
      top_session_words: getTopSessionWords(feedback),
      consciousness_levels: getConsciousnessLevelDistribution(feedback),
      recent_insights: feedback.slice(0, 10).map(f => ({
        session_word: f.sessionWord,
        emergent_insight: f.emergentInsight.substring(0, 100) + '...',
        accuracy: f.accuracyRating,
        created_at: f.createdAt.toISOString()
      }))
    };

    return NextResponse.json({
      success: true,
      feedback,
      analytics
    });

  } catch (error) {
    console.error('🔴 [Feedback Analytics] API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions for analytics
function getTopSessionWords(feedback: any[]): { word: string; count: number }[] {
  const wordCounts = feedback.reduce((acc, f) => {
    const word = f.sessionWord?.toLowerCase();
    if (word) {
      acc[word] = (acc[word] || 0) + 1;
    }
    return acc;
  }, {});

  return Object.entries(wordCounts)
    .map(([word, count]) => ({ word, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function getConsciousnessLevelDistribution(feedback: any[]): { [level: string]: number } {
  return feedback.reduce((acc, f) => {
    const level = f.consciousnessLevel || 'unknown';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});
}