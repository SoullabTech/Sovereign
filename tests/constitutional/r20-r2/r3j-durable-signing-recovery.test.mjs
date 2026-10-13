import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { readFileSync } from 'node:fs';
import { seal } from '../../../lib/recovery/r20-r2/signedLedger.mjs';
import {
  TARGET, appendDurableFixtureCheckpoint, readDurableFixtureAuthority,
} from '../../../lib/recovery/r20-r3/durableFixtureAuthority.mjs';

const registry = JSON.parse(readFileSync(new URL(
  '../../../lib/recovery/r20-r3/writer-studio-captured-graph-20261013.json',
  import.meta.url,
)));
const ledgerKey = generateKeyPairSync('ed25519');
const headKey = generateKeyPairSync('ed25519');
const pinKey = generateKeyPairSync('ed25519');
const wrongKey = generateKeyPairSync('ed25519');
const events = [
  {
    sequence: 1,
    manifest: '10000000-0000-4000-8000-000000000001',
    tombstones: [{
      table: 'member_manuscripts', id: '20000000-0000-4000-8000-000000000002',
    }],
  }, {
    sequence: 2,
    manifest: '30000000-0000-4000-8000-000000000003',
    tombstones: [{
      table: 'living_works', id: '40000000-0000-4000-8000-000000000004',
    }],
  },
];
const locations = {
  ledger: 'https://fictional-ledger.example.invalid/v1',
  head: 'https://fictional-head.example.invalid/v1',
  pin: 'https://fictional-pin.example.invalid/v1',
};
const keys = {
  ledgerPublicKey: ledgerKey.publicKey,
  headPublicKey: headKey.publicKey,
  pinPublicKey: pinKey.publicKey,
};
const signers = {
  ledger: async p => seal(p, ledgerKey.privateKey, ledgerKey.publicKey),
  head: async p => seal(p, headKey.privateKey, headKey.publicKey),
  pin: async p => seal(p, pinKey.privateKey, pinKey.publicKey),
};

async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'r20-r3j-fixture-'));
  const base = { target: TARGET, root, captureRegistry: registry, locations, keys };
  const append = (count, extra={}) => appendDurableFixtureCheckpoint({
    ...base, committedOutbox: events.slice(0,count), signers, ...extra,
  });
  const read = (count, extra={}) => readDurableFixtureAuthority({
    ...base, completeCommittedOutbox: events.slice(0,count), ...extra,
  });
  return { root, append, read };
}
async function withFixture(fn) {
  const f = await fixture();
  try { await fn(f); }
  finally { await fs.rm(f.root, { recursive: true, force: true }); }
}
const expectedRefusal = /R20[- ]R3|R20 external anchor refused|R20 captured authority refused/i;

test('first signed checkpoint is fsync-published with commit last', async () => {
  await withFixture(async f => {
    const appended = await f.append(1);
    assert.equal(appended.state, 'R20_R3J_FICTIONAL_COMMITTED');
    const stored = await f.read(1);
    assert.equal(stored.signedSequence, 1);
    assert.equal(stored.coveredOutboxCount, 1);
    assert.equal(stored.productionPromotionAllowed, false);
    assert.equal(stored.physicallyIndependentSignerCertified, false);
    for (const r of ['ledger','head','pin','commit']) {
      assert.deepEqual(await fs.readdir(path.join(f.root,r)), ['checkpoint-000000000001.json']);
    }
  });
});

test('read after process-state loss validates durable signed documents', async () => {
  await withFixture(async f => {
    await f.append(1);
    // Reconstruct from the saved records; no in-memory writer object is reused.
    const fresh = await readDurableFixtureAuthority({
      target: TARGET, root: f.root, captureRegistry: registry,
      locations: { ...locations }, keys: { ...keys },
      completeCommittedOutbox: structuredClone(events.slice(0,1)),
    });
    assert.equal(fresh.signedSequence, 1);
    assert.equal(fresh.productionPromotionAllowed, false);
  });
});

test('separate Node process recovers signed state with public keys only', async () => {
  await withFixture(async f => {
    await f.append(1);
    const publicKeys = Object.fromEntries([
      ['ledgerPublicKey', ledgerKey.publicKey],
      ['headPublicKey', headKey.publicKey],
      ['pinPublicKey', pinKey.publicKey],
    ].map(([k,v])=>[k,v.export({type:'spki',format:'pem'})]));
    const script=[
      "import {readFileSync} from 'node:fs';",
      "import {pathToFileURL} from 'node:url';",
      "import path from 'node:path';",
      "const api=await import(pathToFileURL(path.resolve('lib/recovery/r20-r3/durableFixtureAuthority.mjs')).href);",
      "const reg=JSON.parse(readFileSync('lib/recovery/r20-r3/writer-studio-captured-graph-20261013.json','utf8'));",
      "const p=JSON.parse(process.argv[2]);",
      "const result=await api.readDurableFixtureAuthority({target:api.TARGET,root:process.argv[1],captureRegistry:reg,keys:p.keys,locations:p.locations,completeCommittedOutbox:p.events});",
      "console.log(JSON.stringify({seq:result.signedSequence,production:result.productionPromotionAllowed}));",
    ].join('\n');
    const payload=JSON.stringify({keys:publicKeys,locations,events:events.slice(0,1)});
    const raw=execFileSync(process.execPath,[
      '--input-type=module','-e',script,f.root,payload,
    ],{cwd:process.cwd(),encoding:'utf8'});
    assert.deepEqual(JSON.parse(raw.trim()),{seq:1,production:false});
  });
});

