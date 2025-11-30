/**
 * API routes for spiral journey visualization
 */

import { Router, Request, Response } from 'express';
import { SpiralMapper } from '../services/spiralMapper';
import { logger } from '../utils/logger';

const router = Router();
const spiralMapper = new SpiralMapper();

/**
 * GET /api/spiral-journey/:userId
 * Generate spiral journey visualization data for a user
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const journey = await spiralMapper.generateSpiralJourney(userId, start, end);
    const visualizationData = spiralMapper.exportForVisualization(journey);

    res.json({
      success: true,
      journey,
      visualization: visualizationData
    });

  } catch (error) {
    logger.error('[SPIRAL_JOURNEY_API] Error generating journey:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate spiral journey'
    });
  }
});

/**
 * GET /api/spiral-journey/:userId/current
 * Get current phase and element for quick status
 */
router.get('/:userId/current', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Get last 7 days for current status
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const journey = await spiralMapper.generateSpiralJourney(userId, start);

    res.json({
      success: true,
      currentPhase: journey.currentPhase,
      dominantElement: journey.dominantElement,
      recommendations: journey.recommendations,
      recentSessions: journey.totalSessions
    });

  } catch (error) {
    logger.error('[SPIRAL_JOURNEY_API] Error getting current status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get current status'
    });
  }
});

export default router;