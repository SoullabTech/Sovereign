import { Request, Response, Router } from 'express';
import { weeklyInsightService } from '@/lib/services/longitudinal/WeeklyInsightService';
import { requireAuth } from '@/middleware/auth';
import { FEATURE_FLAGS } from '@/config/features';

const router = Router();

/**
 * GET /api/insights/weekly
 * Fetch the most recent weekly insight for the authenticated user
 */
router.get('/weekly', requireAuth, async (req: Request, res: Response) => {
  // Check if feature is enabled
  if (!FEATURE_FLAGS.WEEKLY_INSIGHTS) {
    return res.status(503).json({
      error: 'Weekly insights coming in Phase 2',
      phase: 2
    });
  }

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Generate or fetch current week's insight
    const insight = await weeklyInsightService.generateWeeklyInsight(userId);

    if (!insight) {
      return res.status(204).json({
        message: 'Insufficient data for weekly insight'
      });
    }

    res.json(insight);
  } catch (error) {
    console.error('Error fetching weekly insight:', error);
    res.status(500).json({ error: 'Failed to fetch weekly insight' });
  }
});

/**
 * GET /api/insights/weekly/history
 * Fetch historical weekly insights
 */
router.get('/weekly/history', requireAuth, async (req: Request, res: Response) => {
  if (!FEATURE_FLAGS.WEEKLY_INSIGHTS) {
    return res.status(503).json({
      error: 'Weekly insights coming in Phase 2',
      phase: 2
    });
  }

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const limit = parseInt(req.query.limit as string) || 12;
    const history = await weeklyInsightService.getInsightHistory(userId, limit);

    res.json(history);
  } catch (error) {
    console.error('Error fetching insight history:', error);
    res.status(500).json({ error: 'Failed to fetch insight history' });
  }
});

/**
 * POST /api/insights/weekly/generate
 * Manually trigger generation of a weekly insight
 */
router.post('/weekly/generate', requireAuth, async (req: Request, res: Response) => {
  if (!FEATURE_FLAGS.WEEKLY_INSIGHTS) {
    return res.status(503).json({
      error: 'Weekly insights coming in Phase 2',
      phase: 2
    });
  }

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const insight = await weeklyInsightService.generateWeeklyInsight(userId);

    if (!insight) {
      return res.status(422).json({
        error: 'Cannot generate insight',
        message: 'Need at least 3 journal entries this week'
      });
    }

    res.status(201).json(insight);
  } catch (error) {
    console.error('Error generating weekly insight:', error);
    res.status(500).json({ error: 'Failed to generate weekly insight' });
  }
});

export default router;