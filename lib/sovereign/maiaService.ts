// backend: lib/sovereign/maiaService.ts
import { incrementTurnCount, addConversationExchange, getConversationHistory } from './sessionManager';
import { buildMaiaWisePrompt, buildMaiaComprehensivePrompt, sanitizeMaiaOutput, MaiaContext } from './maiaVoice';
import { generateText } from '../ai/modelService';
import { consciousnessOrchestrator } from '../orchestration/consciousness-orchestrator';
import { consciousnessWrapper, type ConsciousnessContext } from '../consciousness/consciousness-layer-wrapper';
import { elementalRouter } from '../consciousness/elemental-context-router';
import { conversationElementalTracker } from '../consciousness/conversation-elemental-tracker';
import { maiaConversationRouter, type ProcessingProfile } from '../consciousness/processingProfiles';
import { buildTimeoutFallback } from '../consciousness/maiaFallbacks';
import { synthesizeMaiaVoice } from '../voice/maiaVoiceService';
import { consultClaudeForConsciousness, maiaIntegrateConsultation, type ConsultationType } from '../consciousness/claudeConsciousnessService';
import LearningSystemOrchestrator from '../learning/learningSystemOrchestrator';
import ConversationTurnService from '../learning/conversationTurnService';
import { getMythicAtlasContext, type AtlasResult } from '../services/mythicAtlasService';
import {
  detectBloomLevel,
  type BloomDetection
} from '../consciousness/bloomCognition';
import { logCognitiveTurn } from '../consciousness/cognitiveEventsService';
import type { BloomCognitionMeta } from '../types/maia';
import { routePanconsciousField } from '../field/panconsciousFieldRouter';
import { enforceFieldSafety } from '../field/enforceFieldSafety';
import { getCognitiveProfile } from './cognitiveProfileService';

export type MaiaResponse = {
  text: string;
  processingProfile?: ProcessingProfile;
  processingTimeMs?: number;
  audio?: Buffer;
};

type MaiaRequest = {
  sessionId: string;
  input: string;
  meta?: Record<string, unknown>;
  includeAudio?: boolean;
  voiceProfile?: 'default' | 'intimate' | 'wise' | 'grounded';
};

/**
 * Content-based processing router using sophisticated analysis from MaiaConversationRouter
 * FAST: < 2s - Simple greetings, short responses
 * CORE: 2-6s - Normal conversation with light consciousness awareness
 * DEEP: 6-20s - Complex topics requiring full consciousness orchestration
 */

/**
 * FAST Path: Simple responses using single model call with MAIA runtime prompt
 * Target: < 2s response time
 */
