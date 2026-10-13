/**
 * G2-3B synthetic-only recovery witness, NOT installed restore code.
 *
 * Connects ONLY to a freshly generated ephemeral Docker postgres:16-alpine
 * container (--network none --rm, no mounts). Reads the exact archived G2-3A
 * review SQL by pinned SHA. Fictional member UUIDs and texts only.
 *
 * Ed25519 keys and externally pinned HEAD/digest live in this process OUTSIDE
 * either fabricated database snapshot. This models separation of custody,
 * NOT production hardware signing, outbox or independent offsite witnesses.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { randomBytes, generateKeyPairSync, createHash, sign, verify } from 'node:crypto';

const dirnameHere = dirname(fileURLToPath(import.meta.url));
const root = resolve(dirnameHere, '../..');
const image = 'postgres:16-alpine';
const id = randomBytes(5).toString('hex');
const name = 'ganesha-g2-3b-recovery-fixture-' + id;
const DB = 'synthetic_fixture';
const QDB = 'quarantined_restore';
const schemaFile = resolve(root, 'scripts/witness/fixtures/G2_3A_PROPOSED_SCHEMA_UNAPPLIED.sql');
const shaExpected = 'f46b12d808e14a4fabe273666d7358e7a59df24e4c633505f7ceeef2d0337465';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const PA = '33333333-3333-4333-8333-333333333333';
const PB = '44444444-4444-4444-8444-444444444444';
const tables = Object.freeze(['field_notes','field_attention','field_events','field_people']);
const syntheticIds = Object.freeze({
  field_notes:     { oldA:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', newA:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', otherB:'66666666-6666-4666-8666-666666666666' },
  field_attention: { oldA:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', newA:'ffffffff-ffff-4fff-8fff-ffffffffffff', otherB:'55555555-5555-4555-8555-555555555551' },
  field_events:    { oldA:'cccccccc-cccc-4ccc-8ccc-cccccccccccc', newA:'88888888-8888-4888-8888-888888888888', otherB:'55555555-5555-4555-8555-555555555552' },
  field_people:    { oldA:'dddddddd-dddd-4ddd-8ddd-dddddddddddd', newA:'77777777-7777-4777-8777-777777777777', otherB:'55555555-5555-4555-8555-555555555553' },
});
const expectedDeletions = tables.flatMap(t => [
  { table: t, id: syntheticIds[t].oldA, ownerKind:'practitioner', ownerId:PA },
  { table: t, id: syntheticIds[t].newA, ownerKind:'member', ownerId:A },
]);
const realUuid = /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
function sha(s) { return createHash('sha256').update(s).digest('hex'); }
function assert(x, message) { if (!x) throw Error('SYNTHETIC_HOLD: ' + message); }
function run(command, args, input, mustPass=true) {
  const p = spawnSync(command,args,{encoding:'utf8',input,maxBuffer: 20*1024*1024,timeout:25000});
  if (mustPass && (p.error || p.status!==0)) {
    throw Error('SYNTHETIC_HOLD: '+command+' '+args.slice(0,3).join(' ')+
      ' returned '+p.status+' stderr='+String(p.stderr).slice(-900));
  }
  return p;
}
const dc = (args,input,pass=true) => run('docker',args,input,pass);
const runSql=(sql,db=DB,pass=true)=> dc(
  ['exec','-i',name,'psql','-X','-A','-t','-q','-v','ON_ERROR_STOP=1','-U','fixture','-d',db],sql,pass);
function resultScalar(sql,db=DB) {
  return runSql(sql,db).stdout.trim().split('\n').at(-1).trim();
}
function canonical(o) {
  if (o===null || typeof o!=='object') return JSON.stringify(o);
  if(Array.isArray(o)) return '['+o.map(canonical).join(',')+']';
  return '{'+Object.keys(o).sort().map(k=>JSON.stringify(k)+':'+canonical(o[k])).join(',')+'}';
}
function seal(payload,privateKey,publicKey) {
  const keyHash = sha(publicKey.export({type:'spki',format:'der'}));
  return {payload, signer:keyHash,algorithm:'Ed25519',
    signature:sign(null,Buffer.from(canonical(payload)),privateKey).toString('base64')};
}
function open(doc,publicKey) {
  assert(doc && doc.algorithm==='Ed25519' && typeof doc.signature==='string', 'unsigned checkpoint');
  assert(doc.signer===sha(publicKey.export({type:'spki',format:'der'})), 'untrusted key fingerprint');
  const sig=Buffer.from(doc.signature,'base64');
  assert(sig.length===64 && verify(null,Buffer.from(canonical(doc.payload)),publicKey,sig), 'bad checkpoint signature');
  return doc.payload;
}
function admit({sealedLedger,sealedHead,ledgerPublic,headPublic,pinnedSequence,pinnedHeadDigest,archiveHash,actualArchiveHash}) {
  assert(actualArchiveHash===archiveHash,'backup not independently pinned');
  assert(Number.isSafeInteger(pinnedSequence) && pinnedSequence>0,'missing external sequence');
  const ledger=open(sealedLedger,ledgerPublic);
  const head=open(sealedHead,headPublic);
  assert(ledger.schema==='SOULLAB-G2-3B-SYNTHETIC-ONLY' && head.schema==='SOULLAB-G2-3B-HEAD', 'unsupported format');
  assert(ledger.sequence===head.sequence && head.sequence>=pinnedSequence,'stale or incomplete authority');
  assert(sha(canonical(head))===pinnedHeadDigest,'head differs from independent high-water pin');
  assert(head.ledgerDigest===sha(canonical(ledger)), 'ledger not committed by signed head');
  assert(Array.isArray(ledger.events) && ledger.events.length===ledger.sequence,'missing event');
  const list=ledger.events.flatMap((e,i)=>{
    assert(e.sequence===i+1 && e.manifest==='synthetic-full-member-A-erasure','malformed deletion event');
    assert(Array.isArray(e.tombstones),'missing tombstones');
    return e.tombstones;
  });
  assert(list.length===expectedDeletions.length,'incomplete four-table deletion coverage');
  const seen=new Set();
  for(const item of list) {
    assert(item && Object.keys(item).sort().join()===['id','ownerId','ownerKind','table'].sort().join(),'content-bearing or unknown deletion metadata');
    assert(tables.includes(item.table) && realUuid.test(item.id),'unknown field object');
    assert((item.ownerKind==='member' && item.ownerId===A) || (item.ownerKind==='practitioner' && item.ownerId===PA),'wrong deletion owner');
    const key=item.table+'/'+item.id;
    assert(!seen.has(key),'duplicate deletion tombstone');
    seen.add(key);
  }
  for(const want of expectedDeletions)assert(seen.has(want.table+'/'+want.id),'missing deletion target');
  return list;
}

let started=false;
try {
  const file=readFileSync(schemaFile);
  assert(sha(file)===shaExpected, 'G2-3A archived candidate SQL hash mismatch');
  assert(dc(['image','inspect',image],undefined,false).status===0,'PG16 image not installed, do not pull');
  assert(dc(['ps','-a','--filter','name=^'+name+'$','--format','{{.Names}}']).stdout.trim()==='', 'fixture collision');
  dc(['run','--rm','-d','--pull=never','--network','none','--name',name,
    '-e','POSTGRES_USER=fixture','-e','POSTGRES_PASSWORD=synthetic_only','-e','POSTGRES_DB='+DB,image]);
  started=true;
  let ready=false;
  for(let i=0;i<45;i++) {
    const x=dc(['exec',name,'psql','-X','-A','-t','-q','-U','fixture','-d',DB,'-c','SELECT 1'],undefined,false);
    if(x.status===0 && x.stdout.trim()==='1') {
      run('sleep',['1']);
      const y=dc(['exec',name,'psql','-X','-A','-t','-q','-U','fixture','-d',DB,'-c','SELECT 1'],undefined,false);
      if(y.status===0 && y.stdout.trim()==='1'){ready=true;break;}
    }
    run('sleep',['0.2']);
  }
  assert(ready, 'stable synthetic PostgreSQL unavailable');

  const fixtures = `
CREATE TABLE members(id uuid PRIMARY KEY);
CREATE TABLE practitioners(id uuid PRIMARY KEY,member_id uuid REFERENCES members(id));
CREATE TABLE studio_teams(id uuid PRIMARY KEY);
INSERT INTO members VALUES ('${A}'),('${B}');
INSERT INTO practitioners VALUES ('${PA}','${A}'),('${PB}','${B}');
CREATE TABLE field_notes(
 id uuid PRIMARY KEY, practitioner_id uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
 team_id uuid REFERENCES studio_teams(id) ON DELETE SET NULL, section text NOT NULL, body text NOT NULL,
 created_at timestamptz DEFAULT now());
CREATE TABLE field_attention(
 id uuid PRIMARY KEY, practitioner_id uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
 team_id uuid REFERENCES studio_teams(id) ON DELETE SET NULL, field text NOT NULL,kind text NOT NULL,
 ref_id uuid,label text NOT NULL,position integer DEFAULT 0,created_at timestamptz DEFAULT now());
CREATE TABLE field_events(
 id uuid PRIMARY KEY, practitioner_id uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
 team_id uuid REFERENCES studio_teams(id) ON DELETE SET NULL,title text NOT NULL,event_at timestamptz NOT NULL,
 created_at timestamptz DEFAULT now());
CREATE TABLE field_people(
 id uuid PRIMARY KEY, practitioner_id uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
 team_id uuid REFERENCES studio_teams(id) ON DELETE SET NULL,name text NOT NULL,note text,
 created_at timestamptz DEFAULT now());
`;
  runSql(fixtures);
  runSql(file.toString());runSql(file.toString());
  for(const t of tables) {
    const ids=syntheticIds[t];
    if(t==='field_notes')runSql(`INSERT INTO field_notes(id,practitioner_id,section,body) VALUES
      ('${ids.oldA}','${PA}','alive','A old synthetic'),
      ('${ids.otherB}','${PB}','alive','B control');
      INSERT INTO field_notes(id,personal_member_id,section,body) VALUES
      ('${ids.newA}','${A}','alive','A new synthetic');`);
    if(t==='field_attention')runSql(`INSERT INTO field_attention(id,practitioner_id,field,kind,label) VALUES
      ('${ids.oldA}','${PA}','important','note','A old synthetic'),
      ('${ids.otherB}','${PB}','attention','note','B control');
      INSERT INTO field_attention(id,personal_member_id,field,kind,label) VALUES
      ('${ids.newA}','${A}','emerging','note','A new synthetic');`);
    if(t==='field_events')runSql(`INSERT INTO field_events(id,practitioner_id,title,event_at) VALUES
      ('${ids.oldA}','${PA}','A old synthetic',now()),
      ('${ids.otherB}','${PB}','B control',now());
      INSERT INTO field_events(id,personal_member_id,title,event_at) VALUES
      ('${ids.newA}','${A}','A new synthetic',now());`);
    if(t==='field_people')runSql(`INSERT INTO field_people(id,practitioner_id,name) VALUES
      ('${ids.oldA}','${PA}','A old synthetic'),
      ('${ids.otherB}','${PB}','B control');
      INSERT INTO field_people(id,personal_member_id,name) VALUES
      ('${ids.newA}','${A}','A new synthetic');`);
  }
  assert(tables.every(t=>resultScalar('SELECT count(*) FROM '+t)==='3'),'fixture source population incomplete');
  console.log('PASS S1: exact G2-3A SQL SHA / fixture source population 12 rows across four tables');

  // Archive is kept only in this synthetic process's memory; no host mounted data.
  const archive=dc(['exec',name,'pg_dump','-U','fixture','-d',DB,'--no-owner','--no-privileges']).stdout;
  const independentArchiveHash=sha(archive);
  assert(archive.length>1000,'synthetic archive unexpectedly empty');
  // Simulate successful member erasure after the snapshot was taken.
  for(const item of expectedDeletions) {
    const ownerColumn=item.ownerKind==='member'?'personal_member_id':'practitioner_id';
    const deleted=resultScalar(`WITH gone AS (DELETE FROM ${item.table} WHERE id='${item.id}' AND
       ${ownerColumn}='${item.ownerId}' RETURNING id) SELECT count(*) FROM gone;`);
    assert(deleted==='1','fixture source delete must match one exact row');
  }
  assert(tables.every(t=>resultScalar('SELECT count(*) FROM '+t)==='1'),'source deletion controls failed');
  console.log('PASS S2: simulated authorized erasure in fabricated source after snapshot');

  const ledgerKeys=generateKeyPairSync('ed25519');
  const headKeys=generateKeyPairSync('ed25519');
  const ledger={schema:'SOULLAB-G2-3B-SYNTHETIC-ONLY',sequence:1,events:[
    {sequence:1,manifest:'synthetic-full-member-A-erasure',tombstones:expectedDeletions}
  ]};
  const signedLedger=seal(ledger,ledgerKeys.privateKey,ledgerKeys.publicKey);
  const head={schema:'SOULLAB-G2-3B-HEAD',sequence:1,ledgerDigest:sha(canonical(ledger)),issuedBy:'fixture-isolated'};
  const signedHead=seal(head,headKeys.privateKey,headKeys.publicKey);
  const fixed={sealedLedger:signedLedger,sealedHead:signedHead,ledgerPublic:ledgerKeys.publicKey,
    headPublic:headKeys.publicKey,pinnedSequence:1,pinnedHeadDigest:sha(canonical(head)),
    archiveHash:independentArchiveHash,actualArchiveHash:sha(archive)};
  assert(admit(fixed).length===8,'synthetic deletion authority not complete');

  // Altered signatures, old high-waters, mismatched archive or absent coverage
  // must fail BEFORE creating a restored database, let alone exposing it.
  let negative=0;
  for(const broken of [
    {...fixed, sealedLedger:{...signedLedger, signature:'AAAAAAAA'}},
    {...fixed, pinnedHeadDigest:'0'.repeat(64)},
    {...fixed, pinnedSequence:2},
    {...fixed, actualArchiveHash:'f'.repeat(64)},
    {...fixed, sealedHead:{...signedHead,payload:{...head,sequence:2}}},
    {...fixed, sealedLedger:{...signedLedger,payload:{
      ...ledger,events:[{...ledger.events[0],tombstones:ledger.events[0].tombstones.slice(1)}]}}},
  ]) {
    try { admit(broken); } catch { negative++; }
  }
  assert(negative===6,'invalid authority was admitted');
  console.log('PASS S3: six tampered, incomplete, unsigned or stale recovery authorities refused before restore');

  // Pin has been verified. The resumed DB remains private to the Docker container
  // (--network none), with no external member access. Here quarantine means
  // explicit test stage; actual production read isolation remains untested.
  dc(['exec',name,'createdb','-U','fixture',QDB]);
  runSql(archive,QDB);
  assert(tables.every(t=>resultScalar('SELECT count(*) FROM '+t,QDB)==='3'),
    'raw snapshot should display resurrection risk in quarantined synthetic DB');
  console.log('PASS S4: raw pre-deletion fixture snapshot resurrects 8 deleted objects before replay');

  const admitted=admit(fixed);
  const entries=admitted.map(x=>`('${x.table}','${x.id}')`).join(',');
  // Commit the guarded deletion and refusal triggers atomically, never promoting
  // the quarantine snapshot first.
  const overlay=`
BEGIN;
CREATE TABLE g2_sealed_deleted_objects(
 table_name text NOT NULL, object_id uuid NOT NULL, PRIMARY KEY(table_name,object_id));
INSERT INTO g2_sealed_deleted_objects(table_name,object_id) VALUES ${entries};
DO $guard$ DECLARE n integer; BEGIN
 SELECT count(*) INTO n FROM g2_sealed_deleted_objects;
 IF n <> 8 THEN RAISE EXCEPTION 'incomplete checkpoint overlay'; END IF;
END $guard$;
` + tables.map(t=>{
 const records=admitted.filter(x=>x.table===t);
 const ids=records.map(x=>`'${x.id}'`).join(',');
 return `DO $guard$ DECLARE n integer; BEGIN
 WITH deleted AS (DELETE FROM public.${t}
   WHERE id IN (${ids}) AND (
     (personal_member_id='${A}' AND practitioner_id IS NULL) OR
     (practitioner_id='${PA}' AND personal_member_id IS NULL)
   ) RETURNING id)
 SELECT count(*) INTO n FROM deleted;
 IF n <> 2 THEN RAISE EXCEPTION 'not all ${t} tombstones matched'; END IF;
 END $guard$;`;
}).join('\n')+`
CREATE OR REPLACE FUNCTION refuse_g2_tombstone_replay()
RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
 IF EXISTS(SELECT 1 FROM g2_sealed_deleted_objects
            WHERE table_name=TG_TABLE_NAME AND object_id=NEW.id)
 THEN RAISE EXCEPTION 'REFUSE_SIGNED_DELETION_RESURRECTION' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $f$;
` + tables.map(t=>`CREATE TRIGGER g2_block_restored_${t}
 BEFORE INSERT OR UPDATE ON public.${t}
 FOR EACH ROW EXECUTE FUNCTION refuse_g2_tombstone_replay();`).join('\n')+
 '\nCOMMIT;';
  runSql(overlay,QDB);
  for(const t of tables) {
    assert(resultScalar('SELECT count(*) FROM '+t,QDB)==='1','deleted source content still visible');
    const b=syntheticIds[t].otherB;
    assert(resultScalar(`SELECT count(*) FROM ${t} WHERE id='${b}';`,QDB)==='1','B unrelated fixture lost');
  }
  console.log('PASS S5: signed-head-verified overlay deletes all 8 A rows, preserves all four B controls');

  const Arow=syntheticIds.field_notes.newA;
  const bad=runSql(`INSERT INTO field_notes(id,personal_member_id,section,body)
    VALUES ('${Arow}','${A}','alive','synthetic reattempt');`,QDB,false);
  assert(bad.status!==0 && String(bad.stderr).includes('REFUSE_SIGNED_DELETION_RESURRECTION'),
    'deleted synthetic note reinsert was not blocked');
  const legacy=runSql(`INSERT INTO field_notes(id,practitioner_id,section,body)
    VALUES ('${syntheticIds.field_notes.oldA}','${PA}','alive','legacy reattempt');`,QDB,false);
  assert(legacy.status!==0 && String(legacy.stderr).includes('REFUSE_SIGNED_DELETION_RESURRECTION'),
    'legacy resurrection was not blocked');
  runSql(`INSERT INTO field_notes(id,personal_member_id,section,body)
    VALUES ('aaaaaaaa-0000-4000-8000-000000000000','${B}','alive','B allowed');`,QDB);
  console.log('PASS S6: both legacy and member-owned replay blocked after seal, unrelated member remains writable');
  console.log('SYNTHETIC_G2_3B_PASS (NOT PRODUCTION RESTORE ACCEPTANCE)');
} finally {
  if(started) {
    dc(['stop',name],undefined,false);
    assert(dc(['ps','-a','--filter','name=^'+name+'$','--format','{{.Names}}'],undefined,false).stdout.trim()==='',
      'disposable Docker container still exists');
    console.log('PASS CLEANUP: temporary disconnected PostgreSQL container absent');
  }
}
