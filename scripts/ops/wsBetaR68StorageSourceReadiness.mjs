/**
 * R68 standard-security Writer beta: METADATA-ONLY backup/restore readiness.
 *
 * This gate opens ONLY pinned repository source scripts. It never executes
 * backup commands, Docker, crontab, a network request or a production DB.
 * It never reads real backup bytes, member content or environment secrets.
 *
 * Passing source integrity is NOT proof of production encrypted backups.
 * Only an independent observed host+storage+restore review can clear that
 * operational bar, and this source-only script NEVER returns beta GO.
 *
 * CLI: node scripts/ops/wsBetaR68StorageSourceReadiness.mjs --audit
 *      node scripts/ops/wsBetaR68StorageSourceReadiness.mjs --release-gate
 */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const R68_PROTOCOL='soullab.ws.r68.standard-storage.source-only-hold.v1';
export const BACKUP_SOURCE_PATHS=Object.freeze([
 'scripts/backup-db.sh',
 'scripts/backup-postgres.sh',
 'scripts/backup-database.sh',
 'scripts/setup-backup-cron.sh',
 'scripts/restore-db.sh',
 'scripts/restore-governed.sh',
 'scripts/ops/ws-backup-exact-shell-preflight-oci.sh',
 'scripts/ops/test-ws-backup-transition-fixture.mjs',
 'lib/storage/fileVault.ts',
 'lib/storage/encrypted-backup.ts',
]);
export const OPERATIONAL_EVIDENCE_GATES=Object.freeze([
 'production_tls_and_current_member_isolation_witness',
 'actual_database_volume_and_temp_wal_encryption_at_rest_witness',
 'attachment_and_source_file_vault_encryption_at_rest_witness',
 'active_sql_backup_export_encryption_not_gzip_only_witness',
 'actual_nas_offsite_snapshots_recycle_and_old_plaintext_copies_inventory',
 'independent_backup_key_management_and_retention_controls_witness',
 'encrypted_full_database_and_file_vault_isolated_restore_proof',
 'source_draft_revision_private_review_and_member_scope_restore_proof',
 'deletion_tombstone_replay_and_old_reader_rollback_barrier_witness',
 'separate_security_reviewer_founder_and_exact_member_notice_acceptance',
]);
const sha256=value=>createHash('sha256').update(value,'utf8').digest('hex');

const pattern=(text,regex)=>typeof text==='string'&&regex.test(text);
const sourceVerdict=(present,observed,riskOnPass)=>({
 observed:present&&observed,
 sourceReadable:present,
 risk:present&&observed?riskOnPass:'source_custody_unverified',
});
/** Pure source inspector, allowing explicit fictional string mutation tests. */
export function assessR68SourceTexts(files){
 const sourceChecks={
  dailySqlGzip:sourceVerdict(
   typeof files['scripts/backup-db.sh']==='string',
   pattern(files['scripts/backup-db.sh'],/pg_dump[\s\S]{0,400}\|\s*gzip\b/),
   'gzip_compresses_plaintext_sql_no_backup_encryption'),
  temporaryUnencryptedSql:sourceVerdict(
   typeof files['scripts/backup-postgres.sh']==='string',
   pattern(files['scripts/backup-postgres.sh'],/pg_dump[\s\S]{0,180}>\s*"\$BACKUP_FILE"/)&&
    pattern(files['scripts/backup-postgres.sh'],/\bgzip\s+"\$BACKUP_FILE"/),
   'sql_written_before_gzip_and_not_encrypted'),
  tableDataSqlGzip:sourceVerdict(
   typeof files['scripts/backup-database.sh']==='string',
   pattern(files['scripts/backup-database.sh'],/--data-only/)&&
    pattern(files['scripts/backup-database.sh'],/\bgzip\s+"\$BACKUP_FILE"/),
   'raw_inserts_and_schema_dump_compressed_without_encryption'),
  cronCredentialExposure:sourceVerdict(
   typeof files['scripts/setup-backup-cron.sh']==='string',
   pattern(files['scripts/setup-backup-cron.sh'],/CRON_ENTRY=/)&&
    pattern(files['scripts/setup-backup-cron.sh'],/DATABASE_URL=/)&&
    pattern(files['scripts/setup-backup-cron.sh'],/crontab\s+-/),
   'cron_script_embeds_database_url_in_scheduler_configuration'),
  rawRestoreOverride:sourceVerdict(
   typeof files['scripts/restore-db.sh']==='string',
   pattern(files['scripts/restore-db.sh'],/I_UNDERSTAND_THIS_RESTORE_IS_UNGOVERNED/)&&
    pattern(files['scripts/restore-db.sh'],/gunzip\s+-c[\s\S]{0,85}\|\s*psql/),
   'legacy_raw_sql_restore_override_cannot_attest_to_deletion_barrier'),
  governedRestoreSourcePresent:sourceVerdict(
   typeof files['scripts/restore-governed.sh']==='string',
   pattern(files['scripts/restore-governed.sh'],/RESTORE_AUTHORIZED_BY|deletion|govern/i),
   'governed_restore_source_exists_but_live_witness_unverified'),
  rootReplacementHeld:sourceVerdict(
   typeof files['scripts/ops/ws-backup-exact-shell-preflight-oci.sh']==='string',
   pattern(files['scripts/ops/ws-backup-exact-shell-preflight-oci.sh'],
    /PRE-REVIEW ENGINEERING FIXTURE ONLY/)&&
   pattern(files['scripts/ops/ws-backup-exact-shell-preflight-oci.sh'],
    /--preflight/),
   'root_backup_replacement_is_only_an_isolated_mock_preflight'),
  backupTransitionFictionalOnly:sourceVerdict(
   typeof files['scripts/ops/test-ws-backup-transition-fixture.mjs']==='string',
   pattern(files['scripts/ops/test-ws-backup-transition-fixture.mjs'],
    /No I\/O to NAS, Docker, PostgreSQL/),
   'mock_transition_does_not_show_actual_backup_restore'),
  vaultStorageSourceExists:sourceVerdict(
   typeof files['lib/storage/fileVault.ts']==='string',
   pattern(files['lib/storage/fileVault.ts'],/FILE_STORAGE_PATH/),
   'vault_path_configured_but_volume_encryption_unverified'),
  applicationBackupSourceExists:sourceVerdict(
   typeof files['lib/storage/encrypted-backup.ts']==='string',
   pattern(files['lib/storage/encrypted-backup.ts'],/EncryptedBackupSystem/),
   'application_backup_code_not_full_postgres_wal_file_restore'),
 };
 const fullyClassified=Object.values(sourceChecks).every(v=>
  v.observed===true&&v.sourceReadable===true);
 return Object.freeze({
  sourceChecks,
  knownSourceRisks: Object.values(sourceChecks).filter(v=>v.observed).
   map(v=>v.risk),
  sourceClassificationComplete:fullyClassified,
  sourceOnly: true,
  productionBackupInspected: false,
  encryptedDatabaseAtRestVerified: false,
  encryptedFileVaultVerified: false,
  encryptedOffsiteBackupVerified: false,
  actualRestoreAndDeletionVerified: false,
  productionStorageVerified: false,
  releaseApproved: false,
 });
}

