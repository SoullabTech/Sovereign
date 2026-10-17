/**
 * RF01 S1-B: actual Claude adapter with a fake in-process SDK. Network-free.
 * Protected provider failure must not leak prompt text through debug/errors.
 */
import { describe,it,expect,beforeEach,afterEach,jest } from '@jest/globals';
const mockGuard=jest.fn<(meta:unknown)=>Promise<void>>();
const mockCreate=jest.fn<(...args:any[])=>Promise<any>>();
const mockPre=jest.fn<(...args:any[])=>any>();
const mockPost=jest.fn<(...args:any[])=>any>();
const mockTelemetry=jest.fn<(...args:any[])=>Promise<any>>();
jest.mock('@anthropic-ai/sdk',()=>({
 __esModule:true,
 default:class MockAnthropic {
   messages={create:(...a:any[])=>mockCreate(...a)};
 },
}));
jest.mock('@/lib/sanctuary/externalProcessingGrant',()=>({
 requireAnthropicTurnGrant:(meta:unknown)=>mockGuard(meta),
}));
jest.mock('@/lib/sovereign/stanceReanchor',()=>({
 logStancePre:(...a:any[])=>mockPre(...a),
 logStancePost:(...a:any[])=>mockPost(...a),
}));
jest.mock('@/lib/db/voiceTierTelemetry',()=>({
 logVoiceTierTelemetry:(...a:any[])=>mockTelemetry(...a),
}));
import { generateWithClaude } from '../claudeClient';

const meta={
 sanctuary:true,userId:'11111111-1111-4111-8111-111111111111',
 sessionId:'rf01-owned',exchangeId:'44444444-4444-4444-8444-444444444444',
};
const request=()=>({
 systemPrompt:'RF01_CANARY_PRIVATE_SYSTEM_PROMPT',
 userInput:'RF01_CANARY_PRIVATE_MEMBER_TEXT',
 meta,
});
beforeEach(()=>{
 process.env.ANTHROPIC_API_KEY='RF01_SYNTHETIC_KEY_NOT_A_REAL_SECRET';
 mockGuard.mockReset();mockCreate.mockReset();mockPre.mockReset();
 mockPost.mockReset();mockTelemetry.mockReset();
 mockGuard.mockImplementation(async()=>undefined);
 mockCreate.mockImplementation(async()=>({
  content:[{type:'text',text:'RF01_FAKE_RESPONSE'}],
 }));
});
afterEach(()=>{delete process.env.ANTHROPIC_API_KEY;jest.restoreAllMocks();});
describe('RF01 protected Anthropic SDK handoff',()=>{
 it('a missing grant refuses before the SDK receives any message',async()=>{
  mockGuard.mockImplementation(async()=>{throw new Error('NO_PROVIDER_GRANT')});
  await expect(generateWithClaude(request())).rejects.toThrow('NO_PROVIDER_GRANT');
  expect(mockCreate).not.toHaveBeenCalled();
  expect(mockTelemetry).not.toHaveBeenCalled();
 });
 it('valid grant permits only the mocked Anthropic text call',async()=>{
  const res=await generateWithClaude(request());
  expect(res.text).toBe('RF01_FAKE_RESPONSE');
  expect(mockGuard).toHaveBeenCalledWith(meta);
  expect(mockCreate).toHaveBeenCalledTimes(1);
  expect(mockCreate.mock.calls[0][0]).toMatchObject({
    messages:[{role:'user',content:'RF01_CANARY_PRIVATE_MEMBER_TEXT'}],
    system:'RF01_CANARY_PRIVATE_SYSTEM_PROMPT',
  });
 });
 it('protected content does not enter stance, tier, or debug logging',async()=>{
  const logged:string[]=[];
  jest.spyOn(console,'log').mockImplementation((...args)=>{
    logged.push(args.map(String).join(' '));
  });
  await generateWithClaude(request());
  expect(mockPre).not.toHaveBeenCalled();
  expect(mockPost).not.toHaveBeenCalled();
  expect(mockTelemetry).not.toHaveBeenCalled();
  expect(logged.join(' ')).not.toContain('RF01_CANARY_PRIVATE');
 });
 it('provider SDK exceptions do not echo protected prompt or member canaries',async()=>{
  mockCreate.mockImplementation(async()=>{
    throw new Error('RF01_CANARY_PRIVATE_MEMBER_TEXT in fake vendor error');
  });
  const errors:string[]=[];
  jest.spyOn(console,'error').mockImplementation((...args)=>{
    errors.push(args.map(String).join(' '));
  });
  await expect(generateWithClaude(request()))
    .rejects.toThrow('PROTECTED_PROVIDER_PROCESSING_UNAVAILABLE');
  expect(errors.join(' ')).not.toContain('RF01_CANARY_PRIVATE_MEMBER_TEXT');
 });
});
