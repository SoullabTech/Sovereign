/**
 * Member lifecycle — DB-backed integration test
 *
 * Verifies the core safety claims against the local Postgres DB:
 *   - an active member can mint a session
 *   - DISABLING a member revokes live sessions AND blocks new session mints
 *   - ARCHIVING a member also blocks session mints
 *   - RESTORING (active) re-enables sign-in
 *   - setMemberStatus on an unknown member reports notFound (no throw)
 *
 * These are the guarantees behind "disabled / archived members cannot sign in."
 *
 * Run:
 *   DATABASE_URL=postgresql://soullab@localhost:5432/maia_consciousness \
 *     npx jest __tests__/member-lifecycle.test.ts --forceExit
 */

import { query } from '../lib/db/postgres';
import { createSession, validateSession, MemberNotActiveError } from '../lib/auth/serverSessions';
import { setMemberStatus, getMemberLifecycle, isMemberStatus } from '../lib/members/lifecycle';

const MARKER = `__lifecycle_test_${Date.now()}`;
let memberId = '';

beforeAll(async () => {
  const res = await query(
    `INSERT INTO members (passkey, username, password_hash, name, email, onboarded)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING id`,
    [MARKER, MARKER, 'not-a-real-hash', 'Lifecycle Test', `${MARKER}@example.invalid`]
  );
  memberId = res.rows[0].id;
});

afterAll(async () => {
  if (memberId) {
    await query(`DELETE FROM auth_sessions WHERE member_id = $1`, [memberId]);
    await query(`DELETE FROM members WHERE id = $1`, [memberId]);
  }
});

test('status helpers + new member defaults to active', async () => {
  expect(isMemberStatus('disabled')).toBe(true);
  expect(isMemberStatus('nope')).toBe(false);
  const lc = await getMemberLifecycle(memberId);
  expect(lc?.status).toBe('active');
});

test('active member can mint and validate a session', async () => {
  await setMemberStatus(memberId, 'active');
  const session = await createSession({ memberId });
  expect(session.sessionToken).toHaveLength(64);
  const validated = await validateSession(session.sessionToken);
  expect(validated?.memberId).toBe(memberId);
});

test('disabling revokes live sessions and blocks new mints', async () => {
  await setMemberStatus(memberId, 'active');
  const live = await createSession({ memberId }); // a live session to be revoked

  const result = await setMemberStatus(memberId, 'disabled', null, 'unit test');
  expect(result.ok).toBe(true);
  expect(result.status).toBe('disabled');
  expect(result.previousStatus).toBe('active');
  expect(result.revokedSessions).toBeGreaterThanOrEqual(1);

  // the previously-live session is now revoked
  expect(await validateSession(live.sessionToken)).toBeNull();

  // and no new session can be minted
  await expect(createSession({ memberId })).rejects.toBeInstanceOf(MemberNotActiveError);

  // reason + actor were recorded
  const lc = await getMemberLifecycle(memberId);
  expect(lc?.status).toBe('disabled');
  expect(lc?.statusReason).toBe('unit test');
});

test('archiving also blocks session mints', async () => {
  await setMemberStatus(memberId, 'active');
  const result = await setMemberStatus(memberId, 'archived');
  expect(result.status).toBe('archived');
  await expect(createSession({ memberId })).rejects.toBeInstanceOf(MemberNotActiveError);
});

test('restoring to active re-enables sign-in', async () => {
  await setMemberStatus(memberId, 'disabled');
  const result = await setMemberStatus(memberId, 'active');
  expect(result.ok).toBe(true);
  expect(result.status).toBe('active');
  const session = await createSession({ memberId });
  expect(session.sessionToken).toHaveLength(64);
});

test('setMemberStatus on unknown member returns notFound (no throw)', async () => {
  const result = await setMemberStatus('00000000-0000-4000-8000-000000000000', 'disabled');
  expect(result.ok).toBe(false);
  expect(result.notFound).toBe(true);
  expect(result.revokedSessions).toBe(0);
});
