import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const H = require('../src/host-observation.js');

test('unknown observation kind is refused without execution', () => {
  let called = false;
  const out = H.observe('anything-else', () => { called = true; });
  assert.equal(called, false);
  assert.equal(out.ok, false);
  assert.equal(out.state, 'UNVERIFIED');
});

test('memory observation uses only the fixed host and fixed readiness command', () => {
  let call;
  const out = H.observe('memory', (bin, args) => {
    call = { bin, args };
    return 'localhost:5432 - accepting connections\n';
  });
  assert.equal(out.ok, true);
  assert.equal(out.state, 'AVAILABLE');
  assert.equal(call.bin, 'ssh');
  assert.ok(call.args.includes('soullab@minisforum'));
  assert.equal(call.args.at(-1), H.FIXED.memory.command);
});

test('production observation accepts only a running container', () => {
  const ok = H.observe('production', () => 'running\n');
  assert.equal(ok.ok, true);
  assert.equal(ok.state, 'AVAILABLE');

  const bad = H.observe('production', () => 'exited\n');
  assert.equal(bad.ok, false);
  assert.equal(bad.state, 'DEGRADED');
});

test('transport failure remains observed failure, never healthy', () => {
  const out = H.observe('memory', () => {
    const error = new Error('ssh failed');
    error.stderr = 'connection refused';
    throw error;
  });
  assert.equal(out.ok, false);
  assert.equal(out.state, 'UNREACHABLE');
  assert.match(out.detail, /connection refused/i);
});
