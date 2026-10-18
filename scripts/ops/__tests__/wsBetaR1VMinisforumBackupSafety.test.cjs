'use strict';
/** R1V offline guards. No production network/SSH/Docker invocation. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const writer=fs.readFileSync(path.join(root,'scripts/ops/wsBetaR1VMinisforumEncryptedBackup.py'),'utf8');
const restore=fs.readFileSync(path.join(root,'scripts/ops/wsBetaR1VIndependentColdRestore.py'),'utf8');
const fixture=fs.readFileSync(path.join(root,'scripts/ops/wsBetaR1VFiveVolumeRestorePG16.py'),'utf8');
const preflight=fs.readFileSync(path.join(root,'scripts/ops/wsBetaR1VMinisforumCutoverPreflight.py'),'utf8');
const run=(args)=>cp.spawnSync('/usr/bin/python3',args,{cwd:root,encoding:'utf8',timeout:8000,
 env:{PATH:'/Users/soullab/.nvm/versions/node/v22.22.3/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin',HOME:process.env.HOME}});

test('server-specific writer has compile-time live path HOLD and no environment escape',()=>{
 assert.match(writer,/R1V_PRODUCTION_CUTOVER_RELEASED\s*=\s*False/);
 assert.match(writer,/if args\.live:/);
 assert.match(writer,/R1V_REFUSED_PRODUCTION_HARD_DISABLED_REQUIRE_NEW_REVIEWED_SOURCE/);
 const live=run(['scripts/ops/wsBetaR1VMinisforumEncryptedBackup.py','--live']);
 assert.equal(live.status,70);
 assert.match(live.stderr,/PRODUCTION_HARD_DISABLED/);
 assert.doesNotMatch(writer,/os\.environ\.get\('WS_R1V_LIVE/);
});
test('actual Minisforum database and NAS source paths explicitly pinned and not overwritten',()=>{
 const d=run(['scripts/ops/wsBetaR1VMinisforumEncryptedBackup.py','--describe-server-plan']);
 assert.equal(d.status,0);
 const obj=JSON.parse(d.stdout);
 assert.equal(obj.productionCutoverReleased,false);
 const plan=obj.plan;
 assert.equal(plan.postgresContainer,'maia-postgres');
 assert.equal(plan.postgresRole,'soullab');
 assert.equal(plan.postgresDatabase,'maia_consciousness');
 assert.equal(plan.postgresDataVolume,'maia-sovereign_postgres_data');
 assert.equal(plan.plannedDestination,'/mnt/ds225/maia-backups/encrypted-complete');
 assert.equal(plan.twoLegacyCronWritersMustBeIndependentlyRetired,true);
 assert.equal(plan.sqlFileWalCoherenceQualified,false);
});
test('required five data volumes and their exact Docker mount paths match real inspection',()=>{
 const json=JSON.parse(run(['scripts/ops/wsBetaR1VMinisforumEncryptedBackup.py','--describe-server-plan']).stdout).plan;
 assert.deepEqual(json.requiredFileVolumes,{
  media:['maia-sovereign_media_data','/app/data/media'],
  vault:['maia-sovereign_vault_data','/app/data/vault'],
  'voice-notes':['maia-sovereign_voice_notes_data','/app/storage/voice-notes'],
  workbench:['maia-sovereign_workbench_data','/app/data/workbench'],
  'audit-logs':['maia-sovereign_audit_data','/app/data/audit-logs'],
 });
 assert.ok(json.externalBindScopeUnqualified.includes('/app/data/ain-vault'));
});
test('the fixture must use exact isolated Docker postgres and T7 path, never real backend',()=>{
 assert.match(writer,/\^ws-r1v-src-\[0-9a-f\]\{8\}\$/);
 assert.match(writer,/index \.Config\.Labels/);
 assert.match(writer,/\.HostConfig\.NetworkMode/);
 assert.match(writer,/POSTGRES_NOT_A_NETWORKLESS_UNMOUNTED_FIXTURE/);
 assert.match(writer,/evidence\.parent != Path\('\/Volumes\/T7 Shield'\)/);
 assert.match(writer,/SOURCE_NOT_FICTIONAL_ROOT/);
 assert.match(writer,/R1V_FIXTURE_ONLY/);
});
test('no unencrypted backup intermediate and no rsync --delete or retention pruning',()=>{
 assert.match(writer,/pg_dump.*'-Fc'/);
 assert.match(writer,/tar.*'--format','ustar'/);
 assert.match(writer,/--cipher-algo','AES256'/);
 assert.match(writer,/BACKUP_WRITER_HAS_DECRYPT_KEY/);
 assert.match(writer,/os\.umask\(0o077\)/);
 assert.doesNotMatch(writer,/rsync\s.*--delete|find\s.*-delete|cron\s+-|crontab\s+-|systemctl\s+restart/);
 assert.doesNotMatch(writer,/subprocess\.run\(\[.*'pg_dump'.*\],stdout=open\(/);
});
test('fences file tree for symlinks, hardlinks, special files, five empty volumes and content races',()=>{
 for(const s of ['SOURCE_DIRECTORY_SYMLINK_OR_SPECIAL','SOURCE_SYMLINK_HARDLINK_OR_SPECIAL',
  'EMPTY_REQUIRED_VOLUME','REQUIRED_VOLUME_MISSING_OR_EXTRA','SOURCES_CHANGED_DURING_BACKUP',
  'mutate_after_sql'])assert.ok(writer.includes(s),s);
 assert.match(writer,/safe_sources\(src\)\[0\]!=stable_before/);
});
test('atomic publish only after ciphertext plus unsigned honest manifest',()=>{
 const sql=writer.indexOf("pending/'postgres.pgdump.gpg'");
 const tar=writer.indexOf("pending/'files.tar.gpg'");
 const manifest=writer.indexOf("m=pending/'manifest.json'");
 const pub=writer.indexOf('os.rename(pending,target)');
 assert.ok(sql>0 && sql<tar && tar<manifest && manifest<pub);
 assert.match(writer,/if pending and pending\.exists\(\):shutil\.rmtree\(pending\)/);
 assert.match(writer,/fcntl\.flock\(lockfd,fcntl\.LOCK_EX\|fcntl\.LOCK_NB\)/);
 for(const k of ['manifestIndependentlySigned','productionCronCutoverApproved',
 'productionSnapshotConsistencyProven','productionOriginalSourceCoverageProven'])
  assert.ok(writer.includes(`'${k}':False`));
});
test('independent restore validates exact complete generation before decrypt and blocks traversal',()=>{
 for(const k of ['INCOMPLETE_OR_EXTRA_GENERATION','CIPHERTEXT_SIZE_OR_DIGEST_DRIFT',
  'UNAUTHORIZED_RELEASE_CLAIM','TAR_TRAVERSAL_OR_WRONG_VOLUME',
  'TAR_SYMLINK_HARDLINK_OR_DEVICE','RECOVERY_PRIVATE_KEY_UNAVAILABLE',
  'RESTORE_DESTINATION_NOT_ISOLATED_FIXTURE','R1V_RESTORE_REFUSED_DEFAULT_OFF'])
   assert.ok(restore.includes(k),k);
 assert.match(restore,/for kind,filename in \(\('postgres'/);
 assert.match(restore,/tarfile\.open\(fileobj=gpg\.stdout,mode='r\|'\)/);
});
test('physical harness separates private key from backup writer and destroys sources before restore',()=>{
 assert.match(fixture,/private=TEMP_KEY_BASE\/'off_writer_independent_private'/);
 assert.match(fixture,/public=TEMP_KEY_BASE\/'backup_writer_public_only'/);
 assert.match(fixture,/docker\('stop','--time','4',SRC/);
 assert.ok(fixture.indexOf('shutil.rmtree(fixture_root)')<fixture.indexOf('start_pg(DST)'));
 assert.match(fixture,/wrong_recovery_key_fails_without_any_restore/);
 assert.match(fixture,/source_symlink_refused/);
 assert.match(fixture,/all_six_original_files_exactly_recovered/);
 assert.match(fixture,/independent_private_keyrings_destroyed/);
});
test('live preflight refuses both legacy cron jobs, running app writers and unproven restore',()=>{
 for(const s of ['root_legacy_backup_still_enabled','user_legacy_backup_still_enabled',
  'sql_file_wal_quiescence_barrier_unqualified','off_host_private_recovery_key_not_custodied',
  'memberDeletionNonresurrectionVerified','independentOffsiteRestoreApproved',
  'founderExactBackupCutoverApproved'])assert.ok(preflight.includes(s));
 assert.match(preflight,/R1V_LIVE_RELEASED=False/);
});
test('no production backup can be run through backup or restore command without fixture authorization',()=>{
 const backup=run(['scripts/ops/wsBetaR1VMinisforumEncryptedBackup.py','--fixture']);
 assert.equal(backup.status,70);
 assert.match(backup.stderr,/DEFAULT_OFF/);
 const recover=run(['scripts/ops/wsBetaR1VIndependentColdRestore.py','--fixture',
  '--generation','/mnt/ds225/maia-backups','--private-gpg-home','/etc/soullab',
  '--destination-container','maia-postgres','--restore-dir','/mnt/ds225/restore']);
 assert.equal(recover.status,70);
 assert.match(recover.stderr,/DEFAULT_OFF/);
});
