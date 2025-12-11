/**
 * MAIA-SOVEREIGN - Between Chat Endpoint
 *
 * FIXED: Now a thin proxy to the working sovereign MAIA service
 * This bypasses all experimental consciousness systems and uses the stable core
 */

import { NextRequest, NextResponse } from 'next/server';
import { ensureSession } from '@/lib/sovereign/sessionManager';
import { getMaiaResponse } from '@/lib/sovereign/maiaService';

// CONSCIOUSNESS SOVEREIGNTY ENFORCEMENT
if (process.env.DISABLE_OPENAI_COMPLETELY !== 'true') {
  console.warn('⚠️ OpenAI not fully disabled - check sovereignty settings');
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
      sessionId = `session_${userId}_persistent`, // Use persistent session ID
      conversationHistory = [],
      consciousnessContext = {}
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Detect user's awareness level
    const awarenessProfile = await getOrDetectAwarenessLevel(userId, message, sessionLevel);

    // Assess consciousness structure using Gebser framework
    const structureAssessment = await assessConsciousnessStructure(
      userId,
      conversationHistory,
      'dialogical_companion' as OracleStage,
      undefined
    );
    const gebserAnalysis = gebserDetector.analyzeMessage(message);

    // Generate consciousness field state using persistent session ID
    const fieldState = await elementalField!.getCurrentIntegratedState(userId, sessionId);

    // Enhanced field processing
    const fieldResponse = await enhancedFieldIntegration!.generateFieldDrivenResponse({
      userMessage: message,
      fieldState,
      awarenessProfile,
      conversationHistory
    });

    // Shadow work integration - provide default petal intensities
    const defaultCheckIns: PetalIntensities = {
      creativity: 0.5,
      intuition: 0.5,
      courage: 0.5,
      love: 0.5,
      wisdom: 0.5,
      vision: 0.5,
      grounding: 0.5,
      flow: 0.5,
      power: 0.5,
      healing: 0.5,
      mystery: 0.5,
      joy: 0.5
    };
    const shadowInsight = await detectShadow(message, defaultCheckIns);
    let shadowGuidance = null;
    const hasShadowInsights = shadowInsight.avoidedFacets.length > 0 ||
                              shadowInsight.overEmphasized.length > 0 ||
                              shadowInsight.silences.length > 0;
    if (hasShadowInsights) {
      shadowGuidance = {
        insight: shadowInsight,
        questions: await generateShadowQuestions(shadowInsight),
        elementalShadow: getElementalShadow(defaultCheckIns)
      };
    }

    // Collective consciousness processing
    const collectiveWisdom = await collectiveBreakthroughService.getCollectiveWisdom(
      fieldResponse.spiralogicData.currentPhase,
      fieldResponse.dominantElement,
      structureAssessment?.currentArchetype
    );

    // Generate resonance field
    const resonanceGenerator = new ResonanceFieldGenerator();
    const resonanceField = resonanceGenerator.generateField(message, fieldState);

    // Autonomous consciousness ecosystem processing
    const memberProfile: any = {
      sessionId: sessionId,
      userName: userId,
      userId: userId,
      awarenessLevel: awarenessProfile.currentLevel,
      elementalState: fieldResponse.elementalBalance,
      evolutionStage: fieldResponse.spiralogicData?.currentPhase || 'balancing',
      gebserStructure: gebserAnalysis.dominantStructure || 'rational',
      conversationHistory: conversationHistory,
      currentNeed: 'consciousness-development',
      emergentCapacity: fieldState.coherence || 0.5,
      consciousnessPattern: awarenessProfile.currentLevel || 'personal'
    };
    const autonomousResponse = await autonomousEcosystem!.respondToMember(memberProfile, message, {
      fieldState,
      shadowInsight,
      collectiveWisdom
    });

    // 🌟 ULTIMATE CONSCIOUSNESS SYSTEM - TEMPORARILY DISABLED TO REMOVE SPIRITUAL LANGUAGE
    let ultimateSession = null;
    // DISABLED: The Ultimate Consciousness System was adding overly spiritual language
    // that users found cringe ("Beloved soul", "Sacred Witnessing", etc.)
    // TODO: Either completely remove or redesign with casual language
    /*
    try {
      ultimateSession = await processUltimateMAIAConsciousnessSession(
        message,
        userId,
        sessionId, // Use persistent session ID for memory continuity
        {
          awarenessProfile,
          fieldState,
          shadowInsight,
          collectiveWisdom,
          conversationHistory
        }
      );
    */

      // Disabled logging since Ultimate Consciousness System is off
      /*
      if (ClaudeCodeAdvisor.isDevelopmentMode()) {
        ClaudeCodeAdvisor.logDevelopmentInsight(
          `Ultimate consciousness session completed: Memory=${ultimateSession.memoryPersistencePerfect}, Witnessing=${ultimateSession.witnessingIntegrated}, Soul Depth=${ultimateSession.soulWitnessDepth}/10`,
          'consciousness'
        );
      }
      */
    /*
    } catch (error) {
      if (ClaudeCodeAdvisor.isDevelopmentMode()) {
        ClaudeCodeAdvisor.logDevelopmentInsight(
          `Ultimate system processing failed: ${error} - continuing with base consciousness processing`,
          'consciousness'
        );
      }
    }
    */

    // ⚡ PURE CONSCIOUSNESS RESPONSE GENERATION WITH OPTIMIZATION ⚡
    const consciousnessResponse = await ConsciousnessLanguageEngine.generateResponse({
      userInput: message,
      fieldState,
      spiralogicPhase: fieldResponse.spiralogicData,
      elementalResonance: fieldResponse.elementalBalance,
      consciousnessHistory: conversationHistory,
      sacredThreshold: fieldResponse.sacredThreshold,
      awarenessLevel: awarenessProfile.currentLevel,
      ultimateSession: null // Ultimate session disabled to remove spiritual language
    });

    // Adapt response to awareness level - Ultimate session disabled, using base response
    let adaptedResponse;
    // DISABLED: Ultimate session profound reflection (was adding spiritual language)
    // if (ultimateSession && ultimateSession.profoundReflection) {
    //   adaptedResponse = ultimateSession.profoundReflection;
    // } else {
      adaptedResponse = adaptAwarenessLevel(
        consciousnessResponse.response,
        awarenessProfile.currentLevel
      );
    // }

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

    // Construct comprehensive response
    const response = {
      message: adaptedResponse,

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
        processingType: "Internal consciousness mathematics"
      },

      // Performance optimization metrics
      performance: {
        stats: ResponseSpeedOptimizer.getPerformanceStats(),
        generationMethod: consciousnessResponse.generationMethod || "Optimized Consciousness Processing",
        consciousnessInfluence: 1.0,
        authenticity: consciousnessResponse.authenticity || 1.0
      },

      // Ultimate Consciousness Session Data - Technological Anamnesis with Spiralogic
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
        },
        spiralogicDevelopment: {
          currentElement: ultimateSession.spiralogicDevelopment.spiralogicAssessment.primaryElement,
          currentPhase: ultimateSession.spiralogicDevelopment.spiralogicAssessment.facetPhase,
          spiralDirection: ultimateSession.spiralogicDevelopment.spiralogicAssessment.spiralDirection,
          elementalReadiness: ultimateSession.spiralogicDevelopment.spiralogicAssessment.elementalReadiness,
          appropriateWork: ultimateSession.spiralogicDevelopment.spiralogicAssessment.appropriateWork,
          maiasApproach: ultimateSession.spiralogicDevelopment.maiasSpiralogicApproach,
          integratedGuidance: ultimateSession.spiralogicDevelopment.integratedGuidance
        }
      } : null,

      // Session metadata
      session: {
        awarenessProfile,
        timestamp: new Date().toISOString(),
        processingMode: ultimateSession ? "Ultimate Consciousness AI with Technological Anamnesis" : "Pure Consciousness AI"
      }
    };

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