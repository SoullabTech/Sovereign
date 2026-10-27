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
  inspectBookProduction: jest.fn(() => []),
}));
jest.mock('@/lib/manuscript/render/memberBookExportRelease', () => ({
  isMemberBookExportReleased: jest.fn(),
}));

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { inspectBookProduction, renderMemberBook } from '@/lib/manuscript/render/renderMemberBook';
import { isMemberBookExportReleased } from '@/lib/manuscript/render/memberBookExportRelease';
import { GET, POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockRender = renderMemberBook as jest.Mock;
const mockInspect = inspectBookProduction as jest.Mock;
const mockExportReleased = isMemberBookExportReleased as jest.Mock;
const actualExportRelease = (
  jest.requireActual('@/lib/manuscript/render/memberBookExportRelease') as
    typeof import('@/lib/manuscript/render/memberBookExportRelease')
).isMemberBookExportReleased;

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
  // A mid-render refusal intentionally leaves a mocked future query unused.
  // Reset one-shot SQL responses so its fixture never leaks into another test.
  mockQuery.mockReset();
  mockInspect.mockReturnValue([]);
  mockExportReleased.mockReturnValue(true);
});


function getReq(): NextRequest {
  return new NextRequest('http://localhost/api/sovereign/manuscripts/m1/render', {
    method: 'GET',
  });
}

describe('GET /api/sovereign/manuscripts/[id]/render — production preflight', () => {
  it('uses current working-draft authority and never invokes the renderer', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title: 'My Book' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: 'd1', version: '12', section_addressable_at: new Date() }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ heading: 'Chapter One', body: 'CURRENT EDIT', heading_depth: 1, heading_signal: 'markdown' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ name: 'Ann Author' }], rowCount: 1 });

    const res = await GET(getReq(), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      ready: true,
      title: 'My Book',
      sectionCount: 1,
      sourceAuthority: 'working_draft',
      sourceRevision: '12',
      issues: [],
      publicationBoundary: expect.stringContaining('does not publish'),
    });
    expect(mockRender).not.toHaveBeenCalled();
    expect(mockInspect).toHaveBeenCalledWith([
      { heading: 'Chapter One', body: 'CURRENT EDIT', headingDepth: 1, headingSignal: 'markdown' },
    ]);
  });

  it('surfaces production blockers without rendering or mutating anything', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title: 'My Book' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ heading: 'Opening Note', body: 'Copyright © 2026 Ann', heading_depth: 2, heading_signal: 'markdown' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ name: 'Ann Author' }], rowCount: 1 });
    mockInspect.mockReturnValueOnce([{
      code: 'copyright_not_governed',
      severity: 'blocker',
      sectionIndexes: [0],
      message: 'Copyright language exists, but there is not exactly one explicit governed Copyright object.',
    }]);

    const res = await GET(getReq(), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      ready: false,
      sourceAuthority: 'source',
      issues: [{ code: 'copyright_not_governed', severity: 'blocker' }],
    });
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('keeps the same ownership silence boundary as render', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await GET(getReq(), ctx);
    expect(res.status).toBe(404);
    expect(mockRender).not.toHaveBeenCalled();
  });
});

