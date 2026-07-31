/**
 * Lane V — withdraw practitioner visibility (Now What?).
 *
 * The defect this closes: /now-what/field and /now-what/questions disclose
 * "· shared with your practitioner" while offering no authority over that
 * visibility. These tests exercise the defect condition directly — not merely
 * that a route exists, but that the withdrawal (a) actually flips the column
 * the practitioner query reads, (b) leaves the member's own relationship to
 * the thread untouched, and (c) cannot be performed against someone else's
 * thread.
 *
 * Run: npx jest __tests__/now-what-withdraw-practitioner-visibility.test.ts
 */

import fs from 'fs';
import path from 'path';

const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: any[]) => mockQuery(...args),
}));

const mockGetSession = jest.fn();
jest.mock('@/lib/auth/serverSessions', () => ({
  getCurrentSession: (...args: any[]) => mockGetSession(...args),
}));

const mockGetMemberId = jest.fn();
jest.mock('@/lib/scribe/scribeAuth', () => ({
  getMemberIdFromRequest: (...args: any[]) => mockGetMemberId(...args),
}));

import { PATCH } from '@/app/api/now-what/field-note/[id]/route';

const MEMBER = 'member-aaaa';
const OTHER_MEMBER = 'member-zzzz';
const THREAD = 'thread-1111';

const WITHDRAW = { action: 'withdraw_practitioner_visibility' };

function req(body: any): any {
  return { json: async () => body };
}
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

/** SELECT responses are keyed off the row state we want the DB to report. */
function selectReturns(row: { id: string; can_be_shown_to_practitioner: boolean } | null) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (/^\s*SELECT/i.test(sql)) return { rows: row ? [row] : [] };
    return { rows: [] };
  });
}

const updates = () =>
  mockQuery.mock.calls.filter(([sql]) => /^\s*UPDATE/i.test(sql));

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSession.mockResolvedValue({ memberId: MEMBER });
  mockGetMemberId.mockResolvedValue(null);
});

describe('authorization', () => {
  it('refuses an unauthenticated request', async () => {
    mockGetSession.mockResolvedValue(null);
    mockGetMemberId.mockResolvedValue(null);

    const res: any = await PATCH(req(WITHDRAW), ctx(THREAD));

    expect(res.status).toBe(401);
    expect(updates()).toHaveLength(0);
  });

  it("cannot withdraw visibility from another member's thread", async () => {
    // The DB reports no row, because the ownership SELECT is scoped by member_id.
    selectReturns(null);

    const res: any = await PATCH(req(WITHDRAW), ctx(THREAD));

    expect(res.status).toBe(404);
    expect(updates()).toHaveLength(0);

    // And the ownership check must actually be member-scoped, not id-only.
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toMatch(/WHERE\s+id\s*=\s*\$1\s+AND\s+member_id\s*=\s*\$2/i);
    expect(params).toEqual([THREAD, MEMBER]);
  });

  it('rejects an unsupported action without touching the row', async () => {
    const res: any = await PATCH(req({ action: 'release' }), ctx(THREAD));

    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe('withdrawal', () => {
  it('flips can_be_shown_to_practitioner to FALSE for the owning member', async () => {
    selectReturns({ id: THREAD, can_be_shown_to_practitioner: true });

    const res: any = await PATCH(req(WITHDRAW), ctx(THREAD));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({ ok: true, can_be_shown_to_practitioner: false, changed: true });

    const [[sql, params]] = updates();
    expect(sql).toMatch(/SET\s+can_be_shown_to_practitioner\s*=\s*FALSE/i);
    expect(sql).toMatch(/WHERE\s+id\s*=\s*\$1\s+AND\s+member_id\s*=\s*\$2/i);
    expect(params).toEqual([THREAD, MEMBER]);
  });

  /**
   * Kelly's ruled invariant, encoded: withdrawing practitioner visibility
   * changes only WHO MAY SEE the thread. If a future edit makes this UPDATE
   * also release, archive, or re-time the thread, this test fails.
   */
  it("does not alter the member's own relationship to the thread", async () => {
    selectReturns({ id: THREAD, can_be_shown_to_practitioner: true });

    await PATCH(req(WITHDRAW), ctx(THREAD));

    const [[sql]] = updates();
    for (const forbidden of [
      'released_at',
      'consent_state',
      'can_be_remembered',
      'member_decision',
      'created_at',
      'title',
      'content',
      'DELETE',
    ]) {
      expect(sql).not.toMatch(new RegExp(forbidden, 'i'));
    }
  });

  it('is idempotent — withdrawing an already-withdrawn thread is a success and a no-op', async () => {
    selectReturns({ id: THREAD, can_be_shown_to_practitioner: false });

    const res: any = await PATCH(req(WITHDRAW), ctx(THREAD));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({ ok: true, can_be_shown_to_practitioner: false, changed: false });
    expect(updates()).toHaveLength(0);
  });
});

/**
 * The reads on either side of the boundary. These assert against the real
 * source of each surface, so that removing the practitioner-side predicate —
 * which is what would silently re-open the defect — fails here.
 */
describe('read surfaces', () => {
  const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

  it('the practitioner query is gated on can_be_shown_to_practitioner = TRUE', () => {
    const src = read('app/studio/fields/[memberId]/page.tsx');
    expect(src).toMatch(/can_be_shown_to_practitioner\s*=\s*TRUE/i);
  });

  it("the member's own field is NOT gated on practitioner visibility", () => {
    // The member must keep seeing a thread after withdrawing it. If this GET
    // ever grows a can_be_shown_to_practitioner predicate, withdrawal would
    // silently remove the thread from the member's own field.
    const src = read('app/api/now-what/field-note/route.ts');
    const getBody = src.slice(src.indexOf('export async function GET'));
    expect(getBody).not.toMatch(/WHERE[\s\S]{0,400}can_be_shown_to_practitioner\s*=\s*TRUE/i);
  });

  it('every surface that discloses practitioner visibility also offers withdrawal', () => {
    for (const p of ['app/now-what/field/page.tsx', 'app/now-what/questions/page.tsx']) {
      const src = read(p);
      if (/can_be_shown_to_practitioner/.test(src)) {
        expect(src).toMatch(/WithdrawVisibility/);
      }
    }
  });
});
