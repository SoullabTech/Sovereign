import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {R7019C_LEDGER,assessR7019CWholeWriterGate} from
 '../wsBetaR7019CWholeWriterGate.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const byId=id=>R7019C_LEDGER.entries.find(e=>e.id===id);
test('frozen C identity refuses changed D mutators while keeping release HOLD',()=>{
 const a=assessR7019CWholeWriterGate(root);
 assert.equal(a.status,'R7019C_SOURCE_MUTATOR_CUSTODY_DRIFT_HELD');
 assert.equal(a.verifiedSourceEntries,16);
 assert.equal(a.expectedSourceEntries,22);
 assert.deepEqual(a.drift.map(x=>x.id).sort(),[
  'studio_file_upload','held_draft_revision_reader',
  'legacy_direct_revision_restore','studio_file_soft_delete',
  'studio_file_metadata','shared_writer_lease',
 ].sort());
 assert.equal(a.claimedFixtureEntryClasses.physical_fixture,7);
 assert.equal(a.claimedFixtureEntryClasses.code_only_held,4);
 assert.equal(a.claimedFixtureEntryClasses.unfenced,4);
 assert.equal(a.claimedFixtureEntryClasses.fixture_only_not_live,1);
 assert.equal(a.releaseApproved,false);
 assert.equal(a.realMemberAdmissionApproved,false);
 assert.equal(a.completeEncryptedSQLVaultWALCoverageCertified,false);
 assert.equal(a.currentExternalDeletionHighwaterCertified,false);
});
test('Keep, erasure, editorial authorization and direct legacy restore remain visible',()=>{
 const a=assessR7019CWholeWriterGate(root);
 for(const id of ['source_discard_erasure_debt','manuscript_erasure_inline',
  'revision_authorization_apply','editorial_undo','legacy_direct_revision_restore',
  'studio_file_soft_delete','async_vault_erasure','account_deletion',
  'revision_grant_store','proposal_versions']){
  assert.ok(a.holdMutatorIds.includes(id),id);
 }
 assert.equal(a.unresolvedAuthorities.length,9);
});
test('same source path can be protected for upload while deletion is STILL unfenced',()=>{
 assert.equal(byId('studio_file_upload').path,byId('studio_file_soft_delete').path);
 assert.equal(byId('studio_file_upload').status,'physical_fixture');
 assert.equal(byId('studio_file_soft_delete').status,'unfenced');
});
test('any source drift refuses regardless of tests and source labels',()=>{
 for(const id of ['source_arrival_claim','member_keep_unkeep',
  'manuscript_erasure_inline','proposal_versions']){
  const entry=byId(id);
  const current=readFileSync(path.join(root,entry.path));
  const a=assessR7019CWholeWriterGate(root,{
   sourceOverrides:{[entry.path]:Buffer.concat([current,Buffer.from('// altered')])},
   signedApproval:true,releaseApproved:true,productionColdRestore:true,
  });
  assert.equal(a.status,'R7019C_SOURCE_MUTATOR_CUSTODY_DRIFT_HELD');
  assert.ok(a.drift.some(x=>x.id===id),id);
  assert.equal(a.releaseApproved,false);
 }
});
test('missing source refuses and prevents claiming source completion',()=>{
 const a=assessR7019CWholeWriterGate('/private/tmp/r7019c-missing-checkout');
 assert.equal(a.verifiedSourceEntries,0);
 assert.equal(a.drift.length,R7019C_LEDGER.entries.length);
 assert.equal(a.releaseApproved,false);
});
test('CLI exits HOLD 78 even when all exact source hashes match',()=>{
 const p=spawnSync(process.execPath,[
  fileURLToPath(new URL('../wsBetaR7019CWholeWriterGate.mjs',import.meta.url)),
  root],{encoding:'utf8',timeout:10000});
 assert.equal(p.status,78);
 const result=JSON.parse(p.stdout);
 assert.equal(result.releaseApproved,false);
 assert.equal(result.realMemberAdmissionApproved,false);
});
