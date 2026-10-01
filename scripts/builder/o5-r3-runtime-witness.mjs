#!/usr/bin/env node
/**
 * O5-R3 runtime binding witness — READ-ONLY reader for the admission walk.
 *
 * Reads ~/Library/Application Support/JARVIS/runtime-binding.json (or --support <dir>),
 * the bound checkout it names, the delegation home's grant-writer lease and the process
 * table, and checks they agree. It writes nothing and confers nothing: the record grants
 * no authority, and neither does this reader's verdict. It only reports what is true now.
 *
 *   node scripts/builder/o5-r3-runtime-witness.mjs [--support <appSupportDir>] [--base <sha>]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(import.meta.url);
const RB = require(path.join(ROOT, 'jarvis-desktop/src/runtime-binding.js'));
const LEASE = await import(pathToFileURL(path.join(ROOT, 'scripts/builder/grant-writer-lease-v1.mjs')).href);

const args = process.argv.slice(2);
const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
const support = val('--support') || path.join(os.homedir(), 'Library', 'Application Support');
const base = val('--base') || 'ce061073';
const git = (root, ...a) => { try { return execFileSync('git', ['-C', root, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
const checks = [];
const check = (name, ok, detail) => { checks.push({ name, ok: !!ok, detail }); };

const file = RB.bindingPath(support);
const rec = RB.readRecord(file);
check('record present and readable', !!rec, file);
const live = rec ? RB.judgeLive(rec) : 'UNREADABLE';
check('record describes a LIVE process (host + pid + incarnation)', live === 'LIVE', live);

let leaseState = null;
if (rec) {
  const root = rec.binding?.repoRoot;
  check('launch mode A: development, app source root IS the bound checkout', rec.app?.mode === 'development' && rec.app?.sourceRoot === root, `${rec.app?.mode} · source ${rec.app?.sourceRoot} · bound ${root}`);
  check('bound via dev-walk (no override in force)', rec.binding?.selectionSource === 'dev-walk', rec.binding?.selectionSource);
  check('JARVIS_REPO_ROOT absent, or the same checkout', !rec.env?.JARVIS_REPO_ROOT || rec.env.JARVIS_REPO_ROOT === root, String(rec.env?.JARVIS_REPO_ROOT));
  const head = root ? git(root, 'rev-parse', 'HEAD') : null;
  check('record HEAD = the checkout\'s HEAD now', head && head === rec.binding?.head, `${rec.binding?.head} vs ${head}`);
  check(`HEAD contains ${base}`, root && git(root, 'merge-base', '--is-ancestor', base, 'HEAD') !== null, base);
  const porcelain = root ? git(root, 'status', '--porcelain') : null;
  check('checkout clean (record and now)', rec.binding?.clean === true && porcelain === '', `record clean=${rec.binding?.clean} · now ${porcelain === '' ? 'clean' : 'DIRTY'}`);
  for (const rel of RB.STORE_FILES) {
    let now = null; try { now = 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex'); } catch { /* absent */ }
    check(`store ${path.basename(rel)} present and unchanged since the record`, now && rec.stores?.[rel] === now, `${rec.stores?.[rel]?.slice(0, 19)}… vs ${now?.slice(0, 19)}…`);
  }
  const home = rec.delegationHome;
  leaseState = LEASE.readLeaseState(home);
  const h = leaseState.record;
  const holder = !h ? 'NO_LEASE' : h.released ? 'RELEASED' : (h.host === rec.host && h.pid === rec.pid && h.process_start_time === rec.processStartedAt) ? 'HELD_BY_THIS_DESKTOP' : 'HELD_BY_ANOTHER_PROCESS';
  check('lease: generation readable', !leaseState.unreadable, `generation ${leaseState.generation} · ${holder}`);
  check('lease holder is this Desktop (expected after step 6)', holder === 'HELD_BY_THIS_DESKTOP', holder);
}

// Other possible grant writers: any process whose COMMAND LINE names a grant-writer entry point, except this
// reader and the Desktop. ⚠️ A heuristic, not a proof: a process that imports a store through a differently named
// script does not show here, and a shell whose command text merely mentions one does. Treat a hit as a question
// to answer, and a clean census as point-in-time evidence, never as a guarantee.
const patterns = /(work-unit-control|o5-recovery-census|o5-path-b-recovery|canonical-provider-execution-grant|human-provider-execution-grant|grant-writer-lease|grant-ledger-core)/;
let others = [];
try {
  others = execFileSync('ps', ['-axo', 'pid=,lstart=,command='], { encoding: 'utf8' }).split('\n')
    .filter((l) => patterns.test(l) && !/o5-r3-runtime-witness\.mjs/.test(l)).map((l) => l.trim().slice(0, 200))
    .filter((l) => { const pid = Number(l.split(/\s+/)[0]); return pid !== process.pid && pid !== rec?.pid; });
} catch { others = ['<ps unavailable>']; }
check('no other process names a grant-writer entry point', others.length === 0, others.join(' | ') || 'none');

const failed = checks.filter((c) => !c.ok);
process.stdout.write(JSON.stringify({ witnessed_at: new Date().toISOString(), record_path: file, record: rec, lease: leaseState, checks }, null, 2) + '\n\n');
for (const c of checks) process.stdout.write(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}  (${c.detail})\n`);
process.stdout.write(`\n${failed.length ? `NOT YET ADMISSIBLE (${failed.length})` : 'RUNTIME BINDING WITNESSED'} · the record grants no authority; this verdict grants none either\n`);
process.exit(failed.length ? 1 : 0);
