export const dynamic = 'force-dynamic';

/**
 * GET /api/iching/hexagram/[number] — Get hexagram details
 *
 * Returns full hexagram data including judgment, image, lines, and metadata.
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getHexagram } from '@/lib/iching/lookup';
import { getTrigram } from '@/lib/iching/trigrams';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number: numStr } = await params;
    const number = parseInt(numStr, 10);

    if (isNaN(number) || number < 1 || number > 64) {
      return NextResponse.json({ error: 'Hexagram number must be between 1 and 64' }, { status: 400 });
    }

    const hexagram = getHexagram(number);
    if (!hexagram) {
      return NextResponse.json({ error: 'Hexagram not found' }, { status: 404 });
    }

    const upperTrigram = getTrigram(hexagram.upperTrigram);
    const lowerTrigram = getTrigram(hexagram.lowerTrigram);

    return NextResponse.json({
      hexagram: {
        ...hexagram,
        upperTrigramDetail: upperTrigram || null,
        lowerTrigramDetail: lowerTrigram || null,
      },
    });
  } catch (error) {
    console.error('[I Ching] Hexagram lookup error:', error);
    return NextResponse.json({ error: 'Failed to get hexagram' }, { status: 500 });
  }
}
