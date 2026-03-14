export const dynamic = 'force-dynamic';

/**
 * Security Monitor API
 *
 * GET /api/admin/security
 *
 * Returns live security telemetry for the admin security monitor:
 *   - Auth events (failed sign-ins, active sessions, revocations)
 *   - Active session list
 *   - Environment variable presence checks
 *   - Container security posture (static config — no Docker socket needed)
 *   - Sanctuary boundary status
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

// ─── Container Security Posture ───────────────────────────────────────────────
// Static config reflecting docker-compose.production.yml hardening.
// Update this whenever docker-compose changes.

const CONTAINER_POSTURE = [
  {
    name: 'maia-caddy',
    networks: ['maia-public', 'marc-studio_default'],
    noNewPrivileges: true,
    capDrop: false,
    securityNote: null,
  },
  {
    name: 'maia-sovereign',
    networks: ['maia-internal', 'maia-public'],
    noNewPrivileges: true,
    capDrop: true,
    securityNote: null,
  },
  {
    name: 'maia-api',
    networks: ['maia-internal', 'maia-public'],
    noNewPrivileges: true,
    capDrop: true,
    securityNote: null,
  },
  {
    name: 'maia-postgres',
    networks: ['maia-internal'],
    noNewPrivileges: true,
    capDrop: false,
    securityNote: 'DB isolated to internal network only',
  },
  {
    name: 'maia-embed-worker',
    networks: ['maia-internal'],
    noNewPrivileges: false,
    capDrop: false,
    securityNote: null,
  },
  {
    name: 'maia-comms-worker',
    networks: ['maia-internal'],
    noNewPrivileges: false,
    capDrop: false,
    securityNote: null,
  },
  {
    name: 'maia-summary-worker',
    networks: ['maia-internal'],
    noNewPrivileges: false,
    capDrop: false,
    securityNote: null,
  },
  {
    name: 'maia-whisper',
    networks: ['maia-internal'],
    noNewPrivileges: false,
    capDrop: false,
    securityNote: null,
  },
  {
    name: 'maia-rlm',
    networks: ['maia-internal'],
    noNewPrivileges: false,
    capDrop: false,
    securityNote: null,
  },
  {
    name: 'oldhead-plaster',
    networks: ['maia-public'],
    noNewPrivileges: false,
    capDrop: false,
    securityNote: null,
  },
  {
    name: 'demo-plaster',
    networks: ['maia-public'],
    noNewPrivileges: false,
    capDrop: false,
    securityNote: null,
  },
  {
    name: 'palisades-handyman',
    networks: ['maia-public'],
    noNewPrivileges: false,
    capDrop: false,
    securityNote: null,
  },
  {
    name: 'rudeboy-baking',
    networks: ['maia-internal', 'maia-public'],
    noNewPrivileges: true,
    capDrop: false,
    securityNote: 'Uses shared DB password — dedicated DB user needed',
  },
];

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function GET() {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  const generatedAt = new Date().toISOString();

  // ── Auth security (from audit_logs) ──────────────────────────────────────
  let auth = {
    failedSignins24h: 0,
    activeSessionsCount: 0,
    revokedSessions24h: 0,
    uniqueFailedIPs24h: 0,
    recentEvents: [] as {
      actionType: string;
      result: string;
      ip: string | null;
      ua: string | null;
      ts: string;
      error: string | null;
    }[],
  };

  try {
    const [failedResult, activeResult, revokedResult, recentResult, uniqueIPResult] =
      await Promise.all([
        query(`
          SELECT COUNT(*)::int AS count
          FROM audit_logs
          WHERE action_result = 'failure'
            AND created_at >= now() - interval '24 hours'
        `),
        query(`
          SELECT COUNT(*)::int AS count
          FROM auth_sessions
          WHERE revoked = FALSE AND expires_at > now()
        `),
        query(`
          SELECT COUNT(*)::int AS count
          FROM auth_sessions
          WHERE revoked = TRUE
            AND revoked_at >= now() - interval '24 hours'
        `),
        query(`
          SELECT action_type, action_result, ip_address, user_agent, created_at, error_message
          FROM audit_logs
          ORDER BY created_at DESC
          LIMIT 25
        `),
        query(`
          SELECT COUNT(DISTINCT ip_address)::int AS count
          FROM audit_logs
          WHERE action_result = 'failure'
            AND ip_address IS NOT NULL
            AND created_at >= now() - interval '24 hours'
        `),
      ]);

    auth = {
      failedSignins24h:  failedResult.rows[0]?.count   ?? 0,
      activeSessionsCount: activeResult.rows[0]?.count ?? 0,
      revokedSessions24h: revokedResult.rows[0]?.count ?? 0,
      uniqueFailedIPs24h: uniqueIPResult.rows[0]?.count ?? 0,
      recentEvents: recentResult.rows.map(row => ({
        actionType: row.action_type,
        result:     row.action_result,
        ip:         row.ip_address ?? null,
        ua:         row.user_agent ? String(row.user_agent).slice(0, 100) : null,
        ts:         row.created_at,
        error:      row.error_message ?? null,
      })),
    };
  } catch { /* graceful — audit_logs table may not exist yet */ }

  // ── Active sessions ───────────────────────────────────────────────────────
  let sessions = {
    activeSessions: [] as {
      id: string;
      username: string | null;
      ip: string | null;
      ua: string | null;
      createdAt: string;
      lastActive: string;
      expiresAt: string;
    }[],
    expiringSoon: 0,
  };

  try {
    const [listResult, expiringResult] = await Promise.all([
      query(`
        SELECT s.id, m.username, s.ip_address, s.user_agent,
               s.created_at, s.last_active_at, s.expires_at
        FROM auth_sessions s
        LEFT JOIN members m ON m.id = s.member_id
        WHERE s.revoked = FALSE AND s.expires_at > now()
        ORDER BY s.last_active_at DESC
        LIMIT 50
      `),
      query(`
        SELECT COUNT(*)::int AS count
        FROM auth_sessions
        WHERE revoked = FALSE
          AND expires_at > now()
          AND expires_at < now() + interval '6 hours'
      `),
    ]);

    sessions = {
      activeSessions: listResult.rows.map(row => ({
        id:         row.id,
        username:   row.username ?? null,
        ip:         row.ip_address ?? null,
        ua:         row.user_agent ? String(row.user_agent).slice(0, 100) : null,
        createdAt:  row.created_at,
        lastActive: row.last_active_at,
        expiresAt:  row.expires_at,
      })),
      expiringSoon: expiringResult.rows[0]?.count ?? 0,
    };
  } catch { /* graceful */ }

  // ── Environment checks ────────────────────────────────────────────────────
  const environment = {
    nodeEnv: process.env.NODE_ENV ?? 'unknown',
    vars: {
      ANTHROPIC_API_KEY:       !!process.env.ANTHROPIC_API_KEY,
      LABTOOLS_ADMIN_PASSWORD: !!process.env.LABTOOLS_ADMIN_PASSWORD,
      DATABASE_URL:            !!process.env.DATABASE_URL,
      RESEND_API_KEY:          !!process.env.RESEND_API_KEY,
      NEXT_PUBLIC_APP_URL:     !!process.env.NEXT_PUBLIC_APP_URL,
    },
  };

  // ── 7-day auth trend ─────────────────────────────────────────────────────
  let trend: { date: string; failed: number; success: number }[] = [];
  try {
    const trendResult = await query(`
      SELECT
        date_trunc('day', created_at)::date::text AS date,
        COUNT(*) FILTER (WHERE action_result = 'failure')::int AS failed,
        COUNT(*) FILTER (WHERE action_result = 'success')::int AS success
      FROM audit_logs
      WHERE created_at >= now() - interval '7 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `);
    trend = trendResult.rows.map(row => ({
      date:    row.date,
      failed:  row.failed,
      success: row.success,
    }));
  } catch { /* graceful */ }

  // ── Sanctuary boundary ────────────────────────────────────────────────────
  // Sanctuary prevents content from being written — by design, there is no
  // per-session DB record. Boundary is verified at code level (oracle route).
  // This section reports the hardening status, not a row count.
  const sanctuary = {
    boundaryVerified: true,
    oracleRouteGated: true,
    clientBypassFixed: true,
    note: 'Oracle write points gated. OracleConversation.tsx sends actual sanctuary state.',
  };

  return NextResponse.json({
    generatedAt,
    auth,
    sessions,
    trend,
    environment,
    sanctuary,
    containers: CONTAINER_POSTURE,
  });
}
