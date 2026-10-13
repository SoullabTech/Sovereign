import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {seal,digest} from '../../../lib/recovery/r20-r2/signedLedger.mjs';
import {LEDGER_FORMAT,HEAD_FORMAT,registryDigest} from '../../../lib/recovery/r20-r3/capturedLedger.mjs';
import {
  PIN_FORMAT,readAndAdmitExternalCapturedAuthority,
} from '../../../lib/recovery/r20-r3/externalAnchorBoundary.mjs';

const registry=JSON.parse(readFileSync(
  new URL('../../../lib/recovery/r20-r3/writer-studio-captured-graph-20261013.json',import.meta.url)
));
const l=generateKeyPairSync('ed25519');
const h=generateKeyPairSync('ed25519');
const p=generateKeyPairSync('ed25519');
const OTHER=generateKeyPairSync('ed25519');
const MID='20000000-0000-4000-8000-000000000001';
const MANIFEST='30000000-0000-4000-8000-000000000002';
const event={sequence:1,manifest:MANIFEST,tombstones:[
  {table:'member_manuscripts',id:MID},
  {table:'manuscript_source_arrivals',id:'40000000-0000-4000-8000-000000000003'},
]};
const endpoints={
  ledger:'https://ledger-isolated.example.invalid/v1',
  head:'https://checkpoint-independent.example.invalid/v1',
  pin:'https://highwater-custody.example.invalid/v1',
};
const basePins=()=>({
  ledgerPublicKey:l.publicKey,
  headPublicKey:h.publicKey,
  pinPublicKey:p.publicKey,
});
function input(){
  const contractDigest=registryDigest(registry);
  const ledger={schema:LEDGER_FORMAT,sequence:1,captureRegistryDigest:contractDigest,events:[event]};
  const head={schema:HEAD_FORMAT,sequence:1,captureRegistryDigest:contractDigest,
    ledgerDigest:digest(ledger),issuedBy:'SYNTHETIC_EXTERNAL_CHECKPOINT'};
  const pin={schema:PIN_FORMAT,registryDigest:contractDigest,
    headDigest:digest(head),minimumSequence:1};
  return {
    captureRegistry:registry,
    locations:{...endpoints},
    keys:basePins(),
    transport:{
      getLedger:async()=>seal(ledger,l.privateKey,l.publicKey),
      getHead:async()=>seal(head,h.privateKey,h.publicKey),
      getPin:async()=>seal(pin,p.privateKey,p.publicKey),
    },
    completeCommittedOutbox:[{manifest:MANIFEST,tombstones:event.tombstones}],
  };
}
test('three separately signed synthetic witnesses validate one complete committed outbox',async()=>{
 const result=await readAndAdmitExternalCapturedAuthority(input());
 assert.equal(result.state,'R20_EXTERNAL_ANCHOR_CONTRACT_SYNTHETIC_VERIFIED');
 assert.equal(result.witnessOriginCount,3);
 assert.equal(result.independentKeyRoleCount,3);
 assert.equal(result.coveredOutboxCount,1);
 assert.equal(result.signedCaptureRelations,44);
 assert.equal(result.productionPromotionAllowed,false);
 assert.equal(result.physicallyIndependentSignerCertified,false);
});
function deny(name,mutate){
 test('fail closed: '+name,async()=>{
  const x=input();
  mutate(x);
  await assert.rejects(readAndAdmitExternalCapturedAuthority(x),/R20 .*refused/i);
 });
}
deny('signer endpoint and independent pin share a host',x=>{
 x.locations.pin='https://ledger-isolated.example.invalid/another/path';
});
deny('HTTP without TLS',x=>{
 x.locations.head='http://checkpoint-independent.example.invalid/v1';
});
deny('loopback cannot be external authority',x=>{
 x.locations.pin='https://localhost/v1';
});
deny('missing independently pinned public key',x=>{
 delete x.keys.pinPublicKey;
});
deny('same signer and independent-head key',x=>{
 x.keys.headPublicKey=x.keys.ledgerPublicKey;
});
deny('pin key is untrusted even when other signatures are sound',x=>{
 x.keys.pinPublicKey=OTHER.publicKey;
});
deny('independent high-water witness unavailable',x=>{
 x.transport.getPin=async()=>{throw Error('synthetic local network disconnect');};
});
deny('signed head unavailable',x=>{
 x.transport.getHead=async()=>{throw Error('synthetic remote outage');};
});
deny('ledger endpoint unavailable',x=>{
 x.transport.getLedger=async()=>{throw Error('synthetic remote outage');};
});
deny('pinned checkpoint signed by trusted key but stale vs ledger',x=>{
 const dig=registryDigest(registry);
 const stale={schema:PIN_FORMAT,registryDigest:dig,headDigest:'0'.repeat(64),minimumSequence:1};
 x.transport.getPin=async()=>seal(stale,p.privateKey,p.publicKey);
});
deny('high-water floor higher than signed ledger',x=>{
 const dig=registryDigest(registry);
 const led={schema:LEDGER_FORMAT,sequence:1,captureRegistryDigest:dig,events:[event]};
 const hd={schema:HEAD_FORMAT,sequence:1,captureRegistryDigest:dig,
   ledgerDigest:digest(led),issuedBy:'SYNTHETIC_EXTERNAL_CHECKPOINT'};
 const high={schema:PIN_FORMAT,registryDigest:dig,headDigest:digest(hd),minimumSequence:2};
 x.transport.getPin=async()=>seal(high,p.privateKey,p.publicKey);
});
deny('signed pin modified after signature',x=>{
 x.transport.getPin=async()=>{
  const pin={schema:PIN_FORMAT,registryDigest:registryDigest(registry),
    headDigest:'0'.repeat(64),minimumSequence:1};
  const signed=seal(pin,p.privateKey,p.publicKey);
  signed.payload.minimumSequence=2;
  return signed;
 };
});
deny('outbox has committed row not witnessed in ledger',x=>{
 x.completeCommittedOutbox=[{
  manifest:'50000000-0000-4000-8000-000000000004',
  tombstones:[{table:'member_manuscripts',id:MID}],
 }];
});
deny('outbox census missing',x=>{
 x.completeCommittedOutbox=[];
});
deny('outbox survivor identity mismatch with signed event',x=>{
 x.completeCommittedOutbox=[{
   manifest:MANIFEST,
   tombstones:[{table:'member_manuscripts',id:MID}],
 }];
});
deny('invalid or missing transport',x=>{
 x.transport=null;
});

/**
 * R20-R3B red-team: distinct HTTPS URLs can still name the local host.
 * Reject obvious loopback/unspecified IP literals before consulting any
 * signing service. This is not proof of independent DNS or physical custody.
 */
for (const [name, origin] of [
  ['127/8 alternate loopback', 'https://127.0.0.2/v1'],
  ['wildcard IPv4 address', 'https://0.0.0.0/v1'],
  ['IPv6 unspecified address', 'https://[::]/v1'],
  ['IPv4-mapped IPv6 loopback', 'https://[::ffff:127.0.0.1]/v1'],
]) {
  deny(name + ' is not independent custody', x => {
    x.locations.pin = origin;
  });
}
