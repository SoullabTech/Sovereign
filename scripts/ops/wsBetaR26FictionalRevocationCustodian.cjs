/* R24 isolated process-only signer fixture. NOT a production KMS.
 * All keys are ephemeral fictional test keys. Private state is persisted
 * outside the synthetic Writer database/vault solely to test restart refusal.
 * No TCP listener, external network, member data or real credentials.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
if(process.env.R26_SIDECAR_FIXTURE!=='fictional-only')throw Error('R24_fixture_only');
const root=process.env.R26_SIDECAR_STATE_DIR;
if(!root||!fs.realpathSync(root).includes('ws-r26-fictional-'))
 throw Error('R24_fixture_path_refused');
const stateFile=path.join(root,'synthetic-custodian-r26.json');
function makeKey(){const kp=crypto.generateKeyPairSync('ed25519');
 return {priv:kp.privateKey.export({type:'pkcs8',format:'pem'}),
 pub:kp.publicKey.export({type:'spki',format:'pem'})};}
function persist(){
 const tmp=stateFile+'.tmp';
 fs.writeFileSync(tmp,JSON.stringify(s),{mode:0o600});
 const fd=fs.openSync(tmp,'r');fs.fsyncSync(fd);fs.closeSync(fd);
 fs.renameSync(tmp,stateFile);
 const dd=fs.openSync(root,'r');fs.fsyncSync(dd);fs.closeSync(dd);
}
let s;
if(fs.existsSync(stateFile)) s=JSON.parse(fs.readFileSync(stateFile,'utf8'));
else{s={lease:makeKey(),deletion:makeKey(),generation:12,
 consumed:[],workKeys:{},retiredWorks:[],retiredKeyIds:[]};persist();}
if(!Array.isArray(s.retiredWorks) || !Array.isArray(s.retiredKeyIds)) throw Error('invalid_revocation_register');
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validScope=x=>x&&uuid.test(x.memberId)&&uuid.test(x.workId)&&
 Number.isSafeInteger(x.generation)&&x.generation>0&&
 ['append','read'].includes(x.operation);
function issued(scope,now){
 if(!validScope(scope)||!Number.isSafeInteger(now))throw Error('invalid_fixture_scope');
 if(s.retiredWorks.includes(scope.workId))throw Error('retired_work');
 const keyPath=scope.memberId+':'+scope.workId;
 let key=s.workKeys[keyPath];
 if(!key){key={keyId:crypto.randomUUID(),bytes:crypto.randomBytes(32).toString('base64')};
   s.workKeys[keyPath]=key;persist();}
 if(s.retiredKeyIds.includes(key.keyId))throw Error('retired_key');
 const nonce=crypto.randomBytes(16).toString('hex');
 const lease={protocol:'soullab.ws.external-work-lease.r24',scope,
  keyId:key.keyId,keyDigest:crypto.createHash('sha256').update(Buffer.from(key.bytes,'base64')).digest('hex'),deletionGeneration:s.generation,
  nonce,issuedAtMs:now-1000,expiresAtMs:now+10000};
 const l=Buffer.from(JSON.stringify([lease.protocol,
  scope.memberId,scope.workId,scope.generation,scope.operation,
  lease.keyId,lease.keyDigest,s.generation,nonce,lease.issuedAtMs,lease.expiresAtMs]),'utf8');
 const checkpoint={protocol:'soullab.ws.deletion-highwater.v1',
  stream:'writers-studio-beta',generation:s.generation,
  revokedWorks:s.retiredWorks,revokedKeyIds:s.retiredKeyIds};
 const c=Buffer.from(JSON.stringify([checkpoint.protocol,
  checkpoint.stream,checkpoint.generation,checkpoint.revokedWorks,checkpoint.revokedKeyIds]),'utf8');
 const signature=crypto.sign(null,l,s.lease.priv).toString('base64');
 const deletionSignature=crypto.sign(null,c,s.deletion.priv).toString('base64');
 return {signedLease:{lease,signature},key:{keyId:key.keyId,keyBytes:key.bytes},
  signedDeletion:{checkpoint,signature:deletionSignature}};
}
process.on('message',msg=>{
 const id=msg?.id;
 try{
  let result;
  if(msg?.op==='public')
   result={leasePublic:s.lease.pub,deletionPublic:s.deletion.pub};
  else if(msg?.op==='issue') result=issued(msg.scope,msg.now);
  else if(msg?.op==='floor') result=s.generation;
  else if(msg?.op==='consume'){
   if(s.consumed.includes(msg.nonce))result=false;
   else{s.consumed.push(msg.nonce);persist();result=true;}
  }else if(msg?.op==='retire'){
   if(!uuid.test(msg.workId)||!uuid.test(msg.memberId))throw Error('invalid_retire_scope');
   const keyPath=msg.memberId+':'+msg.workId;
   if(s.retiredWorks.includes(msg.workId))throw Error('already_retired');
   const key=s.workKeys[keyPath];
   if(!key)throw Error('unregistered_work');
   delete s.workKeys[keyPath];
   s.retiredWorks.push(msg.workId);
   s.retiredKeyIds.push(key.keyId);
   s.retiredWorks.sort();s.retiredKeyIds.sort();
   s.generation+=1;
   persist();
   result={generation:s.generation,keyId:key.keyId,retired:true};
  }else if(msg?.op==='advance'){
   if(!Number.isSafeInteger(msg.generation)||msg.generation<=s.generation)
      throw Error('nonmonotone_epoch');
   s.generation=msg.generation;persist();result=s.generation;
  }else if(msg?.op==='status')result={generation:s.generation,
   consumed:s.consumed.length,retiredWorks:s.retiredWorks.length,
   retainedWorkKeys:Object.keys(s.workKeys).length};
  else if(msg?.op==='checkpoint'){
   const ck={protocol:'soullab.ws.deletion-highwater.v1',
    stream:'writers-studio-beta',generation:s.generation,
    revokedWorks:s.retiredWorks,revokedKeyIds:s.retiredKeyIds};
   const payload=Buffer.from(JSON.stringify([ck.protocol,ck.stream,ck.generation,
     ck.revokedWorks,ck.revokedKeyIds]));
   result={checkpoint:ck,signature:crypto.sign(null,payload,s.deletion.priv).toString('base64')};
  }
  else throw Error('unknown_fixture_action');
  process.send?.({id,result});
 }catch(err){process.send?.({id,error:String(err?.message||'fixture_error')});}
});
