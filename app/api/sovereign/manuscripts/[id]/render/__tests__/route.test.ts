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

/**
 * The DB answers BY TABLE, not by call order.
 *
 * These fixtures were positional (`mockResolvedValueOnce` × 4) until the
 * current-draft export ruling added a `manuscript_working_drafts` read between
 * the ownership check and the section read. Four tests then failed with a 500
 * — not because the route broke, but because each answer had silently shifted
 * one place along and the manuscript row was being handed to the section
 * reader. A fixture that survives only while the query order is frozen tests
 * the order, not the behaviour; dispatching on the SQL says which table each
 * answer belongs to and lets a new read be added without inventing failures.
 *
 * An unrecognized query throws rather than returning empty rows: a silent
 * `{ rows: [] }` for a read nobody anticipated is how a route under test
 * quietly stops exercising the path the test names.
 */
type DbAnswers = {
  /** null ⇒ not owned by the caller */
  manuscript?: { title: string | null } | null;
  /**
   * null ⇒ no working draft has ever existed for this manuscript.
   * `section_texts` travels WITH the version, because the route reads them in
   * one statement — modelling them as separate answers here would let a test
   * pass against a route that had gone back to two racing reads.
   */
  draft?: {
    id: string;
    version: number;
    content: string;
    addressable: boolean;
    section_texts: string[];
  } | null;
  sections?: { heading: string | null; body: string }[];
  member?: { name: string | null } | null;
};

function db(answers: DbAnswers): void {
  const rows = <T>(r: T[]) => ({ rows: r, rowCount: r.length });
  mockQuery.mockImplementation(async (sql: unknown) => {
    const s = String(sql);
    if (s.includes('FROM member_manuscripts')) {
      return rows(answers.manuscript === undefined || answers.manuscript === null ? [] : [answers.manuscript]);
    }
    if (s.includes('FROM manuscript_working_drafts')) {
      return rows(answers.draft ? [answers.draft] : []);
    }
    if (s.includes('FROM manuscript_sections')) return rows(answers.sections ?? []);
    if (s.includes('FROM members')) return rows(answers.member ? [answers.member] : []);
    if (s.includes('INSERT INTO manuscript_renders')) return rows([]);
    throw new Error(`unmocked query in render route test: ${s.trim().slice(0, 90)}`);
  });
}

