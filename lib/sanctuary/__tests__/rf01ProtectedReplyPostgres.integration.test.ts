/**
 * RF01 S1-C fictional PostgreSQL16 full authorization-to-provider seam.
 * Real content-free DB writes and both HTTP preflight routes; Anthropic SDK
 * completely mocked. NO network, real member data, paid call or production.
 *
 * Test runner hard-refuses any database other than a fixed disposable
 * localhost Docker fixture. No public MAIA ingress is activated.
 */
import {describe,it,expect,beforeAll,beforeEach,afterAll,jest} from '@jest/globals';
import {NextRequest} from 'next/server';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const DB_URL=process.env.DATABASE_URL||'';
const parsed=new URL(DB_URL||'postgresql://invalid:invalid@localhost/');
if (process.env.RF01_S1C_PG16!=='1' ||
    parsed.protocol!=='postgresql:' ||
    parsed.hostname!=='127.0.0.1' ||
    parsed.port!=='55478' ||
    parsed.username!=='rf01' ||
    parsed.pathname!=='/rf01_s1c_fixture') {
  throw new Error('REFUSING_NON_FICTIONAL_S1C_DATABASE');
}

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const S='s1c-member-a';
const CANARY='RF01_PRIVATE_WORDS_NOT_FOR_ANY_LOG_OR_DATABASE';

const mockCreate=jest.fn<(...args:any[])=>Promise<any>>();
const mockPre=jest.fn<(...args:any[])=>any>();
const mockPost=jest.fn<(...args:any[])=>any>();
const mockTelemetry=jest.fn<(...args:any[])=>Promise<any>>();

jest.mock('@anthropic-ai/sdk',()=>({
  __esModule:true,
  default:class FictionalAnthropicSDK {
    messages={create:(...args:any[])=>mockCreate(...args)};
  },
}));
jest.mock('@/lib/auth/getMemberFromRequest',()=>({
  getMemberIdFromRequest:async(req:NextRequest)=>
    req.headers.get('x-session-token')==='fixture-a'?A:
    req.headers.get('x-session-token')==='fixture-b'?B:null,
  getMemberIdFromSessionToken:async(token:string)=>
    token==='fixture-a'?A:token==='fixture-b'?B:null,
}));
jest.mock('@/lib/sovereign/stanceReanchor',()=>({
  logStancePre:(...args:any[])=>mockPre(...args),
  logStancePost:(...args:any[])=>mockPost(...args),
}));
jest.mock('@/lib/db/voiceTierTelemetry',()=>({
  logVoiceTierTelemetry:(...args:any[])=>mockTelemetry(...args),
}));
import {query,closePool} from '@/lib/db/postgres';
import {POST as privacyPOST} from '@/app/api/sovereign/privacy/turn-consent/route';
import {POST as grantPOST} from '@/app/api/sovereign/privacy/processing-grant/route';
import {S1B_DISCLOSURE} from '../externalProcessingGrant';
import {produceFictionalProtectedTextReply} from '../protectedTextReply';

const req=(path:string,body:unknown,token='fixture-a')=>
  new NextRequest('https://soullab.life'+path,{
    method:'POST',
    headers:{'Content-Type':'application/json','x-session-token':token},
    body:JSON.stringify(body),
  });
const preflightPath='/api/sovereign/privacy/turn-consent';
const grantPath='/api/sovereign/privacy/processing-grant';
const fixtureInput=(exchangeId:string,message=CANARY)=>({
  verifiedMemberId:A,sessionId:S,exchangeId,
  memberText:message,sanctuary:true,includeAudio:false,
});

async function establishFixtureGrant(exchangeId:string):Promise<void>{
  const pre=await privacyPOST(req(preflightPath,{
    memberId:A,sessionId:S,exchangeId,privacyChoice:'sanctuary',
    explicitChoice:true,
  }));
  expect(pre.status).toBe(200);
  const grant=await grantPOST(req(grantPath,{
    memberId:A,sessionId:S,exchangeId,processor:'anthropic',
    purpose:'turn_text_generation',disclosureVersion:S1B_DISCLOSURE,
    explicitProcessorAuthorization:true,
  }));
  expect(grant.status).toBe(200);
}

