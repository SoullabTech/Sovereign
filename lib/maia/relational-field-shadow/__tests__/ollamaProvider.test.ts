import { assembleRelationalFieldPacket } from '../fieldAssembler';
import { deterministicShadowSeed, generateRelationalFieldPlan } from '../ollamaProvider';

const packet = assembleRelationalFieldPacket({
  exchangeId: 'ex-1',
  userInput: 'current',
  priorMemberTurns: [{ id: '1', exchangeId: 'old', content: 'earlier', createdAt: 'then' }],
});

describe('SH-F5/8 explicit structured local provider', () => {
  test('seed is deterministic by exchange/model/architecture', () => {
    expect(deterministicShadowSeed('e', 'm', 'a')).toBe(deterministicShadowSeed('e', 'm', 'a'));
    expect(deterministicShadowSeed('e', 'm2', 'a')).not.toBe(deterministicShadowSeed('e', 'm', 'a'));
  });

  test('sends the explicitly named model and evidence-bounded JSON schema', async () => {
    const calls: any[] = [];
    const fakeFetch = (async (_url: string, init?: RequestInit) => {
      calls.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({ response: JSON.stringify({
        synthesis: [{ text: 'a provisional perception', basisEvidenceIds: ['E2'] }],
        question: 'what opens from here?',
      }) }), { status: 200 });
    }) as typeof fetch;
    const out = await generateRelationalFieldPlan({
      packet, modelName: 'qwen3:32b', exchangeId: 'ex-1', architectureVersion: 'rf-test', fetchImpl: fakeFetch,
    });
    expect(out.modelName).toBe('qwen3:32b');
    expect(calls[0].model).toBe('qwen3:32b');
    expect(calls[0].stream).toBe(false);
    expect(calls[0].format.properties.synthesis.items.properties.basisEvidenceIds.items.enum).toEqual(['E1', 'E2']);
    expect(out.rawPlan.synthesis[0].basisEvidenceIds).toEqual(['E2']);
  });

  test('passes a real AbortSignal to fetch', async () => {
    let signal: AbortSignal | undefined;
    const fakeFetch = (async (_url: string, init?: RequestInit) => {
      signal = init?.signal as AbortSignal;
      return new Response(JSON.stringify({ response: JSON.stringify({
        synthesis: [{ text: 'a thought', basisEvidenceIds: ['E2'] }], question: 'what next?',
      }) }), { status: 200 });
    }) as typeof fetch;
    await generateRelationalFieldPlan({ packet, modelName: 'm', exchangeId: 'e', architectureVersion: 'a', fetchImpl: fakeFetch, timeoutMs: 50 });
    expect(signal).toBeDefined();
  });
});
