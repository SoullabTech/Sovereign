/**
 * Conversational Routes - Sesame/Maia Centric API
 * Main endpoint for sacred conversational intelligence
 */

import { Router, Request, Response } from 'express';
import { conversationalPipeline, ConversationalContext } from '../services/ConversationalPipeline';
import { safetyService } from '../services/SafetyModerationService';
import { logger } from '../utils/logger';
import { rateLimit } from '../middleware/rateLimit';
import { adminAnalytics } from '../services/AdminAnalyticsService';

const router = Router();

// Rate limiters for production protection
// ~60 POSTs per minute per IP for text requests
const messageLimiter = rateLimit({ windowMs: 60_000, max: 60 });

/**
 * @route GET /api/v1/ops/ping  
 * @description Lightweight uptime endpoint for external monitors
 */
router.get('/ops/ping', (req: Request, res: Response) => {
  const uptimeSeconds = Math.floor(process.uptime());
  res.json({
    ok: true,
    uptime: uptimeSeconds,
    timestamp: Date.now(),
    service: 'maia'
  });
});

/**
 * @route GET /api/v1/converse/health
 * @description Comprehensive health check for production monitoring
 */
router.get('/health', (req: Request, res: Response) => {
  const healthStatus = {
    success: true,
    service: 'conversational',
    status: 'ready',
    pipeline: 'sesame-maya',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      streaming: process.env.STREAMING_ENABLED !== '0',
      voiceSynthesis: true,
      elementalRouting: true,
      sesamaRefinement: process.env.MAYA_REFINE_STREAM === '1',
      breathMarkers: process.env.MAYA_BREATH_MARKS === '1',
      safetyModeration: process.env.SAFETY_BYPASS_TEST !== '1'
    },
    models: {
      air: 'claude-3-5-sonnet',
      fire: 'elemental-oracle-2.0', 
      water: 'elemental-oracle-2.0',
      earth: 'elemental-oracle-2.0',
      aether: 'elemental-oracle-2.0'
    },
    apiKeys: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY
    },
    environment: {
      node: process.env.NODE_ENV || 'development',
      port: process.env.APP_PORT || process.env.PORT || '3001'
    }
  };

  res.json(healthStatus);
});

/**
 * @route POST /api/v1/converse/stream
 * @description Streaming conversational endpoint - Real-time Maya
 */
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const {
      userText,
      userId,
      element = 'aether',
      voiceEnabled = false,
      sessionId,
      context = {},
      journal = false,
      tags = [],
      phase
    } = req.body;

    if (!userText || !userId) {
      return res.status(400).json({
        success: false,
        error: 'userText and userId are required'
      });
    }

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Helper function to send SSE data
    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // Send initial connection confirmation
      sendEvent('connected', { status: 'connected', sessionId });

      // Basic safety check first
      const safetyCheck = await safetyService.moderateInput(userText, userId);
      
      if (!safetyCheck.safe) {
        sendEvent('safety_intervention', {
          text: safetyCheck.response || "I want to make sure you have the support you need.",
          element: 'aether',
          supportResources: safetyCheck.supportResources
        });
        sendEvent('complete', { status: 'complete', source: 'safety' });
        return res.end();
      }

      // Send processing started event
      sendEvent('processing', { element, status: 'routing_to_elemental_intelligence' });

      // Create conversational context
      const conversationalContext: ConversationalContext = {
        userId,
        userText,
        element,
        voiceEnabled,
        sessionId: sessionId || `session_${Date.now()}`,
        conversationHistory: [], // Required field
        convoSummary: '',
        longMemSnippets: [],
        recentBotReplies: [],
        sentiment: 'neutral',
        journal,
        tags,
        phase
      };

      // Stream the response through ConversationalPipeline
      await conversationalPipeline.streamResponse(conversationalContext, {
        onToken: (token: string) => sendEvent('token', { token }),
        onElement: (elementData: any) => sendEvent('element', elementData),
        onComplete: (response: any) => {
          sendEvent('response', response);
          sendEvent('complete', { status: 'complete' });
        },
        onError: (error: any) => {
          sendEvent('error', { error: error.message });
          sendEvent('complete', { status: 'error' });
        }
      });

    } catch (error) {
      logger.error('Streaming conversation error:', error);
      sendEvent('error', {
        error: 'Processing error occurred',
        fallback: true
      });
      sendEvent('complete', { status: 'error' });
    }

    res.end();

  } catch (error) {
    logger.error('SSE setup error:', error);
    res.status(500).json({
      success: false,
      error: 'Streaming setup failed'
    });
  }
});