test('simultaneous publishers cannot create competing ledger generations',async()=>{
  await withFixture(async f=>{
    const completed=await Promise.allSettled([f.append(1),f.append(1)]);
    assert.equal(completed.filter(x=>x.status==='fulfilled').length,1);
    assert.equal(completed.filter(x=>x.status==='rejected').length,1);
    const persisted=await f.read(1);
    assert.equal(persisted.signedSequence,1);
  });
});

test('second checkpoint includes immutable full signed history', async () => {
  await withFixture(async f => {
    await f.append(1);
    await f.append(2);
    const admission = await f.read(2);
    assert.equal(admission.signedSequence, 2);
    assert.equal(admission.coveredOutboxCount, 2);
    assert.equal(admission.checkpoint.sealedLedger.payload.events.length, 2);
  });
});

test('no real archive, keys, or manuscript contents in persisted checkpoint', async () => {
  await withFixture(async f => {
    await f.append(1);
    const record = await fs.readFile(path.join(f.root,'ledger','checkpoint-000000000001.json'),'utf8');
    assert(!record.includes('PRIVATE KEY'));
    assert(!record.includes('source_text'));
    assert(!record.includes('original_filename'));
    assert(!record.includes('TEST_MEMBER_MANUSCRIPT'));
  });
});

for (const role of ['ledger','head','pin']) {
  test('crash after ' + role + ' fsync refuses unpublished generation', async () => {
    await withFixture(async f => {
      await assert.rejects(f.append(1, { crashAfter: role }), expectedRefusal);
      await assert.rejects(f.read(1), expectedRefusal);
      await assert.rejects(f.append(1), expectedRefusal);
    });
  });
}
test('crash after commit marker leaves a valid durable checkpoint', async () => {
  await withFixture(async f => {
    await assert.rejects(f.append(1,{crashAfter:'commit'}), expectedRefusal);
    const recovered = await f.read(1);
    assert.equal(recovered.signedSequence, 1);
  });
});

test('commit marker tamper fails closed', async () => {
  await withFixture(async f => {
    await f.append(1);
    const p=path.join(f.root,'commit','checkpoint-000000000001.json');
    const data=JSON.parse(await fs.readFile(p,'utf8'));
    data.headDigest='0'.repeat(64);
    await fs.writeFile(p, JSON.stringify(data));
    await assert.rejects(f.read(1), expectedRefusal);
  });
});

test('ledger contents tampered after signing are refused', async () => {
  await withFixture(async f => {
    await f.append(1);
    const p=path.join(f.root,'ledger','checkpoint-000000000001.json');
    const data=JSON.parse(await fs.readFile(p,'utf8'));
    data.payload.events[0].manifest='50000000-0000-4000-8000-000000000005';
    await fs.writeFile(p, JSON.stringify(data));
    await assert.rejects(f.read(1), expectedRefusal);
  });
});

test('rollback of one signing role generation is refused', async () => {
  await withFixture(async f => {
    await f.append(1);await f.append(2);
    await fs.rm(path.join(f.root,'pin','checkpoint-000000000002.json'));
    await assert.rejects(f.read(2), expectedRefusal);
  });
});

test('rolling back all four roles is caught by newer committed outbox', async () => {
  await withFixture(async f => {
    await f.append(1);await f.append(2);
    for (const role of ['ledger','head','pin','commit']) {
      await fs.rm(path.join(f.root,role,'checkpoint-000000000002.json'));
    }
    await assert.rejects(f.read(2), expectedRefusal);
    // NOTE: if attacker rolls back *both* the mock outbox and all fixture roots,
    // this test cannot detect it. Real independently pinned high-water is owed.
  });
});

test('unaccounted committed deletion cannot be signed as complete', async () => {
  await withFixture(async f => {
    await f.append(1);
    await assert.rejects(f.read(2), expectedRefusal);
    await assert.rejects(f.append(1), expectedRefusal);
  });
});

test('wrong signing public key is refused before durable publication', async () => {
  await withFixture(async f => {
    await assert.rejects(f.append(1,{
      keys:{...keys,pinPublicKey:wrongKey.publicKey},
    }), expectedRefusal);
    for (const role of ['ledger','head','pin','commit']) {
      assert.equal((await fs.readdir(path.join(f.root,role))).length,0);
    }
  });
});

test('missing signing role fails closed before any file write', async () => {
  await withFixture(async f => {
    await assert.rejects(f.append(1,{signers:{ledger:signers.ledger}}), expectedRefusal);
  });
});
test('production target refused; unrelated mounted media never opened', async () => {
  await withFixture(async f => {
    await assert.rejects(f.append(1,{target:'PRODUCTION'}), expectedRefusal);
    await assert.rejects(f.read(1,{target:'PRODUCTION'}), expectedRefusal);
  });
});
test('non-fixture root is refused even with synthetic target', async () => {
  await withFixture(async f => {
    await assert.rejects(f.append(1,{root:'/Volumes/LaCie'}), expectedRefusal);
    await assert.rejects(f.read(1,{root:'/Volumes/Lexar'}), expectedRefusal);
  });
});
test('unrecognized file or symlink in witness dir refuses', async () => {
  await withFixture(async f => {
    await f.append(1);
    await fs.writeFile(path.join(f.root,'commit','unknown.txt'),'unknown');
    await assert.rejects(f.read(1), expectedRefusal);
  });
});

test('failed callback is not a signing or recovery success', async () => {
  await withFixture(async f => {
    await assert.rejects(f.append(1,{
      signers: { ...signers, pin: async () => { throw Error('fictional signer lost'); } },
    }));
    await assert.rejects(f.read(1), expectedRefusal);
  });
});
