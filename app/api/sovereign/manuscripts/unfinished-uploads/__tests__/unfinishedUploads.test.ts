/**
 * D3 — the member's list and removal routes for unfinished uploads, EXECUTED.
 *
 * Every collaborator is mocked so each test can assert which door was (and was not) opened. The things pinned here are
 * the ones that matter to a member: removal is never reported when it has not fully happened, another member's id is
 * indistinguishable from an absent one, an identity in the body is ignored, nothing about the member's content reaches
 * a log line, and none of the gates that control PUTTING something into custody (release hold, pilot roster, Sanctuary)
 * can stand in front of REMOVING it.
 */
import { NextRequest } from 'next/server';

const SESSION_MEMBER = '11111111-1111-4111-8111-111111111111';
const OTHER_MEMBER = '22222222-2222-4222-8222-222222222222';
const ID = '33333333-3333-4333-8333-333333333333';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(async () => '11111111-1111-4111-8111-111111111111'),
}));
jest.mock('@/lib/manuscript/source/discardIncompleteLanding', () => ({
  discardIncompleteLanding: jest.fn(),
  listMemberUnfinishedUploads: jest.fn(),
}));
jest.mock('@/lib/manuscript/source/discardUnclaimedArrival', () => ({ discardUnclaimedArrival: jest.fn() }));
// The gates that control putting something INTO custody. They are mocked CLOSED/REFUSING so that any dependency of
// these routes on them would show up as a refusal. They are never imported by the routes.
jest.mock('@/lib/writersStudio/releaseAuthority', () => ({
  writerReleaseAuthority: jest.fn(() => ({ manifestId: 'held', sourceIntakeReleased: false })),
}));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({
  writersStudioBetaAccess: jest.fn(async () => ({ eligible: false, basis: 'not_in_pilot' })),
}));

import { GET } from '../route';
import { POST } from '../discard/route';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { discardIncompleteLanding, listMemberUnfinishedUploads } from '@/lib/manuscript/source/discardIncompleteLanding';
import { discardUnclaimedArrival } from '@/lib/manuscript/source/discardUnclaimedArrival';
import { writerReleaseAuthority } from '@/lib/writersStudio/releaseAuthority';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';

const memberOf = getMemberIdFromRequest as jest.Mock;
const list = listMemberUnfinishedUploads as jest.Mock;
const incomplete = discardIncompleteLanding as jest.Mock;
const unclaimed = discardUnclaimedArrival as jest.Mock;

let errors: string[];
beforeEach(() => {
  jest.clearAllMocks();
  memberOf.mockResolvedValue(SESSION_MEMBER);
  errors = [];
  jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => { errors.push(JSON.stringify(args)); });
});
afterEach(() => jest.restoreAllMocks());

