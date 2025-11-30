import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { enhancedOrchestrator, EnhancedConversationalContext } from '../services/EnhancedConversationalOrchestrator';
import { ConversationThreadingService } from '../services/ConversationThreadingService';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const threadingService = ConversationThreadingService.getInstance();

/**
 * Enhanced SSE endpoint for streaming conversational responses with full dialogue state tracking
 * GET /api/v1/enhanced/converse/stream?element=air&userId=123&lang=en&q=Hello
 */
router.get('/stream', async (req: Request, res: Response) => {
  const { element = 'air', userId = 'anonymous', lang = 'en', q: userText } = req.query;
  const sessionId = req.headers['x-session-id'] as string || uuidv4();
  
  // Validate required parameters
  if (!userText || typeof userText !== 'string') {
    return res.status(400).json({ 
      error: 'Missing or invalid query parameter: q (user text)' 
    });
  }

  // Validate element
  const validElements = ['air', 'fire', 'water', 'earth', 'aether'];
  if (!validElements.includes(element as string)) {
    return res.status(400).json({ 
      error: `Invalid element. Must be one of: ${validElements.join(', ')}` 
    });
  }

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no' // Disable Nginx buffering
  });

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ 
    status: 'connected',
    sessionId,
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Keep-alive ping every 30 seconds
  const pingInterval = setInterval(() => {
    res.write(`event: ping\ndata: ${JSON.stringify({ 
      timestamp: new Date().toISOString() 
    })}\n\n`);
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(pingInterval);
    logger.info('🔌 Client disconnected from enhanced SSE stream', { userId, sessionId });
  });

  try {
    // Get or create thread
    let threadId = req.headers['x-thread-id'] as string;
    if (!threadId) {
      threadId = await threadingService.createThread(userId as string, 'maya');
      
      // Send thread creation event
      res.write(`event: thread-created\ndata: ${JSON.stringify({ 
        threadId,
        timestamp: new Date().toISOString()
      })}\n\n`);
    }

    // Create enhanced context
    const context: EnhancedConversationalContext = {
      userText: userText as string,
      element: element as any,
      userId: userId as string,
      sessionId,
      threadId,
      voiceEnabled: req.query.voice === 'true',
      convoSummary: '', // Will be enriched by orchestrator
      longMemSnippets: [], // Will be loaded by orchestrator
      recentBotReplies: [], // Will be loaded by orchestrator
      sentiment: 'neutral',
      intentAwareRefinement: true,
      emotionAdaptiveVoice: true
    };

    // Set up dialogue event listeners
    const eventHandlers = {
      'intent:detected': (data: any) => {
        res.write(`event: intent-detected\ndata: ${JSON.stringify(data)}\n\n`);
      },
      'topic:changed': (data: any) => {
        res.write(`event: topic-changed\ndata: ${JSON.stringify(data)}\n\n`);
      },
      'emotion:shift': (data: any) => {
        res.write(`event: emotion-shift\ndata: ${JSON.stringify(data)}\n\n`);
      },
      'stage:transition': (data: any) => {
        res.write(`event: stage-transition\ndata: ${JSON.stringify(data)}\n\n`);
      },
      'breakthrough:detected': (data: any) => {
        res.write(`event: breakthrough\ndata: ${JSON.stringify(data)}\n\n`);
      },
      'resistance:encountered': (data: any) => {
        res.write(`event: resistance\ndata: ${JSON.stringify(data)}\n\n`);
      }
    };

    // Register event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      enhancedOrchestrator.on(event as any, handler);
    });

    // Clean up event listeners on disconnect
    req.on('close', () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        enhancedOrchestrator.off(event as any, handler);
      });
    });

    // Send processing started event
    res.write(`event: processing-started\ndata: ${JSON.stringify({ 
      element: element as string,
      intentAnalysis: 'active',
      emotionTracking: 'active',
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Process through enhanced orchestrator
    const result = await enhancedOrchestrator.orchestrateConversation(context);

    // Send dialogue insights
    res.write(`event: dialogue-insights\ndata: ${JSON.stringify({
      insights: result.dialogueInsights,
      refinements: result.stateGuidedRefinements,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Send the main response
    res.write(`event: response\ndata: ${JSON.stringify({
      text: result.text,
      audioUrl: result.audioUrl,
      element: result.element,
      metadata: result.metadata,
      dialogueState: {
        intent: result.dialogueInsights.intent,
        topic: result.dialogueInsights.topic,
        emotion: result.dialogueInsights.emotionalTone,
        stage: result.dialogueInsights.stage,
        momentum: result.dialogueInsights.momentum
      },
      threadId,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Send suggestions if any
    if (result.dialogueInsights.suggestions.length > 0) {
      res.write(`event: suggestions\ndata: ${JSON.stringify({
        suggestions: result.dialogueInsights.suggestions,
        timestamp: new Date().toISOString()
      })}\n\n`);
    }

    // Send completion event
    res.write(`event: complete\ndata: ${JSON.stringify({
      processingTime: result.processingTime,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Log successful completion
    logger.info('✅ Enhanced conversational stream completed', {
      userId,
      threadId,
      intent: result.dialogueInsights.intent,
      stage: result.dialogueInsights.stage,
      processingTime: result.processingTime
    });

  } catch (error) {
    logger.error('❌ Enhanced conversational stream error:', error);
    
    // Send error event
    res.write(`event: error\ndata: ${JSON.stringify({
      error: 'Failed to process conversation',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })}\n\n`);
  }

  // Keep connection open (SSE pattern)
  // Client should close when done
});

/**
 * Get dialogue state for a thread
 * GET /api/v1/enhanced/converse/state/:threadId
 */
router.get('/state/:threadId', async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
    
    const state = await enhancedOrchestrator.getDialogueState(threadId);
    if (!state) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const insights = await enhancedOrchestrator.getDialogueInsights(threadId);

    res.json({
      state: {
        threadId: state.threadId,
        userId: state.userId,
        turnCount: state.turnCount,
        intent: state.intent,
        topic: state.topic,
        emotion: {
          current: state.emotion.current,
          trajectory: state.emotion.trajectory
        },
        flow: state.flow,
        relationship: state.relationship,
        meta: state.meta
      },
      insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get dialogue state:', error);
    res.status(500).json({ error: 'Failed to retrieve dialogue state' });
  }
});

/**
 * Get conversation history with dialogue annotations
 * GET /api/v1/enhanced/converse/history/:threadId
 */
router.get('/history/:threadId', async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const messages = await threadingService.getThreadMessages(threadId, limit);
    if (!messages || messages.length === 0) {
      return res.status(404).json({ error: 'No messages found for thread' });
    }

    // Enrich messages with dialogue state at each turn
    const enrichedMessages = messages.map(msg => ({
      id: msg.id,
      timestamp: msg.timestamp,
      userMessage: msg.userMessage,
      agentResponse: msg.agentResponse?.phenomenological.primary,
      dialogueContext: {
        resonance: msg.resonance,
        synapticGap: msg.synapticGap,
        userState: msg.userState,
        tone: msg.agentResponse?.phenomenological.tone,
        questions: msg.agentResponse?.dialogical.questions
      }
    }));

    res.json({
      threadId,
      messages: enrichedMessages,
      totalMessages: messages.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get conversation history:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation history' });
  }
});

/**
 * Health check endpoint
 * GET /api/v1/enhanced/converse/health
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'enhanced-conversational-stream',
    features: {
      intentDetection: 'active',
      topicTracking: 'active',
      emotionAnalysis: 'active',
      dialogueStateManagement: 'active',
      realTimeEvents: 'active'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;