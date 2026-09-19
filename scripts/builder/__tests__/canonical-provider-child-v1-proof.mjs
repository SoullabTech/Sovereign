#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  readTinkerCredentialV1,
  runCanonicalProviderChildV1,
} from '../canonical-provider-child-v1.mjs';

let pass=0, fail=0;
function check(name,fn){try{fn();pass++;console.log('PASS  '+name);}catch(e){fail++;console.log('FAIL  '+name);console.log('      '+e.message);}}
async function checkAsync(name,fn){try{await fn();pass++;console.log('PASS  '+name);}catch(e){fail++;console.log('FAIL  '+name);console.log('      '+e.message);}}

check('E1C-1 — environment credential wins without Keychain read',()=>{
  let probes=0;
  const out=readTinkerCredentialV1({
    env:{TINKER_API_KEY:'env-secret',USER:'proof'},
    platform:'darwin',
    execFileSyncImpl:()=>{probes++;throw new Error('must not probe');},
  });
  assert.equal(out.source,'environment');
  assert.equal(out.value,'env-secret');
  assert.equal(probes,0);
});

check('E1C-2 — child may hydrate Keychain only inside child custody',()=>{
  const out=readTinkerCredentialV1({
    env:{USER:'proof'},
    platform:'darwin',
    execFileSyncImpl:(bin,args)=>{
      assert.equal(bin,'/usr/bin/security');
      assert.deepEqual(args,[
        'find-generic-password','-a','proof','-s','soullab.tinker.api','-w',
      ]);
      return 'child-secret\n';
    },
  });
  assert.equal(out.source,'keychain');
  assert.equal(out.value,'child-secret');
});

await checkAsync('E1C-3 — child passes credential only to existing Tinker adapter invocation',async()=>{
  let seen=null;
  const out=await runCanonicalProviderChildV1({
    adapter_id:'tinker-direct',
    model_id:'thinkingmachines/Inkling-Small',
    prompt:'bounded evidence',
    env:{USER:'proof'},
    platform:'darwin',
    execFileSyncImpl:()=> 'child-secret\n',
    invokeTinker:async(input)=>{
      seen=input;
      return {provider:'tinker',model:input.model,text:'synthetic'};
    },
  });
  assert.equal(seen.apiKey,'child-secret');
  assert.equal(seen.prompt,'bounded evidence');
  assert.equal(out.credential_source,'keychain');
  assert.equal(out.result.text,'synthetic');
});

await checkAsync('E1C-4 — unregistered child adapter fails closed',async()=>{
  await assert.rejects(
    ()=>runCanonicalProviderChildV1({
      adapter_id:'opencode',
      model_id:'x',
      prompt:'x',
      env:{TINKER_API_KEY:'x'},
      invokeTinker:async()=>({}),
    }),
    /CANONICAL_PROVIDER_CHILD_ADAPTER_UNSUPPORTED/,
  );
});

console.log();
console.log(pass+' passed · '+fail+' failed');
process.exit(fail===0?0:1);
