/**
 * Admin Voice Lab — evaluation record store (append-only) + export.
 *
 * POST { ...evaluation }  → appends one scored observation to a JSONL file.
 * GET  [?format=csv]      → returns all recorded evaluations (export evidence).
 *
 * Admin-gated (isAdminRequest). Lab-only tooling — no member data. Persists to
 * VOICE_LAB_DATA_DIR (default repo-local `.voice-lab/`, gitignored) so evidence
 * survives restarts without a migration. GRADUATION: promote to a DB table only
 * when multi-week longitudinal analysis is actually run (not before — a table now
 * would be built substrate with zero readers).
 *
 * A score is stored WITH its provenance so a fallback render can never be scored
 * as the intended engine.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin/requireAdmin';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

function dataDir(): string {
  return process.env.VOICE_LAB_DATA_DIR || path.join(process.cwd(), '.voice-lab');
}
function storePath(): string {
  return path.join(dataDir(), 'evaluations.jsonl');
}

interface EvaluationRecord {
  ts: string;
  sessionId: string;
  evaluator: string; // e.g. 'kelly' | 'larry'
  blindLabel?: string; // 'A' | 'B' | 'C'
  requestedProvider: string;
  provider: string; // what actually rendered (provenance)
  voice?: string | null;
  passageId?: string;
  scenarioId?: string;
  scores: Record<string, number>; // { trust, presence, warmth, attunement, ... }
  notes?: string;
  provenance?: { fallback?: boolean; reason?: string; latencyMs?: number };
}

async function readAll(): Promise<EvaluationRecord[]> {
  try {
    const raw = await fs.readFile(storePath(), 'utf8');
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as EvaluationRecord;
        } catch {
          return null;
        }
      })
      .filter((r): r is EvaluationRecord => r !== null);
  } catch (err: any) {
    if (err?.code === 'ENOENT') return [];
    throw err;
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Partial<EvaluationRecord>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.sessionId || !body.evaluator || !body.requestedProvider || !body.scores) {
    return NextResponse.json(
      { error: 'sessionId, evaluator, requestedProvider, and scores are required' },
      { status: 400 },
    );
  }

  const record: EvaluationRecord = {
    ts: new Date().toISOString(),
    sessionId: String(body.sessionId),
    evaluator: String(body.evaluator),
    blindLabel: body.blindLabel,
    requestedProvider: String(body.requestedProvider),
    provider: String(body.provider ?? body.requestedProvider),
    voice: body.voice ?? null,
    passageId: body.passageId,
    scenarioId: body.scenarioId,
    scores: body.scores as Record<string, number>,
    notes: body.notes,
    provenance: body.provenance,
  };

  await fs.mkdir(dataDir(), { recursive: true });
  await fs.appendFile(storePath(), JSON.stringify(record) + '\n', 'utf8');

  return NextResponse.json({ ok: true, ts: record.ts });
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const records = await readAll();
  const format = req.nextUrl.searchParams.get('format');

  if (format === 'csv') {
    const dims = Array.from(
      records.reduce((set, r) => {
        Object.keys(r.scores || {}).forEach((k) => set.add(k));
        return set;
      }, new Set<string>()),
    );
    const header = ['ts', 'sessionId', 'evaluator', 'blindLabel', 'requestedProvider', 'provider', 'voice', 'passageId', 'scenarioId', ...dims, 'notes'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = records.map((r) =>
      [
        r.ts, r.sessionId, r.evaluator, r.blindLabel ?? '', r.requestedProvider, r.provider,
        r.voice ?? '', r.passageId ?? '', r.scenarioId ?? '',
        ...dims.map((d) => r.scores?.[d] ?? ''),
        r.notes ?? '',
      ].map(esc).join(','),
    );
    return new NextResponse([header.map(esc).join(','), ...rows].join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="voice-lab-evaluations.csv"',
      },
    });
  }

  return NextResponse.json({ count: records.length, evaluations: records });
}
