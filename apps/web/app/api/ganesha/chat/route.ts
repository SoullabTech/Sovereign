import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { GaneshaAgent } from '@/lib/consciousness/ganesha/GaneshaAgent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      message,
      userId,
      userName,
      sessionId,
      relationships,
      location
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Process message with GaneshaAgent
    const result = await GaneshaAgent.processMessage(message, {
      userName,
      userId,
      sessionId,
      relationships,
      location
    });

    return NextResponse.json({
      response: result.response,
      metadata: {
        actionType: result.action.type,
        ...result.metadata
      }
    });

  } catch (error) {
    console.error('GANESHA Chat API Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'GANESHA Consciousness Support',
    version: '1.0.0',
    systems: [
      'MorphicMemory (Sheldrake)',
      'BodyIntelligence (Barrett + Porges)',
      'MemoryReconsolidation (Ecker + Levine + Gendlin)',
      'HemisphericBalance (McGilchrist + Vervaeke)',
      'DevelopmentalHolding (Kegan + Wilber + Buber)'
    ],
    status: 'operational'
  });
}
