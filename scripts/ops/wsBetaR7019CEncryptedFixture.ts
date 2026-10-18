/**
 * R70.19C -- FICTIONAL ONLY coherent SQL snapshot + vault ciphertext
 * and fresh-PG16-and-vault cold restore. This is a same-Mac fixture, NOT
 * evidence for an independent-host production restore or erasure authority.
 *
 * The caller MUST hold the accepted writer's advisory lease and an active
 * REPEATABLE READ transaction when calling capture(). PostgreSQL's exported
 * snapshot is passed to pg_dump on a different connection. No plaintext
 * SQL dump or tar archive is stored on disk: only encrypted output.
 */
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,statSync,
  renameSync,rmSync,readdirSync,existsSync,chmodSync,realpathSync,lstatSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type {Client} from 'pg';
import {
 assertHeldR7019EPreDecryptAdmission,
 type R7019ESignedCensus,type R7019ECurrentExternalAuthority,
} from '../../lib/writersStudio/recovery/heldR7019EPreDecryptErasureGate';
import {
 matchR7019FRestoredFictionalWorkIndex,
 type R7019FFixtureWorkIdentity,
} from '../../lib/writersStudio/recovery/heldR7019FActualPgCensus';

const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const proto='soullab.ws.r70.19c.fict-coherent-point.v1';
const reject=(reason:string):never=>{throw Error('R7019C_SEALED_REFUSED_'+reason);};
const run=(cmd:string,args:string[],input?:Buffer,timeout=40000)=>{
 const r=spawnSync(cmd,args,{input,encoding:null,timeout,
  maxBuffer:32*1024*1024,env:{PATH:process.env.PATH||'/usr/bin:/bin',
    HOME:process.env.HOME||'/private/tmp',GNUPGHOME:process.env.GNUPGHOME||''}});
 if(r.status!==0||r.error)reject(cmd+'_EXIT_'+r.status);
 return r.stdout as Buffer;
};
export type R7019FPreDecryptProof={
 readonly signedCensus:R7019ESignedCensus;
 readonly external:R7019ECurrentExternalAuthority;
};
type Scope={
  sourceCount:number;claimedSourceCount:number;unclaimedSourceCount:number;
  originalFileCount:number;draftCount:number;keepCount:number;
  draftDigests:readonly string[];originalDigests:readonly string[];
};
type Point={
 path:string;sql:string;vault:string;
 head:string;dbHash:string;vaultHash:string;dbSize:number;vaultSize:number;
 scope:Scope;vaultFiles:Record<string,string>;
};
/** Rejects incomplete, loose-permission, drifted or forged-status fictional
 * recovery generations. These are SHA-256 integrity checks, NOT proof of a
 * signed-manifest author or independent deletion-highwater authority. */
export function verifyR7019CFictionalCompletePoint(dir:string,head:string){
 const resolved=path.resolve(dir);
 const name=path.basename(resolved);
 const marker=/^complete-([a-f0-9]{12})$/.exec(name);
 if(!resolved.startsWith('/Volumes/T7 Shield/ws-beta-r7019c-')||
    !marker||!/^[a-f0-9]{40}$/.test(head))reject('verifier_scope');
 const own=lstatSync(resolved);
 if(!own.isDirectory()||own.isSymbolicLink()||own.mode%512!==0o700||
    realpathSync(resolved)!==resolved)reject('verifier_dir_permissions');
 const accepted=['database.pgdump.gpg','vault.tar.gpg','manifest.json'];
 const entries=readdirSync(resolved);
 if(entries.length!==accepted.length||
    entries.some(e=>!accepted.includes(e)))reject('incomplete_generation');
 const manifest=JSON.parse(readFileSync(path.join(resolved,'manifest.json'),'utf8'));
 if(manifest.protocol!==proto||manifest.head!==head||
    manifest.generation!==marker[1]||manifest.releaseApproved!==false||
    manifest.offsiteKeyCustodyCertified!==false||
    manifest.completeWriterCoverageCertified!==false||
    manifest.externalErasureAuthorityVerified!==false||
    manifest.sourceDatabaseVaultTransactionIsolated!==true)
   reject('untrusted_generation_manifest');
 for(const [k,file] of [['sql','database.pgdump.gpg'],['vault','vault.tar.gpg']] as const){
  const item=manifest[k];
  if(!item||item.name!==file||!/^[a-f0-9]{64}$/.test(item.sha256)||
     !Number.isSafeInteger(item.bytes)||item.bytes<100)reject('invalid_cipher_descriptor');
  const p=path.join(resolved,file),st=lstatSync(p);
  if(!st.isFile()||st.isSymbolicLink()||st.mode%512!==0o600||
     realpathSync(p)!==p)reject('weak_cipher_file_permissions');
  const cipher=readFileSync(p);
  if(cipher.length!==item.bytes||sha(cipher)!==item.sha256||
     cipher.includes(Buffer.from('FICTIONAL')))reject('ciphertext_integrity_failure');
 }
 const manifestStat=lstatSync(path.join(resolved,'manifest.json'));
 if(!manifestStat.isFile()||manifestStat.isSymbolicLink()||
    manifestStat.mode%512!==0o600)reject('manifest_permissions');
 return Object.freeze({status:'R7019C_COMPLETE_CIPHERTEXT_POINT_VALID_HELD',
  head,hasDatabaseCiphertext:true,hasVaultCiphertext:true,
  containsIndependentErasureAuthority:false,
  signedManifestAuthorityCertified:false,
  productionRestoreApproved:false,realMemberAdmissionApproved:false});
}

