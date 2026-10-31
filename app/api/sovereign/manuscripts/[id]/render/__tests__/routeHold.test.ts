import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/manuscript/render/renderMemberBook', () => ({
  renderMemberBook: jest.fn(),
  inspectBookProduction: jest.fn(() => []),
}));

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { renderMemberBook } from '@/lib/manuscript/render/renderMemberBook';
import { writerReleaseAuthority } from '@/lib/writersStudio/releaseAuthority';
import { GET, POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockRender = renderMemberBook as jest.Mock;
const MEMBER = '11111111-1111-4111-8111-111111111111';
const ctx = { params: Promise.resolve({ id: 'm1' }) };

function request(format: 'pdf' | 'epub', revision = '12') {
  return new NextRequest('http://localhost/api/sovereign/manuscripts/m1/render', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      format,
      expectedSourceAuthority: 'working_draft',
      expectedSourceRevision: revision,
    }),
  });
}

function ownedHeldDraft(version = '12') {
  mockQuery
    .mockResolvedValueOnce({ rows: [{ id: 'm1' }], rowCount: 1 })
    .mockResolvedValueOnce({ rows: [{ version, section_addressable_at: new Date() }], rowCount: 1 });
}

function ownedPreflightDraft(version = '12') {
  mockQuery
    .mockResolvedValueOnce({ rows: [{ title: 'Fictional Book' }], rowCount: 1 })
    .mockResolvedValueOnce({ rows: [{ id: 'd1', version, section_addressable_at: new Date() }], rowCount: 1 })
    .mockResolvedValueOnce({
      rows: [{ heading: 'Opening', body: 'Fictional author words.', heading_depth: 1, heading_signal: 'member' }],
      rowCount: 1,
    })
    .mockResolvedValueOnce({ rows: [{ name: 'Fictional Author' }], rowCount: 1 });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockReset();
  mockAuth.mockResolvedValue(MEMBER);
});

describe('production-default Writer export certification fence', () => {
  it('is source-owned and default-deny for both PDF and EPUB', () => {
    expect(writerReleaseAuthority()).toMatchObject({
      sourceIntakeReleased: false,
      exportsCertified: { pdf: false, epub: false },
      permanentErasureCertified: false,
    });
  });

  it.each(['pdf', 'epub'] as const)('returns 423 for an owned current %s request before rendering or provenance', async (format) => {
    ownedHeldDraft();
    const response = await POST(request(format), ctx);

    expect(response.status).toBe(423);
    expect(await response.json()).toEqual({
      error: 'PDF and EPUB delivery is not yet available.',
      code: 'MEMBER_BOOK_EXPORT_HELD',
    });
    expect(mockRender).not.toHaveBeenCalled();
    expect(mockQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO manuscript_renders'))).toBe(false);
  });

  it('keeps ownership silence ahead of the certification hold', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const response = await POST(request('pdf'), ctx);
    expect(response.status).toBe(404);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('keeps stale-source refusal ahead of the certification hold', async () => {
    ownedHeldDraft('13');
    const response = await POST(request('pdf', '12'), ctx);
    expect(response.status).toBe(409);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('reports the exact held certification manifest in preflight', async () => {
    ownedPreflightDraft();
    const response = await GET(new NextRequest(
      'http://localhost/api/sovereign/manuscripts/m1/render',
      { method: 'GET' },
    ), ctx);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ready: true,
      releaseManifestId: writerReleaseAuthority().manifestId,
      exportsCertified: { pdf: false, epub: false },
    });
    expect(mockRender).not.toHaveBeenCalled();
  });
});
