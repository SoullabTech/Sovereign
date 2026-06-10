/**
 * Admin Operations Monitors — read-only GET endpoint.
 *
 * Surfaces the operational signals an operator currently has to SSH / psql /
 * docker-logs for, so they're visible in Admin without a terminal:
 *   - Voice usage         (audio_usage_events)
 *   - Provider health     (checkModelHealth: Claude / local / fallback)
 *   - Deploy health       (uptime, commit, env, db reachability)
 *   - Member anomalies    (members: never-signed-in, onboarding-incomplete, …)
 *   - Migration status    (schema_migrations vs database/required_migrations.txt)
 *
 * Token/cost is NOT here — it has no live source on the deployed line (the
 * stewardship ledger that captured tokens was reverted). The page renders an
 * honest "not yet instrumented" card instead of faking data.
 *
 * No mutations. No member content. Admin-gated by the established password
 * contract (LABTOOLS_ADMIN_PASSWORD via x-admin-password / Bearer).
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { isAdminRequest } from '@/lib/admin/requireAdmin';
import { query } from '@/lib/db/postgres';
import { checkModelHealth } from '@/lib/ai/modelService';

export const dynamic = 'force-dynamic';

async function voiceUsage() {
  try {
    const r = await query(`
      SELECT
        COUNT(*)::int                                         AS total,
        COALESCE(SUM(seconds), 0)::bigint                     AS seconds,
        COALESCE(SUM(bytes), 0)::bigint                       AS bytes,
        COUNT(DISTINCT member_id)::int                        AS members,
        COUNT(*) FILTER (WHERE status = 'ok')::int            AS ok,
        COUNT(*) FILTER (WHERE status = 'rejected')::int      AS rejected,
        COUNT(*) FILTER (WHERE status = 'error')::int         AS error
      FROM audio_usage_events
      WHERE created_at > now() - interval '7 days'
    `);
    const row = r.rows[0] ?? {};
    return {
      available: true,
      total7d: Number(row.total ?? 0),
      seconds7d: Number(row.seconds ?? 0),
      bytes7d: Number(row.bytes ?? 0),
      members7d: Number(row.members ?? 0),
      status: { ok: Number(row.ok ?? 0), rejected: Number(row.rejected ?? 0), error: Number(row.error ?? 0) },
    };
  } catch (e) {
    return { available: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function providerHealth() {
  try {
    const h = await checkModelHealth();
    return {
      available: true,
      status: h.status,
      primary: h.primary,
      claude: h.claude_available,
      local: h.local_available,
      kimi: h.kimi_available,
      model: h.model ?? null,
    };
  } catch (e) {
    return { available: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function deployHealth() {
  let db: { ok: boolean; latencyMs: number | null } = { ok: false, latencyMs: null };
  try {
    const t0 = Date.now();
    await query('SELECT 1');
    db = { ok: true, latencyMs: Date.now() - t0 };
  } catch {
    db = { ok: false, latencyMs: null };
  }
  return {
    uptimeSec: Math.round(process.uptime()),
    version: process.env.GIT_COMMIT || 'unknown',
    appVersion: process.env.APP_VERSION || null,
    buildDate: process.env.BUILD_DATE || null,
    nodeEnv: process.env.NODE_ENV || 'unknown',
    safeMode: process.env.SAFE_MODE === '1' || process.env.SAFE_MODE === 'true',
    db,
  };
}

async function memberAnomalies() {
  try {
    const r = await query(`
      SELECT
        COUNT(*)::int                                                          AS total,
        COUNT(*) FILTER (WHERE last_sign_in IS NULL)::int                      AS never_signed_in,
        COUNT(*) FILTER (WHERE onboarded = false)::int                         AS onboarding_incomplete,
        COUNT(*) FILTER (WHERE created_at > now() - interval '7 days')::int     AS new_7d,
        COUNT(*) FILTER (WHERE last_sign_in > now() - interval '7 days')::int   AS active_7d
      FROM members
    `);
    const row = r.rows[0] ?? {};
    return {
      available: true,
      total: Number(row.total ?? 0),
      neverSignedIn: Number(row.never_signed_in ?? 0),
      onboardingIncomplete: Number(row.onboarding_incomplete ?? 0),
      new7d: Number(row.new_7d ?? 0),
      active7d: Number(row.active_7d ?? 0),
    };
  } catch (e) {
    return { available: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function migrationStatus() {
  try {
    const appliedRes = await query(
      `SELECT filename, applied_at FROM schema_migrations WHERE filename IS NOT NULL ORDER BY applied_at DESC NULLS LAST`
    );
    const applied = new Set<string>(appliedRes.rows.map((r: { filename: string }) => r.filename));

    let required: string[] = [];
    try {
      const raw = await fs.readFile(path.join(process.cwd(), 'database', 'required_migrations.txt'), 'utf8');
      required = raw
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'));
    } catch {
      required = [];
    }

    const missing = required.filter((m) => !applied.has(m)); // required but not applied = DRIFT
    const recent = appliedRes.rows.slice(0, 5).map((r: { filename: string; applied_at: string }) => ({
      filename: r.filename,
      appliedAt: r.applied_at,
    }));

    return {
      available: true,
      appliedCount: applied.size,
      requiredCount: required.length,
      missing,
      drift: missing.length > 0,
      recent,
    };
  } catch (e) {
    return { available: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [voice, providers, deploy, members, migrations] = await Promise.all([
    voiceUsage(),
    providerHealth(),
    deployHealth(),
    memberAnomalies(),
    migrationStatus(),
  ]);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    voice,
    providers,
    deploy,
    members,
    migrations,
  });
}