/** A temp file standing in for pandoc's output, and the render result naming it. */
async function stubRenderedFile(tag: string): Promise<string> {
  const tmp = path.join(
    os.tmpdir(),
    `render-${tag}-${process.pid}-${Math.floor(performance.now())}-${Math.random().toString(16).slice(2)}.pdf`,
  );
  await fs.writeFile(tmp, Buffer.from('%PDF-1.4 test body'));
  mockRender.mockResolvedValue({
    filePath: tmp,
    sizeBytes: 18,
    pageCount: 1,
    sourceHash: 'abc123',
    sectionCount: 1,
  });
  return tmp;
}

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
    db({ manuscript: null }); // ownership SELECT → empty
    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(404);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('400 when the owned manuscript has no sections', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    db({ manuscript: { title: 'My Book' }, draft: null, sections: [] });
    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(400);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('streams the rendered PDF, records provenance, and deletes the temp file', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    db({
      manuscript: { title: 'My Book' },
      draft: null, // never drafted → the Source IS the current state
      sections: [{ heading: 'Ch', body: 'text' }],
      member: { name: 'Ann Author' },
    });
    const tmp = await stubRenderedFile('stream');

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
    db({
      manuscript: { title },
      draft: null,
      sections: [{ heading: null, body: 'text' }],
      member: { name: 'Ann Author' },
    });
    const tmp = await stubRenderedFile('title');

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

/**
 * The current draft is the manuscript — founder ruling 2026-09-07.
 *
 * This route read `manuscript_sections` (the Source), so a writer could revise
 * a chapter in WRITE, export a .docx, and be handed the pre-revision text. The
 * export succeeded; nothing refused. The sibling `currentDraftExport.test.ts`
 * pins the shape of the code; these pin what the route actually DOES, which is
 * the part that can regress without the source changing shape.
 */
describe('POST /api/sovereign/manuscripts/[id]/render — exports the current draft', () => {
  const sectionsPassed = () => mockRender.mock.calls[0]?.[0] as { heading: string | null; body: string }[];
  const sourceWasRead = () =>
    mockQuery.mock.calls.some((c) => String(c[0]).includes('FROM manuscript_sections'));

  it('renders the draft text, and never reaches the Source at all', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    db({
      manuscript: { title: 'My Book' },
      draft: {
        id: 'd1', version: 7, content: 'ignored', addressable: true,
        section_texts: ['# Chapter One\n\nRevised opening.', 'Second.'],
      },
      sections: [{ heading: 'Ch', body: 'STALE SOURCE TEXT' }],
      member: { name: 'Ann Author' },
    });
    const tmp = await stubRenderedFile('draft');

    const res = await POST(req({ format: 'pdf', draftVersion: 7 }), ctx);
    expect(res.status).toBe(200);
    expect(sectionsPassed()).toEqual([
      { heading: null, body: '# Chapter One\n\nRevised opening.' },
      { heading: null, body: 'Second.' },
    ]);
    /* Not merely "the draft won" — the stale read never happened. */
    expect(sourceWasRead()).toBe(false);

    await new Promise((r) => setTimeout(r, 25));
    await fs.rm(tmp, { force: true });
  });

  it('⛔ passes the writer’s characters code point for code point', async () => {
    /* The two failures the ruling names, both silent: a derived heading
       prepended (printing the chapter title twice) and a matched prefix
       stripped (eating the chapter's first line). Neither raises anything. */
    const text = '# Chapter One\n\nShe wrote — “café”, 𝄞, and a trailing space. ';
    mockAuth.mockResolvedValue(MEMBER);
    db({
      manuscript: { title: 'My Book' },
      draft: { id: 'd1', version: 1, content: '', addressable: true, section_texts: [text] },
      member: { name: null },
    });
    const tmp = await stubRenderedFile('verbatim');

    await POST(req({ format: 'pdf', draftVersion: 1 }), ctx);
    const [only] = sectionsPassed();
    expect(only.body).toBe(text);
    expect([...only.body].length).toBe([...text].length);
    expect(only.heading).toBeNull();

    await new Promise((r) => setTimeout(r, 25));
    await fs.rm(tmp, { force: true });
  });

  it('a continuous draft exports as one span, not cut into invented sections', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    db({
      manuscript: { title: 'My Book' },
      draft: {
        id: 'd1', version: 3, content: 'One long unbroken piece.', addressable: false,
        section_texts: [],
      },
      member: { name: null },
    });
    const tmp = await stubRenderedFile('continuous');

    await POST(req({ format: 'pdf', draftVersion: 3 }), ctx);
    expect(sectionsPassed()).toEqual([{ heading: null, body: 'One long unbroken piece.' }]);
    expect(sourceWasRead()).toBe(false);

    await new Promise((r) => setTimeout(r, 25));
    await fs.rm(tmp, { force: true });
  });

  it('falls back to the Source only when no draft has ever existed', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    db({
      manuscript: { title: 'My Book' },
      draft: null,
      sections: [{ heading: 'Ch', body: 'Imported text.' }],
      member: { name: null },
    });
    const tmp = await stubRenderedFile('source');

    await POST(req({ format: 'pdf' }), ctx);
    /* Not a stale fallback: with no draft, the Source IS the current state,
       and its own heading is the member's — so it travels as a heading. */
    expect(sectionsPassed()).toEqual([{ heading: 'Ch', body: 'Imported text.' }]);

    await new Promise((r) => setTimeout(r, 25));
    await fs.rm(tmp, { force: true });
  });

  it('refuses (409) when the caller’s settled version has been overtaken', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    db({
      manuscript: { title: 'My Book' },
      draft: {
        id: 'd1', version: 9, content: 'newer', addressable: true, section_texts: ['newer'],
      },
      member: { name: null },
    });

    const res = await POST(req({ format: 'pdf', draftVersion: 8 }), ctx);
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe('unsettled_draft');
    /* Refusal is the whole act: nothing rendered, and nothing recorded as
       though a book had been made. */
    expect(mockRender).not.toHaveBeenCalled();
    expect(mockQuery.mock.calls.some((c) => String(c[0]).includes('INSERT INTO'))).toBe(false);
  });

  it('proceeds when the caller’s settled version matches', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    db({
      manuscript: { title: 'My Book' },
      draft: {
        id: 'd1', version: 9, content: '', addressable: true, section_texts: ['current'],
      },
      member: { name: null },
    });
    const tmp = await stubRenderedFile('settled');

    const res = await POST(req({ format: 'pdf', draftVersion: 9 }), ctx);
    expect(res.status).toBe(200);
    expect(sectionsPassed()).toEqual([{ heading: null, body: 'current' }]);

    await new Promise((r) => setTimeout(r, 25));
    await fs.rm(tmp, { force: true });
  });

  it('400 for a draftVersion that is not a number', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    db({ manuscript: { title: 'My Book' } });
    const res = await POST(req({ format: 'pdf', draftVersion: '9' }), ctx);
    expect(res.status).toBe(400);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('400 when the draft holds nothing but whitespace', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    db({
      manuscript: { title: 'My Book' },
      draft: {
        id: 'd1', version: 1, content: '', addressable: true, section_texts: ['   \n\n'],
      },
      member: { name: null },
    });
    const res = await POST(req({ format: 'pdf', draftVersion: 1 }), ctx);
    expect(res.status).toBe(400);
    expect(mockRender).not.toHaveBeenCalled();
  });
});

