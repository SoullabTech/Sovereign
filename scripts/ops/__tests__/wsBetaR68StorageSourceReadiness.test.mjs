import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {
 auditStorageReadinessR68,readR68SourceOnly,assessR68SourceTexts,
 BACKUP_SOURCE_PATHS,OPERATIONAL_EVIDENCE_GATES,R68_PROTOCOL,
} from '../wsBetaR68StorageSourceReadiness.mjs';

const ROOT=resolve(process.cwd());
const original=()=>Object.fromEntries(BACKUP_SOURCE_PATHS.map(f=>[
 f,readFileSync(join(ROOT,f),'utf8'),
]));
test('R68 is a source-only fixture, never a production encryption certificate',()=>{
 const result=auditStorageReadinessR68(ROOT);
 assert.equal(result.protocol,R68_PROTOCOL);
 assert.equal(result.sourceOnly,true);
 assert.equal(result.sourceClassificationComplete,true);
 assert.equal(result.sourcePaths.length,10);
 assert.equal(result.knownSourceRisks.length,10);
 assert.equal(result.productionBackupInspected,undefined);
 assert.equal(result.productionStorageVerified,false);
 assert.equal(result.encryptedBackupsAndRestoreVerified,false);
 assert.equal(result.realMembersOrBackupsRead,0);
 assert.equal(result.backedUpOrRestoredMemberRecords,0);
 assert.equal(result.operatorOverrideAvailable,false);
 assert.equal(result.releaseApproved,false);
 assert.equal(result.candidateRelease,'HOLD');
 assert.equal(result.operationalWitnessRequirements.length,10);
 assert.deepEqual(result.operationalWitnessRequirements,
  [...OPERATIONAL_EVIDENCE_GATES]);
});
test('current repository backup scripts are gzip/plaintext or unproved',()=>{
 const {assessment}=readR68SourceOnly(ROOT);
 assert.equal(assessment.sourceClassificationComplete,true);
 assert.match(assessment.sourceChecks.dailySqlGzip.risk,
  /gzip_compresses_plaintext_sql/);
 assert.match(assessment.sourceChecks.temporaryUnencryptedSql.risk,
  /sql_written_before_gzip/);
 assert.match(assessment.sourceChecks.tableDataSqlGzip.risk,
  /raw_inserts_and_schema_dump/);
 assert.match(assessment.sourceChecks.cronCredentialExposure.risk,
  /database_url_in_scheduler/);
 assert.match(assessment.sourceChecks.rawRestoreOverride.risk,
  /unguarded|ungoverned|override/);
 assert.equal(assessment.sourceChecks.rootReplacementHeld.observed,true);
 assert.equal(assessment.sourceChecks.backupTransitionFictionalOnly.observed,true);
 assert.equal(assessment.releaseApproved,false);
});
test('the presence of an application AES backup component is not full SQL+vault restore proof',()=>{
 const observed=auditStorageReadinessR68(ROOT);
 assert.ok(observed.sourceChecks.applicationBackupSourceExists.observed);
 assert.match(observed.sourceChecks.applicationBackupSourceExists.risk,
  /not_full_postgres_wal_file_restore/);
 assert.equal(observed.encryptedBackupsAndRestoreVerified,false);
});
test('source script rename, deletion and mutation cannot turn missing proof into beta GO',()=>{
 const before=original();
 for(const changed of [
  {'scripts/backup-db.sh':undefined},
  {'scripts/backup-db.sh': '# simulated claim of AES but no pg_dump proof'},
  {'scripts/setup-backup-cron.sh': 'changed cron source, independently unreviewed'},
  {'scripts/restore-db.sh': 'removed R20 deletion-safe hold'},
 ]){
  const inputs={...before,...changed};
  const result=assessR68SourceTexts(inputs);
  assert.equal(result.sourceClassificationComplete,false);
  assert.equal(result.releaseApproved,false);
  assert.equal(result.productionStorageVerified,false);
  assert.equal(result.encryptedOffsiteBackupVerified,false);
 }
});
test('injected redacted metadata cannot become encrypted-backup/restore proof',()=>{
 const r=auditStorageReadinessR68(ROOT,{
  sourceOnly:false,releaseApproved:true,
  independentlyVerified:true,
  operationalReceipts:Array.from({length:10},()=>({approved:true})),
 });
 assert.equal(r.releaseApproved,false);
 assert.equal(r.productionStorageVerified,false);
 assert.equal(r.encryptedBackupsAndRestoreVerified,false);
 assert.equal(r.operatorOverrideAvailable,false);
});
test('audit output fingerprints source paths but never copies full SQL/cron/password text',()=>{
 const marker='r68_mock_database_password_synthetic_never_share';
 const source=original();
 source['scripts/backup-db.sh']+=marker;
 const result=auditStorageReadinessR68(ROOT,{
  readSource:path=>source[path],
 });
 const printable=JSON.stringify(result);
 assert.doesNotMatch(printable,new RegExp(marker));
 assert.deepEqual(Object.keys(result.sourceDigests).sort(),
  [...BACKUP_SOURCE_PATHS].sort());
 assert.ok(result.sourceDigests['scripts/backup-db.sh'].match(/^[a-f0-9]{64}$/));
 assert.equal(result.candidateRelease,'HOLD');
});
test('source-only --audit returns evidence, release-gate exits 2 fail-closed',()=>{
 const script=join(ROOT,'scripts/ops/wsBetaR68StorageSourceReadiness.mjs');
 const audit=spawnSync('node',[script,'--audit'],{
  cwd:ROOT,encoding:'utf8',timeout:15000,
 });
 assert.equal(audit.status,0);
 const result=JSON.parse(audit.stdout);
 assert.equal(result.protocol,R68_PROTOCOL);
 assert.equal(result.candidateRelease,'HOLD');
 assert.equal(result.productionChanged,false);
 const stop=spawnSync('node',[script,'--release-gate'],{
  cwd:ROOT,encoding:'utf8',timeout:15000,
 });
 assert.equal(stop.status,2);
 assert.match(stop.stderr,/HOLD: no independent proof/);
 assert.equal(JSON.parse(stop.stdout).releaseApproved,false);
});
test('no source-only audit performs Docker, PostgreSQL, crontab or external network calls',()=>{
 const file=readFileSync(join(ROOT,
  'scripts/ops/wsBetaR68StorageSourceReadiness.mjs'),'utf8');
 assert.doesNotMatch(file,/from 'node:child_process'/);
 assert.doesNotMatch(file,/\b(?:spawn|execFile|execSync|fetch)\s*\(/);
 assert.doesNotMatch(file,/\bcreateConnection\s*\(/);
 assert.equal(assessR68SourceTexts(original()).sourceOnly,true);
});

test('physical backup-restoration executor refuses all real-mode execution by default',()=>{
 const script=join(ROOT,'scripts/ops/wsBetaR68FictionalEncryptedRestorePG16.mjs');
 const attempt=spawnSync('node',[script],{
  cwd:ROOT,encoding:'utf8',timeout:15000,
  env:{PATH:process.env.PATH||'/usr/local/bin:/usr/bin:/bin',
   HOME:process.env.HOME||'/tmp'},
 });
 assert.notEqual(attempt.status,0);
 assert.match(attempt.stderr,/R68_FICTIONAL_RESTORE_EXPLICIT_OPTIN_REQUIRED/);
 assert.doesNotMatch(attempt.stdout,/FICTIONAL_SUCCESS/);
});
test('fictional restore refuses unknown control file before any SQL or Docker work',()=>{
 const script=join(ROOT,'scripts/ops/wsBetaR68FictionalEncryptedRestorePG16.mjs');
 const attempt=spawnSync('node',[script,'--cold-restore',
  '/tmp/r68_not_an_owned_fixture_manifest.json'],{
  cwd:ROOT,encoding:'utf8',timeout:15000,
  env:{PATH:process.env.PATH||'/usr/local/bin:/usr/bin:/bin',
   HOME:process.env.HOME||'/tmp',
   R68_ENCRYPTED_RESTORE_FIXTURE:'fictional-only'},
 });
 assert.equal(attempt.status,4);
 const result=JSON.parse(attempt.stdout.trim());
 assert.equal(result.restore,'HELD');
 assert.equal(result.releaseApproved,false);
 assert.match(result.reason,/R68_FRESH_PROCESS_MANIFEST_SCOPE_INVALID/);
});
