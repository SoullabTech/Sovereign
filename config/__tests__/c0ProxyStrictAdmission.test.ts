/**
 * C0-PROXY fictional/isolated exact-route acceptance.
 * Validates the actual accessMatrix implementation with no network/database.
 */
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { checkAccess, matchRule } from '../accessMatrix';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const targets = [
  '/api/members/profile',
  '/api/members/password',
  '/api/members/change-password',
] as const;

const excludedPaths = [
  '/api/members/profile-extra',
  '/api/members/profile/other',
  '/api/members/password/other',
  '/api/members/change-password/other',
  '/api/members/reset-password',
  '/api/members/send-verification',
  '/api/members/admin-recovery',
  '/api/auth/native-biometry/verify',
  '/api/auth/google/native-callback',
] as const;
const originalMode = process.env.ACCESS_CONTROL_MODE;

beforeEach(() => { process.env.ACCESS_CONTROL_MODE = 'strict'; });
afterEach(() => {
  if (originalMode === undefined) delete process.env.ACCESS_CONTROL_MODE;
  else process.env.ACCESS_CONTROL_MODE = originalMode;
});

describe('C0-PROXY narrow member access matrix', () => {
  it.each(targets)('%s exactly maps to authenticated members only', (pathname) => {
    const rule = matchRule(pathname);
    expect(rule).not.toBeNull();
    expect(rule?.exact).toBe(pathname);
    expect(rule?.public).not.toBe(true);
    expect(rule?.minTier).toBe('free');
    expect(rule?.prefix).toBeUndefined();
    expect(rule?.regex).toBeUndefined();
    for (const tier of ['free', 'personal', 'pro'] as const) {
      expect(checkAccess(pathname, tier, ['member'], true).allowed).toBe(true);
      const anonymous = checkAccess(pathname, tier, [], false);
      expect(anonymous.allowed).toBe(false);
      expect(anonymous.reason).toBe('unauthenticated');
    }
  });

  it.each(excludedPaths)('%s is not accidentally admitted in strict mode', (pathname) => {
    const verdict = checkAccess(pathname, 'free', ['member'], true);
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toBe('no-rule-match');
    expect(matchRule(pathname)).toBeNull();
  });

  it('retains existing public signup/signin rules without opening sensitive neighbors', () => {
    for (const pathname of ['/api/members/register', '/api/members/register-email', '/api/members/signin']) {
      const rule = matchRule(pathname);
      expect(rule?.public).toBe(true);
      expect(checkAccess(pathname, 'free', [], false).allowed).toBe(true);
    }
    expect(checkAccess('/api/admin/members/recovery', 'free', ['member'], true).allowed).toBe(false);
  });

  it('tightens three exact paths against anonymous requests even in permissive mode', () => {
    process.env.ACCESS_CONTROL_MODE = 'permissive';
    for (const pathname of targets) {
      expect(checkAccess(pathname, 'free', [], false)).toMatchObject({
        allowed: false, reason: 'unauthenticated',
      });
      expect(checkAccess(pathname, 'free', ['member'], true).allowed).toBe(true);
    }
  });

  it('does not modify proxy ingress, identity stripping or method semantics', () => {
    const root = path.resolve(__dirname, '../..');
    const proxy = readFileSync(path.join(root, 'proxy.ts'), 'utf8');
    const matrix = readFileSync(path.join(root, 'config/accessMatrix.ts'), 'utf8');
    expect(proxy).toContain('stripClientIdentityAssertions(req.headers)');
    expect(proxy).toContain('deriveVerifiedAccess(req)');
    expect(matrix).toContain('checkAccess(');
    expect(matrix).not.toContain("prefix: '/api/members',");
    expect(matrix).not.toContain("prefix: '/api/members/',");
    expect(checkAccess.length).toBe(4); // path, tier, roles, authenticated — not method
  });

  it('preserves existing HTTP handler method exports', () => {
    const root = path.resolve(__dirname, '../..');
    const expectation: Record<string, string[]> = {
      'app/api/members/profile/route.ts': ['GET', 'PUT'],
      'app/api/members/password/route.ts': ['POST'],
      'app/api/members/change-password/route.ts': ['POST'],
    };
    for (const [filepath, methods] of Object.entries(expectation)) {
      const source = readFileSync(path.join(root, filepath), 'utf8');
      const exports = [...source.matchAll(/export async function (GET|POST|PUT|PATCH|DELETE)\s*\(/g)].map(m => m[1]);
      expect(exports.sort()).toEqual(methods.sort());
    }
  });
});
