import { NextResponse } from 'next/server';
import { initializeCabinContextMount } from '@/lib/cabin/contextRuntime';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.MAIA_CABIN_MODE !== 'offline') {
    return NextResponse.json({ error: 'not_cabin_runtime' }, { status: 404 });
  }

  try {
    const dataPath = process.env.MAIA_CABIN_DATA_PATH;
    if (!dataPath) {
      return NextResponse.json(
        { error: 'cabin_data_unavailable' },
        { status: 503 },
      );
    }

    const context = initializeCabinContextMount(dataPath);

    return NextResponse.json({
      status: 'ready',
      mode: 'offline',
      build: process.env.NEXT_PUBLIC_BUILD_SHA || 'UNSTAMPED',
      context: context.state,
    });
  } catch (error) {
    console.error(
      '[Cabin health] context custody failed:',
      error instanceof Error ? error.message : String(error),
    );

    return NextResponse.json(
      { error: 'cabin_context_unavailable' },
      { status: 503 },
    );
  }
}
