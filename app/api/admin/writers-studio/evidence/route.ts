import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, adminUnauthorized } from '@/lib/admin/adminAuth';
import { query } from '@/lib/db/postgres';
import {
  WRITER_STUDIO_RELEASE_GATES,
  WRITER_STUDIO_METRICS,
  type StewardshipStatus,
  type WriterStudioGateId,
} from '@/lib/writersStudio/releaseEvidence';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ReleaseRow = {
  release_key: string;
  title: string;
  phase: string;
  candidate_sha: string;
  canonical_parent_sha: string;
  status: string;
  rollback_plan: string;
  migration_set: unknown;
  feature_flags: unknown;
  what_changed: string | null;
  remains_uncertain: string | null;
  falsifier: string | null;
  created_by: string | null;
  created_at: string;
};

type EvidenceRow = {
  gate_id: WriterStudioGateId;
  status: StewardshipStatus;
  evidence_type: string;
  summary: string;
  evidence_ref: string | null;
  payload: unknown;
  recorded_by: string | null;
  recorded_at: string;
};

type MetricRow = {
  metric_id: string;
  value: string | number | null;
  numerator: string | number | null;
  denominator: string | number | null;
  sample_count: string | number;
  status: StewardshipStatus;
  notes: string | null;
  window_start: string | null;
  window_end: string | null;
  calculated_at: string;
};

function status(value: unknown): StewardshipStatus {
  return value === 'green' || value === 'amber' || value === 'red' ? value : 'grey';
}

export async function GET(req: NextRequest) {
  const auth = await checkAdminAuth(req);
  if (!auth.authed) return adminUnauthorized();

  const runtimeSha =
    process.env.GIT_COMMIT ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.NEXT_PUBLIC_BUILD_ID ??
    'unknown';

  const releases = await query<ReleaseRow>(
    `SELECT release_key, title, phase, candidate_sha, canonical_parent_sha, status,
            rollback_plan, migration_set, feature_flags, what_changed,
            remains_uncertain, falsifier, created_by, created_at
       FROM writer_studio_releases
      ORDER BY created_at DESC
      LIMIT 12`,
  );

  const current = releases.rows[0] ?? null;

  let evidence: EvidenceRow[] = [];
  let metrics: MetricRow[] = [];
  let founderWitness: EvidenceRow | null = null;
  if (current) {
    const evidenceResult = await query<EvidenceRow>(
      `SELECT DISTINCT ON (gate_id)
              gate_id, status, evidence_type, summary, evidence_ref, payload,
              recorded_by, recorded_at
         FROM writer_studio_release_evidence
        WHERE release_key = $1
        ORDER BY gate_id, recorded_at DESC`,
      [current.release_key],
    );
    evidence = evidenceResult.rows;

    const founderWitnessResult = await query<EvidenceRow>(
      `SELECT gate_id, status, evidence_type, summary, evidence_ref, payload,
              recorded_by, recorded_at
         FROM writer_studio_release_evidence
        WHERE release_key = $1 AND evidence_type = 'founder_witness'
        ORDER BY recorded_at DESC
        LIMIT 1`,
      [current.release_key],
    );
    founderWitness = founderWitnessResult.rows[0] ?? null;

    const metricResult = await query<MetricRow>(
      `SELECT DISTINCT ON (metric_id)
              metric_id, value, numerator, denominator, sample_count, status, notes,
              window_start, window_end, calculated_at
         FROM writer_studio_metric_snapshots
        WHERE release_key = $1
        ORDER BY metric_id, calculated_at DESC`,
      [current.release_key],
    );
    metrics = metricResult.rows;
  }

  const evidenceByGate = new Map(evidence.map((item) => [item.gate_id, item]));
  const metricById = new Map(metrics.map((item) => [item.metric_id, item]));

  return NextResponse.json({
    runtime: {
      sha: runtimeSha,
      environment: process.env.NODE_ENV ?? 'unknown',
      candidateMatch: current
        ? runtimeSha.startsWith(current.candidate_sha) || current.candidate_sha.startsWith(runtimeSha)
        : null,
      observedAt: new Date().toISOString(),
    },
    currentRelease: current,
    recentReleases: releases.rows,
    gates: WRITER_STUDIO_RELEASE_GATES.map((gate) => ({
      ...gate,
      evidence: evidenceByGate.get(gate.id) ?? null,
      status: evidenceByGate.get(gate.id)?.status ?? 'grey',
    })),
    metrics: WRITER_STUDIO_METRICS.map((definition) => ({
      ...definition,
      snapshot: metricById.get(definition.id) ?? null,
      status: metricById.get(definition.id)?.status ?? 'grey',
    })),
    founderWitness,
  });
}

