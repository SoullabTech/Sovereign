import { NextRequest } from 'next/server';
import { POST } from '@/app/api/members/delete-account/route';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query, transaction } from '@/lib/db/postgres';
import { clearSessionCookie } from '@/lib/auth/serverSessions';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/auth/serverSessions', () => ({ clearSessionCookie: jest.fn() }));
const authenticated = getMemberIdFromRequest as jest.Mock;
const db = query as jest.Mock;
const tx = transaction as jest.Mock;
const clear = clearSessionCookie as jest.Mock;
const member = 'aaaaaaaa-0000-4000-8000-000000000001';

const req = (claim = member) => new NextRequest('http://localhost/api/members/delete-account', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ memberId: claim, confirmUsername: 'synthetic-person' }),
});

beforeEach(() => {
  authenticated.mockReset().mockResolvedValue(member);
  db.mockReset().mockImplementation(async (sql: string) => {
    if (sql.includes('SELECT username FROM members')) {
      return { rows: [{ username: 'synthetic-person' }] };
    }
    if (sql.includes('SELECT count(*)') && sql.includes('astro_maia_transfer_grants')) {
      return { rows: [{ n: '1' }] };
    }
    return { rows: [{ n: '0' }] };
  });
  tx.mockReset(); clear.mockReset();
});

describe('R4I account erasure remains held until separately signed R20 authority', () => {
  it('authenticated own-account request with grant refuses all deletion', async () => {
    const response = await POST(req());
    const body = await response.json();
    expect(response.status).toBe(409);
    expect(body.error).toBe('deletion_incomplete_unavailable');
    expect(body.accountChanged).toBe(false);
    expect(body.retained).toEqual(expect.arrayContaining([
      expect.objectContaining({label:'records of private chart sharing',rows:1}),
    ]));
    expect(tx).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });

  it('cross-member deletion request rejects before consulting member data', async () => {
    const response = await POST(req('bbbbbbbb-0000-4000-8000-000000000002'));
    expect(response.status).toBe(403);
    expect(db).not.toHaveBeenCalled();
    expect(tx).not.toHaveBeenCalled();
  });

  it('unauthenticated deletion refuses without any data access', async () => {
    authenticated.mockResolvedValue(null);
    const response = await POST(req());
    expect(response.status).toBe(401);
    expect(db).not.toHaveBeenCalled();
    expect(tx).not.toHaveBeenCalled();
  });

  it('wrong exact username refuses without touching storage', async () => {
    const response = await POST(new NextRequest('http://localhost/api/members/delete-account', {
      method: 'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({memberId:member,confirmUsername:'somebody-else'}),
    }));
    expect(response.status).toBe(400);
    expect(tx).not.toHaveBeenCalled();
  });
});
