/**
 * WS2-05½ — the member asks MAIA to read the Work.
 *
 * THE COMMAND BOUNDARY, AND NOTHING ELSE. This route exists because the two
 * routes that already exist are deliberately the wrong place for it:
 *
 *   /structure/proposals   is GET-only ON PURPOSE. Nothing a client sends may
 *                          create a reading; proposals are written by the host
 *                          loop after an interpreter has run.
 *   /structure             is the AUTHORED-structure mutation boundary — create,
 *                          rename, move, delete, place. A reading is not an
 *                          authored act and must not enter through that door.
 *
 * So this is a third, narrow boundary: one member gesture, one reading.
 *
 * THE SERVER OWNS THE READ. The request body carries NOTHING about the Work —
 * no text, no sections, no proposed tree, no interpretation. A client that
 * could supply any of those could publish a structure under MAIA's name that
 * MAIA never produced. The only thing the caller contributes is the gesture
 * and their identity.
 *
 * CANONICAL STRUCTURE IS NOT TOUCHED. Nothing imported here writes to
 * `manuscript_structure_units`. A reading is a proposal about the Work, never
 * an edit of it — that remains true by construction, not by assertion.
 *
 * A FAULT STORES NOTHING. `createProposal` runs only after an interpretation
 * has completed. A refused inference, a parse failure, or a dropped connection
 * leaves no partial proposal, and is reported AS a fault in the machine rather
 * than rendered as a finding about the Work.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { gatherEvidence, sectionTopologyHash } from '@/lib/manuscript/structure/evidence';
import { interpretStructure } from '@/lib/manuscript/structure/interpret';
import {
  createMaiaStructureReader, boundedFetcher, StructureReaderError,
} from '@/lib/manuscript/structure/maiaReader';
import { createProposal, type ProposalRefusal } from '@/lib/manuscript/structure/proposalStore';

export const dynamic = 'force-dynamic';

const STATUS: Record<ProposalRefusal, number> = {
  not_found: 404,
  stale_revision: 409,
  already_adopted: 409,
  prose_in_payload: 422,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: manuscriptId } = await params;

  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  /* Ownership is enforced IN the query, not checked beside it. A row reaches
     this code only if it belongs to the authenticated member; a manuscript that
     is someone else's is indistinguishable here from one that does not exist,
     which is the answer a member of another Work is entitled to. */
  const rows = await query<{ id: string; position: number; heading: string | null }>(
    `SELECT s.id, s.position, ms.heading
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
       JOIN member_manuscripts m ON m.id = d.manuscript_id
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE d.manuscript_id = $1 AND m.member_id = $2
        AND d.section_addressable_at IS NOT NULL
      ORDER BY s.position ASC`,
    [manuscriptId, memberId]);

  const sections = rows.rows;
  if (sections.length === 0) {
    /* Either there is no such Work for this member, or it has no
       section-addressable draft yet. Both mean: there is nothing to read. */
    return NextResponse.json({ refusal: 'not_readable' }, { status: 404 });
  }

  /* Mechanics first, always. Evidence is computed from the Work's own topology
     before any model is asked anything. */
  const evidence = gatherEvidence(manuscriptId, sections);

  const maia = createMaiaStructureReader();

  /* Bodies are fetched by the HOST, under the same ownership predicate, and
     only for ids MAIA asked for. The reader never reaches the database. */
  const fetchBodies = boundedFetcher(async (ids) => {
    const r = await query<{ id: string; text: string }>(
      `SELECT s.id, s.text
         FROM manuscript_draft_sections s
         JOIN manuscript_working_drafts d ON d.id = s.draft_id
         JOIN member_manuscripts m ON m.id = d.manuscript_id
        WHERE d.manuscript_id = $1 AND m.member_id = $2 AND s.id = ANY($3::uuid[])`,
      [manuscriptId, memberId, ids]);
    return new Map(r.rows.map((row) => [row.id, row.text]));
  });

  let result;
  try {
    result = await interpretStructure(evidence, sections, maia.read, { fetchBodies });
  } catch (e) {
    /* A reader fault and a transport fault are the same fact to a member: the
       reading did not happen. Neither is a finding about their Work, and
       neither stores anything. */
    if (e instanceof StructureReaderError) {
      return NextResponse.json(
        { refusal: 'reading_failed', reason: e.reason }, { status: 502 });
    }
    const status = (e as { status?: number }).status;
    return NextResponse.json(
      { refusal: 'reading_failed', reason: 'the reading did not complete',
        ...(status ? { upstreamStatus: status } : {}) }, { status: 502 });
  }

  const interp = result.interpretation;

  const stored = await createProposal(manuscriptId, memberId, {
    evidence,
    interpretation: interp,
    coverage: interp.coverage,
    sectionTopologyHash: sectionTopologyHash(sections),
    interpretationInputHash: result.interpretationInputHash,
    /* Bound to the reader that actually ran, so the member can ask what
       produced their reading and get the truth. */
    readerProvenance: maia.provenance,
  });

  if (stored.status !== 'ok') {
    return NextResponse.json(
      { refusal: stored.refusal, ...(stored.detail ? { detail: stored.detail } : {}) },
      { status: STATUS[stored.refusal] });
  }

  /* The proposalId is the whole point: it is what opens the Structure Review
     room. The form and account are returned so the caller can say what happened
     without a second round trip — MAIA's own words, not a summary of them. */
  return NextResponse.json({
    proposalId: stored.value.id,
    form: interp.form,
    account: interp.account,
    reviewPath: `/writers-studio/review?m=${manuscriptId}&p=${stored.value.id}`,
  }, { status: 201 });
}
