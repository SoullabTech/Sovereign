#!/usr/bin/env node
/**
 * JARVIS-KP-01 / I5-P0 — FREEZE INTEGRITY  (npm run verify:i5-p0-freeze)
 *
 * The freeze is a checkable fact or it is prose. This recomputes each frozen
 * file's git blob hash and refuses on any drift.
 *
 * Blob hashes, not a commit diff: blob identity survives history rewriting and
 * names exactly which bytes ran against production.
 *
 * The hash is computed natively — sha1("blob <bytelength>\0" + contents), which
 * is git's object identity by definition — so the guard runs on a host that has
 * no git, no network and no node_modules. `git hash-object <file>` must agree,
 * and the lethality record proves it does.
 *
 * Additive law is lawful and this guard permits it: a new instrument lives at
 * its own address. What it refuses is an EDIT to a frozen file.
 *
 * Exit 0 intact · 1 drift · 2 instrument error.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const MANIFEST = path.join(ROOT, 'tests/constitutional/jarvis-kp-01/I5_P0_FREEZE.json');

function blobHash(buffer) {
  return createHash('sha1')
    .update(`blob ${buffer.length}\0`)
    .update(buffer)
    .digest('hex');
}

function main() {
  if (!fs.existsSync(MANIFEST)) {
    console.error(`INSTRUMENT ERROR — freeze manifest not found: ${MANIFEST}`);
    return 2;
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  } catch (error) {
    console.error(`INSTRUMENT ERROR — manifest is not readable JSON: ${error.message}`);
    return 2;
  }
  const entries = Object.entries(manifest.frozen ?? {});
  if (entries.length === 0) {
    console.error('INSTRUMENT ERROR — the manifest freezes nothing. An empty freeze is not a freeze.');
    return 2;
  }
  for (const [file, expected] of entries) {
    if (typeof expected !== 'string' || !/^[0-9a-f]{40}$/.test(expected)) {
      console.error(`INSTRUMENT ERROR — ${file} carries no usable blob hash. A freeze that pins nothing passes everything.`);
      return 2;
    }
  }

  console.log('JARVIS-KP-01 / I5-P0 — FREEZE INTEGRITY');
  console.log(`  subject ${String(manifest.freeze_subject_commit).slice(0, 9)} · ${entries.length} frozen file(s)\n`);

  const drift = [];
  for (const [file, expected] of entries) {
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) {
      drift.push(`${file} — ABSENT (a frozen instrument may not be deleted)`);
      console.error(`  x ${file}\n      ABSENT`);
      continue;
    }
    const live = blobHash(fs.readFileSync(abs));
    if (live !== expected) {
      drift.push(`${file} — expected ${expected.slice(0, 12)}…, live ${live.slice(0, 12)}…`);
      console.error(`  x ${file}\n      expected ${expected}\n      live     ${live}`);
      continue;
    }
    console.log(`  ok ${file}\n      ${live}`);
  }

  if (drift.length) {
    console.error('\nFREEZE DRIFT — these bytes are not the bytes that ran against production.');
    for (const line of drift) console.error(`  - ${line}`);
    console.error('\nA frozen instrument is repaired by adding a new one at a new address,');
    console.error('never by editing these. Reopening requires a named founder act.');
    return 1;
  }
  console.log('\nFREEZE INTACT — every frozen instrument matches its authorized blob.');
  return 0;
}

process.exit(main());
