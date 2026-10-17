/**
 * RF01 S1-B — protected requests do not inherit configurable provider routes.
 * Every provider is a spy, not a network client.
 */
import { describe,it,expect,beforeEach,jest } from '@jest/globals';
const mockGuard=jest.fn<(meta:unknown)=>Promise<void>>();
const mockClaude=jest.fn<(...args:any[])=>Promise<any>>();
const mockKimi=jest.fn<(...args:any[])=>Promise<any>>();
const mockLocal=jest.fn<(...args:any[])=>Promise<any>>();
const mockOrchestra=jest.fn<(...args:any[])=>Promise<any>>();
const mockSovereign=jest.fn<(...args:any[])=>Promise<any>>();

jest.mock('@/lib/sanctuary/externalProcessingGrant',()=>{
 const real=jest.requireActual<any>('@/lib/sanctuary/externalProcessingGrant');
 return { ...real,requireAnthropicTurnGrant:(meta:unknown)=>mockGuard(meta) };
});
jest.mock('../claudeClient',()=>({
 generateWithClaude:(...a:any[])=>mockClaude(...a),
 checkClaudeHealth:async()=>({status:'offline'}),
}));
jest.mock('../localModelClient',()=>({
 generateWithLocalModel:(...a:any[])=>mockLocal(...a),
 checkLocalModelHealth:async()=>({status:'offline'}),
}));
jest.mock('../kimiClient',()=>({
 generateWithKimi:(...a:any[])=>mockKimi(...a),
 checkKimiHealth:async()=>({status:'offline'}),
 isKimiAvailable:()=>true,
}));
jest.mock('../multiEngineOrchestrator',()=>({
 generateWithMultipleEngines:(...a:any[])=>mockOrchestra(...a),
}));
jest.mock('../sovereignRouter',()=>({
 generateTextWithSovereignty:(...a:any[])=>mockSovereign(...a),
}));
import { generateText } from '../modelService';

const guarded={
 sanctuary:true,
 userId:'11111111-1111-4111-8111-111111111111',
 sessionId:'owned-private-turn',
 exchangeId:'44444444-4444-4444-8444-444444444444',
};
const req=(meta:Record<string,unknown>=guarded)=>({
 systemPrompt:'RF01_FICTIONAL_SYSTEM_CANARY',
 userInput:'RF01_FICTIONAL_MEMBER_WORDS',
 meta,
});
beforeEach(()=>{
 mockGuard.mockReset();mockClaude.mockReset();mockKimi.mockReset();
 mockLocal.mockReset();mockOrchestra.mockReset();mockSovereign.mockReset();
 mockGuard.mockImplementation(async()=>undefined);
 mockClaude.mockImplementation(async()=>({
  text:'RF01_FICTIONAL_ANSWER',
  provider:{provider:'anthropic',model:'fictional-claude',mode:'full'},
 }));
});
describe('RF01 protected model routing',()=>{
 it('does not enter ANY provider without a separate approved grant',async()=>{
  mockGuard.mockImplementation(async()=>{throw new Error('NO_GRANT')});
  await expect(generateText(req())).rejects.toThrow('NO_GRANT');
  expect(mockClaude).not.toHaveBeenCalled();
  expect(mockKimi).not.toHaveBeenCalled();
  expect(mockLocal).not.toHaveBeenCalled();
  expect(mockOrchestra).not.toHaveBeenCalled();
  expect(mockSovereign).not.toHaveBeenCalled();
 });
 it('a matched grant selects only Anthropic for one protected turn',async()=>{
  const r=await generateText(req());
  expect(r.text).toBe('RF01_FICTIONAL_ANSWER');
  expect(r.servingTruth?.routingContract).toBe('rf01_explicit_anthropic');
  expect(mockGuard).toHaveBeenCalledTimes(1);
  expect(mockClaude).toHaveBeenCalledTimes(1);
  expect(mockKimi).not.toHaveBeenCalled();
  expect(mockLocal).not.toHaveBeenCalled();
  expect(mockOrchestra).not.toHaveBeenCalled();
  expect(mockSovereign).not.toHaveBeenCalled();
 });
 it('malicious Kimi/multi-engine flags do not widen the provider scope',async()=>{
  await generateText(req({...guarded,useKimi:true,useMultiEngine:true,
    useMoonshot:true,orchestrationType:'full_orchestra'}));
  expect(mockClaude).toHaveBeenCalledTimes(1);
  expect(mockKimi).not.toHaveBeenCalled();
  expect(mockOrchestra).not.toHaveBeenCalled();
  expect(mockLocal).not.toHaveBeenCalled();
 });
 it('no local or vendor fallback occurs when protected Anthropic processing fails',async()=>{
  mockClaude.mockImplementation(async()=>{throw new Error('FICTIONAL_VENDOR_DOWN')});
  await expect(generateText(req())).rejects.toThrow('FICTIONAL_VENDOR_DOWN');
  expect(mockKimi).not.toHaveBeenCalled();
  expect(mockLocal).not.toHaveBeenCalled();
  expect(mockOrchestra).not.toHaveBeenCalled();
  expect(mockSovereign).not.toHaveBeenCalled();
 });
 it('grant check receives the exact actor, session and exchange identity',async()=>{
  await generateText(req());
  expect(mockGuard).toHaveBeenCalledWith(expect.objectContaining(guarded));
  expect(mockClaude.mock.calls[0][0]).toMatchObject({
   userInput:'RF01_FICTIONAL_MEMBER_WORDS',meta:guarded,
  });
 });
});
