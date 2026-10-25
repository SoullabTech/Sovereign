import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkAccess, matchRule } from '../../config/accessMatrix.ts';

const priorMode = process.env.ACCESS_CONTROL_MODE;
process.env.ACCESS_CONTROL_MODE = 'strict';

test.after(() => {
  if (priorMode === undefined) delete process.env.ACCESS_CONTROL_MODE;
  else process.env.ACCESS_CONTROL_MODE = priorMode;
});

test('the Sound Field page and current-session receipt have exact authenticated rules', () => {
  for (const pathname of ['/listen', '/api/members/session']) {
    const rule = matchRule(pathname);
    assert.ok(rule, pathname);
    assert.equal(rule.exact, pathname);
    assert.equal(rule.prefix, undefined);
    assert.equal(rule.public, undefined);
    assert.equal(rule.minTier, 'free');
  }
});

test('authenticated members enter both exact seams and anonymous visitors do not', () => {
  for (const pathname of ['/listen', '/api/members/session']) {
    assert.equal(checkAccess(pathname, 'free', ['member'], true).allowed, true, pathname);
    const anonymous = checkAccess(pathname, 'free', [], false);
    assert.equal(anonymous.allowed, false, pathname);
    assert.equal(anonymous.reason, 'unauthenticated', pathname);
  }
});

test('adjacent and nested listening/member routes remain unmapped and fail closed in strict mode', () => {
  for (const pathname of [
    '/listen-extra', '/listener', '/listen/private', '/listen/reader',
    '/api/members/session/refresh', '/api/members/session-extra',
  ]) {
    assert.equal(matchRule(pathname), null, pathname);
    const result = checkAccess(pathname, 'free', ['member'], true);
    assert.equal(result.allowed, false, pathname);
    assert.equal(result.reason, 'no-rule-match', pathname);
    assert.equal(result.unmapped, true, pathname);
  }
});
