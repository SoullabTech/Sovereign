#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const freeze = JSON.parse(readFileSync(
  path.join(root, 'tests/constitutional/jarvis-o5-r4-silent-fallback/FREEZE.json'),
  'utf8',
));
let drift = 0;
for (const [rel, want] of Object.entries(freeze.frozen)) {
  let got;
  try {
    got = execFileSync('git', ['hash-object', path.join(root, rel)], { encoding: 'utf8' }).trim();
  } catch {
    got = '<missing>';
  }
  const ok = got === want;
  if (!ok) drift += 1;
  process.stdout.write(`${ok ? 'INTACT' : 'DRIFT '} ${rel}${ok ? '' : ` expected ${want} got ${got}`}\n`);
}
process.stdout.write(drift ? `FREEZE VIOLATED (${drift})\n` : 'FREEZE INTACT\n');
process.exit(drift ? 1 : 0);
