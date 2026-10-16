/**
 * R24: actual DB-backed Soullab session, beta invitation and consent + durable
 * fileVault encrypted PostgreSQL revision history, in a disposable PG16 DB.
 * Only Next's cookies() AsyncLocalStorage and external KMS are FICTIONAL.
 */
import { NextRequest } from 'next/server';
import { randomUUID, randomBytes, generateKeyPairSync, sign } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

jest.mock('next/headers',()=>({
  cookies:jest.fn(async()=>({get:(_name:string)=>undefined})),
}));
import { query, closePool } from '@/lib/db/postgres';
import { canonicalDeletionPayload, type DeletionHighwaterV1 }
  from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {
  saveHeldWriterRevisionR23, reopenHeldWriterRevisionR23,
  R23_REAL_MEMBER_VAULT_ENABLED, type R23FictionalCustodian,
} from '@/lib/writersStudio/recovery/reviewVaultHistoryServiceR23';
import { R23_REAL_WRITER_HISTORY_ENABLED }
  from '@/lib/writersStudio/recovery/heldVaultHistoryR23';

const enabled=process.env.R24_PG16_PHYSICAL==='fictional-only' &&
  process.env.R23_VAULT_SERVICE_FIXTURE==='fictional-only' &&
  process.env.R23_VAULT_HISTORY_FIXTURE==='fictional-only';
