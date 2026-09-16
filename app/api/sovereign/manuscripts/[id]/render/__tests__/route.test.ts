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
  inspectPublicationMatter: jest.fn(),
}));

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { inspectPublicationMatter, renderMemberBook } from '@/lib/manuscript/render/renderMemberBook';
import { POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockRender = renderMemberBook as jest.Mock;
const mockPreflight = inspectPublicationMatter as jest.Mock;

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
  mockPreflight.mockReturnValue({ bodyStartIndex: 0, candidates: [], issues: [] });
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

  it('400 for an invalid production stage before manuscript access', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const res = await POST(req({ format: 'pdf', stage: 'publish-now' }), ctx);
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
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
      productionProfile: 'hallmark-6x9-v2',
    });

    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('content-disposition')).toContain('attachment');

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
      'hallmark-6x9-v2', 'source', null, 'proof',
    ]);

    // rendered bytes are the response body
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.toString()).toContain('%PDF-1.4');

    // temp artifact deleted — a member manuscript is never persisted server-side
    await new Promise((r) => setTimeout(r, 25));
    await expect(fs.access(tmp)).rejects.toBeTruthy();
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
    mockRender.mockResolvedValue({ filePath: tmp, sizeBytes: 22, pageCount: 1, sourceHash: 'draft-hash', sectionCount: 1, productionProfile: 'hallmark-6x9-v2' });

    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(200);
    expect(mockRender).toHaveBeenCalledWith(
      [{ heading: 'Chapter One', body: 'CURRENT EDIT', headingDepth: 1, headingSignal: 'markdown' }],
      expect.objectContaining({ title: 'My Book', author: 'Ann Author', format: 'pdf' }),
    );
    const sql = mockQuery.mock.calls.map((c) => String(c[0])).join('\n');
    expect(sql).toContain('FROM manuscript_draft_sections');
    const insert = mockQuery.mock.calls.find((c) => String(c[0]).includes('INSERT INTO manuscript_renders'));
    expect(insert?.[1]?.slice(-4)).toEqual(['hallmark-6x9-v2', 'working_draft', '9', 'proof']);
    await new Promise((r) => setTimeout(r, 25));
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


  it('allows proof rendering even when final-production blockers would remain', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockPreflight.mockReturnValue({ bodyStartIndex: 1, candidates: [], issues: [
      { code: 'front_matter_roles_unresolved', severity: 'blocker', sectionIndexes: [0], message: 'role needed' },
    ] });
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title: 'My Book' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ heading: 'Elemental Alchemy', body: 'Front matter', heading_depth: 1, heading_signal: 'markdown' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ name: 'Ann Author' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const tmp = path.join(os.tmpdir(), `render-proof-${process.pid}-${Math.random().toString(16).slice(2)}.pdf`);
    await fs.writeFile(tmp, Buffer.from('%PDF-1.4 proof'));
    mockRender.mockResolvedValue({ filePath: tmp, sizeBytes: 14, pageCount: 1, sourceHash: 'proof-hash', sectionCount: 1, productionProfile: 'hallmark-6x9-v2' });

    const res = await POST(req({ format: 'pdf', stage: 'proof' }), ctx);
    expect(res.status).toBe(200);
    expect(mockPreflight).not.toHaveBeenCalled();
    const insert = mockQuery.mock.calls.find((c) => String(c[0]).includes('INSERT INTO manuscript_renders'));
    expect(insert?.[1]?.slice(-1)).toEqual(['proof']);
    await new Promise((r) => setTimeout(r, 25));
  });

  it('refuses final rendering when Hallmark production blockers remain', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const blocker = { code: 'damaged_copyright_text', severity: 'blocker', sectionIndexes: [0], message: 'verify legal text' };
    mockPreflight.mockReturnValue({ bodyStartIndex: 1, candidates: [], issues: [blocker] });
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title: 'My Book' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ heading: 'Elemental Alchemy', body: 'Copyright � 2026', heading_depth: 1, heading_signal: 'markdown' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ name: 'Ann Author' }], rowCount: 1 });

    const res = await POST(req({ format: 'pdf', stage: 'final' }), ctx);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ stage: 'final', preflight: { issues: [blocker] } });
    expect(mockPreflight).toHaveBeenCalledTimes(1);
    expect(mockRender).not.toHaveBeenCalled();
    expect(mockQuery.mock.calls.some((c) => String(c[0]).includes('INSERT INTO manuscript_renders'))).toBe(false);
  });

  it('renders a final artifact only after a clean preflight and records that fact', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ title: 'My Book' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ heading: 'Copyright', body: 'Copyright © 2026 Ann Author', heading_depth: 2, heading_signal: 'markdown' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ name: 'Ann Author' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const tmp = path.join(os.tmpdir(), `render-final-${process.pid}-${Math.random().toString(16).slice(2)}.pdf`);
    await fs.writeFile(tmp, Buffer.from('%PDF-1.4 final'));
    mockRender.mockResolvedValue({ filePath: tmp, sizeBytes: 14, pageCount: 1, sourceHash: 'final-hash', sectionCount: 1, productionProfile: 'hallmark-6x9-v2' });

    const res = await POST(req({ format: 'pdf', stage: 'final' }), ctx);
    expect(res.status).toBe(200);
    expect(mockPreflight).toHaveBeenCalledWith([
      { heading: 'Copyright', body: 'Copyright © 2026 Ann Author', headingDepth: 2, headingSignal: 'markdown' },
    ]);
    const insert = mockQuery.mock.calls.find((c) => String(c[0]).includes('INSERT INTO manuscript_renders'));
    expect(String(insert?.[0])).toContain('production_stage');
    expect(insert?.[1]?.slice(-1)).toEqual(['final']);
    await new Promise((r) => setTimeout(r, 25));
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
      productionProfile: 'hallmark-6x9-v2',
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
