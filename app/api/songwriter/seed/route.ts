export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { interpretSeed } from '@/lib/songwriter/seedInterpreter';
import type { SeedRequest, SeedResponse } from '@/lib/songwriter/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SeedRequest;

    if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    const content = body.content.trim();

    if (content.length < 5) {
      return NextResponse.json(
        { error: 'Tell me a little more — a feeling, a line, a memory.' },
        { status: 400 }
      );
    }

    const seed = await interpretSeed({
      content,
      vocalRange: body.vocalRange,
      playingStyle: body.playingStyle,
      mode: body.mode,
    });

    const response: SeedResponse = {
      seed,
      inputEcho: content,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[POST /api/songwriter/seed]', err);
    return NextResponse.json(
      { error: 'Something went wrong interpreting your input. Try again.' },
      { status: 500 }
    );
  }
}
