// backend: lib/learning/enhanced-maia-service.ts

/**
 * ENHANCED MAIA SERVICE WITH LEARNING PIPELINE
 *
 * This service extends the existing maiaService.ts with Claude-as-teacher learning.
 * It can be used as a drop-in replacement that adds learning capabilities while
 * maintaining full compatibility with the existing API.
 *
 * Key features:
 * - Gradual handoff from Claude (teacher) to DeepSeek/local models (students)
 * - Training data collection from Claude's gold-standard responses
 * - Teacher feedback loop to improve local model performance
 * - Fallback to Claude for complex situations
 * - Full compatibility with existing MAIA infrastructure
 */

import { incrementTurnCount, addConversationExchange, getConversationHistory } from '../sovereign/sessionManager';
import { buildMaiaWisePrompt, buildMaiaComprehensivePrompt, sanitizeMaiaOutput, type MaiaContext } from '../sovereign/maiaVoice';
import { generateText } from '../ai/modelService';
import { consciousnessOrchestrator } from '../orchestration/consciousness-orchestrator';
import { consciousnessWrapper, type ConsciousnessContext } from '../consciousness/consciousness-layer-wrapper';
import { elementalRouter } from '../consciousness/elemental-context-router';
import { conversationElementalTracker } from '../consciousness/conversation-elemental-tracker';
import { maiaConversationRouter, type ProcessingProfile } from '../consciousness/processingProfiles';
import { buildTimeoutFallback } from '../consciousness/maiaFallbacks';
import { synthesizeMaiaVoice, selectVoiceProfile, type MaiaVoiceResponse } from '../voice/maiaVoiceService';
import { learningOrchestrator } from './learning-orchestrator';

export type EnhancedMaiaResponse = {
  text: string;
  processingProfile?: ProcessingProfile;
  processingTimeMs?: number;
  audio?: MaiaVoiceResponse;
  // Learning-specific fields
  modelUsed?: 'claude' | 'deepseek' | 'local';
  learningData?: {
    teacherMode?: boolean;
    reasoningTrace?: string;
    situationType?: string;
    localModel?: boolean;
    teacherFeedback?: any;
    shouldImprove?: boolean;
    usedClaudeOverride?: boolean;
  };
};

type EnhancedMaiaRequest = {
  sessionId: string;
  input: string;
  meta?: Record<string, unknown>;
  includeAudio?: boolean;
  voiceProfile?: 'default' | 'intimate' | 'wise' | 'grounded';
  // Learning mode options
  enableLearning?: boolean; // Default false to maintain compatibility
  forceTeacher?: boolean;   // Force Claude teacher mode for critical situations
  collectTraining?: boolean; // Force collection of training data
};

/**
 * Enhanced MAIA response generation with learning pipeline
 * Falls back to original maiaService behavior when learning is disabled
 */
