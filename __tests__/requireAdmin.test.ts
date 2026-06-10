/**
 * requireAdmin — admin gate for destructive member routes.
 *
 * Proves the security boundary: a valid configured secret is required, sent via
 * x-admin-secret header or adminSecret query param; everything else is rejected.
 *
 * Run: npx jest __tests__/requireAdmin.test.ts
 */

import { isAdminRequest, requireAdmin } from '../lib/auth/requireAdmin';

function fakeReq(headers: Record<string, string> = {}, url = 'http://x/api/admin/members') {
  return {
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? headers[k] ?? null },
    url,
  } as any;
}

describe('requireAdmin', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.LABTOOLS_SECRET;
    delete process.env.LABTOOLS_ADMIN_PASSWORD;
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test('denies when no secret is configured (even with a provided value)', () => {
    expect(isAdminRequest(fakeReq({ 'x-admin-secret': 'anything' }))).toBe(false);
    const res = requireAdmin(fakeReq({ 'x-admin-secret': 'anything' }));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(500); // misconfiguration, not an auth failure
  });

  test('denies a wrong secret', () => {
    process.env.LABTOOLS_ADMIN_PASSWORD = 'correct-horse';
    expect(isAdminRequest(fakeReq({ 'x-admin-secret': 'wrong' }))).toBe(false);
    const res = requireAdmin(fakeReq({ 'x-admin-secret': 'wrong' }));
    expect(res!.status).toBe(401);
  });

  test('denies a missing secret', () => {
    process.env.LABTOOLS_ADMIN_PASSWORD = 'correct-horse';
    expect(isAdminRequest(fakeReq({}))).toBe(false);
  });

  test('accepts the correct secret via x-admin-secret header (LABTOOLS_ADMIN_PASSWORD)', () => {
    process.env.LABTOOLS_ADMIN_PASSWORD = 'correct-horse';
    expect(isAdminRequest(fakeReq({ 'x-admin-secret': 'correct-horse' }))).toBe(true);
    expect(requireAdmin(fakeReq({ 'x-admin-secret': 'correct-horse' }))).toBeNull();
  });

  test('accepts the correct secret via adminSecret query param (LABTOOLS_SECRET wins)', () => {
    process.env.LABTOOLS_SECRET = 'battery-staple';
    process.env.LABTOOLS_ADMIN_PASSWORD = 'other';
    expect(isAdminRequest(fakeReq({}, 'http://x/api/admin/members?adminSecret=battery-staple'))).toBe(true);
    // LABTOOLS_SECRET takes precedence, so the password no longer authorizes
    expect(isAdminRequest(fakeReq({ 'x-admin-secret': 'other' }))).toBe(false);
  });
});
