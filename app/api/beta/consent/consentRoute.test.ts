import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/getMemberFromRequest',()=>({getMemberIdFromRequest:jest.fn()}));
jest.mock('@/lib/writersStudio/betaAccessServer',()=>({writerStudioBetaPreConsentCandidate:jest.fn()}));
jest.mock('@/lib/writersStudio/betaConsentNotice',()=>({verifiedBetaConsentNotice:jest.fn()}));
jest.mock('@/lib/writersStudio/betaConsentGate',()=>({hasActiveWriterBetaConsent:jest.fn()}));
jest.mock('@/lib/db/postgres',()=>({query:jest.fn(),transaction:jest.fn()}));

import {getMemberIdFromRequest} from '@/lib/auth/getMemberFromRequest';
import {writerStudioBetaPreConsentCandidate} from '@/lib/writersStudio/betaAccessServer';
import {verifiedBetaConsentNotice} from '@/lib/writersStudio/betaConsentNotice';
import {hasActiveWriterBetaConsent} from '@/lib/writersStudio/betaConsentGate';
import {query,transaction} from '@/lib/db/postgres';
import {GET,POST} from './route';

const member='11111111-1111-4111-8111-111111111111';
const session=getMemberIdFromRequest as jest.Mock;
const candidate=writerStudioBetaPreConsentCandidate as jest.Mock;
const notice=verifiedBetaConsentNotice as jest.Mock;
const consent=hasActiveWriterBetaConsent as jest.Mock;
const db=query as jest.Mock;
const tx=transaction as jest.Mock;
const source='https://beta.soullab.life/api/beta/consent';
const agreedNotice={version:'fictional-v1',sha256:'a'.repeat(64),text:'Fictional-only consent notice. This is not a release agreement.'};
const get=()=>new NextRequest(source,{headers:{host:'beta.soullab.life'}});
const post=(decision:unknown,origin='https://beta.soullab.life',body?:unknown)=>
  new NextRequest(source,{method:'POST',headers:{host:'beta.soullab.life',origin,'content-type':'application/json'},
    body:JSON.stringify(body===undefined?(decision==='accept'?{decision,policyVersion:agreedNotice.version,policySHA256:agreedNotice.sha256}:{decision}):body)});

