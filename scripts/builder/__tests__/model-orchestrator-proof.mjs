#!/usr/bin/env node
import {
  mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, chmodSync,
} from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { compileModelOrchestration, executeModelOrchestration } from '../model-orchestrator.mjs';
import { loadAttempts, loadWorkUnit } from '../work-unit.mjs';

let passed=0, failed=0;
const assert=(name, condition, detail='')=>{
  if(condition){passed++;console.log(`  PASS  ${name}`);}else{failed++;console.log(`  FAIL  ${name}`);}
  if(detail)console.log(`          ${detail}`);
};

const REPO=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..','..');
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:REPO,encoding:'utf8'}).trim();
const home=mkdtempSync(path.join(os.tmpdir(),'jarvis-model-orch-proof-'));
const packets=path.join(home,'packets');
const wtRoot=path.join(home,'worktrees');
const fakeBin=path.join(home,'bin');
mkdirSync(packets,{recursive:true});
mkdirSync(wtRoot,{recursive:true});
mkdirSync(fakeBin,{recursive:true});
process.env.AIN_DELEGATION_HOME=home;
process.env.AIN_WORKTREES_ROOT=wtRoot;

const base={
  title:'Orchestrator proof', objective:'Review this synthetic architecture fixture.',
  execution_lane:'provider-evaluation', canonical_sha:head, worktree:null,
  governing_authority:'proof', established_facts:['synthetic fixture'],
  allowed_files:['scripts/builder/router.mjs'],
  prohibited_files_actions:['Do not modify files.'],
  acceptance_criteria:['Return bounded analysis.'],
  verification_commands:['test -z "$(git status --porcelain)"'],
  escalation_conditions:[], max_attempts:1, expected_output:'bounded analysis',
  task_class:'architecture', risk_class:'high', routing_profile:'local-first', review_policy:'auto',
  data_class:'repo_nonconfidential', external_review:false, external_tiebreaker:false,
  authorized_acts:['repo.read'],
  not_authorized_acts:['repo.write:worktree','network.external','provider.spend','production.read','production.write','deploy','authority.change'],
};
function packet(id,extra={}){
  writeFileSync(path.join(packets,`${id}.json`),JSON.stringify({...base,work_unit_id:id,branch:`chore/${id}`,...extra},null,2));
}

console.log('\n=== O-1: routing capability never manufactures write authority ===');
packet('orch-write-capable',{
  task_class:'implementation',risk_class:'mechanical',model_stage_budget:1,external_call_budget:0,
  authorized_acts:['repo.read','repo.write:worktree','tests.run'],
  not_authorized_acts:['network.external','provider.spend','production.read','production.write','deploy','authority.change'],
});
{
  const c=compileModelOrchestration('orch-write-capable');
  assert('write-capable Work Unit is blocked before model execution',
    c.status==='WRITE_CAPABLE_MODEL_ADAPTER_REQUIRED'&&c.executable===false&&c.repo_write_scope==='worktree');
}

console.log('\n=== O0: malformed budgets fail closed ===');
packet('orch-invalid-budget',{model_stage_budget:'2',external_call_budget:0});
{
  const c=compileModelOrchestration('orch-invalid-budget');
  assert('string budget is refused rather than coerced',c.status==='BUDGET_INVALID'&&c.executable===false);
}

console.log('\n=== O1: model-stage budget is explicit ===');
packet('orch-budget',{model_stage_budget:1,external_call_budget:0});
{
  const c=compileModelOrchestration('orch-budget');
  assert('high-risk architecture requires two local stages',c.stages?.length===2,`stages=${c.stages?.length}`);
  assert('default-sized stage budget blocks execution',c.status==='STAGE_BUDGET_EXCEEDED'&&c.executable===false);
}

console.log('\n=== O2: external-call budget is independent from authority ===');
packet('orch-external-budget',{
  model_stage_budget:3,external_call_budget:0,external_review:true,
  authorized_acts:['repo.read','network.external','provider.spend'],
  not_authorized_acts:['repo.write:worktree','production.read','production.write','deploy','authority.change'],
});
{
  const c=compileModelOrchestration('orch-external-budget');
  assert('external Inkling stage is planned',c.stages?.some(s=>s.provider_id==='inkling-tinker'));
  assert('zero external-call budget blocks before execution',c.status==='EXTERNAL_CALL_BUDGET_EXCEEDED'&&c.required_external_calls===1);
}

console.log('\n=== O3: explicit budgets admit the intended local chain ===');
const ID='orch-two-stage';
packet(ID,{model_stage_budget:2,external_call_budget:0});
{
  const c=compileModelOrchestration(ID);
  assert('orchestration is executable',c.status==='READY'&&c.executable===true);
  assert('primary is GPT-OSS',c.stages[0].role==='primary'&&c.stages[0].provider_id==='gpt-oss-local');
  assert('challenger is Qwen',c.stages[1].role==='challenger'&&c.stages[1].provider_id==='qwen-local');
  assert('no external calls are planned',c.budgets.external_calls_planned===0);
}

