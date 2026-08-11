#!/usr/bin/env node
/**
 * JARVIS O-1 — Observer.
 *
 * Read-only. Assembles existing authoritative signals and renders them with
 * their source, class, and freshness. Changes nothing.
 *
 *   node scripts/builder/jarvis-observer.mjs            terminal view
 *   node scripts/builder/jarvis-observer.mjs --json      machine-readable
 *   node scripts/builder/jarvis-observer.mjs --no-prod   skip the ssh probe
 *
 * The Desktop surface consumes the same composition module, so the terminal and
 * the window cannot drift apart.
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { publicGovernanceGate } from './jarvis-governance-gate.mjs';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { observeAll } = require(path.join(ROOT, 'desktop-app/jarvis/lib/observer/observe.js'));
const { CLASS, hasValue } = require(path.join(ROOT, 'desktop-app/jarvis/lib/observer/reading.js'));

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);

const view = await observeAll({
  repoRoot: ROOT,
  redact: publicGovernanceGate,
  production: { enabled: !has('--no-prod') },
});

if (has('--json')) {
  console.log(JSON.stringify(view, null, 2));
  process.exit(0);
}

/* ---------------- terminal rendering ---------------- */

const C = process.stdout.isTTY
  ? { dim: '\x1b[2m', red: '\x1b[31m', yel: '\x1b[33m', grn: '\x1b[32m', cyn: '\x1b[36m', bold: '\x1b[1m', off: '\x1b[0m' }
  : { dim: '', red: '', yel: '', grn: '', cyn: '', bold: '', off: '' };

// Class markers are deliberately distinct glyphs, not colour alone — the
// difference between "unhealthy" and "cannot determine" must survive a
// screenshot, a colourblind reader, and a copy-paste into a text log.
const MARK = {
  [CLASS.OBSERVED]: `${C.grn}●${C.off}`,
  [CLASS.DERIVED]: `${C.cyn}◈${C.off}`,
  [CLASS.INFERRED]: `${C.yel}▲${C.off}`,
  [CLASS.UNAVAILABLE]: `${C.red}✕${C.off}`,
  [CLASS.UNKNOWN]: `${C.dim}?${C.off}`,
};

