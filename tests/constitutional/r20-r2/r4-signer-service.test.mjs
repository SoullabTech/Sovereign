import test, {before,after} from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync,randomBytes } from 'node:crypto';
import {spawn} from 'node:child_process';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {readFileSync} from 'node:fs';
import {
  REQUEST_SCHEMA,GENESIS_HEAD,makeFictionalOutboxClaim,
} from '../../../lib/recovery/r20-r4/signerProtocol.mjs';
import {callFixtureSigner} from '../../../lib/recovery/r20-r4/fixtureSignerClient.mjs';
import {readAndAdmitExternalCapturedAuthority} from '../../../lib/recovery/r20-r3/externalAnchorBoundary.mjs';
import {createFictionalAuthorityReader} from '../../../lib/recovery/r20-r4/fixtureAuthorityBridge.mjs';
import {SYNTHETIC_TARGET,rehearseR20FencedRestore} from '../../../lib/recovery/r20-r3/restorePublicationFence.mjs';

const registry=JSON.parse(readFileSync(new URL(
  '../../../lib/recovery/r20-r3/writer-studio-captured-graph-20261013.json',
  import.meta.url,
)));
const eventKey=generateKeyPairSync('ed25519');
const readerKey=generateKeyPairSync('ed25519');
const otherKey=generateKeyPairSync('ed25519');
const roles=Object.fromEntries(['ledger','head','pin'].map(role=>[
  role,generateKeyPairSync('ed25519'),
]));
const places={
  ledger:'https://r20-event-fixture.example.invalid/v1',
  head:'https://r20-head-fixture.example.invalid/v1',
  pin:'https://r20-pin-fixture.example.invalid/v1',
};
const uuid=n=>n.toString(16).padStart(8,'0')+'-0000-4000-8000-000000000001';
const event=n=>({
  sequence:n,
  manifest:uuid(0x3000+n),
  tombstones:[{table:n%2?'member_manuscripts':'living_works',id:uuid(0x4000+n)}],
});
const nonce=()=>randomBytes(16).toString('hex');
const privatePem=key=>key.export({type:'pkcs8',format:'pem'});
const publicPem=key=>key.export({type:'spki',format:'pem'});
const fixtureKeyring={
  schema:'R20_R4_EPHEMERAL_TEST_KEYS_V1',
  privateRoles:Object.fromEntries(Object.entries(roles).map(([role,k])=>[
    role,privatePem(k.privateKey),
  ])),
  issuerPublicKey:publicPem(eventKey.publicKey),
  recoveryPublicKey:publicPem(readerKey.publicKey),
};
const deny=/R20-R4|R20-R3J|refused/i;
let root,child,stderr='';
const fixtureChildren=new Set();
const daemon='scripts/ops/r20-r4/fictional-signer-daemon.mjs';
async function launch(){
  const proc=spawn(process.execPath,[daemon,root,'--fictional-only'],{
    cwd:process.cwd(),stdio:['ignore','pipe','pipe'],
  });
  child=proc;
  fixtureChildren.add(proc);
  proc.once('exit',()=>fixtureChildren.delete(proc));
  stderr='';
  proc.stderr.on('data',bytes=>{stderr+=bytes.toString('utf8').slice(0,2000);});
  await new Promise((resolve,reject)=>{
    let buffer='',settled=false;
    const deadline=setTimeout(()=>{
      if(!settled){settled=true;reject(Error('fixture signer start timeout '+stderr));}
    },3500);
    proc.stdout.on('data',data=>{
      buffer+=data.toString('utf8');
      if(!settled && buffer.includes('R20_R4_FICTIONAL_SIGNER_READY')){
        settled=true;clearTimeout(deadline);resolve();
      }
    });
    proc.once('exit',(code)=>{
      if(!settled){settled=true;clearTimeout(deadline);
        reject(Error('fixture signer prematurely exited '+code+' '+stderr));}
    });
  });
}
async function stopProcess(proc){
  if(!proc || proc.exitCode!==null || proc.signalCode!==null)return;
  await new Promise(resolve=>{
    const deadline=setTimeout(()=>{proc.kill('SIGKILL');},1200);
    proc.once('exit',()=>{clearTimeout(deadline);resolve();});
    proc.kill('SIGTERM');
  });
}
async function stop(){
  const proc=child;
  child=null;
  await stopProcess(proc);
}
const send=request=>callFixtureSigner({root,request});
const status=()=>send({action:'PUBLIC_FIXTURE_STATUS',fixtureOnly:true});
const claim=(n,prior,alter={})=>{
  const payload={
    schema:REQUEST_SCHEMA, nonce:nonce(),
    sequence:n, priorHeadDigest:prior,
    event:event(n),...alter,
  };
  return makeFictionalOutboxClaim(payload,eventKey.privateKey,eventKey.publicKey);
};
const append=authenticatedClaim=>send({
  action:'APPEND_FICTIONAL_DELETION',fixtureOnly:true,
  claim:authenticatedClaim,
});
const proof=(minimumSequence=1,signer=readerKey)=>send({
  action:'READ_FICTIONAL_PROOF',fixtureOnly:true,
  claim:makeFictionalOutboxClaim({
    schema:'SOULLAB-R20-R4-FICTIONAL-RECOVERY-PROOF-V1',
    nonce:nonce(),minimumSequence,
  },signer.privateKey,signer.publicKey),
});