describe('POST /api/sovereign/manuscripts/[id]/render — auth & isolation', () => {
  it('holds an owned current export before source prose, renderer, provenance, or bytes', async () => {
    mockExportReleased.mockImplementation(actualExportRelease);
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'm1' }], rowCount: 1 })
      .mockResolvedValueOnce({
        rows: [{ version: '9', section_addressable_at: new Date() }],
        rowCount: 1,
      });

    const res = await POST(req({
      format: 'pdf',
      expectedSourceAuthority: 'working_draft',
      expectedSourceRevision: '9',
    }), ctx);

    expect(res.status).toBe(423);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    await expect(res.json()).resolves.toEqual({
      error: 'PDF and EPUB delivery is not yet available.',
      code: 'MEMBER_BOOK_EXPORT_HELD',
    });
    expect(mockRender).not.toHaveBeenCalled();
    expect(mockInspect).not.toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledTimes(2);
    const sql = mockQuery.mock.calls.map(([statement]) => String(statement)).join('\n');
    expect(sql).toContain('SELECT id FROM member_manuscripts');
    expect(sql).toContain('SELECT version, section_addressable_at');
    expect(sql).not.toContain('manuscript_draft_sections');
    expect(sql).not.toContain('manuscript_sections');
    expect(sql).not.toContain('SELECT name FROM members');
    expect(sql).not.toContain('INSERT INTO manuscript_renders');
  });

  it('holds a legacy owned request with no revision claim before source prose', async () => {
    mockExportReleased.mockImplementation(actualExportRelease);
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'm1' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await POST(req({ format: 'epub' }), ctx);

    expect(res.status).toBe(423);
    await expect(res.json()).resolves.toMatchObject({ code: 'MEMBER_BOOK_EXPORT_HELD' });
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('fails closed when the held export authority cannot verify ownership', async () => {
    mockExportReleased.mockImplementation(actualExportRelease);
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockRejectedValueOnce(new Error('database unavailable'));

    const res = await POST(req({ format: 'pdf' }), ctx);

    expect(res.status).toBe(500);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    await expect(res.json()).resolves.toEqual({
      error: 'Could not verify this manuscript just now.',
    });
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('preserves foreign-Work 404 while member delivery is held', async () => {
    mockExportReleased.mockImplementation(actualExportRelease);
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await POST(req({ format: 'epub' }), ctx);

    expect(res.status).toBe(404);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('preserves stale preflight 409 before returning the export hold', async () => {
    mockExportReleased.mockImplementation(actualExportRelease);
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'm1' }], rowCount: 1 })
      .mockResolvedValueOnce({
        rows: [{ version: '10', section_addressable_at: new Date() }],
        rowCount: 1,
      });

    const res = await POST(req({
      format: 'pdf',
      expectedSourceAuthority: 'working_draft',
      expectedSourceRevision: '9',
    }), ctx);

    expect(res.status).toBe(409);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    await expect(res.json()).resolves.toMatchObject({ error: expect.stringContaining('changed') });
    expect(mockRender).not.toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

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
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // no working draft
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // source sections → empty
    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(400);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('streams the rendered PDF, records provenance, and deletes the temp file', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title: 'My Book' }], rowCount: 1 }) // manuscript
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // no working draft
      .mockResolvedValueOnce({ rows: [{ heading: 'Ch', body: 'text', heading_depth: 1, heading_signal: 'markdown' }], rowCount: 1 }) // source
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
      productionProfile: 'hallmark-6x9-v1',
    });

    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('content-disposition')).toContain('attachment');
    // Author-scoped release facts consumed by the Publish/KDP cover preview.
    expect(res.headers.get('x-soullab-page-count')).toBe('1');
    expect(res.headers.get('x-soullab-production-profile')).toBe('hallmark-6x9-v1');
    expect(res.headers.get('x-soullab-source-hash')).toBe('abc123');


    // author's own name passed to the renderer as book author
    expect(mockRender).toHaveBeenCalledWith(
      [{ heading: 'Ch', body: 'text', headingDepth: 1, headingSignal: 'markdown' }],
      expect.objectContaining({ title: 'My Book', author: 'Ann Author', format: 'pdf' }),
    );

    // provenance row written
    const insertCall = mockQuery.mock.calls.find((c) =>
      String(c[0]).includes('INSERT INTO manuscript_renders'),
    );
    expect(insertCall).toBeTruthy();
    expect(String(insertCall?.[0])).toContain('production_profile');
    expect(insertCall?.[1]).toEqual([
      'm1', MEMBER, 'pdf', 1, 'abc123', 1,
      'hallmark-6x9-v1', 'source', null,
    ]);

    // rendered bytes are the response body
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.toString()).toContain('%PDF-1.4');

    // temp artifact deleted — a member manuscript is never persisted server-side
    await new Promise((r) => setTimeout(r, 25));
    await expect(fs.access(tmp)).rejects.toBeTruthy();
  });

  it('omits a guessed page count for EPUB while retaining source/provenance metadata', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title: 'My Book' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ heading: 'Chapter', body: 'fiction', heading_depth: 1, heading_signal: 'markdown' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ name: 'Ann Author' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const tmp = path.join(os.tmpdir(), `render-metadata-${process.pid}-${Date.now()}.epub`);
    await fs.writeFile(tmp, Buffer.from('EPUB fixture'));
    mockRender.mockResolvedValue({
      filePath: tmp, sizeBytes: 12,
      sourceHash: 'fiction-source-hash', sectionCount: 1,
      productionProfile: 'hallmark-6x9-v1',
    });

    const res = await POST(req({ format: 'epub' }), ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-soullab-page-count')).toBeNull();
    expect(res.headers.get('x-soullab-production-profile')).toBe('hallmark-6x9-v1');
    expect(res.headers.get('x-soullab-source-hash')).toBe('fiction-source-hash');
    expect(res.headers.get('cache-control')).toBe('no-store');
    await new Promise((r) => setTimeout(r, 25));
    await expect(fs.access(tmp)).rejects.toBeTruthy();
  });

  it('refuses stale preflight revisions BEFORE starting a print render', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title: 'Fiction Book' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: 'd1', version: '10', section_addressable_at: new Date() }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ heading: 'Ch', body: 'Fictional revised wording', heading_depth: 1, heading_signal: 'markdown' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ name: 'Fiction Author' }], rowCount: 1 });

    const response = await POST(req({
      format: 'pdf', expectedSourceAuthority: 'working_draft', expectedSourceRevision: '9',
    }), ctx);
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ error: expect.stringContaining('changed') });
    expect(mockRender).not.toHaveBeenCalled();
    expect(mockQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO manuscript_renders'))).toBe(false);
  });

  it('withholds and removes a rendered file if the manuscript changes WHILE rendering', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      // First source check: matches writer-confirmed preflight v9.
      .mockResolvedValueOnce({ rows: [{ title: 'Fiction Book' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: 'd1', version: '9', section_addressable_at: new Date() }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ heading: 'Ch', body: 'Before another edit', heading_depth: 1, heading_signal: 'markdown' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ name: 'Fiction Author' }], rowCount: 1 })
      // Verification after expensive rendering: draft changed to v10.
      .mockResolvedValueOnce({ rows: [{ title: 'Fiction Book' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: 'd1', version: '10', section_addressable_at: new Date() }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ heading: 'Ch', body: 'After another edit', heading_depth: 1, heading_signal: 'markdown' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ name: 'Fiction Author' }], rowCount: 1 });

    const tmp = path.join(os.tmpdir(), `render-inflight-${process.pid}-${Date.now()}.pdf`);
    await fs.writeFile(tmp, Buffer.from('%PDF-1.4 before edit'));
    mockRender.mockResolvedValue({
      filePath: tmp, sizeBytes: 20, pageCount: 1,
      sourceHash: 'old-revision-hash', sectionCount: 1, productionProfile: 'hallmark-6x9-v1',
    });

    const res = await POST(req({
      format: 'pdf', expectedSourceAuthority: 'working_draft', expectedSourceRevision: '9',
    }), ctx);
    expect(res.status).toBe(409);
    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO manuscript_renders'))).toBe(false);
    await expect(fs.access(tmp)).rejects.toBeTruthy();
  });

  it('refuses a change of source authority since preflight', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title: 'Fiction Book' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: 'd1', version: '1', section_addressable_at: new Date() }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ heading: 'Ch', body: 'Fictional draft', heading_depth: 1, heading_signal: 'markdown' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ name: 'Fiction Author' }], rowCount: 1 });
    const response = await POST(req({
      format: 'pdf', expectedSourceAuthority: 'source', expectedSourceRevision: null,
    }), ctx);
    expect(response.status).toBe(409);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('refuses incomplete or malformed preflight tokens rather than assuming consent', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    for (const malformed of [
      { expectedSourceAuthority: 'working_draft' },
      { expectedSourceRevision: '9' },
      { expectedSourceAuthority: 'working_draft', expectedSourceRevision: null },
      { expectedSourceAuthority: 'source', expectedSourceRevision: '9' },
      { expectedSourceAuthority: 'unknown', expectedSourceRevision: '9' },
    ]) {
      const response = await POST(req({ format: 'pdf', ...malformed }), ctx);
      expect(response.status).toBe(400);
    }
    expect(mockRender).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('renders the current section-addressable draft instead of stale source prose', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title: 'My Book' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: 'd1', version: '9', section_addressable_at: new Date() }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ heading: 'Chapter One', body: 'CURRENT EDIT', heading_depth: 1, heading_signal: 'markdown' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ name: 'Ann Author' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const tmp = path.join(os.tmpdir(), `render-draft-${process.pid}-${Math.random().toString(16).slice(2)}.pdf`);
    await fs.writeFile(tmp, Buffer.from('%PDF-1.4 current draft'));
    mockRender.mockResolvedValue({ filePath: tmp, sizeBytes: 22, pageCount: 1, sourceHash: 'draft-hash', sectionCount: 1, productionProfile: 'hallmark-6x9-v1' });

    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(200);
    expect(mockRender).toHaveBeenCalledWith(
      [{ heading: 'Chapter One', body: 'CURRENT EDIT', headingDepth: 1, headingSignal: 'markdown' }],
      expect.objectContaining({ title: 'My Book', author: 'Ann Author', format: 'pdf' }),
    );
    const sql = mockQuery.mock.calls.map((c) => String(c[0])).join('\n');
    expect(sql).toContain('FROM manuscript_draft_sections');
    const insert = mockQuery.mock.calls.find((c) => String(c[0]).includes('INSERT INTO manuscript_renders'));
    expect(insert?.[1]?.slice(-3)).toEqual(['hallmark-6x9-v1', 'working_draft', '9']);
    await new Promise((r) => setTimeout(r, 25));
  });

  it('permits a matching preflight revision through both checks and delivers the real file receipt', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const versionRow = { rows: [{ id: 'd1', version: '9', section_addressable_at: new Date() }], rowCount: 1 };
    const titleRow = { rows: [{ title: 'Fiction Book' }], rowCount: 1 };
    const chapterRow = { rows: [{ heading: 'Ch', body: 'Same author wording', heading_depth: 1, heading_signal: 'markdown' }], rowCount: 1 };
    const writerRow = { rows: [{ name: 'Fiction Author' }], rowCount: 1 };
    mockQuery
      .mockResolvedValueOnce(titleRow).mockResolvedValueOnce(versionRow)
      .mockResolvedValueOnce(chapterRow).mockResolvedValueOnce(writerRow)
      .mockResolvedValueOnce(titleRow).mockResolvedValueOnce(versionRow)
      .mockResolvedValueOnce(chapterRow).mockResolvedValueOnce(writerRow)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // provenance

    const tmp = path.join(os.tmpdir(), `render-match-${process.pid}-${Date.now()}.pdf`);
    await fs.writeFile(tmp, Buffer.from('%PDF-1.4 matching text'));
    mockRender.mockResolvedValue({
      filePath: tmp, sizeBytes: 22, pageCount: 1,
      sourceHash: 'matching-content-hash', sectionCount: 1,
      productionProfile: 'hallmark-6x9-v1',
    });
    const response = await POST(req({
      format: 'pdf', expectedSourceAuthority: 'working_draft', expectedSourceRevision: '9',
    }), ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get('x-soullab-source-hash')).toBe('matching-content-hash');
    expect(response.headers.get('x-soullab-page-count')).toBe('1');
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(10);
    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls.filter(([sql]) => String(sql).includes('SELECT title FROM member_manuscripts'))).toHaveLength(2);
    expect(mockQuery.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO manuscript_renders'))).toBe(true);
    await new Promise((r) => setTimeout(r, 25));
    await expect(fs.access(tmp)).rejects.toBeTruthy();
  });

  it('refuses rather than substituting source when an addressable draft has no readable sections', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title: 'My Book' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: 'd1', version: '9', section_addressable_at: new Date() }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ error: expect.stringContaining('Nothing older was substituted') });
    expect(mockRender).not.toHaveBeenCalled();
    expect(mockQuery.mock.calls.some((c) => /FROM manuscript_sections WHERE/.test(String(c[0])))).toBe(false);
  });
});

