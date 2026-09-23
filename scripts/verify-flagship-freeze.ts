#!/usr/bin/env tsx
/**
 * FLAGSHIP ACCEPTANCE-SUITE FREEZE — INTEGRITY  (npm run verify:flagship-freeze)
 *
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / FS2 (successor to FS1 under R1-1C). The accepted flagship
 * laws, defeat candidates, matrix runners, goldens, witnesses and mechanically-required references
 * are frozen by GIT BLOB IDENTITY in tests/constitutional/writers-studio/FLAGSHIP_FREEZE.json.
 *
 * ⭐ Blob hashes, not a commit diff: identity survives history rewriting and
 *    names exactly which bytes are law.
 * ⛔ Additive law is lawful — new falsifiers live at their own address. What is
 *    refused is an EDIT to, or the DISAPPEARANCE of, a frozen file: the move by
 *    which an inconvenient test gets quietly domesticated.
 * ⛔ THE MANIFEST CANNOT BLESS ITSELF. Its SHA-256 is pinned HERE. Editing the
 *    manifest to accept changed bytes fails until this pin is also changed —
 *    and changing both is a re-freeze, an authorized act, never verification.
 * ⭐ SUCCESSION CUSTODY (FS2). The FS1 manifest is PRESERVED byte-for-byte at its
 *    own address and pinned here by digest, so the pre-Review-navigation state
 *    stays reconstructible and identifiable. Every FS1-frozen file must either be
 *    frozen again at the SAME blob, or be named in `supersedes.superseded` with its
 *    FS1 blob, a successor law and a reason. History is never rewritten so that FS1
 *    appears to have contained Review navigation.
 *
 * Exit 0 intact · 1 drift / manifest altered / custody broken · 2 instrument error.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** ⭐ Pinned at FS2. A re-freeze (authorized act) updates this constant together with the manifest. */
const MANIFEST_SHA256 = 'd7421b38c1fdc260feb7d7155819976dbf71f12064c87812efa0e4332715618f';
/** ⭐ The FS1 manifest, preserved verbatim; its FS1 digest is the pin FS1's verifier carried. */
const FS1_PRESERVED_SHA256 = 'd1fff27d630968ae5d65ee87186864c8c26c2b555443a99340fa9663cb435a68';
const MANIFEST = path.resolve(__dirname, '../tests/constitutional/writers-studio/FLAGSHIP_FREEZE.json');
const FS1_PRESERVED = path.resolve(__dirname, '../tests/constitutional/writers-studio/FLAGSHIP_FREEZE_FS1.json');
const BLOB = /^[0-9a-f]{40}$/;

type Entry = { blob: string; class: string };
type Superseded = { fs1_blob: string; successor: string; reason: string };
type Manifest = {
  act: string; freeze_base: string; branch: string; law: string; frozen: Record<string, Entry>;
  supersedes?: { act: string; manifest_sha256: string; freeze_base: string; preserved_at: string; superseded: Record<string, Superseded> };
};

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
  /* ── succession custody: FS1 preserved and accounted for ── */
  const custody: string[] = [];
  if (m.supersedes) {
    if (!fs.existsSync(FS1_PRESERVED)) { custody.push('FS1 manifest ABSENT at its preserved address'); }
    else {
      const fs1raw = fs.readFileSync(FS1_PRESERVED);
      const fs1digest = createHash('sha256').update(fs1raw).digest('hex');
      if (fs1digest !== FS1_PRESERVED_SHA256 || m.supersedes.manifest_sha256 !== FS1_PRESERVED_SHA256) custody.push(`FS1 manifest not byte-identical to its FS1 digest (preserved ${fs1digest.slice(0, 12)} · pinned ${FS1_PRESERVED_SHA256.slice(0, 12)} · manifest says ${String(m.supersedes.manifest_sha256).slice(0, 12)})`);
      else {
        const fs1 = JSON.parse(fs1raw.toString('utf8')) as { frozen: Record<string, Entry> };
        for (const [file, entry] of Object.entries(fs1.frozen)) {
          const again = m.frozen[file]?.blob === entry.blob;
          const sup = m.supersedes.superseded?.[file];
          const accounted = again || (!!sup && sup.fs1_blob === entry.blob && !!sup.successor && !!sup.reason && m.frozen[file] !== undefined);
          if (!accounted) custody.push(`FS1 file neither re-frozen at its FS1 blob nor explicitly superseded: ${file}`);
        }
        for (const [file, sup] of Object.entries(m.supersedes.superseded ?? {})) {
          if (!fs1.frozen[file]) custody.push(`superseded entry names a file FS1 never froze: ${file}`);
          else if (m.frozen[file]?.blob === sup.fs1_blob) custody.push(`superseded entry for an UNCHANGED file (succession claimed, nothing succeeded): ${file}`);
        }
        console.log(`  ✓ FS1 manifest preserved at ${path.relative(process.cwd(), FS1_PRESERVED)} (sha256 ${fs1digest.slice(0, 12)}) · ${Object.keys(fs1.frozen).length} FS1 files accounted for · ${Object.keys(m.supersedes.superseded ?? {}).length} explicitly superseded`);
      }
    }
    console.log('');
  }
  if (instrument) { console.error('  INSTRUMENT ERROR — identity could not be established for every entry; nothing is certified.'); return 2; }
  if (drift.length) { console.error(`  ⛔ FREEZE BROKEN — ${drift.length} frozen file(s) drifted:`); for (const f of drift) console.error(`     ${f}`); return 1; }
  if (custody.length) { console.error(`  ⛔ SUCCESSION CUSTODY BROKEN — ${custody.length} problem(s):`); for (const c of custody) console.error(`     ${c}`); return 1; }
  console.log(`  ✅ FREEZE INTACT — ${entries.length}/${entries.length} frozen files blob-identical to ${String(m.freeze_base).slice(0, 9)}${m.supersedes ? ` · succession custody over ${m.supersedes.act} intact` : ''}`);
  return 0;
}
process.exit(main());
