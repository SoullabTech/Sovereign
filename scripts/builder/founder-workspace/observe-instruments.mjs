#!/usr/bin/env node
// @ts-check
/**
 * CLI: build the registry, observe every admitted local instrument, print a summary (B3).
 *   node scripts/builder/founder-workspace/observe-instruments.mjs [--write] [--json] [--only id,id]
 * `--write` stores each observation under $AIN_HOME/observations/<id>/<observed_at>.json (rebuildable state; never under docs/).
 */
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { buildRegistry, observeAll } from './instrument-registry.mjs';
import { resolveAinHome } from './read-organs.mjs';

const args = process.argv.slice(2);
const flag = (/** @type {string} */ k) => args.includes(k);
const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? new Set(args[i + 1].split(',')) : null; })();
const reg = buildRegistry();
const entries = only ? reg.entries.filter((e) => only.has(e.id)) : reg.entries;
const scratchDir = mkdtempSync(path.join(os.tmpdir(), 'fw-observe-'));
const obs = await observeAll({ entries }, { scratchDir });
if (flag('--write')) {
  for (const o of obs) {
    const dir = path.join(resolveAinHome(process.env), 'observations', o.instrument_id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, `${o.observed_at.replace(/[:.]/g, '-')}.json`), JSON.stringify(o, null, 2) + '\n');
  }
  console.error(`wrote ${obs.length} observation(s) under ${path.join(resolveAinHome(process.env), 'observations')}`);
}
if (flag('--json')) console.log(JSON.stringify({ registry: reg, observations: obs }, null, 2));
else for (const o of obs) console.log(`${o.state.padEnd(16)} ${o.instrument_id.padEnd(34)} ${o.freshness.padEnd(10)} ${o.proof || '-'}  ${o.error ? '· ' + String(o.error).slice(0, 80) : ''}`);
