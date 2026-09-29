#!/usr/bin/env tsx
import assert from 'node:assert/strict';
import { PromptTemplate } from '@langchain/core/prompts';
import { SingularityNetLLM } from '../../../lib/langchain/adapters/SingularityNetLLM';

async function main() {
  const calls: Array<{ url: string; body: any }> = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    calls.push({ url, body });
    return new Response(JSON.stringify({ output: 'agix-ok' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;

  try {
  const llm = new SingularityNetLLM({
    endpoint: 'https://agix.test',
    service: 'text-gen',
    model: 'maya-test',
    maxRetries: 1,
  });

  const direct = await llm.invoke('hello');
  assert.equal(direct, 'agix-ok');
  const prompt = PromptTemplate.fromTemplate('Prompt {query}');
  const piped = await prompt.pipe(llm).invoke({ query: 'world' });
  assert.equal(piped, 'agix-ok');

  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://agix.test/text-gen');
  assert.equal(calls[0].body.prompt, 'hello');
  assert.equal(calls[1].body.prompt, 'Prompt world');
  assert.equal(calls[1].body.model, 'maya-test');

  console.log('LANGCHAIN1 RUNTIME: PASS');
  console.log('  BaseLLM.invoke traverses _generate → _call');
  console.log('  PromptTemplate.pipe(custom LLM) remains operational');
  console.log('  no external provider/network call occurred');
} finally {
  globalThis.fetch = originalFetch;
}
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
