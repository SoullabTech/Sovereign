/**
 * WS2-05B - what readings exist for this Work.
 *
 * READ ONLY, AND DELIBERATELY THIN. There is no POST here: nothing a client
 * sends can create a reading. Proposals are written by the host loop after an
 * interpreter has run, never by a request.
 *
 * SUMMARIES, NOT READINGS. The list carries what a member needs to decide which
 * reading to open - its form, its account, when it was made - and not the tree.
 * A column that renders divisions from a list would be a second structure
 * surface, drawn from a payload the review room never validated.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listProposals, type ProposalRefusal } from '@/lib/manuscript/structure/proposalStore';

export const dynamic = 'force-dynamic';

const STATUS: Record<ProposalRefusal, number> = {
  not_found: 404,
  stale_revision: 409,
  already_adopted: 409,
  prose_in_payload: 422,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const r = await listProposals(id, memberId);
  if (r.status === 'refused') {
    return NextResponse.json({ refusal: r.refusal }, { status: STATUS[r.refusal] });
  }

  return NextResponse.json({
    proposals: r.value.map((p) => ({
      id: p.id,
      form: p.interpretation.form,
      /* MAIA's own words about what she found. Her account, not a summary of
         it: a rewrite here would be the surface speaking in her voice. */
      account: p.interpretation.account,
      createdAt: p.createdAt,
      adoptedAt: p.adoptedAt,
      reviewRevision: p.reviewRevision,
    })),
  });
}
