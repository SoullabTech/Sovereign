/**
 * GET …/revision-authorizations/[authorizationId] — execution status.
 *
 * ⭐ It answers exactly one question: can this permission execute right now?
 * ⛔ It says nothing about whether the proposal is still worth discussing.
 *
 * ⭐⭐ CS-3's successor: `readAuthorizationStatus` consumes the SAME Work-fit law
 * the execution seam consumes, so this surface cannot advertise executable
 * where execution would refuse.
 *
 * ⛔ AN ABSENT AUTHORIZATION IS A 404, not a status. There is no
 * `inspection_only`, no `authorizationEnabled: false`, and no other spelling of
 * a not-yet-authorized state — the absence of the record IS that state.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { readAuthorizationStatus } from '@/lib/manuscript/revisionAuthorization/status';

export const dynamic = 'force-dynamic';
const enabled = () => process.env.WRITERS_STUDIO_WRITE_ENABLED === '1';

export async function GET(
  request: NextRequest, ctx: { params: Promise<{ authorizationId: string }> },
) {
  if (!enabled()) return new NextResponse(null, { status: 404 });

  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { authorizationId } = await ctx.params;
  const status = await readAuthorizationStatus(identity.memberId, authorizationId);
  /* ⛔ Unknown and another member's are the same 404. */
  if (!status) return new NextResponse(null, { status: 404 });

  return NextResponse.json({
    authorizationId: status.authorization.id,
    proposalChainId: status.authorization.proposalChainId,
    proposalVersionId: status.authorization.proposalVersionId,
    state: status.state,
    ...(status.state === 'no_longer_fits' ? { reason: status.reason } : {}),
    ...(status.state === 'spent' ? { resultingVersion: status.resultingVersion } : {}),
  });
}
