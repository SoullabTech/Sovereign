#!/usr/bin/env tsx
/**
 * FLAGSHIP ACCEPTANCE-SUITE FREEZE — INTEGRITY  (npm run verify:flagship-freeze)
 *
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / FS1. The accepted flagship laws, defeat
 * candidates, matrix runners, goldens and mechanically-required references are
 * frozen by GIT BLOB IDENTITY in tests/constitutional/writers-studio/FLAGSHIP_FREEZE.json.
 *
 * ⭐ Blob hashes, not a commit diff: identity survives history rewriting and
 *    names exactly which bytes are law.
 * ⛔ Additive law is lawful — new falsifiers live at their own address. What is
 *    refused is an EDIT to, or the DISAPPEARANCE of, a frozen file: the move by
 *    which an inconvenient test gets quietly domesticated.
 * ⛔ THE MANIFEST CANNOT BLESS ITSELF. Its SHA-256 is pinned HERE. Editing the
 *    manifest to accept changed bytes fails until this pin is also changed —
 *    and changing both is a re-freeze, an authorized act, never verification.
 *
 * Exit 0 intact · 1 drift / manifest altered · 2 instrument error.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** ⭐ Pinned at FS1. A re-freeze (authorized act) updates this constant together with the manifest. */
const MANIFEST_SHA256 = 'd1fff27d630968ae5d65ee87186864c8c26c2b555443a99340fa9663cb435a68';
const MANIFEST = path.resolve(__dirname, '../tests/constitutional/writers-studio/FLAGSHIP_FREEZE.json');
const BLOB = /^[0-9a-f]{40}$/;

type Entry = { blob: string; class: string };
type Manifest = { act: string; freeze_base: string; branch: string; law: string; frozen: Record<string, Entry> };

function main(): number {
  console.log('FLAGSHIP ACCEPTANCE-SUITE FREEZE — INTEGRITY');
  if (!fs.existsSync(MANIFEST)) { console.error(`  INSTRUMENT ERROR — manifest not found: ${MANIFEST}`); return 2; }
  const raw = fs.readFileSync(MANIFEST);
  const digest = createHash('sha256').update(raw).digest('hex');
  if (digest !== MANIFEST_SHA256) {
    console.error('  ✗ MANIFEST ALTERED — its SHA-256 does not match the pin in this verifier.');
    console.error(`      pinned  ${MANIFEST_SHA256}\n      actual  ${digest}`);
    console.error('      A manifest edit is not verification. A re-freeze is a separately authorized act that updates the manifest AND this pin.');
    return 1;
  }
  let m: Manifest;
  try { m = JSON.parse(raw.toString('utf8')) as Manifest; } catch (e) { console.error(`  INSTRUMENT ERROR — manifest unreadable: ${(e as Error).message}`); return 2; }
  const entries = Object.entries(m.frozen ?? {});
  if (entries.length === 0) { console.error('  INSTRUMENT ERROR — the manifest freezes nothing. An empty freeze is not a freeze.'); return 2; }
  console.log(`  base ${String(m.freeze_base).slice(0, 9)} · ${entries.length} frozen file(s)\n`);
  const drift: string[] = []; let instrument = false;
  for (const [file, entry] of entries) {
    if (!entry || typeof entry.blob !== 'string' || !BLOB.test(entry.blob)) { console.error(`  ✗ ${file}\n      MALFORMED manifest entry`); instrument = true; continue; }
    if (!fs.existsSync(file)) { drift.push(file); console.error(`  ✗ ${file}\n      ABSENT — a frozen file may not be deleted`); continue; }
    let live: string;
    try { live = execFileSync('git', ['hash-object', file], { encoding: 'utf8' }).trim(); }
    catch (e) { console.error(`  ✗ ${file}\n      INSTRUMENT ERROR — cannot establish identity: ${(e as Error).message}`); instrument = true; continue; }
    if (live !== entry.blob) { drift.push(file); console.error(`  ✗ ${file}\n      CHANGED  frozen ${entry.blob.slice(0, 12)} · live ${live.slice(0, 12)}`); }
    else console.log(`  ✓ ${file}`);
  }
  console.log('');
  if (instrument) { console.error('  INSTRUMENT ERROR — identity could not be established for every entry; nothing is certified.'); return 2; }
  if (drift.length) { console.error(`  ⛔ FREEZE BROKEN — ${drift.length} frozen file(s) drifted:`); for (const f of drift) console.error(`     ${f}`); return 1; }
  console.log(`  ✅ FREEZE INTACT — ${entries.length}/${entries.length} frozen files blob-identical to ${String(m.freeze_base).slice(0, 9)}`);
  return 0;
}
process.exit(main());