/**
 * @route POST /api/v1/converse/message
 * @description Main conversational endpoint - Sesame/Maya pipeline (non-streaming)
 */
router.post('/message', messageLimiter, async (req: Request, res: Response) => {
  try {
    const {
      userText,
      userId,
      element = 'aether',
      voiceEnabled = false,
      sessionId,
      context = {},
      journal = false,
      tags = [],
      phase
    } = req.body;

    if (!userText || !userId) {
      return res.status(400).json({
        success: false,
        error: 'userText and userId are required'
      });
    }

    // Basic safety check first
    const safetyCheck = await safetyService.moderateInput(userText, userId);
    
    if (!safetyCheck.safe) {
      return res.json({
        success: true,
        response: {
          text: safetyCheck.response || "I want to make sure you have the support you need.",
          audioUrl: null,
          element: 'aether',
          source: 'safety_intervention',
          supportResources: safetyCheck.supportResources
        }
      });
    }

    // Build conversational context
    const conversationalContext: ConversationalContext = {
      userText,
      userId,
      element,
      voiceEnabled,
      sessionId,
      conversationHistory: [], // Required field
      convoSummary: context.summary || '',
      longMemSnippets: context.memorySnippets || [],
      recentBotReplies: context.recentReplies || [],
      sentiment: determineSentiment(userText),
      journal,
      tags,
      phase
    };

    // Start analytics tracking for this session
    try {
      adminAnalytics.startSession(
        sessionId || `session_${Date.now()}`, 
        userId, 
        'Anonymous', // Username - could be extracted from context
        element
      );
    } catch (analyticsError) {
      logger.warn('Analytics tracking failed (non-critical):', analyticsError);
    }

    // Process through Sesame-centric pipeline
    const startTime = Date.now();
    const result = await conversationalPipeline.converseViaSesame(conversationalContext);
    const responseTime = Date.now() - startTime;

    // Record interaction analytics
    try {
      const interactionType = voiceEnabled ? 'voice' : 'text';
      const citationCount = result.citations?.length || 0;
      adminAnalytics.recordInteraction(
        sessionId || `session_${Date.now()}`, 
        interactionType, 
        responseTime, 
        citationCount
      );
    } catch (analyticsError) {
      logger.warn('Analytics interaction recording failed (non-critical):', analyticsError);
    }

    res.json({
      success: true,
      response: {
        text: result.text,
        audioUrl: result.audioUrl,
        element: result.element,
        source: result.source,
        processingTime: result.processingTime,
        metadata: {
          draftModel: result.metadata.draftModel,
          reshapeCount: result.metadata.reshapeCount,
          voiceSynthesized: result.metadata.voiceSynthesized,
          cost: result.metadata.cost
        }
      }
    });

  } catch (error: any) {
    logger.error('Conversational route error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Conversational processing failed',
      fallback: {
        text: "I'm taking a moment to center myself. What would you like to explore together?",
        audioUrl: null,
        element: 'aether',
        source: 'error_fallback'
      }
    });
  }
});

/**
 * @route POST /api/converse/voice-journal
 * @description Voice journal integration with conversational pipeline
 */
router.post('/voice-journal', async (req: Request, res: Response) => {
  try {
    const {
      transcription,
      userId,
      audioMetadata,
      element = 'water', // Water for emotional journaling
      generateResponse = true
    } = req.body;

    if (!transcription || !userId) {
      return res.status(400).json({
        success: false,
        error: 'transcription and userId are required'
      });
    }

    if (!generateResponse) {
      // Just acknowledge the journal entry
      return res.json({
        success: true,
        response: {
          text: "Your voice has been heard and honored. Thank you for sharing.",
          audioUrl: null,
          element: 'water',
          source: 'acknowledgment'
        }
      });
    }

    // Process journal through conversational pipeline
    const context: ConversationalContext = {
      userText: transcription,
      userId,
      element,
      voiceEnabled: true, // Voice journal implies voice response
      sessionId: `session_${Date.now()}`,
      conversationHistory: [], // Required field
      convoSummary: "User shared a voice journal entry",
      longMemSnippets: [],
      recentBotReplies: [],
      sentiment: determineSentiment(transcription)
    };

    const result = await conversationalPipeline.converseViaSesame(context);

    res.json({
      success: true,
      journalProcessed: true,
      response: {
        text: result.text,
        audioUrl: result.audioUrl,
        element: result.element,
        source: result.source,
        processingTime: result.processingTime,
        isReflectiveResponse: true
      }
    });

  } catch (error: any) {
    logger.error('Voice journal conversation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Voice journal processing failed'
    });
  }
});

