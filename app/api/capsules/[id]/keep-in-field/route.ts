export const dynamic = 'force-dynamic';

/**
 * POST /api/capsules/:id/keep-in-field — declare a capsule as a Field Object
 * GET  /api/capsules/:id/keep-in-field — has it already been declared?
 *
 * This is the member act ruled in
 * `docs/architecture/FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md`. It carries
 * no request body: the member is not describing an object, they are declaring
 * one, and everything the atom needs already lives on the capsule they just
 * reviewed. Sending different content here cannot change what gets kept.
 *
 * POST is idempotent — 201 on the declaration that created the Field Object,
 * 200 with the same atom on every repeat. A double-tap is not a conflict.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  declareCapsuleAsFieldObject,
  getCapsuleFieldObject,
} from '@/lib/psyche/declareFieldObject';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function authFailure(error: unknown): NextResponse | null {
  if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  return null;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await requireMemberId();
    const { id } = await params;

    const result = await declareCapsuleAsFieldObject(memberId, id);

    // Not found OR not this member's — the same answer either way, so the
    // route never confirms the existence of another member's capsule.
    if (!result) {
      return NextResponse.json({ error: 'Capsule not found' }, { status: 404 });
    }

    return NextResponse.json(
      { atom: result.atom, created: result.created },
      { status: result.created ? 201 : 200 },
    );
  } catch (error) {
    const unauthorized = authFailure(error);
    if (unauthorized) return unauthorized;

    console.error('[API] POST /api/capsules/:id/keep-in-field error:', error);
    return NextResponse.json({ error: 'Failed to keep this in your Field' }, { status: 500 });
  }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await requireMemberId();
    const { id } = await params;

    const atom = await getCapsuleFieldObject(memberId, id);
    return NextResponse.json({ atom, kept: atom !== null });
  } catch (error) {
    const unauthorized = authFailure(error);
    if (unauthorized) return unauthorized;

    console.error('[API] GET /api/capsules/:id/keep-in-field error:', error);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}
