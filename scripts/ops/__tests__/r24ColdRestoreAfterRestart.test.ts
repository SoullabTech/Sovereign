/**
 * R24 second, fresh Node process after isolated PostgreSQL SIGKILL/restart.
 * Fake Work keys live in an ephemeral isolated, non-repository test directory
 * and are removed by the controlling driver. NOT operational independent KMS.
 */
import { NextRequest } from 'next/server';
import { createHash, createPrivateKey, createPublicKey, sign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
jest.mock('next/headers',()=>({
  cookies:jest.fn(async()=>({get:(_name:string)=>undefined})),
}));
import { query, closePool } from '@/lib/db/postgres';
import { canonicalDeletionPayload, type DeletionHighwaterV1 }
  from '@/lib/writersStudio/recovery/deletionBarrierV1';
import { reopenHeldWriterRevisionR23, type R23FictionalCustodian }
  from '@/lib/writersStudio/recovery/reviewVaultHistoryServiceR23';

const enabled=process.env.R24_PG16_PHYSICAL==='fictional-only'
  &&process.env.R24_COLD_RESTORE_PHASE==='fictional-only'
  &&process.env.R23_VAULT_SERVICE_FIXTURE==='fictional-only'
  &&process.env.R23_VAULT_HISTORY_FIXTURE==='fictional-only';
const run=enabled?describe:describe.skip;
const WA='44444444-4444-4444-8444-444444444444';
const WB='55555555-5555-4555-8555-555555555555';
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const URL='https://soullab.life/api/sovereign/writers-studio/held-pair';
type TestEscrow={
  testOnlyKeys:Array<{workId:string;keyId:string;keyBytesHex:string}>;
  signerPKCS8:string;
};
const keyFile=process.env.R24_FICTIONAL_ESCROW_PATH||'';
const saved:TestEscrow=enabled ? JSON.parse(readFileSync(keyFile,'utf8')) : {
  testOnlyKeys:[],signerPKCS8:''
};
const signer=enabled ? createPrivateKey(saved.signerPKCS8) : null;
function grant():R23FictionalCustodian{
  return {authority:'fixture_only_not_external_key_authority',
    resolve:async scope=>{
      const k=saved.testOnlyKeys.find(x=>x.workId===scope.workId);
      if(!k || !signer)throw Error('synthetic fixture escrow unavailable');
      const cp:DeletionHighwaterV1={
        protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
        generation:24,revokedWorks:[],revokedKeyIds:[],
      };
      return {scope,
        key:{keyId:k.keyId,keyBytes:Buffer.from(k.keyBytesHex,'hex')},
        trust:{
          signed:{checkpoint:cp,signature:sign(null,canonicalDeletionPayload(cp),
            signer).toString('base64')},
          signer:createPublicKey(signer),
          independent:{minimumGeneration:24},
        },
      };
    }};
}
function request(token:string):NextRequest{
  return new NextRequest(URL,{method:'GET',headers:{
    host:'soullab.life','x-session-token':token,
  }});
}
run('R24 restarted PG16 and fresh-Node encrypted vault readback',()=>{
  afterAll(async()=>{await closePool();});
  it('still has expected PostgreSQL major after physical restart',async()=>{
    const r=await query('SHOW server_version');
    expect(String(r.rows[0]?.server_version)).toMatch(/^16\./);
    expect(saved.testOnlyKeys).toHaveLength(2);
  });
  it('authenticates separately invited writer B and recovers their exact stored bytes',async()=>{
    const result=await reopenHeldWriterRevisionR23({
      request:request('r24-synthetic-session-beta'),
      workId:WB,generation:1,custodian:grant(),
    });
    expect(result.kind).toBe('held_fixture_only');
    if(result.kind==='held_fixture_only'){
      expect(result.value.manifest.memberId).toBe(B);
      expect(result.value.records[0].value.toString('utf8'))
        .toBe('synthetic B own chapter');
      expect(result.value.manifest.previousSHA256).toBeNull();
      const cipher=readFileSync(join(
        process.env.FILE_STORAGE_PATH!,result.value.manifest.cipherRef));
      expect(createHash('sha256').update(cipher).digest('hex'))
        .toBe(result.value.manifest.cipherSHA256);
      expect(cipher.toString('utf8')).not.toContain('synthetic B own chapter');
    }
  });
  it('does not resurrect withdrawn/revoked writer A after restart',async()=>{
    const result=await reopenHeldWriterRevisionR23({
      request:request('r24-synthetic-session-alpha'),
      workId:WA,generation:1,custodian:grant(),
    });
    expect(result).toEqual({kind:'refused',status:401});
  });
  it('does not let writer B open author A ciphertext after restart',async()=>{
    const result=await reopenHeldWriterRevisionR23({
      request:request('r24-synthetic-session-beta'),
      workId:WA,generation:1,custodian:grant(),
    });
    expect(result).toEqual({kind:'refused',status:503});
  });
});
