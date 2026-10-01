#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import { createLifecycleEnvelopeV2,transitionLifecycleV2 } from '../work-unit-lifecycle-v2.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url));const REPO=path.resolve(HERE,'..','..','..');
const main=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/main.js'),'utf8');const renderer=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/renderer.js'),'utf8');const canonical=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/canonical-work-unit-v2.js'),'utf8');
let passed=0,failed=0;function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
function handler(){const a=main.indexOf("ipcMain.handle('jarvis:work-unit-action'");const b=main.indexOf("ipcMain.handle('jarvis:run-external-reasoning'",a);assert.ok(a>=0&&b>a);return main.slice(a,b)}

check('R19-H1 local-candidate-v2 create is distinct and selects host-only authority profile',()=>{const s=handler();assert.match(s,/req\?\.mode === 'local-candidate-v2'/);assert.match(s,/authorityProfile: 'LOCAL_CANDIDATE'/);const block=s.slice(s.indexOf("mode === 'local-candidate-v2'"),s.indexOf("mode === 'dual-shadow'"));assert.doesNotMatch(block,/transitionCanonicalV2|runWorkUnit|executePreparedLocalCandidate/)});
check('R19-H2 local-candidate execution accepts Work id + structured plan, never caller packet/decision',()=>{const s=handler();const a=s.indexOf("action === 'local-candidate-execute'");const b=s.indexOf("action === 'canonical-bound'",a);const block=s.slice(a,b);assert.match(block,/req\?\.work_unit_id/);assert.match(block,/req\?\.verification_plan/);assert.doesNotMatch(block,/req\?\.packet|req\?\.execution_decision|req\?\.run_id/);assert.match(block,/LOCAL_CANDIDATE_EXECUTION\.executePreparedLocalCandidate/)});
check('R19-H3 native confirmation defaults to Cancel and displays exact run/Work/operations',()=>{const s=handler();const a=s.indexOf("action === 'local-candidate-execute'");const b=s.indexOf("action === 'canonical-bound'",a);const block=s.slice(a,b);assert.match(block,/dialog\.showMessageBox/);assert.match(block,/buttons: \['Cancel', 'Execute'\]/);assert.match(block,/defaultId: 0/);assert.match(block,/cancelId: 0/);assert.match(block,/occurrence\.run_id/);assert.match(block,/summary\.work_unit_id/);assert.match(block,/verification_operations/);assert.match(block,/return answer\.response === 1/)});
check('R19-H4 renderer exposes neither local-candidate creation nor execution yet',()=>{assert.equal(renderer.includes('local-candidate-v2'),false);assert.equal(renderer.includes('local-candidate-execute'),false)});
check('R19-H5 host-only profile fixes canonical capability to local-native-candidate',()=>{assert.match(canonical,/localCandidateAuthority \? 'local-native-candidate'/)});
check('R19-H6 AUTHORIZED local candidate suppresses canonical provider route action',()=>{assert.match(canonical,/state === 'AUTHORIZED' && workUnit\?\.identity\?\.capability !== 'local-native-candidate'/)});
check('R19-H7 generic structured run is guarded below MAIN by builder decision verification',()=>{const mech=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/builder-mechanism.js'),'utf8');assert.match(mech,/packet\?\.verification_mode === 'structured-v1'/);assert.match(mech,/LOCAL_CANDIDATE_DECISION\.verifyConstituted/);assert.match(mech,/EXECUTION_DECISION_REQUIRED/)});
check('R19-H8 ordinary canonical-v2 creation remains without LOCAL_CANDIDATE profile',()=>{const s=handler();const a=s.indexOf("mode === 'canonical-v2'");const b=s.indexOf("mode === 'local-candidate-v2'",a);const block=s.slice(a,b);assert.match(block,/CWUV2\.createCanonicalV2/);assert.equal(block.includes('LOCAL_CANDIDATE'),false)});
console.log('\n'+passed+' passed · '+failed+' failed');process.exit(failed?1:0);