/**
 * SETTLE REACHABILITY — the guard is now obligatory, not merely available.
 *
 * The first cut made `draftVersion` optional and "enforced when present". The
 * only caller posted `{ format }`, so the guard was never reached and the
 * export it protected shipped unprotected. A guard nothing is obliged to reach
 * is not a weaker guard; it is an absent one dressed as a present one.
 */
describe('POST /api/sovereign/manuscripts/[id]/render — settle reachability', () => {
  const drafted = (version: number) => ({
    manuscript: { title: 'My Book' } as { title: string | null },
    draft: { id: 'd1', version, content: 'whole', addressable: true, section_texts: ['whole'] },
    member: { name: null } as { name: string | null },
  });

  it('⛔ refuses a drafted manuscript when the caller names no version', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    db(drafted(5));
    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe('settle_required');
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('⛔ no refusal ever writes a render provenance row or emits a file', async () => {
    /* A recorded render that never happened is a false provenance entry, and
       provenance is the only durable claim this route makes. */
    for (const body of [
      { format: 'pdf' }, // settle_required
      { format: 'pdf', draftVersion: 4 }, // unsettled_draft
    ]) {
      jest.clearAllMocks();
      mockAuth.mockResolvedValue(MEMBER);
      db(drafted(5));
      const res = await POST(req(body), ctx);
      expect(res.status).toBe(409);
      expect(res.headers.get('content-type')).toContain('application/json');
      expect(res.headers.get('content-disposition')).toBeNull();
      expect(mockRender).not.toHaveBeenCalled();
      expect(mockQuery.mock.calls.some((c) => String(c[0]).includes('INSERT INTO'))).toBe(false);
    }
  });

  it('a continuous draft settles by exactly the same rule', async () => {
    /* Not a separate path with separate manners: the refusals run before the
       addressable/continuous branch is chosen at all. */
    mockAuth.mockResolvedValue(MEMBER);
    db({
      manuscript: { title: 'My Book' },
      draft: { id: 'd1', version: 6, content: 'one span', addressable: false, section_texts: [] },
      member: { name: null },
    });
    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe('settle_required');
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('the never-drafted Source needs no claim', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    db({
      manuscript: { title: 'My Book' },
      draft: null,
      sections: [{ heading: 'Ch', body: 'Imported.' }],
      member: { name: null },
    });
    const tmp = await stubRenderedFile('sourceclaimless');
    const res = await POST(req({ format: 'pdf' }), ctx);
    expect(res.status).toBe(200);

    await new Promise((r) => setTimeout(r, 25));
    await fs.rm(tmp, { force: true });
  });

  it('⛔ refuses a claim about a draft that does not exist', async () => {
    /* The caller and the server disagree about what this manuscript IS.
       Exporting the Source under that claim would answer a question nobody
       asked, and would look to the caller like its draft had been exported. */
    mockAuth.mockResolvedValue(MEMBER);
    db({
      manuscript: { title: 'My Book' },
      draft: null,
      sections: [{ heading: 'Ch', body: 'Imported.' }],
      member: { name: null },
    });
    const res = await POST(req({ format: 'pdf', draftVersion: 3 }), ctx);
    expect(res.status).toBe(409);
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('⛔ the version and the text arrive in ONE read, so they cannot disagree', async () => {
    /* Structural, and asserted here rather than only in the source scan: the
       route must not issue a separate draft-section query that a save could
       land between. If one ever returns, the unmocked-query throw in `db()`
       turns this red. */
    mockAuth.mockResolvedValue(MEMBER);
    db(drafted(5));
    const tmp = await stubRenderedFile('oneread');
    await POST(req({ format: 'pdf', draftVersion: 5 }), ctx);

    const draftReads = mockQuery.mock.calls.filter((c) =>
      String(c[0]).includes('manuscript_working_drafts'),
    );
    const sectionReads = mockQuery.mock.calls.filter(
      (c) =>
        String(c[0]).includes('manuscript_draft_sections') &&
        !String(c[0]).includes('manuscript_working_drafts'),
    );
    expect(draftReads).toHaveLength(1);
    expect(sectionReads).toHaveLength(0);

    await new Promise((r) => setTimeout(r, 25));
    await fs.rm(tmp, { force: true });
  });
});
