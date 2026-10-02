#!/usr/bin/env tsx
/**
 * FLAGSHIP ACCEPTANCE-SUITE FREEZE — INTEGRITY  (npm run verify:flagship-freeze)
 *
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / FS3 (successor to FS2 under R1-2; FS2 succeeded FS1 under R1-1C). The accepted flagship
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
 * ⭐ SUCCESSION CUSTODY (FS3 over FS2; FS2 over FS1). The immediate predecessor
 *    manifest (FS2) is PRESERVED byte-for-byte at its own address and pinned here by
 *    digest; every FS2-frozen file must either be frozen again at the SAME blob, or be
 *    named in `supersedes.superseded` with its FS2 blob, a successor law and a reason.
 *    The chain is never shortened: every earlier ancestor (FS1) stays preserved at ITS
 *    digest, and each preserved manifest must itself name the next ancestor by digest.
 *    History is never rewritten so that FS1 appears to have contained Review navigation,
 *    or FS2 to have contained Review → section return.
 *
 * Exit 0 intact · 1 drift / manifest altered / custody broken · 2 instrument error.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** ⭐ Pinned at FS3. A re-freeze (authorized act) updates this constant together with the manifest. */
const MANIFEST_SHA256 = 'cdc74d8b82af6debd1ce0ffc300c4d8f42bfcfe24d1fd09f8c7e10ae70ee8ee5';
const MANIFEST = path.resolve(__dirname, '../tests/constitutional/writers-studio/FLAGSHIP_FREEZE.json');
/** ⭐ The succession chain, newest predecessor first. Each manifest is preserved verbatim at its own address and pinned by the
 *  digest ITS verifier carried; `blobKey` names the field a `supersedes.superseded` entry uses for that predecessor's blob. */
const CHAIN: readonly { name: string; file: string; sha256: string; blobKey: string }[] = [
  { name: 'FS2', file: path.resolve(__dirname, '../tests/constitutional/writers-studio/FLAGSHIP_FREEZE_FS2.json'), sha256: 'd7421b38c1fdc260feb7d7155819976dbf71f12064c87812efa0e4332715618f', blobKey: 'fs2_blob' },
  { name: 'FS1', file: path.resolve(__dirname, '../tests/constitutional/writers-studio/FLAGSHIP_FREEZE_FS1.json'), sha256: 'd1fff27d630968ae5d65ee87186864c8c26c2b555443a99340fa9663cb435a68', blobKey: 'fs1_blob' },
];
const BLOB = /^[0-9a-f]{40}$/;

type Entry = { blob: string; class: string };
type Superseded = { successor: string; reason: string } & Record<string, string>;
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
  /* ── succession custody: the immediate predecessor preserved and accounted for; the whole chain preserved ── */
  const custody: string[] = [];
  if (m.supersedes) {
    const pred = CHAIN[0]!;
    if (!fs.existsSync(pred.file)) { custody.push(`${pred.name} manifest ABSENT at its preserved address`); }
    else {
      const predRaw = fs.readFileSync(pred.file);
      const predDigest = createHash('sha256').update(predRaw).digest('hex');
      if (predDigest !== pred.sha256 || m.supersedes.manifest_sha256 !== pred.sha256) custody.push(`${pred.name} manifest not byte-identical to its ${pred.name} digest (preserved ${predDigest.slice(0, 12)} · pinned ${pred.sha256.slice(0, 12)} · manifest says ${String(m.supersedes.manifest_sha256).slice(0, 12)})`);
      else {
        const predManifest = JSON.parse(predRaw.toString('utf8')) as { frozen: Record<string, Entry> };
        for (const [file, entry] of Object.entries(predManifest.frozen)) {
          const again = m.frozen[file]?.blob === entry.blob;
          const sup = m.supersedes.superseded?.[file];
          const accounted = again || (!!sup && sup[pred.blobKey] === entry.blob && !!sup.successor && !!sup.reason && m.frozen[file] !== undefined);
          if (!accounted) custody.push(`${pred.name} file neither re-frozen at its ${pred.name} blob nor explicitly superseded: ${file}`);
        }
        for (const [file, sup] of Object.entries(m.supersedes.superseded ?? {})) {
          if (!predManifest.frozen[file]) custody.push(`superseded entry names a file ${pred.name} never froze: ${file}`);
          else if (m.frozen[file]?.blob === sup[pred.blobKey]) custody.push(`superseded entry for an UNCHANGED file (succession claimed, nothing succeeded): ${file}`);
        }
        console.log(`  ✓ ${pred.name} manifest preserved at ${path.relative(process.cwd(), pred.file)} (sha256 ${predDigest.slice(0, 12)}) · ${Object.keys(predManifest.frozen).length} ${pred.name} files accounted for · ${Object.keys(m.supersedes.superseded ?? {}).length} explicitly superseded`);
      }
    }
    /* the chain: every earlier ancestor preserved at its own digest, and each preserved manifest names the next by digest */
    for (let i = 1; i < CHAIN.length; i++) {
      const anc = CHAIN[i]!; const younger = CHAIN[i - 1]!;
      if (!fs.existsSync(anc.file)) { custody.push(`${anc.name} manifest ABSENT at its preserved address (chain shortened)`); continue; }
      const raw = fs.readFileSync(anc.file);
      const digest = createHash('sha256').update(raw).digest('hex');
      if (digest !== anc.sha256) { custody.push(`${anc.name} manifest not byte-identical to its ${anc.name} digest (preserved ${digest.slice(0, 12)} · pinned ${anc.sha256.slice(0, 12)})`); continue; }
      if (fs.existsSync(younger.file)) {
        const y = JSON.parse(fs.readFileSync(younger.file, 'utf8')) as { supersedes?: { manifest_sha256?: string } };
        if (y.supersedes?.manifest_sha256 !== anc.sha256) custody.push(`${younger.name} does not name ${anc.name} by digest (chain broken)`);
      }
      console.log(`  ✓ ${anc.name} manifest preserved at ${path.relative(process.cwd(), anc.file)} (sha256 ${digest.slice(0, 12)}) · named by ${younger.name}`);
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