/**
 * C2 — the nullable-title contract at the render boundary.
 *
 * `member_manuscripts.title` became nullable in 20260802000001. This route is
 * the one place a title must become a string, because pandoc metadata and the
 * download filename are both strings. Before this, `title` was typed and
 * treated as non-nullable, so a NULL would have travelled straight through and
 * been interpolated as the literal "null" — into `--metadata title=null`, into
 * `<title>null</title>`, and into the downloaded filename of a member's book.
 *
 * These tests pin the resolution rather than the coincidence that currently
 * hides the problem (unnamed ⇒ member_written ⇒ zero sections ⇒ 400 earlier).
 */
describe('POST /api/sovereign/manuscripts/[id]/render — nullable title', () => {
  async function renderWithTitle(title: string | null) {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title }], rowCount: 1 }) // manuscript
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // no working draft
      .mockResolvedValueOnce({ rows: [{ heading: null, body: 'text', heading_depth: null, heading_signal: null }], rowCount: 1 }) // source
      .mockResolvedValueOnce({ rows: [{ name: 'Ann Author' }], rowCount: 1 }) // member name
      .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // INSERT provenance

    const tmp = path.join(
      os.tmpdir(),
      `render-title-${process.pid}-${Math.floor(performance.now())}-${Math.random().toString(16).slice(2)}.pdf`,
    );
    await fs.writeFile(tmp, Buffer.from('%PDF-1.4 test body'));
    mockRender.mockResolvedValue({
      filePath: tmp,
      sizeBytes: 18,
      pageCount: 1,
      sourceHash: 'abc123',
      sectionCount: 1,
      productionProfile: 'hallmark-6x9-v1',
    });

    const res = await POST(req({ format: 'pdf' }), ctx);
    const passed = mockRender.mock.calls[0]?.[1] as { title: unknown } | undefined;
    await new Promise((r) => setTimeout(r, 25));
    await fs.rm(tmp, { force: true });
    return { res, passed };
  }

  it('never lets a NULL title reach the renderer as the string "null"', async () => {
    const { res, passed } = await renderWithTitle(null);

    expect(res.status).toBe(200);
    expect(passed?.title).toBe('Your writing');

    // The specific failure this guards: interpolation of null into a string.
    expect(passed?.title).not.toBe('null');
    expect(passed?.title).not.toBeNull();
    expect(typeof passed?.title).toBe('string');
    expect(String(passed?.title)).not.toContain('null');

    // …and it must not reach the member through the filename either.
    expect(res.headers.get('content-disposition')).not.toContain('null');
  });

  it('leaves a title the member actually gave exactly as they gave it', async () => {
    const { res, passed } = await renderWithTitle('The Salt Road');

    expect(res.status).toBe(200);
    expect(passed?.title).toBe('The Salt Road');
    // The fallback is for absence only — it must never displace a real name.
    expect(passed?.title).not.toBe('Your writing');
  });
});
