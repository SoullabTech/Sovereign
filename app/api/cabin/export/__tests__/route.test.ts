import fs from 'node:fs';
import { NextRequest } from 'next/server';

import { exportConnectedCabinContextPackage } from '@/lib/cabin/connectedContextExport';
import { POST } from '../route';
import { requireMemberId } from '@/lib/auth/session';

jest.mock('@/lib/auth/session', () => ({
  requireMemberId: jest.fn(),
}));

jest.mock('@/lib/cabin/connectedContextExport', () => ({
  exportConnectedCabinContextPackage: jest.fn(),
}));

const MEMBER = '00000000-0000-4000-8000-000000000001';
const WORK = '00000000-0000-4000-8000-000000000002';
const RELATIONSHIP = '00000000-0000-4000-8000-000000000003';
const MEMORY = '00000000-0000-4000-8000-000000000004';
const exportPackage = exportConnectedCabinContextPackage as jest.Mock;

const validSelection = {
  workIds: [WORK],
  relationshipIds: [RELATIONSHIP],
  memoryIds: [MEMORY],
};

function jsonRequest(
  body: unknown,
  headers: Record<string, string> = {
    origin: 'http://localhost:3000',
    'content-type': 'application/json',
  },
  url = 'http://localhost:3000/api/cabin/export',
): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

function emptyDeps() {
  return {
    exportPackage: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn(),
  };
}