const run=enabled?describe:describe.skip;
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const WA='44444444-4444-4444-8444-444444444444';
const WB='55555555-5555-4555-8555-555555555555';
const AA='r24-synthetic-session-alpha';
const BB='r24-synthetic-session-beta';
const FF='r24-synthetic-session-founder';
const TE='r24-synthetic-session-expired', TR='r24-synthetic-session-revoked';
const H='a'.repeat(64), POLICY='r24-fixture-policy';
const TEXT1=Buffer.from('R24_FICTIONAL_W1_ first imagined chapter','utf8');
const TEXT2=Buffer.from('R24_FICTIONAL_W2_ revised invented chapter','utf8');
const rid=randomUUID();
const keys=new Map([
  [WA,{keyId:randomUUID(),keyBytes:randomBytes(32)}],
  [WB,{keyId:randomUUID(),keyBytes:randomBytes(32)}],
]);
const signer=generateKeyPairSync('ed25519');
function custodian(fault?:'wrong-scope'|'missing-proof'|'foreign-key'): R23FictionalCustodian {
  return {authority:'fixture_only_not_external_key_authority',
    resolve:async(scope)=>{
      const key=keys.get(fault==='foreign-key'?WA:scope.workId);
      if(!key)throw Error('synthetic key unavailable');
      const cp:DeletionHighwaterV1={
        protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
        generation:24,revokedWorks:[],revokedKeyIds:[],
      };
      return {
        scope:{...scope,workId:fault==='wrong-scope'?WB:scope.workId},
        key,
        trust:{
          signed:fault==='missing-proof'?null:{
            checkpoint:cp,
            signature:sign(null,canonicalDeletionPayload(cp),signer.privateKey)
              .toString('base64'),
          },
          signer:signer.publicKey,
          independent:{minimumGeneration:24},
        },
      };
    }};
}
function req(token:string, method:'GET'|'POST', opts?:{
  host?:string;origin?:string;claim?:string;missing?:boolean;
}):NextRequest {
  const host=opts?.host??'soullab.life';
  const headers:Record<string,string>={host};
  if(!opts?.missing)headers['x-session-token']=token;
  if(method==='POST')headers.origin=opts?.origin??'https://soullab.life';
  if(opts?.claim)headers['x-member-id']=opts.claim;
  return new NextRequest(`https://${host}/api/sovereign/writers-studio/held-pair`,
    {method,headers});
}
async function action(token:string,op:'append'|'read',workId=WA,
  generation=1,value=TEXT1,opts?:Parameters<typeof req>[2],
  custody=custodian()){
  const request=req(token,op==='append'?'POST':'GET',opts);
  if(op==='append')return saveHeldWriterRevisionR23({
    request,workId,generation,custodian:custody,
    records:[{field:'working_draft_revisions.content',
      recordId:rid,value}],
  });
  return reopenHeldWriterRevisionR23({
    request,workId,generation,custodian:custody,
  });
}
run('R24 real session + consent + actual PG16 encrypted file-vault Work history',()=>{
  afterAll(async()=>{
    const escrow=process.env.R24_FICTIONAL_ESCROW_PATH;
    // This file is ephemeral, outside SQL/vault/repository, and used ONLY to
    // rehearse reopening from a fresh Node process after a PG16 crash.
    // It is NOT an independently governed KMS or nonrollbackable witness.
    if(enabled && escrow){
      const testOnlyKeys=[...keys.entries()].map(([workId,key])=>({
        workId,keyId:key.keyId,keyBytesHex:key.keyBytes.toString('hex'),
      }));
      writeFileSync(escrow,JSON.stringify({testOnlyKeys,
        signerPKCS8:signer.privateKey.export({type:'pkcs8',format:'pem'})}),
        {flag:'wx',mode:0o600});
    }
    await closePool();
  });

  it('does not activate a real member writer or public route',()=>{
    expect(R23_REAL_MEMBER_VAULT_ENABLED).toBe(false);
    expect(R23_REAL_WRITER_HISTORY_ENABLED).toBe(false);
  });
  it('uses actual PostgreSQL owner rows for two independently owned fictional Works',async()=>{
    const a=await query('SELECT id FROM member_manuscripts WHERE id=$1 AND member_id=$2',[WA,A]);
    const b=await query('SELECT id FROM member_manuscripts WHERE id=$1 AND member_id=$2',[WB,B]);
    expect(a.rows).toHaveLength(1);
    expect(b.rows).toHaveLength(1);
  });
  it('author A saves two ciphertext generations and reopens exact earlier draft',async()=>{
    const first=await action(AA,'append',WA,1,TEXT1);
    const second=await action(AA,'append',WA,2,TEXT2);
    expect(first.kind).toBe('held_fixture_only');
    expect(second.kind).toBe('held_fixture_only');
    if(first.kind==='held_fixture_only'&&second.kind==='held_fixture_only' &&
      'memberId' in first.value && 'previousSHA256' in second.value){
      expect(first.value.memberId).toBe(A);
      expect(second.value.previousSHA256).toBe(first.value.cipherSHA256);
      expect(first.value.cipherRef).not.toBe(second.value.cipherRef);
    }
    const before=await action(AA,'read',WA,1);
    const after=await action(AA,'read',WA,2);
    expect(before.kind).toBe('held_fixture_only');
    expect(after.kind).toBe('held_fixture_only');
    if(before.kind==='held_fixture_only'&&after.kind==='held_fixture_only' &&
      'records' in before.value && 'records' in after.value){
      expect(before.value.records[0].value.equals(TEXT1)).toBe(true);
      expect(after.value.records[0].value.equals(TEXT2)).toBe(true);
      expect(before.value.manifest.cipherSHA256).not.toBe(after.value.manifest.cipherSHA256);
    }
  });
  it('refuses missing, invented, expired, revoked and identity-spoofed sessions',async()=>{
    for(const token of ['made-up-token',TE,TR])
      expect(await action(token,'read')).toEqual({kind:'refused',status:401});
    expect(await action('','read',WA,1,TEXT1,{missing:true}))
      .toEqual({kind:'refused',status:401});
    expect(await action(AA,'read',WA,1,TEXT1,{claim:B}))
      .toEqual({kind:'refused',status:401});
  });
  it('founder witness alone, wrong host and bad Origin cannot write',async()=>{
    expect(await action(FF,'read')).toEqual({kind:'refused',status:403});
    expect(await action(AA,'append',WA,3,TEXT2,{
      host:'beta.soullab.life',origin:'https://beta.soullab.life',
    })).toEqual({kind:'refused',status:403});
    expect(await action(AA,'append',WA,3,TEXT2,{
      origin:'https://example.test',
    })).toEqual({kind:'refused',status:403});
  });
  it('allows distinct B Work but independently rejects cross-writer read/write',async()=>{
    const own=await action(BB,'append',WB,1,Buffer.from('synthetic B own chapter'));
    expect(own.kind).toBe('held_fixture_only');
    expect(await action(BB,'read',WA,1,TEXT1,undefined,custodian('foreign-key')))
      .toEqual({kind:'refused',status:503});
    expect(await action(BB,'append',WA,3,TEXT2,undefined,custodian('foreign-key')))
      .toEqual({kind:'refused',status:503});
  });
  it('fails closed if external key scope or signed deletion checkpoint is missing',async()=>{
    expect(await action(AA,'read',WA,1,TEXT1,undefined,custodian('wrong-scope')))
      .toEqual({kind:'refused',status:503});
    expect(await action(AA,'read',WA,1,TEXT1,undefined,custodian('missing-proof')))
      .toEqual({kind:'refused',status:503});
  });
  it('authentically revoked consent prevents further read or writes',async()=>{
    await query(`INSERT INTO writers_studio_beta_consent_events
      (member_id,decision,policy_version,policy_sha256)
      VALUES($1,'revoke',$2,$3)`,[A,POLICY,H]);
    expect(await action(AA,'read')).toEqual({kind:'refused',status:403});
    expect(await action(AA,'append',WA,3,TEXT2))
      .toEqual({kind:'refused',status:403});
  });
  it('individually removed invitation denies read independently from consent',async()=>{
    process.env.WRITERS_STUDIO_BETA_MEMBER_IDS=B;
    expect(await action(AA,'read')).toEqual({kind:'refused',status:403});
  });
  it('revoked session denies member even if other rights still exist',async()=>{
    await query('UPDATE auth_sessions SET revoked=true WHERE session_token=$1',[AA]);
    expect(await action(AA,'read')).toEqual({kind:'refused',status:401});
  });
  it('database contains only manifest identifiers and SHA256, no ciphertext prose',async()=>{
    const out=await query(`SELECT * FROM writers_studio_r23_held_history
      WHERE manuscript_id=$1 ORDER BY work_generation`,[WA]);
    expect(out.rows).toHaveLength(2);
    for(const row of out.rows){
      const ref=row.cipher_ref as string;
      expect(ref.startsWith('ws-beta-r23-held-history/')).toBe(true);
      expect(typeof row.cipher_sha256).toBe('string');
      expect(JSON.stringify(row)).not.toContain('R24_FICTIONAL_W1_');
      expect(JSON.stringify(row)).not.toContain('R24_FICTIONAL_W2_');
      const saved=readFileSync(join(process.env.FILE_STORAGE_PATH!,ref));
      expect(saved.toString('utf8')).not.toContain('R24_FICTIONAL_W1_');
      expect(saved.toString('utf8')).not.toContain('R24_FICTIONAL_W2_');
    }
  });
});
