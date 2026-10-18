'use strict';
/** Source-law-only. Never starts Docker, GPG, AWS, SSH, Postgres or backups. */
const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const file=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const writer=file('scripts/ops/wsBetaR1TCompleteEncryptedRecoveryFixture.sh');
const driver=file('scripts/ops/wsBetaR1TCompleteEncryptedRestorePG16.py');
const verifier=file('scripts/ops/wsBetaR1TVerifyCompleteRecoveryPoint.py');
const negative=file('scripts/ops/wsBetaR1TVerifyCompleteRecoveryFixture.py');
const plan=file('docs/ops/WS_BETA_R1T_ENCRYPTED_COMPLETE_RECOVERY_CUTOVER_REVIEW_20261017.md');

test('backup writer is genuinely fiction-only with no production mode',()=>{
 assert.match(writer,/WS_R1T_MODE:-.*fictional-only/);
 assert.match(writer,/\^ws-r1t-src-\[a-f0-9\]\{8\}\$/);
 assert.match(writer,/\/Volumes\/T7.*ws-beta-r1t-/);
 assert.ok(writer.includes('index .Config.Labels "soullab.fixture"'));
 assert.doesNotMatch(writer,/WS_R1T_MODE.*production/);
 assert.doesNotMatch(writer,/docker exec maia-postgres|\/mnt\/ds225\/|\/usr\/local\/bin\/maia-backup/);
});
test('two encrypted streams and only complete generation after both and manifest',()=>{
 const pg=writer.indexOf('pg_dump -U fict -Fc ws_fixture');
 const pgGpg=writer.indexOf('postgres.pgdump.gpg');
 const tar=writer.indexOf('tar -C "$vault" -cf - .');
 const vaultGpg=writer.indexOf('vault.tar.gpg');
 const manifest=writer.indexOf('with (p/\'manifest.json\').open(\'x\')');
 const publish=writer.indexOf('mv -n -- "$pending" "$final"');
 assert.ok(pg>0 && pg<pgGpg && pgGpg<tar && tar<vaultGpg && vaultGpg<manifest && manifest<publish);
 assert.match(writer,/set -Eeuo pipefail/);
 assert.match(writer,/trap cleanup EXIT/);
 assert.match(writer,/\.r1t\.pending\./);
 assert.match(writer,/R1T_FICTIONAL_DB_AND_VAULT_GENERATION_PUBLISHED/);
 assert.doesNotMatch(writer,/rsync.*--delete|find.*-delete|aws\s+s3\s+sync|pg_dump .* > .*\.sql/);
});
test('R1T vault must be a private literal fixture without symlink or special files',()=>{
 for(const text of ['VAULT_SYMLINK_CONTENT','VAULT_SPECIAL_FILE','FICTIONAL_MEDIA_COUNT',
   'EVIDENCE_NOT_PRIVATE','PUBLIC_KEYRING_NOT_PRIVATE','BACKUP_WRITER_HAS_PRIVATE_KEY',
   'NOT_ISOLATED_R1T_CONTAINER','MISSING_PUBLIC_RECIPIENT']){
  assert.ok(writer.includes(text),text);
 }
 assert.match(writer,/WS_R1T_RECIPIENT_FPR/);
 assert.match(writer,/GPG|gpg/);
});
test('R1T refuses each failure stage before atomic complete',()=>{
 for(const mode of ['after_db','after_vault','before_complete'])assert.ok(writer.includes(mode));
 assert.ok(driver.includes('failure_'+"'"));
 for(const marker of ['INJECTED_AFTER_SQL','INJECTED_AFTER_VAULT','INJECTED_BEFORE_COMPLETE']){
  assert.ok(writer.includes(marker));assert.ok(driver.includes(marker));
 }
 assert.ok(driver.includes('no_complete_generation'));
 assert.ok(driver.includes('pending_ciphertext_cleaned'));
});
test('real physical cold restore destroys fictional DB and vault before recovery',()=>{
 assert.ok(driver.indexOf("docker('stop','--time','4',SRC") < driver.indexOf('restore_pg(generation/'));
 assert.ok(driver.indexOf("shutil.rmtree(EVIDENCE/'fictional-vault')") < driver.indexOf('restore_vault(generation/'));
 assert.ok(driver.includes('postgres:16.13'));
 assert.ok(driver.includes("'--network','none'"));
 assert.ok(driver.includes("'--tmpfs','/var/lib/postgresql/data"));
 assert.ok(driver.includes('ephemeral_private_recovery_key_destroyed'));
 assert.ok(driver.includes('no_fixture_pg_containers_left'));
 assert.ok(driver.includes('temporary_restored_plaintext_vault_removed'));
});
test('manifest explicitly cannot promote a test to production erasure/snapshot claims',()=>{
 for(const key of ['productionSnapshotCoherenceVerified','productionSqlWalCovered',
  'actualVaultAttachmentScopeVerified','offHostRecoveryKeyProven',
  'deletedWorkNonresurrectionCertified','productionCutoverApproved','realMemberBetaApproved']){
   assert.ok(writer.includes("'"+key+"':False"));
   assert.ok(verifier.includes(key));
 }
 assert.ok(verifier.includes('cryptographicManifestSignatureVerified'));
 assert.ok(verifier.includes('WS_R1T_VERIFY_ONLY'));
});
test('verifier never decrypts and refuses incomplete, symlink or digest drift',()=>{
 for(const text of ['INCOMPLETE_OR_EXTRA_ARTIFACTS','SYMLINK_REFUSED','UNSAFE_PERMISSIONS',
  'CIPHERTEXT_SHA_MISMATCH','FALSE_RELEASE_CLAIM_IN_MANIFEST'])assert.ok(verifier.includes(text));
 assert.doesNotMatch(verifier,/gpg --decrypt|pg_restore|aws\s+kms/);
 assert.ok(verifier.includes('hashlib.sha256'));
 assert.ok(negative.includes('altered_ciphertext_digest_refused'));
 assert.ok(negative.includes('forged_beta_go_manifest_refused'));
 assert.ok(negative.includes('weak')||negative.includes('weakened_archive_permissions_refused'));
});
test('operator plan preserves BOTH original scheduled backup writers and root installer stop',()=>{
 for(const phrase of ['two independent scheduled','root cron/NAS writer','separate user cron writer',
  'R20 installer STOP','SQL/WAL','Source','attachments','independent cold restore',
  'deleted-Work','off-machine recovery-key custodian','rollback','five-person']){
  assert.ok(plan.toLowerCase().includes(phrase.toLowerCase()),phrase);
 }
 assert.match(plan,/not a newly qualified recovery service/i);
 assert.match(plan,/PRODUCTION CUTOVER: HOLD/);
});
test('no unbounded or self-approving production execution paths in this code batch',()=>{
 for(const text of [writer,driver,verifier,negative]){
  assert.doesNotMatch(text,/aws\s+cloudformation\s+deploy|systemctl\s+restart|crontab\s+-|kubectl\s+apply/);
  assert.doesNotMatch(text,/-----BEGIN PRIVATE KEY-----|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}/);
 }
 assert.ok(!fs.existsSync(path.join(root,'scripts/ops/wsBetaR1TProductionBackup.sh')));
});
