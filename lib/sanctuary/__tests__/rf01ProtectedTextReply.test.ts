/** RF01 S1-C protected reply seam — fictional, network-free tests. */
import {describe,it,expect,beforeEach,jest} from '@jest/globals';
const A='11111111-1111-4111-8111-111111111111';
const S='fixture-owned-sanctuary';
const X='44444444-4444-4444-8444-444444444444';
const CANARY='RF01_PRIVATE_MEMBER_WORDS_DO_NOT_SAVE';

const mockOwner=jest.fn<(sessionId:string,userId:string)=>Promise<void>>();
const mockPosture=jest.fn<(arg:any)=>Promise<any>>();
const mockGrant=jest.fn<(arg:any)=>Promise<any>>();
const mockGenerate=jest.fn<(req:any)=>Promise<any>>();
jest.mock('@/lib/sovereign/memberSessionOwnership',()=>({
 requireExistingOwnedSession:(sid:string,userId:string)=>mockOwner(sid,userId),
}));
jest.mock('../explicitTurnConsent',()=>({
 validExchangeId:(value:any)=>typeof value==='string'&&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
 verifyExplicitTurnConsent:(arg:any)=>mockPosture(arg),
}));
jest.mock('../externalProcessingGrant',()=>({
 verifyAnthropicTurnGrant:(arg:any)=>mockGrant(arg),
}));
jest.mock('@/lib/ai/modelService',()=>({
 generateText:(arg:any)=>mockGenerate(arg),
}));
import {produceFictionalProtectedTextReply,S1C_TEXT_MESSAGE_LIMIT} from '../protectedTextReply';
const input=()=>({
 verifiedMemberId:A,sessionId:S,exchangeId:X,
 memberText:CANARY,sanctuary:true,
 includeAudio:false,
});
beforeEach(()=>{
 delete process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED;
 mockOwner.mockReset();mockPosture.mockReset();mockGrant.mockReset();mockGenerate.mockReset();
 mockOwner.mockImplementation(async()=>undefined);
 mockPosture.mockImplementation(async()=>({ok:true}));
 mockGrant.mockImplementation(async()=>({ok:true,processor:'anthropic'}));
 mockGenerate.mockImplementation(async()=>({
   text:'FICTIONAL_MAIA_TEXT',
   provider:{provider:'anthropic',model:'fictional-sonnet',mode:'full'},
   servingTruth:{routingContract:'rf01_explicit_anthropic',
     intended:{kind:'provider',provider:'anthropic',domain:'external'},
     serviceState:'served_model',
     served:{kind:'model',provider:'anthropic',domain:'external',model:'fictional-sonnet'}},
 }));
});
describe('RF01 S1-C fixture-only private response pipeline',()=>{
 it('is unavailable by default even with a complete grant',async()=>{
   const out=await produceFictionalProtectedTextReply(input());
   expect(out).toMatchObject({ok:false,status:503,
     body:{error:'PROTECTED_PROCESSING_STILL_HELD'}});
   expect(mockOwner).not.toHaveBeenCalled();
   expect(mockGenerate).not.toHaveBeenCalled();
 });
 it('production cannot activate this fixture responder even if a flag is set',async()=>{
   const prior=process.env.NODE_ENV;
   process.env.NODE_ENV='production';
   process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED='1';
   try {
     const out=await produceFictionalProtectedTextReply(input());
     expect(out).toMatchObject({ok:false,status:503,
       body:{error:'PROTECTED_PROCESSING_STILL_HELD'}});
     expect(mockOwner).not.toHaveBeenCalled();
     expect(mockGenerate).not.toHaveBeenCalled();
   } finally {
     process.env.NODE_ENV=prior;
   }
 });
 it('rejects outside metadata and any voice request before session lookup',async()=>{
   process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED='1';
   for(const request of [
     {...input(),includeAudio:true},
     {...input(),includeAudio:'true'},
     {...input(),outsideContext:{memory:'FAKE'}},
   ])expect((await produceFictionalProtectedTextReply(request)).ok).toBe(false);
   expect(mockOwner).not.toHaveBeenCalled();
   expect(mockGenerate).not.toHaveBeenCalled();
 });
 it('rejects malformed turn or oversize text without SQL',async()=>{
   process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED='1';
   for(const request of [
     {...input(),memberText:''},{...input(),memberText:'x'.repeat(S1C_TEXT_MESSAGE_LIMIT+1)},
     {...input(),exchangeId:'not-a-turn-id'},
     {...input(),verifiedMemberId:''},
   ])expect((await produceFictionalProtectedTextReply(request)).ok).toBe(false);
   expect(mockOwner).not.toHaveBeenCalled();
 });
 it('requires the actual owner before reading consent or processing',async()=>{
   process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED='1';
   mockOwner.mockImplementation(async()=>{throw new Error('UNOWNED_SESSION')});
   expect((await produceFictionalProtectedTextReply(input())).ok).toBe(false);
   expect(mockPosture).not.toHaveBeenCalled();
   expect(mockGenerate).not.toHaveBeenCalled();
 });
 it('no verified Sanctuary posture means no provider call',async()=>{
   process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED='1';
   mockPosture.mockImplementation(async()=>({ok:false,code:'CONSENT_RECEIPT_REQUIRED'}));
   expect(await produceFictionalProtectedTextReply(input()))
     .toMatchObject({ok:false,status:428});
   expect(mockGrant).not.toHaveBeenCalled();
   expect(mockGenerate).not.toHaveBeenCalled();
 });
 it('no separately approved Anthropic grant means no provider call',async()=>{
   process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED='1';
   mockGrant.mockImplementation(async()=>({ok:false,code:'GRANT_MISSING'}));
   expect(await produceFictionalProtectedTextReply(input()))
     .toMatchObject({ok:false,status:428});
   expect(mockGenerate).not.toHaveBeenCalled();
 });
 it('passes only a fixed system prompt, current member words, and verified IDs',async()=>{
   process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED='1';
   const out=await produceFictionalProtectedTextReply(input());
   expect(out).toMatchObject({ok:true,status:200,body:{
     message:'FICTIONAL_MAIA_TEXT',sanctuary:true,audio:null,
     provider:'anthropic',exchangeId:X,sessionId:S,
   }});
   expect(mockOwner).toHaveBeenCalledWith(S,A);
   expect(mockPosture).toHaveBeenCalledWith({
     memberId:A,sessionId:S,exchangeId:X,sanctuary:true,
   });
   expect(mockGrant).toHaveBeenCalledWith({memberId:A,sessionId:S,exchangeId:X});
   expect(mockGenerate).toHaveBeenCalledTimes(1);
   const arg=mockGenerate.mock.calls[0][0];
   expect(arg.userInput).toBe(CANARY);
   expect(arg.systemPrompt).toContain('No past conversation');
   expect(arg.systemPrompt).not.toContain(CANARY);
   expect(arg.meta).toEqual({sanctuary:true,userId:A,sessionId:S,exchangeId:X});
   expect(JSON.stringify(out.body)).not.toContain(CANARY);
 });
 it('wrong served provider is rejected, not misrepresented as Anthropic',async()=>{
   process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED='1';
   mockGenerate.mockImplementation(async()=>({
     text:'UNVERIFIED_REPLY',provider:{provider:'moonshot',model:'local',mode:'full'},
   }));
   expect(await produceFictionalProtectedTextReply(input()))
     .toMatchObject({ok:false,status:503,body:{error:'PROTECTED_PROVIDER_NOT_VERIFIED'}});
 });
 it('even an Anthropic-labelled response with mismatched serving truth is refused',async()=>{
   process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED='1';
   mockGenerate.mockImplementation(async()=>({
     text:'UNVERIFIED_SERVING_TRUTH',
     provider:{provider:'anthropic',model:'fictional',mode:'full'},
     servingTruth:{routingContract:'multi_engine',serviceState:'served_model',
       served:{kind:'model',provider:'anthropic',domain:'external',model:'fictional'}},
   }));
   expect(await produceFictionalProtectedTextReply(input()))
     .toMatchObject({ok:false,status:503,body:{error:'PROTECTED_PROVIDER_NOT_VERIFIED'}});
 });
 it('provider failures cannot echo member words or produce a fake success',async()=>{
   process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED='1';
   mockGenerate.mockImplementation(async()=>{
     throw new Error('PAID_PROVIDER_ECHO:'+CANARY);
   });
   const out=await produceFictionalProtectedTextReply(input());
   expect(out).toMatchObject({ok:false,status:503});
   expect(JSON.stringify(out)).not.toContain(CANARY);
 });
 it('the response body never contains an audio or recall payload',async()=>{
   process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED='1';
   const out=await produceFictionalProtectedTextReply(input());
   expect(Object.keys(out.body).sort()).toEqual([
     'audio','exchangeId','message','provider','sanctuary','sessionId',
   ].sort());
 });
});
