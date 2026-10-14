/**
 * R20-R5: networkless, disposable REAL PostgreSQL + filesystem fixture.
 * Explicit opt-in required. No production endpoint, credentials, member data,
 * shared Docker volumes, NAS or external network can be supplied as arguments.
 * Source and restored PostgreSQL live only in private Docker tmpfs instances.
 * The only archive on the host is AES-GCM ciphertext of FICTIONAL text.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createCipheriv, createDecipheriv, createHash, generateKeyPairSync, randomBytes } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { seal } from '../../../lib/recovery/r20-r2/signedLedger.mjs';
import { TARGET as AUTH_TARGET, appendDurableFixtureCheckpoint } from '../../../lib/recovery/r20-r3/durableFixtureAuthority.mjs';
import { TARGET as PAIR_TARGET, verifySyntheticPairedSourceSnapshot } from '../../../lib/recovery/r20-r3/syntheticPairedVaultRecovery.mjs';

const ACK = 'RUN_FICTIONAL_NETWORKLESS_POSTGRES_ONLY';
const IMAGE = 'postgres:16-alpine';  // Must already be installed; --pull=never.
const GEN = 'fixture-generation-r5';
const FENCE = 'fixture-fence-r5';
const WORK1 = '60000000-0000-4000-8000-000000000006';
const WORK2 = '70000000-0000-4000-8000-000000000007';
const DELETED_WORK = '20000000-0000-4000-8000-000000000002';
const original = new Map([
  ['fixture-source-one', Buffer.from('FICTIONAL: Original DOCX bytes A\\n')],
  ['fixture-source-two', Buffer.from('FICTIONAL: Original DOCX bytes B\\0\\1')],
]);
const texts = [
  {id:'fixture-source-one',kind:'artifact',workId:WORK1,sourceText:'FICTIONAL: Extracted A',artifactHash:''},
  {id:'fixture-source-two',kind:'artifact',workId:WORK2,sourceText:'FICTIONAL: Extracted B',artifactHash:''},
  {id:'fixture-source-three',kind:'paste',workId:WORK1,sourceText:'FICTIONAL: Pasted notes',artifactHash:null},
];
const hash = b => createHash('sha256').update(b).digest('hex');
for (const item of texts) {
  item.sourceTextHash = hash(Buffer.from(item.sourceText));
  if (item.kind === 'artifact') item.artifactHash = hash(original.get(item.id));
}
const quoted = s => "'" + String(s).replaceAll("'", "''") + "'";
const docker = (args, opts={}) => execFileSync('docker',args,{timeout:30000,maxBuffer:8*1024*1024,...opts});
const sql = (name, query) => docker(['exec',name,'psql','-U','postgres','-v','ON_ERROR_STOP=1','-A','-t','-c',query],{encoding:'utf8'}).trim();
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));

async function startPg(name) {
  // Exactly disposable test containers. No -v, host network, mounts, or ports.
  docker(['run','--detach','--rm','--pull=never','--network=none',
    '--label','life.soullab.r20.fixture=fictional-only',
    '--name',name,'--pids-limit','64','--memory','256m','--cpus','1',
    '--tmpfs','/var/lib/postgresql/data:rw,size=128m',
    '--tmpfs','/var/run/postgresql:rw,size=8m',
    '--tmpfs','/tmp:rw,size=8m',
    '-e','POSTGRES_HOST_AUTH_METHOD=trust',IMAGE],{stdio:'ignore'});
  for (let i=0;i<60;i++) {
    try {
      // The stock entrypoint briefly starts a temporary setup server before
      // the final server. A single pg_isready is not stable-readiness proof.
      docker(['exec',name,'pg_isready','-q','-U','postgres'],{stdio:'ignore',timeout:2500});
      await sleep(800);
      docker(['exec',name,'psql','-U','postgres','-A','-t','-c','SELECT 1'],{stdio:'ignore',timeout:2500});
      await sleep(400);
      docker(['exec',name,'pg_isready','-q','-U','postgres'],{stdio:'ignore',timeout:2500});
      return;
    } catch { await sleep(250); }
  }
  throw Error('Fictional isolated Postgres did not start');
}

function setupSql() {
  return [
    'CREATE TABLE fixture_works (id uuid PRIMARY KEY)',
    'CREATE TABLE fixture_meta (generation text NOT NULL, commit_fence text NOT NULL)',
    'CREATE TABLE fixture_sources (id text PRIMARY KEY, kind text NOT NULL, work_id uuid NOT NULL REFERENCES fixture_works(id), source_text text NOT NULL, source_text_hash text NOT NULL, artifact_hash text)',
    `INSERT INTO fixture_works VALUES (${quoted(WORK1)}),(${quoted(WORK2)})`,
    `INSERT INTO fixture_meta VALUES (${quoted(GEN)},${quoted(FENCE)})`,
    ...texts.map(s=>`INSERT INTO fixture_sources VALUES (${quoted(s.id)},${quoted(s.kind)},${quoted(s.workId)},${quoted(s.sourceText)},${quoted(s.sourceTextHash)},${s.artifactHash===null?'NULL':quoted(s.artifactHash)})`),
  ].join(';') + ';';
}
function readRestoredDb(name) {
  const q = `SELECT json_build_object(
    'generation',(SELECT generation FROM fixture_meta),
    'commitFence',(SELECT commit_fence FROM fixture_meta),
    'works',(SELECT coalesce(json_agg(json_build_object('id',id::text)), '[]'::json) FROM fixture_works),
    'sources',(SELECT coalesce(json_agg(json_build_object('id',id,'kind',kind,'workId',work_id::text,'sourceText',source_text,'sourceTextHash',source_text_hash,'artifactHash',artifact_hash)), '[]'::json) FROM fixture_sources)
    )::text`;
  return JSON.parse(sql(name,q));
}

const MARKER = Buffer.from('R20-R5-FICTIONAL-SEALED-v1\\0');
function encrypt(bytes,key) {
  const iv=randomBytes(12), c=createCipheriv('aes-256-gcm',key,iv);
  const ciphertext=Buffer.concat([c.update(bytes),c.final()]);
  return Buffer.concat([MARKER,iv,c.getAuthTag(),ciphertext]);
}
function decrypt(packet,key) {
  assert(packet.subarray(0,MARKER.length).equals(MARKER),'fixture archive marker required');
  const iv=packet.subarray(MARKER.length,MARKER.length+12);
  const tag=packet.subarray(MARKER.length+12,MARKER.length+28);
  const bytes=packet.subarray(MARKER.length+28);
  const decipher=createDecipheriv('aes-256-gcm',key,iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(bytes),decipher.final()]);
}

async function signedFixtureAuthority(root) {
  const pks=Array.from({length:3},()=>generateKeyPairSync('ed25519'));
  const keys={ledgerPublicKey:pks[0].publicKey,headPublicKey:pks[1].publicKey,pinPublicKey:pks[2].publicKey};
  const signers={
    ledger:async p=>seal(p,pks[0].privateKey,pks[0].publicKey),
    head:async p=>seal(p,pks[1].privateKey,pks[1].publicKey),
    pin:async p=>seal(p,pks[2].privateKey,pks[2].publicKey),
  };
  const captureRegistry=JSON.parse(readFileSync(new URL('../../../lib/recovery/r20-r3/writer-studio-captured-graph-20261013.json',import.meta.url)));
  const locations={
    ledger:'https://fictional-event.example.invalid/v1',
    head:'https://fictional-head.example.invalid/v1',
    pin:'https://fictional-pin.example.invalid/v1',
  };
  const committedOutbox=[{sequence:1,manifest:'10000000-0000-4000-8000-000000000001',tombstones:[{table:'member_manuscripts',id:DELETED_WORK}]}];
  await appendDurableFixtureCheckpoint({target:AUTH_TARGET,root,captureRegistry,locations,keys,committedOutbox,signers});
  return {root,captureRegistry,locations,keys,completeCommittedOutbox:committedOutbox};
}

async function makeRestoredPair(pgName,dir,legacyReconstructiveCopies=0) {
  const db=readRestoredDb(pgName);
  const names=(await readdir(dir)).sort();
  const artifacts=[];
  for (const id of names) {
    if (!/^fixture-source-[a-z]+$/.test(id)) throw Error('Unknown or unsafe fictional Source path');
    const filename=path.join(dir,id);
    if (!(await lstat(filename)).isFile()) throw Error('Non-file Source refused');
    artifacts.push({id,dataBase64:(await readFile(filename)).toString('base64')});
  }
  return {
    type:'FICTIONAL_DB_VAULT_PAIR',containsMemberData:false,
    generation:GEN,legacyReconstructiveCopies,
    expected:{works:2,sources:3,files:2},
    database:{generation:db.generation,commitFence:db.commitFence,works:db.works,sources:db.sources},
    sourceVault:{generation:GEN,commitFence:FENCE,artifacts},
  };
}

test('R20-R5: actual disposable PostgreSQL dump + encrypted Source filesystem restore refuses corruption, orphan and old copies',{
  skip: process.env.R20_R5_FIXTURE_ACK === ACK ? false : 'manual fictional-only Docker acknowledgement required',
},async t=>{
  if (process.env.R20_R5_FIXTURE_ACK !== ACK) {
    throw Error('R20-R5 refuses Docker access without exact fictional-only acknowledgement');
  }
  const nonce=randomBytes(7).toString('hex');
  const srcName='r20-r5-fixture-src-'+nonce;
  const destName='r20-r5-fixture-dest-'+nonce;
  const root=await mkdtemp(path.join(tmpdir(),'r20-r5-fictional-'));
  const source=path.join(root,'source'),recovered=path.join(root,'recovered');
  const sealed=path.join(root,'fictional-pair.sealed');
  // Reuse the R3J checkpoint reader's strict, independent fixture-root namespace.
  const authorityRoot=await mkdtemp(path.join(tmpdir(),'r20-r3j-fixture-'));
  const ephemeralKey=randomBytes(32); // Never persisted or usable for production.
  const started=[];
  try {
    await mkdir(source,{mode:0o700});
    await mkdir(recovered,{mode:0o700});
    for (const [name,bytes] of original) await writeFile(path.join(source,name),bytes,{mode:0o600});

    started.push(srcName);await startPg(srcName);
    sql(srcName,setupSql());
    const dump=docker(['exec',srcName,'pg_dump','-U','postgres','-Fc','-t','fixture_works','-t','fixture_sources','-t','fixture_meta']);
    assert(dump.length>0);
    const packageBytes=Buffer.from(JSON.stringify({
      type:'R20_R5_FICTIONAL_PAIR_ONLY',
      generation:GEN,commitFence:FENCE,
      pgDumpBase64:dump.toString('base64'),
      files:Array.from(original,([id,data])=>({id,dataBase64:data.toString('base64')})),
    }));
    await writeFile(sealed,encrypt(packageBytes,ephemeralKey),{mode:0o600});
    const stored=await readFile(sealed);
    assert(!stored.includes(Buffer.from('FICTIONAL: Extracted')),'no plaintext original or extracted text in sealed file');

    await t.test('wrong key and tampered ciphertext are refused before restore',()=>{
      assert.throws(()=>decrypt(stored,randomBytes(32)));
      const tampered=Buffer.from(stored);tampered[tampered.length-2]^=1;
      assert.throws(()=>decrypt(tampered,ephemeralKey));
    });
    const admitted=JSON.parse(decrypt(stored,ephemeralKey).toString('utf8'));
    assert.equal(admitted.type,'R20_R5_FICTIONAL_PAIR_ONLY');
    assert.equal(admitted.generation,GEN);
    started.push(destName);await startPg(destName);
    docker(['exec','-i',destName,'pg_restore','-U','postgres','-d','postgres','--no-owner','--no-privileges','--exit-on-error'],{input:Buffer.from(admitted.pgDumpBase64,'base64'),stdio:['pipe','pipe','pipe']});
    for (const entry of admitted.files) {
      assert(original.has(entry.id),'no external artifact path permitted');
      await writeFile(path.join(recovered,entry.id),Buffer.from(entry.dataBase64,'base64'),{mode:0o600});
    }
    const authorityRead=await signedFixtureAuthority(authorityRoot);
    const check=async (count=0)=>{
      const snapshot=await makeRestoredPair(destName,recovered,count);
      return verifySyntheticPairedSourceSnapshot({target:PAIR_TARGET,snapshot,authorityRead});
    };
    await t.test('restored DB rows and actual independent Source bytes match signed synthetic deletion authority',async()=>{
      const verified=await check();
      assert.equal(verified.restoredFictionalWorks,2);
      assert.equal(verified.verifiedFictionalSources,3);
      assert.equal(verified.verifiedFictionalOriginalFiles,2);
      assert.equal(verified.actualArchiveRestored,undefined);
      assert.equal(verified.productionPromotionAllowed,false);
      assert.equal(verified.realVaultRecovered,false);
    });
    await t.test('missing restored original file prevents recovery admission',async()=>{
      await rm(path.join(recovered,'fixture-source-two'));
      await assert.rejects(check(),/R20.*refused/i);
      await writeFile(path.join(recovered,'fixture-source-two'),original.get('fixture-source-two'));
    });
    await t.test('extra unregistered original file prevents recovery admission',async()=>{
      await writeFile(path.join(recovered,'fixture-source-orphan'),Buffer.from('FICTIONAL: Unknown'));
      await assert.rejects(check(),/R20.*refused/i);
      await rm(path.join(recovered,'fixture-source-orphan'));
    });
    await t.test('mutation of the restored original bytes is rejected',async()=>{
      await writeFile(path.join(recovered,'fixture-source-one'),Buffer.from('FICTIONAL: Corrupt'));
      await assert.rejects(check(),/R20.*refused/i);
      await writeFile(path.join(recovered,'fixture-source-one'),original.get('fixture-source-one'));
    });
    await t.test('mutated actual restored PostgreSQL source hash is rejected',async()=>{
      sql(destName,"UPDATE fixture_sources SET source_text_hash = repeat('0',64) WHERE id = 'fixture-source-two'");
      await assert.rejects(check(),/R20.*refused/i);
      sql(destName,`UPDATE fixture_sources SET source_text_hash = ${quoted(texts[1].sourceTextHash)} WHERE id = 'fixture-source-two'`);
    });
    await t.test('cross-generation restored PostgreSQL is rejected',async()=>{
      sql(destName,"UPDATE fixture_meta SET commit_fence = 'fixture-unrelated'");
      await assert.rejects(check(),/R20.*refused/i);
      sql(destName,`UPDATE fixture_meta SET commit_fence = ${quoted(FENCE)}`);
    });
    await t.test('fictional historical plaintext-copy claim refuses admission',async()=>{
      await assert.rejects(check(1),/R20.*refused/i);
    });
    const final=await check();
    assert.equal(final.productionPromotionAllowed,false);
    console.log('R20_R5_FICTIONAL_POSTGRES_DB_AND_SOURCE_ENCRYPTED_ROUNDTRIP_PASS; realVaultRecovered=false; productionPromotionAllowed=false');
  } finally {
    for (const name of started.reverse()) {
      try {docker(['rm','-f',name],{stdio:'ignore',timeout:15000});}catch {}
    }
    await rm(root,{recursive:true,force:true});
    await rm(authorityRoot,{recursive:true,force:true});
    ephemeralKey.fill(0);
  }
});
