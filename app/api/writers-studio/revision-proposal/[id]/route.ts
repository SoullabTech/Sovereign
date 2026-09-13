/**
 * GET /api/writers-studio/revision-proposal/[id] — the staged diff.
 *
 * ⛔ READ-ONLY. Rendering a proposal changes nothing. It returns what the stored
 * proposal names, against the Work state that proposal is bound to.
 *
 * ⛔ THE CLIENT SUPPLIES NOTHING BUT THE ID. Member identity comes from the
 * authenticated session; everything else — target, base version, expected text,
 * replacement — is read from the durable proposal on the server.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { previewProposal } from '@/lib/manuscript/revisionProposal/preview';

export const dynamic = 'force-dynamic';

const enabled = () => process.env.WRITERS_STUDIO_WRITE_ENABLED === '1';

export async function GET(
  request: NextRequest, ctx: { params: Promise<{ id: string }> },
) {
  /** ⛔ 404, not 403 — the surface does not exist until it is constituted. */
  if (!enabled()) return new NextResponse(null, { status: 404 });

  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const preview = await previewProposal(identity.memberId, id);
  if (preview.state === 'unknown') return new NextResponse(null, { status: 404 });
  return NextResponse.json(preview);
}
