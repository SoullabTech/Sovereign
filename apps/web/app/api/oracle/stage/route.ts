/**
 * Oracle Stage Management API
 * 
 * Provides endpoints for managing Oracle relationship stages:
 * - GET: Current stage information
 * - POST: Request stage transitions
 * - PUT: Update stage preferences
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Temporarily stub out backend imports that are excluded from build
// import { personalOracleAgent } from '../../../../backend/src/agents/PersonalOracleAgent';
// Temporarily stub out backend imports that are excluded from build
// import type { OracleStage } from '../../../../backend/src/core/types/oracleStateMachine';

// Stub type
type OracleStage = 'structured_guide' | 'dialogical_companion' | 'cocreative_partner' | 
                   'presence_oracle' | 'maintenance' | 'transparent_prism';

// Stub implementation
const personalOracleAgent = {
  async getOracleState(userId: string) {
    return {
      success: true,
      data: {
        currentStage: 'initial',
        stageProgress: 0,
        relationshipMetrics: {},
        availableTransitions: [],
        safetyStatus: { safe: true, message: 'All systems operational' },
        stageConfiguration: {},
        recentCapacityTrends: []
      }
    };
  },
  async requestStageTransition(userId: string, targetStage: string, reason: string) {
    return {
      success: true,
      data: {
        approved: true,
        newStage: targetStage,
        message: 'Transition approved'
      }
    };
  },
  async updateStagePreferences(userId: string, preferences: any) {
    return {
      success: true,
      data: preferences
    };
  }
};

/**
 * GET /api/oracle/stage
 * Returns current Oracle stage and relationship summary
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const response = await personalOracleAgent.getOracleState(userId);
    
    if (response.success) {
      return NextResponse.json({
        success: true,
        data: {
          currentStage: response.data.currentStage,
          stageProgress: response.data.stageProgress,
          relationshipMetrics: response.data.relationshipMetrics,
          safetyStatus: response.data.safetyStatus,
          stageConfiguration: response.data.stageConfiguration,
          recentCapacityTrends: response.data.recentCapacityTrends
        }
      });
    } else {
      return NextResponse.json(
        { error: (response as any).errors?.[0] || 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Oracle stage GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/oracle/stage
 * Request a stage transition
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, targetStage, reason = 'user_request' } = body;

    if (!userId || !targetStage) {
      return NextResponse.json(
        { error: 'userId and targetStage are required' },
        { status: 400 }
      );
    }

    // Validate target stage
    const validStages: OracleStage[] = [
      'structured_guide',
      'dialogical_companion',
      'cocreative_partner',
      'transparent_prism'
    ];

    if (!validStages.includes(targetStage)) {
      return NextResponse.json(
        { error: 'Invalid target stage' },
        { status: 400 }
      );
    }

    const response = await personalOracleAgent.requestStageTransition(
      userId,
      targetStage,
      reason
    );

    if (response.success) {
      return NextResponse.json({
        success: true,
        data: response.data
      });
    } else {
      return NextResponse.json(
        { error: (response as any).errors?.[0] || 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Oracle stage POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/oracle/stage  
 * Update stage-specific preferences or overrides
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // This would integrate with state machine customization
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      data: {
        message: 'Stage preferences updated',
        preferences
      }
    });
  } catch (error) {
    console.error('Oracle stage PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}