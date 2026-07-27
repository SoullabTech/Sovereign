/**
 * Authorization + isolation for the member manuscript render/download route.
 * Renderer, DB, and auth are mocked — this pins the security boundary and the
 * stream/cleanup contract, not pandoc/Chromium (those are smoked separately).
 */
import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';
import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
}));
jest.mock('@/lib/manuscript/render/renderMemberBook', () => ({
  renderMemberBook: jest.fn(),
}));

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { renderMemberBook } from '@/lib/manuscript/render/renderMemberBook';
import { POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockRender = renderMemberBook as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';

function req(bodyObj: unknown): NextRequest {
  return new NextRequest('http://localhost/api/sovereign/manuscripts/m1/render', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(bodyObj),
  });
}
const ctx = { params: Promise.resolve({ id: 'm1' }) };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/sovereign/manuscripts/[id]/render — auth & isolation', () => {
  it('401 when there is no verified member', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(401);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('400 for an invalid format', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const res = await POST(req({ format: 'docx' }), ctx);
    expect(res.status).toBe(400);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('404 when the manuscript is not owned by the caller (no existence leak)', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ownership SELECT → empty
    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(404);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('400 when the owned manuscript has no sections', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title: 'My Book' }], rowCount: 1 }) // manuscript
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // sections → empty
    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(400);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('streams the rendered PDF, records provenance, and deletes the temp file', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title: 'My Book' }], rowCount: 1 }) // manuscript
      .mockResolvedValueOnce({ rows: [{ heading: 'Ch', body: 'text' }], rowCount: 1 }) // sections
      .mockResolvedValueOnce({ rows: [{ name: 'Ann Author' }], rowCount: 1 }) // member name
      .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // INSERT provenance

    const tmp = path.join(os.tmpdir(), `render-test-${process.pid}-${Math.floor(performance.now())}.pdf`);
    await fs.writeFile(tmp, Buffer.from('%PDF-1.4 test body'));
    mockRender.mockResolvedValue({
      filePath: tmp,
      sizeBytes: 18,
      pageCount: 1,
      sourceHash: 'abc123',
      sectionCount: 1,
    });

    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('content-disposition')).toContain('attachment');

    // author's own name passed to the renderer as book author
    expect(mockRender).toHaveBeenCalledWith(
      [{ heading: 'Ch', body: 'text' }],
      expect.objectContaining({ title: 'My Book', author: 'Ann Author', format: 'pdf' }),
    );

    // provenance row written
    const insertCall = mockQuery.mock.calls.find((c) =>
      String(c[0]).includes('INSERT INTO manuscript_renders'),
    );
    expect(insertCall).toBeTruthy();

    // rendered bytes are the response body
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.toString()).toContain('%PDF-1.4');

    // temp artifact deleted — a member manuscript is never persisted server-side
    await new Promise((r) => setTimeout(r, 25));
    await expect(fs.access(tmp)).rejects.toBeTruthy();
  });
});
