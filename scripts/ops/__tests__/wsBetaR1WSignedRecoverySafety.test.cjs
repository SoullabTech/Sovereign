'use strict';
/** Offline source law: no SSH, GPG signatures, network or Docker from tests. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..');
const read=(name)=>fs.readFileSync(path.join(root,'scripts/ops',name),'utf8');
const source=read('wsBetaR1WSignedGeneration.py');
const restore=read('wsBetaR1WSignedIndependentColdRestore.py');
const negative=read('wsBetaR1WSignedGenerationTamperFixture.py');
const physical=read('wsBetaR1WSignedColdRestorePG16.py');
const run=(file,args=[],env={})=>cp.spawnSync('/usr/bin/python3',
 ['scripts/ops/'+file,...args],{cwd:root,encoding:'utf8',timeout:10000,
 env:{HOME:process.env.HOME,PATH:'/Users/soullab/.nvm/versions/node/v22.22.3/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin',...env}});

test('R1W production stays explicitly UNRELEASED',()=>{
 assert.match(source,/PRODUCTION_SIGNED_GENERATION_RELEASED=False/);
 assert.match(restore,/R1W_REAL_SIGNED_PRODUCTION_RESTORE_ENABLED=False/);
 assert.match(restore,/WS_R1W_RESTORE_FIXTURE_ONLY/);
 assert.match(source,/WS_R1W_SIGNED_FIXTURE_ONLY/);
 assert.match(source,/R1W_SIGNED_POINT_REFUSED_DEFAULT_OFF/);
 assert.equal(run('wsBetaR1WSignedGeneration.py',['--certify-fixture']).status,70);
 assert.equal(run('wsBetaR1WSignedIndependentColdRestore.py',
 ['--fixture','--certified-generation','/mnt/ds225/maia-backups',
  '--trusted-public-keyring','/etc/maia/trust.gpg','--expected-signer-fingerprint','0'.repeat(40),
  '--private-decryption-home','/etc/maia/decrypt',
  '--destination-container','maia-postgres','--restore-directory','/mnt/ds225/restore']).status,70);
});
test('certification is separate from backup writer and requires exact R1V source manifest',()=>{
 assert.match(source,/accepted_r1v_source\(source\)/);
 assert.match(source,/module\.safe_manifest\(path\)/);
 assert.match(source,/source\.parent\.parent/);
 assert.match(source,/root_in_t7\(.*'ws-beta-r1v-'/);
 assert.match(source,/R1V_SOURCE_PRECHECK_FAILED/);
 assert.match(source,/for name in \(\*ARCHIVES,MANIFEST\)/);
});
test('trusted signer private key and verification keyring never come from unsigned backup',()=>{
 assert.match(source,/SIGNER_PRIVATE_HOME_NOT_SEPARATE/);
 assert.match(source,/UNAUTHORIZED_SIGNER_PRIVATE_KEY/);
 assert.match(source,/VERIFIER_PUBLIC_TRUST_NOT_INDEPENDENT/);
 assert.match(source,/--local-user',fpr/);
 assert.match(source,/--keyring',str\(keyring\)/);
 assert.match(source,/SIGNER_FINGERPRINT_MISMATCH/);
 assert.match(source,/VALIDSIG/);
 assert.ok(source.includes("fpr not in fingerprints")===false);
});
test('R1W pins exact signing fingerprint, not merely any valid key in trusted ring',()=>{
 assert.match(source,/verified!=\[expected_fpr\]/);
 assert.match(source,/DETACHED_SIGNATURE_INVALID/);
 assert.match(negative,/cryptographically_valid_unapproved_signer_refused/);
 assert.match(negative,/wrong_independent_signer_pin_refused/);
 assert.match(negative,/wrong_signed_generation_name_refused/);
});
test('no uncertified archive is allowed to the signed independent recovery path',()=>{
 assert.match(source,/path\.parent\.name!='certified'/);
 assert.match(source,/SIGNED_GENERATION_REPLAY_REFUSED/);
 assert.match(source,/INCOMPLETE_SIGNED_RECOVERY_POINT/);
 assert.match(source,/CHANGED_CIPHERTEXT/);
 assert.match(source,/FORGED_MANIFEST_GO_FLAG/);
 assert.match(restore,/verify_signed\(gen,trust,a\.expected_signer_fingerprint/);
 assert.ok(restore.indexOf('verify_signed(gen,trust')<restore.indexOf('r1v.restore_postgres'));
 assert.ok(restore.indexOf('verify_signed(gen,trust')<restore.indexOf('r1v.verified_private_home'));
});
test('signature is created before any certified publication and incomplete stages clean',()=>{
 const verify=source.indexOf('result=verify_signed(pending,keyring,fpr,staging=True)');
 const pub=source.indexOf('os.rename(pending,final)');
 assert.ok(verify>0&&pub>verify);
 assert.match(source,/if pending is not None and pending\.exists\(\):shutil\.rmtree\(pending\)/);
 for(const x of ['after_copy','after_sign','before_publish']){
  assert.ok(source.includes(x));assert.ok(negative.includes(x));
 }
 assert.match(negative,/no_certified_generation/);
 assert.match(negative,/no_pending_ciphertext/);
});
test('real R1V PostgreSQL 16 and five-file-volume restore is used only after signed preflight',()=>{
 assert.match(restore,/R1VIndependentColdRestore\.py/);
 assert.match(restore,/r1v\.restore_postgres\(gen,recovery,a\.destination_container\)/);
 assert.match(restore,/r1v\.restore_files\(gen,recovery,destination/);
 assert.match(restore,/destination\.name!='signed-restored-files'/);
 assert.match(physical,/five_volume_files|five_volumes|five_volumes/i);
 assert.match(physical,/all_six_source_files_exactly_restored/);
 assert.match(physical,/two_fictional_rows_exactly_restored/);
});
test('source original database and file roots destroyed BEFORE signed independent restore',()=>{
 assert.ok(physical.indexOf("r1v.docker('stop','--time','4',r1v.SRC")<
           physical.indexOf('final=command(restore_cmd'));
 assert.ok(physical.indexOf("shutil.rmtree(SOURCE_ROOT/'fictional-sources')")<
           physical.indexOf('final=command(restore_cmd'));
 assert.match(physical,/source_postgres_destroyed_before_signed_restore/);
 assert.match(physical,/all_original_five_file_volumes_destroyed_before_signed_restore/);
 assert.match(physical,/independent_test_signer_and_recovery_private_keyrings_destroyed/);
});
test('tamper tests cover crypto signature, both ciphertext streams, revoked/forged authority',()=>{
 for(const term of ['modified_db_ciphertext','modified_vault_ciphertext',
 'altered_manifest_false_claim','cryptographic_signature_corrupted',
 'missing_signed_receipt','ciphertext_symlink','permissions_too_open',
 'wrong_signer_restore_denied_before_real_prod_db_check']){
  assert.ok(negative.includes(term),term);
 }
 assert.match(source,/d\.get\('manifestIndependentlySigned'\) is not False/);
 assert.match(source,/productionSnapshotCoherenceQualified':False/);
});
test('fixture signer, encryption key and source remain in separate control zones',()=>{
 assert.match(physical,/independent_decryption_private/);
 assert.match(physical,/independent_signature_private/);
 assert.match(physical,/backup_writer_encryption_public_only/);
 assert.match(physical,/signature_public_pin_only/);
 assert.match(physical,/recovery_and_signer_fingerprints_distinct/);
 assert.match(physical,/backup_writer_has_no_decryption_private_key/);
 assert.match(physical,/public_verifier|signature_public_pin_only/);
});
test('no AWS/SSH/cron/prod or real member actions authorized in any source',()=>{
 for(const s of [source,restore,negative,physical]){
  assert.doesNotMatch(s,/(?:ssh|scp)\s+(?:root|soullab)@|crontab\s+-|systemctl\s+restart|kubectl\s+apply/);
  assert.doesNotMatch(s,/AWS_SECRET_ACCESS_KEY=|AKIA[0-9A-Z]{16}|-----BEGIN PRIVATE KEY-----/);
  assert.doesNotMatch(s,/pg_dump.*maia_consciousness|docker\s+exec\s+maia-postgres/);
 }
});