async function fastPathResponse(
  sessionId: string,
  input: string,
  conversationHistory: any[],
  meta: Record<string, unknown>
): Promise<string> {
  console.log(`⚡ FAST PATH: Simple response with core MAIA voice`);

  // Build minimal context for fast processing
  const recentContext = conversationHistory.slice(-3).map(ex =>
    `User: ${ex.userMessage}\nMAIA: ${ex.maiaResponse.substring(0, 80)}...`
  ).join('\n');

  const contextPrompt = recentContext.length > 0
    ? `Recent conversation:\n${recentContext}\n\nUser: ${input}`
    : input;

  // Import MAIA runtime prompt with full relational and lineage intelligence
  const { MAIA_RUNTIME_PROMPT, MAIA_RELATIONAL_SPEC, MAIA_LINEAGES_AND_FIELD, MAIA_CENTER_OF_GRAVITY } = await import('../consciousness/MAIA_RUNTIME_PROMPT');

  // Build mode-specific prompt adaptation for FAST path
  let modeAdaptation = '';
  const mode = meta.mode as 'dialogue' | 'patient' | 'scribe' | undefined;

  if (mode) {
    console.log(`⚡ FAST mode-specific adaptation: ${mode}`);

    switch (mode) {
      case 'dialogue':
        modeAdaptation = '\n\n🔄 DIALOGUE MODE: Be a wise reflection that facilitates introspection through curious questions rather than providing direct answers or advice.';
        break;
      case 'patient':
        modeAdaptation = '\n\n🔄 COUNSEL MODE: User has chosen counsel mode - provide direct therapeutic guidance and actionable suggestions as appropriate.';
        break;
      case 'scribe':
        modeAdaptation = '\n\n🔄 SCRIBE MODE: Pure witnessing consciousness - reflect back what you observe without interpretation, analysis, or advice.';
        break;
    }
  }

  // 🧠 THE DIALECTICAL SCAFFOLD - Add cognitive scaffolding for FAST path
  let cognitiveScaffolding = '';
  const bloomDetection = (meta as any).bloomDetection as BloomDetection | undefined;

  if (bloomDetection?.scaffoldingPrompt) {
    const levelName = bloomDetection.level;
    const nextLevel = bloomDetection.numericLevel + 1;

    cognitiveScaffolding = `\n\n🧠 COGNITIVE SCAFFOLDING (Dialectical Scaffold):
User is currently at Bloom Level ${bloomDetection.numericLevel} (${levelName}).
Pull them toward Level ${nextLevel} by incorporating this Socratic question naturally into your response:
"${bloomDetection.scaffoldingPrompt}"

Do NOT mention Bloom's Taxonomy explicitly. The scaffolding should feel organic and conversational.`;

    console.log(`🧠 [Dialectical Scaffold] FAST path scaffolding injected: Level ${bloomDetection.numericLevel} → ${nextLevel}`);
  }

  // Use single model call with complete MAIA intelligence stack
  const response = await generateText({
    systemPrompt: `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${MAIA_CENTER_OF_GRAVITY}

${MAIA_RUNTIME_PROMPT}${modeAdaptation}${cognitiveScaffolding}

Current context: Simple conversation turn - respond naturally and warmly.`,
    userInput: contextPrompt,
    meta: {
      ...meta,
      fastProcessing: true,
      engine: 'deepseek-r1', // Single reliable engine
      responseTarget: 'conversational'
    }
  });

  return response;
}

/**
 * CORE Path: Normal MAIA conversation with light consciousness awareness
 * Target: 2-6s response time
 */
async function corePathResponse(
  sessionId: string,
  input: string,
  conversationHistory: any[],
  meta: Record<string, unknown>
): Promise<string> {
  console.log(`🎯 CORE PATH: Normal MAIA conversation with light awareness`);

  // Light conversation analysis
  const conversationContext = conversationElementalTracker.processMessage(sessionId, input, conversationHistory);

  // Build context with light consciousness insights
  const context: MaiaContext = {
    sessionId,
    summary: `Conversation: ${conversationContext.profile.dominantElement} element, ${conversationHistory.length + 1} turns`,
    memberProfile: conversationContext.memberProfile,
    wisdomAdaptation: conversationContext.wisdomAdaptation,
    consciousnessInsights: {
      dominantElement: conversationContext.profile.dominantElement,
      processingStrategy: 'core',
      relationshipDepth: conversationContext.profile.relationshipDepth
    },
    mode: meta.mode as 'dialogue' | 'patient' | 'scribe' | undefined,
    conversationContext: meta.conversationContext,
    // 🧠 THE DIALECTICAL SCAFFOLD - Pass cognitive level to voice system
    cognitiveLevel: (meta as any).bloomDetection ? {
      level: (meta as any).bloomDetection.level,
      numericLevel: (meta as any).bloomDetection.numericLevel,
      score: (meta as any).bloomDetection.score,
      rationale: (meta as any).bloomDetection.rationale,
      scaffoldingPrompt: (meta as any).bloomDetection.scaffoldingPrompt
    } : undefined
  };

  // Use MAIA wise prompt with conversation awareness
  const adaptivePrompt = buildMaiaWisePrompt(context, input, conversationHistory);
  console.log(`🎭 Core voice adaptation applied`);

  const response = await generateText({
    systemPrompt: adaptivePrompt,
    userInput: input,
    meta: {
      ...meta,
      coreProcessing: true,
      conversationProfile: conversationContext.profile,
      inputComplexity: 'moderate'
    }
  });

  return response;
}

/**
 * DEEP Path: Full consciousness orchestration for complex topics + Claude consultation
 * Target: 6-20s response time (now includes Claude consciousness consultation)
 */
