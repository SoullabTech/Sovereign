import { NextRequest, NextResponse } from 'next/server';

import {
  clearCabinContextMount,
  initializeCabinContextMount,
} from '@/lib/cabin/contextRuntime';
import {
  cabinMemberFromRequest,
  cabinStore,
  setCabinSessionCookie,
} from '@/lib/cabin/request';

export const dynamic = 'force-dynamic';

const privacyHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  Vary: 'Cookie, x-session-token, Origin',
};

function reply(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: privacyHeaders });
}

function isSameOrigin(request: NextRequest, origin: string): boolean {
  try {
    const source = new URL(origin);
    const host = request.headers.get('host') || request.nextUrl.host;
    const protocol =
      request.headers.get('x-forwarded-proto')?.split(',')[0].trim() ||
      request.nextUrl.protocol.replace(':', '');

    return (
      source.origin === origin &&
      source.host === host &&
      ['http:', 'https:'].includes(source.protocol) &&
      source.protocol === `${protocol}:`
    );
  } catch {
    return false;
  }
}

export type CabinContextRefreshDeps = {
  clear: typeof clearCabinContextMount;
  initialize: typeof initializeCabinContextMount;
};

const productionDeps: CabinContextRefreshDeps = {
  clear: clearCabinContextMount,
  initialize: initializeCabinContextMount,
};

function isRefreshDeps(value: unknown): value is CabinContextRefreshDeps {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.clear === 'function' &&
    typeof candidate.initialize === 'function'
  );
}

async function handlePost(
  request: NextRequest,
  deps: CabinContextRefreshDeps,
): Promise<Response> {
  if (process.env.MAIA_CABIN_MODE !== 'offline') {
    return reply({ error: 'local_refresh_requires_offline_cabin' }, 404);
  }

  if (request.nextUrl.search) {
    return reply(
      { error: 'Unexpected parameters.', code: 'UNEXPECTED_PARAMETERS' },
      400,
    );
  }

  const origin = request.headers.get('origin');
  if (
    (origin && !isSameOrigin(request, origin)) ||
    (!origin && !request.headers.get('x-session-token'))
  ) {
    return reply(
      { error: 'Open your Cabin and try again.', code: 'ORIGIN_REQUIRED' },
      403,
    );
  }

  const body = await request.text();
  if (body.trim()) {
    return reply(
      { error: 'Refresh does not accept a request body.', code: 'BODY_NOT_ALLOWED' },
      400,
    );
  }

  const dataPath = process.env.MAIA_CABIN_DATA_PATH;
  if (!dataPath) {
    return reply(
      { error: 'Cabin local storage is unavailable.', code: 'CABIN_DATA_UNAVAILABLE' },
      503,
    );
  }

  const store = cabinStore();

  try {
    const { issuedToken } = cabinMemberFromRequest(store, request);

    deps.clear();
    const runtime = deps.initialize(dataPath);

    const response = reply({
      refreshed: true,
      context: runtime.state,
    });
    setCabinSessionCookie(response, issuedToken);
    return response;
  } catch {
    return reply(
      {
        error: 'Cabin context could not be refreshed.',
        code: 'CABIN_CONTEXT_REFRESH_FAILED',
      },
      503,
    );
  } finally {
    store.close();
  }
}

export async function POST(
  request: NextRequest,
  context?: unknown,
): Promise<Response> {
  const deps = isRefreshDeps(context) ? context : productionDeps;
  return handlePost(request, deps);
}
