/** R24 physical external-process custody contract fixture.
 * Test keys and epoch live only inside synthetic child-process state outside
 * the Writer DB/vault. NO production KMS, external network or real data.
 */
import {fork,type ChildProcess} from 'node:child_process';
import {createPublicKey,randomUUID} from 'node:crypto';
import {mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {
 reviewR24HeldCustodyLease,R24_REAL_EXTERNAL_CUSTODY_ENABLED,
 type R24Scope,type R24LeaseKeyPackage,type R24ExternallyPinnedAuthority,
 type R24Lease,
} from '../../lib/writersStudio/recovery/externalCustodyBoundaryR24';
if(process.env.R24_PHYSICAL_AUTHORITY_FIXTURE!=='fictional-only')
 throw Error('R24_EXPLICIT_FICTIONAL_ONLY_REQUIRED');
const root=mkdtempSync(join(tmpdir(),'ws-r24-fictional-'));
const script=join(process.cwd(),'scripts/ops/wsBetaR24FictionalCustodian.cjs');
const EVIDENCE='/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R24_EXTERNAL_PROCESS_CUSTODY_20261016.json';
const MEMBER='11111111-1111-4111-8111-111111111111';
const WORK='33333333-3333-4333-8333-333333333333';
const NOW=1792162800000;
const scope:R24Scope={memberId:MEMBER,workId:WORK,generation:2,operation:'append'};
const receipt={status:'HOLD' as string,
 checks:[] as string[],negatives:[] as string[],
 realMemberAuthority:false,realKmsInstalled:false,
 sidecarStopped:false,privateFixtureRemoved:false,
 productionTouched:false,error:null as string|null};
let child:ChildProcess|null=null;
const check=(ok:unknown,msg:string)=>{
 if(!ok)throw Error('r24_physical_check_failed:'+msg);
 receipt.checks.push(msg);
};
let id=0;
let pending=new Map<number,{resolve:(x:any)=>void;reject:(e:Error)=>void}>();
async function start():Promise<void>{
 child=fork(script,[],{silent:true,env:{...process.env,
  R24_SIDECAR_FIXTURE:'fictional-only',R24_SIDECAR_STATE_DIR:root}});
 const c=child;
 c.on('message',(msg:any)=>{
  const waiter=pending.get(msg?.id);
  if(!waiter)return;
  pending.delete(msg.id);
  msg.error?waiter.reject(Error('fixture_child_refused')):waiter.resolve(msg.result);
 });
 c.on('exit',()=>{for(const waiter of pending.values())waiter.reject(Error('child_unavailable'));pending.clear();});
 await call('status');
}
function call(op:string,rest:Record<string,unknown>={}):Promise<any>{
 if(!child || !child.connected)return Promise.reject(Error('fixture_not_available'));
 const c=child;
 return new Promise((resolve,reject)=>{
  const n=++id;
  const timeout=setTimeout(()=>{
   if(pending.has(n)){pending.delete(n);reject(Error('fixture_response_timeout'));}
  },4500);
  pending.set(n,{
   resolve:(x)=>{clearTimeout(timeout);resolve(x)},
   reject:(err)=>{clearTimeout(timeout);reject(err)},
  });
  c.send({id:n,op,...rest},(err)=>{
   if(err&&pending.has(n)){pending.delete(n);clearTimeout(timeout);reject(err);}
  });
 });
}
async function stop():Promise<void>{
 const c=child;child=null;
 if(!c)return;
 c.disconnect();
 if(c.exitCode===null && c.signalCode===null)c.kill('SIGTERM');
 await new Promise<void>(resolve=>{
  if(c.exitCode!==null||c.signalCode!==null)return resolve();
  const timeout=setTimeout(()=>{c.kill('SIGKILL');resolve();},3000);
  c.once('exit',()=>{clearTimeout(timeout);resolve();});
 });
}
async function issuer(){
 const pub=await call('public');
 const signer=createPublicKey(pub.leasePublic);
 const deletionSigner=createPublicKey(pub.deletionPublic);
 const external:R24ExternallyPinnedAuthority={
  pinnedLeaseSigner:signer,pinnedDeletionSigner:deletionSigner,
  minimumDeletionGeneration:async()=>call('floor'),
  consumeNonce:async(lease:R24Lease)=>call('consume',{nonce:lease.nonce}),
 };
 return {external,deletionSigner};
}
async function packageFor(w:R24Scope){
 const raw=await call('issue',{scope:w,now:NOW});
 const pub=await call('public');
 const pack:R24LeaseKeyPackage={
  signedLease:raw.signedLease,
  key:{keyId:raw.key.keyId,keyBytes:Buffer.from(raw.key.keyBytes,'base64')},
  signedDeletion:raw.signedDeletion,
 };
 return pack;
}
async function refused(run:()=>Promise<unknown>,code:string,tag:string){
 let captured:string|null=null;
 try{await run()}catch(e){captured=(e as {code?:string}).code||null;}
 check(captured===code,'independent sidecar rejected '+tag);
 receipt.negatives.push(tag);
}
(async()=>{
 try{
  check(!R24_REAL_EXTERNAL_CUSTODY_ENABLED,'real writer key provider remains disabled');
  await start();
  let {external}=await issuer();
  check((await call('status')).generation===12,'external child holds initial synthetic deletion high-water');
  const pack=await packageFor(scope);
  const result=await reviewR24HeldCustodyLease({scope,package:pack,
    authority:external,nowMs:NOW});
  check(result.key.keyId===pack.key.keyId&&
    result.scope.memberId===MEMBER,'external child-issued scoped lease verified and consumed');
  await refused(()=>reviewR24HeldCustodyLease({scope,package:pack,authority:external,
    nowMs:NOW}),'r24_lease_replay_refused','same process lease replay');

  await stop();
  await start();
  ({external}=await issuer());
  check((await call('status')).consumed===1,'sidecar restart recovered durable consumed nonce');
  await refused(()=>reviewR24HeldCustodyLease({scope,package:pack,authority:external,
    nowMs:NOW}),'r24_lease_replay_refused','restart replay refused');
  check(await call('advance',{generation:13})===13,
    'externally held deletion epoch advanced monotonically');
  const unspent=await packageFor(scope);
  check(unspent.signedLease.lease.deletionGeneration===13,
    'new signed lease carries independently advanced deletion epoch');
  // An old grant from generation 12 remains refused by current independent floor.
  await refused(()=>reviewR24HeldCustodyLease({scope,package:pack,authority:external,
    nowMs:NOW}),'r24_independent_generation_mismatch','older signed epoch cannot roll back');
  const fresh=await reviewR24HeldCustodyLease({scope,
    package:unspent,authority:external,nowMs:NOW});
  check(fresh.deletion.independent.minimumGeneration===13,
    'fresh lease meets independently advanced deletion generation');
  await stop();
  await refused(()=>reviewR24HeldCustodyLease({scope,
    package:unspent,
    authority:external,nowMs:NOW}),
    'r24_independent_generation_unavailable','unavailable custodian has no fallback');
  receipt.status='R24_ISOLATED_EXTERNAL_PROCESS_LEASE_AND_REPLAY_PASS_REAL_RELEASE_HOLD';
 }catch(e){
  receipt.error=String((e as Error)?.message||e).slice(0,200);
  process.exitCode=2;
 }finally{
  await stop().catch(()=>{});
  receipt.sidecarStopped=true;
  rmSync(root,{recursive:true,force:true});
  receipt.privateFixtureRemoved=true;
  writeFileSync(EVIDENCE,JSON.stringify(receipt,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({
   status:receipt.status,checks:receipt.checks.length,negative:receipt.negatives,
   stopped:receipt.sidecarStopped,clean:receipt.privateFixtureRemoved,
   error:receipt.error,release:'HOLD',
  },null,2));
  if(receipt.status!=='R24_ISOLATED_EXTERNAL_PROCESS_LEASE_AND_REPLAY_PASS_REAL_RELEASE_HOLD')
   process.exitCode=2;
 }
})();