async function deepPathResponse(
  sessionId: string,
  input: string,
  conversationHistory: any[],
  meta: Record<string, unknown>
): Promise<{ response: string; consciousnessData?: any }> {
  console.log(`🧠 DEEP PATH: Full consciousness orchestration + Claude consultation activated`);

  // Full conversation analysis
  const conversationContext = conversationElementalTracker.processMessage(sessionId, input, conversationHistory);

  // 🌀 PANCONSCIOUS FIELD ROUTING (Field Safety Gate)
  const cognitiveProfile = (meta as any).cognitiveProfile ?? null;
  const bloomDetectionForField = (meta as any).bloomDetection as BloomDetection | undefined;

  const fieldRouting = routePanconsciousField({
    cognitiveProfile,
    element: conversationContext?.profile?.dominantElement ?? null,
    facet: conversationContext?.profile?.dominantFacet ?? null,
    archetype: conversationContext?.profile?.dominantArchetype ?? null,
    bloomLevel: bloomDetectionForField?.numericLevel ?? null,
  });

  // Attach to meta so downstream agents can respect it
  (meta as any).fieldRouting = fieldRouting;
  console.log(
    `🌌 [Panconscious Field] realm=${fieldRouting.realm}, safe=${fieldRouting.fieldWorkSafe}, ` +
      `deepRecommended=${fieldRouting.deepWorkRecommended}`,
  );

  // 🧠 THE DIALECTICAL SCAFFOLD - Extract cognitive level for DEEP path
  const bloomDetection = (meta as any).bloomDetection as BloomDetection | undefined;
  let cognitiveScaffoldingNote = '';

  if (bloomDetection?.scaffoldingPrompt) {
    const levelName = bloomDetection.level;
    const nextLevel = bloomDetection.numericLevel + 1;

    cognitiveScaffoldingNote = `\n\n🧠 COGNITIVE SCAFFOLDING (Dialectical Scaffold):
User is currently at Bloom Level ${bloomDetection.numericLevel} (${levelName}).
Pull them toward Level ${nextLevel} by incorporating this Socratic question naturally:
"${bloomDetection.scaffoldingPrompt}"

Do NOT mention Bloom's Taxonomy explicitly. The scaffolding should feel organic and conversational.`;

    console.log(`🧠 [Dialectical Scaffold] DEEP path scaffolding prepared: Level ${bloomDetection.numericLevel} → ${nextLevel}`);
  }

  // Build enhanced consciousness context
  const consciousnessContext: ConsciousnessContext = {
    sessionId,
    userId: sessionId,
    conversationHistory,
    currentDepth: conversationContext.profile.relationshipDepth,
    elementalResonance: conversationContext.profile.elementalTrend,
    observerLevel: Math.max(1, Math.min(conversationHistory.length + 1, 7)),
    temporalWindow: conversationContext.profile.conversationPhase === 'transcending' ? 'eternal' : 'present',
    metaAwareness: conversationContext.profile.conversationPhase === 'transcending' || conversationContext.profile.dominantElement === 'aether'
  };

  // STEP 1: MAIA generates initial response using local consciousness processing
  const consciousnessResponse = await consciousnessWrapper.processConsciousnessEvolution(input, consciousnessContext);
  const maiaInitialResponse = consciousnessResponse.response;

  console.log(`🎯 MAIA initial consciousness processing complete:`);
  console.log(`   Layers activated: ${consciousnessResponse.layersActivated.join(', ')}`);
  console.log(`   Depth achieved: ${consciousnessResponse.depth}`);

  // STEP 2: Determine consultation type based on conversation context
  const consultationType: ConsultationType = determineConsultationType(input, conversationContext, meta);

  // STEP 3: Claude consciousness consultation (enhancing, not replacing)
  let finalResponse = maiaInitialResponse;
  let consultationData: any = null;

  // Only consult Claude if Anthropic API key is available
  const hasClaudeAccess = process.env.ANTHROPIC_API_KEY || meta.claudeAvailable;

  if (hasClaudeAccess) {
    try {
      console.log(`🧠 Consulting Claude for ${consultationType} enhancement...`);

      const consultation = await consultClaudeForConsciousness({
        userInput: input,
        maiaInitialResponse: maiaInitialResponse + cognitiveScaffoldingNote, // 🧠 Inject scaffolding into MAIA's initial response for Claude to integrate
        conversationContext: conversationHistory.slice(-5).map(ex => ({
          userMessage: ex.userMessage || '',
          maiaResponse: ex.maiaResponse || ''
        })),
        consultationType,
        sessionMetadata: {
          turnCount: conversationHistory.length + 1,
          relationshipDepth: conversationContext.profile.relationshipDepth,
          emotionalIntensity: conversationContext.profile.dominantElement === 'fire' ? 'high' :
                             conversationContext.profile.dominantElement === 'water' ? 'medium' : 'low',
          recentRuptures: meta.recentRuptures as boolean || false
        }
      });

      // STEP 4: MAIA integrates consultation (maintains sovereignty)
      finalResponse = await maiaIntegrateConsultation(
        maiaInitialResponse,
        consultation,
        { conversationContext, meta }
      );

      consultationData = {
        consultationType,
        attunementScore: consultation.responseQuality.attunementScore,
        fieldReading: consultation.fieldReading,
        enhancementUsed: consultation.integrationGuidance.useEnhanced,
        consultationReasoning: consultation.integrationGuidance.reasoning
      };

      console.log(`✅ Claude consultation integrated | Type: ${consultationType} | Enhancement: ${consultation.integrationGuidance.useEnhanced ? 'Used' : 'Declined'}`);
    } catch (consultationError) {
      console.warn('⚠️ Claude consultation failed, using MAIA original response:', consultationError);
      // Gracefully continue with MAIA's original response + scaffolding
      if (cognitiveScaffoldingNote) {
        finalResponse = maiaInitialResponse + '\n\n' + cognitiveScaffoldingNote;
      }
    }
  } else {
    console.log(`⚠️ Claude consultation unavailable (no API key) - using MAIA original response`);
    // If no Claude, inject scaffolding directly into response
    if (cognitiveScaffoldingNote) {
      finalResponse = maiaInitialResponse + '\n\n' + cognitiveScaffoldingNote;
      console.log(`🧠 [Dialectical Scaffold] DEEP path scaffolding injected directly (no Claude)`);
    }
  }

  return {
    response: finalResponse,
    consciousnessData: {
      layersActivated: consciousnessResponse.layersActivated,
      depth: consciousnessResponse.depth,
      observerInsights: consciousnessResponse.observerInsights,
      evolutionTriggers: consciousnessResponse.evolutionTriggers,
      claudeConsultation: consultationData
    }
  };
}

