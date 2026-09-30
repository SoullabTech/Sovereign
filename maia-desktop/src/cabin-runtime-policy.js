'use strict';

/**
 * AIN-CABIN-RUNTIME-01
 *
 * Pure policy for the local runtime that will eventually satisfy the existing
 * MAIA Desktop platform shell.
 *
 * This module deliberately does NOT spawn a process. Process lifecycle belongs
 * to the Electron host; these functions define the boundary it must honor.
 */

const CABIN_ENTRY_PATH = '/maia';
const CABIN_HOST = '127.0.0.1';
const CABIN_MODES = Object.freeze(['offline', 'connected']);

function assertPort(port) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Cabin runtime port must be an integer from 1 to 65535');
  }
  return port;
}

function cabinOrigin(port, host = CABIN_HOST) {
  assertPort(port);
  if (host !== CABIN_HOST && host !== 'localhost') {
    throw new Error('Cabin runtime may bind only to loopback');
  }
  return `http://${host}:${port}`;
}

function cabinEntryUrl(port, host = CABIN_HOST) {
  return cabinOrigin(port, host) + CABIN_ENTRY_PATH;
}

function cabinHealthUrl(port, host = CABIN_HOST) {
  return cabinOrigin(port, host) + '/api/cabin/health';
}

/**
 * Build the environment for the future packaged Next standalone runtime.
 *
 * No production origin is supplied in offline mode.
 * No member identity is supplied by Electron.
 * The local runtime must establish its own local identity/session boundary.
 */
function offlineRuntimeSpec({ port, entrypoint, runtimeRoot, extraEnv = {} }) {
  assertPort(port);
  if (typeof entrypoint !== 'string' || entrypoint.length === 0) {
    throw new Error('Cabin runtime entrypoint is required');
  }
  if (typeof runtimeRoot !== 'string' || runtimeRoot.length === 0) {
    throw new Error('Cabin runtime root is required');
  }

  return {
    command: process.execPath,
    args: [entrypoint],
    cwd: runtimeRoot,
    env: {
      ...extraEnv,
      HOSTNAME: CABIN_HOST,
      PORT: String(port),
      MAIA_CABIN_MODE: 'offline',
      NEXT_PUBLIC_BUILD_MODE: 'desktop-cabin',
    },
  };
}

function isCabinMode(value) {
  return CABIN_MODES.includes(value);
}

module.exports = {
  CABIN_ENTRY_PATH,
  CABIN_HOST,
  CABIN_MODES,
  cabinOrigin,
  cabinEntryUrl,
  cabinHealthUrl,
  offlineRuntimeSpec,
  isCabinMode,
};
