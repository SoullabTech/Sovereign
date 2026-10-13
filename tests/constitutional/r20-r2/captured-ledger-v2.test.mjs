import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  seal, digest,
} from '../../../lib/recovery/r20-r2/signedLedger.mjs';
import {
  REGISTRY_FORMAT, LEDGER_FORMAT, HEAD_FORMAT,
  registryDigest, validCapturedIdentity, admitCapturedDeletionAuthority,
  assertOutboxCovered, RECOVERY_STATUS,
} from '../../../lib/recovery/r20-r3/capturedLedger.mjs';

const registry = JSON.parse(readFileSync(
  new URL('../../../lib/recovery/r20-r3/writer-studio-captured-graph-20261013.json',import.meta.url)
));
const keys = generateKeyPairSync('ed25519');
const anchorKeys = generateKeyPairSync('ed25519');
const wrongKeys = generateKeyPairSync('ed25519');
const M = '10000000-0000-4000-8000-000000000001';
const W = '20000000-0000-4000-8000-000000000002';
const A = '30000000-0000-4000-8000-000000000003';
const B = '40000000-0000-4000-8000-000000000004';
const C = '50000000-0000-4000-8000-000000000005';
const M1 = '60000000-0000-4000-8000-000000000006';
const M2 = '70000000-0000-4000-8000-000000000007';

const event1 = () => ({
  sequence: 1,manifest:M1,tombstones: [
    {table:'member_manuscripts',id:M},
    {table:'manuscript_source_arrivals',id:A},
    {table:'writer_studio_work_directive_events',id:'9223372036854775807'},
    {table:'ask_turns',id:B + ':1'},
    {table:'writer_studio_place_returns',id:C + ':' + W + ':' + M},
  ],
});
const event2 = () => ({
  sequence:2,manifest:M2,tombstones:[{table:'living_works',id:W}],
});

function make(overrides={}) {
  const reg = structuredClone(overrides.registry ?? registry);
  const regDigest = registryDigest(reg);
  const ledger={
    schema:LEDGER_FORMAT,sequence:2,captureRegistryDigest:regDigest,
    events:structuredClone(overrides.events ?? [event1(),event2()]),
  };
  if (overrides.ledgerMutate) overrides.ledgerMutate(ledger);
  const head={
    schema:HEAD_FORMAT,sequence:ledger.sequence,captureRegistryDigest:regDigest,
    ledgerDigest:digest(ledger),issuedBy:'EPHEMERAL_SYNTHETIC_ANCHOR',
  };
  if (overrides.headMutate) overrides.headMutate(head);
  return {
    registry: reg,
    sealedLedger:seal(ledger,keys.privateKey,keys.publicKey),
    sealedHead:seal(head,anchorKeys.privateKey,anchorKeys.publicKey),
    ledgerPublicKey:keys.publicKey,headPublicKey:anchorKeys.publicKey,
    independentlyPinnedRegistryDigest:regDigest,
    independentlyPinnedHeadDigest:digest(head),
    independentlyPinnedMinimumSequence:2,
  };
}
function refusal(label,patch) {
  test('fail-closed: '+label,() => {
    const input=make();
    patch(input);
    assert.throws(()=>admitCapturedDeletionAuthority(input),/R20 .*refused/i);
  });
}
test('captures exact 44-table staged Work/Manuscript registry',()=>{
  assert.equal(registry.schema,REGISTRY_FORMAT);
  assert.equal(registry.tables.length,44);
  assert.equal(registry.tables.filter(t=>t.primaryKey.length>1).length,6);
  assert.match(registryDigest(registry),/^[a-f0-9]{64}$/);
  assert.equal(RECOVERY_STATUS.unconditionalProductionRelease,false);
});

test('validly signed full-schema identity graph admitted, production remains denied',()=>{
  const result=admitCapturedDeletionAuthority(make());
  assert.equal(result.state,'CAPTURED_SIGNED_AUTHORITY_VERIFIED_CONDITIONALLY');
  assert.equal(result.capturedTableCount,44);
  assert.equal(result.tombstoneCount,6);
  assert.equal(result.sequence,2);
  assert.equal(result.productionPromotionAllowed,false);
  assert.equal(result.productionSignerCertified,false);
  assert.deepEqual(result.events[0].tombstones[3],
    {table:'ask_turns',id:B+':1'});
});
test('handles composite, signed 32/64-bit and UUID primary keys without accepting prose',()=>{
  const types={
    uuid:[{column:'id',pgType:'uuid'}],
    composite:[{column:'first',pgType:'uuid'},{column:'second',pgType:'int4'}],
    bigint:[{column:'id',pgType:'int8'}],
  };
  for(const value of ['1','0','-13','9223372036854775807','-9223372036854775808']){
    assert.equal(validCapturedIdentity(types.bigint,value),true);
  }
  for(const value of ['9223372036854775808','-9223372036854775809','01','+1','123 words']){
    assert.equal(validCapturedIdentity(types.bigint,value),false);
  }
  assert.equal(validCapturedIdentity(types.composite,B+':2'),true);
  assert.equal(validCapturedIdentity(types.composite,B+':2147483648'),false);
  assert.equal(validCapturedIdentity(types.uuid, M),true);
  assert.equal(validCapturedIdentity(types.uuid,'author: Chapter 10'),false);
});

