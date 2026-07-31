/**
 * Lane V — acceptance walk against a REAL local database.
 *
 * Unlike the unit tests, nothing here is mocked except member identity: the
 * real route handlers run, the real SQL executes, and the assertions are made
 * against rows that actually exist. This is what proves the capability rather
 * than describing it.
 *
 * FIXTURE POLICY: synthetic only. No existing member's record is used for
 * acceptance testing. Every row created here is prefixed `lane-v-acceptance-`
 * and removed in afterAll, whether the walk passes or fails.
 *
 * Run (opt-in — needs a local postgres; excluded from ordinary suites):
 *   LANE_V_WALK=1 npx jest --config jest.config.js \
 *     __tests__/lane-v-acceptance-walk.test.ts
 *
 * Manual cleanup, if a run is killed mid-walk:
 *   psql -U soullab -d maia_consciousness \
 *     -c "DELETE FROM members WHERE username LIKE 'lane-v-acceptance-%';"
 *   (member_field_note_threads and _events cascade on member delete.)
 */

const mockGetSession = jest.fn();
jest.mock('@/lib/auth/serverSessions', () => ({
  getCurrentSession: (...args: any[]) => mockGetSession(...args),
}));

const mockGetMemberId = jest.fn();
jest.mock('@/lib/scribe/scribeAuth', () => ({
  getMemberIdFromRequest: (...args: any[]) => mockGetMemberId(...args),
}));

// Arrival resolution is a separate concern riding the same GET; stub it so the
// walk cannot fail on unrelated catalog state.
jest.mock('@/lib/practiceField/programPositionService', () => ({
  resolveArrival: async () => null,
}));

import { query, closePool } from '@/lib/db/postgres';
import { GET } from '@/app/api/now-what/field-note/route';
import { PATCH } from '@/app/api/now-what/field-note/[id]/route';

const TAG = 'lane-v-acceptance';
const CONTENT = 'Synthetic visibility-withdrawal acceptance record';

let memberId = '';
let otherMemberId = '';
let threadId = '';

const run = process.env.LANE_V_WALK === '1' ? describe : describe.skip;

/** The practitioner's read, verbatim from app/studio/fields/[memberId]/page.tsx. */
async function practitionerSees(mid: string): Promise<string[]> {
  const res = await query<{ id: string }>(
    `SELECT id, title, authorship, member_decision, spiralogic_phase, created_at
       FROM member_field_note_threads
      WHERE member_id = $1
        AND released_at IS NULL
        AND can_be_shown_to_practitioner = TRUE
      ORDER BY
        CASE WHEN spiralogic_phase IS NULL THEN 1 ELSE 0 END,
        created_at ASC
      LIMIT 500`,
    [mid],
  );
  return res.rows.map(r => r.id);
}

/** The member's own field, through the real GET handler. */
async function memberSees(mid: string): Promise<string[]> {
  mockGetSession.mockResolvedValue({ memberId: mid });
  const req: any = { nextUrl: { searchParams: new URLSearchParams() } };
  const res: any = await GET(req);
  const json = await res.json();
  return (json.threads ?? []).map((t: any) => t.id);
}

async function withdraw(actingMemberId: string, id: string) {
  mockGetSession.mockResolvedValue({ memberId: actingMemberId });
  const res: any = await PATCH(
    { json: async () => ({ action: 'withdraw_practitioner_visibility' }) } as any,
    { params: Promise.resolve({ id }) },
  );
  return { status: res.status, body: await res.json() };
}

async function seedMember(suffix: string): Promise<string> {
  const res = await query<{ id: string }>(
    `INSERT INTO members (passkey, username, password_hash, name)
     VALUES ($1, $2, 'not-a-real-hash', $3) RETURNING id`,
    [`${TAG}-key-${suffix}`, `${TAG}-${suffix}`, `Lane V Synthetic ${suffix}`],
  );
  return res.rows[0].id;
}

beforeAll(async () => {
  if (process.env.LANE_V_WALK !== '1') return;
  mockGetMemberId.mockResolvedValue(null);

  memberId = await seedMember('member');
  otherMemberId = await seedMember('intruder');

  const t = await query<{ id: string }>(
    `INSERT INTO member_field_note_threads
       (member_id, title, content, authorship, is_directly_stated, member_confirmed,
        member_decision, consent_state, can_be_remembered,
        can_be_shown_to_practitioner, confirmed_at, spiralogic_phase)
     VALUES ($1, $2, $2, 'member_authored', TRUE, TRUE,
             'keep', 'member-confirmed-memory', TRUE,
             TRUE, NOW(), 'practice')
     RETURNING id`,
    [memberId, CONTENT],
  );
  threadId = t.rows[0].id;
});

afterAll(async () => {
  if (process.env.LANE_V_WALK === '1') {
    await query(`DELETE FROM members WHERE username LIKE $1`, [`${TAG}-%`]);
  }
  await closePool();
});

run('Lane V acceptance walk', () => {
  it('1 — the synthetic thread appears in the member field', async () => {
    expect(await memberSees(memberId)).toContain(threadId);
  });

  it('2 — and in the practitioner field', async () => {
    expect(await practitionerSees(memberId)).toContain(threadId);
  });

  it('3 — the member withdraws visibility', async () => {
    const { status, body } = await withdraw(memberId, threadId);
    expect(status).toBe(200);
    expect(body).toMatchObject({ ok: true, can_be_shown_to_practitioner: false, changed: true });
  });

  it('4 — it remains in the member field afterward', async () => {
    // The defining invariant: withdrawal changes who may see it, nothing else.
    expect(await memberSees(memberId)).toContain(threadId);

    const row = await query<{ released_at: string | null; consent_state: string; title: string }>(
      `SELECT released_at, consent_state, title FROM member_field_note_threads WHERE id = $1`,
      [threadId],
    );
    expect(row.rows[0].released_at).toBeNull();
    expect(row.rows[0].consent_state).toBe('member-confirmed-memory');
    expect(row.rows[0].title).toBe(CONTENT);
  });

  it('5 — it disappears from the practitioner field on the next request', async () => {
    expect(await practitionerSees(memberId)).not.toContain(threadId);
  });

  it('6 — a second withdrawal is harmless', async () => {
    const { status, body } = await withdraw(memberId, threadId);
    expect(status).toBe(200);
    expect(body).toMatchObject({ ok: true, changed: false });
    expect(await memberSees(memberId)).toContain(threadId);
  });

  it('7 — another member cannot mutate it', async () => {
    // Re-share so a successful intrusion would be visible as a state change.
    await query(
      `UPDATE member_field_note_threads SET can_be_shown_to_practitioner = TRUE WHERE id = $1`,
      [threadId],
    );

    const { status } = await withdraw(otherMemberId, threadId);
    expect(status).toBe(404);

    // Untouched by the intruder.
    expect(await practitionerSees(memberId)).toContain(threadId);
  });

  /**
   * Known Stage 2 gap, asserted so it is recorded rather than assumed.
   * This is NOT a product failure — the accurate event type is not yet in the
   * ledger's CHECK constraint, and that constraint is substrate owned by an
   * open PR. When Stage 2 lands, this expectation inverts.
   */
  it('STAGE 2 GAP — the withdrawal writes no ledger event yet', async () => {
    const events = await query<{ event_type: string }>(
      `SELECT event_type FROM member_field_note_events WHERE member_id = $1`,
      [memberId],
    );
    expect(events.rows).toHaveLength(0);
  });
});
