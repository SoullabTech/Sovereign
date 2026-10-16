/**
 * R11 opt-in physical PG16 + original Source fixture.
 * Run ONLY with R11_PHYSICAL_FIXTURE=fictional-only.
 * No production DB/container/volume or real member writing is mounted/read.
 */
import { spawnSync } from 'node:child_process';
import { createCipheriv, createDecipheriv, generateKeyPairSync, randomBytes, randomUUID, sign } from 'node:crypto';
import { sealDeclaredWorkCandidate, restoreDeclaredWorkCandidate } from '../recoveryAdmissionV1';
import { R11_CLASSIFIED_FIELDS, type WorkRecord } from '../workEnvelopeV1';
import { canonicalDeletionPayload, type DeletionHighwaterV1 } from '../deletionBarrierV1';

const TEST = process.env.R11_PHYSICAL_FIXTURE === 'fictional-only' ? test : test.skip;
const SRC = 'ws-r11-fict-pg-source-20261016';
const RESTORE = 'ws-r11-fict-pg-restore-20261016';
const SV = 'ws-r11-fict-source-vault-20261016';
const RV = 'ws-r11-fict-restored-vault-20261016';
const IMAGE = 'pgvector/pgvector:pg16';
const A = { memberId: '5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204',
  workId: '306902ed-21a9-4c01-aa15-984755598218', generation: 1 };
const B = { memberId: '5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205',
  workId: '4c0782ca-9074-43ee-9f3c-5f8500026780', generation: 1 };
const fields = R11_CLASSIFIED_FIELDS.filter(x => x !== 'original_source.bytes');
const tables = new Map<string, string[]>();
for (const field of fields) {
  const [table, col] = field.split('.');
  tables.set(table, [...(tables.get(table) || []), col]);
}
function d(args: string[], input?: Buffer, timeout = 50000): Buffer {
  const p = spawnSync('docker', args, { input, encoding: null, timeout, maxBuffer: 32 * 1024 * 1024 });
  if (p.error || p.status !== 0)
    throw Error('fictional_docker_command_failed:'+args[0]+':'+String(p.stderr||'').slice(-220));
  return Buffer.isBuffer(p.stdout) ? p.stdout : Buffer.from(p.stdout || '');
}
function exists(kind: 'container' | 'volume', name: string) {
  return spawnSync('docker', [kind, 'inspect', name], { stdio: 'ignore', timeout: 9000 }).status === 0;
}
function sql(container: string, sqlText: string) {
  return d(['exec',container,'psql','-XAt','-F','|','-v','ON_ERROR_STOP=1',
    '-U','postgres','-d','postgres','-c',sqlText]).toString('utf8').trim();
}
function ready(container: string) {
  for (let i=0; i<90; i++) {
    const p=spawnSync('docker',['exec',container,'pg_isready','-U','postgres','-d','postgres'],
      {stdio:'ignore',timeout:10000});
    if(p.status===0)return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,150);
  }
  throw Error('disposable_postgres_not_ready');
}
function start(container: string,volume: string) {
  d(['run','-d','--name',container,'--network','none','--memory','768m','--cpus','1',
    '--security-opt','no-new-privileges','--pids-limit','128',
    '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=256m','--tmpfs','/tmp:rw,nosuid,size=48m',
    '-v',volume+':/vault:rw','-e','POSTGRES_HOST_AUTH_METHOD=trust',
    '--label','life.soullab.scope=ws-r11-fictional-isolated',IMAGE],undefined,60000);
  ready(container);
  const raw = JSON.parse(d(['inspect',container]).toString('utf8'))[0];
  expect(raw.HostConfig.NetworkMode).toBe('none');
  expect(Object.keys(raw.HostConfig.PortBindings||{})).toHaveLength(0);
  expect(raw.Mounts.map((m: {Name: string})=>m.Name)).toEqual([volume]);
}
function writeFile(container: string, workId: string, bytes: Buffer) {
  d(['exec','-i',container,'sh','-c','cat > /vault/'+workId+'.docx'],bytes);
}
const readFile=(container:string,workId:string)=>d(['exec',container,'cat','/vault/'+workId+'.docx']);
function genericSeal(key:Buffer,raw:Buffer):Buffer {
  const nonce=randomBytes(12), c=createCipheriv('aes-256-gcm',key,nonce);
  return Buffer.concat([nonce,c.update(raw),c.final(),c.getAuthTag()]);
}
function genericOpen(key:Buffer,box:Buffer):Buffer {
  const iv=box.subarray(0,12), tag=box.subarray(box.length-16);
  const dec=createDecipheriv('aes-256-gcm',key,iv);dec.setAuthTag(tag);
  return Buffer.concat([dec.update(box.subarray(12,box.length-16)),dec.final()]);
}
function collect(container: string, subject: typeof A | typeof B): WorkRecord[] {
  const records:WorkRecord[]=[];
  for(const field of fields){
    const [table,col]=field.split('.');
    const line=sql(container, `SELECT id::text,encode(convert_to(${col},'UTF8'),'hex') FROM ${table} WHERE work_id='${subject.workId}'`);
    const [recordId, hex] = line.split('|');
    expect(recordId).toMatch(/^[0-9a-f-]{36}$/);
    records.push({field,recordId,value:Buffer.from(hex,'hex')});
  }
  records.push({field:'original_source.bytes',recordId:subject.workId,
    value:readFile(container,subject.workId)});
  return records;
}
const census=()=>({snapshotGeneration:1,counts:Object.fromEntries(R11_CLASSIFIED_FIELDS.map(x=>[x,1]))});

