/**
 * BETA UNIFIED ENDPOINT
 * Complete end-to-end integration for beta testing
 */

import { Router, Request, Response } from 'express';
import { agentOrchestrator } from '../services/agentOrchestrator.js';
import { soulMemoryService } from '../services/soulMemoryService.js';
import { authenticate } from '../middleware/authenticate.js';
import { logger } from '../utils/logger.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply authentication to all beta routes
router.use(authenticate);

// ===============================================
// MAIN CONVERSATIONAL ENDPOINT
// ===============================================

/**
 * POST /api/beta/chat
 * Unified endpoint for all conversational interactions
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, mode = 'oracle', element, sessionId } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Process through full orchestrator pipeline
    const response = await agentOrchestrator.processQuery(message, {
      userId,
      sessionId: sessionId || `session_${Date.now()}`,
      mode,
      element,
      metadata: {
        source: 'beta_endpoint',
        timestamp: new Date().toISOString()
      }
    });

    res.json(response);
  } catch (error) {
    logger.error('Beta chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      fallback: "I'm experiencing a moment of reflection. Please try again."
    });
  }
});

/**
 * POST /api/beta/voice
 * Voice input with transcription and response
 */
router.post('/voice', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { mode = 'maya', element, sessionId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    // Process voice through orchestrator
    const response = await agentOrchestrator.processVoiceInput(
      req.file.buffer,
      {
        userId,
        sessionId: sessionId || `voice_${Date.now()}`,
        mode,
        element
      }
    );

    res.json(response);
  } catch (error) {
    logger.error('Beta voice error:', error);
    res.status(500).json({ error: 'Failed to process voice input' });
  }
});

/**
 * POST /api/beta/journal
 * Journal entry with full analysis
 */
router.post('/journal', async (req: Request, res: Response) => {
  try {
    const { content, tags = [] } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Journal content is required' });
    }

    // Process journal through orchestrator
    const response = await agentOrchestrator.processJournalEntry(content, {
      userId,
      sessionId: `journal_${Date.now()}`,
      mode: 'oracle',
      metadata: { tags }
    });

    res.json({
      ...response,
      message: 'Journal entry processed and stored successfully'
    });
  } catch (error) {
    logger.error('Beta journal error:', error);
    res.status(500).json({ error: 'Failed to process journal entry' });
  }
});

// ===============================================
// MEMORY & INSIGHTS ENDPOINTS
// ===============================================

/**
 * GET /api/beta/memories
 * Retrieve user memories with filtering
 */
router.get('/memories', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { type, limit = '20', timeRange = 'month' } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const memories = await soulMemoryService.getUserMemories(userId, {
      type: type as string,
      limit: parseInt(limit as string)
    });

    res.json({
      success: true,
      memories,
      count: memories.length
    });
  } catch (error) {
    logger.error('Beta memories error:', error);
    res.status(500).json({ error: 'Failed to retrieve memories' });
  }
});

/**
 * GET /api/beta/insights
 * Get archetypal and journey insights
 */
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const insights = await agentOrchestrator.getArchetypalInsights({
      userId,
      sessionId: `insights_${Date.now()}`
    });

    res.json(insights);
  } catch (error) {
    logger.error('Beta insights error:', error);
    res.status(500).json({ error: 'Failed to retrieve insights' });
  }
});

/**
 * POST /api/beta/memory/search
 * Semantic search across memories
 */
router.post('/memory/search', async (req: Request, res: Response) => {
  try {
    const { query, topK = 5 } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await soulMemoryService.searchMemories(userId, query, {
      topK
    });

    res.json({
      success: true,
      results,
      query
    });
  } catch (error) {
    logger.error('Beta memory search error:', error);
    res.status(500).json({ error: 'Failed to search memories' });
  }
});

// ===============================================
// RETREAT MODE ENDPOINTS
// ===============================================

/**
 * POST /api/beta/retreat/activate
 * Activate retreat mode for enhanced support
 */
router.post('/retreat/activate', async (req: Request, res: Response) => {
  try {
    const { phase = 'active' } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await soulMemoryService.activateRetreatMode(userId, phase);

    res.json({
      success: true,
      message: `Retreat mode activated: ${phase}`,
      guidance: 'The Oracle is now tuned to support your sacred journey.'
    });
  } catch (error) {
    logger.error('Beta retreat activation error:', error);
    res.status(500).json({ error: 'Failed to activate retreat mode' });
  }
});

