import { NextRequest } from 'next/server';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/auth/passwordUtils', () => ({ verifyPassword: jest.fn() }));
jest.mock('@/lib/auth/serverSessions', () => ({
  createSession: jest.fn(),
  setSessionCookie: jest.fn(),
  setAccessCookies: jest.fn(),
}));
jest.mock('@/lib/security/authAudit', () => ({ logAuthEvent: jest.fn() }));
jest.mock('@/lib/stellium/clients', () => ({ resolveMemberDisplayName: jest.fn(() => 'Fictional writer') }));
jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: jest.fn(),
  resetRateLimit: jest.fn(),
  getClientIP: jest.fn(() => '127.0.0.1'),
  buildRateLimitHeaders: jest.fn(() => ({})),
}));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({ writersStudioBetaAccess: jest.fn(), writerStudioBetaPreConsentCandidate: jest.fn() }));

import { query } from '@/lib/db/postgres';
import { verifyPassword } from '@/lib/auth/passwordUtils';
import { createSession } from '@/lib/auth/serverSessions';
import { checkRateLimit } from '@/lib/auth/rateLimiter';
import { writersStudioBetaAccess, writerStudioBetaPreConsentCandidate } from '@/lib/writersStudio/betaAccessServer';
import { POST } from './route';

const mockQuery=query as jest.MockedFunction<typeof query>;
const mockPassword=verifyPassword as jest.MockedFunction<typeof verifyPassword>;
const mockSession=createSession as jest.MockedFunction<typeof createSession>;
const mockRate=checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockAdmission=writersStudioBetaAccess as jest.MockedFunction<typeof writersStudioBetaAccess>;
const mockCandidate=writerStudioBetaPreConsentCandidate as jest.MockedFunction<typeof writerStudioBetaPreConsentCandidate>;
const memberId='44444444-4444-4444-8444-444444444444';
const member={ id:memberId, username:'fictional-test-member',password_hash:'mock-hash',
  name:'Fictional',preferred_name:'Fictional',tier:'free',roles:['member'],
  onboarded:true,onboarding_step:null,subscription_active:false,subscription_expires_at:null,
  has_webauthn:false,preferred_auth_method:'password',must_reset_password:false };
const req=()=>new NextRequest('https://beta.soullab.life/api/members/signin',{
  method:'POST',headers:{'content-type':'application/json',host:'beta.soullab.life'},
  body:JSON.stringify({username:member.username,password:'fictional-test-password'})
});

describe('WS-BETA-ENTRY-R1 denied sign-ins never create sessions',()=>{
 const prev=process.env.WRITERS_STUDIO_RESTRICTED_BETA;
 beforeEach(()=>{
   jest.resetAllMocks();
   process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
   mockRate.mockResolvedValue({allowed:true,remainingAttempts:4,blockedUntil:null,retryAfterSeconds:null});
   mockQuery.mockResolvedValue({rows:[member],rowCount:1} as any);
   mockPassword.mockResolvedValue({ok:true,needsUpgrade:false});
   mockSession.mockResolvedValue({id:'33333333-3333-4333-8333-333333333333',sessionToken:'a'.repeat(64),expiresAt:new Date('2026-12-01T00:00:00Z')} as any);
 });
 afterAll(()=>{
   if(prev===undefined)delete process.env.WRITERS_STUDIO_RESTRICTED_BETA;
   else process.env.WRITERS_STUDIO_RESTRICTED_BETA=prev;
 });
 it('refuses good credentials if the member is outside the beta cohort',async()=>{
   mockAdmission.mockResolvedValue({eligible:false,basis:'not_in_pilot'});
   const res=await POST(req());
   expect(res.status).toBe(403);
   expect(mockSession).not.toHaveBeenCalled();
 });
 it('fails closed if beta membership database authority is unavailable',async()=>{
   mockAdmission.mockRejectedValue(new Error('fixture database unavailable'));
   const res=await POST(req());
   expect(res.status).toBe(503);
   expect(mockSession).not.toHaveBeenCalled();
 });
 it('preserves wrong password refusal before membership discovery',async()=>{
   mockPassword.mockResolvedValue({ok:false,needsUpgrade:false});
   const res=await POST(req());
   expect(res.status).toBe(401);
   expect(mockAdmission).not.toHaveBeenCalled();
   expect(mockSession).not.toHaveBeenCalled();
 });
 it('allows already-approved fictional member credentials',async()=>{
   mockAdmission.mockResolvedValue({eligible:true,basis:'active_beta_tester'});
   const res=await POST(req());
   expect(res.status).toBe(200);
   expect(mockSession).toHaveBeenCalledTimes(1);
   expect((await res.json()).session.token).toMatch(/^[0-9a-f]{64}$/);
   expect(res.headers.get('set-cookie')).toContain('maia_session');
 });
 it('permits exact invited candidate to authenticate only into consent-only entrance',async()=>{
   mockAdmission.mockResolvedValue({eligible:false,basis:'not_in_pilot'});
   mockCandidate.mockResolvedValue(true);
   const res=await POST(req());
   expect(res.status).toBe(200);
   const body=await res.json();
   expect(body.betaConsentRequired).toBe(true);
   expect(mockCandidate).toHaveBeenCalledWith(memberId);
   expect(mockSession).toHaveBeenCalledTimes(1);
 });
 it('does not authenticate non-invited, non-consenting accounts',async()=>{
   mockAdmission.mockResolvedValue({eligible:false,basis:'not_in_pilot'});
   mockCandidate.mockResolvedValue(false);
   const res=await POST(req());
   expect(res.status).toBe(403);
   expect(mockSession).not.toHaveBeenCalled();
 });
 it('does not alter ordinary non-beta sign-in behavior',async()=>{
   delete process.env.WRITERS_STUDIO_RESTRICTED_BETA;
   const res=await POST(req());
   expect(res.status).toBe(200);
   expect(mockAdmission).not.toHaveBeenCalled();
   expect(mockSession).toHaveBeenCalledTimes(1);
 });
});
