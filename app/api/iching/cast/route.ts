export const dynamic = 'force-dynamic';

/**
 * POST /api/iching/cast — Cast the I Ching
 *
 * Performs a hexagram casting using the specified method.
 * Returns the primary hexagram, changing lines, and relating hexagram.
 * Does not require authentication — the oracle is available to all.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cast } from '@/lib/iching/casting';
import { getHexagram } from '@/lib/iching/lookup';
import type { CastingMethod } from '@/lib/iching/types';

const VALID_METHODS: CastingMethod[] = ['yarrow', 'coin'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const method: CastingMethod = VALID_METHODS.includes(body.method) ? body.method : 'yarrow';

    const result = cast(method);

    // Enrich with hexagram details
    const primary = getHexagram(result.hexagramNumber);
    const relating = result.relatingHexagramNumber
      ? getHexagram(result.relatingHexagramNumber)
      : null;

    return NextResponse.json({
      cast: {
        ...result,
        primaryHexagram: primary
          ? {
              number: primary.number,
              name: primary.name,
              english: primary.english,
              character: primary.character,
              judgment: primary.judgment,
              image: primary.image,
              element: primary.element,
              changeType: primary.changeType,
              lines: primary.lines.map(l => ({ position: l.position, isYang: l.isYang })),
            }
          : null,
        relatingHexagram: relating
          ? {
              number: relating.number,
              name: relating.name,
              english: relating.english,
              character: relating.character,
              judgment: relating.judgment,
              image: relating.image,
              element: relating.element,
              changeType: relating.changeType,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('[I Ching] Cast error:', error);
    return NextResponse.json({ error: 'Failed to cast hexagram' }, { status: 500 });
  }
}