before(async()=>{
  root=await fs.mkdtemp(path.join(os.tmpdir(),'r20-r3j-fixture-r4-'));
  await fs.chmod(root,0o700);
  await fs.writeFile(path.join(root,'fictional-private-role-keyring.json'),
    JSON.stringify(fixtureKeyring),{mode:0o600});
  await launch();
});
after(async()=>{
  await stop();
  // Also reap any earlier failed-start subprocess. Never destroy its keyring
  // while a spawned test signer remains alive with keys in process memory.
  for(const proc of [...fixtureChildren])await stopProcess(proc);
  assert.equal(fixtureChildren.size,0,'all fictional signers reaped');
  if(root)await fs.rm(root,{recursive:true,force:true});
});

test('process isolated daemon speaks only over a mode 0600 local socket',async()=>{
  const stat=await fs.lstat(path.join(root,'signer.sock'));
  assert(stat.isSocket());
  assert.equal(stat.mode&0o077,0);
});
test('initial public status reports uncommitted independent custody false',async()=>{
  const x=await status();
  assert.equal(x.signedSequence,0);
  assert.equal(x.signedHeadDigest,GENESIS_HEAD);
  assert.equal(x.physicallyIndependentSignerCertified,false);
  assert.equal(x.productionPromotionAllowed,false);
});
test('unsigned deletion command refused',async()=>{
  await assert.rejects(append({}),deny);
});
test('production-looking requests refused',async()=>{
  await assert.rejects(send({
    action:'APPEND_FICTIONAL_DELETION',fixtureOnly:false,
    claim:claim(1,GENESIS_HEAD),
  }),deny);
});
test('forged outbox authorizer refused',async()=>{
  const fake=makeFictionalOutboxClaim({
    schema:REQUEST_SCHEMA, nonce:nonce(),sequence:1,
    priorHeadDigest:GENESIS_HEAD,event:event(1),
  },otherKey.privateKey,otherKey.publicKey);
  await assert.rejects(append(fake),deny);
});
test('text-bearing extra event field refused even with a valid signature',async()=>{
  const fake=claim(1,GENESIS_HEAD,{event:{...event(1),sourceText:'FICTIONAL BUT NOT ALLOWED'}});
  await assert.rejects(append(fake),deny);
});
test('authorized first event creates a signed durable checkpoint',async()=>{
  const receipt=await append(claim(1,GENESIS_HEAD));
  assert.equal(receipt.status,'FICTIONAL_SIGNED_DELETION_COMMITTED');
  assert.equal(receipt.signedSequence,1);
  assert.equal(receipt.memberDeletionPerformed,false);
  assert.equal(receipt.independentCustodyCertified,false);
  assert.equal(receipt.productionPromotionAllowed,false);
});
test('durable witness, ledger, head, pin and commit all exist without prose',async()=>{
  const rolesToCheck=['ledger','head','pin','commit',
    'independent-witness-same-host-fixture'];
  for(const role of rolesToCheck){
    const dir=path.join(root,role);
    const entries=await fs.readdir(dir);
    assert.deepEqual(entries,['checkpoint-000000000001.json']);
    const contents=await fs.readFile(path.join(dir,entries[0]),'utf8');
    assert(!contents.includes('PRIVATE KEY'));
    assert(!contents.includes('sourceText'));
  }
});
test('replaying the identical signed append is refused',async()=>{
  const firstHead=(await status()).signedHeadDigest;
  const original=claim(2,firstHead);
  // Cache this as the next candidate and authenticate it once.
  const signed=await append(original);
  assert.equal(signed.signedSequence,2);
  await assert.rejects(append(original),deny);
});
test('reusing a previous authorized nonce under a new event is refused',async()=>{
  const head=(await status()).signedHeadDigest;
  const first=JSON.parse(await fs.readFile(path.join(root,
    'independent-witness-same-host-fixture',
    'checkpoint-000000000001.json'),'utf8'));
  await assert.rejects(append(claim(3,head,{nonce:first.nonce})),deny);
});
test('stale head and skipped deletion sequences are refused',async()=>{
  await assert.rejects(append(claim(3,GENESIS_HEAD)),deny);
  await assert.rejects(append(claim(5,(await status()).signedHeadDigest)),deny);
});
test('unsigned or wrong-key recovery proof refused',async()=>{
  await assert.rejects(proof(1,otherKey),deny);
  await assert.rejects(send({
    action:'READ_FICTIONAL_PROOF',fixtureOnly:true,claim:{},
  }),deny);
});
test('signed recovery reader can obtain cryptographically verifiable ledger proof',async()=>{
  const receipt=await proof(2);
  assert.equal(receipt.status,'FICTIONAL_SIGNED_RECOVERY_PROOF');
  assert.equal(receipt.signedSequence,2);
  assert.equal(receipt.productionPromotionAllowed,false);
  assert.equal(receipt.physicallyIndependentSignerCertified,false);
  const registeredKeys=Object.fromEntries(Object.entries(roles).map(([role,pair])=>[
    role,publicPem(pair.publicKey),
  ]));
  const verified=await readAndAdmitExternalCapturedAuthority({
    captureRegistry:registry,
    locations:places,
    keys:{
      ledgerPublicKey:registeredKeys.ledger,
      headPublicKey:registeredKeys.head,
      pinPublicKey:registeredKeys.pin,
    },
    transport:{
      getLedger:async()=>receipt.sealedLedger,
      getHead:async()=>receipt.sealedHead,
      getPin:async()=>receipt.sealedPin,
    },
    completeCommittedOutbox:[1,2].map(n=>({
      manifest:event(n).manifest,tombstones:event(n).tombstones,
    })),
  });
  assert.equal(verified.signedSequence,2);
  assert.equal(verified.productionPromotionAllowed,false);
  assert.equal(verified.physicallyIndependentSignerCertified,false);
});
test('duplicate proof nonce is refused by durable reader replay guard',async()=>{
  const envelope=makeFictionalOutboxClaim({
    schema:'SOULLAB-R20-R4-FICTIONAL-RECOVERY-PROOF-V1',
    nonce:nonce(),minimumSequence:2,
  },readerKey.privateKey,readerKey.publicKey);
  const request={action:'READ_FICTIONAL_PROOF',fixtureOnly:true,claim:envelope};
  await send(request);
  await assert.rejects(send(request),deny);
});
test('recovery proof refuses missing future epoch',async()=>{
  await assert.rejects(proof(999),deny);
});
test('two concurrent valid append requests cannot both commit same sequence',async()=>{
  const head=(await status()).signedHeadDigest;
  const [a,b]=await Promise.allSettled([
    append(claim(3,head)),append(claim(3,head,{
      event:{...event(3),manifest:uuid(0x13337)},
    })),
  ]);
  assert.equal([a,b].filter(x=>x.status==='fulfilled').length,1);
  assert.equal([a,b].filter(x=>x.status==='rejected').length,1);
  assert.equal((await status()).signedSequence,3);
});
test('signer refuses unknown methods and arbitrary signing requests',async()=>{
  await assert.rejects(send({action:'SIGN_ANYTHING',fixtureOnly:true,claim:{
    text:'test',
  }}),deny);
});
test('private Ed25519 signing keys are absent from normal protocol replies',async()=>{
  const s=await status();
  assert(!JSON.stringify(s).includes('BEGIN PRIVATE KEY'));
  const p=await proof(3);
  assert(!JSON.stringify(p).includes('BEGIN PRIVATE KEY'));
});
test('state and protected signing keys survive a child-process restart',async()=>{
  const prior=await status();
  await stop();
  await launch();
  const afterRestart=await status();
  assert.equal(afterRestart.signedSequence,prior.signedSequence);
  assert.equal(afterRestart.signedHeadDigest,prior.signedHeadDigest);
});
test('rollback of the committed HEAD record blocks daemon startup',async()=>{
  await stop();
  const file=path.join(root,'head','checkpoint-000000000003.json');
  const saved=await fs.readFile(file);
  await fs.unlink(file);
  try{
    await assert.rejects(launch(),/exited|timeout/i);
  }finally{
    await fs.writeFile(file,saved,{mode:0o600});
  }
  await launch();
  assert.equal((await status()).signedSequence,3);
});
const pinnedPublicKeys={
  ledgerPublicKey:publicPem(roles.ledger.publicKey),
  headPublicKey:publicPem(roles.head.publicKey),
  pinPublicKey:publicPem(roles.pin.publicKey),
};
function fencedFixtureReader(outboxCounts){
  return createFictionalAuthorityReader({
    root,captureRegistry:registry,locations:places,keys:pinnedPublicKeys,
    getCommittedOutbox:async()=>outboxCounts.map(n=>({
      manifest:event(n).manifest,tombstones:event(n).tombstones,
    })),
    mintAuthorizedProofClaim:async minimumSequence=>makeFictionalOutboxClaim({
      schema:'SOULLAB-R20-R4-FICTIONAL-RECOVERY-PROOF-V1',
      nonce:nonce(),minimumSequence,
    },readerKey.privateKey,readerKey.publicKey),
  });
}
function restoredFixtureInputs(readCurrentAuthorityInputs,beforeFence){
  return {
    target:SYNTHETIC_TARGET,
    archive:{
      type:'SYNTHETIC_CONTENT_FREE_ARCHIVE',
      archiveId:'fixture-r4-paired-recovery',
      captureGeneration:'fixture-g1',
      capturedDeletionSequence:3,
      fixtureDigest:'b'.repeat(64),containsMemberData:false,
    },
    readCurrentAuthorityInputs,beforeFence,
    withExclusiveDeletionPublicationFence:async callback=>
      callback('R20_SYNTHETIC_EXCLUSIVE_FENCE_HELD'),
    acknowledgeSyntheticPublication:async()=> 'R20_SYNTHETIC_RECEIPT_ONLY',
  };
}
test('R4 service proofs integrate with R3I double-checked restore fence',async()=>{
  const outbox=[1,2,3];
  const result=await rehearseR20FencedRestore(
    restoredFixtureInputs(fencedFixtureReader(outbox)),
  );
  assert.equal(result.productionPromotionAllowed,false);
  assert.equal(result.actualArchiveRestored,false);
  assert.equal(result.observedDeletionSequence,3);
});