describe('HOUSE-CABIN-CONTEXT-SPINE-01 · H3.7 Connected Cabin Package Delivery', () => {
  const originalMode = process.env.MAIA_CABIN_MODE;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.MAIA_CABIN_MODE;
    (requireMemberId as jest.Mock).mockResolvedValue(MEMBER);
    exportPackage.mockImplementation(async (_memberId: string, _selection: unknown, targetPath: string) => {
      fs.writeFileSync(targetPath, '{}');
      return {
        packagePath: targetPath,
        bytes: 2,
        package: {
          schema: 'soullab.cabin.context-package.v1',
          scope: 'member',
          works: [],
          relationships: [],
          memories: [],
        },
      };
    });
  });

  afterAll(() => {
    if (originalMode === undefined) delete process.env.MAIA_CABIN_MODE;
    else process.env.MAIA_CABIN_MODE = originalMode;
  });

  it('accepts the Next.js route context without treating it as dependency injection', async () => {
    const res = await POST(jsonRequest({
      workIds: [],
      relationshipIds: [],
      memoryIds: [],
    }), { params: {} });

    expect(res.status).toBe(200);
    expect(exportPackage).toHaveBeenCalled();
  });

  it('F1 refuses unauthenticated export before assembly', async () => {
    (requireMemberId as jest.Mock).mockRejectedValue(new Error('AUTH_REQUIRED'));
    const deps = emptyDeps();

    const res = await POST(jsonRequest(validSelection), deps);

    expect(res.status).toBe(401);
    expect(deps.exportPackage).not.toHaveBeenCalled();
  });

  it('F2 rejects offline Cabin mode before authentication or assembly', async () => {
    process.env.MAIA_CABIN_MODE = 'offline';
    const deps = emptyDeps();

    const res = await POST(jsonRequest(validSelection), deps);

    expect(res.status).toBe(404);
    expect(requireMemberId).not.toHaveBeenCalled();
    expect(deps.exportPackage).not.toHaveBeenCalled();
  });

  it('F3 rejects member identity in the request body', async () => {
    const deps = emptyDeps();

    const res = await POST(
      jsonRequest({ ...validSelection, memberId: MEMBER }),
      deps,
    );

    expect(res.status).toBe(400);
    expect(deps.exportPackage).not.toHaveBeenCalled();
  });

  it('F4 rejects hidden query parameters', async () => {
    const deps = emptyDeps();

    const res = await POST(
      jsonRequest(validSelection, undefined, 'http://localhost:3000/api/cabin/export?workId=' + WORK),
      deps,
    );

    expect(res.status).toBe(400);
    expect(deps.exportPackage).not.toHaveBeenCalled();
  });

  it('F5 rejects cross-origin requests before assembly', async () => {
    const deps = emptyDeps();

    const res = await POST(
      jsonRequest(validSelection, {
        origin: 'https://evil.example',
        'content-type': 'application/json',
      }),
      deps,
    );

    expect(res.status).toBe(403);
    expect(deps.exportPackage).not.toHaveBeenCalled();
  });

  it('F6 rejects malformed/duplicate selections before assembly', async () => {
    const deps = emptyDeps();

    const malformed = await POST(
      jsonRequest({
        workIds: [WORK, WORK],
        relationshipIds: [],
        memoryIds: [],
      }),
      deps,
    );

    expect(malformed.status).toBe(400);

    const wrongShape = await POST(
      jsonRequest({
        workIds: [],
        relationshipIds: [],
        memoryIds: [],
        currentWork: WORK,
      }),
      deps,
    );

    expect(wrongShape.status).toBe(400);
    expect(deps.exportPackage).not.toHaveBeenCalled();
  });

  it('F7 empty selection remains empty rather than triggering discovery', async () => {
    const deps = emptyDeps();

    deps.exportPackage.mockImplementation(async (memberId, selection, targetPath) => {
      expect(memberId).toBe(MEMBER);
      expect(selection).toEqual({
        workIds: [],
        relationshipIds: [],
        memoryIds: [],
      });
      return {
        packagePath: targetPath,
        bytes: 2,
        package: {
          schema: 'soullab.cabin.context-package.v1',
          scope: 'member',
          works: [],
          relationships: [],
          memories: [],
        },
      };
    });
    deps.readFile.mockReturnValue(Buffer.from('{}'));

    const res = await POST(
      jsonRequest({ workIds: [], relationshipIds: [], memoryIds: [] }),
      deps,
    );

    expect(res.status).toBe(200);
    expect(deps.exportPackage).toHaveBeenCalledTimes(1);
  });

  it('F8 reaches H3.4/H3.5 with exactly the authenticated member and explicit selection', async () => {
    const deps = emptyDeps();
    const packagePath = '/tmp/soullab-cabin-export-test.json';
    const packageBytes = Buffer.from('{"schema":"soullab.cabin.context-package.v1"}');

    deps.exportPackage.mockImplementation(async (memberId, selection, targetPath) => {
      expect(memberId).toBe(MEMBER);
      expect(selection).toEqual(validSelection);
      expect(targetPath).toMatch(/^\/.*soullab-cabin-export-.*\.json$/);
      return {
        packagePath: targetPath,
        bytes: packageBytes.length,
        package: {
          schema: 'soullab.cabin.context-package.v1',
          scope: 'member',
          works: [],
          relationships: [],
          memories: [],
        },
      };
    });
    deps.readFile.mockReturnValue(packageBytes);

    const res = await POST(jsonRequest(validSelection), deps);

    expect(res.status).toBe(200);
    expect(Buffer.from(await res.arrayBuffer())).toEqual(packageBytes);
    expect(deps.exportPackage).toHaveBeenCalledTimes(1);
    expect(deps.readFile).toHaveBeenCalledTimes(1);
    expect(deps.unlink).toHaveBeenCalledTimes(1);
  });

  it('F8 returns private no-store attachment headers and never exposes package content as JSON metadata', async () => {
    const deps = emptyDeps();
    const packageBytes = Buffer.from('{"schema":"soullab.cabin.context-package.v1"}');

    deps.exportPackage.mockResolvedValue({
      packagePath: '/tmp/context-package.json',
      bytes: packageBytes.length,
      package: {
        schema: 'soullab.cabin.context-package.v1',
        scope: 'member',
        works: [],
        relationships: [],
        memories: [],
      },
    });
    deps.readFile.mockReturnValue(packageBytes);

    const res = await POST(jsonRequest(validSelection), deps);

    expect(res.headers.get('cache-control')).toBe('private, no-store, max-age=0');
    expect(res.headers.get('content-disposition')).toBe(
      'attachment; filename="context-package.json"',
    );
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(res.headers.get('content-length')).toBe(String(packageBytes.length));
  });

  it('F9 removes the temporary artifact after a successful response', async () => {
    const deps = emptyDeps();
    deps.exportPackage.mockImplementation(async (_memberId, _selection, targetPath) => ({
      packagePath: targetPath,
      bytes: 2,
      package: {
        schema: 'soullab.cabin.context-package.v1',
        scope: 'member',
        works: [],
        relationships: [],
        memories: [],
      },
    }));
    deps.readFile.mockReturnValue(Buffer.from('{}'));

    await POST(jsonRequest({ workIds: [], relationshipIds: [], memoryIds: [] }), deps);

    expect(deps.unlink).toHaveBeenCalledWith(
      expect.stringMatching(/^\/.*soullab-cabin-export-.*\.json$/),
    );
  });

  it('F10 removes the temporary artifact when delivery fails', async () => {
    const deps = emptyDeps();
    deps.exportPackage.mockImplementation(async (_memberId, _selection, targetPath) => ({
      packagePath: targetPath,
      bytes: 2,
      package: {
        schema: 'soullab.cabin.context-package.v1',
        scope: 'member',
        works: [],
        relationships: [],
        memories: [],
      },
    }));
    deps.readFile.mockImplementation(() => {
      throw new Error('read failed');
    });

    const res = await POST(jsonRequest({ workIds: [], relationshipIds: [], memoryIds: [] }), deps);

    expect(res.status).toBe(503);
    expect(deps.unlink).toHaveBeenCalledTimes(1);
  });

  it('F11 leaves invalid H3.4 selection with no writer/delivery artifact', async () => {
    const deps = emptyDeps();
    deps.exportPackage.mockRejectedValue(
      new Error('CABIN_EXPORT_SELECTION_INVALID:work:foreign'),
    );

    const res = await POST(jsonRequest(validSelection), deps);

    expect(res.status).toBe(400);
    expect(deps.readFile).not.toHaveBeenCalled();
    expect(deps.unlink).toHaveBeenCalledTimes(1);
  });

  it('F12 requires JSON', async () => {
    const deps = emptyDeps();

    const req = new NextRequest('http://localhost:3000/api/cabin/export', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
        'content-type': 'text/plain',
      },
      body: 'not-json',
    });

    const res = await POST(req, deps);

    expect(res.status).toBe(415);
    expect(deps.exportPackage).not.toHaveBeenCalled();
  });

  it('F13 source contains no package-content or identity logging', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const source = readFileSync(
      join(process.cwd(), 'app/api/cabin/export/route.ts'),
      'utf8',
    );

    expect(source).not.toMatch(/console\.(log|info|debug|warn|error)\(/);
    expect(source).not.toMatch(/memberId.*console|console.*memberId/);
    expect(source).not.toMatch(/selection.*console|console.*selection/);
    expect(source).not.toMatch(/package.*console|console.*package/);
  });
});
