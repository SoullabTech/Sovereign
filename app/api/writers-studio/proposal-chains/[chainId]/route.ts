/**
 * GET …/proposal-chains/[chainId] — the proposal-work read.
 *
 * ⭐⭐ ITS SUBJECT IS THE CHAIN AND ITS VERSIONS. ⛔ It never consults an
 * authorization, and it remains available when none exists, when one has gone
 * stale, and when one was already spent.
 *
 *     discussable  ≠  executable
 *
 * ⛔ SO THIS RESPONSE CARRIES NO EXECUTABILITY FIELD, in any spelling. A caller
 * that needs to know whether a permission can execute asks
 * `…/revision-authorizations/:id` — a different question with a different
 * subject. Merging them here is the R6 collapse, and the retired
 * `resolveProposalWork` is what it looked like.
 *
 * ⛔ READ-ONLY. Reading a proposal changes nothing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { readProposalWork } from '@/lib/manuscript/proposalChain/proposalWork';

export const dynamic = 'force-dynamic';
const enabled = () => process.env.WRITERS_STUDIO_WRITE_ENABLED === '1';

export async function GET(
  request: NextRequest, ctx: { params: Promise<{ chainId: string }> },
) {
  if (!enabled()) return new NextResponse(null, { status: 404 });

  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { chainId } = await ctx.params;
  /* ⭐ The focused version is a READING convenience and is named by the caller.
     ⛔ It is NOT an authorization shortcut: `authorizeVersion` has no default
     and must never acquire one from here. */
  const focus = request.nextUrl.searchParams.get('version') ?? undefined;
  const r = await readProposalWork(identity.memberId, chainId, focus);

  if (!r.ok) {
    if (r.reason === 'chain_unknown' || r.reason === 'version_unknown') {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.json({ reason: r.reason }, { status: 409 });
  }

  return NextResponse.json({
    chainId: r.work.chain.id,
    locus: r.work.chain.locus,
    ...(r.work.chain.governedBy ? { governedBy: r.work.chain.governedBy } : {}),
    versions: r.work.versions.map((v) => ({
      id: v.id, author: v.author, supersedes: v.supersedes,
      replacementText: v.replacementText,
      ...(v.rationale !== undefined ? { rationale: v.rationale } : {}),
      authoredAt: v.authoredAt,
    })),
    focusedVersionId: r.work.focused?.id ?? null,
  });
}
