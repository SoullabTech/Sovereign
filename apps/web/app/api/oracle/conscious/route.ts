/**
 * API Route: Consciousness-Adaptive Oracle Endpoint v2.0
 *
 * Kelly's Vision: "Meet people where they are. Level 1 gets accessible language.
 * Level 5 gets sacred prosody. Everyone gets NO CRINGE."
 *
 * This endpoint uses the NEW AdaptiveMAIAOracle that:
 * - Detects user consciousness level automatically
 * - Adapts language complexity (conventional → alchemical)
 * - Filters all responses for cringe
 * - Maintains authenticity and groundedness across all levels
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { AdaptiveMAIAOracle } from '@/lib/agents/AdaptiveMAIAOracle';

// Initialize the adaptive oracle
const oracle = new AdaptiveMAIAOracle();

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.userId || !body.input) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and input' },
        { status: 400 }
      );
    }

    // Generate consciousness-adaptive response
    const response = await oracle.generateResponse({
      input: body.input,
      userId: body.userId,
      sessionId: body.sessionId,
      forceLevel: body.forceLevel, // Optional: override auto-detection
      showAllLevels: body.showAllLevels // Optional: for testing/comparison
    });

    const processingTime = Date.now() - startTime;

    // Return structured response
    return NextResponse.json({
      success: true,
      data: {
        message: response.message,
        element: response.element,
        archetype: response.archetype,
        confidence: response.confidence,
        adaptive: response.adaptive,
        allLevelResponses: response.allLevelResponses,
        metadata: {
          ...response.metadata,
          processingTime
        }
      }
    });

  } catch (error) {
    console.error('Adaptive Oracle API Error:', error);

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
        return NextResponse.json({
          success: true,
          data: {
            version: 'v2.0-adaptive',
            status: 'operational',
            components: {
              consciousnessDetector: true,
              languageGenerator: true,
              cringeFilter: true
            },
            levels: [
              { level: 1, name: 'Asleep/Unconscious', style: 'Accessible Guide' },
              { level: 2, name: 'Awakening/Curious', style: 'Bridging Guide' },
              { level: 3, name: 'Practicing/Developing', style: 'Framework Teacher' },
              { level: 4, name: 'Integrated/Fluent', style: 'Consciousness Mirror' },
              { level: 5, name: 'Teaching/Transmuting', style: 'Sacred Prosody' }
            ]
          }
        });

      case 'profile':
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json(
            { error: 'userId required for profile' },
            { status: 400 }
          );
        }

        const profile = await oracle.getUserProfile(userId);
        return NextResponse.json({
          success: true,
          data: profile
        });

      case 'test-levels':
        // Demo endpoint showing same input across all 5 levels
        const testInput = searchParams.get('input') || "I've been feeling stuck in my creative work lately.";
        const testUserId = searchParams.get('userId') || 'demo-user';

        const allLevels = await oracle.testAllLevels(testInput, testUserId);

        return NextResponse.json({
          success: true,
          data: {
            input: testInput,
            responses: {
              level1: {
                message: allLevels.level1.message,
                cringeScore: allLevels.level1.cringeScore,
                passedFilter: allLevels.level1.passedCringeFilter
              },
              level2: {
                message: allLevels.level2.message,
                cringeScore: allLevels.level2.cringeScore,
                passedFilter: allLevels.level2.passedCringeFilter
              },
              level3: {
                message: allLevels.level3.message,
                cringeScore: allLevels.level3.cringeScore,
                passedFilter: allLevels.level3.passedCringeFilter
              },
              level4: {
                message: allLevels.level4.message,
                cringeScore: allLevels.level4.cringeScore,
                passedFilter: allLevels.level4.passedCringeFilter
              },
              level5: {
                message: allLevels.level5.message,
                cringeScore: allLevels.level5.cringeScore,
                passedFilter: allLevels.level5.passedCringeFilter
              }
            }
          }
        });

      default:
        return NextResponse.json({
          success: true,
          info: 'Adaptive MAIA Oracle v2.0',
          usage: {
            POST: 'Generate adaptive response: { userId, input, sessionId?, forceLevel?, showAllLevels? }',
            GET: {
              'action=status': 'System status and available levels',
              'action=profile&userId=X': 'Get user consciousness profile',
              'action=test-levels&input=X&userId=Y': 'Test input across all 5 levels'
            }
          }
        });
    }
  } catch (error) {
    console.error('Adaptive Oracle GET Error:', error);

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