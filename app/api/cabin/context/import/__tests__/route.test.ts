import { File } from 'node:buffer';
import { NextRequest } from 'next/server';

import { buildCabinContextPackage, serializeCabinContextPackage } from '@/lib/cabin/contextPackage';
import { writeCabinContextPackage } from '@/lib/cabin/contextPackageWriter';
import { POST } from '../route';
import { cabinMemberFromRequest, cabinStore, setCabinSessionCookie } from '@/lib/cabin/request';

jest.mock('@/lib/cabin/request', () => ({
  cabinMemberFromRequest: jest.fn(),
  cabinStore: jest.fn(),
  setCabinSessionCookie: jest.fn(),
}));

jest.mock('@/lib/cabin/contextPackageWriter', () => ({
  writeCabinContextPackage: jest.fn(),
}));

const DATA_PATH = '/tmp/maia-cabin-import-test/cabin.sqlite';
const PACKAGE = buildCabinContextPackage();

function requestWithFile(
  filename = 'context-package.json',
  content = serializeCabinContextPackage(PACKAGE!),
  headers: Record<string, string> = {
    origin: 'http://localhost:3000',
  },
): NextRequest {
  const form = new FormData();
  form.append(
    'context-package',
    new File([content], filename, { type: 'application/json' }),
  );

  return new NextRequest('http://localhost:3000/api/cabin/context/import', {
    method: 'POST',
    headers,
    body: form,
  });
}

function requestWithFields(fields: Record<string, Blob | string>): NextRequest {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }

  return new NextRequest('http://localhost:3000/api/cabin/context/import', {
    method: 'POST',
    headers: { origin: 'http://localhost:3000' },
    body: form,
  });
}

function deps() {
  return {
    writePackage: jest.fn().mockReturnValue({
      packagePath: '/tmp/maia-cabin-import-test/context-package.json',
      bytes: 123,
      package: PACKAGE,
    }),
  };
}

