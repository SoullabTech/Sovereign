/**
 * R35 — physical PG16 / immutable file-vault draft + idempotency acceptance.
 *
 * Synthetic author data, temp PostgreSQL and ephemeral Ed25519 signer ONLY.
 * Uses existing code and review-only SQL schema without production migration.
 */
import {spawnSync} from 'node:child_process';
import {createHash,generateKeyPairSync,randomBytes,randomUUID,sign} from 'node:crypto';
import {existsSync,mkdtempSync,mkdirSync,readdirSync,readFileSync,rmSync,writeFileSync}
 from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {canonicalDeletionPayload,type DeletionHighwaterV1}
 from '../../lib/writersStudio/recovery/deletionBarrierV1';

if(process.env.R35_PROTECTED_DRAFT_FIXTURE!=='fictional-only' ||
   process.env.R35_PHYSICAL_PG16_FIXTURE!=='fictional-only')
 throw Error('R35_EXACT_FICTIONAL_ONLY_OPT_IN_REQUIRED');
const P='ws-r35-protected-'+randomUUID().slice(0,11);
const root=mkdtempSync(join(tmpdir(),'ws-r35-physical-'));
const vault=join(root,'vault');mkdirSync(vault);
const EVIDENCE='/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R35_PG16_ENCRYPTED_DRAFT_LEDGER_20261016.json';
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const W1='33333333-3333-4333-8333-333333333333';
const W2='44444444-4444-4444-8444-444444444444';
const S1='55555555-5555-4555-8555-555555555551';
const S2='55555555-5555-4555-8555-555555555552';
const SENTINEL='R35 FICTIONAL WRITER AUTHOR SECRET IN ENCRYPTED VAULT';
const SECRET_NOTE='R35 fictional private checkpoint note';
const KEY='writer-private-client-idempotency-secret';
const checks:string[]=[],negatives:string[]=[];
let error:string|null=null,started=false,close:undefined|(()=>Promise<void>),port='';
const hash=(v:Buffer)=>createHash('sha256').update(v).digest('hex');
function cmd(argv:string[],permitFailure=false):{code:number|null;out:string;err:string}{
 const x=spawnSync('docker',argv,{
  encoding:'utf8',timeout:55000,maxBuffer:16*1024*1024});
 if((x.status!==0||x.error)&&!permitFailure)
  throw Error('R35_DOCKER_OPERATION_HOLD_'+argv[0]+':'+String(x.stderr||x.error).slice(-190));
 return {code:x.status,out:x.stdout||'',err:x.stderr||''};
}
const pg=(sql:string)=>cmd(['exec',P,'psql','-XAtq','-v','ON_ERROR_STOP=1',
 '-U','fict','-d','r35_draft','-c',sql]).out.trim();
