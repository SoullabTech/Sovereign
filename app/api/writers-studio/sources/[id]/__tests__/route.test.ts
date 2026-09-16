jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/workbench/storage', () => ({ writeReviewed: jest.fn(), deleteUpload: jest.fn() }));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query, transaction } from '@/lib/db/postgres';
import { deleteUpload } from '@/lib/workbench/storage';
import { DELETE } from '../route';

const auth = getMemberIdFromRequest as jest.Mock;
const q = query as jest.Mock;
const tx = transaction as jest.Mock;
const removeBytes = deleteUpload as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const SOURCE = '22222222-2222-2222-2222-222222222222';
const ctx = { params: Promise.resolve({ id: SOURCE }) };
const req = () => new NextRequest(`http://localhost/api/writers-studio/sources/${SOURCE}`, { method: 'DELETE' });

beforeEach(() => {
  jest.clearAllMocks();
  auth.mockResolvedValue(MEMBER);
  removeBytes.mockResolvedValue(undefined);
});

describe('DELETE /writers-studio/sources/[id] — source custody ends explicitly', () => {
  it('refuses an unauthenticated delete', async () => {
    auth.mockResolvedValue(null);
    const res = await DELETE(req(), ctx);
    expect(res.status).toBe(401);
    expect(removeBytes).not.toHaveBeenCalled();
  });

  it('does not reveal or delete a source outside the member scope', async () => {
    q.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await DELETE(req(), ctx);
    expect(res.status).toBe(404);
    expect(removeBytes).not.toHaveBeenCalled();
  });

  it('removes bytes, Work belongings, and the owned source record', async () => {
    q.mockResolvedValueOnce({ rows: [{ id: SOURCE }], rowCount: 1 });
    const calls: unknown[][] = [];
    tx.mockImplementation(async (fn: (client: { query: jest.Mock }) => Promise<unknown>) => {
      const clientQuery = jest.fn(async (...args: unknown[]) => {
        calls.push(args);
        return { rows: [], rowCount: 1 };
      });
      return fn({ query: clientQuery });
    });

    const res = await DELETE(req(), ctx);
    expect(res.status).toBe(200);
    expect(removeBytes).toHaveBeenCalledWith(MEMBER, SOURCE);
    expect(String(calls[0][0])).toContain('DELETE FROM living_work_materials');
    expect(calls[0][1]).toEqual([MEMBER, SOURCE]);
    expect(String(calls[1][0])).toContain('DELETE FROM workbench_uploads');
    expect(calls[1][1]).toEqual([SOURCE, MEMBER]);
  });
});