function get(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/sovereign/manuscripts/unfinished-uploads', { headers });
}
function post(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/sovereign/manuscripts/unfinished-uploads/discard', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('GET list', () => {
  it('refuses an unauthenticated request without touching the library', async () => {
    memberOf.mockResolvedValue(null);
    const res = await GET(get());
    expect(res.status).toBe(401);
    expect(list).not.toHaveBeenCalled();
  });

  it('returns the held items for the SESSION member, uncached', async () => {
    const items = [
      { id: ID, kind: 'incomplete', createdAt: '2026-11-01T00:00:00.000Z', filename: null, bytes: 10 },
      { id: OTHER_MEMBER, kind: 'unclaimed', createdAt: '2026-11-01T00:00:00.000Z', filename: 'mine.docx', bytes: 20 },
    ];
    list.mockResolvedValue(items);
    const res = await GET(get());
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({ items });
    expect(list).toHaveBeenCalledWith(SESSION_MEMBER);
  });

  it('ignores any member identity supplied in the query string or headers', async () => {
    list.mockResolvedValue([]);
    const req = new NextRequest(
      `http://localhost/api/sovereign/manuscripts/unfinished-uploads?m=${OTHER_MEMBER}&memberId=${OTHER_MEMBER}&member_id=${OTHER_MEMBER}`,
      { headers: { 'x-member-id': OTHER_MEMBER } },
    );
    await GET(req);
    expect(list).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledWith(SESSION_MEMBER);
  });

  it('is not gated on the release hold, the pilot roster or Sanctuary: a member keeps sight of what is held for them', async () => {
    list.mockResolvedValue([]);
    const res = await GET(get({ 'x-maia-sanctuary': 'true' }));
    expect(res.status).toBe(200);
    expect(writerReleaseAuthority).not.toHaveBeenCalled();
    expect(writersStudioBetaAccess).not.toHaveBeenCalled();
  });

  it('on a database fault answers 500 with a fixed code, and logs only the error NAME and a pseudonymous reference', async () => {
    const fault = Object.assign(new Error('relation "writer_source_landing_intents" SECRETSQL $2=22222222'), { name: 'FictionalDbFault' });
    list.mockRejectedValue(fault);
    const res = await GET(get());
    expect(res.status).toBe(500);
    const text = JSON.stringify(await res.json());
    expect(text).toBe('{"error":"unfinished_uploads_unavailable"}');
    const logged = errors.join('\n');
    expect(logged).toContain('FictionalDbFault');
    expect(logged).not.toContain('SECRETSQL');
    expect(logged).not.toContain(SESSION_MEMBER);
  });
});

describe('POST discard — request validation', () => {
  it('refuses an unauthenticated request before reading the body or touching any door', async () => {
    memberOf.mockResolvedValue(null);
    const res = await POST(post({ id: ID, kind: 'incomplete' }));
    expect(res.status).toBe(401);
    expect(incomplete).not.toHaveBeenCalled();
    expect(unclaimed).not.toHaveBeenCalled();
  });

  it.each([
    ['not JSON', 'not json at all'],
    ['empty object', {}],
    ['null', 'null'],
    ['missing kind', { id: ID }],
    ['unknown kind', { id: ID, kind: 'arrival' }],
    ['kind with different case', { id: ID, kind: 'Incomplete' }],
    ['missing id', { kind: 'incomplete' }],
    ['id that is not a uuid', { id: 'not-a-uuid', kind: 'incomplete' }],
    ['id that is a number', { id: 123, kind: 'incomplete' }],
    ['id with trailing text', { id: `${ID}; DROP TABLE x`, kind: 'incomplete' }],
  ])('answers 400 and opens no door for %s', async (_name, body) => {
    const res = await POST(post(body as unknown));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_request' });
    expect(incomplete).not.toHaveBeenCalled();
    expect(unclaimed).not.toHaveBeenCalled();
  });
});

describe('POST discard — routing and identity', () => {
  it('routes `incomplete` to the landing door only, under the session member', async () => {
    incomplete.mockResolvedValue({ kind: 'discarded', bytesDestroyed: true });
    await POST(post({ id: ID, kind: 'incomplete' }));
    expect(incomplete).toHaveBeenCalledWith(ID, SESSION_MEMBER);
    expect(unclaimed).not.toHaveBeenCalled();
  });

  it('routes `unclaimed` to the arrival door only, under the session member', async () => {
    unclaimed.mockResolvedValue({ kind: 'discarded', bytesDestroyed: true });
    await POST(post({ id: ID, kind: 'unclaimed' }));
    expect(unclaimed).toHaveBeenCalledWith(ID, SESSION_MEMBER);
    expect(incomplete).not.toHaveBeenCalled();
  });

  it.each([
    ['incomplete', incomplete],
    ['unclaimed', unclaimed],
  ] as const)('an UPPERCASE uuid is valid input but is handed to the %s door in the database\'s lowercase spelling (refusal markers are compared against that text)', async (kind, door) => {
    (door as jest.Mock).mockResolvedValue({ kind: 'discarded', bytesDestroyed: true });
    // A uuid made only of digits has no case, so it could not tell a lowercasing route from one that passes the id through.
    const HEX = 'abcdefab-cdef-4abc-8def-abcdefabcdef';
    expect(HEX.toUpperCase()).not.toBe(HEX);
    const res = await POST(post({ id: HEX.toUpperCase(), kind }));
    expect(res.status).toBe(200);
    expect(door).toHaveBeenCalledTimes(1);
    expect(door).toHaveBeenCalledWith(HEX, SESSION_MEMBER);
    expect((door as jest.Mock).mock.calls[0][0]).not.toMatch(/[A-F]/);
  });

  it('ignores any member identity supplied in the body or in headers', async () => {
    incomplete.mockResolvedValue({ kind: 'not_found' });
    await POST(post({ id: ID, kind: 'incomplete', memberId: OTHER_MEMBER, member_id: OTHER_MEMBER }, { 'x-member-id': OTHER_MEMBER }));
    expect(incomplete).toHaveBeenCalledTimes(1);
    expect(incomplete).toHaveBeenCalledWith(ID, SESSION_MEMBER);
  });
});

