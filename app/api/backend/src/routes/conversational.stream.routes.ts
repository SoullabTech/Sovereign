import { Router, Request, Response } from "express";
import { logger } from "../utils/logger";
import { rateLimit } from "../middleware/rateLimit";
import { attachSSE } from "../utils/sseRegistry";
import { personalOracleAgent } from "../agents/PersonalOracleAgent";
import { dialogueStateTracker } from "../services/EnhancedDialogueStateTracker";
import { ResearchLogger } from "../services/ResearchLogger";
import { intentMappingService } from "../services/IntentMappingService";

const router = Router();

// Initialize ResearchLogger
const researchLogger = new ResearchLogger();

// ~30 streams per minute per IP for SSE endpoints
const streamLimiter = rateLimit({ windowMs: 60_000, max: 30 });

/**
 * GET /api/v1/converse/stream
 * Maya Conversational Pipeline: SpiralogicAdapter → SesameMayaRefiner → PersonalOracleAgent → ElevenLabs
 * Query: ?element=air|fire|water|earth|aether&userId=...&lang=en-US&q=userText
 * Header: Accept: text/event-stream
 */
router.get("/stream", streamLimiter, async (req: Request, res: Response) => {
  // Feature flag to disable streaming in prod if needed
  if (process.env.STREAMING_ENABLED === '0') {
    return res.status(503).json({ success: false, error: 'Streaming disabled' });
  }

  const element = String(req.query.element || "aether").toLowerCase();
  const userId = String(req.query.userId || "anon");
  const userText = String(req.query.q || req.query.text || "");
  const lang = String(req.query.lang || "en-US");
  // Accept sessionId from client or create persistent one per user
  const sessionId = String(req.query.sessionId || req.headers['x-session-id'] || `session-${userId}-persistent`);

  // Basic validation
  if (!userText) {
    res.status(400).json({ error: "Missing q/text parameter" });
    return;
  }

  // SSE headers - Production optimized
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  res.setHeader("Transfer-Encoding", "chunked");
  
  // Disable compression for SSE to prevent buffering
  res.setHeader("Content-Encoding", "identity");
  res.flushHeaders?.();
  
  // Register for graceful shutdown
  attachSSE(res);
  
  // Handle client disconnect
  req.on("close", () => {
    try { res.end(); } catch {}
  });

  const send = (type: string, payload: any) =>
    res.write(`event: ${type}\n` + `data: ${JSON.stringify(payload)}\n\n`);

  try {
    logger.info('🌊 Starting Maya conversational stream', { element, userId, sessionId, userText: userText.substring(0, 50) });

    // Update dialogue state for intent detection and tracking
    const dialogueState = await dialogueStateTracker.updateState(
      sessionId,
      userId,
      userText
    );

    // Send metadata with Maya branding
    send("meta", { 
      element, 
      lang, 
      model: 'maya-conversational-pipeline',
      pipeline: ['spiralogic-adapter', 'sesame-refiner', 'maya-personality', 'elevenlabs-voice'],
      tracking: {
        intent: dialogueState.intent.primary,
        confidence: dialogueState.intent.confidence,
        stage: dialogueState.flow.stage
      }
    });

    // Process through Maya's full conversational pipeline with persistent session
    const mayaResponse = await personalOracleAgent.consult({
      input: userText,
      userId,
      sessionId, // Now uses persistent session for memory continuity
      targetElement: element as any,
      context: {
        previousInteractions: dialogueState.turnCount,
        userPreferences: {},
        currentPhase: dialogueState.flow.stage,
        // Include conversation history for memory persistence
        conversationHistory: req.query.conversationHistory ? 
          JSON.parse(String(req.query.conversationHistory)) : []
      }
    });

    if (!mayaResponse.success) {
      logger.error('Maya consultation failed', { errors: mayaResponse.errors });
      send("delta", { text: "I'm experiencing some technical difficulties. Could you share that again?" });
      send("done", { reason: "error", message: "Maya consultation failed" });
      res.end();
      return;
    }

    // Stream Maya's response word by word for real-time feel
    const response = mayaResponse.data;
    
    // Log intent detection for research
    const mappedIntents = intentMappingService.getResearchLoggerIntents(
      dialogueState.intent.primary,
      userText,
      dialogueState.intent.confidence
    );
    
    researchLogger.logIntent({
      userId,
      sessionId,
      intent: mappedIntents.primary,
      confidence: mappedIntents.mappingConfidence,
      userMessage: userText,
      mayaResponse: response.message,
      metadata: {
        element: response.element,
        archetype: response.archetype,
        secondaryIntents: mappedIntents.secondary,
        dialogueStage: dialogueState.flow.stage,
        emotionalState: dialogueState.emotion.current.primaryEmotion
      }
    });
    
    // Log dialogue stage if changed
    const currentStageNumber = intentMappingService.mapDialogueStage(dialogueState.flow.stage);
    if (dialogueState.turnCount === 1 || dialogueState.flow.stage !== 'exploring') {
      researchLogger.logStageTransition({
        userId,
        sessionId,
        previousStage: dialogueState.turnCount === 1 ? 1 : currentStageNumber - 1,
        currentStage: currentStageNumber,
        transitionReason: `Progression to ${dialogueState.flow.stage}`,
        stageMetrics: {
          duration: 0, // Would need proper tracking
          messageCount: dialogueState.turnCount,
          engagementScore: dialogueState.flow.momentum
        }
      });
    }
    
    // Log emotional shifts
    if (dialogueState.emotion.trajectory.volatility > 0.3) {
      researchLogger.logEmotionShift({
        userId,
        sessionId,
        previousState: {
          valence: 0, // Would need proper tracking
          arousal: 0,
          dominance: 0
        },
        currentState: {
          valence: dialogueState.emotion.current.valence,
          arousal: dialogueState.emotion.current.arousal,
          dominance: dialogueState.emotion.current.dominance
        },
        triggerIntent: mappedIntents.primary,
        elementalInfluence: response.element
      });
    }
    
    const words = response.message.split(' ');
    let accumulatedText = '';

    // Heartbeat to prevent proxy timeouts
    const heartbeat = setInterval(() => send("heartbeat", { t: Date.now() }), 15000);

    try {
      // Stream words with natural pacing
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        accumulatedText += (i > 0 ? ' ' : '') + word;
        
        send("delta", { text: word + (i < words.length - 1 ? ' ' : '') });
        
        // Natural pause between words (Maya's conversational rhythm)
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
      }

      clearInterval(heartbeat);
      send("done", { 
        reason: "complete", 
        metadata: { 
          model: 'maya-conversational',
          element: response.element,
          archetype: response.archetype,
          confidence: response.confidence,
          pipeline: 'spiralogic → sesame → maya → voice',
          totalLength: accumulatedText.length,
          refined: true,
          research: {
            intentDetected: mappedIntents.primary,
            intentName: ['greeting_connection', 'seeking_guidance', 'emotional_expression', 'philosophical_inquiry', 
                        'practical_help', 'spiritual_exploration', 'creative_block', 'relationship_dynamics',
                        'shadow_work', 'integration_request', 'resistance_expression', 'vulnerability_sharing',
                        'celebration_achievement', 'crisis_support', 'curiosity_learning', 'boundary_setting',
                        'breakthrough_moment', 'gratitude_expression', 'transition_navigation', 'wisdom_seeking'][mappedIntents.primary - 1],
            dialogueStage: currentStageNumber,
            stageName: ['initial_contact', 'trust_building', 'exploration', 'deepening',
                       'challenge_growth', 'integration', 'transformation', 'ongoing_companionship'][currentStageNumber - 1],
            emotionalTrend: dialogueState.emotion.trajectory.trend,
            relationshipTrust: dialogueState.relationship.trust,
            momentum: dialogueState.flow.momentum
          }
        } 
      });

    } catch (streamError) {
      clearInterval(heartbeat);
      logger.error('Maya streaming error:', streamError);
      
      // Maya's warm error handling
      send("delta", { text: "I'm here with you, even when the technology isn't cooperating perfectly. " });
      send("delta", { text: "What would you like to explore together?" });
      send("done", { reason: "error" });
    }

    res.end();

  } catch (err: any) {
    logger.error("Maya conversational pipeline error:", err);
    // Maya's gentle error response
    send("delta", { text: "I'm experiencing a moment of technical difficulty. " });
    send("delta", { text: "Your question is important to me - could you share it again?" });
    send("done", { reason: "error" });
    res.end();
  }
});

// Cleanup function for graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Closing research logger streams');
  researchLogger.close();
});

export default router;