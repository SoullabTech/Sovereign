/**
 * GATHER-02A — an original is handed back, never executed.
 *
 * The hole this closes: a stored file served with its own MIME type and
 * `Content-Disposition: inline` renders as a first-party Soullab page, so an
 * uploaded .html or .svg would run same-origin script as the member who
 * uploaded it. The two negative cases are the point of this suite.
 */

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/storage/fileVault', () => ({ readVaultBytes: jest.fn() }));

import { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { readVaultBytes } from '@/lib/storage/fileVault';
import { GET } from '../[id]/file/route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockVault = readVaultBytes as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const ID = '22222222-2222-2222-2222-222222222222';
const BYTES = Buffer.from('<svg onload="fetch(`/api/members/export`)"></svg>');
const HASH = createHash('sha256').update(BYTES).digest('hex');

function row(over: Record<string, unknown> = {}) {
  mockQuery.mockResolvedValue({
    rows: [
      {
        artifact_ref: 'studio-materials/x.svg',
        artifact_hash: HASH,
        original_filename: 'diagram.svg',
        mime_type: 'image/svg+xml',
        ...over,
      },
    ],
  });
}

const get = () =>
  GET(new NextRequest(`http://localhost/api/sovereign/studio/materials/${ID}/file`), {
    params: Promise.resolve({ id: ID }),
  });

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue(MEMBER);
  mockVault.mockResolvedValue(BYTES);
});

it('refuses a signed-out caller', async () => {
  mockAuth.mockResolvedValue(null);
  expect((await get()).status).toBe(401);
});

it('scopes the read to the caller', async () => {
  row();
  await get();
  expect(mockQuery.mock.calls[0][1]).toEqual([ID, MEMBER]);
});

it('NEVER serves an SVG inline', async () => {
  row();
  const res = await get();
  expect(res.headers.get('content-disposition')).toContain('attachment');
  expect(res.headers.get('content-type')).toBe('application/octet-stream');
});

it('NEVER serves HTML inline', async () => {
  row({ original_filename: 'notes.html', mime_type: 'text/html' });
  const res = await get();
  expect(res.headers.get('content-disposition')).toContain('attachment');
  expect(res.headers.get('content-type')).toBe('application/octet-stream');
});

it('sends nosniff on every response, so a neutral type cannot be upgraded', async () => {
  row();
  expect((await get()).headers.get('x-content-type-options')).toBe('nosniff');
  row({ original_filename: 'photo.png', mime_type: 'image/png' });
  expect((await get()).headers.get('x-content-type-options')).toBe('nosniff');
});

it('still shows an ordinary image inline', async () => {
  row({ original_filename: 'photo.png', mime_type: 'image/png' });
  const res = await get();
  expect(res.headers.get('content-disposition')).toContain('inline');
  expect(res.headers.get('content-type')).toBe('image/png');
});

it('hands over a PDF rather than rendering it as a page', async () => {
  row({ original_filename: 'book.pdf', mime_type: 'application/pdf' });
  const res = await get();
  expect(res.headers.get('content-disposition')).toContain('attachment');
  // Preserved faithfully: only the rendering changes, not the file.
  expect(res.headers.get('content-type')).toBe('application/pdf');
});

it('preserves the bytes exactly, whatever the disposition', async () => {
  row();
  const res = await get();
  expect(Buffer.from(await res.arrayBuffer()).equals(BYTES)).toBe(true);
});

it('reports a vault that has drifted from what the row claims', async () => {
  row({ artifact_hash: 'a-different-hash' });
  const res = await get();
  expect(res.status).toBe(409);
  expect((await res.json()).error).toBe('artifact_hash_mismatch');
});

it('says the original is missing rather than that the material never existed', async () => {
  row();
  mockVault.mockRejectedValue(new Error('ENOENT'));
  const res = await get();
  expect(res.status).toBe(410);
  expect((await res.json()).error).toBe('artifact_missing');
});

it('says plainly when a material did not arrive as a file', async () => {
  row({ artifact_ref: null, artifact_hash: null, original_filename: null, mime_type: null });
  const res = await get();
  expect(res.status).toBe(404);
  expect((await res.json()).error).toBe('no_file');
});
