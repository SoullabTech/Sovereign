/**
 * R20-R4 — signer engine for a separate FICTIONAL local socket process.
 *
 * Signs only externally attested, bounded deletion events. A second fixture
 * witness copy is required to match the durable commit. Both are on the SAME
 * test host, so this is NOT physically independent monotonic custody.
 *
 * Production access or actual member deletion is categorically prohibited.
 */
import { promises as fs, constants } from 'node:fs';
import path from 'node:path';
import { createPrivateKey, createPublicKey, verify } from 'node:crypto';
import {
  seal, canonicalJSON, digest, keyFingerprint,
} from '../r20-r2/signedLedger.mjs';
import { TARGET as STORE_TARGET,
  appendDurableFixtureCheckpoint,readDurableFixtureAuthority,
} from '../r20-r3/durableFixtureAuthority.mjs';
import {
  REQUEST_SCHEMA,GENESIS_HEAD,reject,verifyAuthorizedOutboxClaim,
  verifyJsonRequestShape,
} from './signerProtocol.mjs';

export const SERVICE_TARGET='SOULLAB_R20_R4_FIXTURE_SIGNER_ONLY';
const FILE=/^checkpoint-([0-9]{12})\.json$/;
const NONCE=/^[0-9a-f]{32}$/;
const PROOF_SCHEMA='SOULLAB-R20-R4-FICTIONAL-RECOVERY-PROOF-V1';
const exact=(obj,keys)=>!!obj && typeof obj==='object' && !Array.isArray(obj) &&
  Object.keys(obj).length===keys.length &&
  keys.every(k=>Object.prototype.hasOwnProperty.call(obj,k));
const witnessName=n=>'checkpoint-'+String(n).padStart(12,'0')+'.json';

