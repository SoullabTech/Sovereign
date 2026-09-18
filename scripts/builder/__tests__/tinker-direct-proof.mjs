#!/usr/bin/env node
import {
  buildTinkerRequest, invokeTinkerDirect, parseTinkerResponse,
} from '../tinker-direct.mjs';

let passed = 0;
let failed = 0;
const assert = (name, condition, detail = '') => {
  if (condition) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail) console.log(`          ${detail}`);
};

console.log('\n=== T1: exact bounded request shape ===');
{
  const body = buildTinkerRequest({
    model: 'thinkingmachines/Inkling-Small',
    prompt: 'synthetic prompt',
    maxTokens: 128,
  });
  assert('request carries exact model and one user message',
    body.model === 'thinkingmachines/Inkling-Small'
      && body.messages.length === 1
      && body.messages[0].role === 'user'
      && body.messages[0].content === 'synthetic prompt');
  assert('request exposes no model tools', !('tools' in body));
  assert('unregistered model refuses', (() => {
    try { buildTinkerRequest({ model: 'other/model', prompt: 'x' }); return false; }
    catch (e) { return e.message === 'MODEL_NOT_REGISTERED'; }
  })());
}

console.log('\n=== T2: one HTTP call, exact endpoint, secret only in header ===');
{
  let calls = 0;
  let observed;
  const fakeFetch = async (url, options) => {
    calls++;
    observed = { url, options };
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          content: [
            { type: 'thinking', thinking: 'private reasoning must not surface' },
            { type: 'text', text: 'DIRECT TINKER OK' },
          ],
          usage: { input_tokens: 4, output_tokens: 3 },
          stop_reason: 'end_turn',
        };
      },
    };
  };
  const result = await invokeTinkerDirect({
    model: 'nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16',
    prompt: 'synthetic',
    apiKey: 'proof-secret',
    maxTokens: 64,
    fetchImpl: fakeFetch,
  });
  const sent = JSON.parse(observed.options.body);
  assert('transport performs exactly one fetch', calls === 1, String(calls));
  assert('endpoint is fixed to Tinker Anthropic-compatible messages API',
    observed.url === 'https://tinker.thinkingmachines.dev/services/tinker-prod/anthropic/api/v1/messages',
    observed.url);
  assert('credential is header-only and not in body',
    observed.options.headers['x-api-key'] === 'proof-secret'
      && !observed.options.body.includes('proof-secret'));
  assert('body carries exact Nemotron model and no tools',
    sent.model === 'nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16'
      && !('tools' in sent));
  assert('reasoning block is discarded and only answer text returns',
    result.text === 'DIRECT TINKER OK'
      && !JSON.stringify(result).includes('private reasoning'));
}

console.log('\n=== T3: fail closed on provider/tool anomalies ===');
{
  assert('unexpected tool_use refuses', (() => {
    try {
      parseTinkerResponse({ content: [{ type: 'tool_use', name: 'bash', input: {} }] });
      return false;
    } catch (e) {
      return e.message === 'UNEXPECTED_TOOL_USE';
    }
  })());

  let threw = false;
  try {
    await invokeTinkerDirect({
      model: 'thinkingmachines/Inkling-Small',
      prompt: 'x',
      apiKey: 'proof-secret',
      fetchImpl: async () => ({
        ok: false,
        status: 403,
        async json() { return { error: { message: 'denied' } }; },
      }),
    });
  } catch (e) {
    threw = /PROVIDER_HTTP_403/.test(e.message);
  }
  assert('non-2xx provider response refuses', threw);

  let calls = 0;
  try {
    await invokeTinkerDirect({
      model: 'thinkingmachines/Inkling-Small',
      prompt: 'x',
      apiKey: '',
      fetchImpl: async () => { calls++; throw new Error('must not run'); },
    });
  } catch (e) {
    assert('missing credential refuses before network', e.message === 'PROVIDER_CREDENTIAL_MISSING');
  }
  assert('missing credential made zero fetches', calls === 0, String(calls));
}

console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
