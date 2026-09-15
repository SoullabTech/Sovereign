/**
 * POST …/proposal-chains/[chainId]/versions — author one successor wording.
 *
 * This is the member-authoring door for the editorial workspace. The client
 * states the exact predecessor it revised; the store decides whether that
 * authored relationship is still lawful. ⛔ The server never invents
 * `supersedes`, and the client never supplies `author`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { appendAuthoredVersion } from '@/lib/manuscript/proposalChain/store';

export const dynamic = 'force-dynamic';
const enabled = () => process.env.WRITERS_STUDIO_WRITE_ENABLED === '1';

interface MemberVersionBody {
  supersedes: string;
  replacementText: string;
  rationale?: string;
}

function parseBody(value: unknown): MemberVersionBody | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.supersedes !== 'string' || v.supersedes.length === 0) return null;
  if (typeof v.replacementText !== 'string') return null;
  if (v.rationale !== undefined && typeof v.rationale !== 'string') return null;
  const rationale = typeof v.rationale === 'string' ? v.rationale.trim() : '';
  return { supersedes: v.supersedes, replacementText: v.replacementText,
    ...(rationale ? { rationale } : {}) };
}
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ chainId: string }> },
) {
  if (!enabled()) return new NextResponse(null, { status: 404 });

  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const input = parseBody(await request.json().catch(() => null));
  if (!input) {
    return NextResponse.json({ appended: false, reason: 'invalid_request' }, { status: 400 });
  }

  const { chainId } = await ctx.params;
  const result = await appendAuthoredVersion(identity.memberId, chainId, {
    supersedes: input.supersedes,
    author: 'member',
    replacementText: input.replacementText,
    ...(input.rationale ? { rationale: input.rationale } : {}),
  });

  if (result.outcome === 'refused') {
    const status = result.reason === 'chain_unknown' ? 404 : 409;
    return NextResponse.json({ appended: false, reason: result.reason }, { status });
  }

  const v = result.version;
  return NextResponse.json({ appended: true, version: {
    id: v.id, author: v.author, supersedes: v.supersedes,
    replacementText: v.replacementText,
    ...(v.rationale !== undefined ? { rationale: v.rationale } : {}),
    authoredAt: v.authoredAt,
  } }, { status: 201 });
}
