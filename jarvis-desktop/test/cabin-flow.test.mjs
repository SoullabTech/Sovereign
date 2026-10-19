import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { inspectCabin, openCabin, CABIN_URL } = require('../src/cabin-flow.js');
const healthy = { status: 'ready', mode: 'offline', build: 'fictional-build', context: 'empty' };
function fake(health = healthy) {
  return async (url, options) => {
    assert.ok(url.startsWith('http://127.0.0.1:'));
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal);
    return { ok: true, json: async () => url.endsWith('/api/tags')
      ? { models: [{ name: 'qwen2.5:7b', capabilities: ['completion'] }] } : health };
  };
}
test('runtime readiness does not imply accepted conversation, writing, or recovery', async () => {
  const result = await inspectCabin({ fetchImpl: fake() });
  assert.equal(result.canOpen, true);
  for (const key of ['conversation', 'writing', 'voice', 'recovery', 'resume']) {
    assert.equal(result[key], 'UNVERIFIED');
  }
});
test('connected, malformed, unstamped, or unhealthy responses cannot open Cabin', async () => {
  for (const health of [null, {}, { ...healthy, mode: 'connected' },
    { ...healthy, status: 'failed' }, { ...healthy, build: 'UNSTAMPED' }]) {
    let calls = 0;
    const result = await openCabin({ fetchImpl: fake(health), openView: () => calls++ });
    assert.equal(result.opened, false);
    assert.equal(calls, 0);
  }
});
test('open checks fresh readiness and selects exactly one fixed destination', async () => {
  const destinations = [];
  const result = await openCabin({ fetchImpl: fake(), openView: async url => destinations.push(url) });
  assert.equal(result.opened, true);
  assert.deepEqual(destinations, [CABIN_URL]);
  assert.equal(CABIN_URL, 'http://127.0.0.1:43121/cabin');
});
test('network failure becomes setup state without a fallback destination', async () => {
  const result = await inspectCabin({ fetchImpl: async () => { throw new Error('unavailable'); } });
  assert.equal(result.canOpen, false);
  assert.equal(result.models, 'UNVERIFIED');
});
test('failed browser opening is not reported as success', async () => {
  await assert.rejects(openCabin({ fetchImpl: fake(), openView: async () => { throw new Error('failed'); } }), /failed/);
});

test('only the exact Cabin model with completion capability is available', async () => {
 for(const models of [[],[{name:'other:7b',capabilities:['completion']}],[{name:'qwen2.5:7b',capabilities:['embedding']}],[{name:'qwen2.5:7b'}],[null]]){
  const result=await inspectCabin({fetchImpl:async url=>({ok:true,json:async()=>url.endsWith('/api/tags')?{models}:healthy})});
  assert.equal(result.models,'UNVERIFIED');
  assert.equal(result.canOpen,true);
  assert.equal(result.requiredModel,'qwen2.5:7b');
 }
 const valid=await inspectCabin({fetchImpl:fake()});
 assert.equal(valid.models,'AVAILABLE');
});
test('unavailable model service leaves the local writing doorway open',async()=>{
 const result=await inspectCabin({fetchImpl:async url=>{
  if(url.endsWith('/api/tags'))throw Error('offline');
  return {ok:true,json:async()=>healthy};
 }});
 assert.equal(result.canOpen,true);assert.equal(result.models,'UNVERIFIED');
});
