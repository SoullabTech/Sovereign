/**
 * GET  /api/psyche/portfolio/atoms/[id]/lens-passes
 * POST /api/psyche/portfolio/atoms/[id]/lens-passes
 *
 * Lens passes for a kept atom.
 *
 * GET returns the history of lens passes against this atom (the practice).
 * POST records a new lens pass — the member encountered the atom through
 *      a lens and produced a response.
 *
 * The lens is an ACTION. The pass is the record of the encounter.
 * The member is NEVER stored as a lens-type by this endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { createLensPass, listLensPasses } from '@/lib/psyche/portfolio';
import type { ElementalLens, LensPassInput } from '@/lib/psyche/types';

const VALID_LENSES = new Set<ElementalLens>([
  'fire', 'water', 'earth', 'air', 'aether',
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id: atomId } = await params;
  if (!atomId) {
    return NextResponse.json({ error: 'Atom id required' }, { status: 400 });
  }

  try {
    const passes = await listLensPasses(memberId, atomId);
    return NextResponse.json({ passes });
  } catch (err) {
    console.error('[GET /api/psyche/portfolio/atoms/[id]/lens-passes]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function validateInput(body: unknown, atomId: string): LensPassInput | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body required' };
  }
  const b = body as Record<string, unknown>;

  if (typeof b.lens !== 'string' || !VALID_LENSES.has(b.lens as ElementalLens)) {
    return { error: 'lens required (fire | water | earth | air | aether)' };
  }
  if (typeof b.prompt !== 'string' || b.prompt.trim().length === 0) {
    return { error: 'prompt required' };
  }
  if (typeof b.memberResponse !== 'string' || b.memberResponse.trim().length === 0) {
    return { error: 'memberResponse required' };
  }

  return {
    memberId: '',          // filled by route
    memoryAtomId: atomId,
    lens: b.lens as ElementalLens,
    prompt: (b.prompt as string).trim(),
    memberResponse: (b.memberResponse as string).trim(),
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id: atomId } = await params;
  if (!atomId) {
    return NextResponse.json({ error: 'Atom id required' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validated = validateInput(body, atomId);
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const pass = await createLensPass(memberId, { ...validated, memberId });
    return NextResponse.json({ pass }, { status: 201 });
  } catch (err: any) {
    if (err?.message?.includes('not found')) {
      return NextResponse.json({ error: 'Atom not found' }, { status: 404 });
    }
    console.error('[POST /api/psyche/portfolio/atoms/[id]/lens-passes]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
