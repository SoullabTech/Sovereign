/**
 * GATHER-02 — what a material may claim, and what the room refuses.
 *
 * The rule generalises WS-01's: a material that claims to be a file must HAVE
 * the file, and a thing that was typed may never claim one. These pin the
 * route side of that — the CHECK constraints pin the database side.
 */

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { GET, POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';

const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/sovereign/studio/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue(MEMBER);
  mockQuery.mockResolvedValue({
    rows: [
      {
        id: 'm1',
        kind: 'note',
        title: 'a note',
        artifact_hash: null,
        artifact_size: null,
        original_filename: null,
        mime_type: null,
        source_url: null,
        extraction_method: 'member_typed',
        extracted_chars: 5,
        arrived_at: 'now',
      },
    ],
  });
});

describe('who may gather', () => {
  it('refuses a signed-out caller', async () => {
    mockAuth.mockResolvedValue(null);
    expect((await post({ kind: 'note', text: 'x' })).status).toBe(401);
    expect(
      (await GET(new NextRequest('http://localhost/api/sovereign/studio/materials'))).status,
    ).toBe(401);
  });

  it('scopes the listing to the caller', async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    await GET(new NextRequest('http://localhost/api/sovereign/studio/materials'));
    expect(mockQuery.mock.calls[0][1]).toEqual([MEMBER]);
  });

  it('never carries extracted text in a listing', async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    await GET(new NextRequest('http://localhost/api/sovereign/studio/materials'));
    expect(mockQuery.mock.calls[0][0]).not.toContain('extracted_text');
  });
});

describe('bringing something typed', () => {
  it('takes a note and records that the member typed it', async () => {
    const res = await post({ kind: 'note', text: 'chapter opening thought' });
    expect(res.status).toBe(201);
    expect(mockQuery.mock.calls[0][1]).toContain('member_typed');
  });

  it('names a note by its own first line when the writer gave no title', async () => {
    await post({ kind: 'note', text: '  the river passage\nmore text' });
    expect(mockQuery.mock.calls[0][1]).toContain('the river passage');
  });

  it('refuses an empty note rather than storing a nameless row', async () => {
    expect((await post({ kind: 'note', text: '   ' })).status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('refuses a kind it does not offer', async () => {
    expect((await post({ kind: 'telepathy', text: 'x' })).status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('refuses a document sent as typed text — a file comes in as a file', async () => {
    expect((await post({ kind: 'document', text: 'pretending to be a pdf' })).status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('refuses an image claiming to be typed', async () => {
    expect((await post({ kind: 'image', text: 'x' })).status).toBe(400);
  });
});

describe('links are kept, never fetched', () => {
  it('stores the address', async () => {
    const res = await post({ kind: 'link', sourceUrl: 'https://example.com/jung' });
    expect(res.status).toBe(201);
    expect(mockQuery.mock.calls[0][1]).toContain('https://example.com/jung');
  });

  it('refuses a link with no address', async () => {
    expect((await post({ kind: 'link' })).status).toBe(400);
  });

  it('refuses something that is not a web address', async () => {
    expect((await post({ kind: 'link', sourceUrl: 'not a url' })).status).toBe(400);
  });

  it('refuses a non-web protocol', async () => {
    expect((await post({ kind: 'link', sourceUrl: 'file:///etc/passwd' })).status).toBe(400);
    expect((await post({ kind: 'link', sourceUrl: 'javascript:alert(1)' })).status).toBe(400);
  });

  it('refuses text sent alongside a link', async () => {
    // The page is never fetched, so any text here is someone's summary
    // wearing the source's name. A thought about a link is a note.
    const res = await post({
      kind: 'link',
      sourceUrl: 'https://example.com/a',
      text: 'invented summary',
    });
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe('nothing arrives already belonging', () => {
  it('writes no belonging row when a material is gathered', async () => {
    await post({ kind: 'note', text: 'something' });
    const statements = mockQuery.mock.calls.map((c) => String(c[0]));
    expect(statements.some((s) => s.includes('living_work_materials'))).toBe(false);
  });
});