describe('Writer Studio consent-only doorway (never general manuscript access)',()=>{
 const prev=process.env.WRITERS_STUDIO_RESTRICTED_BETA;
 beforeEach(()=>{
  jest.resetAllMocks();
  process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
  session.mockResolvedValue(member);
  candidate.mockResolvedValue(true);
  notice.mockReturnValue(agreedNotice);
  consent.mockResolvedValue(false);
  db.mockImplementation(async(sql:string)=>{
    if(sql.includes('FROM members WHERE id=$1 FOR UPDATE'))return {rows:[{id:member}],rowCount:1};
    if(sql.includes('SELECT seq,decision,policy_version,policy_sha256'))
      return {rows:[{seq:'1',decision:'accept',policy_version:agreedNotice.version,policy_sha256:agreedNotice.sha256}],rowCount:1};
    return {rows:[],rowCount:1};
  });
  tx.mockImplementation(async(fn:(client:unknown)=>Promise<unknown>)=>fn({query:(...args:unknown[])=>db(...args)}));
 });
 afterAll(()=>{
  if(prev===undefined)delete process.env.WRITERS_STUDIO_RESTRICTED_BETA;
  else process.env.WRITERS_STUDIO_RESTRICTED_BETA=prev;
 });

 it('refuses runtime outside beta and other origin host before inspecting any session',async()=>{
  delete process.env.WRITERS_STUDIO_RESTRICTED_BETA;
  expect((await GET(get())).status).toBe(404);
  expect(session).not.toHaveBeenCalled();
  process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
  const wrong=new NextRequest('https://soullab.life/api/beta/consent',{headers:{host:'soullab.life'}});
  expect((await GET(wrong)).status).toBe(403);
  expect(session).not.toHaveBeenCalled();
 });
 it('refuses anonymous or non-invited member before reading any notice',async()=>{
  session.mockResolvedValue(null);
  expect((await GET(get())).status).toBe(401);
  expect(candidate).not.toHaveBeenCalled();
  session.mockResolvedValue(member);
  candidate.mockResolvedValue(false);
  expect((await GET(get())).status).toBe(403);
  expect(notice).not.toHaveBeenCalled();
 });
 it('no approved notice means no implied consent or writable endpoint',async()=>{
  notice.mockReturnValue(null);
  const res=await GET(get());
  expect(res.status).toBe(503);
  expect((await res.json()).status).toBe('notice_pending');
  expect((await POST(post('accept'))).status).toBe(503);
  expect(db).not.toHaveBeenCalled();
 });
 it('only approved fictional notice is presented, without an automatic acceptance',async()=>{
  const res=await GET(get());expect(res.status).toBe(200);
  const data=await res.json();
  expect(data.status).toBe('awaiting_member_decision');
  expect(data.accepted).toBe(false);
  expect(data.notice).toBe(agreedNotice.text);
  expect(db).not.toHaveBeenCalled();
 });
 it('GET distinguishes saved, current consent from pre-consent state',async()=>{
  consent.mockResolvedValue(true);
  const res=await GET(get());expect(res.status).toBe(200);
  expect((await res.json()).status).toBe('accepted');
 });
 it('cross-site origin, mismatched member input and malformed decisions are denied',async()=>{
  expect((await POST(post('accept','https://attacker.invalid'))).status).toBe(403);
  expect((await POST(post('accept',undefined,{decision:'accept',memberId:member}))).status).toBe(400);
  expect((await POST(post('grant'))).status).toBe(400);
  expect(db).not.toHaveBeenCalled();
 });
 it('only member consent itself inserts a verified self-actor record',async()=>{
  const res=await POST(post('accept'));expect(res.status).toBe(200);
  expect((await res.json()).status).toBe('accepted');
  expect(tx).toHaveBeenCalledTimes(1);
  expect(db).toHaveBeenCalledTimes(2);
  expect(db.mock.calls[0][0]).toContain('FROM members WHERE id=$1 FOR UPDATE');
  const [sql,params]=db.mock.calls[1];
  expect(sql).toContain('VALUES($1,$1,$2,$3,$4)');
  expect(params).toEqual([member,'accept',agreedNotice.version,agreedNotice.sha256]);
 });
 it('stale notice confirmation refuses changes after GET before recording consent',async()=>{
  const res=await POST(post('accept','https://beta.soullab.life',{decision:'accept',policyVersion:'fictional-v0',policySHA256:agreedNotice.sha256}));
  expect(res.status).toBe(409);
  expect(db).not.toHaveBeenCalled();
 });
 it('revocation remains possible after notice is removed or rotated',async()=>{
  notice.mockReturnValue(null);
  db.mockImplementation(async(sql:string)=>{
    if(sql.includes('FOR UPDATE'))return {rows:[{id:member}]};
    if(sql.includes('SELECT seq,decision,policy_version,policy_sha256'))
      return {rows:[{seq:'4',decision:'accept',policy_version:'fictional-v0',policy_sha256:'b'.repeat(64)}]};
    return {rowCount:1,rows:[]};
  });
  const res=await POST(post('revoke'));
  expect(res.status).toBe(200);
  expect(db.mock.calls[0][0]).toContain('FOR UPDATE');
  expect(db.mock.calls[2][1]).toEqual([member,'revoke','fictional-v0','b'.repeat(64)]);
 });
 it('permits withdrawal after tester contact was deactivated, but never new acceptance',async()=>{
  candidate.mockResolvedValue(false);
  db.mockImplementation(async(sql:string)=>{
    if(sql.includes("decision='accept'"))return {rows:[{prior_accept:true}]};
    if(sql.includes('FOR UPDATE'))return {rows:[{id:member}]};
    if(sql.includes('SELECT seq,decision,policy_version,policy_sha256'))
      return {rows:[{seq:'4',decision:'accept',policy_version:'fictional-v0',policy_sha256:'b'.repeat(64)}]};
    return {rowCount:1,rows:[]};
  });
  const r=await POST(post('revoke'));
  expect(r.status).toBe(200);
  expect((await r.json()).status).toBe('revoked');
  expect(db.mock.calls[0][0]).toContain("decision='accept'");
  expect(db.mock.calls[3][1]).toEqual([member,'revoke','fictional-v0','b'.repeat(64)]);
  db.mockClear();
  expect((await POST(post('accept'))).status).toBe(403);
 });
 it('withdrawal records another member-owned event; it cannot set an unrelated actor',async()=>{
  const res=await POST(post('revoke'));expect(res.status).toBe(200);
  expect((await res.json()).status).toBe('revoked');
  expect(db.mock.calls[0][0]).toContain('FOR UPDATE');
  expect(db.mock.calls[1][0]).toContain('ORDER BY seq DESC LIMIT 1');
  expect(db.mock.calls[2][0]).toContain('VALUES($1,$1,$2,$3,$4)');
  expect(db.mock.calls[2][1]).toEqual([member,'revoke',agreedNotice.version,agreedNotice.sha256]);
 });
 it('fails closed if membership, consent or database authorities fail',async()=>{
  candidate.mockRejectedValueOnce(new Error('fictional test error'));
  expect((await GET(get())).status).toBe(503);
  db.mockRejectedValue(new Error('fictional write refusal'));
  expect((await POST(post('accept'))).status).toBe(503);
 });
});
