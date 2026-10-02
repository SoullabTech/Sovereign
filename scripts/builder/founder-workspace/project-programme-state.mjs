#!/usr/bin/env node
// @ts-check
/**
 * CLI: project programme-state.v1 from the repository (B4).
 *   node scripts/builder/founder-workspace/project-programme-state.mjs [--root DIR] [--observed-against SHA] [--write] [--summary]
 * Prints the projection (or a summary). `--write` stores it under $AIN_HOME/projections/
 * (FD-3: rebuildable operational state; ⛔ never under docs/). No other side effect.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readTree, project } from './programme-state-projector.mjs';
import { resolveAinHome } from './read-organs.mjs';

const args = process.argv.slice(2);
const opt = (/** @type {string} */ k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const flag = (/** @type {string} */ k) => args.includes(k);
const root = path.resolve(opt('--root') || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..'));
let observed = opt('--observed-against');
if (!observed) { try { observed = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { observed = 'unobserved'; } }

const p = project(readTree({ root }), { observed_against: observed });
if (flag('--write')) {
  const out = path.join(resolveAinHome(process.env), 'projections', 'programme-state.v1.json');
  if (/(^|\/)docs(\/|$)/.test(path.relative(root, out)) && !path.relative(root, out).startsWith('..')) { console.error('refused: projection may not be written under docs/'); process.exit(2); }
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(p, null, 2) + '\n');
  console.error(`wrote ${out}`);
}
if (flag('--summary')) {
  const pop = p.population;
  console.log(`programme-state.v1 · observed_against ${observed.slice(0, 8)} · hash ${p.content_hash.slice(0, 12)}`);
  console.log(`subjects ${pop.subjects.total} (files ${pop.subjects.files} · bullets ${pop.subjects.thread_bullets}) · programmes ${pop.emitted} · unclassified ${pop.unclassified.length} · unreadable ${pop.unreadable.length} · complete=${pop.complete}`);
  /** @type {Record<string, number>} */ const es = {}; for (const r of p.programmes) es[r.evidence_state] = (es[r.evidence_state] || 0) + 1;
  console.log('evidence states', JSON.stringify(es));
  for (const r of p.programmes) console.log(`  ${r.id.padEnd(46)} ${r.evidence_state.padEnd(22)} ${r.last_change.date || '-'} ${r.external ? 'EXTERNAL' : ''} ${(r.standing || '').slice(0, 70)}`);
} else if (!flag('--write')) console.log(JSON.stringify(p, null, 2));
