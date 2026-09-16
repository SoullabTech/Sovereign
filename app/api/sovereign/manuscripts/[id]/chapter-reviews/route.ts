import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import {
  DEVELOPMENTAL_LENSES,
  isDevelopmentalLens,
  type DevelopmentalLens,
} from '@/lib/manuscript/developmentalReader/contract';

export const dynamic = 'force-dynamic';

type FailureWire = { lens: DevelopmentalLens; refusal: string; stage: string | null };
type ReadingRow = { id: string; scope: { commissionedLens?: unknown; bodyScope?: unknown } };
type RunRow = {
  id: string; manuscript_id: string; chapter_root_section_id: string;
  section_ids: string[]; draft_revision: number; reading_ids: string[];
  failures: FailureWire[]; created_at: Date;
};

const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string' && x.length > 0);
const same = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);
const failuresOf = (v: unknown): FailureWire[] | null => {
  if (!Array.isArray(v)) return null;
  const out: FailureWire[] = [];
  for (const x of v) {
    const r = x as { lens?: unknown; refusal?: unknown; stage?: unknown };
    if (!isDevelopmentalLens(r?.lens) || typeof r?.refusal !== 'string') return null;
    if (!(r.stage === null || typeof r.stage === 'string')) return null;
    out.push({ lens: r.lens, refusal: r.refusal, stage: r.stage });
  }
  return out;
};

async function owns(manuscriptId: string, memberId: string): Promise<boolean> {
  const r = await query<{ id: string }>(
    `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
    [manuscriptId, memberId],
  );
  return r.rows.length === 1;
}

const present = (row: RunRow) => ({
  id: row.id,
  manuscriptId: row.manuscript_id,
  chapterRootSectionId: row.chapter_root_section_id,
  sectionIds: row.section_ids,
  draftRevision: row.draft_revision,
  readingIds: row.reading_ids,
  failures: row.failures,
  createdAt: row.created_at.toISOString(),
});
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  const { id: manuscriptId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!(await owns(manuscriptId, memberId))) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });

  const chapterRootSectionId = req.nextUrl.searchParams.get('chapterRootSectionId');
  if (!chapterRootSectionId) return NextResponse.json({ refusal: 'missing_chapter_root' }, { status: 400 });

  const r = await query<RunRow>(
    `SELECT id, manuscript_id, chapter_root_section_id, section_ids, draft_revision,
            reading_ids, failures, created_at
       FROM writer_studio_chapter_review_runs
      WHERE member_id = $1 AND manuscript_id = $2 AND chapter_root_section_id = $3
      ORDER BY created_at DESC
      LIMIT 1`,
    [memberId, manuscriptId, chapterRootSectionId],
  );
  return NextResponse.json({ run: r.rows[0] ? present(r.rows[0]) : null });
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  const { id: manuscriptId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!(await owns(manuscriptId, memberId))) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  const allowed = new Set(['chapterRootSectionId', 'sectionIds', 'draftRevision', 'readingIds', 'failures']);
  if (Object.keys(body).some((k) => !allowed.has(k))) return NextResponse.json({ refusal: 'foreign_field' }, { status: 400 });

  const chapterRootSectionId = body.chapterRootSectionId;
  const sectionIds = body.sectionIds;
  const readingIds = body.readingIds;
  const draftRevision = body.draftRevision;
  const failures = failuresOf(body.failures);
  if (typeof chapterRootSectionId !== 'string' || !strings(sectionIds) || !strings(readingIds)
      || !Number.isInteger(draftRevision) || Number(draftRevision) < 0 || failures === null) {
    return NextResponse.json({ refusal: 'invalid_manifest' }, { status: 400 });
  }
  if (!sectionIds.includes(chapterRootSectionId)) return NextResponse.json({ refusal: 'chapter_root_outside_scope' }, { status: 400 });
  if (new Set(sectionIds).size !== sectionIds.length || new Set(readingIds).size !== readingIds.length) {
    return NextResponse.json({ refusal: 'duplicate_identity' }, { status: 400 });
  }
  const readings = readingIds.length === 0 ? { rows: [] as ReadingRow[] } : await query<ReadingRow>(
    `SELECT id, scope
       FROM developmental_readings
      WHERE manuscript_id = $1 AND member_id = $2 AND id = ANY($3::uuid[])`,
    [manuscriptId, memberId, readingIds],
  );
  if (readings.rows.length !== readingIds.length) return NextResponse.json({ refusal: 'reading_mismatch' }, { status: 409 });

  const completed = new Set<DevelopmentalLens>();
  for (const row of readings.rows) {
    const lens = row.scope?.commissionedLens;
    const bodyScope = row.scope?.bodyScope;
    if (!isDevelopmentalLens(lens) || !strings(bodyScope) || !same(bodyScope, sectionIds)) {
      return NextResponse.json({ refusal: 'reading_scope_mismatch' }, { status: 409 });
    }
    if (completed.has(lens)) return NextResponse.json({ refusal: 'duplicate_lens' }, { status: 409 });
    completed.add(lens);
  }
  for (const f of failures) {
    if (completed.has(f.lens)) return NextResponse.json({ refusal: 'lens_both_completed_and_failed' }, { status: 409 });
    completed.add(f.lens);
  }
  if (completed.size !== DEVELOPMENTAL_LENSES.length || DEVELOPMENTAL_LENSES.some((lens) => !completed.has(lens))) {
    return NextResponse.json({ refusal: 'incomplete_lens_accounting' }, { status: 409 });
  }

  const inserted = await query<RunRow>(
    `INSERT INTO writer_studio_chapter_review_runs
      (member_id, manuscript_id, chapter_root_section_id, section_ids, draft_revision, reading_ids, failures)
     VALUES ($1,$2,$3,$4::jsonb,$5,$6::jsonb,$7::jsonb)
     RETURNING id, manuscript_id, chapter_root_section_id, section_ids, draft_revision,
               reading_ids, failures, created_at`,
    [memberId, manuscriptId, chapterRootSectionId, JSON.stringify(sectionIds), draftRevision,
      JSON.stringify(readingIds), JSON.stringify(failures)],
  );
  return NextResponse.json({ run: present(inserted.rows[0]) }, { status: 201 });
}
