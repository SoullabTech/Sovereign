import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const CAP = require('../src/e1-local-capacity.js');

const GiB = CAP.GIB;
const healthy = Object.freeze({
  version: CAP.SAMPLE_VERSION,
  platform: 'darwin',
  total_ram_bytes: 48 * GiB,
  free_ram_bytes: 32 * GiB,
  swap_total_bytes: 8 * GiB,
  swap_free_bytes: 8 * GiB,
});

test('E1LC admits Qwen 65K only with conservative launch headroom', () => {
  const out = CAP.evaluateLocalCapacity('jarvis-qwen3-coder:65k', healthy);
  assert.equal(out.ok, true);
  assert.equal(out.status, 'ADMITTED');
  assert.equal(out.profile.context_tokens, 65536);
  assert.equal(out.required_free_ram_bytes,
    out.profile.model_bytes + 8 * GiB);
});
test('E1LC rejects the witnessed panic-window resource shape', () => {
  const out = CAP.evaluateLocalCapacity('jarvis-qwen3-coder:65k', {
    ...healthy,
    free_ram_bytes: 5.5 * GiB,
    swap_free_bytes: 0,
  });
  assert.equal(out.ok, false);
  assert.equal(out.status, 'HELD_FOR_LOCAL_CAPACITY');
  assert.equal(out.reason, 'LOCAL_CAPACITY_RAM_HEADROOM');
});

test('E1LC rejects exhausted active swap even when RAM floor passes', () => {
  const out = CAP.evaluateLocalCapacity('jarvis-qwen3-coder:65k', {
    ...healthy,
    swap_free_bytes: 512 * 1024 ** 2,
  });
  assert.equal(out.ok, false);
  assert.equal(out.reason, 'LOCAL_CAPACITY_SWAP_HEADROOM');
});

test('E1LC does not require swap to exist when RAM headroom is already safe', () => {
  const out = CAP.evaluateLocalCapacity('jarvis-qwen3-coder:65k', {
    ...healthy,
    swap_total_bytes: 0,
    swap_free_bytes: 0,
  });
  assert.equal(out.ok, true);
});
test('E1LC fails closed for unknown runtime profiles and unknown samples', () => {
  let out = CAP.evaluateLocalCapacity('unknown:model', healthy);
  assert.equal(out.ok, false);
  assert.equal(out.reason, 'LOCAL_CAPACITY_PROFILE_UNKNOWN');

  out = CAP.evaluateLocalCapacity('jarvis-qwen3-coder:65k', {
    ...healthy,
    free_ram_bytes: null,
  });
  assert.equal(out.ok, false);
  assert.equal(out.reason, 'LOCAL_CAPACITY_SAMPLE_UNKNOWN');

  out = CAP.evaluateLocalCapacity('jarvis-qwen3-coder:65k', {
    ...healthy,
    swap_free_bytes: null,
  });
  assert.equal(out.ok, false);
  assert.equal(out.reason, 'LOCAL_CAPACITY_SWAP_UNKNOWN');
});

test('Darwin swap parser preserves byte standing', () => {
  const out = CAP.parseDarwinSwap('total = 8192.00M  used = 8192.00M  free = 0.00M  (encrypted)');
  assert.equal(out.total, 8 * GiB);
  assert.equal(out.used, 8 * GiB);
  assert.equal(out.free, 0);
});
test('Linux meminfo parser uses MemAvailable and swap fields', () => {
  const parsed = CAP.parseLinuxMeminfo([
    'MemTotal:       49152000 kB',
    'MemAvailable:   30000000 kB',
    'SwapTotal:       8388608 kB',
    'SwapFree:        4194304 kB',
  ].join('\n'));
  assert.equal(parsed.MemTotal, 49152000 * 1024);
  assert.equal(parsed.MemAvailable, 30000000 * 1024);
  assert.equal(parsed.SwapTotal, 8388608 * 1024);
  assert.equal(parsed.SwapFree, 4194304 * 1024);
});