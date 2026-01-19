export const dynamic = 'force-static';

/**
 * Build Status Endpoint
 *
 * Returns current health status, error rates, and uptime.
 * Protected by DEV_STATUS_KEY for monitoring dashboards.
 */

import { NextRequest, NextResponse } from "next/server";
import { buildHealthMonitor } from "@/lib/monitoring/BuildHealthMonitor";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  const expectedKey = process.env.DEV_STATUS_KEY;

  // Fail closed: require key to be configured (catches undefined AND empty string)
  if (!expectedKey) {
    return NextResponse.json({ error: "server_not_configured" }, { status: 503 });
  }

  const authKey = req.headers.get("x-dev-key") || req.nextUrl.searchParams.get("key");

  // Always enforce auth (key itself is the gate, not NODE_ENV)
  if (!authKey || authKey !== expectedKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Initialize monitor if needed (lazy init for serverless)
  if (!process.env.BUILD_HEALTH_INITIALIZED) {
    buildHealthMonitor.initialize();
    process.env.BUILD_HEALTH_INITIALIZED = "true";
  }

  const status = buildHealthMonitor.getStatus();

  // Add version info
  const version = process.env.APP_VERSION || "1.0.0";
  const commit = process.env.GIT_COMMIT || "unknown";

  return NextResponse.json({
    version,
    commit,
    environment: process.env.NODE_ENV || "unknown",
    timestamp: new Date().toISOString(),
    health: {
      status: status.healthy ? "healthy" : "degraded",
      errorRate: status.errorRate,
      errorsInWindow: status.errorsInWindow,
      consecutiveHealthFailures: status.consecutiveHealthFailures,
    },
    lastError: status.lastError
      ? {
          message: status.lastError.message,
          source: status.lastError.source,
          timestamp: new Date(status.lastError.timestamp).toISOString(),
        }
      : null,
    uptime: {
      ms: status.uptime,
      human: formatUptime(status.uptime),
    },
    lastAlertSent: status.lastAlertSent
      ? new Date(status.lastAlertSent).toISOString()
      : null,
  });
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}
