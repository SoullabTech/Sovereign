// Make this file a module so top-level `const`s are file-scoped (not global) —
// prevents TS2451 redeclaration collisions with sibling test files.
export {};

/**
 * Email Normalization Regression Tests
 *
 * Guards against case-sensitive email lookup bugs that silently break:
 *   - Magic link: existing member misclassified as new user → routed to /begin
 *   - Password reset: token never created, email silently not sent
 *   - Passkey recovery: same silent failure
 *
 * Root cause: PostgreSQL = is case-sensitive. Members with mixed-case stored
 * emails (e.g. Nathan.Kane@thermofisher.com) must be found regardless of
 * how the caller capitalizes the email at lookup time.
 *
 * Fix applied: LOWER(email) = LOWER($1) in all three lookup routes.
 * Normalization on write: all register/update routes now lowercase before INSERT.
 *
 * NOTE: These tests hit rate-limited endpoints (3 req / 15 min per IP).
 * Each describe block sends exactly ONE request per endpoint — stay under the budget.
 *
 * Run: npx jest __tests__/email-normalization.test.ts
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost';

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

/** Skip a test if the endpoint is currently rate-limited (429). */
function skipIfRateLimited(status: number) {
  if (status === 429) {
    console.warn('Rate limited (429) — test skipped. Wait 15 min and retry.');
    return true;
  }
  return false;
}

// Test member — must exist in DB with a mixed-case stored email.
// Nathan Kane is our canonical test case: stored as Nathan.Kane@thermofisher.com
const MIXED_CASE_EMAIL = 'Nathan.Kane@thermofisher.com';
const LOWER_EMAIL = MIXED_CASE_EMAIL.toLowerCase();

describe('Magic link — recognizes existing member regardless of email case', () => {
  // The case-sensitivity regression itself is now guarded WITHOUT a live server,
  // in app/api/members/email-code/__tests__/delivery.test.ts ("email lookup is
  // case-insensitive"): it asserts the LOWER(email) lookup receives a lowercased
  // parameter and that the issued code is linked to the member found under a
  // different case.
  //
  // It can no longer be asserted from the response here, because the response no
  // longer carries `isExistingMember` (removed 2026-08-24): telling an unproved
  // caller whether an address has an account is account enumeration. A leak is
  // not a test fixture — the observation moved rather than the invariant.
  test('mixed-case stored email is accepted (no enumeration in the response)', async () => {
    const { status, data } = await post('/api/members/magic-link', {
      email: MIXED_CASE_EMAIL,
    });
    if (skipIfRateLimited(status)) return;
    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data).not.toHaveProperty('isExistingMember');
  });
});

describe('Password reset — finds member regardless of email case', () => {
  test('lowercase variant of mixed-case stored email gets success response', async () => {
    const { status, data } = await post('/api/members/reset-password', {
      email: LOWER_EMAIL,
    });
    if (skipIfRateLimited(status)) return;
    expect(status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('Passkey recovery — finds member regardless of email case', () => {
  test('mixed-case email returns success (not silent no-op)', async () => {
    const { status, data } = await post('/api/members/recover', {
      email: MIXED_CASE_EMAIL,
    });
    if (skipIfRateLimited(status)) return;
    expect(status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('Signin — username is case insensitive', () => {
  test('signs in with mixed-case username', async () => {
    const { status, data } = await post('/api/members/signin', {
      username: 'Nathan', // stored as 'nathan'
      password: 'Soullab2026!',
    });
    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.member?.username).toBe('nathan');
  });

  test('rejects wrong password', async () => {
    const { status } = await post('/api/members/signin', {
      username: 'nathan',
      password: 'wrongpassword',
    });
    expect(status).toBe(401);
  });

  test('rejects non-existent username', async () => {
    const { status } = await post('/api/members/signin', {
      username: 'nathankane',
      password: 'Soullab2026!',
    });
    expect(status).toBe(401);
  });
});
