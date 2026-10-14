// Register bounded repository-read work; no provider execution or background worker.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve('.');
const receipt=resolve('docs/testing/cabin-jarvis-flow-registration-20261014.json');
if(existsSync(receipt)) throw Error('Registration receipt already exists; inspect it instead of duplicating the work unit.');
const require=createRequire(import.meta.url);
const api=require('../jarvis-desktop/src/canonical-work-unit-v2.js');
const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const created=process.argv[2] ? await api.statusCanonicalV2(root,process.argv[2]) : await api.createCanonicalV2(root,{
 objective:'Cabin — Sovereign Soullab Home: C1 House and local identity inventory',
 workClass:'ARCHITECTURE',taskShape:'LONG_HORIZON_DECOMPOSITION',evidenceClass:'E1_REPOSITORY_LOCAL',
 requestedPosture:'local_only',reviewPressure:'ordinary',
 evidenceFocus:['apps/cabin-desktop','lib/cabin','app/cabin','app/house','lib/house',
 'docs/design/contracts','docs/testing/cabin-local-functional-20261014.md','docs/testing/cabin-jarvis-flow-20261014.md'],
 acceptanceCriteria:[
 'Preserve the verified local writing/conversation baseline and forest-green Cabin direction.',
 'Identify existing House, identity, session, room-crossing and persistence contracts.',
 'Return actual code dependencies and the next smallest House integration candidate.',
 'Carry the full roadmap: MAIA, House, Writing, Journal, Dream, Astrology and optional consent-based member exchange.',
 'Classify installed, designed and unfinished behavior accurately.'],
 falsificationConditions:['A room or background worker is described as operational without execution evidence.',
 'A cloud dependency is silently treated as offline-ready.','Private chart, dream or conversation content is recalled without the required permission.'],
 stopConditions:['Stop before production/member data access, cloud spend, external disclosure, merge, public deployment or invitations.',
 'This initial work unit grants repository-read architecture work only; it does not grant shell/provider execution.'],
 authorityRequest:{networkExternal:false,providerSpend:false,externalDisclosure:'none'}
},{canonicalSha:sha});
if(!created.ok) throw Error(JSON.stringify(created));
const bounded=await api.transitionCanonicalV2(root,created.work_unit_id,'BOUNDED');
if(!bounded.ok) throw Error(JSON.stringify(bounded));
const authorized=await api.transitionCanonicalV2(root,created.work_unit_id,'AUTHORIZED',
 {actorId:'human:kelly:chat-20261014-142524'});
if(!authorized.ok) throw Error(JSON.stringify(authorized));
const record={workUnitId:created.work_unit_id,state:'AUTHORIZED',executionConnected:false,
 baseSha:sha,founderDirection:'2026-10-14: continue the full offline Soullab Cabin in a JARVIS flow.',
 scope:'Repository-read C1 architecture inventory; no background execution, spending or production changes.'};
writeFileSync(receipt,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(record));
