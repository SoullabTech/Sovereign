/**
 * WS2-04B — GET the writing surface's resolved state.
 *
 * ONE INDIVISIBLE SNAPSHOT. The client never fetches "state" and "sections"
 * separately and works out how they combine: a browser that can hold sections
 * for a draft the server considers continuous will eventually render a section
 * list for one, and offer navigation into rows that are not the writing
 * authority. Whether a draft is continuous, section-addressable, or
 * non-addressable is the server's to say, and it says it once.
 *
 * Rows carry manuscript_draft_sections ids ONLY. The Source identity never
 * crosses this boundary — the browser has no use for it and every use of it
 * would be a bug (see lib/writersStudio/outlineRows.ts).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { resolveDraftWriteState } from '@/lib/manuscript/sections/saveSection';
import { navigableRows } from '@/lib/writersStudio/outlineRows';
import { resolveProposalWork } from '@/lib/manuscript/revisionProposal/proposalWork';
import {
  authorityFromProjectability,
  type SectionAuthority,
} from '@/lib/writersStudio/sectionAuthority';
import {
  sectionNavigationCopy,
  NAVIGATION_NOT_ACTIVE,
} from '@/lib/writersStudio/sectionNavigationCopy';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const state = await resolveDraftWriteState(id, memberId);

  switch (state.kind) {
    case 'no_draft':
      return NextResponse.json({ mode: 'no_draft' }, { status: 404 });

    case 'indeterminate':
      /* 503, not 200: the client must fail closed and mount no writer. A 200
         with any mode would be a claim about a draft we could not read. */
      return NextResponse.json({ mode: 'indeterminate' }, { status: 503 });

    case 'section_aware': {
      /* ⛔ PW-2 · THE PROPOSAL PARAMETER IS A SELECTOR, NOT AN ASSERTION.
         Everything it implies — ownership, target, range, whether the proposal
         is still live — is resolved server-side against this authenticated
         member. A browser that names a proposal it does not own, or one that
         can no longer be accepted, gets the ordinary section state back and is
         told nothing about why. */
      const target = await resolveProposalWork(
        memberId, req.nextUrl.searchParams.get('proposal'));

      /* ⭐ PW-3 · SUSPENSION IS SCOPED TO THE TARGET. Every other section keeps
         exactly the authority it already had. The boundary is never wider than
         the member's actual proposal.
         ⭐ PW-5 · AND THE REASON IS EXPLICIT. `editable` is a fact about
         PROJECTABILITY and stays one; the authority is resolved beside it, so
         the room never renders "cannot be edited" over a section the writer is
         actively working. */
      const authorityOf = (s: { id: string; editable: boolean }): SectionAuthority =>
        target && target.sectionId === s.id
          ? 'proposal_work'
          : authorityFromProjectability(s.editable);

      return NextResponse.json({
        mode: target ? 'proposal_work' : 'section_aware',
        version: state.version,
        /* Draft-section identity, and the resolved authority the UI renders so
           it never offers a gesture the server would refuse. */
        rows: navigableRows(state.sections),
        sections: state.sections.map((s) => ({
          id: s.id, position: s.position, heading: s.heading,
          body: s.body, authority: authorityOf(s),
        })),
        ...(target ? { target } : {}),
      });
    }

    case 'continuous':
      /* Convertible, simply not converted yet. Almost nothing to say — there is
         no problem to explain, and this state disappears at activation. */
      return NextResponse.json({
        mode: 'continuous',
        version: state.version,
        content: state.content,
        notice: NAVIGATION_NOT_ACTIVE,
      });

    case 'continuous_unprovable':
      /* The reason is a classification. It is mapped HERE and never sent: a
         client that receives EDITED or NO_SOURCE can render it. */
      return NextResponse.json({
        mode: 'continuous_unprovable',
        version: state.version,
        content: state.content,
        notice: sectionNavigationCopy(state.reason),
      });
  }
}
