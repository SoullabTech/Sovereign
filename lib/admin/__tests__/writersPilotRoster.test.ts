import fs from 'node:fs';
import path from 'node:path';
import {
  buildPilotRoster,
  deriveInviteStage,
  deriveMemberStage,
  type PilotInviteRow,
  type PilotMemberRow,
} from '../writersPilotRoster';

const NOW = new Date('2026-11-04T12:00:00Z');

function member(over: Partial<PilotMemberRow> = {}): PilotMemberRow {
  return {
    id: 'm1',
    name: 'Test Writer',
    username: 'tester',
    created_at: '2026-11-03T10:00:00Z',
    last_sign_in: null,
    studio_access: true,
    works: 0,
    revisions: 0,
    revisions_7d: 0,
    last_revision_at: null,
    readings: 0,
    last_reading_at: null,
    asks: 0,
    last_ask_at: null,
    ...over,
  };
}

function invite(over: Partial<PilotInviteRow> = {}): PilotInviteRow {
  return {
    id: 'i1',
    intended_name: 'Invited Writer',
    intended_email: 'w@example.com',
    status: 'pending',
    expires_at: '2026-12-03T00:00:00Z',
    created_at: '2026-11-02T00:00:00Z',
    ...over,
  };
}

describe('Writer’s Studio pilot roster', () => {
  it('a member with no recorded activity is signed up, not disengaged', () => {
    expect(deriveMemberStage(member(), NOW)).toBe('signed_up');
  });

  it('a member with a work or saves but nothing recent has started writing', () => {
    expect(deriveMemberStage(member({ works: 1 }), NOW)).toBe('started_writing');
    expect(
      deriveMemberStage(member({ revisions: 3, last_revision_at: '2026-10-20T00:00:00Z' }), NOW),
    ).toBe('started_writing');
  });

  it('activity inside the window is engaging, from any of the three sources', () => {
    expect(deriveMemberStage(member({ last_revision_at: '2026-11-03T00:00:00Z', revisions: 1 }), NOW)).toBe('engaging');
    expect(deriveMemberStage(member({ last_reading_at: '2026-11-02T00:00:00Z', readings: 1 }), NOW)).toBe('engaging');
    expect(deriveMemberStage(member({ last_ask_at: '2026-11-04T09:00:00Z', asks: 1 }), NOW)).toBe('engaging');
  });

  it('numeric strings from the database are counted', () => {
    expect(deriveMemberStage(member({ works: '2' }), NOW)).toBe('started_writing');
  });

  it('an unredeemed invite is invited until it expires', () => {
    expect(deriveInviteStage(invite(), NOW)).toBe('invited');
    expect(deriveInviteStage(invite({ expires_at: '2026-11-01T00:00:00Z' }), NOW)).toBe('invite_expired');
    expect(deriveInviteStage(invite({ status: 'expired' }), NOW)).toBe('invite_expired');
  });

  it('summary counts every stage and flags signed-up writers without Studio access', () => {
    const { entries, summary } = buildPilotRoster(
      [
        member({ id: 'a', name: 'A', last_revision_at: '2026-11-04T00:00:00Z', revisions: 1 }),
        member({ id: 'b', name: 'B', works: 1 }),
        member({ id: 'c', name: 'C', studio_access: false }),
      ],
      [invite({ id: 'x' }), invite({ id: 'y', expires_at: '2026-11-01T00:00:00Z' })],
      NOW,
    );
    expect(summary).toEqual({
      total: 5,
      invited: 1,
      inviteExpired: 1,
      signedUp: 1,
      startedWriting: 1,
      engaging: 1,
      awaitingAccess: 1,
    });
    expect(entries.map((e) => e.stage)).toEqual([
      'engaging',
      'started_writing',
      'signed_up',
      'invited',
      'invite_expired',
    ]);
  });

  it('exposes no field that could carry anyone’s writing', () => {
    const { entries } = buildPilotRoster([member({ works: 1 })], [invite()], NOW);
    for (const e of entries) {
      expect(Object.keys(e).sort()).toEqual(
        [
          'asks', 'email', 'inviteExpiresAt', 'joinedAt', 'key', 'kind', 'lastActivityAt', 'lastSignIn',
          'name', 'readings', 'revisions', 'revisions7d', 'stage', 'studioAccess', 'username', 'works',
        ].sort(),
      );
    }
  });
});

describe('pilot roster route boundary', () => {
  const route = fs.readFileSync(
    path.join(process.cwd(), 'app/api/admin/monitor/writers-pilot/route.ts'),
    'utf8',
  );
  // Strip comments so the header that documents the ban does not trip the scan.
  const code = route.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('is admin gated', () => {
    expect(code).toContain('checkAdminAuth');
  });

  it('never selects content-bearing columns', () => {
    expect(code).not.toMatch(/\b(content|body|observations|read_state|answer_provenance)\b/i);
    expect(code).not.toMatch(/SELECT[^;]*\bt\.body\b/i);
  });
});
