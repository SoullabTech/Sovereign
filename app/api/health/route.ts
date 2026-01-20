/**
 * Comprehensive Health Check Endpoint
 *
 * Meaningful health checks that detect what actually hurts:
 * - Database connection + latency
 * - Basic query works
 * - Critical tables accessible
 * - Memory usage
 *
 * Returns:
 *   - health: ok | degraded | down
 *   - requestId for correlation
 *   - Detailed component status
 *
 * Query params:
 *   - simple=true: Fast check for container health (no DB query)
 */
export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

// Health status types
type HealthStatus = 'ok' | 'degraded' | 'down';

interface ComponentHealth {
  status: HealthStatus;
  latencyMs?: number;
  error?: string;
  details?: Record<string, unknown>;
}

interface HealthResponse {
  health: HealthStatus;
  requestId: string;
  timestamp: string;
  uptime: number;
  version: string;
  safeMode: boolean;
  components: {
    database: ComponentHealth;
    memory: ComponentHealth;
    tables: ComponentHealth;
  };
}

// Track startup time
const startTime = Date.now();

function generateRequestId(): string {
  return `health_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
}

// Check database connection and latency
async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    const result = await query('SELECT 1 as ok, NOW() as server_time');
    const latencyMs = Date.now() - start;

    if (result.rows.length > 0 && result.rows[0].ok === 1) {
      return {
        status: latencyMs > 1000 ? 'degraded' : 'ok',
        latencyMs,
        details: {
          serverTime: result.rows[0].server_time,
        },
      };
    }

    return {
      status: 'down',
      latencyMs,
      error: 'Unexpected query result',
    };
  } catch (error) {
    return {
      status: 'down',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

// Check critical tables are accessible
async function checkTables(): Promise<ComponentHealth> {
  const start = Date.now();
  const criticalTables = ['members', 'conversation_turns', 'member_settings'];
  const tableStatus: Record<string, boolean> = {};

  try {
    for (const table of criticalTables) {
      try {
        // Just check if table exists and is queryable
        await query(`SELECT 1 FROM ${table} LIMIT 1`);
        tableStatus[table] = true;
      } catch {
        tableStatus[table] = false;
      }
    }

    const failedTables = Object.entries(tableStatus)
      .filter(([, ok]) => !ok)
      .map(([table]) => table);

    const latencyMs = Date.now() - start;

    if (failedTables.length === 0) {
      return {
        status: 'ok',
        latencyMs,
        details: { tables: tableStatus },
      };
    }

    if (failedTables.length < criticalTables.length) {
      return {
        status: 'degraded',
        latencyMs,
        error: `Some tables unavailable: ${failedTables.join(', ')}`,
        details: { tables: tableStatus },
      };
    }

    return {
      status: 'down',
      latencyMs,
      error: 'All critical tables unavailable',
      details: { tables: tableStatus },
    };
  } catch (error) {
    return {
      status: 'down',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Table check failed',
    };
  }
}

// Check memory usage
function checkMemory(): ComponentHealth {
  try {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);

    // Consider degraded if using more than 80% of heap
    const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    return {
      status: heapPercent > 90 ? 'degraded' : 'ok',
      details: {
        heapUsedMB,
        heapTotalMB,
        rssMB,
        heapPercent: Math.round(heapPercent),
      },
    };
  } catch {
    return {
      status: 'degraded',
      error: 'Unable to read memory stats',
    };
  }
}

// Aggregate component health into overall status
function aggregateHealth(components: Record<string, ComponentHealth>): HealthStatus {
  const statuses = Object.values(components).map(c => c.status);

  if (statuses.every(s => s === 'ok')) return 'ok';
  if (statuses.some(s => s === 'down')) return 'down';
  return 'degraded';
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const isSafeMode = process.env.SAFE_MODE === '1' || process.env.SAFE_MODE === 'true';

  // Allow simple health check without full diagnostics (for container health)
  const simple = request.nextUrl.searchParams.get('simple') === 'true';

  if (simple) {
    // Fast path for container health checks - no DB query
    return NextResponse.json({
      status: 'ok',
      health: 'ok',
      service: 'maia-sovereign',
      requestId,
      timestamp: new Date().toISOString(),
    });
  }

  // Full health check
  const [database, tables, memory] = await Promise.all([
    checkDatabase(),
    checkTables(),
    Promise.resolve(checkMemory()),
  ]);

  const components = { database, tables, memory };
  const health = aggregateHealth(components);

  const response: HealthResponse = {
    health,
    requestId,
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version || process.env.NEXT_PUBLIC_BUILD_ID || 'unknown',
    safeMode: isSafeMode,
    components,
  };

  // Return appropriate status code
  // Note: 503 for down means Docker will mark container unhealthy
  const statusCode = health === 'down' ? 503 : 200;

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'X-Request-ID': requestId,
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
