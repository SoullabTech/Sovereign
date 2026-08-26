/**
 * The writer's answer to a finding is the writer's — this pins that boundary.
 *
 * MAIA observes; the writer answers. Nothing in the review pipeline may move a
 * disposition, and no caller may invent a state outside the seven. The states
 * are deliberately more than agree/disagree, and collapsing them is what makes
 * a writing tool feel like it is grading you.
 */

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { PATCH } from '../finding/[id]/route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const FINDING = '33333333-3333-3333-3333-333333333333';

const patch = (body: unknown) =>
  PATCH(
    new NextRequest(`http://localhost/api/sovereign/studio/review/finding/${FINDING}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: FINDING }) },
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue(MEMBER);
  mockQuery.mockResolvedValue({ rows: [{ id: FINDING, disposition: 'recognized' }] });
});

it('refuses a signed-out caller', async () => {
  mockAuth.mockResolvedValue(null);
  expect((await patch({ disposition: 'recognized' })).status).toBe(401);
  expect(mockQuery).not.toHaveBeenCalled();
});

it('accepts each of the seven states the writer may be in', async () => {
  for (const d of [
    'new',
    'discussed',
    'recognized',
    'adopted',
    'rejected',
    'unresolved',
    'resolved',
  ]) {
    mockQuery.mockResolvedValue({ rows: [{ id: FINDING, disposition: d }] });
    expect((await patch({ disposition: d })).status).toBe(200);
  }
});

it('refuses a state that is not one of them', async () => {
  const res = await patch({ disposition: 'fixed' });
  expect(res.status).toBe(400);
  expect(mockQuery).not.toHaveBeenCalled();
});

it('refuses a missing disposition rather than defaulting one', async () => {
  expect((await patch({})).status).toBe(400);
  expect(mockQuery).not.toHaveBeenCalled();
});

it('scopes the write to the caller, so no one answers another writer’s finding', async () => {
  await patch({ disposition: 'adopted' });
  const [sql, params] = mockQuery.mock.calls[0];
  expect(sql).toContain('member_id = $2');
  expect(params).toEqual([FINDING, MEMBER, 'adopted']);
});

it('does not leak the existence of a finding that is not the caller’s', async () => {
  mockQuery.mockResolvedValue({ rows: [] });
  expect((await patch({ disposition: 'adopted' })).status).toBe(404);
});
