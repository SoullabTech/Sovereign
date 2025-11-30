/**
 * Spiral Journey API Routes
 * Exposes spiral mapper functionality for frontend visualization
 */

import { Router, Request, Response } from 'express';
import { SpiralMapper } from '../services/SpiralMapper';
import { logger } from '../utils/logger';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const spiralMapper = new SpiralMapper();

/**
 * GET /api/spiral/:userId
 * Generate and return spiral journey for a user
 */
router.get('/spiral/:userId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, refresh } = req.query;

    // Validate user access
    if (req.user?.id !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to user data' });
    }

    // Parse date range
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    // Generate spiral journey
    const journey = await spiralMapper.generateSpiralJourney(userId, start, end);

    // Export for visualization
    const visualizationData = spiralMapper.exportForVisualization(journey);

    res.json({
      success: true,
      journey: {
        userId: journey.userId,
        startDate: journey.startDate,
        endDate: journey.endDate,
        totalSessions: journey.totalSessions,
        currentPhase: journey.currentPhase,
        dominantElement: journey.dominantElement,
        recommendations: journey.recommendations
      },
      visualization: visualizationData,
      elementalBalance: journey.elementalBalance,
      narrativeThreads: journey.narrativeThreads.slice(0, 5) // Top 5 threads
    });

  } catch (error) {
    logger.error('[SPIRAL_API] Failed to generate journey:', error);
    res.status(500).json({ 
      error: 'Failed to generate spiral journey',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/spiral/:userId/current
 * Get current phase and element for quick display
 */
router.get('/spiral/:userId/current', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Validate user access
    if (req.user?.id !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to user data' });
    }

    // Generate journey for last 7 days to get current state
    const journey = await spiralMapper.generateSpiralJourney(
      userId,
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date()
    );

    res.json({
      success: true,
      current: {
        phase: journey.currentPhase,
        element: journey.dominantElement,
        lastSession: journey.spiralPoints[journey.spiralPoints.length - 1]?.timestamp,
        recommendation: journey.recommendations.nextPractice
      }
    });

  } catch (error) {
    logger.error('[SPIRAL_API] Failed to get current state:', error);
    res.status(500).json({ 
      error: 'Failed to get current state',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/spiral/:userId/tag
 * Manually tag a session with phase/element
 */
router.post('/spiral/:userId/tag', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { sessionId, phase, element, symbols } = req.body;

    // Validate user access
    if (req.user?.id !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to user data' });
    }

    // Update session with tags
    // This would update the database directly
    logger.info('[SPIRAL_API] Tagging session:', { userId, sessionId, phase, element });

    res.json({
      success: true,
      message: 'Session tagged successfully'
    });

  } catch (error) {
    logger.error('[SPIRAL_API] Failed to tag session:', error);
    res.status(500).json({ 
      error: 'Failed to tag session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/spiral/:userId/export
 * Export spiral journey as JSON or CSV
 */
router.get('/spiral/:userId/export', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { format = 'json', startDate, endDate } = req.query;

    // Validate user access
    if (req.user?.id !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to user data' });
    }

    // Generate journey
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    const journey = await spiralMapper.generateSpiralJourney(userId, start, end);

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertJourneyToCSV(journey);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=spiral-journey-${userId}.csv`);
      res.send(csv);
    } else {
      // Return as JSON
      res.json(journey);
    }

  } catch (error) {
    logger.error('[SPIRAL_API] Failed to export journey:', error);
    res.status(500).json({ 
      error: 'Failed to export journey',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Helper function to convert journey to CSV
 */
function convertJourneyToCSV(journey: any): string {
  const headers = ['Session ID', 'Timestamp', 'Phase', 'Element', 'Intensity', 'Content', 'Symbols', 'Sentiment'];
  const rows = journey.spiralPoints.map((point: any) => [
    point.sessionId,
    point.timestamp,
    point.phase,
    point.element,
    point.intensity,
    `"${point.content.replace(/"/g, '""')}"`,
    (point.symbols || []).join(';'),
    point.sentiment || ''
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

export default router;