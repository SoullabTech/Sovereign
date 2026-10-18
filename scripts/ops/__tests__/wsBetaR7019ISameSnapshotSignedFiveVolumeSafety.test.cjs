'use strict';
/**
 * R70.19I source and default-OFF security checks for the new fictional
 * five-volume signed SQL census/deletion physical recovery.
 *
 * These tests NEVER contact Docker, GPG private keys, SSH, NAS, network, a
 * production database or real manuscripts. The separate physical harness
 * proves actual synthetic PostgreSQL + encrypted cold recovery.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..');
const read=name=>fs.readFileSync(path.join(root,'scripts/ops',name),'utf8');
const writer=read('wsBetaR1VMinisforumEncryptedBackup.py');
const physical=read('wsBetaR7019IPhysicalPG16.py');
const restore=read('wsBetaR7019IIndependentSignedRestore.py');
const authority=read('wsBetaR7019IFictionalCensusAuthority.mjs');
const oldSigner=read('wsBetaR1WSignedGeneration.py');

test('R70.19I production writer and restore are hard-disabled',()=>{
 assert.match(writer,/R1V_PRODUCTION_CUTOVER_RELEASED\s*=\s*False/);
 assert.match(physical,/R7019I_PRODUCTION_COHERENT_BACKUP_ENABLED=False/);
 assert.match(restore,/R7019I_PRODUCTION_RESTORE_ENABLED=False/);
 assert.match(authority,/const ENABLED = false/);
});

test('new snapshot mode refuses absent separate R7019I fixture authority',()=>{
 assert.match(writer,/--fixture-snapshot/);
 assert.match(writer,/--fixture-source-head/);
 assert.match(writer,/R7019I_CAPTURE_FIXTURE/);
 assert.match(writer,/UNQUALIFIED_EXPORTED_SNAPSHOT/);
 assert.match(writer,/--snapshot=\x27\+exported_snapshot/);
});

test('source Work and key roster is read from an exported single PG snapshot',()=>{
 assert.match(physical,/BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY/);
 assert.match(physical,/pg_advisory_xact_lock/);
 assert.match(physical,/pg_export_snapshot/);
 assert.match(physical,/member_manuscripts m/);
 assert.match(physical,/ws_managed_work_key_wrappings_r1q k/);
 assert.match(physical,/actual_sql_works_from_same_pg_session_as_exported_snapshot/);
 assert.match(physical,/--fixture-snapshot/);
});

test('real canonical migrations are loaded into isolated fictional SQL before roster',()=>{
 assert.match(physical,/20260721000003_press_manuscript_room.sql/);
 assert.match(physical,/20261017210000_ws_managed_work_key_wrappings_r1q.sql/);
 assert.match(physical,/external_managed_kms/);
 assert.match(physical,/INSERT INTO member_manuscripts/);
});

test('all five fake scopes and exact signed R1W certificate are used',()=>{
 assert.match(physical,/r1v\.source_roots\(\)/);
 assert.match(physical,/encryptedArchives.*==2/);
 assert.match(physical,/requiredFileVolumes.*==5/);
 assert.match(physical,/--certify-fixture/);
 assert.match(physical,/--expected-signer-fingerprint/);
 assert.match(oldSigner,/FILE_VOLUMES/);
});

test('census is signed with an independent ephemeral Ed25519 identity',()=>{
 assert.match(authority,/generateKeyPairSync\('ed25519'\)/);
 assert.match(authority,/r1wSignedManifestSha256/);
 assert.match(authority,/postgresCipherSha256/);
 assert.match(authority,/fiveVolumeCipherSha256/);
 assert.match(authority,/sourceRosterSha256/);
 assert.match(authority,/ephemeralPrivateKeysNeverPersisted:true/);
});

test('current deletion signer and Work roster are independent inputs, outside archive',()=>{
 assert(authority.includes('/private/tmp/r7019i-'));
 assert.match(authority,/minimumDeletionGeneration/);
 assert.match(authority,/minimumSnapshotGeneration/);
 assert.match(authority,/independentlyExpectedOwnedWorks/);
 assert(authority.includes('/private/tmp/r7019i-'));
 assert.match(authority,/OLD_VALID_ARCHIVE_CONTAINS_NOW_DELETED_WORK_OR_KEY/);
});

test('R1W pinned GPGV verification happens before current deletion check and private key',()=>{
 const a=restore.indexOf('r1w.verify_signed(');
 const b=restore.indexOf("'verify',str(signed),str(external)");
 const c=restore.indexOf('r1v.verified_private_home(');
 const d=restore.indexOf("spawn=run([docker,'run'");
 assert(a>0&&a<b&&b<c&&c<d);
 assert.match(restore,/privateKeyConsulted=False,restoreContainerCreated=False/);
});

test('restored actual SQL Work and key identities must equal the signed roster',()=>{
 assert.match(restore,/actual=sql_roster\(docker,a.destination_container\)/);
 assert.match(restore,/if actual!=records/);
 assert.match(restore,/r1v\.restore_postgres/);
 assert.match(restore,/r1v\.restore_files/);
 assert.match(restore,/RESTORED_FILE_DIGESTS_DIFFER_FROM_SOURCE/);
});

test('actual post-backup fictional Work deletion occurs with FK cascade before retrying old signed archive',()=>{
 assert.match(physical,/DELETE FROM member_manuscripts WHERE id/);
 assert.match(physical,/post_backup_actual_pg_work_deleted_with_key_fk_cascade/);
 assert.match(physical,/OLD_SIGNED_POINT_REFUSED_BEFORE_PRIVATE_KEY_AND_POSTGRES/);
 assert.match(physical,/original_pg_and_five_file_scopes_destroyed_first/);
});

test('all disposable keys, source files, restored files and Pg containers are cleared',()=>{
 assert.match(physical,/shutil\.rmtree\(external,ignore_errors=True\)/);
 assert.match(physical,/test_private_recovery_and_signer_keys_erased/);
 assert.match(physical,/all_test_pg_containers_removed/);
 assert.match(physical,/no_fictional_restored_plaintext_left/);
 assert.match(restore,/shutil\.rmtree\(restore_dir,ignore_errors=True\)/);
 assert.match(restore,/docker,'rm','-f','-v'/);
});

test('default-off executable refuses any attempted non-fictional restore without opening secrets',()=>{
 const script='scripts/ops/wsBetaR7019IIndependentSignedRestore.py';
 const r=cp.spawnSync('/usr/bin/python3',[script,
  '--certified-generation','/not-a-fixture','--generation','unauthorized',
  '--trusted-public-keyring','/not-a-fixture',
  '--expected-signer-fingerprint','0'.repeat(40),
  '--external-trust-root','/not-a-fixture',
  '--private-decryption-home','/not-a-fixture',
  '--destination-container','maia-postgres',
  '--restore-directory','/not-a-fixture',
  '--expected-member-id','not-a-valid-uuid'],{
    cwd:root,encoding:'utf8',timeout:8000,
    env:{HOME:process.env.HOME,PATH:process.env.PATH}});
 assert.equal(r.status,70);
 const parsed=JSON.parse(r.stdout);
 assert.equal(parsed.status,'R7019I_PREDECRYPT_REFUSED_BETA_HOLD');
 assert.equal(parsed.productionRestoreApproved,false);
});

test('default-off Node authority refuses without importing signers or opening archive',()=>{
 const r=cp.spawnSync('node',['scripts/ops/wsBetaR7019IFictionalCensusAuthority.mjs',
   'verify','/not-a-fixture','/not-a-fixture','0'.repeat(40)],{
    cwd:root,encoding:'utf8',timeout:8000,
    env:{HOME:process.env.HOME,PATH:process.env.PATH}});
 assert.equal(r.status,70);
 assert.match(r.stderr,/R7019I_REFUSED_PRODUCTION_DISABLED/);
});

test('honest written review forbids production trust or release inference',()=>{
 const p=path.join(root,'docs/ops/WS_R70_19I_ONE_PG_GENERATION_SIGNED_FIVE_VOLUME_ERASURE_HELD_20261018.md');
 const doc=fs.readFileSync(p,'utf8');
 assert.match(doc,/durable independent governed off-host ledger/i);
 assert(doc.includes('production restore/admission paths have been replaced or activated'));
 assert.match(doc,/beta HOLD/i);
 assert.match(doc,/no account-wide or/i);
});
