import { NextRequest, NextResponse } from 'next/server';
import { maiaModelSystem, MAIAGenerationRequest } from '@/lib/models/maia-integration';

/**
 * MAIA Model Generation API
 * Handles consciousness-aware text generation using the integrated model system
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request
    if (!body.content || !body.consciousnessLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: content, consciousnessLevel' },
        { status: 400 }
      );
    }

    // Ensure consciousness level is valid
    if (body.consciousnessLevel < 1 || body.consciousnessLevel > 5) {
      return NextResponse.json(
        { error: 'consciousnessLevel must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Initialize system if needed
    try {
      await maiaModelSystem.initialize();
    } catch (initError) {
      console.error('Failed to initialize MAIA model system:', initError);
      return NextResponse.json(
        { error: 'Model system initialization failed' },
        { status: 503 }
      );
    }

    // Create generation request
    const request: MAIAGenerationRequest = {
      content: body.content,
      consciousnessLevel: body.consciousnessLevel,
      userId: body.userId,
      sessionId: body.sessionId,
      context: body.context,
      preferences: body.preferences
    };

    // Generate response
    const response = await maiaModelSystem.generateResponse(request);

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Generation API error:', error);

    return NextResponse.json(
      {
        error: 'Generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Return available models for each consciousness level
    await maiaModelSystem.initialize();

    const modelsByLevel = {};
    for (let level = 1; level <= 5; level++) {
      modelsByLevel[level] = maiaModelSystem.getModelsForConsciousnessLevel(level as any);
    }

    return NextResponse.json({
      success: true,
      data: {
        modelsByConsciousnessLevel: modelsByLevel,
        totalModels: Object.values(modelsByLevel).flat().length
      }
    });

  } catch (error) {
    console.error('Models list API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get models',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}