/**
 * R23 isolated PostgreSQL 16 and immutable-vault ciphertext physical witness.
 * Fictional content and ephemeral key signer only; NEVER production migration.
 */
import { spawnSync,fork } from 'node:child_process';
import { generateKeyPairSync, randomBytes, randomUUID, sign, createHash } from 'node:crypto';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { canonicalDeletionPayload, type DeletionHighwaterV1 } from '../../lib/writersStudio/recovery/deletionBarrierV1';

if (process.env.R36_PASSAGE_PG16_FIXTURE !== 'fictional-only' || process.env.R36_PASSAGE_REVIEW_FIXTURE !== 'fictional-only' || process.env.R23_FIXTURE !== 'fictional-only' || process.env.R33_EDITORIAL_HISTORY_FIXTURE !== 'fictional-only' || process.env.R33_EDITORIAL_PG16_FIXTURE !== 'fictional-only')
  throw Error('R23_EXACT_FICTIONAL_ONLY_OPT_IN_REQUIRED');

const MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const FOREIGN='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const WORK='4c0782ca-9074-43ee-9f3c-5f8500026780';
const name='ws-r36-pg16-'+randomUUID().slice(0,12);
const port='55436';
const root=mkdtempSync(join(tmpdir(),'ws-r36-pg16-passage-'));
const sql=join(process.cwd(),'docs/ops/WS_R23_VAULT_HISTORY_REVIEW_ONLY.sql');
const evidence='/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R36_PG16_PASSAGE_APPLY_20261016.json';
const checks:string[]=[];
const negatives:string[]=[];
let started=false;
let close:undefined|(()=>Promise<void>);
let fail:string|null=null;
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex');
function cmd(args:string[],limit=40000):string {
  const r=spawnSync('docker',args,{encoding:'utf8',timeout:limit,maxBuffer:8*1024*1024});
  if(r.status!==0 || r.error) throw Error('R23_DOCKER_COMMAND_FAILED:'+String(r.stderr||r.error).slice(-180));
  return r.stdout.trim();
}
function ok(v:unknown,reason:string){if(!v)throw Error('R23_CHECK_FAILED:'+reason);checks.push(reason);}
function psql(q:string):string {
  return cmd(['exec','-i',name,'psql','-XAtq','-v','ON_ERROR_STOP=1','-U','soullab','-d','postgres','-c',q]);
}
function waitReady(){
  for(let i=0;i<90;i++){
    const r=spawnSync('docker',['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
      '-U','soullab','-d','postgres','-c','SELECT 1'],
      {encoding:'utf8',timeout:5000});
    // The official PostgreSQL image starts and then stops a temporary
    // bootstrap server before PID 1 execs the final postgres process.
    // A successful query to the bootstrap server is NOT stable readiness.
    const pid1=spawnSync('docker',['exec',name,'cat','/proc/1/comm'],
      {encoding:'utf8',timeout:5000});
    if(r.status===0 && r.stdout.trim()==='1' &&
       pid1.status===0 && pid1.stdout.trim()==='postgres')return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,250);
  }
  throw Error('R23_PG16_NOT_READY');
}
function restoreAuth(generation=10,revokedWorks:string[]=[]){
  const signer=generateKeyPairSync('ed25519');
  const checkpoint:DeletionHighwaterV1={
    protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
    generation,revokedWorks,revokedKeyIds:[],
  };
  return {
    signedDeletion:{checkpoint,signature:sign(null,canonicalDeletionPayload(checkpoint),signer.privateKey).toString('base64')},
    trustedSigner:signer.publicKey,
    independent:{minimumGeneration:10},
  };
}
async function main(){
  mkdirSync(join(root,'vault'),{recursive:true});
  writeFileSync(join(root,'fictional.marker'),'R23_FICTIONAL_ONLY');
  cmd(['run','--pull','never','-d','--name',name,
    '--network','bridge','-e','POSTGRES_USER=soullab',
    '-e','POSTGRES_HOST_AUTH_METHOD=trust',
    '-p','127.0.0.1:'+port+':5432','postgres:16.13'],80000);
  started=true;waitReady();
  ok(cmd(['exec',name,'postgres','--version']).startsWith('postgres (PostgreSQL) 16.'),
    'disposable real PostgreSQL 16, loopback-only port');
  psql(`CREATE TABLE members(id uuid PRIMARY KEY);
    CREATE TABLE member_manuscripts(id uuid PRIMARY KEY, member_id uuid REFERENCES members(id));
    INSERT INTO members VALUES('${MEMBER}'),('${FOREIGN}');
    INSERT INTO member_manuscripts VALUES('${WORK}','${MEMBER}');`);
  cmd(['cp',sql,name+':/tmp/r23_review.sql']);
  cmd(['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
    '-U','soullab','-d','postgres','-f','/tmp/r23_review.sql']);
  ok(psql('SELECT count(*) FROM writers_studio_r23_held_history')==='0',
    'review-only encrypted manifest schema on empty fictional database');

  process.env.DATABASE_URL='postgresql://soullab@127.0.0.1:'+port+'/postgres';
  process.env.FILE_STORAGE_PATH=join(root,'vault');
  const store=await import('../../lib/writersStudio/recovery/heldAuthorEditsR33');
  const bridge=await import('../../lib/writersStudio/recovery/heldPassageApplyR36');
  const db=await import('../../lib/db/postgres');
  close=()=>db.closePool();
  const key={keyId:randomUUID(),keyBytes:randomBytes(32)};
  const deletion=restoreAuth();
  const authority={key,...deletion};
  const subject={memberId:MEMBER,assertedBy:'server_verified_member_session' as const};
  // R33 fictional editorial sequence: start -> save -> author Apply -> Undo.
  const initialText='R33 fictional manuscript first version';
  const savedText='R33 fictional manuscript author revised version';
  const proposedText=savedText.replace('author','writer');
  const scope={subject,workId:WORK,custody:authority};
  ok(store.R33_REAL_EDITORIAL_WRITES_ENABLED===false,
     'real member editorial writes remain compiled OFF');
  const first=await store.beginDraftR33({...scope,text:initialText});
  ok(first.manifest.generation===1 && first.action==='start' &&
     first.text===initialText && first.previousText==='',
     'first fictional draft sealed to immutable vault');
  const second=await store.saveDraftR33({...scope,
     expectedGeneration:1,expectedSHA256:first.textSHA256,text:savedText});
  ok(second.manifest.generation===2 && second.action==='save' &&
     second.previousText===initialText &&
     second.manifest.previousSHA256===first.manifest.cipherSHA256,
     'author Save appends exact second version');
  async function deny(task:()=>Promise<unknown>,label:string){
    let rejected=false;
    try{await task();}catch{rejected=true;}
    ok(rejected,'negative refusal: '+label);
    negatives.push(label);
  }
  await deny(()=>store.applyAuthorApprovedR33({...scope,
    expectedGeneration:2,expectedSHA256:second.textSHA256,
    proposedText,authorConfirmed:false}),'unapproved_apply');
  const sectionId=randomUUID();
  const chosenId=randomUUID(),alternateId=randomUUID();
  const passage='author';
  const selectedStart=Array.from(savedText.split(passage)[0]).length;
  const selection={
    sectionId,currentText:savedText,
    expectedDraftSHA256:second.textSHA256,
    expectedGeneration:2,
    anchor:{
      sectionId,start:selectedStart,end:selectedStart+Array.from(passage).length,
      selectedText:passage,sectionSHA256:second.textSHA256,
    },
    alternatives:[
      {id:chosenId,wording:'writer',origin:'maia' as const},
      {id:alternateId,wording:'storyteller',origin:'member' as const},
    ],
    chosenAlternativeId:chosenId,
  };
  const view=bridge.reviewPassageAlternativesR36(selection);
  ok(view.canWrite===false && view.proposedSectionText===proposedText &&
    view.changedWords.some(x=>x.kind==='removed' && x.text.includes('author')) &&
    view.changedWords.some(x=>x.kind==='added' && x.text.includes('writer')),
    'codepoint-anchored review previews exactly one passage with changed words');
  const gesture={
    kind:'fictional_author_clicked_apply' as const,
    sectionId,alternativeId:chosenId,
    expectedGeneration:2,expectedDraftSHA256:second.textSHA256,
    selectedPassageSHA256:sha(passage),
  };
  await deny(()=>bridge.applyReviewedPassageR36({
    selection,writer:{...scope},
    gesture:{...gesture,alternativeId:alternateId},
    fictionalSingleSectionWork:true,
  }),'forged_choice_gesture');
  await deny(()=>bridge.applyReviewedPassageR36({
    selection,writer:{...scope},gesture,
    fictionalSingleSectionWork:false as never,
  }),'multisection_must_not_flatten');
  const passageApplied=await bridge.applyReviewedPassageR36({
    selection,writer:{...scope},gesture,
    fictionalSingleSectionWork:true,
  });
  ok(passageApplied.releaseApproved===false &&
     passageApplied.kind==='fictional_applied_only' &&
     passageApplied.review.sectionId===sectionId,
    'selected passage bridged into R33 under fictional one-section Work only');
  const applied=passageApplied.view;
  ok(applied.manifest.generation===3 && applied.action==='apply' &&
    applied.text===proposedText && applied.previousText===savedText &&
    applied.manifest.previousSHA256===second.manifest.cipherSHA256,
    'explicit synthetic author approved Apply with previous text preserved');
  const undone=await store.undoLastApplyR33({...scope,
    expectedGeneration:3,expectedSHA256:applied.textSHA256});
  ok(undone.manifest.generation===4 && undone.action==='undo' &&
    undone.text===savedText && undone.previousText===proposedText &&
    undone.manifest.previousSHA256===applied.manifest.cipherSHA256,
    'author Undo restores exact saved text as append-only version');
  const reopenedApply=await store.reopenDraftR33({...scope,generation:3});
  const reopenedUndo=await store.reopenDraftR33({...scope,generation:4});
  ok(reopenedApply.text===proposedText && reopenedUndo.text===savedText,
    'both Apply and Undo reopen separately and byte-exactly');
  const file=join(root,'vault',applied.manifest.cipherRef);
  const cipher=readFileSync(file);
  ok(sha(cipher)===applied.manifest.cipherSHA256 &&
     !cipher.includes(Buffer.from(proposedText)) &&
     !cipher.includes(Buffer.from(savedText)),
    'file vault contains authenticated ciphertext rather than editor prose');
  const dump=cmd(['exec',name,'pg_dump','-Fp','-U','soullab','-d','postgres']);
  ok([initialText,savedText,proposedText].every(x=>!dump.includes(x)),
    'full fictional PostgreSQL dump excludes draft, proposed and undone content');
  await deny(()=>store.reopenDraftR33({
    ...scope,subject:{...subject,memberId:FOREIGN},generation:3}),
    'foreign_reopen');
  await deny(()=>store.saveDraftR33({
    ...scope,subject:{...subject,memberId:FOREIGN},
    expectedGeneration:4,expectedSHA256:undone.textSHA256,
    text:'foreign cannot edit'}),'foreign_save');
  await deny(()=>store.saveDraftR33({...scope,
    expectedGeneration:4,expectedSHA256:'f'.repeat(64),
    text:'incorrect proposed hash'}),'optimistic_digest_conflict');
  await deny(()=>store.undoLastApplyR33({...scope,
    expectedGeneration:4,expectedSHA256:undone.textSHA256}),
    'undo_twice_refused');
  await deny(()=>store.reopenDraftR33({...scope,generation:3,
    custody:{...authority,key:{keyId:key.keyId,keyBytes:randomBytes(32)}}}),
    'same_key_id_wrong_bytes');
  await deny(()=>store.reopenDraftR33({...scope,generation:4,
    custody:{...authority,independent:{minimumGeneration:11}}}),
    'stale_external_deletion_epoch');
  await deny(()=>store.reopenDraftR33({...scope,generation:4,
    custody:{...authority,...restoreAuth(10,[WORK])}}),
    'current_revoked_work');
  const raced=await Promise.allSettled([
    store.saveDraftR33({...scope,expectedGeneration:4,
      expectedSHA256:undone.textSHA256,text:'R33 racing author edit alpha'}),
    store.saveDraftR33({...scope,expectedGeneration:4,
      expectedSHA256:undone.textSHA256,text:'R33 racing author edit beta'}),
  ]);
  ok(raced.filter(x=>x.status==='fulfilled').length===1 &&
     raced.filter(x=>x.status==='rejected').length===1,
    'simultaneous conflicting saves yield exactly one committed version');
  negatives.push('concurrent_same_generation');
  const winner=raced.find(x=>x.status==='fulfilled');
  if(!winner || winner.status!=='fulfilled')throw Error('R33_NO_WINNER');
  const latest=await store.reopenDraftR33({...scope,generation:5});
  ok(latest.text===winner.value.text && latest.manifest.generation===5,
    'winning concurrent author save reopens without loss');
  const modified=Buffer.from(cipher);
  modified[Math.floor(modified.length/2)]^=0x04;
  writeFileSync(file,modified);
  await deny(()=>store.reopenDraftR33({...scope,generation:3}),
    'ciphertext_tamper');
  writeFileSync(file,cipher);
  const deleted=spawnSync('docker',['exec',name,'psql','-XAtq',
    '-v','ON_ERROR_STOP=1','-U','soullab','-d','postgres',
    '-c',"DELETE FROM writers_studio_r23_held_history WHERE manuscript_id='"+WORK+"'"],
    {encoding:'utf8'});
  ok(deleted.status!==0,'direct SQL history deletion refused by immutable trigger');
  negatives.push('sql_delete_immutable');
  await close(); close=undefined;
  cmd(['kill','--signal=SIGKILL',name]);
  cmd(['start',name]);
  waitReady();
  ok(psql("SELECT count(*) FROM writers_studio_r23_held_history WHERE member_id='"+MEMBER+"' AND manuscript_id='"+WORK+"'") === '5',
    'real PG16 SIGKILL/restart preserves five immutable generations');
  ok(existsSync(file) && sha(readFileSync(file))===applied.manifest.cipherSHA256,
    'vault ciphertext digest remains intact after DB restart');
  const cold=await new Promise<boolean>((resolve,reject)=>{
    const child=fork(join(process.cwd(),'scripts/ops/wsBetaR33ColdReopen.ts'),[],{
      execArgv:process.execArgv,
      silent:true,
      env:{
        PATH:process.env.PATH||'/usr/bin:/bin',
        DATABASE_URL:process.env.DATABASE_URL!,
        FILE_STORAGE_PATH:process.env.FILE_STORAGE_PATH!,
        R23_VAULT_HISTORY_FIXTURE:'fictional-only',
        R33_EDITORIAL_HISTORY_FIXTURE:'fictional-only',
        R33_COLD_CHILD_FIXTURE:'fictional-only',
      },
    });
    let finished=false;
    const timer=setTimeout(()=>{
      if(finished)return;
      finished=true;child.kill('SIGKILL');reject(Error('R33_COLD_CHILD_TIMEOUT'));
    },15000);
    child.on('message',(msg:any)=>{
      if(finished)return;
      finished=true;clearTimeout(timer);
      resolve(msg?.kind==='r33_cold_fixture_result'&&msg?.passed===true);
    });
    child.on('error',err=>{
      if(finished)return;
      finished=true;clearTimeout(timer);reject(err);
    });
    child.on('exit',()=>{
      if(finished)return;
      finished=true;clearTimeout(timer);reject(Error('R33_COLD_CHILD_EARLY_EXIT'));
    });
    child.send({
      subject,workId:WORK,generation:4,expectedText:savedText,
      keyId:key.keyId,keyBase64:key.keyBytes.toString('base64'),
      signedDeletion:deletion.signedDeletion,
      signerPublicPEM:deletion.trustedSigner.export({type:'spki',format:'pem'}),
      independentMinimum:deletion.independent.minimumGeneration,
    },err=>{
      if(err&&!finished){finished=true;clearTimeout(timer);reject(err);}
    });
  });
  ok(cold,'fresh Node/tsx process reopens exact author Undo after PG16 crash/restart');
}
(async()=>{
 try{await main();}
 catch(e){fail=String((e as Error)?.message||e).slice(0,500);process.exitCode=2;}
 finally{
  if(close)await close().catch(()=>undefined);
  if(started){
    try{cmd(['rm','-fv',name],55000);started=false;}
    catch(e){fail=(fail||'')+'; cleanup_failed';process.exitCode=2;}
  }
  if(!started)rmSync(root,{recursive:true,force:true});
  const receipt={status:fail?'HOLD_PHYSICAL_FAIL':'R36_PG16_ENCRYPTED_PASSAGE_APPLY_PASS_RELEASE_HELD',
    checks:checks.length,negatives,details:checks,postgresMajor:16,
    sourceHead:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),modelCalls:0,realMembers:0,realRuntimeEnabled:false,externalKeyCustodianInstalled:false,
    containerRemoved:!started,tempFilesRemoved:!existsSync(root),error:fail};
  writeFileSync(evidence,JSON.stringify(receipt,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({status:receipt.status,checks:checks.length,negatives,
    containerRemoved:receipt.containerRemoved,filesRemoved:receipt.tempFilesRemoved,error:fail,
    evidence},null,2));
 }
})();
