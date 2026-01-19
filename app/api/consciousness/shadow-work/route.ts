/**
 * Shadow Work API
 *
 * GET - List available shadow work flows
 * POST - Start or continue a shadow work session
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAvailableShadowFlows,
  getShadowFlow,
  generateHouseShadowFlow,
  suggestShadowFlow,
  ShadowFlow,
} from '@/lib/consciousness/shadowWorkFlows';

export const dynamic = 'force-static';

/**
 * GET /api/consciousness/shadow-work
 *
 * Query params:
 * - flowId: Get a specific flow
 * - house: Get house-specific shadow flow (1-12)
 * - suggest: Get suggested flow based on context
 *
 * No params returns all available flows
 */
export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const flowId = searchParams.get('flowId');
    const house = searchParams.get('house');
    const suggest = searchParams.get('suggest');

    // Get specific flow by ID
    if (flowId) {
      const flow = getShadowFlow(flowId);
      if (!flow) {
        return NextResponse.json(
          { success: false, error: 'Flow not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: flow,
      });
    }

    // Generate house-specific flow
    if (house) {
      const houseNum = parseInt(house);
      if (isNaN(houseNum) || houseNum < 1 || houseNum > 12) {
        return NextResponse.json(
          { success: false, error: 'House must be 1-12' },
          { status: 400 }
        );
      }
      const flow = generateHouseShadowFlow(houseNum);
      if (!flow) {
        return NextResponse.json(
          { success: false, error: 'Failed to generate house flow' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        data: flow,
      });
    }

    // Suggest a flow based on context
    if (suggest === 'true') {
      // Could accept context params like awarenessLevel
      const awarenessLevel = parseInt(searchParams.get('awarenessLevel') || '2');
      const flow = suggestShadowFlow({ awarenessLevel });
      return NextResponse.json({
        success: true,
        data: flow,
      });
    }

    // List all available flows
    const flows = getAvailableShadowFlows();

    // Also include house flows as options
    const houseFlowSummaries = Array.from({ length: 12 }, (_, i) => {
      const houseFlow = generateHouseShadowFlow(i + 1);
      if (!houseFlow) return null;
      return {
        id: houseFlow.id,
        type: houseFlow.type,
        title: houseFlow.title,
        description: houseFlow.description,
        duration: houseFlow.duration,
      };
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        flows: flows.map((f) => ({
          id: f.id,
          type: f.type,
          title: f.title,
          description: f.description,
          duration: f.duration,
          stepCount: f.steps.length,
        })),
        houseFlows: houseFlowSummaries,
      },
    });
  } catch (error) {
    console.error('[Shadow Work API] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shadow work flows' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/consciousness/shadow-work
 *
 * Body:
 * - flowId (required): Flow to use
 * - userId (required): User ID
 * - action: 'start' | 'respond' | 'complete'
 * - stepId: Current step (for respond action)
 * - response: User's response text (for respond action)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { flowId, userId, action = 'start', stepId, response } = body;

    if (!flowId || !userId) {
      return NextResponse.json(
        { success: false, error: 'flowId and userId are required' },
        { status: 400 }
      );
    }

    const flow = getShadowFlow(flowId);
    if (!flow) {
      return NextResponse.json(
        { success: false, error: 'Flow not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'start':
        // Return the full flow for starting a session
        return NextResponse.json({
          success: true,
          data: {
            flow,
            session: {
              flowId,
              userId,
              startedAt: new Date(),
              currentStep: 0,
              responses: {},
            },
          },
        });

      case 'respond':
        // Record a response to a step
        // In a full implementation, this would save to database
        if (!stepId || !response) {
          return NextResponse.json(
            { success: false, error: 'stepId and response required for respond action' },
            { status: 400 }
          );
        }

        const currentStepIndex = flow.steps.findIndex((s) => s.id === stepId);
        const nextStep =
          currentStepIndex < flow.steps.length - 1
            ? flow.steps[currentStepIndex + 1]
            : null;

        return NextResponse.json({
          success: true,
          data: {
            recorded: true,
            stepId,
            nextStep,
            isComplete: !nextStep,
            integrationPractice: !nextStep ? flow.integrationPractice : undefined,
          },
        });

      case 'complete':
        // Mark session as complete
        return NextResponse.json({
          success: true,
          data: {
            completed: true,
            integrationPractice: flow.integrationPractice,
            safetyNote: flow.safetyNote,
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Shadow Work API] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process shadow work request' },
      { status: 500 }
    );
  }
}
