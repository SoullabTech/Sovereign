'use strict';
/** R1X cross-branch release HOLD and source custody. Pure read-only checks. */
const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../../..');
const R1W='1e9eee64306197a0f52e7b547ee3bdd279d786fa';
const R7019I='fcf4bbe0a22e0f865b944c998cf32c26a910115b';
const file=f=>readFileSync(path.join(ROOT,f),'utf8');
const git=(...args)=>{
 const p=spawnSync('git',args,{cwd:ROOT,encoding:'utf8',timeout:12000});
 assert.equal(p.status,0,'git metadata only');return p.stdout.trim();
};
const backup=file('scripts/ops/wsBetaR1VMinisforumEncryptedBackup.py');
const signed=file('scripts/ops/wsBetaR1WSignedGeneration.py');
const independent=file('scripts/ops/wsBetaR7019IIndependentSignedRestore.py');
const physical=file('scripts/ops/wsBetaR7019IPhysicalPG16.py');
const custody=file('scripts/ops/wsBetaR7019IFictionalCensusAuthority.mjs');
const checker=file('scripts/ops/wsBetaR7019CWholeWriterGate.mjs');
const ledger=JSON.parse(file('scripts/ops/wsBetaR7019CWholeWriterCoverageLedger.json'));

test('pinned R1W + R70.19I merge plus ONLY reviewed three-file readiness child may qualify',()=>{
 const commit=git('rev-parse','HEAD');
 if(commit===R1W){
  assert.equal(git('rev-parse','MERGE_HEAD'),R7019I);
  assert.equal(git('diff','--name-only','--diff-filter=U'),'');
 }else{
  const reviewMerge='7fb1a50b5c53ac18e5f3ffc55b0aff5b52b204d9';
  assert.deepEqual(git('rev-list','--parents','-n1',reviewMerge).split(' ').slice(1),[R1W,R7019I]);
  const ancestor=spawnSync('git',['merge-base','--is-ancestor',reviewMerge,commit],
   {cwd:ROOT,encoding:'utf8',timeout:10000});
  assert.equal(ancestor.status,0,'exact two-parent R1X ancestry must remain');
  const changed=git('diff','--name-only',reviewMerge,commit).split('\n').filter(Boolean).sort();
  assert.deepEqual(changed,[
   'docs/ops/WS_BETA_R1X_SIGNED_SAME_SNAPSHOT_ERASURE_CONVERGENCE_HOLD_20261018.md',
   'scripts/ops/__tests__/wsBetaR1XSignedSnapshotConvergence.test.cjs',
   'scripts/ops/wsBetaR7019IIndependentSignedRestore.py',
  ].sort(),'only the approved recovery-readiness correction may differ from the joined parent');
 }
});
test('R1W signer and signed-only restore code preserved BYTE FOR BYTE from accepted parent',()=>{
 for(const f of ['scripts/ops/wsBetaR1WSignedGeneration.py',
                   'scripts/ops/wsBetaR1WSignedIndependentColdRestore.py']){
  const p=spawnSync('git',['show',R1W+':'+f],{cwd:ROOT,encoding:null,timeout:12000});
  assert.equal(p.status,0);assert.deepEqual(readFileSync(path.join(ROOT,f)),p.stdout);
 }
});
test('R70.19I signed deletion authority and physical Work census preserved BYTE FOR BYTE',()=>{
 for(const f of ['scripts/ops/wsBetaR7019IPhysicalPG16.py',
                   'scripts/ops/wsBetaR7019IFictionalCensusAuthority.mjs']){
  const p=spawnSync('git',['show',R7019I+':'+f],{cwd:ROOT,encoding:null,timeout:12000});
  assert.equal(p.status,0);assert.deepEqual(readFileSync(path.join(ROOT,f)),p.stdout);
 }
});
test('R1V production backup remains compile-time DISABLED; snapshot is fiction-only',()=>{
 assert.match(backup,/R1V_PRODUCTION_CUTOVER_RELEASED\s*=\s*False/);
 assert.match(backup,/R1V_REFUSED_PRODUCTION_HARD_DISABLED_REQUIRE_NEW_REVIEWED_SOURCE/);
 assert.match(backup,/os\.environ\.get\('R7019I_CAPTURE_FIXTURE'\)!='fictional-only'/);
 assert.match(backup,/re\.fullmatch\(r'\[0-9A-F\]\+-\[0-9A-F\]\+-\[0-9A-F\]\+'/);
 assert.match(backup,/pgdump\.append\('--snapshot='\+exported_snapshot\)/);
 assert.match(backup,/R7019ISnapshotIdFormatVerified/);
 const proc=spawnSync('/usr/bin/python3',['scripts/ops/wsBetaR1VMinisforumEncryptedBackup.py','--live'],{
  cwd:ROOT,encoding:'utf8',timeout:8000,
  env:{HOME:process.env.HOME,PATH:'/Users/soullab/.nvm/versions/node/v22.22.3/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin'}});
 assert.equal(proc.status,70);assert.match(proc.stderr,/PRODUCTION_HARD_DISABLED/);
});
test('one actual PostgreSQL exported snapshot under lease links Work roster and encrypted database',()=>{
 for(const s of ['pg_export_snapshot','BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY',
                'pg_advisory_xact_lock','member_manuscripts m',
                'ws_managed_work_key_wrappings_r1q k','--fixture-snapshot'])
  assert.ok(physical.includes(s),s);
 assert.match(physical,/R7019I_PRODUCTION_COHERENT_BACKUP_ENABLED=False/);
 assert.match(physical,/fiveOriginalFileScopesCertifiedInFictionalTest/);
});
test('independent current deletion authority and Work census are verified BEFORE decryption',()=>{
 assert.match(independent,/R7019I_PRODUCTION_RESTORE_ENABLED=False/);
 assert.match(independent,/r1w\.verify_signed/);
 assert.match(independent,/r1v\.verified_private_home/);
 const signature=independent.indexOf('r1w.verify_signed(');
 const deletion=independent.indexOf("'verify',str(signed),str(external)");
 const secret=independent.indexOf('r1v.verified_private_home(');
 assert.ok(signature>=0&&signature<deletion&&deletion<secret);
 assert.match(custody,/OLD_VALID_ARCHIVE_CONTAINS_NOW_DELETED_WORK_OR_KEY/);
 assert.match(custody,/minimumDeletionGeneration/);
 assert.match(custody,/independentlyExpectedOwnedWorks/);
});
test('R70.19I restorer differs from frozen parent by ONE bounded SQL query-ready correction only',()=>{
 const file='scripts/ops/wsBetaR7019IIndependentSignedRestore.py';
 const upstream=spawnSync('git',['show',R7019I+':'+file],{cwd:ROOT,encoding:'utf8',timeout:10000});
 assert.equal(upstream.status,0);
 const old=[
  '  for _ in range(48):',
  "   ready=run([docker,'exec',a.destination_container,'pg_isready',",
  "    '-U','fict','-d','ws_fixture'],timeout=5)",
  '   if ready and ready.returncode==0:break',
  '   time.sleep(.25)',
  "  else:raise RuntimeError('PG16_RECOVERY_NOT_READY')",
 ].join('\n');
 const improvement=[
  '  # pg_isready may report the server accepting connections before the',
  '  # Docker entrypoint has finished CREATE DATABASE ws_fixture. A physical',
  '  # recovery requires an actual SQL connection to the EXACT target database.',
  '  # Query only constant 1: no member SQL or private restore data is touched.',
  '  for _ in range(48):',
  "   ready=run([docker,'exec',a.destination_container,'psql',",
  "    '-XAtq','-U','fict','-d','ws_fixture','-c','SELECT 1'],timeout=5)",
  "   if ready and ready.returncode==0 and ready.stdout.strip()==b'1':break",
  '   time.sleep(.25)',
  "  else:raise RuntimeError('PG16_RECOVERY_DATABASE_NOT_QUERY_READY')",
 ].join('\n');
 assert.equal(upstream.stdout.split(old).length,2,'expected one original readiness check');
 assert.equal(independent,upstream.stdout.replace(old,improvement));
});
test('physical restorer refuses to start until the EXACT fictional PG16 database answers SELECT 1',()=>{
 const r=independent;
 assert.match(r,/PG16_RECOVERY_DATABASE_NOT_QUERY_READY/);
 assert.match(r,/'-XAtq','-U','fict','-d','ws_fixture','-c','SELECT 1'/);
 assert.match(r,/ready\.stdout\.strip\(\)==b'1'/);
 assert.doesNotMatch(r,/'pg_isready',/);
});
test('legacy R70.19C source SHA inventory is immutable and explicitly DRIFT-HELD in joined source',()=>{
 assert.equal(ledger.entries.length,22);
 const proc=spawnSync(process.execPath,['scripts/ops/wsBetaR7019CWholeWriterGate.mjs',ROOT],{
  cwd:ROOT,encoding:'utf8',timeout:11000});
 assert.equal(proc.status,78);
 const observed=JSON.parse(proc.stdout);
 assert.equal(observed.status,'R7019C_SOURCE_MUTATOR_CUSTODY_DRIFT_HELD');
 assert.equal(observed.expectedSourceEntries,22);
 assert.equal(observed.verifiedSourceEntries,15);
 assert.deepEqual(observed.drift.map(x=>x.id).sort(),[
  'studio_file_upload','held_draft_revision_reader','legacy_direct_revision_restore',
  'studio_file_soft_delete','studio_file_metadata','shared_writer_lease',
  'exported_snapshot_encrypted_db_vault'].sort());
 assert.equal(observed.releaseApproved,false);
 assert.equal(observed.currentExternalDeletionHighwaterCertified,false);
});
test('no signed fixture may satisfy real beta admission, real credential or production key custody',()=>{
 assert.match(physical,/realBetaApproved':False/);
 assert.match(physical,/productionSnapshotOrCronAccessed':False/);
 assert.match(custody,/ephemeralPrivateKeysNeverPersisted:true/);
 assert.match(signed,/PRODUCTION_SIGNED_GENERATION_RELEASED=False/);
 assert.match(file('scripts/ops/wsBetaR1WSignedIndependentColdRestore.py'),/R1W_REAL_SIGNED_PRODUCTION_RESTORE_ENABLED=False/);
 for(const src of [backup,signed,independent,physical]){
  assert.doesNotMatch(src,/aws\s+kms\s+decrypt|crontab\s+-|systemctl\s+restart/);
 }
});
