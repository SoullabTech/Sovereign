import { NextResponse } from 'next/server';
import {
  cabinContextSnapshot,
  initializeCabinContextMount,
} from '@/lib/cabin/contextRuntime';
import { cabinStore } from '@/lib/cabin/request';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (process.env.MAIA_CABIN_MODE !== 'offline') {
    return NextResponse.json({ error: 'not_cabin_runtime' }, { status: 404 });
  }

  const dataPath = process.env.MAIA_CABIN_DATA_PATH;
  if (!dataPath) {
    return NextResponse.json(
      { error: 'cabin_data_unavailable' },
      { status: 503 },
    );
  }

  try {
    const store = cabinStore();
    const cookie = request.headers.get('cookie') || '';
    const prefix = 'maia_cabin_session=';
    const match = cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));
    const token = match
      ? decodeURIComponent(match.slice(prefix.length))
      : null;

    if (!store.resolveSession(token)) {
      return NextResponse.json(
        { error: 'cabin_session_required' },
        { status: 401 },
      );
    }

    initializeCabinContextMount(dataPath);
    const context = cabinContextSnapshot(dataPath);

    return NextResponse.json({
      scope: 'member',
      context,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === 'CABIN_CONTEXT_PACKAGE_INVALID') {
      return NextResponse.json(
        { error: 'cabin_context_invalid' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: 'cabin_context_unavailable' },
      { status: 503 },
    );
  }
}