const promptFile=path.join(home,'challenger-prompt.txt');
writeFileSync(path.join(fakeBin,'opencode'),`#!/bin/sh
role="\${JARVIS_ATTEMPT_ROLE:-primary}"
last=""
for arg in "$@"; do last="$arg"; done
if [ "$role" = "primary" ]; then
  printf 'PRIMARY_SYNTHETIC_ANALYSIS\\n'
  exit 0
fi
printf '%s' "$last" > "$ORCH_PROMPT_FILE"
case "$last" in
  *'PRIMARY MODEL OUTPUT (UNTRUSTED):'*'PRIMARY_SYNTHETIC_ANALYSIS'*) ;;
  *) echo 'challenger did not receive bounded primary peer context' >&2; exit 7 ;;
esac
printf 'Independent review complete.\\nJARVIS_CHALLENGE_RESULT_JSON: {"status":"NO_MATERIAL_CHALLENGE","summary":"no material issue","findings":[]}\\n'
exit 0
`);
chmodSync(path.join(fakeBin,'opencode'),0o755);
process.env.PATH=`${fakeBin}:${process.env.PATH}`;
process.env.ORCH_PROMPT_FILE=promptFile;

console.log('\n=== O4: same Work Unit executes primary + challenger without model voting ===');
const out=executeModelOrchestration(ID,{runId:'proof-run-01'});
assert('orchestration completes',out.status==='COMPLETE'&&out.disposition==='READY_FOR_EXISTING_GATE',JSON.stringify({status:out.status,disposition:out.disposition}));
assert('two attributable stages are preserved',out.stages.length===2&&out.stages[0].role==='primary'&&out.stages[1].role==='challenger');
assert('challenger reports no material challenge',out.stages[1].challenge?.status==='NO_MATERIAL_CHALLENGE');
assert('agreement still does not verify the Work Unit',out.advancement.model_output_sufficient===false&&out.disposition!=='VERIFIED');
assert('no tie-breaker is automatically invoked',out.tie_breaker_nominated===null);

const attempts=loadAttempts(ID);
assert('both role attempts are in one Work Unit history',attempts.length===2&&attempts.every(a=>a.work_unit_id===ID),`attempts=${attempts.length}`);
assert('attempt roles are separately attributable',attempts[0].attempt_role==='primary'&&attempts[1].attempt_role==='challenger');
assert('route plan id is stable across attempts',attempts[0].route_plan_id&&attempts[0].route_plan_id===attempts[1].route_plan_id);
assert('challenger points to primary attempt snapshot',typeof attempts[1].peer_attempt_ref==='string'&&attempts[1].peer_attempt_ref.includes('01-primary-gpt-oss-local.result.json'));
assert('challenger prompt labels primary output untrusted',readFileSync(promptFile,'utf8').includes('PRIMARY MODEL OUTPUT (UNTRUSTED):'));

const orchDir=path.join(home,'orchestrations',ID,'proof-run-01');
assert('primary result snapshot preserved',existsSync(path.join(orchDir,'01-primary-gpt-oss-local.result.json')));
assert('challenger result snapshot preserved',existsSync(path.join(orchDir,'02-challenger-qwen-local.result.json')));
assert('canonical Work Unit routing intent survives attempts',loadWorkUnit(ID).model_stage_budget===2&&loadWorkUnit(ID).review_policy==='auto');

console.log('\n=== O5: disagreement stops; it never votes or auto-runs a tiebreaker ===');
const ID2='orch-challenge';
packet(ID2,{model_stage_budget:2,external_call_budget:0,external_tiebreaker:true});
writeFileSync(path.join(fakeBin,'opencode'),`#!/bin/sh
role="\${JARVIS_ATTEMPT_ROLE:-primary}"
if [ "$role" = "primary" ]; then printf 'PRIMARY_SYNTHETIC_ANALYSIS\\n'; exit 0; fi
printf 'JARVIS_CHALLENGE_RESULT_JSON: {"status":"MATERIAL_CHALLENGE","summary":"material conflict","findings":["missing evidence"]}\\n'
exit 0
`);
chmodSync(path.join(fakeBin,'opencode'),0o755);
const out2=executeModelOrchestration(ID2,{runId:'proof-run-02'});
assert('material challenge stops orchestration',out2.status==='STOPPED'&&out2.disposition==='REVIEW_REQUIRED');
assert('no automatic tiebreaker is run',out2.stages.length===2&&out2.tie_breaker_nominated===null);

console.log('\n=== O6: external-deep chain obeys external-call budget and existing Tinker membrane ===');
const ID3='orch-external-deep';
packet(ID3,{
  task_class:'architecture',risk_class:'high',routing_profile:'external-deep',data_class:'synthetic',
  review_policy:'auto',external_review:false,model_stage_budget:2,external_call_budget:2,
  allowed_files:['NO FILES — orchestration synthetic external proof only'],
  authorized_acts:['repo.read','network.external','provider.spend'],
  not_authorized_acts:['repo.write:worktree','production.read','production.write','deploy','authority.change'],
});