export async function getEnhancedMaiaResponse(req: EnhancedMaiaRequest): Promise<EnhancedMaiaResponse> {
  const {
    sessionId,
    input,
    meta = {},
    includeAudio = false,
    voiceProfile,
    enableLearning = false,
    forceTeacher = false,
    collectTraining = false
  } = req;

  const startTime = Date.now();

  // Increment turn count for this session
  await incrementTurnCount(sessionId);

  try {
    // Get conversation history for context
    const conversationHistory = await getConversationHistory(sessionId, 10);
    const turnCount = conversationHistory.length + 1;

    let rawResponse: string;
    let modelUsed: 'claude' | 'deepseek' | 'local' = 'claude';
    let learningData: any = null;
    let processingProfile: ProcessingProfile = 'FAST';

    if (enableLearning && !forceTeacher) {
      // 🎓 LEARNING PIPELINE: Use orchestrator to decide model and generate response
      console.log(`🎓 Learning mode enabled - using learning orchestrator`);

      const learningResult = await learningOrchestrator.generateMaiaResponse(
        input,
        conversationHistory,
        sessionId,
        buildContextForLearning(sessionId, conversationHistory, meta)
      );

      rawResponse = learningResult.text;
      modelUsed = learningResult.model as any;
      learningData = learningResult.learningData;

      // Infer processing profile based on complexity and model choice
      processingProfile = inferProcessingProfile(input, conversationHistory, modelUsed);

      console.log(`🎓 Learning result: ${modelUsed} model | ${learningData?.situationType || 'unknown'} situation`);

    } else {
      // 🎯 ORIGINAL PIPELINE: Use existing MAIA service logic
      console.log(`🎯 Standard mode - using original MAIA service logic`);

      // Use original processing router (Phase 2: Now with cognitive profile awareness)
      const userId = (meta as any).userId;
      const routerResult = await maiaConversationRouter.chooseProcessingProfile({
        message: input,
        turnCount,
        conversationHistory,
        userId: userId || undefined,
        sessionId: userId ? undefined : sessionId, // Fallback to sessionId if no userId
      });
      processingProfile = routerResult.profile;

      // Attach cognitive profile to meta for downstream services
      if (routerResult.meta?.cognitiveProfile) {
        (meta as any).cognitiveProfile = routerResult.meta.cognitiveProfile;
      }

      console.log(`🚦 Processing Profile: ${processingProfile} | Turn ${turnCount} | Length: ${input.length}`);
      console.log(`🧠 Router reasoning: ${routerResult.reasoning}`);

      // Generate response using original paths
      if (forceTeacher || collectTraining) {
        // Force Claude teacher mode for critical situations or training collection
        rawResponse = await generateClaudeTeacherResponse(input, conversationHistory, sessionId);
        modelUsed = 'claude';
        learningData = { teacherMode: true, forceMode: forceTeacher };
      } else {
        // Use original processing paths
        const result = await generateOriginalMaiaResponse(
          processingProfile,
          sessionId,
          input,
          conversationHistory,
          meta
        );
        rawResponse = result.response;
        if (result.consciousnessData) {
          learningData = { consciousnessData: result.consciousnessData };
        }
      }
    }

    // Apply MAIA's voice sanitization
    const text = sanitizeMaiaOutput(rawResponse);
    let audioResponse: MaiaVoiceResponse | undefined;

    // 🎤 VOICE SYNTHESIS: Same as original
    if (includeAudio) {
      try {
        console.log(`🎤 Synthesizing MAIA's voice...`);

        const finalVoiceProfile = voiceProfile || selectVoiceProfile(text, processingProfile);

        audioResponse = await synthesizeMaiaVoice({
          text,
          voiceProfile: finalVoiceProfile as any,
          format: 'mp3'
        });

        console.log(`✅ Voice synthesis complete: ${audioResponse.synthesisTimeMs}ms | ${finalVoiceProfile} profile`);
      } catch (voiceError) {
        console.error('❌ Voice synthesis failed (continuing with text-only):', voiceError);
      }
    }

    const processingTimeMs = Date.now() - startTime;

    // Store conversation exchange with learning metadata
    await addConversationExchange(sessionId, input, text, {
      ...meta,
      processingProfile,
      processingTimeMs,
      consciousnessData: learningData?.consciousnessData,
      audioIncluded: !!audioResponse,
      // Learning fields
      modelUsed: enableLearning ? modelUsed : undefined,
      learningData: enableLearning ? learningData : undefined
    });

    const logPrefix = enableLearning ?
      `✅ Enhanced MAIA (${modelUsed})` :
      `✅ MAIA ${processingProfile}`;

    console.log(`${logPrefix} response complete: ${processingTimeMs}ms | ${text.length} chars${audioResponse ? ` + audio (${audioResponse.voiceProfile})` : ''}`);

    return {
      text,
      processingProfile,
      processingTimeMs,
      audio: audioResponse,
      modelUsed: enableLearning ? modelUsed : undefined,
      learningData: enableLearning ? learningData : undefined
    };

  } catch (error) {
    console.error('❌ Enhanced MAIA processing failed:', error);
    const processingTimeMs = Date.now() - startTime;

    // Use same fallback as original service
    const text = "That last response didn't come out the way I intended. You're right to expect the focus to stay on you. Let's reset: what would feel most useful to talk about right now—support, clarity, or just a place to vent?";

    return {
      text,
      processingProfile: 'FAST',
      processingTimeMs,
      modelUsed: enableLearning ? 'claude' : undefined
    };
  }
}

/**
 * Generate Claude teacher response with reasoning trace
 */
async function generateClaudeTeacherResponse(
  input: string,
  conversationHistory: any[],
  sessionId: string
): Promise<string> {

  const { generateTeacherExample } = await import('./claude-teacher-service');

  const teacherExample = await generateTeacherExample(input, conversationHistory, sessionId);

  return teacherExample.claudeResponse;
}

/**
 * Generate response using original MAIA service logic
 * This replicates the FAST/CORE/DEEP paths from maiaService.ts
 */
