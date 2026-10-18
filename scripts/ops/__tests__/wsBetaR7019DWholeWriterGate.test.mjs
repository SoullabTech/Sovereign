import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {R7019D_LEDGER,assessR7019DWholeWriterGate}
  from '../wsBetaR7019DWholeWriterGate.mjs';
import {assessR7019CWholeWriterGate}
  from '../wsBetaR7019CWholeWriterGate.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
test('new isolated D source exactly matches pinned review paths but stays HOLD',()=>{
 const r=assessR7019DWholeWriterGate(root);
 assert.equal(r.status,'R7019D_INCOMPLETE_SOURCE_ERASURE_RECOVERY_HELD');
 assert.equal(r.expectedEntries,13);
 assert.equal(r.verifiedEntries,13);
 assert.deepEqual(r.drift,[]);
 assert.equal(r.classes.physical_fixture,6);
 assert.equal(r.classes.fictional_only,1);
 assert.equal(r.classes.unqualified,6);
 assert.equal(r.unresolvedAuthorities.length,8);
 assert.equal(r.releaseApproved,false);
 assert.equal(r.realMemberWritingAdmissionApproved,false);
});
test('real success of metadata, file deletion and legacy rollback does not permit live data',()=>{
 const r=assessR7019DWholeWriterGate(root);
 for(const id of ['studio_metadata','studio_share','studio_soft_delete',
  'legacy_revision_restore','revision_receipt_count_validator']){
  const e=R7019D_LEDGER.entries.find(x=>x.id===id);
  assert.equal(e?.evidenceClass,'physical_fixture');
 }
 assert.equal(r.fullWriterBackupCertified,false);
 assert.equal(r.currentNonRollbackableDeletionAuthorityCertified,false);
 assert.equal(r.independentOffsiteRecoveryCertified,false);
});
test('remaining proposal, async erasure, account and folder writes are not silently included',()=>{
 const r=assessR7019DWholeWriterGate(root);
 for(const id of ['unqualified_proposal_authority',
  'unqualified_revision_grants','unqualified_async_erasure',
  'unqualified_account_erasure','unqualified_file_folder_creation']){
  assert.ok(r.unqualifiedIds.includes(id),id);
 }
 assert.equal(r.releaseApproved,false);
});
test('historical C ledger remains frozen and rejects D changes rather than rewriting history',()=>{
 const r=assessR7019CWholeWriterGate(root);
 assert.equal(r.status,'R7019C_SOURCE_MUTATOR_CUSTODY_DRIFT_HELD');
 assert.deepEqual(r.drift.map(x=>x.id).sort(),[
  'studio_file_upload','held_draft_revision_reader',
  'legacy_direct_revision_restore','studio_file_soft_delete',
  'studio_file_metadata','shared_writer_lease',
 ].sort());
 assert.equal(r.releaseApproved,false);
});
test('a changed file fails exact digest before claiming even fictional identity',()=>{
 const e=R7019D_LEDGER.entries.find(x=>x.id==='legacy_revision_restore');
 const body=readFileSync(path.join(root,e.path));
 const r=assessR7019DWholeWriterGate(root,{
  sourceOverrides:{[e.path]:Buffer.concat([body,Buffer.from('// CHANGED')])},
  requestRelease:true,independentOffsiteRecovery:true,
 });
 assert.equal(r.status,'R7019D_EXACT_WRITER_CUSTODY_DRIFT_HELD');
 assert.ok(r.drift.some(x=>x.id===e.id));
 assert.equal(r.fixtureApprovedForIsolatedTests,false);
 assert.equal(r.releaseApproved,false);
});
test('missing checkout fails closed for all source files',()=>{
 const r=assessR7019DWholeWriterGate('/private/tmp/r7019d-unmounted-source');
 assert.equal(r.status,'R7019D_EXACT_WRITER_CUSTODY_DRIFT_HELD');
 assert.equal(r.verifiedEntries,0);
 assert.equal(r.releaseApproved,false);
});
test('CLI reports explicit HOLD exit code 78 even with all source checks green',()=>{
 const file=fileURLToPath(new URL('../wsBetaR7019DWholeWriterGate.mjs',import.meta.url));
 const p=spawnSync(process.execPath,[file,root],
  {encoding:'utf8',timeout:12000});
 assert.equal(p.status,78);
 const r=JSON.parse(p.stdout);
 assert.equal(r.releaseApproved,false);
 assert.equal(r.realMemberWritingAdmissionApproved,false);
});
