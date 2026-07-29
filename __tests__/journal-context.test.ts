// Make this file a module so top-level `const`s are file-scoped (not global) —
// prevents TS2451 redeclaration collisions with sibling test files.
export {};

/**
 * Journal Context Regression Tests
 *
 * Pins the contracts for the journal read path:
 *
 *   1. GET /api/journal/quick/list — identity comes from the verified session.
 *      A bare `x-member-id` header or a `?userId=` query param is a
 *      caller-supplied claim and is refused with 401.
 *      (Superseded the 2026-03-02 contract, which accepted both — see the note
 *      on that describe block.)
 *
 *   2. loadJournals() in SignificantMomentsService — was querying a phantom
 *      `journal_entries` table. Now queries quick_journal_entries.
 *      The 🕸️ [CONTEXT] log confirms journals > 0 for recognised members.
 *
 * Run: npx jest __tests__/journal-context.test.ts
 *
 * For contract (2) to pass you need a member UUID that has at least one
 * entry in quick_journal_entries. Set TEST_MEMBER_ID in env, or the test
 * is skipped gracefully.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_MEMBER_ID = process.env.TEST_MEMBER_ID || '';
// The data contract now needs a real session, not a member id: a bare
// `x-member-id` header no longer identifies anyone. Set TEST_SESSION_TOKEN to a
// live auth_sessions token for the member named by TEST_MEMBER_ID.
const TEST_SESSION_TOKEN = process.env.TEST_SESSION_TOKEN || '';

// ─────────────────────────────────────────────────────────────────────────────
// Contract 1: Reflections GET endpoint auth semantics
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SUPERSEDED 2026-07-28 — this block previously pinned the opposite contract.
 *
 * It asserted that a bare `x-member-id` header returned 200, and that a
 * `?userId=` query param returned 200, describing both as the fix for the
 * Reflections page. Both are caller-supplied claims: honouring them meant any
 * caller could read any member's journal by naming their id. The test was
 * holding the vulnerability in place as though it were the specification.
 *
 * The contract is now: identity comes from the verified session, and nothing
 * else establishes it. The Reflections page keeps working because its client
 * (apiFetch) sends session credentials, not because the server trusts a header.
 */
describe('GET /api/journal/quick/list — auth contract', () => {
  test('no credentials → 401', async () => {
    const res = await fetch(`${BASE_URL}/api/journal/quick/list`);
    expect(res.status).toBe(401);
  });

  test('bare x-member-id header → 401 (an unverified claim is not identity)', async () => {
    const res = await fetch(`${BASE_URL}/api/journal/quick/list`, {
      headers: { 'x-member-id': '00000000-0000-0000-0000-000000000000' },
    });
    expect(res.status).toBe(401);
  });

  test('?userId= query param → 401 (naming a member does not authenticate as one)', async () => {
    const res = await fetch(
      `${BASE_URL}/api/journal/quick/list?userId=00000000-0000-0000-0000-000000000000`
    );
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Contract 2: Journal entries returned for a real member
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/journal/quick/list — data contract', () => {
  const skip = !TEST_SESSION_TOKEN;

  test('returns entries for the session member', async () => {
    if (skip) {
      console.log('Skipped: set TEST_SESSION_TOKEN (and TEST_MEMBER_ID) to exercise the authenticated path');
      return;
    }

    const res = await fetch(`${BASE_URL}/api/journal/quick/list`, {
      headers: { 'x-session-token': TEST_SESSION_TOKEN },
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.entries.length).toBeGreaterThan(0);

    // Entry shape
    const entry = data.entries[0];
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('content');
    expect(entry).toHaveProperty('entry_type');
    expect(entry).toHaveProperty('created_at');
  });

  test('dream entries are typed correctly', async () => {
    if (skip) return;

    const res = await fetch(
      `${BASE_URL}/api/journal/quick/list?type=dream`,
      { headers: { 'x-session-token': TEST_SESSION_TOKEN } }
    );
    expect(res.status).toBe(200);

    const data = await res.json();
    if (data.entries.length > 0) {
      expect(data.entries.every((e: any) => e.entry_type === 'dream')).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Contract 3: MAIA sovereign route includes journal context
// ─────────────────────────────────────────────────────────────────────────────
// This is a structural check only — we verify the route accepts the request
// without erroring. Full behavioural verification requires a live session.

describe('POST /api/sovereign/app/maia/list — reachability', () => {
  test('route responds (not 404)', async () => {
    // A minimal body — will be rejected for auth reasons but must not 404
    const res = await fetch(`${BASE_URL}/api/sovereign/app/maia/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'ping', userId: 'probe', sessionId: 'probe' }),
    });
    // Any response other than 404/405 means the route exists
    expect(res.status).not.toBe(404);
    expect(res.status).not.toBe(405);
  });
});
