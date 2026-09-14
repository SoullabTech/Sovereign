/**
 * POST …/proposal-chains/[chainId]/versions/[versionId]/authorize
 *
 * ⭐⭐ THE MEMBER'S AUTHORIZING ACT, AND THE PATH IS THE POINT.
 *
 * ⛔ THE ROUTE IDENTITIES ARE SEPARATE SO ONE AMBIGUOUS `id` CANNOT MEAN THREE
 * THINGS depending on which handler received it. The retired
 * `revision-proposal/[id]/accept` took a single id that was, by then, an
 * authorization-shaped proposal — and the ambiguity is precisely what let
 * wording and permission live on one row.
 *
 *     …/proposal-chains/:chainId/versions/:versionId/authorize   a member act
 *     …/revision-authorizations/:authorizationId/execute         spending it
 *     …/proposal-chains/:chainId                                 discussing it
 *
 * ⛔ THE BODY IS NOT READ AT ALL. Not parsed, not validated, not ignored
 * field-by-field — there is nothing for a field to arrive in. If the client
 * could supply `expectedText` or `baseVersion`, "authorize this version" would
 * quietly become "authorize whatever this request says", and the server's Work
 * read would be proving something about a fabricated state.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { authorizeVersion } from '@/lib/manuscript/revisionAuthorization/store';

export const dynamic = 'force-dynamic';
const enabled = () => process.env.WRITERS_STUDIO_WRITE_ENABLED === '1';

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ chainId: string; versionId: string }> },
) {
  /** ⛔ 404, not 403 — the surface does not exist until it is constituted. */
  if (!enabled()) return new NextResponse(null, { status: 404 });

  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { chainId, versionId } = await ctx.params;
  const r = await authorizeVersion(identity.memberId, chainId, versionId);

  if (!r.ok) {
    /* ⛔ An unknown chain is a 404 — another member's is indistinguishable from
       one that does not exist. Everything else is a truthful 409: the member
       asked for something the Work can no longer receive. */
    const status = r.reason === 'chain_unknown' || r.reason === 'version_unknown' ? 404 : 409;
    return NextResponse.json({ authorized: false, reason: r.reason }, { status });
  }

  /* ⛔ THE AUTHORIZATION'S ID AND ITS BINDING — no wording is echoed. The member
     reads their Work from the Work, and the formulation from the version. */
  return NextResponse.json({
    authorized: true,
    authorizationId: r.authorization.id,
    authorizedAt: r.authorization.authorizedAt,
    binding: r.authorization.guard,
  }, { status: 201 });
}
