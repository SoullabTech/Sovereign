#!/usr/bin/env node
/**
 * E3R3 / S0R1R2 — macOS process-level network containment for diagnostic OpenCode.
 *
 * The child and all descendants may make outbound TCP connections only to the
 * founder-controlled localhost stub port. Real Ollama :11434 and external
 * network destinations are therefore outside the process capability.
 */
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { assertDiagnosticLeaseHeld } from './jarvis-ollama-generation-lease.mjs';

const SANDBOX_EXEC = '/usr/bin/sandbox-exec';
const OLLAMA_PORT = 11434;

function normalizePort(value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DIAGNOSTIC_STUB_PORT_INVALID');
  }
  if (port === OLLAMA_PORT) throw new Error('DIAGNOSTIC_STUB_MAY_NOT_BE_OLLAMA_PORT');
  return port;
}

export function diagnosticSandboxProfile(stubPort) {
  const port = normalizePort(stubPort);
  return [
    '(version 1)',
    '(allow default)',
    '(deny network-outbound)',
    '(allow network-outbound (remote tcp "localhost:' + port + '"))',
  ].join('\n');
}

export function diagnosticSandboxReady() {
  return process.platform === 'darwin' && fs.existsSync(SANDBOX_EXEC);
}

export function runDiagnosticSandbox({
  stubPort,
  command,
  args = [],
  env = process.env,
  leaseToken = env.JARVIS_OLLAMA_DIAGNOSTIC_LEASE_TOKEN,
  timeoutMs = 60_000,
  stdio = 'pipe',
} = {}) {
  if (!diagnosticSandboxReady()) {
    return { ok: false, status: 'REFUSED', code: 'DIAGNOSTIC_SANDBOX_UNAVAILABLE' };
  }
  if (!command || typeof command !== 'string') {
    return { ok: false, status: 'REFUSED', code: 'DIAGNOSTIC_COMMAND_REQUIRED' };
  }

  let profile;
  try {
    profile = diagnosticSandboxProfile(stubPort);
  } catch (error) {
    return { ok: false, status: 'REFUSED', code: String(error?.message || error) };
  }

  const lease = assertDiagnosticLeaseHeld({ token: leaseToken, env });
  if (!lease.ok) return lease;

  const child = spawnSync(
    SANDBOX_EXEC,
    ['-p', profile, command, ...args.map(String)],
    {
      env,
      encoding: stdio === 'pipe' ? 'utf8' : undefined,
      stdio,
      timeout: timeoutMs,
      maxBuffer: 4 * 1024 * 1024,
    },
  );

  return {
    ok: child.status === 0 && !child.error,
    status: child.status === 0 && !child.error ? 'COMPLETED' : 'FAILED',
    exit_code: Number.isInteger(child.status) ? child.status : null,
    signal: child.signal || null,
    error: child.error ? String(child.error.message || child.error) : null,
    stdout: stdio === 'pipe' ? String(child.stdout || '') : '',
    stderr: stdio === 'pipe' ? String(child.stderr || '') : '',
  };
}

function cliArg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

function cliCommand() {
  const marker = process.argv.indexOf('--');
  return marker >= 0 ? process.argv.slice(marker + 1) : [];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cmd = process.argv[2];
  if (cmd !== 'run') {
    process.stdout.write(JSON.stringify({
      ok: false,
      status: 'REFUSED',
      code: 'USAGE',
      usage: 'jarvis-ollama-diagnostic-sandbox.mjs run --stub-port <port> -- <command> [args...]',
    }, null, 2) + '\n');
    process.exitCode = 23;
  } else {
    const parts = cliCommand();
    const out = runDiagnosticSandbox({
      stubPort: cliArg('--stub-port'),
      command: parts[0],
      args: parts.slice(1),
      env: process.env,
      stdio: 'inherit',
    });
    if (!out.ok) {
      if (out.code) process.stderr.write(out.code + '\n');
      if (out.error) process.stderr.write(out.error + '\n');
      process.exitCode = out.exit_code || 23;
    }
  }
}