describe('POST discard — the response says what happened and never more', () => {
  const cases: Array<[string, 'incomplete' | 'unclaimed', number, string, unknown]> = [
    ['incomplete discarded', 'incomplete', 200, 'removed', { kind: 'discarded', bytesDestroyed: true }],
    ['incomplete discarded (no bytes ever written)', 'incomplete', 200, 'removed', { kind: 'discarded', bytesDestroyed: false }],
    ['incomplete erasure pending', 'incomplete', 202, 'removal_pending', { kind: 'erasure_pending' }],
    ['incomplete not found', 'incomplete', 404, 'not_found', { kind: 'not_found' }],
    ['incomplete in progress', 'incomplete', 409, 'in_progress', { kind: 'in_progress' }],
    ['incomplete already recorded', 'incomplete', 409, 'already_recorded', { kind: 'already_recorded' }],
    ['unclaimed discarded', 'unclaimed', 200, 'removed', { kind: 'discarded', bytesDestroyed: true }],
    ['unclaimed erasure pending', 'unclaimed', 202, 'removal_pending', { kind: 'erasure_pending' }],
    ['unclaimed not found', 'unclaimed', 404, 'not_found', { kind: 'not_found' }],
    ['unclaimed already claimed by a Work', 'unclaimed', 409, 'attached_to_work', { kind: 'already_claimed' }],
  ];
  it.each(cases)('%s [%s] → %i %s', async (_name, kind, status, result, outcome) => {
    (kind === 'incomplete' ? incomplete : unclaimed).mockResolvedValue(outcome);
    const res = await POST(post({ id: ID, kind }));
    expect(res.status).toBe(status);
    expect(await res.json()).toEqual({ result });
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('tells the caller when to retry a write that may still be in flight', async () => {
    incomplete.mockResolvedValue({ kind: 'in_progress' });
    const res = await POST(post({ id: ID, kind: 'incomplete' }));
    expect(Number(res.headers.get('retry-after'))).toBeGreaterThanOrEqual(600);
  });

  it('on an unexpected fault answers 500 with a fixed code and logs only the error name, the kind and a pseudonymous reference', async () => {
    incomplete.mockRejectedValue(Object.assign(new Error('INSERT INTO deletion_manifests SECRETSQL'), { name: 'FictionalDbFault' }));
    const res = await POST(post({ id: ID, kind: 'incomplete' }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'removal_failed' });
    const logged = errors.join('\n');
    expect(logged).toContain('FictionalDbFault');
    expect(logged).not.toContain('SECRETSQL');
    expect(logged).not.toContain(SESSION_MEMBER);
    expect(logged).not.toContain(ID);
  });

  it('is not gated on the release hold, the pilot roster or Sanctuary: removal works for a member the intake gates would refuse', async () => {
    unclaimed.mockResolvedValue({ kind: 'discarded', bytesDestroyed: true });
    const res = await POST(post({ id: ID, kind: 'unclaimed' }, { 'x-maia-sanctuary': 'true' }));
    expect(res.status).toBe(200);
    expect(writerReleaseAuthority).not.toHaveBeenCalled();
    expect(writersStudioBetaAccess).not.toHaveBeenCalled();
  });
});
