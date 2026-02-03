/**
 * Health Check Routes
 *
 * Provides health and readiness endpoints for the API service.
 * Used by Docker healthchecks and load balancers.
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
  checks: {
    database: { status: string; latency?: number; error?: string };
    memory: { status: string; used: number; total: number; percentage: number };
  };
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<{ status: string; latency?: number; error?: string }> {
  try {
    // Dynamic import to avoid loading pg until needed
    const { default: pool } = await import('../db/postgres.js');

    const start = Date.now();
    const result = await pool.query('SELECT 1 as connected');
    const latency = Date.now() - start;

    if (result.rows[0]?.connected === 1) {
      return { status: 'connected', latency };
    }
    return { status: 'error', error: 'Unexpected result' };
  } catch (error) {
    return {
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): { status: string; used: number; total: number; percentage: number } {
  const used = process.memoryUsage();
  const heapUsed = used.heapUsed;
  const heapTotal = used.heapTotal;
  const percentage = Math.round((heapUsed / heapTotal) * 100);

  return {
    status: percentage < 90 ? 'ok' : 'warning',
    used: Math.round(heapUsed / 1024 / 1024), // MB
    total: Math.round(heapTotal / 1024 / 1024), // MB
    percentage
  };
}

/**
 * GET /v1/health
 * Full health check with all service checks
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const startTime = process.uptime();

  // Run health checks
  const [dbCheck, memoryCheck] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkMemory())
  ]);

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  if (dbCheck.status === 'disconnected') {
    status = 'unhealthy';
  } else if (memoryCheck.status === 'warning') {
    status = 'degraded';
  }

  const health: HealthStatus = {
    status,
    service: 'maia-api',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.round(startTime),
    checks: {
      database: dbCheck,
      memory: memoryCheck
    }
  };

  // Return appropriate status code
  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
}));

/**
 * GET /v1/health/ready
 * Readiness probe - is the service ready to accept traffic?
 */
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  const dbCheck = await checkDatabase();

  if (dbCheck.status === 'connected') {
    res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      ready: false,
      reason: 'Database not connected',
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * GET /v1/health/live
 * Liveness probe - is the service alive?
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString()
  });
});

export default router;
