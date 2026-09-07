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
import {
  isReadingScope,
  resolveScope,
  type ReadingScope,
} from '@/lib/manuscript/developmentalReading/scope';
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

/**
 * Section ids per authored division. Ownership is IN the query, so a unit id
 * belonging to another member's Work resolves to nothing and is refused as
 * unknown — it never confirms that the id exists.
 */
async function unitSectionIds(
  manuscriptId: string,
  memberId: string,
): Promise<Record<string, string[]>> {
  /* ⛔ THE SUBTREE, not direct membership. A Part typically holds no sections
     of its own — its chapters do. Resolving "Part One" to its direct members
     would resolve it to NOTHING and refuse the writer's most natural request
     with `empty_scope`, which would read as the feature being broken.

     Choosing a division means that division and everything under it. */
  const r = await query<{ unit_id: string; draft_section_id: string }>(
    `WITH RECURSIVE subtree(root_id, unit_id) AS (
       SELECT u.id, u.id
         FROM manuscript_structure_units u
         JOIN member_manuscripts m ON m.id = u.manuscript_id
        WHERE u.manuscript_id = $1 AND m.member_id = $2
       UNION ALL
       SELECT s.root_id, c.id
         FROM subtree s
         JOIN manuscript_structure_units c ON c.parent_id = s.unit_id
        WHERE c.manuscript_id = $1
     )
     SELECT DISTINCT s.root_id AS unit_id, sm.draft_section_id
       FROM subtree s
       JOIN manuscript_structure_members sm ON sm.unit_id = s.unit_id`,
    [manuscriptId, memberId]);
  const byUnit: Record<string, string[]> = {};
  for (const row of r.rows) (byUnit[row.unit_id] ??= []).push(row.draft_section_id);
  return byUnit;
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
  /* WS-DEV-SCOPE-01. The body may carry the lens and a STRUCTURAL scope, and
     nothing else. A client that sends text, sections' prose or an observation
     is still refused, not partially honoured — the widening admits identifiers
     only, and `isReadingScope` admits no shape that could carry prose.

     Absent `scope` means the whole work, which is what every existing caller
     asked for and still gets. */
  const ALLOWED = new Set(['lens', 'scope']);
  const keys = Object.keys((body as object) ?? {});
  const foreign = keys.filter((k) => !ALLOWED.has(k));
  if (foreign.length > 0) {
    return NextResponse.json({ refusal: 'foreign_field', detail: foreign.join(', ') }, { status: 400 });
  }

  const rawScope = (body as { scope?: unknown } | null)?.scope;
  const scope: ReadingScope =
    rawScope === undefined ? { kind: 'whole' } : (rawScope as ReadingScope);
  if (rawScope !== undefined && !isReadingScope(rawScope)) {
    return NextResponse.json({ refusal: 'invalid_scope' }, { status: 400 });
  }

  const topology = await addressableSectionIds(manuscriptId, memberId);
  if (topology.length === 0) {
    /* Either no such Work for this member, or no section-addressable draft
       yet. Both mean there is nothing to read, and neither leaks existence. */
    return NextResponse.json({ refusal: 'not_readable', stage: 'capture' }, { status: 404 });
  }

  /* Divisions are loaded only when one is named. A scope that does not ask
     about structure does not pay for reading it. */
  const unitSections =
    scope.kind === 'unit' ? await unitSectionIds(manuscriptId, memberId) : {};

  const resolved = resolveScope(scope, { topology, unitSections });
  if (!resolved.ok) {
    /* The member's own terms, and a 400: their request named something this
       work does not contain, which is theirs to correct — not a server fault
       and not a capability refusal. */
    return NextResponse.json(
      { refusal: resolved.refusal, stage: 'capture', detail: resolved.detail },
      { status: 400 },
    );
  }
  const bodyScope = [...resolved.bodyScope];
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
