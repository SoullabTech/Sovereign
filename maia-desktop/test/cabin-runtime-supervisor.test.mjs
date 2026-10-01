import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createCabinRuntimeSupervisor,
  STATES,
} from '../src/cabin-runtime.js';

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures',
  'cabin-health-server.mjs',
);

function child() {
  const emitter = new EventEmitter();
  emitter.pid = 43121;
  emitter.killed = false;
  emitter.kill = (signal) => {
    emitter.killed = signal;
    queueMicrotask(() => emitter.emit('exit', null, signal));
    return true;
  };
  return emitter;
}

test('healthy local runtime becomes READY only after the health witness', async () => {
  const spawned = child();
  const calls = [];

  const supervisor = createCabinRuntimeSupervisor({
    spawnImpl: (...args) => {
      calls.push(args);
      return spawned;
    },
    fetchImpl: async (url) => ({
      ok: url === 'http://127.0.0.1:43121/api/cabin/health',
    }),
    startupTimeoutMs: 1000,
    healthIntervalMs: 10,
  });

  const result = await supervisor.start({
    port: 43121,
    entrypoint: '/runtime/server.js',
    runtimeRoot: '/runtime',
  });

  assert.deepEqual(result, {
    ok: true,
    state: STATES.READY,
    origin: 'http://127.0.0.1:43121',
  });
  assert.equal(supervisor.snapshot().state, STATES.READY);
  assert.equal(supervisor.snapshot().port, 43121);
  assert.equal(calls[0][0], process.execPath);
  assert.deepEqual(calls[0][1], ['/runtime/server.js']);
});

test('an unhealthy runtime fails closed after the bounded startup window', async () => {
  const spawned = child();

  const supervisor = createCabinRuntimeSupervisor({
    spawnImpl: () => spawned,
    fetchImpl: async () => ({ ok: false }),
    startupTimeoutMs: 20,
    healthIntervalMs: 5,
    stopTimeoutMs: 20,
  });

  const result = await supervisor.start({
    port: 43122,
    entrypoint: '/runtime/server.js',
    runtimeRoot: '/runtime',
  });

  assert.equal(result.ok, false);
  assert.equal(result.state, STATES.FAILED);
  assert.match(result.error, /health timeout/);
  assert.equal(spawned.killed, 'SIGTERM');
});

test('a runtime that exits before health can never become READY', async () => {
  const spawned = child();

  const supervisor = createCabinRuntimeSupervisor({
    spawnImpl: () => {
      queueMicrotask(() => spawned.emit('exit', 1, null));
      return spawned;
    },
    fetchImpl: async () => ({ ok: false }),
    startupTimeoutMs: 1000,
    healthIntervalMs: 5,
  });

  const result = await supervisor.start({
    port: 43123,
    entrypoint: '/runtime/server.js',
    runtimeRoot: '/runtime',
  });

  assert.equal(result.ok, false);
  assert.equal(result.state, STATES.FAILED);
  assert.match(result.error, /exited before health witness/);
});

test('stop terminates a healthy runtime and leaves no active child', async () => {
  const spawned = child();

  const supervisor = createCabinRuntimeSupervisor({
    spawnImpl: () => spawned,
    fetchImpl: async () => ({ ok: true }),
  });

  await supervisor.start({
    port: 43124,
    entrypoint: '/runtime/server.js',
    runtimeRoot: '/runtime',
  });

  const result = await supervisor.stop();

  assert.deepEqual(result, { ok: true, state: STATES.STOPPED });
  assert.equal(supervisor.snapshot().pid, null);
  assert.equal(spawned.killed, 'SIGTERM');
});

test('the real host path reaches READY through a loopback health server', async () => {
  const supervisor = createCabinRuntimeSupervisor({
    spawnImpl: spawn,
    fetchImpl: (...args) => fetch(...args),
    startupTimeoutMs: 3000,
    healthIntervalMs: 20,
  });

  const result = await supervisor.start({
    port: 43126,
    entrypoint: FIXTURE,
    runtimeRoot: path.dirname(FIXTURE),
  });

  assert.equal(result.ok, true);
  assert.equal(result.state, STATES.READY);
  assert.equal(result.origin, 'http://127.0.0.1:43126');

  const health = await fetch('http://127.0.0.1:43126/api/cabin/health');
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ready', mode: 'offline' });

  const stopped = await supervisor.stop();
  assert.deepEqual(stopped, { ok: true, state: STATES.STOPPED });
});

test('starting twice does not create a second local runtime', async () => {
  const spawned = child();
  let spawnCount = 0;

  const supervisor = createCabinRuntimeSupervisor({
    spawnImpl: () => {
      spawnCount += 1;
      return spawned;
    },
    fetchImpl: async () => ({ ok: true }),
  });

  const first = await supervisor.start({
    port: 43125,
    entrypoint: '/runtime/server.js',
    runtimeRoot: '/runtime',
  });
  const second = await supervisor.start({
    port: 43125,
    entrypoint: '/runtime/server.js',
    runtimeRoot: '/runtime',
  });

  assert.equal(first.ok, true);
  assert.deepEqual(second, {
    ok: false,
    error: 'local runtime already active',
    state: STATES.READY,
  });
  assert.equal(spawnCount, 1);
});
