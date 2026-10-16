/**
 * R30 requalification of old-backup revocation on integrated R29 code.
 *
 * Synthetic Work/vault state and synthetic separate custody sidecar only.
 * No live database, server, member, provider, or actual recoverable manuscript.
 * Importantly, old ciphertext PLUS a retained old key remains decryptable
 * offline: this program explicitly demonstrates that limitation.
 */
import {fork,spawnSync,type ChildProcess} from 'node:child_process';
import {
  createHash,createPublicKey,randomUUID,
} from 'node:crypto';
import {
  mkdtempSync,mkdirSync,readFileSync,writeFileSync,copyFileSync,
  rmSync,existsSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {canonicalDeletionPayload,requireCurrentRestoreAuthorization,
  type SignedDeletionHighwaterV1} from '../../lib/writersStudio/recovery/deletionBarrierV1';
import {sealWorkSnapshot,openWorkSnapshot,
  type WorkRecord, type WorkEncryptionKey, type SealedWorkV1,
} from '../../lib/writersStudio/recovery/workEnvelopeV1';
import {reviewR24HeldCustodyLease,
  type R24ExternallyPinnedAuthority,
  type R24Lease, type R24Scope, type R24LeaseKeyPackage,
} from '../../lib/writersStudio/recovery/externalCustodyBoundaryR24';
import {writeDurableVaultBytes,readVaultBytes} from '../../lib/storage/fileVault';

if(process.env.R26_OLD_BACKUP_FIXTURE!=='fictional-only')
 throw Error('R26_FICTIONAL_OLD_BACKUP_OPT_IN_REQUIRED');
// The inherited R24 verifier is also statically denied without its own exact test gate.
process.env.R24_INDEPENDENT_AUTHORITY_FIXTURE='fictional-only';
const root=mkdtempSync(join(tmpdir(),'ws-r26-fictional-'));
const separateCopy=mkdtempSync(join(tmpdir(),'ws-r26-backup-fict-'));
const stateDir=join(root,'custodian');
const vaultDir=join(root,'encrypted-writer-vault');
mkdirSync(stateDir);
mkdirSync(vaultDir);
process.env.FILE_STORAGE_PATH=vaultDir;
const rootMarker=join(root,'fictional-only.marker');
const copyMarker=join(separateCopy,'fictional-only.marker');
writeFileSync(rootMarker,'R26_FICTIONAL_ONLY');
writeFileSync(copyMarker,'R26_FICTIONAL_ONLY');
const script=join(process.cwd(),'scripts/ops/wsBetaR26FictionalRevocationCustodian.cjs');
const EVIDENCE='/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R30_OLD_BACKUP_REVOCATION_20261016.json';
const MEMBER='11111111-1111-4111-8111-111111111111';
const WORK='33333333-3333-4333-8333-333333333333';
const NOTE="R26 fictional author's unique, never real, private notebook words";
const scope:R24Scope={memberId:MEMBER,workId:WORK,generation:1,operation:'append'};
const NOW=1792162800000;
const receipt={
 status:'HOLD' as string,
 checks:[] as string[],negatives:[] as string[],
 unsafeRetainedKeyCanDecryptOldBackup:false,
 sidecarStopped:false,fixtureRemoved:false,backupRemoved:false,
 productionTouched:false,realMembersTouched:false,realKmsInstalled:false,
 testedGitHead:null as string|null,
 error:null as string|null,
};
let child:ChildProcess|null=null;
let counter=0;
let pending=new Map<number,{accept:(x:any)=>void;reject:(e:Error)=>void}>();
const ok=(condition:unknown,label:string)=>{
 if(!condition)throw Error('R26_CONTROL_FAILED:'+label);
 receipt.checks.push(label);
};
function ipc(action:string,data:Record<string,unknown>={}):Promise<any>{
 const proc=child;
 if(!proc||!proc.connected)return Promise.reject(Error('fixture_custodian_unavailable'));
 return new Promise((accept,reject)=>{
  const id=++counter;
  const timeout=setTimeout(()=>{
   if(pending.has(id)){pending.delete(id);reject(Error('synthetic_custodian_timeout'));}
  },5000);
  pending.set(id,{
   accept:(value:any)=>{clearTimeout(timeout);accept(value);},
   reject:(e:Error)=>{clearTimeout(timeout);reject(e);},
  });
  proc.send({id,op:action,...data},error=>{
   if(error&&pending.has(id)){
     pending.delete(id);clearTimeout(timeout);reject(error);
   }
  });
 });
}
async function launch(){
 // Do NOT forward arbitrary parent credentials or provider environment.
 child=fork(script,[],{silent:true,env:{
  PATH:process.env.PATH||'/usr/bin:/bin',
  R26_SIDECAR_FIXTURE:'fictional-only',
  R26_SIDECAR_STATE_DIR:stateDir,
 }});
 const proc=child;
 proc.on('message',(response:any)=>{
  const waiter=pending.get(response?.id);
  if(!waiter)return;
  pending.delete(response.id);
  if(response.error){
   const err=Object.assign(new Error('r26_custodian_refused'),{code:'r26_custodian_refused'});
   waiter.reject(err);
  }
  else waiter.accept(response.result);
 });
 proc.on('exit',()=>{
  for(const waiter of pending.values())waiter.reject(Error('r26_custodian_exited'));
  pending.clear();
 });
 await ipc('status');
}
async function shutdown(){
 const proc=child;child=null;
 if(!proc)return;
 if(proc.connected)proc.disconnect();
 if(proc.exitCode===null&&proc.signalCode===null)proc.kill('SIGTERM');
 await new Promise<void>(resolve=>{
  if(proc.exitCode!==null||proc.signalCode!==null)return resolve();
  const timeout=setTimeout(()=>{proc.kill('SIGKILL');resolve();},3000);
  proc.once('exit',()=>{clearTimeout(timeout);resolve();});
 });
}
type Witness={
 authority:R24ExternallyPinnedAuthority;
 deletionSigner:ReturnType<typeof createPublicKey>;
};
async function connectWitness():Promise<Witness>{
 const publicRoots=await ipc('public');
 const leaseSigner=createPublicKey(publicRoots.leasePublic);
 const deletionSigner=createPublicKey(publicRoots.deletionPublic);
 const authority:R24ExternallyPinnedAuthority={
  pinnedLeaseSigner:leaseSigner,pinnedDeletionSigner:deletionSigner,
  minimumDeletionGeneration:()=>ipc('floor'),
  consumeNonce:(lease:R24Lease)=>ipc('consume',{nonce:lease.nonce}),
 };
 return {authority,deletionSigner};
}
function material(raw:any):R24LeaseKeyPackage{
 return {
  signedLease:raw.signedLease,
  signedDeletion:raw.signedDeletion,
  key:{keyId:raw.key.keyId,keyBytes:Buffer.from(raw.key.keyBytes,'base64')},
 };
}
async function issue(target:R24Scope):Promise<R24LeaseKeyPackage>{
 return material(await ipc('issue',{scope:target,now:NOW}));
}
async function denies(fn:()=>Promise<unknown>,expectedCode:string,label:string){
 let found:string|null=null;
 try{await fn()}catch(e){found=(e as {code?:string}).code??null;}
 ok(found===expectedCode,'denied '+label);
 receipt.negatives.push(label);
}
async function readCurrentCheckpoint():Promise<SignedDeletionHighwaterV1>{
 const checkpoint=await ipc('checkpoint');
 // Canonical parsing itself detects untrusted/altered checkpoint shape.
 canonicalDeletionPayload(checkpoint.checkpoint);
 return checkpoint as SignedDeletionHighwaterV1;
}
async function run(){
 await launch();
 let witness=await connectWitness();
 const first=await issue(scope);
 const unusedRead=await issue({...scope,operation:'read'});
 const append=await reviewR24HeldCustodyLease({
  scope,package:first,authority:witness.authority,nowMs:NOW,
 });
 ok(append.scope.workId===WORK,'current synthetic owner granted short-lived append');

 const records:WorkRecord[]=[{field:'manuscript_working_drafts.content',
  recordId:randomUUID(),value:Buffer.from(NOTE,'utf8')}];
 const sealed=sealWorkSnapshot({memberId:MEMBER,workId:WORK,generation:1},
  records,append.key);
 const serialized=Buffer.from(JSON.stringify(sealed),'utf8');
 const sha=createHash('sha256').update(serialized).digest('hex');
 const ref=await writeDurableVaultBytes('ws-r26-old-fict',randomUUID(),
  'enc',serialized);
 ok((await readVaultBytes(ref)).equals(serialized),
   "author synthetic ciphertext persisted in actual immutable vault");
 const priorBackup=join(separateCopy,'old-revision.enc');
 copyFileSync(join(vaultDir,ref),priorBackup);
 const metadata=JSON.stringify({memberId:MEMBER,workId:WORK,generation:1,
  ciphertextDigest:sha,keyId:append.key.keyId});
 writeFileSync(join(separateCopy,'old-db-manifest-fixture.json'),metadata);
 const oldBytes=readFileSync(priorBackup);
 ok(!oldBytes.includes(Buffer.from(NOTE))&&
  !readFileSync(join(separateCopy,'old-db-manifest-fixture.json')).includes(Buffer.from(NOTE)),
  'fictional previous backup copies contain no author plaintext or keys');
 const oldCheckpoint=first.signedDeletion;
 ok((openWorkSnapshot({memberId:MEMBER,workId:WORK,generation:1},sealed,
  append.key)[0].value.toString('utf8'))===NOTE,
  'old Work decrypts before retiring its key');

 const retired=await ipc('retire',{memberId:MEMBER,workId:WORK});
 ok(retired.retired&&retired.generation===13&&
  retired.keyId===append.key.keyId,
  'separate custodian retired writer Work key and advanced monotone epoch');
 await shutdown();
 await launch();
 witness=await connectWitness();
 const restored=await ipc('status');
 ok(restored.generation===13&&restored.retiredWorks===1&&
  restored.retainedWorkKeys===0,
  'custodian restart retains revocation and no active Work key entry');
 const custodianState=readFileSync(join(stateDir,'synthetic-custodian-r26.json'),'utf8');
 ok(!custodianState.includes(append.key.keyBytes.toString('base64')),
  'current synthetic custody state no longer contains retired key bytes');
 await denies(()=>issue({...scope,operation:'read'}),
  'r26_custodian_refused','new lease for retired Work refused');
 await denies(()=>reviewR24HeldCustodyLease({
  scope:{...scope,operation:'read'},package:unusedRead,
  authority:witness.authority,nowMs:NOW,
 }), 'r24_independent_generation_mismatch',
 'unused pre-deletion signed lease rejected after independent restart');
 const current=await readCurrentCheckpoint();
 ok(current.checkpoint.generation===13&&
    current.checkpoint.revokedWorks.includes(WORK)&&
    current.checkpoint.revokedKeyIds.includes(append.key.keyId),
  'new separately signed highwater explicitly records revoked Work and key');
 let oldRollbackRefused=false;
 try{
  requireCurrentRestoreAuthorization({
   request:{workId:WORK,keyId:append.key.keyId,snapshotGeneration:1},
   signed:oldCheckpoint,trustedSigner:witness.deletionSigner,
   independent:{minimumGeneration:await ipc('floor')},
  });
 }catch(e){oldRollbackRefused=(e as {code?:string}).code==='stale_deletion_checkpoint';}
 ok(oldRollbackRefused,'old signed backup checkpoint fails current independent epoch');
 receipt.negatives.push('old_backup_highwater_rollback_refused');
 let currentRevocationRefused=false;
 try{
  requireCurrentRestoreAuthorization({
   request:{workId:WORK,keyId:append.key.keyId,snapshotGeneration:1},
   signed:current,trustedSigner:witness.deletionSigner,
   independent:{minimumGeneration:await ipc('floor')},
  });
 }catch(e){currentRevocationRefused=(e as {code?:string}).code==='deleted_work_refused';}
 ok(currentRevocationRefused,'current signed checkpoint refuses reading revoked Work');
 receipt.negatives.push('current_checkpoint_revoked_work_refused');

 // IMPORTANT NEGATIVE PROOF AGAINST OVERCLAIMED ERASURE:
 // A caller that secretly retained the old raw key CAN bypass the system's
 // authority and decrypt a stolen old backup locally. Software guarantees
 // are CONDITIONAL on no independent historical key copies surviving.
 const stolenRawKey:WorkEncryptionKey={keyId:first.key.keyId,
   keyBytes:Buffer.from(first.key.keyBytes)};
 const oldCipher=JSON.parse(oldBytes.toString('utf8')) as SealedWorkV1;
 const bypass=openWorkSnapshot({memberId:MEMBER,workId:WORK,generation:1},
   oldCipher,stolenRawKey);
 receipt.unsafeRetainedKeyCanDecryptOldBackup=
   bypass[0].value.toString('utf8')===NOTE;
 ok(receipt.unsafeRetainedKeyCanDecryptOldBackup,
  'LIMITATION EXPOSED: old backup and retained old key can decrypt offline');
 stolenRawKey.keyBytes.fill(0);
 first.key.keyBytes.fill(0);
 unusedRead.key.keyBytes.fill(0);
 append.key.keyBytes.fill(0);
 receipt.status='R26_BACKUP_CUSTODY_POLICY_REFUSAL_PASS_RAW_KEY_ERASURE_UNPROVEN';
}
(async()=>{
 try{await run();}
 catch(e){receipt.error=String((e as Error)?.message||e).slice(0,240);
  process.exitCode=2;}
 finally{
  await shutdown().catch(()=>{});
  receipt.sidecarStopped=true;
  if(existsSync(rootMarker))rmSync(root,{recursive:true,force:true});
  if(existsSync(copyMarker))rmSync(separateCopy,{recursive:true,force:true});
  receipt.fixtureRemoved=!existsSync(root);
  receipt.backupRemoved=!existsSync(separateCopy);
  const rev=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'});
  receipt.testedGitHead=rev.status===0?rev.stdout.trim():null;
  writeFileSync(EVIDENCE,JSON.stringify(receipt,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({status:receipt.status,checks:receipt.checks.length,
    negatives:receipt.negatives,oldKeyBypassPossible:receipt.unsafeRetainedKeyCanDecryptOldBackup,
    clean:receipt.sidecarStopped&&receipt.fixtureRemoved&&receipt.backupRemoved,
    error:receipt.error,realMemberRelease:'HOLD'}));
  if(receipt.status!=='R26_BACKUP_CUSTODY_POLICY_REFUSAL_PASS_RAW_KEY_ERASURE_UNPROVEN'||
    !receipt.sidecarStopped||!receipt.fixtureRemoved||!receipt.backupRemoved)
    process.exitCode=2;
 }
})();
