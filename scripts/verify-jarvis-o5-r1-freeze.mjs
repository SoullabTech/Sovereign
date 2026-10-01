#!/usr/bin/env node
/**
 * JARVIS O5-R1 freeze guard. Compares the git BLOB hash of every frozen file
 * against tests/constitutional/jarvis-o5-r1/FREEZE.json. Any drift → exit 1.
 * Blob identity, not a commit diff: it names exactly which bytes are law and
 * survives history rewriting (review-custody precedent).
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const freeze = JSON.parse(readFileSync(path.join(root, 'tests/constitutional/jarvis-o5-r1/FREEZE.json'), 'utf8'));
let drift = 0;
for (const [rel, want] of Object.entries(freeze.frozen)) {
  let got;
  try { got = execFileSync('git', ['hash-object', path.join(root, rel)], { encoding: 'utf8' }).trim(); }
  catch { got = '<missing>'; }
  const ok = got === want;
  if (!ok) drift += 1;
  process.stdout.write(`${ok ? 'INTACT' : 'DRIFT '} ${rel}${ok ? '' : `  expected ${want} got ${got}`}\n`);
}
process.stdout.write(drift ? `FREEZE VIOLATED (${drift})\n` : 'FREEZE INTACT\n');
process.exit(drift ? 1 : 0);
