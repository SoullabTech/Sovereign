import { NextRequest, NextResponse } from 'next/server';
import { MAIAEmpowermentOrchestrator } from '@/lib/consciousness/MAIAEmpowermentOrchestrator';
import { ShadowConversationOrchestrator } from '@/lib/consciousness/ShadowConversationOrchestrator';
import { AgentBackchannelingIntegration } from '@/lib/consciousness/AgentBackchannelingIntegration';
import { MAIACriticalQuestioningInterface } from '@/lib/consciousness/MAIACriticalQuestioningInterface';
import { MAIAIdealModelingInterface } from '@/lib/consciousness/MAIAIdealModelingInterface';
import { MAIACapabilityRedemptionInterface } from '@/lib/consciousness/MAIACapabilityRedemptionInterface';
import { AccountabilityResponsibilityProtocols } from '@/lib/consciousness/AccountabilityResponsibilityProtocols';
import { CollectiveIntelligenceProtocols } from '@/lib/consciousness/CollectiveIntelligenceProtocols';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

// Cache for orchestrator instances to maintain session state
let empowermentOrchestrator: MAIAEmpowermentOrchestrator | null = null;
let lastInitialized: number = 0;

interface EmpowermentRequest {
  memberId: string;
  memberInput: string;
  context?: {
    topic?: string;
    developmentPhase?: 'awareness' | 'acceptance' | 'action' | 'accountability' | 'advancement' | 'service';
    urgencyLevel?: 'exploration' | 'development' | 'challenge' | 'breakthrough' | 'crisis';
    serviceAspirations?: 'self_service' | 'family_service' | 'community_service' | 'world_service' | 'consciousness_service';
    capabilityFocus?: string[];
    empowermentGoals?: string[];
  };
}

interface EmpowermentResponse {
  success: boolean;
  sessionId?: string;
  response?: string;
  empowermentElements?: any[];
  accountabilityInvitations?: string[];
  capabilityGuidance?: string[];
  serviceVision?: string;
  nextSteps?: any[];
  sessionOutcomes?: any[];
  error?: string;
  timestamp: number;
  cacheDuration: number;
}

async function initializeEmpowermentOrchestrator(): Promise<MAIAEmpowermentOrchestrator> {
  try {
    console.log('🎭 Initializing MAIA Empowerment Orchestrator...');

    // Initialize all required subsystems
    const shadowOrchestrator = new ShadowConversationOrchestrator();
    const backchanneling = new AgentBackchannelingIntegration();
    const criticalQuestioning = new MAIACriticalQuestioningInterface(
      shadowOrchestrator,
      backchanneling,
      new CollectiveIntelligenceProtocols()
    );
    const idealModeling = new MAIAIdealModelingInterface(
      shadowOrchestrator,
      backchanneling,
      new CollectiveIntelligenceProtocols()
    );
    const capabilityRedemption = new MAIACapabilityRedemptionInterface(
      shadowOrchestrator,
      backchanneling,
      new CollectiveIntelligenceProtocols()
    );
    const accountabilityProtocols = new AccountabilityResponsibilityProtocols(
      capabilityRedemption,
      shadowOrchestrator
    );
    const collectiveIntelligence = new CollectiveIntelligenceProtocols();

    // Create the orchestrator
    const orchestrator = new MAIAEmpowermentOrchestrator(
      shadowOrchestrator,
      backchanneling,
      criticalQuestioning,
      idealModeling,
      capabilityRedemption,
      accountabilityProtocols,
      collectiveIntelligence
    );

    console.log('✅ MAIA Empowerment Orchestrator initialized successfully');
    return orchestrator;
  } catch (error) {
    console.error('❌ Failed to initialize Empowerment Orchestrator:', error);
    throw error;
  }
}

async function getOrCreateOrchestrator(): Promise<MAIAEmpowermentOrchestrator> {
  const now = Date.now();

  // Reinitialize if cache is older than 5 minutes
  if (!empowermentOrchestrator || (now - lastInitialized) > 300000) {
    empowermentOrchestrator = await initializeEmpowermentOrchestrator();
    lastInitialized = now;
  }

  return empowermentOrchestrator;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const startTime = Date.now();
    console.log('🎯 Empowerment orchestration request received');

    // Parse request
    const body: EmpowermentRequest = await request.json();
    const { memberId, memberInput, context } = body;

    if (!memberId || !memberInput) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: memberId and memberInput',
        timestamp: Date.now(),
        cacheDuration: 0
      } as EmpowermentResponse, { status: 400 });
    }

    // Get orchestrator instance
    const orchestrator = await getOrCreateOrchestrator();

    // Generate empowerment response
    const empowermentResult = await orchestrator.generateEmpowermentResponse(
      memberId,
      memberInput,
      context || {}
    );

    const processingTime = Date.now() - startTime;
    console.log(`✅ Empowerment response generated in ${processingTime}ms`);

    const response: EmpowermentResponse = {
      success: true,
      sessionId: `session_${Date.now()}`,
      response: empowermentResult.response,
      empowermentElements: empowermentResult.empowermentElements,
      accountabilityInvitations: empowermentResult.accountabilityInvitations,
      capabilityGuidance: empowermentResult.capabilityGuidance,
      serviceVision: empowermentResult.serviceVision,
      nextSteps: empowermentResult.nextSteps,
      sessionOutcomes: empowermentResult.sessionOutcomes,
      timestamp: Date.now(),
      cacheDuration: 30 // 30 seconds
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=30',
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('❌ Empowerment orchestration error:', error);

    const response: EmpowermentResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown empowerment orchestration error',
      timestamp: Date.now(),
      cacheDuration: 0
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Health check endpoint
    const orchestrator = empowermentOrchestrator;

    const healthStatus = {
      status: 'healthy',
      orchestratorInitialized: !!orchestrator,
      lastInitialized: lastInitialized,
      uptime: Date.now() - lastInitialized,
      version: '1.0.0',
      subsystems: {
        shadowOrchestrator: !!orchestrator,
        backchanneling: !!orchestrator,
        criticalQuestioning: !!orchestrator,
        idealModeling: !!orchestrator,
        capabilityRedemption: !!orchestrator,
        accountabilityProtocols: !!orchestrator,
        collectiveIntelligence: !!orchestrator
      },
      timestamp: Date.now()
    };

    return NextResponse.json(healthStatus, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=10',
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: Date.now()
    }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}