async function generateOriginalMaiaResponse(
  processingProfile: ProcessingProfile,
  sessionId: string,
  input: string,
  conversationHistory: any[],
  meta: Record<string, unknown>
): Promise<{ response: string; consciousnessData?: any }> {

  let consciousnessData: any = null;

  switch (processingProfile) {
    case 'FAST':
      // Replicate fastPathResponse from maiaService.ts
      const recentContext = conversationHistory.slice(-3).map(ex =>
        `User: ${ex.userMessage}\nMAIA: ${ex.maiaResponse.substring(0, 80)}...`
      ).join('\n');

      const contextPrompt = recentContext.length > 0
        ? `Recent conversation:\n${recentContext}\n\nUser: ${input}`
        : input;

      const { MAIA_RUNTIME_PROMPT, MAIA_RELATIONAL_SPEC, MAIA_LINEAGES_AND_FIELD, MAIA_CENTER_OF_GRAVITY } = await import('../consciousness/MAIA_RUNTIME_PROMPT');

      const { text: response } = await generateText({
        systemPrompt: `${MAIA_RELATIONAL_SPEC}\n\n${MAIA_LINEAGES_AND_FIELD}\n\n${MAIA_CENTER_OF_GRAVITY}\n\n${MAIA_RUNTIME_PROMPT}\n\nCurrent context: Simple conversation turn - respond naturally and warmly.`,
        userInput: contextPrompt,
        meta: {
          ...meta,
          fastProcessing: true,
          engine: 'deepseek-r1',
          responseTarget: 'conversational'
        }
      });

      return { response };

    case 'CORE':
      // Replicate corePathResponse from maiaService.ts
      const conversationContext = conversationElementalTracker.processMessage(sessionId, input, conversationHistory);

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
        conversationContext: meta.conversationContext
      };

      const adaptivePrompt = buildMaiaWisePrompt(context, input, conversationHistory);

      const { text: coreResponse } = await generateText({
        systemPrompt: adaptivePrompt,
        userInput: input,
        meta: {
          ...meta,
          coreProcessing: true,
          conversationProfile: conversationContext.profile,
          inputComplexity: 'moderate'
        }
      });

      return { response: coreResponse };

    case 'DEEP':
      // Replicate deepPathResponse from maiaService.ts
      const deepConversationContext = conversationElementalTracker.processMessage(sessionId, input, conversationHistory);

      const consciousnessContext: ConsciousnessContext = {
        sessionId,
        userId: sessionId,
        conversationHistory,
        currentDepth: deepConversationContext.profile.relationshipDepth,
        elementalResonance: deepConversationContext.profile.elementalTrend,
        observerLevel: Math.max(1, Math.min(conversationHistory.length + 1, 7)),
        temporalWindow: deepConversationContext.profile.conversationPhase === 'transcending' ? 'eternal' : 'present',
        metaAwareness: deepConversationContext.profile.conversationPhase === 'transcending' || deepConversationContext.profile.dominantElement === 'aether'
      };

      const consciousnessResponse = await consciousnessWrapper.processConsciousnessEvolution(input, consciousnessContext);

      consciousnessData = {
        layersActivated: consciousnessResponse.layersActivated,
        depth: consciousnessResponse.depth,
        observerInsights: consciousnessResponse.observerInsights,
        evolutionTriggers: consciousnessResponse.evolutionTriggers
      };

      return {
        response: consciousnessResponse.response,
        consciousnessData
      };

    default:
      // Fallback to FAST
      return generateOriginalMaiaResponse('FAST', sessionId, input, conversationHistory, meta);
  }
}

/**
 * Build context object for learning system
 */
function buildContextForLearning(
  sessionId: string,
  conversationHistory: any[],
  meta: Record<string, unknown>
): MaiaContext | undefined {

  if (conversationHistory.length === 0) return undefined;

  // Simplified context building for learning system
  return {
    sessionId,
    summary: `Learning conversation: ${conversationHistory.length + 1} turns`,
    memberProfile: undefined,
    wisdomAdaptation: undefined,
    consciousnessInsights: {
      dominantElement: 'earth', // Default for learning mode
      processingStrategy: 'learning',
      relationshipDepth: Math.min(conversationHistory.length, 7)
    },
    conversationContext: meta.conversationContext
  };
}

/**
 * Infer processing profile based on input and model choice
 */
function inferProcessingProfile(
  input: string,
  conversationHistory: any[],
  modelUsed: string
): ProcessingProfile {

  // If using local model, likely FAST processing
  if (modelUsed === 'deepseek') return 'FAST';

  // If using Claude, infer from complexity
  const complexity = input.length > 100 ||
    ['struggling', 'overwhelmed', 'lost', 'trauma', 'relationship'].some(word =>
      input.toLowerCase().includes(word)
    );

  if (complexity) return 'DEEP';
  if (conversationHistory.length > 3) return 'CORE';
  return 'FAST';
}

/**
 * Wrapper function that maintains compatibility with original maiaService.ts
 * This can be used as a drop-in replacement that adds learning when enabled
 */
export async function getMaiaResponse(req: {
  sessionId: string;
  input: string;
  meta?: Record<string, unknown>;
  includeAudio?: boolean;
  voiceProfile?: 'default' | 'intimate' | 'wise' | 'grounded';
}): Promise<{
  text: string;
  processingProfile?: ProcessingProfile;
  processingTimeMs?: number;
  audio?: MaiaVoiceResponse;
}> {

  // Call enhanced service with learning disabled for backward compatibility
  const result = await getEnhancedMaiaResponse({
    ...req,
    enableLearning: false
  });

  // Return only the fields expected by the original API
  return {
    text: result.text,
    processingProfile: result.processingProfile,
    processingTimeMs: result.processingTimeMs,
    audio: result.audio
  };
}