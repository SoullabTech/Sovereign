import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { routeWithMAIA } from '@/lib/maia/maia-router';
import { generateAdaptiveModulation, injectAdaptiveContext } from '@/lib/maia/adaptive-modulation';
import { trackInteractionFeedback, getMetaphorRecommendations } from '@/lib/maia/feedback-hooks';
import { soulprintMemory } from '@/lib/memory/soulprint';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, userId, sessionId, conversationTurn } = body;

    if (!input || !userId) {
      return NextResponse.json(
        { success: false, error: 'input and userId are required' },
        { status: 400 }
      );
    }

    const symbolicContext = await soulprintMemory.getSymbolicContext(userId, 10);
    const adaptiveModulation = generateAdaptiveModulation(symbolicContext);

    const response = await routeWithMAIA(input, {
      userId,
      sessionId,
      conversationTurn: conversationTurn || 0
    });

    const metaphorRecommendations = await getMetaphorRecommendations(
      response.archetype,
      response.element
    );

    return NextResponse.json({
      ...response,
      adaptive: {
        modulation: adaptiveModulation,
        symbolicContext: {
          dominantElement: symbolicContext?.dominantElement,
          primaryArchetype: symbolicContext?.primaryArchetype,
          sessionCount: symbolicContext?.sessionCount,
          recentPattern: symbolicContext?.recentPhases.slice(-3).join(' → ')
        },
        metaphorRecommendations
      }
    });
  } catch (error: any) {
    console.error('MAIA demo API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');

  if (action === 'health') {
    return NextResponse.json({
      status: 'operational',
      version: 'v2.1.0',
      features: {
        soulprintTracking: true,
        adaptiveModulation: true,
        feedbackHooks: true,
        oracleVoice: true
      },
      timestamp: new Date().toISOString()
    });
  }

  if (action === 'metaphors' && userId) {
    const recommendations = await getMetaphorRecommendations('oracle', 'aether');
    return NextResponse.json({
      userId,
      recommendations,
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({
    message: 'MAIA Demo API v2.1',
    endpoints: {
      POST: 'Send message with adaptive modulation',
      GET: 'health check or metaphor recommendations'
    }
  });
}