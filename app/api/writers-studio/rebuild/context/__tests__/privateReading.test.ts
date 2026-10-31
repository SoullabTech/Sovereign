import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
}));

import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { GET } from '../route';

const who = getMemberIdFromRequest as jest.Mock;
const sql = query as jest.Mock;
const member = '11111111-1111-4111-8111-111111111111';
const ownedId = '33333333-3333-4333-8333-333333333333';
const get = (id = ownedId) => GET(new NextRequest(
  'http://localhost/api/writers-studio/rebuild/context?manuscriptId=' + encodeURIComponent(id),
));

beforeEach(() => {
  jest.clearAllMocks();
  sql.mockReset();
});

test('refuses unauthenticated manuscript access without database read or public cache', async () => {
  who.mockResolvedValue(null);
  const r = await get();
  expect(r.status).toBe(401);
  expect(r.headers.get('cache-control')).toBe('private, no-store');
  expect(sql).not.toHaveBeenCalled();
});

test('does not disclose existence or text from a different member manuscript', async () => {
  who.mockResolvedValue(member);
  sql.mockResolvedValueOnce({ rows: [] });
  const r = await get('not-owned-id');
  expect(r.status).toBe(404);
  expect(await r.json()).toMatchObject({ error: 'not_found' });
  expect(r.headers.get('cache-control')).toBe('private, no-store');
  expect(sql.mock.calls[0][0]).toContain('member_id = $2');
  expect(sql.mock.calls[0][1]).toEqual(['not-owned-id', member]);
  expect(sql).toHaveBeenCalledTimes(1);
});

test('returns only authenticated current draft sections, with no-cache and exact author characters', async () => {
  who.mockResolvedValue(member);
  sql
    .mockResolvedValueOnce({ rows: [{ id: ownedId, title: 'Fictional Book' }] })
    .mockResolvedValueOnce({ rows: [{ id: 'fiction-draft', version: '7', updated_at: new Date('2026-10-21T12:00:00Z'), section_addressable_at: new Date('2026-10-21T12:00:00Z') }] })
    .mockResolvedValueOnce({ rows: [{ revision_number: 3 }] })
    .mockResolvedValueOnce({ rows: [{ draft_section_id: 'fiction-sec', source_section_id: null, position: 0,
      text: 'Author writes exactly “these” words.\n\n<script>escaped</script>',
      heading: null, heading_depth: null, heading_signal: null }] });

  const r = await get();
  expect(r.status).toBe(200);
  expect(r.headers.get('cache-control')).toBe('private, no-store');
  const data = await r.json();
  expect(data).toMatchObject({
    state: 'section_aware', manuscriptId: ownedId, version: 7, draftRevision: 3,
    sections: [{ draftSectionId: 'fiction-sec', body: 'Author writes exactly “these” words.\n\n<script>escaped</script>' }],
  });
  expect(sql.mock.calls[0][1]).toEqual([ownedId, member]);
  expect(sql.mock.calls[1][1]).toEqual([ownedId, member]);
  expect(sql.mock.calls[3][1]).toEqual(['fiction-draft']);
});

test('unconverted draft refuses to fabricate section bodies from older Source', async () => {
  who.mockResolvedValue(member);
  sql
    .mockResolvedValueOnce({ rows: [{ id: ownedId, title: 'Fictional Book' }] })
    .mockResolvedValueOnce({ rows: [{ id: 'fiction-draft', version: '4', updated_at: new Date('2026-10-21T12:00:00Z'), section_addressable_at: null }] });
  const r = await get();
  expect(r.status).toBe(200);
  const result = await r.json();
  expect(result.state).toBe('continuous');
  expect(result.sections).toBeUndefined();
  expect(r.headers.get('cache-control')).toBe('private, no-store');
  expect(sql).toHaveBeenCalledTimes(2);
});
