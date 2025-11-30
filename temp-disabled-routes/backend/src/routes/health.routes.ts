// Health Check and Observability Endpoints
import { Router, Request, Response } from "express";
import { redis } from "../config/redis";
import { supabase } from "../lib/supabaseClient";
import { logger } from "../utils/logger";

const router = Router();

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: { status: string; responseTime?: number; error?: string };
    redis: { status: string; responseTime?: number; error?: string };
    memory: { usage: number; limit: number; percentage: number };
    cpu: { percentage?: number };
  };
}

interface ReadinessStatus {
  ready: boolean;
  timestamp: string;
  checks: {
    database: boolean;
    redis: boolean;
    migrations: boolean;
    critical_services: boolean;
  };
}

/**
 * Health endpoint - detailed system health information
 */
router.get("/health", async (req: Request, res: Response) => {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "1.0.0",
    uptime: process.uptime(),
    checks: {
      database: { status: "unknown" },
      redis: { status: "unknown" },
      memory: {
        usage: process.memoryUsage().heapUsed,
        limit: process.memoryUsage().heapTotal,
        percentage: Math.round(
          (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) *
            100,
        ),
      },
      cpu: {},
    },
  };

  let overallHealthy = true;

  // Check Database (Supabase)
  try {
    const dbStartTime = Date.now();
    const { error } = await supabase.from("memories").select("id").limit(1);

    if (error) {
      healthStatus.checks.database = {
        status: "unhealthy",
        error: error.message,
      };
      overallHealthy = false;
    } else {
      healthStatus.checks.database = {
        status: "healthy",
        responseTime: Date.now() - dbStartTime,
      };
    }
  } catch (error) {
    healthStatus.checks.database = {
      status: "unhealthy",
      error:
        error instanceof Error ? error.message : "Database connection failed",
    };
    overallHealthy = false;
  }

  // Check Redis
  try {
    const redisStartTime = Date.now();
    await redis.ping();
    healthStatus.checks.redis = {
      status: "healthy",
      responseTime: Date.now() - redisStartTime,
    };
  } catch (error) {
    healthStatus.checks.redis = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Redis connection failed",
    };
    overallHealthy = false;
  }

  // Determine overall status
  if (!overallHealthy) {
    healthStatus.status = "unhealthy";
  } else if (healthStatus.checks.memory.percentage > 80) {
    healthStatus.status = "degraded";
  }

  const statusCode = healthStatus.status === "healthy" ? 200 : 503;

  logger.info("Health check performed", {
    status: healthStatus.status,
    duration: Date.now() - startTime,
  });

  res.status(statusCode).json(healthStatus);
});

/**
 * Readiness endpoint - indicates if service is ready to accept traffic
 */
router.get("/ready", async (req: Request, res: Response) => {
  const readinessStatus: ReadinessStatus = {
    ready: true,
    timestamp: new Date().toISOString(),
    checks: {
      database: false,
      redis: false,
      migrations: true, // Assume migrations are run during deployment
      critical_services: true,
    },
  };

  // Check database connectivity
  try {
    await supabase.from("memories").select("id").limit(1);
    readinessStatus.checks.database = true;
  } catch (error) {
    readinessStatus.checks.database = false;
    readinessStatus.ready = false;
    logger.warn("Database not ready", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // Check Redis connectivity
  try {
    await redis.ping();
    readinessStatus.checks.redis = true;
  } catch (error) {
    readinessStatus.checks.redis = false;
    readinessStatus.ready = false;
    logger.warn("Redis not ready", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  const statusCode = readinessStatus.ready ? 200 : 503;
  res.status(statusCode).json(readinessStatus);
});

/**
 * Liveness endpoint - simple check that the service is running
 */
router.get("/live", (req: Request, res: Response) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid,
  });
});

/**
 * Metrics endpoint - basic application metrics
 */
router.get("/metrics", async (req: Request, res: Response) => {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Get basic application metrics
    let totalMemories = 0;
    let totalUsers = 0;

    try {
      const { count: memoryCount } = await supabase
        .from("memories")
        .select("*", { count: "exact", head: true });
      totalMemories = memoryCount || 0;

      // Note: Adjust this query based on your user table structure
      // const { count: userCount } = await supabase
      //   .from('users')
      //   .select('*', { count: 'exact', head: true });
      // totalUsers = userCount || 0;
    } catch (error) {
      logger.warn("Failed to fetch application metrics from database", {
        error,
      });
    }

    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        uptime: process.uptime(),
        memory: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss,
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        pid: process.pid,
        version: process.version,
        platform: process.platform,
      },
      application: {
        totalMemories,
        totalUsers,
        version: process.env.APP_VERSION || "1.0.0",
        environment: process.env.NODE_ENV || "development",
      },
      system: {
        loadAverage: (process as any).loadavg(),
        freemem: (process as any).freemem ? (process as any).freemem() : null,
        totalmem: (process as any).totalmem
          ? (process as any).totalmem()
          : null,
      },
    };

    res.status(200).json(metrics);
  } catch (error) {
    logger.error("Failed to generate metrics", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    res.status(500).json({ error: "Failed to generate metrics" });
  }
});

/**
 * Version endpoint - application version information
 */
router.get("/version", (req: Request, res: Response) => {
  res.status(200).json({
    version: process.env.APP_VERSION || "1.0.0",
    build: process.env.BUILD_NUMBER || "dev",
    commit: process.env.GIT_COMMIT || "unknown",
    buildDate: process.env.BUILD_DATE || new Date().toISOString(),
    nodeVersion: process.version,
  });
});

export default router;