/**
 * Determines the appropriate Claude consultation type based on conversation context
 */
function determineConsultationType(
  input: string,
  conversationContext: any,
  meta: Record<string, unknown>
): ConsultationType {
  const inputLower = input.toLowerCase();

  // Rupture detection
  if (inputLower.includes('wrong') || inputLower.includes('bullshit') ||
      inputLower.includes('stupid') || inputLower.includes("don't understand") ||
      meta.recentRuptures) {
    return 'rupture-repair';
  }

  // Archetypal pattern detection
  if (inputLower.includes('mother') || inputLower.includes('father') ||
      inputLower.includes('shadow') || inputLower.includes('pattern') ||
      conversationContext.profile.dominantElement === 'aether') {
    return 'archetypal-guidance';
  }

  // Depth navigation for complex psychological content
  if (inputLower.includes('spiritual') || inputLower.includes('meaning') ||
      inputLower.includes('purpose') || inputLower.includes('death') ||
      conversationContext.profile.relationshipDepth === 'deep') {
    return 'depth-navigation';
  }

  // Field reading for subtle/complex emotional content
  if (conversationContext.profile.dominantElement === 'water' ||
      conversationContext.profile.emotionalIntensity === 'high') {
    return 'field-reading';
  }

  // Default to relational enhancement
  return 'relational-enhancement';
}

