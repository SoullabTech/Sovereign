import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { resolveDevUserDataName } = require('../src/dev-instance-key.js');

test('default dev instance preserves the historical userData namespace', () => {
  assert.equal(resolveDevUserDataName({}), 'jarvis-desktop-dev');
});

test('explicit witness key creates a distinct dev single-instance namespace', () => {
  assert.equal(
    resolveDevUserDataName({ JARVIS_DEV_INSTANCE_KEY: 'o5r3-37750a92f' }),
    'jarvis-desktop-dev-o5r3-37750a92f',
  );
});

test('unsafe or ambiguous keys fail closed', () => {
  for (const key of ['../x', 'x/y', 'space key', 'x'.repeat(65)]) {
    assert.throws(
      () => resolveDevUserDataName({ JARVIS_DEV_INSTANCE_KEY: key }),
      /JARVIS_DEV_INSTANCE_KEY_INVALID/,
    );
  }
});
