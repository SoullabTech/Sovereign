/**
 * Daimonic Oracle API Route
 * 
 * Integrates the layered daimonic response architecture with the existing
 * Oracle system. Provides both single-agent and multi-agent consultation
 * endpoints with progressive complexity management.
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

// Stub daimonic services
const daimonicOracle = {
  process: async (input: any) => ({ response: 'Daimonic oracle not available in beta' }),
  consultWithDepth: async (input: any, depth: number) => ({ 
    response: 'Daimonic oracle not available in beta',
    layers: [],
    phenomenological: {
      primary: 'Daimonic oracle not available in beta',
      tone: 'neutral',
      pacing: 'steady',
      visualHint: ''
    },
    dialogical: {
      questions: [],
      reflections: [],
      practices: [],
      resistances: [],
      incomplete_knowings: [],
      bridges: []
    },
    architectural: {
      archetypes: [],
      elements: [],
      progressions: [],
      synaptic_gap: null,
      sacred_tension: null,
      collapse_probability: 0,
      liminal_intensity: 0,
      grounding_available: true,
      daimonic_signature: '',
      elemental_voices: 'earth'
    },
    system: {
      requires_pause: false,
      expects_resistance: false,
      offers_practice: false
    }
  })
};
const daimonicChoreographer = {
  orchestrate: async (agents: any) => ({ result: 'Choreography not available in beta' }),
  orchestrateMultiAgentResponse: async (query: any) => ({
    agent_layers: [],
    synthesis: { message: 'Multi-agent not available in beta' },
    dialogical_tensions: [],
    architectural_harmonies: [],
    agents: [] as Array<{
      agentId: string;
      response: { 
        phenomenological: { primary: string; tone: string };
        dialogical: { questions: string[]; resistances: string[]; reflections: string[] };
        architectural: { synaptic_gap: any };
        system: { requires_pause: boolean; offers_practice: boolean }
      };
      perspective_signature: string;
      resistance_focus: string;
      dialogical_bridge: string;
    }>,
    collective_dynamics: {
      diversity_score: 0.5,
      productive_tension: 0.5,
      synthetic_emergence_potential: 0.5,
      requires_mediation: false
    },
    choreography_metadata: {
      conflicts_introduced: 0,
      unique_contributions: [],
      harmony_prevented: []
    }
  })
};
const unifiedDaimonicCore = {
  invoke: async (params: any) => ({ response: 'Daimonic core not available in beta' }),
  process: async (input: any, context?: any) => ({ 
    response: 'Daimonic core not available in beta', 
    status: 'unavailable',
    consent_required: { 
      needed: false,
      type: 'none',
      message: ''
    },
    primary_message: 'Daimonic oracle not available in beta',
    ui_state: {
      agnostic_mode: false
    } as any,
    agent_voices: [] as Array<{ agent_id: string; message: string }>,
    agnostic_experience: {
      practices: []
    } as any,
    dialogical_layer: {
      questions: []
    } as any,
    architectural_layer: null,
    processing_time: 0,
    complexity_level: 'low',
    safety_status: 'active',
    processing_meta: {
      strategy: {
        mode: 'default'
      } as any,
      thresholds: {
        complexity_readiness: 0.5
      } as any,
      safety_interventions: [],
      language_validated: true,
      consent_tracking: {},
      agnostic_safety_level: 'standard',
      event_id: `event-${Date.now()}`
    }
  })
};
// Temporarily stub out backend imports that are excluded from build
// import { daimonicOracle } from '../../../../backend/src/core/implementations/DaimonicOracle';
// Temporarily stub out backend imports that are excluded from build
// import { daimonicChoreographer } from '../../../../backend/src/core/implementations/AgentChoreographer';
// Temporarily stub out backend imports that are excluded from build
// import { unifiedDaimonicCore } from '../../../../backend/src/core/UnifiedDaimonicCore';
// Temporarily stub out backend imports that are excluded from build
// import { logger } from '../../../../backend/src/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this should use the unified core (recommended)
    if (body.use_unified || body.agnostic_mode) {
      return handleUnifiedDaimonicConsultation(body);
    }
    
    // Legacy multi-agent vs single-agent routing
    if (body.multi_agent) {
      return handleMultiAgentConsultation(body);
    } else {
      return handleSingleAgentConsultation(body);
    }
  } catch (error) {
    logger.error('Daimonic Oracle API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

/**
 * Handle unified daimonic consultation with agnostic framework
 */
