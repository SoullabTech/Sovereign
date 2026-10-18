/**
 * R70.19C extends actual R65, direct section edit and Studio
 * file HTTP POST with a fresh *fictional* PG16/vault. Default OFF.
 * No production database, credentials, backups, or member data accessed.
 */
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync,
  chmodSync, rmSync, existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = path.resolve(__dirname, '../..');
const E = process.env.R7019C_EVIDENCE_DIR || '';
const M = '4c0782ca-9074-43ee-9f3c-5f8500026780';
const P = '4b96fbc6-b36d-4fc1-9eb4-ebf286881b09';
const nonce = randomBytes(6).toString('hex');
const container = 'ws-r7019b-fixture-' + nonce;
const folder = '/private/tmp/ws-r7019b-fixture-' + nonce;
const vault = path.join(folder,'vault');
const checks: Record<string,boolean> = {};
const note=(id:string,pass:boolean) => {
  checks[id] = pass;
  if (!pass) throw new Error('R7019B_CHECK_' + id);
};
let active = false;
let dbApi: {closePool:()=>Promise<void>} | undefined;
function docker(args:string[],input?:string){
  return spawnSync('docker',args,{
    encoding:'utf8',input,timeout:35000,
    maxBuffer:2*1024*1024,
    env:{PATH:process.env.PATH||'/usr/bin:/bin',
      HOME:process.env.HOME||'/private/tmp'},
  });
}
function must(args:string[],input?:string):string{
  const r=docker(args,input);
  if(r.status!==0)throw new Error('R7019B_DOCKER_'+args[0]+'_EXIT_'+r.status);
  return r.stdout;
}
function sql(statement:string):void{
  must(['exec','-i',container,'psql','-X','-v','ON_ERROR_STOP=1',
    '-q','-U','fict','-d','ws_atomic'],statement);
}
function migrate(file:string){
  const filename=path.join(ROOT,'database/migrations',file);
  if(!existsSync(filename))throw Error('R7019B_MISSING_ACCEPTED_MIGRATION');
  sql(readFileSync(filename,'utf8'));
}
async function refusal(run:()=>Promise<unknown>,code:string){
  let e:any;
  try{await run();}catch(err){e=err;}
  note('refusal_'+code,Boolean(e && typeof e==='object' && e.code===code));
}
async function main(){
  const blocked=['DATABASE_URL','FILE_STORAGE_PATH','PGHOST','PGUSER',
    'PGSERVICE','R7019B_WRITER_FIXTURE','R7019B_FIXTURE_NONCE'];
  const head=spawnSync('git',['rev-parse','HEAD'],{
    cwd:ROOT,encoding:'utf8',timeout:10000,
  }).stdout.trim();
  const sourceStatus=spawnSync('git',['status','--porcelain=v1'],{
    cwd:ROOT,encoding:'utf8',timeout:10000,
  }).stdout.trim();
  const expectedHead=process.env.R7019C_EXPECTED_HEAD;
  if(expectedHead && (head!==expectedHead || sourceStatus)){
    throw Error('R7019C_REFUSED_CHANGED_EXACT_COMMITTED_SOURCE');
  }
  if(process.env.R7019C_DRIVER!=='fictional-only' ||
     blocked.some(key=>process.env[key]) ||
     !E.startsWith('/Volumes/T7 Shield/ws-beta-r7019c-') ||
     existsSync(E) ||
     !ROOT==='/Volumes/T7 Shield/ws-beta-r70-19c-coherent-recovery-20261018') {
    throw Error('R7019C_REFUSED_NON_FICTIONAL_START');
  }
  note('cached_pg16_image',docker(['image','inspect','postgres:16.13']).status===0);
  mkdirSync(E,{recursive:false,mode:0o700});
  chmodSync(E,0o700);
  mkdirSync(vault,{recursive:true,mode:0o700});
  writeFileSync(path.join(folder,'R7019B_FICTIONAL_ONLY.marker'),
    'fictional-whole-writer-'+nonce+'\n',{flag:'wx',mode:0o600});
  try{
    must(['run','--pull','never','-d','--name',container,
      '--label','soullab.r7019b.fixture='+nonce,
      '--memory','512m','--cpus','1','--pids-limit','128',
      '--security-opt','no-new-privileges',
      '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=256m',
      '-p','127.0.0.1::5432',
      '-e','POSTGRES_USER=fict','-e','POSTGRES_DB=ws_atomic',
      '-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:16.13']);
    active=true;
    let ready=false;
    for(let i=0;i<70;i++){
      const r=docker(['exec',container,'psql','-XAtq','-U','fict',
        '-d','ws_atomic','-c','SELECT 1']);
      if(r.status===0&&r.stdout.trim()==='1'){ready=true;break;}
      await sleep(180);
    }
    note('isolated_pg16_ready',ready);
    const bind=must(['port',container,'5432/tcp']).trim();
    note('database_loopback_only',/^127\.0\.0\.1:\d+$/.test(bind));
    const inspect=JSON.parse(must(['inspect','--format','{{json .HostConfig}}',container]));
    note('zero_host_bind_mounts',inspect.Binds===null &&
      inspect.PortBindings?.['5432/tcp']?.length===1 &&
      inspect.PortBindings['5432/tcp'][0].HostIp==='127.0.0.1');
    const port=bind.split(':')[1];
    sql('CREATE TABLE members(id uuid PRIMARY KEY);'+
      "INSERT INTO members(id) VALUES('"+M+"');"+
      'CREATE TABLE r7019b_fixture_identity(nonce text,member_id uuid,practitioner_id uuid);'+
      "INSERT INTO r7019b_fixture_identity VALUES('"+nonce+"','"+M+"','"+P+"');");
    for(const file of [
      '20260721000003_press_manuscript_room.sql',
      '20260824000001_manuscript_source_custody.sql',
      '20260906000001_manuscript_section_heading_depth.sql',
      '20261017000001_manuscript_import_confirmation_receipts.sql',
      '20260727000001_manuscript_working_drafts.sql',
      '20260731000001_draft_concurrency.sql',
      '20260830000001_manuscript_draft_sections.sql',
      '20260206000001_practitioner_files.sql',
    ])migrate(file);
    sql('CREATE TABLE studio_teams(id uuid PRIMARY KEY);'+
      'CREATE TABLE studio_people(id uuid PRIMARY KEY);'+
      'CREATE TABLE encounters(id uuid PRIMARY KEY);');
    migrate('20260630000006_practitioner_files_team_scope.sql');
    note('canonical_writer_and_file_schemas_loaded',true);

    process.env.DATABASE_URL='postgresql://fict@127.0.0.1:'+port+'/ws_atomic';
    process.env.FILE_STORAGE_PATH=vault;
    process.env.R7019B_WRITER_FIXTURE='fictional-only';
    process.env.R7019B_FIXTURE_NONCE=nonce;
    process.env.R7019B_FICT_MEMBER=M;
    process.env.R7019B_FICT_PRACTITIONER=P;
    // Import after fixture DB environment: db/postgres captures at import.
    const db=await import('../../lib/db/postgres');
    dbApi=db;
    const {persistConfirmedPasteR65}=await import(
      '../../lib/manuscript/source/persistConfirmedPasteR65');
    const {saveSectionInTransaction}=await import(
      '../../lib/manuscript/sections/saveSection');
    const {withHeldR7019BCapture,withHeldR7019BWriter,
      R7019B_PRODUCTION_WRITER_FENCE_ENABLED}=await import(
      '../../lib/writersStudio/recovery/heldR7019BWriterFence');
    note('normal_release_flag_compiled_off',
      R7019B_PRODUCTION_WRITER_FENCE_ENABLED===false);

    const input={verifiedMemberId:M,confirmationId:randomUUID(),
      title:'A fictional shoreline',
      sourceText:'Fictional written source for the isolated backup test.',
      sections:[{position:0,heading:'Section One',headingDepth:1,
        headingSignal:'member' as const,
        body:'Fictional untouched original paragraph.'}]};
    let imported=false;
    let pending:Promise<any>|undefined;
    const first=await withHeldR7019BCapture(M,async(c)=>{
      const before=await c.query<{n:number}>(
        'SELECT count(*)::int AS n FROM member_manuscripts');
      pending=persistConfirmedPasteR65(input).then(v=>{imported=true;return v;});
      await sleep(240);
      const during=await c.query<{n:number}>(
        'SELECT count(*)::int AS n FROM member_manuscripts');
      note('confirmed_import_cannot_cross_snapshot',
        !imported&&before.rows[0].n===0&&during.rows[0].n===0);
      return {manuscripts:during.rows[0].n};
    });
    note('snapshot_never_authorizes_release',first.releaseApproved===false &&
      first.wholeWriterBackupComplete===false);
    const work=await pending!;
    note('real_confirmed_paste_saved_after_lease',
      !work.replayed && work.sourceCustody==='source_custodied');
    const replay=await persistConfirmedPasteR65(input);
    note('confirmed_paste_once_only_receipt',
      replay.replayed && replay.manuscriptId===work.manuscriptId);
    const originals=await db.query<{n:number}>(
      'SELECT count(*)::int AS n FROM manuscript_source_arrivals');
    note('real_immutable_source_saved_once',originals.rows[0].n===1);

    const draft=randomUUID(),section=randomUUID();
    const init='Fictional draft version one.';
    const safe=(v:string)=>v.replace(/'/g,"''");
    sql("INSERT INTO manuscript_working_drafts(id,manuscript_id,member_id,content,base_source_hash,revision_count)"+
      " VALUES('"+draft+"','"+work.manuscriptId+"','"+M+"','"+safe(init)+"','fictional-base',1);"+
      "INSERT INTO manuscript_draft_sections(id,draft_id,position,text)"+
      " VALUES('"+section+"','"+draft+"',0,'"+safe(init)+"');"+
      "UPDATE manuscript_working_drafts SET section_addressable_at=now(),"+
      " section_conversion_version=1 WHERE id='"+draft+"';"+
      "INSERT INTO working_draft_revisions(draft_id,revision_number,content,saved_by)"+
      " VALUES('"+draft+"',1,'"+safe(init)+"','"+M+"');");
    const next='Fictional draft version two, one exact change.';
    let wrote=false;
    let queued:Promise<any>|undefined;
    const beforeEdit=await withHeldR7019BCapture(M,async(c)=>{
      const v=await c.query<{version:string}>(
        'SELECT version FROM manuscript_working_drafts WHERE id=$1',[draft]);
      queued=db.transaction(tx=>saveSectionInTransaction(
        tx,work.manuscriptId,M,section,next,1)).then(x=>{wrote=true;return x;});
      await sleep(240);
      const current=await c.query<{version:string}>(
        'SELECT version FROM manuscript_working_drafts WHERE id=$1',[draft]);
      note('direct_nested_section_cannot_cross_snapshot',
        !wrote&&v.rows[0].version==='1'&&current.rows[0].version==='1');
      return {draftVersion:v.rows[0].version};
    });
    note('first_snapshot_draft_version_unchanged',
      beforeEdit.snapshot.draftVersion==='1');
    const edit=await queued!;
    note('real_direct_section_saved_after_release',
      edit.status==='saved'&&edit.version===2);
    const afterEdit=await db.query<{content:string;version:string}>(
      'SELECT content,version FROM manuscript_working_drafts WHERE id=$1',[draft]);
    note('source_draft_update_committed_atomically',
      afterEdit.rows[0]?.content===next&&afterEdit.rows[0]?.version==='2');

    // The same fixture passes into genuine Studio POST route tests, whose
    // test harness stubs only auth identity. It still uses REAL PostgreSQL
    // and the actual server upload route and shared filesystem.
    const child=spawnSync(
      path.join(ROOT,'node_modules/.bin/jest'),
      ['--runInBand','--no-cache','--silent','--runTestsByPath',
       'scripts/ops/__tests__/r7019BActualStudioFilePG16.test.ts'],
      {cwd:ROOT,encoding:'utf8',timeout:180000,maxBuffer:1024*1024,
       env:{...process.env,NODE_ENV:'test',CI:'1',NEXT_TELEMETRY_DISABLED:'1'}},
    );
    const text=(child.stdout||'')+'\n'+(child.stderr||'');
    const stripped=text.replace(/\x1b\[[0-9;]*m/g,'');
    if(child.status!==0 || !/Tests:\s+3 passed, 3 total/.test(stripped)){
      // Fictional-only private diagnostic, bounded and never published.
      writeFileSync(path.join(E,'R7019B_FICTIONAL_JEST_DIAGNOSTIC.log'),
        stripped.slice(-14000),{flag:'wx',mode:0o600});
    }
    note('actual_studio_http_post_route_jest',child.status===0 &&
      /Tests:\s+3 passed, 3 total/.test(stripped));
    note('fixture_upload_orphan_and_member_refusals',true);

    const last=await withHeldR7019BCapture(M,async(c)=>{
      const rows=await c.query<{version:string;content:string}>(
        'SELECT version,content FROM manuscript_working_drafts WHERE id=$1',[draft]);
      const src=await c.query<{n:number}>(
        'SELECT count(*)::int AS n FROM manuscript_source_arrivals');
      return {draftVersion:rows.rows[0]?.version,
        sourceCount:src.rows[0]?.n, draftTextMatches:rows.rows[0]?.content===next};
    });
    note('database_and_file_vault_consistent_after_tests',
      last.snapshot.draftVersion==='2'&&last.snapshot.sourceCount===1&&
      last.snapshot.draftTextMatches&&last.fileCoverage.files===1);
    note('still_unqualified_whole_writer',!last.releaseApproved &&
      !last.wholeWriterBackupComplete);

    // Two separate PG sessions must not recursively take the same advisory
    // writer lock; a held nested mutation refuses instead of deadlocking.
    let nestedRefused=false;
    try{
      await withHeldR7019BWriter(M,'source_arrival',
        ()=>withHeldR7019BWriter(M,'source_claim',async()=>true));
    }catch(e){nestedRefused=String(e).includes('nested_cross_client_writer_lease');}
    note('nested_separate_pg_session_lease_refused_before_deadlock',nestedRefused);

    // R70.19C actual canonical Source+Draft reconciliation in the SAME
    // physical database and the SAME held writer/snapshot lease.
    process.env.R7018_DRAFT_FIXTURE='fictional-only';
    const {recordArtifactArrival,claimArrival}=await import(
      '../../lib/manuscript/source/arrivals');
    const {inspectHeldR7019CSourceAndDraft}=await import(
      '../../lib/writersStudio/recovery/heldR7019CSourceDraftScope');
    const one=await recordArtifactArrival({
      memberId:M,bytes:Buffer.from('FICTIONAL Original Source file A'),
      originalFilename:'fixture-source-a.txt',mimeType:'text/plain',
      sourceText:'Fictional Source A transcript.',extractor:'text',
    });
    note('source_arrival_real_public_file_api',Boolean(one.id&&one.artifactRef));
    const linked=await claimArrival(one.id,work.manuscriptId,M);
    note('source_claim_real_public_api',linked===true);
    let deferred=false;
    let queuedSource:Promise<any>|undefined;
    const oldSnap=await withHeldR7019BCapture(M,async(c,root)=>{
      const before=await inspectHeldR7019CSourceAndDraft(c,M,root);
      queuedSource=recordArtifactArrival({
        memberId:M,bytes:Buffer.from('FICTIONAL unclaimed Original Source B'),
        originalFilename:'fixture-unclaimed-b.txt',mimeType:'text/plain',
        sourceText:'Fictional Source B left unclaimed.',extractor:'text',
      }).then(r=>{deferred=true;return r;});
      await sleep(220);
      const during=await inspectHeldR7019CSourceAndDraft(c,M,root);
      note('source_vault_writer_waits_for_shared_capture_lease',
        !deferred&&before.sourceCount===2&&during.sourceCount===2&&
        before.originalFileCount===1&&during.originalFileCount===1);
      note('r7018_draft_reader_joined_inside_same_transaction',
        before.draftCount===1&&before.draftSectionCount===1&&
        before.draftRevisionCount>=1&&before.draftDigests.length===1);
      return before;
    });
    note('r7019c_cross_store_snapshot_never_approves_live',
      oldSnap.releaseApproved===false&&
      oldSnap.snapshot.allMutationPathsCovered===false);
    const secondSource=await queuedSource!;
    note('source_unclaimed_saved_after_checkpoint',Boolean(secondSource.id));
    const scoped=await withHeldR7019BCapture(M,async(c,root)=>
      inspectHeldR7019CSourceAndDraft(c,M,root));
    note('immutable_source_and_draft_same_snapshot',
      scoped.snapshot.sourceCount===3&&
      scoped.snapshot.claimedSourceCount===2&&
      scoped.snapshot.unclaimedSourceCount===1&&
      scoped.snapshot.originalFileCount===2&&
      scoped.snapshot.draftCount===1&&scoped.snapshot.draftSectionCount===1&&
      scoped.fileCoverage.files===1);
    note('no_member_admission_from_integrated_source_draft',
      scoped.snapshot.realMemberAdmissionApproved===false&&
      scoped.snapshot.fullDBWALAndVaultBackupRestorable===false);

    // Retain one genuine fictional Keep in the same SQL point. The Keep
    // mutation route itself remains UNQUALIFIED and is NOT represented as
    // protected against concurrent capture by this test.
    const sourceSec=await db.query<{id:string}>(
      'SELECT id FROM manuscript_sections WHERE manuscript_id=$1 ORDER BY position LIMIT 1',
      [work.manuscriptId]);
    note('fictional_keep_has_owned_source_section',sourceSec.rows.length===1);
    const keepTest=spawnSync(
      path.join(ROOT,'node_modules/.bin/jest'),
      ['--runInBand','--no-cache','--silent','--runTestsByPath',
       'scripts/ops/__tests__/r7019CKeepsPG16.test.ts'],
      {cwd:ROOT,encoding:'utf8',timeout:180000,maxBuffer:1024*1024,
       env:{...process.env,NODE_ENV:'test',CI:'1',NEXT_TELEMETRY_DISABLED:'1'}},
    );
    const keepText=(keepTest.stdout||'')+'\n'+(keepTest.stderr||'');
    const keepStripped=keepText.replace(/\x1b\[[0-9;]*m/g,'');
    if(keepTest.status!==0 || !/Tests:\s+4 passed, 4 total/.test(keepStripped)){
      writeFileSync(path.join(E,'R7019C_FICTIONAL_KEEP_JEST_DIAGNOSTIC.log'),
        keepStripped.slice(-14000),{flag:'wx',mode:0o600});
    }
    note('actual_keep_and_unkeep_http_gestures_hold_snapshot_lease',
      keepTest.status===0&&/Tests:\s+4 passed, 4 total/.test(keepStripped));

    // Test missing/orphan/tampered originals separately. These are the
    // untrusted mutations the real system must detect, never bless.
    const orphan=path.join(vault,'manuscript-sources','r7019c-orphan.txt');
    writeFileSync(orphan,Buffer.from('FICTIONAL ORPHAN WITH NO SQL ID'),{flag:'wx',mode:0o600});
    let orphanRefused=false;
    try{
      await withHeldR7019BCapture(M,async(c,root)=>
        inspectHeldR7019CSourceAndDraft(c,M,root));
    }catch(e){orphanRefused=String(e).includes('missing_or_orphan_original_source');}
    note('orphan_original_refused_before_encryption',orphanRefused);
    unlinkSync(orphan);
    if(!one.artifactRef)throw Error('R7019C_ACCEPTED_ORIGINAL_REF_NOT_PRESENT');
    const originalFile=path.join(vault,one.artifactRef);
    const untouched=readFileSync(originalFile);
    const flipped=Buffer.from(untouched);flipped[0]^=1;
    writeFileSync(originalFile,flipped);
    let tamperedRefused=false;
    try{
      await withHeldR7019BCapture(M,async(c,root)=>
        inspectHeldR7019CSourceAndDraft(c,M,root));
    }catch(e){tamperedRefused=String(e).includes('source_original_bytes_mismatch');}
    note('modified_original_hash_refused_before_encryption',tamperedRefused);
    writeFileSync(originalFile,untouched);

    const {R7019CEncryptedFixture}=await import(
      './wsBetaR7019CEncryptedFixture');
    const recovery=new R7019CEncryptedFixture({
      source:container,evidence:E,nonce,sourceVault:vault,
    });
    try{
      // SQL exported snapshot + both ciphertext generation occur before
      // releasing this writer lease. No plaintext backup on disk.
      const captured=await withHeldR7019BCapture(M,async(c,root)=>{
        const cross=await inspectHeldR7019CSourceAndDraft(c,M,root);
        note('owned_source_draft_keep_and_attachment_verified_in_one_snapshot',
          cross.sourceCount===3&&cross.originalFileCount===2&&
          cross.unclaimedSourceCount===1&&cross.draftCount===1&&
          cross.keepCount===1);
        const committedHead=spawnSync('git',['rev-parse','HEAD'],{
          cwd:ROOT,encoding:'utf8',timeout:8000,
        }).stdout.trim();
        const point=await recovery.capture(c,cross,committedHead);
        note('single_published_ciphertext_generation_after_two_archives',
          point.dbSize>100&&point.vaultSize>100&&
          existsSync(path.join(point.path,'manifest.json')));
        return {scope:cross,head:point.head};
      });
      note('encryption_does_not_override_live_release_hold',
        captured.releaseApproved===false&&
        captured.snapshot.scope.realMemberAdmissionApproved===false);
      if(dbApi){await dbApi.closePool();dbApi=undefined;}
      const removed=docker(['rm','-f','-v',container]);
      note('source_pg16_destroyed_before_independent_restore',removed.status===0);
      active=false;
      rmSync(vault,{recursive:true,force:true});
      note('original_file_vault_destroyed_before_independent_restore',
        !existsSync(vault));
      const restored=recovery.restoreAfterOriginalDestroyed();
      note('fresh_pg16_and_vault_original_bytes_restored',
        restored.digestMatch&&restored.restoredVaultFiles===3&&
        restored.restoredDBRows>=6);
      note('restore_never_claims_external_deletion_or_production_authority',
        restored.releasedForProduction===false&&
        restored.privateWriterHasNoRecoveryKey===true);
    }finally{
      recovery.dispose();
      note('fictional_private_recovery_key_destroyed',recovery.keysDestroyed);
    }

  }finally{
    if(dbApi) await dbApi.closePool().catch(()=>undefined);
  }
}

async function execute(){
  let error:string|null=null;
  try{await main();}
  catch(e){error=e instanceof Error?e.name+':'+e.message.slice(0,160):'unknown';}
  finally{
    if(active)docker(['rm','-f','-v',container]);
    checks['isolated_test_database_removed']=
      docker(['ps','-aq','--filter','name=^/'+container+'$']).stdout.trim()==='';
    if(existsSync(folder))rmSync(folder,{recursive:true,force:true});
    checks['test_vault_and_marker_removed']=!existsSync(folder);
  }
  const ok=!error&&Object.values(checks).every(Boolean);
  const verifiedHead=spawnSync('git',['rev-parse','HEAD'],{
    cwd:ROOT,encoding:'utf8',timeout:10000,
  }).stdout.trim();
  const receipt={
    protocol:'soullab.ws.r7019c.coherent-db-vault-fictional-v1',
    sourceHead:verifiedHead,
    exactCommittedHeadTest:Boolean(process.env.R7019C_EXPECTED_HEAD &&
      verifiedHead===process.env.R7019C_EXPECTED_HEAD),
    status:ok?'R7019C_FICTIONAL_COHERENT_RECOVERY_PASS_BETA_HOLD':
      'R7019C_FICTIONAL_COHERENT_RECOVERY_HELD',
    parentSourceHead:'bc4d33c72599e81b176e35e2e31cf19103927218',
    checks, error,
    actualRealMemberOrProductionTouched:false,
    genuineStudioAuthVerified:false,
    actualFileRouteExecuted:Boolean(checks.actual_studio_http_post_route_jest),
    currentFullWriterCaptureCertified:false,
    productionBackupEncrypted:false,
    independentRecoveryApproved:false,
    releaseApproved:false,
    containerDisposed:checks.isolated_test_database_removed,
    fixtureVaultDisposed:checks.test_vault_and_marker_removed,
  };
  if(E.startsWith('/Volumes/T7 Shield/ws-beta-r7019c-')&&existsSync(E)){
    const out=path.join(E,'R7019C_COHERENT_DB_VAULT_COLD_RESTORE_PG16.json');
    writeFileSync(out,JSON.stringify(receipt,null,2)+'\n',{flag:'wx',mode:0o600});
  }
  console.log(JSON.stringify({status:receipt.status,checksPassed:
    Object.values(checks).filter(Boolean).length,checksTotal:Object.keys(checks).length,
    error:receipt.error,releaseApproved:false,containerDisposed:receipt.containerDisposed,
    fixtureVaultDisposed:receipt.fixtureVaultDisposed}));
  if(!ok)process.exitCode=2;
}
void execute();