export async function POST(req: NextRequest) {
  const auth = await checkAdminAuth(req, ['founder']);
  if (!auth.authed) return adminUnauthorized();

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  const action = body?.action;

  if (action === 'create_release') {
    const releaseKey = String(body?.releaseKey ?? '').trim();
    const title = String(body?.title ?? '').trim();
    const phase = String(body?.phase ?? '').trim();
    const candidateSha = String(body?.candidateSha ?? '').trim();
    const canonicalParentSha = String(body?.canonicalParentSha ?? '').trim();
    const rollbackPlan = String(body?.rollbackPlan ?? '').trim();
    if (!releaseKey || !title || !phase || !candidateSha || !canonicalParentSha || !rollbackPlan) {
      return NextResponse.json({ error: 'missing_release_fields' }, { status: 400 });
    }
    try {
      await query(
        `INSERT INTO writer_studio_releases
          (release_key, title, phase, candidate_sha, canonical_parent_sha, status,
           rollback_plan, migration_set, feature_flags, what_changed,
           remains_uncertain, falsifier, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11,$12,$13)`,
        [
          releaseKey, title, phase, candidateSha, canonicalParentSha,
          String(body?.status ?? 'candidate'), rollbackPlan,
          JSON.stringify(body?.migrationSet ?? []),
          JSON.stringify(body?.featureFlags ?? {}),
          body?.whatChanged ?? null,
          body?.remainsUncertain ?? null,
          body?.falsifier ?? null,
          auth.memberId ?? auth.role,
        ],
      );
    } catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code ?? '')
        : '';
      if (code === '23505') {
        return NextResponse.json(
          { error: 'release_identity_already_exists', message: 'Create a new release key for a new candidate SHA; evidence never inherits across heads.' },
          { status: 409 },
        );
      }
      throw error;
    }
    return NextResponse.json({ ok: true, releaseKey });
  }

  if (action === 'advance_release') {
    const releaseKey = String(body?.releaseKey ?? '').trim();
    const releaseStatus = String(body?.status ?? '').trim();
    const allowed = ['draft','candidate','founder_witness','beta','released','held','rolled_back'];
    if (!releaseKey || !allowed.includes(releaseStatus)) {
      return NextResponse.json({ error: 'invalid_release_advance' }, { status: 400 });
    }
    await query(
      `UPDATE writer_studio_releases
          SET status = $2,
              what_changed = COALESCE($3, what_changed),
              remains_uncertain = COALESCE($4, remains_uncertain),
              falsifier = COALESCE($5, falsifier)
        WHERE release_key = $1`,
      [
        releaseKey,
        releaseStatus,
        body?.whatChanged ?? null,
        body?.remainsUncertain ?? null,
        body?.falsifier ?? null,
      ],
    );
    return NextResponse.json({ ok: true, releaseKey, status: releaseStatus });
  }

  if (action === 'record_evidence') {
    const releaseKey = String(body?.releaseKey ?? '').trim();
    const gateId = String(body?.gateId ?? '').trim() as WriterStudioGateId;
    const summary = String(body?.summary ?? '').trim();
    const evidenceType = String(body?.evidenceType ?? '').trim();
    const evidenceStatus = status(body?.status);
    if (!releaseKey || !WRITER_STUDIO_RELEASE_GATES.some((gate) => gate.id === gateId) || !summary || !evidenceType) {
      return NextResponse.json({ error: 'invalid_evidence' }, { status: 400 });
    }
    await query(
      `INSERT INTO writer_studio_release_evidence
        (release_key, gate_id, status, evidence_type, summary, evidence_ref, payload, recorded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)`,
      [
        releaseKey, gateId, evidenceStatus, evidenceType, summary,
        body?.evidenceRef ?? null,
        JSON.stringify(body?.payload ?? {}),
        auth.memberId ?? auth.role,
      ],
    );
    return NextResponse.json({ ok: true });
  }

  if (action === 'record_metric') {
    const releaseKey = String(body?.releaseKey ?? '').trim();
    const metricId = String(body?.metricId ?? '').trim();
    if (!releaseKey || !WRITER_STUDIO_METRICS.some((metric) => metric.id === metricId)) {
      return NextResponse.json({ error: 'invalid_metric' }, { status: 400 });
    }
    await query(
      `INSERT INTO writer_studio_metric_snapshots
        (release_key, metric_id, window_start, window_end, value, numerator,
         denominator, sample_count, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        releaseKey, metricId, body?.windowStart ?? null, body?.windowEnd ?? null,
        body?.value ?? null, body?.numerator ?? null, body?.denominator ?? null,
        Number(body?.sampleCount ?? 0), status(body?.status), body?.notes ?? null,
      ],
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'unsupported_action' }, { status: 400 });
}
