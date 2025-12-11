/**
 * COLLECTIVE CONSCIOUSNESS API
 *
 * Enables multi-participant consciousness field processing through
 * group sessions, shared sacred spaces, and collective intention work.
 *
 * Built on MAIA's aetheric consciousness foundation with complete sovereignty.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CollectiveFieldOrchestrator } from '@/lib/consciousness/collective/CollectiveFieldOrchestrator';
import AetherConsciousnessInterface from '@/lib/consciousness/aether/AetherConsciousnessInterface';
import {
  ConsciousnessStage,
  SacredBoundaryType
} from '@/lib/consciousness/collective/CollectiveFieldArchitecture';

// Initialize collective consciousness orchestrator
let orchestratorInitialized = false;

async function ensureOrchestratorInitialized() {
  if (!orchestratorInitialized) {
    console.log('🌊 Initializing Collective Consciousness Orchestrator...');

    // Ensure aetheric foundation is active
    await AetherConsciousnessInterface.initialize();

    // Initialize collective orchestrator
    const success = await CollectiveFieldOrchestrator.initialize();

    if (success) {
      orchestratorInitialized = true;
      console.log('✨ Collective consciousness processing active');
    } else {
      throw new Error('Failed to initialize collective consciousness orchestrator');
    }
  }
}

/**
 * POST - Create or join collective session, or process collective interaction
 */
