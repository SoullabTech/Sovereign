/**
 * Admin Routes - Dashboard and monitoring endpoints
 */

import express from 'express';
import { adminAnalytics } from '../services/AdminAnalyticsService';
import { maiaGuardrails } from '../services/MaiaGuardrailsService';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * GET /api/v1/admin/dashboard
 * Get real-time dashboard metrics
 */
router.get('/dashboard', async (req, res) => {
  try {
    logger.info('Admin dashboard data requested', { 
      ip: req.ip, 
      userAgent: req.get('User-Agent') 
    });

    // Get system metrics
    const systemMetrics = adminAnalytics.getSystemMetrics();
    const activeSessions = adminAnalytics.getActiveSessions();

    // Calculate derived metrics
    const totalInteractions = systemMetrics.voiceInteractions + systemMetrics.textInteractions;
    const voicePercentage = totalInteractions > 0 
      ? Math.round((systemMetrics.voiceInteractions / totalInteractions) * 100)
      : 0;

    const avgCitationsPerQuery = totalInteractions > 0
      ? systemMetrics.citationsGenerated / totalInteractions
      : 0;

    // Format response for frontend
    const dashboardData = {
      sessions: {
        activeSessions: systemMetrics.activeSessions,
        totalSessions: systemMetrics.totalSessions,
        averageSessionLength: systemMetrics.avgSessionLength,
        sessionsToday: systemMetrics.sessionsToday
      },
      interactions: {
        voiceInteractions: systemMetrics.voiceInteractions,
        textInteractions: systemMetrics.textInteractions,
        voicePercentage,
        avgResponseTime: systemMetrics.avgResponseTime
      },
      files: {
        totalFiles: systemMetrics.totalFiles,
        filesUploadedToday: systemMetrics.filesUploadedToday,
        citationsGenerated: systemMetrics.citationsGenerated,
        avgCitationsPerQuery: Math.round(avgCitationsPerQuery * 10) / 10
      },
      activeSessions: activeSessions.map(session => ({
        id: session.id,
        userId: session.userId,
        username: session.username || 'Anonymous',
        element: session.element,
        startTime: session.startTime.toISOString(),
        lastActivity: session.lastActivity.toISOString(),
        interactionCount: session.interactionCount,
        mode: session.mode
      }))
    };

    res.json(dashboardData);

  } catch (error) {
    logger.error('Admin dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      sessions: { activeSessions: 0, totalSessions: 0, averageSessionLength: 0, sessionsToday: 0 },
      interactions: { voiceInteractions: 0, textInteractions: 0, voicePercentage: 0, avgResponseTime: 0 },
      files: { totalFiles: 0, filesUploadedToday: 0, citationsGenerated: 0, avgCitationsPerQuery: 0 },
      activeSessions: []
    });
  }
});

/**
 * GET /api/v1/admin/sessions/:sessionId
 * Get detailed session information
 */
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = adminAnalytics.getSessionDetails(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    logger.info('Session details requested', { sessionId });

    res.json({
      id: session.id,
      userId: session.userId,
      username: session.username,
      element: session.element,
      startTime: session.startTime.toISOString(),
      lastActivity: session.lastActivity.toISOString(),
      interactionCount: session.interactionCount,
      voiceInteractions: session.voiceInteractions,
      textInteractions: session.textInteractions,
      mode: session.mode,
      status: session.status,
      avgResponseTime: session.avgResponseTime,
      fileUploads: session.fileUploads,
      citationsGenerated: session.citationsGenerated,
      sessionLength: session.status === 'completed' 
        ? Math.floor((session.lastActivity.getTime() - session.startTime.getTime()) / 1000)
        : Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000)
    });

  } catch (error) {
    logger.error('Session details error:', error);
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
});

/**
 * POST /api/v1/admin/actions
 * Admin actions (terminate session, send messages, etc.)
 */
router.post('/actions', async (req, res) => {
  try {
    const { action, targetId, data } = req.body;

    logger.warn('Admin action requested', { 
      action, 
      targetId, 
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    switch (action) {
      case 'terminate_session':
        const terminated = adminAnalytics.forceTerminateSession(targetId);
        if (terminated) {
          res.json({ success: true, action: 'session_terminated', sessionId: targetId });
        } else {
          res.status(404).json({ error: 'Session not found or already inactive' });
        }
        break;

      case 'system_message':
        // TODO: Implement system-wide message broadcasting
        logger.info('System message sent', { message: data?.message });
        res.json({ success: true, action: 'message_sent' });
        break;

      case 'clear_session_data':
        // TODO: Implement session data clearing
        logger.info('Session data cleared', { sessionId: targetId });
        res.json({ success: true, action: 'data_cleared' });
        break;

      default:
        res.status(400).json({ error: 'Unknown action' });
    }

  } catch (error) {
    logger.error('Admin action error:', error);
    res.status(500).json({ error: 'Action failed' });
  }
});

/**
 * GET /api/v1/admin/health
 * Admin health check and system status
 */
router.get('/health', async (req, res) => {
  try {
    const metrics = adminAnalytics.getSystemMetrics();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      system: {
        activeSessions: metrics.activeSessions,
        totalSessions: metrics.totalSessions,
        avgResponseTime: metrics.avgResponseTime
      },
      services: {
        analytics: 'running',
        database: 'connected', // TODO: Add real DB check
        tts: 'available'        // TODO: Add real TTS check
      }
    });

  } catch (error) {
    logger.error('Admin health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/admin/maia-guardrails
 * Get MAIA Voice Metrics guardrail status
 */
router.get('/maia-guardrails', async (req, res) => {
  try {
    logger.info('MAIA guardrails data requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const guardrailStatus = await maiaGuardrails.getCompleteGuardrailStatus();
    res.json(guardrailStatus);

  } catch (error) {
    logger.error('MAIA guardrails error:', error);
    res.status(500).json({
      error: 'Failed to fetch MAIA guardrails data',
      overallStatus: 'unknown',
      totalAlerts: 0,
      dashboard: [],
      details: {
        givingUpWarnings: [],
        circuitBreaker: [],
        reentrySegments: [],
        voiceCheck: [],
        uncertaintyBaseline: []
      }
    });
  }
});

export default router;