async function syncedCreate(dir,name,document) {
  let fd;
  try {
    fd=await fs.open(path.join(dir,name),
      constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|
      (constants.O_NOFOLLOW||0),0o600);
    await fd.writeFile(canonicalJSON(document),'utf8');
    await fd.sync();
  } catch {reject('signed independent-witness fixture write refused');}
  finally {if(fd)await fd.close();}
  const d=await fs.open(dir,constants.O_RDONLY);
  try{await d.sync();}finally{await d.close();}
}
async function census(dir) {
  const entries=(await fs.readdir(dir)).sort();
  for (let i=0;i<entries.length;i++) {
    const m=FILE.exec(entries[i]);
    if(!m || Number(m[1])!==i+1) reject('missing or rolled-back witness generation');
    const s=await fs.lstat(path.join(dir,entries[i]));
    if(!s.isFile()||s.isSymbolicLink()) reject('unsafe witness file type');
  }
  return entries;
}
export function publicKeyBundle(keys) {
  return Object.freeze(Object.fromEntries(
    Object.entries(keys).map(([role,value])=>[
      role,createPublicKey(value).export({type:'spki',format:'pem'}),
    ]),
  ));
}
export function signingCallbacks(privateKeys) {
  return Object.fromEntries(['ledger','head','pin'].map(role=>[
    role,async payload=>seal(payload,privateKeys[role],
      createPublicKey(privateKeys[role])),
  ]));
}
export async function buildFixtureSignerEngine({
  root, captureRegistry,locations,privatePem,issuerPublicPem,
  recoveryPublicPem,
}) {
  const privates=Object.fromEntries(['ledger','head','pin'].map(role=>{
    if(typeof privatePem?.[role]!=='string' ||
      !privatePem[role].includes('BEGIN PRIVATE KEY')) {
      reject('fixture signing key missing');
    }
    return [role,createPrivateKey(privatePem[role])];
  }));
  const issuerPublicKey=createPublicKey(issuerPublicPem);
  const recoveryPublicKey=createPublicKey(recoveryPublicPem);
  const publicRoles=publicKeyBundle(privates);
  const keys={
    ledgerPublicKey:publicRoles.ledger,
    headPublicKey:publicRoles.head,
    pinPublicKey:publicRoles.pin,
  };
  if(new Set(Object.values(keys).map(keyFingerprint)).size!==3 ||
      keyFingerprint(issuerPublicKey)===keyFingerprint(recoveryPublicKey) ||
      Object.values(keys).some(p=>keyFingerprint(p)===
        keyFingerprint(issuerPublicKey) || keyFingerprint(p)===
        keyFingerprint(recoveryPublicKey))) {
    reject('role separation keys not distinct');
  }
  const witnessDir=path.join(root,'independent-witness-same-host-fixture');
  const readNonceDir=path.join(root,'signed-read-nonces');
  for(const dir of [witnessDir,readNonceDir]){
    try{await fs.mkdir(dir,{mode:0o700});}
    catch(error){if(error.code!=='EEXIST') reject('witness directory unavailable');}
    const stat=await fs.lstat(dir);
    if(!stat.isDirectory() || stat.isSymbolicLink())reject('unsafe witness directory');
  }

  const common={
    target:STORE_TARGET,root,captureRegistry,locations,keys,
  };
  async function state() {
    const witness=await census(witnessDir);
    // A stale root or missing witness is a STOP even if all signed fixture
    // folders were rolled back together. No automatic reconciliation.
    // Check every published role, including a partial/crashed generation
    // that has no commit marker yet. Status must never declare that clean.
    for (const role of ['ledger','head','pin','commit']) {
      let objects;
      try{objects=(await fs.readdir(path.join(root,role))).sort();}
      catch(e){if(e.code==='ENOENT')objects=[];else reject('checkpoint unreadable');}
      if(objects.length!==witness.length ||
          objects.some((v,i)=>v!==witnessName(i+1))) {
        reject('checkpoint and witness high-water disagree');
      }
    }
    if(witness.length===0) return {
      sequence:0,headDigest:GENESIS_HEAD,outbox:[],usedNonces:new Set(),
      checkpoint:null,commitCount:0,
    };
    const n=witness.length;
    let latestLedger;
    try{latestLedger=JSON.parse(await fs.readFile(
      path.join(root,'ledger',witnessName(n)),'utf8'));}
    catch{reject('missing signed ledger at high-water');}
    const outbox=latestLedger?.payload?.events;
    if(!Array.isArray(outbox) || outbox.length!==n)
      reject('incomplete committed-outbox history');
    let admitted;
    try{admitted=await readDurableFixtureAuthority({
      ...common, completeCommittedOutbox:outbox,
    });}
    catch{reject('invalid signed committed checkpoint');}
    if(admitted.signedSequence!==n)reject('witness sequence mismatch');
    const seen=new Set();
    for(let i=1;i<=n;i++){
      let w;
      try{w=JSON.parse(await fs.readFile(
        path.join(witnessDir,witnessName(i)),'utf8'));}
      catch{reject('witness checkpoint corrupt');}
      if(!exact(w,['schema','sequence','nonce','headDigest','signedPinDigest']) ||
        w.schema!=='R20_R4_SYNTHETIC_HIGHWATER_WITNESS_V1' ||
        w.sequence!==i || typeof w.nonce!=='string' ||
        !NONCE.test(w.nonce) || seen.has(w.nonce)) {
        reject('invalid or repeated witness nonce');
      }
      seen.add(w.nonce);
      let signedHead,signedPin;
      try{
        signedHead=JSON.parse(await fs.readFile(
          path.join(root,'head',witnessName(i)),'utf8'));
        signedPin=JSON.parse(await fs.readFile(
          path.join(root,'pin',witnessName(i)),'utf8'));
      }catch{reject('missing signed witness commitments');}
      if(w.headDigest!==digest(signedHead.payload) ||
        w.signedPinDigest!==digest(signedPin)) {
        reject('independent witness and signed checkpoint differ');
      }
      if(i===n && w.headDigest!==admitted.signedHeadDigest)
        reject('latest signed head is not externally witnessed');
    }
    return {
      sequence:n,headDigest:admitted.signedHeadDigest,outbox,
      usedNonces:seen,checkpoint:admitted.checkpoint,commitCount:n,
    };
  }

  async function appendSignedClaim(envelope) {
    const payload=verifyAuthorizedOutboxClaim(envelope,
      issuerPublicKey,captureRegistry);
    const prior=await state();
    if(payload.sequence!==prior.sequence+1 ||
      payload.priorHeadDigest!==prior.headDigest ||
      prior.usedNonces.has(payload.nonce) ||
      prior.outbox.some(e=>e.manifest===payload.event.manifest)) {
      reject('stale, replayed or conflicting deletion proposal');
    }
    const outbox=[...prior.outbox,payload.event];
    let completed;
    try{completed=await appendDurableFixtureCheckpoint({
      ...common,committedOutbox:outbox,
      signers:signingCallbacks(privates),
    });}
    catch{reject('durable checkpoint publication failed');}
    // If this write fails after the committed triplet, a future restart
    // MUST REFUSE rather than make up a missing independent witness.
    const persistedPin=JSON.parse(await fs.readFile(
      path.join(root,'pin',witnessName(payload.sequence)),'utf8'));
    await syncedCreate(witnessDir,witnessName(payload.sequence),{
      schema:'R20_R4_SYNTHETIC_HIGHWATER_WITNESS_V1',
      sequence:payload.sequence,nonce:payload.nonce,
      headDigest:completed.signedHeadDigest,
      signedPinDigest:digest(persistedPin),
    });
    const accepted=await state();
    if(accepted.sequence!==payload.sequence)reject('witness commit not durable');
    return Object.freeze({
      status:'FICTIONAL_SIGNED_DELETION_COMMITTED',
      signedSequence:accepted.sequence,
      signedHeadDigest:accepted.headDigest,
      independentCustodyCertified:false,
      memberDeletionPerformed:false,
      productionPromotionAllowed:false,
    });
  }

  async function readFictionalProof(envelope) {
    if(!exact(envelope,['payload','algorithm','signer','signature']) ||
      envelope.algorithm!=='Ed25519' ||
      envelope.signer!==keyFingerprint(recoveryPublicKey) ||
      typeof envelope.signature!=='string')
      reject('recovery witness requires separately trusted reader');
    const bytes=Buffer.from(envelope.signature,'base64');
    if(bytes.length!==64 || bytes.toString('base64')!==envelope.signature ||
      !verify(null,Buffer.from(canonicalJSON(envelope.payload),'utf8'),
        recoveryPublicKey,bytes))
      reject('invalid recovery reader signature');
    const p=envelope.payload;
    if(!exact(p,['schema','nonce','minimumSequence']) ||
      p.schema!==PROOF_SCHEMA ||
      typeof p.nonce!=='string' || !NONCE.test(p.nonce) ||
      !Number.isSafeInteger(p.minimumSequence) || p.minimumSequence<1)
      reject('malformed or unscoped recovery proof request');
    const current=await state();
    if(current.sequence<p.minimumSequence ||
        current.sequence===0)reject('stale signed recovery high-water');
    // Persist a replay guard before returning even fictional tombstone IDs.
    await syncedCreate(readNonceDir,p.nonce,{
      schema:'R20_R4_FICTIONAL_READER_NONCE_V1', nonce:p.nonce,
    });
    return Object.freeze({
      status:'FICTIONAL_SIGNED_RECOVERY_PROOF',
      signedSequence:current.sequence,
      signedHeadDigest:current.headDigest,
      sealedLedger:current.checkpoint.sealedLedger,
      sealedHead:current.checkpoint.sealedHead,
      sealedPin:current.checkpoint.sealedPin,
      productionPromotionAllowed:false,
      physicallyIndependentSignerCertified:false,
    });
  }

  return Object.freeze({
    async handle(request) {
      if(!request || typeof request!=='object' || Array.isArray(request))
        reject('invalid request body');
      if(request.action==='APPEND_FICTIONAL_DELETION') {
        return appendSignedClaim(verifyJsonRequestShape(request));
      }
      if(request.action==='READ_FICTIONAL_PROOF' &&
          request.fixtureOnly===true &&
          Object.keys(request).length===3) {
        return readFictionalProof(request.claim);
      }
      if(request.action==='PUBLIC_FIXTURE_STATUS' &&
          request.fixtureOnly===true && Object.keys(request).length===2) {
        const current=await state();
        return {
          status:'FICTIONAL_SIGNER_PROCESS_READY',
          signedSequence:current.sequence,signedHeadDigest:current.headDigest,
          publicSignerFingerprints:Object.fromEntries(
            Object.entries(keys).map(([k,v])=>[k,keyFingerprint(v)]),
          ),
          physicallyIndependentSignerCertified:false,
          productionPromotionAllowed:false,
        };
      }
      reject('unsupported operation or privilege');
    },
    verifyStartup:state,
    publicKeys:keys,
    proofSchema:PROOF_SCHEMA,
    issuerFingerprint:keyFingerprint(issuerPublicKey),
    recoveryReaderFingerprint:keyFingerprint(recoveryPublicKey),
  });
}
