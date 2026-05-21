/**
 * POST /api/psyche/portfolio/keep
 *
 * The formation event: the member chooses to keep material into the portfolio.
 *
 * Body shape: KeepGestureInput (memberId is overridden from auth).
 *
 * Per portfolio service discipline: this is a gesture, not a CRUD insert.
 * Material exists in the field; this endpoint records the act of keeping.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { keepSource } from '@/lib/psyche/portfolio';
import type {
  ElementalLens,
  KeepGestureInput,
  MemoryAtomSourceType,
  MemoryRegister,
} from '@/lib/psyche/types';

const VALID_SOURCE_TYPES = new Set<MemoryAtomSourceType>([
  'idea', 'idea_block', 'journal', 'dream', 'reflection',
  'decision', 'change', 'session_excerpt', 'spontaneous',
]);

const VALID_REGISTERS = new Set<MemoryRegister>([
  'episodic', 'thematic', 'developmental', 'archetypal',
  'relational', 'threshold', 'witnessed', 'sacred_protected',
]);

const VALID_LENSES = new Set<ElementalLens>([
  'fire', 'water', 'earth', 'air', 'aether',
]);

function validateInput(body: unknown): KeepGestureInput | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body required' };
  }
  const b = body as Record<string, unknown>;

  if (typeof b.sourceType !== 'string' || !VALID_SOURCE_TYPES.has(b.sourceType as MemoryAtomSourceType)) {
    return { error: 'Invalid or missing sourceType' };
  }
  if (typeof b.title !== 'string' || b.title.trim().length === 0) {
    return { error: 'title is required (non-empty string)' };
  }

  // Spontaneous needs body; sourced needs sourceId
  if (b.sourceType === 'spontaneous') {
    if (typeof b.body !== 'string' || b.body.trim().length === 0) {
      return { error: 'Spontaneous entries require a body' };
    }
  } else {
    if (typeof b.sourceId !== 'string' || b.sourceId.trim().length === 0) {
      return { error: `sourceId required for sourceType '${b.sourceType}'` };
    }
  }

  // Optional placements — validate if present
  if (b.primaryRegister !== undefined && b.primaryRegister !== null) {
    if (typeof b.primaryRegister !== 'string' || !VALID_REGISTERS.has(b.primaryRegister as MemoryRegister)) {
      return { error: 'Invalid primaryRegister' };
    }
  }
  if (b.registers !== undefined) {
    if (!Array.isArray(b.registers) || !b.registers.every(r => typeof r === 'string' && VALID_REGISTERS.has(r as MemoryRegister))) {
      return { error: 'Invalid registers array' };
    }
  }
  if (b.elementalLenses !== undefined) {
    if (!Array.isArray(b.elementalLenses) || !b.elementalLenses.every(l => typeof l === 'string' && VALID_LENSES.has(l as ElementalLens))) {
      return { error: 'Invalid elementalLenses array' };
    }
  }
  if (b.threadIds !== undefined) {
    if (!Array.isArray(b.threadIds) || !b.threadIds.every(t => typeof t === 'string')) {
      return { error: 'Invalid threadIds array' };
    }
  }

  return {
    memberId: '', // filled in by route
    sourceType: b.sourceType as MemoryAtomSourceType,
    sourceId: (b.sourceId as string) ?? null,
    title: (b.title as string).trim(),
    body: (b.body as string | null) ?? null,
    primaryRegister: b.primaryRegister as MemoryRegister | undefined,
    registers: b.registers as MemoryRegister[] | undefined,
    elementalLenses: b.elementalLenses as ElementalLens[] | undefined,
    threadIds: b.threadIds as string[] | undefined,
  };
}

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validated = validateInput(body);
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const atom = await keepSource(memberId, { ...validated, memberId });
    return NextResponse.json({ atom }, { status: 201 });
  } catch (err: any) {
    // 23505 = unique violation (already kept this source item)
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'This source item is already kept' }, { status: 409 });
    }
    console.error('[POST /api/psyche/portfolio/keep]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
