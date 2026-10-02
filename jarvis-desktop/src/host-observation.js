'use strict';
const { execFileSync } = require('node:child_process');

const HOST = 'soullab@minisforum';
const BASE = ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=5', HOST];
const FIXED = Object.freeze({
  memory: {
    command: 'docker exec maia-postgres pg_isready -U soullab -d maia_consciousness',
    matches: /accepting connections/i,
    success: 'Memory/Postgres host accepted a read-only readiness probe.',
  },
  production: {
    command: 'docker inspect --format={{.State.Status}} maia-sovereign',
    matches: /^running$/i,
    success: 'Production host reports the maia-sovereign container running.',
  },
});

function clean(value) {
  return String(value || '').trim().slice(0, 500);
}
function observe(kind, run = execFileSync) {
  const spec = FIXED[kind];
  if (!spec) return { ok: false, state: 'UNVERIFIED', detail: 'Unknown observation kind refused.' };
  try {
    const stdout = run('ssh', [...BASE, spec.command], {
      encoding: 'utf8', timeout: 8000, stdio: ['ignore', 'pipe', 'pipe'],
    });
    const observed = clean(stdout);
    if (!spec.matches.test(observed)) {
      return { ok: false, state: 'DEGRADED', detail: `Host answered, but the fixed probe did not establish health: ${observed || 'empty response'}`, observed_at: new Date().toISOString() };
    }
    return { ok: true, state: 'AVAILABLE', detail: spec.success, observed_at: new Date().toISOString() };
  } catch (error) {
    const detail = clean(error?.stderr || error?.stdout || error?.message);
    return { ok: false, state: 'UNREACHABLE', detail: `One-shot host observation failed: ${detail || 'no diagnostic'}`, observed_at: new Date().toISOString() };
  }
}

module.exports = { observe, FIXED, HOST };