export class R7019CEncryptedFixture {
 readonly source:string;readonly evidence:string;readonly nonce:string;
 readonly sourceVault:string;
 readonly keyRoot:string;readonly privateHome:string;readonly writerHome:string;
 readonly restoreName:string;
 private fpr='';
 private point:Point|null=null;
 private restored=false;
 constructor(args:{source:string;evidence:string;nonce:string;sourceVault:string}){
  const {source,evidence,nonce,sourceVault}=args;
  if(!/^ws-r7019b-fixture-[0-9a-f]{12}$/.test(source)||
     !/^\/Volumes\/T7 Shield\/ws-beta-r7019c-[a-z0-9-]+$/.test(evidence)||
     !/^[a-f0-9]{12}$/.test(nonce)||
     sourceVault!=='/private/tmp/ws-r7019b-fixture-'+nonce+'/vault')
    reject('untrusted_fixture_identifiers');
  this.source=source;this.evidence=evidence;this.nonce=nonce;
  this.sourceVault=sourceVault;
  this.keyRoot=mkdtempSync(path.join(os.tmpdir(),'ws-r7019c-key-'));
  this.privateHome=path.join(this.keyRoot,'independent-private-recovery');
  this.writerHome=path.join(this.keyRoot,'public-only-writer');
  this.restoreName='ws-r7019c-rest-'+nonce;
  mkdirSync(this.privateHome,{mode:0o700});
  mkdirSync(this.writerHome,{mode:0o700});
 }
 private initPublicWriter(){
  const uid='R7019C Fictional Backup Recovery <r7019c-fixture.invalid>';
  run('gpg',['--batch','--no-tty','--homedir',this.privateHome,
    '--pinentry-mode','loopback','--passphrase','','--quick-generate-key',
    uid,'rsa2048','encr','0'],undefined,55000);
  const rows=run('gpg',['--batch','--homedir',this.privateHome,
    '--with-colons','--list-keys',uid]).toString('utf8').split('\n');
  const fps=rows.map(x=>x.split(':')).filter(a=>a[0]==='fpr').map(a=>a[9]);
  if(fps.length!==1||!/^[A-F0-9]{40}$/.test(fps[0]))reject('fingerprint');
  this.fpr=fps[0];
  const pub=run('gpg',['--batch','--homedir',this.privateHome,'--export',this.fpr]);
  run('gpg',['--batch','--homedir',this.writerHome,'--import'],pub);
  const secrets=run('gpg',['--batch','--homedir',this.writerHome,
    '--with-colons','--list-secret-keys']);
  if(secrets.toString('utf8').includes('sec:'))reject('writer_has_private_key');
 }
 private encrypt(src:Buffer,dest:string){
  run('gpg',['--batch','--no-tty','--homedir',this.writerHome,
    '--trust-model','always','--cipher-algo','AES256','--encrypt',
    '--recipient',this.fpr,'--output',dest],src);
  chmodSync(dest,0o600);
 }
 private decrypt(filename:string){
  return run('gpg',['--batch','--no-tty','--homedir',this.privateHome,
    '--decrypt',filename],undefined,45000);
 }
 /** ALWAYS invoked while the caller owns the R70.19B session lock and
  * active READ ONLY REPEATABLE READ SQL transaction. The exported snapshot
  * ID forces pg_dump to see the EXACT same DB point as the vault audit.
  * The lease prevents participating filesystem mutations until encryption
  * and atomic generation publication are complete. */
 async capture(client:Client,scope:Scope,head:string):Promise<Point>{
  if(this.point||!head||!scope||!Number.isInteger(scope.originalFileCount))
   reject('invalid_capture_invocation');
  const check=await client.query<{tx_isolation:string}>(
    "SELECT current_setting('transaction_isolation') AS tx_isolation");
  if(check.rows[0]?.tx_isolation!=='repeatable read')reject('wrong_pg_isolation');
  // pg_dump must never receive an exported SQL snapshot obtained outside
  // the *same* session holding the Source/Draft/file writer lease.
  const lock=await client.query<{n:number}>(`
    SELECT count(*)::int AS n FROM pg_locks
    WHERE pid=pg_backend_pid() AND locktype='advisory' AND granted
      AND objsubid=1
      AND classid=((hashtextextended($1::text,0) >> 32)::int::oid)
      AND objid=((hashtextextended($1::text,0) & 4294967295)::oid)`,
    ['soullab.ws.r70.17.writer-and-source-capture.v1']);
  if(lock.rows[0]?.n!==1)reject('writer_lease_not_held_by_snapshot_session');
  const exported=await client.query<{snapshot_id:string}>(
    'SELECT pg_export_snapshot() AS snapshot_id');
  const sid=exported.rows[0]?.snapshot_id;
  if(!sid||!/^[0-9A-F-]+$/.test(sid))reject('snapshot_not_exported');
  const entries=readdirSync(this.sourceVault,{withFileTypes:true});
  const valid=new Set(['manuscript-sources',
    '4b96fbc6-b36d-4fc1-9eb4-ebf286881b09']);
  if(entries.some(x=>!x.isDirectory()||x.isSymbolicLink()||!valid.has(x.name)))
   reject('foreign_vault_namespace');
  this.initPublicWriter();
  const root=path.join(this.evidence,'.r7019c.pending.'+this.nonce);
  const final=path.join(this.evidence,'complete-'+this.nonce);
  if(existsSync(root)||existsSync(final))reject('duplicate_generation');
  mkdirSync(root,{mode:0o700});
  try{
   const db=run('docker',['exec',this.source,'pg_dump','-U','fict',
     '-Fc','-d','ws_atomic','--snapshot='+sid],undefined,70000);
   if(db.length<100)reject('empty_database_dump');
   const vault=run('tar',['-C',this.sourceVault,'-cf','-','.']);
   if(vault.length<512)reject('empty_vault_tar');
   const sqlName=path.join(root,'database.pgdump.gpg');
   const vaultName=path.join(root,'vault.tar.gpg');
   this.encrypt(db,sqlName);
   this.encrypt(vault,vaultName);
   const dbCipher=readFileSync(sqlName),vaultCipher=readFileSync(vaultName);
   if(dbCipher.includes(Buffer.from('FICTIONAL'))||
      vaultCipher.includes(Buffer.from('FICTIONAL')))
    reject('unencrypted_fixture_text');
   const manifest={
    protocol:proto,head,generation:this.nonce,
    sql:{name:'database.pgdump.gpg',sha256:sha(dbCipher),bytes:dbCipher.length},
    vault:{name:'vault.tar.gpg',sha256:sha(vaultCipher),bytes:vaultCipher.length},
    scope:{sourceCount:scope.sourceCount,draftCount:scope.draftCount,
      claimedSourceCount:scope.claimedSourceCount,
      unclaimedSourceCount:scope.unclaimedSourceCount,
      originalFileCount:scope.originalFileCount,keepCount:scope.keepCount},
    releaseApproved:false,offsiteKeyCustodyCertified:false,
    completeWriterCoverageCertified:false,externalErasureAuthorityVerified:false,
    sourceDatabaseVaultTransactionIsolated:true,
   };
   writeFileSync(path.join(root,'manifest.json'),
     JSON.stringify(manifest,null,2)+'\n',{flag:'wx',mode:0o600});
   renameSync(root,final);
   const out:Record<string,string>={};
   const files=run('tar',['-C',this.sourceVault,'-cf','-','.']);
   const names=run('tar',['-tf','-'],files).toString('utf8').split('\n')
     .filter(x=>x && !x.endsWith('/'));
   for(const n of names){
    if(!n.startsWith('./')||n.includes('..')||path.isAbsolute(n))
      reject('unsafe_vault_file_in_tar');
    const data=readFileSync(path.join(this.sourceVault,n));
    out[n]=sha(data);
   }
   if(Object.keys(out).length!==scope.originalFileCount+1)
     reject('unrecognized_original_file_count');
   const p:Point={path:final,sql:path.join(final,'database.pgdump.gpg'),
     vault:path.join(final,'vault.tar.gpg'),head,
     dbHash:sha(dbCipher),vaultHash:sha(vaultCipher),
     dbSize:dbCipher.length,vaultSize:vaultCipher.length,scope,vaultFiles:out};
   this.point=p;return p;
  }catch(e){
   if(existsSync(root))rmSync(root,{recursive:true,force:true});
   throw e;
  }
 }
 restoreAfterOriginalDestroyed(authority?:R7019FPreDecryptProof):{
  restoredDBRows:number;restoredVaultFiles:number;
  digestMatch:boolean;privateWriterHasNoRecoveryKey:true;
  actualPostrestoreCanonicalWorkKeyCensusMatched:boolean;
  releasedForProduction:false;
 }{
  const p=this.point;
  if(!p||this.restored)reject('missing_or_repeated_restore');
  let expectedWorks:readonly R7019FFixtureWorkIdentity[]|null=null;
  if(process.env.R7019F_CENSUS_FIXTURE==='fictional-only'){
   // No private GPG key read, Docker operation or recovered byte can
   // occur before this exact-current external authorization succeeds.
   if(process.env.NODE_ENV!=='test'||!authority)
    reject('r7019f_mandatory_predecrypt_authority_missing');
   const approved=assertHeldR7019EPreDecryptAdmission({
    archive:{
     sourceHead:p.head,generationNonce:this.nonce,
     manifest:readFileSync(path.join(p.path,'manifest.json')),
     postgresCiphertext:readFileSync(p.sql),
     vaultCiphertext:readFileSync(p.vault),
    },
    signedCensus:authority.signedCensus,external:authority.external,
   });
   if(approved.witnessedWorks<1||approved.productionRestoreApproved!==false)
    reject('r7019f_unqualified_admission_verdict');
   expectedWorks=authority.signedCensus.body.works;
  }else if(authority){
   // Don't silently bypass the fixture-only trust contract in another mode.
   reject('r7019f_production_restore_not_enabled');
  }
  if(existsSync(this.sourceVault))reject('original_vault_still_present');
  const original=run('docker',['ps','-aq','--filter','name=^/'+this.source+'$']);
  if(original.toString().trim())reject('source_postgres_not_destroyed');
  verifyR7019CFictionalCompletePoint(p.path,p.head);
  const manifest=JSON.parse(readFileSync(path.join(p.path,'manifest.json'),'utf8'));
  for(const [file,hashValue] of [[p.sql,p.dbHash],[p.vault,p.vaultHash]] as const){
   if(sha(readFileSync(file))!==hashValue||statSync(file).mode%512!==0o600)
    reject('ciphertext_integrity_or_permissions');
  }
  if(manifest.releaseApproved||manifest.offsiteKeyCustodyCertified||
     manifest.completeWriterCoverageCertified||manifest.externalErasureAuthorityVerified)
   reject('forged_release_flags');
  const wrong=spawnSync('gpg',['--batch','--no-tty','--homedir',
    this.writerHome,'--decrypt',p.sql],{
    encoding:null,timeout:10000,maxBuffer:2*1024*1024,
  });
  if(wrong.status===0||(wrong.stdout as Buffer).length>0)
   reject('public_only_writer_can_decrypt');
  let started=false;
  const restored=path.join(this.evidence,'restore-scratch-'+this.nonce);
  try{
   run('docker',['run','--pull','never','-d','--rm','--name',this.restoreName,
    '--network','none','--memory','512m','--cpus','1','--pids-limit','128',
    '--security-opt','no-new-privileges',
    '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=256m',
    '-e','POSTGRES_USER=fict','-e','POSTGRES_DB=ws_atomic',
    '-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:16.13'],undefined,60000);
   started=true;
   let ready=false;
   for(let i=0;i<70;i++){
    const r=spawnSync('docker',['exec',this.restoreName,'psql','-XAtq',
      '-U','fict','-d','ws_atomic','-c','SELECT 1'],
      {timeout:7000,encoding:'utf8'});
    if(r.status===0&&r.stdout.trim()==='1'){ready=true;break;}
   }
   if(!ready)reject('fresh_restore_postgres_unavailable');
   const net=run('docker',['inspect','-f',
    '{{.HostConfig.NetworkMode}}|{{len .Mounts}}',this.restoreName]);
   if(net.toString().trim()!=='none|0')reject('restore_container_not_isolated');
   const sql=this.decrypt(p.sql);
   run('docker',['exec','-i',this.restoreName,'pg_restore',
    '--exit-on-error','-U','fict','-d','ws_atomic'],sql,70000);
   mkdirSync(restored,{mode:0o700});
   const tar=this.decrypt(p.vault);
   const names=run('tar',['-tf','-'],tar).toString('utf8').split('\n')
     .filter(x=>x&&!x.endsWith('/'));
   if(names.some(n=>!n.startsWith('./')||n.includes('..')||
      path.isAbsolute(n)))reject('unsafe_tar_restore');
   run('tar',['-C',restored,'-xf','-'],tar);
   const actual:Record<string,string>={};
   for(const name of names){
    actual[name]=sha(readFileSync(path.join(restored,name)));
   }
   const expected=Object.keys(p.vaultFiles).sort();
   if(JSON.stringify(Object.keys(actual).sort())!==JSON.stringify(expected)||
      expected.some(k=>actual[k]!==p.vaultFiles[k]))
    reject('vault_restore_hash_mismatch');
   const cmd=`SELECT
     (SELECT count(*) FROM manuscript_source_arrivals) ||
     ',' || (SELECT count(*) FROM manuscript_working_drafts) ||
     ',' || (SELECT count(*) FROM practitioner_files) ||
     ',' || (SELECT count(*) FROM manuscript_keeps)`;
   const counts=run('docker',['exec',this.restoreName,'psql','-XAtq',
    '-U','fict','-d','ws_atomic','-c',cmd]).toString('utf8').trim().split(',')
     .map(Number);
   if(counts.length!==4||
      counts[0]!==p.scope.sourceCount||
      counts[1]!==p.scope.draftCount||
      counts[2]!==1||counts[3]!==p.scope.keepCount)
    reject('restored_source_draft_keep_file_counts');
   let exactFictionalWorkIndexMatched=false;
   if(expectedWorks){
    // This checks ACTUAL restored canonical PostgreSQL IDs and R1Q
    // Work-key ownership records, not archive-supplied row counts.
    // No member prose/keys enter stdout or evidence receipts.
    const rosterSQL=`SELECT m.member_id::text||','||m.id::text||','||
      COALESCE(k.key_id::text,'MISSING')
      FROM member_manuscripts m
      LEFT JOIN ws_managed_work_key_wrappings_r1q k
        ON k.manuscript_id=m.id AND k.member_id=m.member_id
      ORDER BY m.id,k.key_epoch`;
    const bytes=run('docker',['exec',this.restoreName,'psql',
      '-XAtq','-U','fict','-d','ws_atomic','-c',rosterSQL]);
    const rows=bytes.toString('utf8').trim().split('\n').filter(Boolean)
      .map(row=>{
       const [memberId,workId,keyId]=row.trim().split(',');
       return {memberId,workId,keyId};
      });
    if(!matchR7019FRestoredFictionalWorkIndex(expectedWorks,rows))
     reject('r7019f_actual_restored_work_key_index_mismatch');
    exactFictionalWorkIndexMatched=true;
   }
   this.restored=true;
   return {restoredDBRows:counts.reduce((a,b)=>a+b,0),
    restoredVaultFiles:expected.length,digestMatch:true,
    privateWriterHasNoRecoveryKey:true,
    actualPostrestoreCanonicalWorkKeyCensusMatched:exactFictionalWorkIndexMatched,
    releasedForProduction:false};
  }finally{
   if(started)spawnSync('docker',['rm','-f','-v',this.restoreName],{timeout:20000});
   if(existsSync(restored))rmSync(restored,{recursive:true,force:true});
  }
 }
 dispose(){
  if(existsSync(this.keyRoot))rmSync(this.keyRoot,{recursive:true,force:true});
 }
 get keysDestroyed(){return !existsSync(this.keyRoot);}
 get encryptedGeneration(){return this.point?.path??null;}
}
