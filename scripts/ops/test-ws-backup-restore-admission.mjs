import test from 'node:test';
import assert from 'node:assert/strict';
import { examineProposedRestore as check } from './ws-backup-restore-admission.mjs';
const h='a'.repeat(64), j='b'.repeat(64);
const good=()=>({
 version:1,
 capture:{state:'sealed',generation:'g-1',databaseGeneration:'g-1',vaultGeneration:'g-1',databaseFence:'same-commit-fence',vaultFence:'same-commit-fence'},
 coverage:{captureScope:'entire-db-and-source-vault',expectedSourceRefs:2,expectedVaultFiles:1,databaseText:'per-work-ciphertext',sourceVault:'per-work-ciphertext',derivedText:'per-work-ciphertext',keyAuthority:'nonrollbackable-per-work'},
 replicaCensus:{authority:'independently-witnessed',scope:'all-soullab-controlled',unknownCopies:0,reconstructiveLegacyCopies:0,unremediatedRecycleCopies:0},
 authority:{captureDeletionEpoch:1,currentDeletionEpoch:3,barrierSealed:true,barrierSource:'independent-nonrollbackable'},
 databaseSources:[{ref:'source-one',hash:h,kind:'artifact',work:'w1'}, {ref:'paste-two',hash:j,kind:'paste',work:'w2'}],
 vaultArtifacts:[{ref:'source-one',hash:h}],
 works:[{work:'w1',key:'key-one',state:'active'}, {work:'w2',key:'key-two',state:'active'}]
});
const refuse=(name,mutate,code)=>test(name,()=>{
 const v=good();mutate(v);const outcome=check(v);
 assert.equal(outcome.admitted,false);
 assert(outcome.refusals.includes(code),JSON.stringify(outcome.refusals));
 assert(!JSON.stringify(outcome).includes('source-one'),'no identifiers in refusals');
});
test('all sources accounted, consistent sealed snapshot and deletion barrier (synthetic proposal only)',()=> {
 const result=check(good());assert.deepEqual(result,{admitted:true,refusals:[]});
});
refuse('out-of-generation vault is refused',m=>{m.capture.vaultGeneration='other'},'unproven_consistent_generation');
refuse('different database and vault commit fences refused',m=>{m.capture.vaultFence='other'},'unproven_consistent_generation');
refuse('unsealed crash prefix refused',m=>{m.capture.state='pending'},'unproven_consistent_generation');
refuse('complete source-text plaintext refused',m=>{m.coverage.databaseText='plaintext'},'plaintext_or_globally_decryptable_work');
refuse('derived text outside per-work encryption refused',m=>{m.coverage.derivedText='plaintext'},'plaintext_or_globally_decryptable_work');
refuse('historical plaintext SQL copy refused',m=>{m.replicaCensus.reconstructiveLegacyCopies=1},'historic_or_unknown_reconstructive_copies');
refuse('recycled SQL copy refused',m=>{m.replicaCensus.unremediatedRecycleCopies=1},'historic_or_unknown_reconstructive_copies');
refuse('unknown offsite copy refused',m=>{m.replicaCensus.unknownCopies=1},'historic_or_unknown_reconstructive_copies');
refuse('stale erasure authority refused',m=>{m.authority.currentDeletionEpoch=0},'unverified_restore_deletion_barrier');
refuse('independent barrier absent refused',m=>{m.authority.barrierSealed=false},'unverified_restore_deletion_barrier');
refuse('missing vault source refused',m=>{m.vaultArtifacts=[]},'source_missing_or_hash_mismatch');
refuse('mismatched original source SHA refused',m=>{m.vaultArtifacts[0].hash=j},'source_missing_or_hash_mismatch');
refuse('unreferenced vault file preserved as unresolved custody, not silently admitted',m=>{m.vaultArtifacts.push({ref:'older-unknown',hash:j})},'unclaimed_or_orphan_source_custody');
refuse('duplicate source reference refused',m=>{m.vaultArtifacts.push({...m.vaultArtifacts[0]})},'duplicate_reference_identity');
refuse('unclaimed arrival refused',m=>{m.databaseSources[0].work='unclaimed'},'unclaimed_source_work');
refuse('deleted Work with remaining source refused',m=>{m.works[0]={work:'w1',state:'deleted',key:null}},'deleted_work_reconstructible');
refuse('destroyed Work key still present refused',m=>{m.works[0]={work:'w1',state:'deleted',key:'still-present'}},'invalid_per_work_key_lifecycle');
refuse('shared global Work key refused',m=>{m.works[1].key='key-one'},'shared_work_key');

refuse('malformed null source refuses rather than crashing',m=>{m.databaseSources.push(null)},'invalid_database_reference');
refuse('malformed null vault entry refuses rather than crashing',m=>{m.vaultArtifacts.push(null)},'invalid_vault_inventory');
refuse('malformed null Work refuses rather than crashing',m=>{m.works.push(null)},'invalid_per_work_key_lifecycle');
refuse('deleted Work with revoked key and no source is allowed only with its monotonic epoch',m=>{m.works.push({work:'w3',state:'deleted',key:null})},'invalid_per_work_key_lifecycle');

refuse('empty manifest not mistaken for complete Source capture',m=>{m.databaseSources=[];m.vaultArtifacts=[];m.coverage.expectedSourceRefs=0;m.coverage.expectedVaultFiles=0},'incomplete_full_vault_census');
refuse('truncated source census refused',m=>{m.databaseSources.pop()},'incomplete_full_vault_census');
refuse('wrong vault inventory count refused',m=>{m.coverage.expectedVaultFiles=2},'incomplete_full_vault_census');
