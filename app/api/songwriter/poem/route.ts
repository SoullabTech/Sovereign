export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { interpretPoem } from '@/lib/songwriter/poemInterpreter';
import type { PoemRequest, PoemResponse } from '@/lib/songwriter/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PoemRequest;

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

    const poem = await interpretPoem(content);

    const response: PoemResponse = {
      poem,
      inputEcho: content,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[POST /api/songwriter/poem]', err);
    return NextResponse.json(
      { error: 'Something went wrong interpreting your input. Try again.' },
      { status: 500 }
    );
  }
}