const externalPromptFile=path.join(home,'external-challenger-prompt.txt');
process.env.STUB_TINKER_DIRECT_SCRIPT=path.join(REPO,'scripts','builder','tinker-direct.mjs');
process.env.REAL_NODE=process.execPath;
process.env.STUB_EXTERNAL_PROMPT=externalPromptFile;
writeFileSync(path.join(fakeBin,'security'),`#!/bin/sh
case "$1" in
  find-generic-password) printf 'proof-tinker-secret'; exit 0 ;;
esac
exit 44
`);
chmodSync(path.join(fakeBin,'security'),0o755);
writeFileSync(path.join(fakeBin,'node'),`#!/bin/sh
if [ "$1" = "$STUB_TINKER_DIRECT_SCRIPT" ]; then
  shift
  model="$1"
  prompt="$(cat)"
  role="\${JARVIS_ATTEMPT_ROLE:-primary}"
  if [ "$role" = "primary" ]; then
    text="EXTERNAL_PRIMARY_SYNTHETIC"
  else
    printf '%s' "$prompt" > "$STUB_EXTERNAL_PROMPT"
    case "$prompt" in
      *'PRIMARY MODEL OUTPUT (UNTRUSTED):'*'EXTERNAL_PRIMARY_SYNTHETIC'*) ;;
      *) echo 'external challenger missing untrusted primary context' >&2; exit 8 ;;
    esac
    text='JARVIS_CHALLENGE_RESULT_JSON: {"status":"NO_MATERIAL_CHALLENGE","summary":"external independent review clear","findings":[]}'
  fi
  escaped_text="$(printf '%s' "$text" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read())[1:-1], end="")')"
  printf '{"provider":"tinker","transport":"anthropic-compatible","model":"%s","text":"%s","usage":null,"stop_reason":"end_turn"}\\n' "$model" "$escaped_text"
  exit 0
fi
exec "$REAL_NODE" "$@"
`);
chmodSync(path.join(fakeBin,'node'),0o755);

const c3=compileModelOrchestration(ID3);
assert('external-deep requires exactly two external calls',c3.status==='READY'&&c3.budgets.external_calls_planned===2);
const out3=executeModelOrchestration(ID3,{runId:'proof-run-03'});
assert('external orchestration completes without network',out3.status==='COMPLETE'&&out3.disposition==='READY_FOR_EXISTING_GATE');
assert('Nemotron is external primary',out3.stages[0].provider_id==='nemotron-tinker'&&out3.stages[0].role==='primary');
assert('Inkling is external challenger',out3.stages[1].provider_id==='inkling-tinker'&&out3.stages[1].challenge?.status==='NO_MATERIAL_CHALLENGE');
const attempts3=loadAttempts(ID3);
assert('both external attempts remain one Work Unit history',attempts3.length===2&&attempts3.every(a=>a.work_unit_id===ID3&&a.lane==='tinker'));
assert('external challenger receives primary as untrusted peer context',
  readFileSync(externalPromptFile,'utf8').includes('PRIMARY MODEL OUTPUT (UNTRUSTED):')
    && readFileSync(externalPromptFile,'utf8').includes('EXTERNAL_PRIMARY_SYNTHETIC'));
assert('NO FILES sentinel prevents repository file content from crossing',
  !readFileSync(externalPromptFile,'utf8').includes('=== BEGIN AUTHORIZED FILE:'));
const orchDir3=path.join(home,'orchestrations',ID3,'proof-run-03');
const snapshots3=readFileSync(path.join(orchDir3,'01-primary-nemotron-tinker.result.json'),'utf8')
  + readFileSync(path.join(orchDir3,'02-challenger-inkling-tinker.result.json'),'utf8')
  + readFileSync(path.join(orchDir3,'01-primary-nemotron-tinker.log'),'utf8')
  + readFileSync(path.join(orchDir3,'02-challenger-inkling-tinker.log'),'utf8');
assert('stub credential never enters snapshots or logs',!snapshots3.includes('proof-tinker-secret'));

// Remove temporary worktrees from git metadata before deleting the temp directory.
for (const id of [ID,ID2,ID3]) {
  const wu=loadWorkUnit(id);
  if (wu?.worktree && existsSync(wu.worktree)) {
    spawnSync('git',['worktree','remove','--force',wu.worktree],{cwd:REPO,encoding:'utf8'});
  }
  spawnSync('git',['branch','-D',`chore/${id}`],{cwd:REPO,encoding:'utf8'});
}
spawnSync('git',['worktree','prune'],{cwd:REPO,encoding:'utf8'});
rmSync(home,{recursive:true,force:true});

console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed===0?0:1);
