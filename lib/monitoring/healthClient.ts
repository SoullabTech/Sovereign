/**
 * Health endpoint client — fetches and normalizes /api/health response.
 *
 * Runs inside the Docker network, hitting maia-sovereign:3000 directly.
 * Protects against fetch failures with structured error response.
 */

export interface HealthSnapshot {
  ok: boolean;
  status: 'ok' | 'degraded' | 'down' | 'error';
  db: {
    status: string;
    latencyMs: number;
  } | null;
  pool: {
    total: number;
    idle: number;
    waiting: number;
    max: number;
    utilizationPercent: number;
  } | null;
  memory: {
    heapPercent: number;
    heapUsedMB: number;
    rssMB: number;
  } | null;
  uptime: number;
  hostId: string;
  error: string | null;
  fetchDurationMs: number;
}

const HEALTH_URL = process.env.MONITOR_HEALTH_URL || 'http://maia-sovereign:3000/api/health';
const FETCH_TIMEOUT_MS = 10_000;

export async function fetchHealthSnapshot(): Promise<HealthSnapshot> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(HEALTH_URL, { signal: controller.signal });
    clearTimeout(timeout);

    const fetchDurationMs = Date.now() - start;

    if (!res.ok && res.status !== 503) {
      return {
        ok: false,
        status: 'error',
        db: null,
        pool: null,
        memory: null,
        uptime: 0,
        hostId: 'unknown',
        error: `Health endpoint returned ${res.status}`,
        fetchDurationMs,
      };
    }

    const data = await res.json();

    return {
      ok: data.health === 'ok',
      status: data.health || 'error',
      db: data.components?.database ? {
        status: data.components.database.status,
        latencyMs: data.components.database.latencyMs || 0,
      } : null,
      pool: data.components?.pool?.details ? {
        total: data.components.pool.details.total || 0,
        idle: data.components.pool.details.idle || 0,
        waiting: data.components.pool.details.waiting || 0,
        max: data.components.pool.details.max || 0,
        utilizationPercent: data.components.pool.details.utilizationPercent || 0,
      } : null,
      memory: data.components?.memory?.details ? {
        heapPercent: data.components.memory.details.heapPercent || 0,
        heapUsedMB: data.components.memory.details.heapUsedMB || 0,
        rssMB: data.components.memory.details.rssMB || 0,
      } : null,
      uptime: data.uptime || 0,
      hostId: data.hostId || 'unknown',
      error: null,
      fetchDurationMs,
    };
  } catch (err) {
    return {
      ok: false,
      status: 'error',
      db: null,
      pool: null,
      memory: null,
      uptime: 0,
      hostId: 'unknown',
      error: err instanceof Error ? err.message : String(err),
      fetchDurationMs: Date.now() - start,
    };
  }
}