let originalFetch:typeof global.fetch;
beforeAll(async()=>{
  const proof=await query<{db:string;version:number}>(
    "SELECT current_database() AS db,current_setting('server_version_num')::int AS version",
  );
  expect(proof.rows[0].db).toBe('rf01_s1c_fixture');
  expect(proof.rows[0].version).toBeGreaterThanOrEqual(160000);
  originalFetch=global.fetch;
  // If ANY code attempts a network fetch rather than the fake SDK, fail.
  global.fetch=jest.fn(async()=>{
    throw new Error('FICTIONAL_NETWORK_REQUEST_FORBIDDEN');
  }) as typeof global.fetch;
});
beforeEach(async()=>{
  process.env.RF01_S1C_PG16='1';
  process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED='1';
  process.env.RF01_S1C_DISPATCH_RESERVATIONS_ENABLED='1';
  process.env.RF01_S1B_GRANT_WRITES_ENABLED='1';
  process.env.RF01_S1B_PROVIDER_DISPATCH_ENABLED='1';
  process.env.ANTHROPIC_API_KEY='RF01_FAKE_NOT_A_REAL_API_KEY';
  mockCreate.mockReset();mockPre.mockReset();mockPost.mockReset();mockTelemetry.mockReset();
  mockCreate.mockImplementation(async()=>({
    content:[{type:'text',text:'FICTIONAL_MAIA_PRESENT_TURN_ONLY'}],
  }));
  await query('DELETE FROM runtime_processing_dispatch_reservations');
  await query('DELETE FROM runtime_processing_grants');
  await query('DELETE FROM runtime_consent_state');
});
afterAll(async()=>{
  global.fetch=originalFetch;
  for(const key of [
    'RF01_S1C_FICTIONAL_RESPONSE_ENABLED',
    'RF01_S1C_DISPATCH_RESERVATIONS_ENABLED',
    'RF01_S1B_GRANT_WRITES_ENABLED',
    'RF01_S1B_PROVIDER_DISPATCH_ENABLED',
    'ANTHROPIC_API_KEY',
  ])delete process.env[key];
  await closePool();
});

