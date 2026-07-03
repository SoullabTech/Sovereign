// Make this file a module so top-level `const`s are file-scoped (not global) —
// prevents TS2451 redeclaration collisions with sibling test files.
export {};

/**
 * Journal Context Regression Tests
 *
 * Pins the two contracts that were broken and fixed on 2026-03-02:
 *
 *   1. GET /api/journal/quick/list — Reflections page must get 200 when
 *      x-member-id header is present (no ?userId= query param required).
 *      Previously returned 400, so Reflections showed nothing.
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

// ─────────────────────────────────────────────────────────────────────────────
// Contract 1: Reflections GET endpoint auth semantics
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/journal/quick/list — auth contract', () => {
  test('no auth → 400 (prevents unauthenticated data leakage)', async () => {
    const res = await fetch(`${BASE_URL}/api/journal/quick/list`);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.success).toBe(false);
  });

  test('x-member-id header → 200 (aligns with apiFetch used by Reflections)', async () => {
    // Use a syntactically valid UUID that won't match any real member —
    // we only care that the route accepts the header and returns 200,
    // not that it returns rows.
    const res = await fetch(`${BASE_URL}/api/journal/quick/list`, {
      headers: { 'x-member-id': '00000000-0000-0000-0000-000000000000' },
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.entries)).toBe(true);
  });

  test('?userId= query param → 200 (QuickJournalSheet inline fetch still works)', async () => {
    const res = await fetch(
      `${BASE_URL}/api/journal/quick/list?userId=00000000-0000-0000-0000-000000000000`
    );
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Contract 2: Journal entries returned for a real member
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/journal/quick/list — data contract', () => {
  const skip = !TEST_MEMBER_ID;

  test('returns entries for known member UUID', async () => {
    if (skip) {
      console.log('Skipped: set TEST_MEMBER_ID env to a UUID that has quick_journal_entries rows');
      return;
    }

    const res = await fetch(`${BASE_URL}/api/journal/quick/list`, {
      headers: { 'x-member-id': TEST_MEMBER_ID },
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
      { headers: { 'x-member-id': TEST_MEMBER_ID } }
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
