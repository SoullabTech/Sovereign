import { NextRequest } from 'next/server';
import db from '@/lib/db/postgres';
import { getTeamRole } from '@/lib/auth/teamPermissions';
import { resolveDecisionActor } from '@/lib/studio/decisions/access';
import { GET, POST } from '../route';

jest.mock('@/lib/db/postgres', () => ({ __esModule: true, default: { query: jest.fn() } }));
jest.mock('@/lib/auth/teamPermissions', () => ({ getTeamRole: jest.fn() }));
jest.mock('@/lib/studio/decisions/access', () => {
  const actual = jest.requireActual('@/lib/studio/decisions/access');
  return { ...actual, resolveDecisionActor: jest.fn() };
});

const q = db.query as jest.Mock;
const actor = resolveDecisionActor as jest.Mock;
const teamRole = getTeamRole as jest.Mock;
const memberOnly = { memberId: 'member-a', practitionerId: null };
const practitioner = { memberId: 'member-b', practitionerId: 'practice-b' };

function req(method: string, body?: unknown, suffix = '') {
  return new NextRequest('http://localhost:3197/api/studio/decisions' + suffix, {
    method, headers: { 'content-type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

beforeEach(() => {
  jest.resetAllMocks();
  actor.mockResolvedValue(memberOnly);
  teamRole.mockResolvedValue(null);
});

describe('personal/practice Decision API membrane', () => {
  test('personal create rejects client and team context before persistence', async () => {
    const res = await POST(req('POST', {
      scope: 'personal', title: 'Choose', context: 'Context', clientId: 'client-x',
      teamId: 'team-x', situationType: 'self',
    }));
    expect(res.status).toBe(400);
    expect(q).not.toHaveBeenCalled();
  });

  test('personal create persists member ownership with professional fields null', async () => {
    q.mockResolvedValueOnce({ rows: [{ id:'d1', decision_scope:'personal',
      personal_member_id:'member-a', practitioner_id:null, client_id:null, team_id:null,
      title:'Choose', context:'Context', status:'draft', questions_for_leader:[] }] });
    const res = await POST(req('POST', {
      scope:'personal', title:'Choose', context:'Context', situationType:'self',
    }));
    expect(res.status).toBe(200);
    const [, params] = q.mock.calls[0];
    expect(params.slice(1, 7)).toEqual(['personal','member-a',null,'member-a',null,null]);
  });

  test('practice create is unavailable without practitioner identity', async () => {
    const res = await POST(req('POST', {
      scope:'practice', title:'Practice choice', context:'Context', situationType:'individual',
    }));
    expect(res.status).toBe(403);
    expect(q).not.toHaveBeenCalled();
  });

  test('practice create rejects a foreign client', async () => {
    actor.mockResolvedValue(practitioner);
    q.mockResolvedValueOnce({ rows: [] });
    const res = await POST(req('POST', {
      scope:'practice', title:'Practice choice', context:'Context',
      clientId:'client-x', situationType:'individual',
    }));
    expect(res.status).toBe(403);
    expect(q.mock.calls[0][0]).toContain('practitioner_clients');
  });

  test('practice create rejects a team when the member lacks write authority', async () => {
    actor.mockResolvedValue(practitioner);
    teamRole.mockResolvedValue('viewer');
    const res = await POST(req('POST', {
      scope:'practice', title:'Practice choice', context:'Context',
      teamId:'team-x', situationType:'individual',
    }));
    expect(res.status).toBe(403);
    expect(q).not.toHaveBeenCalled();
  });

  test('personal list is explicitly scoped to member ownership', async () => {
    q.mockResolvedValueOnce({ rows: [] });
    const res = await GET(req('GET', undefined, '?scope=personal'));
    expect(res.status).toBe(200);
    expect(q.mock.calls[0][0]).toContain("d.decision_scope = $1");
    expect(q.mock.calls[0][0]).toContain('d.personal_member_id = $2');
    expect(q.mock.calls[0][1].slice(0, 2)).toEqual(['personal','member-a']);
  });
});
