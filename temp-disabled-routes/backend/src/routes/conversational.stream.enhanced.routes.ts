import { Router, Request, Response } from "express";
import { logger } from "../utils/logger";
import { rateLimit } from "../middleware/rateLimit";
import { attachSSE } from "../utils/sseRegistry";
import { personalOracleAgent } from "../agents/PersonalOracleAgent";
import { dialogueStateTracker } from "../services/EnhancedDialogueStateTracker";
import { ResearchLogger } from "../services/ResearchLogger";
import { intentMappingService } from "../services/IntentMappingService";
import { emotionAnalysisService } from "../services/EmotionAnalysisService";

const router = Router();

// Initialize ResearchLogger
const researchLogger = new ResearchLogger();

// ~30 streams per minute per IP for SSE endpoints
const streamLimiter = rateLimit({ windowMs: 60_000, max: 30 });

// Track dialogue stages for research logging
const dialogueStageTracker = new Map<string, { stage: number; startTime: number; messageCount: number }>();

// Track emotional states for shift detection
const emotionalStateTracker = new Map<string, { valence: number; arousal: number; dominance: number }>();

/**
 * GET /api/v1/converse/stream/enhanced
 * Enhanced Maya Conversational Pipeline with full research logging
 * Tracks all 20 intents, 8 dialogue stages, and emotional shifts
 */
