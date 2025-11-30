import { NextRequest, NextResponse } from 'next/server';
import { personalOracleAgent } from '../../../agents/PersonalOracleAgent';
import { logger } from '../../../utils/logger';

/**
 * GET /api/oracle/trust
 * Get user's trust metrics and stage evolution
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Get oracle state including trust metrics
    const stateResponse = await personalOracleAgent.getOracleState(userId);
    
    if (!stateResponse.success) {
      return NextResponse.json(
        { error: 'Failed to retrieve oracle state' },
        { status: 500 }
      );
    }

    const oracleState = stateResponse.data;

    // Extract trust-related information
    const trustData = {
      currentStage: oracleState.currentStage,
      stageProgress: oracleState.stageProgress,
      trustMetrics: oracleState.relationshipMetrics,
      stageConfiguration: oracleState.stageConfiguration,
      safetyStatus: oracleState.safetyStatus,
      transitionHistory: oracleState.transitionHistory || []
    };

    return NextResponse.json({
      success: true,
      data: trustData
    });

  } catch (error) {
    logger.error('Failed to get trust metrics', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/oracle/trust/feedback
 * Process user feedback to evolve trust and personality
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, feedback } = body;

    if (!userId || !feedback) {
      return NextResponse.json(
        { error: 'userId and feedback are required' },
        { status: 400 }
      );
    }

    // Validate feedback type
    const validFeedback = ['more_direct', 'more_gentle', 'perfect'];
    if (!validFeedback.includes(feedback)) {
      return NextResponse.json(
        { error: 'Invalid feedback type. Must be: more_direct, more_gentle, or perfect' },
        { status: 400 }
      );
    }

    // Process feedback
    await personalOracleAgent.processOracleFeedback(userId, feedback);

    // Get updated state
    const stateResponse = await personalOracleAgent.getOracleState(userId);

    return NextResponse.json({
      success: true,
      message: 'Feedback processed successfully',
      data: stateResponse.data
    });

  } catch (error) {
    logger.error('Failed to process trust feedback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}