/**
 * Streamlined Daimonic Oracle API - Single Entry Point
 * 
 * This replaces the scattered API endpoints with one unified route that:
 * - Calls UnifiedDaimonicCore.process() for all logic
 * - Returns pure UI state instructions
 * - Eliminates API-level business logic duplication
 * - Maintains backward compatibility
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// Stub logger
const logger = {
  info: (message: string, data?: any) => console.log(message, data),
  error: (message: string, error?: any) => console.error(message, error),
  warn: (message: string, data?: any) => console.warn(message, data),
  debug: (message: string, data?: any) => console.debug(message, data)
};
// Temporarily stub out backend imports that are excluded from build
// import { unifiedDaimonicCore } from '../../../../backend/src/core/UnifiedDaimonicCore';
// Temporarily stub out backend imports that are excluded from build
// import { logger } from '../../../../backend/src/utils/logger';

// Stub implementation
const unifiedDaimonicCore = {
  async process(input: string, context: any) {
    return {
      success: true,
      message: 'Processing through streamlined Oracle',
      uiState: {
        display: 'oracle',
        showVirtualOracle: true,
        oracleState: 'active'
      },
      ui_state: {
        complexity_level: 'moderate'
      },
      content: {
        text: 'Oracle response placeholder'
      },
      meta: {
        phase: context.phase,
        element: context.element,
        state: context.state
      },
      processing_meta: {
        strategy: {
          mode: 'standard'
        }
      }
    };
  },
  
  getCollectivePatterns() {
    return { patterns: [], insights: 'Collective patterns unavailable' };
  },
  
  async getUserEvolution(userId: string) {
    return { 
      evolution: [], 
      stage: 'initial',
      current_thresholds: {
        complexity_readiness: 0.5
      }
    };
  },
  
  getSystemHealth() {
    return { health: 'good', metrics: {} };
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, userId, sessionId, context } = body;

    // Input validation
    if (!input || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: input, userId', success: false },
        { status: 400 }
      );
    }

    // Single call to unified orchestrator
    const response = await unifiedDaimonicCore.process(input, {
      userId,
      sessionId,
      phase: context?.currentPhase || 'Exploration 1',
      element: context?.targetElement || 'aether',
      state: inferUserState(input),
      sessionCount: context?.sessionCount || 1,
      previousInteractions: context?.previousInteractions || 0
    });

    // Return unified response - no transformation needed
    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        processing_mode: response.processing_meta.strategy.mode,
        complexity_level: response.ui_state.complexity_level
      }
    });

  } catch (error) {
    logger.error('Streamlined Oracle API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: 'Oracle consultation failed', 
        success: false,
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Get collective patterns for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'collective':
        const collective = unifiedDaimonicCore.getCollectivePatterns();
        return NextResponse.json({ success: true, data: collective });

      case 'user_evolution':
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json(
            { error: 'userId required for user_evolution', success: false },
            { status: 400 }
          );
        }
        const evolution = unifiedDaimonicCore.getUserEvolution(userId);
        return NextResponse.json({ success: true, data: evolution });

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter', success: false },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Streamlined Oracle GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve data', success: false },
      { status: 500 }
    );
  }
}

/**
 * Handle user feedback and threshold adjustments
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, feedback } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, action', success: false },
        { status: 400 }
      );
    }

    // Handle different actions through unified core
    let response;
    
    switch (action) {
      case 'request_grounding':
        // Process grounding request through unified core
        response = await unifiedDaimonicCore.process(
          "I need grounding support right now",
          {
            userId,
            sessionId: body.sessionId,
            phase: 'Support',
            element: 'earth',
            state: 'needs_grounding',
            sessionCount: body.sessionCount || 1,
            previousInteractions: body.previousInteractions || 0
          }
        );
        break;

      case 'express_resistance':
        // Process resistance expression
        response = await unifiedDaimonicCore.process(
          `I want to push back on: ${feedback}`,
          {
            userId,
            sessionId: body.sessionId,
            phase: 'Resistance',
            element: 'fire',
            state: 'resistant',
            sessionCount: body.sessionCount || 1,
            previousInteractions: body.previousInteractions || 0
          }
        );
        break;

      case 'complexity_feedback':
        // Get current evolution state (no processing needed)
        const evolution = await unifiedDaimonicCore.getUserEvolution(userId);
        response = {
          primary_message: `Your current complexity readiness: ${Math.round(evolution.current_thresholds.complexity_readiness * 100)}%. ` +
                          `Continue engaging authentically to unlock deeper layers.`,
          agent_voices: [],
          ui_state: {
            complexity_level: evolution.current_thresholds.complexity_readiness,
            visual_hint: 'progression_available',
            show_dialogical: evolution.current_thresholds.complexity_readiness > 0.4,
            show_architectural: evolution.current_thresholds.complexity_readiness > 0.7,
            requires_pause: false
          },
          processing_meta: {
            strategy: { mode: 'feedback_response', reasoning: ['User requested complexity status'] },
            thresholds: evolution.current_thresholds,
            safety_interventions: []
          }
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown action', success: false },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        action_processed: action,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Streamlined Oracle PATCH error:', error);
    return NextResponse.json(
      { error: 'Action processing failed', success: false },
      { status: 500 }
    );
  }
}

/**
 * Simple user state inference - no complex logic
 */
function inferUserState(input: string): string {
  const lower = input.toLowerCase();
  
  if (lower.includes('confused') || lower.includes('lost') || lower.includes('between')) {
    return 'threshold';
  }
  if (lower.includes('calm') || lower.includes('peaceful')) {
    return 'calm';
  }
  if (lower.includes('restless') || lower.includes('anxious') || lower.includes('urgent')) {
    return 'restless';
  }
  if (lower.includes('ground') || lower.includes('support') || lower.includes('help')) {
    return 'needs_grounding';
  }
  if (lower.includes('resist') || lower.includes('push back') || lower.includes('disagree')) {
    return 'resistant';
  }
  
  return 'neutral';
}