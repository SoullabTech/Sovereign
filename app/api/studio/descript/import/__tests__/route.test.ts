/**
 * PRO-STUDIO-01: Legacy global Descript bridge is founder-only.
 * Only fictional identities and mocked external service calls.
 */
import { NextRequest } from 'next/server';

const mockFounder = jest.fn<() => Promise<any>>();
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: any[] }>>();
const mockCreateImport = jest.fn<() => Promise<any>>();

jest.mock('@/lib/founder/founderAuth', () => ({
  requireFounder: () => mockFounder(),
}));
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));
jest.mock('@/lib/descript/client', () => ({
  getDescriptClient: (_token: string) => ({
    createImportUrl: () => mockCreateImport(),
  }),
}));

import { POST } from '../route';

function request(body: unknown) {
  return new NextRequest('https://localhost/api/studio/descript/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Legacy Descript bridge', () => {
  beforeEach(() => {
    mockFounder.mockReset();
    mockQuery.mockReset();
    mockCreateImport.mockReset();
    mockFounder.mockResolvedValue({ ok: false, status: 403, error: 'Founder access required' });
  });

  it('refuses unauthenticated callers without reading secrets or invoking Descript', async () => {
    mockFounder.mockResolvedValue({ ok: false, status: 401, error: 'Authentication required' });
    const res = await POST(request({ projectName: 'fictional', fileUrl: 'https://example.org/fictional' }));
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockCreateImport).not.toHaveBeenCalled();
  });

  it('refuses ordinary practitioners before reading secrets or invoking Descript', async () => {
    const res = await POST(request({ projectName: 'fictional', fileUrl: 'https://example.org/fictional' }));
    expect(res.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockCreateImport).not.toHaveBeenCalled();
  });

  it('refuses missing input even after founder authorization', async () => {
    mockFounder.mockResolvedValue({ ok: true, memberId: 'fictional-founder' });
    const res = await POST(request({ projectName: 'fictional' }));
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('keeps failed legacy integration configuration from triggering external work', async () => {
    mockFounder.mockResolvedValue({ ok: true, memberId: 'fictional-founder' });
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const res = await POST(request({ projectName: 'fictional', fileUrl: 'https://example.org/fictional' }));
    expect(res.status).toBe(400);
    expect(mockCreateImport).not.toHaveBeenCalled();
  });

  it('permits founder-only synthetic import using a stubbed adapter', async () => {
    mockFounder.mockResolvedValue({ ok: true, memberId: 'fictional-founder' });
    mockQuery.mockResolvedValueOnce({ rows: [{ value: 'fixture-token-not-real' }] }).mockResolvedValueOnce({ rows: [] });
    mockCreateImport.mockResolvedValueOnce({ import_url: 'https://example.org/import-fixture', expires_at: '2099-01-01T00:00:00Z' });
    const res = await POST(request({ projectName: 'fictional', fileUrl: 'https://example.org/fictional' }));
    expect(res.status).toBe(200);
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockCreateImport).toHaveBeenCalledTimes(1);
  });
});
