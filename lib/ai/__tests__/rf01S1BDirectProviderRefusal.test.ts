/**
 * RF01 S1-B: the sole permitted protected text-provider scope is Anthropic.
 * Direct entry through other adapters is denied before any network request.
 */
import { describe,it,expect,beforeEach,jest } from '@jest/globals';
import { UnqualifiedProtectedProcessor } from '@/lib/sanctuary/externalProcessingGrant';
import { generateWithKimi } from '../kimiClient';
import { generateWithLocalModel } from '../localModelClient';
import { callLocalInference } from '../localInferenceClient';
import { generateWithMultipleEngines } from '../multiEngineOrchestrator';
import { generateTextWithSovereignty } from '../sovereignRouter';

const protectedInput={
 systemPrompt:'RF01_FICTIONAL_INFERENCE_SYSTEM',
 userInput:'RF01_FICTIONAL_PRIVATE_WORDS',
 meta:{sanctuary:true,externalProcessingGrant:'anthropic'},
};

describe('RF01 direct alternate-provider refusal',()=>{
 beforeEach(()=>jest.restoreAllMocks());
 it('Moonshot/Kimi refuses before a client key or fetch request',async()=>{
  const net=jest.spyOn(global,'fetch').mockImplementation(async()=>{
    throw new Error('NETWORK_MUST_NEVER_BE_USED');
  });
  await expect(generateWithKimi(protectedInput))
   .rejects.toBeInstanceOf(UnqualifiedProtectedProcessor);
  expect(net).not.toHaveBeenCalled();
 });
 it('configured local model route refuses before Ollama HTTP calls',async()=>{
  const net=jest.spyOn(global,'fetch').mockImplementation(async()=>{
    throw new Error('NETWORK_MUST_NEVER_BE_USED');
  });
  await expect(generateWithLocalModel(protectedInput))
   .rejects.toBeInstanceOf(UnqualifiedProtectedProcessor);
  expect(net).not.toHaveBeenCalled();
 });
 it('local inference service refuses before network, regardless of endpoint',async()=>{
  const net=jest.spyOn(global,'fetch').mockImplementation(async()=>{
    throw new Error('NETWORK_MUST_NEVER_BE_USED');
  });
  await expect(callLocalInference(protectedInput))
   .rejects.toBeInstanceOf(UnqualifiedProtectedProcessor);
  expect(net).not.toHaveBeenCalled();
 });
 it('multi-engine orchestration is never granted by Anthropic consent',async()=>{
  const net=jest.spyOn(global,'fetch').mockImplementation(async()=>{
    throw new Error('NETWORK_MUST_NEVER_BE_USED');
  });
  await expect(generateWithMultipleEngines(protectedInput,'full_orchestra'))
   .rejects.toBeInstanceOf(UnqualifiedProtectedProcessor);
  expect(net).not.toHaveBeenCalled();
 });
 it('direct sovereignRouter bypass is refused, not rerouted to local',async()=>{
  const net=jest.spyOn(global,'fetch').mockImplementation(async()=>{
    throw new Error('NETWORK_MUST_NEVER_BE_USED');
  });
  await expect(generateTextWithSovereignty(protectedInput,'local_only',Date.now()))
   .rejects.toBeInstanceOf(UnqualifiedProtectedProcessor);
  expect(net).not.toHaveBeenCalled();
 });
});