const ago = (iso) => {
  if (!iso) return 'never';
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.round(s / 60)}m ago` : `${(s / 3600).toFixed(1)}h ago`;
};

function line(label, reading, fmt = (v) => String(v)) {
  const m = MARK[reading?.klass] ?? MARK[CLASS.UNKNOWN];
  // INFERRED carries a real value and must render it — but keeps its own marker,
  // so an inference never reads as an observation.
  const showsValue = hasValue(reading) || reading?.klass === CLASS.INFERRED;
  if (showsValue) return `  ${m} ${label.padEnd(22)} ${fmt(reading.value)}`;
  const why = reading?.error ? `${C.dim}${reading.error}${C.off}` : '';
  const lk = reading?.last_known
    ? ` ${C.dim}(last known ${ago(reading.last_known.observed_at)} — NOT current)${C.off}`
    : '';
  return `  ${m} ${label.padEnd(22)} ${C.dim}${reading?.klass ?? 'UNKNOWN'}${C.off}  ${why}${lk}`;
}

const f = view.families;
console.log(`\n${C.bold}WHAT IS JARVIS DOING?${C.off}   ${C.dim}${view.composed_at}${C.off}`);
console.log(`${C.dim}${'─'.repeat(74)}${C.off}`);

console.log(`\n${C.bold}CLAIMS & CAPACITY${C.off}`);
console.log(line('active / limit', f.claims.claims, (v) => `${v.active} / ${v.limit}  ${C.dim}(limit source: ${v.limit_source})${C.off}`));
console.log(line('queued', f.claims.claims, (v) => String(v.queued)));
console.log(line('collisions', f.claims.claims, (v) => v.collisions.length ? `${C.red}${v.collisions.length}${C.off}` : '0'));
console.log(line('stale / recoverable', f.claims.claims, (v) => v.recoverable.length ? `${C.yel}${v.recoverable.length}${C.off}` : '0'));
if (hasValue(f.claims.claims) && f.claims.claims.value.sessions.length) {
  for (const s of f.claims.claims.value.sessions) {
    console.log(`      ${C.dim}·${C.off} ${s.work_unit ?? '(no unit)'}  ${C.dim}${s.owner ?? ''} ${s.branch ?? ''} ${s.age_s != null ? Math.round(s.age_s / 60) + 'm' : ''}${C.off}`);
  }
}

console.log(`\n${C.bold}RATE PRESSURE${C.off} ${C.dim}(independent of concurrency — a proxy is not the variable)${C.off}`);
console.log(line('band', f.claims.rate, (v) => `${v.overall_band}  ${C.dim}${v.units}${C.off}`));
console.log(line('pressure', f.claims.rate_pressure, (v) => (v.elevated ? `${C.red}ELEVATED${C.off}` : 'normal')));
console.log(line('ungoverned lanes', f.claims.ungoverned_lanes, (v) => (v.ungoverned > 0 ? `${C.yel}${v.ungoverned}${C.off} of ${v.observed_sessions} observed` : '0')));

console.log(`\n${C.bold}RUNTIME & GOVERNANCE${C.off}`);
console.log(line('runtime', f.runtime.health, () => 'reachable'));
console.log(line('runs', f.runtime.runs, (v) => `${v.length}`));
console.log(line('gates', f.governance.gates, (v) => `${v.length}`));
console.log(line('waiting for founder', f.governance.waiting_for_founder, (v) => (v.length ? `${C.yel}${v.length}${C.off}` : '0')));

console.log(`\n${C.bold}GIT${C.off}`);
console.log(line('branch', f.git.branch));
console.log(line('HEAD', f.git.head, (v) => v.slice(0, 9)));
console.log(line('uncommitted paths', f.git.dirty));
console.log(line('trunk (remote)', f.git.trunk_remote, (v) => v.slice(0, 9)));
console.log(line('on remote', f.git.branch_on_remote, (v) => (v.present ? (v.in_sync ? 'yes, in sync' : `${C.yel}diverged${C.off}`) : `${C.red}NO — local only${C.off}`)));
console.log(line('behind trunk', f.git.trunk_delta, (v) => `${v.behind_trunk} commits`));
console.log(line('pull request', f.github.pr, (v) => (v ? `#${v.number} ${v.state} ${v.merge_state}` : 'none for this branch')));

console.log(`\n${C.bold}PRODUCTION${C.off}`);
console.log(line('GIT_COMMIT', f.production.sha, (v) => (v.sha ? v.sha : `${C.red}unknown — provenance BYPASSED${C.off}`)));
console.log(line('reachable', f.production.reach, () => 'container responded'));
console.log(line('vs trunk', f.production.vs_trunk, (v) => `${v.production.slice(0, 9)} vs ${v.trunk.slice(0, 9)}`));

console.log(`\n${C.bold}NEEDS YOU${C.off}`);
if (!view.attention.length) console.log(`  ${C.dim}(nothing requires you)${C.off}`);
for (const a of view.attention) {
  console.log(`  ${MARK[a.klass] ?? '?'} ${a.text}`);
  if (a.detail) console.log(`      ${C.dim}${a.detail}${C.off}`);
}

console.log(`\n${C.bold}FRESHNESS${C.off} ${C.dim}(per family — one refresh does not make everything current)${C.off}`);
for (const [fam, fr] of Object.entries(view.freshness)) {
  const col = fr.state === 'live' ? C.grn : fr.state === 'stale' ? C.yel : fr.state === 'unavailable' ? C.red : C.dim;
  console.log(`  ${fam.padEnd(12)} ${col}${fr.state.padEnd(12)}${C.off} ${C.dim}${ago(fr.observed_at)}${C.off}`);
}
console.log('');
