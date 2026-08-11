#!/usr/bin/env node
/**
 * JARVIS O-1 Observer — negative controls N1–N9.
 *
 * These run BEFORE the happy path, deliberately. Observer's value is not that
 * it shows green when things are fine; it is that it refuses to show green when
 * truth is missing, stale, blocked, contradictory, or inaccessible.
 *
 * Each control constructs a failure and asserts Observer says so.
 *
 *   node scripts/builder/__tests__/jarvis-observer-negative-controls.mjs
 */

import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const OBS = path.join(ROOT, 'desktop-app/jarvis/lib/observer');

const { observeAll } = require(path.join(OBS, 'observe.js'));
const { CLASS, FRESHNESS, observed, unavailable, unknown } = require(path.join(OBS, 'reading.js'));
const { NotificationChannel } = require(path.join(OBS, 'notification.js'));
const adapters = require(path.join(OBS, 'adapters.js'));

let pass = 0, fail = 0;
const results = [];

function check(id, desc, fn) {
  try {
    fn();
    pass += 1; results.push(`  ${id}  PASS  ${desc}`);
  } catch (e) {
    fail += 1; results.push(`  ${id}  FAIL  ${desc}\n        ${e.message}`);
  }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

/* ---------- injectable stubs ---------- */

const okClaims = (over = {}) => async () => ({
  claims: observed({
    limit: 1, limit_source: 'default', active: 0, queued: 0, sessions: [],
    queued_sessions: [], overrides: [], collisions: [], recoverable: [], ...over.claims,
  }, 'session.mjs status --json'),
  rate: over.rate !== undefined ? over.rate
    : observed({ overall_band: 'NORMAL', windows: { w60m: { distinct_sessions: 0 } }, units: 'local transcript request counts' }, 'session.mjs status --json'),
  ungoverned: over.ungoverned !== undefined ? over.ungoverned : unknown('session.mjs status --json'),
});

const okRuntime = (runs = []) => async () => ({
  health: observed({ ok: true }, 'runtime /health'),
  runs: observed(runs, 'runtime /runs'),
});

const okGit = (over = {}) => async () => ({
  branch: observed('chore/jarvis-o1-daily-observer', 'git (local worktree)'),
  head: observed('aaaaaaaaaaaa', 'git (local worktree)'),
  dirty: observed(0, 'git (local worktree)'),
  trunk_remote: observed('06f5103ef', 'git ls-remote origin'),
  branch_on_remote: observed({ present: true, remote_sha: 'aaaaaaaaaaaa', in_sync: true }, 'git ls-remote origin'),
  trunk_delta: observed({ behind_trunk: 0 }, 'observer:trunk-delta'),
  ...over,
});

const okProd = () => async () => ({
  sha: observed({ sha: 'ca43f8ccd', provenance: 'OK', raw: 'ca43f8ccd' }, 'ssh production'),
  reach: observed({ container_responded: true }, 'ssh production'),
});

const noPR = async () => ({ pr: observed(null, 'gh pr view --json') });

const base = (over = {}) => ({
  repoRoot: ROOT,
  redact: (g) => ({ status: g.status, class: g.class }),   // stand-in publicGovernanceGate
  deps: {
    readClaims: okClaims(), readRuntime: okRuntime(), readGit: okGit(),
    readProduction: okProd(), readPullRequest: noPR, ...over,
  },
});

const flat = (v) => JSON.stringify(v.attention);

/* ================= N1 — no phantom claims ================= */
await (async () => {
  const v = await observeAll(base());
  check('N1', 'zero claims renders as zero, never a phantom claim', () => {
    assert(v.families.claims.claims.klass === CLASS.OBSERVED, 'claims should be OBSERVED');
    assert(v.families.claims.claims.value.active === 0, 'active must be 0');
    assert(v.families.claims.claims.value.sessions.length === 0, 'no phantom session records');
    assert(!/collision|stale-claim/.test(flat(v)), 'must not manufacture claim activity');
  });
})();

/* ================= N2 — runtime unavailable ================= */
await (async () => {
  const down = async () => ({
    health: unavailable('runtime /health', 'ECONNREFUSED'),
    runs: unavailable('runtime /runs', 'ECONNREFUSED'),
  });
  const previous = await observeAll(base({ readRuntime: okRuntime([{ run_id: 'r-1', state: 'running' }]) }));
  const v = await observeAll({ ...base({ readRuntime: down }), previous });

  check('N2', 'runtime down is UNAVAILABLE, never "0 runs"; cache never shown as current', () => {
    assert(v.families.runtime.runs.klass === CLASS.UNAVAILABLE, 'runs must be UNAVAILABLE');
    assert(v.families.runtime.runs.value === null, 'must not present an empty run list as truth');
    assert(v.freshness.runtime.state === FRESHNESS.UNAVAILABLE, 'runtime family must read UNAVAILABLE');
    const h = v.families.runtime.health;
    if (h.last_known) {
      assert(h.last_known.authoritative === false, 'carried value must be non-authoritative');
      assert(h.klass === CLASS.UNAVAILABLE, 'carrying a last-known value must NOT restore OBSERVED');
    }
    assert(/source-down/.test(flat(v)), 'must raise source-down');
  });
})();

/* ================= N3 — production unreachable ================= */
await (async () => {
  const dead = async () => ({
    sha: unavailable('ssh production', 'ssh: connect timed out'),
    reach: unavailable('ssh production', 'ssh: connect timed out'),
  });
  const v = await observeAll(base({ readProduction: dead }));
  check('N3', 'production unreachable never renders healthy', () => {
    assert(v.families.production.sha.klass === CLASS.UNAVAILABLE, 'prod sha must be UNAVAILABLE');
    assert(v.freshness.production.state === FRESHNESS.UNAVAILABLE, 'production family UNAVAILABLE');
    assert(v.families.production.vs_trunk.klass === CLASS.UNKNOWN, 'delta must be UNKNOWN, not computed');
    assert(/production\.(sha|reach) UNAVAILABLE/.test(flat(v)), 'must say Observer cannot determine it');
    assert(!/healthy/i.test(flat(v)), 'must not contain a health claim');
  });
})();

/* ================= N4 — governance blocked ================= */
await (async () => {
  const runs = okRuntime([
    { run_id: 'r-9', work_unit: 'U1', state: 'gated', gate: { status: 'WAITING_FOUNDER', class: 'A', secret_note: 'INTERNAL' } },
  ]);
  const v = await observeAll(base({ readRuntime: runs }));
  check('N4', 'a run waiting for founder never appears runnable or clear', () => {
    const w = v.families.governance.waiting_for_founder;
    assert(w.klass === CLASS.OBSERVED && w.value.length === 1, 'waiting run must be surfaced');
    assert(/waiting-for-founder/.test(flat(v)), 'attention must name it');
  });
})();

/* ================= N5 — rate/concurrency disagreement ================= */
await (async () => {
  const lowConcHighRate = okClaims({
    claims: { active: 0 },
    rate: observed({ overall_band: 'ANOMALOUS', windows: { w60m: { distinct_sessions: 7 } }, recommendation: 'back off', units: 'local transcript request counts' }, 'session.mjs status --json'),
    ungoverned: { klass: CLASS.INFERRED, value: { observed_sessions: 7, governed_sessions: 0, ungoverned: 7 }, source: 'session.mjs status --json', observed_at: new Date().toISOString(), error: null, basis: 'transcripts exceed governed' },
  });
  const v = await observeAll(base({ readClaims: lowConcHighRate }));
  check('N5', 'zero concurrency + ANOMALOUS rate still surfaces pressure', () => {
    const rp = v.families.claims.rate_pressure;
    assert(rp.klass === CLASS.DERIVED && rp.value.elevated === true, 'pressure must be elevated');
    assert(rp.value.concurrency_active === 0, 'concurrency must remain visible as a separate figure');
    assert(/rate/.test(flat(v)) && /ANOMALOUS/.test(flat(v)), 'attention must carry the rate band');
    assert(/ungoverned/i.test(flat(v)), 'ungoverned lanes must surface');
  });
})();

/* ---- N5b: rate missing must NOT read as calm ---- */
await (async () => {
  const noRate = okClaims({ rate: unknown('session.mjs status --json', 'no rate reading') });
  const v = await observeAll(base({ readClaims: noRate }));
  check('N5b', 'missing rate is indeterminate, never "calm"', () => {
    assert(v.families.claims.rate_pressure.klass === CLASS.UNKNOWN, 'pressure must be UNKNOWN');
    assert(/does NOT imply calm/.test(flat(v)), 'must state that low concurrency does not imply calm');
  });
})();

/* ================= N6 — stale local tracking ref (regression) ================= */
await (async () => {
  // The real 2026-08-10 mistake: local tracking ref said 0d145071c; the remote
  // said 06f5103ef. Observer must report the remote's answer.
  const STALE_TRACKING = '0d145071c';
  const TRUE_REMOTE = '06f5103ef';
  let usedLsRemote = false;

  const exec = async (file, args) => {
    if (file === 'git' && args[0] === 'rev-parse' && args[1] === '--abbrev-ref') return { ok: true, stdout: 'feature/x\n' };
    if (file === 'git' && args[0] === 'rev-parse' && args[1] === 'HEAD') return { ok: true, stdout: 'deadbeef\n' };
    if (file === 'git' && args[0] === 'status') return { ok: true, stdout: '' };
    if (file === 'git' && args[0] === 'ls-remote') {
      usedLsRemote = true;
      return { ok: true, stdout: `${TRUE_REMOTE}\trefs/heads/clean-main-no-secrets\n` };
    }
    if (file === 'git' && args[0] === 'rev-list') return { ok: true, stdout: '6\n' };
    // Any read of refs/remotes/* would be the bug itself.
    if (file === 'git' && args.join(' ').includes('refs/remotes')) throw new Error('read a tracking ref');
    return { ok: false, reason: 'unexpected' };
  };

  const r = await adapters.readGit({ repoRoot: ROOT, exec });
  check('N6', 'remote truth comes from ls-remote, not a stale tracking ref', () => {
    assert(usedLsRemote, 'must consult the remote');
    assert(r.trunk_remote.klass === CLASS.OBSERVED, 'trunk must be OBSERVED');
    assert(r.trunk_remote.value === TRUE_REMOTE, `trunk must be ${TRUE_REMOTE}, got ${r.trunk_remote.value}`);
    assert(r.trunk_remote.value !== STALE_TRACKING, 'must NOT repeat the 0d145071c mistake');
    assert(r.trunk_remote.source === 'git ls-remote origin', 'source must name the remote');
  });

  // And when the remote is unreachable: UNKNOWN, never "probably synchronized".
  const offline = async (file, args) => {
    if (file === 'git' && args[0] === 'ls-remote') return { ok: false, reason: 'could not resolve host' };
    return exec(file, args);
  };
  const r2 = await adapters.readGit({ repoRoot: ROOT, exec: offline });
  check('N6b', 'remote unreachable ⇒ sync UNKNOWN, never assumed synchronized', () => {
    assert(r2.trunk_remote.klass === CLASS.UNAVAILABLE, 'trunk must be UNAVAILABLE');
    assert(r2.branch_on_remote.klass === CLASS.UNKNOWN, 'sync must be UNKNOWN');
    assert(/UNKNOWN, not assumed/.test(r2.branch_on_remote.error), 'must state it is not assumed');
    assert(r2.trunk_delta.klass === CLASS.UNKNOWN, 'delta must not be computed from a stale ref');
  });
})();

/* ---- N6c: local-only branch distinguishable from synchronized ---- */
await (async () => {
  const localOnly = okGit({
    branch_on_remote: observed({ present: false, remote_sha: null, in_sync: false }, 'git ls-remote origin'),
  });
  const v = await observeAll(base({ readGit: localOnly }));
  check('N6c', 'a branch with no remote ref is visibly distinct from a synced one', () => {
    assert(/local-only-branch/.test(flat(v)), 'must flag local-only');
  });
})();

/* ================= N7 — SSE notification drift ================= */
await (async () => {
  const ch = new NotificationChannel();
  const before = await observeAll(base({ readRuntime: okRuntime([{ run_id: 'r-1', state: 'running' }]) }));
  const res = ch.notify({ family: 'runtime', type: 'run.updated', payload: { run_id: 'r-1', state: 'COMPLETED_FABRICATED' } });

  check('N7', 'an SSE event invalidates but never supplies displayed state', () => {
    assert(res.carried_value === false, 'event must not carry a value into state');
    assert(ch.isStale('runtime'), 'event must mark the family stale');
    // The prior view is untouched by the event — only a REST re-read may change it.
    assert(before.families.runtime.runs.value[0].state === 'running', 'event must not mutate prior REST truth');
    assert(!JSON.stringify(before).includes('COMPLETED_FABRICATED'), 'event payload must never reach displayed state');
    ch.settle('runtime');
    assert(!ch.isStale('runtime'), 'settle only after a REST re-read');
  });
})();

/* ================= N8 — hidden governance material ================= */
await (async () => {
  const leaky = okRuntime([
    { run_id: 'r-3', work_unit: 'U2', state: 'gated',
      gate: { status: 'WAITING_FOUNDER', class: 'A', secret_note: 'INTERNAL-DO-NOT-SHOW', signing_key: 'PRIVATE' } },
  ]);
  const v = await observeAll(base({ readRuntime: leaky }));
  const blob = JSON.stringify(v.families.governance);

  check('N8', 'gate material passes through publicGovernanceGate; internals do not leak', () => {
    assert(!blob.includes('INTERNAL-DO-NOT-SHOW'), 'secret_note leaked');
    assert(!blob.includes('PRIVATE'), 'signing_key leaked');
    assert(blob.includes('WAITING_FOUNDER'), 'redacted public status should still be present');
  });

  // Redactor absent ⇒ refuse to render, rather than expose raw gate material.
  const v2 = await observeAll({ ...base({ readRuntime: leaky }), redact: undefined });
  check('N8b', 'no redactor ⇒ governance refuses to render, never falls back to raw', () => {
    assert(v2.families.governance.gates.klass === CLASS.UNAVAILABLE, 'must be UNAVAILABLE');
    assert(!JSON.stringify(v2.families.governance).includes('INTERNAL-DO-NOT-SHOW'), 'must not fall back to raw gate');
  });
})();

/* ================= N9 — no mutation reach (structural) ================= */
check('N9', 'Observer has no reach to mutate anything (absence of reach, not of buttons)', () => {
  const files = ['reading.js', 'adapters.js', 'observe.js', 'notification.js']
    .map((f) => ({ f, src: readFileSync(path.join(OBS, f), 'utf8') }));

  for (const { f, src } of files) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    assert(!/method:\s*['"]POST['"]/i.test(code), `${f}: POST request present`);
    assert(!/['"]POST['"]/.test(code), `${f}: POST verb present`);
    assert(!/\bexecSync\b|\bspawnSync\b/.test(code), `${f}: synchronous shell exec present`);
    assert(!/shell:\s*true/.test(code), `${f}: shell execution enabled`);
    assert(!/\/resolve-gate|\/cancel|\/runs['"]\s*,\s*['"]POST/.test(code), `${f}: mutation route referenced`);
    assert(!/resolveGovernanceGate|validateWorkerGate/.test(code), `${f}: calls a governance resolver`);
    assert(!/\bgit\s+(push|commit|merge|rebase|reset|checkout)\b/.test(code), `${f}: destructive git verb`);
    assert(!/writeFileSync|appendFileSync|mkdirSync|rmSync|unlinkSync/.test(code), `${f}: filesystem write`);
  }

  // Exported surface contains no write verbs.
  const surface = [...Object.keys(adapters), ...Object.keys(require(path.join(OBS, 'observe.js')))];
  const forbidden = /submit|create|update|delete|approve|resolve|deploy|mutate|write|cancel|post/i;
  const offenders = surface.filter((k) => forbidden.test(k));
  assert(offenders.length === 0, `write-shaped exports: ${offenders.join(', ')}`);

  // The only argv the adapters can build are read commands.
  const advSrc = readFileSync(path.join(OBS, 'adapters.js'), 'utf8');
  const argvs = [...advSrc.matchAll(/exec\(\s*'([a-z]+)'\s*,\s*\[([^\]]*)\]/g)]
    .map((m) => `${m[1]} ${m[2].replace(/['"\s]/g, ' ').trim()}`);
  for (const a of argvs) {
    assert(!/\b(push|commit|merge|rebase|reset|checkout|apply|rm)\b/.test(a), `mutating argv: ${a}`);
  }
});

/* ---------- report ---------- */
console.log('\nJARVIS O-1 — Observer negative controls\n');
console.log(results.join('\n'));
console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