describe('HOUSE-CABIN-CONTEXT-SPINE-01 · H3.8 Explicit Local Placement', () => {
  const originalMode = process.env.MAIA_CABIN_MODE;
  const originalDataPath = process.env.MAIA_CABIN_DATA_PATH;

  beforeEach(() => {
    process.env.MAIA_CABIN_MODE = 'offline';
    process.env.MAIA_CABIN_DATA_PATH = DATA_PATH;
    jest.clearAllMocks();

    (cabinStore as jest.Mock).mockReturnValue({
      close: jest.fn(),
    });
    (cabinMemberFromRequest as jest.Mock).mockReturnValue({
      member: { id: 'local-member' },
      issuedToken: null,
    });
  });

  afterAll(() => {
    if (originalMode === undefined) delete process.env.MAIA_CABIN_MODE;
    else process.env.MAIA_CABIN_MODE = originalMode;

    if (originalDataPath === undefined) delete process.env.MAIA_CABIN_DATA_PATH;
    else process.env.MAIA_CABIN_DATA_PATH = originalDataPath;
  });

  it('accepts the Next.js route context without treating it as dependency injection', async () => {
    (writeCabinContextPackage as jest.Mock).mockReturnValue({
      packagePath: '/tmp/maia-cabin-import-test/context-package.json',
      bytes: 123,
      package: PACKAGE,
    });

    const res = await POST(requestWithFile(), { params: {} });

    expect(res.status).toBe(200);
    expect(writeCabinContextPackage).toHaveBeenCalled();
  });

  it('F1 is local-only: connected mode refuses placement', async () => {
    process.env.MAIA_CABIN_MODE = 'connected';
    const d = deps();

    const res = await POST(requestWithFile(), d);

    expect(res.status).toBe(404);
    expect(d.writePackage).not.toHaveBeenCalled();
  });

  it('F2 requires same-origin or an explicit session token', async () => {
    const d = deps();

    const req = requestWithFile('context-package.json', serializeCabinContextPackage(PACKAGE!), {
      origin: 'https://evil.example',
    });

    const res = await POST(req, d);

    expect(res.status).toBe(403);
    expect(d.writePackage).not.toHaveBeenCalled();
  });

  it('F3 rejects arbitrary destination paths and query parameters', async () => {
    const d = deps();

    const req = new NextRequest(
      'http://localhost:3000/api/cabin/context/import?path=/tmp/evil.json',
      {
        method: 'POST',
        headers: { origin: 'http://localhost:3000' },
        body: new FormData(),
      },
    );

    const res = await POST(req, d);

    expect(res.status).toBe(400);
    expect(d.writePackage).not.toHaveBeenCalled();
  });

  it('F4 requires exactly one context-package file', async () => {
    const d = deps();

    const res = await POST(
      requestWithFields({
        'context-package': new File(['{}'], 'context-package.json'),
        extra: 'no',
      }),
      d,
    );

    expect(res.status).toBe(400);
    expect(d.writePackage).not.toHaveBeenCalled();
  });

  it('F5 requires the canonical filename', async () => {
    const d = deps();

    const res = await POST(requestWithFile('other.json'), d);

    expect(res.status).toBe(400);
    expect(d.writePackage).not.toHaveBeenCalled();
  });

  it('F6 validates H2.5 package custody before invoking the writer', async () => {
    const d = deps();

    const res = await POST(
      requestWithFile('context-package.json', '{"schema":"not-cabin"}'),
      d,
    );

    expect(res.status).toBe(400);
    expect(d.writePackage).not.toHaveBeenCalled();
  });

  it('F7 writes only to the configured Cabin artifact path', async () => {
    const d = deps();

    const res = await POST(requestWithFile(), d);

    expect(res.status).toBe(200);
    expect(d.writePackage).toHaveBeenCalledWith(
      '/tmp/maia-cabin-import-test/context-package.json',
      {
        works: PACKAGE!.works,
        relationships: PACKAGE!.relationships,
        memories: PACKAGE!.memories,
      },
    );
  });

  it('F8 returns a truthful placed-but-refresh-required state', async () => {
    const d = deps();

    const res = await POST(requestWithFile(), d);
    const body = await res.json();

    expect(body).toEqual({
      placed: true,
      schema: 'soullab.cabin.context-package.v1',
      bytes: 123,
      requiresRuntimeRefresh: true,
    });
    expect(res.headers.get('cache-control')).toBe('private, no-store, max-age=0');
  });

  it('F9 never invokes runtime mount or remount behavior', async () => {
    const d = deps();

    const res = await POST(requestWithFile(), d);

    expect(res.status).toBe(200);

    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const source = readFileSync(
      join(process.cwd(), 'app/api/cabin/context/import/route.ts'),
      'utf8',
    );

    expect(source).not.toContain('initializeCabinContextMount');
    expect(source).not.toContain('clearCabinContextMount');
  });

  it('F10 does not log member, package, or selection content', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const source = readFileSync(
      join(process.cwd(), 'app/api/cabin/context/import/route.ts'),
      'utf8',
    );

    expect(source).not.toMatch(/console\.(log|info|debug|warn|error)\(/);
  });

  it('F11 oversized content is refused before package placement', async () => {
    const d = deps();
    const huge = 'x'.repeat(2 * 1024 * 1024 + 1);

    const res = await POST(requestWithFile('context-package.json', huge), d);

    expect(res.status).toBe(413);
    expect(d.writePackage).not.toHaveBeenCalled();
  });

  it('F12 closes the local store after the placement attempt', async () => {
    const d = deps();
    const close = jest.fn();
    (cabinStore as jest.Mock).mockReturnValue({ close });

    await POST(requestWithFile(), d);

    expect(close).toHaveBeenCalledTimes(1);
    expect(setCabinSessionCookie).toHaveBeenCalled();
  });
});
