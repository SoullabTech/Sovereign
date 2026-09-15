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
import { query } from '@/lib/db/postgres';
/* ⭐⭐ THE MEMBER'S OWN CONVERSION DOOR, imported as the AUTHORITY ON WHETHER
   THE ACT MAY BE OFFERED — not re-implemented here.

   `POST /draft { convert: true }` runs exactly this function. Any second
   predicate, however carefully written, would be a copy that can drift; the
   defect this repairs is precisely a gate aligned with a DIFFERENT
   implementation (`sections/convertDraft.ts`) that the member's button never
   calls. ⛔ So the answer is taken from the door, and nothing infers it. */
import {
  planConversion as planMemberConversion,
  type SourceSection,
} from '@/lib/manuscript/draftSections';
import { navigableRows } from '@/lib/writersStudio/outlineRows';
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

    case 'section_aware':
      return NextResponse.json({
        mode: 'section_aware',
        version: state.version,
        /* Draft-section identity, and the editable flag the UI needs so it
           never offers a gesture the server would refuse. */
        rows: navigableRows(state.sections),
        sections: state.sections.map((s) => ({
          id: s.id, position: s.position, heading: s.heading,
          body: s.body, editable: s.editable,
        })),
      });

    case 'continuous': {
      /* ⭐ CLASSIFICATION AND OFFERABILITY ARE DIFFERENT FACTS, and they are
         computed by different things on purpose:

           what kind of draft is this?     resolveDraftWriteState  (above)
           can the member's door succeed?  planConversion          (here)

         ⚠️ `continuous` means the draft is convertible IN PRINCIPLE — it matches
         a named composer, or its boundaries all resolve. The member's door is
         stricter: it admits only byte-identity with the CURRENT composer. A
         draft composed by the LEGACY `# ` composer is classified `continuous`
         and refused by that door, which is a historical manuscript population
         and not an edge case.

         ⛔ Neither predicate is widened to agree with the other. The taxonomy
         stays descriptive and the door stays strict; what changes is that the
         surface now asks the door. */
      const src = await query<SourceSection>(
        `SELECT id, heading, body FROM manuscript_sections
          WHERE manuscript_id = $1 ORDER BY position ASC`, [id]);
      const plan = planMemberConversion(state.content, src.rows);
      return NextResponse.json({
        mode: 'continuous',
        version: state.version,
        content: state.content,
        notice: NAVIGATION_NOT_ACTIVE,
        /* ⛔ A BOOLEAN, NOT THE REFUSAL. The refusal words are instrumentation
           ("boundary_confirmation_required"), and this lane's own rule is that
           they stay off the screen. The surface needs to know WHETHER, not WHY. */
        conversionOfferable: plan.status !== 'refused',
      });
    }

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