router.get("/stream/enhanced", streamLimiter, async (req: Request, res: Response) => {
  // Feature flag to disable streaming in prod if needed
  if (process.env.STREAMING_ENABLED === '0') {
    return res.status(503).json({ success: false, error: 'Streaming disabled' });
  }

  const element = String(req.query.element || "aether").toLowerCase();
  const userId = String(req.query.userId || "anon");
  const userText = String(req.query.q || req.query.text || "");
  const lang = String(req.query.lang || "en-US");
  const sessionId = `stream_${Date.now()}_${userId}`;

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
    logger.info('🌊 Starting enhanced Maya conversational stream', { 
      element, 
      userId, 
      sessionId,
      userText: userText.substring(0, 50) 
    });

    // Get or initialize dialogue stage tracking
    let stageInfo = dialogueStageTracker.get(userId) || {
      stage: 1, // initial_contact
      startTime: Date.now(),
      messageCount: 0
    };

    // Get previous emotional state
    const previousEmotionalState = emotionalStateTracker.get(userId) || {
      valence: 0,
      arousal: 0,
      dominance: 0
    };

    // Update dialogue state BEFORE processing
    const dialogueState = await dialogueStateTracker.updateState(
      sessionId,
      userId,
      userText
    );

    // Analyze current emotional state
    const currentEmotionalAnalysis = await emotionAnalysisService.analyzeText(
      userText,
      dialogueState.relationship.trust
    );

    const currentEmotionalState = {
      valence: currentEmotionalAnalysis.valence,
      arousal: currentEmotionalAnalysis.arousal,
      dominance: currentEmotionalAnalysis.dominance
    };

    // Send metadata with enhanced tracking info
    send("meta", { 
      element, 
      lang, 
      model: 'maya-conversational-pipeline-enhanced',
      pipeline: ['spiralogic-adapter', 'sesame-refiner', 'maya-personality', 'elevenlabs-voice'],
      tracking: {
        intent: dialogueState.intent.primary,
        stage: dialogueState.flow.stage,
        emotion: currentEmotionalAnalysis.primaryEmotion?.emotion,
        sessionId
      }
    });

    // Process through Maya's full conversational pipeline
    const mayaResponse = await personalOracleAgent.consult({
      input: userText,
      userId,
      sessionId,
      targetElement: element as any,
      context: {
        previousInteractions: stageInfo.messageCount,
        userPreferences: {},
        currentPhase: dialogueState.flow.stage
      }
    });

    if (!mayaResponse.success) {
      logger.error('Maya consultation failed', { error: mayaResponse.error });
      send("delta", { text: "I'm experiencing some technical difficulties. Could you share that again?" });
      send("done", { reason: "error", message: "Maya consultation failed" });
      res.end();
      return;
    }

    const response = mayaResponse.data;

    // Map intents for research logging
    const mappedIntents = intentMappingService.getResearchLoggerIntents(
      dialogueState.intent.primary,
      userText,
      dialogueState.intent.confidence
    );

    // Log intent to ResearchLogger
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
        emotionalState: currentEmotionalAnalysis.primaryEmotion
      }
    });

    // Check for dialogue stage transition
    const currentStageNumber = intentMappingService.mapDialogueStage(dialogueState.flow.stage);
    if (currentStageNumber !== stageInfo.stage) {
      // Log stage transition
      researchLogger.logStageTransition({
        userId,
        sessionId,
        previousStage: stageInfo.stage,
        currentStage: currentStageNumber,
        transitionReason: `Natural progression from ${stageInfo.stage} to ${currentStageNumber}`,
        stageMetrics: {
          duration: (Date.now() - stageInfo.startTime) / 1000, // seconds
          messageCount: stageInfo.messageCount,
          engagementScore: dialogueState.flow.momentum
        }
      });

      // Update stage tracking
      stageInfo = {
        stage: currentStageNumber,
        startTime: Date.now(),
        messageCount: 0
      };
    }

    stageInfo.messageCount++;
    dialogueStageTracker.set(userId, stageInfo);

    // Log emotional shift if significant
    const emotionalShiftMagnitude = Math.sqrt(
      Math.pow(currentEmotionalState.valence - previousEmotionalState.valence, 2) +
      Math.pow(currentEmotionalState.arousal - previousEmotionalState.arousal, 2) +
      Math.pow(currentEmotionalState.dominance - previousEmotionalState.dominance, 2)
    );

    if (emotionalShiftMagnitude > 0.2) { // Threshold for logging
      researchLogger.logEmotionShift({
        userId,
        sessionId,
        previousState: previousEmotionalState,
        currentState: currentEmotionalState,
        triggerIntent: mappedIntents.primary,
        elementalInfluence: response.element
      });
    }

    // Update emotional state tracker
    emotionalStateTracker.set(userId, currentEmotionalState);

    // Stream Maya's response word by word for real-time feel
    const words = response.message.split(' ');
    let accumulatedText = '';

    // Heartbeat to prevent proxy timeouts
    const heartbeat = setInterval(() => send("heartbeat", { t: Date.now() }), 15000);

    try {
      // Send initial insight about detected patterns
      send("insight", {
        intent: dialogueState.intent.primary,
        confidence: dialogueState.intent.confidence,
        stage: dialogueState.flow.stage,
        emotionalTrend: dialogueState.emotion.trajectory.trend,
        elementalAlignment: dialogueState.emotion.elementalAlignment.element
      });

      // Stream words with natural pacing
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        accumulatedText += (i > 0 ? ' ' : '') + word;
        
        send("delta", { text: word + (i < words.length - 1 ? ' ' : '') });
        
        // Natural pause between words (Maya's conversational rhythm)
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
      }

      clearInterval(heartbeat);
      
      // Send comprehensive completion metadata
      send("done", { 
        reason: "complete", 
        metadata: { 
          model: 'maya-conversational-enhanced',
          element: response.element,
          archetype: response.archetype,
          confidence: response.confidence,
          pipeline: 'spiralogic → sesame → maya → voice',
          totalLength: accumulatedText.length,
          refined: true,
          tracking: {
            intentDetected: mappedIntents.primary,
            intentName: researchLogger['INTENT_NAMES'][mappedIntents.primary - 1],
            dialogueStage: currentStageNumber,
            stageName: researchLogger['STAGE_NAMES'][currentStageNumber - 1],
            emotionalShift: emotionalShiftMagnitude > 0.2,
            shiftMagnitude: emotionalShiftMagnitude,
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
    logger.error("Enhanced Maya conversational pipeline error:", err);
    // Maya's gentle error response
    send("delta", { text: "I'm experiencing a moment of technical difficulty. " });
    send("delta", { text: "Your question is important to me - could you share it again?" });
    send("done", { reason: "error" });
    res.end();
  }
});

/**
 * GET /api/v1/converse/stream/research-summary
 * Get current research tracking summary for a user
 */
router.get("/stream/research-summary/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  try {
    const dialogueStage = dialogueStageTracker.get(userId);
    const emotionalState = emotionalStateTracker.get(userId);
    
    const summary = {
      userId,
      currentStage: dialogueStage?.stage || 1,
      stageStartTime: dialogueStage?.startTime || null,
      messageCountInStage: dialogueStage?.messageCount || 0,
      emotionalState: emotionalState || { valence: 0, arousal: 0, dominance: 0 },
      timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, data: summary });
  } catch (error) {
    logger.error('Failed to get research summary', { error, userId });
    res.status(500).json({ success: false, error: 'Failed to retrieve summary' });
  }
});

// Cleanup function for graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Closing research logger streams');
  researchLogger.close();
});

export default router;