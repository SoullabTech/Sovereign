/**
 * WS2 · PASSKEY ADMISSION — the invariant, falsified.
 *
 *   A prefix determines FORMAT. A real pending, unexpired invite determines
 *   AUTHORIZATION.
 *
 * Before the repair, any string beginning SOULLAB-/MAIA-/PIONEER-/FOUNDING-
 * registered with no invitation at all, and production's invites table held
 * ZERO rows while every member had joined anyway. These tests are written so
 * that restoring the old behaviour turns them red.
 */

const mockQuery = jest.fn();

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

import { hasAcceptedPasskeyFormat, resolveAdmission } from '../passkeyAdmission';

/** No member row, and whatever invite rows the case supplies. */
function db({ member = [], invite = [] }: { member?: unknown[]; invite?: unknown[] }) {
  mockQuery.mockImplementation((sql: string) => {
    if (/FROM members/i.test(sql)) return Promise.resolve({ rows: member });
    if (/FROM invites/i.test(sql)) return Promise.resolve({ rows: invite });
    throw new Error(`unexpected query: ${sql}`);
  });
}

const PENDING = [{
  id: 'inv-1', status: 'pending', expires_at: new Date(Date.now() + 864e5).toISOString(),
  created_by: 'member-9', inviter_username: 'nathan', inviter_name: 'Nathan',
}];

beforeEach(() => mockQuery.mockReset());

describe('format is not authority', () => {
  it.each(['SOULLAB-ANYTHING', 'MAIA-ANYTHING', 'PIONEER-ANYTHING', 'FOUNDING-ANYTHING'])(
    '%s has an accepted FORMAT but is REFUSED without an invite', async (passkey) => {
      expect(hasAcceptedPasskeyFormat(passkey)).toBe(true);   // format: fine
      db({});                                                  // no invite exists
      const admission = await resolveAdmission(passkey);
      expect(admission).toEqual({ kind: 'refused', reason: 'no_invite' });
    },
  );

  it('refuses a passkey that is not even the right shape', async () => {
    db({});
    expect(await resolveAdmission('HELLO-THERE')).toEqual({ kind: 'refused', reason: 'bad_format' });
  });

  it('never consults the database for a bad format', async () => {
    db({});
    await resolveAdmission('HELLO-THERE');
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe('a real invite admits', () => {
  it('admits a pending, unexpired invite and carries its identity', async () => {
    db({ invite: PENDING });
    expect(await resolveAdmission('SOULLAB-AB2CD-EF3GH-JK4M')).toEqual({
      kind: 'admit', inviteId: 'inv-1', createdBy: 'member-9',
      inviterUsername: 'nathan', inviterName: 'Nathan',
    });
  });

  it('normalizes case and whitespace before looking anything up', async () => {
    db({ invite: PENDING });
    const admission = await resolveAdmission('  soullab-ab2cd-ef3gh-jk4m  ');
    expect(admission.kind).toBe('admit');
    expect(mockQuery.mock.calls.every(([, p]) => (p as string[])[0] === 'SOULLAB-AB2CD-EF3GH-JK4M')).toBe(true);
  });
});

describe('a spent or stale invite does not admit', () => {
  it('refuses a redeemed invite, naming its status', async () => {
    db({ invite: [{ ...PENDING[0], status: 'redeemed' }] });
    expect(await resolveAdmission('SOULLAB-X')).toEqual({
      kind: 'refused', reason: 'invite_not_pending', status: 'redeemed',
    });
  });

  it('refuses a revoked invite', async () => {
    db({ invite: [{ ...PENDING[0], status: 'revoked' }] });
    expect((await resolveAdmission('SOULLAB-X')).kind).toBe('refused');
  });

  it('refuses an expired invite', async () => {
    db({ invite: [{ ...PENDING[0], expires_at: new Date(Date.now() - 864e5).toISOString() }] });
    expect(await resolveAdmission('SOULLAB-X')).toEqual({ kind: 'refused', reason: 'invite_expired' });
  });
});

describe('an existing member is not an admission question', () => {
  it('answers existing_member before any invite lookup', async () => {
    db({ member: [{ id: 'm-1', username: 'kelly', name: 'Kelly', onboarded: true, onboarding_step: 'complete' }] });
    const admission = await resolveAdmission('SOULLAB-KELLY');
    expect(admission.kind).toBe('existing_member');
    expect(mockQuery.mock.calls.some(([sql]) => /FROM invites/i.test(sql as string))).toBe(false);
  });
});

describe('fails closed', () => {
  it('REFUSES when the invites table cannot be read — never admits on an error', async () => {
    /* The module logs the failure on purpose — an unreadable invite table is an
       outage worth seeing. Silence it here so the assertion is about the
       verdict, not the logging. */
    const silenced = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuery.mockImplementation((sql: string) => {
      if (/FROM members/i.test(sql)) return Promise.resolve({ rows: [] });
      return Promise.reject(new Error('relation "invites" does not exist'));
    });
    expect(await resolveAdmission('SOULLAB-X')).toEqual({
      kind: 'refused', reason: 'invite_lookup_unavailable',
    });
    expect(silenced).toHaveBeenCalled();
    silenced.mockRestore();
  });
});

describe('no bootstrap back door', () => {
  it('grants nothing to the legacy foundingPasskeys names', async () => {
    db({});
    for (const legacy of ['SOULLAB-CATH', 'SOULLAB-RYAN']) {
      expect(await resolveAdmission(legacy)).toEqual({ kind: 'refused', reason: 'no_invite' });
    }
  });

  it('admission never reports a role, tier or privilege of any kind', async () => {
    db({ invite: PENDING });
    const admission = await resolveAdmission('SOULLAB-X');
    const serialized = JSON.stringify(admission);
    for (const word of ['role', 'tier', 'admin', 'founder', 'founding', 'privilege']) {
      expect(serialized.toLowerCase()).not.toContain(word);
    }
  });
});