function ok(x:unknown,label:string){
 if(!x)throw Error('R35_CHECK_FAILED_'+label);
 checks.push(label);
}
async function deny(task:()=>Promise<unknown>,label:string){
 let rejected=false;
 try{await task();}catch{rejected=true;}
 ok(rejected,'refused '+label);negatives.push(label);
}
async function ready(){
 for(let i=0;i<100;i++){
  const x=cmd(['exec',P,'psql','-XAtq','-U','fict','-d','r35_draft','-c','SELECT 1'],true);
  const pid=cmd(['exec',P,'cat','/proc/1/comm'],true);
  if(x.code===0&&x.out.trim()==='1'&&pid.code===0&&pid.out.trim()==='postgres')return;
  await new Promise(resolve=>setTimeout(resolve,200));
 }
 throw Error('R35_STABLE_POSTGRES_16_START_HOLD');
}
const who=(memberId:string)=>({memberId,assertedBy:'server_verified_member_session' as const});
async function main(){
 cmd(['run','--pull','never','-d','--name',P,
  '--network','bridge','--memory','900m','--cpus','1','--pids-limit','160',
  '--security-opt','no-new-privileges',
  '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=512m',
  '-p','127.0.0.1::5432',
  '-e','POSTGRES_USER=fict','-e','POSTGRES_DB=r35_draft',
  '-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:16.13']);
 started=true;await ready();
 const binding=cmd(['port',P,'5432/tcp']).out.trim();
 const match=/^127\.0\.0\.1:(\d+)$/.exec(binding);
 if(!match)throw Error('R35_REFUSED_NON_LOOPBACK_DB_PORT');
 port=match[1];
 ok(pg('SHOW server_version_num').startsWith('160'), 'actual PG16 server stable');
 const isolation=JSON.parse(cmd(['inspect',P]).out)[0];
 ok(isolation.HostConfig.PortBindings?.['5432/tcp']?.[0]?.HostIp==='127.0.0.1'&&
    isolation.HostConfig.Binds===null,
    'isolated disposable SQL, no production mount and localhost-only port');
 pg(`CREATE TABLE members(id uuid PRIMARY KEY);
 CREATE TABLE member_manuscripts(id uuid PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id));
 INSERT INTO members VALUES ('${A}'),('${B}');
 INSERT INTO member_manuscripts VALUES ('${W1}','${A}'),('${W2}','${A}');`);
 const ddl=join(process.cwd(),'docs/ops/WS_R35_ENCRYPTED_DRAFT_LEDGER_REVIEW_ONLY.sql');
 cmd(['cp',ddl,P+':/tmp/r35_review.sql']);
 cmd(['exec',P,'psql','-XAtq','-v','ON_ERROR_STOP=1',
   '-U','fict','-d','r35_draft','-f','/tmp/r35_review.sql']);
 ok(pg('SELECT count(*) FROM writers_studio_r35_draft_heads')==='0',
   'review-only plaintext-free metadata schema initially empty');
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:'+port+'/r35_draft';
 process.env.FILE_STORAGE_PATH=vault;
 const store=await import('../../lib/writersStudio/recovery/heldProtectedDraftR35');
 const db=await import('../../lib/db/postgres');
 close=()=>db.closePool();
 ok(store.R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED===false,
   'real member draft writing compile-time disabled');
 const pair=generateKeyPairSync('ed25519');
 const key={keyId:randomUUID(),keyBytes:randomBytes(32)};
 const cp:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',
  stream:'writers-studio-beta',generation:100,revokedWorks:[],revokedKeyIds:[],
 };
 const signedDeletion={checkpoint:cp,signature:sign(
  null,canonicalDeletionPayload(cp),pair.privateKey).toString('base64')};
 const custody={key,signedDeletion,trustedSigner:pair.publicKey,
   independent:{minimumGeneration:100}};
 const scope={subject:who(A),workId:W1,custody};
 const initial=await store.beginHeldDraftR35({...scope,content:SENTINEL+' first draft'});
 ok(initial.generation===1&&initial.checkpointCount===0,
   'first encrypted draft and metadata-only Work head saved');
 const opened=await store.reopenHeldDraftR35({...scope,generation:1});
 ok(opened.content===SENTINEL+' first draft'&&opened.sections.length===0,
   'encrypted first text reopens byte-identically');
 const request={kind:'save' as const,
  body:{content:SENTINEL+' saved version',checkpoint:false,
   baseRevisionId:1,idempotencyKey:KEY}};
 const second=await store.changeHeldDraftR35({...scope,operation:request});
 ok(second.generation===2&&second.checkpointCount===0,
   'autosave version without implicit checkpoint');
 const countBefore=pg('SELECT count(*) FROM writers_studio_r35_draft_versions');
 const replay=await store.changeHeldDraftR35({...scope,operation:request});
 ok(replay.status==='replayed'&&replay.generation===2&&
    pg('SELECT count(*) FROM writers_studio_r35_draft_versions')===countBefore,
   'duplicate request replay does not add another author version');
 await deny(()=>store.changeHeldDraftR35({...scope,
  operation:{kind:'save',body:{...request.body,content:'changed with same key'}}}),
  'idempotency-key reuse with different author content');
 await deny(()=>store.changeHeldDraftR35({...scope,
  operation:{kind:'save',body:{content:'stale',baseRevisionId:1,
    idempotencyKey:'stale-base'}}}),
  'stale autosave version');
 await deny(()=>store.changeHeldDraftR35({...scope,
  operation:{kind:'checkpoint',headers:{baseRevision:'2',idempotencyKey:'plain-cp'}}}),
  'plain draft cannot pretend to be section-addressable checkpoint');
 const noted=await store.changeHeldDraftR35({...scope,
  operation:{kind:'save',body:{content:SENTINEL+' checkpoint content',
    checkpoint:true,note:SECRET_NOTE,baseRevisionId:2,idempotencyKey:'writer-cp-note'}}});
 ok(noted.generation===3&&noted.checkpointCount===1,
   'author note and checkpoint are encrypted in same revision');
 const restored=await store.changeHeldDraftR35({...scope,
  operation:{kind:'restore',body:{revisionNumber:1,baseRevisionId:3,
    idempotencyKey:'restore-initial'}}});
 ok(restored.generation===4&&restored.checkpointCount===2 &&
   (await store.reopenHeldDraftR35({...scope,generation:4})).content===
     SENTINEL+' first draft',
   'restore previous exact version via immutable new encrypted generation');
 await deny(()=>store.reopenHeldDraftR35({
  ...scope,subject:who(B),generation:3}),'foreign revision read');
 await deny(()=>store.changeHeldDraftR35({...scope,subject:who(B),
  operation:{kind:'save',body:{content:'unowned',baseRevisionId:4,
   idempotencyKey:'foreign'}}}),'foreign author Save');
 await deny(()=>store.reopenHeldDraftR35({...scope,generation:3,
  custody:{...custody,key:{keyId:key.keyId,keyBytes:randomBytes(32)}}}),
  'same id but wrong decryption key');
 await deny(()=>store.reopenHeldDraftR35({...scope,generation:3,
  custody:{...custody,independent:{minimumGeneration:101}}}),
  'stale independent deletion epoch');
 const revoked={...cp,revokedWorks:[W1]};
 const revokedSignature=sign(null,canonicalDeletionPayload(revoked),
  pair.privateKey).toString('base64');
 await deny(()=>store.reopenHeldDraftR35({...scope,generation:3,
  custody:{...custody,signedDeletion:{
   checkpoint:revoked,signature:revokedSignature}}}),
  'independently signed revoked Work');
 const raced=await Promise.allSettled([
  store.changeHeldDraftR35({...scope,operation:{
   kind:'save',body:{content:SENTINEL+' RACE A',baseRevisionId:4,
     idempotencyKey:'race-A'}}}),
  store.changeHeldDraftR35({...scope,operation:{
   kind:'save',body:{content:SENTINEL+' RACE B',baseRevisionId:4,
     idempotencyKey:'race-B'}}}),
 ]);
 ok(raced.filter(x=>x.status==='fulfilled').length===1 &&
    raced.filter(x=>x.status==='rejected').length===1,
   'real PostgreSQL Work lock yields only one racing Save');
 negatives.push('concurrent competing writer Save');
 const latest=await store.reopenHeldDraftR35({...scope,generation:5});
 ok(latest.content.includes('RACE '),'winning revision reopens author content');
 const historicReplay=await store.changeHeldDraftR35({...scope,operation:request});
 ok(historicReplay.status==='replayed'&&historicReplay.generation===2&&
    pg(`SELECT generation FROM writers_studio_r35_draft_heads
       WHERE work_id='${W1}'`)==='5',
    'early idempotent retry remains a replay across later protected generations');

 const sscope={subject:who(A),workId:W2,custody};
 const a=[{id:S1,text:'fictional section one\n\n'},
          {id:S2,text:'fictional section two'}];
 await store.beginHeldDraftR35({...sscope,sections:a});
 const sectionsSaved=await store.changeHeldDraftR35({...sscope,operation:{
  kind:'save',body:{sections:[{id:S1,text:'writer edited A\n\n'},
    {id:S2,text:'writer edited B'}],baseRevisionId:1,
    idempotencyKey:'section-write'}}});
 ok(sectionsSaved.generation===2&&
   (await store.reopenHeldDraftR35({...sscope,generation:2})).sections[0].id===S1,
   'section-aware encrypted Save retains author section identity/order');
 for(const [label,bad] of [
  ['missing section',[{id:S1,text:'changed'}]],
  ['reordered section',[{id:S2,text:'B'},{id:S1,text:'A'}]],
  ['unowned id',[{id:randomUUID(),text:'A'},{id:S2,text:'B'}]],
 ] as const){
  await deny(()=>store.changeHeldDraftR35({...sscope,operation:{
   kind:'save',body:{sections:bad,baseRevisionId:2,
    idempotencyKey:'wrong-'+label}}}),label);
 }
 await deny(()=>store.changeHeldDraftR35({...sscope,operation:{
  kind:'save',body:{sections:a,content:'ambiguous',baseRevisionId:2,
    idempotencyKey:'ambiguous'}}}),'ambiguous whole text + section state');
 const cp2=await store.changeHeldDraftR35({...sscope,operation:{
  kind:'checkpoint',headers:{baseRevision:'2',idempotencyKey:'header-only'}}});
 ok(cp2.generation===3&&cp2.checkpointCount===1,
   'header-only checkpoint freezes section identities inside ciphertext');
 const revert=await store.changeHeldDraftR35({...sscope,operation:{
  kind:'restore',body:{revisionNumber:1,baseRevisionId:3,
   idempotencyKey:'back-to-first-section-state'}}});
 ok(revert.generation===4&&revert.checkpointCount===2&&
   (await store.reopenHeldDraftR35({...sscope,generation:4})).content===
   a.map(s=>s.text).join(''),
   'restore exact previous source section partition with no inference');
 const plaintext=[SENTINEL,SECRET_NOTE,'writer edited A','writer edited B',
  'RACE A','RACE B',KEY];
 const dump=cmd(['exec',P,'pg_dump','-Fp','-U','fict','-d','r35_draft']).out;
 ok(plaintext.every(s=>!dump.includes(s)),
   'whole PG16 dump excludes author text, private notes and raw idempotency key');
 const encFiles=readdirSync(join(vault,store.R35_VAULT_NAMESPACE)).filter(x=>x.endsWith('.enc'));
 ok(encFiles.length>=9&&encFiles.every(name=>{
  const bytes=readFileSync(join(vault,store.R35_VAULT_NAMESPACE,name));
  return plaintext.every(secret=>!bytes.includes(Buffer.from(secret)));
 }), 'immutable vault holds ciphertext, never plaintext sentinels');
 ok(pg('SELECT count(*) FROM writers_studio_r35_draft_receipts')==='7',
   'structural HMAC-bound idempotency receipts committed exactly once');
 const immutable=cmd(['exec',P,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','r35_draft','-c',
  `UPDATE writers_studio_r35_draft_versions SET cipher_sha256='${'0'.repeat(64)}'
   WHERE work_id='${W1}' AND generation=2`],true);
 ok(immutable.code!==0,'SQL ciphertext version UPDATE blocked by trigger');
 negatives.push('manual revision mutation refused');
 // R35 orphan policy is HOLD: deliberately fail after ciphertext fsync, before
 // SQL receipt COMMIT; verified SQL state remains stable, orphan is encrypted.
 pg(`CREATE FUNCTION r35_synthetic_reject_receipt() RETURNS trigger
  LANGUAGE plpgsql AS $f$ BEGIN RAISE EXCEPTION 'synthetic forced rollback';
  END $f$;
  CREATE TRIGGER r35_fixture_reject_receipt BEFORE INSERT
  ON writers_studio_r35_draft_receipts FOR EACH ROW
  EXECUTE FUNCTION r35_synthetic_reject_receipt();`);
 const beforeOrphans=readdirSync(join(vault,store.R35_VAULT_NAMESPACE)).length;
 await deny(()=>store.changeHeldDraftR35({...scope,operation:{
  kind:'save',body:{content:SENTINEL+' orphan requires custody review',
  baseRevisionId:5,idempotencyKey:'synthetic-rollback'}}}),
  'forced SQL receipt exception rolls back manifest/head');
 ok(pg(`SELECT generation FROM writers_studio_r35_draft_heads
   WHERE work_id='${W1}'`)==='5'&&
   pg(`SELECT count(*) FROM writers_studio_r35_draft_versions
   WHERE work_id='${W1}'`)==='5',
  'rolled-back DB state retains original version and receipt count');
 ok(readdirSync(join(vault,store.R35_VAULT_NAMESPACE)).length>beforeOrphans,
  'encrypted orphan is visible for future governed reconciliation');
 pg('DROP TRIGGER r35_fixture_reject_receipt ON writers_studio_r35_draft_receipts; DROP FUNCTION r35_synthetic_reject_receipt()');
 state.status='R35_FICTIONAL_PG16_ENCRYPTED_DRAFT_LEDGER_PASS_REAL_BETA_HOLD';
}
const state={status:'HOLD' as string,errors:null as string|null,
 checks,negatives,sourceHead:null as string|null,postgresVersion:16,
 cleanContainer:false,cleanTemp:false,realMembersTouched:0,
 providerCalls:0,mailCalls:0,productionChanged:false,realWriterEnabled:false};
(async()=>{
 try{await main();}
 catch(e){
  state.errors=String((e as {code?:string})?.code||(e as Error)?.message||e).slice(0,210);
  process.exitCode=2;
 }finally{
  if(close)await close().catch(()=>undefined);
  if(started){
   const removed=cmd(['rm','-fv',P],true);
   state.cleanContainer=removed.code===0;
  }else state.cleanContainer=true;
  rmSync(root,{recursive:true,force:true});
  state.cleanTemp=!existsSync(root);
  state.sourceHead=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();
  writeFileSync(EVIDENCE,JSON.stringify(state,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({status:state.status,checks:checks.length,
   negativeControls:negatives,sourceHead:state.sourceHead,
   clean:state.cleanContainer&&state.cleanTemp,error:state.errors,realRelease:'HOLD'}));
  if(state.status!=='R35_FICTIONAL_PG16_ENCRYPTED_DRAFT_LEDGER_PASS_REAL_BETA_HOLD'||
     !state.cleanContainer||!state.cleanTemp)process.exitCode=2;
 }
})();
