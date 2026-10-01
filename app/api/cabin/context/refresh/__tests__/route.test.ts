import { NextRequest } from 'next/server';

import { POST } from '../route';
import {
  cabinMemberFromRequest,
  cabinStore,
  setCabinSessionCookie,
} from '@/lib/cabin/request';
import {
  clearCabinContextMount,
  initializeCabinContextMount,
} from '@/lib/cabin/contextRuntime';

jest.mock('@/lib/cabin/request', () => ({
  cabinMemberFromRequest: jest.fn(),
  cabinStore: jest.fn(),
  setCabinSessionCookie: jest.fn(),
}));

jest.mock('@/lib/cabin/contextRuntime', () => ({
  clearCabinContextMount: jest.fn(),
  initializeCabinContextMount: jest.fn(),
}));

const store = cabinStore as jest.Mock;
const memberFromRequest = cabinMemberFromRequest as jest.Mock;
const setCookie = setCabinSessionCookie as jest.Mock;
const clear = clearCabinContextMount as jest.Mock;
const initialize = initializeCabinContextMount as jest.Mock;

function request(
  body = '',
  {
    origin = 'http://localhost:3000',
    suffix = '',
    sessionToken,
  }: {
    origin?: string | null;
    suffix?: string;
    sessionToken?: string;
  } = {},
) {
  const headers: Record<string, string> = {};
  if (origin !== null) headers.origin = origin;
  if (sessionToken) headers['x-session-token'] = sessionToken;

  return new NextRequest(
    `http://localhost:3000/api/cabin/context/refresh${suffix}`,
    {
      method: 'POST',
      headers,
      body: body || undefined,
    },
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.MAIA_CABIN_MODE = 'offline';
  process.env.MAIA_CABIN_DATA_PATH = '/tmp/maia-cabin/cabin.sqlite';

  store.mockReturnValue({ close: jest.fn() });
  memberFromRequest.mockReturnValue({
    member: { id: 'local-member' },
    issuedToken: null,
  });
  initialize.mockReturnValue({
    state: 'mounted',
    packagePath: '/tmp/maia-cabin/context-package.json',
  });
});

afterAll(() => {
  delete process.env.MAIA_CABIN_MODE;
  delete process.env.MAIA_CABIN_DATA_PATH;
});

describe('HOUSE-CABIN-CONTEXT-SPINE-01 · H3.9 Explicit Cabin Runtime Refresh', () => {
  it('F1 is local-only', async () => {
    process.env.MAIA_CABIN_MODE = 'connected';

    const response = await POST(request());

    expect(response.status).toBe(404);
    expect(store).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });

  it('F2 refuses cross-origin refresh before touching runtime state', async () => {
    const response = await POST(
      request('', { origin: 'https://foreign.example' }),
    );

    expect(response.status).toBe(403);
    expect(clear).not.toHaveBeenCalled();
    expect(initialize).not.toHaveBeenCalled();
  });

  it('F3 rejects query parameters', async () => {
    const response = await POST(
      request('', { suffix: '?path=/tmp/other.json' }),
    );

    expect(response.status).toBe(400);
    expect(clear).not.toHaveBeenCalled();
  });

  it('F3 rejects a request body', async () => {
    const response = await POST(request('{"refresh":true}'));

    expect(response.status).toBe(400);
    expect(clear).not.toHaveBeenCalled();
  });

  it('accepts the Next.js route context without treating it as dependency injection', async () => {
    const response = await POST(request(), { params: {} });

    expect(response.status).toBe(200);
    expect(clear).toHaveBeenCalledTimes(1);
    expect(initialize).toHaveBeenCalledWith('/tmp/maia-cabin/cabin.sqlite');
  });

  it('F4 refresh does not invoke the package writer', async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(clear).toHaveBeenCalledTimes(1);
    expect(initialize).toHaveBeenCalledWith(
      '/tmp/maia-cabin/cabin.sqlite',
    );
  });

  it('refresh clears the old ephemeral mount before initializing the new one', async () => {
    const order: string[] = [];
    clear.mockImplementation(() => order.push('clear'));
    initialize.mockImplementation(() => {
      order.push('initialize');
      return {
        state: 'mounted',
        packagePath: '/tmp/maia-cabin/context-package.json',
      };
    });

    await POST(request());

    expect(order).toEqual(['clear', 'initialize']);
  });

  it('F5 returns runtime state only, never package content', async () => {
    const response = await POST(request());
    const body = await response.json();

    expect(body).toEqual({
      refreshed: true,
      context: 'mounted',
    });
    expect(JSON.stringify(body)).not.toContain('Elemental Alchemy');
    expect(JSON.stringify(body)).not.toContain('memory');
  });

  it('missing artifact can truthfully refresh to empty context', async () => {
    initialize.mockReturnValue({
      state: 'empty',
      packagePath: '/tmp/maia-cabin/context-package.json',
    });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      refreshed: true,
      context: 'empty',
    });
  });

  it('F7 invalid artifact fails closed after clearing and does not expose details', async () => {
    initialize.mockImplementation(() => {
      throw new Error('CABIN_CONTEXT_PACKAGE_INVALID:private details');
    });

    const response = await POST(request());

    expect(response.status).toBe(503);
    const body = await response.text();
    expect(body).not.toContain('private details');
    expect(body).not.toContain('Elemental Alchemy');
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it('local store is closed after successful refresh', async () => {
    const close = jest.fn();
    store.mockReturnValue({ close });

    await POST(request());

    expect(close).toHaveBeenCalledTimes(1);
    expect(setCookie).toHaveBeenCalled();
  });

  it('local store is closed after failed refresh', async () => {
    const close = jest.fn();
    store.mockReturnValue({ close });
    initialize.mockImplementation(() => {
      throw new Error('invalid');
    });

    await POST(request());

    expect(close).toHaveBeenCalledTimes(1);
  });

  it('F8 source contains no writer, network, watcher, timer, or JARVIS seam', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const source = readFileSync(
      join(process.cwd(), 'app/api/cabin/context/refresh/route.ts'),
      'utf8',
    );

    expect(source).not.toMatch(/writeCabinContextPackage|writePackage/);
    expect(source).not.toMatch(/fetch\(|https?:\/\//);
    expect(source).not.toMatch(/setInterval|setTimeout|watch\(/);
    expect(source).not.toMatch(/ipcMain|ipcRenderer|jarvis:/);
    expect(source).not.toMatch(/console\.(log|info|debug|warn|error)\(/);
  });
});
