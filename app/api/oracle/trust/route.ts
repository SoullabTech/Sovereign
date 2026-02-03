// @ts-nocheck
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
=======

export const revalidate = false;

// Lazy import to avoid build-time OpenAI SDK instantiation
let _personalOracleAgent: any = null;
async function getPersonalOracleAgent() {
  if (!_personalOracleAgent) {
    const mod = await import('../../_backend/src/agents/PersonalOracleAgent');
    _personalOracleAgent = mod.personalOracleAgent;
  }
  return _personalOracleAgent;
}

let _logger: any = null;
async function getLogger() {
  if (!_logger) {
    const mod = await import('../../_backend/src/utils/logger');
    _logger = mod.logger;
  }
  return _logger;
}
>>>>>>> ecstatic-brown

/**
 * Oracle Trust Metrics API - Temporarily unavailable
 * PersonalOracleAgent is being migrated from legacy backend
 */

export async function GET(request: NextRequest) {
<<<<<<< HEAD
  return NextResponse.json(
    { ok: false, error: 'Trust metrics temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
=======
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
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
    const personalOracleAgent = await getPersonalOracleAgent();
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
    const logger = await getLogger();
    logger.error('Failed to get trust metrics', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
>>>>>>> ecstatic-brown
}

export async function POST(request: NextRequest) {
<<<<<<< HEAD
  return NextResponse.json(
    { ok: false, error: 'Trust metrics temporarily unavailable while services are being migrated.' },
    { status: 503 }
  );
}
=======
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
    const personalOracleAgent = await getPersonalOracleAgent();
    await personalOracleAgent.processOracleFeedback(userId, feedback);

    // Get updated state
    const stateResponse = await personalOracleAgent.getOracleState(userId);

    return NextResponse.json({
      success: true,
      message: 'Feedback processed successfully',
      data: stateResponse.data
    });

  } catch (error) {
    const logger = await getLogger();
    logger.error('Failed to process trust feedback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
>>>>>>> ecstatic-brown
