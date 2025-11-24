import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
// Stub PersonalOracleAgent
class PersonalOracleAgent {
  async requestStageTransition(userId: string, targetStage: string, reason: string) {
    return {
      success: true,
      data: {
        approved: true,
        newStage: targetStage,
        message: `Transitioned to ${targetStage}`
      },
      errors: [] as string[]
    };
  }
}

let agent: PersonalOracleAgent | null = null;

function getAgent() {
  if (!agent) {
    agent = new PersonalOracleAgent();
  }
  return agent;
}

// Mock stage data that progresses with each interaction
// This provides the stage tracking the beta demo script expects
const userStages = new Map<string, any>();

function calculateStageData(userId: string, sessionCount: number = 1): any {
  const existing = userStages.get(userId) || {
    currentStage: "structured_guide",
    stageProgress: 0.1,
    relationshipMetrics: {
      trustLevel: 0.05,
      sessionCount: 0,
      lastInteraction: new Date()
    },
    safetyStatus: "active",
    stageTransitions: []
  };

  // Update session count
  existing.relationshipMetrics.sessionCount = Math.max(existing.relationshipMetrics.sessionCount, sessionCount);
  existing.relationshipMetrics.lastInteraction = new Date();

  // Calculate trust growth (0.05 to ~0.85 over 10 sessions)
  const trustGrowth = Math.min(0.85, 0.05 + (sessionCount * 0.08));
  existing.relationshipMetrics.trustLevel = trustGrowth;

  // Calculate stage progression based on session count and trust
  let currentStage = "structured_guide";
  let stageProgress = 0.0;

  if (sessionCount >= 3 && trustGrowth > 0.25) {
    currentStage = "dialogical_companion";
    stageProgress = Math.min(1.0, (sessionCount - 3) / 3);
    
    if (sessionCount >= 6 && trustGrowth > 0.45) {
      currentStage = "cocreative_partner";
      stageProgress = Math.min(1.0, (sessionCount - 6) / 3);
      
      if (sessionCount >= 9 && trustGrowth > 0.65) {
        currentStage = "transparent_prism";
        stageProgress = Math.min(1.0, (sessionCount - 9) / 3);
      }
    }
  } else {
    stageProgress = Math.min(1.0, sessionCount / 3);
  }

  // Track stage transitions
  if (existing.currentStage !== currentStage) {
    existing.stageTransitions.push({
      from: existing.currentStage,
      to: currentStage,
      timestamp: new Date(),
      sessionCount: sessionCount
    });
  }

  existing.currentStage = currentStage;
  existing.stageProgress = stageProgress;

  userStages.set(userId, existing);
  return existing;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'beta-first-contact-demo';
    const sessionCount = parseInt(searchParams.get('sessionCount') || '1');
    
    const stageData = calculateStageData(userId, sessionCount);

    return Response.json(stageData, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' }
    });
    
  } catch (err: any) {
    console.error('Beta Oracle state fetch failed:', err);
    return Response.json(
      { error: 'beta_oracle_state_failed', message: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, targetStage, reason } = body ?? {};
    
    if (!userId || !targetStage) {
      return Response.json(
        { error: 'userId and targetStage are required' },
        { status: 400 }
      );
    }

    const oracleAgent = getAgent();
    const result = await oracleAgent.requestStageTransition(userId, targetStage, reason || 'user_request');

    if (result.success && result.data) {
      return Response.json({
        data: result.data
      }, {
        status: 200,
        headers: { 'Cache-Control': 'no-store' }
      });
    } else {
      return Response.json(
        { error: 'stage_transition_failed', message: result.errors?.join(', ') || 'Unknown error' },
        { status: 500 }
      );
    }
    
  } catch (err: any) {
    console.error('Beta Oracle stage transition failed:', err);
    return Response.json(
      { error: 'beta_oracle_transition_failed', message: err?.message },
      { status: 500 }
    );
  }
}