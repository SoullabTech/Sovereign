import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { readFileSync } from 'node:fs';
import { seal } from '../../../lib/recovery/r20-r2/signedLedger.mjs';
import {
  TARGET as AUTH_TARGET, appendDurableFixtureCheckpoint,
} from '../../../lib/recovery/r20-r3/durableFixtureAuthority.mjs';
import {
  TARGET, verifySyntheticPairedSourceSnapshot,
} from '../../../lib/recovery/r20-r3/syntheticPairedVaultRecovery.mjs';

const registry = JSON.parse(readFileSync(new URL(
  '../../../lib/recovery/r20-r3/writer-studio-captured-graph-20261013.json',
  import.meta.url,
)));
const pks = Array.from({length:3},()=>generateKeyPairSync('ed25519'));
const keys = {
  ledgerPublicKey:pks[0].publicKey, headPublicKey:pks[1].publicKey,
  pinPublicKey:pks[2].publicKey,
};
const signers = {
  ledger: async p=>seal(p,pks[0].privateKey,pks[0].publicKey),
  head: async p=>seal(p,pks[1].privateKey,pks[1].publicKey),
  pin: async p=>seal(p,pks[2].privateKey,pks[2].publicKey),
};
const locations = {
  ledger:'https://fictional-event.example.invalid/v1',
  head:'https://fictional-head.example.invalid/v1',
  pin:'https://fictional-pin.example.invalid/v1',
};
const event = [{
  sequence:1, manifest:'10000000-0000-4000-8000-000000000001',
  tombstones:[{
    table:'member_manuscripts',
    id:'20000000-0000-4000-8000-000000000002',
  }],
}];
const W1='60000000-0000-4000-8000-000000000006';
const W2='70000000-0000-4000-8000-000000000007';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const b1=Buffer.from('FICTIONAL: DOCX original one: chapter A');
const b2=Buffer.from('FICTIONAL: DOCX original two: chapter B');
const tx1='FICTIONAL: First extracted passage.';
const tx2='FICTIONAL: Second extracted passage.';
const tx3='FICTIONAL: Pasted notes without an original file.';

function archive() {
  return {
    type:'FICTIONAL_DB_VAULT_PAIR',containsMemberData:false,
    generation:'fixture-generation-g1',legacyReconstructiveCopies:0,
    expected:{works:2,sources:3,files:2},
    database:{
      generation:'fixture-generation-g1', commitFence:'fixture-fence-g1',
      works:[{id:W1},{id:W2}],
      sources:[
        {id:'fixture-source-one',kind:'artifact',workId:W1,
         sourceText:tx1,sourceTextHash:sha(Buffer.from(tx1)),artifactHash:sha(b1)},
        {id:'fixture-source-two',kind:'artifact',workId:W2,
         sourceText:tx2,sourceTextHash:sha(Buffer.from(tx2)),artifactHash:sha(b2)},
        {id:'fixture-source-three',kind:'paste',workId:W1,
         sourceText:tx3,sourceTextHash:sha(Buffer.from(tx3)),artifactHash:null},
      ],
    },
    sourceVault:{
      generation:'fixture-generation-g1', commitFence:'fixture-fence-g1',
      artifacts:[
        {id:'fixture-source-one',dataBase64:b1.toString('base64')},
        {id:'fixture-source-two',dataBase64:b2.toString('base64')},
      ],
    },
  };
}
async function fixture() {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'r20-r3j-fixture-'));
  const authority={root,captureRegistry:registry,locations,keys};
  await appendDurableFixtureCheckpoint({
    target:AUTH_TARGET,...authority,committedOutbox:event,signers,
  });
  return {
    root,
    read:{...authority,completeCommittedOutbox:event},
    check:(a=archive(),read=authority)=>verifySyntheticPairedSourceSnapshot({
      target:TARGET,snapshot:a,authorityRead:{...read,completeCommittedOutbox:event},
    }),
  };
}
async function scenario(fn) {
  const f=await fixture();
  try {await fn(f);} finally {await fs.rm(f.root,{recursive:true,force:true});}
}
const denied = /R20.*refused/i;
test('complete fictional DB + vault restores all surviving Works and original bytes',async()=>{
  await scenario(async f=>{
    const x=await f.check();
    assert.equal(x.state,'R20_R3J_FICTIONAL_COMPLETE_PAIR_ONLY');
    assert.equal(x.restoredFictionalWorks,2);
    assert.equal(x.verifiedFictionalSources,3);
    assert.equal(x.verifiedFictionalOriginalFiles,2);
    assert.equal(x.productionPromotionAllowed,false);
    assert.equal(x.realVaultRecovered,false);
    assert.equal(x.historicalBackupsRemediated,false);
  });
});
async function no(name,mutate){
  await test(name,async()=>{
    await scenario(async f=>{
      const a=archive();
      mutate(a,f);
      await assert.rejects(f.check(a),denied);
    });
  });
}
await no('database snapshot generation differs from Source vault',a=>{a.sourceVault.generation='fixture-generation-old';});
await no('database/vault commit fences differ',a=>{a.sourceVault.commitFence='fixture-other-fence';});
await no('missing file-backed original Source is refused',a=>{
  a.sourceVault.artifacts.pop();a.expected.files=1;
});
await no('extra orphaned Source file is refused',a=>{
  a.sourceVault.artifacts.push({id:'fixture-unclaimed',dataBase64:b1.toString('base64')});
  a.expected.files=3;
});
await no('binary original hash mismatch is refused',a=>{
  a.sourceVault.artifacts[0].dataBase64=b2.toString('base64');
});
await no('invalid original base64 encoding is refused',a=>{
  a.sourceVault.artifacts[0].dataBase64='%%%bad';
});
await no('paste claiming original file is refused',a=>{
  a.database.sources[2].artifactHash=sha(b1);
});
await no('extracted source text hash mismatch is refused',a=>{
  a.database.sources[0].sourceText += 'CHANGED';
});
await no('duplicate source reference is refused',a=>{
  a.database.sources[1].id=a.database.sources[0].id;
});
await no('unclaimed Source without Work is refused',a=>{
  a.database.sources[1].workId='fixture-unclaimed';
});
await no('signed deleted Work cannot be recovered from old archive',a=>{
  const deleted='20000000-0000-4000-8000-000000000002';
  a.database.works[0].id=deleted;
  a.database.sources[0].workId=deleted;
  a.database.sources[2].workId=deleted;
});
await no('historical plaintext SQL copy forces refusal',a=>{
  a.legacyReconstructiveCopies=32;
});
await no('unknown legacy archive count forces refusal',a=>{
  a.legacyReconstructiveCopies=null;
});
await no('incorrect aggregate counts cannot be declared complete',a=>{
  a.expected.sources=2;
});
await no('member data or real snapshot are not accepted',a=>{
  a.containsMemberData=true;
});
await no('invented Work title outside fictional schema is refused',a=>{
  a.database.sources[1].sourceText='Member real words';
});
test('unavailable deletion signer records refuse complete restore',async()=>{
  await scenario(async f=>{
    await fs.rm(path.join(f.root,'pin','checkpoint-000000000001.json'));
    await assert.rejects(f.check(),denied);
  });
});
test('a caller-supplied authority approval flag is not accepted',async()=>{
  await scenario(async f=>{
    await assert.rejects(
      verifySyntheticPairedSourceSnapshot({
        target:TARGET,snapshot:archive(),authorityRead:null,
        authority:{state:'approved',productionPromotionAllowed:true},
      }),
      denied,
    );
  });
});
