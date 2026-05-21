/**
 * POST /api/psyche/portfolio/atoms/[id]/gesture
 *
 * Apply a member gesture to an existing kept atom.
 *
 * Body shape: { gesture: AtomGesture }
 *
 * AtomGesture is a discriminated union — each gesture has a 'kind' field
 * and possibly additional fields depending on kind. This is the ONLY
 * mutation surface for kept atoms (besides POST /keep for creation).
 *
 * There is no PATCH endpoint and no generic update body. The shape of
 * mutation is constrained to named gestures by design.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { applyAtomGesture } from '@/lib/psyche/portfolio';
import type {
  AtomGesture,
  ElementalLens,
  MemoryRegister,
  ReturnPreference,
} from '@/lib/psyche/types';

const VALID_REGISTERS = new Set<MemoryRegister>([
  'episodic', 'thematic', 'developmental', 'archetypal',
  'relational', 'threshold', 'witnessed', 'sacred_protected',
]);

const VALID_LENSES = new Set<ElementalLens>([
  'fire', 'water', 'earth', 'air', 'aether',
]);

const VALID_RETURN_PREFERENCES = new Set<ReturnPreference>([
  'member_pulled', 'contextual_doorway', 'ritual_review_opt_in',
]);

const SIMPLE_GESTURES = new Set([
  'mark_still_alive',
  'set_aside',
  'protect',
  'archive',
  'return_to_active',
  'touch',
]);

function validateGesture(g: unknown): AtomGesture | { error: string } {
  if (!g || typeof g !== 'object') {
    return { error: 'gesture must be an object' };
  }
  const gesture = g as Record<string, unknown>;
  const kind = gesture.kind;
  if (typeof kind !== 'string') {
    return { error: 'gesture.kind required' };
  }

  if (SIMPLE_GESTURES.has(kind)) {
    return { kind } as AtomGesture;
  }

  switch (kind) {
    case 'replace_primary_register': {
      const register = gesture.register;
      if (register === null) {
        return { kind, register: null };
      }
      if (typeof register !== 'string' || !VALID_REGISTERS.has(register as MemoryRegister)) {
        return { error: 'replace_primary_register requires valid register or null' };
      }
      return { kind, register: register as MemoryRegister };
    }

    case 'add_register':
    case 'remove_register': {
      const register = gesture.register;
      if (typeof register !== 'string' || !VALID_REGISTERS.has(register as MemoryRegister)) {
        return { error: `${kind} requires valid register` };
      }
      return { kind, register: register as MemoryRegister } as AtomGesture;
    }

    case 'add_lens':
    case 'remove_lens': {
      const lens = gesture.lens;
      if (typeof lens !== 'string' || !VALID_LENSES.has(lens as ElementalLens)) {
        return { error: `${kind} requires valid lens` };
      }
      return { kind, lens: lens as ElementalLens } as AtomGesture;
    }

    case 'add_thread':
    case 'remove_thread': {
      const threadId = gesture.threadId;
      if (typeof threadId !== 'string' || threadId.trim().length === 0) {
        return { error: `${kind} requires threadId` };
      }
      return { kind, threadId } as AtomGesture;
    }

    case 'set_return_preference': {
      const preference = gesture.preference;
      if (typeof preference !== 'string' || !VALID_RETURN_PREFERENCES.has(preference as ReturnPreference)) {
        return { error: 'set_return_preference requires valid preference' };
      }
      return { kind, preference: preference as ReturnPreference };
    }

    default:
      return { error: `Unknown gesture kind: ${kind}` };
  }
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

  if (!body || typeof body !== 'object' || !('gesture' in body)) {
    return NextResponse.json({ error: 'Body must contain { gesture: AtomGesture }' }, { status: 400 });
  }

  const validated = validateGesture((body as { gesture: unknown }).gesture);
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const atom = await applyAtomGesture(memberId, atomId, validated);
    return NextResponse.json({ atom });
  } catch (err: any) {
    if (err?.message?.includes('atom not found')) {
      return NextResponse.json({ error: 'Atom not found' }, { status: 404 });
    }
    // 23514 = CHECK constraint violation (e.g., sacred_protected register requires protected status)
    if (err?.code === '23514') {
      return NextResponse.json({
        error: 'Gesture violates an atom invariant. Sacred-protected atoms must remain protected; remove the register first if you wish to change status.',
      }, { status: 409 });
    }
    console.error('[POST /api/psyche/portfolio/atoms/[id]/gesture]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
