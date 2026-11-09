#!/usr/bin/env node
/**
 * WS-CONTINUITY — FREEZE INTEGRITY  (npm run verify:ws-continuity-freeze)
 *
 * The freeze is a checkable fact or it is prose. This recomputes each frozen file's git BLOB hash and refuses on any drift.
 * ⭐ Blob hashes, not a commit diff: blob identity survives history rewriting and names exactly which bytes are law.
 * ⛔ Additive law is lawful and permitted: new law lives at its own address. What is refused is an EDIT to a frozen file.
 * Exit 0 intact · 1 drift · 2 instrument error.   `--manifest <path>` is for proving the guard, never for CI.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const argIdx = process.argv.indexOf('--manifest');
const MANIFEST = argIdx > -1 ? path.resolve(process.argv[argIdx + 1]) : path.join(root, 'tests/constitutional/ws-continuity-freeze/FREEZE.json');

if (!fs.existsSync(MANIFEST)) { console.error(`INSTRUMENT ERROR — freeze manifest not found: ${MANIFEST}`); process.exit(2); }
let m;
try { m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch (e) { console.error(`INSTRUMENT ERROR — manifest unreadable: ${e.message}`); process.exit(2); }
const entries = Object.entries(m.frozen ?? {});
if (entries.length === 0) { console.error('INSTRUMENT ERROR — the manifest freezes nothing. An empty freeze is not a freeze.'); process.exit(2); }
if (entries.some(([, h]) => !/^[0-9a-f]{40}$/.test(h))) { console.error('INSTRUMENT ERROR — a frozen entry is not a 40-hex git blob hash.'); process.exit(2); }

console.log('WS-CONTINUITY — FREEZE INTEGRITY');
console.log(`  freeze commit ${String(m.freeze_commit).slice(0, 9)} · ${entries.length} frozen file(s)\n`);
let drift = 0;
for (const [file, expected] of entries) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) { drift++; console.error(`  ✗ ${file}\n      ABSENT (a frozen file may not be deleted)`); continue; }
  let live;
  try { live = execFileSync('git', ['hash-object', abs], { encoding: 'utf8' }).trim(); }
  catch (e) { console.error(`INSTRUMENT ERROR — git hash-object failed on ${file}: ${e.message}`); process.exit(2); }
  if (live !== expected) { drift++; console.error(`  ✗ ${file}\n      expected ${expected}\n      live     ${live}`); }
  else console.log(`  ✓ ${file}`);
}
if (drift > 0) {
  console.error(`\nFREEZE BROKEN — ${drift} frozen file(s) drifted. Lawful: implementation fails suite → repair the implementation. Forbidden: reinterpret the law → edit the test.`);
  process.exit(1);
}
console.log('\nFREEZE INTACT');
