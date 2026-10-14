// Record a bounded founder-authorized work unit. This does not start a worker.
import {execFileSync} from 'node:child_process';
import {existsSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {createWorkUnitDraftV2} from './builder/work-unit-v2.mjs';
import {createLifecycleEnvelopeV2,transitionLifecycleV2} from './builder/work-unit-lifecycle-v2.mjs';
const root=resolve('.');
const api=createRequire(import.meta.url)('../jarvis-desktop/src/canonical-work-unit-v2.js');
const id='v2-cabin-c1-house-local-20261014';
const file=api.workUnitPath(id);
if(existsSync(file))throw Error('House work unit already exists; inspect the canonical record.');
const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const authority='Founder direction in this conversation, 2026-10-14 15:58:45 America/New_York: continue with a full Jarvis flow. Local Cabin implementation and fictional-data qualification; no production changes or public release.';
const result=createWorkUnitDraftV2({
 identity:{id,programme:'AIN-CABIN-C1',parent_work_unit:null,objective:'Cabin C1 House home, local identity and room navigation',work_class:'PATCH',task_shape:'CODE_GROUNDED',capability:null},
 custody:{evidence_class:'E1_REPOSITORY_LOCAL'},routing_request:{requested_posture:'local_only',review_pressure:'ordinary'},
 context:{context_refs:['related-inventory:v2-cabin-sovereign-soullab-home-c1-ho-mv8g0yml','docs/testing/cabin-c1-house-delivery-20261014.md'],
 evidence_refs:['source:'+sha,'foreground-qualification:docs/testing/cabin-c1-house-delivery-20261014.md'],
 assumptions:['Local foreground implementation is authorized; worker execution is not connected.'],
 unknowns:['Founder visual acceptance of the installed House remains separate.','Full local MAIA and voice remain unfinished.']},
 scope:{repository:'bound-desktop-repository',base_ref:sha,allowed_paths:['apps/cabin-desktop','lib/house/catalog.ts','lib/house/preferences.ts','lib/cabin/localStore.ts','scripts/cabin-house-window-test.mjs','scripts/cabin-functional-window-test.mjs','scripts/cabin-large-import-test.mjs','docs/testing/cabin-c1-house-delivery-20261014.md'],forbidden_paths:['.env','database/migrations']},
 authority:{repository_read:true,repository_write:'worktree',shell:'bounded_write',network_external:false,provider_spend:false,external_disclosure:'none',merge:false,deploy:false,production_read:false,production_write:false},
 evaluation:{acceptance_conditions:['Real local House and working room/return navigation.','Preserve identity, preferences, saved writing/conversations and 20MiB import.','Refuse stale preferences and protect unsaved writing.','Show unfinished rooms honestly.'],
 falsification_conditions:['A dummy link or architecture record is described as an implemented room.','An autonomous worker or independent reviewer is claimed without evidence.'],
 stop_conditions:['No production/member data, paid provider execution, public/cloud deployment, merge or invitation.','Do not widen the model or memory context through navigation.']},
 provenance:{creator:'ChatGPT foreground — founder-directed JARVIS flow',authorizing_act:authority,source_commits:[sha]}
});
if(!result.ok)throw Error(JSON.stringify(result.blockers));
let envelope=createLifecycleEnvelopeV2(result.work_unit);
if(!envelope.ok)throw Error(JSON.stringify(envelope.blockers));
for(const to of ['BOUNDED','AUTHORIZED']){
 const next=transitionLifecycleV2(envelope.envelope,{to,evidence_ref:'founder-chat:20261014-155845',reason_code:'FOUNDER_LOCAL_CABIN_C1_SCOPE',...(to==='AUTHORIZED'?{authorization_ref:authority}:{})});
 if(!next.ok)throw Error(JSON.stringify(next.blockers));envelope=next;
}
writeFileSync(file,JSON.stringify(envelope.envelope,null,2)+'\n',{flag:'wx',mode:0o600});
const verified=api.readCanonicalExecutionEnvelopeV2(id);
if(verified?.work_unit.state.lifecycle_state!=='AUTHORIZED'||verified.work_unit.routing.execution_connected)throw Error('Canonical registration verification failed');
const receipt={workUnitId:id,state:'AUTHORIZED',executionConnected:false,sourceSha:sha,
 foregroundDeliveryEvidence:'docs/testing/cabin-c1-house-delivery-20261014.md',installedVersion:'0.3.0',next:'C2 local MAIA and voice qualification'};
writeFileSync(resolve('docs/testing/cabin-c1-house-jarvis-record-20261014.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(receipt));
