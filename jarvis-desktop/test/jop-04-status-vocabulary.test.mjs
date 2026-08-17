// JOP-04 — the three status states the surface now distinguishes.
//
// The rule these protect is the one the whole legibility layer exists for: a
// state that means "not usable" or "not observed" must NEVER map onto a healthy
// founder state. The mapping already had a safe default (unrecognised ->
// UNVERIFIED), so these are not guarding against a crash — they guard against
// the mapping being made MORE specific later and losing that safety, which is a
// far quieter failure than a missing case.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const L = require(path.join(HERE, '..', 'src', 'legibility.js'));

// A bound status shape, so `dependent()` does NOT take its unbound branch and
// the mapping under test is the one actually exercised.
const boundStatus = (over = {}) => ({
  repo_root: '/Users/soullab/jarvis-runtime',
  provenance: { substrate: { state: 'READY' } },
  builder_mechanism: { state: 'AVAILABLE', detail: 'lane local-native' },
  builder_os: { state: 'AVAILABLE', detail: {} },
  route_a: { state: 'AVAILABLE', detail: '15 capabilities' },
  local_worker: { state: 'AVAILABLE', detail: 'ok' },
  claude_lane: { state: 'AVAILABLE', detail: 'ok' },
  desktop_runtime: { state: 'AVAILABLE', detail: 'ok' },
  sessions: [], governance_holds: [],
  ...over,
});

const organNamed = (status, name) => {
  const v = L.deriveOperatorView(status);
  const all = [
    ...(v.capabilities?.available || []),
    ...(v.capabilities?.unverified || []),
    ...(v.capabilities?.not_authorized || []),
  ];
  return all.find((o) => o.name === name);
};

describe('JOP-04 status vocabulary', () => {
  test('UNREACHABLE never reads as healthy, and keeps its reason', () => {
    const o = organNamed(
      boundStatus({ local_worker: { state: 'UNREACHABLE', detail: 'Ollama unreachable at 127.0.0.1:11434' } }),
      'Local model worker',
    );
    assert.ok(o, 'the row must still be rendered');
    assert.notEqual(o.state, 'READY');
    assert.notEqual(o.state, 'WORKING');
    assert.match(o.reason, /unreachable/i, 'an unobserved row must carry WHY');
  });

  test('UNCONFIGURED reads as a setup gap, not as a failure', () => {
    const o = organNamed(
      boundStatus({ memory_postgres: { state: 'UNCONFIGURED', detail: 'Desktop holds no database configuration' } }),
      'Memory / Postgres',
    );
    assert.ok(o, 'a declared-but-unconfigured row must be visible, not omitted');
    assert.equal(o.state, 'NEEDS_SETUP');
    assert.notEqual(o.state, 'FAILED', 'absent by design is not a malfunction');
  });

  test('NOT PROBED on Production reads as an authority boundary, never as broken', () => {
    const o = organNamed(
      boundStatus({ production: { state: 'NOT PROBED', detail: 'requires explicit production/SSH authority' } }),
      'Production',
    );
    assert.ok(o);
    assert.notEqual(o.state, 'READY');
    assert.notEqual(o.state, 'FAILED');
    assert.match(o.reason, /authority/i);
  });

  test('SABOTAGE CONTROL: no new state can be upgraded into a healthy one', () => {
    for (const raw of ['UNREACHABLE', 'UNCONFIGURED', 'NOT PROBED']) {
      const o = organNamed(boundStatus({ route_a: { state: raw, detail: 'x' } }), 'Deterministic registry');
      assert.ok(o, `${raw} must still render a row`);
      assert.ok(!['READY', 'WORKING'].includes(o.state), `${raw} must never map to a healthy state (got ${o.state})`);
    }
  });

  test('a bound-but-unprobed dependent row still tells the founder what to do', () => {
    // The unbound branch owns remediation; this asserts it survived the
    // addition of NOT PROBED to its trigger condition.
    const v = L.deriveOperatorView({
      ...boundStatus(),
      repo_root: 'UNKNOWN (packaged mode) — set JARVIS_REPO_ROOT',
      builder_os: { state: 'NOT PROBED', detail: 'depends on a bound execution substrate' },
    });
    const all = [...v.capabilities.available, ...v.capabilities.unverified, ...v.capabilities.not_authorized];
    const o = all.find((x) => x.name === 'Builder OS');
    assert.ok(o);
    assert.equal(o.state, 'UNVERIFIED');
    assert.match(o.remediation || '', /[Bb]ind/, 'an unprobed dependent row must still name the fix');
  });
});
