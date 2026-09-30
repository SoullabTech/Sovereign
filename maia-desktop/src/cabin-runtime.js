'use strict';

const {
  cabinOrigin,
  cabinEntryUrl,
  cabinHealthUrl,
  offlineRuntimeSpec,
} = require('./cabin-runtime-policy');

/**
 * AIN-CABIN-RUNTIME-02
 *
 * Host-independent lifecycle for a local Cabin runtime.
 *
 * The host supplies:
 *   - spawnImpl
 *   - fetchImpl
 *   - timers
 *
 * The supervisor owns the meaning of:
 *   idle → starting → ready | failed → stopped.
 *
 * It never invents a successful state. HTTP health is the witness.
 */

const STATES = Object.freeze({
  IDLE: 'idle',
  STARTING: 'starting',
  READY: 'ready',
  FAILED: 'failed',
  STOPPED: 'stopped',
});

const DEFAULT_STARTUP_TIMEOUT_MS = 15_000;
const DEFAULT_HEALTH_INTERVAL_MS = 100;
const DEFAULT_STOP_TIMEOUT_MS = 3_000;

function createCabinRuntimeSupervisor({
  spawnImpl,
  fetchImpl,
  timers = { setTimeout, clearTimeout, setInterval, clearInterval },
  startupTimeoutMs = DEFAULT_STARTUP_TIMEOUT_MS,
  healthIntervalMs = DEFAULT_HEALTH_INTERVAL_MS,
  stopTimeoutMs = DEFAULT_STOP_TIMEOUT_MS,
  logger = () => {},
} = {}) {
  if (typeof spawnImpl !== 'function') {
    throw new Error('Cabin runtime supervisor requires spawnImpl');
  }
  if (typeof fetchImpl !== 'function') {
    throw new Error('Cabin runtime supervisor requires fetchImpl');
  }

  let state = STATES.IDLE;
  let child = null;
  let spec = null;
  let failure = null;
  let healthTimer = null;
  let startupTimer = null;
  let generation = 0;
  let settleStart = null;

  function snapshot() {
    return {
      state,
      origin: spec ? cabinOrigin(spec.port) : null,
      port: spec ? spec.port : null,
      failure,
      pid: child && Number.isInteger(child.pid) ? child.pid : null,
    };
  }

  function clearTimers() {
    if (healthTimer !== null) {
      timers.clearInterval(healthTimer);
      healthTimer = null;
    }
    if (startupTimer !== null) {
      timers.clearTimeout(startupTimer);
      startupTimer = null;
    }
  }

  function resolveStart(result) {
    const resolve = settleStart;
    settleStart = null;
    if (resolve) resolve(result);
  }

  function markFailed(reason) {
    clearTimers();
    failure = String(reason || 'local runtime failed');
    state = STATES.FAILED;
  }

  async function stopChild() {
    const current = child;
    child = null;
    if (!current) return;

    try {
      if (typeof current.kill === 'function') current.kill('SIGTERM');
    } catch {
      // Teardown is best effort; state still closes the run.
    }

    if (typeof current.once !== 'function') return;

    await new Promise((resolve) => {
      let settled = false;
      let timer = null;

      const finish = () => {
        if (settled) return;
        settled = true;
        if (timer !== null) timers.clearTimeout(timer);
        resolve();
      };

      current.once('exit', finish);
      timer = timers.setTimeout(() => {
        try {
          if (typeof current.kill === 'function') current.kill('SIGKILL');
        } catch {}
        finish();
      }, stopTimeoutMs);
    });
  }

  async function failStart(reason, runGeneration) {
    if (runGeneration !== generation || state !== STATES.STARTING) return;
    markFailed(reason);
    await stopChild();
    resolveStart({ ok: false, error: failure, state });
  }

  async function witnessHealth(runGeneration, port) {
    if (runGeneration !== generation || state !== STATES.STARTING) return;

    try {
      const response = await fetchImpl(cabinHealthUrl(port), { method: 'GET' });
      if (!response || !response.ok) return;
    } catch {
      return;
    }

    if (runGeneration !== generation || state !== STATES.STARTING) return;

    clearTimers();
    state = STATES.READY;
    failure = null;
    logger({ event: 'cabin_runtime_ready', healthUrl: cabinHealthUrl(port) });
    resolveStart({
      ok: true,
      state,
      origin: cabinOrigin(port),
    });
  }

  async function start({
    port,
    entrypoint,
    runtimeRoot,
    extraEnv = {},
  } = {}) {
    if (state === STATES.STARTING || state === STATES.READY) {
      return { ok: false, error: 'local runtime already active', state };
    }

    clearTimers();
    failure = null;
    generation += 1;
    const runGeneration = generation;

    try {
      spec = offlineRuntimeSpec({
        port,
        entrypoint,
        runtimeRoot,
        extraEnv,
      });
    } catch (error) {
      markFailed(error instanceof Error ? error.message : String(error));
      return { ok: false, error: failure, state };
    }

    state = STATES.STARTING;

    let spawned;
    try {
      spawned = spawnImpl(spec.command, spec.args, {
        cwd: spec.cwd,
        env: { ...process.env, ...spec.env },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      markFailed(error instanceof Error ? error.message : String(error));
      return { ok: false, error: failure, state };
    }

    child = spawned;

    const result = await new Promise((resolve) => {
      settleStart = resolve;

      if (spawned && typeof spawned.once === 'function') {
        spawned.once('error', (error) => {
          void failStart(
            error instanceof Error ? error.message : String(error),
            runGeneration,
          );
        });

        spawned.once('exit', (code, signal) => {
          if (child === spawned) child = null;
          if (runGeneration !== generation) return;
          if (state === STATES.STARTING) {
            void failStart(
              `local runtime exited before health witness (code=${code}, signal=${signal || 'none'})`,
              runGeneration,
            );
          } else if (state === STATES.READY) {
            clearTimers();
            state = STATES.FAILED;
            failure = `local runtime exited (code=${code}, signal=${signal || 'none'})`;
          }
        });
      }

      healthTimer = timers.setInterval(
        () => { void witnessHealth(runGeneration, spec.port); },
        healthIntervalMs,
      );

      startupTimer = timers.setTimeout(() => {
        void failStart(
          `local runtime health timeout after ${startupTimeoutMs}ms`,
          runGeneration,
        );
      }, startupTimeoutMs);

      void witnessHealth(runGeneration, spec.port);
    });

    return result;
  }

  async function stop() {
    generation += 1;
    clearTimers();
    settleStart = null;
    await stopChild();
    state = STATES.STOPPED;
    failure = null;
    spec = null;
    return { ok: true, state };
  }

  return {
    start,
    stop,
    snapshot,
    states: STATES,
  };
}

module.exports = {
  createCabinRuntimeSupervisor,
  DEFAULT_STARTUP_TIMEOUT_MS,
  DEFAULT_HEALTH_INTERVAL_MS,
  DEFAULT_STOP_TIMEOUT_MS,
  STATES,
};