refusal('missing independent registry commitment',x=>{delete x.independentlyPinnedRegistryDigest;});
refusal('altered registry without a new independent pin',x=>{x.registry.tables[0].primaryKey[0].column='other';});
refusal('unknown registered table in registry snapshot',x=>{x.registry.tables.push({table:'unreviewed_private_work',primaryKey:[{column:'id',pgType:'uuid'}]});});
refusal('untrusted head signer',x=>{x.headPublicKey=wrongKeys.publicKey;});
refusal('same key for ledger and independent head',x=>{x.headPublicKey=x.ledgerPublicKey;});
refusal('missing signed ledger',x=>{delete x.sealedLedger;});
refusal('missing independent highwater',x=>{delete x.independentlyPinnedMinimumSequence;});
refusal('externally pinned highwater newer than signed head',x=>{x.independentlyPinnedMinimumSequence=3;});
refusal('externally pinned signed head differs',x=>{x.independentlyPinnedHeadDigest='0'.repeat(64);});
refusal('tampered signed target after signing',x=>{x.sealedLedger.payload.events[0].tombstones[0].id=B;});
refusal('tampered signed head after signing',x=>{x.sealedHead.payload.captureRegistryDigest='0'.repeat(64);});
refusal('content-bearing target despite validly resigned messages',x=>{
  Object.assign(x,make({events:[{
    ...event1(), tombstones:[
      {table:'member_manuscripts',id:M},
      {table:'manuscript_source_arrivals',id:'Chapter 10 — private manuscript text'},
    ],
  },event2()]}));
});
refusal('unknown table even when signed',x=>{
  Object.assign(x,make({events:[{
    ...event1(),tombstones:[
      {table:'member_manuscripts',id:M},
      {table:'a_new_private_child',id:A},
    ],
  },event2()]}));
});
refusal('duplicate deletion identity even when signed',x=>{
  Object.assign(x,make({events:[event1(),{
    ...event2(),tombstones:[{table:'living_works',id:W},{table:'member_manuscripts',id:M}],
  }]}));
});
refusal('missing parent root in an otherwise signed deletion event',x=>{
  Object.assign(x,make({events:[{
    ...event1(),tombstones:[{table:'manuscript_source_arrivals',id:A}],
  },event2()]}));
});
refusal('out-of-order event sequence with valid signatures',x=>{
  Object.assign(x,make({events:[event1(),{...event2(),sequence:3}]}));
});
refusal('free-text field smuggled into signed event',x=>{
  Object.assign(x,make({events:[{...event1(),manuscriptTitle:'Private Title'},event2()]}));
});
refusal('unsupported key type injected into published registry',x=>{
  x.registry.tables[0].primaryKey[0].pgType='text';
});
refusal('private-only PEM attempted as public signer anchor',x=>{
  x.headPublicKey=anchorKeys.privateKey.export({format:'pem',type:'pkcs8'});
});

test('outbox comparison succeeds only for exact committed rows and tombstones',()=>{
  const admitted=admitCapturedDeletionAuthority(make());
  const items=[event1(),event2()].map(e=>({manifest:e.manifest,tombstones:e.tombstones}));
  const result=assertOutboxCovered(admitted,items);
  assert.equal(result.allPresentedObligationsAnchored,true);
  assert.equal(result.count,2);
  assert.equal(result.productionPromotionAllowed,false);
});

test('outbox cannot claim an unsigned committed deletion was acknowledged',()=>{
  const admitted=admitCapturedDeletionAuthority(make());
  const extra={manifest:'80000000-0000-4000-8000-000000000008',
    tombstones:[{table:'member_manuscripts',id:'90000000-0000-4000-8000-000000000009'}]};
  assert.throws(()=>assertOutboxCovered(admitted,[extra]),/refused/);
});
test('outbox cannot omit recorded cascading tombstones',()=>{
  const admitted=admitCapturedDeletionAuthority(make());
  assert.throws(()=>assertOutboxCovered(admitted,[{
    manifest:M1,tombstones:[{table:'member_manuscripts',id:M}],
  }]),/refused/);
});

test('outbox refuses a partial census even when all presented entries match',()=>{
  const admitted=admitCapturedDeletionAuthority(make());
  assert.throws(()=>assertOutboxCovered(admitted,[{
    manifest:M1,tombstones:event1().tombstones,
  }]),/refused/);
  assert.throws(()=>assertOutboxCovered(admitted,[]),/refused/);
});
