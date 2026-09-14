#!/usr/bin/env node
// JOP-04 R1a · pin sealing — a SEPARATE, deliberate custody act.
//
// ⛔ NOT part of the acceptance run. The judge is read-only and fail-closed precisely so that a
//    post-repair checkout cannot mint a baseline from the repair it is judging. Re-sealing is an
//    act a human performs under a custody ruling, and it REFUSES to overwrite existing pins.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { buildFixture } from './fixture.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const { CAPABILITIES, runCapability } = await import(path.join(REPO, 'scripts/builder/deterministic.mjs'));
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
const force = process.argv.includes('--force');

const PINS = [path.join(HERE, 'pinned-gitlog-output.json'), path.join(HERE, 'pinned-out-of-scope.json')];
const existing = PINS.filter(p => fs.existsSync(p));
if (existing.length && !force) {
  console.error('⛔ REFUSED: pins already exist:');
  for (const p of existing) console.error(`   ${path.relative(REPO, p)}`);
  console.error('   Re-sealing discards the baseline the judge measures against. Pass --force ONLY');
  console.error('   under an explicit custody ruling, and say so in the commit.');
  process.exit(2);
}

const fx = buildFixture();
try {
  const args = { max_count: 3 };
  const out = runCapability('git.log', args, fx.root);
  fs.writeFileSync(PINS[0], JSON.stringify({
    _note: 'D2.3 pin — captured from the UNREPAIRED subject against the hermetic fixture.',
    capability: 'git.log', args, stdout: out.stdout, exit_code: out.exit_code,
  }, null, 2) + '\n');

  const scope = { _note: 'Out-of-scope shape pin. Out of jurisdiction means UNCHANGED, not still named the same.' };
  for (const n of ['check.run', 'verify.file_exists', 'verify.sha256', 'verify.count_matches']) {
    scope[n] = { args: sha(JSON.stringify(CAPABILITIES[n]?.args ?? null)), handler: sha(String(CAPABILITIES[n]?.handler ?? '')) };
  }
  fs.writeFileSync(PINS[1], JSON.stringify(scope, null, 2) + '\n');
  console.log('sealed:'); for (const p of PINS) console.log(`  ${path.relative(REPO, p)}`);
} finally { fx.cleanup(); }
