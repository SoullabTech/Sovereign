import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { authorityBinding } = require('../src/repo-authority.js');

test('O5-R4 explicit env/config/dev-walk bindings may carry Desktop authority', () => {
  for (const resolution of ['explicit-env','explicit-config','dev-walk']) {
    const out = authorityBinding({ root: '/repo', resolution });
    assert.equal(out.ok, true, resolution);
  }
});

test('O5-R4 implicit-default remains visible but cannot carry Desktop authority', () => {
  const out = authorityBinding({ root: '/Users/soullab/MAIA-SOVEREIGN', resolution: 'implicit-default' });
  assert.equal(out.ok, false);
  assert.equal(out.status, 'HELD_FOR_EXPLICIT_REPOSITORY_BINDING');
  assert.equal(out.root, '/Users/soullab/MAIA-SOVEREIGN');
});

test('O5-R4 unresolved substrate cannot carry authority', () => {
  const out = authorityBinding({ root: null, resolution: 'unresolved' });
  assert.equal(out.ok, false);
  assert.equal(out.status, 'NO_SUBSTRATE');
});
