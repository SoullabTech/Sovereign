/**
 * Soullab API Routes - Consciousness Research Endpoints
 * Exposes the consciousness exploration system
 */

import { Router, Request, Response } from 'express';
import { consciousnessEngine } from '../soullab/ConsciousnessResearchEngine';
import { logger } from '../utils/logger';
import type { ArchetypeVoice } from '../soullab/types';

const router = Router();

/**
 * Initialize new consciousness researcher
 * POST /api/soullab/initialize
 */
router.post('/initialize', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const result = await consciousnessEngine.initializeResearcher(userId);

    logger.info('New consciousness researcher initialized', { userId });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to initialize researcher', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to initialize consciousness researcher'
    });
  }
});

/**
 * Start exploration session with chosen archetype
 * POST /api/soullab/explore/start
 */
router.post('/explore/start', async (req: Request, res: Response) => {
  try {
    const { userId, archetype, initialMessage } = req.body;

    if (!userId || !archetype) {
      return res.status(400).json({
        error: 'userId and archetype required'
      });
    }

    const result = await consciousnessEngine.startExploration(
      userId,
      archetype as ArchetypeVoice,
      initialMessage
    );

    logger.info('Exploration session started', {
      userId,
      archetype,
      sessionId: result.sessionId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to start exploration', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to start exploration session'
    });
  }
});

/**
 * Process exploration message
 * POST /api/soullab/explore/message
 */
router.post('/explore/message', async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        error: 'sessionId and message required'
      });
    }

    const result = await consciousnessEngine.processExploration(
      sessionId,
      message
    );

    logger.info('Exploration message processed', {
      sessionId,
      breakthroughDetected: result.breakthroughDetected
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to process exploration', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to process exploration message'
    });
  }
});

/**
 * Generate consciousness map
 * GET /api/soullab/map/:userId
 */
router.get('/map/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const map = await consciousnessEngine.generateConsciousnessMap(userId);

    logger.info('Consciousness map generated', { userId });

    res.json({
      success: true,
      data: map
    });
  } catch (error) {
    logger.error('Failed to generate consciousness map', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate consciousness map'
    });
  }
});

/**
 * Get research impact
 * GET /api/soullab/impact/:userId
 */
router.get('/impact/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const impact = await consciousnessEngine.getResearchImpact(userId);

    logger.info('Research impact retrieved', { userId });

    res.json({
      success: true,
      data: impact
    });
  } catch (error) {
    logger.error('Failed to get research impact', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve research impact'
    });
  }
});

/**
 * Quick archetype test (no session required)
 * POST /api/soullab/test/archetype
 */
router.post('/test/archetype', async (req: Request, res: Response) => {
  try {
    const { archetype, message } = req.body;

    if (!archetype || !message) {
      return res.status(400).json({
        error: 'archetype and message required'
      });
    }

    // Quick test without full session
    const testUserId = `test_${Date.now()}`;
    const session = await consciousnessEngine.startExploration(
      testUserId,
      archetype as ArchetypeVoice,
      message
    );

    res.json({
      success: true,
      data: {
        archetype,
        response: session.archetypeResponse,
        wordCount: session.archetypeResponse.split(/\s+/).length
      }
    });
  } catch (error) {
    logger.error('Failed to test archetype', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to test archetype'
    });
  }
});

export default router;