jest.setTimeout(150000);
TEST('networkless PostgreSQL and original-Source fixture refuses deleted Work while restoring survivor',()=>{
  const madeContainers:string[]=[], madeVolumes:string[]=[];
  for(const name of [SRC,RESTORE])expect(exists('container',name)).toBe(false);
  for(const name of [SV,RV])expect(exists('volume',name)).toBe(false);
  try{
    for(const v of [SV,RV]) {
      d(['volume','create','--label','life.soullab.scope=ws-r11-fictional-isolated',v]);
      madeVolumes.push(v);
    }
    start(SRC,SV);madeContainers.push(SRC);
    start(RESTORE,RV);madeContainers.push(RESTORE);
    for(const [table,cols] of tables){
      const defs=cols.map(c=>c+' text NOT NULL').join(',');
      sql(SRC,`CREATE TABLE ${table} (id uuid PRIMARY KEY, member_id uuid NOT NULL, work_id uuid NOT NULL,${defs})`);
      for(const who of [A,B]){
        const values=cols.map(col=>`'fictional ${who.workId} ${table}.${col} only'`);
        sql(SRC,`INSERT INTO ${table}(id,member_id,work_id,${cols.join(',')}) VALUES
         ('${randomUUID()}','${who.memberId}','${who.workId}',${values.join(',')})`);
      }
    }
    const aOriginal=Buffer.from('FICTIONAL A original bytes\0one', 'utf8');
    const bOriginal=Buffer.from('FICTIONAL B original bytes\0two', 'utf8');
    writeFile(SRC,A.workId,aOriginal);writeFile(SRC,B.workId,bOriginal);
    const aRecords=collect(SRC,A),bRecords=collect(SRC,B);
    expect(aRecords).toHaveLength(11);
    expect(bRecords).toHaveLength(11);
    const keyA={keyId:randomUUID(),keyBytes:randomBytes(32)};
    const keyB={keyId:randomUUID(),keyBytes:randomBytes(32)};
    const sealedA=sealDeclaredWorkCandidate({authority:A,records:aRecords,census:census(),key:keyA});
    const sealedB=sealDeclaredWorkCandidate({authority:B,records:bRecords,census:census(),key:keyB});
    expect(JSON.stringify(sealedA)).not.toContain('FICTIONAL A');
    expect(JSON.stringify(sealedB)).not.toContain('FICTIONAL B');
    const oldDb=d(['exec',SRC,'pg_dump','-Fc','-U','postgres','-d','postgres']);
    const oldVault=d(['exec',SRC,'tar','-C','/vault','-cf','-','.']);
    const backupKey=randomBytes(32);
    const globalDb=genericSeal(backupKey,oldDb),globalVault=genericSeal(backupKey,oldVault);
    expect(genericOpen(backupKey,globalDb)).toEqual(oldDb);
    expect(genericOpen(backupKey,globalVault)).toEqual(oldVault);
    // Live fictional deletion. Pre-delete globally encrypted archives stay available.
    for(const table of tables.keys()){
      sql(SRC,`DELETE FROM ${table} WHERE work_id='${A.workId}'`);
      expect(sql(SRC,`SELECT count(*) FROM ${table} WHERE work_id='${A.workId}'`)).toBe('0');
    }
    d(['exec',SRC,'rm','/vault/'+A.workId+'.docx']);
    // Actual old PG archive and file TAR can reconstruct deleted fictional A.
    d(['exec','-i',RESTORE,'pg_restore','--exit-on-error','--no-owner',
      '--no-privileges','-U','postgres','-d','postgres'],genericOpen(backupKey,globalDb),90000);
    d(['exec','-i',RESTORE,'tar','-C','/vault','-xf','-'],genericOpen(backupKey,globalVault));
    expect(sql(RESTORE,`SELECT count(*) FROM manuscript_working_drafts WHERE work_id='${A.workId}'`)).toBe('1');
    expect(readFile(RESTORE,A.workId)).toEqual(aOriginal);
    expect(readFile(RESTORE,B.workId)).toEqual(bOriginal);
    const signer=generateKeyPairSync('ed25519');
    const checkpoint:DeletionHighwaterV1={protocol:'soullab.ws.deletion-highwater.v1',
      stream:'writers-studio-beta',generation:2,
      revokedWorks:[A.workId],revokedKeyIds:[keyA.keyId]};
    const signedHighwater={checkpoint,
      signature:sign(null,canonicalDeletionPayload(checkpoint),signer.privateKey).toString('base64')};
    const externalMinimum={minimumGeneration:2}; // Pure synthetic stand-in, NOT independent production custody.
    expect(()=>restoreDeclaredWorkCandidate({authority:A,sealed:sealedA,census:census(),key:keyA,
      signedHighwater,trustedPublicSigner:signer.publicKey,trustedMinimum:externalMinimum}))
      .toThrow(expect.objectContaining({code:'deleted_work_refused'}));
    const restoredB=restoreDeclaredWorkCandidate({authority:B,sealed:sealedB,census:census(),key:keyB,
      signedHighwater,trustedPublicSigner:signer.publicKey,trustedMinimum:externalMinimum});
    expect(restoredB).toEqual(bRecords);
    expect(restoredB.find(r=>r.field==='original_source.bytes')?.value).toEqual(bOriginal);
    // The identical encrypted B ciphertext fails if somebody substitutes A's member identity.
    expect(()=>restoreDeclaredWorkCandidate({authority:{...B,memberId:A.memberId},
      sealed:sealedB,census:census(),key:keyB,signedHighwater,
      trustedPublicSigner:signer.publicKey,trustedMinimum:externalMinimum}))
      .toThrow(expect.objectContaining({code:'work_envelope_authentication_failed'}));
  }finally{
    for(const n of madeContainers.reverse()){
      try{d(['rm','-f',n],undefined,45000);}catch{/* evidence is failing test cleanup, not production fallback */}
    }
    for(const v of madeVolumes.reverse()){
      try{d(['volume','rm',v],undefined,45000);}catch{/* preserve for explicit manual review on failure */}
    }
  }
  expect(exists('container',SRC)).toBe(false);
  expect(exists('container',RESTORE)).toBe(false);
  expect(exists('volume',SV)).toBe(false);
  expect(exists('volume',RV)).toBe(false);
});