describe('RF01 S1-C physical, no-network protected text sequence',()=>{
  it('preflight → separate authenticated grant → one SDK call → no writes',async()=>{
    const exchangeId=randomUUID();
    await establishFixtureGrant(exchangeId);
    const diagnosticOutput:string[]=[];
    const logSpy=jest.spyOn(console,'log').mockImplementation((...parts)=>{
      diagnosticOutput.push(parts.map(String).join(' '));
    });
    const warnSpy=jest.spyOn(console,'warn').mockImplementation((...parts)=>{
      diagnosticOutput.push(parts.map(String).join(' '));
    });
    const errorSpy=jest.spyOn(console,'error').mockImplementation((...parts)=>{
      diagnosticOutput.push(parts.map(String).join(' '));
    });
    let result;
    try {
      result=await produceFictionalProtectedTextReply(fixtureInput(exchangeId));
    } finally {
      logSpy.mockRestore();warnSpy.mockRestore();errorSpy.mockRestore();
    }
    expect(diagnosticOutput.join(' ')).not.toContain(CANARY);
    expect(diagnosticOutput.join(' ')).not.toContain('FICTIONAL_MAIA_PRESENT_TURN_ONLY');
    expect(result).toMatchObject({
      ok:true,status:200,body:{
        message:'FICTIONAL_MAIA_PRESENT_TURN_ONLY',
        sanctuary:true,audio:null,provider:'anthropic',
        exchangeId,sessionId:S,
      },
    });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const sdkArgs=mockCreate.mock.calls[0];
    expect(sdkArgs[0].messages).toEqual([{role:'user',content:CANARY}]);
    expect(sdkArgs[1]).toEqual({maxRetries:0});
    expect(sdkArgs[0].system).toContain('No past conversation');
    expect(sdkArgs[0].system).not.toContain(CANARY);
    expect(mockPre).not.toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
    expect(mockTelemetry).not.toHaveBeenCalled();
    const db=await query<{n:string}>(
      'SELECT COUNT(*)::text AS n FROM runtime_processing_dispatch_reservations');
    expect(db.rows[0].n).toBe('1');
  });
  it('the reservation survives a new Node process after a completed protected reply',async()=>{
    const exchangeId=randomUUID();
    await establishFixtureGrant(exchangeId);
    expect((await produceFictionalProtectedTextReply(fixtureInput(exchangeId))).ok).toBe(true);
    const script=[
      "const {Client}=require('pg');",
      "const c=new Client({connectionString:process.env.DATABASE_URL});",
      "(async()=>{await c.connect();",
      "const r=await c.query('SELECT COUNT(*)::int AS n FROM runtime_processing_dispatch_reservations WHERE request_id=$1',[process.env.RF01_EXPECTED_EXCHANGE_ID]);",
      "if(r.rows[0].n!==1)process.exitCode=7;",
      "else process.stdout.write('FRESH_PROCESS_RESERVATION_PRESENT');",
      "await c.end();})().catch(()=>{process.exitCode=8});",
    ].join('');
    const fresh=spawnSync(process.execPath,['-e',script],{
      cwd:process.cwd(),
      env:{...process.env,RF01_EXPECTED_EXCHANGE_ID:exchangeId},
      encoding:'utf8',timeout:5000,
    });
    expect(fresh.status).toBe(0);
    expect(fresh.stdout).toBe('FRESH_PROCESS_RESERVATION_PRESENT');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
  it('the same exchange ID cannot dispatch even changed content twice',async()=>{
    const exchangeId=randomUUID();
    await establishFixtureGrant(exchangeId);
    const first=await produceFictionalProtectedTextReply(fixtureInput(exchangeId));
    expect(first.ok).toBe(true);
    const retry=await produceFictionalProtectedTextReply(fixtureInput(exchangeId,'DIFFERENT_FICTIONAL_TEXT'));
    expect(retry).toMatchObject({ok:false,status:503});
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
  it('competing copies of one authorized turn yield exactly one SDK request',async()=>{
    const exchangeId=randomUUID();
    await establishFixtureGrant(exchangeId);
    const attempts=await Promise.all([
      produceFictionalProtectedTextReply(fixtureInput(exchangeId)),
      produceFictionalProtectedTextReply(fixtureInput(exchangeId)),
    ]);
    expect(attempts.filter(o=>o.ok)).toHaveLength(1);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const db=await query<{n:string}>(
      'SELECT COUNT(*)::text AS n FROM runtime_processing_dispatch_reservations');
    expect(db.rows[0].n).toBe('1');
  });
  it('a vendor exception leaves a claim, never echoing content or auto-retrying',async()=>{
    const exchangeId=randomUUID();
    await establishFixtureGrant(exchangeId);
    mockCreate.mockImplementation(async()=>{
      throw new Error('FICTIONAL_VENDOR_EXCEPTION_WITH_PRIVATE_CANARY:'+CANARY);
    });
    const first=await produceFictionalProtectedTextReply(fixtureInput(exchangeId));
    expect(first).toMatchObject({ok:false,status:503});
    expect(JSON.stringify(first)).not.toContain(CANARY);
    const retry=await produceFictionalProtectedTextReply(fixtureInput(exchangeId));
    expect(retry.ok).toBe(false);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const db=await query<{n:string}>(
      'SELECT COUNT(*)::text AS n FROM runtime_processing_dispatch_reservations');
    expect(db.rows[0].n).toBe('1');
  });
  it('no processing grant means no SDK dispatch, even with Sanctuary preflight',async()=>{
    const exchangeId=randomUUID();
    const pre=await privacyPOST(req(preflightPath,{
      memberId:A,sessionId:S,exchangeId,privacyChoice:'sanctuary',
      explicitChoice:true,
    }));
    expect(pre.status).toBe(200);
    const result=await produceFictionalProtectedTextReply(fixtureInput(exchangeId));
    expect(result).toMatchObject({ok:false,status:428});
    expect(mockCreate).not.toHaveBeenCalled();
  });
  it('a foreign actor cannot use the authorized member’s processing grant',async()=>{
    const exchangeId=randomUUID();
    await establishFixtureGrant(exchangeId);
    const result=await produceFictionalProtectedTextReply({
      ...fixtureInput(exchangeId),verifiedMemberId:B,
    });
    expect(result).toMatchObject({ok:false,status:503});
    expect(mockCreate).not.toHaveBeenCalled();
  });
  it('audio request never enters the grant or SDK and never creates dispatch',async()=>{
    const exchangeId=randomUUID();
    await establishFixtureGrant(exchangeId);
    const result=await produceFictionalProtectedTextReply({
      ...fixtureInput(exchangeId),includeAudio:true,
    });
    expect(result).toMatchObject({ok:false,status:428});
    expect(mockCreate).not.toHaveBeenCalled();
    const out=await query<{n:string}>(
      'SELECT COUNT(*)::text AS n FROM runtime_processing_dispatch_reservations');
    expect(out.rows[0].n).toBe('0');
  });
  it('the three custody tables never contain user or model content',async()=>{
    const exchangeId=randomUUID();
    await establishFixtureGrant(exchangeId);
    expect((await produceFictionalProtectedTextReply(fixtureInput(exchangeId))).ok).toBe(true);
    for(const table of [
      'runtime_consent_state',
      'runtime_processing_grants',
      'runtime_processing_dispatch_reservations',
    ]){
      const rows=await query<Record<string,unknown>>('SELECT * FROM '+table);
      expect(JSON.stringify(rows.rows)).not.toContain(CANARY);
      expect(JSON.stringify(rows.rows)).not.toContain('FICTIONAL_MAIA_PRESENT_TURN_ONLY');
    }
  });
  it('default-off response gate blocks processing even after a valid grant',async()=>{
    const exchangeId=randomUUID();
    await establishFixtureGrant(exchangeId);
    delete process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED;
    const result=await produceFictionalProtectedTextReply(fixtureInput(exchangeId));
    expect(result).toMatchObject({ok:false,status:503});
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
