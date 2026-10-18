import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  R7019_MANIFEST,
  R7019_REAL_WHOLE_WRITER_BACKUP_ENABLED,
  R7019_COMPLETE_RESTORE_VERIFIED,
  assessR7019WholeWriterCoverage,
} from '../wsBetaR7019WriterCoverageGate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const byId = (id) => R7019_MANIFEST.entries.find((e) => e.id === id);

test('R1S frozen source remains pinned, while R70.19B changed writers fail closed', () => {
  const result = assessR7019WholeWriterCoverage(root);
  assert.equal(R7019_MANIFEST.baselineSourceHead,
    '441616dbf5a597f9ef297ad3dafead3be5f2ceb3');
  assert.equal(result.verifiedKnownEntries, 6);
  assert.equal(result.knownRequiredEntries, 11);
  assert.deepEqual(result.drift.map(x=>x.id).sort(), [
    'confirmed-paste','draft-section-save','nested-section-save',
    'studio-file-delete','studio-file-upload',
  ].sort());
  assert.ok(result.drift.every(x=>x.reason==='source_digest_changed'));
  assert.equal(result.status, 'R7019_WRITER_SOURCE_CUSTODY_DRIFT_HELD');
  assert.equal(result.unqualifiedWriterIds.length,11);
  assert.equal(result.unmappedFamilies.length,7);
  assert.equal(result.releaseApproved,false);
  assert.equal(result.wholeWriterBackupComplete,false);
  assert.equal(result.safeForRealManuscripts,false);
});

test('confirmed paste, direct draft mutation, and file upload remain explicit release blockers', () => {
  const result = assessR7019WholeWriterCoverage(root);
  for (const writer of ['confirmed-paste','draft-section-save',
    'nested-section-save','studio-file-upload']) {
    assert.ok(result.unqualifiedWriterIds.includes(writer), writer);
  }
  assert.equal(R7019_REAL_WHOLE_WRITER_BACKUP_ENABLED, false);
  assert.equal(R7019_COMPLETE_RESTORE_VERIFIED, false);
});

test('immutable R1S source SHA-256 + anchors remain verifiable in Git', () => {
  const ids=R7019_MANIFEST.entries.map(r=>r.id);
  assert.equal(new Set(ids).size,ids.length);
  for (const r of R7019_MANIFEST.entries) {
    assert.ok(r.path && r.anchors.length);
    assert.match(r.sha256,/^[0-9a-f]{64}$/);
    assert.equal(r.coverage,'not_independently_certified');
    // Verify against the actual frozen R1S commit. Updated R70.19B files
    // are intentionally DRIFT and are NOT silently re-authorized.
    const frozen=spawnSync('git',['show',
      R7019_MANIFEST.baselineSourceHead+':'+r.path],{
      cwd:root,encoding:'utf8',timeout:12000,maxBuffer:1024*1024,
    });
    assert.equal(frozen.status,0,r.id);
    const bytes=Buffer.from(frozen.stdout,'utf8');
    const digest=createHash('sha256').update(bytes).digest('hex');
    assert.equal(digest,r.sha256,r.id);
    assert.ok(r.anchors.every(a=>frozen.stdout.includes(a)),r.id);
  }
});

test('changing an exact source body refuses before any completeness claim', () => {
  for (const id of ['confirmed-paste','nested-section-save',
    'studio-file-upload','draft-revision-restore','source-erasure']) {
    const entry = byId(id);
    const src = readFileSync(path.join(root,entry.path),'utf8');
    const report = assessR7019WholeWriterCoverage(root, {
      sourceOverrides: { [entry.path]: src + '\n// FICTIONAL_DRIFT_SENTINEL' },
    });
    assert.equal(report.status, 'R7019_WRITER_SOURCE_CUSTODY_DRIFT_HELD');
    assert.ok(report.drift.some((x) => x.id===id &&
      x.reason==='source_digest_changed'));
    assert.equal(report.releaseApproved,false);
  }
});

test('missing checkout or missing source cannot claim verified coverage', () => {
  const report = assessR7019WholeWriterCoverage('/private/tmp/r7019-nonexistent-custody');
  assert.equal(report.verifiedKnownEntries,0);
  assert.equal(report.drift.length,R7019_MANIFEST.entries.length);
  assert.ok(report.drift.every((x)=>x.reason==='source_missing'));
  assert.equal(report.wholeWriterBackupComplete,false);
});

test('client-supplied booleans, forged receipts and enabled environment cannot release', () => {
  const fakeProofs = Object.fromEntries(R7019_MANIFEST.entries.map((x)=>
    [x.id,{fenced:true,hasRestore:true,independentKey:true}]));
  const report = assessR7019WholeWriterCoverage(root, {
    sourceOverrides: {},
    requestRelease: true,
    independentRestoreProven: true,
    signedReceipts: fakeProofs,
  });
  assert.equal(report.releaseApproved,false);
  assert.equal(report.actualProductionEncryptionProven,false);
  assert.equal(report.independentVaultAndDbRestoreProven,false);
  assert.equal(report.safeForRealManuscripts,false);
  const proc = spawnSync(process.execPath,
    [fileURLToPath(new URL('../wsBetaR7019WriterCoverageGate.mjs', import.meta.url)),root],
    {encoding:'utf8',timeout:15000,
      env:{...process.env,WS_R7019_REAL_RELEASE_ENABLED:'true'}});
  assert.equal(proc.status,78);
  assert.equal(JSON.parse(proc.stdout).releaseApproved,false);
});

test('no unknown storage family can be quietly omitted from the HOLD verdict', () => {
  const report = assessR7019WholeWriterCoverage(root);
  for (const family of ['pending_encrypted_source',
    'private_editorial_proposals_and_authorizations',
    'background_storage_writers','sql_wal_and_temp',
    'external_attachments_and_backups']) {
    assert.ok(report.unmappedFamilies.includes(family));
  }
  assert.equal(report.codeOnly,true);
  assert.notEqual(report.status,'PASS');
});
