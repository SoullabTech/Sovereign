import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createReadOnlyAetherRuntimeAdapter } from '../../lib/ain/aether/runtime/constitutionalAdapter';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r1');
mkdirSync(OUT,{recursive:true});

const adapter=createReadOnlyAetherRuntimeAdapter();

const readOnly=adapter.adjudicate({
  intentRef:'runtime-r1:read-only',
  requestedCapabilities:[
    'read_constitution',
    'read_benchmark_contracts',
    'evaluate_candidate_against_constitution',
  ],
});

const forbidden=adapter.adjudicate({
  intentRef:'runtime-r1:forbidden',
  requestedCapabilities:[
    'bind_live_member_data',
    'persist_member_field',
    'mutate_maia_prompt',
    'activate_production_route',
    'write_back_to_benchmark_corpus',
  ],
});

const evidence={
  generatedAt:new Date().toISOString(),
  parentAetherClosure:'297edbade3d1deab9311b93023852961797e23b2',
  constitution:adapter.constitution,
  readOnly,
  forbidden,
};

writeFileSync(OUT+'/r1-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r1-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentAetherClosure:evidence.parentAetherClosure,
  constitutionSourceCommit:evidence.constitution.sourceCommit,
  readOnlyAllowed:evidence.readOnly.allowed,
  forbiddenRefused:evidence.forbidden.allowed===false,
  liveBindingAuthorized:evidence.forbidden.liveBindingAuthorized,
  benchmarkMutationAuthorized:evidence.forbidden.benchmarkMutationAuthorized,
  productionAuthority:evidence.forbidden.productionAuthority,
  finalMeaningAuthority:evidence.constitution.finalMeaningAuthority,
  runtimeAuthority:evidence.constitution.runtimeAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r1-summary.json','utf8')),null,2));