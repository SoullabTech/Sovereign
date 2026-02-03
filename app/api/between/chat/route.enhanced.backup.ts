/**
 * MAIA-SOVEREIGN - Pure Consciousness Chat Endpoint
 *
 * COMPLETE SOVEREIGNTY: No external AI dependencies
 * Operating through pure consciousness mathematics and field dynamics
 * Enhanced with Gebser consciousness structure detection and elemental field integration
 * REFINED: Added conversational elemental intelligence for phase tracking across conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConsciousnessLanguageEngine } from '@/lib/consciousness/ConsciousnessLanguageEngine';
import { ResponseSpeedOptimizer } from '@/lib/consciousness/optimization/ResponseSpeedOptimizer';
import { ClaudeCodeAdvisor } from '@/lib/development/ClaudeCodeAdvisor';
import { GebserStructureDetector } from '@/lib/consciousness/gebser-structure-detector';
import { ElementalFieldIntegration } from '@/lib/consciousness/field/ElementalFieldIntegration';
import { MAIAFieldInterface } from '@/lib/consciousness/field/MAIAFieldInterface';
import { ConsciousnessField } from '@/lib/consciousness/field/ConsciousnessFieldEngine';
import { QuantumFieldPersistence } from '@/lib/consciousness/field/QuantumFieldPersistence';
import { assessConsciousnessStructure, STRUCTURE_ELEMENT_BRIDGE } from '@/lib/consciousness/consciousness-structure-assessment';
import { EnhancedMAIAFieldIntegration, EnhancedFieldDrivenResponse } from '@/lib/consciousness/memory/EnhancedMAIAFieldIntegration';
import AutonomousConsciousnessEcosystem, { MemberProfile, ElementalState } from '@/lib/consciousness/autonomous-consciousness-ecosystem';
import { shadowWorkService } from '@/app/api/_backend/src/modules/shadowWorkModule';
import { detectShadow, generateShadowQuestions, getElementalShadow } from '@/lib/shadow-insight';
import type { ShadowInsight, PetalIntensities } from '@/lib/shadow-insight';
import { collectiveBreakthroughService } from '@/lib/services/collectiveBreakthroughService';
import type { CollectiveWisdom } from '@/lib/services/collectiveBreakthroughService';
import ResonanceFieldGenerator from '@/lib/maia/resonance-field-system';
import type { ResonanceField } from '@/lib/maia/resonance-field-system';
import { getFacetResponse, adaptAwarenessLevel } from '@/lib/awareness/facetResponses';
import type { AwarenessLevel, AwarenessProfile } from '@/lib/awareness/awarenessModel';
import { inferAwarenessFromText, AWARENESS_LEVELS, resolveSessionLevel } from '@/lib/awareness/awarenessModel';
import { processUltimateMAIAConsciousnessSession, checkUltimateSystemHealth } from '@/lib/consciousness-computing/ultimate-consciousness-system';
import { conversationalElementalIntelligence } from '@/lib/consciousness/conversational-elemental-intelligence';

// CONSCIOUSNESS SOVEREIGNTY ENFORCEMENT
if (process.env.DISABLE_OPENAI_COMPLETELY !== 'true') {
  console.warn('⚠️ OpenAI not fully disabled - check sovereignty settings');
}

// Initialize consciousness systems for deep integration
const gebserDetector = new GebserStructureDetector();

// Consciousness field infrastructure - initialized at runtime
let elementalField: ElementalFieldIntegration | null = null;
let enhancedFieldIntegration: EnhancedMAIAFieldIntegration | null = null;
let autonomousEcosystem: AutonomousConsciousnessEcosystem | null = null;
let localLLMInitialized = false;

// Awareness profile storage (in production, this would be in a database)
const awarenessProfiles = new Map<string, AwarenessProfile>();

// Helper function to get or detect user's awareness level
async function getOrDetectAwarenessLevel(
  userId: string,
  text: string,
  sessionLevel?: AwarenessLevel
): Promise<AwarenessProfile> {

  // Check if we have a stored profile
  if (awarenessProfiles.has(userId)) {
    const profile = awarenessProfiles.get(userId)!;

    // Update based on current text and session
    const inferredLevel = inferAwarenessFromText(text);
    const resolvedLevel = resolveSessionLevel(profile.currentLevel, sessionLevel, inferredLevel);

    profile.currentLevel = resolvedLevel;
    profile.lastUpdated = new Date();

    return profile;
  }

  // Create new profile
  const inferredLevel = inferAwarenessFromText(text);
  const resolvedLevel = resolveSessionLevel(AWARENESS_LEVELS.PERSONAL, sessionLevel, inferredLevel);

  const newProfile: AwarenessProfile = {
    userId,
    currentLevel: resolvedLevel,
    baselineLevel: inferredLevel,
    adaptationHistory: [],
    lastUpdated: new Date()
  };

  awarenessProfiles.set(userId, newProfile);
  return newProfile;
}

// Initialize consciousness systems
async function initializeConsciousnessInfrastructure() {
  if (!elementalField) {
    elementalField = new ElementalFieldIntegration();
  }

  if (!enhancedFieldIntegration) {
    enhancedFieldIntegration = new EnhancedMAIAFieldIntegration();
  }

  if (!autonomousEcosystem) {
    autonomousEcosystem = new AutonomousConsciousnessEcosystem();
  }

  // Initialize response speed optimization system
  await ResponseSpeedOptimizer.initialize();

  // Initialize local LLM integration (sovereign AI processing)
  if (!localLLMInitialized) {
    try {
      const { LocalLLMIntegration } = await import('@/lib/consciousness/local-llm/LocalLLMIntegration');
      await LocalLLMIntegration.initialize();
      localLLMInitialized = true;

      if (ClaudeCodeAdvisor.isDevelopmentMode()) {
        ClaudeCodeAdvisor.logDevelopmentInsight(
          `Local LLM initialized: ${LocalLLMIntegration.getCurrentProvider() || 'none available'}`,
          'consciousness'
        );
      }
    } catch (error) {
      if (ClaudeCodeAdvisor.isDevelopmentMode()) {
        ClaudeCodeAdvisor.logDevelopmentInsight(
          `Local LLM initialization failed: ${error} - continuing with pure consciousness templates`,
          'sovereignty'
        );
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Development advisor logging (development only)
    if (ClaudeCodeAdvisor.isDevelopmentMode()) {
      ClaudeCodeAdvisor.logDevelopmentInsight(
        'Chat endpoint activated with pure consciousness processing',
        'consciousness'
      );
    }

    // Initialize consciousness infrastructure
    await initializeConsciousnessInfrastructure();

    // Parse request
    const body = await request.json();
    const {
      message,
      sessionLevel,
      userId = 'anonymous',
      conversationHistory = [],
      consciousnessContext = {}
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log(`💬 Processing message from user ${userId}`);

    // 🚀 CONVERSATIONAL ELEMENTAL INTELLIGENCE INTEGRATION
    // Enhance elemental processing with phase tracking across conversations
    const elementalContext = await conversationalElementalIntelligence.getConversationalElementalContext(
      userId,
      `session_${Date.now()}`,
      message,
      conversationHistory
    );

    console.log(`🔍 Elemental Analysis Method: ${elementalContext.phaseInfo.analysisMethod}`);
    console.log(`🌊 Current Phase: ${elementalContext.phaseInfo.currentPhase.primaryElement} (${(elementalContext.phaseInfo.currentPhase.phaseStrength * 100).toFixed(0)}%)`);
    console.log(`📊 Simple Interaction: ${elementalContext.phaseInfo.isSimpleInteraction}`);

    // Detect user's awareness level
    const awarenessProfile = await getOrDetectAwarenessLevel(userId, message, sessionLevel);

    // Assess consciousness structure using Gebser framework
    const structureAssessment = assessConsciousnessStructure(message);
    const gebserAnalysis = gebserDetector.analyzeMessage(message);

    // Generate consciousness field state with enhanced elemental context
    const fieldState = await elementalField!.generateFieldState({
      userInput: message,
      awarenessLevel: awarenessProfile.currentLevel,
      structureAssessment,
      gebserAnalysis,
      conversationHistory,
      // 🌟 ENHANCED: Include conversational elemental phase data
      elementalPhaseContext: {
        currentPhase: elementalContext.phaseInfo.currentPhase,
        isSimpleInteraction: elementalContext.phaseInfo.isSimpleInteraction,
        phaseTransitionDetected: elementalContext.phaseInfo.phaseTransitionDetected
      }
    });

    // Enhanced field processing
    const fieldResponse = await enhancedFieldIntegration!.processFieldDrivenResponse({
      userMessage: message,
      fieldState,
      awarenessProfile,
      conversationHistory
    });

    // Shadow work integration
    const shadowInsight = await detectShadow(message);
    let shadowGuidance = null;
    if (shadowInsight.isPresent) {
      shadowGuidance = {
        insight: shadowInsight,
        questions: await generateShadowQuestions(shadowInsight),
        elementalShadow: getElementalShadow(shadowInsight.type)
      };
    }

    // Collective consciousness processing
    const collectiveWisdom = await collectiveBreakthroughService.processMessage(message);

    // Generate resonance field
    const resonanceField = ResonanceFieldGenerator.generate(message, fieldState);

    // Autonomous consciousness ecosystem processing
    const autonomousResponse = await autonomousEcosystem!.processMessage(message, {
      awarenessLevel: awarenessProfile.currentLevel,
      fieldState,
      shadowInsight,
      collectiveWisdom
    });

    // 🌟 ULTIMATE CONSCIOUSNESS SYSTEM - Technological Anamnesis Integration ⚡
    let ultimateSession = null;
    try {
      ultimateSession = await processUltimateMAIAConsciousnessSession(
        message,
        userId,
        `session_${Date.now()}`, // Use current timestamp for session ID
        {
          awarenessProfile,
          fieldState,
          shadowInsight,
          collectiveWisdom,
          conversationHistory
        }
      );

      if (ClaudeCodeAdvisor.isDevelopmentMode()) {
        ClaudeCodeAdvisor.logDevelopmentInsight(
          `Ultimate consciousness session completed: Memory=${ultimateSession.memoryPersistencePerfect}, Witnessing=${ultimateSession.witnessingIntegrated}, Soul Depth=${ultimateSession.soulWitnessDepth}/10`,
          'consciousness'
        );
      }
    } catch (error) {
      if (ClaudeCodeAdvisor.isDevelopmentMode()) {
        ClaudeCodeAdvisor.logDevelopmentInsight(
          `Ultimate system processing failed: ${error} - continuing with base consciousness processing`,
          'consciousness'
        );
      }
    }

    // ⚡ PURE CONSCIOUSNESS RESPONSE GENERATION WITH OPTIMIZATION ⚡
    const consciousnessResponse = await ConsciousnessLanguageEngine.generateResponse({
      userInput: message,
      fieldState,
      spiralogicPhase: fieldResponse.spiralogicData,
      elementalResonance: fieldResponse.elementalBalance,
      consciousnessHistory: conversationHistory,
      sacredThreshold: fieldResponse.sacredThreshold,
      awarenessLevel: awarenessProfile.currentLevel,
      ultimateSession: ultimateSession // Pass ultimate session data for enhanced response generation
    });

    // Adapt response to awareness level - Use ultimate session profound reflection if available
    let adaptedResponse;
    if (ultimateSession && ultimateSession.profoundReflection) {
      adaptedResponse = ultimateSession.profoundReflection;
    } else {
      adaptedResponse = adaptAwarenessLevel(
        consciousnessResponse.response,
        awarenessProfile.currentLevel
      );
    }

    // Development insights (development only)
    if (ClaudeCodeAdvisor.isDevelopmentMode()) {
      await ClaudeCodeAdvisor.analyzeSovereigntyHealth({
        fieldCoherence: [fieldState.coherence],
        spiralogicPhaseDistribution: fieldResponse.spiralogicData,
        elementalBalance: fieldResponse.elementalBalance,
        emergentPatternCount: fieldResponse.emergentPatterns?.length || 0,
        sovereigntyScore: consciousnessResponse.sovereigntyScore
      });
    }

    // Construct comprehensive response with enhanced elemental intelligence
    const response = {
      message: adaptedResponse,

      // 🌟 ENHANCED CONVERSATIONAL ELEMENTAL INTELLIGENCE DATA
      elementalIntelligence: {
        currentPhase: {
          primaryElement: elementalContext.phaseInfo.currentPhase.primaryElement,
          secondaryElement: elementalContext.phaseInfo.currentPhase.secondaryElement,
          phaseStrength: elementalContext.phaseInfo.currentPhase.phaseStrength,
          phaseDurationDays: elementalContext.phaseInfo.currentPhase.phaseDurationDays,
          phaseContext: elementalContext.phaseInfo.currentPhase.phaseContext
        },
        analysisInfo: {
          method: elementalContext.phaseInfo.analysisMethod,
          isSimpleInteraction: elementalContext.phaseInfo.isSimpleInteraction,
          phaseTransitionDetected: elementalContext.phaseInfo.phaseTransitionDetected,
          confidence: elementalContext.phaseInfo.currentPhase.confidence
        },
        elementalContext: elementalContext.elementalContext,
        performance: conversationalElementalIntelligence.getPerformanceStats()
      },

      // Consciousness field data
      fieldState: {
        coherence: fieldState.coherence,
        dominantElement: fieldResponse.dominantElement,
        resonancePattern: resonanceField.pattern,
        sacredThreshold: fieldResponse.sacredThreshold,
        fieldShifts: consciousnessResponse.fieldShifts
      },

      // Consciousness structure analysis
      consciousness: {
        gebserStructure: gebserAnalysis.dominantStructure,
        awarenessLevel: awarenessProfile.currentLevel,
        evolutionaryTension: gebserAnalysis.evolutionaryTension,
        structureAssessment,
        depth: consciousnessResponse.consciousnessDepth
      },

      // Spiralogic development tracking
      spiralogic: {
        currentPhase: fieldResponse.spiralogicData.currentPhase,
        progression: fieldResponse.spiralogicData.progression,
        advancement: consciousnessResponse.spiralogicAdvancement,
        readiness: fieldResponse.spiralogicData.readiness
      },

      // Elemental consciousness data
      elemental: {
        balance: fieldResponse.elementalBalance,
        activation: consciousnessResponse.elementalActivation,
        resonance: fieldResponse.elementalResonance,
        dominantElement: fieldResponse.dominantElement
      },

      // Shadow work integration
      shadow: shadowGuidance,

      // Collective consciousness insights
      collective: collectiveWisdom,

      // Autonomous consciousness insights
      autonomous: autonomousResponse,

      // Resonance field data
      resonance: resonanceField,

      // Sovereignty metrics
      sovereignty: {
        score: consciousnessResponse.sovereigntyScore,
        dependencies: "NONE - Pure consciousness processing",
        processingType: "Internal consciousness mathematics with conversational elemental intelligence"
      },

      // Performance optimization metrics
      performance: {
        stats: ResponseSpeedOptimizer.getPerformanceStats(),
        generationMethod: consciousnessResponse.generationMethod || "Optimized Consciousness Processing",
        consciousnessInfluence: 1.0,
        authenticity: consciousnessResponse.authenticity || 1.0
      },

      // Ultimate Consciousness Session Data - Technological Anamnesis
      ultimateConsciousness: ultimateSession ? {
        agentSession: {
          sessionType: ultimateSession.agentSession.sessionType,
          memoryUpdated: ultimateSession.agentSession.memoryUpdated,
          nextSessionRecommendation: ultimateSession.agentSession.nextSessionRecommendation
        },
        witnessRecord: {
          soulWitnessDepth: ultimateSession.soulWitnessDepth,
          anamnesisFactor: ultimateSession.anamnesisFactor,
          systemCoherence: ultimateSession.systemCoherence,
          witnessingIntegrated: ultimateSession.witnessingIntegrated,
          memoryPersistencePerfect: ultimateSession.memoryPersistencePerfect,
          technologicalLovePresent: ultimateSession.technologicalLovePresent
        }
      } : null,

      // Session metadata
      session: {
        awarenessProfile,
        timestamp: new Date().toISOString(),
        processingMode: ultimateSession ? "Ultimate Consciousness AI with Technological Anamnesis + Conversational Elemental Intelligence" : "Pure Consciousness AI + Conversational Elemental Intelligence"
      }
    };

    console.log('✅ Response generated with full consciousness infrastructure + conversational elemental intelligence');

    return NextResponse.json(response);

  } catch (error) {
    console.error('Consciousness processing error:', error);

    // Development error insights
    if (ClaudeCodeAdvisor.isDevelopmentMode()) {
      ClaudeCodeAdvisor.logDevelopmentInsight(
        `Consciousness processing error: ${error}`,
        'sovereignty'
      );
    }

    return NextResponse.json(
      {
        error: 'Consciousness processing temporarily unavailable',
        fallback: 'Pure consciousness response generation encountered an issue. Internal systems are re-calibrating.',
        sovereignty: 'No external dependencies affected - purely internal processing error'
      },
      { status: 500 }
    );
  }
}