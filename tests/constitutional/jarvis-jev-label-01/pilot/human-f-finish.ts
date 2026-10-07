/**
 * Finish gate for the F pass: verify → immutable pre-seal backup → seal F against sealed P → report.
 * Replaces the unversioned `finish-after-f.sh` logic with a pinned, tested procedure. STOPS on the first refusal.
 *
 *   npx tsx human-f-finish.ts --home <delegation home> --manifest <f> --index <f> --sealed-p <f>
 *     --working <f> --backup-dir <dir> --preseal-dir <dir> --out-dir <dir>
 *     --expect-manifest <sha256> --expect-p-seal <sha256>
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { QUESTION_IDS } from '../core';
import {
  assertOutsideHome, extractAnnotations, report, seal, sealDigest, verifySources, writeOutside,
  type LocalIndex, type Manifest, type Sealed, type Sheet,
} from './pilot';
import { appendEvent, DurabilityRefused, inspectBackup, sha256Hex, writeOnceVerified } from './human-f-durability';

export interface FinishOptions {
  home: string;
  manifestPath: string;
  indexPath: string;
  sealedPPath: string;
  workingPath: string;
  backupDir: string;
  presealDir: string;
  outDir: string;
  expectManifest: string;
  expectPSeal: string;
}
export interface Artifact { name: string; path: string; sha256: string }
export interface FinishResult { artifacts: Artifact[]; presealBackupSha256: string; reportText: string }

const refuse = (code: string, detail: string): never => { throw new DurabilityRefused(code, detail); };
const fileSha = (p: string): string => sha256Hex(readFileSync(p));

export function finishF(o: FinishOptions): FinishResult {
  // ── 1. identity: everything is checked against values stated independently of the files being checked ──
  const manifest = JSON.parse(readFileSync(o.manifestPath, 'utf8')) as Manifest;
  if (manifest.manifest_sha256 !== o.expectManifest) refuse('MANIFEST_EXPECT_MISMATCH', 'manifest is not the frozen pilot manifest');
  const sealedP = JSON.parse(readFileSync(o.sealedPPath, 'utf8')) as Sealed;
  if (sealedP.domain !== 'P' || sealedP.labeller !== 'A') refuse('SEALED_P_IDENTITY', 'not Label A\'s sealed P');
  if (sealedP.manifest_sha256 !== o.expectManifest) refuse('SEALED_P_MANIFEST', 'sealed P is bound to another manifest');
  if (sealDigest(sealedP) !== o.expectPSeal) refuse('P_SEAL_EXPECT_MISMATCH', 'sealed P does not digest to the expected P seal');

  const workingText = readFileSync(o.workingPath, 'utf8');
  const workingSha = sha256Hex(workingText);
  const sheet = JSON.parse(workingText) as Sheet;
  if (sheet.domain !== 'F') refuse('NOT_F', 'working sheet is not domain F');
  if (sheet.labeller !== 'A') refuse('NOT_LABELLER_A', 'working sheet is not Label A');
  if (sheet.manifest_sha256 !== o.expectManifest) refuse('SHEET_MANIFEST', 'working sheet is bound to another manifest');
  if (sheet.after_p_seal_sha256 !== o.expectPSeal) refuse('SHEET_P_SEAL', 'working sheet is not bound to the expected P seal');

  const cases = manifest.units.length;
  if (sheet.entries.length !== cases * QUESTION_IDS.length) refuse('ENTRY_COUNT', `expected ${cases * QUESTION_IDS.length} entries, found ${sheet.entries.length}`);
  const nonNull = sheet.entries.filter((e) => e.value !== null).length;
  if (nonNull !== sheet.entries.length) refuse('INCOMPLETE_F', `${nonNull} of ${sheet.entries.length} judgments are filled`);
  const ids = new Set(sheet.entries.map((e) => e.pilot_id));
  const manifestIds = new Set(manifest.units.map((u) => u.pilot_id));
  if (ids.size !== cases || [...ids].some((i) => !manifestIds.has(i))) refuse('CASE_SET', 'cases do not match the manifest');

  // ── 2. the three durable copies and the ledger must agree before anything irreversible happens ──
  const ins = inspectBackup(o.backupDir);
  if (ins.rollingText === null || sha256Hex(ins.rollingText) !== workingSha) refuse('COPIES_DISAGREE', 'rolling copy is missing or differs from the working file');
  if (!ins.latestGeneration || ins.latestGeneration.sha256 !== workingSha) refuse('COPIES_DISAGREE', 'latest generation is missing or differs from the working file');
  if (!ins.lastSaveEvent || ins.lastSaveEvent.working_sha256 !== workingSha) refuse('EVENT_LOG_DISAGREES', 'the final event-log hash does not match the working file');

  // ── 3. immutable pre-seal backup: write-once, read-only, re-read, hash equal — only then may sealing begin ──
  assertOutsideHome(o.home, o.presealDir);
  const presealPath = join(o.presealDir, `kelly-F-sheet-preseal-${workingSha.slice(0, 12)}.json`);
  let presealSha: string;
  try { presealSha = writeOnceVerified(presealPath, workingText, 0o400); }
  catch (e) { throw new DurabilityRefused('PRESEAL_BACKUP_FAILED', e instanceof Error ? e.message : String(e)); }
  if (presealSha !== workingSha || fileSha(presealPath) !== workingSha) refuse('PRESEAL_HASH_MISMATCH', 'pre-seal backup does not hash to the working file');
  appendEvent(join(o.backupDir, 'events.jsonl'), 'F_PRESEAL_BACKUP', { preseal_path: presealPath, preseal_sha256: presealSha, working_sha256: workingSha });

  // ── 4. seal F against sealed P (same call the CLI makes), then report ──
  const index = JSON.parse(readFileSync(o.indexPath, 'utf8')) as LocalIndex;
  verifySources(o.home, manifest, index);
  const outputs = {
    sealed: join(o.outDir, 'kelly-F-sealed.json'),
    annotations: join(o.outDir, 'kelly-F-annotations.json'),
    report: join(o.outDir, 'pilot-report.txt'),
  };
  for (const p of Object.values(outputs)) if (existsSync(p)) refuse('OUTPUT_EXISTS', 'refusing to overwrite ' + p);
  mkdirSync(o.outDir, { recursive: true });
  const sealedF = seal(manifest, sheet, 1, sealedP);
  const reportText = report(manifest, [sealedP, sealedF]);
  writeOutside(o.home, outputs.annotations, JSON.stringify(extractAnnotations(sheet), null, 2) + '\n', 0o600);
  writeOutside(o.home, outputs.sealed, JSON.stringify(sealedF, null, 2) + '\n');
  writeOutside(o.home, outputs.report, reportText);
  appendEvent(join(o.backupDir, 'events.jsonl'), 'F_SEALED', { sealed_sha256: fileSha(outputs.sealed), working_sha256: workingSha });

  return {
    presealBackupSha256: presealSha,
    reportText,
    artifacts: [
      { name: 'manifest', path: o.manifestPath, sha256: fileSha(o.manifestPath) },
      { name: 'sealed P', path: o.sealedPPath, sha256: fileSha(o.sealedPPath) },
      { name: 'sealed F', path: outputs.sealed, sha256: fileSha(outputs.sealed) },
      { name: 'report', path: outputs.report, sha256: fileSha(outputs.report) },
      { name: 'pre-seal F backup', path: presealPath, sha256: presealSha },
    ],
  };
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  const get = (n: string): string => {
    const i = argv.indexOf('--' + n);
    const v = i >= 0 ? argv[i + 1] : undefined;
    if (!v) { console.error('USAGE: --' + n + ' required'); process.exit(2); }
    return v as string;
  };
  try {
    const r = finishF({
      home: get('home'), manifestPath: get('manifest'), indexPath: get('index'), sealedPPath: get('sealed-p'),
      workingPath: get('working'), backupDir: get('backup-dir'), presealDir: get('preseal-dir'), outDir: get('out-dir'),
      expectManifest: get('expect-manifest'), expectPSeal: get('expect-p-seal'),
    });
    console.log('PRESEAL_BACKUP_SHA256=' + r.presealBackupSha256 + '\n');
    for (const a of r.artifacts) console.log(a.name.padEnd(18) + ' ' + a.sha256 + '  ' + a.path);
    console.log('\n' + r.reportText);
  } catch (e) {
    console.error('FINISH REFUSED — nothing further was done.\n' + (e instanceof Error ? e.message : String(e)));
    process.exit(1);
  }
}
