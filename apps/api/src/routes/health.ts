/**
 * Health Check Routes
 *
 * Provides health and readiness endpoints for the API service.
 * Used by Docker healthchecks and load balancers.
 */

import { Router, Request, Response } from 'express';
import v8 from 'node:v8';
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
    memory: { status: string; used: number; total: number; percentage: number; rss: number };
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
 * Check memory usage against V8 heap limit (not dynamic heapTotal).
 * heapTotal is the currently allocated heap — it grows on demand and
 * stays small at idle, producing misleading 90%+ readings.
 * heap_size_limit is the actual ceiling (set by --max-old-space-size).
 */
function checkMemory(): { status: string; used: number; total: number; percentage: number; rss: number } {
  const mem = process.memoryUsage();
  const heapStats = v8.getHeapStatistics();

  const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
  const heapLimitMB = Math.round(heapStats.heap_size_limit / 1024 / 1024);
  const rssMB = Math.round(mem.rss / 1024 / 1024);
  const percentage = Math.round((mem.heapUsed / heapStats.heap_size_limit) * 100);

  let status: 'ok' | 'warning' | 'critical' = 'ok';
  if (percentage >= 95) status = 'critical';
  else if (percentage >= 85) status = 'warning';

  return {
    status,
    used: heapUsedMB,
    total: heapLimitMB,
    percentage,
    rss: rssMB
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

  if (dbCheck.status === 'disconnected' || memoryCheck.status === 'critical') {
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