/**
 * POST /api/beta/retreat/checkin
 * Daily check-in during retreat
 */
router.post('/retreat/checkin', async (req: Request, res: Response) => {
  try {
    const { mood, energy, insights, challenges } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Process check-in through orchestrator
    const checkinContent = `
      Retreat Check-in:
      Mood: ${mood}
      Energy: ${energy}
      Insights: ${insights}
      Challenges: ${challenges}
    `;

    const response = await agentOrchestrator.processQuery(checkinContent, {
      userId,
      sessionId: `retreat_checkin_${Date.now()}`,
      mode: 'retreat',
      metadata: { type: 'retreat_checkin' }
    });

    res.json({
      success: true,
      guidance: response.response,
      element: response.element
    });
  } catch (error) {
    logger.error('Beta retreat check-in error:', error);
    res.status(500).json({ error: 'Failed to process check-in' });
  }
});

// ===============================================
// DREAM WORK ENDPOINTS
// ===============================================

/**
 * POST /api/beta/dream
 * Record and analyze dream with archetypal tagging
 */
router.post('/dream', async (req: Request, res: Response) => {
  try {
    const { 
      content, 
      symbols = [], 
      emotions = [],
      lucidity = 0,
      recurring = false 
    } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Dream content is required' });
    }

    // Store dream with enhanced metadata
    const memory = await soulMemoryService.storeEnhancedMemory(
      userId,
      content,
      'dream',
      {
        dreamSymbols: symbols,
        emotionalTone: emotions,
        lucidityLevel: lucidity,
        recurring,
        timestamp: new Date().toISOString()
      }
    );

    // Get archetypal analysis
    await soulMemoryService.analyzeArchetypalResonance(userId, memory.id);

    // Generate dream interpretation
    const interpretation = await agentOrchestrator.processQuery(
      `Interpret this dream: ${content}`,
      {
        userId,
        sessionId: `dream_${Date.now()}`,
        mode: 'oracle',
        metadata: { type: 'dream_interpretation' }
      }
    );

    res.json({
      success: true,
      memoryId: memory.id,
      interpretation: interpretation.response,
      archetypes: interpretation.archetypes,
      stored: true
    });
  } catch (error) {
    logger.error('Beta dream error:', error);
    res.status(500).json({ error: 'Failed to process dream' });
  }
});

// ===============================================
// SYSTEM HEALTH & STATUS
// ===============================================

/**
 * GET /api/beta/health
 * Check health of all integrated systems
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await agentOrchestrator.checkHealth();
    
    res.json({
      ...health,
      message: 'Beta system operational',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Beta health check error:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Health check failed' 
    });
  }
});

/**
 * GET /api/beta/status
 * Get current system configuration and capabilities
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    res.json({
      success: true,
      capabilities: {
        chat: true,
        voice: true,
        journaling: true,
        dreams: true,
        retreatMode: true,
        memory: true,
        insights: true,
        safety: true,
        decentralized: process.env.ENABLE_DECENTRALIZED === 'true'
      },
      user: {
        authenticated: !!userId,
        userId
      },
      version: '1.0.0-beta',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Beta status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// ===============================================
// EMERGENCY & SAFETY
// ===============================================

/**
 * POST /api/beta/emergency
 * Emergency support endpoint
 */
router.post('/emergency', async (req: Request, res: Response) => {
  try {
    const { message, severity = 'high' } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Process through orchestrator with crisis mode
    const response = await agentOrchestrator.processQuery(
      message || 'I need immediate support',
      {
        userId,
        sessionId: `emergency_${Date.now()}`,
        mode: 'oracle',
        metadata: { 
          type: 'emergency',
          severity
        }
      }
    );

    res.json({
      ...response,
      resources: [
        { name: 'Crisis Hotline', number: '988' },
        { name: 'Emergency Services', number: '911' }
      ],
      immediate: true
    });
  } catch (error) {
    logger.error('Beta emergency error:', error);
    res.status(500).json({ 
      error: 'Emergency support activated',
      resources: [
        { name: 'Crisis Hotline', number: '988' },
        { name: 'Emergency Services', number: '911' }
      ]
    });
  }
});

export default router;