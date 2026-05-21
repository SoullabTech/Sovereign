/**
 * GET /api/psyche/portfolio/atoms
 *
 * List the member's kept atoms, filtered by a member-controlled view.
 *
 * Query parameters describe the PortfolioView:
 *   ?view=chronological
 *   ?view=still_alive | set_aside | protected | archived
 *   ?view=by_source&sourceType=idea
 *   ?view=by_register&register=thematic
 *   ?view=by_lens&lens=fire
 *   ?view=by_thread&threadId=<uuid>
 *
 * Default: chronological.
 *
 * Per portfolio service discipline: reads may query, writes must gesture.
 * This route has NO PATCH and NO body-driven mutation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listAtoms } from '@/lib/psyche/portfolio';
import type {
  ElementalLens,
  MemoryAtomSourceType,
  MemoryRegister,
  PortfolioView,
} from '@/lib/psyche/types';

const VALID_VIEW_KINDS = new Set([
  'chronological',
  'still_alive',
  'set_aside',
  'protected',
  'archived',
  'by_source',
  'by_register',
  'by_lens',
  'by_thread',
]);

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

function parseView(searchParams: URLSearchParams): PortfolioView | { error: string } {
  const kind = searchParams.get('view') ?? 'chronological';
  if (!VALID_VIEW_KINDS.has(kind)) {
    return { error: `Invalid view: ${kind}` };
  }

  switch (kind) {
    case 'chronological':
    case 'still_alive':
    case 'set_aside':
    case 'protected':
    case 'archived':
      return { kind } as PortfolioView;

    case 'by_source': {
      const sourceType = searchParams.get('sourceType');
      if (!sourceType || !VALID_SOURCE_TYPES.has(sourceType as MemoryAtomSourceType)) {
        return { error: 'by_source requires valid sourceType' };
      }
      return { kind: 'by_source', sourceType: sourceType as MemoryAtomSourceType };
    }

    case 'by_register': {
      const register = searchParams.get('register');
      if (!register || !VALID_REGISTERS.has(register as MemoryRegister)) {
        return { error: 'by_register requires valid register' };
      }
      return { kind: 'by_register', register: register as MemoryRegister };
    }

    case 'by_lens': {
      const lens = searchParams.get('lens');
      if (!lens || !VALID_LENSES.has(lens as ElementalLens)) {
        return { error: 'by_lens requires valid lens' };
      }
      return { kind: 'by_lens', lens: lens as ElementalLens };
    }

    case 'by_thread': {
      const threadId = searchParams.get('threadId');
      if (!threadId) {
        return { error: 'by_thread requires threadId' };
      }
      return { kind: 'by_thread', threadId };
    }

    default:
      return { error: `Unhandled view kind: ${kind}` };
  }
}

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const view = parseView(request.nextUrl.searchParams);
  if ('error' in view) {
    return NextResponse.json({ error: view.error }, { status: 400 });
  }

  try {
    const atoms = await listAtoms(memberId, view);
    return NextResponse.json({ atoms });
  } catch (err) {
    console.error('[GET /api/psyche/portfolio/atoms]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
