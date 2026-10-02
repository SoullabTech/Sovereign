#!/usr/bin/env node
import assert from 'node:assert/strict';
import { deriveJevPacketProjection, JEV_DERIVATION } from '../jev-packet-projection-v1.mjs';

export const PILOT_PROJECTION_BLOB='d3d5a533703903f6cd25e34a1cb9f7510fec5c6d';
const FILE_COUNT_MAX=10_000;
const SHAPES=['CODE_GROUNDED','ARCHITECTURE_REASONING','ADVERSARIAL_FALSIFICATION','LONG_HORIZON_DECOMPOSITION','EVIDENCE_SYNTHESIS','FRONTIER_UNKNOWN'];

function pilotReference(unit){
  if(!unit||typeof unit!=='object'||!unit.identity||!unit.scope||!unit.authority||!unit.custody)return null;
  const shape=unit.identity.task_shape;
  const allowed=unit.scope.allowed_paths;
  if(typeof shape!=='string'||!SHAPES.includes(shape)||!Array.isArray(allowed)||allowed.some(p=>typeof p!=='string'))return null;
  const a=unit.authority; const paths=allowed;
  return {
    task_shape:shape,
    contains_sensitive:unit.custody.evidence_class==='E4_SENSITIVE_OR_PRODUCTION',
    requires_external_info:a.network_external===true||(typeof a.external_disclosure==='string'&&a.external_disclosure!=='none'),
    change_scope:{
      file_count:Math.min(paths.length,FILE_COUNT_MAX),
      migration:paths.some(p=>/(^|\/)migrations?(\/|$)/i.test(p)),
      auth:paths.some(p=>/(^|\/)auth(\/|$|[._-])/i.test(p)),
      production:a.production_read===true||a.production_write===true||a.deploy===true,
    },
    derivation:{...JEV_DERIVATION},
  };
}

const fixtures=[
  {
    identity:{task_shape:'CODE_GROUNDED'},
    custody:{evidence_class:'E1_REPOSITORY_LOCAL'},
    scope:{allowed_paths:['lib/x.ts']},
    authority:{network_external:false,external_disclosure:'none',production_read:false,production_write:false,deploy:false},
  },
  {
    identity:{task_shape:'ARCHITECTURE_REASONING'},
    custody:{evidence_class:'E4_SENSITIVE_OR_PRODUCTION'},
    scope:{allowed_paths:['database/migrations/x.sql','lib/auth/session.ts']},
    authority:{network_external:true,external_disclosure:'task_text_only',production_read:false,production_write:false,deploy:true},
  },
  {
    identity:{task_shape:'EVIDENCE_SYNTHESIS'},
    custody:{evidence_class:'E0_TASK_TEXT'},
    scope:{allowed_paths:['src/authentication.ts','foo/migration/bar.sql','foo/AUTH_test.ts']},
    authority:{network_external:false,external_disclosure:'exact_bundle',production_read:true,production_write:false,deploy:false},
  },
  {
    identity:{task_shape:'FRONTIER_UNKNOWN'},
    custody:{evidence_class:'E2_CONTINUITY_LOCAL'},
    scope:{allowed_paths:Array.from({length:10005},(_,i)=>'x/'+i+'.ts')},
    authority:{network_external:false,external_disclosure:'none',production_read:false,production_write:true,deploy:false},
  },
];

for(const [i,fixture] of fixtures.entries()){
  assert.deepEqual(deriveJevPacketProjection(fixture),pilotReference(fixture),'fixture '+i+' drifted from pilot blob '+PILOT_PROJECTION_BLOB);
}
assert.equal(deriveJevPacketProjection(null),pilotReference(null));
assert.equal(deriveJevPacketProjection({identity:{task_shape:'NOPE'}}),pilotReference({identity:{task_shape:'NOPE'}}));
console.log('PASS  JEV projection equivalence pinned to LABEL-01 pilot blob '+PILOT_PROJECTION_BLOB+' · '+fixtures.length+' fixtures');