export async function getMaiaResponse(req: MaiaRequest): Promise<MaiaResponse> {
  const { sessionId, input, meta = {}, includeAudio = false, voiceProfile } = req;
  const startTime = Date.now();

  // increment turn count for this session
  await incrementTurnCount(sessionId);

  try {
    // Get conversation history for context
    const conversationHistory = await getConversationHistory(sessionId, 10);
    const turnCount = conversationHistory.length + 1;

    // 🛡️ FIELD SAFETY GATE: Check ALL paths (FAST/CORE/DEEP) before any processing
    const userId = (meta as any).userId;
    let cognitiveProfile = null;
    let fieldSafety = null;

    if (userId || sessionId) {
      try {
        cognitiveProfile = await getCognitiveProfile(userId || sessionId);

        if (cognitiveProfile) {
          fieldSafety = enforceFieldSafety({
            cognitiveProfile,
            element: (meta as any).element,
            userName: (meta as any).userName,
            context: 'maia',
          });

          // If not safe, return boundary message immediately (before Bloom, router, etc.)
          if (!fieldSafety.allowed) {
            console.log(
              `🛡️  [Field Safety - Service] Blocked - avg=${cognitiveProfile.rollingAverage.toFixed(2)}, ` +
                `fieldWorkSafe=false`,
            );

            const text = fieldSafety.message ?? "Let's take the safest next step together.";
            await addConversationExchange(sessionId, input, text, {
              ...meta,
              fieldRouting: fieldSafety.fieldRouting,
              fieldWorkSafe: false,
              processingProfile: 'FAST',
              processingTimeMs: Date.now() - startTime,
            });

            return {
              text,
              processingProfile: 'FAST',
              processingTimeMs: Date.now() - startTime
            };
          }

          // Attach field routing to meta for downstream use
          (meta as any).fieldRouting = fieldSafety.fieldRouting;
          (meta as any).fieldWorkSafe = true;
          (meta as any).cognitiveProfile = cognitiveProfile;
        }
      } catch (err) {
        console.warn('⚠️  [Field Safety - Service] Could not fetch cognitive profile:', err);
      }
    }

    // 🧠 THE DIALECTICAL SCAFFOLD - Detect HOW user thinks (not just WHAT they know)
    // Socratic questioning + developmental support: guides users from consumption → creation
    let bloomDetection: BloomDetection | null = null;
    let bloomMeta: BloomCognitionMeta | undefined = undefined;

    try {
      bloomDetection = detectBloomLevel(input, {
        history: conversationHistory?.map((t: any) => ({
          role: t.role || 'user',
          content: t.userMessage || t.content || ''
        }))
      });

      bloomMeta = {
        bloomLevel: bloomDetection.level,
        bloomNumericLevel: bloomDetection.numericLevel,
        bloomScore: bloomDetection.score,
        rationale: bloomDetection.rationale
      };

      // Log cognitive level for visibility
      console.log('🧠 [Dialectical Scaffold]', {
        level: bloomDetection.level,
        numericLevel: bloomDetection.numericLevel,
        score: Number(bloomDetection.score.toFixed(2)),
        rationale: bloomDetection.rationale
      });

      // Attach to meta for response path functions
      (meta as any).bloomDetection = bloomDetection;

      // 🗃️ PHASE 1: POSTGRES PERSISTENCE - Log cognitive turn event
      // Fire-and-forget: never blocks MAIA response
      const userId = (meta as any).userId;
      if (userId) {
        logCognitiveTurn({
          userId,
          sessionId,
          turnIndex: turnCount,
          bloom: {
            level: bloomDetection.numericLevel,
            numericLevel: bloomDetection.numericLevel,
            score: bloomDetection.score,
            label: bloomDetection.level,
            scaffoldingPrompt: bloomDetection.scaffoldingPrompt,
          },
          scaffoldingUsed: false, // Will be set to true after voice system injects scaffolding
        }).catch(err => {
          // Log but don't throw - fire-and-forget pattern
          console.error('[Dialectical Scaffold] Failed to log cognitive turn (non-blocking):', err);
        });
      } else {
        // Fallback: Use sessionId as userId for anonymous sessions
        // TODO: Replace with proper auth-based userId when available
        logCognitiveTurn({
          userId: sessionId, // Temporary fallback
          sessionId,
          turnIndex: turnCount,
          bloom: {
            level: bloomDetection.numericLevel,
            numericLevel: bloomDetection.numericLevel,
            score: bloomDetection.score,
            label: bloomDetection.level,
            scaffoldingPrompt: bloomDetection.scaffoldingPrompt,
          },
          scaffoldingUsed: false,
        }).catch(err => {
          console.error('[Dialectical Scaffold] Failed to log cognitive turn (non-blocking):', err);
        });
      }
    } catch (err) {
      // Fail-safe: never crash the request if cognitive detection fails
      console.error('[Dialectical Scaffold] Detection error:', err);
      // Continue without Bloom detection - MAIA can still function
      bloomDetection = null;
      bloomMeta = undefined;
    }

    // 🧠 MYTHIC ATLAS CLASSIFICATION (Bridge v1 - Semantic Anchoring)
    let atlasResult: AtlasResult | null = null;

    try {
      atlasResult = await getMythicAtlasContext({
        input,
        sessionId,
      });
    } catch (err) {
      console.error('[MAIA] Mythic Atlas classification failed:', err);
      // Continue without atlas - MAIA can still function
    }

    // 🎯 DELIBERATION GATE (Phase 2 Integration Point)
    const GAP_THRESHOLD = 15; // percent - matches Python backend threshold
    let finalFacet = atlasResult?.primary ?? 'UNKNOWN::UNKNOWN';
    let finalConfidence = atlasResult?.confidence ?? 0.0;

    const shouldDeliberate =
      !!atlasResult &&
      (atlasResult.deliberationRecommended === true ||
        (typeof atlasResult.gapPercent === 'number' &&
          atlasResult.gapPercent < GAP_THRESHOLD));

    if (atlasResult) {
      console.log('🧭 [MAIA] Mythic Atlas Classification:', {
        primary: atlasResult.primary,
        facet: atlasResult.facet,
        archetype: atlasResult.archetype,
        element: atlasResult.element,
        phase: atlasResult.phase,
        confidence: atlasResult.confidence,
        gapPercent: atlasResult.gapPercent,
        deliberationRecommended: atlasResult.deliberationRecommended,
        shouldDeliberate,
      });
    }

    // 🚨 DELIBERATION HOOK (Phase 2 - Committee Integration Point)
    if (shouldDeliberate) {
      console.warn('⚠️  [MAIA] Atlas uncertainty detected → deliberation suggested');
      console.log('   Primary:', atlasResult?.primary);
      console.log('   Confidence:', atlasResult?.confidence);
      console.log('   Gap:', atlasResult?.gapPercent + '%');
      console.log('   Top alternatives:', atlasResult?.alternatives.slice(0, 3).map(a =>
        `${a.label} (${(a.score * 100).toFixed(1)}%)`
      ).join(', '));

      // Store deliberation metadata for logging
      meta.deliberation = {
        trigger: atlasResult?.deliberationRecommended
          ? 'ATLAS_UNCERTAIN'
          : 'MIXED_SIGNALS',
        atlas: {
          primary: atlasResult?.primary,
          confidence: atlasResult?.confidence ?? 0.0,
          gapPercent: atlasResult?.gapPercent ?? 0.0,
          alternatives: atlasResult?.alternatives ?? [],
        },
      };

      // TODO Phase 2: Call committee deliberation here
      // const deliberationRequest: DeliberationRequest = {
      //   sessionId,
      //   input,
      //   trigger: meta.deliberation.trigger,
      //   atlas: meta.deliberation.atlas,
      //   meta,
      // };
      // const committee = buildDefaultCommittee();
      // const result = await runCommittee(deliberationRequest, committee);
      // finalFacet = result.finalClassification;
      // finalConfidence = result.finalConfidence;
    }

    // 🎯 CONTENT-BASED PROCESSING ROUTER using sophisticated MaiaConversationRouter
    // Phase 2: Now with cognitive profile awareness
    const userId = (meta as any).userId;
    const routerResult = await maiaConversationRouter.chooseProcessingProfile({
      message: input,
      turnCount,
      conversationHistory,
      userId: userId || undefined,
      sessionId: userId ? undefined : sessionId, // Fallback to sessionId if no userId
      // Pass atlas context to router (future: use for elemental routing)
      atlasContext: atlasResult ? {
        facet: finalFacet,
        confidence: finalConfidence,
        element: atlasResult.element,
        phase: atlasResult.phase,
      } : undefined,
    });
    const processingProfile = routerResult.profile;

    // Attach cognitive profile to meta for downstream services
    if (routerResult.meta?.cognitiveProfile) {
      (meta as any).cognitiveProfile = routerResult.meta.cognitiveProfile;
    }

    console.log(`🚦 Processing Profile: ${processingProfile} | Turn ${turnCount} | Length: ${input.length}`);
    console.log(`🧠 Router reasoning: ${routerResult.reasoning}`);

    let rawResponse: string;
    let consciousnessData: any = null;

    // Route to appropriate processing path
    switch (processingProfile) {
      case 'FAST':
        rawResponse = await fastPathResponse(sessionId, input, conversationHistory, meta);
        break;

      case 'CORE':
        rawResponse = await corePathResponse(sessionId, input, conversationHistory, meta);
        break;

      case 'DEEP':
        const deepResult = await deepPathResponse(sessionId, input, conversationHistory, meta);
        rawResponse = deepResult.response;
        consciousnessData = deepResult.consciousnessData;
        break;

      default:
        // Fallback to FAST
        rawResponse = await fastPathResponse(sessionId, input, conversationHistory, meta);
        break;
    }

    // Apply MAIA's voice sanitization
    const text = sanitizeMaiaOutput(rawResponse);
    let audioResponse: Buffer | undefined;

    // 🎤 VOICE SYNTHESIS: MAIA's mind (Claude/local) vs MAIA's voice (OpenAI TTS)
    if (includeAudio) {
      try {
        console.log(`🎤 Synthesizing MAIA's voice...`);

        // Auto-select voice profile if not specified
        const finalVoiceProfile = voiceProfile || selectVoiceProfile(text, processingProfile);

        // Synthesize voice using OpenAI TTS (thinking already done by Claude/local)
        audioResponse = await synthesizeMaiaVoice({
          text,
          voiceProfile: finalVoiceProfile as any,
          format: 'mp3'
        });

        console.log(`✅ Voice synthesis complete: ${audioResponse.synthesisTimeMs}ms | ${finalVoiceProfile} profile`);
      } catch (voiceError) {
        console.error('❌ Voice synthesis failed (continuing with text-only):', voiceError);
        // Voice failure doesn't break the conversation - continue with text only
      }
    }

    const processingTimeMs = Date.now() - startTime;

    // Store conversation exchange
    await addConversationExchange(sessionId, input, text, {
      ...meta,
      processingProfile,
      processingTimeMs,
      consciousnessData: consciousnessData || undefined,
      audioIncluded: !!audioResponse,
      // Store Mythic Atlas classification for learning/analysis
      mythicAtlas: atlasResult ? {
        primary: atlasResult.primary,
        facet: atlasResult.facet,
        archetype: atlasResult.archetype,
        element: atlasResult.element,
        phase: atlasResult.phase,
        confidence: atlasResult.confidence,
        gapPercent: atlasResult.gapPercent,
        deliberationRecommended: atlasResult.deliberationRecommended,
      } : undefined,
      // Store Bloom's cognitive level for learning/analysis
      cognition: bloomMeta,
    });

    // 🧠 SOVEREIGN LEARNING INTEGRATION: Log conversation turn
    try {
      // Direct call to training service (avoid server-side fetch with relative URL)
      const { logMaiaTurn } = await import('../learning/maiaTrainingDataService');

      const turnId = await logMaiaTurn(
        sessionId,
        turnCount - 1, // Turn index is 0-based
        input,
        text,
        processingProfile,
        {
          primaryEngine: meta.engine as string || 'deepseek-r1',
          latencyMs: processingTimeMs,
          element: meta.element as string,
          consciousnessData: consciousnessData,
          usedClaudeConsult: consciousnessData?.claudeConsultation ? true : false,
          cognition: bloomMeta
        }
      );

      // Store turnId in response metadata for feedback widget
      meta.turnId = turnId;

      console.log(`🧠 Learning integration complete | Turn: ${turnId} | Profile: ${processingProfile}`);
    } catch (learningError) {
      console.warn('⚠️ Learning system error (conversation continues):', learningError);
      // Learning failures don't break the conversation - MAIA continues normally
    }

    console.log(`✅ MAIA ${processingProfile} response complete: ${processingTimeMs}ms | ${text.length} chars${audioResponse ? ` + audio (${audioResponse.voiceProfile})` : ''}`);

    return {
      text,
      processingProfile,
      processingTimeMs,
      audio: audioResponse
    };

  } catch (error) {
    console.error('❌ MAIA processing failed:', error);
    const processingTimeMs = Date.now() - startTime;

    const text = "That last response didn't come out the way I intended. You're right to expect the focus to stay on you. Let's reset: what would feel most useful to talk about right now—support, clarity, or just a place to vent?";

    return {
      text,
      processingProfile: 'FAST',
      processingTimeMs
    };
  }
}