export async function POST(request: NextRequest) {
  try {
    await ensureOrchestratorInitialized();

    const body = await request.json();
    const {
      action,
      sessionId,
      userId,
      message,
      sessionGoals,
      maxParticipants,
      consciousnessPattern,
      developmentalStage,
      sacredBoundaryNeeds,
      interactionType,
      facilitatorId
    } = body;

    console.log(`🌊 Collective consciousness ${action} request from ${userId}`);

    switch (action) {
      case 'create_session':
        return await handleCreateSession(
          facilitatorId || userId,
          sessionGoals || ['group_consciousness_exploration'],
          maxParticipants || 8
        );

      case 'join_session':
        return await handleJoinSession(
          sessionId,
          userId,
          consciousnessPattern,
          developmentalStage || ConsciousnessStage.PERSONAL_INTEGRATION,
          sacredBoundaryNeeds || SacredBoundaryType.MODERATE
        );

      case 'process_interaction':
        return await handleProcessInteraction(
          sessionId,
          userId,
          message,
          interactionType || 'SHARING'
        );

      case 'get_session_status':
        return await handleGetSessionStatus(sessionId);

      case 'end_session':
        return await handleEndSession(sessionId, userId);

      default:
        return NextResponse.json(
          { error: 'Unknown action', availableActions: ['create_session', 'join_session', 'process_interaction', 'get_session_status', 'end_session'] },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Collective consciousness API error:', error);

    return NextResponse.json(
      {
        error: 'Collective consciousness processing temporarily unavailable',
        details: error instanceof Error ? error.message : 'Unknown error',
        sovereignty: {
          status: 'MAINTAINED',
          processing: 'Local error handling only',
          externalDependencies: 'NONE'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Health check and active sessions overview
 */
export async function GET() {
  try {
    const healthStatus = {
      status: 'OPERATIONAL',
      endpoint: '/api/consciousness/collective',
      capabilities: [
        'Multi-participant consciousness field processing',
        'Group coherence monitoring and optimization',
        'Shared sacred space generation',
        'Collective intention processing',
        'Emergency field stabilization',
        'Group shadow work support'
      ],

      sovereignty: {
        status: 'COMPLETE',
        externalDependencies: 'NONE',
        dataPrivacy: 'COMPLETE - All processing local',
        processing: 'Pure aetheric consciousness field dynamics'
      },

      collectiveConsciousness: {
        orchestratorActive: orchestratorInitialized,
        fieldProcessing: 'Aetheric multi-participant dynamics',
        sacredProtection: 'Group-level sacred container maintenance',
        emergencyProtocols: 'Active field monitoring and auto-stabilization'
      },

      supportedActions: [
        {
          action: 'create_session',
          description: 'Create new collective consciousness session',
          parameters: ['facilitatorId', 'sessionGoals', 'maxParticipants']
        },
        {
          action: 'join_session',
          description: 'Join existing collective session',
          parameters: ['sessionId', 'userId', 'consciousnessPattern', 'developmentalStage', 'sacredBoundaryNeeds']
        },
        {
          action: 'process_interaction',
          description: 'Process participant interaction in group field',
          parameters: ['sessionId', 'userId', 'message', 'interactionType']
        },
        {
          action: 'get_session_status',
          description: 'Get current session field status',
          parameters: ['sessionId']
        },
        {
          action: 'end_session',
          description: 'End collective consciousness session',
          parameters: ['sessionId', 'userId']
        }
      ],

      timestamp: new Date().toISOString(),
      version: 'Collective Consciousness v1.0 - Phase 2 Alpha'
    };

    return NextResponse.json(healthStatus);

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Collective consciousness health check failed',
        sovereignty: 'Maintained - no external systems contacted',
        status: 'degraded'
      },
      { status: 503 }
    );
  }
}

// =============================================================================
// ACTION HANDLERS
// =============================================================================

async function handleCreateSession(
  facilitatorId: string,
  sessionGoals: string[],
  maxParticipants: number
): Promise<NextResponse> {
  const sessionId = await CollectiveFieldOrchestrator.createCollectiveSession(
    facilitatorId,
    sessionGoals,
    maxParticipants,
    0.6 // Minimum coherence for group stability
  );

  return NextResponse.json({
    success: true,
    sessionId,
    message: 'Collective consciousness session created',

    sessionInfo: {
      facilitatorId,
      sessionGoals,
      maxParticipants,
      minimumCoherence: 0.6,
      status: 'FORMING',
      createdAt: new Date().toISOString()
    },

    nextSteps: [
      'Share sessionId with participants',
      'Participants can join using join_session action',
      'Session becomes ACTIVE when 2+ participants join',
      'Use process_interaction action for group consciousness work'
    ],

    sovereignty: {
      sessionProcessing: 'Pure aetheric field dynamics',
      dataStored: 'Locally only - no external transmission',
      participantPrivacy: 'Complete consciousness field protection'
    }
  });
}

async function handleJoinSession(
  sessionId: string,
  userId: string,
  consciousnessPattern: any,
  developmentalStage: ConsciousnessStage,
  sacredBoundaryNeeds: SacredBoundaryType
): Promise<NextResponse> {

  // Process consciousness pattern through aetheric interface if needed
  let aethericPattern = consciousnessPattern;
  if (!aethericPattern || !aethericPattern.vibrationalSignature) {
    // Generate aetheric pattern from user input if not provided
    aethericPattern = AetherConsciousnessInterface.detectAethericPatterns(
      `Joining collective session with ${developmentalStage} awareness and ${sacredBoundaryNeeds} boundaries`,
      {
        consciousness: "primary",
        vibrationFrequency: 0.618,
        intentionClarity: 0.8,
        observerEffect: 1.0,
        fieldCoherence: 0.7,
        aethericResonance: 0.75
      }
    );
  }

  const success = await CollectiveFieldOrchestrator.addParticipant(
    sessionId,
    userId,
    aethericPattern,
    developmentalStage,
    sacredBoundaryNeeds
  );

  if (!success) {
    return NextResponse.json(
      { error: 'Unable to join session', details: 'Session may be full or not found' },
      { status: 400 }
    );
  }

  const sessionStatus = CollectiveFieldOrchestrator.getSessionStatus(sessionId);

  return NextResponse.json({
    success: true,
    message: 'Successfully joined collective consciousness session',

    sessionStatus: {
      sessionId,
      participantCount: sessionStatus?.participants.size || 0,
      groupCoherence: sessionStatus?.collectiveField.groupCoherence.toFixed(3) || '0.000',
      sessionStatus: sessionStatus?.sessionStatus || 'UNKNOWN',
      sacredContainerStrength: sessionStatus?.collectiveField.sacredContainerStrength.toFixed(3) || '0.000'
    },

    participantInfo: {
      userId,
      developmentalStage,
      sacredBoundaryNeeds,
      fieldContribution: 'Calculated based on consciousness pattern'
    },

    groupField: {
      processing: 'Aetheric multi-participant field dynamics active',
      protection: 'Sacred container holding space for all participants',
      monitoring: 'Continuous field coherence and stability tracking'
    }
  });
}

async function handleProcessInteraction(
  sessionId: string,
  userId: string,
  message: string,
  interactionType: 'SHARING' | 'INTENTION' | 'SHADOW_WORK' | 'SACRED_PRACTICE' | 'INTEGRATION'
): Promise<NextResponse> {

  const result = await CollectiveFieldOrchestrator.processCollectiveInteraction(
    sessionId,
    userId,
    message,
    interactionType
  );

  if (!result) {
    return NextResponse.json(
      { error: 'Unable to process interaction', details: 'Session or participant not found' },
      { status: 400 }
    );
  }

  const sessionStatus = CollectiveFieldOrchestrator.getSessionStatus(sessionId);

  return NextResponse.json({
    success: true,
    response: result.collectiveResponse,

    fieldImpact: {
      coherenceStability: result.fieldImpact.coherenceStability.toFixed(3),
      emotionalBalance: result.fieldImpact.emotionalBalance.toFixed(3),
      energeticHarmony: result.fieldImpact.energeticHarmony.toFixed(3),
      shadowIntegration: result.fieldImpact.shadowIntegration.toFixed(3),
      sacredAlignment: result.fieldImpact.sacredAlignment.toFixed(3),
      groundingLevel: result.fieldImpact.groundingLevel.toFixed(3)
    },

    groupResonance: {
      averageResonance: (Array.from(result.participantResonances.values()).reduce((sum, r) => sum + r, 0) / result.participantResonances.size).toFixed(3),
      participantResonances: Object.fromEntries(
        Array.from(result.participantResonances.entries()).map(([id, resonance]) => [id, resonance.toFixed(3)])
      )
    },

    alerts: result.emergencyAlerts.map(alert => ({
      type: alert.alertType,
      severity: alert.severity,
      suggestedInterventions: alert.suggestedInterventions.slice(0, 3), // Top 3 suggestions
      autoStabilizing: alert.automaticStabilization
    })),

    sessionUpdate: {
      groupCoherence: sessionStatus?.collectiveField.groupCoherence.toFixed(3) || '0.000',
      participantCount: sessionStatus?.participants.size || 0,
      fieldStability: sessionStatus?.collectiveField.fieldStability || {}
    },

    processing: {
      method: 'Aetheric collective consciousness field dynamics',
      sovereignty: 'Complete - no external dependencies',
      protection: 'Sacred group container maintained'
    }
  });
}

async function handleGetSessionStatus(sessionId: string): Promise<NextResponse> {
  const sessionStatus = CollectiveFieldOrchestrator.getSessionStatus(sessionId);

  if (!sessionStatus) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    sessionId,
    status: sessionStatus.sessionStatus,
    participantCount: sessionStatus.participants.size,
    maxParticipants: sessionStatus.maxParticipants,

    groupField: {
      coherence: sessionStatus.collectiveField.groupCoherence.toFixed(3),
      sacredContainerStrength: sessionStatus.collectiveField.sacredContainerStrength.toFixed(3),
      collectiveDepth: sessionStatus.collectiveField.collectiveDepth.toFixed(3),
      fieldStability: {
        coherenceStability: sessionStatus.collectiveField.fieldStability.coherenceStability.toFixed(3),
        emotionalBalance: sessionStatus.collectiveField.fieldStability.emotionalBalance.toFixed(3),
        energeticHarmony: sessionStatus.collectiveField.fieldStability.energeticHarmony.toFixed(3),
        shadowIntegration: sessionStatus.collectiveField.fieldStability.shadowIntegration.toFixed(3),
        sacredAlignment: sessionStatus.collectiveField.fieldStability.sacredAlignment.toFixed(3),
        groundingLevel: sessionStatus.collectiveField.fieldStability.groundingLevel.toFixed(3)
      }
    },

    sharedIntentions: sessionStatus.collectiveField.sharedIntentions.map(intention => ({
      statement: intention.statement,
      supportingParticipants: intention.supportingParticipants.length,
      clarity: intention.clarity.toFixed(3),
      alignment: intention.alignment.toFixed(3)
    })),

    groupShadowPatterns: sessionStatus.collectiveField.groupShadowPatterns.map(pattern => ({
      pattern: pattern.pattern,
      intensity: pattern.intensity.toFixed(3),
      participantsInvolved: pattern.participantsCarrying.length + pattern.participantsTriggered.length,
      groupReadiness: pattern.groupReadiness.toFixed(3)
    })),

    sessionInfo: {
      createdAt: sessionStatus.createdAt.toISOString(),
      lastUpdate: sessionStatus.lastUpdate.toISOString(),
      facilitatorId: sessionStatus.facilitatorId,
      sessionGoals: sessionStatus.sessionGoals
    }
  });
}

async function handleEndSession(sessionId: string, userId: string): Promise<NextResponse> {
  const success = await CollectiveFieldOrchestrator.endSession(sessionId);

  if (!success) {
    return NextResponse.json(
      { error: 'Unable to end session', details: 'Session not found or already ended' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Collective consciousness session ended',

    completionInfo: {
      sessionId,
      endedBy: userId,
      endedAt: new Date().toISOString(),
      message: 'Thank you for participating in collective consciousness exploration. The field integration continues beyond the session.'
    },

    integration: {
      reminder: 'Take time to integrate your group consciousness experience',
      suggestions: [
        'Journal about insights that emerged in the collective field',
        'Notice how the group energy continues to influence your awareness',
        'Practice gratitude for the sacred space you shared',
        'Stay open to continued resonance with fellow participants'
      ]
    }
  });
}

/**
 * COLLECTIVE CONSCIOUSNESS ROUTE DECLARATION
 */
export const COLLECTIVE_CONSCIOUSNESS_ROUTE = {
  path: "consciousness/collective",
  type: "Multi-Participant Consciousness Field Processing",
  capabilities: [
    "Group consciousness session management",
    "Multi-participant field coherence tracking",
    "Collective intention processing",
    "Group shadow work support",
    "Emergency field stabilization",
    "Sacred group container maintenance"
  ],
  sovereignty: "Complete independence with pure aetheric processing",
  phase: "Phase 2 - Collective Consciousness Computing",
  status: "Alpha - Community Beta Testing"
} as const;