/**
 * @route POST /api/converse/workflow-step
 * @description Process workflow step with conversational intelligence
 */
router.post('/workflow-step', async (req: Request, res: Response) => {
  try {
    const {
      stepContent,
      workflowType,
      userId,
      element,
      stepContext
    } = req.body;

    if (!stepContent || !userId) {
      return res.status(400).json({
        success: false,
        error: 'stepContent and userId are required'
      });
    }

    // Build context for workflow step
    const context: ConversationalContext = {
      userText: stepContent,
      userId,
      element: element || 'aether',
      voiceEnabled: true,
      sessionId: `session_${Date.now()}`,
      conversationHistory: [], // Required field
      convoSummary: `Workflow: ${workflowType}`,
      longMemSnippets: stepContext?.memories || [],
      recentBotReplies: stepContext?.previousSteps || [],
      sentiment: determineSentiment(stepContent)
    };

    const result = await conversationalPipeline.converseViaSesame(context);

    res.json({
      success: true,
      workflowStep: {
        content: result.text,
        audioUrl: result.audioUrl,
        element: result.element,
        source: result.source,
        workflowOptimized: true,
        nextStepSuggested: shouldSuggestNextStep(workflowType, result.text)
      }
    });

  } catch (error: any) {
    logger.error('Workflow step conversation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Workflow step processing failed'
    });
  }
});

/**
 * @route GET /api/converse/health
 * @description Health check for conversational pipeline
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthStatus = {
      service: 'Sesame/Maya Conversational Pipeline',
      status: 'healthy',
      architecture: {
        draftGeneration: 'Air → Claude | Others → Elemental Oracle 2.0',
        finalShaping: 'Sesame Conversational Intelligence',
        voiceSynthesis: 'Maya TTS',
        safetyLayer: 'OpenAI Moderation + Crisis Detection'
      },
      features: [
        'Elemental Intelligence Routing',
        'Anti-Canned Response Guard',
        'Sesame CI Shaping',
        'Maya Voice Synthesis',
        'Cost Control & Debouncing',
        'Crisis-Safe Processing'
      ],
      configuration: {
        airModel: 'claude-3-sonnet',
        elementalOracle: 'gpt-4o-mini',
        sesameTTS: 'maya-voice',
        costControls: {
          maxTextLength: '1000 chars',
          debounceMs: 500,
          cacheMinutes: 5
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      ...healthStatus
    });

  } catch (error: any) {
    logger.error('Conversational health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

/**
 * @route POST /api/converse/test
 * @description Test the conversational pipeline with sample data
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { element = 'air' } = req.body;

    const testContext: ConversationalContext = {
      userText: "I'm feeling a bit scattered and could use some clarity about my direction.",
      userId: 'test_user',
      element,
      voiceEnabled: false,
      sessionId: 'test_session',
      conversationHistory: [], // Required field
      convoSummary: "Test conversation for pipeline validation",
      longMemSnippets: ["Previous discussions about life direction", "Mentioned feeling overwhelmed last week"],
      recentBotReplies: [],
      sentiment: 'neutral'
    };

    const result = await conversationalPipeline.converseViaSesame(testContext);

    res.json({
      success: true,
      test: 'conversational_pipeline',
      element: element,
      result: {
        text: result.text,
        audioUrl: result.audioUrl,
        metadata: result.metadata,
        processingTime: result.processingTime
      }
    });

  } catch (error: any) {
    logger.error('Conversational test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Pipeline test failed'
    });
  }
});

// Helper functions

function determineSentiment(text: string): "low" | "neutral" | "high" {
  const lowerText = text.toLowerCase();
  
  // Low sentiment indicators
  const lowWords = ['sad', 'depressed', 'anxious', 'worried', 'difficult', 'struggling', 'overwhelmed', 'stuck'];
  const lowCount = lowWords.filter(word => lowerText.includes(word)).length;
  
  // High sentiment indicators  
  const highWords = ['excited', 'amazing', 'wonderful', 'fantastic', 'grateful', 'joy', 'love', 'inspired'];
  const highCount = highWords.filter(word => lowerText.includes(word)).length;
  
  if (lowCount > highCount && lowCount > 0) return 'low';
  if (highCount > lowCount && highCount > 0) return 'high';
  return 'neutral';
}

function shouldSuggestNextStep(workflowType: string, responseText: string): boolean {
  // Simple heuristic for workflow continuation
  const continuationIndicators = ['next', 'continue', 'deeper', 'explore further', 'ready for'];
  const lowerResponse = responseText.toLowerCase();
  
  return continuationIndicators.some(indicator => lowerResponse.includes(indicator));
}

export default router;