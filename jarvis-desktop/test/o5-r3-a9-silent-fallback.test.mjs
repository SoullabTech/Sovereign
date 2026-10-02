import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { resolvePackagedMode, resolveDevMode } = require(path.join(HERE, '..', 'src', 'repo-resolution.js'));
const PROV = require(path.join(HERE, '..', 'src', 'provenance.js'));
const R = PROV.RESOLUTION;

const DEFAULT = '/Users/soullab/MAIA-SOVEREIGN';
const ENV = '/repo/env';
const CONFIG = '/repo/config';
const VALID = new Set([DEFAULT, ENV, CONFIG, '/repo/walk']);
const valid = (p) => VALID.has(p);

function packaged(overrides = {}) {
  return resolvePackagedMode({
    envRoot: null,
    config: { present: false, repo_root: null, problem: null },
    defaultCandidate: DEFAULT,
    isValidRepoRoot: valid,
    RESOLUTION: R,
    ...overrides,
  });
}

test('SF-1 no env/config stays unbound even when hard-coded candidate verifies', () => {
  const out = packaged();
  assert.equal(out.root, null);
  assert.equal(out.resolution, R.NONE);
  assert.equal(out.suggestedRepoRoot, DEFAULT);
});

test('SF-2 invalid config cannot fall through into default authority', () => {
  const out = packaged({ config: { present: true, repo_root: '/repo/gone', problem: null } });
  assert.equal(out.root, null);
  assert.equal(out.suggestedRepoRoot, DEFAULT);
  assert.match(out.configProblem, /configured repository no longer carries/);
});

test('SF-3 invalid env cannot fall through into default authority', () => {
  const out = packaged({ envRoot: '/repo/bad' });
  assert.equal(out.root, null);
  assert.equal(out.suggestedRepoRoot, DEFAULT);
  assert.match(out.configProblem, /JARVIS_REPO_ROOT does not carry/);
});

test('SF-4 suggestion is informational only', () => {
  const out = packaged();
  assert.notEqual(out.suggestedRepoRoot, out.root);
  assert.equal(out.root, null);
});

test('SF-5 valid env remains explicit authority-bearing binding', () => {
  const out = packaged({ envRoot: ENV });
  assert.equal(out.root, ENV);
  assert.equal(out.resolution, R.ENV);
  assert.equal(out.suggestedRepoRoot, null);
});

test('SF-6 valid config remains explicit authority-bearing binding', () => {
  const out = packaged({ config: { present: true, repo_root: CONFIG, problem: null } });
  assert.equal(out.root, CONFIG);
  assert.equal(out.resolution, R.CONFIG);
  assert.equal(out.suggestedRepoRoot, null);
});

test('SF-7 dev upward walk still outranks the explicit ladder', () => {
  const out = resolveDevMode({
    walk: () => '/repo/walk',
    ladder: () => packaged({ envRoot: ENV }),
    launchedFrom: () => '/repo/walk/jarvis-desktop/src',
    RESOLUTION: R,
  });
  assert.equal(out.root, '/repo/walk');
  assert.equal(out.resolution, R.WALK);
});

test('SF-8 failed dev walk may use explicit env but never suggested default', () => {
  let out = resolveDevMode({
    walk: () => null,
    ladder: () => packaged({ envRoot: ENV }),
    launchedFrom: () => '/missing/src',
    RESOLUTION: R,
  });
  assert.equal(out.root, ENV);
  assert.equal(out.resolution, R.ENV);

  out = resolveDevMode({
    walk: () => null,
    ladder: () => packaged(),
    launchedFrom: () => '/missing/src',
    RESOLUTION: R,
  });
  assert.equal(out.root, null);
  assert.equal(out.resolution, R.NONE);
  assert.equal(out.suggestedRepoRoot, DEFAULT);
});
