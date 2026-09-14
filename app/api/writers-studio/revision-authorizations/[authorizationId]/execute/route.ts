/**
 * POST …/revision-authorizations/[authorizationId]/execute — THE WRITE BOUNDARY.
 *
 * ⭐⭐ THIS AUTHORIZES NOTHING. The member's act already happened and is a
 * durable row; this spends it. ⛔ There is no `execution_authority` question
 * anywhere in the path — the existence of the authorization IS the permission.
 *
 * ⛔ THE BROWSER SENDS AN ID IN THE PATH AND NOTHING IN THE BODY. Member
 * identity comes from the session; every other fact comes from the stored row.
 * If the client could supply `proposalVersionId` or `replacementText`, "execute
 * this authorization" would become "write whatever this request says".
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { executeAuthorization } from '@/lib/manuscript/revisionAuthorization/execute';

export const dynamic = 'force-dynamic';
const enabled = () => process.env.WRITERS_STUDIO_WRITE_ENABLED === '1';

export async function POST(
  request: NextRequest, ctx: { params: Promise<{ authorizationId: string }> },
) {
  if (!enabled()) return new NextResponse(null, { status: 404 });

  /* ⭐ ONE IDENTITY TRUTH. Never from the body — there is no body. */
  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { authorizationId } = await ctx.params;
  const outcome = await executeAuthorization(identity.memberId, authorizationId);

  if (outcome.outcome === 'refused') {
    const status = outcome.reason === 'authorization_unknown' ? 404 : 409;
    return NextResponse.json({ executed: false, reason: outcome.reason }, { status });
  }

  /* ⛔ STATUS ONLY. The changed prose is not echoed: the member reads their Work
     from the Work, never from the receipt for changing it. */
  return NextResponse.json({
    executed: true,
    resultingVersion: outcome.authorization.resultingVersion,
  });
}