test('a newly signed deletion between stage and publish blocks a restore',async()=>{
  const outbox=[1,2,3];
  const beforeFence=async()=>{
    const prior=(await status()).signedHeadDigest;
    const r=await append(claim(4,prior));
    assert.equal(r.signedSequence,4);
    outbox.push(4);
  };
  await assert.rejects(
    rehearseR20FencedRestore(restoredFixtureInputs(
      fencedFixtureReader(outbox),beforeFence,
    )),/authority_changed_since_restore_preparation/i,
  );
  assert.equal((await status()).signedSequence,4);
});

test('R4 restore bridge refuses missing committed outbox census',async()=>{
  const read=createFictionalAuthorityReader({
    root,captureRegistry:registry,locations:places,keys:pinnedPublicKeys,
    getCommittedOutbox:async()=>[],
    mintAuthorizedProofClaim:async()=>null,
  });
  await assert.rejects(rehearseR20FencedRestore(
    restoredFixtureInputs(read),
  ),/independent_authority_unavailable/i);
});

test('rollback of witness high-water blocks signer restart even with intact ledger',async()=>{
  const n=(await status()).signedSequence;
  await stop();
  const file=path.join(root,'independent-witness-same-host-fixture',
    'checkpoint-'+String(n).padStart(12,'0')+'.json');
  const saved=await fs.readFile(file);
  await fs.unlink(file);
  try{
    await assert.rejects(launch(),/exited|timeout/i);
  }finally{
    await fs.writeFile(file,saved,{mode:0o600});
  }
  await launch();
  assert.equal((await status()).signedSequence,n);
});

test('unauthorized external device paths are not a client fallback',async()=>{
  await assert.rejects(callFixtureSigner({
    root:'/Volumes/LaCie',request:{action:'PUBLIC_FIXTURE_STATUS'},timeoutMs:500,
  }),deny);
});