export function readR68SourceOnly(root,readSource=(file)=>
 readFileSync(join(root,file),'utf8')){
 const files=Object.fromEntries(BACKUP_SOURCE_PATHS.map(file=>{
  try{return [file,readSource(file)];}
  catch{return [file,null];}
 }));
 return {files,assessment:assessR68SourceTexts(files)};
}

/** Observed host credentials, plaintext backups and raw keys are OUT OF SCOPE. */
export function auditStorageReadinessR68(root,opts={}){
 const reader=opts.readSource??((file)=>readFileSync(join(root,file),'utf8'));
 const {files,assessment}=readR68SourceOnly(root,reader);
 const sourceDigests=Object.fromEntries(BACKUP_SOURCE_PATHS.map(file=>[
  file,typeof files[file]==='string'?sha256(files[file]):null,
 ]));
 return {
  protocol:R68_PROTOCOL,
  sourceOnly:true,
  sourcePaths:[...BACKUP_SOURCE_PATHS],
  sourceDigests,
  sourceClassificationComplete:assessment.sourceClassificationComplete,
  knownSourceRisks:assessment.knownSourceRisks,
  sourceChecks:assessment.sourceChecks,
  operationalWitnessRequirements:[...OPERATIONAL_EVIDENCE_GATES],
  operatorOverrideAvailable:false,
  productionStorageVerified:false,
  encryptedBackupsAndRestoreVerified:false,
  realMembersOrBackupsRead:0,
  backedUpOrRestoredMemberRecords:0,
  productionChanged:false,
  candidateRelease:'HOLD',
  releaseApproved:false,
  nextRequiredAction:'Independent read-only production metadata inspection, then separately authorized encrypted backup-and-restore witness.',
 };
}

const self=fileURLToPath(import.meta.url);
if(process.argv[1]&&resolve(process.argv[1])===resolve(self)){
 const args=process.argv.slice(2);
 if(args.length!==1||!['--audit','--release-gate'].includes(args[0])){
  process.stderr.write('R68: requires exactly --audit or --release-gate\n');
  process.exitCode=3;
 }else{
  // For portability this is intentionally anchored to the checked-out
  // repository source, not the operator's HOME or a live host filesystem.
  const root=resolve(self,'../../..');
  const report=auditStorageReadinessR68(root);
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  if(args[0]==='--release-gate'){
   process.stderr.write('HOLD: no independent proof of real encrypted SQL, vault, offsite backup and governed restore.\n');
   process.exitCode=2;
  }
 }
}
