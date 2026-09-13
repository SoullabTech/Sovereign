/**
 * POST /api/writers-studio/revision-proposal/[id]/accept — THE WRITE BOUNDARY.
 *
 * ⭐⭐ THE FIRST PLACE IN THIS PROGRAMME WHERE THE MANUSCRIPT CHANGES.
 *
 * ── ⛔ THE ROUTE LAW ──────────────────────────────────────────────────────
 *
 * THE BROWSER DOES NOT SEND THE EDIT BACK. It sends an id in the path and
 * NOTHING in the body. Member identity comes from the authenticated session.
 * The server loads the durable proposal and owns every other fact:
 *
 *   member ownership · proposal state · target section · base version ·
 *   expected text · replacement · the acceptance transaction
 *
 * ⛔ WHY THIS IS NOT MERELY TIDY. If the client could supply
 * `proposalId + replacementText`, "accept this proposal" would quietly become
 * "write whatever this request says" — and every guarantee underneath would be
 * describing a change the member never saw.
 *
 * ⛔ SO THE BODY IS NOT READ AT ALL. Not parsed, not validated, not ignored
 * field-by-field. There is nothing for a field to arrive in.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { acceptRevision } from '@/lib/manuscript/revisionProposal/store';

export const dynamic = 'force-dynamic';

const enabled = () => process.env.WRITERS_STUDIO_WRITE_ENABLED === '1';

export async function POST(
  request: NextRequest, ctx: { params: Promise<{ id: string }> },
) {
  if (!enabled()) return new NextResponse(null, { status: 404 });

  /* ⭐ ONE IDENTITY TRUTH. Never from the body — there is no body. */
  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const outcome = await acceptRevision(identity.memberId, id);

  if (outcome.outcome === 'refused') {
    /* ⛔ An unknown proposal is a 404 — another member's is indistinguishable
       from one that does not exist. Everything else is a truthful 409: the
       member asked for something the Work can no longer receive. */
    const status = outcome.reason === 'proposal_unknown' ? 404 : 409;
    return NextResponse.json({ accepted: false, reason: outcome.reason }, { status });
  }

  return NextResponse.json({
    accepted: true,
    /* ⛔ STATUS ONLY. The changed prose is not echoed: the member reads their
       Work from the Work, never from the receipt for changing it. */
    resultingVersion: outcome.proposal.resultingVersion,
  });
}
