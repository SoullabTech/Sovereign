/**
 * R106 physical fixture ONLY: stage fake erasure, inspect real PostgreSQL and
 * filesystem state, and remove ONLY a known synthetic hardlink obstruction.
 *
 * Never opens member files or logs SQL rows, vault paths, prose or credentials.
 * Production erasure is NOT enabled; current Source code remains unchanged.
 */
import {createHash} from 'node:crypto';
import {link,lstat,unlink,readFile} from 'node:fs/promises';
import path from 'node:path';
import {query,closePool} from '../../lib/db/postgres';
import {writeVaultBytes} from '../../lib/storage/fileVault';

const marker='R106_FICTIONAL_ONLY_ERASURE';
const dir=process.env.FILE_STORAGE_PATH||'';
const approvedRoot=/^\/private\/tmp\/ws-r106-fictional-[a-f0-9]{8}\/vault$/;
const approvedDb=/^postgresql:\/\/(?:fict|ws_r106_eraser)@127\.0\.0\.1:\d{2,5}\/ws_r106$/;
const f='r106/fake-original.txt',sentinel='r106/sentinel.txt';
const file=()=>path.join(dir,f);
const extra=()=>path.join(dir,'r106','original-hardlink-test-only.txt');
const sentinelFile=()=>path.join(dir,sentinel);
const count=async()=>Number((await query<{n:string}>(
  'SELECT count(*)::int AS n FROM vault_erasure_queue')).rows[0]?.n??-1);
const exists=async(p:string)=>lstat(p).then(()=>true).catch(e=>{
  if((e as NodeJS.ErrnoException).code==='ENOENT')return false;
  throw e;
});
const refuse=(code:string):never=>{throw Error('R106_REFUSED_'+code);};
async function main(){
  if(process.env.WS_R106_ERASURE_FIXTURE!=='fictional-only'||
    !approvedRoot.test(dir)||!approvedDb.test(process.env.DATABASE_URL||'')||
    process.env.NODE_ENV!=='test')refuse('UNTRUSTED_SCOPE');
  const mode=process.argv[2];
  if(!['stage','failed','repair','recovered'].includes(mode)||process.argv.length!==3)
    refuse('MODE');
  let outcome:Record<string,unknown>={protocol:'r106.fixture.v1',phase:mode};
  if(mode==='stage'){
    if(await count()!==0||await exists(file())||await exists(extra()))
      refuse('STALE_FIXTURE');
    const a=await writeVaultBytes('r106','fake-original','txt',
      Buffer.from(marker+'_FAKE_BODY_NOT_MEMBER'));
    await writeVaultBytes('r106','sentinel','txt',
      Buffer.from(marker+'_SENTINEL_KEEP'));
    if(a!==f)refuse('SOURCE_REF');
    // nlink=2 is intentionally unsafe: actual fileVault must refuse unlink.
    await link(file(),extra());
    if((await lstat(file())).nlink!==2)refuse('LINK_CONTROL');
    // One PostgreSQL autocommit INSERT: no fake transaction across
    // different pool connections, no Work/user data, and no SQL sidecar.
    await query('INSERT INTO vault_erasure_queue (artifact_ref) VALUES ($1)',[f]);
    if(await count()!==1)refuse('QUEUE_NOT_COMMITTED');
    outcome.queueCommitted=true;outcome.fakeHardlinkObstructsDeletion=true;
  }else if(mode==='failed'){
    const q=await query<{attempts:number;last_error:string}>(
      'SELECT attempts,last_error FROM vault_erasure_queue');
    if(q.rows.length!==1||q.rows[0].attempts<1||
       q.rows[0].last_error!=='UNKNOWN'||!await exists(file())||
       !await exists(extra())||!await exists(sentinelFile()))
       refuse('OWED_ERASURE_NOT_DURABLE');
    outcome.failedAttemptRetained=true;
    outcome.errnoOnly=true;
    outcome.retryCount=q.rows[0].attempts;
  }else if(mode==='repair'){
    if(await count()!==1||!await exists(extra())||
      (await lstat(file())).nlink!==2)refuse('MISSING_OWNED_FAILURE');
    // Only the known fixture-created second hardlink is removed. The
    // original is left for the separate autonomous erasure worker.
    await unlink(extra());
    if((await lstat(file())).nlink!==1)refuse('OBSTRUCTION_NOT_FIXED');
    outcome.testObstructionCleared=true;
  }else{
    if(await count()!==0||await exists(file())||await exists(extra())||
       !await exists(sentinelFile()))refuse('NOT_ACTUALLY_RECOVERED');
    const bytes=await readFile(sentinelFile());
    if(createHash('sha256').update(bytes).digest('hex')!==
       createHash('sha256').update(marker+'_SENTINEL_KEEP').digest('hex'))
       refuse('OTHER_FILES_MODIFIED');
    outcome.owedRecordGone=true;
    outcome.originalBytesGone=true;
    outcome.unrelatedSentinelPreserved=true;
  }
  outcome.productionApproved=false;
  console.log(JSON.stringify(outcome));
}
main().catch(e=>{
  // Log ONLY controlled refusal codes; never print SQL, vault paths,
  // object values or Error.message from a filesystem/PG driver.
  const code=e instanceof Error&&e.message.startsWith('R106_REFUSED_')
   ?e.message:'UNQUALIFIED_FAILURE';
  console.error(code);
  process.exitCode=2;
}).finally(async()=>{await closePool().catch(()=>{});});
