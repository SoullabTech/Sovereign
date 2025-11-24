/**
 * API Route: Holoflower Oracle with Live Consciousness Tracking
 *
 * Integrates MAIA's consciousness tracking with the oracle system
 * to provide both user guidance and MAIA's live consciousness state
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { MAIAOracle, OracleRequest, OracleResponse } from '@/lib/consciousness/maia-oracle';

// Initialize the consciousness-tracking oracle
const oracle = new MAIAOracle({
  maxRetries: 3,
  cringeThreshold: 5,
  enableLevelAdaptation: true,
  enableCringeFilter: true,
  aiProvider: 'anthropic',
  model: 'claude-3-sonnet-20240229'
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.userId || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and message' },
        { status: 400 }
      );
    }

    // Build oracle request
    const oracleRequest: OracleRequest = {
      userId: body.userId,
      message: body.message,
      context: body.context || {}
    };

    // Generate consciousness-adaptive response with live tracking
    const response: OracleResponse = await oracle.respond(oracleRequest);

    const processingTime = Date.now() - startTime;

    // Return structured response with MAIA's consciousness state
    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Holoflower Oracle API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Oracle processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        const systemStatus = oracle.getSystemStatus();
        return NextResponse.json({
          success: true,
          data: {
            ...systemStatus,
            version: 'v2.0-consciousness-tracking',
            features: ['consciousness_level_detection', 'cringe_filtering', 'live_maia_tracking', 'elemental_analysis']
          }
        });

      case 'assess':
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json(
            { error: 'userId required for assessment' },
            { status: 400 }
          );
        }

        const assessment = await oracle.assessUser(userId);
        return NextResponse.json({
          success: true,
          data: assessment
        });

      case 'test-cringe':
        const testTexts = [
          "You are a divine being of infinite light and wisdom.",
          "Your chakras are perfectly aligned with cosmic consciousness.",
          "This situation requires practical problem-solving and clear communication.",
          "Trust your intuition while staying grounded in reality."
        ];

        const cringeResults = await oracle.testCringeDetection(testTexts);
        return NextResponse.json({
          success: true,
          data: cringeResults
        });

      default:
        return NextResponse.json({
          success: true,
          info: 'Holoflower Oracle with Consciousness Tracking',
          usage: {
            POST: 'Generate response with consciousness tracking: { userId, message, context? }',
            GET: {
              'action=status': 'System status and configuration',
              'action=assess&userId=X': 'Get user consciousness assessment',
              'action=test-cringe': 'Test cringe detection system'
            }
          }
        });
    }
  } catch (error) {
    console.error('Holoflower Oracle GET Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}