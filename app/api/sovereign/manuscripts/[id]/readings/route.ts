/**
 * BUILD-07D — DEVELOP SURFACE · the readings boundary for one Work.
 *
 *   GET   list the member's frozen readings of this Work — summaries, newest first
 *   POST  commission ONE new reading under ONE lens (the member gesture, 07D)
 *
 * THE SERVER OWNS THE READ. The request body carries nothing about the Work —
 * no text, no section ids, no scope, no proposed observation. A client that
 * could supply any of those could publish an observation under MAIA's name
 * that MAIA never made. The caller contributes the lens and their identity;
 * the scope is the whole section-addressable draft, read at body depth, with
 * the member's authored structure supplied where any exists.
 *
 * ONE COMMISSION, ONE READING. `commissionReading` refuses rather than
 * retries, and a refusal at any stage stores nothing (07C). The stage and the
 * typed refusal come back so the surface can say what did not happen — the
 * refusal is a fact about the machine, never a finding about the book.
 *
 * NOTHING HERE WRITES TO THE WORK. The only INSERT in reach is the 07C store's,
 * into its own table, and only through the commission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { isDevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import { commissionReading, type CommissionStage } from '@/lib/manuscript/developmentalReading/commission';
import { listReadings } from '@/lib/manuscript/developmentalReading/store';

export const dynamic = 'force-dynamic';

/** Sections of the member's addressable draft, ordered. Ownership is IN the query. */
async function addressableSectionIds(manuscriptId: string, memberId: string): Promise<string[]> {
  const r = await query<{ id: string }>(
    `SELECT s.id
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
       JOIN member_manuscripts m ON m.id = d.manuscript_id
      WHERE d.manuscript_id = $1 AND m.member_id = $2
        AND d.section_addressable_at IS NOT NULL
      ORDER BY s.position ASC`,
    [manuscriptId, memberId]);
  return r.rows.map((row) => row.id);
}

/** Whether the member has authored any structure for this Work. Ownership is IN the query. */
async function hasAuthoredStructure(manuscriptId: string, memberId: string): Promise<boolean> {
  const r = await query<{ n: string }>(
    `SELECT count(*)::text AS n
       FROM manuscript_structure_units u
       JOIN member_manuscripts m ON m.id = u.manuscript_id
      WHERE u.manuscript_id = $1 AND m.member_id = $2`,
    [manuscriptId, memberId]);
  return Number(r.rows[0]?.n ?? 0) > 0;
}

/** Whether this Work is the member's at all — so an empty list is "none yet", not "not yours". */
async function ownsManuscript(manuscriptId: string, memberId: string): Promise<boolean> {
  const r = await query<{ id: string }>(
    `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`, [manuscriptId, memberId]);
  return r.rows.length > 0;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  const { id: manuscriptId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  if (!(await ownsManuscript(manuscriptId, memberId))) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }
  const readings = await listReadings(manuscriptId, memberId);
  return NextResponse.json({ readings });
}

/**
 * Status by stage. A refusal is typed by the unit that refused; the surface
 * receives the stage and the code, and shows the member a sentence.
 */
function statusFor(stage: CommissionStage, refusal: string): number {
  if (refusal === 'structured_inference_unavailable') return 503;
  switch (stage) {
    case 'capture': return refusal === 'not_found' ? 404 : 409;
    case 'recover': return 409;
    case 'read':
    case 'classify':
    case 'freeze': return 422;
    case 'store': return 500;
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  const { id: manuscriptId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }
  const lens = (body as { lens?: unknown } | null)?.lens;
  if (!isDevelopmentalLens(lens)) {
    return NextResponse.json({ refusal: 'invalid_lens' }, { status: 400 });
  }
  /* The body may carry the lens and nothing else. A client that sends scope,
     sections, text or an observation is refused, not partially honoured. */
  const keys = Object.keys((body as object) ?? {});
  if (keys.some((k) => k !== 'lens')) {
    return NextResponse.json({ refusal: 'foreign_field', detail: keys.filter((k) => k !== 'lens').join(', ') }, { status: 400 });
  }

  const bodyScope = await addressableSectionIds(manuscriptId, memberId);
  if (bodyScope.length === 0) {
    /* Either no such Work for this member, or no section-addressable draft
       yet. Both mean there is nothing to read, and neither leaks existence. */
    return NextResponse.json({ refusal: 'not_readable', stage: 'capture' }, { status: 404 });
  }
  const withStructure = await hasAuthoredStructure(manuscriptId, memberId);

  const outcome = await commissionReading({ manuscriptId, memberId, lens, bodyScope, withStructure });
  if (outcome.outcome === 'refused') {
    return NextResponse.json(
      { refusal: outcome.refusal, stage: outcome.stage, detail: outcome.detail },
      { status: statusFor(outcome.stage, outcome.refusal) });
  }
  const { reading } = outcome;
  return NextResponse.json({
    readingId: reading.id,
    outcome: reading.outcome,
    observationCount: reading.observations.length,
    frozenAt: reading.provenance.frozenAt,
  }, { status: 201 });
}