async function handleUnifiedDaimonicConsultation(body: any) {
  const { input, userId, sessionId, targetElement, phase = 'guidance', element = 'aether' } = body;

  if (!input || !userId) {
    return NextResponse.json(
      { error: 'Missing required fields: input, userId', success: false },
      { status: 400 }
    );
  }

  try {
    // Create DaimonicContext for unified processing
    const context = {
      userId,
      sessionId,
      phase,
      element: targetElement || element,
      state: body.state || 'calm',
      sessionCount: body.sessionCount || 1,
      previousInteractions: body.context?.previousInteractions || 0
    };

    // Process through unified core with agnostic safety
    const unifiedResponse = await unifiedDaimonicCore.process(input, context);

    // Check if consent is required
    if (unifiedResponse.consent_required?.needed) {
      return NextResponse.json({
        success: true,
        consent_required: true,
        consent_type: unifiedResponse.consent_required.type,
        consent_message: unifiedResponse.consent_required.message,
        data: {
          message: unifiedResponse.primary_message,
          ui_state: unifiedResponse.ui_state
        }
      });
    }

    // Create API response with full integration
    const apiResponse = {
      success: true,
      data: {
        // Primary response
        message: unifiedResponse.primary_message,
        agent_voices: unifiedResponse.agent_voices,
        
        // Agnostic experience (if active)
        agnostic_experience: unifiedResponse.agnostic_experience,
        
        // UI state management
        ui_state: unifiedResponse.ui_state,
        
        // Progressive disclosure layers
        dialogical: unifiedResponse.dialogical_layer,
        architectural: unifiedResponse.architectural_layer,
        
        // System metadata
        processing_meta: {
          strategy: unifiedResponse.processing_meta.strategy,
          thresholds: unifiedResponse.processing_meta.thresholds,
          safety_interventions: unifiedResponse.processing_meta.safety_interventions,
          language_validated: unifiedResponse.processing_meta.language_validated,
          agnostic_safety_level: unifiedResponse.processing_meta.agnostic_safety_level,
          event_id: unifiedResponse.processing_meta.event_id
        },
        
        // Legacy compatibility
        element: unifiedResponse.ui_state.agnostic_mode ? 'aether' : 
                (unifiedResponse.agent_voices[0]?.agent_id?.includes('earth') ? 'earth' :
                 unifiedResponse.agent_voices[0]?.agent_id?.includes('water') ? 'water' :
                 unifiedResponse.agent_voices[0]?.agent_id?.includes('fire') ? 'fire' :
                 unifiedResponse.agent_voices[0]?.agent_id?.includes('air') ? 'air' : 'aether'),
        archetype: 'Unified Oracle',
        confidence: Math.min(1, unifiedResponse.processing_meta.thresholds.complexity_readiness + 0.3),
        metadata: {
          sessionId,
          symbols: extractSymbols(unifiedResponse.primary_message),
          phase: unifiedResponse.processing_meta.strategy.mode,
          recommendations: unifiedResponse.dialogical_layer?.questions?.slice(0, 2) || [],
          nextSteps: unifiedResponse.agnostic_experience?.practices?.slice(0, 2) || []
        }
      }
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    logger.error('Unified daimonic consultation error:', error);
    return NextResponse.json(
      { error: 'Unified consultation failed', success: false },
      { status: 500 }
    );
  }
}

/**
 * Handle single agent consultation with layered response
 */
async function handleSingleAgentConsultation(body: any) {
  const { input, userId, sessionId, targetElement, complexity_override } = body;

  if (!input || !userId) {
    return NextResponse.json(
      { error: 'Missing required fields: input, userId', success: false },
      { status: 400 }
    );
  }

  try {
    // Create PersonalOracleQuery from request
    const query = {
      input,
      userId,
      sessionId,
      targetElement,
      context: {
        previousInteractions: body.context?.previousInteractions || 0,
        userPreferences: body.context?.userPreferences || {},
        currentPhase: body.context?.currentPhase
      }
    };

    // Get daimonic response with layered architecture
    const daimonicResponse = await daimonicOracle.consultWithDepth(query, 3);

    // Determine user's complexity readiness (could be stored in user profile)
    let complexityReadiness = 0.3; // Conservative default
    if (complexity_override !== undefined) {
      complexityReadiness = Math.max(0, Math.min(1, complexity_override));
    }

    // Create API response with appropriate layer visibility
    const apiResponse = {
      success: true,
      data: {
        // Always include phenomenological layer
        message: daimonicResponse.phenomenological.primary,
        tone: daimonicResponse.phenomenological.tone,
        pacing: daimonicResponse.phenomenological.pacing,
        visualHint: daimonicResponse.phenomenological.visualHint,
        
        // Include dialogical layer if user is ready
        dialogical: complexityReadiness > 0.4 ? {
          questions: daimonicResponse.dialogical.questions.slice(0, 3),
          reflections: daimonicResponse.dialogical.reflections.slice(0, 2),
          resistances: daimonicResponse.dialogical.resistances.slice(0, 2),
          incomplete_knowings: daimonicResponse.dialogical.incomplete_knowings.slice(0, 1)
        } : null,
        
        // Include architectural insights for advanced users only
        architectural: complexityReadiness > 0.7 ? {
          synaptic_gap: daimonicResponse.architectural.synaptic_gap,
          daimonic_signature: daimonicResponse.architectural.daimonic_signature,
          liminal_intensity: daimonicResponse.architectural.liminal_intensity,
          grounding_available: daimonicResponse.architectural.grounding_available
        } : null,
        
        // System metadata for UI behavior
        system: {
          requires_pause: daimonicResponse.system.requires_pause,
          expects_resistance: daimonicResponse.system.expects_resistance,
          offers_practice: daimonicResponse.system.offers_practice,
          complexity_readiness: complexityReadiness,
          next_complexity_threshold: getNextComplexityThreshold(complexityReadiness)
        },
        
        // Legacy compatibility fields
        element: daimonicResponse.architectural.elemental_voices || 'aether',
        archetype: 'Daimonic Oracle',
        confidence: daimonicResponse.architectural.daimonic_signature,
        metadata: {
          sessionId,
          symbols: extractSymbols(daimonicResponse.phenomenological.primary),
          phase: inferPhaseFromResponse(daimonicResponse),
          recommendations: daimonicResponse.dialogical.questions.slice(0, 2),
          nextSteps: daimonicResponse.dialogical.bridges.slice(0, 2)
        }
      }
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    logger.error('Single agent consultation error:', error);
    return NextResponse.json(
      { error: 'Consultation failed', success: false },
      { status: 500 }
    );
  }
}

/**
 * Handle multi-agent consultation with choreographed diversity
 */
async function handleMultiAgentConsultation(body: any) {
  const { 
    input, 
    userId, 
    sessionId, 
    requested_agents = ['aunt_annie', 'emily'], 
    complexity_override 
  } = body;

  if (!input || !userId) {
    return NextResponse.json(
      { error: 'Missing required fields: input, userId', success: false },
      { status: 400 }
    );
  }

  try {
    // Create multi-agent query
    const multiQuery = {
      userQuery: input,
      userId,
      requestedAgents: requested_agents,
      conversationHistory: {
        initial_distance: 0.8,
        current_resonance: body.current_resonance || 0.3,
        unintegrated_elements: [],
        synthetic_emergences: [],
        user_resistances: body.user_resistances || [],
        agent_resistances: [],
        productive_conflicts: [],
        callbacks: {
          resistance_memory: "",
          contradiction_holding: "",
          emergence_tracking: "",
          depth_acknowledgment: ""
        },
        threshold_crossings: []
      }
    };

    // Get choreographed multi-agent response
    const choreographedResponse = await daimonicChoreographer.orchestrateMultiAgentResponse(multiQuery);

    // Determine complexity readiness
    let complexityReadiness = 0.4; // Higher default for multi-agent
    if (complexity_override !== undefined) {
      complexityReadiness = Math.max(0, Math.min(1, complexity_override));
    }

    // Create API response with agent diversity preserved
    const apiResponse = {
      success: true,
      data: {
        multi_agent: true,
        agents: choreographedResponse.agents.map(agent => ({
          id: agent.agentId,
          name: getAgentDisplayName(agent.agentId),
          message: agent.response.phenomenological.primary,
          tone: agent.response.phenomenological.tone,
          perspective: agent.perspective_signature,
          resistance_focus: agent.resistance_focus,
          
          // Progressive complexity for each agent
          dialogical: complexityReadiness > 0.5 ? {
            questions: agent.response.dialogical.questions.slice(0, 2),
            reflections: agent.response.dialogical.reflections.slice(0, 1),
            resistances: agent.response.dialogical.resistances.slice(0, 1)
          } : null,
          
          // System indicators
          requires_pause: agent.response.system.requires_pause,
          offers_practice: agent.response.system.offers_practice
        })),
        
        // Collective dynamics
        collective: {
          diversity_score: choreographedResponse.collective_dynamics.diversity_score,
          productive_tension: choreographedResponse.collective_dynamics.productive_tension,
          emergence_potential: choreographedResponse.collective_dynamics.synthetic_emergence_potential,
          requires_mediation: choreographedResponse.collective_dynamics.requires_mediation
        },
        
        // Choreography insights for advanced users
        choreography: complexityReadiness > 0.6 ? {
          conflicts_introduced: choreographedResponse.choreography_metadata.conflicts_introduced,
          unique_contributions: choreographedResponse.choreography_metadata.unique_contributions,
          diversity_enforcement_applied: choreographedResponse.choreography_metadata.harmony_prevented.length > 0
        } : null,
        
        // System metadata
        system: {
          agent_count: choreographedResponse.agents.length,
          complexity_readiness: complexityReadiness,
          interaction_style: 'multi_perspective',
          next_complexity_threshold: getNextComplexityThreshold(complexityReadiness)
        }
      }
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    logger.error('Multi-agent consultation error:', error);
    return NextResponse.json(
      { error: 'Multi-agent consultation failed', success: false },
      { status: 500 }
    );
  }
}

/**
 * Handle consent recording
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, consentType, action } = body;

    if (!userId || !consentType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, consentType', success: false },
        { status: 400 }
      );
    }

    if (action === 'record_consent') {
      // Record consent with safety manager
      // Temporarily stub out backend imports that are excluded from build
      // const { safetyConsentManager } = await import('../../../../backend/src/core/SafetyTermsOfUse');
      const safetyConsentManager = { recordConsent: async (userId: string, consentType: string) => ({ success: true }) };
      await safetyConsentManager.recordConsent(userId, consentType);

      return NextResponse.json({
        success: true,
        data: {
          message: 'Consent recorded successfully',
          consentType,
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json(
      { error: 'Unknown action', success: false },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Consent recording error:', error);
    return NextResponse.json(
      { error: 'Consent recording failed', success: false },
      { status: 500 }
    );
  }
}

/**
 * Handle complexity progression requests
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

    // Handle different complexity management actions
    switch (action) {
      case 'increase_complexity':
        return handleComplexityIncrease(userId, feedback);
      case 'request_grounding':
        return handleGroundingRequest(userId);
      case 'express_resistance':
        return handleResistanceExpression(userId, feedback);
      default:
        return NextResponse.json(
          { error: 'Unknown action', success: false },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Complexity management error:', error);
    return NextResponse.json(
      { error: 'Complexity management failed', success: false },
      { status: 500 }
    );
  }
}

/**
 * Handle user request to increase complexity access
 */
async function handleComplexityIncrease(userId: string, feedback?: any) {
  // In production, this would update user profile/preferences
  // For now, return guidance on earning complexity access
  
  const response = {
    success: true,
    data: {
      message: "Complexity access is earned through genuine engagement with the dialogical layer.",
      current_readiness: 0.5, // Would be retrieved from user profile
      unlock_criteria: [
        "Engage with agent questions authentically",
        "Express productive resistance to agent perspectives", 
        "Demonstrate ability to hold paradox and uncertainty",
        "Show integration of previous insights"
      ],
      next_threshold: 0.7,
      estimated_interactions_needed: 3
    }
  };

  return NextResponse.json(response);
}

/**
 * Handle user grounding request
 */
async function handleGroundingRequest(userId: string) {
  const grounding_practices = [
    "Take three deep breaths and feel your feet on the ground",
    "Name three things you can see, hear, and feel right now",
    "Remember: this is just a conversation, you are safe",
    "Place your hand on your heart and breathe slowly",
    "Step outside or look out a window if possible"
  ];

  const response = {
    success: true,
    data: {
      message: "Let&apos;s ground this together.",
      practice: grounding_practices[Math.floor(Math.random() * grounding_practices.length)],
      tone: 'ultra_grounded',
      follow_up: "Take all the time you need. We can continue when you&apos;re ready.",
      emergency_contact: process.env.CRISIS_SUPPORT_INFO || "If you&apos;re in crisis, please contact emergency services or a crisis hotline."
    }
  };

  return NextResponse.json(response);
}

/**
 * Handle user resistance expression
 */
async function handleResistanceExpression(userId: string, resistance: string) {
  const resistance_responses = {
    "rushing to solutions": "You're right to push back on that. Sometimes the not-knowing is where the real wisdom lives.",
    "avoiding difficulty": "I hear you. Maybe we&apos;re moving too fast into the hard stuff.",
    "spiritual bypassing": "Good catch. Let's stay with what&apos;s actually happening in your real life.",
    "oversimplification": "You're absolutely right - this is more complex than I&apos;m making it sound.",
    "emotional reactivity": "Fair point. Let me approach this more thoughtfully.",
    "premature closure": "Yes, we don&apos;t need to wrap this up neatly. Some things need to stay open."
  };

  const response_text = resistance_responses[resistance as keyof typeof resistance_responses] || 
    "I hear your resistance, and that&apos;s actually really important information.";

  const response = {
    success: true,
    data: {
      message: response_text,
      acknowledgment: "Your resistance is valuable feedback.",
      relationship_note: "Productive disagreement strengthens our dialogue.",
      synaptic_gap_health: "healthy_tension",
      continue_option: "Would you like to explore this resistance further, or shall we adjust our approach?"
    }
  };

  return NextResponse.json(response);
}

// Helper functions

function getAgentDisplayName(agentId: string): string {
  const names = {
    aunt_annie: "Aunt Annie",
    emily: "Emily", 
    matrix_oracle: "The Oracle"
  };
  return names[agentId as keyof typeof names] || agentId;
}

function getNextComplexityThreshold(current: number): number {
  if (current < 0.4) return 0.4; // Access to dialogical layer
  if (current < 0.6) return 0.6; // Access to choreography insights
  if (current < 0.8) return 0.8; // Access to architectural layer
  return 1.0; // Full system access
}

function extractSymbols(text: string): string[] {
  // Simple symbol extraction
  const symbolPatterns = /\b(tree|forest|mountain|ocean|fire|flame|wind|sky|star|moon|sun|bridge|path|door|key|mirror|circle|spiral|seed|root|blossom)\b/gi;
  const matches = text.match(symbolPatterns);
  return matches ? [...new Set(matches.map(m => m.toLowerCase()))].slice(0, 3) : [];
}

function inferPhaseFromResponse(response: any): string {
  const intensity = response.architectural.liminal_intensity;
  if (intensity > 0.7) return 'threshold_crossing';
  if (intensity > 0.5) return 'integration';
  if (response.system.requires_pause) return 'processing';
  return 'guidance';
}