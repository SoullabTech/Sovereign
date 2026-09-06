/**
 * COLAB-BETA-01 R2 — the invariants that make an invitation land a tester in the
 * exact Beta Co-Lab and nowhere else. Focused on those invariants only; this is
 * not a rewrite of the invite suite.
 */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => {
  const query = jest.fn();
  return { query, transaction: jest.fn(async (cb: (tx: { query: unknown }) => unknown) => cb({ query })) };
});
jest.mock('@/lib/email/sendEmail', () => ({ sendEmail: jest.fn(async () => ({ success: true })) }));
jest.mock('@/lib/team/teamMembership', () => ({
  resolveTeamIdForInviter: jest.fn(),
  addMemberToTeam: jest.fn(async () => true),
  canInviteToTeam: jest.fn(async () => true),
  isTeamMember: jest.fn(async () => true),
}));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { canInviteToTeam, isTeamMember, addMemberToTeam } from '@/lib/team/teamMembership';
import { POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockCanInvite = canInviteToTeam as jest.Mock;
const mockIsMember = isTeamMember as jest.Mock;

const INVITER = '11111111-1111-1111-1111-111111111111';
const TEAM = '22222222-2222-2222-2222-222222222222';

const req = (body: unknown) =>
  new NextRequest('http://localhost/api/team/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue(INVITER);
  mockCanInvite.mockResolvedValue(true);
  mockIsMember.mockResolvedValue(true);
  /* SQL-aware default: every lookup finds nothing (so the "new person" branch
     runs) while INSERT ... RETURNING yields a row, as the real table would.
     A blanket empty result would make the route throw on its own INSERT and
     report a harness gap as a route defect. */
  mockQuery.mockImplementation(async (sql: string) => {
    const text = String(sql);
    if (/INSERT INTO team_invites/i.test(text)) {
      return { rows: [{ id: 'invite-1', token: 'tok-1' }], rowCount: 1 };
    }
    if (/SELECT name, username FROM members/i.test(text)) {
      return { rows: [{ name: 'Kelly', username: 'kelly' }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  });
});

describe('B · an invitation must name its Co-Lab', () => {
  it('refuses an invite with no teamId rather than inferring one', async () => {
    const res = await POST(req({ email: 'tester@example.com' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/teamId is required/i);
  });

  it('never writes an invite row when the destination is missing', async () => {
    await POST(req({ email: 'tester@example.com' }));
    const writes = mockQuery.mock.calls.filter((c) => /INSERT INTO team_invites/i.test(String(c[0])));
    expect(writes).toHaveLength(0);
  });
});

describe('C · only an owner or admin of THAT Co-Lab may invite', () => {
  it('refuses a member who is not admin+ in the destination team', async () => {
    mockCanInvite.mockResolvedValue(false);
    const res = await POST(req({ email: 't@example.com', teamId: TEAM, role: 'admin' }));
    expect(res.status).toBe(403);
    expect(mockQuery.mock.calls.filter((c) => /INSERT INTO team_invites/i.test(String(c[0])))).toHaveLength(0);
  });

  it('asks about the named team, not merely about membership somewhere', async () => {
    await POST(req({ email: 't@example.com', teamId: TEAM }));
    expect(mockCanInvite).toHaveBeenCalledWith(TEAM, INVITER);
  });
});

describe('D · a pending invite is identified by email AND destination', () => {
  it('scopes the pending-invite lookup to the destination team', async () => {
    await POST(req({ email: 't@example.com', teamId: TEAM }));
    const lookup = mockQuery.mock.calls.find((c) =>
      /SELECT id, token FROM team_invites/i.test(String(c[0]))
    );
    expect(lookup).toBeDefined();
    expect(String(lookup![0])).toMatch(/team_id\s*=\s*\$2/);
    expect(lookup![1]).toEqual(['t@example.com', TEAM]);
  });
});

describe('F · an existing member is only reported as added when membership is observed', () => {
  const asExistingMember = () => {
    mockQuery.mockImplementation(async (sql: string) => {
      const text = String(sql);
      if (/SELECT name, username FROM members/i.test(text)) {
        return { rows: [{ name: 'Kelly', username: 'kelly' }], rowCount: 1 };
      }
      if (/SELECT id FROM members WHERE LOWER\(email\)/i.test(text)) {
        return { rows: [{ id: '33333333-3333-3333-3333-333333333333' }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
  };

  it('fails closed when the member did not actually land in the team', async () => {
    asExistingMember();
    mockIsMember.mockResolvedValue(false);
    const res = await POST(req({ email: 't@example.com', teamId: TEAM }));
    expect(res.status).toBe(500);
  });

  it('adds to the named team, never an inferred one', async () => {
    asExistingMember();
    await POST(req({ email: 't@example.com', teamId: TEAM }));
    expect(addMemberToTeam).toHaveBeenCalledWith(TEAM, expect.any(String), 'member');
  });
});
